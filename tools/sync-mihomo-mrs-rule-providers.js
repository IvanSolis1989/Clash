#!/usr/bin/env node
'use strict';

const childProcess = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const zlib = require('node:zlib');

const REPO_ROOT = path.resolve(__dirname, '..');
const CMFA_FILE = path.join(REPO_ROOT, 'Clash Meta For Android/CMFA(mihomo).yaml');
const OUTPUT_DIR = path.join(REPO_ROOT, 'rulesets/generated/mihomo-mrs');
const CACHE_DIR = path.join(REPO_ROOT, '.cache/mihomo-mrs');
const MIHOMO_REPO_API = 'https://api.github.com/repos/MetaCubeX/mihomo/releases/latest';
const SCKI_SUPPLEMENTAL_MARKER = '/rulesets/supplemental/';
const CONCURRENCY = 8;

const DOMAIN_RULE_TYPES = new Set([
  'DOMAIN',
  'DOMAIN-SUFFIX',
  'DOMAIN-KEYWORD',
  'DOMAIN-REGEX',
  'DOMAIN-WILDCARD',
]);
const IPCIDR_RULE_TYPES = new Set(['IP-CIDR', 'IP-CIDR6']);

function usage() {
  return [
    'Usage: node tools/sync-mihomo-mrs-rule-providers.js [--mihomo-bin <path>] [--keep-cache]',
    '',
    'Downloads upstream Mihomo rule-providers, converts every safely convertible',
    'domain/ipcidr provider to .mrs, and writes rulesets/generated/mihomo-mrs/.',
  ].join('\n');
}

function parseArgs(argv) {
  const options = { mihomoBin: process.env.MIHOMO_BIN || null, keepCache: false };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--help' || arg === '-h') {
      console.log(usage());
      process.exit(0);
    }
    if (arg === '--mihomo-bin') {
      options.mihomoBin = argv[i + 1];
      if (!options.mihomoBin) throw new Error('--mihomo-bin requires a path');
      i += 1;
      continue;
    }
    if (arg === '--keep-cache') {
      options.keepCache = true;
      continue;
    }
    throw new Error(`Unknown argument: ${arg}`);
  }
  return options;
}

function readText(file) {
  return fs.readFileSync(file, 'utf8');
}

function unquote(value) {
  return String(value || '').trim().replace(/^['"]|['"]$/g, '');
}

function yamlQuote(value) {
  return JSON.stringify(String(value));
}

function parseProviders(source) {
  const match = /\r?\nrule-providers:\r?\n([\s\S]*?)\r?\nrules:\r?\n/.exec(source);
  if (!match) throw new Error('Cannot locate CMFA rule-providers section');
  const providers = [];
  let current = null;
  for (const rawLine of match[1].split(/\r?\n/)) {
    const providerMatch = rawLine.match(/^  ([^:\s][^:]*):\s*$/);
    if (providerMatch) {
      current = { name: unquote(providerMatch[1]) };
      providers.push(current);
      continue;
    }
    const fieldMatch = rawLine.match(/^    ([A-Za-z0-9_-]+):\s*(.+?)\s*$/);
    if (fieldMatch && current) current[fieldMatch[1]] = unquote(fieldMatch[2]);
  }
  return providers;
}

function splitTopLevel(rule) {
  const parts = [];
  let depth = 0;
  let current = '';
  for (const char of rule) {
    if (char === ',' && depth === 0) {
      parts.push(current);
      current = '';
      continue;
    }
    if (char === '(') depth += 1;
    else if (char === ')') depth -= 1;
    current += char;
  }
  parts.push(current);
  return parts.map((part) => part.trim());
}

function stripInlineComment(line) {
  let quote = null;
  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    if ((char === '"' || char === "'") && line[i - 1] !== '\\') {
      quote = quote === char ? null : quote || char;
    }
    if (char === '#' && !quote) return line.slice(0, i);
  }
  return line;
}

function parsePayloadEntries(text) {
  const normalized = text.replace(/\r\n/g, '\n');
  const hasPayload = /^payload:\s*$/m.test(normalized);
  const entries = [];
  let inPayload = !hasPayload;
  for (const rawLine of normalized.split('\n')) {
    let line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    if (line === 'payload:') {
      inPayload = true;
      continue;
    }
    if (!inPayload) continue;
    const itemMatch = line.match(/^-\s*(.+)$/);
    if (itemMatch) line = itemMatch[1].trim();
    else if (hasPayload) continue;
    line = stripInlineComment(line).trim().replace(/^['"]|['"]$/g, '').trim();
    if (line) entries.push(line);
  }
  return entries;
}

function classifyEntry(entry) {
  if (!entry.includes(',')) {
    if (/^[0-9a-fA-F:.]+\/\d+$/.test(entry)) return 'ipcidr';
    return 'domain';
  }
  const type = splitTopLevel(entry)[0].toUpperCase().replace(/\s+/g, '');
  if (DOMAIN_RULE_TYPES.has(type)) return 'domain';
  if (IPCIDR_RULE_TYPES.has(type)) return 'ipcidr';
  return type || 'unknown';
}

function normalizeDomainEntry(entry) {
  return entry;
}

function normalizeIpCidrEntry(entry) {
  if (!entry.includes(',')) return entry.trim();
  const parts = splitTopLevel(entry);
  return String(parts[1] || '').trim();
}

function renderPayload(entries) {
  const lines = ['payload:'];
  for (const entry of entries) lines.push(`  - ${yamlQuote(entry)}`);
  lines.push('');
  return lines.join('\n');
}

function safeFileName(name) {
  return `${String(name).toLowerCase().replace(/[^a-z0-9._-]+/g, '-').replace(/^-+|-+$/g, '') || 'ruleset'}.mrs`;
}

async function fetchText(url) {
  const candidates = [url];
  if (url.includes('fastly.jsdelivr.net/gh/')) candidates.push(url.replace('https://fastly.jsdelivr.net/gh/', 'https://cdn.jsdelivr.net/gh/'));
  if (url.includes('cdn.jsdelivr.net/gh/')) candidates.push(url.replace('https://cdn.jsdelivr.net/gh/', 'https://fastly.jsdelivr.net/gh/'));
  if (url.includes('raw.githubusercontent.com/')) candidates.push(url.replace('https://raw.githubusercontent.com/', 'https://fastly.jsdelivr.net/gh/').replace('/main/', '@main/').replace('/master/', '@master/'));

  const errors = [];
  for (const candidate of candidates) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 45000);
    try {
      const response = await fetch(candidate, {
        signal: controller.signal,
        headers: { 'user-agent': 'Smart-Config-Kit-MRS-Sync/1.0' },
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return Buffer.from(await response.arrayBuffer()).toString('utf8');
    } catch (error) {
      errors.push(`${candidate} -> ${error.message}`);
    } finally {
      clearTimeout(timer);
    }
  }
  throw new Error(errors.join('; '));
}

async function downloadJson(url) {
  const response = await fetch(url, { headers: { 'user-agent': 'Smart-Config-Kit-MRS-Sync/1.0' } });
  if (!response.ok) throw new Error(`${url} -> HTTP ${response.status}`);
  return response.json();
}

function platformAssetPattern() {
  const arch = os.arch();
  if (process.platform === 'win32') {
    if (arch !== 'x64') throw new Error(`Unsupported Windows arch for automatic mihomo download: ${arch}`);
    return /^mihomo-windows-amd64-compatible-.*\.zip$/;
  }
  if (process.platform === 'linux') {
    if (arch === 'x64') return /^mihomo-linux-amd64-compatible-.*\.gz$/;
    if (arch === 'arm64') return /^mihomo-linux-arm64-.*\.gz$/;
  }
  if (process.platform === 'darwin') {
    if (arch === 'x64') return /^mihomo-darwin-amd64-compatible-.*\.gz$/;
    if (arch === 'arm64') return /^mihomo-darwin-arm64-.*\.gz$/;
  }
  throw new Error(`Unsupported platform for automatic mihomo download: ${process.platform}/${arch}`);
}

async function ensureMihomoBinary(explicitPath) {
  if (explicitPath) return path.resolve(explicitPath);
  fs.mkdirSync(CACHE_DIR, { recursive: true });
  const release = await downloadJson(MIHOMO_REPO_API);
  const pattern = platformAssetPattern();
  const asset = release.assets.find((candidate) => pattern.test(candidate.name));
  if (!asset) throw new Error(`No mihomo release asset matches ${pattern}`);

  const ext = process.platform === 'win32' ? '.exe' : '';
  const target = path.join(CACHE_DIR, `mihomo-${release.tag_name}${ext}`);
  if (fs.existsSync(target)) return target;

  const archive = path.join(CACHE_DIR, asset.name);
  const response = await fetch(asset.browser_download_url, { headers: { 'user-agent': 'Smart-Config-Kit-MRS-Sync/1.0' } });
  if (!response.ok) throw new Error(`${asset.browser_download_url} -> HTTP ${response.status}`);
  fs.writeFileSync(archive, Buffer.from(await response.arrayBuffer()));

  if (asset.name.endsWith('.gz')) {
    fs.writeFileSync(target, zlib.gunzipSync(fs.readFileSync(archive)));
    fs.chmodSync(target, 0o755);
  } else if (asset.name.endsWith('.zip') && process.platform === 'win32') {
    const unzipDir = path.join(CACHE_DIR, `unzip-${release.tag_name}`);
    fs.rmSync(unzipDir, { recursive: true, force: true });
    fs.mkdirSync(unzipDir, { recursive: true });
    const result = childProcess.spawnSync('powershell.exe', ['-NoProfile', '-Command', `Expand-Archive -LiteralPath ${JSON.stringify(archive)} -DestinationPath ${JSON.stringify(unzipDir)} -Force`], { encoding: 'utf8' });
    if (result.status !== 0) throw new Error(result.stderr || result.stdout || 'Expand-Archive failed');
    const exe = fs.readdirSync(unzipDir).find((file) => file.endsWith('.exe'));
    if (!exe) throw new Error(`No mihomo exe found in ${asset.name}`);
    fs.copyFileSync(path.join(unzipDir, exe), target);
  } else {
    throw new Error(`Unsupported mihomo archive: ${asset.name}`);
  }
  return target;
}

function convertWithMihomo(mihomoBin, behavior, sourceFile, targetFile) {
  const result = childProcess.spawnSync(mihomoBin, ['convert-ruleset', behavior, 'yaml', sourceFile, targetFile], {
    encoding: 'utf8',
  });
  if (result.status !== 0) {
    throw new Error([
      `mihomo convert-ruleset ${behavior} failed for ${sourceFile}`,
      result.stdout,
      result.stderr,
    ].filter(Boolean).join('\n'));
  }
}

function writeNormalizedSource(tempDir, id, behavior, entries) {
  const file = path.join(tempDir, `${id}-${behavior}.yaml`);
  const normalized = behavior === 'ipcidr'
    ? entries.map(normalizeIpCidrEntry).filter(Boolean)
    : entries.map(normalizeDomainEntry).filter(Boolean);
  fs.writeFileSync(file, renderPayload(normalized), 'utf8');
  return { file, count: normalized.length };
}

async function runLimited(items, limit, worker) {
  let cursor = 0;
  const results = [];
  async function next() {
    while (cursor < items.length) {
      const index = cursor;
      cursor += 1;
      results[index] = await worker(items[index], index);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, next));
  return results;
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const mihomoBin = await ensureMihomoBinary(options.mihomoBin);
  const providers = parseProviders(readText(CMFA_FILE))
    .filter((provider) => provider.url)
    .filter((provider) => provider.type === 'http')
    .filter((provider) => !provider.url.includes(SCKI_SUPPLEMENTAL_MARKER));

  const tempDir = path.join(CACHE_DIR, 'sources');
  fs.rmSync(tempDir, { recursive: true, force: true });
  fs.rmSync(OUTPUT_DIR, { recursive: true, force: true });
  fs.mkdirSync(tempDir, { recursive: true });
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  const manifest = {
    generated_at: new Date().toISOString(),
    source: 'Clash Meta For Android/CMFA(mihomo).yaml',
    mihomo_bin: path.basename(mihomoBin),
    output_dir: 'rulesets/generated/mihomo-mrs',
    converted: [],
    split: [],
    existing_mrs: [],
    retained: [],
    failed: [],
  };

  await runLimited(providers, CONCURRENCY, async (provider) => {
    if (provider.format === 'mrs') {
      manifest.existing_mrs.push({
        id: provider.name,
        behavior: provider.behavior,
        url: provider.url,
      });
      return;
    }

    try {
      const text = await fetchText(provider.url);
      const entries = parsePayloadEntries(text);
      const typeCounts = {};
      for (const entry of entries) {
        const type = classifyEntry(entry);
        typeCounts[type] = (typeCounts[type] || 0) + 1;
      }
      const types = Object.keys(typeCounts).sort();
      const domainEntries = entries.filter((entry) => classifyEntry(entry) === 'domain');
      const ipcidrEntries = entries.filter((entry) => classifyEntry(entry) === 'ipcidr');

      if (entries.length === 0) {
        manifest.retained.push({ id: provider.name, reason: 'empty-source', url: provider.url });
        return;
      }

      if (types.every((type) => type === 'domain' || type === 'ipcidr')) {
        const generated = [];
        if (domainEntries.length > 0) {
          const fileName = domainEntries.length === entries.length ? safeFileName(provider.name) : safeFileName(`${provider.name}-domain`);
          const source = writeNormalizedSource(tempDir, provider.name, 'domain', domainEntries);
          convertWithMihomo(mihomoBin, 'domain', source.file, path.join(OUTPUT_DIR, fileName));
          generated.push({ behavior: 'domain', file: fileName, entries: source.count });
        }
        if (ipcidrEntries.length > 0) {
          const fileName = ipcidrEntries.length === entries.length ? safeFileName(provider.name) : safeFileName(`${provider.name}-ipcidr`);
          const source = writeNormalizedSource(tempDir, provider.name, 'ipcidr', ipcidrEntries);
          convertWithMihomo(mihomoBin, 'ipcidr', source.file, path.join(OUTPUT_DIR, fileName));
          generated.push({ behavior: 'ipcidr', file: fileName, entries: source.count });
        }
        const row = {
          id: provider.name,
          source_behavior: provider.behavior || 'classical',
          source_format: provider.format || 'yaml',
          source_url: provider.url,
          type_counts: typeCounts,
          generated,
        };
        if (generated.length === 1) manifest.converted.push(row);
        else manifest.split.push(row);
        return;
      }

      manifest.retained.push({
        id: provider.name,
        reason: 'unsupported-rule-types',
        source_behavior: provider.behavior || 'classical',
        source_format: provider.format || 'yaml',
        source_url: provider.url,
        type_counts: typeCounts,
      });
    } catch (error) {
      manifest.failed.push({ id: provider.name, url: provider.url, error: error.message });
    }
  });

  manifest.converted.sort((a, b) => a.id.localeCompare(b.id));
  manifest.split.sort((a, b) => a.id.localeCompare(b.id));
  manifest.existing_mrs.sort((a, b) => a.id.localeCompare(b.id));
  manifest.retained.sort((a, b) => a.id.localeCompare(b.id));
  manifest.failed.sort((a, b) => a.id.localeCompare(b.id));
  fs.writeFileSync(path.join(OUTPUT_DIR, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');

  if (!options.keepCache) fs.rmSync(tempDir, { recursive: true, force: true });
  console.log(`mihomo mrs sync: converted=${manifest.converted.length} split=${manifest.split.length} existing=${manifest.existing_mrs.length} retained=${manifest.retained.length} failed=${manifest.failed.length}`);
  if (manifest.failed.length > 0) {
    for (const failure of manifest.failed) console.error(`${failure.id}: ${failure.error}`);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(error.stack || error.message);
  process.exit(1);
});
