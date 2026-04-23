const fs = require('fs');
const vm = require('vm');

const clashScript = fs.readFileSync('Clash Party/ClashParty(mihomo-smart).js', 'utf8');
const baseConfig = JSON.parse(fs.readFileSync('SingBox/SingBox(sing-box).json', 'utf8'));

const sandbox = { console };
vm.createContext(sandbox);
vm.runInContext(clashScript + '\nthis.__main = main;', sandbox);
if (typeof sandbox.__main !== 'function') throw new Error('main() not found');

function p(name) {
  return { name, type: 'trojan', server: 'example.com', port: 443, password: 'x', tls: true };
}

const proxies = [
  p('🇭🇰 HK-01'), p('🇭🇰 HK-02'),
  p('🇹🇼 TW-01'),
  p('🇯🇵 JP-01'), p('🇰🇷 KR-01'),
  p('🇸🇬 SG-01'), p('印尼 Jakarta 01'),
  p('🇺🇸 US-01'), p('🇺🇸 US-02'),
  p('🇪🇺 DE-01'), p('🇨🇦 CA-01'),
  p('🇿🇦 South Africa-01'),
  p('🇨🇳 回国专线-01')
];

const clashConfig = { proxies, 'proxy-groups': [], rules: [] };
const out = sandbox.__main(clashConfig);
const providers = out['rule-providers'] || {};
const rules = out.rules || [];

function toSingRule(ruleText) {
  if (typeof ruleText !== 'string') return null;
  const parts = ruleText.split(',');
  const type = parts[0];

  if (type === 'RULE-SET') {
    if (parts[2] === 'REJECT') return { rule_set: [parts[1]], action: 'reject' };
    return { rule_set: [parts[1]], action: 'route', outbound: parts[2] };
  }
  if (type === 'DOMAIN-SUFFIX') {
    return { domain_suffix: [parts[1]], action: 'route', outbound: parts[2] };
  }
  if (type === 'DOMAIN') {
    return { domain: [parts[1]], action: 'route', outbound: parts[2] };
  }
  if (type === 'DOMAIN-KEYWORD') {
    return { domain_keyword: [parts[1]], action: 'route', outbound: parts[2] };
  }
  if (type === 'IP-CIDR' || type === 'IP-CIDR6' || type === 'SRC-IP-CIDR') {
    return { ip_cidr: [parts[1]], action: 'route', outbound: parts[2] };
  }
  if (type === 'GEOIP') {
    if (parts[1] === 'private') return { ip_is_private: true, action: 'route', outbound: parts[2] };
    return { geoip: [parts[1]], action: 'route', outbound: parts[2] };
  }
  if (type === 'PROCESS-NAME') {
    return { process_name: [parts[1]], action: 'route', outbound: parts[2] };
  }
  if (type === 'DST-PORT') {
    const port = Number(parts[1]);
    if (parts[2] === 'REJECT') return { port: Number.isFinite(port) ? [port] : [parts[1]], action: 'reject' };
    return { port: Number.isFinite(port) ? [port] : [parts[1]], action: 'route', outbound: parts[2] };
  }
  if (type === 'GEOSITE') {
    const tag = `geosite-${parts[1]}`;
    if (parts[2] === 'REJECT') return { rule_set: [tag], action: 'reject' };
    return { rule_set: [tag], action: 'route', outbound: parts[2] };
  }
  if (type === 'NETWORK') {
    return { network: parts[1], action: 'route', outbound: parts[2] };
  }
  if (type === 'MATCH') {
    return { action: 'route', outbound: parts[1] };
  }
  return null;
}

function toSrsUrl(url) {
  if (!url) return '';
  if (url.endsWith('.srs')) return url;
  return url.replace(/\.mrs$/i, '.srs').replace(/\.yaml$/i, '.srs').replace(/\.list$/i, '.srs').replace(/\.txt$/i, '.srs');
}

const ruleSet = Object.entries(providers).map(([tag, info]) => ({
  type: 'remote',
  tag,
  format: 'binary',
  url: toSrsUrl(info.url),
  download_detour: '🌍 全球节点',
  update_interval: '1d'
}));

const convertedRules = rules.map(toSingRule).filter(Boolean);

const extraGeoSiteTags = Array.from(new Set(
  rules
    .map((r) => String(r).split(','))
    .filter((p) => p[0] === 'GEOSITE' && p[1])
    .map((p) => `geosite-${p[1]}`)
)).map((tag) => ({
  type: 'remote',
  tag,
  format: 'binary',
  url: `https://fastly.jsdelivr.net/gh/MetaCubeX/meta-rules-dat@sing/geo/geosite/${tag.replace('geosite-', '')}.srs`,
  download_detour: '🌍 全球节点',
  update_interval: '1d'
}));

baseConfig.route.rule_set = [...ruleSet, ...extraGeoSiteTags];
baseConfig.route.rules = convertedRules;
baseConfig.route.final = '🐟 漏网之鱼';

fs.writeFileSync('SingBox/SingBox(sing-box)-full.json', JSON.stringify(baseConfig, null, 2) + '\n');

console.log(`providers=${ruleSet.length} rules=${convertedRules.length}`);
