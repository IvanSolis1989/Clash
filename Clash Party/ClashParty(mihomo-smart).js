// Clash Smart 内核覆写脚本 - SUB-STORE 多机场精细分流版
// 版本：v6.0.2 (2026-07-10)
// 架构：SUB-STORE 多机场融合 + 22 Smart 区域组（11 全部 + 11 家宽）+ 33 业务策略组 + 113 融合 rule-providers / 130 rules
// 规则源：rulesets/source/routing-graph.js v6.0.2（474 providers / 931 rules -> fused 114 / 131；同策略规范化与语义去重）
// 变更历史：见 `Clash Party/CHANGELOG.md`

// ================================================================
//  版本常量
// ================================================================

const VERSION = 'v6.0.2'

// ================================================================
//  模块 A：节点过滤 / 家宽识别
// ================================================================

function isInfoNode(name) {
  // v5.4.20 #6 借鉴 Proxy-override：补充 junk 关键词（免费/试用/应急 中文子串；Sign/Login/Register/Help/FAQ 英文用 \b 词边界，避免误伤 Signal 等合法节点）。不加「更新/地址」（误伤风险高）。
  const infoPatterns = ['导航网址', '距离下次重置', '剩余流量', '套餐到期', '网址导航', '官网', '订阅', '到期', '剩余', '重置', '免费', '试用', '应急']
  const infoRes = [/\b(?:USE|USED|TOTAL|EXPIRE|EMAIL)\b/i, /Panel|Channel|Author|剩余流量|已用流量|到期时间|下次重置/i, /\b(?:Sign|Login|Register|Help|FAQ)\b/i]
  const s = String(name || '')
  return infoPatterns.some(p => s.includes(p)) || infoRes.some(re => re.test(s))
}

const RESIDENTIAL_PATTERNS = [
  /家宽|家庭宽带|家庭住宅|住宅宽带|住宅|宽带/,
  /\bresi(?:dential)?\b/i,
  /\bhome(?:\s|-|_)?ip\b/i,
  /\bhome(?:\s|-|_)?broadband\b/i,
  /\bhome\b/i,
  /\bbroadband\b/i,
  /\bisp\b/i,
  // v5.4.4 FEAT#143: IEPL/IPLC 专线节点纳入家宽组——专线质量与家宽同级
  /\biplc\b/i,
  /\biepl\b/i,
  /专线/,
]

function isResidentialNode(name) {
  const s = String(name || '')
  return RESIDENTIAL_PATTERNS.some(re => re.test(s))
}

// ================================================================
//  模块 B：国家/地区分类数据库（v4.5.1 修复 CN 区域）
// ================================================================

const REGION_DB = [
  // v5.2.6 FIX#24-P0: 补齐 ISO alpha-3 代码（TWN/JPN/KOR/SGP/USA/CHN/HKG），
  //   避免 "TWN 01"、"JPN 01"、"KOR 01"、"SGP 01" 命名的节点被归为 UNCLASSIFIED
  //   进而触发 apacNodes / c.ALL fallback，把 HK 等节点塞入 🇹🇼 台湾节点 / 🇯🇵 日韩节点
  { id: 'HK', kw: ['香港', 'hong kong', 'hongkong', 'hkg', '港'], iso: ['HK'] },
  { id: 'TW', kw: ['台湾', '台北', '台中', '高雄', '新北', '桃园', 'taiwan', 'taipei', 'taichung', 'kaohsiung', 'tpe', 'twn'], iso: ['TW'] },
  { id: 'CN', kw: ['中国', '大陆', '国内', '中国大陆', 'china', 'mainland', '回国节点', '回国专线', '回国线路', '回国加速', '回国服务', '直连国内', '国内直连', '中转国内', '落地国内', '北京', '上海', '广州', '深圳', 'beijing', 'shanghai', 'guangzhou', 'shenzhen', '成都', '重庆', '杭州', '南京', '武汉', '天津', '苏州', '西安', '长沙', 'chengdu', 'chongqing', 'hangzhou', 'nanjing', 'wuhan', 'tianjin', 'suzhou', 'xian', 'changsha', '沈阳', '青岛', '郑州', '大连', '东莞', '宁波', '厦门', '济南', '无锡', '合肥', '昆明', '福州', '哈尔滨', '佛山', '长春', '石家庄', '太原', '南宁', '贵阳', '乌鲁木齐', '兰州', '海口', '银川', '西宁', '拉萨', '呼和浩特', '电信', '联通', '移动', '铁通', 'chinatelecom', 'chinaunicom', 'chinamobile', 'chn', 'pek', 'pkx', 'pvg', 'szx', 'ctu', 'ckg', 'hgh', 'nkg', 'wuh', 'tsn', 'syx', 'xiy', 'csx', 'kmg', 'hak', 'dlc', 'tao', 'she', 'hrb', 'cgo'], iso: ['CN'] },
  { id: 'JP', kw: ['日本', '东京', '大阪', '横滨', '名古屋', '福冈', '札幌', '京都', '神户', '千叶', '埼玉', '仙台', '广岛', '冲绳', '那霸', 'japan', 'tokyo', 'osaka', 'yokohama', 'nagoya', 'fukuoka', 'sapporo', 'kyoto', 'kobe', 'chiba', 'sendai', 'hiroshima', 'okinawa', 'naha', 'jpn', 'nrt', 'hnd', 'kix', 'ngo', 'fuk', 'cts', 'oka'], iso: ['JP'] },
  { id: 'KR', kw: ['韩国', '首尔', '釜山', '仁川', '大田', '大邱', '光州', '济州', 'korea', 'seoul', 'busan', 'incheon', 'daejeon', 'daegu', 'gwangju', 'jeju', 'kor', 'icn', 'gmp', 'pus'], iso: ['KR'] },
  { id: 'SG', kw: ['新加坡', 'singapore', 'sgp', 'sin'], iso: ['SG'] },
  { id: 'US', kw: ['美国', 'united states', 'america', 'usa', '洛杉矶', 'los angeles', '圣何塞', 'san jose', '旧金山', '三藩市', 'san francisco', '西雅图', 'seattle', '纽约', 'new york', '芝加哥', 'chicago', '达拉斯', 'dallas', '丹佛', 'denver', '凤凰城', 'phoenix', '亚特兰大', 'atlanta', '迈阿密', 'miami', '波士顿', 'boston', '华盛顿', 'washington', '费城', 'philadelphia', '休斯顿', 'houston', '圣地亚哥', 'san diego', '拉斯维加斯', 'las vegas', '波特兰', 'portland', '硅谷', 'silicon valley', '弗吉尼亚', 'virginia', '夏洛特', 'charlotte', '奥斯汀', 'austin', '纳什维尔', 'nashville', '盐湖城', 'salt lake', '明尼阿波利斯', 'minneapolis', '圣路易斯', 'st louis', '堪萨斯', 'kansas city', '底特律', 'detroit', '匹兹堡', 'pittsburgh', '克利夫兰', 'cleveland', '檀香山', 'honolulu', '安克雷奇', 'anchorage', 'lax', 'sjc', 'sfo', 'sea', 'jfk', 'ewr', 'ord', 'dfw', 'iad', 'atl', 'mia', 'bos', 'den', 'phx', 'iah', 'msp', 'dtw', 'phl', 'san', 'las', 'slc', 'pdx', 'clt', 'hnl', 'anc'], iso: ['US'] },
  { id: 'EU', kw: ['欧洲', 'europe', '英国', 'united kingdom', 'england', 'britain', 'london', '伦敦', 'manchester', '曼彻斯特', 'birmingham', 'glasgow', 'edinburgh', 'liverpool', 'leeds', 'bristol', 'lhr', 'lgw', 'man', 'edi', '爱尔兰', 'ireland', 'dublin', '都柏林', '法国', 'france', 'paris', '巴黎', 'marseille', '马赛', 'lyon', '里昂', 'nice', 'toulouse', 'cdg', 'ory', '德国', 'germany', 'frankfurt', '法兰克福', 'berlin', '柏林', 'munich', '慕尼黑', 'hamburg', '汉堡', 'dusseldorf', 'cologne', 'fra', 'muc', 'ber', '荷兰', 'netherlands', 'holland', 'amsterdam', '阿姆斯特丹', 'rotterdam', 'ams', '比利时', 'belgium', 'brussels', '布鲁塞尔', '卢森堡', 'luxembourg', '瑞士', 'switzerland', 'zurich', '苏黎世', 'geneva', '日内瓦', 'bern', 'zrh', '奥地利', 'austria', 'vienna', '维也纳', 'vie', '列支敦士登', 'liechtenstein', '摩纳哥', 'monaco', '丹麦', 'denmark', 'copenhagen', '哥本哈根', '冰岛', 'iceland', 'reykjavik', '挪威', 'norway', 'oslo', '奥斯陆', '瑞典', 'sweden', 'stockholm', '斯德哥尔摩', '芬兰', 'finland', 'helsinki', '赫尔辛基', '爱沙尼亚', 'estonia', 'tallinn', '塔林', '拉脱维亚', 'latvia', 'riga', '里加', '立陶宛', 'lithuania', 'vilnius', '维尔纽斯', '意大利', 'italy', 'rome', '罗马', 'milan', '米兰', 'naples', 'florence', 'fco', 'mxp', '西班牙', 'spain', 'madrid', '马德里', 'barcelona', '巴塞罗那', 'mad', 'bcn', '葡萄牙', 'portugal', 'lisbon', '里斯本', '希腊', 'greece', 'athens', '雅典', '马耳他', 'malta', '安道尔', 'andorra', '圣马力诺', 'san marino', '波兰', 'poland', 'warsaw', '华沙', 'krakow', 'waw', '捷克', 'czech', 'prague', '布拉格', '斯洛伐克', 'slovakia', 'bratislava', '匈牙利', 'hungary', 'budapest', '布达佩斯', '罗马尼亚', 'romania', 'bucharest', '布加勒斯特', '保加利亚', 'bulgaria', 'sofia', '索菲亚', '俄罗斯', 'russia', 'moscow', '莫斯科', 'svo', 'dme', '乌克兰', 'ukraine', 'kiev', 'kyiv', '基辅', '白俄罗斯', 'belarus', 'minsk', '明斯克', '摩尔多瓦', 'moldova', 'chisinau', '塞尔维亚', 'serbia', 'belgrade', '贝尔格莱德', '黑山', 'montenegro', '克罗地亚', 'croatia', 'zagreb', '斯洛文尼亚', 'slovenia', 'ljubljana', '波黑', 'bosnia', 'herzegovina', 'sarajevo', '马其顿', 'macedonia', 'skopje', '阿尔巴尼亚', 'albania', 'tirana', '科索沃', 'kosovo', 'pristina', '塞浦路斯', 'cyprus', 'nicosia', '格鲁吉亚', 'georgia', 'tbilisi', '第比利斯'], iso: ['GB', 'UK', 'IE', 'FR', 'DE', 'NL', 'LU', 'CH', 'DK', 'SE', 'FI', 'EE', 'LV', 'LT', 'ES', 'PT', 'GR', 'PL', 'CZ', 'SK', 'HU', 'RO', 'BG', 'RU', 'UA', 'MD', 'RS', 'HR', 'SI', 'MK', 'XK', 'CY', 'GE', 'EU'] },
  { id: 'AM', kw: ['美洲', 'americas', '拉丁美洲', 'latin america', '南美', 'south america', '中美洲', 'central america', '加勒比', 'caribbean', '加拿大', 'canada', 'toronto', '多伦多', 'vancouver', '温哥华', 'montreal', '蒙特利尔', 'ottawa', '渥太华', 'calgary', '卡尔加里', 'edmonton', 'winnipeg', 'yyz', 'yvr', 'yul', '墨西哥', 'mexico', 'mexico city', '墨西哥城', 'cancun', '坎昆', 'guadalajara', 'monterrey', 'mex', '危地马拉', 'guatemala', '伯利兹', 'belize', '萨尔瓦多', 'el salvador', '洪都拉斯', 'honduras', '尼加拉瓜', 'nicaragua', '哥斯达黎加', 'costa rica', '巴拿马', 'panama', '古巴', 'cuba', '牙买加', 'jamaica', '多米尼加', 'dominican republic', '波多黎各', 'puerto rico', '巴哈马', 'bahamas', '巴巴多斯', 'barbados', '特立尼达', 'trinidad', '海地', 'haiti', '巴西', 'brazil', 'sao paulo', '圣保罗', 'rio de janeiro', '里约热内卢', 'gru', 'gig', '阿根廷', 'argentina', 'buenos aires', '布宜诺斯艾利斯', 'eze', '智利', 'chile', 'santiago', '秘鲁', 'peru', 'lima', '利马', '哥伦比亚', 'colombia', 'bogota', '波哥大', 'medellin', '委内瑞拉', 'venezuela', '厄瓜多尔', 'ecuador', '玻利维亚', 'bolivia', '巴拉圭', 'paraguay', '乌拉圭', 'uruguay', 'montevideo', '圭亚那', 'guyana', '苏里南', 'suriname'], iso: ['CA', 'MX', 'GT', 'BZ', 'SV', 'HN', 'NI', 'CR', 'PA', 'CU', 'JM', 'PR', 'BS', 'BB', 'TT', 'HT', 'BR', 'AR', 'CL', 'PE', 'CO', 'VE', 'EC', 'BO', 'PY', 'UY', 'GY', 'SR'] },
  { id: 'AF', kw: ['非洲', 'africa', '埃及', 'egypt', 'cairo', '开罗', 'cai', '苏丹', 'sudan', '南苏丹', 'south sudan', '利比亚', 'libya', '突尼斯', 'tunisia', '阿尔及利亚', 'algeria', '摩洛哥', 'morocco', 'casablanca', '埃塞俄比亚', 'ethiopia', '索马里', 'somalia', '肯尼亚', 'kenya', 'nairobi', 'nbo', '坦桑尼亚', 'tanzania', '乌干达', 'uganda', '卢旺达', 'rwanda', '布隆迪', 'burundi', '厄立特里亚', 'eritrea', '吉布提', 'djibouti', '马达加斯加', 'madagascar', '毛里求斯', 'mauritius', '莫桑比克', 'mozambique', '塞舌尔', 'seychelles', '赞比亚', 'zambia', '津巴布韦', 'zimbabwe', '马拉维', 'malawi', '喀麦隆', 'cameroon', '刚果', 'congo', '安哥拉', 'angola', '加蓬', 'gabon', '乍得', 'chad', '中非', 'central african', '赤道几内亚', 'equatorial guinea', '南非', 'south africa', 'johannesburg', '约翰内斯堡', 'cape town', '开普敦', 'pretoria', 'jnb', 'cpt', '纳米比亚', 'namibia', '博茨瓦纳', 'botswana', '莱索托', 'lesotho', '斯威士兰', 'eswatini', 'swaziland', '尼日利亚', 'nigeria', 'lagos', 'abuja', '加纳', 'ghana', 'accra', '塞内加尔', 'senegal', 'dakar', '马里', 'mali', '布基纳法索', 'burkina faso', '几内亚', 'guinea', '科特迪瓦', 'ivory coast', "cote d'ivoire", '塞拉利昂', 'sierra leone', '利比里亚', 'liberia', '多哥', 'togo', '贝宁', 'benin', '尼日尔', 'niger', '毛里塔尼亚', 'mauritania', '冈比亚', 'gambia', '佛得角', 'cape verde'], iso: ['EG', 'SD', 'SS', 'LY', 'TN', 'DZ', 'ET', 'KE', 'TZ', 'UG', 'RW', 'MG', 'MU', 'MZ', 'ZM', 'ZW', 'MW', 'CM', 'CD', 'CG', 'AO', 'GA', 'TD', 'ZA', 'BW', 'LS', 'SZ', 'NG', 'GH', 'SN', 'ML', 'BF', 'GN', 'CI', 'SL', 'LR', 'TG', 'BJ', 'NE', 'MR', 'GM', 'CV'] },
  { id: 'APAC_OTHER', kw: ['马来','亚太', 'apac', 'asia pacific', 'asia', '亚洲', '大洋洲', 'oceania', 'iplc', 'iepl', '专线', '低延迟', 'cn2', 'gia', '马来西亚', 'malaysia', 'kuala lumpur', '吉隆坡', 'kul', '印度尼西亚', '印尼', 'indonesia', 'jakarta', '雅加达', '泰国', 'thailand', 'bangkok', '曼谷', 'bkk', '越南', 'vietnam', 'hanoi', '河内', 'ho chi minh', '胡志明', 'saigon', 'sgn', 'han', '菲律宾', 'philippines', 'manila', '马尼拉', 'mnl', '柬埔寨', 'cambodia', 'phnom penh', '金边', '缅甸', 'myanmar', 'yangon', '老挝', 'laos', 'vientiane', '文莱', 'brunei', '东帝汶', 'timor-leste', '印度', 'india', 'mumbai', '孟买', 'delhi', '新德里', 'bangalore', '班加罗尔', 'chennai', 'hyderabad', 'kolkata', 'bom', 'del', 'blr', '巴基斯坦', 'pakistan', 'karachi', 'islamabad', '孟加拉', 'bangladesh', 'dhaka', '斯里兰卡', 'sri lanka', 'colombo', '尼泊尔', 'nepal', 'kathmandu', '马尔代夫', 'maldives', '不丹', 'bhutan', '阿富汗', 'afghanistan', '土耳其', 'turkey', 'turkiye', 'istanbul', '伊斯坦布尔', 'ankara', 'ist', '以色列', 'israel', 'tel aviv', 'tlv', '沙特', 'saudi', 'riyadh', '阿联酋', 'uae', 'emirates', 'dubai', '迪拜', 'abu dhabi', 'dxb', 'auh', '卡塔尔', 'qatar', 'doha', 'doh', '科威特', 'kuwait', '巴林', 'bahrain', '阿曼', 'oman', 'muscat', '伊拉克', 'iraq', 'baghdad', '伊朗', 'iran', 'tehran', '约旦', 'jordan', 'amman', '黎巴嫩', 'lebanon', 'beirut', '叙利亚', 'syria', '也门', 'yemen', '巴勒斯坦', 'palestine', '亚美尼亚', 'armenia', 'yerevan', '阿塞拜疆', 'azerbaijan', 'baku', '哈萨克斯坦', 'kazakhstan', 'almaty', 'astana', '乌兹别克斯坦', 'uzbekistan', 'tashkent', '吉尔吉斯斯坦', 'kyrgyzstan', '土库曼斯坦', 'turkmenistan', '塔吉克斯坦', 'tajikistan', '澳门', 'macau', 'macao', '蒙古', 'mongolia', 'ulaanbaatar', '澳大利亚', 'australia', 'sydney', '悉尼', 'melbourne', '墨尔本', 'brisbane', 'perth', 'adelaide', 'syd', 'mel', '新西兰', 'new zealand', 'auckland', '奥克兰', 'wellington', 'akl', '斐济', 'fiji', '巴布亚新几内亚', 'papua new guinea', '关岛', 'guam', '新喀里多尼亚', 'new caledonia'], iso: ['IN','IND','MY','ID', 'TH', 'VN', 'PH', 'KH', 'MM', 'BN', 'TL', 'PK', 'BD', 'LK', 'NP', 'MV', 'BT', 'AF', 'TR', 'IL', 'AE', 'QA', 'KW', 'BH', 'OM', 'IQ', 'IR', 'JO', 'LB', 'SY', 'YE', 'PS', 'AZ', 'KZ', 'UZ', 'KG', 'TM', 'TJ', 'MO', 'MN', 'AU', 'NZ', 'FJ', 'PG', 'GU', 'NC', 'PF'] },
]

// ================================================================
//  模块 C：单次分类引擎
// ================================================================

const _regexCache = new Map()
function _getWordBoundaryRegex(keyword, caseSensitive) {
  const key = (caseSensitive ? 'S:' : 'I:') + keyword
  if (_regexCache.has(key)) return _regexCache.get(key)
  const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const flags = caseSensitive ? '' : 'i'
  const re = new RegExp('(^|[^a-zA-Z])' + escaped + '([^a-zA-Z]|$)', flags)
  _regexCache.set(key, re)
  return re
}
const _CHINESE_RE = /[\u4e00-\u9fa5]/
function _isChinese(str) { return _CHINESE_RE.test(str) }

const _compiledRegions = REGION_DB.map(function(region) {
  var matchers = []
  for (var i = 0; i < region.iso.length; i++) {
    matchers.push({ type: 'iso', regex: _getWordBoundaryRegex(region.iso[i], true) })
  }
  for (var j = 0; j < region.kw.length; j++) {
    var kw = region.kw[j]
    if (_isChinese(kw)) { matchers.push({ type: 'cn', text: kw }) }
    else { matchers.push({ type: 'en', regex: _getWordBoundaryRegex(kw, false) }) }
  }
  return { id: region.id, matchers: matchers }
})

function classifyNode(name) {
  var nameStr = String(name || '')
  if (!nameStr) return null
  for (var i = 0; i < _compiledRegions.length; i++) {
    var region = _compiledRegions[i]
    for (var j = 0; j < region.matchers.length; j++) {
      var m = region.matchers[j]
      if (m.type === 'cn') { if (nameStr.indexOf(m.text) !== -1) return region.id }
      else { if (m.regex.test(nameStr)) return region.id }
    }
  }
  return 'OTHER'
}

function classifyAllNodes(proxies) {
  var result = {
    HK: [], TW: [], CN: [], JP: [], KR: [], SG: [], US: [], EU: [], AM: [], AF: [], APAC_OTHER: [], OTHER: [], ALL: [],
    HOME_HK: [], HOME_TW: [], HOME_CN: [], HOME_JP: [], HOME_KR: [], HOME_SG: [], HOME_US: [], HOME_EU: [], HOME_AM: [], HOME_AF: [], HOME_APAC_OTHER: [], HOME_OTHER: [], HOME_ALL: [],
  }
  for (var i = 0; i < proxies.length; i++) {
    var p = proxies[i]
    if (!p || typeof p !== 'object' || !p.name) continue
    if (isInfoNode(p.name)) continue
    var name = String(p.name)
    var isHome = isResidentialNode(name)
    result.ALL.push(name)
    if (isHome) result.HOME_ALL.push(name)
    var region = classifyNode(name)
    if (region && result[region]) {
      result[region].push(name)
      if (isHome && result['HOME_' + region]) result['HOME_' + region].push(name)
    } else {
      result.OTHER.push(name)
      if (isHome) result.HOME_OTHER.push(name)
    }
  }
  return result
}

// ================================================================
//  模块 D：常量定义
// ================================================================

const SMART = {
  GLOBAL: '🌍 全球节点', GLOBAL_HOME: '🏡 全球家宽',
  HK: '🇭🇰 香港节点', HK_HOME: '🏡 香港家宽',
  TW: '🇹🇼 台湾节点', TW_HOME: '🏡 台湾家宽',
  SG: '🇸🇬 狮城节点', SG_HOME: '🏡 狮城家宽',
  JPKR: '🇯🇵 日韩节点', JPKR_HOME: '🏡 日韩家宽',
  APAC: '🌏 亚太节点', APAC_HOME: '🏡 亚太家宽',
  US: '🇺🇸 美国节点', US_HOME: '🏡 美国家宽',
  EU: '🇪🇺 欧洲节点', EU_HOME: '🏡 欧洲家宽',
  AMERICAS: '🌎 美洲节点', AMERICAS_HOME: '🏡 美洲家宽',
  AFRICA: '🌍 非洲节点', AFRICA_HOME: '🏡 非洲家宽',
  OTHER: '🌏 其他节点', OTHER_HOME: '🏡 其他家宽',
}

const BIZ = {
  AI: '🤖 AI 服务', CRYPTO: '💰 加密货币', PAYMENTS: '🏦 金融支付',
  IM: '💬 即时通讯', SOCIAL: '📱 社交媒体',
  WORK: '🧑‍💼 会议协作', CNMEDIA: '📺 国内流媒体',
  TOK: '🎵 TikTok',
  NFLX: '🎥 Netflix', DSNP: '🎬 Disney+', HBO: '📡 HBO/Max',
  HULU: '📺 Hulu', PRIME: '🎬 Prime Video',
  YT: '📹 YouTube', MUSIC: '🎵 音乐流媒体',
  STREAM_HK: '🇭🇰 香港流媒体', STREAM_TW: '🇹🇼 台湾流媒体',
  STREAM_JP: '🇯🇵 日韩流媒体', STREAM_EU: '🇪🇺 欧洲流媒体',
  STREAM_OTHER: '🌐 其他国外流媒体',
  GAME_CN: '🕹️ 国内游戏', GAME_INTL: '🎮 国外游戏',
  GOOGLE: '🔍 Google 服务',
  TOOLS: '🔧 工具与服务', MS: 'Ⓜ️ 微软服务', APPLE: '🍎 苹果服务',
  DOWNLOAD: '📥 下载更新', TRACKER: '🛰️ BT/PT Tracker',
  CN_SITE: '🏠 国内网站',
  GFW: '🚫 受限网站', INTL_SITE: '🌐 国外网站',
  FINAL: '🐟 漏网之鱼', AD: '🛑 广告拦截',
}


// BEGIN AUTO-GENERATED MIHOMO FUSED RULE-SETS
// Generated by tools/build-fused-rule-sets.js from rulesets/source/routing-graph.js.
const MIHOMO_FUSED_RULE_PROVIDERS = {"scki-fused-001-direct-domain":{"type":"http","behavior":"domain","format":"mrs","url":"https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/mihomo/scki-fused-001-direct-domain.mrs","path":"./ruleset/scki-fused-001-direct-domain.mrs","interval":86400,"proxy":"🚫 受限网站"},"scki-fused-002-intl-site-domain":{"type":"http","behavior":"domain","format":"mrs","url":"https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/mihomo/scki-fused-002-intl-site-domain.mrs","path":"./ruleset/scki-fused-002-intl-site-domain.mrs","interval":86400,"proxy":"🚫 受限网站"},"scki-fused-003-payments-domain":{"type":"http","behavior":"domain","format":"mrs","url":"https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/mihomo/scki-fused-003-payments-domain.mrs","path":"./ruleset/scki-fused-003-payments-domain.mrs","interval":86400,"proxy":"🚫 受限网站"},"scki-fused-004-cnmedia-domain":{"type":"http","behavior":"domain","format":"mrs","url":"https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/mihomo/scki-fused-004-cnmedia-domain.mrs","path":"./ruleset/scki-fused-004-cnmedia-domain.mrs","interval":86400,"proxy":"🚫 受限网站"},"scki-fused-005-ad-domain":{"type":"http","behavior":"domain","format":"mrs","url":"https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/mihomo/scki-fused-005-ad-domain.mrs","path":"./ruleset/scki-fused-005-ad-domain.mrs","interval":86400,"proxy":"🚫 受限网站"},"scki-fused-005-ad-ipcidr":{"type":"http","behavior":"ipcidr","format":"mrs","url":"https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/mihomo/scki-fused-005-ad-ipcidr.mrs","path":"./ruleset/scki-fused-005-ad-ipcidr.mrs","interval":86400,"proxy":"🚫 受限网站"},"scki-fused-006-cn-site-domain":{"type":"http","behavior":"domain","format":"mrs","url":"https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/mihomo/scki-fused-006-cn-site-domain.mrs","path":"./ruleset/scki-fused-006-cn-site-domain.mrs","interval":86400,"proxy":"🚫 受限网站"},"scki-fused-007-direct-domain":{"type":"http","behavior":"domain","format":"mrs","url":"https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/mihomo/scki-fused-007-direct-domain.mrs","path":"./ruleset/scki-fused-007-direct-domain.mrs","interval":86400,"proxy":"🚫 受限网站"},"scki-fused-007-direct-ipcidr-no-resolve":{"type":"http","behavior":"ipcidr","format":"mrs","url":"https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/mihomo/scki-fused-007-direct-ipcidr-no-resolve.mrs","path":"./ruleset/scki-fused-007-direct-ipcidr-no-resolve.mrs","interval":86400,"proxy":"🚫 受限网站"},"scki-fused-007-direct-residual":{"type":"http","behavior":"classical","format":"yaml","url":"https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/mihomo/scki-fused-007-direct-residual.yaml","path":"./ruleset/scki-fused-007-direct-residual.yaml","interval":86400,"proxy":"🚫 受限网站"},"scki-fused-008-work-residual":{"type":"http","behavior":"classical","format":"yaml","url":"https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/mihomo/scki-fused-008-work-residual.yaml","path":"./ruleset/scki-fused-008-work-residual.yaml","interval":86400,"proxy":"🚫 受限网站"},"scki-fused-009-crypto-domain":{"type":"http","behavior":"domain","format":"mrs","url":"https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/mihomo/scki-fused-009-crypto-domain.mrs","path":"./ruleset/scki-fused-009-crypto-domain.mrs","interval":86400,"proxy":"🚫 受限网站"},"scki-fused-010-gfw-domain":{"type":"http","behavior":"domain","format":"mrs","url":"https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/mihomo/scki-fused-010-gfw-domain.mrs","path":"./ruleset/scki-fused-010-gfw-domain.mrs","interval":86400,"proxy":"🚫 受限网站"},"scki-fused-011-youtube-domain":{"type":"http","behavior":"domain","format":"mrs","url":"https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/mihomo/scki-fused-011-youtube-domain.mrs","path":"./ruleset/scki-fused-011-youtube-domain.mrs","interval":86400,"proxy":"🚫 受限网站"},"scki-fused-012-cn-site-domain":{"type":"http","behavior":"domain","format":"mrs","url":"https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/mihomo/scki-fused-012-cn-site-domain.mrs","path":"./ruleset/scki-fused-012-cn-site-domain.mrs","interval":86400,"proxy":"🚫 受限网站"},"scki-fused-013-ai-domain":{"type":"http","behavior":"domain","format":"mrs","url":"https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/mihomo/scki-fused-013-ai-domain.mrs","path":"./ruleset/scki-fused-013-ai-domain.mrs","interval":86400,"proxy":"🚫 受限网站"},"scki-fused-014-work-domain":{"type":"http","behavior":"domain","format":"mrs","url":"https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/mihomo/scki-fused-014-work-domain.mrs","path":"./ruleset/scki-fused-014-work-domain.mrs","interval":86400,"proxy":"🚫 受限网站"},"scki-fused-015-ai-domain":{"type":"http","behavior":"domain","format":"mrs","url":"https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/mihomo/scki-fused-015-ai-domain.mrs","path":"./ruleset/scki-fused-015-ai-domain.mrs","interval":86400,"proxy":"🚫 受限网站"},"scki-fused-015-ai-ipcidr":{"type":"http","behavior":"ipcidr","format":"mrs","url":"https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/mihomo/scki-fused-015-ai-ipcidr.mrs","path":"./ruleset/scki-fused-015-ai-ipcidr.mrs","interval":86400,"proxy":"🚫 受限网站"},"scki-fused-015-ai-residual":{"type":"http","behavior":"classical","format":"yaml","url":"https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/mihomo/scki-fused-015-ai-residual.yaml","path":"./ruleset/scki-fused-015-ai-residual.yaml","interval":86400,"proxy":"🚫 受限网站"},"scki-fused-016-intl-site-domain":{"type":"http","behavior":"domain","format":"mrs","url":"https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/mihomo/scki-fused-016-intl-site-domain.mrs","path":"./ruleset/scki-fused-016-intl-site-domain.mrs","interval":86400,"proxy":"🚫 受限网站"},"scki-fused-017-im-domain":{"type":"http","behavior":"domain","format":"mrs","url":"https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/mihomo/scki-fused-017-im-domain.mrs","path":"./ruleset/scki-fused-017-im-domain.mrs","interval":86400,"proxy":"🚫 受限网站"},"scki-fused-018-work-domain":{"type":"http","behavior":"domain","format":"mrs","url":"https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/mihomo/scki-fused-018-work-domain.mrs","path":"./ruleset/scki-fused-018-work-domain.mrs","interval":86400,"proxy":"🚫 受限网站"},"scki-fused-019-download-domain":{"type":"http","behavior":"domain","format":"mrs","url":"https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/mihomo/scki-fused-019-download-domain.mrs","path":"./ruleset/scki-fused-019-download-domain.mrs","interval":86400,"proxy":"🚫 受限网站"},"scki-fused-019-download-ipcidr":{"type":"http","behavior":"ipcidr","format":"mrs","url":"https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/mihomo/scki-fused-019-download-ipcidr.mrs","path":"./ruleset/scki-fused-019-download-ipcidr.mrs","interval":86400,"proxy":"🚫 受限网站"},"scki-fused-020-google-domain":{"type":"http","behavior":"domain","format":"mrs","url":"https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/mihomo/scki-fused-020-google-domain.mrs","path":"./ruleset/scki-fused-020-google-domain.mrs","interval":86400,"proxy":"🚫 受限网站"},"scki-fused-020-google-ipcidr-no-resolve":{"type":"http","behavior":"ipcidr","format":"mrs","url":"https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/mihomo/scki-fused-020-google-ipcidr-no-resolve.mrs","path":"./ruleset/scki-fused-020-google-ipcidr-no-resolve.mrs","interval":86400,"proxy":"🚫 受限网站"},"scki-fused-021-ai-domain":{"type":"http","behavior":"domain","format":"mrs","url":"https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/mihomo/scki-fused-021-ai-domain.mrs","path":"./ruleset/scki-fused-021-ai-domain.mrs","interval":86400,"proxy":"🚫 受限网站"},"scki-fused-021-ai-ipcidr-no-resolve":{"type":"http","behavior":"ipcidr","format":"mrs","url":"https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/mihomo/scki-fused-021-ai-ipcidr-no-resolve.mrs","path":"./ruleset/scki-fused-021-ai-ipcidr-no-resolve.mrs","interval":86400,"proxy":"🚫 受限网站"},"scki-fused-021-ai-residual":{"type":"http","behavior":"classical","format":"yaml","url":"https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/mihomo/scki-fused-021-ai-residual.yaml","path":"./ruleset/scki-fused-021-ai-residual.yaml","interval":86400,"proxy":"🚫 受限网站"},"scki-fused-022-crypto-domain":{"type":"http","behavior":"domain","format":"mrs","url":"https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/mihomo/scki-fused-022-crypto-domain.mrs","path":"./ruleset/scki-fused-022-crypto-domain.mrs","interval":86400,"proxy":"🚫 受限网站"},"scki-fused-022-crypto-residual":{"type":"http","behavior":"classical","format":"yaml","url":"https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/mihomo/scki-fused-022-crypto-residual.yaml","path":"./ruleset/scki-fused-022-crypto-residual.yaml","interval":86400,"proxy":"🚫 受限网站"},"scki-fused-023-payments-domain":{"type":"http","behavior":"domain","format":"mrs","url":"https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/mihomo/scki-fused-023-payments-domain.mrs","path":"./ruleset/scki-fused-023-payments-domain.mrs","interval":86400,"proxy":"🚫 受限网站"},"scki-fused-024-microsoft-domain":{"type":"http","behavior":"domain","format":"mrs","url":"https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/mihomo/scki-fused-024-microsoft-domain.mrs","path":"./ruleset/scki-fused-024-microsoft-domain.mrs","interval":86400,"proxy":"🚫 受限网站"},"scki-fused-025-intl-site-domain":{"type":"http","behavior":"domain","format":"mrs","url":"https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/mihomo/scki-fused-025-intl-site-domain.mrs","path":"./ruleset/scki-fused-025-intl-site-domain.mrs","interval":86400,"proxy":"🚫 受限网站"},"scki-fused-026-direct-domain":{"type":"http","behavior":"domain","format":"mrs","url":"https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/mihomo/scki-fused-026-direct-domain.mrs","path":"./ruleset/scki-fused-026-direct-domain.mrs","interval":86400,"proxy":"🚫 受限网站"},"scki-fused-027-im-domain":{"type":"http","behavior":"domain","format":"mrs","url":"https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/mihomo/scki-fused-027-im-domain.mrs","path":"./ruleset/scki-fused-027-im-domain.mrs","interval":86400,"proxy":"🚫 受限网站"},"scki-fused-027-im-ipcidr":{"type":"http","behavior":"ipcidr","format":"mrs","url":"https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/mihomo/scki-fused-027-im-ipcidr.mrs","path":"./ruleset/scki-fused-027-im-ipcidr.mrs","interval":86400,"proxy":"🚫 受限网站"},"scki-fused-027-im-ipcidr-no-resolve":{"type":"http","behavior":"ipcidr","format":"mrs","url":"https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/mihomo/scki-fused-027-im-ipcidr-no-resolve.mrs","path":"./ruleset/scki-fused-027-im-ipcidr-no-resolve.mrs","interval":86400,"proxy":"🚫 受限网站"},"scki-fused-027-im-residual":{"type":"http","behavior":"classical","format":"yaml","url":"https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/mihomo/scki-fused-027-im-residual.yaml","path":"./ruleset/scki-fused-027-im-residual.yaml","interval":86400,"proxy":"🚫 受限网站"},"scki-fused-028-social-domain":{"type":"http","behavior":"domain","format":"mrs","url":"https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/mihomo/scki-fused-028-social-domain.mrs","path":"./ruleset/scki-fused-028-social-domain.mrs","interval":86400,"proxy":"🚫 受限网站"},"scki-fused-028-social-ipcidr":{"type":"http","behavior":"ipcidr","format":"mrs","url":"https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/mihomo/scki-fused-028-social-ipcidr.mrs","path":"./ruleset/scki-fused-028-social-ipcidr.mrs","interval":86400,"proxy":"🚫 受限网站"},"scki-fused-028-social-ipcidr-no-resolve":{"type":"http","behavior":"ipcidr","format":"mrs","url":"https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/mihomo/scki-fused-028-social-ipcidr-no-resolve.mrs","path":"./ruleset/scki-fused-028-social-ipcidr-no-resolve.mrs","interval":86400,"proxy":"🚫 受限网站"},"scki-fused-028-social-residual":{"type":"http","behavior":"classical","format":"yaml","url":"https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/mihomo/scki-fused-028-social-residual.yaml","path":"./ruleset/scki-fused-028-social-residual.yaml","interval":86400,"proxy":"🚫 受限网站"},"scki-fused-029-cn-site-domain":{"type":"http","behavior":"domain","format":"mrs","url":"https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/mihomo/scki-fused-029-cn-site-domain.mrs","path":"./ruleset/scki-fused-029-cn-site-domain.mrs","interval":86400,"proxy":"🚫 受限网站"},"scki-fused-030-social-domain":{"type":"http","behavior":"domain","format":"mrs","url":"https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/mihomo/scki-fused-030-social-domain.mrs","path":"./ruleset/scki-fused-030-social-domain.mrs","interval":86400,"proxy":"🚫 受限网站"},"scki-fused-031-work-domain":{"type":"http","behavior":"domain","format":"mrs","url":"https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/mihomo/scki-fused-031-work-domain.mrs","path":"./ruleset/scki-fused-031-work-domain.mrs","interval":86400,"proxy":"🚫 受限网站"},"scki-fused-031-work-ipcidr":{"type":"http","behavior":"ipcidr","format":"mrs","url":"https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/mihomo/scki-fused-031-work-ipcidr.mrs","path":"./ruleset/scki-fused-031-work-ipcidr.mrs","interval":86400,"proxy":"🚫 受限网站"},"scki-fused-031-work-residual":{"type":"http","behavior":"classical","format":"yaml","url":"https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/mihomo/scki-fused-031-work-residual.yaml","path":"./ruleset/scki-fused-031-work-residual.yaml","interval":86400,"proxy":"🚫 受限网站"},"scki-fused-032-direct-domain":{"type":"http","behavior":"domain","format":"mrs","url":"https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/mihomo/scki-fused-032-direct-domain.mrs","path":"./ruleset/scki-fused-032-direct-domain.mrs","interval":86400,"proxy":"🚫 受限网站"},"scki-fused-033-cnmedia-domain":{"type":"http","behavior":"domain","format":"mrs","url":"https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/mihomo/scki-fused-033-cnmedia-domain.mrs","path":"./ruleset/scki-fused-033-cnmedia-domain.mrs","interval":86400,"proxy":"🚫 受限网站"},"scki-fused-034-tiktok-domain":{"type":"http","behavior":"domain","format":"mrs","url":"https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/mihomo/scki-fused-034-tiktok-domain.mrs","path":"./ruleset/scki-fused-034-tiktok-domain.mrs","interval":86400,"proxy":"🚫 受限网站"},"scki-fused-035-youtube-domain":{"type":"http","behavior":"domain","format":"mrs","url":"https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/mihomo/scki-fused-035-youtube-domain.mrs","path":"./ruleset/scki-fused-035-youtube-domain.mrs","interval":86400,"proxy":"🚫 受限网站"},"scki-fused-036-netflix-domain":{"type":"http","behavior":"domain","format":"mrs","url":"https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/mihomo/scki-fused-036-netflix-domain.mrs","path":"./ruleset/scki-fused-036-netflix-domain.mrs","interval":86400,"proxy":"🚫 受限网站"},"scki-fused-036-netflix-ipcidr-no-resolve":{"type":"http","behavior":"ipcidr","format":"mrs","url":"https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/mihomo/scki-fused-036-netflix-ipcidr-no-resolve.mrs","path":"./ruleset/scki-fused-036-netflix-ipcidr-no-resolve.mrs","interval":86400,"proxy":"🚫 受限网站"},"scki-fused-037-disney-domain":{"type":"http","behavior":"domain","format":"mrs","url":"https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/mihomo/scki-fused-037-disney-domain.mrs","path":"./ruleset/scki-fused-037-disney-domain.mrs","interval":86400,"proxy":"🚫 受限网站"},"scki-fused-037-disney-residual":{"type":"http","behavior":"classical","format":"yaml","url":"https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/mihomo/scki-fused-037-disney-residual.yaml","path":"./ruleset/scki-fused-037-disney-residual.yaml","interval":86400,"proxy":"🚫 受限网站"},"scki-fused-038-hbo-max-domain":{"type":"http","behavior":"domain","format":"mrs","url":"https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/mihomo/scki-fused-038-hbo-max-domain.mrs","path":"./ruleset/scki-fused-038-hbo-max-domain.mrs","interval":86400,"proxy":"🚫 受限网站"},"scki-fused-038-hbo-max-residual":{"type":"http","behavior":"classical","format":"yaml","url":"https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/mihomo/scki-fused-038-hbo-max-residual.yaml","path":"./ruleset/scki-fused-038-hbo-max-residual.yaml","interval":86400,"proxy":"🚫 受限网站"},"scki-fused-039-hulu-domain":{"type":"http","behavior":"domain","format":"mrs","url":"https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/mihomo/scki-fused-039-hulu-domain.mrs","path":"./ruleset/scki-fused-039-hulu-domain.mrs","interval":86400,"proxy":"🚫 受限网站"},"scki-fused-039-hulu-residual":{"type":"http","behavior":"classical","format":"yaml","url":"https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/mihomo/scki-fused-039-hulu-residual.yaml","path":"./ruleset/scki-fused-039-hulu-residual.yaml","interval":86400,"proxy":"🚫 受限网站"},"scki-fused-040-prime-video-domain":{"type":"http","behavior":"domain","format":"mrs","url":"https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/mihomo/scki-fused-040-prime-video-domain.mrs","path":"./ruleset/scki-fused-040-prime-video-domain.mrs","interval":86400,"proxy":"🚫 受限网站"},"scki-fused-040-prime-video-ipcidr":{"type":"http","behavior":"ipcidr","format":"mrs","url":"https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/mihomo/scki-fused-040-prime-video-ipcidr.mrs","path":"./ruleset/scki-fused-040-prime-video-ipcidr.mrs","interval":86400,"proxy":"🚫 受限网站"},"scki-fused-040-prime-video-residual":{"type":"http","behavior":"classical","format":"yaml","url":"https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/mihomo/scki-fused-040-prime-video-residual.yaml","path":"./ruleset/scki-fused-040-prime-video-residual.yaml","interval":86400,"proxy":"🚫 受限网站"},"scki-fused-041-music-domain":{"type":"http","behavior":"domain","format":"mrs","url":"https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/mihomo/scki-fused-041-music-domain.mrs","path":"./ruleset/scki-fused-041-music-domain.mrs","interval":86400,"proxy":"🚫 受限网站"},"scki-fused-041-music-ipcidr":{"type":"http","behavior":"ipcidr","format":"mrs","url":"https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/mihomo/scki-fused-041-music-ipcidr.mrs","path":"./ruleset/scki-fused-041-music-ipcidr.mrs","interval":86400,"proxy":"🚫 受限网站"},"scki-fused-042-stream-hk-domain":{"type":"http","behavior":"domain","format":"mrs","url":"https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/mihomo/scki-fused-042-stream-hk-domain.mrs","path":"./ruleset/scki-fused-042-stream-hk-domain.mrs","interval":86400,"proxy":"🚫 受限网站"},"scki-fused-042-stream-hk-ipcidr-no-resolve":{"type":"http","behavior":"ipcidr","format":"mrs","url":"https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/mihomo/scki-fused-042-stream-hk-ipcidr-no-resolve.mrs","path":"./ruleset/scki-fused-042-stream-hk-ipcidr-no-resolve.mrs","interval":86400,"proxy":"🚫 受限网站"},"scki-fused-043-stream-tw-domain":{"type":"http","behavior":"domain","format":"mrs","url":"https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/mihomo/scki-fused-043-stream-tw-domain.mrs","path":"./ruleset/scki-fused-043-stream-tw-domain.mrs","interval":86400,"proxy":"🚫 受限网站"},"scki-fused-043-stream-tw-residual":{"type":"http","behavior":"classical","format":"yaml","url":"https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/mihomo/scki-fused-043-stream-tw-residual.yaml","path":"./ruleset/scki-fused-043-stream-tw-residual.yaml","interval":86400,"proxy":"🚫 受限网站"},"scki-fused-044-stream-jpkr-domain":{"type":"http","behavior":"domain","format":"mrs","url":"https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/mihomo/scki-fused-044-stream-jpkr-domain.mrs","path":"./ruleset/scki-fused-044-stream-jpkr-domain.mrs","interval":86400,"proxy":"🚫 受限网站"},"scki-fused-044-stream-jpkr-ipcidr":{"type":"http","behavior":"ipcidr","format":"mrs","url":"https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/mihomo/scki-fused-044-stream-jpkr-ipcidr.mrs","path":"./ruleset/scki-fused-044-stream-jpkr-ipcidr.mrs","interval":86400,"proxy":"🚫 受限网站"},"scki-fused-045-stream-eu-domain":{"type":"http","behavior":"domain","format":"mrs","url":"https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/mihomo/scki-fused-045-stream-eu-domain.mrs","path":"./ruleset/scki-fused-045-stream-eu-domain.mrs","interval":86400,"proxy":"🚫 受限网站"},"scki-fused-046-stream-other-domain":{"type":"http","behavior":"domain","format":"mrs","url":"https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/mihomo/scki-fused-046-stream-other-domain.mrs","path":"./ruleset/scki-fused-046-stream-other-domain.mrs","interval":86400,"proxy":"🚫 受限网站"},"scki-fused-046-stream-other-ipcidr":{"type":"http","behavior":"ipcidr","format":"mrs","url":"https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/mihomo/scki-fused-046-stream-other-ipcidr.mrs","path":"./ruleset/scki-fused-046-stream-other-ipcidr.mrs","interval":86400,"proxy":"🚫 受限网站"},"scki-fused-046-stream-other-residual":{"type":"http","behavior":"classical","format":"yaml","url":"https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/mihomo/scki-fused-046-stream-other-residual.yaml","path":"./ruleset/scki-fused-046-stream-other-residual.yaml","interval":86400,"proxy":"🚫 受限网站"},"scki-fused-047-tools-domain":{"type":"http","behavior":"domain","format":"mrs","url":"https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/mihomo/scki-fused-047-tools-domain.mrs","path":"./ruleset/scki-fused-047-tools-domain.mrs","interval":86400,"proxy":"🚫 受限网站"},"scki-fused-048-google-domain":{"type":"http","behavior":"domain","format":"mrs","url":"https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/mihomo/scki-fused-048-google-domain.mrs","path":"./ruleset/scki-fused-048-google-domain.mrs","interval":86400,"proxy":"🚫 受限网站"},"scki-fused-049-tools-domain":{"type":"http","behavior":"domain","format":"mrs","url":"https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/mihomo/scki-fused-049-tools-domain.mrs","path":"./ruleset/scki-fused-049-tools-domain.mrs","interval":86400,"proxy":"🚫 受限网站"},"scki-fused-049-tools-ipcidr":{"type":"http","behavior":"ipcidr","format":"mrs","url":"https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/mihomo/scki-fused-049-tools-ipcidr.mrs","path":"./ruleset/scki-fused-049-tools-ipcidr.mrs","interval":86400,"proxy":"🚫 受限网站"},"scki-fused-049-tools-residual":{"type":"http","behavior":"classical","format":"yaml","url":"https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/mihomo/scki-fused-049-tools-residual.yaml","path":"./ruleset/scki-fused-049-tools-residual.yaml","interval":86400,"proxy":"🚫 受限网站"},"scki-fused-050-microsoft-domain":{"type":"http","behavior":"domain","format":"mrs","url":"https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/mihomo/scki-fused-050-microsoft-domain.mrs","path":"./ruleset/scki-fused-050-microsoft-domain.mrs","interval":86400,"proxy":"🚫 受限网站"},"scki-fused-051-apple-domain":{"type":"http","behavior":"domain","format":"mrs","url":"https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/mihomo/scki-fused-051-apple-domain.mrs","path":"./ruleset/scki-fused-051-apple-domain.mrs","interval":86400,"proxy":"🚫 受限网站"},"scki-fused-051-apple-ipcidr":{"type":"http","behavior":"ipcidr","format":"mrs","url":"https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/mihomo/scki-fused-051-apple-ipcidr.mrs","path":"./ruleset/scki-fused-051-apple-ipcidr.mrs","interval":86400,"proxy":"🚫 受限网站"},"scki-fused-051-apple-residual":{"type":"http","behavior":"classical","format":"yaml","url":"https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/mihomo/scki-fused-051-apple-residual.yaml","path":"./ruleset/scki-fused-051-apple-residual.yaml","interval":86400,"proxy":"🚫 受限网站"},"scki-fused-052-download-domain":{"type":"http","behavior":"domain","format":"mrs","url":"https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/mihomo/scki-fused-052-download-domain.mrs","path":"./ruleset/scki-fused-052-download-domain.mrs","interval":86400,"proxy":"🚫 受限网站"},"scki-fused-052-download-ipcidr":{"type":"http","behavior":"ipcidr","format":"mrs","url":"https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/mihomo/scki-fused-052-download-ipcidr.mrs","path":"./ruleset/scki-fused-052-download-ipcidr.mrs","interval":86400,"proxy":"🚫 受限网站"},"scki-fused-052-download-residual":{"type":"http","behavior":"classical","format":"yaml","url":"https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/mihomo/scki-fused-052-download-residual.yaml","path":"./ruleset/scki-fused-052-download-residual.yaml","interval":86400,"proxy":"🚫 受限网站"},"scki-fused-053-tracker-domain":{"type":"http","behavior":"domain","format":"mrs","url":"https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/mihomo/scki-fused-053-tracker-domain.mrs","path":"./ruleset/scki-fused-053-tracker-domain.mrs","interval":86400,"proxy":"🚫 受限网站"},"scki-fused-053-tracker-ipcidr":{"type":"http","behavior":"ipcidr","format":"mrs","url":"https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/mihomo/scki-fused-053-tracker-ipcidr.mrs","path":"./ruleset/scki-fused-053-tracker-ipcidr.mrs","interval":86400,"proxy":"🚫 受限网站"},"scki-fused-054-gfw-domain":{"type":"http","behavior":"domain","format":"mrs","url":"https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/mihomo/scki-fused-054-gfw-domain.mrs","path":"./ruleset/scki-fused-054-gfw-domain.mrs","interval":86400,"proxy":"🚫 受限网站"},"scki-fused-054-gfw-ipcidr-no-resolve":{"type":"http","behavior":"ipcidr","format":"mrs","url":"https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/mihomo/scki-fused-054-gfw-ipcidr-no-resolve.mrs","path":"./ruleset/scki-fused-054-gfw-ipcidr-no-resolve.mrs","interval":86400,"proxy":"🚫 受限网站"},"scki-fused-055-game-cn-domain":{"type":"http","behavior":"domain","format":"mrs","url":"https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/mihomo/scki-fused-055-game-cn-domain.mrs","path":"./ruleset/scki-fused-055-game-cn-domain.mrs","interval":86400,"proxy":"🚫 受限网站"},"scki-fused-056-game-intl-domain":{"type":"http","behavior":"domain","format":"mrs","url":"https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/mihomo/scki-fused-056-game-intl-domain.mrs","path":"./ruleset/scki-fused-056-game-intl-domain.mrs","interval":86400,"proxy":"🚫 受限网站"},"scki-fused-056-game-intl-ipcidr":{"type":"http","behavior":"ipcidr","format":"mrs","url":"https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/mihomo/scki-fused-056-game-intl-ipcidr.mrs","path":"./ruleset/scki-fused-056-game-intl-ipcidr.mrs","interval":86400,"proxy":"🚫 受限网站"},"scki-fused-057-intl-site-domain":{"type":"http","behavior":"domain","format":"mrs","url":"https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/mihomo/scki-fused-057-intl-site-domain.mrs","path":"./ruleset/scki-fused-057-intl-site-domain.mrs","interval":86400,"proxy":"🚫 受限网站"},"scki-fused-057-intl-site-ipcidr":{"type":"http","behavior":"ipcidr","format":"mrs","url":"https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/mihomo/scki-fused-057-intl-site-ipcidr.mrs","path":"./ruleset/scki-fused-057-intl-site-ipcidr.mrs","interval":86400,"proxy":"🚫 受限网站"},"scki-fused-057-intl-site-ipcidr-no-resolve":{"type":"http","behavior":"ipcidr","format":"mrs","url":"https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/mihomo/scki-fused-057-intl-site-ipcidr-no-resolve.mrs","path":"./ruleset/scki-fused-057-intl-site-ipcidr-no-resolve.mrs","interval":86400,"proxy":"🚫 受限网站"},"scki-fused-057-intl-site-residual":{"type":"http","behavior":"classical","format":"yaml","url":"https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/mihomo/scki-fused-057-intl-site-residual.yaml","path":"./ruleset/scki-fused-057-intl-site-residual.yaml","interval":86400,"proxy":"🚫 受限网站"},"scki-fused-058-payments-domain":{"type":"http","behavior":"domain","format":"mrs","url":"https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/mihomo/scki-fused-058-payments-domain.mrs","path":"./ruleset/scki-fused-058-payments-domain.mrs","interval":86400,"proxy":"🚫 受限网站"},"scki-fused-059-cnmedia-domain":{"type":"http","behavior":"domain","format":"mrs","url":"https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/mihomo/scki-fused-059-cnmedia-domain.mrs","path":"./ruleset/scki-fused-059-cnmedia-domain.mrs","interval":86400,"proxy":"🚫 受限网站"},"scki-fused-059-cnmedia-ipcidr":{"type":"http","behavior":"ipcidr","format":"mrs","url":"https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/mihomo/scki-fused-059-cnmedia-ipcidr.mrs","path":"./ruleset/scki-fused-059-cnmedia-ipcidr.mrs","interval":86400,"proxy":"🚫 受限网站"},"scki-fused-059-cnmedia-residual":{"type":"http","behavior":"classical","format":"yaml","url":"https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/mihomo/scki-fused-059-cnmedia-residual.yaml","path":"./ruleset/scki-fused-059-cnmedia-residual.yaml","interval":86400,"proxy":"🚫 受限网站"},"scki-fused-060-cn-site-domain":{"type":"http","behavior":"domain","format":"mrs","url":"https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/mihomo/scki-fused-060-cn-site-domain.mrs","path":"./ruleset/scki-fused-060-cn-site-domain.mrs","interval":86400,"proxy":"🚫 受限网站"},"scki-fused-060-cn-site-ipcidr-no-resolve":{"type":"http","behavior":"ipcidr","format":"mrs","url":"https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/mihomo/scki-fused-060-cn-site-ipcidr-no-resolve.mrs","path":"./ruleset/scki-fused-060-cn-site-ipcidr-no-resolve.mrs","interval":86400,"proxy":"🚫 受限网站"},"scki-fused-061-direct-domain":{"type":"http","behavior":"domain","format":"mrs","url":"https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/mihomo/scki-fused-061-direct-domain.mrs","path":"./ruleset/scki-fused-061-direct-domain.mrs","interval":86400,"proxy":"🚫 受限网站"},"scki-fused-062-cn-site-domain":{"type":"http","behavior":"domain","format":"mrs","url":"https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/mihomo/scki-fused-062-cn-site-domain.mrs","path":"./ruleset/scki-fused-062-cn-site-domain.mrs","interval":86400,"proxy":"🚫 受限网站"},"scki-fused-062-cn-site-residual":{"type":"http","behavior":"classical","format":"yaml","url":"https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/mihomo/scki-fused-062-cn-site-residual.yaml","path":"./ruleset/scki-fused-062-cn-site-residual.yaml","interval":86400,"proxy":"🚫 受限网站"},"scki-fused-063-intl-site-residual":{"type":"http","behavior":"classical","format":"yaml","url":"https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/mihomo/scki-fused-063-intl-site-residual.yaml","path":"./ruleset/scki-fused-063-intl-site-residual.yaml","interval":86400,"proxy":"🚫 受限网站"},"scki-fused-064-im-residual":{"type":"http","behavior":"classical","format":"yaml","url":"https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/mihomo/scki-fused-064-im-residual.yaml","path":"./ruleset/scki-fused-064-im-residual.yaml","interval":86400,"proxy":"🚫 受限网站"},"scki-fused-065-netflix-residual":{"type":"http","behavior":"classical","format":"yaml","url":"https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/mihomo/scki-fused-065-netflix-residual.yaml","path":"./ruleset/scki-fused-065-netflix-residual.yaml","interval":86400,"proxy":"🚫 受限网站"},"scki-fused-066-social-residual":{"type":"http","behavior":"classical","format":"yaml","url":"https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/mihomo/scki-fused-066-social-residual.yaml","path":"./ruleset/scki-fused-066-social-residual.yaml","interval":86400,"proxy":"🚫 受限网站"},"scki-fused-067-google-residual":{"type":"http","behavior":"classical","format":"yaml","url":"https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/mihomo/scki-fused-067-google-residual.yaml","path":"./ruleset/scki-fused-067-google-residual.yaml","interval":86400,"proxy":"🚫 受限网站"}}
const MIHOMO_FUSED_RULES = ["RULE-SET,scki-fused-001-direct-domain,DIRECT","RULE-SET,scki-fused-002-intl-site-domain,🌐 国外网站","RULE-SET,scki-fused-003-payments-domain,🏦 金融支付","RULE-SET,scki-fused-004-cnmedia-domain,📺 国内流媒体","RULE-SET,scki-fused-005-ad-domain,🛑 广告拦截","RULE-SET,scki-fused-005-ad-ipcidr,🛑 广告拦截","RULE-SET,scki-fused-006-cn-site-domain,🏠 国内网站","AND,((DST-PORT,443),(NETWORK,UDP),(GEOSITE,youtube)),📹 YouTube","AND,((DST-PORT,443),(NETWORK,UDP),(GEOSITE,google)),🔍 Google 服务","AND,((DST-PORT,443),(NETWORK,UDP),(GEOSITE,microsoft)),Ⓜ️ 微软服务","AND,((DST-PORT,443),(NETWORK,UDP),(GEOSITE,apple)),🍎 苹果服务","AND,((DST-PORT,443),(NETWORK,UDP),(NOT,((GEOSITE,cn)))),REJECT","DST-PORT,7680,REJECT","RULE-SET,scki-fused-007-direct-domain,DIRECT","RULE-SET,scki-fused-007-direct-ipcidr-no-resolve,DIRECT,no-resolve","RULE-SET,scki-fused-007-direct-residual,DIRECT","RULE-SET,scki-fused-008-work-residual,🧑‍💼 会议协作","DST-PORT,26880,DIRECT","DST-PORT,6540,DIRECT","DST-PORT,33068,DIRECT","DST-PORT,123,DIRECT","DST-PORT,3478,DIRECT","DST-PORT,3479,DIRECT","DST-PORT,5349,DIRECT","DST-PORT,19302,DIRECT","DST-PORT,19305,DIRECT","DST-PORT,19307,DIRECT","RULE-SET,scki-fused-009-crypto-domain,💰 加密货币","RULE-SET,scki-fused-010-gfw-domain,🚫 受限网站","RULE-SET,scki-fused-011-youtube-domain,📹 YouTube","RULE-SET,scki-fused-012-cn-site-domain,🏠 国内网站","RULE-SET,scki-fused-013-ai-domain,🤖 AI 服务","RULE-SET,scki-fused-014-work-domain,🧑‍💼 会议协作","RULE-SET,scki-fused-015-ai-domain,🤖 AI 服务","RULE-SET,scki-fused-015-ai-ipcidr,🤖 AI 服务","RULE-SET,scki-fused-015-ai-residual,🤖 AI 服务","RULE-SET,scki-fused-016-intl-site-domain,🌐 国外网站","RULE-SET,scki-fused-017-im-domain,💬 即时通讯","RULE-SET,scki-fused-018-work-domain,🧑‍💼 会议协作","RULE-SET,scki-fused-019-download-domain,📥 下载更新","RULE-SET,scki-fused-019-download-ipcidr,📥 下载更新","RULE-SET,scki-fused-020-google-domain,🔍 Google 服务","RULE-SET,scki-fused-020-google-ipcidr-no-resolve,🔍 Google 服务,no-resolve","RULE-SET,scki-fused-021-ai-domain,🤖 AI 服务","RULE-SET,scki-fused-021-ai-ipcidr-no-resolve,🤖 AI 服务,no-resolve","RULE-SET,scki-fused-021-ai-residual,🤖 AI 服务","RULE-SET,scki-fused-022-crypto-domain,💰 加密货币","RULE-SET,scki-fused-022-crypto-residual,💰 加密货币","RULE-SET,scki-fused-023-payments-domain,🏦 金融支付","RULE-SET,scki-fused-024-microsoft-domain,Ⓜ️ 微软服务","RULE-SET,scki-fused-025-intl-site-domain,🌐 国外网站","RULE-SET,scki-fused-026-direct-domain,DIRECT","RULE-SET,scki-fused-027-im-domain,💬 即时通讯","RULE-SET,scki-fused-027-im-ipcidr,💬 即时通讯","RULE-SET,scki-fused-027-im-ipcidr-no-resolve,💬 即时通讯,no-resolve","RULE-SET,scki-fused-027-im-residual,💬 即时通讯","RULE-SET,scki-fused-028-social-domain,📱 社交媒体","RULE-SET,scki-fused-028-social-ipcidr,📱 社交媒体","RULE-SET,scki-fused-028-social-ipcidr-no-resolve,📱 社交媒体,no-resolve","RULE-SET,scki-fused-028-social-residual,📱 社交媒体","RULE-SET,scki-fused-029-cn-site-domain,🏠 国内网站","RULE-SET,scki-fused-030-social-domain,📱 社交媒体","RULE-SET,scki-fused-031-work-domain,🧑‍💼 会议协作","RULE-SET,scki-fused-031-work-ipcidr,🧑‍💼 会议协作","RULE-SET,scki-fused-031-work-residual,🧑‍💼 会议协作","RULE-SET,scki-fused-032-direct-domain,DIRECT","RULE-SET,scki-fused-033-cnmedia-domain,📺 国内流媒体","RULE-SET,scki-fused-034-tiktok-domain,🎵 TikTok","RULE-SET,scki-fused-035-youtube-domain,📹 YouTube","RULE-SET,scki-fused-036-netflix-domain,🎥 Netflix","RULE-SET,scki-fused-036-netflix-ipcidr-no-resolve,🎥 Netflix,no-resolve","RULE-SET,scki-fused-037-disney-domain,🎬 Disney+","RULE-SET,scki-fused-037-disney-residual,🎬 Disney+","RULE-SET,scki-fused-038-hbo-max-domain,📡 HBO/Max","RULE-SET,scki-fused-038-hbo-max-residual,📡 HBO/Max","RULE-SET,scki-fused-039-hulu-domain,📺 Hulu","RULE-SET,scki-fused-039-hulu-residual,📺 Hulu","RULE-SET,scki-fused-040-prime-video-domain,🎬 Prime Video","RULE-SET,scki-fused-040-prime-video-ipcidr,🎬 Prime Video","RULE-SET,scki-fused-040-prime-video-residual,🎬 Prime Video","RULE-SET,scki-fused-041-music-domain,🎵 音乐流媒体","RULE-SET,scki-fused-041-music-ipcidr,🎵 音乐流媒体","RULE-SET,scki-fused-042-stream-hk-domain,🇭🇰 香港流媒体","RULE-SET,scki-fused-042-stream-hk-ipcidr-no-resolve,🇭🇰 香港流媒体,no-resolve","RULE-SET,scki-fused-043-stream-tw-domain,🇹🇼 台湾流媒体","RULE-SET,scki-fused-043-stream-tw-residual,🇹🇼 台湾流媒体","RULE-SET,scki-fused-044-stream-jpkr-domain,🇯🇵 日韩流媒体","RULE-SET,scki-fused-044-stream-jpkr-ipcidr,🇯🇵 日韩流媒体","RULE-SET,scki-fused-045-stream-eu-domain,🇪🇺 欧洲流媒体","RULE-SET,scki-fused-046-stream-other-domain,🌐 其他国外流媒体","RULE-SET,scki-fused-046-stream-other-ipcidr,🌐 其他国外流媒体","RULE-SET,scki-fused-046-stream-other-residual,🌐 其他国外流媒体","RULE-SET,scki-fused-047-tools-domain,🔧 工具与服务","RULE-SET,scki-fused-048-google-domain,🔍 Google 服务","RULE-SET,scki-fused-049-tools-domain,🔧 工具与服务","RULE-SET,scki-fused-049-tools-ipcidr,🔧 工具与服务","RULE-SET,scki-fused-049-tools-residual,🔧 工具与服务","RULE-SET,scki-fused-050-microsoft-domain,Ⓜ️ 微软服务","RULE-SET,scki-fused-051-apple-domain,🍎 苹果服务","RULE-SET,scki-fused-051-apple-ipcidr,🍎 苹果服务","RULE-SET,scki-fused-051-apple-residual,🍎 苹果服务","RULE-SET,scki-fused-052-download-domain,📥 下载更新","RULE-SET,scki-fused-052-download-ipcidr,📥 下载更新","RULE-SET,scki-fused-052-download-residual,📥 下载更新","RULE-SET,scki-fused-053-tracker-domain,🛰️ BT/PT Tracker","RULE-SET,scki-fused-053-tracker-ipcidr,🛰️ BT/PT Tracker","RULE-SET,scki-fused-054-gfw-domain,🚫 受限网站","RULE-SET,scki-fused-054-gfw-ipcidr-no-resolve,🚫 受限网站,no-resolve","RULE-SET,scki-fused-055-game-cn-domain,🕹️ 国内游戏","RULE-SET,scki-fused-056-game-intl-domain,🎮 国外游戏","RULE-SET,scki-fused-056-game-intl-ipcidr,🎮 国外游戏","RULE-SET,scki-fused-057-intl-site-domain,🌐 国外网站","RULE-SET,scki-fused-057-intl-site-ipcidr,🌐 国外网站","RULE-SET,scki-fused-057-intl-site-ipcidr-no-resolve,🌐 国外网站,no-resolve","RULE-SET,scki-fused-057-intl-site-residual,🌐 国外网站","RULE-SET,scki-fused-058-payments-domain,🏦 金融支付","RULE-SET,scki-fused-059-cnmedia-domain,📺 国内流媒体","RULE-SET,scki-fused-059-cnmedia-ipcidr,📺 国内流媒体","RULE-SET,scki-fused-059-cnmedia-residual,📺 国内流媒体","RULE-SET,scki-fused-060-cn-site-domain,🏠 国内网站","RULE-SET,scki-fused-060-cn-site-ipcidr-no-resolve,🏠 国内网站,no-resolve","RULE-SET,scki-fused-061-direct-domain,DIRECT","RULE-SET,scki-fused-062-cn-site-domain,🏠 国内网站","RULE-SET,scki-fused-062-cn-site-residual,🏠 国内网站","RULE-SET,scki-fused-063-intl-site-residual,🌐 国外网站","RULE-SET,scki-fused-064-im-residual,💬 即时通讯","RULE-SET,scki-fused-065-netflix-residual,🎥 Netflix","RULE-SET,scki-fused-066-social-residual,📱 社交媒体","RULE-SET,scki-fused-067-google-residual,🔍 Google 服务","MATCH,🐟 漏网之鱼"]

function applyMihomoFusedRuleSets(config) {
  if (typeof SCKI_DISABLE_FUSED_RULESETS !== 'undefined' && SCKI_DISABLE_FUSED_RULESETS) return
  var providers = config['rule-providers'] || {}
  Object.keys(providers).forEach(function(key) { delete providers[key] })
  Object.keys(MIHOMO_FUSED_RULE_PROVIDERS).forEach(function(key) { providers[key] = MIHOMO_FUSED_RULE_PROVIDERS[key] })
  config['rule-providers'] = providers
  if (Array.isArray(config.rules)) {
    config.rules.splice.apply(config.rules, [0, config.rules.length].concat(MIHOMO_FUSED_RULES))
  } else {
    config.rules = MIHOMO_FUSED_RULES.slice()
  }
}
// END AUTO-GENERATED MIHOMO FUSED RULE-SETS

const REGION_ORDER = ['GLOBAL', 'HK', 'TW', 'SG', 'JPKR', 'APAC', 'US', 'EU', 'AMERICAS', 'AFRICA', 'OTHER']
const REGION_HOME_MAP = {
  GLOBAL: 'GLOBAL_HOME', HK: 'HK_HOME', TW: 'TW_HOME',
  SG: 'SG_HOME', JPKR: 'JPKR_HOME', APAC: 'APAC_HOME',
  US: 'US_HOME', EU: 'EU_HOME', AMERICAS: 'AMERICAS_HOME', AFRICA: 'AFRICA_HOME',
  OTHER: 'OTHER_HOME',
}

function withResidential(keys) {
  var result = []
  for (var i = 0; i < keys.length; i++) {
    var key = keys[i]
    if (SMART[key]) result.push(SMART[key])
    var homeKey = REGION_HOME_MAP[key]
    if (homeKey && SMART[homeKey]) result.push(SMART[homeKey])
  }
  return result
}

function buildStandardProxies() {
  return withResidential(REGION_ORDER).concat('DIRECT')
}

function buildHomeFirstProxies(keys) {
  var homes = []
  var full = []
  for (var i = 0; i < keys.length; i++) {
    var key = keys[i]
    var homeKey = REGION_HOME_MAP[key]
    if (homeKey && SMART[homeKey]) homes.push(SMART[homeKey])
  }
  for (var j = 0; j < keys.length; j++) {
    var fullKey = keys[j]
    if (SMART[fullKey]) full.push(SMART[fullKey])
  }
  return homes.concat(full, ['DIRECT'])
}

function buildRegionPreferredProxies(primaryKey) {
  var order = [primaryKey].concat(REGION_ORDER.filter(function(key) { return key !== primaryKey }))
  return withResidential(order).concat('DIRECT')
}

function buildDirectFirstProxies() {
  return ['DIRECT'].concat(withResidential(REGION_ORDER))
}

function buildTrackerProxies() {
  return ['REJECT', 'DIRECT'].concat(withResidential(['GLOBAL', 'HK', 'SG', 'APAC']))
}

function buildSeaProxies() {
  return withResidential(['SG', 'APAC', 'GLOBAL', 'HK', 'JPKR', 'US']).concat('DIRECT')
}

// ================================================================
//  模块 E：Smart 组创建
// ================================================================

function upsertSmartGroup(config, name, proxies) {
  var group = { name: name, type: 'smart', uselightgbm: true, collectdata: false, strategy: 'sticky-sessions', interval: 300, tolerance: 30, proxies: proxies.slice() }
  var idx = config['proxy-groups'].findIndex(function(g) { return g && g.name === name })
  if (idx !== -1) { config['proxy-groups'][idx] = group } else { config['proxy-groups'].push(group) }
  console.log(`[${VERSION}] Smart: "${name}" -> ${proxies.length} nodes`)
}

// ================================================================
//  模块 F：业务策略组注入（33组）
// ================================================================

function injectBusinessGroups(config, activeSmartNames) {
  function filterActive(arr) {
    if (!activeSmartNames) return arr.slice()
    return arr.filter(function(p) { return activeSmartNames.has(p) })
  }
  var aiProxies = filterActive(buildHomeFirstProxies(REGION_ORDER))
  var standardProxies = filterActive(buildStandardProxies())
  var streamUsProxies = filterActive(buildRegionPreferredProxies('US'))
  var streamHkProxies = filterActive(buildRegionPreferredProxies('HK'))
  var streamTwProxies = filterActive(buildRegionPreferredProxies('TW'))
  var streamJpProxies = filterActive(buildRegionPreferredProxies('JPKR'))
  var streamEuProxies = filterActive(buildRegionPreferredProxies('EU'))
  var directFirstProxies = filterActive(buildDirectFirstProxies())
  var trackerProxies = filterActive(buildTrackerProxies())
  var seaProxies = filterActive(buildSeaProxies())
  var groups = [
    { name: BIZ.AI, type: 'select', proxies: aiProxies.slice() },
    { name: BIZ.CRYPTO, type: 'select', proxies: standardProxies.slice() },
    { name: BIZ.PAYMENTS, type: 'select', proxies: standardProxies.slice() },
    { name: BIZ.IM, type: 'select', proxies: standardProxies.slice() },
    { name: BIZ.SOCIAL, type: 'select', proxies: standardProxies.slice() },
    { name: BIZ.WORK, type: 'select', proxies: standardProxies.slice() },
    { name: BIZ.CNMEDIA, type: 'select', proxies: directFirstProxies.slice() },
    { name: BIZ.TOK, type: 'select', proxies: standardProxies.slice() },
    { name: BIZ.NFLX, type: 'select', proxies: standardProxies.slice() },
    { name: BIZ.DSNP, type: 'select', proxies: standardProxies.slice() },
    { name: BIZ.HBO, type: 'select', proxies: standardProxies.slice() },
    { name: BIZ.HULU, type: 'select', proxies: standardProxies.slice() },
    { name: BIZ.PRIME, type: 'select', proxies: standardProxies.slice() },
    { name: BIZ.YT, type: 'select', proxies: standardProxies.slice() },
    { name: BIZ.MUSIC, type: 'select', proxies: standardProxies.slice() },
    { name: BIZ.STREAM_HK, type: 'select', proxies: streamHkProxies.slice() },
    { name: BIZ.STREAM_TW, type: 'select', proxies: streamTwProxies.slice() },
    { name: BIZ.STREAM_JP, type: 'select', proxies: streamJpProxies.slice() },
    { name: BIZ.STREAM_EU, type: 'select', proxies: streamEuProxies.slice() },
    { name: BIZ.STREAM_OTHER, type: 'select', proxies: standardProxies.slice() },
    { name: BIZ.GAME_CN, type: 'select', proxies: directFirstProxies.slice() },
    { name: BIZ.GAME_INTL, type: 'select', proxies: standardProxies.slice() },
    { name: BIZ.GOOGLE, type: 'select', proxies: standardProxies.slice() },
    { name: BIZ.TOOLS, type: 'select', proxies: standardProxies.slice() },
    { name: BIZ.MS, type: 'select', proxies: standardProxies.slice() },
    { name: BIZ.APPLE, type: 'select', proxies: directFirstProxies.slice() },
    { name: BIZ.DOWNLOAD, type: 'select', proxies: standardProxies.slice() },
    { name: BIZ.TRACKER, type: 'select', proxies: trackerProxies.slice() },
    { name: BIZ.CN_SITE, type: 'select', proxies: directFirstProxies.slice() },
    { name: BIZ.GFW, type: 'select', proxies: standardProxies.slice() },
    { name: BIZ.INTL_SITE, type: 'select', proxies: standardProxies.slice() },
    { name: BIZ.FINAL, type: 'select', proxies: standardProxies.slice() },
    { name: BIZ.AD, type: 'select', proxies: ['REJECT', 'DIRECT'] },
  ]
  var firstSmartIdx = config['proxy-groups'].findIndex(function(g) { return g && g.type === 'smart' })
  groups.forEach(function(group, i) {
    var existIdx = config['proxy-groups'].findIndex(function(g) { return g && g.name === group.name })
    if (existIdx !== -1) { config['proxy-groups'][existIdx] = group }
    else if (firstSmartIdx !== -1) { config['proxy-groups'].splice(firstSmartIdx + i, 0, group) }
    else { config['proxy-groups'].push(group) }
  })
  console.log(`[${VERSION}] Injected ${groups.length} business groups`)
}

// ================================================================
//  模块 I：全局参数覆写
// ================================================================

function overwriteGeneral(config) {
  config['unified-delay'] = true
  config['tcp-concurrent'] = true
  config['find-process-mode'] = 'strict'
  config['keep-alive-idle'] = 30
  config['keep-alive-interval'] = 15
  config['geodata-mode'] = true
  config['geox-url'] = {
    geoip:   'https://fastly.jsdelivr.net/gh/Loyalsoldier/geoip@release/geoip.dat',
    mmdb:    'https://fastly.jsdelivr.net/gh/Loyalsoldier/geoip@release/Country.mmdb',
    asn:     'https://fastly.jsdelivr.net/gh/Loyalsoldier/geoip@release/GeoLite2-ASN.mmdb',
  }
  config['geo-auto-update'] = true
  if (!config.profile) config.profile = {}
  config.profile['store-selected'] = true
  config.profile['store-fake-ip'] = true
  config.profile['tracing'] = true
  // v5.4.1 P2: Hosts DNS 预解析——消除 fake-ip 冷启动循环依赖
  if (!config.hosts) config.hosts = {}
  var dnsHosts = {
    'dns.alidns.com': ['223.5.5.5', '223.6.6.6'],
    'doh.pub': ['119.29.29.29'],
    'dns.google': ['8.8.8.8', '8.8.4.4'],
    'cloudflare-dns.com': ['1.1.1.1', '1.0.0.1']
  }
  Object.keys(dnsHosts).forEach(function(k) { if (!config.hosts[k]) config.hosts[k] = dnsHosts[k] })
  // v5.4.4 FIX#142: 修复 v5.4.1+ 引入的 DNS 空壳 bug——创建 config.dns 时未提供 nameserver
  //   导致内核跳过默认 DNS，国内网站 DIRECT 连接因 DNS 解析失败而超时
  if (!config.dns) config.dns = {}
  config.dns.enable = true
  if (!config.dns.listen) config.dns.listen = '0.0.0.0:1053'
  if (!config.dns['enhanced-mode']) config.dns['enhanced-mode'] = 'fake-ip'
  config.dns['fake-ip-range'] = '198.18.0.1/16'
  config.dns.ipv6 = false
  config.dns['prefer-h3'] = false
  config.dns['respect-rules'] = true
  config.dns['use-system-hosts'] = false
  config.dns['cache-algorithm'] = 'arc'
  // v5.4.21 #4 借鉴 Proxy-override：default-nameserver 从纯明文 IP 升级为 DoH-over-IP（IP host + https scheme）+
  // 1 个明文兜底；消除 bootstrap 阶段的 DNS 泄漏，同时保留明文韧性（防 443 被劫持/首包失败）。
  var bootstrapDns = ['https://223.5.5.5/dns-query', 'https://223.6.6.6/dns-query', 'https://8.8.8.8/dns-query', 'https://1.1.1.1/dns-query', '223.5.5.5']
  var domesticDoH = ['https://dns.alidns.com/dns-query', 'https://doh.pub/dns-query']
  var foreignDoH = ['https://cloudflare-dns.com/dns-query', 'https://dns.google/dns-query']
  var proxyDoH = foreignDoH.concat(domesticDoH)
  config.dns['default-nameserver'] = bootstrapDns.slice()
  config.dns.nameserver = domesticDoH.slice()
  config.dns['direct-nameserver'] = domesticDoH.slice()
  // v5.4.19 #5 借鉴 Proxy-override：让 direct-nameserver 也遵循 nameserver-policy（默认 false 会忽略它）。
  // 官方 use case 即"direct 用国内 DoH + policy 指定域名走指定 DNS"；本仓库 policy 同时覆盖境外 CDN 与 geosite 级分流。
  config.dns['direct-nameserver-follow-policy'] = true
  config.dns['proxy-server-nameserver'] = proxyDoH.slice()
  config.dns.fallback = foreignDoH.slice()
  if (!config.dns['nameserver-policy'] || typeof config.dns['nameserver-policy'] !== 'object' || Array.isArray(config.dns['nameserver-policy'])) {
    config.dns['nameserver-policy'] = {}
  }
  ['+.jsdelivr.net', '+.github.com', '+.githubusercontent.com', '+.githubassets.com', '+.fastly.net'].forEach(function(host) {
    if (!config.dns['nameserver-policy'][host]) config.dns['nameserver-policy'][host] = foreignDoH.slice()
  })
  // DNS-POLICY#170：nameserver-policy 优先于 nameserver/fallback。用 geosite 将国内域名固定到国内 DoH，
  // 非国内域名固定到海外 DoH，避免先向国内递归 resolver 发起 geolocation-!cn 查询后再 fallback。
  var geositeDnsPolicy = {
    'geosite:cn': domesticDoH,
    'geosite:geolocation-!cn': foreignDoH
  }
  Object.keys(geositeDnsPolicy).forEach(function(key) {
    if (!config.dns['nameserver-policy'][key]) config.dns['nameserver-policy'][key] = geositeDnsPolicy[key].slice()
  })
  if (!config.dns['fallback-filter'] || typeof config.dns['fallback-filter'] !== 'object' || Array.isArray(config.dns['fallback-filter'])) {
    config.dns['fallback-filter'] = {}
  }
  config.dns['fallback-filter'].geoip = true
  config.dns['fallback-filter']['geoip-code'] = 'CN'
  config.dns['fallback-filter'].geosite = ['gfw', 'geolocation-!cn']
  config.dns['fallback-filter'].ipcidr = ['240.0.0.0/4', '0.0.0.0/32', '127.0.0.0/8', '10.0.0.0/8', '192.168.0.0/16']
  if (!Array.isArray(config.dns['fallback-filter'].domain)) config.dns['fallback-filter'].domain = []
  // v5.4.1 P0: fake-ip-filter 扩展（Smart 内核不支持 fake-ip-filter-mode: rule，使用传统域名列表）
  var currentFakeIpFilter = Array.isArray(config.dns['fake-ip-filter']) ? config.dns['fake-ip-filter'] : []
  config.dns['fake-ip-filter'] = uniqList(currentFakeIpFilter.concat([
    '+.lan',
    '+.local',
    '+.localdomain',
    '+.home.arpa',
    '+.msftconnecttest.com',
    '+.msftncsi.com',
    'localhost.ptlogin2.qq.com',
    'localhost.sec.qq.com',
    'localhost.work.weixin.qq.com',
    '+.in-addr.arpa',
    '+.ip6.arpa',
    'time.*.com',
    'time.*.gov',
    'ntp.*.com',
    'pool.ntp.org',
    '+.ntp.org',
    '+.pool.ntp.org',
    '+.market.xiaomi.com',
    '+.stun.*.*',
    '+.stun.*.*.*',
    '+.turn.*.*',
    '+.turn.*.*.*',
    '+.n.n.srv.nintendo.net',
    '+.stun.playstation.net',
    '+.xboxlive.com',
    'stun.l.google.com',
    'stun1.l.google.com',
    'stun2.l.google.com',
    'stun3.l.google.com',
    'stun4.l.google.com',
    'global.turn.twilio.com',
    'auth.docker.io',
    'registry-1.docker.io',
    'index.docker.io',
    'hub.docker.com',
    'production.cloudflare.docker.com',
    '+.push.apple.com',
    '+.pub.3gppnetwork.org',
    '+.bing.com',
    // v5.4.12 FIX#RD-REALIP: RustDesk rendezvous/relay needs real IPs while still routing via work proxy.
    '+.rustdesk.com',
    // v5.4.19 #3 借鉴 Proxy-override：远控/游戏/P2P 需真实 IP 才能打洞/直连（同 RustDesk 语义）。
    '+.todesk.com', '+.oray.com', '+.sunlogin.com', '+.teamviewer.com', '+.anydesk.com',
    '+.battlenet.com.cn', '+.wotgame.cn', '+.wggames.cn', '+.wowsgame.cn',
    '+.mcdn.bilivideo.cn',
    '+.miwifi.com',
    '+.courier.push.apple.com',
    '+.miui.com',
    '+.xiaomi.com',
    '+.xiaomi.net',
    '+.mijia.tech',
    '+.gotui.com'
  ]))
  // v5.4.22 #1 借鉴 Proxy-override：QUIC SNI 嗅探（对齐 CMFA/OpenClash 的 sniffer）。
  //   force-dns-mapping 把真实 IP 连接（含 batch A 放进 fake-ip-filter 的域名，如 mcdn.bilivideo.cn）
  //   映射回域名，使 QUIC 精细化的 GEOSITE/RULE-SET 匹配对真 IP QUIC 同样生效；否则真 IP QUIC 会被
  //   NOT,((GEOSITE,cn)) 误判 REJECT。skip-dst-address 跳过 Telegram 网段（MTProto 会干扰嗅探）。
  config.sniffer = {
    enable: true,
    'parse-pure-ip': true,
    'force-dns-mapping': true,
    'override-destination': true,
    sniff: {
      HTTP: { ports: ['80', '8080-8880'], 'override-destination': true },
      TLS: { ports: ['443', '8443'] },
      QUIC: { ports: ['443', '8443', '4433'] }
    },
    'skip-domain': ['+.push.apple.com'],
    'skip-dst-address': ['91.105.192.0/23', '91.108.4.0/22', '91.108.8.0/21', '91.108.16.0/21', '91.108.56.0/22', '95.161.64.0/20', '149.154.160.0/20', '185.76.151.0/24', '2001:67c:4e8::/48', '2001:b28:f23c::/47', '2001:b28:f23f::/48', '2a0a:f280:203::/48']
  }
  // v5.4.1 P3: Mixed Listeners——按地区分配端口，SwitchyOmega 一键切地区
  if (!config.listeners) config.listeners = []
  var regionPorts = [
    { name: 'MIXED-HK', port: 50000, proxy: SMART.HK },
    { name: 'MIXED-SG', port: 50001, proxy: SMART.SG },
    { name: 'MIXED-TW', port: 50002, proxy: SMART.TW },
    { name: 'MIXED-JP', port: 50003, proxy: SMART.JPKR },
    { name: 'MIXED-US', port: 50004, proxy: SMART.US },
    { name: 'MIXED-EU', port: 50005, proxy: SMART.EU },
    { name: 'MIXED-DIRECT', port: 10086, proxy: 'DIRECT' }
  ]
  var existingPorts = new Set(config.listeners.map(function(l) { return l.port }))
  regionPorts.forEach(function(r) {
    if (!existingPorts.has(r.port)) config.listeners.push({ name: r.name, type: 'mixed', port: r.port, proxy: r.proxy })
  })
  if (!config.tun) config.tun = {}
  if (!config.tun['exclude-process']) config.tun['exclude-process'] = []
  var gcuExcludes = ['GCUService.exe', 'GCUBridge.exe', 'WorkPro.exe', 'GSCService.exe', 'gsupservice.exe', 'gchsvc.exe']
  gcuExcludes.forEach(function(proc) {
    if (config.tun['exclude-process'].indexOf(proc) === -1) { config.tun['exclude-process'].push(proc) }
  })
}

function uniqList(list) {
  var seen = {}
  return list.filter(function(item) {
    if (!item || seen[item]) return false
    seen[item] = true
    return true
  })
}

// ================================================================
//  模块 J：清理订阅自带的旧组和旧规则
// ================================================================

function cleanupSubscription(config) {
  // v5.2.6 FIX#26-P0: 清空订阅自带的所有 proxy-groups
  //   原 4 关键词黑名单（负载均衡/自动选择/手动选择/节点选择）只能清除部分机场模板，
  //   机场若提供地区组（🇭🇰 香港 / 🇹🇼 台湾 / …）或流媒体组，会和本脚本 18 Smart + 31 业务组共存，
  //   用户端会看到 70+ 甚至 80+ 代理组（本脚本期望恰好 53 个）。
  //   本脚本 53 个组是唯一权威来源：业务组只引用 SMART.* / DIRECT / REJECT，Smart 组只引用
  //   config.proxies 里的节点名，不依赖任何订阅原生组，所以可以安全地整体清空。
  var removed = (config['proxy-groups'] || []).length
  config['proxy-groups'] = []
  if (removed > 0) console.log(`[${VERSION}] Removed ${removed} subscription proxy-groups`)
  config.rules = []
  config['rule-providers'] = {}
}

// ================================================================
//  模块 K：注入智能 TLS 指纹
// ================================================================

function _simpleHash(str) {
  var hash = 0
  for (var i = 0; i < str.length; i++) { hash = ((hash << 5) - hash) + str.charCodeAt(i); hash |= 0 }
  // >>> 0 converts to unsigned 32-bit; avoids Math.abs(-2147483648) === -2147483648 edge case
  return hash >>> 0
}

function injectSmartFingerprint(config) {
  if (!Array.isArray(config.proxies)) return
  const fpByPurpose = { STREAM: 'chrome', GAME: 'ios', SOCIAL: 'firefox', DEV: 'edge' }
  const fpFallbackCandidates = ['chrome','firefox','safari','ios','android','edge']
  config.proxies.forEach(p => {
    if (!p || typeof p !== 'object') return
    // v5.2.0 FIX#15: 先判断协议类型，再判断是否需要指纹（逻辑顺序优化）
    if (['vless','vmess','trojan'].indexOf(p.type) === -1) return
    const isReality = !!(p['reality-opts'] || p['reality_opts'])
    const flow = (p.flow || '').toLowerCase()
    const isXTLS = /xtls-rprx/.test(flow)
    // 仅对 TLS 或 Reality/XTLS 节点注入指纹（非加密连接无需指纹）
    if (!p.tls && !isReality && !isXTLS) return
    // v5.1.6 P0-FIX#4: 不覆盖节点已有 fingerprint（机场可能为 Reality 节点调优过）
    if (p['client-fingerprint']) return
    let chosenFP = null
    const name = String(p.name)
    if (/netflix|youtube|hulu|primevideo|disney|twitch|tiktok/i.test(name)) { chosenFP = fpByPurpose.STREAM }
    else if (/game|steam|playstation|nintendo|epic|valorant/i.test(name)) { chosenFP = fpByPurpose.GAME }
    else if (/twitter|facebook|instagram|snapchat|linkedin/i.test(name)) { chosenFP = fpByPurpose.SOCIAL }
    else if (/api|dev|github|gitlab|npm|pypi|docker/i.test(name)) { chosenFP = fpByPurpose.DEV }
    if (!chosenFP) { const idx = _simpleHash(name) % fpFallbackCandidates.length; chosenFP = fpFallbackCandidates[idx] }
    p['client-fingerprint'] = chosenFP
  })
}

// ================================================================
//  模块 L：proxy-groups 最终排序
// ================================================================

function sortProxyGroups(config) {
  const bizGroups = [], smartGroups = [], otherGroups = []
  const bizNames = new Set(Object.values(BIZ))
  const smartNames = new Set(Object.values(SMART))
  config['proxy-groups'].forEach(g => {
    if (!g || !g.name) return
    if (bizNames.has(g.name)) { bizGroups.push(g) }
    else if (smartNames.has(g.name) || g.type === 'smart') { smartGroups.push(g) }
    else { otherGroups.push(g) }
  })
  const bizOrder = Object.values(BIZ)
  bizGroups.sort((a, b) => bizOrder.indexOf(a.name) - bizOrder.indexOf(b.name))
  const smartOrder = Object.values(SMART)
  smartGroups.sort((a, b) => { const ia = smartOrder.indexOf(a.name); const ib = smartOrder.indexOf(b.name); return (ia === -1 ? 999 : ia) - (ib === -1 ? 999 : ib) })
  // v5.4.5: 🌍 全球节点置顶，方便查看全部节点状态和测速
  var globalGroup = smartGroups.find(function(g) { return g.name === SMART.GLOBAL })
  var restSmartGroups = smartGroups.filter(function(g) { return g.name !== SMART.GLOBAL })
  config['proxy-groups'] = globalGroup ? [globalGroup, ...bizGroups, ...restSmartGroups, ...otherGroups] : [...bizGroups, ...smartGroups, ...otherGroups]
}

// ================================================================
//  主函数
// ================================================================

function main(config) {
  try {
    if (!config || typeof config !== 'object') return config
    if (!Array.isArray(config.proxies) || config.proxies.length === 0) return config
    console.log(`[${VERSION}] Start processing, ${config.proxies.length} proxies`)
    if (!Array.isArray(config['proxy-groups'])) config['proxy-groups'] = []
    if (!Array.isArray(config.rules)) config.rules = []
    overwriteGeneral(config)
    cleanupSubscription(config)
    injectSmartFingerprint(config)
    var c = classifyAllNodes(config.proxies)
    console.log(`[${VERSION}] Classification: ALL=${c.ALL.length} HOME_ALL=${c.HOME_ALL.length} HK=${c.HK.length}/${c.HOME_HK.length} TW=${c.TW.length}/${c.HOME_TW.length} CN=${c.CN.length}/${c.HOME_CN.length} JP=${c.JP.length}/${c.HOME_JP.length} KR=${c.KR.length}/${c.HOME_KR.length} SG=${c.SG.length}/${c.HOME_SG.length} US=${c.US.length}/${c.HOME_US.length} EU=${c.EU.length}/${c.HOME_EU.length} AM=${c.AM.length}/${c.HOME_AM.length} AF=${c.AF.length}/${c.HOME_AF.length} APAC_OTHER=${c.APAC_OTHER.length}/${c.HOME_APAC_OTHER.length} OTHER=${c.OTHER.length}/${c.HOME_OTHER.length}`)
    var jpkrNodes = c.JP.concat(c.KR)
    // v5.4.1 FIX: SG 同时存在于狮城组（独立）和亚太组（对标 US 在 美洲组）
    var apacNodes = c.HK.concat(c.TW, c.CN, c.JP, c.KR, c.SG, c.APAC_OTHER)
    var americasNodes = c.US.concat(c.AM)
    var homeJpkrNodes = c.HOME_JP.concat(c.HOME_KR)
    var homeApacNodes = c.HOME_HK.concat(c.HOME_TW, c.HOME_CN, c.HOME_JP, c.HOME_KR, c.HOME_SG, c.HOME_APAC_OTHER)
    var homeAmericasNodes = c.HOME_US.concat(c.HOME_AM)
    upsertSmartGroup(config, SMART.GLOBAL, c.ALL)
    if (c.HOME_ALL.length > 0) upsertSmartGroup(config, SMART.GLOBAL_HOME, c.HOME_ALL)
    // v5.2.6 FIX#25-P0: 统一空区域不建组（原 HK/TW/JPKR/APAC/US fallback 到 apacNodes/c.ALL
    //   会把 HK/全节点 silently 塞入 🇹🇼 台湾节点 / 🇯🇵 日韩节点 —— 区域污染）
    //   SMART.GLOBAL 始终存在作为兜底；业务组对 STANDARD_PROXIES 的 filterProxies 会自动剔除未创建的组引用
    if (c.HK.length > 0) upsertSmartGroup(config, SMART.HK, c.HK)
    if (c.HOME_HK.length > 0) upsertSmartGroup(config, SMART.HK_HOME, c.HOME_HK)
    if (c.TW.length > 0) upsertSmartGroup(config, SMART.TW, c.TW)
    if (c.HOME_TW.length > 0) upsertSmartGroup(config, SMART.TW_HOME, c.HOME_TW)
    if (c.SG.length > 0) upsertSmartGroup(config, SMART.SG, c.SG)
    if (c.HOME_SG.length > 0) upsertSmartGroup(config, SMART.SG_HOME, c.HOME_SG)
    if (jpkrNodes.length > 0) upsertSmartGroup(config, SMART.JPKR, jpkrNodes)
    if (homeJpkrNodes.length > 0) upsertSmartGroup(config, SMART.JPKR_HOME, homeJpkrNodes)
    if (apacNodes.length > 0) upsertSmartGroup(config, SMART.APAC, apacNodes)
    if (homeApacNodes.length > 0) upsertSmartGroup(config, SMART.APAC_HOME, homeApacNodes)
    if (c.US.length > 0) upsertSmartGroup(config, SMART.US, c.US)
    if (c.HOME_US.length > 0) upsertSmartGroup(config, SMART.US_HOME, c.HOME_US)
    if (c.EU.length > 0) upsertSmartGroup(config, SMART.EU, c.EU)
    if (c.HOME_EU.length > 0) upsertSmartGroup(config, SMART.EU_HOME, c.HOME_EU)
    if (americasNodes.length > 0) upsertSmartGroup(config, SMART.AMERICAS, americasNodes)
    if (homeAmericasNodes.length > 0) upsertSmartGroup(config, SMART.AMERICAS_HOME, homeAmericasNodes)
    if (c.AF.length > 0) upsertSmartGroup(config, SMART.AFRICA, c.AF)
    if (c.HOME_AF.length > 0) upsertSmartGroup(config, SMART.AFRICA_HOME, c.HOME_AF)
    if (c.OTHER.length > 0) upsertSmartGroup(config, SMART.OTHER, c.OTHER)
    if (c.HOME_OTHER.length > 0) upsertSmartGroup(config, SMART.OTHER_HOME, c.HOME_OTHER)

    // 收集实际创建的 Smart 组名，过滤业务组的 proxy 引用
    var activeSmartNames = new Set(config['proxy-groups'].filter(function(g) { return g && g.type === 'smart' }).map(function(g) { return g.name }))
    activeSmartNames.add('DIRECT'); activeSmartNames.add('REJECT')
    console.log(`[${VERSION}] Active Smart groups: ${[...activeSmartNames].filter(function(n) { return n !== 'DIRECT' && n !== 'REJECT' }).join(', ')}`)

    injectBusinessGroups(config, activeSmartNames)
    applyMihomoFusedRuleSets(config)
    sortProxyGroups(config)
    console.log(`[${VERSION}] Done! Groups: ${config['proxy-groups'].length}, Rules: ${config.rules.length}, Providers: ${Object.keys(config['rule-providers']).length}`)
    return config
  } catch (e) {
    console.error(`[${VERSION}] Error:`, e)
    return config
  }
}
