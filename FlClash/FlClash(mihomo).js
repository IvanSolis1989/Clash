// FlClash 瑕嗗啓鑴氭湰 鈥?鏍囧噯 Mihomo 鍐呮牳鍔ㄦ€佸垎娴佺増
// 鐗堟湰锛歷5.4.1-flclash.1 (2026-05-05)
// 鏋舵瀯锛?2 url-test 鍖哄煙缁勶紙11 鍏ㄩ儴 + 11 瀹跺锛? 31 涓氬姟绛栫暐缁勶紙鍚?13 娴佸獟浣撳钩鍙扮粍锛? 371+ rule-providers 100%+ 鏈嶅姟瑕嗙洊
// 鍩虹嚎锛欳lash Party Normal v5.4.1锛堣鍒?100% 绛変环锛涘尯鍩熺粍涓?url-test 鈥?FlClash 鍐呮牳涓烘爣鍑?Mihomo锛屼笉鏀寔 smart + LightGBM锛?
// 閫傜敤锛欶lClash >= v0.8.85锛堣鐩栬剼鏈姛鑳借嚜璇ョ増鏈紩鍏ワ級锛涘叾浠栦娇鐢ㄦ爣鍑?Mihomo 鍐呮牳鐨勫鎴风
// 鍙樻洿鍘嗗彶锛氳 `FlClash/CHANGELOG.md`
//
// === 瀵煎叆鏂规硶锛團lClash锛屼袱姝ユ搷浣滐級 ===
//
// 鈿狅笍 蹇呴』鍏堛€屽垱寤恒€嶈剼鏈啀銆屽叧鑱斻€嶅埌璁㈤槄锛?
//
// 銆愮 1 姝ワ細鍒涘缓瑕嗗啓鑴氭湰銆?
//   FlClash 鈫?閰嶇疆 鈫掋€岃鍐欒剼鏈€嶁啋 鍙充笂瑙?+ 鈫?杈撳叆鍚嶇О
//   鏂瑰紡 A锛圲RL锛夛細濉叆 https://raw.githubusercontent.com/IvanSolis1989/Smart-Config-Kit/main/FlClash/FlClash(mihomo).js
//   鏂瑰紡 B锛堢矘璐达級锛氭墦寮€涓婃柟 GitHub 閾炬帴锛屽叏閫夊鍒剁矘璐?
//   鏂瑰紡 C锛坖sdelivr锛夛細https://cdn.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/FlClash/FlClash(mihomo).js
//   淇濆瓨銆?
//
// 銆愮 2 姝ワ細鍏宠仈鍒拌闃呫€?
//   閰嶇疆椤?鈫?璁㈤槄鍗＄墖 鈰?鈫掋€屾洿澶氥€嶁啋銆岃鍐欍€嶁啋 鐐归€夊垰鎵嶅垱寤虹殑鑴氭湰 鈫?纭畾 鈫?涓嬫媺鍒锋柊銆?
//
// 鈿狅笍 GitHub 琚鏃跺厛纭繚浠ｇ悊宸查€氾紝鎴栫敤 jsdelivr CDN / 鎵嬪姩绮樿创銆?
//
// === 鑴氭湰瀵煎叆鍚庡繀鍋氱殑鎵嬪姩閰嶇疆锛團lClash UI 鍐呮搷浣滐級 ===
// 浠ヤ笅涓ら」鐢?FlClash App UI 鎵樼锛岃鍐欒剼鏈棤娉曟敞鍏ワ紝蹇呴』鎵嬪姩閰嶇疆锛?
//   1. 澶栭儴璧勬簮锛圙eoX URL锛夛細缂栬緫璁㈤槄 鈫掋€屽閮ㄨ祫婧愩€嶆爣绛?鈫?绮樿创 geox-url YAML
//   2. 杩涢樁閰嶇疆锛圖NS锛夛細缂栬緫璁㈤槄 鈫掋€岃繘闃堕厤缃€嶆爣绛?鈫?绮樿创 dns YAML
//   瀹屾暣 YAML 瑙侊細FlClash/README.md 鈫?绗?4 姝?蹇呮敼閰嶇疆
//
// === 涓?CMFA YAML 鐨勯€夋嫨 ===
// - 鏈?JS 鑴氭湰锛氬姩鎬佽妭鐐瑰垎绫伙紙word-boundary 姝ｅ垯锛岀簿纭害楂樹簬 YAML filter:锛夈€?
//   鑷姩娓呯悊璁㈤槄鍨冨溇缁勩€佸瀹借瘑鍒€佺┖鍖哄煙鑷姩涓嶅缓缁?
// - CMFA YAML锛氶潤鎬侀厤缃紝閫傚悎涓嶆兂鐢ㄨ剼鏈殑鐢ㄦ埛锛涘鍏ュ嵆鐢ㄦ棤闇€棰濆鎿嶄綔

// ================================================================
//  鐗堟湰甯搁噺
// ================================================================

const VERSION = 'v5.4.1-flclash.1'

// FlClash JS 寮曟搸鐜鍏煎锛歈uickJS 鍙兘涓嶆彁渚?console锛屽畨鍏ㄥ寘瑁?
var log = (typeof console !== 'undefined' && console.log) ? console.log.bind(console) : function(){}

// ================================================================
//  妯″潡 A锛氳妭鐐硅繃婊?/ 瀹跺璇嗗埆
// ================================================================

function isInfoNode(name) {
  const infoPatterns = ['瀵艰埅缃戝潃', '璺濈涓嬫閲嶇疆', '鍓╀綑娴侀噺', '濂楅鍒版湡', '缃戝潃瀵艰埅', '瀹樼綉', '璁㈤槄', '鍒版湡', '鍓╀綑', '閲嶇疆']
  const infoRes = [/\b(?:USE|USED|TOTAL|EXPIRE|EMAIL)\b/i, /Panel|Channel|Author|鍓╀綑娴侀噺|宸茬敤娴侀噺|鍒版湡鏃堕棿|涓嬫閲嶇疆/i]
  const s = String(name || '')
  return infoPatterns.some(p => s.includes(p)) || infoRes.some(re => re.test(s))
}

const RESIDENTIAL_PATTERNS = [
  /瀹跺|瀹跺涵瀹藉甫|瀹跺涵浣忓畢|浣忓畢瀹藉甫|浣忓畢|瀹藉甫/,
  /\bresi(?:dential)?\b/i,
  /\bhome(?:\s|-|_)?ip\b/i,
  /\bhome(?:\s|-|_)?broadband\b/i,
  /\bbroadband\b/i,
  /\bisp\b/i,
]

function isResidentialNode(name) {
  const s = String(name || '')
  return RESIDENTIAL_PATTERNS.some(re => re.test(s))
}

// ================================================================
//  妯″潡 B锛氬浗瀹?鍦板尯鍒嗙被鏁版嵁搴擄紙v4.5.1 淇 CN 鍖哄煙锛?
// ================================================================

const REGION_DB = [
  // v5.2.6-normal.1 FIX#24-P0: 琛ラ綈 ISO alpha-3 浠ｇ爜锛圱WN/JPN/KOR/SGP/CHN锛夛紝
  //   涓?Clash Smart 鍐呮牳瑕嗗啓鑴氭湰.js 淇濇寔瀵归綈锛堣 Smart 鐗堝悓缂栧彿淇锛?
  { id: 'HK', kw: ['棣欐腐', 'hong kong', 'hongkong', 'hkg'], iso: ['HK'] },
  { id: 'TW', kw: ['鍙版咕', '鍙板寳', '鍙颁腑', '楂橀泟', '鏂板寳', '妗冨洯', 'taiwan', 'taipei', 'taichung', 'kaohsiung', 'tpe', 'twn'], iso: ['TW'] },
  { id: 'CN', kw: ['涓浗', '澶ч檰', '鍥藉唴', '涓浗澶ч檰', 'china', 'mainland', '鍥炲浗鑺傜偣', '鍥炲浗涓撶嚎', '鍥炲浗绾胯矾', '鍥炲浗鍔犻€?, '鍥炲浗鏈嶅姟', '鐩磋繛鍥藉唴', '鍥藉唴鐩磋繛', '涓浆鍥藉唴', '钀藉湴鍥藉唴', '鍖椾含', '涓婃捣', '骞垮窞', '娣卞湷', 'beijing', 'shanghai', 'guangzhou', 'shenzhen', '鎴愰兘', '閲嶅簡', '鏉窞', '鍗椾含', '姝︽眽', '澶╂触', '鑻忓窞', '瑗垮畨', '闀挎矙', 'chengdu', 'chongqing', 'hangzhou', 'nanjing', 'wuhan', 'tianjin', 'suzhou', 'xian', 'changsha', '娌堥槼', '闈掑矝', '閮戝窞', '澶ц繛', '涓滆帪', '瀹佹尝', '鍘﹂棬', '娴庡崡', '鏃犻敗', '鍚堣偉', '鏄嗘槑', '绂忓窞', '鍝堝皵婊?, '浣涘北', '闀挎槬', '鐭冲搴?, '澶師', '鍗楀畞', '璐甸槼', '涔岄瞾鏈ㄩ綈', '鍏板窞', '娴峰彛', '閾跺窛', '瑗垮畞', '鎷夎惃', '鍛煎拰娴╃壒', '鐢典俊', '鑱旈€?, '绉诲姩', '閾侀€?, 'chinatelecom', 'chinaunicom', 'chinamobile', 'chn', 'pek', 'pkx', 'pvg', 'szx', 'ctu', 'ckg', 'hgh', 'nkg', 'wuh', 'tsn', 'syx', 'xiy', 'csx', 'kmg', 'hak', 'dlc', 'tao', 'she', 'hrb', 'cgo'], iso: ['CN'] },
  { id: 'JP', kw: ['鏃ユ湰', '涓滀含', '澶ч槳', '妯花', '鍚嶅彜灞?, '绂忓唸', '鏈箤', '浜兘', '绁炴埛', '鍗冨彾', '鍩肩帀', '浠欏彴', '骞垮矝', '鍐茬怀', '閭ｉ湼', 'japan', 'tokyo', 'osaka', 'yokohama', 'nagoya', 'fukuoka', 'sapporo', 'kyoto', 'kobe', 'chiba', 'sendai', 'hiroshima', 'okinawa', 'naha', 'jpn', 'nrt', 'hnd', 'kix', 'ngo', 'fuk', 'cts', 'oka'], iso: ['JP'] },
  { id: 'KR', kw: ['闊╁浗', '棣栧皵', '閲滃北', '浠佸窛', '澶х敯', '澶ч偙', '鍏夊窞', '娴庡窞', 'korea', 'seoul', 'busan', 'incheon', 'daejeon', 'daegu', 'gwangju', 'jeju', 'kor', 'icn', 'gmp', 'pus'], iso: ['KR'] },
  { id: 'SG', kw: ['鏂板姞鍧?, 'singapore', 'sgp', 'sin'], iso: ['SG'] },
  { id: 'US', kw: ['缇庡浗', 'united states', 'america', 'usa', '娲涙潐鐭?, 'los angeles', '鍦ｄ綍濉?, 'san jose', '鏃ч噾灞?, '涓夎棭甯?, 'san francisco', '瑗块泤鍥?, 'seattle', '绾界害', 'new york', '鑺濆姞鍝?, 'chicago', '杈炬媺鏂?, 'dallas', '涓逛經', 'denver', '鍑ゅ嚢鍩?, 'phoenix', '浜氱壒鍏板ぇ', 'atlanta', '杩堥樋瀵?, 'miami', '娉㈠＋椤?, 'boston', '鍗庣洓椤?, 'washington', '璐瑰煄', 'philadelphia', '浼戞柉椤?, 'houston', '鍦ｅ湴浜氬摜', 'san diego', '鎷夋柉缁村姞鏂?, 'las vegas', '娉㈢壒鍏?, 'portland', '纭呰胺', 'silicon valley', '寮楀悏灏间簹', 'virginia', '澶忔礇鐗?, 'charlotte', '濂ユ柉姹€', 'austin', '绾充粈缁村皵', 'nashville', '鐩愭箹鍩?, 'salt lake', '鏄庡凹闃挎尝鍒╂柉', 'minneapolis', '鍦ｈ矾鏄撴柉', 'st louis', '鍫惃鏂?, 'kansas city', '搴曠壒寰?, 'detroit', '鍖瑰吂鍫?, 'pittsburgh', '鍏嬪埄澶叞', 'cleveland', '妾€棣欏北', 'honolulu', '瀹夊厠闆峰', 'anchorage', 'lax', 'sjc', 'sfo', 'sea', 'jfk', 'ewr', 'ord', 'dfw', 'iad', 'atl', 'mia', 'bos', 'den', 'phx', 'iah', 'msp', 'dtw', 'phl', 'san', 'las', 'slc', 'pdx', 'clt', 'hnl', 'anc'], iso: ['US'] },
  { id: 'EU', kw: ['娆ф床', 'europe', '鑻卞浗', 'united kingdom', 'england', 'britain', 'london', '浼︽暒', 'manchester', '鏇煎交鏂壒', 'birmingham', 'glasgow', 'edinburgh', 'liverpool', 'leeds', 'bristol', 'lhr', 'lgw', 'man', 'edi', '鐖卞皵鍏?, 'ireland', 'dublin', '閮芥煆鏋?, '娉曞浗', 'france', 'paris', '宸撮粠', 'marseille', '椹禌', 'lyon', '閲屾槀', 'nice', 'toulouse', 'cdg', 'ory', '寰峰浗', 'germany', 'frankfurt', '娉曞叞鍏嬬', 'berlin', '鏌忔灄', 'munich', '鎱曞凹榛?, 'hamburg', '姹夊牎', 'dusseldorf', 'cologne', 'fra', 'muc', 'ber', '鑽峰叞', 'netherlands', 'holland', 'amsterdam', '闃垮鏂壒涓?, 'rotterdam', 'ams', '姣斿埄鏃?, 'belgium', 'brussels', '甯冮瞾濉炲皵', '鍗㈡．鍫?, 'luxembourg', '鐟炲＋', 'switzerland', 'zurich', '鑻忛粠涓?, 'geneva', '鏃ュ唴鐡?, 'bern', 'zrh', '濂ュ湴鍒?, 'austria', 'vienna', '缁翠篃绾?, 'vie', '鍒楁敮鏁﹀＋鐧?, 'liechtenstein', '鎽╃撼鍝?, 'monaco', '涓归害', 'denmark', 'copenhagen', '鍝ユ湰鍝堟牴', '鍐板矝', 'iceland', 'reykjavik', '鎸▉', 'norway', 'oslo', '濂ユ柉闄?, '鐟炲吀', 'sweden', 'stockholm', '鏂痉鍝ュ皵鎽?, '鑺叞', 'finland', 'helsinki', '璧皵杈涘熀', '鐖辨矙灏间簹', 'estonia', 'tallinn', '濉旀灄', '鎷夎劚缁翠簹', 'latvia', 'riga', '閲屽姞', '绔嬮櫠瀹?, 'lithuania', 'vilnius', '缁村皵绾芥柉', '鎰忓ぇ鍒?, 'italy', 'rome', '缃楅┈', 'milan', '绫冲叞', 'naples', 'florence', 'fco', 'mxp', '瑗跨彮鐗?, 'spain', 'madrid', '椹痉閲?, 'barcelona', '宸村缃楅偅', 'mad', 'bcn', '钁¤悇鐗?, 'portugal', 'lisbon', '閲屾柉鏈?, '甯岃厞', 'greece', 'athens', '闆呭吀', '椹€充粬', 'malta', '瀹夐亾灏?, 'andorra', '鍦ｉ┈鍔涜', 'san marino', '娉㈠叞', 'poland', 'warsaw', '鍗庢矙', 'krakow', 'waw', '鎹峰厠', 'czech', 'prague', '甯冩媺鏍?, '鏂礇浼愬厠', 'slovakia', 'bratislava', '鍖堢墮鍒?, 'hungary', 'budapest', '甯冭揪浣╂柉', '缃楅┈灏间簹', 'romania', 'bucharest', '甯冨姞鍕掓柉鐗?, '淇濆姞鍒╀簹', 'bulgaria', 'sofia', '绱㈣彶浜?, '淇勭綏鏂?, 'russia', 'moscow', '鑾柉绉?, 'svo', 'dme', '涔屽厠鍏?, 'ukraine', 'kiev', 'kyiv', '鍩鸿緟', '鐧戒縿缃楁柉', 'belarus', 'minsk', '鏄庢柉鍏?, '鎽╁皵澶氱摝', 'moldova', 'chisinau', '濉炲皵缁翠簹', 'serbia', 'belgrade', '璐濆皵鏍艰幈寰?, '榛戝北', 'montenegro', '鍏嬬綏鍦颁簹', 'croatia', 'zagreb', '鏂礇鏂囧凹浜?, 'slovenia', 'ljubljana', '娉㈤粦', 'bosnia', 'herzegovina', 'sarajevo', '椹叾椤?, 'macedonia', 'skopje', '闃垮皵宸村凹浜?, 'albania', 'tirana', '绉戠储娌?, 'kosovo', 'pristina', '濉炴郸璺柉', 'cyprus', 'nicosia', '鏍奸瞾鍚変簹', 'georgia', 'tbilisi', '绗瘮鍒╂柉'], iso: ['GB', 'UK', 'IE', 'FR', 'DE', 'NL', 'LU', 'CH', 'DK', 'SE', 'FI', 'EE', 'LV', 'LT', 'ES', 'PT', 'GR', 'PL', 'CZ', 'SK', 'HU', 'RO', 'BG', 'RU', 'UA', 'MD', 'RS', 'HR', 'SI', 'MK', 'XK', 'CY', 'GE', 'EU'] },
  { id: 'AM', kw: ['缇庢床', 'americas', '鎷変竵缇庢床', 'latin america', '鍗楃編', 'south america', '涓編娲?, 'central america', '鍔犲嫆姣?, 'caribbean', '鍔犳嬁澶?, 'canada', 'toronto', '澶氫鸡澶?, 'vancouver', '娓╁摜鍗?, 'montreal', '钂欑壒鍒╁皵', 'ottawa', '娓ュお鍗?, 'calgary', '鍗″皵鍔犻噷', 'edmonton', 'winnipeg', 'yyz', 'yvr', 'yul', '澧ㄨタ鍝?, 'mexico', 'mexico city', '澧ㄨタ鍝ュ煄', 'cancun', '鍧庢槅', 'guadalajara', 'monterrey', 'mex', '鍗卞湴椹媺', 'guatemala', '浼埄鍏?, 'belize', '钀ㄥ皵鐡﹀', 'el salvador', '娲兘鎷夋柉', 'honduras', '灏煎姞鎷夌摐', 'nicaragua', '鍝ユ柉杈鹃粠鍔?, 'costa rica', '宸存嬁椹?, 'panama', '鍙ゅ反', 'cuba', '鐗欎拱鍔?, 'jamaica', '澶氱背灏煎姞', 'dominican republic', '娉㈠榛庡悇', 'puerto rico', '宸村搱椹?, 'bahamas', '宸村反澶氭柉', 'barbados', '鐗圭珛灏艰揪', 'trinidad', '娴峰湴', 'haiti', '宸磋タ', 'brazil', 'sao paulo', '鍦ｄ繚缃?, 'rio de janeiro', '閲岀害鐑唴鍗?, 'gru', 'gig', '闃挎牴寤?, 'argentina', 'buenos aires', '甯冨疁璇烘柉鑹惧埄鏂?, 'eze', '鏅哄埄', 'chile', 'santiago', '绉橀瞾', 'peru', 'lima', '鍒╅┈', '鍝ヤ鸡姣斾簹', 'colombia', 'bogota', '娉㈠摜澶?, 'medellin', '濮斿唴鐟炴媺', 'venezuela', '鍘勭摐澶氬皵', 'ecuador', '鐜诲埄缁翠簹', 'bolivia', '宸存媺鍦?, 'paraguay', '涔屾媺鍦?, 'uruguay', 'montevideo', '鍦簹閭?, 'guyana', '鑻忛噷鍗?, 'suriname'], iso: ['CA', 'MX', 'GT', 'BZ', 'SV', 'HN', 'NI', 'CR', 'PA', 'CU', 'JM', 'PR', 'BS', 'BB', 'TT', 'HT', 'BR', 'AR', 'CL', 'PE', 'CO', 'VE', 'EC', 'BO', 'PY', 'UY', 'GY', 'SR'] },
  { id: 'AF', kw: ['闈炴床', 'africa', '鍩冨強', 'egypt', 'cairo', '寮€缃?, 'cai', '鑻忎腹', 'sudan', '鍗楄嫃涓?, 'south sudan', '鍒╂瘮浜?, 'libya', '绐佸凹鏂?, 'tunisia', '闃垮皵鍙婂埄浜?, 'algeria', '鎽╂礇鍝?, 'morocco', 'casablanca', '鍩冨淇勬瘮浜?, 'ethiopia', '绱㈤┈閲?, 'somalia', '鑲凹浜?, 'kenya', 'nairobi', 'nbo', '鍧︽灏间簹', 'tanzania', '涔屽共杈?, 'uganda', '鍗㈡椇杈?, 'rwanda', '甯冮殕杩?, 'burundi', '鍘勭珛鐗归噷浜?, 'eritrea', '鍚夊竷鎻?, 'djibouti', '椹揪鍔犳柉鍔?, 'madagascar', '姣涢噷姹傛柉', 'mauritius', '鑾姣斿厠', 'mozambique', '濉炶垖灏?, 'seychelles', '璧炴瘮浜?, 'zambia', '娲ュ反甯冮煢', 'zimbabwe', '椹媺缁?, 'malawi', '鍠€楹﹂殕', 'cameroon', '鍒氭灉', 'congo', '瀹夊摜鎷?, 'angola', '鍔犺摤', 'gabon', '涔嶅緱', 'chad', '涓潪', 'central african', '璧ら亾鍑犲唴浜?, 'equatorial guinea', '鍗楅潪', 'south africa', 'johannesburg', '绾︾堪鍐呮柉鍫?, 'cape town', '寮€鏅暒', 'pretoria', 'jnb', 'cpt', '绾崇背姣斾簹', 'namibia', '鍗氳尐鐡︾撼', 'botswana', '鑾辩储鎵?, 'lesotho', '鏂▉澹叞', 'eswatini', 'swaziland', '灏兼棩鍒╀簹', 'nigeria', 'lagos', 'abuja', '鍔犵撼', 'ghana', 'accra', '濉炲唴鍔犲皵', 'senegal', 'dakar', '椹噷', 'mali', '甯冨熀绾虫硶绱?, 'burkina faso', '鍑犲唴浜?, 'guinea', '绉戠壒杩摝', 'ivory coast', "cote d'ivoire", '濉炴媺鍒╂槀', 'sierra leone', '鍒╂瘮閲屼簹', 'liberia', '澶氬摜', 'togo', '璐濆畞', 'benin', '灏兼棩灏?, 'niger', '姣涢噷濉斿凹浜?, 'mauritania', '鍐堟瘮浜?, 'gambia', '浣涘緱瑙?, 'cape verde'], iso: ['EG', 'SD', 'SS', 'LY', 'TN', 'DZ', 'ET', 'KE', 'TZ', 'UG', 'RW', 'MG', 'MU', 'MZ', 'ZM', 'ZW', 'MW', 'CM', 'CD', 'CG', 'AO', 'GA', 'TD', 'ZA', 'BW', 'LS', 'SZ', 'NG', 'GH', 'SN', 'ML', 'BF', 'GN', 'CI', 'SL', 'LR', 'TG', 'BJ', 'NE', 'MR', 'GM', 'CV'] },
]

// ================================================================
//  妯″潡 C锛氬崟娆″垎绫诲紩鎿?
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
function _isChinese(str) { return /[\u4e00-\u9fa5]/.test(str) }

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
      result.UNCLASSIFIED.push(name)
      if (isHome) result.HOME_UNCLASSIFIED.push(name)
    }
  }
  return result
}

// ================================================================
//  妯″潡 D锛氬父閲忓畾涔?
// ================================================================

const SMART = {
  GLOBAL: '馃實 鍏ㄧ悆鑺傜偣', GLOBAL_HOME: '馃彙 鍏ㄧ悆瀹跺',
  HK: '馃嚟馃嚢 棣欐腐鑺傜偣', HK_HOME: '馃彙 棣欐腐瀹跺',
  TW: '馃嚬馃嚰 鍙版咕鑺傜偣', TW_HOME: '馃彙 鍙版咕瀹跺',
  SG: "🇸🇬 狮城节点", SG_HOME: "🏡 狮城家宽",
  JPKR: '馃嚡馃嚨 鏃ラ煩鑺傜偣', JPKR_HOME: '馃彙 鏃ラ煩瀹跺',
  APAC: '馃審 浜氬お鑺傜偣', APAC_HOME: '馃彙 浜氬お瀹跺',
  US: '馃嚭馃嚫 缇庡浗鑺傜偣', US_HOME: '馃彙 缇庡浗瀹跺',
  EU: '馃嚜馃嚭 娆ф床鑺傜偣', EU_HOME: '馃彙 娆ф床瀹跺',
  AMERICAS: '馃寧 缇庢床鑺傜偣', AMERICAS_HOME: '馃彙 缇庢床瀹跺',
  AFRICA: '馃實 闈炴床鑺傜偣', AFRICA_HOME: '馃彙 闈炴床瀹跺',
  OTHER: "🌏 其他节点", OTHER_HOME: "🏡 其他家宽",
}

const BIZ = {
  AI: '馃 AI 鏈嶅姟', CRYPTO: '馃挵 鍔犲瘑璐у竵', PAYMENTS: '馃彟 閲戣瀺鏀粯',
  IM: '馃挰 鍗虫椂閫氳', SOCIAL: '馃摫 绀句氦濯掍綋',
  WORK: '馃鈥嶐煉?浼氳鍗忎綔', CNMEDIA: '馃摵 鍥藉唴娴佸獟浣?,
  NFLX: '馃帴 Netflix', DSNP: '馃幀 Disney+', HBO: '馃摗 HBO/Max',
  HULU: '馃摵 Hulu', PRIME: '馃幀 Prime Video',
  YT: '馃摴 YouTube', MUSIC: '馃幍 闊充箰娴佸獟浣?,
  STREAM_HK: '馃嚟馃嚢 棣欐腐娴佸獟浣?, STREAM_TW: '馃嚬馃嚰 鍙版咕娴佸獟浣?,
  STREAM_JP: '馃嚡馃嚨 鏃ラ煩娴佸獟浣?, STREAM_EU: '馃嚜馃嚭 娆ф床娴佸獟浣?,
  STREAM_OTHER: '馃寪 鍏朵粬鍥藉娴佸獟浣?,
  GAME_CN: '馃暪锔?鍥藉唴娓告垙', GAME_INTL: '馃幃 鍥藉娓告垙',
  TOOLS: '馃敡 宸ュ叿涓庢湇鍔?, MS: '鈸傦笍 寰蒋鏈嶅姟', APPLE: '馃崕 鑻规灉鏈嶅姟',
  DOWNLOAD: '馃摜 涓嬭浇鏇存柊', TRACKER: '馃洶锔?BT/PT Tracker',
  CN_SITE: '馃彔 鍥藉唴缃戠珯',
  GFW: '馃毇 鍙楅檺缃戠珯', INTL_SITE: '馃寪 鍥藉缃戠珯',
  FINAL: '馃悷 婕忕綉涔嬮奔', AD: '馃洃 骞垮憡鎷︽埅',
}

const REGION_ORDER = ['GLOBAL', 'HK', 'TW', 'SG', 'JPKR', 'APAC', 'US', 'EU', 'AMERICAS', 'AFRICA', 'OTHER']
const REGION_HOME_MAP = {
  GLOBAL: 'GLOBAL_HOME', HK: 'HK_HOME', TW: 'TW_HOME',
  JPKR: 'JPKR_HOME', APAC: 'APAC_HOME', US: 'US_HOME',
  EU: 'EU_HOME', AMERICAS: 'AMERICAS_HOME', AFRICA: 'AFRICA_HOME',
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

// v5.1.2: GeoRouting 鍖哄煙鍒楄〃锛坢odule-level锛屼緵 providers + rules 鍏辩敤锛?
// 鈽?FIX#1: Asia_China 浠?INTL 寰幆鍓ョ锛屽崟鐙槧灏?CN_SITE锛坴5.1.1 璇皢涓浗鍩熷悕/IP 璺敱鍒板浗澶栫綉绔欙級
const GEO_REGIONS_ALL = [
  'Asia_East', 'Asia_EastSouth', 'Asia_South', 'Asia_Central', 'Asia_West',
  'Asia_China',
  'America_North', 'America_South',
  'Europe_West', 'Europe_East',
  'Oceania', 'Antarctica',
  'Africa_North', 'Africa_South', 'Africa_West', 'Africa_East', 'Africa_Central'
]
const GEO_REGIONS_INTL = GEO_REGIONS_ALL.filter(r => r !== 'Asia_China')

// ================================================================
//  妯″潡 E锛氬尯鍩熺粍鍒涘缓锛坲rl-test锛岄潪 Smart 鍐呮牳绛変环鍐欐硶锛?
// ================================================================

function upsertSmartGroup(config, name, proxies) {
  var group = { name: name, type: 'url-test', url: 'https://www.gstatic.com/generate_204', interval: 120, tolerance: 30, lazy: true, proxies: proxies.slice() }
  var idx = config['proxy-groups'].findIndex(function(g) { return g && g.name === name })
  if (idx !== -1) { config['proxy-groups'][idx] = group } else { config['proxy-groups'].push(group) }
  log(`[${VERSION}] url-test: "${name}" -> ${proxies.length} nodes`)
}

// ================================================================
//  妯″潡 F锛氫笟鍔＄瓥鐣ョ粍娉ㄥ叆锛?8缁勶級
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
  var _smartNameSet = new Set(Object.values(SMART))
  var firstSmartIdx = config['proxy-groups'].findIndex(function(g) { return g && _smartNameSet.has(g.name) })
  groups.forEach(function(group, i) {
    var existIdx = config['proxy-groups'].findIndex(function(g) { return g && g.name === group.name })
    if (existIdx !== -1) { config['proxy-groups'][existIdx] = group }
    else if (firstSmartIdx !== -1) { config['proxy-groups'].splice(firstSmartIdx + i, 0, group) }
    else { config['proxy-groups'].push(group) }
  })
  log(`[${VERSION}] Injected ${groups.length} business groups`)
}

// ================================================================
//  妯″潡 G锛歳ule-providers 娉ㄥ叆锛坴5.0: 326 providers锛?
// ================================================================

function injectRuleProviders(config) {
  if (!config['rule-providers']) config['rule-providers'] = {}

  // v5.1.6 P0-FIX#2: CDN 鍒囨崲锛坮aw.githubusercontent.com 鈫?fastly.jsdelivr.net锛夋秷闄ゅ惎鍔?EOF 椋庢毚
  const META = 'https://fastly.jsdelivr.net/gh/MetaCubeX/meta-rules-dat@meta/geo'
  // v5.1.8 PERF#2: BM7 甯搁噺绉昏嚦涓嬫柟 CDN 娣峰悎绛栫暐鍖哄潡锛圔M7_FASTLY + BM7_CF锛?
  const ACC  = 'https://fastly.jsdelivr.net/gh/Accademia/Additional_Rule_For_Clash@main'

  // v5.1.6 P0-FIX#1: 鎵€鏈?rule-providers 璧颁唬鐞嗕笅杞斤紝閬垮厤 DIRECT 鍦ㄥ鍐呯幆澧冩媺鍙栧け璐?
  // v5.2.1 FIX: jsdelivr 鍜?rule-provider 涓嬭浇璧板彈闄愮綉绔欑粍锛堜腑鍥界敤浠ｇ悊锛屽嵃灏肩敤鐩磋繛锛?
  const RP_PROXY = BIZ.GFW

  const RP_BASE = 85500
  const RP_STEP = 15
  let _rpIdx = 0
  // v5.1.8 PERF#2: 闅忔満鎶栧姩 0~59s 鎵撶牬鏁撮綈姝ラ暱鐨勫懆鏈熸€у苟鍙戞氮宄?
  const nextInterval = () => RP_BASE + ((_rpIdx++) * RP_STEP) + Math.floor(Math.random() * 60)

  // v5.1.8 PERF#2: bm7 CDN 娣峰悎绛栫暐锛堝鍋惰疆鏇?Fastly / Cloudflare锛屽垎鏁?EOF 椋庢毚锛?
  const BM7_FASTLY = 'https://fastly.jsdelivr.net/gh/blackmatrix7/ios_rule_script@master/rule/Clash'
  const BM7_CF     = 'https://cdn.jsdelivr.net/gh/blackmatrix7/ios_rule_script@master/rule/Clash'
  let _bm7Idx = 0

  const metaDomain = (id, name) => {
    config['rule-providers'][id] = { type: 'http', behavior: 'domain', format: 'mrs', url: `${META}/geosite/${name}.mrs`, path: `./ruleset/meta-${name}.mrs`, interval: nextInterval(), proxy: RP_PROXY }
  }
  const metaIpCidr = (id, name) => {
    config['rule-providers'][id] = { type: 'http', behavior: 'ipcidr', format: 'mrs', url: `${META}/geoip/${name}.mrs`, path: `./ruleset/meta-ip-${name}.mrs`, interval: nextInterval(), proxy: RP_PROXY }
  }
  const bm7 = (id, name) => {
    const cdn = ((_bm7Idx++) % 2 === 0) ? BM7_FASTLY : BM7_CF
    config['rule-providers'][id] = { type: 'http', behavior: 'classical', url: `${cdn}/${name}/${name}.yaml`, path: `./ruleset/bm7-${name}.yaml`, interval: nextInterval(), proxy: RP_PROXY }
  }
  const bm7Custom = (id, dir, file) => {
    const cdn = ((_bm7Idx++) % 2 === 0) ? BM7_FASTLY : BM7_CF
    config['rule-providers'][id] = { type: 'http', behavior: 'classical', url: `${cdn}/${dir}/${file}.yaml`, path: `./ruleset/bm7-${id}.yaml`, interval: nextInterval(), proxy: RP_PROXY }
  }

  // ============ #1 骞垮憡鎷︽埅 ============
  // v5.1.7 PERF: anti-ad 鈫?DustinWin ads.mrs锛堝悓婧?privacy-protection-tools/anti-AD锛宒omain behavior + mrs format锛?
  // 澶囬€夋柟妗堬紙鑻?DustinWin .mrs 婧愪笉鍙敤锛屽彇娑堜笅鏂规敞閲婂苟娉ㄩ噴鎺?mrs 鐗堟湰锛夛細
  //   config['rule-providers']['anti-ad'] = { type: 'http', behavior: 'domain', url: 'https://anti-ad.net/clash.yaml', path: './ruleset/anti-ad.yaml', interval: nextInterval(), proxy: RP_PROXY }
  config['rule-providers']['anti-ad'] = { type: 'http', behavior: 'domain', format: 'mrs', url: 'https://fastly.jsdelivr.net/gh/DustinWin/ruleset_geodata@mihomo-ruleset/ads.mrs', path: './ruleset/anti-ad.mrs', interval: nextInterval(), proxy: RP_PROXY }

  // ============ #2~5 AI 鏈嶅姟 ============
  metaDomain('openai', 'openai')
  bm7('claude',  'Claude')
  bm7('gemini',  'Gemini')
  bm7('copilot', 'Copilot')

  // ============ #6 鍔犲瘑璐у竵 ============
  bm7('cryptocurrency', 'Cryptocurrency')

  // ============ #7~12 鍗虫椂閫氳 ============
  metaDomain('telegram', 'telegram')
  metaIpCidr('telegram-ip', 'telegram')
  bm7('discord', 'Discord')
  bm7('line', 'Line')
  bm7('whatsapp', 'Whatsapp')
  bm7('kakaotalk', 'KakaoTalk')

  // ============ #13~22 绀句氦濯掍綋 ============
  metaDomain('twitter', 'twitter')
  metaIpCidr('twitter-ip', 'twitter')
  metaDomain('tiktok', 'tiktok')
  bm7('reddit', 'Reddit')
  bm7('facebook', 'Facebook')
  bm7('instagram', 'Instagram')
  // v5.2.3 FIX: Snap 瑙勫垯鏀圭敤 Meta geosite锛堝吋瀹?mihomo锛屼笉鍐嶈Е鍙?USER-AGENT,TikTok* 瑙ｆ瀽璀﹀憡锛?
  // bm7 Apple 鐩稿叧 provider 鍚牸寮忛敊璇?IP-CIDR锛堝浣欑┖鏍硷級锛屾瘡娆?reload 浜х敓 warning锛屼笉褰卞搷鍔熻兘
  // v5.2.4 FIX#22-P0: MetaCubeX geosite 鐨勫疄闄呮枃浠跺悕鏄?`snap.mrs` 涓嶆槸 `snapchat.mrs`锛?
  //   涔嬪墠 metaDomain('snapchat','snapchat') 浼氫骇鐢?[Provider] snapchat pull error: 403 Forbidden
  metaDomain('snapchat', 'snap')
  bm7('pinterest', 'Pinterest')
  bm7('linkedin', 'LinkedIn')
  metaIpCidr('facebook-ip', 'facebook')

  // ============ #23~25 浼氳鍗忎綔 ============
  bm7('slack', 'Slack')
  config['rule-providers']['zoom'] = { type: 'http', behavior: 'classical', url: 'https://fastly.jsdelivr.net/gh/ACL4SSR/ACL4SSR@master/Clash/Providers/Ruleset/Zoom.yaml', path: './ruleset/acl4ssr-Zoom.yaml', interval: nextInterval(), proxy: RP_PROXY }
  bm7('teams', 'Teams')

  // ============ #26~29 鎼滅储寮曟搸 ============
  metaDomain('google', 'google')
  metaIpCidr('google-ip', 'google')
  bm7('bing', 'Bing')
  bm7('googlesearch', 'GoogleSearch')

  // ============ #30~41 缇庡浗娴佸獟浣?============
  metaDomain('youtube', 'youtube')
  metaDomain('netflix', 'netflix')
  metaIpCidr('netflix-ip', 'netflix')
  metaDomain('spotify', 'spotify')
  bm7('disney', 'Disney')
  bm7('hbo', 'HBO')
  bm7('primevideo', 'PrimeVideo')
  bm7('hulu', 'Hulu')
  bm7('paramount', 'ParamountPlus')
  bm7('amazon', 'Amazon')
  bm7('peacock', 'Peacock')
  bm7('twitch', 'Twitch')

  // ============ #42~43 鍙版咕娴佸獟浣?============
  metaDomain('bahamut', 'bahamut')
  bm7('kktv', 'KKTV')

  // ============ #44~45 鏃ラ煩娴佸獟浣?============
  metaDomain('abema', 'abema')
  bm7('dazn', 'DAZN')

  // ============ #46 娆ф床娴佸獟浣?============
  // v5.2.3 FIX: BBC 瑙勫垯鏀圭敤 Meta geosite锛堝吋瀹?mihomo锛屼笉鍐嶈Е鍙?USER-AGENT,BBCiPlayer* 瑙ｆ瀽璀﹀憡锛?
  metaDomain('bbc', 'bbc')

  // ============ #47~53 鍥藉娓告垙 ============
  bm7('steam', 'Steam')
  bm7('epic', 'Epic')
  bm7('playstation', 'PlayStation')
  bm7('nintendo', 'Nintendo')
  bm7('xbox', 'Xbox')
  bm7('ea', 'EA')
  bm7('blizzard', 'Blizzard')

  // ============ #54~55 寰蒋鏈嶅姟 ============
  metaDomain('microsoft', 'microsoft')
  metaDomain('onedrive', 'onedrive')

  // ============ #56~58 鑻规灉鏈嶅姟 ============
  metaDomain('apple', 'apple')
  metaDomain('icloud', 'icloud')
  bm7('applemusic', 'AppleMusic')

  // ============ #59~61 寮€鍙戣€呮湇鍔?============
  metaDomain('github', 'github')
  bm7('docker', 'Docker')
  bm7('gitlab', 'GitLab')

  // ============ #62 閲戣瀺鏀粯 ============
  bm7('paypal', 'PayPal')

  // ============ #63~65 浜戜笌CDN ============
  metaIpCidr('cloudflare-ip', 'cloudflare')
  metaIpCidr('cloudfront-ip', 'cloudfront')
  metaIpCidr('fastly-ip', 'fastly')

  // ============ #66 涓嬭浇鏇存柊 ============
  bm7('systemota', 'SystemOTA')

  // ============ #67 涓滃崡浜氭祦濯掍綋 ============
  bm7('viu', 'ViuTV')

  // ============ #68~69 鍥藉唴娴佸獟浣?============
  metaDomain('bilibili', 'bilibili')
  metaDomain('biliintl', 'biliintl')

  // ============ #70~72 鍥藉唴/鍥藉鍏滃簳 ============
  metaDomain('cn', 'cn')
  metaIpCidr('cn-ip', 'cn')
  metaDomain('proxy', 'geolocation-!cn')

    // ============ v5.0 鏂板 254 providers (bm7) ============
    bm7('advertising', 'Advertising')
    bm7('advertisingmitv', 'AdvertisingMiTV')
    bm7('adobeactivation', 'AdobeActivation')
    bm7('blockhttpdns', 'BlockHttpDNS')
    bm7('domob', 'Domob')
    bm7('hijacking', 'Hijacking')
    bm7('jiguangtuisong', 'JiGuangTuiSong')
    bm7('marketing', 'Marketing')
    bm7('miuiprivacy', 'MIUIPrivacy')
    bm7('privacy', 'Privacy')
    bm7('youmengchuangxiang', 'YouMengChuangXiang')
    bm7('civitai', 'Civitai')
    bm7('binance', 'Binance')
    bm7('stripe', 'Stripe')
    bm7('visa', 'VISA')
    bm7('tigerfintech', 'TigerFintech')
    bm7('mail', 'Mail')
    bm7('mailru', 'Mailru')
    bm7('protonmail', 'Protonmail')
    bm7('spark', 'Spark')
    bm7('telegramnl', 'TelegramNL')
    bm7('telegramsg', 'TelegramSG')
    bm7('telegramus', 'TelegramUS')
    bm7('zalo', 'Zalo')
    bm7('googlevoice', 'GoogleVoice')
    bm7('italkbb', 'iTalkBB')
    bm7('tumblr', 'Tumblr')
    bm7('clubhouse', 'Clubhouse')
    bm7('clubhouseip', 'ClubhouseIP')
    bm7('pixiv', 'Pixiv')
    bm7('truthsocial', 'TruthSocial')
    bm7('vk', 'VK')
    bm7('blued', 'Blued')
    bm7('disqus', 'Disqus')
    bm7('imgur', 'Imgur')
    bm7('pixnet', 'Pixnet')
    bm7('atlassian', 'Atlassian')
    bm7('notion', 'Notion')
    bm7('teamviewer', 'TeamViewer')
    bm7('zoho', 'Zoho')
    bm7('salesforce', 'Salesforce')
    bm7('zendesk', 'Zendesk')
    bm7('intercom', 'Intercom')
    bm7('remotedesktop', 'RemoteDesktop')
    bm7('iqiyi', 'iQIYI')
    bm7('youku', 'Youku')
    bm7('tencentvideo', 'TencentVideo')
    bm7('douyin', 'DouYin')
    bm7('bytedance', 'ByteDance')
    bm7('kuaishou', 'KuaiShou')
    bm7('weibo', 'Weibo')
    bm7('xiaohongshu', 'XiaoHongShu')
    bm7('neteasemusic', 'NetEaseMusic')
    bm7('kugoukuwo', 'KugouKuwo')
    bm7('sohu', 'Sohu')
    bm7('acfun', 'AcFun')
    bm7('douyu', 'Douyu')
    bm7('huya', 'HuYa')
    bm7('himalaya', 'Himalaya')
    bm7('cctv', 'CCTV')
    bm7('hunantv', 'HunanTV')
    bm7('pptv', 'PPTV')
    bm7('funshion', 'Funshion')
    bm7('letv', 'LeTV')
    bm7('taihemusic', 'TaiheMusic')
    bm7('kukemusic', 'KuKeMusic')
    bm7('hibymusic', 'HibyMusic')
    bm7('miwu', 'MiWu')
    bm7('migu', 'Migu')
    bm7('iptvmainland', 'IPTVMainland')
    bm7('iptvother', 'IPTVOther')
    bm7('cibn', 'CIBN')
    bm7('bestv', 'BesTV')
    bm7('huashutv', 'HuaShuTV')
    bm7('smg', 'SMG')
    bm7('hwtv', 'HWTV')
    bm7('nivodtv', 'NivodTV')
    bm7('olevod', 'Olevod')
    bm7('dandanzan', 'DanDanZan')
    bm7('dandanplay', 'Dandanplay')
    bm7('tiantiankankan', 'TianTianKanKan')
    bm7('yizhibo', 'YiZhiBo')
    bm7('ku6', 'Ku6')
    bm7('56', '56')
    bm7('cetv', 'CETV')
    bm7('yyets', 'YYeTs')
    bm7('asianmedia', 'AsianMedia')
    bm7('iqiyiintl', 'iQIYIIntl')
    bm7('joox', 'JOOX')
    bm7('mewatch', 'MeWatch')
    bm7('viki', 'Viki')
    bm7('wetv', 'WeTV')
    bm7('zee', 'Zee')
    bm7('cbs', 'CBS')
    bm7('nbc', 'NBC')
    bm7('pbs', 'PBS')
    bm7('attwatchtv', 'ATTWatchTV')
    bm7('fox', 'Fox')
    bm7('fubotv', 'FuboTV')
    bm7('sling', 'Sling')
    bm7('soundcloud', 'SoundCloud')
    bm7('pandora', 'Pandora')
    bm7('pandoratv', 'PandoraTV')
    bm7('tidal', 'TIDAL')
    bm7('vimeo', 'Vimeo')
    bm7('dailymotion', 'Dailymotion')
    bm7('deezer', 'Deezer')
    bm7('discoveryplus', 'DiscoveryPlus')
    bm7('overcast', 'Overcast')
    bm7('americasvoice', 'Americasvoice')
    bm7('cake', 'Cake')
    bm7('dood', 'Dood')
    bm7('ehgallery', 'EHGallery')
    bm7('lastfm', 'LastFM')
    bm7('emby', 'Emby')
    bm7('mytvsuper', 'myTVSUPER')
    bm7('tvb', 'TVB')
    bm7('encoretvb', 'EncoreTVB')
    bm7('nowe', 'NowE')
    bm7('rthk', 'RTHK')
    bm7('cabletv', 'CableTV')
    bm7('moov', 'MOOV')
    bm7('litv', 'LiTV')
    bm7('friday', 'friDay')
    bm7('hamivideo', 'HamiVideo')
    bm7('linetv', 'LineTV')
    bm7('vidoltv', 'VidolTV')
    bm7('taiwangood', 'TaiWanGood')
    bm7('cht', 'CHT')
    bm7('dmm', 'DMM')
    bm7('tver', 'TVer')
    bm7('niconico', 'Niconico')
    bm7('rakuten', 'Rakuten')
    bm7('japonx', 'Japonx')
    bm7('nikkei', 'Nikkei')
    bm7('itv', 'ITV')
    bm7('all4', 'All4')
    bm7('my5', 'My5')
    bm7('skygo', 'SkyGO')
    bm7('britboxuk', 'BritboxUK')
    bm7('londonreal', 'LondonReal')
    bm7('qobuz', 'Qobuz')
    bm7('steamcn', 'SteamCN')
    bm7('wanmeishijie', 'WanMeiShiJie')
    bm7('wankahuanju', 'WanKaHuanJu')
    bm7('majsoul', 'Majsoul')
    bm7('rockstar', 'Rockstar')
    bm7('riot', 'Riot')
    bm7('gog', 'Gog')
    bm7('supercell', 'Supercell')
    bm7('garena', 'Garena')
    bm7('hoyoverse', 'HoYoverse')
    bm7('ubi', 'UBI')
    bm7('wildrift', 'WildRift')
    bm7('sony', 'Sony')
    bm7('yandex', 'Yandex')
    bm7('googledrive', 'GoogleDrive')
    bm7('googleearth', 'GoogleEarth')
    bm7('naver', 'Naver')
    bm7('scholar', 'Scholar')
    bm7('developer', 'Developer')
    bm7('python', 'Python')
    bm7('gitbook', 'GitBook')
    bm7('jfrog', 'Jfrog')
    bm7('sublimetext', 'SublimeText')
    bm7('wordpress', 'Wordpress')
    bm7('wix', 'WIX')
    bm7('cisco', 'Cisco')
    bm7('ibm', 'IBM')
    bm7('oracle', 'Oracle')
    bm7('unity', 'Unity')
    bm7('microsoftedge', 'MicrosoftEdge')
    bm7('appstore', 'AppStore')
    bm7('appletv', 'AppleTV')
    bm7('applenews', 'AppleNews')
    bm7('appledev', 'AppleDev')
    bm7('appleproxy', 'AppleProxy')
    bm7('siri', 'Siri')
    bm7('testflight', 'TestFlight')
    bm7('applefirmware', 'AppleFirmware')
    bm7('findmy', 'FindMy')
    bm7('download', 'Download')
    bm7('ubuntu', 'Ubuntu')
    bm7('mozilla', 'Mozilla')
    bm7('apkpure', 'Apkpure')
    bm7('android', 'Android')
    bm7('googlefcm', 'GoogleFCM')
    bm7('intel', 'Intel')
    bm7('nvidia', 'Nvidia')
    bm7('dell', 'Dell')
    bm7('hp', 'HP')
    bm7('canon', 'Canon')
    bm7('lg', 'LG')
    bm7('cloudflare', 'Cloudflare')
    bm7('akamai', 'Akamai')
    // v5.1.2 FIX#6: 鍒犻櫎 bm7 DNS provider锛堟贩鍚堜腑澶朌NS閿佹CLOUD_CDN锛屾敼涓鸿嚜鐒跺垎娴侊級
    // bm7('dns', 'DNS')  鈫?REMOVED
    bm7('digicert', 'DigiCert')
    bm7('globalsign', 'GlobalSign')
    bm7('sectigo', 'Sectigo')
    bm7('brightcove', 'BrightCove')
    bm7('jwplayer', 'Jwplayer')
    bm7('privatetracker', 'PrivateTracker')
    bm7('cnn', 'CNN')
    bm7('nytimes', 'NYTimes')
    bm7('bloomberg', 'Bloomberg')
    bm7('ebay', 'eBay')
    bm7('nike', 'Nike')
    bm7('adobe', 'Adobe')
    bm7('samsung', 'Samsung')
    bm7('tesla', 'Tesla')
    bm7('dropbox', 'Dropbox')
    bm7('mega', 'MEGA')
    bm7('wikipedia', 'Wikipedia')
    bm7('duolingo', 'Duolingo')


    // ================================================================
    //  v5.1 Step 1: P0/P2 瀹夊叏瑙勫垯 + 閲忓寲浜ゆ槗澧炲己
    // ================================================================

    // 鈹€鈹€ P0: Ckrvxr/MihomoRules 瀹夊叏闃叉姢 鈹€鈹€
    // v5.2.1 REMOVED: ckrvxr-antipcdn 鍜?ckrvxr-antifraud 瑙勫垯婧愬凡涓嬬嚎锛堟寔缁?404锛夛紝宸插垹闄?
    // P0: SukkaW 13涓囬挀楸煎煙鍚嶆嫤鎴紙domain behavior + text format锛?
    config['rule-providers']['sukka-phishing'] = {
      type: 'http', behavior: 'domain', format: 'text',
      url: 'https://ruleset.skk.moe/Clash/domainset/reject_phishing.txt',
      path: './ruleset/sukka-reject-phishing.txt',
      interval: nextInterval(),
      proxy: RP_PROXY
    }
    // v5.1.6-P0: Hagezi Threat Intelligence Feeds锛堝▉鑳佹儏鎶ワ細malware/cryptojacking/C2/scam/spam锛?
    // 浼樺厛鏂规锛歁iHomoer .mrs 浜岃繘鍒舵牸寮忥紙domain behavior锛屽喎鍚姩寮€閿€鏋佸皬锛?
    // 澶囬€夋柟妗堬紙鑻?mrs 婧愪笉鍙敤锛屽彇娑堜笅鏂规敞閲婂苟娉ㄩ噴鎺?mrs 鐗堟湰锛夛細
    //   config['rule-providers']['hagezi-tif'] = {
    //     type: 'http', behavior: 'domain', format: 'text',
    //     url: 'https://fastly.jsdelivr.net/gh/hagezi/dns-blocklists@main/domains/tif.medium.txt',
    //     path: './ruleset/hagezi-tif-medium.txt',
    //     interval: nextInterval(),
    //     proxy: RP_PROXY
    //   }
    config['rule-providers']['hagezi-tif'] = {
      type: 'http', behavior: 'domain', format: 'mrs',
      url: 'https://fastly.jsdelivr.net/gh/MiHomoer/MiHomo-Hagezi@release/HageziUltimate.mrs',
      path: './ruleset/hagezi-tif.mrs',
      interval: nextInterval(),
      proxy: RP_PROXY
    }

    // ================================================================
    //  v5.1 Step 3: szkane/ClashRuleSet 鍏ㄩ噺琛ュ厖
    // ================================================================

    // 鈹€鈹€ szkane AI 鏈嶅姟锛圤penAI/Claude/Grok/Perplexity/Gemini 鍚堝苟锛夆攢鈹€
    config['rule-providers']['szkane-ai'] = {
      type: 'http', behavior: 'classical', format: 'text',
      url: 'https://fastly.jsdelivr.net/gh/szkane/ClashRuleSet@main/Clash/Ruleset/AiDomain.list',
      path: './ruleset/szkane-AiDomain.list',
      interval: nextInterval(),
      proxy: RP_PROXY
    }
    // 鈹€鈹€ szkane CiciAI锛堝瓧鑺傛捣澶朅I锛欳oze International/Luma AI锛岄渶鏂板姞鍧¤妭鐐癸級鈹€鈹€
    // v5.2.7 FIX#27-P1: upstream `Clash/Ruleset/CiciAi.list` 鍚?`USER-AGENT,TikTok*`锛宮ihomo
    //   classical provider 涓嶈瘑鍒?USER-AGENT 浼氳Е鍙?`parse classical rule [USER-AGENT,TikTok*]
    //   error: unsupported rule type: USER-AGENT`銆傛敼鐢ㄦ湰浠撳簱 mirrors/ 鐨勬竻娲楀壇鏈紙浠呭垹璇ヨ锛?
    //   TikTok 鍩熷悕宸茬敱 metaDomain('tiktok','tiktok') 瑕嗙洊锛夈€?
    config['rule-providers']['szkane-ciciai'] = {
      type: 'http', behavior: 'classical', format: 'text',
      url: 'https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/mirrors/CiciAi.list',
      path: './ruleset/szkane-CiciAi.list',
      interval: nextInterval(),
      proxy: RP_PROXY
    }
    // 鈹€鈹€ szkane Web3锛圖eFi/NFT/鍖哄潡閾綬PC/浜ゆ槗鎵€锛夆槄閲忓寲浜ゆ槗鏍稿績 鈹€鈹€
    config['rule-providers']['szkane-web3'] = {
      type: 'http', behavior: 'classical', format: 'text',
      url: 'https://fastly.jsdelivr.net/gh/szkane/ClashRuleSet@main/Clash/Web3.list',
      path: './ruleset/szkane-Web3.list',
      interval: nextInterval(),
      proxy: RP_PROXY
    }
    // 鈹€鈹€ szkane Developer锛圖ocker闀滃儚/HuggingFace妯″瀷/寮€鍙戣€呬笅杞斤級鈹€鈹€
    config['rule-providers']['szkane-developer'] = {
      type: 'http', behavior: 'classical', format: 'text',
      url: 'https://fastly.jsdelivr.net/gh/szkane/ClashRuleSet@main/Clash/Ruleset/Developer.list',
      path: './ruleset/szkane-Developer.list',
      interval: nextInterval(),
      proxy: RP_PROXY
    }
    // 鈹€鈹€ szkane Education锛圞han Academy锛夆攢鈹€
    config['rule-providers']['szkane-khan'] = {
      type: 'http', behavior: 'classical', format: 'text',
      url: 'https://fastly.jsdelivr.net/gh/szkane/ClashRuleSet@main/Clash/Ruleset/Khan.list',
      path: './ruleset/szkane-Khan.list',
      interval: nextInterval(),
      proxy: RP_PROXY
    }
    // 鈹€鈹€ szkane Education锛圕oursera/edX/Udacity绛夛級鈹€鈹€
    config['rule-providers']['szkane-edutools'] = {
      type: 'http', behavior: 'classical', format: 'text',
      url: 'https://fastly.jsdelivr.net/gh/szkane/ClashRuleSet@main/Clash/Ruleset/Edutools.list',
      path: './ruleset/szkane-Edutools.list',
      interval: nextInterval(),
      proxy: RP_PROXY
    }
    // 鈹€鈹€ szkane UK Apps 鈹€鈹€
    // v5.2.7 FIX#27-P1: upstream `Clash/Ruleset/UK.list` 鍚?`USER-AGENT,BBCiPlayer*`锛?
    //   mihomo classical provider 涓嶈瘑鍒?USER-AGENT 浼氳Е鍙?
    //   `parse classical rule [USER-AGENT,BBCiPlayer*] error: unsupported rule type: USER-AGENT`銆?
    //   鏀圭敤鏈粨搴?mirrors/ 鐨勬竻娲楀壇鏈紙BBC 鍩熷悕宸茬敱 metaDomain('bbc','bbc') 瑕嗙洊锛夈€?
    config['rule-providers']['szkane-uk'] = {
      type: 'http', behavior: 'classical', format: 'text',
      url: 'https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/mirrors/UK.list',
      path: './ruleset/szkane-UK.list',
      interval: nextInterval(),
      proxy: RP_PROXY
    }
    // 鈹€鈹€ szkane BilibiliHMT锛堟腐婢冲彴鍝斿摡鍝斿摡锛夆攢鈹€
    config['rule-providers']['szkane-bilihmt'] = {
      type: 'http', behavior: 'classical', format: 'text',
      url: 'https://fastly.jsdelivr.net/gh/szkane/ClashRuleSet@main/Clash/Ruleset/BilibiliHMT.list',
      path: './ruleset/szkane-BilibiliHMT.list',
      interval: nextInterval(),
      proxy: RP_PROXY
    }
    // 鈹€鈹€ szkane Netflix IP 娈?鈹€鈹€
    config['rule-providers']['szkane-netflixip'] = {
      type: 'http', behavior: 'classical', format: 'text',
      url: 'https://fastly.jsdelivr.net/gh/szkane/ClashRuleSet@main/Clash/Ruleset/NetflixIP.list',
      path: './ruleset/szkane-NetflixIP.list',
      interval: nextInterval(),
      proxy: RP_PROXY
    }
    // 鈹€鈹€ szkane ProxyGFWlist锛圙FW鍩熷悕琛ュ厖锛夆攢鈹€
    config['rule-providers']['szkane-proxygfw'] = {
      type: 'http', behavior: 'classical', format: 'text',
      url: 'https://fastly.jsdelivr.net/gh/szkane/ClashRuleSet@main/Clash/ProxyGFWlist.list',
      path: './ruleset/szkane-ProxyGFWlist.list',
      interval: nextInterval(),
      proxy: RP_PROXY
    }

    // ================================================================
    //  v5.1.4: Loyalsoldier/clash-rules GFW 灏侀攣鍩熷悕瑙勫垯闆?
    //  鈽?涓浗 GFW 棰嗗煙鏈€鏉冨▉鐨?Clash 鏍煎紡瑙勫垯婧愶紙猸?.6k锛?
    //  涓婃父鏁版嵁閾撅細
    //    gfwlist/gfwlist锛堚瓙11k锛孏FW 灏侀攣鍩熷悕鍘熷鍒楄〃锛?
    //    + v2fly/domain-list-community锛堚瓙7.1k锛孷2Ray 绀惧尯鍩熷悕鍒嗙被鏁版嵁搴擄級
    //    + GreatFire Analyzer锛堢嫭绔嬪皝閿佹帰娴嬫満鏋勶級
    //    鈫?Loyalsoldier/v2ray-rules-dat锛堣仛鍚堣浆鎹級
    //    鈫?Loyalsoldier/clash-rules锛圕lash 鏍煎紡 GitHub Actions 姣忔棩鍖椾含鏃堕棿6:30鑷姩鏋勫缓锛?
    //  鉂?鎺掗櫎 tld-not-cn.txt锛氬寘鍚墍鏈夐潪CN椤剁骇鍩熷悕(.com/.net/.org)锛屽お瀹芥硾浼氬悶鎺夊嚑涔庢墍鏈夊浗澶栧煙鍚?
    // ================================================================

    // 鈹€鈹€ GFWList 灏侀攣鍩熷悕锛堟牳蹇冨垪琛紝~4000+ 鍩熷悕锛夆攢鈹€
    // v5.1.7 PERF: text 鈫?MetaCubeX geosite:gfw.mrs锛堝悓婧?gfwlist 鈫?v2fly/domain-list-community锛?
    // 澶囬€夋柟妗堬紙鑻?MetaCubeX .mrs 婧愪笉鍙敤锛屽彇娑堜笅鏂规敞閲婂苟娉ㄩ噴鎺?mrs 鐗堟湰锛夛細
    //   config['rule-providers']['loyalsoldier-gfw'] = {
    //     type: 'http', behavior: 'domain', format: 'text',
    //     url: 'https://fastly.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/gfw.txt',
    //     path: './ruleset/loyalsoldier-gfw.txt',
    //     interval: nextInterval(),
    //     proxy: RP_PROXY
    //   }
    metaDomain('loyalsoldier-gfw', 'gfw')
    // 鈹€鈹€ GreatFire 灏侀攣鍩熷悕锛堢嫭绔嬫帰娴嬫簮锛屼笌 GFWList 浜掕ˉ锛夆攢鈹€
    // v5.1.7 PERF: text 鈫?MetaCubeX geosite:greatfire.mrs锛堝悓婧?GreatFire Analyzer 鈫?v2fly锛?
    // 澶囬€夋柟妗堬紙鑻?MetaCubeX .mrs 婧愪笉鍙敤锛屽彇娑堜笅鏂规敞閲婂苟娉ㄩ噴鎺?mrs 鐗堟湰锛夛細
    //   config['rule-providers']['loyalsoldier-greatfire'] = {
    //     type: 'http', behavior: 'domain', format: 'text',
    //     url: 'https://fastly.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/greatfire.txt',
    //     path: './ruleset/loyalsoldier-greatfire.txt',
    //     interval: nextInterval(),
    //     proxy: RP_PROXY
    //   }
    metaDomain('loyalsoldier-greatfire', 'greatfire')

    // ================================================================
    //  v5.1 Step 2: Accademia/Additional_Rule_For_Clash 鍏ㄩ噺35鐩綍
    //  鈽?浣滀负 blackmatrix7/ios_rule_script 鐨勮ˉ鍏呰鍒?
    // ================================================================

    // 鈹€鈹€ AI 鏈嶅姟琛ュ厖 鈹€鈹€
    config['rule-providers']['acc-appleai'] = {
      type: 'http', behavior: 'classical',
      url: 'https://fastly.jsdelivr.net/gh/Accademia/Additional_Rule_For_Clash@main/AppleAI/AppleAI.yaml',
      path: './ruleset/acc-AppleAI.yaml',
      interval: nextInterval(),
      proxy: RP_PROXY
    }
    // v5.2.7 FIX#27-P1: upstream `Grok/Grok.yaml` 鍚?`IP-CIDR         , 17.253.4.125`
    //   锛堝浣欑┖鏍?+ 缂?CIDR 鎺╃爜锛変細瑙﹀彂
    //   `parse classical rule [IP-CIDR , 17.253.4.125] error: payloadRule error`銆?
    //   鏀圭敤鏈粨搴?mirrors/ 鐨勬竻娲楀壇鏈紙浠呭垹璇ヨ + 瑙勬暣绌烘牸锛夈€?
    config['rule-providers']['acc-grok'] = {
      type: 'http', behavior: 'classical',
      url: 'https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/mirrors/Grok.yaml',
      path: './ruleset/acc-Grok.yaml',
      interval: nextInterval(),
      proxy: RP_PROXY
    }
    config['rule-providers']['acc-gemini'] = {
      type: 'http', behavior: 'classical',
      url: 'https://fastly.jsdelivr.net/gh/Accademia/Additional_Rule_For_Clash@main/Gemini/Gemini.yaml',
      path: './ruleset/acc-Gemini.yaml',
      interval: nextInterval(),
      proxy: RP_PROXY
    }
    config['rule-providers']['acc-copilot'] = {
      type: 'http', behavior: 'classical',
      url: 'https://fastly.jsdelivr.net/gh/Accademia/Additional_Rule_For_Clash@main/Copilot/Copilot.yaml',
      path: './ruleset/acc-Copilot.yaml',
      interval: nextInterval(),
      proxy: RP_PROXY
    }

    // 鈹€鈹€ 閲戣瀺鏈嶅姟锛欱ank 脳 10鍥斤紙鍘?acc-bank 404 鈫?鎷嗗垎涓哄瓙 provider锛夆攢鈹€
    for (const cc of ['US', 'UK', 'HK', 'SG', 'JP', 'AU', 'CA', 'DE', 'NL', 'FR']) {
      config['rule-providers'][`acc-bank-${cc.toLowerCase()}`] = {
        type: 'http', behavior: 'classical',
        url: `${ACC}/Bank/Bank${cc}.yaml`,
        path: `./ruleset/acc-Bank${cc}.yaml`,
        interval: nextInterval(),
        proxy: RP_PROXY
      }
    }
    // 鈹€鈹€ 閲戣瀺鏈嶅姟锛歏irtualFinance 脳 4锛堝師 acc-virtualfinance 404 鈫?鎷嗗垎锛夆攢鈹€
    for (const svc of ['Paypal', 'Wise', 'Monzo', 'Revolut']) {
      config['rule-providers'][`acc-vf-${svc.toLowerCase()}`] = {
        type: 'http', behavior: 'classical',
        url: `${ACC}/VirtualFinance/${svc}.yaml`,
        path: `./ruleset/acc-${svc}.yaml`,
        interval: nextInterval(),
        proxy: RP_PROXY
      }
    }

    // 鈹€鈹€ 鑻规灉琛ュ厖 鈹€鈹€
    config['rule-providers']['acc-applenews'] = {
      type: 'http', behavior: 'classical',
      url: 'https://fastly.jsdelivr.net/gh/Accademia/Additional_Rule_For_Clash@main/AppleNews/AppleNews.yaml',
      path: './ruleset/acc-AppleNews.yaml',
      interval: nextInterval(),
      proxy: RP_PROXY
    }
    config['rule-providers']['acc-apple'] = {
      type: 'http', behavior: 'classical',
      url: 'https://fastly.jsdelivr.net/gh/Accademia/Additional_Rule_For_Clash@main/Apple/Apple.yaml',
      path: './ruleset/acc-Apple.yaml',
      interval: nextInterval(),
      proxy: RP_PROXY
    }

    // 鈹€鈹€ 寰蒋琛ュ厖 鈹€鈹€
    config['rule-providers']['acc-microsoftapps'] = {
      type: 'http', behavior: 'classical',
      url: 'https://fastly.jsdelivr.net/gh/Accademia/Additional_Rule_For_Clash@main/MicrosoftAPPs/MicrosoftAPPs.yaml',
      path: './ruleset/acc-MicrosoftAPPs.yaml',
      interval: nextInterval(),
      proxy: RP_PROXY
    }

    // 鈹€鈹€ 鍗虫椂閫氳 鈹€鈹€
    config['rule-providers']['acc-signal'] = {
      type: 'http', behavior: 'classical',
      url: 'https://fastly.jsdelivr.net/gh/Accademia/Additional_Rule_For_Clash@main/Signal/Signal.yaml',
      path: './ruleset/acc-Signal.yaml',
      interval: nextInterval(),
      proxy: RP_PROXY
    }

    // 鈹€鈹€ 杩滅▼鍗忎綔 鈹€鈹€
    config['rule-providers']['acc-rustdesk'] = {
      type: 'http', behavior: 'classical',
      url: 'https://fastly.jsdelivr.net/gh/Accademia/Additional_Rule_For_Clash@main/RustDesk/RustDesk.yaml',
      path: './ruleset/acc-RustDesk.yaml',
      interval: nextInterval(),
      proxy: RP_PROXY
    }
    config['rule-providers']['acc-parsec'] = {
      type: 'http', behavior: 'classical',
      url: 'https://fastly.jsdelivr.net/gh/Accademia/Additional_Rule_For_Clash@main/Parsec/Parsec.yaml',
      path: './ruleset/acc-Parsec.yaml',
      interval: nextInterval(),
      proxy: RP_PROXY
    }

    // 鈹€鈹€ 鍥藉唴浜戠洏/娴佸獟浣?鈹€鈹€
    config['rule-providers']['acc-alipan'] = {
      type: 'http', behavior: 'classical',
      url: 'https://fastly.jsdelivr.net/gh/Accademia/Additional_Rule_For_Clash@main/Alipan/Alipan.yaml',
      path: './ruleset/acc-Alipan.yaml',
      interval: nextInterval(),
      proxy: RP_PROXY
    }
    config['rule-providers']['acc-baidunetdisk'] = {
      type: 'http', behavior: 'classical',
      url: 'https://fastly.jsdelivr.net/gh/Accademia/Additional_Rule_For_Clash@main/BaiduNetDisk/BaiduNetDisk.yaml',
      path: './ruleset/acc-BaiduNetDisk.yaml',
      interval: nextInterval(),
      proxy: RP_PROXY
    }
    config['rule-providers']['acc-weiyun'] = {
      type: 'http', behavior: 'classical',
      url: 'https://fastly.jsdelivr.net/gh/Accademia/Additional_Rule_For_Clash@main/WeiYun/WeiYun.yaml',
      path: './ruleset/acc-WeiYun.yaml',
      interval: nextInterval(),
      proxy: RP_PROXY
    }
    config['rule-providers']['acc-kwai'] = {
      type: 'http', behavior: 'classical',
      url: 'https://fastly.jsdelivr.net/gh/Accademia/Additional_Rule_For_Clash@main/Kwai/Kwai.yaml',
      path: './ruleset/acc-Kwai.yaml',
      interval: nextInterval(),
      proxy: RP_PROXY
    }
    // v5.1.1: FakeLocation 脳 10 骞冲彴锛堝師 acc-fakelocation 404 鈫?鎷嗗垎锛?
    for (const app of [
      'BiliBili', 'DouYin', 'KuaiShou', 'XiaoHongShu', 'XiGua',
      'WeiBo', 'ZhiHu', 'TieBa', 'DouBan', 'XianYu'
    ]) {
      config['rule-providers'][`acc-fl-${app.toLowerCase()}`] = {
        type: 'http', behavior: 'classical',
        url: `${ACC}/FakeLocation/FakeLocation${app}.yaml`,
        path: `./ruleset/acc-FakeLocation${app}.yaml`,
        interval: nextInterval(),
        proxy: RP_PROXY
      }
    }

    // 鈹€鈹€ 骞垮憡/瀹夊叏/闅愮 鈹€鈹€
    config['rule-providers']['acc-hijackingplus'] = {
      type: 'http', behavior: 'classical',
      url: 'https://fastly.jsdelivr.net/gh/Accademia/Additional_Rule_For_Clash@main/HijackingPlus/HijackingPlus.yaml',
      path: './ruleset/acc-HijackingPlus.yaml',
      interval: nextInterval(),
      proxy: RP_PROXY
    }
    config['rule-providers']['acc-blockhttpdnsplus'] = {
      type: 'http', behavior: 'classical',
      url: 'https://fastly.jsdelivr.net/gh/Accademia/Additional_Rule_For_Clash@main/BlockHttpDNSPlus/BlockHttpDNSPlus.yaml',
      path: './ruleset/acc-BlockHttpDNSPlus.yaml',
      interval: nextInterval(),
      proxy: RP_PROXY
    }
    config['rule-providers']['acc-prerepaireasyprivacy'] = {
      type: 'http', behavior: 'classical',
      url: 'https://fastly.jsdelivr.net/gh/Accademia/Additional_Rule_For_Clash@main/PreRepairEasyPrivacy/PreRepairEasyPrivacy.yaml',
      path: './ruleset/acc-PreRepairEasyPrivacy.yaml',
      interval: nextInterval(),
      proxy: RP_PROXY
    }
    config['rule-providers']['acc-unsupportvpn'] = {
      type: 'http', behavior: 'classical',
      url: 'https://fastly.jsdelivr.net/gh/Accademia/Additional_Rule_For_Clash@main/UnsupportVPN/UnsupportVPN.yaml',
      path: './ruleset/acc-UnsupportVPN.yaml',
      interval: nextInterval(),
      proxy: RP_PROXY
    }

    // 鈹€鈹€ 涓嬭浇鏇存柊 鈹€鈹€
    config['rule-providers']['acc-macappupgrade'] = {
      type: 'http', behavior: 'classical',
      url: 'https://fastly.jsdelivr.net/gh/Accademia/Additional_Rule_For_Clash@main/MacAppUpgrade/MacAppUpgrade.yaml',
      path: './ruleset/acc-MacAppUpgrade.yaml',
      interval: nextInterval(),
      proxy: RP_PROXY
    }

    // 鈹€鈹€ CDN/DNS 鈹€鈹€
    config['rule-providers']['acc-fastly'] = {
      type: 'http', behavior: 'classical',
      url: 'https://fastly.jsdelivr.net/gh/Accademia/Additional_Rule_For_Clash@main/Fastly/Fastly.yaml',
      path: './ruleset/acc-Fastly.yaml',
      interval: nextInterval(),
      proxy: RP_PROXY
    }
    // v5.1.2 FIX#6: 鍒犻櫎 acc-globaldns provider锛堝浗澶朌NS鐢卞悇鏈嶅姟鍟嗚鍒欒嚜鐒跺垎娴侊級
    // acc-globaldns  鈫?REMOVED
    // v5.1.2 FIX#6: 鍒犻櫎 acc-chinadns provider锛堜腑鍥紻NS鐢盋N鍏滃簳瑙勫垯鑷劧鍒嗘祦鍒扮洿杩烇級
    // acc-chinadns  鈫?REMOVED
    // v5.2.5 FIX#23-P1: acc-geositecn + acc-china 鍒犻櫎
    //   杩欎袱涓槸 geosite:cn (metaDomain('cn', 'cn') 宸叉彁渚? 鐨勭函閲嶅锛?
    //   淇濈暀 acc-chinamax 浣滀负 ChinaMax 鐙珛琛ュ厖瑕嗙洊

    // 鈹€鈹€ 鍥藉唴鍏滃簳琛ュ厖 鈹€鈹€
    config['rule-providers']['acc-chinamax'] = {
      type: 'http', behavior: 'classical',
      url: 'https://fastly.jsdelivr.net/gh/Accademia/Additional_Rule_For_Clash@main/ChinaMax/ChinaMax.yaml',
      path: './ruleset/acc-ChinaMax.yaml',
      interval: nextInterval(),
      proxy: RP_PROXY
    }
    // v5.1.1: HomeIP 脳 2鍥斤紙鍘?acc-homeip 404 鈫?鎷嗗垎锛?
    for (const cc of ['US', 'JP']) {
      config['rule-providers'][`acc-homeip-${cc.toLowerCase()}`] = {
        type: 'http', behavior: 'classical',
        url: `${ACC}/HomeIP/HomeIP${cc}.yaml`,
        path: `./ruleset/acc-HomeIP${cc}.yaml`,
        interval: nextInterval(),
        proxy: RP_PROXY
      }
    }

    // 鈹€鈹€ 鍥藉缃戠珯 鈹€鈹€
    config['rule-providers']['acc-waybackmachine'] = {
      type: 'http', behavior: 'classical',
      url: 'https://fastly.jsdelivr.net/gh/Accademia/Additional_Rule_For_Clash@main/WaybackMachine/WaybackMachine.yaml',
      path: './ruleset/acc-WaybackMachine.yaml',
      interval: nextInterval(),
      proxy: RP_PROXY
    }
    config['rule-providers']['acc-pornhub'] = {
      type: 'http', behavior: 'classical',
      url: 'https://fastly.jsdelivr.net/gh/Accademia/Additional_Rule_For_Clash@main/Pornhub/Pornhub.yaml',
      path: './ruleset/acc-Pornhub.yaml',
      interval: nextInterval(),
      proxy: RP_PROXY
    }

    // 鈹€鈹€ IoT锛欰qara 脳 2锛堝師 acc-aqara 404 鈫?鎷嗗垎鍥藉唴/鍥介檯锛夆攢鈹€
    config['rule-providers']['acc-aqara-cn'] = {
      type: 'http', behavior: 'classical',
      url: `${ACC}/Aqara/AqaraCN.yaml`,
      path: './ruleset/acc-AqaraCN.yaml',
      interval: nextInterval(),
      proxy: RP_PROXY
    }
    config['rule-providers']['acc-aqara-global'] = {
      type: 'http', behavior: 'classical',
      url: `${ACC}/Aqara/AqaraGlobal.yaml`,
      path: './ruleset/acc-AqaraGlobal.yaml',
      interval: nextInterval(),
      proxy: RP_PROXY
    }

    // 鈹€鈹€ P2P/Tracker 鈹€鈹€
    config['rule-providers']['acc-emuleserver'] = {
      type: 'http', behavior: 'classical',
      url: 'https://fastly.jsdelivr.net/gh/Accademia/Additional_Rule_For_Clash@main/eMuleServer/eMuleServer.yaml',
      path: './ruleset/acc-eMuleServer.yaml',
      interval: nextInterval(),
      proxy: RP_PROXY
    }

    // 鈹€鈹€ GeoRouting Domain 脳 17 鍖哄煙锛堝師 acc-georouting-domain 404 鈫?鎸夊尯鍩熸媶鍒嗭紝Domain鐗?浣滆€呮帹鑽愷煍ワ級鈹€鈹€
    for (const region of GEO_REGIONS_ALL) {
      const slug = region.toLowerCase().replace(/_/g, '-')
      config['rule-providers'][`acc-geo-d-${slug}`] = {
        type: 'http', behavior: 'domain',
        url: `${ACC}/GeoRouting_For_Domain/GeoRouting_${region}_ccTLD_Domain.yaml`,
        path: `./ruleset/acc-GeoD-${region}.yaml`,
        interval: nextInterval(),
        proxy: RP_PROXY
      }
    }
    // 鈹€鈹€ GeoRouting IP 脳 17 鍖哄煙锛堝師 acc-georouting-ip 404 鈫?鎸夊尯鍩熸媶鍒嗭級鈹€鈹€
    for (const region of GEO_REGIONS_ALL) {
      const slug = region.toLowerCase().replace(/_/g, '-')
      config['rule-providers'][`acc-geo-ip-${slug}`] = {
        type: 'http', behavior: 'classical',
        url: `${ACC}/GeoRouting_For_IP/GeoRouting_${region}_GeoIP.yaml`,
        path: `./ruleset/acc-GeoIP-${region}.yaml`,
        interval: nextInterval(),
        proxy: RP_PROXY
      }
    }

  const count = Object.keys(config['rule-providers']).length
  log(`[${VERSION}] Injected ${count} rule-providers (base=${RP_BASE}s step=${RP_STEP}s spread=${_rpIdx * RP_STEP}s/${(_rpIdx * RP_STEP / 60).toFixed(1)}min)`)
}

// ================================================================
//  妯″潡 H锛氳鍒欐敞鍏?
// ================================================================

function injectRules(config) {
  // FlClash: 鍏堟瀯寤哄畬鏁存暟缁勶紝鍐嶅師鍦板啓鍏ワ紙涓嶈兘 config.rules = [...] 鍥犱负 QuickJS FFI 涓嶆敮鎸佹暟缁勯噸璧嬪€硷級
  var _newRules = [
    `RULE-SET,anti-ad,${BIZ.AD}`,
    // v5.1: P0 瀹夊叏 - 閽撻奔鍩熷悕鎷︽埅锛?3涓囨潯锛孲ukkaW锛?
    `RULE-SET,sukka-phishing,${BIZ.AD}`,
    // v5.1.6: P0 瀹夊叏 - 濞佽儊鎯呮姤锛圚agezi TIF锛歮alware/cryptojacking/C2/scam/spam锛?
    `RULE-SET,hagezi-tif,${BIZ.AD}`,
    // v5.2.1 REMOVED: ckrvxr-antifraud 鍜?ckrvxr-antipcdn 瑙勫垯婧愬凡涓嬬嚎
    // v5.1: Accademia 瀹夊叏琛ュ厖
    `RULE-SET,acc-hijackingplus,${BIZ.AD}`,
    `RULE-SET,acc-blockhttpdnsplus,${BIZ.AD}`,
    `RULE-SET,acc-prerepaireasyprivacy,${BIZ.AD}`,
    `RULE-SET,acc-unsupportvpn,${BIZ.AD}`,
    `GEOSITE,category-ads-all,${BIZ.AD}`,
    `RULE-SET,advertising,${BIZ.AD}`,
    `RULE-SET,advertisingmitv,${BIZ.AD}`,
    `RULE-SET,adobeactivation,${BIZ.AD}`,
    `RULE-SET,blockhttpdns,${BIZ.AD}`,
    `RULE-SET,domob,${BIZ.AD}`,
    `RULE-SET,hijacking,${BIZ.AD}`,
    `RULE-SET,jiguangtuisong,${BIZ.AD}`,
    `RULE-SET,marketing,${BIZ.AD}`,
    `RULE-SET,miuiprivacy,${BIZ.AD}`,
    `RULE-SET,privacy,${BIZ.AD}`,
    `RULE-SET,youmengchuangxiang,${BIZ.AD}`,
    // v5.2.1 FIX#19: DST-PORT,7680 蹇呴』鍦?GEOIP,private 涔嬪墠锛屽惁鍒欑鏈?IP 鍏堝尮閰嶈蛋 DIRECT
    'DST-PORT,7680,REJECT',
    'GEOSITE,private,DIRECT',
    'GEOIP,private,DIRECT,no-resolve',
    'IP-CIDR,172.90.1.130/32,DIRECT,no-resolve',
    'PROCESS-NAME,WorkPro.exe,DIRECT',
    'PROCESS-NAME,GCUService.exe,DIRECT',
    'PROCESS-NAME,GCUBridge.exe,DIRECT',
    'PROCESS-NAME,CCUWinUI.exe,DIRECT',
    'PROCESS-NAME,HipsDaemon.exe,DIRECT',
    'PROCESS-NAME,gdphost.exe,DIRECT',
    'PROCESS-NAME,gehsender.exe,DIRECT',
    'PROCESS-NAME,GSCService.exe,DIRECT',
    // v5.1.8 FIX#12-P1: GSCService.exe 姣?2h 璁块棶 ip.cip.cc 鍋氬閮?IP 妫€娴嬶紝TUN 涓?DNS 瑙ｆ瀽澶辫触
    // 鏃ュ織锛歞ial DIRECT (match ProcessName/GSCService.exe) --> ip.cip.cc:80 error: dns resolve failed
    'DOMAIN,ip.cip.cc,DIRECT',
    'PROCESS-NAME,gsupservice.exe,DIRECT',
    'PROCESS-NAME,gchsvc.exe,DIRECT',
    'PROCESS-NAME,Weixin.exe,DIRECT',
    'PROCESS-NAME,WeChatAppEx.exe,DIRECT',
    'PROCESS-NAME,QQ.exe,DIRECT',
    'PROCESS-NAME,WeChat.exe,DIRECT',
    'DST-PORT,26880,DIRECT',
    'DST-PORT,6540,DIRECT',
    'DST-PORT,33068,DIRECT',
    'DST-PORT,123,DIRECT',
    'DST-PORT,3478,DIRECT',
    'DST-PORT,3479,DIRECT',
    'DOMAIN-SUFFIX,chiphell.com,DIRECT',
    'DOMAIN-SUFFIX,iwipwedabay.com,DIRECT',
    // v5.2.0 CLEAN#2: Binance 绮剧‘ DOMAIN 瑙勫垯宸叉竻鐞嗭紙鍏ㄩ儴琚悓缁?DOMAIN-SUFFIX 瑕嗙洊锛?
    // 淇濈暀 fake-ip-filter 涓殑绮剧‘鍩熷悕锛圖NS 灞傜嫭绔嬩簬瑙勫垯灞傦紝涓嶅彈褰卞搷锛?
    `DOMAIN-SUFFIX,binance.vision,${BIZ.CRYPTO}`,
    `DOMAIN-SUFFIX,binance.com,${BIZ.CRYPTO}`,
    `DOMAIN-SUFFIX,binance.info,${BIZ.CRYPTO}`,
    `DOMAIN-SUFFIX,binance.cloud,${BIZ.CRYPTO}`,
    `DOMAIN-SUFFIX,binance.me,${BIZ.CRYPTO}`,
    `DOMAIN-SUFFIX,binance.org,${BIZ.CRYPTO}`,
    `DOMAIN-SUFFIX,binancefuture.com,${BIZ.CRYPTO}`,
    // v5.1.8 FIX#11-P0: dns.google 鏄?DoH 鏈嶅姟锛屽墠缃嫤鎴槻姝?szkane-ai 瀹借鍒欏悶鍏?AI 缁?
    // v5.2.10 FIX#39: 鐢?鈽侊笍 浜戜笌CDN 鏀硅矾鐢卞埌 馃毇 鍙楅檺缃戠珯鈥斺€攄ns.google 鍦ㄥ鍐呰灏侊紝
    //                 鑻ョ敤鎴锋妸 CDN 缁勮璁剧洿杩烇紝DoH 蹇呭け璐ワ紱鏀惧湪 GFW 缁勮涔夋洿鍑嗙‘
    `DOMAIN,dns.google,${BIZ.GFW}`,
    `DOMAIN,dns.google.com,${BIZ.GFW}`,
    // v5.1.8 FIX#14-P0: YouTube/googlevideo 琚?szkane-ai 瀹借鍒欏悶鍏?AI 缁?
    // szkane AiDomain.list 鍚?Google 瀹藉煙鍚嶏紙鍥?Gemini锛夛紝瀵艰嚧 YouTube 鍏ㄧ郴璇蛋 AI 浠ｇ悊
    // 鏃ュ織锛歔TCP] dial 馃 AI 鏈嶅姟 (match RuleSet/szkane-ai) --> www.youtube.com / yt3.ggpht.com / googlevideo.com
    // 鍓嶇疆绮惧噯鎷︽埅鍒?STREAM_US锛屼紭鍏堜簬 RULE-SET,szkane-ai 鐢熸晥
    `DOMAIN-SUFFIX,youtube.com,${BIZ.YT}`,
    `DOMAIN-SUFFIX,youtu.be,${BIZ.YT}`,
    `DOMAIN-SUFFIX,googlevideo.com,${BIZ.YT}`,
    `DOMAIN-SUFFIX,ytimg.com,${BIZ.YT}`,
    `DOMAIN-SUFFIX,ggpht.com,${BIZ.YT}`,
    `DOMAIN-SUFFIX,youtube-nocookie.com,${BIZ.YT}`,
    `DOMAIN-SUFFIX,youtubekids.com,${BIZ.YT}`,
    `RULE-SET,openai,${BIZ.AI}`,
    `RULE-SET,claude,${BIZ.AI}`,
    `RULE-SET,gemini,${BIZ.AI}`,
    `RULE-SET,copilot,${BIZ.AI}`,
    `DOMAIN-SUFFIX,perplexity.ai,${BIZ.AI}`,
    `DOMAIN-SUFFIX,mistral.ai,${BIZ.AI}`,
    `DOMAIN-SUFFIX,x.ai,${BIZ.AI}`,
    `DOMAIN-SUFFIX,grok.com,${BIZ.AI}`,
    `DOMAIN-SUFFIX,deepseek.com,${BIZ.CN_SITE}`,
    `DOMAIN-SUFFIX,huggingface.co,${BIZ.AI}`,
    `DOMAIN-SUFFIX,replicate.com,${BIZ.AI}`,
    `DOMAIN-SUFFIX,together.ai,${BIZ.AI}`,
    `DOMAIN-SUFFIX,cohere.ai,${BIZ.AI}`,
    `DOMAIN-SUFFIX,cohere.com,${BIZ.AI}`,
    `DOMAIN-SUFFIX,midjourney.com,${BIZ.AI}`,
    `DOMAIN-SUFFIX,stability.ai,${BIZ.AI}`,
    `DOMAIN-SUFFIX,anthropic.com,${BIZ.AI}`,
    `DOMAIN-SUFFIX,cursor.com,${BIZ.AI}`,
    `DOMAIN-SUFFIX,cursor.sh,${BIZ.AI}`,
    `DOMAIN-SUFFIX,v0.dev,${BIZ.AI}`,
    `DOMAIN-SUFFIX,vercel.ai,${BIZ.AI}`,
    `DOMAIN-SUFFIX,notebooklm.google,${BIZ.AI}`,
    `DOMAIN-SUFFIX,poe.com,${BIZ.AI}`,
    `DOMAIN-SUFFIX,character.ai,${BIZ.AI}`,
    // v5.2.2: PI.ai/Inflection 鈫?GFW锛堜腑鍥借澧欓渶浠ｇ悊锛屽嵃灏煎彲鐩磋繛锛?
    `DOMAIN-SUFFIX,inflection.ai,${BIZ.GFW}`,
    `DOMAIN-SUFFIX,pi.ai,${BIZ.GFW}`,
    `DOMAIN-SUFFIX,suno.ai,${BIZ.AI}`,
    `DOMAIN-SUFFIX,suno.com,${BIZ.AI}`,
    `DOMAIN-SUFFIX,runway.ml,${BIZ.AI}`,
    `DOMAIN-SUFFIX,runwayml.com,${BIZ.AI}`,
    `DOMAIN-SUFFIX,openrouter.ai,${BIZ.AI}`,
    `DOMAIN-SUFFIX,fireworks.ai,${BIZ.AI}`,
    `DOMAIN-SUFFIX,modal.com,${BIZ.AI}`,
    `DOMAIN-SUFFIX,modal.run,${BIZ.AI}`,
    `DOMAIN-SUFFIX,runpod.io,${BIZ.AI}`,
    `RULE-SET,civitai,${BIZ.AI}`,
    // 鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲
    //  v5.1.8 FIX#14-P0锛欸oogle 瀛愭湇鍔￠槻鍚炵浘
    //  szkane AiDomain.list 鍚?Google 瀹藉煙鍚嶏紙鍥?Gemini/Bard锛夛紝瀵艰嚧 Google 鍏ㄧ郴璇蛋 AI 浠ｇ悊
    //  瑙ｆ硶锛氬湪 RULE-SET,szkane-ai 涔嬪墠鍓嶇疆鎵€鏈?Google 闈?AI 瀛愭湇鍔＄簿鍑嗚鍒?
    //  宸插畨鍏紙鍦ㄦ涔嬪墠宸插尮閰嶏級锛欸emini(RULE-SET) / NotebookLM / YouTube / dns.google
    //  鈻?浠ヤ笅瑙勫垯浠庡悇涓氬姟鍖哄潡鎻愬崌鑷虫锛屽師浣嶇疆 dead rules 宸插湪 v5.1.9 娓呴櫎
    // 鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲
    // 鈹€鈹€ Google 閭欢 鈹€鈹€
    `DOMAIN-SUFFIX,gmail.com,${BIZ.INTL_SITE}`,
    `DOMAIN-SUFFIX,googlemail.com,${BIZ.INTL_SITE}`,
    `DOMAIN,mail.google.com,${BIZ.INTL_SITE}`,
    `DOMAIN,inbox.google.com,${BIZ.INTL_SITE}`,
    // 鈹€鈹€ Google 鍗虫椂閫氳 鈹€鈹€
    `RULE-SET,googlevoice,${BIZ.IM}`,
    // 鈹€鈹€ Google 浼氳鍗忎綔 鈹€鈹€
    `DOMAIN-SUFFIX,meet.google.com,${BIZ.WORK}`,
    `DOMAIN,meet.googleapis.com,${BIZ.WORK}`,
    // 鈹€鈹€ Google 涓嬭浇鏇存柊 鈹€鈹€
    `DOMAIN-SUFFIX,dl.google.com,${BIZ.DOWNLOAD}`,
    `DOMAIN-SUFFIX,play.googleapis.com,${BIZ.DOWNLOAD}`,
    `DOMAIN-SUFFIX,android.clients.google.com,${BIZ.DOWNLOAD}`,
    `RULE-SET,googlefcm,${BIZ.DOWNLOAD}`,
    // 鈹€鈹€ Google 鎼滅储寮曟搸锛堝厹搴曪細MetaCubeX geosite:google 瑕嗙洊 google.com/co.*/com.*锛夆攢鈹€
    `RULE-SET,googlesearch,${BIZ.TOOLS}`,
    `RULE-SET,googledrive,${BIZ.TOOLS}`,
    `RULE-SET,googleearth,${BIZ.TOOLS}`,
    `RULE-SET,google,${BIZ.TOOLS}`,
    `RULE-SET,google-ip,${BIZ.TOOLS},no-resolve`,
    // 鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲
    // v5.1: szkane AI 缁煎悎 + Accademia AI 琛ュ厖
    `RULE-SET,szkane-ai,${BIZ.AI}`,
    `RULE-SET,szkane-ciciai,${BIZ.AI}`,
    `RULE-SET,acc-appleai,${BIZ.AI}`,
    `RULE-SET,acc-grok,${BIZ.AI}`,
    `RULE-SET,acc-gemini,${BIZ.AI}`,
    // v5.1.8 FIX#13-P2: 寰蒋 Delivery Optimization 閬ユ祴闈?Copilot AI锛屽墠缃嫤鎴?
    // 鏃ュ織锛歮atch RuleSet/acc-copilot) --> geover.prod.do.dsp.mp.microsoft.com:443
    `DOMAIN-SUFFIX,do.dsp.mp.microsoft.com,${BIZ.DOWNLOAD}`,
    `RULE-SET,acc-copilot,${BIZ.AI}`,
    `DOMAIN-SUFFIX,tradingview.com,${BIZ.CRYPTO}`,
    `DOMAIN-SUFFIX,tvcdn.com,${BIZ.CRYPTO}`,
    `DOMAIN-SUFFIX,coinglass.com,${BIZ.CRYPTO}`,
    `DOMAIN-SUFFIX,hyperliquid.xyz,${BIZ.CRYPTO}`,
    `DOMAIN-SUFFIX,hyperliquid-testnet.xyz,${BIZ.CRYPTO}`,
    `RULE-SET,cryptocurrency,${BIZ.CRYPTO}`,
    `DOMAIN-SUFFIX,eth.limo,${BIZ.CRYPTO}`,
    `DOMAIN-SUFFIX,glitternode.ru,${BIZ.CRYPTO}`,
    `RULE-SET,binance,${BIZ.CRYPTO}`,
    // v5.1: szkane Web3锛圖eFi/NFT/鍖哄潡閾綬PC锛夆槄閲忓寲浜ゆ槗鏍稿績
    `RULE-SET,szkane-web3,${BIZ.CRYPTO}`,
    `RULE-SET,paypal,${BIZ.PAYMENTS}`,
    `DOMAIN-SUFFIX,stripe.com,${BIZ.PAYMENTS}`,
    `DOMAIN-SUFFIX,stripe.network,${BIZ.PAYMENTS}`,
    `DOMAIN-SUFFIX,stripecdn.com,${BIZ.PAYMENTS}`,
    `DOMAIN-SUFFIX,stripe.dev,${BIZ.PAYMENTS}`,
    `DOMAIN-SUFFIX,wise.com,${BIZ.PAYMENTS}`,
    `DOMAIN-SUFFIX,transferwise.com,${BIZ.PAYMENTS}`,
    `DOMAIN-SUFFIX,revolut.com,${BIZ.PAYMENTS}`,
    `DOMAIN-SUFFIX,revolut.me,${BIZ.PAYMENTS}`,
    `DOMAIN-SUFFIX,braintreegateway.com,${BIZ.PAYMENTS}`,
    `DOMAIN-SUFFIX,braintree-api.com,${BIZ.PAYMENTS}`,
    `DOMAIN-SUFFIX,venmo.com,${BIZ.PAYMENTS}`,
    `DOMAIN-SUFFIX,cash.app,${BIZ.PAYMENTS}`,
    `DOMAIN-SUFFIX,squareup.com,${BIZ.PAYMENTS}`,
    `DOMAIN-SUFFIX,square.com,${BIZ.PAYMENTS}`,
    `DOMAIN-SUFFIX,adyen.com,${BIZ.PAYMENTS}`,
    `DOMAIN-SUFFIX,checkout.com,${BIZ.PAYMENTS}`,
    `DOMAIN-SUFFIX,klarna.com,${BIZ.PAYMENTS}`,
    `DOMAIN-SUFFIX,afterpay.com,${BIZ.PAYMENTS}`,
    `DOMAIN-SUFFIX,plaid.com,${BIZ.PAYMENTS}`,
    `DOMAIN-SUFFIX,midtrans.com,${BIZ.PAYMENTS}`,
    `DOMAIN-SUFFIX,gopay.co.id,${BIZ.PAYMENTS}`,
    `DOMAIN-SUFFIX,ovo.id,${BIZ.PAYMENTS}`,
    `DOMAIN-SUFFIX,dana.id,${BIZ.PAYMENTS}`,
    `DOMAIN-SUFFIX,shopeepay.co.id,${BIZ.PAYMENTS}`,
    `DOMAIN-SUFFIX,xendit.co,${BIZ.PAYMENTS}`,
    `DOMAIN-SUFFIX,doku.com,${BIZ.PAYMENTS}`,
    `RULE-SET,stripe,${BIZ.PAYMENTS}`,
    `RULE-SET,visa,${BIZ.PAYMENTS}`,
    `RULE-SET,tigerfintech,${BIZ.PAYMENTS}`,
    // v5.1.1: Accademia 閾惰 脳 10鍥?+ 铏氭嫙閲戣瀺 脳 4
    ...['US','UK','HK','SG','JP','AU','CA','DE','NL','FR'].map(cc => `RULE-SET,acc-bank-${cc.toLowerCase()},${BIZ.PAYMENTS}`),
    ...['paypal','wise','monzo','revolut'].map(svc => `RULE-SET,acc-vf-${svc},${BIZ.PAYMENTS}`),
    `DOMAIN,login.live.com,${BIZ.MS}`,
    `DOMAIN,g.live.com,${BIZ.MS}`,
    `DOMAIN-SUFFIX,officeapps.live.com,${BIZ.MS}`,
    // v5.1.9 CLEAN#1: gmail.com/googlemail.com/mail.google.com/inbox.google.com 宸叉彁鍗囪嚦闃插悶鐩撅紙FIX#14锛夛紝dead rules 宸叉竻闄?
    `DOMAIN-SUFFIX,outlook.com,${BIZ.INTL_SITE}`,
    `DOMAIN-SUFFIX,outlook.live.com,${BIZ.INTL_SITE}`,
    `DOMAIN-SUFFIX,hotmail.com,${BIZ.INTL_SITE}`,
    `DOMAIN,mail.live.com,${BIZ.INTL_SITE}`,
    `DOMAIN,outlook.office365.com,${BIZ.INTL_SITE}`,
    `DOMAIN,outlook.office.com,${BIZ.INTL_SITE}`,
    `DOMAIN,mail.yahoo.com,${BIZ.INTL_SITE}`,
    `DOMAIN-SUFFIX,ymail.com,${BIZ.INTL_SITE}`,
    `DOMAIN-SUFFIX,protonmail.com,${BIZ.INTL_SITE}`,
    `DOMAIN-SUFFIX,proton.me,${BIZ.INTL_SITE}`,
    `DOMAIN-SUFFIX,pm.me,${BIZ.INTL_SITE}`,
    `DOMAIN-SUFFIX,tutanota.com,${BIZ.INTL_SITE}`,
    `DOMAIN-SUFFIX,tuta.com,${BIZ.INTL_SITE}`,
    // v5.1.3 FIX#7: Zoho 瀹藉煙鍚嶆敹绐勪负閭欢涓撶敤瀛愬煙鍚嶏紙闃叉鍚炴帀 RULE-SET,zoho 浼氳鍗忎綔瑙勫垯锛?
    `DOMAIN,mail.zoho.com,${BIZ.INTL_SITE}`,
    `DOMAIN,mail.zoho.eu,${BIZ.INTL_SITE}`,
    `DOMAIN,mail.zoho.in,${BIZ.INTL_SITE}`,
    `DOMAIN,mail.zoho.com.au,${BIZ.INTL_SITE}`,
    `DOMAIN,mail.zoho.jp,${BIZ.INTL_SITE}`,
    `DOMAIN,mail.me.com,${BIZ.INTL_SITE}`,
    `DOMAIN-SUFFIX,fastmail.com,${BIZ.INTL_SITE}`,
    `DOMAIN-SUFFIX,fastmail.fm,${BIZ.INTL_SITE}`,
    `RULE-SET,mail,${BIZ.INTL_SITE}`,
    `RULE-SET,mailru,${BIZ.INTL_SITE}`,
    `RULE-SET,protonmail,${BIZ.INTL_SITE}`,
    `RULE-SET,spark,${BIZ.INTL_SITE}`,
    'DOMAIN-SUFFIX,mail.qq.com,DIRECT',
    'DOMAIN-SUFFIX,mail.163.com,DIRECT',
    'DOMAIN-SUFFIX,mail.126.com,DIRECT',
    'DOMAIN-SUFFIX,mail.sina.com.cn,DIRECT',
    'DOMAIN-SUFFIX,mail.aliyun.com,DIRECT',
    `RULE-SET,telegram,${BIZ.IM}`,
    `RULE-SET,telegram-ip,${BIZ.IM},no-resolve`,
    `RULE-SET,discord,${BIZ.IM}`,
    `RULE-SET,whatsapp,${BIZ.IM}`,
    `RULE-SET,line,${BIZ.IM}`,
    `RULE-SET,kakaotalk,${BIZ.IM}`,
    `DOMAIN-SUFFIX,skype.com,${BIZ.IM}`,
    `DOMAIN-SUFFIX,skypeecs.net,${BIZ.IM}`,
    `DOMAIN-SUFFIX,skypeforbusiness.com,${BIZ.IM}`,
    `DOMAIN-SUFFIX,sfbassets.com,${BIZ.IM}`,
    `DOMAIN-SUFFIX,lync.com,${BIZ.IM}`,
    `DOMAIN-SUFFIX,signal.org,${BIZ.IM}`,
    `DOMAIN-SUFFIX,whispersystems.org,${BIZ.IM}`,
    `DOMAIN-SUFFIX,signal.art,${BIZ.IM}`,
    `DOMAIN-SUFFIX,viber.com,${BIZ.IM}`,
    `DOMAIN-SUFFIX,viber.io,${BIZ.IM}`,
    `DOMAIN-SUFFIX,element.io,${BIZ.IM}`,
    `DOMAIN-SUFFIX,matrix.org,${BIZ.IM}`,
    `DOMAIN-SUFFIX,zalo.me,${BIZ.IM}`,
    `DOMAIN-SUFFIX,zalopay.vn,${BIZ.IM}`,
    `DOMAIN-SUFFIX,wire.com,${BIZ.IM}`,
    `DOMAIN-SUFFIX,threema.ch,${BIZ.IM}`,
    `RULE-SET,telegramnl,${BIZ.IM},no-resolve`,
    `RULE-SET,telegramsg,${BIZ.IM},no-resolve`,
    `RULE-SET,telegramus,${BIZ.IM},no-resolve`,
    `RULE-SET,zalo,${BIZ.IM}`,
    // v5.1.9 CLEAN#1: googlevoice 宸叉彁鍗囪嚦闃插悶鐩撅紙FIX#14锛夛紝dead rule 宸叉竻闄?
    `RULE-SET,italkbb,${BIZ.IM}`,
    // v5.1: Accademia Signal 琛ュ厖
    `RULE-SET,acc-signal,${BIZ.IM}`,
    `DOMAIN-SUFFIX,icq.com,${BIZ.IM}`,
    `RULE-SET,twitter,${BIZ.SOCIAL}`,
    `RULE-SET,twitter-ip,${BIZ.SOCIAL},no-resolve`,
    `RULE-SET,tiktok,${BIZ.SOCIAL}`,
    `RULE-SET,reddit,${BIZ.SOCIAL}`,
    `RULE-SET,facebook,${BIZ.SOCIAL}`,
    `RULE-SET,facebook-ip,${BIZ.SOCIAL},no-resolve`,
    `RULE-SET,instagram,${BIZ.SOCIAL}`,
    `RULE-SET,snapchat,${BIZ.SOCIAL}`,
    `RULE-SET,pinterest,${BIZ.SOCIAL}`,
    `RULE-SET,linkedin,${BIZ.SOCIAL}`,
    `DOMAIN-SUFFIX,mastodon.social,${BIZ.SOCIAL}`,
    `DOMAIN-SUFFIX,joinmastodon.org,${BIZ.SOCIAL}`,
    `DOMAIN-SUFFIX,threads.net,${BIZ.SOCIAL}`,
    `DOMAIN-SUFFIX,bsky.app,${BIZ.SOCIAL}`,
    `DOMAIN-SUFFIX,bsky.social,${BIZ.SOCIAL}`,
    `DOMAIN-SUFFIX,tumblr.com,${BIZ.SOCIAL}`,
    `DOMAIN-SUFFIX,quora.com,${BIZ.SOCIAL}`,
    `DOMAIN-SUFFIX,medium.com,${BIZ.SOCIAL}`,
    `DOMAIN-SUFFIX,flickr.com,${BIZ.SOCIAL}`,
    `DOMAIN-SUFFIX,clubhouse.com,${BIZ.SOCIAL}`,
    `DOMAIN-SUFFIX,lemon8-app.com,${BIZ.SOCIAL}`,
    `RULE-SET,tumblr,${BIZ.SOCIAL}`,
    `RULE-SET,clubhouse,${BIZ.SOCIAL}`,
    `RULE-SET,clubhouseip,${BIZ.SOCIAL},no-resolve`,
    `RULE-SET,pixiv,${BIZ.SOCIAL}`,
    `RULE-SET,truthsocial,${BIZ.SOCIAL}`,
    `RULE-SET,vk,${BIZ.SOCIAL}`,
    `RULE-SET,blued,${BIZ.CN_SITE}`,
    `RULE-SET,disqus,${BIZ.SOCIAL}`,
    `RULE-SET,imgur,${BIZ.SOCIAL}`,
    `RULE-SET,pixnet,${BIZ.SOCIAL}`,
    `RULE-SET,zoom,${BIZ.WORK}`,
    `RULE-SET,slack,${BIZ.WORK}`,
    `RULE-SET,teams,${BIZ.WORK}`,
    // v5.1.9 CLEAN#1: meet.google.com/meet.googleapis.com 宸叉彁鍗囪嚦闃插悶鐩撅紙FIX#14锛夛紝dead rules 宸叉竻闄?
    `DOMAIN-SUFFIX,webex.com,${BIZ.WORK}`,
    `DOMAIN-SUFFIX,wbx2.com,${BIZ.WORK}`,
    `DOMAIN-SUFFIX,ciscospark.com,${BIZ.WORK}`,
    `DOMAIN-SUFFIX,notion.so,${BIZ.WORK}`,
    `DOMAIN-SUFFIX,notion.site,${BIZ.WORK}`,
    `DOMAIN-SUFFIX,figma.com,${BIZ.WORK}`,
    `DOMAIN-SUFFIX,linear.app,${BIZ.WORK}`,
    `DOMAIN-SUFFIX,atlassian.com,${BIZ.WORK}`,
    `DOMAIN-SUFFIX,jira.com,${BIZ.WORK}`,
    `DOMAIN-SUFFIX,trello.com,${BIZ.WORK}`,
    `DOMAIN-SUFFIX,bitbucket.org,${BIZ.WORK}`,
    `DOMAIN-SUFFIX,asana.com,${BIZ.WORK}`,
    `DOMAIN-SUFFIX,monday.com,${BIZ.WORK}`,
    `DOMAIN-SUFFIX,clickup.com,${BIZ.WORK}`,
    `DOMAIN-SUFFIX,basecamp.com,${BIZ.WORK}`,
    `DOMAIN-SUFFIX,airtable.com,${BIZ.WORK}`,
    `DOMAIN-SUFFIX,miro.com,${BIZ.WORK}`,
    `DOMAIN-SUFFIX,canva.com,${BIZ.WORK}`,
    `DOMAIN-SUFFIX,coda.io,${BIZ.WORK}`,
    `DOMAIN-SUFFIX,loom.com,${BIZ.WORK}`,
    `DOMAIN-SUFFIX,larksuite.com,${BIZ.WORK}`,
    `DOMAIN-SUFFIX,larkoffice.com,${BIZ.WORK}`,
    `DOMAIN-SUFFIX,gotomeeting.com,${BIZ.WORK}`,
    `DOMAIN-SUFFIX,logmein.com,${BIZ.WORK}`,
    `DOMAIN-SUFFIX,goto.com,${BIZ.WORK}`,
    `RULE-SET,atlassian,${BIZ.WORK}`,
    `RULE-SET,notion,${BIZ.WORK}`,
    `RULE-SET,teamviewer,${BIZ.WORK}`,
    `RULE-SET,zoho,${BIZ.WORK}`,
    `RULE-SET,salesforce,${BIZ.WORK}`,
    `RULE-SET,zendesk,${BIZ.WORK}`,
    `RULE-SET,intercom,${BIZ.WORK}`,
    `RULE-SET,remotedesktop,${BIZ.WORK}`,
    // v5.1: Accademia 杩滅▼妗岄潰琛ュ厖
    `RULE-SET,acc-rustdesk,${BIZ.WORK}`,
    `RULE-SET,acc-parsec,${BIZ.WORK}`,
    'DOMAIN-SUFFIX,feishu.cn,DIRECT',
    'DOMAIN-SUFFIX,dingtalk.com,DIRECT',
    'DOMAIN-SUFFIX,welink.huaweicloud.com,DIRECT',
    `RULE-SET,bilibili,${BIZ.CNMEDIA}`,
    `DOMAIN-SUFFIX,iqiyi.com,${BIZ.CNMEDIA}`,
    `DOMAIN-SUFFIX,iqiyipic.com,${BIZ.CNMEDIA}`,
    `DOMAIN-SUFFIX,71.am,${BIZ.CNMEDIA}`,
    `DOMAIN-SUFFIX,youku.com,${BIZ.CNMEDIA}`,
    `DOMAIN-SUFFIX,ykimg.com,${BIZ.CNMEDIA}`,
    `DOMAIN-SUFFIX,soku.com,${BIZ.CNMEDIA}`,
    `DOMAIN-SUFFIX,v.qq.com,${BIZ.CNMEDIA}`,
    `DOMAIN-SUFFIX,video.qq.com,${BIZ.CNMEDIA}`,
    `DOMAIN-KEYWORD,tencentvideo,${BIZ.CNMEDIA}`,
    `DOMAIN-SUFFIX,mgtv.com,${BIZ.CNMEDIA}`,
    `DOMAIN-SUFFIX,hitv.com,${BIZ.CNMEDIA}`,
    `DOMAIN-SUFFIX,hunantv.com,${BIZ.CNMEDIA}`,
    `DOMAIN-SUFFIX,douyin.com,${BIZ.CNMEDIA}`,
    `DOMAIN-SUFFIX,douyinpic.com,${BIZ.CNMEDIA}`,
    `DOMAIN-SUFFIX,douyinvod.com,${BIZ.CNMEDIA}`,
    `DOMAIN-SUFFIX,ixigua.com,${BIZ.CNMEDIA}`,
    `DOMAIN-SUFFIX,pstatp.com,${BIZ.CNMEDIA}`,
    `DOMAIN-SUFFIX,snssdk.com,${BIZ.CNMEDIA}`,
    `DOMAIN-SUFFIX,sohu.com,${BIZ.CNMEDIA}`,
    `DOMAIN-SUFFIX,music.163.com,${BIZ.CNMEDIA}`,
    `DOMAIN-SUFFIX,ntes53.netease.com,${BIZ.CNMEDIA}`,
    `DOMAIN-SUFFIX,y.qq.com,${BIZ.CNMEDIA}`,
    `DOMAIN-SUFFIX,music.qq.com,${BIZ.CNMEDIA}`,
    `DOMAIN-SUFFIX,kugou.com,${BIZ.CNMEDIA}`,
    `DOMAIN-SUFFIX,kuwo.cn,${BIZ.CNMEDIA}`,
    `DOMAIN-SUFFIX,xiaohongshu.com,${BIZ.CNMEDIA}`,
    `DOMAIN-SUFFIX,xhscdn.com,${BIZ.CNMEDIA}`,
    `DOMAIN-SUFFIX,kuaishou.com,${BIZ.CNMEDIA}`,
    `DOMAIN-SUFFIX,gifshow.com,${BIZ.CNMEDIA}`,
    `DOMAIN-SUFFIX,weibo.com,${BIZ.CNMEDIA}`,
    `DOMAIN-SUFFIX,weibo.cn,${BIZ.CNMEDIA}`,
    `DOMAIN-SUFFIX,sinaimg.cn,${BIZ.CNMEDIA}`,
    `RULE-SET,iqiyi,${BIZ.CNMEDIA}`,
    `RULE-SET,youku,${BIZ.CNMEDIA}`,
    `RULE-SET,tencentvideo,${BIZ.CNMEDIA}`,
    `RULE-SET,douyin,${BIZ.CNMEDIA}`,
    `RULE-SET,bytedance,${BIZ.CNMEDIA}`,
    `RULE-SET,kuaishou,${BIZ.CNMEDIA}`,
    `RULE-SET,weibo,${BIZ.CNMEDIA}`,
    `RULE-SET,xiaohongshu,${BIZ.CNMEDIA}`,
    `RULE-SET,neteasemusic,${BIZ.CNMEDIA}`,
    `RULE-SET,kugoukuwo,${BIZ.CNMEDIA}`,
    `RULE-SET,sohu,${BIZ.CNMEDIA}`,
    `RULE-SET,acfun,${BIZ.CNMEDIA}`,
    `RULE-SET,douyu,${BIZ.CNMEDIA}`,
    `RULE-SET,huya,${BIZ.CNMEDIA}`,
    `RULE-SET,himalaya,${BIZ.CNMEDIA}`,
    `RULE-SET,cctv,${BIZ.CNMEDIA}`,
    `RULE-SET,hunantv,${BIZ.CNMEDIA}`,
    `RULE-SET,pptv,${BIZ.CNMEDIA}`,
    `RULE-SET,funshion,${BIZ.CNMEDIA}`,
    `RULE-SET,letv,${BIZ.CNMEDIA}`,
    `RULE-SET,taihemusic,${BIZ.CNMEDIA}`,
    `RULE-SET,kukemusic,${BIZ.CNMEDIA}`,
    `RULE-SET,hibymusic,${BIZ.CNMEDIA}`,
    `RULE-SET,miwu,${BIZ.CNMEDIA}`,
    `RULE-SET,migu,${BIZ.CNMEDIA}`,
    `RULE-SET,iptvmainland,${BIZ.CNMEDIA}`,
    `RULE-SET,iptvother,${BIZ.CNMEDIA}`,
    `RULE-SET,cibn,${BIZ.CNMEDIA}`,
    `RULE-SET,bestv,${BIZ.CNMEDIA}`,
    `RULE-SET,huashutv,${BIZ.CNMEDIA}`,
    `RULE-SET,smg,${BIZ.CNMEDIA}`,
    `RULE-SET,hwtv,${BIZ.CNMEDIA}`,
    `RULE-SET,nivodtv,${BIZ.CNMEDIA}`,
    `RULE-SET,olevod,${BIZ.CNMEDIA}`,
    `RULE-SET,dandanzan,${BIZ.CNMEDIA}`,
    `RULE-SET,dandanplay,${BIZ.CNMEDIA}`,
    `RULE-SET,tiantiankankan,${BIZ.CNMEDIA}`,
    `RULE-SET,yizhibo,${BIZ.CNMEDIA}`,
    `RULE-SET,ku6,${BIZ.CNMEDIA}`,
    `RULE-SET,56,${BIZ.CNMEDIA}`,
    `RULE-SET,cetv,${BIZ.CNMEDIA}`,
    `RULE-SET,yyets,${BIZ.CNMEDIA}`,
    // v5.1: Accademia 鍥藉唴浜戠洏/濯掍綋琛ュ厖
    `RULE-SET,acc-alipan,${BIZ.CNMEDIA}`,
    `RULE-SET,acc-baidunetdisk,${BIZ.CNMEDIA}`,
    `RULE-SET,acc-weiyun,${BIZ.CNMEDIA}`,
    // v5.1.3 FIX#8: acc-kwai锛圞wai鍥介檯鐗堬級浠?CNMEDIA 绉诲埌 STREAM_SEA锛堟捣澶朅PP闇€浠ｇ悊锛?
    // RULE-SET,acc-kwai 宸茬Щ鑷充笢鍗椾簹娴佸獟浣撳尯鍧?
    // v5.1.1: Accademia FakeLocation 脳 10 骞冲彴锛堝浗鍐匒PP IP褰掑睘鍦颁吉瑁咃級
    ...['bilibili','douyin','kuaishou','xiaohongshu','xigua',
        'weibo','zhihu','tieba','douban','xianyu'].map(app => `RULE-SET,acc-fl-${app},${BIZ.CNMEDIA}`),
    // v5.1.2 FIX#2: 娓境鍙板摂鍝╁摂鍝╅渶娓尯浠ｇ悊瑙ｉ攣锛坴5.1.1 璇綊鍏?CNMEDIA/DIRECT 瀵艰嚧 412锛?
    `RULE-SET,szkane-bilihmt,${BIZ.STREAM_HK}`,
    `RULE-SET,viu,${BIZ.STREAM_OTHER}`,
    `DOMAIN-SUFFIX,wetv.vip,${BIZ.STREAM_OTHER}`,
    `DOMAIN-SUFFIX,wetvinfo.com,${BIZ.STREAM_OTHER}`,
    `DOMAIN-SUFFIX,iq.com,${BIZ.STREAM_OTHER}`,
    `DOMAIN-SUFFIX,vidio.com,${BIZ.STREAM_OTHER}`,
    `DOMAIN-SUFFIX,vidio.static6.com,${BIZ.STREAM_OTHER}`,
    `DOMAIN-SUFFIX,rctiplus.com,${BIZ.STREAM_OTHER}`,
    `DOMAIN-SUFFIX,visionplus.id,${BIZ.STREAM_OTHER}`,
    `DOMAIN-SUFFIX,genflix.co.id,${BIZ.STREAM_OTHER}`,
    `DOMAIN-SUFFIX,goplay.co.id,${BIZ.STREAM_OTHER}`,
    `DOMAIN-SUFFIX,maxstream.tv,${BIZ.STREAM_OTHER}`,
    `RULE-SET,biliintl,${BIZ.STREAM_OTHER}`,
    `DOMAIN-SUFFIX,viki.com,${BIZ.STREAM_OTHER}`,
    `DOMAIN-SUFFIX,viki.io,${BIZ.STREAM_OTHER}`,
    `DOMAIN-SUFFIX,iflix.com,${BIZ.STREAM_OTHER}`,
    `DOMAIN-SUFFIX,catchplay.com,${BIZ.STREAM_OTHER}`,
    `DOMAIN-SUFFIX,mewatch.sg,${BIZ.STREAM_OTHER}`,
    `DOMAIN-SUFFIX,trueid.net,${BIZ.STREAM_OTHER}`,
    `DOMAIN-SUFFIX,dimsum.my,${BIZ.STREAM_OTHER}`,
    `RULE-SET,asianmedia,${BIZ.STREAM_OTHER}`,
    `RULE-SET,iqiyiintl,${BIZ.STREAM_OTHER}`,
    `RULE-SET,joox,${BIZ.STREAM_OTHER}`,
    `RULE-SET,mewatch,${BIZ.STREAM_OTHER}`,
    `RULE-SET,viki,${BIZ.STREAM_OTHER}`,
    `RULE-SET,wetv,${BIZ.STREAM_OTHER}`,
    `RULE-SET,zee,${BIZ.STREAM_OTHER}`,
    // v5.1.3 FIX#8: acc-kwai锛圞wai鍥介檯鐗堬級绉诲叆涓滃崡浜氭祦濯掍綋锛堝反瑗?鍗板凹涓绘垬鍦洪渶浠ｇ悊锛?
    `RULE-SET,acc-kwai,${BIZ.STREAM_OTHER}`,
    `RULE-SET,youtube,${BIZ.YT}`,
    `RULE-SET,netflix,${BIZ.NFLX}`,
    `RULE-SET,netflix-ip,${BIZ.NFLX},no-resolve`,
    `RULE-SET,spotify,${BIZ.MUSIC}`,
    `RULE-SET,disney,${BIZ.DSNP}`,
    `RULE-SET,hbo,${BIZ.HBO}`,
    `RULE-SET,primevideo,${BIZ.PRIME}`,
    `RULE-SET,hulu,${BIZ.HULU}`,
    `RULE-SET,paramount,${BIZ.STREAM_OTHER}`,
    `RULE-SET,peacock,${BIZ.STREAM_OTHER}`,
    `RULE-SET,twitch,${BIZ.STREAM_OTHER}`,
    `DOMAIN-SUFFIX,amazonaws.com,${BIZ.INTL_SITE}`,
    `DOMAIN-SUFFIX,awsstatic.com,${BIZ.INTL_SITE}`,
    `DOMAIN-SUFFIX,aws.amazon.com,${BIZ.TOOLS}`,
    `DOMAIN-SUFFIX,elasticbeanstalk.com,${BIZ.TOOLS}`,
    `RULE-SET,amazon,${BIZ.PRIME}`,
    `DOMAIN-SUFFIX,crunchyroll.com,${BIZ.STREAM_OTHER}`,
    `DOMAIN-SUFFIX,vrv.co,${BIZ.STREAM_OTHER}`,
    `DOMAIN-SUFFIX,soundcloud.com,${BIZ.MUSIC}`,
    `DOMAIN-SUFFIX,sndcdn.com,${BIZ.MUSIC}`,
    `DOMAIN-SUFFIX,pandora.com,${BIZ.MUSIC}`,
    `DOMAIN-SUFFIX,pluto.tv,${BIZ.STREAM_OTHER}`,
    `DOMAIN-SUFFIX,tubi.tv,${BIZ.STREAM_OTHER}`,
    `DOMAIN-SUFFIX,fubo.tv,${BIZ.STREAM_OTHER}`,
    `DOMAIN-SUFFIX,discoveryplus.com,${BIZ.STREAM_OTHER}`,
    `DOMAIN-SUFFIX,max.com,${BIZ.HBO}`,
    `DOMAIN-SUFFIX,appletv.com,${BIZ.STREAM_OTHER}`,
    `DOMAIN-SUFFIX,deezer.com,${BIZ.MUSIC}`,
    `DOMAIN-SUFFIX,tidal.com,${BIZ.MUSIC}`,
    `DOMAIN-SUFFIX,vimeo.com,${BIZ.STREAM_OTHER}`,
    `DOMAIN-SUFFIX,dailymotion.com,${BIZ.STREAM_OTHER}`,
    `RULE-SET,cbs,${BIZ.STREAM_OTHER}`,
    `RULE-SET,nbc,${BIZ.STREAM_OTHER}`,
    `RULE-SET,pbs,${BIZ.STREAM_OTHER}`,
    `RULE-SET,attwatchtv,${BIZ.STREAM_OTHER}`,
    `RULE-SET,fox,${BIZ.STREAM_OTHER}`,
    `RULE-SET,fubotv,${BIZ.STREAM_OTHER}`,
    `RULE-SET,sling,${BIZ.STREAM_OTHER}`,
    `RULE-SET,soundcloud,${BIZ.MUSIC}`,
    `RULE-SET,pandora,${BIZ.MUSIC}`,
    `RULE-SET,pandoratv,${BIZ.MUSIC}`,
    `RULE-SET,tidal,${BIZ.MUSIC}`,
    `RULE-SET,vimeo,${BIZ.STREAM_OTHER}`,
    `RULE-SET,dailymotion,${BIZ.STREAM_OTHER}`,
    `RULE-SET,deezer,${BIZ.MUSIC}`,
    `RULE-SET,discoveryplus,${BIZ.STREAM_OTHER}`,
    `RULE-SET,overcast,${BIZ.MUSIC}`,
    `RULE-SET,americasvoice,${BIZ.STREAM_OTHER}`,
    `RULE-SET,cake,${BIZ.STREAM_OTHER}`,
    `RULE-SET,dood,${BIZ.STREAM_OTHER}`,
    // v5.1.3 FIX#9: ehgallery 浠?STREAM_US 绉诲埌 INTL_SITE锛堥潪娴佸獟浣擄紝鍏ㄧ悆鑺傜偣鏇寸伒娲伙級
    // RULE-SET,ehgallery 宸茬Щ鑷冲浗澶栫綉绔欏尯鍧?
    `RULE-SET,lastfm,${BIZ.MUSIC}`,
    `RULE-SET,emby,${BIZ.STREAM_OTHER}`,
    // v5.1: szkane Netflix IP 娈佃ˉ鍏?
    `RULE-SET,szkane-netflixip,${BIZ.NFLX},no-resolve`,
    `DOMAIN-SUFFIX,mytvsuper.com,${BIZ.STREAM_HK}`,
    `DOMAIN-SUFFIX,mytv.com.hk,${BIZ.STREAM_HK}`,
    `DOMAIN-SUFFIX,viu.com,${BIZ.STREAM_HK}`,
    `DOMAIN-SUFFIX,viu.tv,${BIZ.STREAM_HK}`,
    `DOMAIN-SUFFIX,hktv.com.hk,${BIZ.STREAM_HK}`,
    `DOMAIN-SUFFIX,hktvmall.com,${BIZ.STREAM_HK}`,
    `DOMAIN-SUFFIX,nowtv.com,${BIZ.STREAM_HK}`,
    `DOMAIN-SUFFIX,nowe.com,${BIZ.STREAM_HK}`,
    `DOMAIN-SUFFIX,rthk.hk,${BIZ.STREAM_HK}`,
    `DOMAIN-SUFFIX,icable.com,${BIZ.STREAM_HK}`,
    `DOMAIN-SUFFIX,cabletv.com.hk,${BIZ.STREAM_HK}`,
    `DOMAIN-SUFFIX,hmvod.com.hk,${BIZ.STREAM_HK}`,
    `RULE-SET,mytvsuper,${BIZ.STREAM_HK}`,
    `RULE-SET,tvb,${BIZ.STREAM_HK}`,
    `RULE-SET,encoretvb,${BIZ.STREAM_HK}`,
    `RULE-SET,nowe,${BIZ.STREAM_HK}`,
    `RULE-SET,rthk,${BIZ.STREAM_HK}`,
    `RULE-SET,cabletv,${BIZ.STREAM_HK}`,
    `RULE-SET,moov,${BIZ.STREAM_HK}`,
    `RULE-SET,bahamut,${BIZ.STREAM_TW}`,
    `RULE-SET,kktv,${BIZ.STREAM_TW}`,
    `DOMAIN-SUFFIX,litv.tv,${BIZ.STREAM_TW}`,
    `DOMAIN-SUFFIX,video.friday.tw,${BIZ.STREAM_TW}`,
    `DOMAIN-SUFFIX,friday.tw,${BIZ.STREAM_TW}`,
    `DOMAIN-SUFFIX,linetv.tw,${BIZ.STREAM_TW}`,
    `DOMAIN-SUFFIX,elta.tv,${BIZ.STREAM_TW}`,
    `DOMAIN-SUFFIX,mod.cht.com.tw,${BIZ.STREAM_TW}`,
    `DOMAIN-SUFFIX,hamivideo.hinet.net,${BIZ.STREAM_TW}`,
    `DOMAIN-SUFFIX,ofiii.com,${BIZ.STREAM_TW}`,
    `DOMAIN-SUFFIX,pts.org.tw,${BIZ.STREAM_TW}`,
    `DOMAIN-SUFFIX,4gtv.tv,${BIZ.STREAM_TW}`,
    `RULE-SET,litv,${BIZ.STREAM_TW}`,
    `RULE-SET,friday,${BIZ.STREAM_TW}`,
    `RULE-SET,hamivideo,${BIZ.STREAM_TW}`,
    `RULE-SET,linetv,${BIZ.STREAM_TW}`,
    `RULE-SET,vidoltv,${BIZ.STREAM_TW}`,
    `RULE-SET,taiwangood,${BIZ.STREAM_TW}`,
    `RULE-SET,cht,${BIZ.STREAM_TW}`,
    `RULE-SET,abema,${BIZ.STREAM_JP}`,
    `RULE-SET,dazn,${BIZ.STREAM_JP}`,
    `DOMAIN-SUFFIX,tver.jp,${BIZ.STREAM_JP}`,
    `DOMAIN-SUFFIX,unext.jp,${BIZ.STREAM_JP}`,
    `DOMAIN-SUFFIX,video.unext.jp,${BIZ.STREAM_JP}`,
    `DOMAIN-SUFFIX,nhk.jp,${BIZ.STREAM_JP}`,
    `DOMAIN-SUFFIX,nhk.or.jp,${BIZ.STREAM_JP}`,
    `DOMAIN-SUFFIX,dmm.com,${BIZ.STREAM_JP}`,
    `DOMAIN-SUFFIX,dmm.co.jp,${BIZ.STREAM_JP}`,
    `DOMAIN-SUFFIX,dtv.jp,${BIZ.STREAM_JP}`,
    `DOMAIN-SUFFIX,paravi.jp,${BIZ.STREAM_JP}`,
    `DOMAIN-SUFFIX,videomarket.jp,${BIZ.STREAM_JP}`,
    `DOMAIN-SUFFIX,fod.fujitv.co.jp,${BIZ.STREAM_JP}`,
    `DOMAIN-SUFFIX,hulu.jp,${BIZ.HULU}`,
    `DOMAIN-SUFFIX,happyon.jp,${BIZ.HULU}`,
    `DOMAIN-SUFFIX,gyao.yahoo.co.jp,${BIZ.STREAM_JP}`,
    `DOMAIN-SUFFIX,music.jp,${BIZ.STREAM_JP}`,
    `DOMAIN-SUFFIX,nicovideo.jp,${BIZ.STREAM_JP}`,
    `DOMAIN-SUFFIX,nicovideo.me,${BIZ.STREAM_JP}`,
    `DOMAIN-SUFFIX,dmc.nico,${BIZ.STREAM_JP}`,
    `DOMAIN-SUFFIX,radiko.jp,${BIZ.STREAM_JP}`,
    `DOMAIN-SUFFIX,lemino.docomo.ne.jp,${BIZ.STREAM_JP}`,
    `DOMAIN-SUFFIX,wowow.co.jp,${BIZ.STREAM_JP}`,
    `DOMAIN-SUFFIX,wavve.com,${BIZ.STREAM_JP}`,
    `DOMAIN-SUFFIX,tving.com,${BIZ.STREAM_JP}`,
    `DOMAIN-SUFFIX,watcha.com,${BIZ.STREAM_JP}`,
    `DOMAIN-SUFFIX,coupangplay.com,${BIZ.STREAM_JP}`,
    `DOMAIN-SUFFIX,sbs.co.kr,${BIZ.STREAM_JP}`,
    `DOMAIN-SUFFIX,kbs.co.kr,${BIZ.STREAM_JP}`,
    `DOMAIN-SUFFIX,mbc.co.kr,${BIZ.STREAM_JP}`,
    `DOMAIN-SUFFIX,jtbc.co.kr,${BIZ.STREAM_JP}`,
    `DOMAIN-SUFFIX,tvn.cjenm.com,${BIZ.STREAM_JP}`,
    `DOMAIN-SUFFIX,afreecatv.com,${BIZ.STREAM_JP}`,
    `DOMAIN-SUFFIX,tv.naver.com,${BIZ.STREAM_JP}`,
    `DOMAIN-SUFFIX,now.naver.com,${BIZ.STREAM_JP}`,
    `DOMAIN-SUFFIX,vod.naver.com,${BIZ.STREAM_JP}`,
    `DOMAIN-SUFFIX,navertv.naver.com,${BIZ.STREAM_JP}`,
    `DOMAIN-SUFFIX,kakaotv.daum.net,${BIZ.STREAM_JP}`,
    `DOMAIN-SUFFIX,navercorp.com,${BIZ.STREAM_JP}`,
    `RULE-SET,dmm,${BIZ.STREAM_JP}`,
    `RULE-SET,tver,${BIZ.STREAM_JP}`,
    `RULE-SET,niconico,${BIZ.STREAM_JP}`,
    `RULE-SET,rakuten,${BIZ.STREAM_JP}`,
    `RULE-SET,japonx,${BIZ.STREAM_JP}`,
    `RULE-SET,nikkei,${BIZ.STREAM_JP}`,
    `RULE-SET,bbc,${BIZ.STREAM_EU}`,
    `DOMAIN-SUFFIX,itv.com,${BIZ.STREAM_EU}`,
    `DOMAIN-SUFFIX,itvstatic.com,${BIZ.STREAM_EU}`,
    `DOMAIN-SUFFIX,channel4.com,${BIZ.STREAM_EU}`,
    `DOMAIN-SUFFIX,channel5.com,${BIZ.STREAM_EU}`,
    `DOMAIN-SUFFIX,sky.com,${BIZ.STREAM_EU}`,
    `DOMAIN-SUFFIX,nowtv.co.uk,${BIZ.STREAM_EU}`,
    `DOMAIN-SUFFIX,britbox.com,${BIZ.STREAM_EU}`,
    `DOMAIN-SUFFIX,canalplus.com,${BIZ.STREAM_EU}`,
    `DOMAIN-SUFFIX,mycanal.fr,${BIZ.STREAM_EU}`,
    `DOMAIN-SUFFIX,france.tv,${BIZ.STREAM_EU}`,
    `DOMAIN-SUFFIX,tf1.fr,${BIZ.STREAM_EU}`,
    `DOMAIN-SUFFIX,molotov.tv,${BIZ.STREAM_EU}`,
    `DOMAIN-SUFFIX,arte.tv,${BIZ.STREAM_EU}`,
    `DOMAIN-SUFFIX,joyn.de,${BIZ.STREAM_EU}`,
    `DOMAIN-SUFFIX,zdf.de,${BIZ.STREAM_EU}`,
    `DOMAIN-SUFFIX,ard.de,${BIZ.STREAM_EU}`,
    `DOMAIN-SUFFIX,ardmediathek.de,${BIZ.STREAM_EU}`,
    `DOMAIN-SUFFIX,rtlplus.com,${BIZ.STREAM_EU}`,
    `DOMAIN-SUFFIX,raiplay.it,${BIZ.STREAM_EU}`,
    `DOMAIN-SUFFIX,rtve.es,${BIZ.STREAM_EU}`,
    `DOMAIN-SUFFIX,videoland.com,${BIZ.STREAM_EU}`,
    `DOMAIN-SUFFIX,ruutu.fi,${BIZ.STREAM_EU}`,
    `DOMAIN-SUFFIX,tv2.dk,${BIZ.STREAM_EU}`,
    `DOMAIN-SUFFIX,svtplay.se,${BIZ.STREAM_EU}`,
    `DOMAIN-SUFFIX,nrk.no,${BIZ.STREAM_EU}`,
    `DOMAIN-SUFFIX,ivi.ru,${BIZ.STREAM_EU}`,
    `DOMAIN-SUFFIX,kinopoisk.ru,${BIZ.STREAM_EU}`,
    `DOMAIN-SUFFIX,okko.tv,${BIZ.STREAM_EU}`,
    `DOMAIN-SUFFIX,more.tv,${BIZ.STREAM_EU}`,
    `RULE-SET,itv,${BIZ.STREAM_EU}`,
    `RULE-SET,all4,${BIZ.STREAM_EU}`,
    `RULE-SET,my5,${BIZ.STREAM_EU}`,
    `RULE-SET,skygo,${BIZ.STREAM_EU}`,
    `RULE-SET,britboxuk,${BIZ.STREAM_EU}`,
    `RULE-SET,londonreal,${BIZ.STREAM_EU}`,
    `RULE-SET,qobuz,${BIZ.MUSIC}`,
    // v5.1: szkane UK Apps
    `RULE-SET,szkane-uk,${BIZ.STREAM_EU}`,
    `DOMAIN-SUFFIX,mihoyo.com,${BIZ.GAME_CN}`,
    `DOMAIN-SUFFIX,miyoushe.com,${BIZ.GAME_CN}`,
    `DOMAIN-SUFFIX,yuanshen.com,${BIZ.GAME_CN}`,
    `DOMAIN-SUFFIX,bhsr.com,${BIZ.GAME_CN}`,
    `DOMAIN-SUFFIX,zenlesszonezero.com,${BIZ.GAME_CN}`,
    `DOMAIN,game.163.com,${BIZ.GAME_CN}`,
    `DOMAIN-SUFFIX,gm.163.com,${BIZ.GAME_CN}`,
    `DOMAIN-SUFFIX,ds.163.com,${BIZ.GAME_CN}`,
    `DOMAIN-SUFFIX,nie.163.com,${BIZ.GAME_CN}`,
    `DOMAIN-SUFFIX,nie.netease.com,${BIZ.GAME_CN}`,
    `DOMAIN-SUFFIX,update.netease.com,${BIZ.GAME_CN}`,
    `DOMAIN-SUFFIX,netease.com,${BIZ.GAME_CN}`,
    `DOMAIN-SUFFIX,wegame.com,${BIZ.GAME_CN}`,
    `DOMAIN-SUFFIX,wegame.com.cn,${BIZ.GAME_CN}`,
    `DOMAIN-SUFFIX,perfect-world.com,${BIZ.GAME_CN}`,
    `DOMAIN-SUFFIX,wanmei.com,${BIZ.GAME_CN}`,
    `DOMAIN-SUFFIX,xd.com,${BIZ.GAME_CN}`,
    `DOMAIN-SUFFIX,taptap.com,${BIZ.GAME_CN}`,
    `DOMAIN-SUFFIX,taptap.io,${BIZ.GAME_CN}`,
    `DOMAIN-SUFFIX,papegames.com,${BIZ.GAME_CN}`,
    `DOMAIN-SUFFIX,hypergryph.com,${BIZ.GAME_CN}`,
    `DOMAIN-SUFFIX,gryphline.com,${BIZ.GAME_CN}`,
    `DOMAIN-SUFFIX,lilith.com,${BIZ.GAME_CN}`,
    `RULE-SET,steamcn,${BIZ.GAME_CN}`,
    `RULE-SET,wanmeishijie,${BIZ.GAME_CN}`,
    `RULE-SET,wankahuanju,${BIZ.GAME_CN}`,
    `RULE-SET,majsoul,${BIZ.GAME_CN}`,
    `RULE-SET,steam,${BIZ.GAME_INTL}`,
    `RULE-SET,epic,${BIZ.GAME_INTL}`,
    `RULE-SET,playstation,${BIZ.GAME_INTL}`,
    `RULE-SET,nintendo,${BIZ.GAME_INTL}`,
    `RULE-SET,xbox,${BIZ.GAME_INTL}`,
    `RULE-SET,ea,${BIZ.GAME_INTL}`,
    `RULE-SET,blizzard,${BIZ.GAME_INTL}`,
    `GEOSITE,category-games,${BIZ.GAME_INTL}`,
    `DOMAIN-SUFFIX,ubisoft.com,${BIZ.GAME_INTL}`,
    `DOMAIN-SUFFIX,ubi.com,${BIZ.GAME_INTL}`,
    `DOMAIN-SUFFIX,riotgames.com,${BIZ.GAME_INTL}`,
    `DOMAIN-SUFFIX,leagueoflegends.com,${BIZ.GAME_INTL}`,
    `DOMAIN-SUFFIX,valorant.com,${BIZ.GAME_INTL}`,
    `DOMAIN-SUFFIX,rockstargames.com,${BIZ.GAME_INTL}`,
    // v5.2.0 CLEAN#3: socialclub.rockstargames.com 宸茶涓婅 SUFFIX 瑕嗙洊锛宒ead rule 宸叉竻闄?
    `DOMAIN-SUFFIX,gog.com,${BIZ.GAME_INTL}`,
    `DOMAIN-SUFFIX,gogalaxy.com,${BIZ.GAME_INTL}`,
    `DOMAIN-SUFFIX,bethesda.net,${BIZ.GAME_INTL}`,
    `DOMAIN-SUFFIX,supercell.com,${BIZ.GAME_INTL}`,
    `DOMAIN-SUFFIX,garena.com,${BIZ.GAME_INTL}`,
    `DOMAIN-SUFFIX,hoyoverse.com,${BIZ.GAME_INTL}`,
    `DOMAIN-SUFFIX,hoyolab.com,${BIZ.GAME_INTL}`,
    `RULE-SET,rockstar,${BIZ.GAME_INTL}`,
    `RULE-SET,riot,${BIZ.GAME_INTL}`,
    `RULE-SET,gog,${BIZ.GAME_INTL}`,
    `RULE-SET,supercell,${BIZ.GAME_INTL}`,
    `RULE-SET,garena,${BIZ.GAME_INTL}`,
    `RULE-SET,hoyoverse,${BIZ.GAME_INTL}`,
    `RULE-SET,ubi,${BIZ.GAME_INTL}`,
    `RULE-SET,wildrift,${BIZ.GAME_INTL}`,
    `RULE-SET,sony,${BIZ.GAME_INTL}`,
    // v5.1.9 CLEAN#1: googlesearch/googledrive/googleearth/google/google-ip + dl.google.com/play.googleapis.com/android.clients.google.com
    //   宸叉彁鍗囪嚦闃插悶鐩撅紙FIX#14锛夛紝dead rules 宸叉竻闄?
    `RULE-SET,bing,${BIZ.TOOLS}`,
    `DOMAIN-SUFFIX,yahoo.com,${BIZ.TOOLS}`,
    `DOMAIN-SUFFIX,yahoo.co.jp,${BIZ.TOOLS}`,
    `DOMAIN-SUFFIX,duckduckgo.com,${BIZ.TOOLS}`,
    `DOMAIN-SUFFIX,ddg.co,${BIZ.TOOLS}`,
    `DOMAIN-SUFFIX,brave.com,${BIZ.TOOLS}`,
    `DOMAIN-SUFFIX,yandex.com,${BIZ.TOOLS}`,
    `DOMAIN-SUFFIX,yandex.ru,${BIZ.TOOLS}`,
    `DOMAIN-SUFFIX,ecosia.org,${BIZ.TOOLS}`,
    `DOMAIN-SUFFIX,startpage.com,${BIZ.TOOLS}`,
    `DOMAIN-SUFFIX,you.com,${BIZ.TOOLS}`,
    `DOMAIN-SUFFIX,search.naver.com,${BIZ.TOOLS}`,
    // v5.1.2 FIX#3: 琛ュ厖瀛ゅ効 provider 瑙勫垯寮曠敤锛坴5.1.1 瀹氫箟浜?provider 浣嗘湭娉ㄥ叆 RULE-SET锛?
    // v5.1.9 CLEAN#1: googledrive/googleearth 宸叉彁鍗囪嚦闃插悶鐩撅紝姝ゅ浠呬繚鐣?scholar/yandex
    `RULE-SET,scholar,${BIZ.TOOLS}`,
    `RULE-SET,yandex,${BIZ.TOOLS}`,
    `RULE-SET,github,${BIZ.TOOLS}`,
    `RULE-SET,onedrive,${BIZ.MS}`,
    `RULE-SET,microsoft,${BIZ.MS}`,
    `RULE-SET,microsoftedge,${BIZ.MS}`,
    // v5.1: Accademia 寰蒋APP琛ュ厖
    `RULE-SET,acc-microsoftapps,${BIZ.MS}`,
    `RULE-SET,applemusic,${BIZ.APPLE}`,
    `RULE-SET,icloud,${BIZ.APPLE}`,
    `RULE-SET,apple,${BIZ.APPLE}`,
    `RULE-SET,appstore,${BIZ.APPLE}`,
    `RULE-SET,appletv,${BIZ.APPLE}`,
    `RULE-SET,applenews,${BIZ.APPLE}`,
    `RULE-SET,appledev,${BIZ.APPLE}`,
    `RULE-SET,appleproxy,${BIZ.APPLE}`,
    `RULE-SET,siri,${BIZ.APPLE}`,
    `RULE-SET,testflight,${BIZ.APPLE}`,
    `RULE-SET,applefirmware,${BIZ.APPLE}`,
    `RULE-SET,findmy,${BIZ.APPLE}`,
    // v5.1: Accademia 鑻规灉琛ュ厖锛圓ppleAI涓嶢ppleNews浜ゅ弶瑙勫垯锛屽缓璁悓鑺傜偣锛?
    `RULE-SET,acc-applenews,${BIZ.APPLE}`,
    `RULE-SET,acc-apple,${BIZ.APPLE}`,
    `RULE-SET,docker,${BIZ.TOOLS}`,
    `RULE-SET,gitlab,${BIZ.TOOLS}`,
    `GEOSITE,category-dev,${BIZ.TOOLS}`,
    `DOMAIN-SUFFIX,npmjs.com,${BIZ.TOOLS}`,
    `DOMAIN-SUFFIX,npmjs.org,${BIZ.TOOLS}`,
    `DOMAIN-SUFFIX,yarnpkg.com,${BIZ.TOOLS}`,
    `DOMAIN-SUFFIX,pypi.org,${BIZ.TOOLS}`,
    `DOMAIN-SUFFIX,pythonhosted.org,${BIZ.TOOLS}`,
    `DOMAIN-SUFFIX,crates.io,${BIZ.TOOLS}`,
    `DOMAIN-SUFFIX,rubygems.org,${BIZ.TOOLS}`,
    `DOMAIN-SUFFIX,packagist.org,${BIZ.TOOLS}`,
    `DOMAIN-SUFFIX,maven.org,${BIZ.TOOLS}`,
    `DOMAIN-SUFFIX,nuget.org,${BIZ.TOOLS}`,
    `DOMAIN-SUFFIX,cocoapods.org,${BIZ.TOOLS}`,
    `DOMAIN-SUFFIX,stackoverflow.com,${BIZ.TOOLS}`,
    `DOMAIN-SUFFIX,stackexchange.com,${BIZ.TOOLS}`,
    `DOMAIN-SUFFIX,sstatic.net,${BIZ.TOOLS}`,
    `DOMAIN-SUFFIX,vercel.com,${BIZ.TOOLS}`,
    `DOMAIN-SUFFIX,vercel.app,${BIZ.TOOLS}`,
    `DOMAIN-SUFFIX,netlify.app,${BIZ.TOOLS}`,
    `DOMAIN-SUFFIX,netlify.com,${BIZ.TOOLS}`,
    `DOMAIN-SUFFIX,pages.dev,${BIZ.TOOLS}`,
    `DOMAIN-SUFFIX,workers.dev,${BIZ.TOOLS}`,
    // v5.2.0 FIX#16: cloudflare.com 鏀剁獎涓哄紑鍙戣€呭叆鍙ｇ簿纭尮閰?
    // 鍘?DOMAIN-SUFFIX 浼氬悶鎺?cdnjs.cloudflare.com 绛?CDN 瀛愬煙鍚嶏紝瀵艰嚧鏃犳硶鍛戒腑鍚庣画 RULE-SET,cloudflare 鈫?CLOUD_CDN
    `DOMAIN,dash.cloudflare.com,${BIZ.TOOLS}`,
    `DOMAIN,api.cloudflare.com,${BIZ.TOOLS}`,
    `DOMAIN,developers.cloudflare.com,${BIZ.TOOLS}`,
    `DOMAIN,www.cloudflare.com,${BIZ.TOOLS}`,
    `DOMAIN-SUFFIX,heroku.com,${BIZ.TOOLS}`,
    `DOMAIN-SUFFIX,herokuapp.com,${BIZ.TOOLS}`,
    `DOMAIN-SUFFIX,fly.io,${BIZ.TOOLS}`,
    `DOMAIN-SUFFIX,railway.app,${BIZ.TOOLS}`,
    `DOMAIN-SUFFIX,render.com,${BIZ.TOOLS}`,
    `DOMAIN-SUFFIX,supabase.com,${BIZ.TOOLS}`,
    `DOMAIN-SUFFIX,supabase.co,${BIZ.TOOLS}`,
    `DOMAIN-SUFFIX,planetscale.com,${BIZ.TOOLS}`,
    `DOMAIN-SUFFIX,neon.tech,${BIZ.TOOLS}`,
    `DOMAIN-SUFFIX,digitalocean.com,${BIZ.TOOLS}`,
    `DOMAIN-SUFFIX,vultr.com,${BIZ.TOOLS}`,
    `DOMAIN-SUFFIX,linode.com,${BIZ.TOOLS}`,
    `DOMAIN-SUFFIX,sentry.io,${BIZ.TOOLS}`,
    `DOMAIN-SUFFIX,datadog.com,${BIZ.TOOLS}`,
    `DOMAIN-SUFFIX,grafana.com,${BIZ.TOOLS}`,
    `DOMAIN-SUFFIX,postman.com,${BIZ.TOOLS}`,
    `DOMAIN-SUFFIX,jetbrains.com,${BIZ.TOOLS}`,
    `DOMAIN-SUFFIX,hashicorp.com,${BIZ.TOOLS}`,
    `DOMAIN-SUFFIX,terraform.io,${BIZ.TOOLS}`,
    `DOMAIN-SUFFIX,vagrantup.com,${BIZ.TOOLS}`,
    `RULE-SET,developer,${BIZ.TOOLS}`,
    `RULE-SET,python,${BIZ.TOOLS}`,
    `RULE-SET,gitbook,${BIZ.TOOLS}`,
    `RULE-SET,jfrog,${BIZ.TOOLS}`,
    `RULE-SET,sublimetext,${BIZ.TOOLS}`,
    `RULE-SET,wordpress,${BIZ.TOOLS}`,
    `RULE-SET,wix,${BIZ.TOOLS}`,
    `RULE-SET,cisco,${BIZ.TOOLS}`,
    `RULE-SET,ibm,${BIZ.TOOLS}`,
    `RULE-SET,oracle,${BIZ.TOOLS}`,
    `RULE-SET,unity,${BIZ.TOOLS}`,
    // v5.1: szkane Developer锛圖ocker闀滃儚/妯″瀷鏂囦欢涓嬭浇锛?
    `RULE-SET,szkane-developer,${BIZ.TOOLS}`,
    `RULE-SET,systemota,${BIZ.DOWNLOAD}`,
    `DOMAIN-SUFFIX,windowsupdate.com,${BIZ.DOWNLOAD}`,
    `DOMAIN-SUFFIX,update.microsoft.com,${BIZ.DOWNLOAD}`,
    `DOMAIN-SUFFIX,download.microsoft.com,${BIZ.DOWNLOAD}`,
    `DOMAIN-SUFFIX,delivery.mp.microsoft.com,${BIZ.DOWNLOAD}`,
    `DOMAIN-SUFFIX,dl.delivery.mp.microsoft.com,${BIZ.DOWNLOAD}`,
    `DOMAIN-SUFFIX,officecdn.microsoft.com,${BIZ.DOWNLOAD}`,
    `DOMAIN-SUFFIX,officecdn.microsoft.com.edgesuite.net,${BIZ.DOWNLOAD}`,
    `DOMAIN-SUFFIX,download.mozilla.org,${BIZ.DOWNLOAD}`,
    `DOMAIN-SUFFIX,archive.mozilla.org,${BIZ.DOWNLOAD}`,
    `DOMAIN-SUFFIX,releases.ubuntu.com,${BIZ.DOWNLOAD}`,
    `DOMAIN-SUFFIX,archive.ubuntu.com,${BIZ.DOWNLOAD}`,
    `DOMAIN-SUFFIX,security.ubuntu.com,${BIZ.DOWNLOAD}`,
    `DOMAIN-SUFFIX,mirrors.kernel.org,${BIZ.DOWNLOAD}`,
    `DOMAIN-SUFFIX,dl.fedoraproject.org,${BIZ.DOWNLOAD}`,
    `DOMAIN-SUFFIX,repo.anaconda.com,${BIZ.DOWNLOAD}`,
    `DOMAIN-SUFFIX,conda.anaconda.org,${BIZ.DOWNLOAD}`,
    `DOMAIN-SUFFIX,repo.continuum.io,${BIZ.DOWNLOAD}`,
    `DOMAIN-SUFFIX,sourceforge.net,${BIZ.DOWNLOAD}`,
    `DOMAIN-SUFFIX,fosshub.com,${BIZ.DOWNLOAD}`,
    `DOMAIN-SUFFIX,filehippo.com,${BIZ.DOWNLOAD}`,
    `DOMAIN-SUFFIX,softonic.com,${BIZ.DOWNLOAD}`,
    `DOMAIN-SUFFIX,gcr.io,${BIZ.DOWNLOAD}`,
    `DOMAIN-SUFFIX,ghcr.io,${BIZ.DOWNLOAD}`,
    `DOMAIN-SUFFIX,quay.io,${BIZ.DOWNLOAD}`,
    `DOMAIN-SUFFIX,registry.k8s.io,${BIZ.DOWNLOAD}`,
    `RULE-SET,download,${BIZ.DOWNLOAD}`,
    `RULE-SET,ubuntu,${BIZ.DOWNLOAD}`,
    `RULE-SET,mozilla,${BIZ.DOWNLOAD}`,
    `RULE-SET,apkpure,${BIZ.DOWNLOAD}`,
    `RULE-SET,android,${BIZ.DOWNLOAD}`,
    // v5.1.9 CLEAN#1: googlefcm 宸叉彁鍗囪嚦闃插悶鐩撅紙FIX#14锛夛紝dead rule 宸叉竻闄?
    `RULE-SET,intel,${BIZ.DOWNLOAD}`,
    `RULE-SET,nvidia,${BIZ.DOWNLOAD}`,
    `RULE-SET,dell,${BIZ.DOWNLOAD}`,
    `RULE-SET,hp,${BIZ.DOWNLOAD}`,
    `RULE-SET,canon,${BIZ.DOWNLOAD}`,
    `RULE-SET,lg,${BIZ.DOWNLOAD}`,
    // v5.1: Accademia MacApp鍗囩骇瑙勫垯锛圚omebrew/Sparkle婧愶級
    `RULE-SET,acc-macappupgrade,${BIZ.DOWNLOAD}`,
    `RULE-SET,cloudflare-ip,${BIZ.INTL_SITE},no-resolve`,
    `RULE-SET,cloudfront-ip,${BIZ.INTL_SITE},no-resolve`,
    `RULE-SET,fastly-ip,${BIZ.INTL_SITE},no-resolve`,
    `DOMAIN-SUFFIX,akamai.net,${BIZ.INTL_SITE}`,
    `DOMAIN-SUFFIX,akamaized.net,${BIZ.INTL_SITE}`,
    `DOMAIN-SUFFIX,akamaihd.net,${BIZ.INTL_SITE}`,
    `DOMAIN-SUFFIX,akamaiedge.net,${BIZ.INTL_SITE}`,
    `DOMAIN-SUFFIX,akamaitechnologies.com,${BIZ.INTL_SITE}`,
    `DOMAIN-SUFFIX,edgekey.net,${BIZ.INTL_SITE}`,
    `DOMAIN-SUFFIX,edgesuite.net,${BIZ.INTL_SITE}`,
    `DOMAIN-SUFFIX,cloudfront.net,${BIZ.INTL_SITE}`,
    `DOMAIN-SUFFIX,fastly.net,${BIZ.INTL_SITE}`,
    `DOMAIN-SUFFIX,fastlylb.net,${BIZ.INTL_SITE}`,
    `DOMAIN-SUFFIX,kxcdn.com,${BIZ.INTL_SITE}`,
    `DOMAIN-SUFFIX,stackpathdns.com,${BIZ.INTL_SITE}`,
    `DOMAIN-SUFFIX,stackpathcdn.com,${BIZ.INTL_SITE}`,
    `DOMAIN-SUFFIX,b-cdn.net,${BIZ.INTL_SITE}`,
    `DOMAIN-SUFFIX,bunny.net,${BIZ.INTL_SITE}`,
    `DOMAIN-SUFFIX,bunnycdn.com,${BIZ.INTL_SITE}`,
    `DOMAIN-SUFFIX,cdn77.org,${BIZ.INTL_SITE}`,
    `DOMAIN-SUFFIX,azureedge.net,${BIZ.INTL_SITE}`,
    `DOMAIN-SUFFIX,azurefd.net,${BIZ.INTL_SITE}`,
    `DOMAIN-SUFFIX,msecnd.net,${BIZ.INTL_SITE}`,
    // v5.2.1 FIX: jsdelivr 璧板彈闄愮綉绔欑粍锛堜腑鍥界敤浠ｇ悊锛屾捣澶栧彲璁剧洿杩烇級锛岄伩鍏?rule-provider 鍒锋柊鏃?DNS 寰幆渚濊禆
    `DOMAIN-SUFFIX,jsdelivr.net,${BIZ.GFW}`,
    `DOMAIN-SUFFIX,unpkg.com,${BIZ.INTL_SITE}`,
    // v5.2.10 FIX#39: 鍚?dns.google 鏀瑰埌 GFW 缁勶紙cloudflare-dns.com 鍦ㄥ鍐呰灏侊級
    `DOMAIN-SUFFIX,cloudflare-dns.com,${BIZ.GFW}`,
    `DOMAIN-SUFFIX,cloudflarestorage.com,${BIZ.INTL_SITE}`,
    `DOMAIN-SUFFIX,r2.dev,${BIZ.INTL_SITE}`,
    `DOMAIN-SUFFIX,ziffstatic.com,${BIZ.INTL_SITE}`,
    `DOMAIN-SUFFIX,ucoz.ru,${BIZ.INTL_SITE}`,
    `DOMAIN-SUFFIX,ucoz.net,${BIZ.INTL_SITE}`,
    `RULE-SET,cloudflare,${BIZ.INTL_SITE}`,
    `RULE-SET,akamai,${BIZ.INTL_SITE}`,
    // v5.1.2 FIX#6: RULE-SET,dns 宸插垹闄わ紙DNS鑷劧鍒嗘祦锛屼笉閿佹浠ｇ悊缁勶級
    `RULE-SET,digicert,${BIZ.INTL_SITE}`,
    `RULE-SET,globalsign,${BIZ.INTL_SITE}`,
    `RULE-SET,sectigo,${BIZ.INTL_SITE}`,
    `RULE-SET,brightcove,${BIZ.INTL_SITE}`,
    `RULE-SET,jwplayer,${BIZ.INTL_SITE}`,
    // v5.1: Accademia CDN 琛ュ厖
    `RULE-SET,acc-fastly,${BIZ.INTL_SITE}`,
    // v5.1.2 FIX#6: RULE-SET,acc-globaldns 宸插垹闄わ紙DNS鑷劧鍒嗘祦锛?
    `DOMAIN-SUFFIX,letsencrypt.org,${BIZ.INTL_SITE}`,
    `DOMAIN-SUFFIX,lencr.org,${BIZ.INTL_SITE}`,
    `GEOSITE,tracker,${BIZ.TRACKER}`,
    `DOMAIN-SUFFIX,tracker.opentrackr.org,${BIZ.TRACKER}`,
    `DOMAIN-SUFFIX,open.stealth.si,${BIZ.TRACKER}`,
    `DOMAIN-SUFFIX,tracker.torrent.eu.org,${BIZ.TRACKER}`,
    `DOMAIN-SUFFIX,exodus.desync.com,${BIZ.TRACKER}`,
    `DOMAIN-SUFFIX,tracker.openbittorrent.com,${BIZ.TRACKER}`,
    `DOMAIN-SUFFIX,tracker.publicbt.com,${BIZ.TRACKER}`,
    `DOMAIN-SUFFIX,tracker.dler.org,${BIZ.TRACKER}`,
    `RULE-SET,privatetracker,${BIZ.TRACKER}`,
    // v5.1: Accademia eMule鏈嶅姟鍣?
    `RULE-SET,acc-emuleserver,${BIZ.TRACKER}`,
    // 鈺愨晲鈺?v5.1.5: 鍘熴€屽嵃灏兼湰鍦般€嶈鍒欓噸鍒嗛厤 鈫?閾惰/璇佸埜褰掑叆閲戣瀺鏀粯 鈺愨晲鈺?
    `DOMAIN-SUFFIX,bca.co.id,${BIZ.PAYMENTS}`,
    `DOMAIN-SUFFIX,klikbca.com,${BIZ.PAYMENTS}`,
    `DOMAIN-SUFFIX,bni.co.id,${BIZ.PAYMENTS}`,
    `DOMAIN-SUFFIX,bri.co.id,${BIZ.PAYMENTS}`,
    `DOMAIN-SUFFIX,bankmandiri.co.id,${BIZ.PAYMENTS}`,
    `DOMAIN-SUFFIX,danamon.co.id,${BIZ.PAYMENTS}`,
    `DOMAIN-SUFFIX,permatabank.com,${BIZ.PAYMENTS}`,
    `DOMAIN-SUFFIX,cimbniaga.co.id,${BIZ.PAYMENTS}`,
    `DOMAIN-SUFFIX,btn.co.id,${BIZ.PAYMENTS}`,
    `DOMAIN-SUFFIX,ocbcnisp.com,${BIZ.PAYMENTS}`,
    `DOMAIN-SUFFIX,banksinarmas.com,${BIZ.PAYMENTS}`,
    `DOMAIN-SUFFIX,idx.co.id,${BIZ.PAYMENTS}`,
    `DOMAIN-SUFFIX,ksei.co.id,${BIZ.PAYMENTS}`,
    // 鈺愨晲鈺?v5.1.5: 鍘熴€屽嵃灏兼湰鍦般€嶈鍒欓噸鍒嗛厤 鈫?鐢靛晢/鍑鸿/澶栧崠/鐢典俊/鏀垮簻/鏂伴椈褰掑叆鍥藉缃戠珯 鈺愨晲鈺?
    `DOMAIN-SUFFIX,tokopedia.com,${BIZ.INTL_SITE}`,
    `DOMAIN-SUFFIX,tokopedia.net,${BIZ.INTL_SITE}`,
    `DOMAIN-SUFFIX,shopee.co.id,${BIZ.INTL_SITE}`,
    `DOMAIN-SUFFIX,bukalapak.com,${BIZ.INTL_SITE}`,
    `DOMAIN-SUFFIX,blibli.com,${BIZ.INTL_SITE}`,
    `DOMAIN-SUFFIX,lazada.co.id,${BIZ.INTL_SITE}`,
    `DOMAIN-SUFFIX,grab.com,${BIZ.INTL_SITE}`,
    `DOMAIN-SUFFIX,gojek.com,${BIZ.INTL_SITE}`,
    `DOMAIN-SUFFIX,gojek.co.id,${BIZ.INTL_SITE}`,
    `DOMAIN-SUFFIX,traveloka.com,${BIZ.INTL_SITE}`,
    `DOMAIN-SUFFIX,tiket.com,${BIZ.INTL_SITE}`,
    `DOMAIN-SUFFIX,telkomsel.com,${BIZ.INTL_SITE}`,
    `DOMAIN-SUFFIX,telkom.co.id,${BIZ.INTL_SITE}`,
    `DOMAIN-SUFFIX,indosatooredoo.com,${BIZ.INTL_SITE}`,
    `DOMAIN-SUFFIX,im3.co.id,${BIZ.INTL_SITE}`,
    `DOMAIN-SUFFIX,xl.co.id,${BIZ.INTL_SITE}`,
    `DOMAIN-SUFFIX,smartfren.com,${BIZ.INTL_SITE}`,
    `DOMAIN-SUFFIX,tri.co.id,${BIZ.INTL_SITE}`,
    `DOMAIN-SUFFIX,by.u.id,${BIZ.INTL_SITE}`,
    `DOMAIN-SUFFIX,myrepublic.co.id,${BIZ.INTL_SITE}`,
    `DOMAIN-SUFFIX,firstmedia.com,${BIZ.INTL_SITE}`,
    `DOMAIN-SUFFIX,biznet.id,${BIZ.INTL_SITE}`,
    `DOMAIN-SUFFIX,go.id,${BIZ.INTL_SITE}`,
    `DOMAIN-SUFFIX,or.id,${BIZ.INTL_SITE}`,
    `DOMAIN-SUFFIX,kompas.com,${BIZ.INTL_SITE}`,
    `DOMAIN-SUFFIX,detik.com,${BIZ.INTL_SITE}`,
    `DOMAIN-SUFFIX,tempo.co,${BIZ.INTL_SITE}`,
    `DOMAIN-SUFFIX,cnnindonesia.com,${BIZ.INTL_SITE}`,
    `DOMAIN-SUFFIX,cnbcindonesia.com,${BIZ.INTL_SITE}`,
    `DOMAIN-SUFFIX,liputan6.com,${BIZ.INTL_SITE}`,
    `DOMAIN-SUFFIX,tribunnews.com,${BIZ.INTL_SITE}`,
    `DOMAIN-SUFFIX,kumparan.com,${BIZ.INTL_SITE}`,
    `DOMAIN-SUFFIX,idntimes.com,${BIZ.INTL_SITE}`,
    `DOMAIN-SUFFIX,gofood.co.id,${BIZ.INTL_SITE}`,
    `DOMAIN-SUFFIX,grabfood.com,${BIZ.INTL_SITE}`,
    `DOMAIN-SUFFIX,66tutup.com,${BIZ.INTL_SITE}`,
    // v5.1.5: GEOIP,ID 褰掑叆鍥藉缃戠珯锛堜笌 GEOIP,CN鈫掑浗鍐呯綉绔?瀵圭О锛?
    `GEOIP,ID,${BIZ.INTL_SITE},no-resolve`,
    `DOMAIN-SUFFIX,163.com,${BIZ.CN_SITE}`,
    `DOMAIN-SUFFIX,126.com,${BIZ.CN_SITE}`,
    `DOMAIN-SUFFIX,126.net,${BIZ.CN_SITE}`,
    `DOMAIN-SUFFIX,jianguoyun.com,${BIZ.CN_SITE}`,
    `RULE-SET,cn,${BIZ.CN_SITE}`,
    `RULE-SET,cn-ip,${BIZ.CN_SITE},no-resolve`,
    `DOMAIN-SUFFIX,alimama.com,${BIZ.CN_SITE}`,
    `DOMAIN-SUFFIX,zxtdjy.com,${BIZ.CN_SITE}`,
    // v5.1.2 FIX#6: RULE-SET,acc-chinadns 宸插垹闄わ紙涓浗DNS鐢盋N鍏滃簳鑷劧鐩磋繛锛?
    // v5.2.5 FIX#23-P1: acc-geositecn / acc-china 鍒犻櫎锛堜笌 metaDomain('cn','cn') 绾噸澶嶏級
    `RULE-SET,acc-chinamax,${BIZ.CN_SITE}`,
    // v5.1.2 FIX#4: HomeIP 脳 2鍥?鈫?INTL_SITE锛坴5.1.1 璇綊鍏?CN_SITE 瀵艰嚧缇庢棩IP娈佃蛋鐩磋繛锛?
    `RULE-SET,acc-homeip-us,${BIZ.INTL_SITE},no-resolve`,
    `RULE-SET,acc-homeip-jp,${BIZ.INTL_SITE},no-resolve`,
    // v5.1.2 FIX#5: Aqara 鍥藉唴 鈫?CN_SITE锛屽浗闄?鈫?INTL_SITE锛坴5.1.1 Global 璇綊鍏?CN_SITE锛?
    `RULE-SET,acc-aqara-cn,${BIZ.CN_SITE}`,
    `RULE-SET,acc-aqara-global,${BIZ.INTL_SITE}`,

    // 鈺愨晲鈺?v5.1.4: 馃毇 鍙楅檺缃戠珯锛圙FW 灏侀攣鍩熷悕鍏滃簳锛屼綅浜?INTL_SITE 涔嬪墠锛夆晲鈺愨晲
    // 璇箟鍖哄垎锛欸FW 缁?= 纭琚腑鍥?GFW 灏侀攣鐨勫煙鍚?/ INTL_SITE = 鏅€氬浗澶栧煙鍚?
    // 鍦ㄤ腑鍥斤細GFW 缁勬墜鍔ㄩ€変唬鐞嗚妭鐐癸紝INTL_SITE 淇濇寔榛樿鍙帰娴嬬洿杩?
    // 鍦ㄥ嵃灏硷細GFW 缁勯€?DIRECT锛堣澧欑珯鐐瑰湪鍗板凹鍙洿杩烇級锛孖NTL_SITE 涔熼€?DIRECT
    `GEOSITE,gfw,${BIZ.GFW}`,
    `RULE-SET,loyalsoldier-gfw,${BIZ.GFW}`,
    `RULE-SET,loyalsoldier-greatfire,${BIZ.GFW}`,
    `RULE-SET,szkane-proxygfw,${BIZ.GFW}`,

    `RULE-SET,cnn,${BIZ.INTL_SITE}`,
    `RULE-SET,nytimes,${BIZ.INTL_SITE}`,
    `RULE-SET,bloomberg,${BIZ.INTL_SITE}`,
    `RULE-SET,ebay,${BIZ.INTL_SITE}`,
    `RULE-SET,nike,${BIZ.INTL_SITE}`,
    `RULE-SET,adobe,${BIZ.INTL_SITE}`,
    `RULE-SET,samsung,${BIZ.INTL_SITE}`,
    `RULE-SET,tesla,${BIZ.INTL_SITE}`,
    `RULE-SET,dropbox,${BIZ.INTL_SITE}`,
    `RULE-SET,mega,${BIZ.INTL_SITE}`,
    `RULE-SET,wikipedia,${BIZ.INTL_SITE}`,
    `RULE-SET,duolingo,${BIZ.INTL_SITE}`,
    `RULE-SET,proxy,${BIZ.INTL_SITE}`,
    // v5.1.4: szkane-proxygfw 宸茬Щ鑷炽€岎煔?鍙楅檺缃戠珯銆岹FW 缁勶紙瑙佷笂鏂癸級
    // v5.1: Accademia 鍥藉缃戠珯琛ュ厖
    `RULE-SET,acc-waybackmachine,${BIZ.INTL_SITE}`,
    `RULE-SET,acc-pornhub,${BIZ.INTL_SITE}`,
    // v5.1: szkane Education
    `RULE-SET,szkane-khan,${BIZ.INTL_SITE}`,
    `RULE-SET,szkane-edutools,${BIZ.INTL_SITE}`,
    // v5.1.2 FIX#3: naver 瀹藉煙鍚嶅厹搴曪紙瀛愬煙鍚嶅凡绮惧噯鍒嗘祦鍒版棩闊╂祦濯掍綋/鎼滅储寮曟搸锛?
    `RULE-SET,naver,${BIZ.INTL_SITE}`,
    // v5.1.3 FIX#9: ehgallery 绉诲叆鍥藉缃戠珯锛堥潪娴佸獟浣撴湇鍔★紝鍏ㄧ悆鑺傜偣鏇寸伒娲伙級
    `RULE-SET,ehgallery,${BIZ.INTL_SITE}`,
    // v5.1.2 FIX#1: GeoRouting Domain 脳 16鍥藉 + 1涓浗锛圓sia_China 鈫?CN_SITE锛?
    ...GEO_REGIONS_INTL.map(r => `RULE-SET,acc-geo-d-${r.toLowerCase().replace(/_/g,'-')},${BIZ.INTL_SITE}`),
    ...GEO_REGIONS_INTL.map(r => `RULE-SET,acc-geo-ip-${r.toLowerCase().replace(/_/g,'-')},${BIZ.INTL_SITE},no-resolve`),
    `RULE-SET,acc-geo-d-asia-china,${BIZ.CN_SITE}`,
    `RULE-SET,acc-geo-ip-asia-china,${BIZ.CN_SITE},no-resolve`,
    `DOMAIN-SUFFIX,archive.org,${BIZ.INTL_SITE}`,
    `DOMAIN-SUFFIX,udemy.com,${BIZ.INTL_SITE}`,
    `DOMAIN-SUFFIX,udemycdn.com,${BIZ.INTL_SITE}`,
    `DOMAIN-SUFFIX,grammarly.com,${BIZ.INTL_SITE}`,
    `DOMAIN-SUFFIX,grammarly.io,${BIZ.INTL_SITE}`,
    // v5.1.6 P0-FIX#7: jetbrains.com 宸插湪 DEV 缁勮鐩栵紙line ~1796锛夛紝姝ゅ涓烘瑙勫垯锛屽凡鍒犻櫎
    `DOMAIN-SUFFIX,jetbrains.net,${BIZ.INTL_SITE}`,
    `DOMAIN-SUFFIX,theguardian.com,${BIZ.INTL_SITE}`,
    `DOMAIN-SUFFIX,guardianapis.com,${BIZ.INTL_SITE}`,
    `DOMAIN-SUFFIX,box.com,${BIZ.INTL_SITE}`,
    `DOMAIN-SUFFIX,boxcdn.net,${BIZ.INTL_SITE}`,
    `DOMAIN-SUFFIX,noip.com,${BIZ.INTL_SITE}`,
    // 銐懧?v5.1: Loyalsoldier GEOIP 绮惧噯鏍囩璺敱锛堥渶 Loyalsoldier 鍔犲己鐗?MMDB锛?
    `GEOIP,cloudflare,${BIZ.INTL_SITE},no-resolve`,
    `GEOIP,telegram,${BIZ.IM},no-resolve`,
    `GEOIP,netflix,${BIZ.NFLX},no-resolve`,
    `GEOIP,facebook,${BIZ.SOCIAL},no-resolve`,
    `GEOIP,twitter,${BIZ.SOCIAL},no-resolve`,
    `GEOIP,google,${BIZ.TOOLS},no-resolve`,

    // 銐?GEOIP CN
    `GEOIP,CN,${BIZ.CN_SITE},no-resolve`,
    `MATCH,${BIZ.FINAL}`,
  ]
  // FlClash: 鍘熷湴鍐欏叆锛坰plice 娓呯┖ + 閫愪釜 push锛夛紝涓嶈兘鍦?QuickJS FFI 妗ユ帴灞傜洿鎺ラ噸璧嬪€?
  config.rules.splice(0, config.rules.length)
  for (var _ri = 0; _ri < _newRules.length; _ri++) { config.rules.push(_newRules[_ri]) }
  log(`[${VERSION}] Injected ${config.rules.length} rules`)
}

// ================================================================
//  妯″潡 I锛氬叏灞€鍙傛暟瑕嗗啓
// ================================================================

function overwriteGeneral(config) {
  config['unified-delay'] = true
  config['tcp-concurrent'] = true
  config['find-process-mode'] = 'strict'
  config['keep-alive-idle'] = 30
  config['keep-alive-interval'] = 15
  // FlClash: 绔彛/TUN/DNS/GeoX 鍧囩敱 App UI 绠＄悊锛岃剼鏈笉瑕嗗啓銆?
  //   - 澶栭儴璧勬簮锛圙eoX URL锛夛細瑙?FlClash/README.md 搂蹇呮敼閰嶇疆
  //   - 杩涢樁閰嶇疆锛圖NS锛夛細瑙?FlClash/README.md 搂蹇呮敼閰嶇疆
  //   锛堜笌 Clash Party Sub-Store 鐗堜笉鍚岋紝鍚庤€呯敱鑴氭湰娉ㄥ叆鍏ㄩ儴鍏ㄥ眬璁剧疆锛?
  if (!config.profile) config.profile = {}
  config.profile['store-selected'] = true
  config.profile['store-fake-ip'] = true
  config.profile['tracing'] = true
}

// ================================================================
//  妯″潡 J锛氭竻鐞嗚闃呰嚜甯︾殑鏃х粍鍜屾棫瑙勫垯
// ================================================================

function cleanupSubscription(config) {
  // FlClash: 蹇呴』鐢ㄥ師鍦颁慨鏀癸紙splice/length=0锛夛紝涓嶈兘閲嶆柊璧嬪€硷紙= []锛夈€?
  //    QuickJS 鈫?Dart FFI 妗ユ帴灞傦細鑻ュ垱寤烘柊鏁扮粍锛孌art 绔粛鎸佹湁鏃у紩鐢?鈫?淇敼涓㈠け銆?
  //    鏃ф敞閲?v5.2.6-normal.1 FIX#26-P0): 4 鍏抽敭璇嶉粦鍚嶅崟鏃犳硶娓呴櫎鏈哄満妯℃澘 鈫?鍏ㄩ噺閲嶅缓銆?
  var removed = (config['proxy-groups'] || []).length
  if (config['proxy-groups'] && config['proxy-groups'].length > 0) {
    config['proxy-groups'].splice(0, config['proxy-groups'].length)
  }
  if (removed > 0) log(`[${VERSION}] Cleared ${removed} subscription proxy-groups`)
  if (config.rules && config.rules.length > 0) {
    config.rules.splice(0, config.rules.length)
  }
  if (config['rule-providers']) {
    var rpKeys = Object.keys(config['rule-providers'])
    for (var i = 0; i < rpKeys.length; i++) { delete config['rule-providers'][rpKeys[i]] }
  }
}

// ================================================================
//  妯″潡 K锛氭敞鍏ユ櫤鑳?TLS 鎸囩汗
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
    // v5.2.0 FIX#15: 鍏堝垽鏂崗璁被鍨嬶紝鍐嶅垽鏂槸鍚﹂渶瑕佹寚绾癸紙閫昏緫椤哄簭浼樺寲锛?
    if (['vless','vmess','trojan'].indexOf(p.type) === -1) return
    const isReality = !!(p['reality-opts'] || p['reality_opts'])
    const flow = (p.flow || '').toLowerCase()
    const isXTLS = /xtls-rprx/.test(flow)
    // 浠呭 TLS 鎴?Reality/XTLS 鑺傜偣娉ㄥ叆鎸囩汗锛堥潪鍔犲瘑杩炴帴鏃犻渶鎸囩汗锛?
    if (!p.tls && !isReality && !isXTLS) return
    // v5.1.6 P0-FIX#4: 涓嶈鐩栬妭鐐瑰凡鏈?fingerprint锛堟満鍦哄彲鑳戒负 Reality 鑺傜偣璋冧紭杩囷級
    if (p['client-fingerprint']) return
    let chosenFP = null
    const name = String(p.name)
    if (/netflix|youtube|hulu|primevideo|disney|twitch/i.test(name)) { chosenFP = fpByPurpose.STREAM }
    else if (/game|steam|playstation|nintendo|epic|valorant/i.test(name)) { chosenFP = fpByPurpose.GAME }
    else if (/twitter|facebook|instagram|tiktok|snapchat|linkedin/i.test(name)) { chosenFP = fpByPurpose.SOCIAL }
    else if (/api|dev|github|gitlab|npm|pypi|docker/i.test(name)) { chosenFP = fpByPurpose.DEV }
    if (!chosenFP) { const idx = _simpleHash(name) % fpFallbackCandidates.length; chosenFP = fpFallbackCandidates[idx] }
    p['client-fingerprint'] = chosenFP
  })
}

// ================================================================
//  妯″潡 L锛歱roxy-groups 鏈€缁堟帓搴?
// ================================================================

function sortProxyGroups(config) {
  const bizGroups = [], smartGroups = [], otherGroups = []
  const bizNames = new Set(Object.values(BIZ))
  const smartNames = new Set(Object.values(SMART))
  config['proxy-groups'].forEach(g => {
    if (!g || !g.name) return
    if (bizNames.has(g.name)) { bizGroups.push(g) }
    else if (smartNames.has(g.name)) { smartGroups.push(g) }
    else { otherGroups.push(g) }
  })
  const bizOrder = Object.values(BIZ)
  bizGroups.sort((a, b) => bizOrder.indexOf(a.name) - bizOrder.indexOf(b.name))
  const smartOrder = Object.values(SMART)
  smartGroups.sort((a, b) => { const ia = smartOrder.indexOf(a.name); const ib = smartOrder.indexOf(b.name); return (ia === -1 ? 999 : ia) - (ib === -1 ? 999 : ib) })
  // FlClash: 蹇呴』鍘熷湴淇敼锛屼笉鑳介噸鏂拌祴鍊硷紙QuickJS FFI 妗ユ帴灞傞檺鍒讹級
  config['proxy-groups'].splice(0, config['proxy-groups'].length)
  var sorted = bizGroups.concat(otherGroups, smartGroups)
  for (var i = 0; i < sorted.length; i++) { config['proxy-groups'].push(sorted[i]) }
}

// ================================================================
//  涓诲嚱鏁?
// ================================================================

function main(config) {
  try {
    if (!config || typeof config !== 'object') return config
    if (!Array.isArray(config.proxies) || config.proxies.length === 0) return config
    log(`[${VERSION}] Start processing, ${config.proxies.length} proxies`)
    if (!Array.isArray(config['proxy-groups'])) config['proxy-groups'] = []
    if (!Array.isArray(config.rules)) config.rules = []
    overwriteGeneral(config)
    cleanupSubscription(config)
    injectSmartFingerprint(config)
    var c = classifyAllNodes(config.proxies)
    var jpkrNodes = c.JP.concat(c.KR)
    var americasNodes = c.US.concat(c.AM)
    var homeJpkrNodes = c.HOME_JP.concat(c.HOME_KR)
    var homeAmericasNodes = c.HOME_US.concat(c.HOME_AM)
    upsertSmartGroup(config, SMART.GLOBAL, c.ALL)
    if (c.HOME_ALL.length > 0) upsertSmartGroup(config, SMART.GLOBAL_HOME, c.HOME_ALL)
    // v5.2.8-normal.2: 鍏ㄩ儴/瀹跺鍖哄煙缁熶竴绌虹粍涓嶅垱寤猴紝閬垮厤闈欓粯鍥為€€姹℃煋瀹跺鎴栧湴鍖鸿涔?
    //   锛堜笌 Smart 鐗堝悓姝ヤ慨澶嶃€係MART.GLOBAL 濮嬬粓瀛樺湪鍏滃簳锛?
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

    // 鏀堕泦瀹為檯鍒涘缓鐨勫尯鍩熺粍鍚嶏紙鎸?SMART 甯搁噺鍚嶅尮閰嶏級锛岃繃婊や笟鍔＄粍鐨?proxy 寮曠敤
    var _regionNameSet = new Set(Object.values(SMART))
    var activeSmartNames = new Set(config['proxy-groups'].filter(function(g) { return g && _regionNameSet.has(g.name) }).map(function(g) { return g.name }))
    activeSmartNames.add('DIRECT'); activeSmartNames.add('REJECT')
    log(`[${VERSION}] Active url-test region groups: ${[...activeSmartNames].filter(function(n) { return n !== 'DIRECT' && n !== 'REJECT' }).join(', ')}`)

    injectBusinessGroups(config, activeSmartNames)
    injectRuleProviders(config)
    injectRules(config)
    sortProxyGroups(config)
    log(`[${VERSION}] Done! Groups: ${config['proxy-groups'].length}, Rules: ${config.rules.length}, Providers: ${Object.keys(config['rule-providers']).length}`)
    return config
  } catch (e) {
    log(`[${VERSION}] Error:`, e)
    return config
  }
}
