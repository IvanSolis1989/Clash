const fs = require('fs');
const path = 'SingBox/SingBox(sing-box)-full.json';

const data = JSON.parse(fs.readFileSync(path, 'utf8'));

// 1. Update _meta
data.experimental._meta.version = 'v5.3.0-sing.1';
data.experimental._meta.build = '2026-04-26';

// 2. Build the 8 new streaming outbound selectors
const standardProxies = [
  '🌍 全球节点', '🏡 全球家宽',
  '🇭🇰 香港节点', '🏡 香港家宽',
  '🇹🇼 台湾节点', '🏡 台湾家宽',
  '🇯🇵 日韩节点', '🏡 日韩家宽',
  '🌏 亚太节点', '🏡 亚太家宽',
  '🇺🇸 美国节点', '🏡 美国家宽',
  '🇪🇺 欧洲节点', '🏡 欧洲家宽',
  '🌎 美洲节点', '🏡 美洲家宽',
  '🌍 非洲节点', '🏡 非洲家宽',
  'DIRECT'
];

function selector(tag) {
  return {
    type: 'selector',
    tag,
    outbounds: standardProxies,
    default: standardProxies[0]
  };
}

const newStreamingOutbounds = [
  selector('🎥 Netflix'),
  selector('🎬 Disney+'),
  selector('📡 HBO/Max'),
  selector('📺 Hulu'),
  selector('🎬 Prime Video'),
  selector('📹 YouTube'),
  selector('🎵 音乐流媒体'),
  selector('🌐 其他国外流媒体')
];

// 3. Remove old outbounds and insert new ones
const oldTagsToRemove = new Set(['📺 东南亚流媒体', '🇺🇸 美国流媒体']);
const insertAfterTag = '📺 国内流媒体';

const newOutbounds = [];
let inserted = false;

for (const ob of data.outbounds) {
  if (oldTagsToRemove.has(ob.tag)) {
    continue; // skip old ones
  }
  newOutbounds.push(ob);
  if (ob.tag === insertAfterTag && !inserted) {
    newOutbounds.push(...newStreamingOutbounds);
    inserted = true;
  }
}
data.outbounds = newOutbounds;

// 4. Replace rule outbound references
function replaceOutbound(rules, oldOutbound, newOutbound) {
  for (const rule of rules) {
    if (rule.outbound === oldOutbound) {
      rule.outbound = newOutbound;
    }
  }
}

// 4a. First, do the specific platform splits for 🇺🇸 美国流媒体
// These are identified by checking the rule content alongside the outbound

// Helper: find rules matching specific criteria
function findRulesByOutbound(rules, outbound) {
  return rules.filter(r => r.outbound === outbound);
}

const usMediaRules = findRulesByOutbound(data.route.rules, '🇺🇸 美国流媒体');

// Track which rules we've handled
const handled = new Set();

function ruleKey(rule) {
  return JSON.stringify(rule);
}

for (const rule of usMediaRules) {
  const key = ruleKey(rule);
  if (handled.has(key)) continue;

  if (rule.rule_set) {
    // rule_set references
    if (rule.rule_set.includes('netflix') || rule.rule_set.includes('netflix-ip')) {
      rule.outbound = '🎥 Netflix';
      handled.add(key);
    } else if (rule.rule_set.includes('youtube')) {
      rule.outbound = '📹 YouTube';
      handled.add(key);
    } else if (rule.rule_set.includes('spotify')) {
      rule.outbound = '🎵 音乐流媒体';
      handled.add(key);
    }
  } else if (rule.geoip) {
    if (rule.geoip.includes('netflix')) {
      rule.outbound = '🎥 Netflix';
      handled.add(key);
    }
  } else if (rule.domain_suffix) {
    const domains = rule.domain_suffix;
    // YouTube domains
    if (domains.some(d => /youtube|youtu\.be|googlevideo|ytimg|ggpht/.test(d))) {
      rule.outbound = '📹 YouTube';
      handled.add(key);
    }
    // Music streaming domains
    else if (domains.some(d => /spotify|soundcloud|sndcdn|pandora|deezer|tidal|applemusic/.test(d))) {
      rule.outbound = '🎵 音乐流媒体';
      handled.add(key);
    }
    // HBO/Max
    else if (domains.some(d => /max\.com/.test(d))) {
      rule.outbound = '📡 HBO/Max';
      handled.add(key);
    }
    // Everything else goes to 其他国外流媒体
    else {
      rule.outbound = '🌐 其他国外流媒体';
      handled.add(key);
    }
  } else if (rule.domain) {
    if (rule.domain.some(d => /youtube|youtu\.be/.test(d))) {
      rule.outbound = '📹 YouTube';
      handled.add(key);
    } else {
      rule.outbound = '🌐 其他国外流媒体';
      handled.add(key);
    }
  } else if (rule.domain_keyword) {
    rule.outbound = '🌐 其他国外流媒体';
    handled.add(key);
  } else {
    rule.outbound = '🌐 其他国外流媒体';
    handled.add(key);
  }
}

// Any remaining 🇺🇸 美国流媒体 references (shouldn't happen but safety net)
replaceOutbound(data.route.rules, '🇺🇸 美国流媒体', '🌐 其他国外流媒体');

// 4b. Replace 📺 东南亚流媒体 → 🌐 其他国外流媒体
replaceOutbound(data.route.rules, '📺 东南亚流媒体', '🌐 其他国外流媒体');

fs.writeFileSync(path, JSON.stringify(data, null, 2) + '\n');
console.log('SingBox JSON updated successfully.');
console.log('New outbound tags:', data.outbounds.filter(o => o.type === 'selector').map(o => o.tag).join(', '));
