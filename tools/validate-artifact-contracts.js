#!/usr/bin/env node
'use strict';

const childProcess = require('node:child_process');
const crypto = require('node:crypto');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const vm = require('node:vm');

const REPO_ROOT = path.resolve(__dirname, '..');
const EXPECTED_GROUPS = 55;
const EXPECTED_BUSINESS_GROUPS = 33;
const EXPECTED_REGION_GROUPS = EXPECTED_GROUPS - EXPECTED_BUSINESS_GROUPS;
const EXPECTED_SINGBOX_GROUPS = 54;
const EXPECTED_SINGBOX_URLTEST_GROUPS = 2;
const EXPECTED_PASSWALL_RULES = 33;
const EXPECTED_REGION_TEST_INTERVAL_SECONDS = 300;
const EXPECTED_SINGBOX_URLTEST_INTERVAL = '5m';
const MIN_FULL_PROVIDERS = 376;
const MIN_FULL_RULES = 900;
const RESTRICTED_SITE = '\u{1F6AB} \u53D7\u9650\u7F51\u7AD9';
const RESTRICTED_SITE_RUBY = '\\U0001F6AB \u53D7\u9650\u7F51\u7AD9';
const CLOUD_CDN = '\u2601\uFE0F \u4E91\u4E0ECDN';
// v5.4.21 #4: DoH-over-IP bootstrap + 1 plaintext fallback
const DNS_BOOTSTRAP_DOH_OVER_IP = ['https://223.5.5.5/dns-query', 'https://223.6.6.6/dns-query', 'https://8.8.8.8/dns-query', 'https://1.1.1.1/dns-query'];
const DNS_BOOTSTRAP_IPS = [...DNS_BOOTSTRAP_DOH_OVER_IP, '223.5.5.5'];
const DNS_BOOTSTRAP_PLAINTEXT = ['223.5.5.5', '119.29.29.29', '1.1.1.1', '8.8.8.8'];
const DNS_DOMESTIC_DOH = ['https://dns.alidns.com/dns-query', 'https://doh.pub/dns-query'];
const DNS_FOREIGN_DOH = ['https://cloudflare-dns.com/dns-query', 'https://dns.google/dns-query'];
const DNS_PROXY_DOH = [...DNS_FOREIGN_DOH, ...DNS_DOMESTIC_DOH];
const STUN_DIRECT_PORTS = [3478, 3479, 5349, 19302, 19305, 19307];
const STUN_FAKE_IP_FILTER_ENTRIES = [
  '+.stun.*.*',
  '+.stun.*.*.*',
  '+.turn.*.*',
  '+.turn.*.*.*',
  'stun.l.google.com',
  'stun1.l.google.com',
  'stun2.l.google.com',
  'stun3.l.google.com',
  'stun4.l.google.com',
  'global.turn.twilio.com',
];
const REQUIRED_FAKE_IP_FILTER_ENTRIES = [
  '+.pub.3gppnetwork.org',
  '+.bing.com',
  '+.miwifi.com',
  '+.courier.push.apple.com',
  '+.miui.com',
  '+.xiaomi.com',
  '+.xiaomi.net',
  '+.mijia.tech',
  '+.gotui.com',
];
const DOUYIN_CNMEDIA_DOMAINS = [
  'douyin.com',
  'douyincdn.com',
  'douyinpic.com',
  'douyinstatic.com',
  'douyinvod.com',
  'idouyinvod.com',
  'iesdouyin.com',
  'iesdouyin.net',
  'amemv.com',
  'zjcdn.com',
];
const AMAP_DOMAINS = [
  'a-map.cn',
  'a-map.co',
  'a-map.link',
  'a-map.vip',
  'acloudrender.com',
  'amap.com',
  'amapauto.com',
  'anav.com',
  'autonavi.com',
  'gaode.com',
];
const PASSWALL_AMAP_REQUIRED = AMAP_DOMAINS.map((domain) => `domain:${domain}`);
const CN_GAME_PRIORITY_DOMAINS = ['mihoyo.com', 'yuanshen.com'];
const PASSWALL_CN_GAME_REQUIRED = [
  'domain:mihoyo.com',
  'domain:miyoushe.com',
  'domain:yuanshen.com',
  'domain:game.163.com',
  'domain:netease.com',
  'domain:wegame.com',
  'domain:wanmei.com',
  'domain:battlenet.com.cn',
];
const SINGBOX_BUSINESS_ORDER = [
  '🤖 AI 服务',
  '💰 加密货币',
  '🏦 金融支付',
  '💬 即时通讯',
  '📱 社交媒体',
  '🧑‍💼 会议协作',
  '📺 国内流媒体',
  '🎵 TikTok',
  '🎥 Netflix',
  '🎬 Disney+',
  '📡 HBO/Max',
  '📺 Hulu',
  '🎬 Prime Video',
  '📹 YouTube',
  '🎵 音乐流媒体',
  '🇭🇰 香港流媒体',
  '🇹🇼 台湾流媒体',
  '🇯🇵 日韩流媒体',
  '🇪🇺 欧洲流媒体',
  '🌐 其他国外流媒体',
  '🕹️ 国内游戏',
  '🎮 国外游戏',
  '🔍 Google 服务',
  '🔧 工具与服务',
  'Ⓜ️ 微软服务',
  '🍎 苹果服务',
  '📥 下载更新',
  '🛰️ BT/PT Tracker',
  '🏠 国内网站',
  '🚫 受限网站',
  '🌐 国外网站',
  '🐟 漏网之鱼',
  '🛑 广告拦截',
];

const ARTIFACT_FILES = [
  'Clash Party/ClashParty(mihomo-smart).js',
  'Clash Party/ClashParty(mihomo).js',
  'FlClash/FlClash(mihomo).js',
  'Clash Meta For Android/CMFA(mihomo).yaml',
  'OpenClash/OpenClash(mihomo).conf',
  'OpenClash/OpenClash(mihomo).sh',
  'OpenClash/OpenClash(mihomo-smart).sh',
  'Shadowrocket/Shadowrocket.conf',
  'Surge/Surge.conf',
  'Loon/Loon.conf',
  'Quantumult X/QuantumultX.conf',
  'SingBox/SingBox(sing-box)-full.json',
  'v2rayN/v2rayN(xray).json',
  'Passwall/Passwall(xray+sing-box)-apply.sh',
  'Passwall/Passwall(xray+sing-box).conf',
  'Passwall2/Passwall2(xray+sing-box)-apply.sh',
  'Passwall2/Passwall2(xray+sing-box).conf',
];

function usage() {
  return [
    'Usage: node tools/validate-artifact-contracts.js [--json] [--verbose]',
    '       [--write-manifest <path>] [--strict-ruby]',
    '',
    'Validates cross-client artifact contracts without changing published files.',
  ].join('\n');
}

function parseArgs(argv) {
  const options = {
    json: false,
    verbose: false,
    strictRuby: false,
    manifestPath: null,
  };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--help' || arg === '-h') {
      console.log(usage());
      process.exit(0);
    }
    if (arg === '--json') {
      options.json = true;
      continue;
    }
    if (arg === '--verbose') {
      options.verbose = true;
      continue;
    }
    if (arg === '--strict-ruby') {
      options.strictRuby = true;
      continue;
    }
    if (arg === '--write-manifest') {
      options.manifestPath = argv[i + 1];
      if (!options.manifestPath) throw new Error('--write-manifest requires a path');
      i += 1;
      continue;
    }
    throw new Error(`Unknown argument: ${arg}\n${usage()}`);
  }
  return options;
}

function relPath(...parts) {
  return path.join(REPO_ROOT, ...parts);
}

function readText(relativePath) {
  return fs.readFileSync(relPath(relativePath), 'utf8');
}

function readJson(relativePath) {
  return JSON.parse(readText(relativePath));
}

function sha256(relativePath) {
  return crypto.createHash('sha256').update(fs.readFileSync(relPath(relativePath))).digest('hex');
}

function countMatches(source, regex) {
  const matches = source.match(regex);
  return matches ? matches.length : 0;
}

function checkNeedleBefore(record, id, source, beforeNeedle, afterNeedle) {
  const beforeIndex = source.indexOf(beforeNeedle);
  const afterIndex = source.indexOf(afterNeedle);
  record.check(`${id}.exists`, beforeIndex !== -1, failureMessage(beforeIndex !== -1, `missing ${beforeNeedle}`));
  record.check(`${id}.guard-order`, beforeIndex !== -1 && afterIndex !== -1 && beforeIndex < afterIndex, {
    message: afterIndex === -1 ? `missing ${afterNeedle}` : `${beforeNeedle} must appear before ${afterNeedle}`,
  });
}

function countLiteral(source, literal) {
  return source.split(literal).length - 1;
}

function extractJsVersion(source) {
  const match = source.match(/const\s+VERSION\s*=\s*['"]([^'"]+)['"]/);
  return match ? match[1] : null;
}

function extractVersionPrefix(version) {
  const match = String(version || '').match(/^(v\d+\.\d+\.\d+)/);
  return match ? match[1] : null;
}

function compileJs(relativePath) {
  const source = readText(relativePath);
  new vm.Script(source, { filename: relativePath });
  return source;
}

function extractYamlBlock(source, key) {
  const lines = source.split(/\r?\n/);
  const output = [];
  let inBlock = false;
  for (const line of lines) {
    if (line === `${key}:`) {
      inBlock = true;
      continue;
    }
    if (inBlock && /^[A-Za-z0-9_.-]+:/.test(line)) break;
    if (inBlock) output.push(line);
  }
  return output.join('\n');
}

function extractOpenClashOverride(relativePath) {
  const source = readText(relativePath);
  const output = [];
  let inBlock = false;
  for (const line of source.split(/\r?\n/)) {
    if (/^cat (?:>|>>) "\$OVERRIDE_YAML" << '?OVERRIDE_EOF'?/.test(line)) {
      inBlock = true;
      continue;
    }
    if (line === 'OVERRIDE_EOF') {
      inBlock = false;
      continue;
    }
    if (inBlock) output.push(line);
  }
  return `${output.join('\n')}\n`;
}

function extractIndentedListBlock(source, key) {
  const lines = source.split(/\r?\n/);
  const output = [];
  let inBlock = false;
  const keyPattern = new RegExp(`^\\s*${key}:\\s*$`);
  for (const line of lines) {
    if (keyPattern.test(line)) {
      inBlock = true;
      continue;
    }
    if (inBlock && /^\s*[A-Za-z0-9_.-]+:/.test(line)) break;
    if (inBlock) output.push(line.trim());
  }
  return output.join('\n');
}

function extractYamlListItems(source, key) {
  return extractIndentedListBlock(source, key)
    .split(/\r?\n/)
    .map((line) => {
      const match = line.trim().match(/^-\s+(.+?)\s*$/);
      return match ? match[1].replace(/^['"]|['"]$/g, '') : null;
    })
    .filter(Boolean);
}

function extractConfSection(source, sectionName) {
  const lines = source.split(/\r?\n/);
  const output = [];
  let inSection = false;
  for (const line of lines) {
    if (line.trim() === `[${sectionName}]`) {
      inSection = true;
      continue;
    }
    if (inSection && /^\s*\[[^\]]+\]\s*$/.test(line)) break;
    if (inSection) output.push(line);
  }
  return output.join('\n');
}

function checkExactList(record, id, actual, expected) {
  const ok = JSON.stringify(actual) === JSON.stringify(expected);
  record.check(id, ok, failureMessage(ok, `expected ${JSON.stringify(expected)} got ${JSON.stringify(actual)}`));
}

function listFiles(relativeDir) {
  return fs.readdirSync(relPath(relativeDir), { withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) => path.join(relativeDir, entry.name).replace(/\\/g, '/'))
    .sort();
}

function meaningfulRuleLines(relativePath) {
  return readText(relativePath)
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith('#'));
}

function findRuby() {
  const candidates = [];
  if (process.env.RUBY) candidates.push(process.env.RUBY);
  candidates.push('ruby');
  if (process.platform === 'win32') {
    candidates.push('C:\\Ruby33-x64\\bin\\ruby.exe');
    candidates.push('C:\\Ruby34-x64\\bin\\ruby.exe');
    candidates.push('C:\\Ruby32-x64\\bin\\ruby.exe');
  }
  for (const candidate of candidates) {
    try {
      const result = childProcess.spawnSync(candidate, ['-v'], { encoding: 'utf8' });
      if (result.status === 0) return candidate;
    } catch {
      // Try the next candidate.
    }
  }
  return null;
}

function rubyOpenClashProbe(yamlText, rubyPath) {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'scki-openclash-'));
  const yamlPath = path.join(tempDir, 'override.yaml');
  fs.writeFileSync(yamlPath, yamlText, 'utf8');
  const rubyScript = [
    'require "yaml"',
    'require "json"',
    'path = ARGV.fetch(0)',
    'raw = File.read(path, encoding: "UTF-8")',
    'data = YAML.load_file(path, permitted_classes: [Symbol], aliases: true)',
    'puts JSON.generate({',
    '  top_providers: raw.scan(/^rule-providers:$/).length,',
    '  top_rules: raw.scan(/^rules:$/).length,',
    '  providers: (data["rule-providers"] || {}).size,',
    '  rules: (data["rules"] || []).size,',
    '  groups: (data["proxy-groups"] || []).size',
    '})',
  ].join('\n');
  const result = childProcess.spawnSync(rubyPath, ['-e', rubyScript, yamlPath], { encoding: 'utf8' });
  fs.rmSync(tempDir, { recursive: true, force: true });
  if (result.status !== 0) {
    throw new Error((result.stderr || result.stdout || 'Ruby YAML probe failed').trim());
  }
  return JSON.parse(result.stdout);
}

function rubyYamlFileProbe(relativePath, rubyPath) {
  const rubyScript = [
    'require "yaml"',
    'require "json"',
    'path = ARGV.fetch(0)',
    'raw = File.read(path, encoding: "UTF-8")',
    'data = YAML.load_file(path, permitted_classes: [Symbol], aliases: true)',
    'puts JSON.generate({',
    '  top_providers: raw.scan(/^rule-providers:$/).length,',
    '  top_rules: raw.scan(/^rules:$/).length,',
    '  providers: (data["rule-providers"] || {}).size,',
    '  rules: (data["rules"] || []).size,',
    '  groups: (data["proxy-groups"] || []).size',
    '})',
  ].join('\n');
  const result = childProcess.spawnSync(rubyPath, ['-e', rubyScript, relPath(relativePath)], { encoding: 'utf8' });
  if (result.status !== 0) {
    throw new Error((result.stderr || result.stdout || 'Ruby YAML file probe failed').trim());
  }
  return JSON.parse(result.stdout);
}

function makeRecorder() {
  const checks = [];
  const failures = [];
  const warnings = [];
  return {
    checks,
    failures,
    warnings,
    check(id, condition, details = {}) {
      checks.push({ id, ok: Boolean(condition), ...details });
      if (!condition) failures.push(`${id}${details.message ? `: ${details.message}` : ''}`);
    },
    warn(id, message) {
      warnings.push(`${id}: ${message}`);
    },
  };
}

function failureMessage(condition, message) {
  return condition ? {} : { message };
}

function validateJsProducts(record) {
  const smart = compileJs('Clash Party/ClashParty(mihomo-smart).js');
  const normal = compileJs('Clash Party/ClashParty(mihomo).js');
  const flclash = compileJs('FlClash/FlClash(mihomo).js');
  const baselineVersion = extractJsVersion(smart);
  const baselinePrefix = extractVersionPrefix(baselineVersion);
  const normalVersion = extractJsVersion(normal);
  const flclashVersion = extractJsVersion(flclash);

  record.check('js.smart.version', /^v\d+\.\d+\.\d+$/.test(String(baselineVersion)), { value: baselineVersion, message: `got ${baselineVersion}` });
  record.check('js.normal.version-prefix', Boolean(baselinePrefix && normalVersion && normalVersion.startsWith(`${baselinePrefix}-normal`)), { value: normalVersion });
  record.check('js.flclash.version-prefix', Boolean(baselinePrefix && flclashVersion && flclashVersion.startsWith(`${baselinePrefix}-flclash`)), { value: flclashVersion });
  record.check('js.smart.region-interval-300', smart.includes(`interval: ${EXPECTED_REGION_TEST_INTERVAL_SECONDS}, tolerance: 30`), {
    message: 'Smart region groups must use 300s health-test interval',
  });
  record.check('js.normal.region-interval-300', normal.includes(`interval: ${EXPECTED_REGION_TEST_INTERVAL_SECONDS}, tolerance: 10`), {
    message: 'Normal region url-test groups must use 300s interval',
  });
  record.check('js.flclash.region-interval-300', flclash.includes(`interval: ${EXPECTED_REGION_TEST_INTERVAL_SECONDS}, tolerance: 10`), {
    message: 'FlClash region url-test groups must use 300s interval',
  });
  record.check('js.no-legacy-fast-region-interval', !/interval:\s*(120|180),\s*tolerance:/.test(`${smart}\n${normal}\n${flclash}`), {
    message: 'JS region interval must not regress to 120s/180s',
  });
  return { baselineVersion, baselinePrefix };
}

function validateClashYaml(record, baselineVersion, options) {
  const file = 'Clash Meta For Android/CMFA(mihomo).yaml';
  const source = readText(file);
  const providersBlock = extractYamlBlock(source, 'rule-providers');
  const rulesBlock = extractYamlBlock(source, 'rules');
  const groupCount = countMatches(source, /^- name: |^  name: /gm);
  const providerCount = countMatches(providersBlock, /^  [^ #][^:]+:\s*$/gm);
  const ruleCount = countMatches(rulesBlock, /^- /gm);

  record.check('cmfa.group-count', groupCount === EXPECTED_GROUPS, { value: groupCount });
  record.check('cmfa.provider-count', providerCount >= MIN_FULL_PROVIDERS, { value: providerCount });
  record.check('cmfa.rule-count', ruleCount >= MIN_FULL_RULES, { value: ruleCount });
  const hasBaselineHeader = source.includes(`Clash Party ${baselineVersion}`);
  record.check('cmfa.baseline-header', hasBaselineHeader, failureMessage(hasBaselineHeader, `missing Clash Party ${baselineVersion}`));
  record.check('cmfa.rule-provider-singleton', countMatches(source, /^rule-providers:$/gm) === 1, { value: countMatches(source, /^rule-providers:$/gm) });
  record.check('cmfa.rules-singleton', countMatches(source, /^rules:$/gm) === 1, { value: countMatches(source, /^rules:$/gm) });
  const cmfaInterval300Count = countMatches(source, /^\s+interval:\s*300\s*$/gm);
  const cmfaLegacyRegionIntervals = (source.match(/^\s+interval:\s*(120|180)\s*$/gm) || []).length;
  record.check('cmfa.region-test-interval-300', cmfaInterval300Count >= EXPECTED_REGION_GROUPS + 1, {
    value: cmfaInterval300Count,
    message: 'CMFA region url-test groups plus provider health-check must use 300s',
  });
  record.check('cmfa.no-legacy-fast-region-interval', cmfaLegacyRegionIntervals === 0, {
    value: cmfaLegacyRegionIntervals,
    message: 'CMFA must not use 120s/180s region test intervals',
  });
  const rubyPath = findRuby();
  if (!rubyPath) {
    const message = 'Ruby not found; exact CMFA YAML parsing skipped';
    if (options.strictRuby) record.check('cmfa.ruby-available', false, { message });
    else record.warn('cmfa.ruby-available', message);
  } else {
    try {
      const parsed = rubyYamlFileProbe(file, rubyPath);
      record.check('cmfa.ruby-top-provider-singleton', parsed.top_providers === 1, { value: parsed.top_providers });
      record.check('cmfa.ruby-top-rules-singleton', parsed.top_rules === 1, { value: parsed.top_rules });
      record.check('cmfa.ruby-group-count', parsed.groups === EXPECTED_GROUPS, { value: parsed.groups });
      record.check('cmfa.ruby-provider-count', parsed.providers >= MIN_FULL_PROVIDERS, { value: parsed.providers });
      record.check('cmfa.ruby-rule-count', parsed.rules >= MIN_FULL_RULES, { value: parsed.rules });
    } catch (error) {
      record.check('cmfa.ruby-parse', false, { message: error.message });
    }
  }
  record.check('cmfa.no-direct-provider-downloads', !/proxy:\s*['"]?DIRECT['"]?/.test(source));
  record.check('cmfa.no-cloud-cdn-provider-downloads', !source.includes(CLOUD_CDN));
  record.check('cmfa.restricted-provider-downloads', countLiteral(source, RESTRICTED_SITE) >= MIN_FULL_PROVIDERS, {
    value: countLiteral(source, RESTRICTED_SITE),
  });
  record.check('cmfa.amap-provider', /amap:\n\s+type:\s+http/.test(providersBlock));
  checkNeedleBefore(record, 'cmfa.amap-after-ads', rulesBlock, "'RULE-SET,anti-ad,🛑 广告拦截'", "'RULE-SET,amap,🏠 国内网站'");
  checkNeedleBefore(record, 'cmfa.amap-before-foreign-tail', rulesBlock, "'RULE-SET,amap,🏠 国内网站'", "'RULE-SET,proxy,🌐 国外网站'");
  record.check('cmfa.scholar-target-google', source.includes("'RULE-SET,scholar,🔍 Google 服务'"));
  record.check('cmfa.scholar-not-tools', !source.includes("'RULE-SET,scholar,🔧 工具与服务'"));
  const fakeIpFilterBlock = extractIndentedListBlock(source, 'fake-ip-filter');
  record.check('cmfa.fake-ip-filter-blacklist-mode', /fake-ip-filter-mode:\s*blacklist/.test(source));
  const hasNoFakeIpRuleSetRefs = !/RULE-SET,/.test(fakeIpFilterBlock);
  record.check(
    'cmfa.fake-ip-filter-no-ruleset-references',
    hasNoFakeIpRuleSetRefs,
    failureMessage(hasNoFakeIpRuleSetRefs, 'fake-ip blacklist mode must not contain rule-mode RULE-SET entries'),
  );
  for (const entry of STUN_FAKE_IP_FILTER_ENTRIES) {
    const hasEntry = fakeIpFilterBlock.includes(entry);
    record.check(`cmfa.fake-ip-filter.${entry}`, hasEntry, failureMessage(hasEntry, `missing ${entry}`));
  }
  for (const entry of REQUIRED_FAKE_IP_FILTER_ENTRIES) {
    const hasEntry = fakeIpFilterBlock.includes(entry);
    record.check(`cmfa.fake-ip-filter.${entry}`, hasEntry, failureMessage(hasEntry, `missing ${entry}`));
  }
  for (const entry of ['+.msftconnecttest.com', '+.msftncsi.com', '+.in-addr.arpa', '+.ip6.arpa']) {
    const hasEntry = fakeIpFilterBlock.includes(entry);
    record.check(`cmfa.fake-ip-filter.${entry}`, hasEntry, failureMessage(hasEntry, `missing ${entry}`));
  }
  record.check('cmfa.dns.prefer-h3-disabled-with-respect-rules', /prefer-h3:\s*false/.test(source));
  record.check('cmfa.dns.respect-rules-enabled', /respect-rules:\s*true/.test(source));
  record.check('cmfa.dns.cache-arc', /cache-algorithm:\s*arc/.test(source));
  // v5.4.22 review (FIX#HOSTS-DEDUP 防复发)：dns 块标量键不得重复（YAML last-wins 静默覆盖）
  for (const dnsKey of ['use-hosts', 'use-system-hosts', 'enhanced-mode', 'prefer-h3', 'respect-rules']) {
    const dupN = countMatches(source, new RegExp(`^\\s+${dnsKey}:`, 'gm'));
    if (dupN >= 1) record.check(`cmfa.dns.singleton.${dnsKey}`, dupN === 1, { value: dupN, message: `dns 块标量键 ${dnsKey} 出现 ${dupN} 次（重复键 → YAML last-wins 静默覆盖）` });
  }
  record.check('cmfa.dns.githubusercontent-policy', /['"]?\+\.githubusercontent\.com['"]?:/.test(source));
  record.check('cmfa.dns.fallback-geosite-gfw', /fallback-filter:[^]*?geosite:[^]*?-\s*gfw/.test(source));
  record.check('cmfa.dns.fallback-geosite-not-cn', /fallback-filter:[^]*?geosite:[^]*?-\s*geolocation-!cn/.test(source));
  checkExactList(record, 'cmfa.dns.default-nameserver-exact', extractYamlListItems(source, 'default-nameserver'), DNS_BOOTSTRAP_IPS);
  checkExactList(record, 'cmfa.dns.nameserver-exact', extractYamlListItems(source, 'nameserver'), DNS_DOMESTIC_DOH);
  checkExactList(record, 'cmfa.dns.direct-nameserver-exact', extractYamlListItems(source, 'direct-nameserver'), DNS_DOMESTIC_DOH);
  checkExactList(record, 'cmfa.dns.proxy-server-nameserver-exact', extractYamlListItems(source, 'proxy-server-nameserver'), DNS_PROXY_DOH);
  checkExactList(record, 'cmfa.dns.fallback-exact', extractYamlListItems(source, 'fallback'), DNS_FOREIGN_DOH);
  for (const port of STUN_DIRECT_PORTS) {
    const hasPortRule = source.includes(`DST-PORT,${port},DIRECT`);
    record.check(`cmfa.stun-port.${port}`, hasPortRule, failureMessage(hasPortRule, `missing DST-PORT,${port},DIRECT`));
  }
  checkNeedleBefore(
    record,
    'cmfa.cloudflarestorage-before-ads',
    source,
    "'DOMAIN-SUFFIX,cloudflarestorage.com,🌐 国外网站'",
    "'RULE-SET,anti-ad,🛑 广告拦截'",
  );
  for (const domain of ['douyin.com', 'zjcdn.com']) {
    checkNeedleBefore(
      record,
      `cmfa.douyin-guard.${domain}.before-tiktok`,
      source,
      `'DOMAIN-SUFFIX,${domain},📺 国内流媒体'`,
      "'RULE-SET,tiktok,🎵 TikTok'",
    );
    checkNeedleBefore(
      record,
      `cmfa.douyin-guard.${domain}.before-foreign-tail`,
      source,
      `'DOMAIN-SUFFIX,${domain},📺 国内流媒体'`,
      "'RULE-SET,proxy,🌐 国外网站'",
    );
  }
  for (const domain of CN_GAME_PRIORITY_DOMAINS) {
    const guard = `'DOMAIN-SUFFIX,${domain},🕹️ 国内游戏'`;
    checkNeedleBefore(record, `cmfa.cn-game.${domain}.before-hoyoverse`, rulesBlock, guard, "'RULE-SET,hoyoverse,🎮 国外游戏'");
    checkNeedleBefore(record, `cmfa.cn-game.${domain}.before-category-games`, rulesBlock, guard, "'GEOSITE,category-games,🎮 国外游戏'");
  }
}

function validateOpenClash(record, baselineVersion, options) {
  const conf = readText('OpenClash/OpenClash(mihomo).conf');
  if (!conf.includes(baselineVersion)) {
    record.warn('openclash.conf.baseline', `OpenClash(mihomo).conf does not advertise ${baselineVersion}; primary .sh artifacts remain authoritative`);
  }

  const rubyPath = findRuby();
  if (!rubyPath) {
    const message = 'Ruby not found; exact OpenClash heredoc YAML parsing skipped';
    if (options.strictRuby) record.check('openclash.ruby-available', false, { message });
    else record.warn('openclash.ruby-available', message);
  } else if (options.verbose && !options.json) {
    console.log(`Ruby probe: ${rubyPath}`);
  }

  for (const spec of [
    { id: 'normal', file: 'OpenClash/OpenClash(mihomo).sh', suffix: 'oc-normal', minProviders: 130, minRules: MIN_FULL_RULES },
    { id: 'smart', file: 'OpenClash/OpenClash(mihomo-smart).sh', suffix: 'oc-smart', minProviders: MIN_FULL_PROVIDERS, minRules: MIN_FULL_RULES },
  ]) {
    const source = readText(spec.file);
    const yaml = extractOpenClashOverride(spec.file);
    const rulesOnly = extractYamlBlock(yaml, 'rules');
    const staticBizGroups = countMatches(source, /^- name: /gm);
    const topProviders = countMatches(yaml, /^rule-providers:$/gm);
    const topRules = countMatches(yaml, /^rules:$/gm);
    const restrictedCount = countLiteral(source, RESTRICTED_SITE_RUBY);

    record.check(`openclash.${spec.id}.static-business-groups`, staticBizGroups === EXPECTED_BUSINESS_GROUPS, { value: staticBizGroups });
    const hasBaselineHeader = source.includes(`Clash Party ${baselineVersion}`);
    record.check(`openclash.${spec.id}.baseline-header`, hasBaselineHeader, failureMessage(hasBaselineHeader, `missing Clash Party ${baselineVersion}`));
    const versionPrefixPattern = `${baselineVersion}-${spec.suffix}.`;
    const hasShellVersionPrefix = source.includes(`VERSION_TAG="${versionPrefixPattern}`);
    const hasRubyVersionPrefix = source.includes(`VERSION = "${versionPrefixPattern}`);
    record.check(`openclash.${spec.id}.shell-version-prefix`, hasShellVersionPrefix, failureMessage(hasShellVersionPrefix, `missing VERSION_TAG ${versionPrefixPattern}*`));
    record.check(`openclash.${spec.id}.ruby-version-prefix`, hasRubyVersionPrefix, failureMessage(hasRubyVersionPrefix, `missing Ruby VERSION ${versionPrefixPattern}*`));
    record.check(`openclash.${spec.id}.region-test-interval-300`, source.includes(`"interval"           => ${EXPECTED_REGION_TEST_INTERVAL_SECONDS}`), {
      message: 'OpenClash generated region groups must use 300s interval',
    });
    record.check(`openclash.${spec.id}.no-legacy-fast-region-interval`, !/"interval"\s*=>\s*(120|180)\b/.test(source), {
      message: 'OpenClash interval must not regress to 120s/180s',
    });
    record.check(`openclash.${spec.id}.rule-provider-singleton`, topProviders === 1, { value: topProviders });
    record.check(`openclash.${spec.id}.rules-singleton`, topRules === 1, { value: topRules });
    record.check(`openclash.${spec.id}.no-direct-provider-downloads`, !/proxy:\s*['"]?DIRECT['"]?/.test(source));
    record.check(`openclash.${spec.id}.restricted-provider-downloads`, restrictedCount >= spec.minProviders, { value: restrictedCount });
    record.check(`openclash.${spec.id}.amap-provider`, /amap:\n\s+type:\s+http/.test(yaml));
    checkNeedleBefore(record, `openclash.${spec.id}.amap-after-ads`, rulesOnly, 'RULE-SET,anti-ad', 'RULE-SET,amap');
    checkNeedleBefore(record, `openclash.${spec.id}.amap-before-foreign-tail`, rulesOnly, 'RULE-SET,amap', 'RULE-SET,proxy');
    record.check(`openclash.${spec.id}.scholar-target-google`, source.includes('RULE-SET,scholar,\\U0001F50D Google 服务'));
    record.check(`openclash.${spec.id}.scholar-not-tools`, !source.includes('RULE-SET,scholar,\\U0001F527 工具与服务'));
    for (const entry of STUN_FAKE_IP_FILTER_ENTRIES) {
      const hasEntry = yaml.includes(entry);
      record.check(`openclash.${spec.id}.fake-ip-filter.${entry}`, hasEntry, failureMessage(hasEntry, `missing ${entry}`));
    }
    for (const entry of REQUIRED_FAKE_IP_FILTER_ENTRIES) {
      const hasEntry = yaml.includes(entry);
      record.check(`openclash.${spec.id}.fake-ip-filter.${entry}`, hasEntry, failureMessage(hasEntry, `missing ${entry}`));
    }
    for (const entry of ['+.msftconnecttest.com', '+.msftncsi.com', '+.in-addr.arpa', '+.ip6.arpa']) {
      const hasEntry = yaml.includes(entry);
      record.check(`openclash.${spec.id}.fake-ip-filter.${entry}`, hasEntry, failureMessage(hasEntry, `missing ${entry}`));
    }
    record.check(`openclash.${spec.id}.dns.prefer-h3-disabled-with-respect-rules`, /prefer-h3:\s*false/.test(yaml));
    record.check(`openclash.${spec.id}.dns.respect-rules-enabled`, /respect-rules:\s*true/.test(yaml));
    record.check(`openclash.${spec.id}.dns.cache-arc`, /cache-algorithm:\s*arc/.test(yaml));
    // v5.4.22 review (FIX#HOSTS-DEDUP 防复发)：dns 块标量键不得重复——YAML last-wins 会静默覆盖前者，
    //   #159(#4) 曾用重复 `use-hosts: false` 回退 #156 的 `use-hosts: true`，validator 此前未覆盖嵌套层重复键。
    for (const dnsKey of ['use-hosts', 'use-system-hosts', 'enhanced-mode', 'prefer-h3', 'respect-rules']) {
      const dupN = countMatches(source, new RegExp(`^\\s+${dnsKey}:`, 'gm'));
      if (dupN >= 1) record.check(`openclash.${spec.id}.dns.singleton.${dnsKey}`, dupN === 1, { value: dupN, message: `dns 块标量键 ${dnsKey} 出现 ${dupN} 次（重复键 → YAML last-wins 静默覆盖；见 FIX#HOSTS-DEDUP）` });
    }
    record.check(`openclash.${spec.id}.dns.githubusercontent-policy`, /['"]?\+\.githubusercontent\.com['"]?:/.test(yaml));
    record.check(`openclash.${spec.id}.dns.fallback-geosite-gfw`, /fallback-filter:[^]*?geosite:[^]*?-\s*gfw/.test(yaml));
    record.check(`openclash.${spec.id}.dns.fallback-geosite-not-cn`, /fallback-filter:[^]*?geosite:[^]*?-\s*geolocation-!cn/.test(yaml));
    checkExactList(record, `openclash.${spec.id}.dns.default-nameserver-exact`, extractYamlListItems(yaml, 'default-nameserver'), DNS_BOOTSTRAP_IPS);
    checkExactList(record, `openclash.${spec.id}.dns.nameserver-exact`, extractYamlListItems(yaml, 'nameserver'), DNS_DOMESTIC_DOH);
    checkExactList(record, `openclash.${spec.id}.dns.direct-nameserver-exact`, extractYamlListItems(yaml, 'direct-nameserver'), DNS_DOMESTIC_DOH);
    checkExactList(record, `openclash.${spec.id}.dns.proxy-server-nameserver-exact`, extractYamlListItems(yaml, 'proxy-server-nameserver'), DNS_PROXY_DOH);
    checkExactList(record, `openclash.${spec.id}.dns.fallback-exact`, extractYamlListItems(yaml, 'fallback'), DNS_FOREIGN_DOH);
    for (const port of STUN_DIRECT_PORTS) {
      const hasPortRule = yaml.includes(`DST-PORT,${port},DIRECT`);
      record.check(`openclash.${spec.id}.stun-port.${port}`, hasPortRule, failureMessage(hasPortRule, `missing DST-PORT,${port},DIRECT`));
    }
    checkNeedleBefore(
      record,
      `openclash.${spec.id}.cloudflarestorage-before-ads`,
      source,
      'DOMAIN-SUFFIX,cloudflarestorage.com,🌐 国外网站',
      'RULE-SET,anti-ad,\\U0001F6D1 广告拦截',
    );
    for (const domain of ['douyin.com', 'zjcdn.com']) {
      checkNeedleBefore(
        record,
        `openclash.${spec.id}.douyin-guard.${domain}.before-tiktok`,
        source,
        `DOMAIN-SUFFIX,${domain},\\U0001F4FA 国内流媒体`,
        'RULE-SET,tiktok,\\U0001F3B5 TikTok',
      );
      checkNeedleBefore(
        record,
        `openclash.${spec.id}.douyin-guard.${domain}.before-foreign-tail`,
        source,
        `DOMAIN-SUFFIX,${domain},\\U0001F4FA 国内流媒体`,
        'RULE-SET,proxy,\\U0001F310 国外网站',
      );
    }
    for (const domain of CN_GAME_PRIORITY_DOMAINS) {
      checkNeedleBefore(
        record,
        `openclash.${spec.id}.cn-game.${domain}.before-hoyoverse`,
        rulesOnly,
        `DOMAIN-SUFFIX,${domain}`,
        'RULE-SET,hoyoverse',
      );
      checkNeedleBefore(
        record,
        `openclash.${spec.id}.cn-game.${domain}.before-category-games`,
        rulesOnly,
        `DOMAIN-SUFFIX,${domain}`,
        'GEOSITE,category-games',
      );
    }

    if (rubyPath) {
      try {
        const parsed = rubyOpenClashProbe(yaml, rubyPath);
        record.check(`openclash.${spec.id}.ruby-top-provider-singleton`, parsed.top_providers === 1, { value: parsed.top_providers });
        record.check(`openclash.${spec.id}.ruby-top-rules-singleton`, parsed.top_rules === 1, { value: parsed.top_rules });
        record.check(`openclash.${spec.id}.ruby-provider-count`, parsed.providers >= spec.minProviders, { value: parsed.providers });
        record.check(`openclash.${spec.id}.ruby-rule-count`, parsed.rules >= spec.minRules, { value: parsed.rules });
        record.check(`openclash.${spec.id}.ruby-business-group-count`, parsed.groups === EXPECTED_BUSINESS_GROUPS, { value: parsed.groups });
      } catch (error) {
        record.check(`openclash.${spec.id}.ruby-parse`, false, { message: error.message });
      }
    }
  }
}

function validateConfProducts(record, baselineVersion) {
  const specs = [
    { id: 'shadowrocket', file: 'Shadowrocket/Shadowrocket.conf', regex: / = select,|= url-test,/g },
    { id: 'surge', file: 'Surge/Surge.conf', regex: / = select,|= url-test,/g },
    { id: 'loon', file: 'Loon/Loon.conf', regex: / = select,|= url-test,/g },
    { id: 'qx', file: 'Quantumult X/QuantumultX.conf', regex: /^(url-latency-benchmark|static)=/gm },
  ];
  for (const spec of specs) {
    const source = readText(spec.file);
    const groupCount = countMatches(source, spec.regex);
    record.check(`${spec.id}.group-count`, groupCount === EXPECTED_GROUPS, { value: groupCount });
    const hasBaselineHeader = source.includes(`Clash Party ${baselineVersion}`);
    record.check(`${spec.id}.baseline-header`, hasBaselineHeader, failureMessage(hasBaselineHeader, `missing Clash Party ${baselineVersion}`));
    record.check(`${spec.id}.changelog-reference`, source.includes('CHANGELOG.md'));
    const intervalToken = spec.id === 'qx' ? 'check-interval=300' : 'interval=300';
    const legacyIntervalPattern = spec.id === 'qx' ? /check-interval=(120|180)\b/ : /interval=(120|180)\b/;
    const intervalCount = countLiteral(source, intervalToken);
    record.check(`${spec.id}.region-test-interval-300`, intervalCount === EXPECTED_REGION_GROUPS, {
      value: intervalCount,
      message: `${spec.id} must emit ${EXPECTED_REGION_GROUPS} region test intervals at 300s`,
    });
    record.check(`${spec.id}.no-legacy-fast-region-interval`, !legacyIntervalPattern.test(source), {
      message: `${spec.id} must not regress to 120s/180s interval`,
    });
  }

  const shadowrocket = readText('Shadowrocket/Shadowrocket.conf');
  const surge = readText('Surge/Surge.conf');
  const loon = readText('Loon/Loon.conf');
  const qx = readText('Quantumult X/QuantumultX.conf');
  const loonRemoteRule = extractConfSection(loon, 'Remote Rule');
  const loonRuleSection = extractConfSection(loon, 'Rule');
  record.check('shadowrocket.scholar-target-google', shadowrocket.includes('Shadowrocket/Scholar/Scholar.list,🔍 Google 服务'));
  record.check('shadowrocket.scholar-not-tools', !shadowrocket.includes('Shadowrocket/Scholar/Scholar.list,🔧 工具与服务'));
  record.check('surge.scholar-target-google', surge.includes('Surge/Scholar/Scholar.list,🔍 Google 服务'));
  record.check('surge.scholar-not-tools', !surge.includes('Surge/Scholar/Scholar.list,🔧 工具与服务'));
  record.check('loon.scholar-target-google', loon.includes('Loon/Scholar/Scholar.list, policy=🔍 Google 服务'));
  record.check('loon.scholar-not-tools', !loon.includes('Loon/Scholar/Scholar.list, policy=🔧 工具与服务'));
  record.check('qx.scholar-target-google', qx.includes('QuantumultX/Scholar/Scholar.list, tag=scholar, force-policy=🔍 Google 服务'));
  record.check('qx.scholar-not-tools', !qx.includes('QuantumultX/Scholar/Scholar.list, tag=scholar, force-policy=🔧 工具与服务'));
  const confGuardSpecs = [
    { id: 'shadowrocket', source: shadowrocket, guard: 'DOMAIN-SUFFIX,zjcdn.com,📺 国内流媒体', tiktok: 'Shadowrocket/TikTok/TikTok.list,🎵 TikTok', foreign: 'Shadowrocket/CNN/CNN.list,🌐 国外网站' },
    { id: 'surge', source: surge, guard: 'DOMAIN-SUFFIX,zjcdn.com,📺 国内流媒体', tiktok: 'Surge/TikTok/TikTok.list,🎵 TikTok', foreign: 'Surge/CNN/CNN.list,🌐 国外网站' },
  ];
  for (const spec of confGuardSpecs) {
    checkNeedleBefore(record, `${spec.id}.douyin-zjcdn-before-tiktok`, spec.source, spec.guard, spec.tiktok);
    checkNeedleBefore(record, `${spec.id}.douyin-zjcdn-before-foreign-tail`, spec.source, spec.guard, spec.foreign);
  }
  checkNeedleBefore(
    record,
    'shadowrocket.amap-after-ads',
    shadowrocket,
    'Shadowrocket/YouMengChuangXiang/YouMengChuangXiang.list,🛑 广告拦截',
    'Shadowrocket/GaoDe/GaoDe.list,🏠 国内网站',
  );
  checkNeedleBefore(
    record,
    'shadowrocket.amap-before-foreign-tail',
    shadowrocket,
    'Shadowrocket/GaoDe/GaoDe.list,🏠 国内网站',
    'Shadowrocket/CNN/CNN.list,🌐 国外网站',
  );
  checkNeedleBefore(
    record,
    'surge.amap-after-ads',
    surge,
    'Surge/YouMengChuangXiang/YouMengChuangXiang.list,🛑 广告拦截',
    'Surge/GaoDe/GaoDe.list,🏠 国内网站',
  );
  checkNeedleBefore(
    record,
    'surge.amap-before-foreign-tail',
    surge,
    'Surge/GaoDe/GaoDe.list,🏠 国内网站',
    'Surge/CNN/CNN.list,🌐 国外网站',
  );
  checkNeedleBefore(
    record,
    'loon.amap-after-ads',
    loonRemoteRule,
    'Loon/YouMengChuangXiang/YouMengChuangXiang.list, policy=🛑 广告拦截',
    'Loon/GaoDe/GaoDe.list, policy=🏠 国内网站',
  );
  checkNeedleBefore(
    record,
    'loon.amap-before-foreign-tail',
    loonRemoteRule,
    'Loon/GaoDe/GaoDe.list, policy=🏠 国内网站',
    'Loon/CNN/CNN.list, policy=🌐 国外网站',
  );
  for (const spec of [
    {
      id: 'shadowrocket',
      source: shadowrocket,
      game: 'Shadowrocket/Game/Game.list,🎮 国外游戏',
      hoyoverse: 'Shadowrocket/HoYoverse/HoYoverse.list,🎮 国外游戏',
    },
    {
      id: 'surge',
      source: surge,
      game: 'Surge/Game/Game.list,🎮 国外游戏',
      hoyoverse: 'Surge/HoYoverse/HoYoverse.list,🎮 国外游戏',
    },
  ]) {
    for (const domain of CN_GAME_PRIORITY_DOMAINS) {
      const guard = `DOMAIN-SUFFIX,${domain},🕹️ 国内游戏`;
      checkNeedleBefore(record, `${spec.id}.cn-game.${domain}.before-game-list`, spec.source, guard, spec.game);
      checkNeedleBefore(record, `${spec.id}.cn-game.${domain}.before-hoyoverse`, spec.source, guard, spec.hoyoverse);
    }
  }
  checkNeedleBefore(
    record,
    'loon.cn-game.remote-steamcn-before-hoyoverse',
    loonRemoteRule,
    'Loon/SteamCN/SteamCN.list, policy=🕹️ 国内游戏',
    'Loon/HoYoverse/HoYoverse.list, policy=🎮 国外游戏',
  );
  checkNeedleBefore(
    record,
    'loon.cn-game.local-yuanshen-before-foreign-stage',
    loonRuleSection,
    'DOMAIN-SUFFIX,yuanshen.com,🕹️ 国内游戏',
    '# ─── 阶段 19: 国外游戏',
  );
  record.check('loon.douyin-zjcdn-cnmedia', loon.includes('DOMAIN-SUFFIX,zjcdn.com,📺 国内流媒体'), failureMessage(loon.includes('DOMAIN-SUFFIX,zjcdn.com,📺 国内流媒体'), 'missing Loon zjcdn.com CN media guard'));
  checkNeedleBefore(record, 'loon.douyin-zjcdn-before-local-foreign-tail', loon, 'DOMAIN-SUFFIX,zjcdn.com,📺 国内流媒体', 'DOMAIN-SUFFIX,archive.org,🌐 国外网站');
  // v5.4.18: normalize whitespace around commas to avoid false failures on cosmetic formatting changes
  const srNorm = (s) => s.replace(/\s*,\s*/g, ',');
  // v5.4.21 #4: DoH-over-IP — all DoH URLs use IP host to eliminate bootstrap leak
  record.check('shadowrocket.dns.nameserver-doh-over-ip', srNorm(shadowrocket).includes('dns-server = https://223.5.5.5/dns-query,https://223.6.6.6/dns-query,https://8.8.8.8/dns-query,https://1.1.1.1/dns-query'));
  record.check('shadowrocket.dns.proxy-server-doh-over-ip', srNorm(shadowrocket).includes('proxy-dns-server = https://8.8.8.8/dns-query,https://1.1.1.1/dns-query,https://223.5.5.5/dns-query,https://223.6.6.6/dns-query'));
  record.check('shadowrocket.dns.fallback-doh-over-ip', srNorm(shadowrocket).includes('fallback-dns-server = https://8.8.8.8/dns-query,https://1.1.1.1/dns-query'));
  record.check('surge.dns.bootstrap-plaintext-fallback', surge.includes('dns-server = 223.5.5.5, 119.29.29.29, 1.1.1.1, 8.8.8.8'));
  record.check('surge.dns.encrypted-doh-over-ip', surge.includes('encrypted-dns-server = https://223.5.5.5/dns-query, https://223.6.6.6/dns-query, https://8.8.8.8/dns-query, https://1.1.1.1/dns-query'));
  record.check('surge.dns.fallback-doh-over-ip', surge.includes('fallback-dns-server = https://8.8.8.8/dns-query, https://1.1.1.1/dns-query'));
  record.check('loon.dns.bootstrap-plaintext-fallback', loon.includes('dns-server = 223.5.5.5, 119.29.29.29, 1.1.1.1, 8.8.8.8'));
  record.check('loon.dns.doh-over-ip', loon.includes('doh-server = https://223.5.5.5/dns-query, https://223.6.6.6/dns-query, https://8.8.8.8/dns-query, https://1.1.1.1/dns-query'));
  for (const server of DNS_BOOTSTRAP_PLAINTEXT) record.check(`qx.dns.server.${server}`, qx.includes(`server=${server}`));
  for (const server of DNS_BOOTSTRAP_DOH_OVER_IP) record.check(`qx.dns.doh-server.${server}`, qx.includes(`doh-server=${server}`));
  for (const port of STUN_DIRECT_PORTS) {
    const srHasPortRule = shadowrocket.includes(`DST-PORT,${port},DIRECT`);
    const surgeHasPortRule = surge.includes(`DEST-PORT,${port},DIRECT`);
    const loonHasPortRule = loon.includes(`DEST-PORT,${port},DIRECT`);
    const qxHasPortRule = qx.includes(`dst-port, ${port}, DIRECT`);
    record.check(`shadowrocket.stun-port.${port}`, srHasPortRule, failureMessage(srHasPortRule, `missing DST-PORT,${port},DIRECT`));
    record.check(`surge.stun-port.${port}`, surgeHasPortRule, failureMessage(surgeHasPortRule, `missing DEST-PORT,${port},DIRECT`));
    record.check(`loon.stun-port.${port}`, loonHasPortRule, failureMessage(loonHasPortRule, `missing DEST-PORT,${port},DIRECT`));
    record.check(`qx.stun-port.${port}`, qxHasPortRule, failureMessage(qxHasPortRule, `missing dst-port, ${port}, DIRECT`));
  }

  const loonHasNoDstPortPrefix = !loon.split(/\r?\n/).some((line) => /^DST-PORT,/.test(line));
  record.check(
    'loon.no-dst-port-prefix',
    loonHasNoDstPortPrefix,
    failureMessage(loonHasNoDstPortPrefix, 'Loon must use DEST-PORT, not DST-PORT'),
  );

  const surgeHasNoDstPortPrefix = !surge.split(/\r?\n/).some((line) => /^DST-PORT,/.test(line));
  record.check(
    'surge.no-dst-port-prefix',
    surgeHasNoDstPortPrefix,
    failureMessage(surgeHasNoDstPortPrefix, 'Surge must use DEST-PORT, not DST-PORT'),
  );

  const qxHasNoDohUrlInServerField = !qx.split(/\r?\n/).some((line) => /^server=https:\/\//.test(line));
  record.check(
    'qx.no-doh-url-in-server-field',
    qxHasNoDohUrlInServerField,
    failureMessage(qxHasNoDohUrlInServerField, 'QX DoH URLs must use doh-server='),
  );
  const qxHasValidRunningModeTrigger = !/^running_mode_trigger=.*\bfilter\b/m.test(qx);
  record.check(
    'qx.running-mode-trigger-values',
    qxHasValidRunningModeTrigger,
    failureMessage(qxHasValidRunningModeTrigger, 'QX running_mode_trigger cannot use filter'),
  );
  const qxFilterRemote = extractConfSection(qx, 'filter_remote');
  const qxFilterLocal = extractConfSection(qx, 'filter_local');
  checkNeedleBefore(
    record,
    'qx.amap-after-ads',
    qxFilterRemote,
    'QuantumultX/YouMengChuangXiang/YouMengChuangXiang.list, tag=youmengchuangxiang, force-policy=🛑 广告拦截',
    'QuantumultX/GaoDe/GaoDe.list, tag=gaode, force-policy=🏠 国内网站',
  );
  checkNeedleBefore(
    record,
    'qx.amap-before-foreign-tail',
    qxFilterRemote,
    'QuantumultX/GaoDe/GaoDe.list, tag=gaode, force-policy=🏠 国内网站',
    'QuantumultX/CNN/CNN.list, tag=cnn, force-policy=🌐 国外网站',
  );
  checkNeedleBefore(
    record,
    'qx.cn-game.remote-steamcn-before-hoyoverse',
    qxFilterRemote,
    'QuantumultX/SteamCN/SteamCN.list, tag=steamcn, force-policy=🕹️ 国内游戏',
    'QuantumultX/HoYoverse/HoYoverse.list, tag=hoyoverse, force-policy=🎮 国外游戏',
  );
  checkNeedleBefore(
    record,
    'qx.cn-game.local-yuanshen-before-foreign-stage',
    qxFilterLocal,
    'host-suffix, yuanshen.com, 🕹️ 国内游戏',
    '# ─── 阶段 19: 国外游戏',
  );
  const qxLocalRuleInRemote = qxFilterRemote.split(/\r?\n/).some((line) => /^\s*(host|host-suffix|host-keyword|ip-cidr|ip6-cidr|dst-port),/i.test(line));
  record.check(
    'qx.filter-remote-no-local-rules',
    !qxLocalRuleInRemote,
    failureMessage(!qxLocalRuleInRemote, 'QX local filter rules must live in [filter_local], not [filter_remote]'),
  );
  for (const line of [
    'host-suffix, account.xiaomi.com, direct',
    'host-suffix, cloudflarestorage.com, 🌐 国外网站',
    'host-suffix, paddle.com, 🏦 金融支付',
    'host-suffix, douyin.com, 📺 国内流媒体',
    'host-suffix, zjcdn.com, 📺 国内流媒体',
    'host-suffix, rustdesk.com, 🧑‍💼 会议协作',
  ]) {
    record.check(`qx.filter-local.${line}`, qxFilterLocal.includes(line), failureMessage(qxFilterLocal.includes(line), `missing ${line}`));
  }
  checkNeedleBefore(
    record,
    'shadowrocket.cloudflarestorage-before-ads',
    shadowrocket,
    'DOMAIN-SUFFIX,cloudflarestorage.com,🌐 国外网站',
    'RULE-SET,https://fastly.jsdelivr.net/gh/privacy-protection-tools/anti-AD@master/anti-ad-surge.txt,🛑 广告拦截',
  );
  checkNeedleBefore(
    record,
    'surge.cloudflarestorage-before-ads',
    surge,
    'DOMAIN-SUFFIX,cloudflarestorage.com,🌐 国外网站',
    'RULE-SET,https://fastly.jsdelivr.net/gh/privacy-protection-tools/anti-AD@master/anti-ad-surge.txt,🛑 广告拦截',
  );
  const loonLocalRule = /^DOMAIN-SUFFIX,cloudflarestorage\.com,🌐 国外网站$/m.test(loon);
  record.check('loon.cloudflarestorage-local-rule', loonLocalRule, failureMessage(loonLocalRule, 'missing local Cloudflare R2 override rule'));
  record.check(
    'qx.cloudflarestorage-local-rule',
    qxFilterLocal.includes('host-suffix, cloudflarestorage.com, 🌐 国外网站'),
    failureMessage(qxFilterLocal.includes('host-suffix, cloudflarestorage.com, 🌐 国外网站'), 'missing local Cloudflare R2 override rule in [filter_local]'),
  );
}

function validateJsonProducts(record, baselineVersion) {
  const singbox = readJson('SingBox/SingBox(sing-box)-full.json');
  const singboxGenerator = readText('SingBox/SingBox(sing-box)-generator.js');
  const generatorVersion = (singboxGenerator.match(/const\s+VERSION\s*=\s*'([^']+)'/) || [])[1];
  const generatorBuild = (singboxGenerator.match(/const\s+BUILD(?:_DATE)?\s*=\s*'([^']+)'/) || [])[1];
  const generatorBaseline = (singboxGenerator.match(/const\s+BASELINE\s*=\s*'([^']+)'/) || [])[1];
  const selectorCount = (singbox.outbounds || []).filter((outbound) => outbound.type === 'selector' || outbound.type === 'urltest').length;
  const singboxUrltests = (singbox.outbounds || []).filter((outbound) => outbound.type === 'urltest');
  const outboundTags = (singbox.outbounds || []).map((outbound) => outbound.tag).filter(Boolean);
  const singboxBusinessOrder = outboundTags.filter((tag) => SINGBOX_BUSINESS_ORDER.includes(tag));
  const routeRules = ((singbox.route || {}).rules || []);
  const ruleSetCount = ((singbox.route || {}).rule_set || []).length;
  const routeRuleCount = routeRules.length;
  const dnsRules = ((singbox.dns || {}).rules || []);
  const dnsServers = ((singbox.dns || {}).servers || []);
  const dnsServerByTag = Object.fromEntries(dnsServers.filter((server) => server && server.tag).map((server) => [server.tag, server]));
  record.check('singbox.baseline-meta', singbox._meta && singbox._meta.baseline === `Clash Party ${baselineVersion}`, { value: singbox._meta && singbox._meta.baseline });
  record.check('singbox.generator-version-meta', singbox._meta && singbox._meta.version === generatorVersion, {
    value: { meta: singbox._meta && singbox._meta.version, generator: generatorVersion },
  });
  record.check('singbox.generator-build-meta', singbox._meta && singbox._meta.build === generatorBuild, {
    value: { meta: singbox._meta && singbox._meta.build, generator: generatorBuild },
  });
  record.check('singbox.generator-baseline-meta', singbox._meta && singbox._meta.baseline === generatorBaseline, {
    value: { meta: singbox._meta && singbox._meta.baseline, generator: generatorBaseline },
  });
  record.check('singbox.generator-clean-base', !/readFileSync\(['"]SingBox\/SingBox\(sing-box\)-full\.json['"]/.test(singboxGenerator));
  record.check('singbox.selector-urltest-count', selectorCount === EXPECTED_SINGBOX_GROUPS, { value: selectorCount });
  record.check('singbox.urltest-interval-5m', singboxUrltests.length === EXPECTED_SINGBOX_URLTEST_GROUPS && singboxUrltests.every((outbound) => outbound.interval === EXPECTED_SINGBOX_URLTEST_INTERVAL), {
    value: Array.from(new Set(singboxUrltests.map((outbound) => outbound.interval))).sort(),
    message: 'SingBox urltest outbounds must use 5m interval (300s)',
  });
  record.check('singbox.generator-urltest-interval-5m', singboxGenerator.includes(`interval: '${EXPECTED_SINGBOX_URLTEST_INTERVAL}'`) && !singboxGenerator.includes("interval: '3m'"), {
    message: 'SingBox generator must emit 5m urltest intervals',
  });
  checkExactList(record, 'singbox.business-group-order', singboxBusinessOrder, SINGBOX_BUSINESS_ORDER);
  const finalAsUnconditionalRule = routeRules.some((rule) => (
    rule
      && rule.action === 'route'
      && rule.outbound === '🐟 漏网之鱼'
      && Object.keys(rule).every((key) => key === 'action' || key === 'outbound')
  ));
  record.check('singbox.no-unconditional-final-route-rule', !finalAsUnconditionalRule, {
    message: 'SingBox must use route.final for MATCH fallback; an unconditional final rule would shadow later QUIC rules',
  });
  record.check('singbox.rule-set-count', ruleSetCount >= 30, { value: ruleSetCount });
  record.check('singbox.route-rule-count', routeRuleCount >= 600, { value: routeRuleCount });
  const singboxScholarGoogle = routeRules.some((rule) => (
    Array.isArray(rule.domain) && rule.domain.includes('scholar.google.com') && rule.outbound === '🔍 Google 服务'
  ));
  record.check('singbox.scholar-target-google', singboxScholarGoogle, failureMessage(singboxScholarGoogle, 'scholar.google.com must route to Google service'));
  record.check('singbox.dns.bootstrap-doh-over-ip', dnsServerByTag.dns_bootstrap && dnsServerByTag.dns_bootstrap.address === 'https://223.5.5.5/dns-query' && dnsServerByTag.dns_bootstrap.tls && dnsServerByTag.dns_bootstrap.tls.server_name === 'dns.alidns.com', {
    value: dnsServerByTag.dns_bootstrap && dnsServerByTag.dns_bootstrap.address,
  });
  record.check('singbox.dns.direct-doh', dnsServerByTag.dns_direct && dnsServerByTag.dns_direct.address === 'https://dns.alidns.com/dns-query', {
    value: dnsServerByTag.dns_direct && dnsServerByTag.dns_direct.address,
  });
  record.check('singbox.dns.proxy-doh', dnsServerByTag.dns_proxy && dnsServerByTag.dns_proxy.address === 'https://cloudflare-dns.com/dns-query', {
    value: dnsServerByTag.dns_proxy && dnsServerByTag.dns_proxy.address,
  });
  record.check('singbox.dns.direct-bootstrap-resolver', dnsServerByTag.dns_direct && dnsServerByTag.dns_direct.address_resolver === 'dns_bootstrap');
  record.check('singbox.dns.proxy-bootstrap-resolver', dnsServerByTag.dns_proxy && dnsServerByTag.dns_proxy.address_resolver === 'dns_bootstrap');
  record.check('singbox.dns.proxy-detour-main-selector', dnsServerByTag.dns_proxy && dnsServerByTag.dns_proxy.detour === '🚀 节点选择', {
    value: dnsServerByTag.dns_proxy && dnsServerByTag.dns_proxy.detour,
  });
  // v5.4.18: verify DNS redundancy — bootstrap/direct/proxy each have backup servers
  record.check('singbox.dns.bootstrap-redundancy', dnsServers.filter((s) => s.tag && s.tag.startsWith('dns_bootstrap')).length >= 2, {
    value: dnsServers.filter((s) => s.tag && s.tag.startsWith('dns_bootstrap')).map((s) => s.tag),
  });
  record.check('singbox.dns.direct-redundancy', dnsServers.filter((s) => s.tag && s.tag.startsWith('dns_direct')).length >= 2, {
    value: dnsServers.filter((s) => s.tag && s.tag.startsWith('dns_direct')).map((s) => s.tag),
  });
  record.check('singbox.dns.proxy-redundancy', dnsServers.filter((s) => s.tag && s.tag.startsWith('dns_proxy')).length >= 2, {
    value: dnsServers.filter((s) => s.tag && s.tag.startsWith('dns_proxy')).map((s) => s.tag),
  });
  const singboxPrivateDnsDirect = dnsRules.some((rule) => (
    Array.isArray(rule.rule_set) && rule.rule_set.includes('geosite-private') && rule.server === 'dns_direct'
  ));
  record.check('singbox.dns.private-direct', singboxPrivateDnsDirect, failureMessage(singboxPrivateDnsDirect, 'geosite-private DNS must use dns_direct'));
  const singboxCnDnsDirect = dnsRules.some((rule) => (
    Array.isArray(rule.rule_set)
      && rule.rule_set.includes('cn')
      && rule.rule_set.includes('cn-ip')
      && rule.server === 'dns_direct'
  ));
  record.check('singbox.dns.cn-direct', singboxCnDnsDirect, failureMessage(singboxCnDnsDirect, 'cn and cn-ip DNS must use dns_direct'));
  record.check('singbox.dns.final-proxy', (singbox.dns || {}).final === 'dns_proxy', { value: (singbox.dns || {}).final });
  for (const port of STUN_DIRECT_PORTS) {
    const hasPortRule = ((singbox.route || {}).rules || []).some((rule) => (
      Array.isArray(rule.port) && rule.port.includes(port) && rule.outbound === 'DIRECT'
    ));
    record.check(`singbox.stun-port.${port}`, hasPortRule, failureMessage(hasPortRule, `missing route rule for port ${port} -> DIRECT`));
  }
  const singboxRules = (singbox.route || {}).rules || [];
  const singboxCloudflareR2Index = singboxRules.findIndex((rule) => (
    Array.isArray(rule.domain_suffix) && rule.domain_suffix.includes('cloudflarestorage.com') && rule.outbound === '🌐 国外网站'
  ));
  const singboxAntiAdIndex = singboxRules.findIndex((rule) => (
    Array.isArray(rule.rule_set) && rule.rule_set.includes('anti-ad') && rule.action === 'reject'
  ));
  record.check('singbox.cloudflarestorage-before-ads', singboxCloudflareR2Index !== -1 && singboxAntiAdIndex !== -1 && singboxCloudflareR2Index < singboxAntiAdIndex, {
    value: { cloudflarestorage: singboxCloudflareR2Index, antiAd: singboxAntiAdIndex },
  });
  const singboxDouyinIndex = singboxRules.findIndex((rule) => (
    Array.isArray(rule.domain_suffix) && rule.domain_suffix.includes('zjcdn.com') && rule.outbound === '📺 国内流媒体'
  ));
  const singboxTikTokIndex = singboxRules.findIndex((rule) => (
    Array.isArray(rule.rule_set) && rule.rule_set.includes('tiktok') && rule.outbound === '🎵 TikTok'
  ));
  const singboxForeignTailIndex = singboxRules.findIndex((rule) => (
    Array.isArray(rule.rule_set) && rule.rule_set.includes('proxy') && rule.outbound === '🌐 国外网站'
  ));
  const singboxAmapIndex = singboxRules.findIndex((rule) => (
    Array.isArray(rule.rule_set) && rule.rule_set.includes('amap') && rule.outbound === '🏠 国内网站'
  ));
  record.check('singbox.douyin-zjcdn-cnmedia', singboxDouyinIndex !== -1, failureMessage(singboxDouyinIndex !== -1, 'zjcdn.com must route to CN media'));
  record.check('singbox.douyin-zjcdn-before-tiktok', singboxDouyinIndex !== -1 && singboxTikTokIndex !== -1 && singboxDouyinIndex < singboxTikTokIndex, {
    value: { douyin: singboxDouyinIndex, tiktok: singboxTikTokIndex },
  });
  record.check('singbox.douyin-zjcdn-before-foreign-tail', singboxDouyinIndex !== -1 && singboxForeignTailIndex !== -1 && singboxDouyinIndex < singboxForeignTailIndex, {
    value: { douyin: singboxDouyinIndex, foreignTail: singboxForeignTailIndex },
  });
  record.check('singbox.amap-cnsite', singboxAmapIndex !== -1, failureMessage(singboxAmapIndex !== -1, 'amap rule_set must route to CN site'));
  record.check('singbox.amap-before-foreign-tail', singboxAmapIndex !== -1 && singboxForeignTailIndex !== -1 && singboxAmapIndex < singboxForeignTailIndex, {
    value: { amap: singboxAmapIndex, foreignTail: singboxForeignTailIndex },
  });
  const singboxCategoryGamesIndex = singboxRules.findIndex((rule) => (
    Array.isArray(rule.rule_set) && rule.rule_set.includes('geosite-category-games') && rule.outbound === '🎮 国外游戏'
  ));
  for (const domain of CN_GAME_PRIORITY_DOMAINS) {
    const cnGameIndex = singboxRules.findIndex((rule) => (
      Array.isArray(rule.domain_suffix) && rule.domain_suffix.includes(domain) && rule.outbound === '🕹️ 国内游戏'
    ));
    record.check(`singbox.cn-game.${domain}.direct-rule`, cnGameIndex !== -1, failureMessage(cnGameIndex !== -1, `${domain} must route to CN game`));
    record.check(`singbox.cn-game.${domain}.before-category-games`, cnGameIndex !== -1 && singboxCategoryGamesIndex !== -1 && cnGameIndex < singboxCategoryGamesIndex, {
      value: { cnGame: cnGameIndex, categoryGames: singboxCategoryGamesIndex },
    });
  }

  const v2rayn = readJson('v2rayN/v2rayN(xray).json');
  const allowedTags = new Set(['proxy', 'direct', 'block']);
  record.check('v2rayn.top-level-array', Array.isArray(v2rayn));
  record.check('v2rayn.rule-count', Array.isArray(v2rayn) && v2rayn.length >= 30, { value: Array.isArray(v2rayn) ? v2rayn.length : null });
  record.check('v2rayn.baseline-remarks', Array.isArray(v2rayn) && String(v2rayn[0] && v2rayn[0].remarks).includes(`Clash Party ${baselineVersion}`));
  record.check('v2rayn.outbound-tags', Array.isArray(v2rayn) && v2rayn.every((rule) => allowedTags.has(rule.outboundTag)), {
    value: Array.isArray(v2rayn) ? Array.from(new Set(v2rayn.map((rule) => rule.outboundTag))).sort() : null,
  });
  for (const port of STUN_DIRECT_PORTS) {
    const hasPortRule = Array.isArray(v2rayn) && v2rayn.some((rule) => (
      rule.outboundTag === 'direct' && String(rule.port || '').split(',').map((item) => item.trim()).includes(String(port))
    ));
    record.check(`v2rayn.stun-port.${port}`, hasPortRule, failureMessage(hasPortRule, `missing port ${port} -> direct`));
  }
  const v2CloudflareR2Index = Array.isArray(v2rayn) ? v2rayn.findIndex((rule) => (
    rule.outboundTag === 'proxy' && Array.isArray(rule.domain) && rule.domain.includes('domain:cloudflarestorage.com')
  )) : -1;
  const v2AdsIndex = Array.isArray(v2rayn) ? v2rayn.findIndex((rule) => rule.id === 'scki-001-ads') : -1;
  const v2DouyinIndex = Array.isArray(v2rayn) ? v2rayn.findIndex((rule) => (
    rule.id === 'scki-000d-douyin-web-cnmedia'
      && rule.outboundTag === 'direct'
      && Array.isArray(rule.domain)
      && DOUYIN_CNMEDIA_DOMAINS.every((domain) => rule.domain.includes(`domain:${domain}`))
  )) : -1;
  const v2AmapIndex = Array.isArray(v2rayn) ? v2rayn.findIndex((rule) => (
    rule.id === 'scki-000e-amap-direct'
      && rule.outboundTag === 'direct'
      && Array.isArray(rule.domain)
      && PASSWALL_AMAP_REQUIRED.every((domain) => rule.domain.includes(domain))
  )) : -1;
  const v2ScholarGoogle = Array.isArray(v2rayn) && v2rayn.some((rule) => (
    rule.id === 'scki-027-google' && rule.outboundTag === 'proxy' && Array.isArray(rule.domain) && rule.domain.includes('domain:scholar.google.com')
  ));
  const v2CnGameIndex = Array.isArray(v2rayn) ? v2rayn.findIndex((rule) => rule.id === 'scki-025-cn-game') : -1;
  const v2IntlGameIndex = Array.isArray(v2rayn) ? v2rayn.findIndex((rule) => rule.id === 'scki-026-intl-game') : -1;
  const v2CnGame = v2CnGameIndex === -1 ? null : v2rayn[v2CnGameIndex];
  record.check('v2rayn.douyin-web-direct-guard', v2DouyinIndex !== -1, failureMessage(v2DouyinIndex !== -1, 'scki-000d must direct all Douyin Web guard domains'));
  record.check('v2rayn.douyin-web-before-ads', v2DouyinIndex !== -1 && v2AdsIndex !== -1 && v2DouyinIndex < v2AdsIndex, {
    value: { douyin: v2DouyinIndex, ads: v2AdsIndex },
  });
  record.check('v2rayn.amap-direct-guard', v2AmapIndex !== -1, failureMessage(v2AmapIndex !== -1, 'scki-000e must direct all GaoDe/AMap fallback domains'));
  record.check('v2rayn.amap-before-ads', v2AmapIndex !== -1 && v2AdsIndex !== -1 && v2AmapIndex < v2AdsIndex, {
    value: { amap: v2AmapIndex, ads: v2AdsIndex },
  });
  record.check('v2rayn.cn-game-before-intl-game', v2CnGameIndex !== -1 && v2IntlGameIndex !== -1 && v2CnGameIndex < v2IntlGameIndex, {
    value: { cnGame: v2CnGameIndex, intlGame: v2IntlGameIndex },
  });
  for (const domain of PASSWALL_CN_GAME_REQUIRED) {
    record.check(
      `v2rayn.cn-game.${domain}`,
      v2CnGame && Array.isArray(v2CnGame.domain) && v2CnGame.domain.includes(domain),
      failureMessage(v2CnGame && Array.isArray(v2CnGame.domain) && v2CnGame.domain.includes(domain), `scki-025-cn-game missing ${domain}`),
    );
  }
  record.check('v2rayn.scholar-target-google', v2ScholarGoogle, failureMessage(v2ScholarGoogle, 'scki-027-google must include domain:scholar.google.com'));
  record.check('v2rayn.cloudflarestorage-before-ads', v2CloudflareR2Index !== -1 && v2AdsIndex !== -1 && v2CloudflareR2Index < v2AdsIndex, {
    value: { cloudflarestorage: v2CloudflareR2Index, ads: v2AdsIndex },
  });
}

function validatePasswall(record, baselineVersion) {
  const specs = [
    { id: 'passwall', file: 'Passwall/Passwall(xray+sing-box)-apply.sh', reference: 'Passwall/Passwall(xray+sing-box).conf', dir: 'Passwall/shunt-rules' },
    { id: 'passwall2', file: 'Passwall2/Passwall2(xray+sing-box)-apply.sh', reference: 'Passwall2/Passwall2(xray+sing-box).conf', dir: 'Passwall2/shunt-rules' },
  ];

  for (const spec of specs) {
    const source = readText(spec.file);
    const reference = readText(spec.reference);
    const shuntFiles = listFiles(spec.dir).filter((file) => file.endsWith('.list'));
    const activeRuleText = [source, reference, ...shuntFiles.map((file) => readText(file))].join('\n');
    const ruleAdds = countMatches(source, /uci add "\$\{CONFIG_NAME\}" shunt_rules/g);
    const hasBaselineHeader = source.includes(baselineVersion);
    record.check(`${spec.id}.baseline-header`, hasBaselineHeader, failureMessage(hasBaselineHeader, `missing ${baselineVersion}`));
    record.check(`${spec.id}.script-rule-count`, ruleAdds === EXPECTED_PASSWALL_RULES, { value: ruleAdds });
    record.check(`${spec.id}.list-file-count`, shuntFiles.length === EXPECTED_PASSWALL_RULES, { value: shuntFiles.length });
    record.check(`${spec.id}.apply-script-replace-mode`, source.includes('MODE="${1:---replace}"') && source.includes('cleanup_existing_scki_rules'), {
      message: 'apply script must default to --replace and delete existing Smart-Config-Kit shunt rules before recreating them',
    });
    if (!reference.includes(baselineVersion)) {
      record.warn(`${spec.id}.reference-conf.baseline`, `${spec.reference} does not advertise ${baselineVersion}; apply script plus shunt-rules are authoritative`);
    }
    record.check(`${spec.id}.cloudflarestorage-script-rule`, source.includes("domain_list='domain:cloudflarestorage.com'"));
    record.check(`${spec.id}.cloudflarestorage-reference-rule`, reference.includes('domain:cloudflarestorage.com'));
    record.check(`${spec.id}.scholar-target-google`, activeRuleText.includes('domain:scholar.google.com'), {
      message: 'Google shunt rule must include domain:scholar.google.com',
    });
    record.check(
      `${spec.id}.douyin-web-domain-fallbacks`,
      DOUYIN_CNMEDIA_DOMAINS.every((domain) => activeRuleText.includes(`domain:${domain}`)),
      { message: 'CN media shunt rule must include explicit Douyin Web / zjcdn.com domain fallbacks' },
    );
    record.check(
      `${spec.id}.amap-domain-fallbacks`,
      PASSWALL_AMAP_REQUIRED.every((domain) => activeRuleText.includes(domain)),
      { message: 'CN site shunt rule must include explicit GaoDe / AMap domain fallbacks' },
    );
    checkNeedleBefore(
      record,
      `${spec.id}.cn-game-script-before-intl-game`,
      source,
      "remarks='🕹️ 国内游戏'",
      "remarks='🎮 国外游戏'",
    );
    const cnGameList = meaningfulRuleLines(path.join(spec.dir, '21-cn-game.list'));
    const intlGameList = meaningfulRuleLines(path.join(spec.dir, '22-intl-game.list'));
    for (const domain of PASSWALL_CN_GAME_REQUIRED) {
      record.check(
        `${spec.id}.cn-game-list.${domain}`,
        cnGameList.includes(domain),
        failureMessage(cnGameList.includes(domain), `21-cn-game.list missing ${domain}`),
      );
      record.check(
        `${spec.id}.cn-game-script.${domain}`,
        source.includes(`domain_list='${domain}'`),
        failureMessage(source.includes(`domain_list='${domain}'`), `apply script missing ${domain}`),
      );
    }
    record.check(`${spec.id}.intl-game-no-mihoyo`, !intlGameList.includes('domain:mihoyo.com'), {
      message: 'domain:mihoyo.com must stay in CN game, not intl game',
    });
    record.check(`${spec.id}.no-legacy-kakaotalk-geosite`, !activeRuleText.includes('geosite:kakaotalk'), {
      message: 'geosite:kakaotalk is not a valid v2fly/domain-list-community category; use geosite:kakao plus domain fallbacks',
    });
    record.check(
      `${spec.id}.kakao-domain-fallbacks`,
      activeRuleText.includes('geosite:kakao') && activeRuleText.includes('domain:kakao.com') && activeRuleText.includes('domain:kakaocorp.com') && activeRuleText.includes('domain:kakaotalk.com'),
      { message: 'KakaoTalk must include geosite:kakao plus explicit kakao.com/kakaocorp.com/kakaotalk.com fallbacks' },
    );
    for (const file of shuntFiles) {
      const badLine = readText(file).split(/\r?\n/).find((line) => !/^\s*#/.test(line) && /^(DOMAIN|DOMAIN-SUFFIX|DOMAIN-KEYWORD|IP-CIDR|IP-CIDR6|RULE-SET),/.test(line));
      record.check(`${spec.id}.${path.basename(file)}.passwall-syntax`, !badLine, { message: badLine ? `Clash-style prefix: ${badLine}` : undefined });
    }
    const intlSiteList = readText(path.join(spec.dir, '29-intl-site.list'));
    record.check(`${spec.id}.cloudflarestorage-list-rule`, intlSiteList.includes('domain:cloudflarestorage.com'));
  }

  const passwallLists = listFiles('Passwall/shunt-rules').filter((file) => file.endsWith('.list')).map((file) => path.basename(file)).sort();
  const passwall2Lists = listFiles('Passwall2/shunt-rules').filter((file) => file.endsWith('.list')).map((file) => path.basename(file)).sort();
  record.check('passwall2.same-list-names-as-passwall', JSON.stringify(passwall2Lists) === JSON.stringify(passwallLists), {
    value: { passwall: passwallLists, passwall2: passwall2Lists },
  });
  for (const fileName of passwallLists) {
    const pwRules = meaningfulRuleLines(path.join('Passwall/shunt-rules', fileName));
    const pw2Rules = meaningfulRuleLines(path.join('Passwall2/shunt-rules', fileName));
    record.check(`passwall2.${fileName}.same-rules-as-passwall`, JSON.stringify(pw2Rules) === JSON.stringify(pwRules), {
      message: `${fileName} differs between Passwall and Passwall2`,
    });
  }
}

function buildManifest(baselineVersion) {
  return {
    generatedAt: new Date().toISOString(),
    baselineVersion,
    expectations: {
      groups: EXPECTED_GROUPS,
      businessGroups: EXPECTED_BUSINESS_GROUPS,
      singBoxSelectorUrltestGroups: EXPECTED_SINGBOX_GROUPS,
      passwallShuntRules: EXPECTED_PASSWALL_RULES,
    },
    artifacts: ARTIFACT_FILES.map((file) => {
      const stat = fs.statSync(relPath(file));
      return {
        path: file,
        bytes: stat.size,
        sha256: sha256(file),
      };
    }),
  };
}

function printHuman(result) {
  const ok = result.failures.length === 0;
  console.log(`${ok ? 'PASS' : 'FAIL'} artifact contracts baseline=${result.manifest.baselineVersion}`);
  for (const check of result.checks) {
    if (!check.ok) console.log(`  - ${check.id}${check.message ? `: ${check.message}` : ''}`);
  }
  for (const warning of result.warnings) console.log(`  ! ${warning}`);
  console.log(`checks=${result.checks.length} artifacts=${result.manifest.artifacts.length}`);
}

function main() {
  const options = parseArgs(process.argv.slice(2));
  const record = makeRecorder();
  const { baselineVersion } = validateJsProducts(record);
  validateClashYaml(record, baselineVersion, options);
  validateOpenClash(record, baselineVersion, options);
  validateConfProducts(record, baselineVersion);
  validateJsonProducts(record, baselineVersion);
  validatePasswall(record, baselineVersion);
  const manifest = buildManifest(baselineVersion);
  const result = {
    ok: record.failures.length === 0,
    checks: record.checks,
    failures: record.failures,
    warnings: record.warnings,
    manifest,
  };

  if (options.manifestPath) {
    const target = path.resolve(REPO_ROOT, options.manifestPath);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
  }

  if (options.json) console.log(JSON.stringify(result, null, 2));
  else printHuman(result);
  if (!result.ok) process.exit(1);
}

try {
  main();
} catch (error) {
  console.error(error && error.stack ? error.stack : String(error));
  process.exit(1);
}
