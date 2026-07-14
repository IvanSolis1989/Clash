#!/bin/bash
. /usr/share/openclash/log.sh

# ============================================================================
# Clash Smart v6.0.7-oc-normal.1 — OpenClash 覆写脚本（非 Smart 内核 / url-test 区域组）
# Build: 2026-07-14
# ============================================================================
# v6.0.7: FIX#176 将共享 CDN / 非中国地域兜底置于国内域名权威规则之后，避免中国域名被境外 IP 先行匹配
# v5.4.33: FEAT#169-AI-CODING 接入 VPSDance AI coding 规则补齐 AI 编程工具
# v5.4.32: FIX#168-CN-GAME 国内游戏前置到国外游戏宽规则之前，避免 HoYoverse / Game / category-games 抢先代理
# 定位：与同目录 OpenClash(mihomo-smart).sh 规则 100% 等价的「非 Smart 内核」版本。
#       两者唯一区别：22 个区域组（11 全部 + 11 家宽）从 type: smart（uselightgbm）换成 type: url-test。
#       对齐 Clash Party v6.0.7 JS 基线。
#       适用场景：
#         - OpenClash 内核选的是 Meta(mihomo 稳定版) 而非 Meta Alpha，不支持 smart + LightGBM
#         - 或者明确想关闭 LightGBM ML 评估、只靠经典 url-test 延迟选路
#       需要 LightGBM 智能评估请改用 OpenClash(mihomo-smart).sh（Smart 版）。
# 架构：
#   • 22 url-test 区域组（11 全部 + 11 家宽；interval 600s / tolerance 150ms / lazy：与 Smart 版同步延迟参数）
#   • 33 业务策略组（流媒体按平台拆分：TikTok / Netflix / Disney+ / HBO/Max / Hulu / Prime Video / YouTube / 音乐流媒体 / 其他国外流媒体）
#   • 126 融合 rule-providers（源 513 providers，全部 proxy: "🚫 受限网站"）
#   • 143 条 rules（源 970 rules；仅保留 17 条必要内联规则）
#   • DNS fake-ip + 嗅探（HTTP/TLS/QUIC）+ nameserver-policy 救援
#   • Ruby 阶段做：节点过滤 / 区域分类 / url-test 组生成 / TLS 指纹注入
# 基线：Clash Party v6.0.7（唯一主线；v5.3.1/v5.3.2 为桌面端 PROCESS-NAME 改动，路由器端不适用）── 任何规则/组/DNS 改动必须先改 Clash Party JS，
#       再同步到此文件。参见仓库根目录 CLAUDE.md / AGENTS.md。
# 变更历史：见 `OpenClash/CHANGELOG.md`（Normal 部分）。
# ============================================================================



VERSION_TAG="v6.0.7-oc-normal.1"
CONFIG_FILE="$1"
LOG_FILE="/tmp/openclash.log"

umask 077
TMP_DIR="${TMPDIR:-/tmp}"
make_temp_file() {
  local prefix="$1"
  local temp_file=""
  temp_file="$(mktemp "$TMP_DIR/${prefix}.XXXXXX" 2>/dev/null)" && {
    printf '%s\n' "$temp_file"
    return 0
  }
  temp_file="$TMP_DIR/${prefix}.$$"
  ( set -C; : > "$temp_file" ) || exit 1
  printf '%s\n' "$temp_file"
}

OVERRIDE_YAML="$(make_temp_file clash_normal_override)"
RUBY_SCRIPT="$(make_temp_file clash_normal_ruby)"
STATUS_LOG="$(make_temp_file clash_normal_status)"
cleanup_temp_files() {
  rm -f "$OVERRIDE_YAML" "$RUBY_SCRIPT" "$STATUS_LOG"
}
trap cleanup_temp_files EXIT INT TERM

LOG_OUT "Info" "[Clash-Normal] $VERSION_TAG overwrite starting..."
LOG_OUT "Info" "[Clash-Normal] Processing: $CONFIG_FILE"
LOG_OUT "Info" "[Clash-Normal] Fused-rule build (v6.0.7, 33 business groups, non-Smart kernel)"

# ============================================================================
# OVERRIDE YAML
# ============================================================================
cat > "$OVERRIDE_YAML" << 'OVERRIDE_EOF'
hosts:
  one.one.one.one:
  - 1.1.1.1
  - 1.0.0.1
  cloudflare-dns.com:
  - 1.1.1.1
  - 1.0.0.1
  dns.google:
  - 8.8.8.8
  - 8.8.4.4
  dns.quad9.net: 9.9.9.9
  dns.alidns.com:
  - 223.5.5.5
  - 223.6.6.6
  doh.pub:
  - 119.29.29.29
dns:
  enable: true
  listen: 0.0.0.0:7874
  ipv6: false
  prefer-h3: false
  enhanced-mode: fake-ip
  fake-ip-range: 198.18.0.1/16
  fake-ip-filter:
  - +.lan
  - +.local
  - +.localdomain
  - +.home.arpa
  - +.msftconnecttest.com
  - +.msftncsi.com
  - localhost.ptlogin2.qq.com
  - localhost.sec.qq.com
  - localhost.work.weixin.qq.com
  - +.in-addr.arpa
  - +.ip6.arpa
  - time.*.com
  - time.*.gov
  - ntp.*.com
  - pool.ntp.org
  - +.ntp.org
  - +.pool.ntp.org
  - +.market.xiaomi.com
  - +.stun.*.*
  - +.stun.*.*.*
  - +.turn.*.*
  - +.turn.*.*.*
  - +.n.n.srv.nintendo.net
  - +.stun.playstation.net
  - +.xboxlive.com
  - stun.l.google.com
  - stun1.l.google.com
  - stun2.l.google.com
  - stun3.l.google.com
  - stun4.l.google.com
  - global.turn.twilio.com
  - +.rustdesk.com
  # v5.4.19 #3 借鉴 Proxy-override：远控/游戏/P2P 需真实 IP 才能打洞/直连（同 RustDesk 语义）
  - +.todesk.com
  - +.oray.com
  - +.sunlogin.com
  - +.teamviewer.com
  - +.anydesk.com
  - +.battlenet.com.cn
  - +.wotgame.cn
  - +.wggames.cn
  - +.wowsgame.cn
  - +.mcdn.bilivideo.cn
  - +.pub.3gppnetwork.org
  - +.bing.com
  - +.miwifi.com
  - +.courier.push.apple.com
  - +.miui.com
  - +.xiaomi.com
  - +.xiaomi.net
  - +.mijia.tech
  - +.gotui.com
  cache-algorithm: arc
  # 对齐 Clash Party v5.4.17 基线：default-nameserver 纯 IP，其它 resolver 固定 DoH
  # FIX#HOSTS-ALIGN: use-hosts 改 true（对齐主线启用 hosts 预解析，消除 fake-ip 冷启动循环依赖）
  use-hosts: true
  use-system-hosts: false
  respect-rules: true
  # v5.4.21 #4 借鉴 Proxy-override：default-nameserver DoH-over-IP + 1 明文兜底
  default-nameserver:
  - 'https://223.5.5.5/dns-query'
  - 'https://223.6.6.6/dns-query'
  - 'https://8.8.8.8/dns-query'
  - 'https://1.1.1.1/dns-query'
  - '223.5.5.5'
  nameserver-policy:
    geosite:cn:
    - https://dns.alidns.com/dns-query
    - https://doh.pub/dns-query
    geosite:geolocation-!cn:
    - https://cloudflare-dns.com/dns-query
    - https://dns.google/dns-query
    '+.jsdelivr.net':
    - https://cloudflare-dns.com/dns-query
    - https://dns.google/dns-query
    '+.github.com':
    - https://cloudflare-dns.com/dns-query
    - https://dns.google/dns-query
    '+.githubusercontent.com':
    - https://cloudflare-dns.com/dns-query
    - https://dns.google/dns-query
    '+.githubassets.com':
    - https://cloudflare-dns.com/dns-query
    - https://dns.google/dns-query
    '+.fastly.net':
    - https://cloudflare-dns.com/dns-query
    - https://dns.google/dns-query
  nameserver:
  - https://dns.alidns.com/dns-query
  - https://doh.pub/dns-query
  proxy-server-nameserver:
  - https://cloudflare-dns.com/dns-query
  - https://dns.google/dns-query
  - https://dns.alidns.com/dns-query
  - https://doh.pub/dns-query
  direct-nameserver:
  - https://dns.alidns.com/dns-query
  - https://doh.pub/dns-query
  # v5.4.19 #5 借鉴 Proxy-override：让 direct-nameserver 也遵循 nameserver-policy（默认 false）。policy 覆盖境外 CDN 与 geosite 级分流。
  direct-nameserver-follow-policy: true
  fallback:
  - https://cloudflare-dns.com/dns-query
  - https://dns.google/dns-query
  fallback-filter:
    geoip: true
    geoip-code: CN
    geosite:
    - gfw
    - geolocation-!cn
    ipcidr:
    - 240.0.0.0/4
    - 0.0.0.0/32
    - 127.0.0.0/8
    - 10.0.0.0/8
    - 192.168.0.0/16
    domain: []
find-process-mode: 'off'
sniffer:
  enable: true
  parse-pure-ip: true
  force-dns-mapping: true
  override-destination: true
  sniff:
    HTTP:
      ports:
      - '80'
      - 8080-8880
      override-destination: true
    TLS:
      ports:
      - '443'
      - '8443'
    QUIC:
      ports:
      - '443'
      - '8443'
      - '4433'
  skip-domain:
  - +.push.apple.com
  skip-dst-address:
  - 91.105.192.0/23
  - 91.108.4.0/22
  - 91.108.8.0/21
  - 91.108.16.0/21
  - 91.108.56.0/22
  - 95.161.64.0/20
  - 149.154.160.0/20
  - 185.76.151.0/24
  - 2001:67c:4e8::/48
  - 2001:b28:f23c::/47
  - 2001:b28:f23f::/48
  - 2a0a:f280:203::/48
  force-domain: []
  skip-src-address: []
unified-delay: true
tcp-concurrent: true
keep-alive-idle: 30
keep-alive-interval: 15
geodata-mode: true
# ★★ 优化 #1 ★★ standard → memconservative，节省 400-600MB
# memconservative 用 mmap 按需读 geosite/geoip 文件，代替 standard
# 一次性解压全部数据到内存构建 trie 的旧做法
geodata-loader: memconservative
geo-auto-update: true
geox-url:
  geoip: https://fastly.jsdelivr.net/gh/Loyalsoldier/geoip@release/geoip.dat
  mmdb: https://fastly.jsdelivr.net/gh/Loyalsoldier/geoip@release/Country.mmdb
  asn: https://fastly.jsdelivr.net/gh/Loyalsoldier/geoip@release/GeoLite2-ASN.mmdb
  geosite: https://fastly.jsdelivr.net/gh/MetaCubeX/meta-rules-dat@release/geosite.dat
profile:
  store-selected: true
  store-fake-ip: true
proxy-groups:
- name: 🤖 AI 服务
  type: select
  proxies: &id001
    - 🏡 全球家宽
    - 🏡 香港家宽
    - 🏡 台湾家宽
    - 🏡 狮城家宽
    - 🏡 日韩家宽
    - 🏡 亚太家宽
    - 🏡 美国家宽
    - 🏡 欧洲家宽
    - 🏡 美洲家宽
    - 🏡 非洲家宽
    - 🌍 全球节点
    - 🇭🇰 香港节点
    - 🇹🇼 台湾节点
    - 🇸🇬 狮城节点
    - 🇯🇵 日韩节点
    - 🌏 亚太节点
    - 🇺🇸 美国节点
    - 🇪🇺 欧洲节点
    - 🌎 美洲节点
    - 🌍 非洲节点
    - DIRECT
- name: 💰 加密货币
  type: select
  proxies: &id002
    - 🌍 全球节点
    - 🏡 全球家宽
    - 🇭🇰 香港节点
    - 🏡 香港家宽
    - 🇹🇼 台湾节点
    - 🏡 台湾家宽
    - 🇸🇬 狮城节点
    - 🏡 狮城家宽
    - 🇯🇵 日韩节点
    - 🏡 日韩家宽
    - 🌏 亚太节点
    - 🏡 亚太家宽
    - 🇺🇸 美国节点
    - 🏡 美国家宽
    - 🇪🇺 欧洲节点
    - 🏡 欧洲家宽
    - 🌎 美洲节点
    - 🏡 美洲家宽
    - 🌍 非洲节点
    - 🏡 非洲家宽
    - DIRECT
- name: 🏦 金融支付
  type: select
  proxies: *id002
- name: 💬 即时通讯
  type: select
  proxies: *id002
- name: 📱 社交媒体
  type: select
  proxies: *id002
- name: 🧑‍💼 会议协作
  type: select
  proxies: *id002
- name: 📺 国内流媒体
  type: select
  proxies: &id003
  - DIRECT
  - 🌍 全球节点
  - 🏡 全球家宽
  - 🇭🇰 香港节点
  - 🏡 香港家宽
  - 🇹🇼 台湾节点
  - 🏡 台湾家宽
  - 🇸🇬 狮城节点
  - 🏡 狮城家宽
  - 🇯🇵 日韩节点
  - 🏡 日韩家宽
  - 🌏 亚太节点
  - 🏡 亚太家宽
  - 🇺🇸 美国节点
  - 🏡 美国家宽
  - 🇪🇺 欧洲节点
  - 🏡 欧洲家宽
  - 🌎 美洲节点
  - 🏡 美洲家宽
  - 🌍 非洲节点
  - 🏡 非洲家宽
- name: 🎵 TikTok
  type: select
  proxies: *id002
- name: 🎥 Netflix
  type: select
  proxies: *id002
- name: 🎬 Disney+
  type: select
  proxies: *id002
- name: 📡 HBO/Max
  type: select
  proxies: *id002
- name: 📺 Hulu
  type: select
  proxies: *id002
- name: 🎬 Prime Video
  type: select
  proxies: *id002
- name: 📹 YouTube
  type: select
  proxies: *id002
- name: 🎵 音乐流媒体
  type: select
  proxies: *id002
- name: 🇭🇰 香港流媒体
  type: select
  proxies:
    - 🇭🇰 香港节点
    - 🏡 香港家宽
    - 🌍 全球节点
    - 🏡 全球家宽
    - 🇹🇼 台湾节点
    - 🏡 台湾家宽
    - 🇯🇵 日韩节点
    - 🏡 日韩家宽
    - 🌏 亚太节点
    - 🏡 亚太家宽
    - 🇺🇸 美国节点
    - 🏡 美国家宽
    - 🇪🇺 欧洲节点
    - 🏡 欧洲家宽
    - 🌎 美洲节点
    - 🏡 美洲家宽
    - 🌍 非洲节点
    - 🏡 非洲家宽
    - DIRECT
- name: 🇹🇼 台湾流媒体
  type: select
  proxies:
    - 🇹🇼 台湾节点
    - 🏡 台湾家宽
    - 🌍 全球节点
    - 🏡 全球家宽
    - 🇭🇰 香港节点
    - 🏡 香港家宽
    - 🇯🇵 日韩节点
    - 🏡 日韩家宽
    - 🌏 亚太节点
    - 🏡 亚太家宽
    - 🇺🇸 美国节点
    - 🏡 美国家宽
    - 🇪🇺 欧洲节点
    - 🏡 欧洲家宽
    - 🌎 美洲节点
    - 🏡 美洲家宽
    - 🌍 非洲节点
    - 🏡 非洲家宽
    - DIRECT
- name: 🇯🇵 日韩流媒体
  type: select
  proxies:
    - 🇯🇵 日韩节点
    - 🏡 日韩家宽
    - 🌍 全球节点
    - 🏡 全球家宽
    - 🇭🇰 香港节点
    - 🏡 香港家宽
    - 🇹🇼 台湾节点
    - 🏡 台湾家宽
    - 🌏 亚太节点
    - 🏡 亚太家宽
    - 🇺🇸 美国节点
    - 🏡 美国家宽
    - 🇪🇺 欧洲节点
    - 🏡 欧洲家宽
    - 🌎 美洲节点
    - 🏡 美洲家宽
    - 🌍 非洲节点
    - 🏡 非洲家宽
    - DIRECT
- name: 🇪🇺 欧洲流媒体
  type: select
  proxies:
    - 🇪🇺 欧洲节点
    - 🏡 欧洲家宽
    - 🌍 全球节点
    - 🏡 全球家宽
    - 🇭🇰 香港节点
    - 🏡 香港家宽
    - 🇹🇼 台湾节点
    - 🏡 台湾家宽
    - 🇯🇵 日韩节点
    - 🏡 日韩家宽
    - 🌏 亚太节点
    - 🏡 亚太家宽
    - 🇺🇸 美国节点
    - 🏡 美国家宽
    - 🌎 美洲节点
    - 🏡 美洲家宽
    - 🌍 非洲节点
    - 🏡 非洲家宽
    - DIRECT
- name: 🌐 其他国外流媒体
  type: select
  proxies: *id002
- name: 🕹️ 国内游戏
  type: select
  proxies: *id003
- name: 🎮 国外游戏
  type: select
  proxies: *id002
- name: 🔍 Google 服务
  type: select
  proxies: *id002
- name: 🔧 工具与服务
  type: select
  proxies: *id002
- name: Ⓜ️ 微软服务
  type: select
  proxies: *id002
- name: 🍎 苹果服务
  type: select
  proxies: *id003
- name: 📥 下载更新
  type: select
  proxies: *id002
- name: 🛰️ BT/PT Tracker
  type: select
  proxies:
  - REJECT
  - DIRECT
  - 🌍 全球节点
  - 🏡 全球家宽
  - 🇭🇰 香港节点
  - 🏡 香港家宽
  - 🌏 亚太节点
  - 🏡 亚太家宽
- name: 🏠 国内网站
  type: select
  proxies: *id003
- name: 🚫 受限网站
  type: select
  proxies: *id002
- name: 🌐 国外网站
  type: select
  proxies: *id002
- name: 🐟 漏网之鱼
  type: select
  proxies: *id002
- name: 🛑 广告拦截
  type: select
  proxies:
  - REJECT
  - DIRECT
OVERRIDE_EOF

# ============================================================================
# OVERRIDE YAML (续) — Fused Rule-Providers：126 项，对齐 Clash Party v6.0.7 主线
# 策略：
#   ✓ 与 Clash Party 主线（BIZ.GFW = '🚫 受限网站'）一致：所有 provider 都走 GFW 组
#     下载，在中国走代理、在印尼走 DIRECT，规避 jsdelivr/GitHub 冷启动死锁。
#   ✓ 22 url-test 区域组 + 33 业务组 + 126 融合 rule-providers + 143 条规则
#   ✓ 区域组统一 type: url-test + include-all-proxies / explicit proxies 分流
#   ✓ TLS 指纹注入（Ruby 阶段 _simple_hash 分配）
# ============================================================================
cat >> "$OVERRIDE_YAML" << 'OVERRIDE_EOF'
rule-providers:
  scki-fused-001-direct-domain:
    type: http
    behavior: domain
    format: mrs
    url: "https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/mihomo/scki-fused-001-direct-domain.mrs"
    path: "./ruleset/scki-fused-001-direct-domain.mrs"
    interval: 86400
    proxy: "🚫 受限网站"
  scki-fused-002-intl-site-domain:
    type: http
    behavior: domain
    format: mrs
    url: "https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/mihomo/scki-fused-002-intl-site-domain.mrs"
    path: "./ruleset/scki-fused-002-intl-site-domain.mrs"
    interval: 86400
    proxy: "🚫 受限网站"
  scki-fused-003-payments-domain:
    type: http
    behavior: domain
    format: mrs
    url: "https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/mihomo/scki-fused-003-payments-domain.mrs"
    path: "./ruleset/scki-fused-003-payments-domain.mrs"
    interval: 86400
    proxy: "🚫 受限网站"
  scki-fused-004-ai-domain:
    type: http
    behavior: domain
    format: mrs
    url: "https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/mihomo/scki-fused-004-ai-domain.mrs"
    path: "./ruleset/scki-fused-004-ai-domain.mrs"
    interval: 86400
    proxy: "🚫 受限网站"
  scki-fused-005-cnmedia-domain:
    type: http
    behavior: domain
    format: mrs
    url: "https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/mihomo/scki-fused-005-cnmedia-domain.mrs"
    path: "./ruleset/scki-fused-005-cnmedia-domain.mrs"
    interval: 86400
    proxy: "🚫 受限网站"
  scki-fused-006-ad-domain:
    type: http
    behavior: domain
    format: mrs
    url: "https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/mihomo/scki-fused-006-ad-domain.mrs"
    path: "./ruleset/scki-fused-006-ad-domain.mrs"
    interval: 86400
    proxy: "🚫 受限网站"
  scki-fused-006-ad-ipcidr:
    type: http
    behavior: ipcidr
    format: mrs
    url: "https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/mihomo/scki-fused-006-ad-ipcidr.mrs"
    path: "./ruleset/scki-fused-006-ad-ipcidr.mrs"
    interval: 86400
    proxy: "🚫 受限网站"
  scki-fused-006-ad-residual:
    type: http
    behavior: classical
    format: yaml
    url: "https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/mihomo/scki-fused-006-ad-residual.yaml"
    path: "./ruleset/scki-fused-006-ad-residual.yaml"
    interval: 86400
    proxy: "🚫 受限网站"
  scki-fused-007-cn-site-domain:
    type: http
    behavior: domain
    format: mrs
    url: "https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/mihomo/scki-fused-007-cn-site-domain.mrs"
    path: "./ruleset/scki-fused-007-cn-site-domain.mrs"
    interval: 86400
    proxy: "🚫 受限网站"
  scki-fused-008-direct-domain:
    type: http
    behavior: domain
    format: mrs
    url: "https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/mihomo/scki-fused-008-direct-domain.mrs"
    path: "./ruleset/scki-fused-008-direct-domain.mrs"
    interval: 86400
    proxy: "🚫 受限网站"
  scki-fused-008-direct-ipcidr-no-resolve:
    type: http
    behavior: ipcidr
    format: mrs
    url: "https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/mihomo/scki-fused-008-direct-ipcidr-no-resolve.mrs"
    path: "./ruleset/scki-fused-008-direct-ipcidr-no-resolve.mrs"
    interval: 86400
    proxy: "🚫 受限网站"
  scki-fused-008-direct-residual:
    type: http
    behavior: classical
    format: yaml
    url: "https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/mihomo/scki-fused-008-direct-residual.yaml"
    path: "./ruleset/scki-fused-008-direct-residual.yaml"
    interval: 86400
    proxy: "🚫 受限网站"
  scki-fused-009-work-residual:
    type: http
    behavior: classical
    format: yaml
    url: "https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/mihomo/scki-fused-009-work-residual.yaml"
    path: "./ruleset/scki-fused-009-work-residual.yaml"
    interval: 86400
    proxy: "🚫 受限网站"
  scki-fused-010-crypto-domain:
    type: http
    behavior: domain
    format: mrs
    url: "https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/mihomo/scki-fused-010-crypto-domain.mrs"
    path: "./ruleset/scki-fused-010-crypto-domain.mrs"
    interval: 86400
    proxy: "🚫 受限网站"
  scki-fused-011-gfw-domain:
    type: http
    behavior: domain
    format: mrs
    url: "https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/mihomo/scki-fused-011-gfw-domain.mrs"
    path: "./ruleset/scki-fused-011-gfw-domain.mrs"
    interval: 86400
    proxy: "🚫 受限网站"
  scki-fused-012-youtube-domain:
    type: http
    behavior: domain
    format: mrs
    url: "https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/mihomo/scki-fused-012-youtube-domain.mrs"
    path: "./ruleset/scki-fused-012-youtube-domain.mrs"
    interval: 86400
    proxy: "🚫 受限网站"
  scki-fused-013-cn-site-domain:
    type: http
    behavior: domain
    format: mrs
    url: "https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/mihomo/scki-fused-013-cn-site-domain.mrs"
    path: "./ruleset/scki-fused-013-cn-site-domain.mrs"
    interval: 86400
    proxy: "🚫 受限网站"
  scki-fused-014-ai-domain:
    type: http
    behavior: domain
    format: mrs
    url: "https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/mihomo/scki-fused-014-ai-domain.mrs"
    path: "./ruleset/scki-fused-014-ai-domain.mrs"
    interval: 86400
    proxy: "🚫 受限网站"
  scki-fused-014-ai-residual:
    type: http
    behavior: classical
    format: yaml
    url: "https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/mihomo/scki-fused-014-ai-residual.yaml"
    path: "./ruleset/scki-fused-014-ai-residual.yaml"
    interval: 86400
    proxy: "🚫 受限网站"
  scki-fused-015-work-domain:
    type: http
    behavior: domain
    format: mrs
    url: "https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/mihomo/scki-fused-015-work-domain.mrs"
    path: "./ruleset/scki-fused-015-work-domain.mrs"
    interval: 86400
    proxy: "🚫 受限网站"
  scki-fused-016-ai-domain:
    type: http
    behavior: domain
    format: mrs
    url: "https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/mihomo/scki-fused-016-ai-domain.mrs"
    path: "./ruleset/scki-fused-016-ai-domain.mrs"
    interval: 86400
    proxy: "🚫 受限网站"
  scki-fused-016-ai-ipcidr:
    type: http
    behavior: ipcidr
    format: mrs
    url: "https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/mihomo/scki-fused-016-ai-ipcidr.mrs"
    path: "./ruleset/scki-fused-016-ai-ipcidr.mrs"
    interval: 86400
    proxy: "🚫 受限网站"
  scki-fused-016-ai-residual:
    type: http
    behavior: classical
    format: yaml
    url: "https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/mihomo/scki-fused-016-ai-residual.yaml"
    path: "./ruleset/scki-fused-016-ai-residual.yaml"
    interval: 86400
    proxy: "🚫 受限网站"
  scki-fused-017-intl-site-domain:
    type: http
    behavior: domain
    format: mrs
    url: "https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/mihomo/scki-fused-017-intl-site-domain.mrs"
    path: "./ruleset/scki-fused-017-intl-site-domain.mrs"
    interval: 86400
    proxy: "🚫 受限网站"
  scki-fused-018-im-domain:
    type: http
    behavior: domain
    format: mrs
    url: "https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/mihomo/scki-fused-018-im-domain.mrs"
    path: "./ruleset/scki-fused-018-im-domain.mrs"
    interval: 86400
    proxy: "🚫 受限网站"
  scki-fused-019-work-domain:
    type: http
    behavior: domain
    format: mrs
    url: "https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/mihomo/scki-fused-019-work-domain.mrs"
    path: "./ruleset/scki-fused-019-work-domain.mrs"
    interval: 86400
    proxy: "🚫 受限网站"
  scki-fused-020-download-domain:
    type: http
    behavior: domain
    format: mrs
    url: "https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/mihomo/scki-fused-020-download-domain.mrs"
    path: "./ruleset/scki-fused-020-download-domain.mrs"
    interval: 86400
    proxy: "🚫 受限网站"
  scki-fused-020-download-ipcidr:
    type: http
    behavior: ipcidr
    format: mrs
    url: "https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/mihomo/scki-fused-020-download-ipcidr.mrs"
    path: "./ruleset/scki-fused-020-download-ipcidr.mrs"
    interval: 86400
    proxy: "🚫 受限网站"
  scki-fused-021-google-domain:
    type: http
    behavior: domain
    format: mrs
    url: "https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/mihomo/scki-fused-021-google-domain.mrs"
    path: "./ruleset/scki-fused-021-google-domain.mrs"
    interval: 86400
    proxy: "🚫 受限网站"
  scki-fused-021-google-ipcidr-no-resolve:
    type: http
    behavior: ipcidr
    format: mrs
    url: "https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/mihomo/scki-fused-021-google-ipcidr-no-resolve.mrs"
    path: "./ruleset/scki-fused-021-google-ipcidr-no-resolve.mrs"
    interval: 86400
    proxy: "🚫 受限网站"
  scki-fused-022-ai-domain:
    type: http
    behavior: domain
    format: mrs
    url: "https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/mihomo/scki-fused-022-ai-domain.mrs"
    path: "./ruleset/scki-fused-022-ai-domain.mrs"
    interval: 86400
    proxy: "🚫 受限网站"
  scki-fused-022-ai-ipcidr-no-resolve:
    type: http
    behavior: ipcidr
    format: mrs
    url: "https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/mihomo/scki-fused-022-ai-ipcidr-no-resolve.mrs"
    path: "./ruleset/scki-fused-022-ai-ipcidr-no-resolve.mrs"
    interval: 86400
    proxy: "🚫 受限网站"
  scki-fused-022-ai-residual:
    type: http
    behavior: classical
    format: yaml
    url: "https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/mihomo/scki-fused-022-ai-residual.yaml"
    path: "./ruleset/scki-fused-022-ai-residual.yaml"
    interval: 86400
    proxy: "🚫 受限网站"
  scki-fused-023-crypto-domain:
    type: http
    behavior: domain
    format: mrs
    url: "https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/mihomo/scki-fused-023-crypto-domain.mrs"
    path: "./ruleset/scki-fused-023-crypto-domain.mrs"
    interval: 86400
    proxy: "🚫 受限网站"
  scki-fused-023-crypto-residual:
    type: http
    behavior: classical
    format: yaml
    url: "https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/mihomo/scki-fused-023-crypto-residual.yaml"
    path: "./ruleset/scki-fused-023-crypto-residual.yaml"
    interval: 86400
    proxy: "🚫 受限网站"
  scki-fused-024-payments-domain:
    type: http
    behavior: domain
    format: mrs
    url: "https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/mihomo/scki-fused-024-payments-domain.mrs"
    path: "./ruleset/scki-fused-024-payments-domain.mrs"
    interval: 86400
    proxy: "🚫 受限网站"
  scki-fused-024-payments-residual:
    type: http
    behavior: classical
    format: yaml
    url: "https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/mihomo/scki-fused-024-payments-residual.yaml"
    path: "./ruleset/scki-fused-024-payments-residual.yaml"
    interval: 86400
    proxy: "🚫 受限网站"
  scki-fused-025-microsoft-domain:
    type: http
    behavior: domain
    format: mrs
    url: "https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/mihomo/scki-fused-025-microsoft-domain.mrs"
    path: "./ruleset/scki-fused-025-microsoft-domain.mrs"
    interval: 86400
    proxy: "🚫 受限网站"
  scki-fused-026-intl-site-domain:
    type: http
    behavior: domain
    format: mrs
    url: "https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/mihomo/scki-fused-026-intl-site-domain.mrs"
    path: "./ruleset/scki-fused-026-intl-site-domain.mrs"
    interval: 86400
    proxy: "🚫 受限网站"
  scki-fused-027-direct-domain:
    type: http
    behavior: domain
    format: mrs
    url: "https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/mihomo/scki-fused-027-direct-domain.mrs"
    path: "./ruleset/scki-fused-027-direct-domain.mrs"
    interval: 86400
    proxy: "🚫 受限网站"
  scki-fused-028-im-domain:
    type: http
    behavior: domain
    format: mrs
    url: "https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/mihomo/scki-fused-028-im-domain.mrs"
    path: "./ruleset/scki-fused-028-im-domain.mrs"
    interval: 86400
    proxy: "🚫 受限网站"
  scki-fused-028-im-ipcidr:
    type: http
    behavior: ipcidr
    format: mrs
    url: "https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/mihomo/scki-fused-028-im-ipcidr.mrs"
    path: "./ruleset/scki-fused-028-im-ipcidr.mrs"
    interval: 86400
    proxy: "🚫 受限网站"
  scki-fused-028-im-ipcidr-no-resolve:
    type: http
    behavior: ipcidr
    format: mrs
    url: "https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/mihomo/scki-fused-028-im-ipcidr-no-resolve.mrs"
    path: "./ruleset/scki-fused-028-im-ipcidr-no-resolve.mrs"
    interval: 86400
    proxy: "🚫 受限网站"
  scki-fused-028-im-residual:
    type: http
    behavior: classical
    format: yaml
    url: "https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/mihomo/scki-fused-028-im-residual.yaml"
    path: "./ruleset/scki-fused-028-im-residual.yaml"
    interval: 86400
    proxy: "🚫 受限网站"
  scki-fused-029-social-domain:
    type: http
    behavior: domain
    format: mrs
    url: "https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/mihomo/scki-fused-029-social-domain.mrs"
    path: "./ruleset/scki-fused-029-social-domain.mrs"
    interval: 86400
    proxy: "🚫 受限网站"
  scki-fused-029-social-ipcidr:
    type: http
    behavior: ipcidr
    format: mrs
    url: "https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/mihomo/scki-fused-029-social-ipcidr.mrs"
    path: "./ruleset/scki-fused-029-social-ipcidr.mrs"
    interval: 86400
    proxy: "🚫 受限网站"
  scki-fused-029-social-ipcidr-no-resolve:
    type: http
    behavior: ipcidr
    format: mrs
    url: "https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/mihomo/scki-fused-029-social-ipcidr-no-resolve.mrs"
    path: "./ruleset/scki-fused-029-social-ipcidr-no-resolve.mrs"
    interval: 86400
    proxy: "🚫 受限网站"
  scki-fused-029-social-residual:
    type: http
    behavior: classical
    format: yaml
    url: "https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/mihomo/scki-fused-029-social-residual.yaml"
    path: "./ruleset/scki-fused-029-social-residual.yaml"
    interval: 86400
    proxy: "🚫 受限网站"
  scki-fused-030-cn-site-domain:
    type: http
    behavior: domain
    format: mrs
    url: "https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/mihomo/scki-fused-030-cn-site-domain.mrs"
    path: "./ruleset/scki-fused-030-cn-site-domain.mrs"
    interval: 86400
    proxy: "🚫 受限网站"
  scki-fused-031-social-domain:
    type: http
    behavior: domain
    format: mrs
    url: "https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/mihomo/scki-fused-031-social-domain.mrs"
    path: "./ruleset/scki-fused-031-social-domain.mrs"
    interval: 86400
    proxy: "🚫 受限网站"
  scki-fused-032-work-domain:
    type: http
    behavior: domain
    format: mrs
    url: "https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/mihomo/scki-fused-032-work-domain.mrs"
    path: "./ruleset/scki-fused-032-work-domain.mrs"
    interval: 86400
    proxy: "🚫 受限网站"
  scki-fused-032-work-ipcidr:
    type: http
    behavior: ipcidr
    format: mrs
    url: "https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/mihomo/scki-fused-032-work-ipcidr.mrs"
    path: "./ruleset/scki-fused-032-work-ipcidr.mrs"
    interval: 86400
    proxy: "🚫 受限网站"
  scki-fused-032-work-residual:
    type: http
    behavior: classical
    format: yaml
    url: "https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/mihomo/scki-fused-032-work-residual.yaml"
    path: "./ruleset/scki-fused-032-work-residual.yaml"
    interval: 86400
    proxy: "🚫 受限网站"
  scki-fused-033-direct-domain:
    type: http
    behavior: domain
    format: mrs
    url: "https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/mihomo/scki-fused-033-direct-domain.mrs"
    path: "./ruleset/scki-fused-033-direct-domain.mrs"
    interval: 86400
    proxy: "🚫 受限网站"
  scki-fused-034-cnmedia-domain:
    type: http
    behavior: domain
    format: mrs
    url: "https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/mihomo/scki-fused-034-cnmedia-domain.mrs"
    path: "./ruleset/scki-fused-034-cnmedia-domain.mrs"
    interval: 86400
    proxy: "🚫 受限网站"
  scki-fused-035-tiktok-domain:
    type: http
    behavior: domain
    format: mrs
    url: "https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/mihomo/scki-fused-035-tiktok-domain.mrs"
    path: "./ruleset/scki-fused-035-tiktok-domain.mrs"
    interval: 86400
    proxy: "🚫 受限网站"
  scki-fused-036-youtube-domain:
    type: http
    behavior: domain
    format: mrs
    url: "https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/mihomo/scki-fused-036-youtube-domain.mrs"
    path: "./ruleset/scki-fused-036-youtube-domain.mrs"
    interval: 86400
    proxy: "🚫 受限网站"
  scki-fused-037-netflix-domain:
    type: http
    behavior: domain
    format: mrs
    url: "https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/mihomo/scki-fused-037-netflix-domain.mrs"
    path: "./ruleset/scki-fused-037-netflix-domain.mrs"
    interval: 86400
    proxy: "🚫 受限网站"
  scki-fused-037-netflix-ipcidr-no-resolve:
    type: http
    behavior: ipcidr
    format: mrs
    url: "https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/mihomo/scki-fused-037-netflix-ipcidr-no-resolve.mrs"
    path: "./ruleset/scki-fused-037-netflix-ipcidr-no-resolve.mrs"
    interval: 86400
    proxy: "🚫 受限网站"
  scki-fused-038-disney-domain:
    type: http
    behavior: domain
    format: mrs
    url: "https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/mihomo/scki-fused-038-disney-domain.mrs"
    path: "./ruleset/scki-fused-038-disney-domain.mrs"
    interval: 86400
    proxy: "🚫 受限网站"
  scki-fused-038-disney-residual:
    type: http
    behavior: classical
    format: yaml
    url: "https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/mihomo/scki-fused-038-disney-residual.yaml"
    path: "./ruleset/scki-fused-038-disney-residual.yaml"
    interval: 86400
    proxy: "🚫 受限网站"
  scki-fused-039-hbo-max-domain:
    type: http
    behavior: domain
    format: mrs
    url: "https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/mihomo/scki-fused-039-hbo-max-domain.mrs"
    path: "./ruleset/scki-fused-039-hbo-max-domain.mrs"
    interval: 86400
    proxy: "🚫 受限网站"
  scki-fused-039-hbo-max-residual:
    type: http
    behavior: classical
    format: yaml
    url: "https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/mihomo/scki-fused-039-hbo-max-residual.yaml"
    path: "./ruleset/scki-fused-039-hbo-max-residual.yaml"
    interval: 86400
    proxy: "🚫 受限网站"
  scki-fused-040-hulu-domain:
    type: http
    behavior: domain
    format: mrs
    url: "https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/mihomo/scki-fused-040-hulu-domain.mrs"
    path: "./ruleset/scki-fused-040-hulu-domain.mrs"
    interval: 86400
    proxy: "🚫 受限网站"
  scki-fused-040-hulu-residual:
    type: http
    behavior: classical
    format: yaml
    url: "https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/mihomo/scki-fused-040-hulu-residual.yaml"
    path: "./ruleset/scki-fused-040-hulu-residual.yaml"
    interval: 86400
    proxy: "🚫 受限网站"
  scki-fused-041-prime-video-domain:
    type: http
    behavior: domain
    format: mrs
    url: "https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/mihomo/scki-fused-041-prime-video-domain.mrs"
    path: "./ruleset/scki-fused-041-prime-video-domain.mrs"
    interval: 86400
    proxy: "🚫 受限网站"
  scki-fused-041-prime-video-ipcidr:
    type: http
    behavior: ipcidr
    format: mrs
    url: "https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/mihomo/scki-fused-041-prime-video-ipcidr.mrs"
    path: "./ruleset/scki-fused-041-prime-video-ipcidr.mrs"
    interval: 86400
    proxy: "🚫 受限网站"
  scki-fused-041-prime-video-residual:
    type: http
    behavior: classical
    format: yaml
    url: "https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/mihomo/scki-fused-041-prime-video-residual.yaml"
    path: "./ruleset/scki-fused-041-prime-video-residual.yaml"
    interval: 86400
    proxy: "🚫 受限网站"
  scki-fused-042-music-domain:
    type: http
    behavior: domain
    format: mrs
    url: "https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/mihomo/scki-fused-042-music-domain.mrs"
    path: "./ruleset/scki-fused-042-music-domain.mrs"
    interval: 86400
    proxy: "🚫 受限网站"
  scki-fused-042-music-ipcidr:
    type: http
    behavior: ipcidr
    format: mrs
    url: "https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/mihomo/scki-fused-042-music-ipcidr.mrs"
    path: "./ruleset/scki-fused-042-music-ipcidr.mrs"
    interval: 86400
    proxy: "🚫 受限网站"
  scki-fused-043-stream-hk-domain:
    type: http
    behavior: domain
    format: mrs
    url: "https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/mihomo/scki-fused-043-stream-hk-domain.mrs"
    path: "./ruleset/scki-fused-043-stream-hk-domain.mrs"
    interval: 86400
    proxy: "🚫 受限网站"
  scki-fused-043-stream-hk-ipcidr-no-resolve:
    type: http
    behavior: ipcidr
    format: mrs
    url: "https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/mihomo/scki-fused-043-stream-hk-ipcidr-no-resolve.mrs"
    path: "./ruleset/scki-fused-043-stream-hk-ipcidr-no-resolve.mrs"
    interval: 86400
    proxy: "🚫 受限网站"
  scki-fused-043-stream-hk-residual:
    type: http
    behavior: classical
    format: yaml
    url: "https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/mihomo/scki-fused-043-stream-hk-residual.yaml"
    path: "./ruleset/scki-fused-043-stream-hk-residual.yaml"
    interval: 86400
    proxy: "🚫 受限网站"
  scki-fused-044-stream-tw-domain:
    type: http
    behavior: domain
    format: mrs
    url: "https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/mihomo/scki-fused-044-stream-tw-domain.mrs"
    path: "./ruleset/scki-fused-044-stream-tw-domain.mrs"
    interval: 86400
    proxy: "🚫 受限网站"
  scki-fused-044-stream-tw-residual:
    type: http
    behavior: classical
    format: yaml
    url: "https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/mihomo/scki-fused-044-stream-tw-residual.yaml"
    path: "./ruleset/scki-fused-044-stream-tw-residual.yaml"
    interval: 86400
    proxy: "🚫 受限网站"
  scki-fused-045-stream-jpkr-domain:
    type: http
    behavior: domain
    format: mrs
    url: "https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/mihomo/scki-fused-045-stream-jpkr-domain.mrs"
    path: "./ruleset/scki-fused-045-stream-jpkr-domain.mrs"
    interval: 86400
    proxy: "🚫 受限网站"
  scki-fused-045-stream-jpkr-ipcidr:
    type: http
    behavior: ipcidr
    format: mrs
    url: "https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/mihomo/scki-fused-045-stream-jpkr-ipcidr.mrs"
    path: "./ruleset/scki-fused-045-stream-jpkr-ipcidr.mrs"
    interval: 86400
    proxy: "🚫 受限网站"
  scki-fused-045-stream-jpkr-residual:
    type: http
    behavior: classical
    format: yaml
    url: "https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/mihomo/scki-fused-045-stream-jpkr-residual.yaml"
    path: "./ruleset/scki-fused-045-stream-jpkr-residual.yaml"
    interval: 86400
    proxy: "🚫 受限网站"
  scki-fused-046-stream-eu-domain:
    type: http
    behavior: domain
    format: mrs
    url: "https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/mihomo/scki-fused-046-stream-eu-domain.mrs"
    path: "./ruleset/scki-fused-046-stream-eu-domain.mrs"
    interval: 86400
    proxy: "🚫 受限网站"
  scki-fused-046-stream-eu-residual:
    type: http
    behavior: classical
    format: yaml
    url: "https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/mihomo/scki-fused-046-stream-eu-residual.yaml"
    path: "./ruleset/scki-fused-046-stream-eu-residual.yaml"
    interval: 86400
    proxy: "🚫 受限网站"
  scki-fused-047-stream-other-domain:
    type: http
    behavior: domain
    format: mrs
    url: "https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/mihomo/scki-fused-047-stream-other-domain.mrs"
    path: "./ruleset/scki-fused-047-stream-other-domain.mrs"
    interval: 86400
    proxy: "🚫 受限网站"
  scki-fused-047-stream-other-ipcidr:
    type: http
    behavior: ipcidr
    format: mrs
    url: "https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/mihomo/scki-fused-047-stream-other-ipcidr.mrs"
    path: "./ruleset/scki-fused-047-stream-other-ipcidr.mrs"
    interval: 86400
    proxy: "🚫 受限网站"
  scki-fused-047-stream-other-residual:
    type: http
    behavior: classical
    format: yaml
    url: "https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/mihomo/scki-fused-047-stream-other-residual.yaml"
    path: "./ruleset/scki-fused-047-stream-other-residual.yaml"
    interval: 86400
    proxy: "🚫 受限网站"
  scki-fused-048-tools-domain:
    type: http
    behavior: domain
    format: mrs
    url: "https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/mihomo/scki-fused-048-tools-domain.mrs"
    path: "./ruleset/scki-fused-048-tools-domain.mrs"
    interval: 86400
    proxy: "🚫 受限网站"
  scki-fused-049-google-domain:
    type: http
    behavior: domain
    format: mrs
    url: "https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/mihomo/scki-fused-049-google-domain.mrs"
    path: "./ruleset/scki-fused-049-google-domain.mrs"
    interval: 86400
    proxy: "🚫 受限网站"
  scki-fused-050-tools-domain:
    type: http
    behavior: domain
    format: mrs
    url: "https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/mihomo/scki-fused-050-tools-domain.mrs"
    path: "./ruleset/scki-fused-050-tools-domain.mrs"
    interval: 86400
    proxy: "🚫 受限网站"
  scki-fused-050-tools-ipcidr:
    type: http
    behavior: ipcidr
    format: mrs
    url: "https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/mihomo/scki-fused-050-tools-ipcidr.mrs"
    path: "./ruleset/scki-fused-050-tools-ipcidr.mrs"
    interval: 86400
    proxy: "🚫 受限网站"
  scki-fused-050-tools-residual:
    type: http
    behavior: classical
    format: yaml
    url: "https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/mihomo/scki-fused-050-tools-residual.yaml"
    path: "./ruleset/scki-fused-050-tools-residual.yaml"
    interval: 86400
    proxy: "🚫 受限网站"
  scki-fused-051-microsoft-domain:
    type: http
    behavior: domain
    format: mrs
    url: "https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/mihomo/scki-fused-051-microsoft-domain.mrs"
    path: "./ruleset/scki-fused-051-microsoft-domain.mrs"
    interval: 86400
    proxy: "🚫 受限网站"
  scki-fused-051-microsoft-residual:
    type: http
    behavior: classical
    format: yaml
    url: "https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/mihomo/scki-fused-051-microsoft-residual.yaml"
    path: "./ruleset/scki-fused-051-microsoft-residual.yaml"
    interval: 86400
    proxy: "🚫 受限网站"
  scki-fused-052-apple-domain:
    type: http
    behavior: domain
    format: mrs
    url: "https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/mihomo/scki-fused-052-apple-domain.mrs"
    path: "./ruleset/scki-fused-052-apple-domain.mrs"
    interval: 86400
    proxy: "🚫 受限网站"
  scki-fused-052-apple-ipcidr:
    type: http
    behavior: ipcidr
    format: mrs
    url: "https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/mihomo/scki-fused-052-apple-ipcidr.mrs"
    path: "./ruleset/scki-fused-052-apple-ipcidr.mrs"
    interval: 86400
    proxy: "🚫 受限网站"
  scki-fused-052-apple-residual:
    type: http
    behavior: classical
    format: yaml
    url: "https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/mihomo/scki-fused-052-apple-residual.yaml"
    path: "./ruleset/scki-fused-052-apple-residual.yaml"
    interval: 86400
    proxy: "🚫 受限网站"
  scki-fused-053-download-domain:
    type: http
    behavior: domain
    format: mrs
    url: "https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/mihomo/scki-fused-053-download-domain.mrs"
    path: "./ruleset/scki-fused-053-download-domain.mrs"
    interval: 86400
    proxy: "🚫 受限网站"
  scki-fused-053-download-ipcidr:
    type: http
    behavior: ipcidr
    format: mrs
    url: "https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/mihomo/scki-fused-053-download-ipcidr.mrs"
    path: "./ruleset/scki-fused-053-download-ipcidr.mrs"
    interval: 86400
    proxy: "🚫 受限网站"
  scki-fused-053-download-residual:
    type: http
    behavior: classical
    format: yaml
    url: "https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/mihomo/scki-fused-053-download-residual.yaml"
    path: "./ruleset/scki-fused-053-download-residual.yaml"
    interval: 86400
    proxy: "🚫 受限网站"
  scki-fused-054-tracker-domain:
    type: http
    behavior: domain
    format: mrs
    url: "https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/mihomo/scki-fused-054-tracker-domain.mrs"
    path: "./ruleset/scki-fused-054-tracker-domain.mrs"
    interval: 86400
    proxy: "🚫 受限网站"
  scki-fused-054-tracker-ipcidr:
    type: http
    behavior: ipcidr
    format: mrs
    url: "https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/mihomo/scki-fused-054-tracker-ipcidr.mrs"
    path: "./ruleset/scki-fused-054-tracker-ipcidr.mrs"
    interval: 86400
    proxy: "🚫 受限网站"
  scki-fused-054-tracker-residual:
    type: http
    behavior: classical
    format: yaml
    url: "https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/mihomo/scki-fused-054-tracker-residual.yaml"
    path: "./ruleset/scki-fused-054-tracker-residual.yaml"
    interval: 86400
    proxy: "🚫 受限网站"
  scki-fused-055-gfw-domain:
    type: http
    behavior: domain
    format: mrs
    url: "https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/mihomo/scki-fused-055-gfw-domain.mrs"
    path: "./ruleset/scki-fused-055-gfw-domain.mrs"
    interval: 86400
    proxy: "🚫 受限网站"
  scki-fused-055-gfw-ipcidr-no-resolve:
    type: http
    behavior: ipcidr
    format: mrs
    url: "https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/mihomo/scki-fused-055-gfw-ipcidr-no-resolve.mrs"
    path: "./ruleset/scki-fused-055-gfw-ipcidr-no-resolve.mrs"
    interval: 86400
    proxy: "🚫 受限网站"
  scki-fused-055-gfw-residual:
    type: http
    behavior: classical
    format: yaml
    url: "https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/mihomo/scki-fused-055-gfw-residual.yaml"
    path: "./ruleset/scki-fused-055-gfw-residual.yaml"
    interval: 86400
    proxy: "🚫 受限网站"
  scki-fused-056-game-cn-domain:
    type: http
    behavior: domain
    format: mrs
    url: "https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/mihomo/scki-fused-056-game-cn-domain.mrs"
    path: "./ruleset/scki-fused-056-game-cn-domain.mrs"
    interval: 86400
    proxy: "🚫 受限网站"
  scki-fused-057-game-intl-domain:
    type: http
    behavior: domain
    format: mrs
    url: "https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/mihomo/scki-fused-057-game-intl-domain.mrs"
    path: "./ruleset/scki-fused-057-game-intl-domain.mrs"
    interval: 86400
    proxy: "🚫 受限网站"
  scki-fused-057-game-intl-ipcidr:
    type: http
    behavior: ipcidr
    format: mrs
    url: "https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/mihomo/scki-fused-057-game-intl-ipcidr.mrs"
    path: "./ruleset/scki-fused-057-game-intl-ipcidr.mrs"
    interval: 86400
    proxy: "🚫 受限网站"
  scki-fused-057-game-intl-residual:
    type: http
    behavior: classical
    format: yaml
    url: "https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/mihomo/scki-fused-057-game-intl-residual.yaml"
    path: "./ruleset/scki-fused-057-game-intl-residual.yaml"
    interval: 86400
    proxy: "🚫 受限网站"
  scki-fused-058-intl-site-domain:
    type: http
    behavior: domain
    format: mrs
    url: "https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/mihomo/scki-fused-058-intl-site-domain.mrs"
    path: "./ruleset/scki-fused-058-intl-site-domain.mrs"
    interval: 86400
    proxy: "🚫 受限网站"
  scki-fused-058-intl-site-ipcidr:
    type: http
    behavior: ipcidr
    format: mrs
    url: "https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/mihomo/scki-fused-058-intl-site-ipcidr.mrs"
    path: "./ruleset/scki-fused-058-intl-site-ipcidr.mrs"
    interval: 86400
    proxy: "🚫 受限网站"
  scki-fused-058-intl-site-residual:
    type: http
    behavior: classical
    format: yaml
    url: "https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/mihomo/scki-fused-058-intl-site-residual.yaml"
    path: "./ruleset/scki-fused-058-intl-site-residual.yaml"
    interval: 86400
    proxy: "🚫 受限网站"
  scki-fused-059-payments-domain:
    type: http
    behavior: domain
    format: mrs
    url: "https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/mihomo/scki-fused-059-payments-domain.mrs"
    path: "./ruleset/scki-fused-059-payments-domain.mrs"
    interval: 86400
    proxy: "🚫 受限网站"
  scki-fused-060-cnmedia-domain:
    type: http
    behavior: domain
    format: mrs
    url: "https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/mihomo/scki-fused-060-cnmedia-domain.mrs"
    path: "./ruleset/scki-fused-060-cnmedia-domain.mrs"
    interval: 86400
    proxy: "🚫 受限网站"
  scki-fused-060-cnmedia-ipcidr:
    type: http
    behavior: ipcidr
    format: mrs
    url: "https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/mihomo/scki-fused-060-cnmedia-ipcidr.mrs"
    path: "./ruleset/scki-fused-060-cnmedia-ipcidr.mrs"
    interval: 86400
    proxy: "🚫 受限网站"
  scki-fused-060-cnmedia-residual:
    type: http
    behavior: classical
    format: yaml
    url: "https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/mihomo/scki-fused-060-cnmedia-residual.yaml"
    path: "./ruleset/scki-fused-060-cnmedia-residual.yaml"
    interval: 86400
    proxy: "🚫 受限网站"
  scki-fused-061-cn-site-domain:
    type: http
    behavior: domain
    format: mrs
    url: "https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/mihomo/scki-fused-061-cn-site-domain.mrs"
    path: "./ruleset/scki-fused-061-cn-site-domain.mrs"
    interval: 86400
    proxy: "🚫 受限网站"
  scki-fused-061-cn-site-ipcidr-no-resolve:
    type: http
    behavior: ipcidr
    format: mrs
    url: "https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/mihomo/scki-fused-061-cn-site-ipcidr-no-resolve.mrs"
    path: "./ruleset/scki-fused-061-cn-site-ipcidr-no-resolve.mrs"
    interval: 86400
    proxy: "🚫 受限网站"
  scki-fused-062-direct-domain:
    type: http
    behavior: domain
    format: mrs
    url: "https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/mihomo/scki-fused-062-direct-domain.mrs"
    path: "./ruleset/scki-fused-062-direct-domain.mrs"
    interval: 86400
    proxy: "🚫 受限网站"
  scki-fused-063-cn-site-domain:
    type: http
    behavior: domain
    format: mrs
    url: "https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/mihomo/scki-fused-063-cn-site-domain.mrs"
    path: "./ruleset/scki-fused-063-cn-site-domain.mrs"
    interval: 86400
    proxy: "🚫 受限网站"
  scki-fused-063-cn-site-residual:
    type: http
    behavior: classical
    format: yaml
    url: "https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/mihomo/scki-fused-063-cn-site-residual.yaml"
    path: "./ruleset/scki-fused-063-cn-site-residual.yaml"
    interval: 86400
    proxy: "🚫 受限网站"
  scki-fused-064-intl-site-domain:
    type: http
    behavior: domain
    format: mrs
    url: "https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/mihomo/scki-fused-064-intl-site-domain.mrs"
    path: "./ruleset/scki-fused-064-intl-site-domain.mrs"
    interval: 86400
    proxy: "🚫 受限网站"
  scki-fused-064-intl-site-ipcidr:
    type: http
    behavior: ipcidr
    format: mrs
    url: "https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/mihomo/scki-fused-064-intl-site-ipcidr.mrs"
    path: "./ruleset/scki-fused-064-intl-site-ipcidr.mrs"
    interval: 86400
    proxy: "🚫 受限网站"
  scki-fused-064-intl-site-ipcidr-no-resolve:
    type: http
    behavior: ipcidr
    format: mrs
    url: "https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/mihomo/scki-fused-064-intl-site-ipcidr-no-resolve.mrs"
    path: "./ruleset/scki-fused-064-intl-site-ipcidr-no-resolve.mrs"
    interval: 86400
    proxy: "🚫 受限网站"
  scki-fused-064-intl-site-residual:
    type: http
    behavior: classical
    format: yaml
    url: "https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/mihomo/scki-fused-064-intl-site-residual.yaml"
    path: "./ruleset/scki-fused-064-intl-site-residual.yaml"
    interval: 86400
    proxy: "🚫 受限网站"
  scki-fused-065-im-residual:
    type: http
    behavior: classical
    format: yaml
    url: "https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/mihomo/scki-fused-065-im-residual.yaml"
    path: "./ruleset/scki-fused-065-im-residual.yaml"
    interval: 86400
    proxy: "🚫 受限网站"
  scki-fused-066-netflix-residual:
    type: http
    behavior: classical
    format: yaml
    url: "https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/mihomo/scki-fused-066-netflix-residual.yaml"
    path: "./ruleset/scki-fused-066-netflix-residual.yaml"
    interval: 86400
    proxy: "🚫 受限网站"
  scki-fused-067-social-residual:
    type: http
    behavior: classical
    format: yaml
    url: "https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/mihomo/scki-fused-067-social-residual.yaml"
    path: "./ruleset/scki-fused-067-social-residual.yaml"
    interval: 86400
    proxy: "🚫 受限网站"
  scki-fused-068-google-residual:
    type: http
    behavior: classical
    format: yaml
    url: "https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/mihomo/scki-fused-068-google-residual.yaml"
    path: "./ruleset/scki-fused-068-google-residual.yaml"
    interval: 86400
    proxy: "🚫 受限网站"
rules:
- "RULE-SET,scki-fused-001-direct-domain,DIRECT"
- "RULE-SET,scki-fused-002-intl-site-domain,🌐 国外网站"
- "RULE-SET,scki-fused-003-payments-domain,🏦 金融支付"
- "RULE-SET,scki-fused-004-ai-domain,🤖 AI 服务"
- "RULE-SET,scki-fused-005-cnmedia-domain,📺 国内流媒体"
- "RULE-SET,scki-fused-006-ad-domain,🛑 广告拦截"
- "RULE-SET,scki-fused-006-ad-ipcidr,🛑 广告拦截"
- "RULE-SET,scki-fused-006-ad-residual,🛑 广告拦截"
- "RULE-SET,scki-fused-007-cn-site-domain,🏠 国内网站"
- "AND,((DST-PORT,443),(NETWORK,UDP),(GEOSITE,youtube)),📹 YouTube"
- "AND,((DST-PORT,443),(NETWORK,UDP),(GEOSITE,google)),🔍 Google 服务"
- "AND,((DST-PORT,443),(NETWORK,UDP),(GEOSITE,microsoft)),Ⓜ️ 微软服务"
- "AND,((DST-PORT,443),(NETWORK,UDP),(GEOSITE,apple)),🍎 苹果服务"
- "AND,((DST-PORT,443),(NETWORK,UDP),(NOT,((GEOSITE,cn)))),REJECT"
- "DST-PORT,7680,REJECT"
- "RULE-SET,scki-fused-008-direct-domain,DIRECT"
- "RULE-SET,scki-fused-008-direct-ipcidr-no-resolve,DIRECT,no-resolve"
- "RULE-SET,scki-fused-008-direct-residual,DIRECT"
- "RULE-SET,scki-fused-009-work-residual,🧑‍💼 会议协作"
- "DST-PORT,26880,DIRECT"
- "DST-PORT,6540,DIRECT"
- "DST-PORT,33068,DIRECT"
- "DST-PORT,123,DIRECT"
- "DST-PORT,3478,DIRECT"
- "DST-PORT,3479,DIRECT"
- "DST-PORT,5349,DIRECT"
- "DST-PORT,19302,DIRECT"
- "DST-PORT,19305,DIRECT"
- "DST-PORT,19307,DIRECT"
- "RULE-SET,scki-fused-010-crypto-domain,💰 加密货币"
- "RULE-SET,scki-fused-011-gfw-domain,🚫 受限网站"
- "RULE-SET,scki-fused-012-youtube-domain,📹 YouTube"
- "RULE-SET,scki-fused-013-cn-site-domain,🏠 国内网站"
- "RULE-SET,scki-fused-014-ai-domain,🤖 AI 服务"
- "RULE-SET,scki-fused-014-ai-residual,🤖 AI 服务"
- "RULE-SET,scki-fused-015-work-domain,🧑‍💼 会议协作"
- "RULE-SET,scki-fused-016-ai-domain,🤖 AI 服务"
- "RULE-SET,scki-fused-016-ai-ipcidr,🤖 AI 服务"
- "RULE-SET,scki-fused-016-ai-residual,🤖 AI 服务"
- "RULE-SET,scki-fused-017-intl-site-domain,🌐 国外网站"
- "RULE-SET,scki-fused-018-im-domain,💬 即时通讯"
- "RULE-SET,scki-fused-019-work-domain,🧑‍💼 会议协作"
- "RULE-SET,scki-fused-020-download-domain,📥 下载更新"
- "RULE-SET,scki-fused-020-download-ipcidr,📥 下载更新"
- "RULE-SET,scki-fused-021-google-domain,🔍 Google 服务"
- "RULE-SET,scki-fused-021-google-ipcidr-no-resolve,🔍 Google 服务,no-resolve"
- "RULE-SET,scki-fused-022-ai-domain,🤖 AI 服务"
- "RULE-SET,scki-fused-022-ai-ipcidr-no-resolve,🤖 AI 服务,no-resolve"
- "RULE-SET,scki-fused-022-ai-residual,🤖 AI 服务"
- "RULE-SET,scki-fused-023-crypto-domain,💰 加密货币"
- "RULE-SET,scki-fused-023-crypto-residual,💰 加密货币"
- "RULE-SET,scki-fused-024-payments-domain,🏦 金融支付"
- "RULE-SET,scki-fused-024-payments-residual,🏦 金融支付"
- "RULE-SET,scki-fused-025-microsoft-domain,Ⓜ️ 微软服务"
- "RULE-SET,scki-fused-026-intl-site-domain,🌐 国外网站"
- "RULE-SET,scki-fused-027-direct-domain,DIRECT"
- "RULE-SET,scki-fused-028-im-domain,💬 即时通讯"
- "RULE-SET,scki-fused-028-im-ipcidr,💬 即时通讯"
- "RULE-SET,scki-fused-028-im-ipcidr-no-resolve,💬 即时通讯,no-resolve"
- "RULE-SET,scki-fused-028-im-residual,💬 即时通讯"
- "RULE-SET,scki-fused-029-social-domain,📱 社交媒体"
- "RULE-SET,scki-fused-029-social-ipcidr,📱 社交媒体"
- "RULE-SET,scki-fused-029-social-ipcidr-no-resolve,📱 社交媒体,no-resolve"
- "RULE-SET,scki-fused-029-social-residual,📱 社交媒体"
- "RULE-SET,scki-fused-030-cn-site-domain,🏠 国内网站"
- "RULE-SET,scki-fused-031-social-domain,📱 社交媒体"
- "RULE-SET,scki-fused-032-work-domain,🧑‍💼 会议协作"
- "RULE-SET,scki-fused-032-work-ipcidr,🧑‍💼 会议协作"
- "RULE-SET,scki-fused-032-work-residual,🧑‍💼 会议协作"
- "RULE-SET,scki-fused-033-direct-domain,DIRECT"
- "RULE-SET,scki-fused-034-cnmedia-domain,📺 国内流媒体"
- "RULE-SET,scki-fused-035-tiktok-domain,🎵 TikTok"
- "RULE-SET,scki-fused-036-youtube-domain,📹 YouTube"
- "RULE-SET,scki-fused-037-netflix-domain,🎥 Netflix"
- "RULE-SET,scki-fused-037-netflix-ipcidr-no-resolve,🎥 Netflix,no-resolve"
- "RULE-SET,scki-fused-038-disney-domain,🎬 Disney+"
- "RULE-SET,scki-fused-038-disney-residual,🎬 Disney+"
- "RULE-SET,scki-fused-039-hbo-max-domain,📡 HBO/Max"
- "RULE-SET,scki-fused-039-hbo-max-residual,📡 HBO/Max"
- "RULE-SET,scki-fused-040-hulu-domain,📺 Hulu"
- "RULE-SET,scki-fused-040-hulu-residual,📺 Hulu"
- "RULE-SET,scki-fused-041-prime-video-domain,🎬 Prime Video"
- "RULE-SET,scki-fused-041-prime-video-ipcidr,🎬 Prime Video"
- "RULE-SET,scki-fused-041-prime-video-residual,🎬 Prime Video"
- "RULE-SET,scki-fused-042-music-domain,🎵 音乐流媒体"
- "RULE-SET,scki-fused-042-music-ipcidr,🎵 音乐流媒体"
- "RULE-SET,scki-fused-043-stream-hk-domain,🇭🇰 香港流媒体"
- "RULE-SET,scki-fused-043-stream-hk-ipcidr-no-resolve,🇭🇰 香港流媒体,no-resolve"
- "RULE-SET,scki-fused-043-stream-hk-residual,🇭🇰 香港流媒体"
- "RULE-SET,scki-fused-044-stream-tw-domain,🇹🇼 台湾流媒体"
- "RULE-SET,scki-fused-044-stream-tw-residual,🇹🇼 台湾流媒体"
- "RULE-SET,scki-fused-045-stream-jpkr-domain,🇯🇵 日韩流媒体"
- "RULE-SET,scki-fused-045-stream-jpkr-ipcidr,🇯🇵 日韩流媒体"
- "RULE-SET,scki-fused-045-stream-jpkr-residual,🇯🇵 日韩流媒体"
- "RULE-SET,scki-fused-046-stream-eu-domain,🇪🇺 欧洲流媒体"
- "RULE-SET,scki-fused-046-stream-eu-residual,🇪🇺 欧洲流媒体"
- "RULE-SET,scki-fused-047-stream-other-domain,🌐 其他国外流媒体"
- "RULE-SET,scki-fused-047-stream-other-ipcidr,🌐 其他国外流媒体"
- "RULE-SET,scki-fused-047-stream-other-residual,🌐 其他国外流媒体"
- "RULE-SET,scki-fused-048-tools-domain,🔧 工具与服务"
- "RULE-SET,scki-fused-049-google-domain,🔍 Google 服务"
- "RULE-SET,scki-fused-050-tools-domain,🔧 工具与服务"
- "RULE-SET,scki-fused-050-tools-ipcidr,🔧 工具与服务"
- "RULE-SET,scki-fused-050-tools-residual,🔧 工具与服务"
- "RULE-SET,scki-fused-051-microsoft-domain,Ⓜ️ 微软服务"
- "RULE-SET,scki-fused-051-microsoft-residual,Ⓜ️ 微软服务"
- "RULE-SET,scki-fused-052-apple-domain,🍎 苹果服务"
- "RULE-SET,scki-fused-052-apple-ipcidr,🍎 苹果服务"
- "RULE-SET,scki-fused-052-apple-residual,🍎 苹果服务"
- "RULE-SET,scki-fused-053-download-domain,📥 下载更新"
- "RULE-SET,scki-fused-053-download-ipcidr,📥 下载更新"
- "RULE-SET,scki-fused-053-download-residual,📥 下载更新"
- "RULE-SET,scki-fused-054-tracker-domain,🛰️ BT/PT Tracker"
- "RULE-SET,scki-fused-054-tracker-ipcidr,🛰️ BT/PT Tracker"
- "RULE-SET,scki-fused-054-tracker-residual,🛰️ BT/PT Tracker"
- "RULE-SET,scki-fused-055-gfw-domain,🚫 受限网站"
- "RULE-SET,scki-fused-055-gfw-ipcidr-no-resolve,🚫 受限网站,no-resolve"
- "RULE-SET,scki-fused-055-gfw-residual,🚫 受限网站"
- "RULE-SET,scki-fused-056-game-cn-domain,🕹️ 国内游戏"
- "RULE-SET,scki-fused-057-game-intl-domain,🎮 国外游戏"
- "RULE-SET,scki-fused-057-game-intl-ipcidr,🎮 国外游戏"
- "RULE-SET,scki-fused-057-game-intl-residual,🎮 国外游戏"
- "RULE-SET,scki-fused-058-intl-site-domain,🌐 国外网站"
- "RULE-SET,scki-fused-058-intl-site-ipcidr,🌐 国外网站"
- "RULE-SET,scki-fused-058-intl-site-residual,🌐 国外网站"
- "RULE-SET,scki-fused-059-payments-domain,🏦 金融支付"
- "RULE-SET,scki-fused-060-cnmedia-domain,📺 国内流媒体"
- "RULE-SET,scki-fused-060-cnmedia-ipcidr,📺 国内流媒体"
- "RULE-SET,scki-fused-060-cnmedia-residual,📺 国内流媒体"
- "RULE-SET,scki-fused-061-cn-site-domain,🏠 国内网站"
- "RULE-SET,scki-fused-061-cn-site-ipcidr-no-resolve,🏠 国内网站,no-resolve"
- "RULE-SET,scki-fused-062-direct-domain,DIRECT"
- "RULE-SET,scki-fused-063-cn-site-domain,🏠 国内网站"
- "RULE-SET,scki-fused-063-cn-site-residual,🏠 国内网站"
- "RULE-SET,scki-fused-064-intl-site-domain,🌐 国外网站"
- "RULE-SET,scki-fused-064-intl-site-ipcidr,🌐 国外网站"
- "RULE-SET,scki-fused-064-intl-site-ipcidr-no-resolve,🌐 国外网站,no-resolve"
- "RULE-SET,scki-fused-064-intl-site-residual,🌐 国外网站"
- "RULE-SET,scki-fused-065-im-residual,💬 即时通讯"
- "RULE-SET,scki-fused-066-netflix-residual,🎥 Netflix"
- "RULE-SET,scki-fused-067-social-residual,📱 社交媒体"
- "RULE-SET,scki-fused-068-google-residual,🔍 Google 服务"
- "MATCH,🐟 漏网之鱼"

OVERRIDE_EOF


# ============================================================================
# Ruby Script — 节点过滤、区域分类、url-test 组生成、TLS 指纹注入
# ★ 核心架构：22 个区域组（11 全部 + 11 家宽）type: url-test + include-all-proxies/explicit proxies ★
# ============================================================================
cat > "$RUBY_SCRIPT" << 'RUBY_EOF'
#!/usr/bin/env ruby
# encoding: utf-8
require 'yaml'
require 'digest'

VERSION = "v6.0.7-oc-normal.1"

STATUS_LOG = ARGV[2]
File.open(STATUS_LOG, 'w') { |f| f.puts "[#{VERSION}] start" }
def status(msg); File.open(STATUS_LOG, 'a') { |f| f.puts(msg) }; end

config_path   = ARGV[0]
override_path = ARGV[1]

config   = YAML.load_file(config_path, permitted_classes: [Symbol], aliases: true)
override = YAML.load_file(override_path, permitted_classes: [Symbol], aliases: true)

# ---------------------------------------------------------------
# Phase 1a: 过滤节点（仅去信息节点；保留倍率节点）+ 家宽识别
# ---------------------------------------------------------------
INFO_PATTERNS = [
  /官网/, /官方/, /网站/, /群组/, /TG|telegram/i,
  /到期/, /剩余/, /流量/, /重置/, /过期/, /recharge/i, /expire/i,
  /订阅/, /机场/, /客服/, /网址/, /邀请/, /注册/,
  /公告/, /通知/, /公众号/, /永久/, /套餐/, /续费/,
  /dns|DNS/, /IPLC|iplc/, /中转/,
  # v5.4.20 #6 借鉴 Proxy-override：补充 junk 关键词（中文子串 + 英文 \b 词边界防误伤 Signal 等；/注册/ 已存在）
  /免费/, /试用/, /应急/, /\bSign\b/i, /\bLogin\b/i, /\bRegister\b/i, /\bHelp\b/i, /\bFAQ\b/i,
  /^剩余|^到期|^流量|^官网/
]
RESIDENTIAL_PATTERNS = [
  /家宽|家庭宽带|家庭住宅|住宅宽带|住宅|宽带|专线/,
  /\bresi(?:dential)?\b/i,
  /\bhome(?:\s|-|_)?ip\b/i,
  /\bhome(?:\s|-|_)?broadband\b/i,
  /\bhome\b/i,
  /\bbroadband\b/i,
  /\bisp\b/i,
  /\biplc\b/i,
  /\biepl\b/i,
]

raw_proxies = (config["proxies"] || []).dup
filtered_proxies = raw_proxies.reject do |p|
  name = p["name"].to_s
  INFO_PATTERNS.any? { |pat| name.match?(pat) }
end
is_residential = ->(name) { RESIDENTIAL_PATTERNS.any? { |pat| name.match?(pat) } }
status "[filter] raw=#{raw_proxies.size} filtered=#{filtered_proxies.size} home=#{filtered_proxies.count { |p| is_residential.call(p['name'].to_s) }} removed=#{raw_proxies.size - filtered_proxies.size}"

# ---------------------------------------------------------------
# Phase 1b: 区域分类
# ---------------------------------------------------------------
REGIONS = {
  "HK"  => /香港|港|\bHK\b|HKG|Hong\s?Kong|🇭🇰/i,
  "TW"  => /台湾|台灣|\bTW\b|TWN|Taiwan|🇹🇼/i,
  # v5.4.26 FIX#CN-APAC: 加入 CN 区域（对齐 Clash Party JS 基线 c.CN → apacNodes）
  "CN"  => /中国|大陸|大陆|国内|回国|\bCN\b|CHN|China|mainland/i,
  "JP"  => /日本|\bJP\b|JPN|Japan|🇯🇵|Tokyo|Osaka/i,
  # v5.2.6-oc-normal.1 FIX#24-P0: 补 KOR（KOR 不是 KR 的子串，原始 /KR/ 无法匹配 "KOR 01"）
  #   HK/TW/JP/KR/SG 使用 \b 防误匹配，显式补充 alpha-3 码 HKG/TWN/JPN/KOR/SGP
  #   FIX#KR-WB: KR 补 \bKR\b（裸 /KR/ 在 /i 下误匹配 Ukraine/Krakow/Kraken 等含 kr 串）
  "KR"  => /韩国|韓國|\bKR\b|KOR|Korea|Korean|🇰🇷|Seoul/i,
  "SG"  => /新加坡|\bSG\b|SGP|Singapore|🇸🇬/i,
  "US"  => /美国|美國|\bUS\b|USA|United\s?States|America|🇺🇸|Los\s?Angeles|New\s?York|Seattle|Silicon|San\s?Jose/i,
  "UK"  => /英国|英國|UK\b|GB\b|Britain|London|🇬🇧/i,
  "DE"  => /德国|德國|DE\b|Germany|Frankfurt|🇩🇪/i,
  "FR"  => /法国|法國|FR\b|France|Paris|🇫🇷/i,
  "NL"  => /荷兰|荷蘭|NL\b|Netherlands|Amsterdam|🇳🇱/i,
  "CH"  => /瑞士|CH\b|Switzerland|🇨🇭/i,
  "IT"  => /意大利|義大利|IT\b|Italy|Milan|Rome|🇮🇹|FCO|MXP/i,
  "ES"  => /西班牙|ES\b|Spain|Madrid|Barcelona|🇪🇸|MAD|BCN/i,
  "PT"  => /葡萄牙|PT\b|Portugal|Lisbon|🇵🇹/i,
  "GR"  => /希腊|希臘|GR\b|Greece|Athens|🇬🇷/i,
  "AT"  => /奥地利|奧地利|AT\b|Austria|Vienna|🇦🇹|VIE/i,
  "BE"  => /比利时|比利時|BE\b|Belgium|Brussels|🇧🇪/i,
  "IE"  => /爱尔兰|愛爾蘭|IE\b|Ireland|Dublin|🇮🇪/i,
  "DK"  => /丹麦|丹麥|DK\b|Denmark|Copenhagen|🇩🇰/i,
  "SE"  => /瑞典|SE\b|Sweden|Stockholm|🇸🇪/i,
  "FI"  => /芬兰|芬蘭|FI\b|Finland|Helsinki|🇫🇮/i,
  "NO"  => /挪威|NO\b|Norway|Oslo|🇳🇴/i,
  "PL"  => /波兰|波蘭|PL\b|Poland|Warsaw|🇵🇱|WAW/i,
  "CZ"  => /捷克|CZ\b|Czech|Prague|🇨🇿/i,
  "RO"  => /罗马尼亚|羅馬尼亞|RO\b|Romania|Bucharest|🇷🇴/i,
  "HU"  => /匈牙利|HU\b|Hungary|Budapest|🇭🇺/i,
  "RU"  => /俄罗斯|俄羅斯|RU\b|Russia|Moscow|🇷🇺/i,
  "CA"  => /加拿大|CA\b|Canada|🇨🇦|Toronto|Vancouver/i,
  "MX"  => /墨西哥|MX\b|Mexico|🇲🇽/i,
  "BR"  => /巴西|BR\b|Brazil|🇧🇷|Sao\s?Paulo/i,
  "AR"  => /阿根廷|AR\b|Argentina|🇦🇷/i,
  "ZA"  => /南非|ZA\b|South\s?Africa|🇿🇦/i,
  "EG"  => /埃及|EG\b|Egypt|🇪🇬/i,
  "NG"  => /尼日利亚|NG\b|Nigeria|🇳🇬/i,
  "IN"  => /印度|IN\b|India|Mumbai|🇮🇳/i,
  "TH"  => /泰国|泰國|TH\b|Thailand|Bangkok|🇹🇭/i,
  "VN"  => /越南|VN\b|Vietnam|🇻🇳/i,
  "MY"  => /马来|馬來|MY\b|Malaysia|🇲🇾|Kuala/i,
  "ID"  => /印尼|印度尼西亚|ID\b|Indonesia|Jakarta|🇮🇩/i,
  "PH"  => /菲律宾|菲律賓|PH\b|Philippines|🇵🇭/i,
  "AU"  => /澳大利亚|澳洲|AU\b|Australia|Sydney|🇦🇺/i,
  "NZ"  => /新西兰|新西蘭|NZ\b|New\s?Zealand|🇳🇿/i,
  "TR"  => /土耳其|TR\b|Turkey|Istanbul|🇹🇷/i,
  "AE"  => /阿联酋|AE\b|UAE|Dubai|🇦🇪/i,
}

# v5.2.8-oc-normal.3 FIX#28-P0: GROUP_MAP 展平同源 bug
#   原实现每个 code 只落入 GROUP_MAP 的首个命中条目（下方 each/break），导致：
#     • HK/TW/JP/KR 只进香港/台湾/日韩子组，永远进不了 🌏 亚太节点
#     • US 只进美国子组，永远进不了 🌎 美洲节点
#   Clash Party JS 主线语义：区域大组 = 子区域并集（apacNodes = HK+TW+CN+JP+KR+SG+APAC_OTHER）；
#   americasNodes = US+AM）。修复：APAC 扩充至涵盖 HK+TW+CN+JP+KR+SG + 原 APAC_OTHER 集；AM 扩充至
#   包含 US；分类循环移除 break，同一节点可同时进入子区域组与所属大洲组。
#   v5.4.26 FIX#CN-APAC: APAC 加入 "CN"（对齐 Clash Party JS 基线 apacNodes 包含 c.CN）
GROUP_MAP = {
  "HK"     => ["HK"],
  "TW"     => ["TW"],
  "SG"     => ["SG"],
  "JP_KR"  => ["JP", "KR"],
  "US"     => ["US"],
  "EU"     => ["UK", "DE", "FR", "NL", "CH", "IT", "ES", "PT", "GR", "AT", "BE", "IE", "DK", "SE", "FI", "NO", "PL", "CZ", "RO", "HU", "RU"],
  "AM"     => ["US", "CA", "MX", "BR", "AR"],
  "AF"     => ["ZA", "EG", "NG"],
  "APAC"   => ["HK", "TW", "CN", "JP", "KR", "SG", "IN", "TH", "VN", "MY", "ID", "PH", "AU", "NZ", "TR", "AE"],
  "OTHER"  => ["OTHER"],
}
GROUP_NAMES = {
  "HK"    => "🇭🇰 香港节点",
  "TW"    => "🇹🇼 台湾节点",
  "SG"    => "🇸🇬 狮城节点",
  "JP_KR" => "🇯🇵 日韩节点",
  "US"    => "🇺🇸 美国节点",
  "EU"    => "🇪🇺 欧洲节点",
  "AM"    => "🌎 美洲节点",
  "AF"    => "🌍 非洲节点",
  "APAC"  => "🌏 亚太节点",
  "OTHER" => "🌏 其他节点",
}
HOME_GROUP_NAMES = {
  "HK"    => "🏡 香港家宽",
  "TW"    => "🏡 台湾家宽",
  "SG"    => "🏡 狮城家宽",
  "JP_KR" => "🏡 日韩家宽",
  "US"    => "🏡 美国家宽",
  "EU"    => "🏡 欧洲家宽",
  "AM"    => "🏡 美洲家宽",
  "AF"    => "🏡 非洲家宽",
  "APAC"  => "🏡 亚太家宽",
  "OTHER" => "🏡 其他家宽",
}

classify = ->(name) {
  REGIONS.each { |code, re| return code if name.match?(re) }
  "OTHER"
}

buckets = Hash.new { |h, k| h[k] = [] }
home_buckets = Hash.new { |h, k| h[k] = [] }
home_all_members = []
filtered_proxies.each do |p|
  name = p["name"].to_s
  is_home = is_residential.call(name)
  home_all_members << name if is_home

  code = classify.call(name)
  next if code.nil?

  # v5.2.8-oc-normal.3 FIX#28-P0: 去掉 break，单节点可并入多个区域组（子区域 + 所属大洲）
  GROUP_MAP.each do |gkey, codes|
    if codes.include?(code)
      buckets[gkey] << name
      home_buckets[gkey] << name if is_home
    end
  end
end

buckets.each do |k, v|
  status "[region] #{GROUP_NAMES[k]}: #{v.uniq.size} nodes / home=#{home_buckets[k].uniq.size}"
end
status "[region] 🏡 全球家宽: #{home_all_members.uniq.size} nodes"

# ---------------------------------------------------------------
# Phase 1c: 构建 18 个区域组（非 Smart 内核，使用 type: url-test）
# 与 full 版唯一区别：type/uselightgbm/strategy/collectdata 替换为经典 url-test 字段集
# 其余字段（url/interval/tolerance/lazy）完全保持一致，确保行为可比
# ---------------------------------------------------------------
def make_smart_group(name, proxies_filter_mode:, explicit_proxies: nil)
  g = {
    "name"               => name,
    "type"               => "url-test",
    "url"                => "https://cp.cloudflare.com/generate_204",
    "interval"           => 300,
    "tolerance"          => 10,
    "lazy"               => false,
  }
  if proxies_filter_mode == :include_all
    g["include-all-proxies"] = true
  elsif proxies_filter_mode == :explicit && explicit_proxies && !explicit_proxies.empty?
    g["proxies"] = explicit_proxies
  end
  g
end

smart_groups = []
# 🌍 全球节点：包含所有节点，url-test 自动选路
smart_groups << make_smart_group("🌍 全球节点", proxies_filter_mode: :include_all)
smart_groups << make_smart_group("🏡 全球家宽", proxies_filter_mode: :explicit, explicit_proxies: home_all_members.uniq) if home_all_members.any?

# 8 个区域组：仅该区域节点参与 url-test；家宽子组只在匹配到家宽节点时创建
%w[HK TW SG JP_KR US EU AM AF APAC OTHER].each do |gkey|
  gname = GROUP_NAMES[gkey]
  members = buckets[gkey].uniq
  smart_groups << make_smart_group(gname, proxies_filter_mode: :explicit, explicit_proxies: members) unless members.empty?

  home_name = HOME_GROUP_NAMES[gkey]
  home_members = home_buckets[gkey].uniq
  smart_groups << make_smart_group(home_name, proxies_filter_mode: :explicit, explicit_proxies: home_members) unless home_members.empty?
end

# ---------------------------------------------------------------
# Phase 2: TLS 指纹注入
# ---------------------------------------------------------------
FP_CANDIDATES = %w[chrome firefox safari edge ios android random]
filtered_proxies.each do |p|
  t = p["type"].to_s
  if %w[vless vmess trojan].include?(t)
    next if p["client-fingerprint"] && !p["client-fingerprint"].to_s.empty?
    digest = Digest::MD5.hexdigest(p["name"].to_s)
    idx = digest.to_i(16) % FP_CANDIDATES.size
    p["client-fingerprint"] = FP_CANDIDATES[idx]
  end
end

# ---------------------------------------------------------------
# Phase 3: 合并 override 到 config
# ---------------------------------------------------------------
# 替换节点数组（过滤后）
config["proxies"] = filtered_proxies

# 注入 hosts / DNS / sniffer / find-process-mode / 基础设置 / geodata-loader / geox-url / profile
%w[hosts dns sniffer find-process-mode unified-delay tcp-concurrent keep-alive-idle
   keep-alive-interval geodata-mode geodata-loader geo-auto-update
   geox-url profile].each do |key|
  config[key] = override[key] if override.key?(key)
end

# 清空并重建 proxy-groups：🌍 全球节点 → 业务组 → 其余区域组
active_region_names = smart_groups.map { |g| g["name"] } + ["DIRECT", "REJECT"]
override_biz_groups = (override["proxy-groups"] || []).map do |group|
  next group unless group.is_a?(Hash) && group["proxies"].is_a?(Array)

  patched = group.dup
  patched["proxies"] = group["proxies"].select { |proxy| active_region_names.include?(proxy) }
  patched
end
# 🌍 全球节点移至最前，业务组居中，其余区域组兜底（smart_groups 首个元素即 🌍 全球节点）
config["proxy-groups"] = [smart_groups.shift] + override_biz_groups + smart_groups

# 清空并重建 rule-providers 和 rules
config["rule-providers"] = override["rule-providers"] if override["rule-providers"]
config["rules"]          = override["rules"] if override["rules"]

# 清理机场自带的 proxy-providers（如果有）
config.delete("proxy-providers")

# ---------------------------------------------------------------
# 写回
# ---------------------------------------------------------------
File.open(config_path, 'w') { |f| f.write(config.to_yaml) }
status "[write] smart=#{smart_groups.size} biz=#{override_biz_groups.size} proxies=#{filtered_proxies.size} rules=#{config['rules'].size} providers=#{(config['rule-providers'] || {}).size}"
status "[#{VERSION}] done"
RUBY_EOF

# ============================================================================
# 执行 Ruby 脚本，读取状态日志，输出到 openclash 日志
# ============================================================================
LOG_OUT "Info" "[Clash-Normal] Executing Ruby processor..."

# 清理状态日志，准备接收 Ruby 输出
: > "$STATUS_LOG"

# 执行 Ruby 处理脚本
ruby "$RUBY_SCRIPT" "$CONFIG_FILE" "$OVERRIDE_YAML" "$STATUS_LOG" 2>> "$LOG_FILE"
RC=$?

# 将 Ruby 的状态日志逐行回显到 OpenClash 日志
if [ -f "$STATUS_LOG" ]; then
  while IFS= read -r line; do
    LOG_OUT "Info" "[Clash-Normal] $line"
  done < "$STATUS_LOG"
fi

if [ $RC -eq 0 ]; then
  LOG_OUT "Info" "[Clash-Normal] $VERSION_TAG overwrite completed successfully."
else
  LOG_OUT "Error" "[Clash-Normal] $VERSION_TAG overwrite FAILED with exit code $RC."
  LOG_OUT "Error" "[Clash-Normal] Check $LOG_FILE for Ruby traceback."
fi

exit $RC
