#!/usr/bin/env node
'use strict';

const childProcess = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const vm = require('node:vm');
const zlib = require('node:zlib');

const REPO_ROOT = path.resolve(__dirname, '..');
const CLASH_PARTY_FILE = path.join(REPO_ROOT, 'Clash Party/ClashParty(mihomo-smart).js');
const MIHOMO_MRS_MANIFEST_FILE = path.join(REPO_ROOT, 'rulesets/generated/mihomo-mrs/manifest.json');
const FUSED_ROOT = path.join(REPO_ROOT, 'rulesets/generated/fused');
const FUSED_MIHOMO_DIR = path.join(FUSED_ROOT, 'mihomo');
const FUSED_CLASH_DIR = path.join(FUSED_ROOT, 'clash');
const FUSED_SURGE_DIR = path.join(FUSED_ROOT, 'surge');
const FUSED_QX_DIR = path.join(FUSED_ROOT, 'quantumultx');
const FUSED_EGERN_DIR = path.join(FUSED_ROOT, 'egern');
const FUSED_SING_BOX_DIR = path.join(FUSED_ROOT, 'sing-box');
const CACHE_DIR = path.join(REPO_ROOT, '.cache/fused-rule-sets');
const MIHOMO_CACHE_DIR = path.join(REPO_ROOT, '.cache/mihomo-mrs');

const SCKI_BASE = 'https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main';
const FUSED_BASE_URL = `${SCKI_BASE}/rulesets/generated/fused`;
const MIHOMO_MRS_BASE_PATH = '/rulesets/generated/mihomo-mrs/';
const FUSED_MIHOMO_BASE_PATH = '/rulesets/generated/fused/mihomo/';
const META_GEOSITE_BASE = 'https://raw.githubusercontent.com/MetaCubeX/meta-rules-dat/meta/geo/geosite';
const META_GEOIP_BASE = 'https://raw.githubusercontent.com/MetaCubeX/meta-rules-dat/meta/geo/geoip';
const HAGEZI_TIF_DOMAINS = 'https://raw.githubusercontent.com/hagezi/dns-blocklists/main/domains/tif.txt';
const ANTI_AD_CLASH = 'https://anti-ad.net/clash.yaml';
const MIHOMO_REPO_API = 'https://api.github.com/repos/MetaCubeX/mihomo/releases/latest';
const SING_BOX_REPO_API = 'https://api.github.com/repos/SagerNet/sing-box/releases/latest';

const DOMAIN_TYPES = new Set(['DOMAIN', 'DOMAIN-SUFFIX', 'DOMAIN-KEYWORD', 'DOMAIN-REGEX', 'DOMAIN-WILDCARD']);
const IPCIDR_TYPES = new Set(['IP-CIDR', 'IP-CIDR6']);
const RESIDUAL_TYPES = new Set(['PROCESS-NAME', 'PROCESS-PATH', 'PROCESS-PATH-REGEX', 'SRC-IP-CIDR', 'SRC-PORT', 'GEOSITE', 'GEOIP']);

const INLINE_ONLY_TYPES = new Set(['AND', 'OR', 'NOT', 'DST-PORT', 'SRC-PORT', 'MATCH', 'FINAL', 'NETWORK']);
const REQUIRED_SUPPORT_PROVIDERS = new Set([
  // Still referenced by inline QUIC AND rules or sing-box DNS/QUIC helper rules.
  'apple',
  'microsoft',
  'youtube',
  'google',
  'cn',
  'cn-ip',
  'anti-ad',
]);

const POLICY_SLUGS = new Map([
  ['DIRECT', 'direct'],
  ['REJECT', 'reject'],
  ['REJECT-DROP', 'reject-drop'],
  ['🤖 AI 服务', 'ai'],
  ['💰 加密货币', 'crypto'],
  ['🏦 金融支付', 'payments'],
  ['💬 即时通讯', 'im'],
  ['📱 社交媒体', 'social'],
  ['🧑‍💼 会议协作', 'work'],
  ['📺 国内流媒体', 'cnmedia'],
  ['🎵 TikTok', 'tiktok'],
  ['🎥 Netflix', 'netflix'],
  ['🎬 Disney+', 'disney'],
  ['📡 HBO/Max', 'hbo-max'],
  ['📺 Hulu', 'hulu'],
  ['🎬 Prime Video', 'prime-video'],
  ['📹 YouTube', 'youtube'],
  ['🎵 音乐流媒体', 'music'],
  ['🇭🇰 香港流媒体', 'stream-hk'],
  ['🇹🇼 台湾流媒体', 'stream-tw'],
  ['🇯🇵 日韩流媒体', 'stream-jpkr'],
  ['🇪🇺 欧洲流媒体', 'stream-eu'],
  ['🌐 其他国外流媒体', 'stream-other'],
  ['🕹️ 国内游戏', 'game-cn'],
  ['🎮 国外游戏', 'game-intl'],
  ['🔍 Google 服务', 'google'],
  ['🔧 工具与服务', 'tools'],
  ['Ⓜ️ 微软服务', 'microsoft'],
  ['🍎 苹果服务', 'apple'],
  ['📥 下载更新', 'download'],
  ['🛰️ BT/PT Tracker', 'tracker'],
  ['🏠 国内网站', 'cn-site'],
  ['🚫 受限网站', 'gfw'],
  ['🌐 国外网站', 'intl-site'],
  ['🐟 漏网之鱼', 'final'],
  ['🛑 广告拦截', 'ad'],
]);

const PRIVATE_CIDRS = [
  '0.0.0.0/8',
  '10.0.0.0/8',
  '100.64.0.0/10',
  '127.0.0.0/8',
  '169.254.0.0/16',
  '172.16.0.0/12',
  '192.0.0.0/24',
  '192.0.2.0/24',
  '192.168.0.0/16',
  '198.18.0.0/15',
  '198.51.100.0/24',
  '203.0.113.0/24',
  '224.0.0.0/4',
  '240.0.0.0/4',
  '255.255.255.255/32',
  '::1/128',
  'fc00::/7',
  'fe80::/10',
];

function readText(file) {
  return fs.readFileSync(file, 'utf8');
}

function writeText(file, text) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, text, 'utf8');
}

function yamlQuote(value) {
  return JSON.stringify(String(value));
}

function safeSlug(value) {
  return String(value)
    .normalize('NFKD')
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'rules';
}

function policySlug(policy) {
  return POLICY_SLUGS.get(policy) || safeSlug(policy);
}

function splitTopLevel(rule) {
  const parts = [];
  let depth = 0;
  let current = '';
  for (const char of String(rule)) {
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
  const normalized = String(text || '').replace(/\r\n/g, '\n');
  const hasPayload = /^payload:\s*$/m.test(normalized);
  const entries = [];
  let inPayload = !hasPayload;
  for (const rawLine of normalized.split('\n')) {
    let line = rawLine.trim();
    if (!line || line.startsWith('#') || line.startsWith('//')) continue;
    if (line === 'payload:') {
      inPayload = true;
      continue;
    }
    if (!inPayload) continue;
    const itemMatch = line.match(/^-\s*(.+)$/);
    if (itemMatch) line = itemMatch[1].trim();
    else if (hasPayload) continue;
    line = stripInlineComment(line).trim().replace(/^['"]|['"]$/g, '').trim();
    if (line && !line.startsWith('#')) entries.push(line);
  }
  return entries;
}

function runClashPartyBaseline() {
  const source = readText(CLASH_PARTY_FILE);
  const logs = [];
  const sandbox = {
    console: {
      log(...args) { logs.push(args.join(' ')); },
      warn(...args) { logs.push(args.join(' ')); },
      error(...args) { logs.push(args.join(' ')); },
    },
    SCKI_DISABLE_FUSED_RULESETS: true,
  };
  vm.createContext(sandbox);
  vm.runInContext(`${source}\nthis.__main = main; this.__VERSION = VERSION;`, sandbox, { filename: CLASH_PARTY_FILE });
  if (typeof sandbox.__main !== 'function') throw new Error('Clash Party main() not found');
  const proxy = (name) => ({ name, type: 'ss', server: 'example.com', port: 443, cipher: 'aes-128-gcm', password: 'x' });
  const config = {
    proxies: [
      proxy('HK 01'),
      proxy('HK Home 01'),
      proxy('TW 01'),
      proxy('JP 01'),
      proxy('KR 01'),
      proxy('SG 01'),
      proxy('US 01'),
      proxy('DE 01'),
    ],
    'proxy-groups': [],
    'rule-providers': {},
    rules: [],
    dns: {},
  };
  const output = sandbox.__main(config);
  return {
    version: sandbox.__VERSION,
    providers: output['rule-providers'] || {},
    rules: output.rules || [],
    logs,
  };
}

function localPathForUrl(url) {
  const text = String(url || '');
  const prefixes = [
    'https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/',
    'https://cdn.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/',
    'https://raw.githubusercontent.com/IvanSolis1989/Smart-Config-Kit/main/',
  ];
  for (const prefix of prefixes) {
    if (text.startsWith(prefix)) {
      const relative = decodeURIComponent(text.slice(prefix.length).split(/[?#]/)[0]);
      const candidate = path.resolve(REPO_ROOT, relative);
      if (candidate.startsWith(REPO_ROOT) && fs.existsSync(candidate)) return candidate;
    }
  }
  return null;
}

function encodeRuleAssetName(name) {
  return encodeURIComponent(name).replace(/%21/g, '%21');
}

function metaSourceForMrsUrl(url) {
  const match = String(url || '').match(/^https:\/\/(?:fastly\.|cdn\.)?jsdelivr\.net\/gh\/MetaCubeX\/meta-rules-dat@meta\/geo\/(geosite|geoip)\/(.+)\.mrs$/i);
  if (!match) return null;
  const [, family, name] = match;
  const file = encodeRuleAssetName(decodeURIComponent(name));
  const base = family === 'geosite' ? META_GEOSITE_BASE : META_GEOIP_BASE;
  return {
    sourceUrl: `${base}/${file}.yaml`,
    sourceFilter: family === 'geosite' ? 'domain' : 'ipcidr',
  };
}

function readMihomoMrsSourceMap() {
  const byFile = new Map();
  if (!fs.existsSync(MIHOMO_MRS_MANIFEST_FILE)) return byFile;
  const manifest = JSON.parse(readText(MIHOMO_MRS_MANIFEST_FILE));
  for (const row of [...(manifest.converted || []), ...(manifest.split || []), ...(manifest.partial || [])]) {
    for (const generated of row.generated || []) {
      byFile.set(generated.file, {
        id: row.id,
        sourceUrl: row.source_url,
        sourceFilter: generated.behavior,
      });
    }
    if (row.residual) {
      byFile.set(row.residual.file, {
        id: row.id,
        localPath: path.join(REPO_ROOT, 'rulesets/generated/mihomo-mrs', row.residual.file),
        sourceFilter: null,
      });
    }
  }
  return byFile;
}

function sourceInfoForGeneratedMihomoMrs(url, byFile) {
  if (!String(url || '').includes(MIHOMO_MRS_BASE_PATH)) return null;
  const file = decodeURIComponent(String(url).split(MIHOMO_MRS_BASE_PATH).pop().split(/[?#]/)[0]);
  return byFile.get(file) || null;
}

function sourceInfoForProvider(provider, byFile) {
  if (!provider || !provider.url) return null;
  const providerFilter = provider.behavior === 'domain' || provider.behavior === 'ipcidr' ? provider.behavior : null;
  const local = localPathForUrl(provider.url);
  if (local && !/\.mrs$/i.test(local)) return { localPath: local, sourceFilter: providerFilter };

  const generated = sourceInfoForGeneratedMihomoMrs(provider.url, byFile);
  if (generated) return generated;

  if (provider.name === 'hagezi-tif') return { sourceUrl: HAGEZI_TIF_DOMAINS, sourceFilter: 'domain' };
  if (provider.name === 'anti-ad') return { sourceUrl: ANTI_AD_CLASH, sourceFilter: 'domain' };

  const meta = metaSourceForMrsUrl(provider.url);
  if (meta) return meta;

  if (/\.mrs(?:[?#].*)?$/i.test(provider.url)) return null;

  return {
    sourceUrl: String(provider.url)
      .replace('https://fastly.jsdelivr.net/gh/MetaCubeX/meta-rules-dat@meta/', 'https://raw.githubusercontent.com/MetaCubeX/meta-rules-dat/meta/')
      .replace('https://cdn.jsdelivr.net/gh/MetaCubeX/meta-rules-dat@meta/', 'https://raw.githubusercontent.com/MetaCubeX/meta-rules-dat/meta/'),
    sourceFilter: providerFilter,
  };
}

async function fetchText(url) {
  const local = localPathForUrl(url);
  if (local) return readText(local);

  const key = Buffer.from(url).toString('base64url');
  const cached = path.join(CACHE_DIR, `${key}.txt`);
  if (fs.existsSync(cached)) return readText(cached);

  const candidates = [url];
  if (url.includes('fastly.jsdelivr.net/gh/')) candidates.push(url.replace('https://fastly.jsdelivr.net/gh/', 'https://cdn.jsdelivr.net/gh/'));
  if (url.includes('cdn.jsdelivr.net/gh/')) candidates.push(url.replace('https://cdn.jsdelivr.net/gh/', 'https://fastly.jsdelivr.net/gh/'));
  const jsdelivrMatch = url.match(/^https:\/\/(?:fastly\.|cdn\.|testingcf\.)?jsdelivr\.net\/gh\/([^/]+)\/([^@/]+)@([^/]+)\/(.+)$/);
  if (jsdelivrMatch) {
    const [, owner, repo, ref, filePath] = jsdelivrMatch;
    candidates.push(`https://raw.githubusercontent.com/${owner}/${repo}/${ref}/${filePath}`);
  }
  if (url.includes('raw.githubusercontent.com/')) {
    const rawMatch = url.match(/^https:\/\/raw\.githubusercontent\.com\/([^/]+)\/([^/]+)\/([^/]+)\/(.+)$/);
    if (rawMatch) {
      const [, owner, repo, ref, filePath] = rawMatch;
      candidates.push(`https://fastly.jsdelivr.net/gh/${owner}/${repo}@${ref}/${filePath}`);
      candidates.push(`https://cdn.jsdelivr.net/gh/${owner}/${repo}@${ref}/${filePath}`);
    }
  }
  const errors = [];
  const orderedCandidates = [...new Set(candidates)].sort((a, b) => {
    const aRaw = a.includes('raw.githubusercontent.com') ? 1 : 0;
    const bRaw = b.includes('raw.githubusercontent.com') ? 1 : 0;
    return aRaw - bRaw;
  });
  for (const candidate of orderedCandidates) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 5000);
    try {
      const response = await fetch(candidate, {
        signal: controller.signal,
        headers: { 'user-agent': 'Smart-Config-Kit-Fused-Rules/1.0' },
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const text = Buffer.from(await response.arrayBuffer()).toString('utf8');
      writeText(cached, text);
      return text;
    } catch (error) {
      errors.push(`${candidate} -> ${error.message}`);
    } finally {
      clearTimeout(timer);
    }
  }
  throw new Error(errors.join('; '));
}

async function loadSourceEntries(sourceInfo) {
  if (!sourceInfo) return null;
  const text = sourceInfo.localPath ? readText(sourceInfo.localPath) : await fetchText(sourceInfo.sourceUrl);
  let entries = parsePayloadEntries(text);
  if (sourceInfo.sourceFilter) {
    entries = entries.filter((entry) => classifyEntry(entry).bucket === sourceInfo.sourceFilter);
  }
  return entries;
}

async function expandResolvableEntries(entries) {
  const output = [];
  for (const entry of entries) {
    const parts = splitTopLevel(entry);
    const type = String(parts[0] || '').toUpperCase();
    if (type === 'GEOSITE' && parts[1]) {
      try {
        const nested = await loadSourceEntries({ sourceUrl: `${META_GEOSITE_BASE}/${encodeRuleAssetName(parts[1])}.yaml`, sourceFilter: 'domain' });
        output.push(...(nested || []));
      } catch {
        output.push(entry);
      }
      continue;
    }
    if (type === 'GEOIP' && parts[1]) {
      if (String(parts[1]).toLowerCase() === 'private') output.push(...PRIVATE_CIDRS);
      else {
        try {
          const nested = await loadSourceEntries({ sourceUrl: `${META_GEOIP_BASE}/${encodeRuleAssetName(parts[1].toLowerCase())}.yaml`, sourceFilter: 'ipcidr' });
          output.push(...(nested || []));
        } catch {
          output.push(entry);
        }
      }
      continue;
    }
    output.push(entry);
  }
  return output;
}

function classifyEntry(entry) {
  const text = String(entry || '').trim();
  if (!text) return { bucket: 'unknown', type: 'EMPTY' };
  if (!text.includes(',')) {
    if (/^[0-9a-fA-F:.]+\/\d+$/.test(text)) return { bucket: 'ipcidr', type: text.includes(':') ? 'IP-CIDR6' : 'IP-CIDR', value: text };
    return { bucket: 'domain', type: 'DOMAIN-SET', value: text };
  }
  const parts = splitTopLevel(text);
  const type = String(parts[0] || '').toUpperCase().replace(/\s+/g, '');
  if (DOMAIN_TYPES.has(type)) return { bucket: 'domain', type, value: parts[1] || '', parts };
  if (IPCIDR_TYPES.has(type)) return { bucket: 'ipcidr', type, value: parts[1] || '', parts };
  if (RESIDUAL_TYPES.has(type)) return { bucket: 'residual', type, value: parts[1] || '', parts };
  return { bucket: 'unsupported', type, value: parts[1] || '', parts };
}

function normalizeDomainSetToClassical(value) {
  let item = String(value || '').trim();
  if (!item) return null;
  if (item.startsWith('+.')) item = item.slice(2);
  if (item.startsWith('.')) return `DOMAIN-SUFFIX,${item.slice(1)}`;
  if (item.startsWith('*.')) return `DOMAIN-SUFFIX,${item.slice(2)}`;
  if (item.includes('*')) return `DOMAIN-WILDCARD,${item}`;
  return `DOMAIN,${item}`;
}

function entryToClassical(entry) {
  const info = classifyEntry(entry);
  if (info.bucket === 'domain') {
    if (info.type === 'DOMAIN-SET') return normalizeDomainSetToClassical(info.value);
    return `${info.type},${info.value}`;
  }
  if (info.bucket === 'ipcidr') return `${info.type},${info.value}`;
  if (info.bucket === 'residual') return entry;
  return null;
}

function entryToQx(entry) {
  const classical = entryToClassical(entry);
  if (!classical) return null;
  const parts = splitTopLevel(classical);
  const type = parts[0];
  if (type === 'DOMAIN') return `host, ${parts[1]}`;
  if (type === 'DOMAIN-SUFFIX') return `host-suffix, ${parts[1]}`;
  if (type === 'DOMAIN-KEYWORD') return `host-keyword, ${parts[1]}`;
  if (type === 'IP-CIDR') return `ip-cidr, ${parts[1]}`;
  if (type === 'IP-CIDR6') return `ip6-cidr, ${parts[1]}`;
  return null;
}

function addToSingBoxRule(rule, entry) {
  const classical = entryToClassical(entry);
  if (!classical) return;
  const parts = splitTopLevel(classical);
  const type = parts[0];
  const value = parts[1];
  if (type === 'DOMAIN') (rule.domain ||= []).push(value);
  else if (type === 'DOMAIN-SUFFIX') (rule.domain_suffix ||= []).push(value);
  else if (type === 'DOMAIN-KEYWORD') (rule.domain_keyword ||= []).push(value);
  else if (type === 'DOMAIN-REGEX') (rule.domain_regex ||= []).push(value);
  else if (type === 'IP-CIDR' || type === 'IP-CIDR6') (rule.ip_cidr ||= []).push(value);
  else if (type === 'PROCESS-NAME') (rule.process_name ||= []).push(value);
}

function addToEgernSets(sets, entry) {
  const classical = entryToClassical(entry);
  if (!classical) return;
  const parts = splitTopLevel(classical);
  const type = parts[0];
  const value = parts[1];
  const map = {
    DOMAIN: 'domain_set',
    'DOMAIN-SUFFIX': 'domain_suffix_set',
    'DOMAIN-KEYWORD': 'domain_keyword_set',
    'DOMAIN-REGEX': 'domain_regex_set',
    'DOMAIN-WILDCARD': 'domain_wildcard_set',
    'IP-CIDR': 'ip_cidr_set',
    'IP-CIDR6': 'ip_cidr6_set',
  };
  const key = map[type];
  if (key) (sets[key] ||= []).push(value);
}

function dedupe(values) {
  return [...new Set(values.filter(Boolean))];
}

function createSegment(index, policy) {
  const prefix = `scki-fused-${String(index).padStart(3, '0')}-${policySlug(policy)}`;
  return {
    id: prefix,
    policy,
    sourceRules: [],
    domain: [],
    ipcidr: [],
    ipcidrNoResolve: [],
    residual: [],
  };
}

function segmentHasPayload(segment) {
  return segment.domain.length || segment.ipcidr.length || segment.ipcidrNoResolve.length || segment.residual.length;
}

function addEntriesToSegment(segment, rule, entries, noResolve) {
  segment.sourceRules.push(rule);
  for (const entry of entries) {
    const info = classifyEntry(entry);
    if (info.bucket === 'domain') segment.domain.push(entry);
    else if (info.bucket === 'ipcidr') {
      if (noResolve) segment.ipcidrNoResolve.push(entry);
      else segment.ipcidr.push(entry);
    } else if (info.bucket === 'residual') segment.residual.push(entry);
  }
}

async function resolveMainRule(rule, providers, sourceMap, stats) {
  const parts = splitTopLevel(rule);
  const type = parts[0];
  if (INLINE_ONLY_TYPES.has(type)) return { fusable: false, rule, reason: type };
  if (type === 'RULE-SET') {
    const providerName = parts[1];
    const provider = providers[providerName];
    const policy = parts[2];
    if (!provider) return { fusable: false, rule, reason: `missing-provider:${providerName}` };
    const sourceInfo = sourceInfoForProvider({ ...provider, name: providerName }, sourceMap);
    let rawEntries = null;
    try {
      rawEntries = await loadSourceEntries(sourceInfo);
    } catch (error) {
      stats.unresolvedProviders.push({ id: providerName, error: error.message });
      stats.passthroughProviderIds.add(providerName);
      return { fusable: false, rule, reason: `unresolved-provider:${providerName}` };
    }
    if (!rawEntries) {
      stats.unresolvedProviders.push({ id: providerName, error: 'missing-source-info' });
      stats.passthroughProviderIds.add(providerName);
      return { fusable: false, rule, reason: `unresolved-provider:${providerName}` };
    }
    const entries = await expandResolvableEntries(rawEntries);
    return { fusable: true, policy, entries, noResolve: parts.includes('no-resolve'), source: providerName };
  }
  if (type === 'GEOSITE') {
    const name = parts[1];
    let entries = null;
    try {
      entries = await loadSourceEntries({ sourceUrl: `${META_GEOSITE_BASE}/${encodeRuleAssetName(name)}.yaml`, sourceFilter: 'domain' });
    } catch (error) {
      stats.unresolvedSources.push({ id: `GEOSITE:${name}`, error: error.message });
      return { fusable: false, rule, reason: `unresolved-geosite:${name}` };
    }
    return { fusable: true, policy: parts[2], entries, noResolve: false, source: `GEOSITE:${name}` };
  }
  if (type === 'GEOIP') {
    const name = parts[1];
    if (String(name).toLowerCase() === 'private') {
      return { fusable: true, policy: parts[2], entries: PRIVATE_CIDRS, noResolve: parts.includes('no-resolve'), source: 'GEOIP:private' };
    }
    let entries = null;
    try {
      entries = await loadSourceEntries({ sourceUrl: `${META_GEOIP_BASE}/${encodeRuleAssetName(name.toLowerCase())}.yaml`, sourceFilter: 'ipcidr' });
    } catch (error) {
      stats.unresolvedSources.push({ id: `GEOIP:${name}`, error: error.message });
      return { fusable: false, rule, reason: `unresolved-geoip:${name}` };
    }
    return { fusable: true, policy: parts[2], entries, noResolve: parts.includes('no-resolve'), source: `GEOIP:${name}` };
  }
  if (DOMAIN_TYPES.has(type) || IPCIDR_TYPES.has(type) || RESIDUAL_TYPES.has(type)) {
    return { fusable: true, policy: parts[2], entries: [rule], noResolve: parts.includes('no-resolve'), source: 'inline' };
  }
  return { fusable: false, rule, reason: type || 'unknown' };
}

async function buildSegments(clashOutput) {
  const sourceMap = readMihomoMrsSourceMap();
  const stats = { unresolvedProviders: [], unresolvedSources: [], passthroughProviderIds: new Set() };
  const segments = [];
  const inlineRules = [];
  const timeline = [];
  let current = null;
  let index = 1;

  function flush() {
    if (current && segmentHasPayload(current)) {
      current.domain = dedupe(current.domain);
      current.ipcidr = dedupe(current.ipcidr);
      current.ipcidrNoResolve = dedupe(current.ipcidrNoResolve);
      current.residual = dedupe(current.residual);
      segments.push(current);
      timeline.push({ type: 'segment', segment: current });
    }
    current = null;
  }

  for (const rule of clashOutput.rules) {
    const resolved = await resolveMainRule(rule, clashOutput.providers, sourceMap, stats);
    if (!resolved.fusable) {
      flush();
      inlineRules.push(rule);
      timeline.push({ type: 'inline', rule });
      continue;
    }
    if (!current || current.policy !== resolved.policy) {
      flush();
      current = createSegment(index, resolved.policy);
      index += 1;
    }
    addEntriesToSegment(current, rule, resolved.entries, resolved.noResolve);
  }
  flush();
  return { segments, inlineRules, timeline, stats };
}

function renderPayload(entries) {
  const lines = ['payload:'];
  for (const entry of entries) lines.push(`  - ${yamlQuote(entry)}`);
  lines.push('');
  return lines.join('\n');
}

function normalizeIpCidrEntry(entry) {
  const text = String(entry || '').trim();
  if (!text.includes(',')) return text;
  const parts = splitTopLevel(text);
  return String(parts[1] || '').trim();
}

function renderClassicalList(entries, { includeProcess }) {
  return `${dedupe(entries.map(entryToClassical).filter((entry) => {
    if (!entry) return false;
    if (!includeProcess && /^PROCESS-/.test(entry)) return false;
    return true;
  })).join('\n')}\n`;
}

function renderQxList(entries) {
  return `${dedupe(entries.map(entryToQx).filter(Boolean)).join('\n')}\n`;
}

function renderEgernYaml(entries) {
  const sets = {};
  for (const entry of entries) addToEgernSets(sets, entry);
  const lines = [
    '# Generated by tools/build-fused-rule-sets.js',
  ];
  for (const key of [
    'domain_set',
    'domain_suffix_set',
    'domain_keyword_set',
    'domain_regex_set',
    'domain_wildcard_set',
    'ip_cidr_set',
    'ip_cidr6_set',
  ]) {
    const values = dedupe(sets[key] || []);
    if (!values.length) continue;
    lines.push(`${key}:`);
    for (const value of values) lines.push(`  - ${yamlQuote(value)}`);
  }
  lines.push('');
  return lines.join('\n');
}

function renderSingBoxSource(entries) {
  const rule = {};
  for (const entry of entries) addToSingBoxRule(rule, entry);
  for (const key of Object.keys(rule)) rule[key] = dedupe(rule[key]);
  return `${JSON.stringify({ version: 3, rules: Object.keys(rule).length ? [rule] : [] }, null, 2)}\n`;
}

async function downloadJson(url) {
  const response = await fetch(url, { headers: { 'user-agent': 'Smart-Config-Kit-Fused-Rules/1.0' } });
  if (!response.ok) throw new Error(`${url} -> HTTP ${response.status}`);
  return response.json();
}

function mihomoAssetPattern() {
  const arch = os.arch();
  if (process.platform === 'win32') {
    if (arch !== 'x64') throw new Error(`Unsupported Windows arch: ${arch}`);
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
  throw new Error(`Unsupported platform for mihomo: ${process.platform}/${arch}`);
}

async function ensureMihomoBinary() {
  fs.mkdirSync(MIHOMO_CACHE_DIR, { recursive: true });
  const existing = fs.readdirSync(MIHOMO_CACHE_DIR).find((file) => /^mihomo-v.*\.exe$/.test(file) || /^mihomo-v/.test(file));
  if (existing) return path.join(MIHOMO_CACHE_DIR, existing);

  const release = await downloadJson(MIHOMO_REPO_API);
  const asset = release.assets.find((candidate) => mihomoAssetPattern().test(candidate.name));
  if (!asset) throw new Error('No mihomo release asset found');
  const target = path.join(MIHOMO_CACHE_DIR, `mihomo-${release.tag_name}${process.platform === 'win32' ? '.exe' : ''}`);
  if (fs.existsSync(target)) return target;
  const archive = path.join(MIHOMO_CACHE_DIR, asset.name);
  const response = await fetch(asset.browser_download_url, { headers: { 'user-agent': 'Smart-Config-Kit-Fused-Rules/1.0' } });
  if (!response.ok) throw new Error(`${asset.browser_download_url} -> HTTP ${response.status}`);
  fs.writeFileSync(archive, Buffer.from(await response.arrayBuffer()));
  if (asset.name.endsWith('.gz')) {
    fs.writeFileSync(target, zlib.gunzipSync(fs.readFileSync(archive)));
    fs.chmodSync(target, 0o755);
  } else {
    const unzipDir = path.join(MIHOMO_CACHE_DIR, `unzip-${release.tag_name}`);
    fs.rmSync(unzipDir, { recursive: true, force: true });
    fs.mkdirSync(unzipDir, { recursive: true });
    const result = childProcess.spawnSync('powershell.exe', ['-NoProfile', '-Command', `Expand-Archive -LiteralPath ${JSON.stringify(archive)} -DestinationPath ${JSON.stringify(unzipDir)} -Force`], { encoding: 'utf8' });
    if (result.status !== 0) throw new Error(result.stderr || result.stdout || 'Expand-Archive failed');
    const exe = fs.readdirSync(unzipDir).find((file) => file.endsWith('.exe'));
    if (!exe) throw new Error(`No mihomo exe in ${asset.name}`);
    fs.copyFileSync(path.join(unzipDir, exe), target);
  }
  return target;
}

function convertWithMihomo(mihomoBin, behavior, sourceFile, targetFile) {
  const result = childProcess.spawnSync(mihomoBin, ['convert-ruleset', behavior, 'yaml', sourceFile, targetFile], {
    cwd: REPO_ROOT,
    encoding: 'utf8',
  });
  if (result.status !== 0) throw new Error(`mihomo convert-ruleset ${behavior} failed: ${result.stderr || result.stdout}`);
}

function singBoxAssetPattern() {
  const arch = os.arch();
  if (process.platform === 'win32' && arch === 'x64') return /sing-box-.*-windows-amd64\.zip$/;
  if (process.platform === 'linux' && arch === 'x64') return /sing-box-.*-linux-amd64\.tar\.gz$/;
  if (process.platform === 'linux' && arch === 'arm64') return /sing-box-.*-linux-arm64\.tar\.gz$/;
  if (process.platform === 'darwin' && arch === 'x64') return /sing-box-.*-darwin-amd64\.tar\.gz$/;
  if (process.platform === 'darwin' && arch === 'arm64') return /sing-box-.*-darwin-arm64\.tar\.gz$/;
  return null;
}

async function ensureSingBoxBinary() {
  const command = process.platform === 'win32' ? 'sing-box.exe' : 'sing-box';
  try {
    const found = childProcess.execFileSync(process.platform === 'win32' ? 'where.exe' : 'which', [command], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).split(/\r?\n/)[0].trim();
    if (found) return found;
  } catch {
    // Download below.
  }

  const pattern = singBoxAssetPattern();
  if (!pattern) return null;
  const dir = path.join(CACHE_DIR, 'sing-box');
  fs.mkdirSync(dir, { recursive: true });
  const existing = fs.readdirSync(dir).find((file) => file === command || file === 'sing-box.exe');
  if (existing) return path.join(dir, existing);

  const release = await downloadJson(SING_BOX_REPO_API);
  const asset = release.assets.find((candidate) => pattern.test(candidate.name));
  if (!asset) return null;
  const archive = path.join(dir, asset.name);
  const response = await fetch(asset.browser_download_url, { headers: { 'user-agent': 'Smart-Config-Kit-Fused-Rules/1.0' } });
  if (!response.ok) throw new Error(`${asset.browser_download_url} -> HTTP ${response.status}`);
  fs.writeFileSync(archive, Buffer.from(await response.arrayBuffer()));
  const extractDir = path.join(dir, `unpack-${release.tag_name}`);
  fs.rmSync(extractDir, { recursive: true, force: true });
  fs.mkdirSync(extractDir, { recursive: true });
  if (asset.name.endsWith('.zip')) {
    const result = childProcess.spawnSync('powershell.exe', ['-NoProfile', '-Command', `Expand-Archive -LiteralPath ${JSON.stringify(archive)} -DestinationPath ${JSON.stringify(extractDir)} -Force`], { encoding: 'utf8' });
    if (result.status !== 0) throw new Error(result.stderr || result.stdout || 'Expand-Archive failed');
  } else {
    const result = childProcess.spawnSync('tar', ['-xzf', archive, '-C', extractDir], { encoding: 'utf8' });
    if (result.status !== 0) throw new Error(result.stderr || result.stdout || 'tar failed');
  }
  const stack = [extractDir];
  while (stack.length) {
    const current = stack.pop();
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) stack.push(full);
      else if (entry.name === command || entry.name === 'sing-box.exe') {
        const target = path.join(dir, command);
        fs.copyFileSync(full, target);
        if (process.platform !== 'win32') fs.chmodSync(target, 0o755);
        return target;
      }
    }
  }
  return null;
}

function compileSingBoxRuleSet(singBoxBin, sourceFile, targetFile) {
  if (!singBoxBin) return false;
  const result = childProcess.spawnSync(singBoxBin, ['rule-set', 'compile', '--output', targetFile, sourceFile], {
    cwd: REPO_ROOT,
    encoding: 'utf8',
  });
  if (result.status !== 0) {
    console.warn(`sing-box rule-set compile failed for ${sourceFile}: ${result.stderr || result.stdout}`);
    return false;
  }
  return true;
}

async function writeFusedRuleSets(segments) {
  fs.rmSync(FUSED_ROOT, { recursive: true, force: true });
  fs.mkdirSync(FUSED_MIHOMO_DIR, { recursive: true });
  fs.mkdirSync(FUSED_CLASH_DIR, { recursive: true });
  fs.mkdirSync(FUSED_SURGE_DIR, { recursive: true });
  fs.mkdirSync(FUSED_QX_DIR, { recursive: true });
  fs.mkdirSync(FUSED_EGERN_DIR, { recursive: true });
  fs.mkdirSync(FUSED_SING_BOX_DIR, { recursive: true });

  const mihomoBin = await ensureMihomoBinary();
  const singBoxBin = await ensureSingBoxBinary();
  const manifestSegments = [];
  let generatedMrs = 0;
  let generatedSrs = 0;

  for (const segment of segments) {
    const allEntries = [...segment.domain, ...segment.ipcidr, ...segment.ipcidrNoResolve, ...segment.residual];
    const row = {
      id: segment.id,
      policy: segment.policy,
      source_rules: segment.sourceRules.length,
      files: {},
      counts: {
        domain: segment.domain.length,
        ipcidr: segment.ipcidr.length,
        ipcidr_no_resolve: segment.ipcidrNoResolve.length,
        residual: segment.residual.length,
      },
    };

    if (segment.domain.length) {
      const yamlFile = `${segment.id}-domain.yaml`;
      const mrsFile = `${segment.id}-domain.mrs`;
      writeText(path.join(FUSED_MIHOMO_DIR, yamlFile), renderPayload(segment.domain));
      convertWithMihomo(mihomoBin, 'domain', path.join(FUSED_MIHOMO_DIR, yamlFile), path.join(FUSED_MIHOMO_DIR, mrsFile));
      row.files.domain = { behavior: 'domain', format: 'mrs', file: mrsFile, source: yamlFile };
      generatedMrs += 1;
    }
    if (segment.ipcidr.length) {
      const yamlFile = `${segment.id}-ipcidr.yaml`;
      const mrsFile = `${segment.id}-ipcidr.mrs`;
      writeText(path.join(FUSED_MIHOMO_DIR, yamlFile), renderPayload(segment.ipcidr.map(normalizeIpCidrEntry).filter(Boolean)));
      convertWithMihomo(mihomoBin, 'ipcidr', path.join(FUSED_MIHOMO_DIR, yamlFile), path.join(FUSED_MIHOMO_DIR, mrsFile));
      row.files.ipcidr = { behavior: 'ipcidr', format: 'mrs', file: mrsFile, source: yamlFile, no_resolve: false };
      generatedMrs += 1;
    }
    if (segment.ipcidrNoResolve.length) {
      const yamlFile = `${segment.id}-ipcidr-no-resolve.yaml`;
      const mrsFile = `${segment.id}-ipcidr-no-resolve.mrs`;
      writeText(path.join(FUSED_MIHOMO_DIR, yamlFile), renderPayload(segment.ipcidrNoResolve.map(normalizeIpCidrEntry).filter(Boolean)));
      convertWithMihomo(mihomoBin, 'ipcidr', path.join(FUSED_MIHOMO_DIR, yamlFile), path.join(FUSED_MIHOMO_DIR, mrsFile));
      row.files.ipcidr_no_resolve = { behavior: 'ipcidr', format: 'mrs', file: mrsFile, source: yamlFile, no_resolve: true };
      generatedMrs += 1;
    }
    if (segment.residual.length) {
      const residualFile = `${segment.id}-residual.yaml`;
      writeText(path.join(FUSED_MIHOMO_DIR, residualFile), renderPayload(segment.residual));
      row.files.residual = { behavior: 'classical', format: 'yaml', file: residualFile };
    }

    writeText(path.join(FUSED_CLASH_DIR, `${segment.id}.list`), renderClassicalList(allEntries, { includeProcess: false }));
    writeText(path.join(FUSED_SURGE_DIR, `${segment.id}.list`), renderClassicalList(allEntries, { includeProcess: true }));
    writeText(path.join(FUSED_QX_DIR, `${segment.id}.list`), renderQxList(allEntries));
    writeText(path.join(FUSED_EGERN_DIR, `${segment.id}.yaml`), renderEgernYaml(allEntries));
    const singSource = path.join(FUSED_SING_BOX_DIR, `${segment.id}.json`);
    const singBinary = path.join(FUSED_SING_BOX_DIR, `${segment.id}.srs`);
    writeText(singSource, renderSingBoxSource(allEntries));
    if (compileSingBoxRuleSet(singBoxBin, singSource, singBinary)) {
      row.files.sing_box = { format: 'binary', file: `${segment.id}.srs`, source: `${segment.id}.json` };
      generatedSrs += 1;
    } else {
      row.files.sing_box = { format: 'source', file: `${segment.id}.json` };
    }

    row.files.clash = { format: 'text', file: `${segment.id}.list` };
    row.files.surge = { format: 'text', file: `${segment.id}.list` };
    row.files.quantumultx = { format: 'text', file: `${segment.id}.list` };
    row.files.egern = { format: 'yaml', file: `${segment.id}.yaml` };
    manifestSegments.push(row);
  }
  return { manifestSegments, generatedMrs, generatedSrs, singBoxBinary: singBoxBin ? path.basename(singBoxBin) : null };
}

function buildMihomoProvidersAndRules(segments, baseProviders, passthroughProviderIds) {
  const providers = {};
  const rules = [];
  for (const id of REQUIRED_SUPPORT_PROVIDERS) {
    if (baseProviders[id]) providers[id] = baseProviders[id];
  }
  for (const id of passthroughProviderIds || []) {
    if (baseProviders[id]) providers[id] = baseProviders[id];
  }
  for (const segment of segments) {
    if (segment.domain.length) {
      const id = `${segment.id}-domain`;
      providers[id] = {
        type: 'http',
        behavior: 'domain',
        format: 'mrs',
        url: `${FUSED_BASE_URL}/mihomo/${segment.id}-domain.mrs`,
        path: `./ruleset/${segment.id}-domain.mrs`,
        interval: 86400,
        proxy: '🚫 受限网站',
      };
      rules.push(`RULE-SET,${id},${segment.policy}`);
    }
    if (segment.ipcidr.length) {
      const id = `${segment.id}-ipcidr`;
      providers[id] = {
        type: 'http',
        behavior: 'ipcidr',
        format: 'mrs',
        url: `${FUSED_BASE_URL}/mihomo/${segment.id}-ipcidr.mrs`,
        path: `./ruleset/${segment.id}-ipcidr.mrs`,
        interval: 86400,
        proxy: '🚫 受限网站',
      };
      rules.push(`RULE-SET,${id},${segment.policy}`);
    }
    if (segment.ipcidrNoResolve.length) {
      const id = `${segment.id}-ipcidr-no-resolve`;
      providers[id] = {
        type: 'http',
        behavior: 'ipcidr',
        format: 'mrs',
        url: `${FUSED_BASE_URL}/mihomo/${segment.id}-ipcidr-no-resolve.mrs`,
        path: `./ruleset/${segment.id}-ipcidr-no-resolve.mrs`,
        interval: 86400,
        proxy: '🚫 受限网站',
      };
      rules.push(`RULE-SET,${id},${segment.policy},no-resolve`);
    }
    if (segment.residual.length) {
      const id = `${segment.id}-residual`;
      providers[id] = {
        type: 'http',
        behavior: 'classical',
        format: 'yaml',
        url: `${FUSED_BASE_URL}/mihomo/${segment.id}-residual.yaml`,
        path: `./ruleset/${segment.id}-residual.yaml`,
        interval: 86400,
        proxy: '🚫 受限网站',
      };
      rules.push(`RULE-SET,${id},${segment.policy}`);
    }
  }
  return { providers, rules };
}

function mainRuleTarget(rule) {
  const parts = splitTopLevel(rule);
  if (parts[0] === 'MATCH' || parts[0] === 'FINAL') return parts[1];
  return parts[2];
}

function mergeFusedRules(segments, timeline, baseProviders, passthroughProviderIds) {
  const { providers, rules } = buildMihomoProvidersAndRules(segments, baseProviders, passthroughProviderIds);
  const finalRules = [];
  for (const marker of timeline) {
    if (marker.type === 'segment') {
      const segment = marker.segment;
      if (segment.domain.length) finalRules.push(`RULE-SET,${segment.id}-domain,${segment.policy}`);
      if (segment.ipcidr.length) finalRules.push(`RULE-SET,${segment.id}-ipcidr,${segment.policy}`);
      if (segment.ipcidrNoResolve.length) finalRules.push(`RULE-SET,${segment.id}-ipcidr-no-resolve,${segment.policy},no-resolve`);
      if (segment.residual.length) finalRules.push(`RULE-SET,${segment.id}-residual,${segment.policy}`);
    } else {
      finalRules.push(marker.rule);
    }
  }
  return { providers, rules: finalRules };
}

function buildTimeline(segments, inlineRules) {
  const events = [];
  let inlineIndex = 0;
  let segmentIndex = 0;
  const all = [];
  for (const segment of segments) {
    all.push({ first: segment.sourceRules[0], segment });
  }
  const sourceOrder = new Map();
  let ordinal = 0;
  for (const segment of segments) {
    for (const rule of segment.sourceRules) {
      if (!sourceOrder.has(rule)) sourceOrder.set(rule, ordinal);
      ordinal += 1;
    }
  }
  for (const rule of inlineRules) {
    if (!sourceOrder.has(rule)) sourceOrder.set(rule, ordinal);
    ordinal += 1;
  }
  const segmentFirstOrder = new Map(segments.map((segment) => [segment, sourceOrder.get(segment.sourceRules[0])]));
  const inlineEvents = inlineRules.map((rule) => ({ type: 'inline', rule, order: sourceOrder.get(rule) }));
  const segmentEvents = segments.map((segment) => ({ type: 'segment', segment, order: segmentFirstOrder.get(segment) }));
  events.push(...segmentEvents, ...inlineEvents);
  events.sort((a, b) => a.order - b.order);
  return events;
}

function renderJsFusedBlock(providers, rules) {
  return [
    '// BEGIN AUTO-GENERATED MIHOMO FUSED RULE-SETS',
    '// Generated by tools/build-fused-rule-sets.js from Clash Party runtime output.',
    `const MIHOMO_FUSED_RULE_PROVIDERS = ${JSON.stringify(providers)}`,
    `const MIHOMO_FUSED_RULES = ${JSON.stringify(rules)}`,
    '',
    'function applyMihomoFusedRuleSets(config) {',
    "  if (typeof SCKI_DISABLE_FUSED_RULESETS !== 'undefined' && SCKI_DISABLE_FUSED_RULESETS) return",
    "  var providers = config['rule-providers'] || {}",
    '  Object.keys(providers).forEach(function(key) { delete providers[key] })',
    '  Object.keys(MIHOMO_FUSED_RULE_PROVIDERS).forEach(function(key) { providers[key] = MIHOMO_FUSED_RULE_PROVIDERS[key] })',
    "  config['rule-providers'] = providers",
    '  if (Array.isArray(config.rules)) {',
    '    config.rules.splice.apply(config.rules, [0, config.rules.length].concat(MIHOMO_FUSED_RULES))',
    '  } else {',
    '    config.rules = MIHOMO_FUSED_RULES.slice()',
    '  }',
    '}',
    '// END AUTO-GENERATED MIHOMO FUSED RULE-SETS',
    '',
  ].join('\n');
}

function applyJsFusedBlock(relativeFile, providers, rules) {
  const file = path.join(REPO_ROOT, relativeFile);
  let source = readText(file);
  source = source.replace(/\n\/\/ BEGIN AUTO-GENERATED MIHOMO FUSED RULE-SETS[\s\S]*?\/\/ END AUTO-GENERATED MIHOMO FUSED RULE-SETS\n/g, '\n');
  source = source.replace(/\n\s*applyMihomoFusedRuleSets\(config\)\n/g, '\n');
  const block = renderJsFusedBlock(providers, rules);
  if (!source.includes('// BEGIN AUTO-GENERATED MIHOMO MRS OVERRIDES')) throw new Error(`${relativeFile}: missing MRS block anchor`);
  source = source.replace(/\n\/\/ BEGIN AUTO-GENERATED MIHOMO MRS OVERRIDES/, `\n${block}\n// BEGIN AUTO-GENERATED MIHOMO MRS OVERRIDES`);
  const withCall = source.replace(/(\n\s*)(injectRules|overwriteRules)\(config\)/, '$1$2(config)$1applyMihomoFusedRuleSets(config)');
  if (withCall === source) throw new Error(`${relativeFile}: cannot locate rule injection call`);
  source = withCall;
  writeText(file, source);
}

function renderYamlProvider(id, provider) {
  const lines = [
    `  ${id}:`,
    '    type: http',
    `    behavior: ${provider.behavior}`,
  ];
  if (provider.format) lines.push(`    format: ${provider.format}`);
  lines.push(`    url: ${yamlQuote(provider.url)}`);
  lines.push(`    path: ${yamlQuote(provider.path || `./ruleset/${id}.yaml`)}`);
  if (provider.interval) lines.push(`    interval: ${provider.interval}`);
  if (provider.proxy) lines.push(`    proxy: ${yamlQuote(provider.proxy)}`);
  return lines.join('\n');
}

function replaceYamlSections(relativeFile, providers, rules) {
  const file = path.join(REPO_ROOT, relativeFile);
  let source = readText(file).replace(/\r\n/g, '\n');
  const providerStart = source.search(/\nrule-providers:\n/);
  const rulesStart = source.search(/\nrules:\n/);
  if (providerStart === -1 || rulesStart === -1 || rulesStart <= providerStart) throw new Error(`${relativeFile}: cannot locate rule-providers/rules`);
  const beforeProviders = source.slice(0, providerStart + 1);
  const heredocEnd = source.slice(rulesStart + 1).search(/\nOVERRIDE_EOF\b/);
  const sectionEnd = heredocEnd === -1 ? source.length : rulesStart + 1 + heredocEnd;
  const afterSection = source.slice(sectionEnd);
  const providersText = [
    'rule-providers:',
    ...Object.entries(providers).map(([id, provider]) => renderYamlProvider(id, provider)),
  ].join('\n');
  const rulesText = [
    'rules:',
    ...rules.map((rule) => `- ${yamlQuote(rule)}`),
    '',
  ].join('\n');
  source = `${beforeProviders}${providersText}\n${rulesText}${afterSection}`;
  writeText(file, source);
}

function replaceOpenClashYaml(relativeFile, providers, rules) {
  replaceYamlSections(relativeFile, providers, rules);
}

function qxPolicy(policy) {
  if (policy === 'DIRECT') return 'direct';
  if (policy === 'REJECT' || policy === 'REJECT-DROP') return 'reject';
  return policy;
}

function platformRuleSetLine(platform, segment) {
  const policy = segment.policy;
  if (platform === 'shadowrocket') return `RULE-SET,${FUSED_BASE_URL}/clash/${segment.id}.list,${policy}`;
  if (platform === 'surge') return `RULE-SET,${FUSED_BASE_URL}/surge/${segment.id}.list,${policy}`;
  if (platform === 'loon-remote') return `${FUSED_BASE_URL}/clash/${segment.id}.list, policy=${policy}, tag=${segment.id}, enabled=true`;
  if (platform === 'quantumultx') return `${FUSED_BASE_URL}/quantumultx/${segment.id}.list, tag=${segment.id}, force-policy=${qxPolicy(policy)}, update-interval=86400, opt-parser=false, enabled=true`;
  return null;
}

function renderMobileRules(platform, timeline) {
  const lines = [];
  for (const event of timeline) {
    if (event.type === 'segment') {
      const line = platformRuleSetLine(platform, event.segment);
      if (line) lines.push(line);
      continue;
    }
    if (platform === 'loon-remote' || platform === 'quantumultx') continue;
    const rule = event.rule;
    const parts = splitTopLevel(rule);
    if (parts[0] === 'DST-PORT') {
      if (platform === 'surge' || platform === 'loon-local') lines.push(`DEST-PORT,${parts[1]},${parts[2]}`);
      else if (platform === 'shadowrocket') lines.push(rule);
      else if (platform === 'quantumultx-local') lines.push(`dest-port, ${parts[1]}, ${qxPolicy(parts[2])}`);
    } else if (parts[0] === 'MATCH' || parts[0] === 'FINAL') {
      if (platform === 'quantumultx-local') lines.push(`final, ${qxPolicy(parts[1])}`);
      else lines.push(`FINAL,${parts[1]}${platform === 'shadowrocket' ? ',dns-failed' : ''}`);
    }
  }
  return lines;
}

function replaceSection(source, sectionName, replacementLines) {
  const normalized = source.replace(/\r\n/g, '\n');
  const start = normalized.indexOf(`\n[${sectionName}]\n`);
  if (start === -1) throw new Error(`Missing [${sectionName}]`);
  const afterStart = start + `\n[${sectionName}]\n`.length;
  const next = normalized.slice(afterStart).search(/\n\[[^\]]+\]\n/);
  const end = next === -1 ? normalized.length : afterStart + next;
  return `${normalized.slice(0, afterStart)}\n${replacementLines.join('\n')}\n${normalized.slice(end).replace(/^\n+/, '\n')}`;
}

function applyMobileConfigs(timeline) {
  const shadowrocket = path.join(REPO_ROOT, 'Shadowrocket/Shadowrocket.conf');
  let sr = readText(shadowrocket);
  sr = replaceSection(sr, 'Rule', renderMobileRules('shadowrocket', timeline));
  writeText(shadowrocket, sr);

  const surge = path.join(REPO_ROOT, 'Surge/Surge.conf');
  let surgeText = readText(surge);
  surgeText = replaceSection(surgeText, 'Rule', renderMobileRules('surge', timeline));
  writeText(surge, surgeText);

  const loon = path.join(REPO_ROOT, 'Loon/Loon.conf');
  let loonText = readText(loon);
  loonText = replaceSection(loonText, 'Remote Rule', renderMobileRules('loon-remote', timeline));
  loonText = replaceSection(loonText, 'Rule', renderMobileRules('loon-local', timeline));
  writeText(loon, loonText);

  const qx = path.join(REPO_ROOT, 'Quantumult X/QuantumultX.conf');
  let qxText = readText(qx);
  qxText = replaceSection(qxText, 'filter_remote', renderMobileRules('quantumultx', timeline));
  qxText = replaceSection(qxText, 'filter_local', renderMobileRules('quantumultx-local', timeline));
  writeText(qx, qxText);
}

async function main() {
  fs.mkdirSync(CACHE_DIR, { recursive: true });
  const clashOutput = runClashPartyBaseline();
  const { segments, inlineRules, timeline, stats } = await buildSegments(clashOutput);
  const writeStats = await writeFusedRuleSets(segments);
  const fused = mergeFusedRules(segments, timeline, clashOutput.providers, stats.passthroughProviderIds);

  for (const file of [
    'Clash Party/ClashParty(mihomo-smart).js',
    'Clash Party/ClashParty(mihomo).js',
    'FlClash/FlClash(mihomo).js',
  ]) applyJsFusedBlock(file, fused.providers, fused.rules);

  for (const file of [
    'Clash Meta For Android/CMFA(mihomo).yaml',
    'OpenClash/OpenClash(mihomo).sh',
    'OpenClash/OpenClash(mihomo-smart).sh',
  ]) replaceOpenClashYaml(file, fused.providers, fused.rules);

  applyMobileConfigs(timeline);

  const manifest = {
    generated_at: new Date().toISOString(),
    authority: 'Clash Party/ClashParty(mihomo-smart).js runtime output after Mihomo MRS normalization, with SCKI_DISABLE_FUSED_RULESETS=true',
    baseline_version: clashOutput.version,
    source_provider_count: Object.keys(clashOutput.providers).length,
    source_rule_count: clashOutput.rules.length,
    fused_provider_count: Object.keys(fused.providers).length,
    fused_rule_count: fused.rules.length,
    inline_rule_count: inlineRules.length,
    segment_count: segments.length,
    generated_mrs_files: writeStats.generatedMrs,
    generated_srs_files: writeStats.generatedSrs,
    sing_box_binary: writeStats.singBoxBinary,
    unresolved_providers: stats.unresolvedProviders,
    unresolved_sources: stats.unresolvedSources,
    passthrough_providers: [...stats.passthroughProviderIds].sort(),
    required_support_providers: [...REQUIRED_SUPPORT_PROVIDERS],
    segments: writeStats.manifestSegments,
    inline_rules: inlineRules,
  };
  writeText(path.join(FUSED_ROOT, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`);
  console.log(`fused rule sets: source_providers=${manifest.source_provider_count} source_rules=${manifest.source_rule_count} segments=${manifest.segment_count} fused_providers=${manifest.fused_provider_count} fused_rules=${manifest.fused_rule_count} inline=${manifest.inline_rule_count} mrs=${manifest.generated_mrs_files} srs=${manifest.generated_srs_files} unresolved=${manifest.unresolved_providers.length}`);
  if (manifest.unresolved_providers.length || manifest.unresolved_sources.length) {
    console.warn(`fused rule sets warning: passthrough/unresolved items kept=${manifest.unresolved_providers.length + manifest.unresolved_sources.length}`);
  }
}

main().catch((error) => {
  console.error(error.stack || error.message);
  process.exit(1);
});
