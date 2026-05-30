#!/usr/bin/env node
'use strict';

const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const REPO_ROOT = path.resolve(__dirname, '..');
const RESTRICTED_SITE = '🚫 受限网站';

const TARGETS = [
  {
    id: 'smart',
    label: 'Clash Party Smart',
    file: path.join('Clash Party', 'ClashParty(mihomo-smart).js'),
    regionType: 'smart',
    preserveArrayRefs: false,
    requireTunExcludes: true,
  },
  {
    id: 'normal',
    label: 'Clash Party Normal',
    file: path.join('Clash Party', 'ClashParty(mihomo).js'),
    regionType: 'url-test',
    preserveArrayRefs: false,
    requireTunExcludes: true,
  },
  {
    id: 'flclash',
    label: 'FlClash',
    file: path.join('FlClash', 'FlClash(mihomo).js'),
    regionType: 'url-test',
    preserveArrayRefs: true,
    requireTunExcludes: false,
  },
];

const SMART_GROUPS = [
  '🌍 全球节点',
  '🏡 全球家宽',
  '🇭🇰 香港节点',
  '🏡 香港家宽',
  '🇹🇼 台湾节点',
  '🏡 台湾家宽',
  '🇸🇬 狮城节点',
  '🏡 狮城家宽',
  '🇯🇵 日韩节点',
  '🏡 日韩家宽',
  '🌏 亚太节点',
  '🏡 亚太家宽',
  '🇺🇸 美国节点',
  '🏡 美国家宽',
  '🇪🇺 欧洲节点',
  '🏡 欧洲家宽',
  '🌎 美洲节点',
  '🏡 美洲家宽',
  '🌍 非洲节点',
  '🏡 非洲家宽',
  '🌏 其他节点',
  '🏡 其他家宽',
];

const BIZ_GROUPS = [
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

const EXPECTED_GROUP_ORDER = [SMART_GROUPS[0], ...BIZ_GROUPS, ...SMART_GROUPS.slice(1)];
const DIRECT_POLICIES = new Set(['DIRECT', 'REJECT', 'REJECT-DROP', 'PASS']);
const INFO_NODES = new Set(['剩余流量 10G', '官网 example.com', 'USE 100GB']);
const EXTRA_INFO_NODES = new Set(['距离下次重置 12 天', '套餐到期 2026-06-01', 'Panel Channel Author',
  // v5.4.20 #6 借鉴 Proxy-override：新增 junk 关键词回归（免费/试用/应急 + Sign/Login/Register/Help/FAQ）
  '免费节点 01', '试用 1 天', '应急入口', 'Sign Up Panel', 'Login Portal', 'Register Now', 'Help Center', 'FAQ']);
const COST_AND_LINE_QUALITY_CASES = [
  'JP 02 0.2x Saver Home x0.2',
  'HK IPLC 03 x3',
];
const DIRECT_PROCESS_RULES = ['WorkPro.exe', 'GCUService.exe', 'GSCService.exe', 'Weixin.exe', 'WeChat.exe', 'QQ.exe'];
const RUSTDESK_WORK_PROCESS_RULES = ['RustDesk.exe', 'rustdesk.exe', 'RustDesk', 'rustdesk'];
const WORK_PROVIDER_RULES = ['remotedesktop', 'acc-rustdesk', 'acc-parsec'];
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

const CLASSIFICATION_CASES = [
  ['HKG 01 IEPL x1', 'HK'],
  ['深港 IEPL 02 x1', 'HK'],
  ['Signal 香港 IEPL x1', 'HK'],
  ['TWN 01 AnyRoute IEPL x2.5', 'TW'],
  ['SGP 01 Home x1', 'SG'],
  ['JPN 01 Tokyo Home x1', 'JP'],
  ['KOR 01 Seoul Home x1', 'KR'],
  ['USA 01 Home IP x1', 'US'],
  ['CHN Beijing Home x1', 'CN'],
  ['DE Frankfurt Home x1', 'EU'],
  ['CA Toronto Residential x1', 'AM'],
  ['EG Cairo Home x1', 'AF'],
  ['Mystery Home IP x1', 'OTHER'],
];

const GROUP_MEMBER_CASES = [
  { group: '🇭🇰 香港节点', include: ['HKG 01 IEPL x1', 'HK 09 Standard x1', '深港 IEPL 02 x1'], exclude: ['TWN 01 AnyRoute IEPL x2.5', ...INFO_NODES] },
  { group: '🏡 香港家宽', include: ['HKG 01 IEPL x1', '深港 IEPL 02 x1'], exclude: ['HK 09 Standard x1', ...INFO_NODES] },
  { group: '🇹🇼 台湾节点', include: ['TWN 01 AnyRoute IEPL x2.5'], exclude: ['HKG 01 IEPL x1', ...INFO_NODES] },
  { group: '🇸🇬 狮城节点', include: ['SGP 01 Home x1'], exclude: ['JPN 01 Tokyo Home x1', ...INFO_NODES] },
  { group: '🇯🇵 日韩节点', include: ['JPN 01 Tokyo Home x1', 'KOR 01 Seoul Home x1'], exclude: ['SGP 01 Home x1', ...INFO_NODES] },
  { group: '🌏 亚太节点', include: ['HKG 01 IEPL x1', '深港 IEPL 02 x1', 'TWN 01 AnyRoute IEPL x2.5', 'SGP 01 Home x1', 'JPN 01 Tokyo Home x1', 'KOR 01 Seoul Home x1', 'CHN Beijing Home x1'], exclude: ['USA 01 Home IP x1', 'CA Toronto Residential x1', ...INFO_NODES] },
  { group: '🇺🇸 美国节点', include: ['USA 01 Home IP x1', 'US 09 Standard x1'], exclude: ['CA Toronto Residential x1', ...INFO_NODES] },
  { group: '🌎 美洲节点', include: ['USA 01 Home IP x1', 'US 09 Standard x1', 'CA Toronto Residential x1'], exclude: ['DE Frankfurt Home x1', ...INFO_NODES] },
  { group: '🇪🇺 欧洲节点', include: ['DE Frankfurt Home x1'], exclude: ['EG Cairo Home x1', ...INFO_NODES] },
  { group: '🌍 非洲节点', include: ['EG Cairo Home x1'], exclude: ['DE Frankfurt Home x1', ...INFO_NODES] },
  { group: '🌏 其他节点', include: ['Mystery Home IP x1'], exclude: ['HKG 01 IEPL x1', ...INFO_NODES] },
  { group: '🏡 其他家宽', include: ['Mystery Home IP x1'], exclude: ['HK 09 Standard x1', ...INFO_NODES] },
];

function usage() {
  return [
    'Usage: node tools/validate-js-overwrites.js [--target smart|normal|flclash] [--json] [--verbose]',
    '',
    'Runs the JS overwrite smoke contract against Clash Party Smart, Clash Party Normal, and FlClash.',
    'The harness has no third-party dependencies and executes each script through its real main(config) entrypoint.',
  ].join('\n');
}

function parseArgs(argv) {
  const options = { target: null, json: false, verbose: false };
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
    if (arg === '--target') {
      options.target = argv[i + 1];
      i += 1;
      continue;
    }
    throw new Error(`Unknown argument: ${arg}\n${usage()}`);
  }
  if (options.target && !TARGETS.some((t) => t.id === options.target)) {
    throw new Error(`Unknown target: ${options.target}`);
  }
  return options;
}

function makeProxy(name, overrides = {}) {
  return {
    name,
    type: 'ss',
    server: '127.0.0.1',
    port: 443,
    cipher: '2022-blake3-aes-128-gcm',
    password: 'smoke-fixture',
    ...overrides,
  };
}

function makeFixtureConfig() {
  return {
    proxies: [
      makeProxy('HKG 01 IEPL x1'),
      makeProxy('HK 09 Standard x1'),
      makeProxy('深港 IEPL 02 x1'),
      makeProxy('TWN 01 AnyRoute IEPL x2.5'),
      makeProxy('SGP 01 Home x1'),
      makeProxy('JPN 01 Tokyo Home x1', { type: 'trojan', tls: true, 'client-fingerprint': 'safari' }),
      makeProxy('KOR 01 Seoul Home x1'),
      makeProxy('USA 01 Home IP x1', { type: 'trojan', tls: true }),
      makeProxy('US 09 Standard x1'),
      makeProxy('DE Frankfurt Home x1'),
      makeProxy('CA Toronto Residential x1'),
      makeProxy('EG Cairo Home x1'),
      makeProxy('Mystery Home IP x1'),
      makeProxy('CHN Beijing Home x1'),
      makeProxy('剩余流量 10G'),
      makeProxy('官网 example.com'),
      makeProxy('USE 100GB'),
      makeProxy('距离下次重置 12 天'),
      makeProxy('套餐到期 2026-06-01'),
      makeProxy('Panel Channel Author'),
      makeProxy('JP 02 0.2x Saver Home x0.2'),
      makeProxy('HK IPLC 03 x3'),
      // v5.4.20 #6 junk 关键词回归——以下应被 isInfoNode 过滤（排除出 classified ALL）
      makeProxy('免费节点 01'),
      makeProxy('试用 1 天'),
      makeProxy('应急入口'),
      makeProxy('Sign Up Panel'),
      makeProxy('Login Portal'),
      makeProxy('Register Now'),
      makeProxy('Help Center'),
      makeProxy('FAQ'),
      // v5.4.20 #6 合法名守卫——"Signal" 含 "Sign" 但有词边界保护，必须保留并分类到 HK
      makeProxy('Signal 香港 IEPL x1'),
    ],
    'proxy-groups': [
      { name: '机场自动选择', type: 'url-test', proxies: ['HKG 01 IEPL x1'] },
      { name: 'Netflix', type: 'select', proxies: ['机场自动选择'] },
    ],
    rules: ['DOMAIN-SUFFIX,legacy.example,机场自动选择', 'MATCH,机场自动选择'],
    'rule-providers': {
      legacy_provider: {
        type: 'http',
        behavior: 'domain',
        url: 'https://example.invalid/legacy.yaml',
        path: './ruleset/legacy.yaml',
      },
    },
    dns: {},
    tun: { 'exclude-process': [] },
  };
}

function deepClone(value) {
  return JSON.parse(JSON.stringify(value));
}

function loadOverwrite(target) {
  const filename = path.join(REPO_ROOT, target.file);
  const source = fs.readFileSync(filename, 'utf8');
  const logs = [];
  const sandbox = {
    console: {
      log: (...args) => logs.push(args.map(String).join(' ')),
      warn: (...args) => logs.push(args.map(String).join(' ')),
      error: (...args) => logs.push(args.map(String).join(' ')),
    },
  };
  vm.createContext(sandbox);
  const trailer = '\n;globalThis.__smokeExports = { main, classifyNode, classifyAllNodes, VERSION };';
  vm.runInContext(source + trailer, sandbox, { filename: target.file, timeout: 5000 });
  return { exports: sandbox.__smokeExports, logs };
}

function makeRecorder(target) {
  const failures = [];
  return {
    failures,
    expect(condition, message) {
      if (!condition) failures.push(`${target.label}: ${message}`);
    },
    expectEqual(actual, expected, message) {
      if (actual !== expected) failures.push(`${target.label}: ${message}; expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
    },
    expectArrayEqual(actual, expected, message) {
      const same = actual.length === expected.length && actual.every((item, idx) => item === expected[idx]);
      if (!same) {
        failures.push(`${target.label}: ${message}; expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
      }
    },
  };
}

function uniqueValues(values) {
  return Array.from(new Set(values));
}

function groupByName(config) {
  const groups = config['proxy-groups'] || [];
  return new Map(groups.map((group) => [group.name, group]));
}

function proxyByName(config) {
  const proxies = config.proxies || [];
  return new Map(proxies.map((proxy) => [proxy.name, proxy]));
}

function extractRuleSetNames(rule) {
  return Array.from(String(rule).matchAll(/RULE-SET,([^,\)]+)/g), (match) => match[1]);
}

function extractRuleTarget(rule) {
  const value = String(rule);
  if (value.startsWith('AND,') || value.startsWith('OR,')) {
    const match = value.match(/\)\),([^,]+)(?:,|$)/);
    return match ? match[1] : null;
  }
  const parts = value.split(',');
  if (parts[0] === 'MATCH') return parts[1] || null;
  if (parts[0] === 'RULE-SET') return parts[2] || null;
  if (parts.length >= 3) return parts[2] || null;
  return null;
}

function validateClassification(target, api, fixture, record) {
  record.expect(typeof api.classifyNode === 'function', 'classifyNode is exported by the VM harness');
  record.expect(typeof api.classifyAllNodes === 'function', 'classifyAllNodes is exported by the VM harness');
  if (record.failures.length > 0) return;

  for (const [name, expectedRegion] of CLASSIFICATION_CASES) {
    record.expectEqual(api.classifyNode(name), expectedRegion, `classifies ${name}`);
  }

  const classified = api.classifyAllNodes(fixture.proxies);
  const all = new Set(classified.ALL || []);
  for (const proxy of fixture.proxies) {
    if (INFO_NODES.has(proxy.name) || EXTRA_INFO_NODES.has(proxy.name)) {
      record.expect(!all.has(proxy.name), `info node ${proxy.name} is excluded from classified ALL`);
    } else {
      record.expect(all.has(proxy.name), `traffic node ${proxy.name} is present in classified ALL`);
    }
  }
  for (const name of COST_AND_LINE_QUALITY_CASES) {
    record.expect(all.has(name), `cost or line-quality tag stays as a usable traffic node: ${name}`);
  }
  record.expect((classified.HOME_ALL || []).includes('HKG 01 IEPL x1'), 'IEPL nodes are treated as home-quality nodes');
  record.expect((classified.HOME_ALL || []).includes('HK IPLC 03 x3'), 'IPLC nodes are treated as home-quality nodes');
  record.expect((classified.HOME_ALL || []).includes('JP 02 0.2x Saver Home x0.2'), 'low-multiplier home nodes are treated as home-quality nodes');
  record.expect(!(classified.HOME_ALL || []).includes('HK 09 Standard x1'), 'standard nodes do not leak into home groups');
  record.expect((classified.HK || []).includes('深港 IEPL 02 x1'), 'HK classifier covers the bare 港 suffix case');
  record.expect((classified.HK || []).includes('HK IPLC 03 x3'), 'HK classifier keeps high-multiplier IPLC nodes in the HK bucket');
  record.expect((classified.TW || []).includes('TWN 01 AnyRoute IEPL x2.5'), 'alpha-3 TWN reaches Taiwan bucket');
  record.expect((classified.SG || []).includes('SGP 01 Home x1'), 'alpha-3 SGP reaches Singapore bucket');
  record.expect((classified.JP || []).includes('JPN 01 Tokyo Home x1'), 'alpha-3 JPN reaches Japan bucket');
  record.expect((classified.JP || []).includes('JP 02 0.2x Saver Home x0.2'), 'low-multiplier JP node reaches Japan bucket');
  record.expect((classified.KR || []).includes('KOR 01 Seoul Home x1'), 'alpha-3 KOR reaches Korea bucket');
}

function validateGroups(target, output, record) {
  const groups = output['proxy-groups'];
  const groupNames = groups.map((group) => group.name);
  const groupsByName = groupByName(output);
  const proxyNames = new Set(output.proxies.map((proxy) => proxy.name));

  record.expectEqual(groups.length, EXPECTED_GROUP_ORDER.length, 'emits exactly the expected JS overwrite group count');
  record.expectEqual(uniqueValues(groupNames).length, groupNames.length, 'does not emit duplicate proxy-group names');
  record.expectArrayEqual(groupNames, EXPECTED_GROUP_ORDER, 'keeps global, business, then region group order stable');

  for (const name of BIZ_GROUPS) {
    const group = groupsByName.get(name);
    record.expect(!!group, `business group exists: ${name}`);
    if (group) record.expectEqual(group.type, 'select', `business group is select: ${name}`);
  }
  for (const name of SMART_GROUPS) {
    const group = groupsByName.get(name);
    record.expect(!!group, `region group exists: ${name}`);
    if (group) record.expectEqual(group.type, target.regionType, `region group type is ${target.regionType}: ${name}`);
  }

  record.expect(!groupsByName.has('机场自动选择'), 'subscription-native proxy-groups are removed');
  record.expect(!groupsByName.has('Netflix'), 'subscription-native business-like groups are removed');

  for (const scenario of GROUP_MEMBER_CASES) {
    const group = groupsByName.get(scenario.group);
    record.expect(!!group, `group for member checks exists: ${scenario.group}`);
    if (!group) continue;
    const members = new Set(group.proxies || []);
    for (const name of scenario.include) {
      record.expect(members.has(name), `${scenario.group} includes ${name}`);
    }
    for (const name of scenario.exclude) {
      record.expect(!members.has(name), `${scenario.group} excludes ${name}`);
    }
  }

  for (const group of groups) {
    for (const member of group.proxies || []) {
      const known = groupsByName.has(member) || proxyNames.has(member) || DIRECT_POLICIES.has(member);
      record.expect(known, `group ${group.name} references existing member ${member}`);
    }
  }
}

function validateRulesAndProviders(output, record, target) {
  const rules = output.rules || [];
  const providers = output['rule-providers'] || {};
  const providerNames = new Set(Object.keys(providers));
  const groupNames = new Set((output['proxy-groups'] || []).map((group) => group.name));

  record.expect(rules.length >= 900, `injects a full ruleset, got ${rules.length}`);
  record.expect(providerNames.size >= 380, `injects the full rule-provider set, got ${providerNames.size}`);
  record.expectEqual(rules[rules.length - 1], 'MATCH,🐟 漏网之鱼', 'keeps MATCH as the final fallback');
  record.expect(!rules.slice(0, -1).some((rule) => String(rule).startsWith('MATCH,')), 'does not place MATCH before the final rule');
  record.expect(!rules.some((rule) => String(rule).includes('机场自动选择')), 'subscription-native rules are removed');
  record.expect(!providerNames.has('legacy_provider'), 'subscription-native rule-providers are removed');

  const antiAdIndex = rules.findIndex((rule) => String(rule).startsWith('RULE-SET,anti-ad,'));
  const gfwIndex = rules.findIndex((rule) => (
    String(rule).startsWith('GEOSITE,gfw,') ||
    String(rule).startsWith('RULE-SET,loyalsoldier-gfw,')
  ));
  record.expect(antiAdIndex !== -1, 'anti-ad rule exists');
  record.expect(gfwIndex !== -1, 'gfw tail rule exists');
  record.expect(antiAdIndex !== -1 && gfwIndex !== -1 && antiAdIndex < gfwIndex, 'ad blocking stays before the GFW tail block');

  const cloudflareR2Index = rules.indexOf('DOMAIN-SUFFIX,cloudflarestorage.com,🌐 国外网站');
  record.expect(cloudflareR2Index !== -1, 'Cloudflare R2 storage domain has an explicit route rule');
  record.expect(
    cloudflareR2Index !== -1 && antiAdIndex !== -1 && cloudflareR2Index < antiAdIndex,
    'Cloudflare R2 storage domain is evaluated before ad/phishing reject rules',
  );

  for (const [providerName, provider] of Object.entries(providers)) {
    if (provider && provider.type === 'http') {
      record.expectEqual(provider.proxy, RESTRICTED_SITE, `http rule-provider ${providerName} downloads through restricted-site proxy`);
    }
  }

  for (const rule of rules) {
    for (const providerName of extractRuleSetNames(rule)) {
      record.expect(providerNames.has(providerName), `rule references existing provider ${providerName}`);
    }
    const targetPolicy = extractRuleTarget(rule);
    if (!targetPolicy || targetPolicy === 'no-resolve') continue;
    const knownTarget = groupNames.has(targetPolicy) || DIRECT_POLICIES.has(targetPolicy);
    record.expect(knownTarget, `rule target exists for ${rule}`);
  }

  record.expect(
    !rules.some((rule) => /^RULE-SET,tiktok,📱 社交媒体/.test(String(rule))),
    'TikTok does not regress to the social-media target',
  );
  record.expect(
    rules.some((rule) => /^RULE-SET,tiktok,🎵 TikTok/.test(String(rule))),
    'TikTok has its dedicated rule target',
  );
  for (const processName of DIRECT_PROCESS_RULES) {
    record.expect(
      rules.includes(`PROCESS-NAME,${processName},DIRECT`),
      `local client process stays on DIRECT: ${processName}`,
    );
  }
  const workGroupTarget = extractRuleTarget(rules.find((rule) => rule.startsWith('RULE-SET,remotedesktop,')));
  for (const processName of RUSTDESK_WORK_PROCESS_RULES) {
    record.expect(
      rules.includes(`PROCESS-NAME,${processName},${workGroupTarget}`),
      `RustDesk process uses work group instead of broad DIRECT: ${processName}`,
    );
  }
  for (const providerName of WORK_PROVIDER_RULES) {
    record.expect(
      rules.includes(`RULE-SET,${providerName},🧑‍💼 会议协作`),
      `remote-work provider stays in the work collaboration group: ${providerName}`,
    );
  }
  for (const port of STUN_DIRECT_PORTS) {
    record.expect(rules.includes(`DST-PORT,${port},DIRECT`), `STUN/TURN port stays on DIRECT: ${port}`);
  }
  record.expect(!rules.includes('DST-PORT,443,DIRECT'), 'UDP/443 TURN is not globally exempted from QUIC blocking');
  const rustDeskGuardIndex = rules.indexOf('DOMAIN-SUFFIX,rustdesk.com,🧑‍💼 会议协作');
  const copilotIndex = rules.indexOf('RULE-SET,copilot,🤖 AI 服务');
  record.expect(rustDeskGuardIndex !== -1, 'RustDesk domain guard exists before broad Copilot ASN rules');
  record.expect(
    rustDeskGuardIndex !== -1 && copilotIndex !== -1 && rustDeskGuardIndex < copilotIndex,
    'RustDesk domain guard is evaluated before RuleSet/copilot',
  );

  if (target.requireTunExcludes) {
    const excludes = output.tun && output.tun['exclude-process'];
    record.expect(Array.isArray(excludes), 'TUN exclude-process list exists');
    if (Array.isArray(excludes)) {
      for (const proc of ['GSCService.exe', 'GCUService.exe', 'WorkPro.exe']) {
        record.expect(excludes.includes(proc), `TUN exclude-process contains ${proc}`);
      }
    }
  }
}

function validateGeneral(output, record) {
  record.expect(output.dns && typeof output.dns === 'object', 'DNS object exists after overwrite');
  record.expectEqual(output.dns.enable, true, 'DNS is explicitly enabled');
  record.expectEqual(output.dns.listen, '0.0.0.0:1053', 'DNS listener is explicit for UI overwrite clients');
  record.expectEqual(output.dns['enhanced-mode'], 'fake-ip', 'DNS enhanced-mode defaults to fake-ip');
  record.expectEqual(output.dns['fake-ip-range'], '198.18.0.1/16', 'DNS fake-ip range is explicit');
  record.expectEqual(output.dns['prefer-h3'], false, 'DNS prefer-h3 stays disabled when respect-rules is enabled');
  record.expectEqual(output.dns['respect-rules'], true, 'DNS resolver connections respect route rules');
  record.expectEqual(output.dns['use-system-hosts'], false, 'DNS does not inherit system hosts');
  record.expectEqual(output.dns['cache-algorithm'], 'arc', 'DNS cache uses ARC');
  record.expect(Array.isArray(output.dns.nameserver) && output.dns.nameserver.length > 0, 'DNS nameserver fallback is nonempty');
  record.expect(Array.isArray(output.dns['fake-ip-filter']) && output.dns['fake-ip-filter'].includes('+.rustdesk.com'), 'RustDesk domains receive real IP in fake-ip-filter');
  for (const entry of ['+.msftconnecttest.com', '+.msftncsi.com', '+.in-addr.arpa', '+.ip6.arpa']) {
    record.expect(Array.isArray(output.dns['fake-ip-filter']) && output.dns['fake-ip-filter'].includes(entry), `split DNS fake-ip bypass includes ${entry}`);
  }
  for (const entry of STUN_FAKE_IP_FILTER_ENTRIES) {
    record.expect(Array.isArray(output.dns['fake-ip-filter']) && output.dns['fake-ip-filter'].includes(entry), `STUN/TURN domain receives real IP in fake-ip-filter: ${entry}`);
  }
  record.expectArrayEqual(output.dns['default-nameserver'], ['223.5.5.5', '119.29.29.29', '1.1.1.1', '8.8.8.8'], 'default DNS bootstrap stays pure IP');
  record.expectArrayEqual(output.dns.nameserver, ['https://dns.alidns.com/dns-query', 'https://doh.pub/dns-query'], 'primary nameserver is domestic DoH');
  record.expectArrayEqual(output.dns['direct-nameserver'], ['https://dns.alidns.com/dns-query', 'https://doh.pub/dns-query'], 'direct DNS is domestic DoH');
  record.expectArrayEqual(output.dns['proxy-server-nameserver'], ['https://cloudflare-dns.com/dns-query', 'https://dns.google/dns-query', 'https://dns.alidns.com/dns-query', 'https://doh.pub/dns-query'], 'proxy server DNS is foreign DoH first with domestic DoH backup');
  record.expectArrayEqual(output.dns.fallback, ['https://cloudflare-dns.com/dns-query', 'https://dns.google/dns-query'], 'fallback DNS is foreign DoH');
  const nameserverPolicy = output.dns['nameserver-policy'] && typeof output.dns['nameserver-policy'] === 'object' ? output.dns['nameserver-policy'] : {};
  record.expect(Object.keys(nameserverPolicy).length > 0, 'DNS nameserver-policy exists');
  record.expectArrayEqual(nameserverPolicy['+.githubusercontent.com'] || [], ['https://cloudflare-dns.com/dns-query', 'https://dns.google/dns-query'], 'GitHub asset DNS policy uses foreign DoH');
  const fallbackFilter = output.dns['fallback-filter'] && typeof output.dns['fallback-filter'] === 'object' ? output.dns['fallback-filter'] : {};
  record.expect(Object.keys(fallbackFilter).length > 0, 'DNS fallback-filter exists');
  record.expectArrayEqual(fallbackFilter.geosite || [], ['gfw', 'geolocation-!cn'], 'fallback-filter routes GFW/non-CN domains to fallback DNS');
  record.expect(output.profile && output.profile['store-selected'] === true, 'profile.store-selected is enabled');

  const proxies = proxyByName(output);
  const fpInjected = proxies.get('USA 01 Home IP x1');
  const fpPreserved = proxies.get('JPN 01 Tokyo Home x1');
  record.expect(fpInjected && !!fpInjected['client-fingerprint'], 'TLS proxy without fingerprint receives a deterministic client-fingerprint');
  record.expect(fpPreserved && fpPreserved['client-fingerprint'] === 'safari', 'existing client-fingerprint is preserved');
}

function validateFlClashRefs(target, config, refs, record) {
  if (!target.preserveArrayRefs) return;
  record.expect(config['proxy-groups'] === refs.groups, 'FlClash preserves proxy-groups array identity for QuickJS/Dart bridge');
  record.expect(config.rules === refs.rules, 'FlClash preserves rules array identity for QuickJS/Dart bridge');
  record.expect(config['rule-providers'] === refs.providers, 'FlClash preserves rule-providers object identity for QuickJS/Dart bridge');
}

function runTarget(target, options) {
  const record = makeRecorder(target);
  const { exports: api, logs } = loadOverwrite(target);
  const fixture = makeFixtureConfig();

  record.expect(api && typeof api.main === 'function', 'main(config) is exported by the VM harness');
  validateClassification(target, api, fixture, record);

  const config = deepClone(fixture);
  const refs = {
    groups: config['proxy-groups'],
    rules: config.rules,
    providers: config['rule-providers'],
  };

  let output = null;
  if (record.failures.length === 0) {
    output = api.main(config);
    record.expect(output === config, 'main(config) returns the same config object');
    validateFlClashRefs(target, config, refs, record);
    validateGroups(target, output, record);
    validateRulesAndProviders(output, record, target);
    validateGeneral(output, record);
  }

  const summary = output ? {
    id: target.id,
    label: target.label,
    version: api.VERSION,
    groups: (output['proxy-groups'] || []).length,
    rules: (output.rules || []).length,
    providers: Object.keys(output['rule-providers'] || {}).length,
    logs: logs.length,
  } : {
    id: target.id,
    label: target.label,
    version: api && api.VERSION,
    groups: 0,
    rules: 0,
    providers: 0,
    logs: logs.length,
  };

  if (options.verbose && !options.json) {
    for (const line of logs) console.log(`[${target.id}] ${line}`);
  }

  return { ok: record.failures.length === 0, summary, failures: record.failures };
}

function printHuman(results) {
  for (const result of results) {
    const s = result.summary;
    const status = result.ok ? 'PASS' : 'FAIL';
    console.log(`${status} ${s.label} ${s.version || ''} groups=${s.groups} rules=${s.rules} providers=${s.providers}`);
    for (const failure of result.failures) {
      console.log(`  - ${failure}`);
    }
  }
}

function main() {
  const options = parseArgs(process.argv.slice(2));
  const selected = options.target ? TARGETS.filter((target) => target.id === options.target) : TARGETS;
  const results = selected.map((target) => runTarget(target, options));
  if (options.json) {
    console.log(JSON.stringify(results, null, 2));
  } else {
    printHuman(results);
  }
  if (results.some((result) => !result.ok)) process.exit(1);
}

try {
  main();
} catch (error) {
  console.error(error && error.stack ? error.stack : String(error));
  process.exit(1);
}
