#!/bin/bash
. /usr/share/openclash/log.sh

# ============================================================================
# Clash Smart v5.4.39-oc-normal.1 — OpenClash 覆写脚本（非 Smart 内核 / url-test 区域组）
# Build: 2026-07-09
# ============================================================================
# v5.4.39: MRS-PARTIAL 全量规则源复查迁移 · v5.4.38: SCKI-SUPPLEMENTAL 零星补充规则集化
# v5.4.33: FEAT#169-AI-CODING 接入 VPSDance AI coding 规则补齐 AI 编程工具
# v5.4.32: FIX#168-CN-GAME 国内游戏前置到国外游戏宽规则之前，避免 HoYoverse / Game / category-games 抢先代理
# 定位：与同目录 OpenClash(mihomo-smart).sh 规则 100% 等价的「非 Smart 内核」版本。
#       两者唯一区别：22 个区域组（11 全部 + 11 家宽）从 type: smart（uselightgbm）换成 type: url-test。
#       对齐 Clash Party v5.4.39 JS 基线。
#       适用场景：
#         - OpenClash 内核选的是 Meta(mihomo 稳定版) 而非 Meta Alpha，不支持 smart + LightGBM
#         - 或者明确想关闭 LightGBM ML 评估、只靠经典 url-test 延迟选路
#       需要 LightGBM 智能评估请改用 OpenClash(mihomo-smart).sh（Smart 版）。
# 架构：
#   • 22 url-test 区域组（11 全部 + 11 家宽；interval 600s / tolerance 150ms / lazy：与 Smart 版同步延迟参数）
#   • 33 业务策略组（流媒体按平台拆分：TikTok / Netflix / Disney+ / HBO/Max / Hulu / Prime Video / YouTube / 音乐流媒体 / 其他国外流媒体）
#   • 474 rule-providers（全部 proxy: "🚫 受限网站"，对齐 Clash Party FIX#17-P0）
#   • 929 条 rules
#   • DNS fake-ip + 嗅探（HTTP/TLS/QUIC）+ nameserver-policy 救援
#   • Ruby 阶段做：节点过滤 / 区域分类 / url-test 组生成 / TLS 指纹注入
# 基线：Clash Party v5.4.39（唯一主线；v5.3.1/v5.3.2 为桌面端 PROCESS-NAME 改动，路由器端不适用）── 任何规则/组/DNS 改动必须先改 Clash Party JS，
#       再同步到此文件。参见仓库根目录 CLAUDE.md / AGENTS.md。
# 变更历史：见 `OpenClash/CHANGELOG.md`（Normal 部分）。
# ============================================================================



VERSION_TAG="v5.4.39-oc-normal.1"
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
LOG_OUT "Info" "[Clash-Normal] Full-rule build (v5.4.39, 33 business groups, non-Smart kernel)"

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
# OVERRIDE YAML (续) — Rule-Providers：474 项，对齐 Clash Party v5.4.39 主线
# 策略：
#   ✓ 与 Clash Party 主线（BIZ.GFW = '🚫 受限网站'）一致：所有 provider 都走 GFW 组
#     下载，在中国走代理、在印尼走 DIRECT，规避 jsdelivr/GitHub 冷启动死锁。
#   ✓ 22 url-test 区域组 + 33 业务组 + 474 rule-providers + 929 条规则
#   ✓ 区域组统一 type: url-test + include-all-proxies / explicit proxies 分流
#   ✓ TLS 指纹注入（Ruby 阶段 _simple_hash 分配）
# ============================================================================
cat >> "$OVERRIDE_YAML" << 'OVERRIDE_EOF'
rule-providers:
  56:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/56.mrs
    path: "./ruleset/scki-mrs-56.mrs"
    interval: 87883
    proxy: "\U0001F6AB 受限网站"
  anti-ad:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/DustinWin/ruleset_geodata@mihomo-ruleset/ads.mrs
    path: "./ruleset/anti-ad.mrs"
    interval: 85541
    proxy: "\U0001F6AB 受限网站"
  openai:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/MetaCubeX/meta-rules-dat@meta/geo/geosite/openai.mrs
    path: "./ruleset/meta-openai.mrs"
    interval: 85525
    proxy: "\U0001F6AB 受限网站"
  claude:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/claude.mrs
    path: "./ruleset/scki-mrs-claude.mrs"
    interval: 85554
    proxy: "\U0001F6AB 受限网站"
  gemini:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/gemini.mrs
    path: "./ruleset/scki-mrs-gemini.mrs"
    interval: 85567
    proxy: "\U0001F6AB 受限网站"
  copilot-domain:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/copilot-domain.mrs
    path: "./ruleset/scki-mrs-copilot-domain.mrs"
    interval: 85577
    proxy: "\U0001F6AB 受限网站"
  copilot-ipcidr:
    type: http
    behavior: ipcidr
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/copilot-ipcidr.mrs
    path: "./ruleset/scki-mrs-copilot-ipcidr.mrs"
    interval: 85577
    proxy: "\U0001F6AB 受限网站"
  copilot-classical:
    type: http
    behavior: classical
    format: yaml
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/copilot-classical.yaml
    path: "./ruleset/scki-mrs-copilot-classical.yaml"
    interval: 85577
    proxy: "\U0001F6AB 受限网站"
  cryptocurrency:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/cryptocurrency.mrs
    path: "./ruleset/scki-mrs-cryptocurrency.mrs"
    interval: 85599
    proxy: "\U0001F6AB 受限网站"
  telegram:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/MetaCubeX/meta-rules-dat@meta/geo/geosite/telegram.mrs
    path: "./ruleset/meta-telegram.mrs"
    interval: 85629
    proxy: "\U0001F6AB 受限网站"
  telegram-ip:
    type: http
    behavior: ipcidr
    format: mrs
    url: https://fastly.jsdelivr.net/gh/MetaCubeX/meta-rules-dat@meta/geo/geoip/telegram.mrs
    path: "./ruleset/meta-ip-telegram.mrs"
    interval: 85650
    proxy: "\U0001F6AB 受限网站"
  discord:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/discord.mrs
    path: "./ruleset/scki-mrs-discord.mrs"
    interval: 85639
    proxy: "\U0001F6AB 受限网站"
  line-domain:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/line-domain.mrs
    path: "./ruleset/scki-mrs-line-domain.mrs"
    interval: 85646
    proxy: "\U0001F6AB 受限网站"
  line-ipcidr:
    type: http
    behavior: ipcidr
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/line-ipcidr.mrs
    path: "./ruleset/scki-mrs-line-ipcidr.mrs"
    interval: 85646
    proxy: "\U0001F6AB 受限网站"
  whatsapp-domain:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/whatsapp-domain.mrs
    path: "./ruleset/scki-mrs-whatsapp-domain.mrs"
    interval: 85694
    proxy: "\U0001F6AB 受限网站"
  whatsapp-ipcidr:
    type: http
    behavior: ipcidr
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/whatsapp-ipcidr.mrs
    path: "./ruleset/scki-mrs-whatsapp-ipcidr.mrs"
    interval: 85694
    proxy: "\U0001F6AB 受限网站"
  kakaotalk-domain:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/kakaotalk-domain.mrs
    path: "./ruleset/scki-mrs-kakaotalk-domain.mrs"
    interval: 85670
    proxy: "\U0001F6AB 受限网站"
  kakaotalk-ipcidr:
    type: http
    behavior: ipcidr
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/kakaotalk-ipcidr.mrs
    path: "./ruleset/scki-mrs-kakaotalk-ipcidr.mrs"
    interval: 85670
    proxy: "\U0001F6AB 受限网站"
  twitter:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/MetaCubeX/meta-rules-dat@meta/geo/geosite/twitter.mrs
    path: "./ruleset/meta-twitter.mrs"
    interval: 85737
    proxy: "\U0001F6AB 受限网站"
  twitter-ip:
    type: http
    behavior: ipcidr
    format: mrs
    url: https://fastly.jsdelivr.net/gh/MetaCubeX/meta-rules-dat@meta/geo/geoip/twitter.mrs
    path: "./ruleset/meta-ip-twitter.mrs"
    interval: 85729
    proxy: "\U0001F6AB 受限网站"
  tiktok:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/MetaCubeX/meta-rules-dat@meta/geo/geosite/tiktok.mrs
    path: "./ruleset/meta-tiktok.mrs"
    interval: 85713
    proxy: "\U0001F6AB 受限网站"
  reddit:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/reddit.mrs
    path: "./ruleset/scki-mrs-reddit.mrs"
    interval: 85767
    proxy: "\U0001F6AB 受限网站"
  facebook-domain:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/facebook-domain.mrs
    path: "./ruleset/scki-mrs-facebook-domain.mrs"
    interval: 85762
    proxy: "\U0001F6AB 受限网站"
  facebook-ipcidr:
    type: http
    behavior: ipcidr
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/facebook-ipcidr.mrs
    path: "./ruleset/scki-mrs-facebook-ipcidr.mrs"
    interval: 85762
    proxy: "\U0001F6AB 受限网站"
  facebook-classical:
    type: http
    behavior: classical
    format: yaml
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/facebook-classical.yaml
    path: "./ruleset/scki-mrs-facebook-classical.yaml"
    interval: 85762
    proxy: "\U0001F6AB 受限网站"
  instagram:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/instagram.mrs
    path: "./ruleset/scki-mrs-instagram.mrs"
    interval: 85796
    proxy: "\U0001F6AB 受限网站"
  snapchat:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/MetaCubeX/meta-rules-dat@meta/geo/geosite/snap.mrs
    path: "./ruleset/meta-snap.mrs"
    interval: 85783
    proxy: "\U0001F6AB 受限网站"
  pinterest:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/pinterest.mrs
    path: "./ruleset/scki-mrs-pinterest.mrs"
    interval: 85816
    proxy: "\U0001F6AB 受限网站"
  linkedin:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/linkedin.mrs
    path: "./ruleset/scki-mrs-linkedin.mrs"
    interval: 85807
    proxy: "\U0001F6AB 受限网站"
  facebook-ip:
    type: http
    behavior: ipcidr
    format: mrs
    url: https://fastly.jsdelivr.net/gh/MetaCubeX/meta-rules-dat@meta/geo/geoip/facebook.mrs
    path: "./ruleset/meta-ip-facebook.mrs"
    interval: 85839
    proxy: "\U0001F6AB 受限网站"
  slack:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/slack.mrs
    path: "./ruleset/scki-mrs-slack.mrs"
    interval: 85885
    proxy: "\U0001F6AB 受限网站"
  zoom:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/zoom.mrs
    path: "./ruleset/scki-mrs-zoom.mrs"
    interval: 85891
    proxy: "\U0001F6AB 受限网站"
  teams:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/teams.mrs
    path: "./ruleset/scki-mrs-teams.mrs"
    interval: 85902
    proxy: "\U0001F6AB 受限网站"
  google:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/MetaCubeX/meta-rules-dat@meta/geo/geosite/google.mrs
    path: "./ruleset/meta-google.mrs"
    interval: 85892
    proxy: "\U0001F6AB 受限网站"
  google-ip:
    type: http
    behavior: ipcidr
    format: mrs
    url: https://fastly.jsdelivr.net/gh/MetaCubeX/meta-rules-dat@meta/geo/geoip/google.mrs
    path: "./ruleset/meta-ip-google.mrs"
    interval: 85946
    proxy: "\U0001F6AB 受限网站"
  bing:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/bing.mrs
    path: "./ruleset/scki-mrs-bing.mrs"
    interval: 85933
    proxy: "\U0001F6AB 受限网站"
  youtube:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/MetaCubeX/meta-rules-dat@meta/geo/geosite/youtube.mrs
    path: "./ruleset/meta-youtube.mrs"
    interval: 85983
    proxy: "\U0001F6AB 受限网站"
  netflix:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/MetaCubeX/meta-rules-dat@meta/geo/geosite/netflix.mrs
    path: "./ruleset/meta-netflix.mrs"
    interval: 85965
    proxy: "\U0001F6AB 受限网站"
  netflix-ip:
    type: http
    behavior: ipcidr
    format: mrs
    url: https://fastly.jsdelivr.net/gh/MetaCubeX/meta-rules-dat@meta/geo/geoip/netflix.mrs
    path: "./ruleset/meta-ip-netflix.mrs"
    interval: 86006
    proxy: "\U0001F6AB 受限网站"
  spotify:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/MetaCubeX/meta-rules-dat@meta/geo/geosite/spotify.mrs
    path: "./ruleset/meta-spotify.mrs"
    interval: 86035
    proxy: "\U0001F6AB 受限网站"
  disney-domain:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/disney-domain.mrs
    path: "./ruleset/scki-mrs-disney-domain.mrs"
    interval: 86021
    proxy: "\U0001F6AB 受限网站"
  disney-classical:
    type: http
    behavior: classical
    format: yaml
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/disney-classical.yaml
    path: "./ruleset/scki-mrs-disney-classical.yaml"
    interval: 86021
    proxy: "\U0001F6AB 受限网站"
  hbo-domain:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/hbo-domain.mrs
    path: "./ruleset/scki-mrs-hbo-domain.mrs"
    interval: 86044
    proxy: "\U0001F6AB 受限网站"
  hbo-classical:
    type: http
    behavior: classical
    format: yaml
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/hbo-classical.yaml
    path: "./ruleset/scki-mrs-hbo-classical.yaml"
    interval: 86044
    proxy: "\U0001F6AB 受限网站"
  primevideo:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/primevideo.mrs
    path: "./ruleset/scki-mrs-primevideo.mrs"
    interval: 86080
    proxy: "\U0001F6AB 受限网站"
  hulu-domain:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/hulu-domain.mrs
    path: "./ruleset/scki-mrs-hulu-domain.mrs"
    interval: 86063
    proxy: "\U0001F6AB 受限网站"
  hulu-classical:
    type: http
    behavior: classical
    format: yaml
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/hulu-classical.yaml
    path: "./ruleset/scki-mrs-hulu-classical.yaml"
    interval: 86063
    proxy: "\U0001F6AB 受限网站"
  paramount:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/paramount.mrs
    path: "./ruleset/scki-mrs-paramount.mrs"
    interval: 86100
    proxy: "\U0001F6AB 受限网站"
  amazon-domain:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/amazon-domain.mrs
    path: "./ruleset/scki-mrs-amazon-domain.mrs"
    interval: 86084
    proxy: "\U0001F6AB 受限网站"
  amazon-ipcidr:
    type: http
    behavior: ipcidr
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/amazon-ipcidr.mrs
    path: "./ruleset/scki-mrs-amazon-ipcidr.mrs"
    interval: 86084
    proxy: "\U0001F6AB 受限网站"
  amazon-classical:
    type: http
    behavior: classical
    format: yaml
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/amazon-classical.yaml
    path: "./ruleset/scki-mrs-amazon-classical.yaml"
    interval: 86084
    proxy: "\U0001F6AB 受限网站"
  peacock:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/peacock.mrs
    path: "./ruleset/scki-mrs-peacock.mrs"
    interval: 86095
    proxy: "\U0001F6AB 受限网站"
  twitch-domain:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/twitch-domain.mrs
    path: "./ruleset/scki-mrs-twitch-domain.mrs"
    interval: 86159
    proxy: "\U0001F6AB 受限网站"
  twitch-ipcidr:
    type: http
    behavior: ipcidr
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/twitch-ipcidr.mrs
    path: "./ruleset/scki-mrs-twitch-ipcidr.mrs"
    interval: 86159
    proxy: "\U0001F6AB 受限网站"
  twitch-classical:
    type: http
    behavior: classical
    format: yaml
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/twitch-classical.yaml
    path: "./ruleset/scki-mrs-twitch-classical.yaml"
    interval: 86159
    proxy: "\U0001F6AB 受限网站"
  bahamut:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/MetaCubeX/meta-rules-dat@meta/geo/geosite/bahamut.mrs
    path: "./ruleset/meta-bahamut.mrs"
    interval: 86129
    proxy: "\U0001F6AB 受限网站"
  kktv:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/kktv.mrs
    path: "./ruleset/scki-mrs-kktv.mrs"
    interval: 86166
    proxy: "\U0001F6AB 受限网站"
  abema:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/MetaCubeX/meta-rules-dat@meta/geo/geosite/abema.mrs
    path: "./ruleset/meta-abema.mrs"
    interval: 86199
    proxy: "\U0001F6AB 受限网站"
  dazn:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/dazn.mrs
    path: "./ruleset/scki-mrs-dazn.mrs"
    interval: 86160
    proxy: "\U0001F6AB 受限网站"
  bbc:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/MetaCubeX/meta-rules-dat@meta/geo/geosite/bbc.mrs
    path: "./ruleset/meta-bbc.mrs"
    interval: 86209
    proxy: "\U0001F6AB 受限网站"
  steam:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/steam.mrs
    path: "./ruleset/scki-mrs-steam.mrs"
    interval: 86210
    proxy: "\U0001F6AB 受限网站"
  epic:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/epic.mrs
    path: "./ruleset/scki-mrs-epic.mrs"
    interval: 86251
    proxy: "\U0001F6AB 受限网站"
  playstation:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/playstation.mrs
    path: "./ruleset/scki-mrs-playstation.mrs"
    interval: 86220
    proxy: "\U0001F6AB 受限网站"
  nintendo-domain:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/nintendo-domain.mrs
    path: "./ruleset/scki-mrs-nintendo-domain.mrs"
    interval: 86285
    proxy: "\U0001F6AB 受限网站"
  nintendo-ipcidr:
    type: http
    behavior: ipcidr
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/nintendo-ipcidr.mrs
    path: "./ruleset/scki-mrs-nintendo-ipcidr.mrs"
    interval: 86285
    proxy: "\U0001F6AB 受限网站"
  xbox:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/xbox.mrs
    path: "./ruleset/scki-mrs-xbox.mrs"
    interval: 86280
    proxy: "\U0001F6AB 受限网站"
  ea:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/ea.mrs
    path: "./ruleset/scki-mrs-ea.mrs"
    interval: 86272
    proxy: "\U0001F6AB 受限网站"
  blizzard-domain:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/blizzard-domain.mrs
    path: "./ruleset/scki-mrs-blizzard-domain.mrs"
    interval: 86301
    proxy: "\U0001F6AB 受限网站"
  blizzard-ipcidr:
    type: http
    behavior: ipcidr
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/blizzard-ipcidr.mrs
    path: "./ruleset/scki-mrs-blizzard-ipcidr.mrs"
    interval: 86301
    proxy: "\U0001F6AB 受限网站"
  microsoft:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/MetaCubeX/meta-rules-dat@meta/geo/geosite/microsoft.mrs
    path: "./ruleset/meta-microsoft.mrs"
    interval: 86345
    proxy: "\U0001F6AB 受限网站"
  onedrive:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/MetaCubeX/meta-rules-dat@meta/geo/geosite/onedrive.mrs
    path: "./ruleset/meta-onedrive.mrs"
    interval: 86350
    proxy: "\U0001F6AB 受限网站"
  apple:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/MetaCubeX/meta-rules-dat@meta/geo/geosite/apple.mrs
    path: "./ruleset/meta-apple.mrs"
    interval: 86335
    proxy: "\U0001F6AB 受限网站"
  icloud:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/MetaCubeX/meta-rules-dat@meta/geo/geosite/icloud.mrs
    path: "./ruleset/meta-icloud.mrs"
    interval: 86358
    proxy: "\U0001F6AB 受限网站"
  applemusic-domain:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/applemusic-domain.mrs
    path: "./ruleset/scki-mrs-applemusic-domain.mrs"
    interval: 86391
    proxy: "\U0001F6AB 受限网站"
  applemusic-classical:
    type: http
    behavior: classical
    format: yaml
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/applemusic-classical.yaml
    path: "./ruleset/scki-mrs-applemusic-classical.yaml"
    interval: 86391
    proxy: "\U0001F6AB 受限网站"
  github:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/MetaCubeX/meta-rules-dat@meta/geo/geosite/github.mrs
    path: "./ruleset/meta-github.mrs"
    interval: 86407
    proxy: "\U0001F6AB 受限网站"
  docker:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/docker.mrs
    path: "./ruleset/scki-mrs-docker.mrs"
    interval: 86426
    proxy: "\U0001F6AB 受限网站"
  gitlab:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/gitlab.mrs
    path: "./ruleset/scki-mrs-gitlab.mrs"
    interval: 86450
    proxy: "\U0001F6AB 受限网站"
  paypal:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/paypal.mrs
    path: "./ruleset/scki-mrs-paypal.mrs"
    interval: 86454
    proxy: "\U0001F6AB 受限网站"
  cloudflare-ip:
    type: http
    behavior: ipcidr
    format: mrs
    url: https://fastly.jsdelivr.net/gh/MetaCubeX/meta-rules-dat@meta/geo/geoip/cloudflare.mrs
    path: "./ruleset/meta-ip-cloudflare.mrs"
    interval: 86468
    proxy: "\U0001F6AB 受限网站"
  cloudfront-ip:
    type: http
    behavior: ipcidr
    format: mrs
    url: https://fastly.jsdelivr.net/gh/MetaCubeX/meta-rules-dat@meta/geo/geoip/cloudfront.mrs
    path: "./ruleset/meta-ip-cloudfront.mrs"
    interval: 86501
    proxy: "\U0001F6AB 受限网站"
  fastly-ip:
    type: http
    behavior: ipcidr
    format: mrs
    url: https://fastly.jsdelivr.net/gh/MetaCubeX/meta-rules-dat@meta/geo/geoip/fastly.mrs
    path: "./ruleset/meta-ip-fastly.mrs"
    interval: 86471
    proxy: "\U0001F6AB 受限网站"
  systemota:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/systemota.mrs
    path: "./ruleset/scki-mrs-systemota.mrs"
    interval: 86498
    proxy: "\U0001F6AB 受限网站"
  viu-domain:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/viu-domain.mrs
    path: "./ruleset/scki-mrs-viu-domain.mrs"
    interval: 86503
    proxy: "\U0001F6AB 受限网站"
  viu-classical:
    type: http
    behavior: classical
    format: yaml
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/viu-classical.yaml
    path: "./ruleset/scki-mrs-viu-classical.yaml"
    interval: 86503
    proxy: "\U0001F6AB 受限网站"
  bilibili:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/MetaCubeX/meta-rules-dat@meta/geo/geosite/bilibili.mrs
    path: "./ruleset/meta-bilibili.mrs"
    interval: 86540
    proxy: "\U0001F6AB 受限网站"
  biliintl:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/MetaCubeX/meta-rules-dat@meta/geo/geosite/biliintl.mrs
    path: "./ruleset/meta-biliintl.mrs"
    interval: 86565
    proxy: "\U0001F6AB 受限网站"
  amap:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/MetaCubeX/meta-rules-dat@meta/geo/geosite/amap.mrs
    path: "./ruleset/meta-amap.mrs"
    interval: 86532
    proxy: "\U0001F6AB 受限网站"
  cn:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/MetaCubeX/meta-rules-dat@meta/geo/geosite/cn.mrs
    path: "./ruleset/meta-cn.mrs"
    interval: 86553
    proxy: "\U0001F6AB 受限网站"
  cn-ip:
    type: http
    behavior: ipcidr
    format: mrs
    url: https://fastly.jsdelivr.net/gh/MetaCubeX/meta-rules-dat@meta/geo/geoip/cn.mrs
    path: "./ruleset/meta-ip-cn.mrs"
    interval: 86573
    proxy: "\U0001F6AB 受限网站"
  proxy:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/MetaCubeX/meta-rules-dat@meta/geo/geosite/geolocation-!cn.mrs
    path: "./ruleset/meta-geolocation-!cn.mrs"
    interval: 86624
    proxy: "\U0001F6AB 受限网站"
  advertising-domain:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/advertising-domain.mrs
    path: "./ruleset/scki-mrs-advertising-domain.mrs"
    interval: 86609
    proxy: "\U0001F6AB 受限网站"
  advertising-ipcidr:
    type: http
    behavior: ipcidr
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/advertising-ipcidr.mrs
    path: "./ruleset/scki-mrs-advertising-ipcidr.mrs"
    interval: 86609
    proxy: "\U0001F6AB 受限网站"
  advertisingmitv:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/advertisingmitv.mrs
    path: "./ruleset/scki-mrs-advertisingmitv.mrs"
    interval: 86596
    proxy: "\U0001F6AB 受限网站"
  adobeactivation-domain:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/adobeactivation-domain.mrs
    path: "./ruleset/scki-mrs-adobeactivation-domain.mrs"
    interval: 86648
    proxy: "\U0001F6AB 受限网站"
  adobeactivation-ipcidr:
    type: http
    behavior: ipcidr
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/adobeactivation-ipcidr.mrs
    path: "./ruleset/scki-mrs-adobeactivation-ipcidr.mrs"
    interval: 86648
    proxy: "\U0001F6AB 受限网站"
  blockhttpdns-domain:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/blockhttpdns-domain.mrs
    path: "./ruleset/scki-mrs-blockhttpdns-domain.mrs"
    interval: 86641
    proxy: "\U0001F6AB 受限网站"
  blockhttpdns-ipcidr:
    type: http
    behavior: ipcidr
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/blockhttpdns-ipcidr.mrs
    path: "./ruleset/scki-mrs-blockhttpdns-ipcidr.mrs"
    interval: 86641
    proxy: "\U0001F6AB 受限网站"
  domob:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/domob.mrs
    path: "./ruleset/scki-mrs-domob.mrs"
    interval: 86662
    proxy: "\U0001F6AB 受限网站"
  hijacking-domain:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/hijacking-domain.mrs
    path: "./ruleset/scki-mrs-hijacking-domain.mrs"
    interval: 86685
    proxy: "\U0001F6AB 受限网站"
  hijacking-ipcidr:
    type: http
    behavior: ipcidr
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/hijacking-ipcidr.mrs
    path: "./ruleset/scki-mrs-hijacking-ipcidr.mrs"
    interval: 86685
    proxy: "\U0001F6AB 受限网站"
  jiguangtuisong:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/jiguangtuisong.mrs
    path: "./ruleset/scki-mrs-jiguangtuisong.mrs"
    interval: 86712
    proxy: "\U0001F6AB 受限网站"
  miuiprivacy:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/miuiprivacy.mrs
    path: "./ruleset/scki-mrs-miuiprivacy.mrs"
    interval: 86754
    proxy: "\U0001F6AB 受限网站"
  privacy-domain:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/privacy-domain.mrs
    path: "./ruleset/scki-mrs-privacy-domain.mrs"
    interval: 86764
    proxy: "\U0001F6AB 受限网站"
  privacy-ipcidr:
    type: http
    behavior: ipcidr
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/privacy-ipcidr.mrs
    path: "./ruleset/scki-mrs-privacy-ipcidr.mrs"
    interval: 86764
    proxy: "\U0001F6AB 受限网站"
  youmengchuangxiang:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/youmengchuangxiang.mrs
    path: "./ruleset/scki-mrs-youmengchuangxiang.mrs"
    interval: 86765
    proxy: "\U0001F6AB 受限网站"
  civitai:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/civitai.mrs
    path: "./ruleset/scki-mrs-civitai.mrs"
    interval: 86763
    proxy: "\U0001F6AB 受限网站"
  binance:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/binance.mrs
    path: "./ruleset/scki-mrs-binance.mrs"
    interval: 86814
    proxy: "\U0001F6AB 受限网站"
  stripe:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/stripe.mrs
    path: "./ruleset/scki-mrs-stripe.mrs"
    interval: 86820
    proxy: "\U0001F6AB 受限网站"
  visa:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/visa.mrs
    path: "./ruleset/scki-mrs-visa.mrs"
    interval: 86847
    proxy: "\U0001F6AB 受限网站"
  tigerfintech:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/tigerfintech.mrs
    path: "./ruleset/scki-mrs-tigerfintech.mrs"
    interval: 86851
    proxy: "\U0001F6AB 受限网站"
  mail:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/mail.mrs
    path: "./ruleset/scki-mrs-mail.mrs"
    interval: 86856
    proxy: "\U0001F6AB 受限网站"
  mailru:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/mailru.mrs
    path: "./ruleset/scki-mrs-mailru.mrs"
    interval: 86885
    proxy: "\U0001F6AB 受限网站"
  protonmail:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/protonmail.mrs
    path: "./ruleset/scki-mrs-protonmail.mrs"
    interval: 86885
    proxy: "\U0001F6AB 受限网站"
  spark:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/spark.mrs
    path: "./ruleset/scki-mrs-spark.mrs"
    interval: 86900
    proxy: "\U0001F6AB 受限网站"
  telegramnl:
    type: http
    behavior: ipcidr
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/telegramnl.mrs
    path: "./ruleset/scki-mrs-telegramnl.mrs"
    interval: 86881
    proxy: "\U0001F6AB 受限网站"
  telegramsg:
    type: http
    behavior: ipcidr
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/telegramsg.mrs
    path: "./ruleset/scki-mrs-telegramsg.mrs"
    interval: 86921
    proxy: "\U0001F6AB 受限网站"
  telegramus:
    type: http
    behavior: ipcidr
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/telegramus.mrs
    path: "./ruleset/scki-mrs-telegramus.mrs"
    interval: 86927
    proxy: "\U0001F6AB 受限网站"
  zalo:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/zalo.mrs
    path: "./ruleset/scki-mrs-zalo.mrs"
    interval: 86962
    proxy: "\U0001F6AB 受限网站"
  googlevoice:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/googlevoice.mrs
    path: "./ruleset/scki-mrs-googlevoice.mrs"
    interval: 86945
    proxy: "\U0001F6AB 受限网站"
  italkbb-domain:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/italkbb-domain.mrs
    path: "./ruleset/scki-mrs-italkbb-domain.mrs"
    interval: 86968
    proxy: "\U0001F6AB 受限网站"
  italkbb-classical:
    type: http
    behavior: classical
    format: yaml
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/italkbb-classical.yaml
    path: "./ruleset/scki-mrs-italkbb-classical.yaml"
    interval: 86968
    proxy: "\U0001F6AB 受限网站"
  tumblr:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/tumblr.mrs
    path: "./ruleset/scki-mrs-tumblr.mrs"
    interval: 86988
    proxy: "\U0001F6AB 受限网站"
  clubhouse:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/clubhouse.mrs
    path: "./ruleset/scki-mrs-clubhouse.mrs"
    interval: 87026
    proxy: "\U0001F6AB 受限网站"
  clubhouseip-domain:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/clubhouseip-domain.mrs
    path: "./ruleset/scki-mrs-clubhouseip-domain.mrs"
    interval: 87024
    proxy: "\U0001F6AB 受限网站"
  clubhouseip-ipcidr:
    type: http
    behavior: ipcidr
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/clubhouseip-ipcidr.mrs
    path: "./ruleset/scki-mrs-clubhouseip-ipcidr.mrs"
    interval: 87024
    proxy: "\U0001F6AB 受限网站"
  pixiv:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/pixiv.mrs
    path: "./ruleset/scki-mrs-pixiv.mrs"
    interval: 87052
    proxy: "\U0001F6AB 受限网站"
  truthsocial:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/truthsocial.mrs
    path: "./ruleset/scki-mrs-truthsocial.mrs"
    interval: 87054
    proxy: "\U0001F6AB 受限网站"
  vk:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/vk.mrs
    path: "./ruleset/scki-mrs-vk.mrs"
    interval: 87091
    proxy: "\U0001F6AB 受限网站"
  blued:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/blued.mrs
    path: "./ruleset/scki-mrs-blued.mrs"
    interval: 87077
    proxy: "\U0001F6AB 受限网站"
  disqus:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/disqus.mrs
    path: "./ruleset/scki-mrs-disqus.mrs"
    interval: 87078
    proxy: "\U0001F6AB 受限网站"
  imgur:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/imgur.mrs
    path: "./ruleset/scki-mrs-imgur.mrs"
    interval: 87115
    proxy: "\U0001F6AB 受限网站"
  pixnet:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/pixnet.mrs
    path: "./ruleset/scki-mrs-pixnet.mrs"
    interval: 87111
    proxy: "\U0001F6AB 受限网站"
  atlassian:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/atlassian.mrs
    path: "./ruleset/scki-mrs-atlassian.mrs"
    interval: 87174
    proxy: "\U0001F6AB 受限网站"
  notion:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/notion.mrs
    path: "./ruleset/scki-mrs-notion.mrs"
    interval: 87150
    proxy: "\U0001F6AB 受限网站"
  teamviewer-domain:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/teamviewer-domain.mrs
    path: "./ruleset/scki-mrs-teamviewer-domain.mrs"
    interval: 87191
    proxy: "\U0001F6AB 受限网站"
  teamviewer-ipcidr:
    type: http
    behavior: ipcidr
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/teamviewer-ipcidr.mrs
    path: "./ruleset/scki-mrs-teamviewer-ipcidr.mrs"
    interval: 87191
    proxy: "\U0001F6AB 受限网站"
  zoho:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/zoho.mrs
    path: "./ruleset/scki-mrs-zoho.mrs"
    interval: 87223
    proxy: "\U0001F6AB 受限网站"
  salesforce:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/salesforce.mrs
    path: "./ruleset/scki-mrs-salesforce.mrs"
    interval: 87231
    proxy: "\U0001F6AB 受限网站"
  zendesk:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/zendesk.mrs
    path: "./ruleset/scki-mrs-zendesk.mrs"
    interval: 87221
    proxy: "\U0001F6AB 受限网站"
  intercom:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/intercom.mrs
    path: "./ruleset/scki-mrs-intercom.mrs"
    interval: 87218
    proxy: "\U0001F6AB 受限网站"
  remotedesktop:
    type: http
    behavior: classical
    url: https://cdn.jsdelivr.net/gh/blackmatrix7/ios_rule_script@master/rule/Clash/RemoteDesktop/RemoteDesktop.yaml
    path: "./ruleset/bm7-RemoteDesktop.yaml"
    interval: 87253
    proxy: "\U0001F6AB 受限网站"
  iqiyi-domain:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/iqiyi-domain.mrs
    path: "./ruleset/scki-mrs-iqiyi-domain.mrs"
    interval: 87261
    proxy: "\U0001F6AB 受限网站"
  iqiyi-ipcidr:
    type: http
    behavior: ipcidr
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/iqiyi-ipcidr.mrs
    path: "./ruleset/scki-mrs-iqiyi-ipcidr.mrs"
    interval: 87261
    proxy: "\U0001F6AB 受限网站"
  iqiyi-classical:
    type: http
    behavior: classical
    format: yaml
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/iqiyi-classical.yaml
    path: "./ruleset/scki-mrs-iqiyi-classical.yaml"
    interval: 87261
    proxy: "\U0001F6AB 受限网站"
  youku-domain:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/youku-domain.mrs
    path: "./ruleset/scki-mrs-youku-domain.mrs"
    interval: 87268
    proxy: "\U0001F6AB 受限网站"
  youku-ipcidr:
    type: http
    behavior: ipcidr
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/youku-ipcidr.mrs
    path: "./ruleset/scki-mrs-youku-ipcidr.mrs"
    interval: 87268
    proxy: "\U0001F6AB 受限网站"
  tencentvideo-domain:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/tencentvideo-domain.mrs
    path: "./ruleset/scki-mrs-tencentvideo-domain.mrs"
    interval: 87270
    proxy: "\U0001F6AB 受限网站"
  tencentvideo-ipcidr:
    type: http
    behavior: ipcidr
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/tencentvideo-ipcidr.mrs
    path: "./ruleset/scki-mrs-tencentvideo-ipcidr.mrs"
    interval: 87270
    proxy: "\U0001F6AB 受限网站"
  douyin:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/douyin.mrs
    path: "./ruleset/scki-mrs-douyin.mrs"
    interval: 87313
    proxy: "\U0001F6AB 受限网站"
  bytedance-domain:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/bytedance-domain.mrs
    path: "./ruleset/scki-mrs-bytedance-domain.mrs"
    interval: 87336
    proxy: "\U0001F6AB 受限网站"
  bytedance-ipcidr:
    type: http
    behavior: ipcidr
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/bytedance-ipcidr.mrs
    path: "./ruleset/scki-mrs-bytedance-ipcidr.mrs"
    interval: 87336
    proxy: "\U0001F6AB 受限网站"
  bytedance-classical:
    type: http
    behavior: classical
    format: yaml
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/bytedance-classical.yaml
    path: "./ruleset/scki-mrs-bytedance-classical.yaml"
    interval: 87336
    proxy: "\U0001F6AB 受限网站"
  kuaishou:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/kuaishou.mrs
    path: "./ruleset/scki-mrs-kuaishou.mrs"
    interval: 87339
    proxy: "\U0001F6AB 受限网站"
  weibo:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/weibo.mrs
    path: "./ruleset/scki-mrs-weibo.mrs"
    interval: 87384
    proxy: "\U0001F6AB 受限网站"
  xiaohongshu:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/xiaohongshu.mrs
    path: "./ruleset/scki-mrs-xiaohongshu.mrs"
    interval: 87357
    proxy: "\U0001F6AB 受限网站"
  neteasemusic-domain:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/neteasemusic-domain.mrs
    path: "./ruleset/scki-mrs-neteasemusic-domain.mrs"
    interval: 87376
    proxy: "\U0001F6AB 受限网站"
  neteasemusic-ipcidr:
    type: http
    behavior: ipcidr
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/neteasemusic-ipcidr.mrs
    path: "./ruleset/scki-mrs-neteasemusic-ipcidr.mrs"
    interval: 87376
    proxy: "\U0001F6AB 受限网站"
  kugoukuwo-domain:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/kugoukuwo-domain.mrs
    path: "./ruleset/scki-mrs-kugoukuwo-domain.mrs"
    interval: 87413
    proxy: "\U0001F6AB 受限网站"
  kugoukuwo-ipcidr:
    type: http
    behavior: ipcidr
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/kugoukuwo-ipcidr.mrs
    path: "./ruleset/scki-mrs-kugoukuwo-ipcidr.mrs"
    interval: 87413
    proxy: "\U0001F6AB 受限网站"
  sohu:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/sohu.mrs
    path: "./ruleset/scki-mrs-sohu.mrs"
    interval: 87402
    proxy: "\U0001F6AB 受限网站"
  douyu:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/douyu.mrs
    path: "./ruleset/scki-mrs-douyu.mrs"
    interval: 87422
    proxy: "\U0001F6AB 受限网站"
  huya:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/huya.mrs
    path: "./ruleset/scki-mrs-huya.mrs"
    interval: 87436
    proxy: "\U0001F6AB 受限网站"
  himalaya:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/himalaya.mrs
    path: "./ruleset/scki-mrs-himalaya.mrs"
    interval: 87453
    proxy: "\U0001F6AB 受限网站"
  cctv:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/cctv.mrs
    path: "./ruleset/scki-mrs-cctv.mrs"
    interval: 87522
    proxy: "\U0001F6AB 受限网站"
  hunantv:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/hunantv.mrs
    path: "./ruleset/scki-mrs-hunantv.mrs"
    interval: 87509
    proxy: "\U0001F6AB 受限网站"
  pptv:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/pptv.mrs
    path: "./ruleset/scki-mrs-pptv.mrs"
    interval: 87512
    proxy: "\U0001F6AB 受限网站"
  funshion:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/funshion.mrs
    path: "./ruleset/scki-mrs-funshion.mrs"
    interval: 87568
    proxy: "\U0001F6AB 受限网站"
  letv:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/letv.mrs
    path: "./ruleset/scki-mrs-letv.mrs"
    interval: 87574
    proxy: "\U0001F6AB 受限网站"
  taihemusic:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/taihemusic.mrs
    path: "./ruleset/scki-mrs-taihemusic.mrs"
    interval: 87581
    proxy: "\U0001F6AB 受限网站"
  kukemusic:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/kukemusic.mrs
    path: "./ruleset/scki-mrs-kukemusic.mrs"
    interval: 87556
    proxy: "\U0001F6AB 受限网站"
  hibymusic:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/hibymusic.mrs
    path: "./ruleset/scki-mrs-hibymusic.mrs"
    interval: 87601
    proxy: "\U0001F6AB 受限网站"
  miwu:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/miwu.mrs
    path: "./ruleset/scki-mrs-miwu.mrs"
    interval: 87644
    proxy: "\U0001F6AB 受限网站"
  migu:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/migu.mrs
    path: "./ruleset/scki-mrs-migu.mrs"
    interval: 87633
    proxy: "\U0001F6AB 受限网站"
  iptvmainland:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/iptvmainland.mrs
    path: "./ruleset/scki-mrs-iptvmainland.mrs"
    interval: 87649
    proxy: "\U0001F6AB 受限网站"
  iptvother:
    type: http
    behavior: ipcidr
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/iptvother.mrs
    path: "./ruleset/scki-mrs-iptvother.mrs"
    interval: 87654
    proxy: "\U0001F6AB 受限网站"
  cibn:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/cibn.mrs
    path: "./ruleset/scki-mrs-cibn.mrs"
    interval: 87672
    proxy: "\U0001F6AB 受限网站"
  bestv:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/bestv.mrs
    path: "./ruleset/scki-mrs-bestv.mrs"
    interval: 87674
    proxy: "\U0001F6AB 受限网站"
  huashutv:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/huashutv.mrs
    path: "./ruleset/scki-mrs-huashutv.mrs"
    interval: 87677
    proxy: "\U0001F6AB 受限网站"
  smg:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/smg.mrs
    path: "./ruleset/scki-mrs-smg.mrs"
    interval: 87720
    proxy: "\U0001F6AB 受限网站"
  hwtv:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/hwtv.mrs
    path: "./ruleset/scki-mrs-hwtv.mrs"
    interval: 87718
    proxy: "\U0001F6AB 受限网站"
  nivodtv:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/nivodtv.mrs
    path: "./ruleset/scki-mrs-nivodtv.mrs"
    interval: 87752
    proxy: "\U0001F6AB 受限网站"
  olevod:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/olevod.mrs
    path: "./ruleset/scki-mrs-olevod.mrs"
    interval: 87761
    proxy: "\U0001F6AB 受限网站"
  dandanzan:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/dandanzan.mrs
    path: "./ruleset/scki-mrs-dandanzan.mrs"
    interval: 87769
    proxy: "\U0001F6AB 受限网站"
  dandanplay:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/dandanplay.mrs
    path: "./ruleset/scki-mrs-dandanplay.mrs"
    interval: 87821
    proxy: "\U0001F6AB 受限网站"
  tiantiankankan:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/tiantiankankan.mrs
    path: "./ruleset/scki-mrs-tiantiankankan.mrs"
    interval: 87835
    proxy: "\U0001F6AB 受限网站"
  yizhibo:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/yizhibo.mrs
    path: "./ruleset/scki-mrs-yizhibo.mrs"
    interval: 87800
    proxy: "\U0001F6AB 受限网站"
  ku6:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/ku6.mrs
    path: "./ruleset/scki-mrs-ku6.mrs"
    interval: 87828
    proxy: "\U0001F6AB 受限网站"
  cetv:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/cetv.mrs
    path: "./ruleset/scki-mrs-cetv.mrs"
    interval: 87865
    proxy: "\U0001F6AB 受限网站"
  yyets:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/yyets.mrs
    path: "./ruleset/scki-mrs-yyets.mrs"
    interval: 87909
    proxy: "\U0001F6AB 受限网站"
  asianmedia-domain:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/asianmedia-domain.mrs
    path: "./ruleset/scki-mrs-asianmedia-domain.mrs"
    interval: 87888
    proxy: "\U0001F6AB 受限网站"
  asianmedia-ipcidr:
    type: http
    behavior: ipcidr
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/asianmedia-ipcidr.mrs
    path: "./ruleset/scki-mrs-asianmedia-ipcidr.mrs"
    interval: 87888
    proxy: "\U0001F6AB 受限网站"
  iqiyiintl-domain:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/iqiyiintl-domain.mrs
    path: "./ruleset/scki-mrs-iqiyiintl-domain.mrs"
    interval: 87910
    proxy: "\U0001F6AB 受限网站"
  iqiyiintl-ipcidr:
    type: http
    behavior: ipcidr
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/iqiyiintl-ipcidr.mrs
    path: "./ruleset/scki-mrs-iqiyiintl-ipcidr.mrs"
    interval: 87910
    proxy: "\U0001F6AB 受限网站"
  iqiyiintl-classical:
    type: http
    behavior: classical
    format: yaml
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/iqiyiintl-classical.yaml
    path: "./ruleset/scki-mrs-iqiyiintl-classical.yaml"
    interval: 87910
    proxy: "\U0001F6AB 受限网站"
  joox-domain:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/joox-domain.mrs
    path: "./ruleset/scki-mrs-joox-domain.mrs"
    interval: 87939
    proxy: "\U0001F6AB 受限网站"
  joox-ipcidr:
    type: http
    behavior: ipcidr
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/joox-ipcidr.mrs
    path: "./ruleset/scki-mrs-joox-ipcidr.mrs"
    interval: 87939
    proxy: "\U0001F6AB 受限网站"
  joox-classical:
    type: http
    behavior: classical
    format: yaml
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/joox-classical.yaml
    path: "./ruleset/scki-mrs-joox-classical.yaml"
    interval: 87939
    proxy: "\U0001F6AB 受限网站"
  mewatch:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/mewatch.mrs
    path: "./ruleset/scki-mrs-mewatch.mrs"
    interval: 87930
    proxy: "\U0001F6AB 受限网站"
  viki:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/viki.mrs
    path: "./ruleset/scki-mrs-viki.mrs"
    interval: 87961
    proxy: "\U0001F6AB 受限网站"
  wetv-domain:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/wetv-domain.mrs
    path: "./ruleset/scki-mrs-wetv-domain.mrs"
    interval: 87968
    proxy: "\U0001F6AB 受限网站"
  wetv-ipcidr:
    type: http
    behavior: ipcidr
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/wetv-ipcidr.mrs
    path: "./ruleset/scki-mrs-wetv-ipcidr.mrs"
    interval: 87968
    proxy: "\U0001F6AB 受限网站"
  wetv-classical:
    type: http
    behavior: classical
    format: yaml
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/wetv-classical.yaml
    path: "./ruleset/scki-mrs-wetv-classical.yaml"
    interval: 87968
    proxy: "\U0001F6AB 受限网站"
  zee:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/zee.mrs
    path: "./ruleset/scki-mrs-zee.mrs"
    interval: 88013
    proxy: "\U0001F6AB 受限网站"
  cbs-domain:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/cbs-domain.mrs
    path: "./ruleset/scki-mrs-cbs-domain.mrs"
    interval: 87975
    proxy: "\U0001F6AB 受限网站"
  cbs-classical:
    type: http
    behavior: classical
    format: yaml
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/cbs-classical.yaml
    path: "./ruleset/scki-mrs-cbs-classical.yaml"
    interval: 87975
    proxy: "\U0001F6AB 受限网站"
  nbc:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/nbc.mrs
    path: "./ruleset/scki-mrs-nbc.mrs"
    interval: 87990
    proxy: "\U0001F6AB 受限网站"
  pbs:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/pbs.mrs
    path: "./ruleset/scki-mrs-pbs.mrs"
    interval: 88022
    proxy: "\U0001F6AB 受限网站"
  attwatchtv:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/attwatchtv.mrs
    path: "./ruleset/scki-mrs-attwatchtv.mrs"
    interval: 88074
    proxy: "\U0001F6AB 受限网站"
  fox:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/fox.mrs
    path: "./ruleset/scki-mrs-fox.mrs"
    interval: 88081
    proxy: "\U0001F6AB 受限网站"
  fubotv:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/fubotv.mrs
    path: "./ruleset/scki-mrs-fubotv.mrs"
    interval: 88100
    proxy: "\U0001F6AB 受限网站"
  sling:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/sling.mrs
    path: "./ruleset/scki-mrs-sling.mrs"
    interval: 88103
    proxy: "\U0001F6AB 受限网站"
  soundcloud:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/soundcloud.mrs
    path: "./ruleset/scki-mrs-soundcloud.mrs"
    interval: 88085
    proxy: "\U0001F6AB 受限网站"
  pandora:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/pandora.mrs
    path: "./ruleset/scki-mrs-pandora.mrs"
    interval: 88131
    proxy: "\U0001F6AB 受限网站"
  pandoratv:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/pandoratv.mrs
    path: "./ruleset/scki-mrs-pandoratv.mrs"
    interval: 88163
    proxy: "\U0001F6AB 受限网站"
  tidal:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/tidal.mrs
    path: "./ruleset/scki-mrs-tidal.mrs"
    interval: 88128
    proxy: "\U0001F6AB 受限网站"
  vimeo:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/vimeo.mrs
    path: "./ruleset/scki-mrs-vimeo.mrs"
    interval: 88156
    proxy: "\U0001F6AB 受限网站"
  dailymotion:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/dailymotion.mrs
    path: "./ruleset/scki-mrs-dailymotion.mrs"
    interval: 88176
    proxy: "\U0001F6AB 受限网站"
  deezer:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/deezer.mrs
    path: "./ruleset/scki-mrs-deezer.mrs"
    interval: 88197
    proxy: "\U0001F6AB 受限网站"
  discoveryplus:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/discoveryplus.mrs
    path: "./ruleset/scki-mrs-discoveryplus.mrs"
    interval: 88188
    proxy: "\U0001F6AB 受限网站"
  overcast:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/overcast.mrs
    path: "./ruleset/scki-mrs-overcast.mrs"
    interval: 88212
    proxy: "\U0001F6AB 受限网站"
  americasvoice:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/americasvoice.mrs
    path: "./ruleset/scki-mrs-americasvoice.mrs"
    interval: 88217
    proxy: "\U0001F6AB 受限网站"
  cake:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/cake.mrs
    path: "./ruleset/scki-mrs-cake.mrs"
    interval: 88236
    proxy: "\U0001F6AB 受限网站"
  dood:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/dood.mrs
    path: "./ruleset/scki-mrs-dood.mrs"
    interval: 88257
    proxy: "\U0001F6AB 受限网站"
  ehgallery-domain:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/ehgallery-domain.mrs
    path: "./ruleset/scki-mrs-ehgallery-domain.mrs"
    interval: 88314
    proxy: "\U0001F6AB 受限网站"
  ehgallery-ipcidr:
    type: http
    behavior: ipcidr
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/ehgallery-ipcidr.mrs
    path: "./ruleset/scki-mrs-ehgallery-ipcidr.mrs"
    interval: 88314
    proxy: "\U0001F6AB 受限网站"
  lastfm:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/lastfm.mrs
    path: "./ruleset/scki-mrs-lastfm.mrs"
    interval: 88285
    proxy: "\U0001F6AB 受限网站"
  emby-domain:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/emby-domain.mrs
    path: "./ruleset/scki-mrs-emby-domain.mrs"
    interval: 88334
    proxy: "\U0001F6AB 受限网站"
  emby-classical:
    type: http
    behavior: classical
    format: yaml
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/emby-classical.yaml
    path: "./ruleset/scki-mrs-emby-classical.yaml"
    interval: 88334
    proxy: "\U0001F6AB 受限网站"
  mytvsuper:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/mytvsuper.mrs
    path: "./ruleset/scki-mrs-mytvsuper.mrs"
    interval: 88346
    proxy: "\U0001F6AB 受限网站"
  tvb:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/tvb.mrs
    path: "./ruleset/scki-mrs-tvb.mrs"
    interval: 88367
    proxy: "\U0001F6AB 受限网站"
  nowe:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/nowe.mrs
    path: "./ruleset/scki-mrs-nowe.mrs"
    interval: 88386
    proxy: "\U0001F6AB 受限网站"
  rthk:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/rthk.mrs
    path: "./ruleset/scki-mrs-rthk.mrs"
    interval: 88373
    proxy: "\U0001F6AB 受限网站"
  cabletv:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/cabletv.mrs
    path: "./ruleset/scki-mrs-cabletv.mrs"
    interval: 88410
    proxy: "\U0001F6AB 受限网站"
  moov:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/moov.mrs
    path: "./ruleset/scki-mrs-moov.mrs"
    interval: 88396
    proxy: "\U0001F6AB 受限网站"
  litv:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/litv.mrs
    path: "./ruleset/scki-mrs-litv.mrs"
    interval: 88434
    proxy: "\U0001F6AB 受限网站"
  friday:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/friday.mrs
    path: "./ruleset/scki-mrs-friday.mrs"
    interval: 88475
    proxy: "\U0001F6AB 受限网站"
  hamivideo:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/hamivideo.mrs
    path: "./ruleset/scki-mrs-hamivideo.mrs"
    interval: 88451
    proxy: "\U0001F6AB 受限网站"
  linetv-domain:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/linetv-domain.mrs
    path: "./ruleset/scki-mrs-linetv-domain.mrs"
    interval: 88499
    proxy: "\U0001F6AB 受限网站"
  linetv-classical:
    type: http
    behavior: classical
    format: yaml
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/linetv-classical.yaml
    path: "./ruleset/scki-mrs-linetv-classical.yaml"
    interval: 88499
    proxy: "\U0001F6AB 受限网站"
  vidoltv:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/vidoltv.mrs
    path: "./ruleset/scki-mrs-vidoltv.mrs"
    interval: 88474
    proxy: "\U0001F6AB 受限网站"
  taiwangood:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/taiwangood.mrs
    path: "./ruleset/scki-mrs-taiwangood.mrs"
    interval: 88525
    proxy: "\U0001F6AB 受限网站"
  cht:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/cht.mrs
    path: "./ruleset/scki-mrs-cht.mrs"
    interval: 88543
    proxy: "\U0001F6AB 受限网站"
  dmm-domain:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/dmm-domain.mrs
    path: "./ruleset/scki-mrs-dmm-domain.mrs"
    interval: 88559
    proxy: "\U0001F6AB 受限网站"
  dmm-ipcidr:
    type: http
    behavior: ipcidr
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/dmm-ipcidr.mrs
    path: "./ruleset/scki-mrs-dmm-ipcidr.mrs"
    interval: 88559
    proxy: "\U0001F6AB 受限网站"
  tver:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/tver.mrs
    path: "./ruleset/scki-mrs-tver.mrs"
    interval: 88571
    proxy: "\U0001F6AB 受限网站"
  niconico:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/niconico.mrs
    path: "./ruleset/scki-mrs-niconico.mrs"
    interval: 88586
    proxy: "\U0001F6AB 受限网站"
  rakuten:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/rakuten.mrs
    path: "./ruleset/scki-mrs-rakuten.mrs"
    interval: 88563
    proxy: "\U0001F6AB 受限网站"
  japonx:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/japonx.mrs
    path: "./ruleset/scki-mrs-japonx.mrs"
    interval: 88595
    proxy: "\U0001F6AB 受限网站"
  nikkei:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/nikkei.mrs
    path: "./ruleset/scki-mrs-nikkei.mrs"
    interval: 88645
    proxy: "\U0001F6AB 受限网站"
  itv:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/itv.mrs
    path: "./ruleset/scki-mrs-itv.mrs"
    interval: 88608
    proxy: "\U0001F6AB 受限网站"
  all4:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/all4.mrs
    path: "./ruleset/scki-mrs-all4.mrs"
    interval: 88656
    proxy: "\U0001F6AB 受限网站"
  my5:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/my5.mrs
    path: "./ruleset/scki-mrs-my5.mrs"
    interval: 88658
    proxy: "\U0001F6AB 受限网站"
  skygo:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/skygo.mrs
    path: "./ruleset/scki-mrs-skygo.mrs"
    interval: 88664
    proxy: "\U0001F6AB 受限网站"
  britboxuk:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/britboxuk.mrs
    path: "./ruleset/scki-mrs-britboxuk.mrs"
    interval: 88668
    proxy: "\U0001F6AB 受限网站"
  londonreal:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/londonreal.mrs
    path: "./ruleset/scki-mrs-londonreal.mrs"
    interval: 88703
    proxy: "\U0001F6AB 受限网站"
  qobuz-domain:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/qobuz-domain.mrs
    path: "./ruleset/scki-mrs-qobuz-domain.mrs"
    interval: 88695
    proxy: "\U0001F6AB 受限网站"
  qobuz-ipcidr:
    type: http
    behavior: ipcidr
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/qobuz-ipcidr.mrs
    path: "./ruleset/scki-mrs-qobuz-ipcidr.mrs"
    interval: 88695
    proxy: "\U0001F6AB 受限网站"
  steamcn:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/steamcn.mrs
    path: "./ruleset/scki-mrs-steamcn.mrs"
    interval: 88721
    proxy: "\U0001F6AB 受限网站"
  wanmeishijie:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/wanmeishijie.mrs
    path: "./ruleset/scki-mrs-wanmeishijie.mrs"
    interval: 88729
    proxy: "\U0001F6AB 受限网站"
  wankahuanju:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/wankahuanju.mrs
    path: "./ruleset/scki-mrs-wankahuanju.mrs"
    interval: 88754
    proxy: "\U0001F6AB 受限网站"
  majsoul:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/majsoul.mrs
    path: "./ruleset/scki-mrs-majsoul.mrs"
    interval: 88774
    proxy: "\U0001F6AB 受限网站"
  rockstar:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/rockstar.mrs
    path: "./ruleset/scki-mrs-rockstar.mrs"
    interval: 88822
    proxy: "\U0001F6AB 受限网站"
  riot:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/riot.mrs
    path: "./ruleset/scki-mrs-riot.mrs"
    interval: 88824
    proxy: "\U0001F6AB 受限网站"
  gog:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/gog.mrs
    path: "./ruleset/scki-mrs-gog.mrs"
    interval: 88829
    proxy: "\U0001F6AB 受限网站"
  supercell-domain:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/supercell-domain.mrs
    path: "./ruleset/scki-mrs-supercell-domain.mrs"
    interval: 88873
    proxy: "\U0001F6AB 受限网站"
  supercell-ipcidr:
    type: http
    behavior: ipcidr
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/supercell-ipcidr.mrs
    path: "./ruleset/scki-mrs-supercell-ipcidr.mrs"
    interval: 88873
    proxy: "\U0001F6AB 受限网站"
  garena:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/garena.mrs
    path: "./ruleset/scki-mrs-garena.mrs"
    interval: 88833
    proxy: "\U0001F6AB 受限网站"
  hoyoverse:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/hoyoverse.mrs
    path: "./ruleset/scki-mrs-hoyoverse.mrs"
    interval: 88903
    proxy: "\U0001F6AB 受限网站"
  ubi:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/ubi.mrs
    path: "./ruleset/scki-mrs-ubi.mrs"
    interval: 88883
    proxy: "\U0001F6AB 受限网站"
  sony:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/sony.mrs
    path: "./ruleset/scki-mrs-sony.mrs"
    interval: 88901
    proxy: "\U0001F6AB 受限网站"
  yandex-domain:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/yandex-domain.mrs
    path: "./ruleset/scki-mrs-yandex-domain.mrs"
    interval: 88922
    proxy: "\U0001F6AB 受限网站"
  yandex-ipcidr:
    type: http
    behavior: ipcidr
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/yandex-ipcidr.mrs
    path: "./ruleset/scki-mrs-yandex-ipcidr.mrs"
    interval: 88922
    proxy: "\U0001F6AB 受限网站"
  naver-domain:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/naver-domain.mrs
    path: "./ruleset/scki-mrs-naver-domain.mrs"
    interval: 88997
    proxy: "\U0001F6AB 受限网站"
  naver-ipcidr:
    type: http
    behavior: ipcidr
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/naver-ipcidr.mrs
    path: "./ruleset/scki-mrs-naver-ipcidr.mrs"
    interval: 88997
    proxy: "\U0001F6AB 受限网站"
  naver-classical:
    type: http
    behavior: classical
    format: yaml
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/naver-classical.yaml
    path: "./ruleset/scki-mrs-naver-classical.yaml"
    interval: 88997
    proxy: "\U0001F6AB 受限网站"
  scholar:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/scholar.mrs
    path: "./ruleset/scki-mrs-scholar.mrs"
    interval: 89020
    proxy: "\U0001F6AB 受限网站"
  developer:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/developer.mrs
    path: "./ruleset/scki-mrs-developer.mrs"
    interval: 89033
    proxy: "\U0001F6AB 受限网站"
  python:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/python.mrs
    path: "./ruleset/scki-mrs-python.mrs"
    interval: 89030
    proxy: "\U0001F6AB 受限网站"
  gitbook:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/gitbook.mrs
    path: "./ruleset/scki-mrs-gitbook.mrs"
    interval: 89022
    proxy: "\U0001F6AB 受限网站"
  jfrog:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/jfrog.mrs
    path: "./ruleset/scki-mrs-jfrog.mrs"
    interval: 89033
    proxy: "\U0001F6AB 受限网站"
  sublimetext:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/sublimetext.mrs
    path: "./ruleset/scki-mrs-sublimetext.mrs"
    interval: 89048
    proxy: "\U0001F6AB 受限网站"
  wordpress:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/wordpress.mrs
    path: "./ruleset/scki-mrs-wordpress.mrs"
    interval: 89099
    proxy: "\U0001F6AB 受限网站"
  wix:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/wix.mrs
    path: "./ruleset/scki-mrs-wix.mrs"
    interval: 89124
    proxy: "\U0001F6AB 受限网站"
  cisco:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/cisco.mrs
    path: "./ruleset/scki-mrs-cisco.mrs"
    interval: 89107
    proxy: "\U0001F6AB 受限网站"
  ibm:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/ibm.mrs
    path: "./ruleset/scki-mrs-ibm.mrs"
    interval: 89102
    proxy: "\U0001F6AB 受限网站"
  oracle:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/oracle.mrs
    path: "./ruleset/scki-mrs-oracle.mrs"
    interval: 89126
    proxy: "\U0001F6AB 受限网站"
  unity-domain:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/unity-domain.mrs
    path: "./ruleset/scki-mrs-unity-domain.mrs"
    interval: 89152
    proxy: "\U0001F6AB 受限网站"
  unity-classical:
    type: http
    behavior: classical
    format: yaml
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/unity-classical.yaml
    path: "./ruleset/scki-mrs-unity-classical.yaml"
    interval: 89152
    proxy: "\U0001F6AB 受限网站"
  microsoftedge:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/microsoftedge.mrs
    path: "./ruleset/scki-mrs-microsoftedge.mrs"
    interval: 89172
    proxy: "\U0001F6AB 受限网站"
  appstore:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/appstore.mrs
    path: "./ruleset/scki-mrs-appstore.mrs"
    interval: 89193
    proxy: "\U0001F6AB 受限网站"
  appletv-domain:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/appletv-domain.mrs
    path: "./ruleset/scki-mrs-appletv-domain.mrs"
    interval: 89194
    proxy: "\U0001F6AB 受限网站"
  appletv-classical:
    type: http
    behavior: classical
    format: yaml
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/appletv-classical.yaml
    path: "./ruleset/scki-mrs-appletv-classical.yaml"
    interval: 89194
    proxy: "\U0001F6AB 受限网站"
  applenews:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/applenews.mrs
    path: "./ruleset/scki-mrs-applenews.mrs"
    interval: 89200
    proxy: "\U0001F6AB 受限网站"
  appledev:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/appledev.mrs
    path: "./ruleset/scki-mrs-appledev.mrs"
    interval: 89260
    proxy: "\U0001F6AB 受限网站"
  appleproxy-domain:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/appleproxy-domain.mrs
    path: "./ruleset/scki-mrs-appleproxy-domain.mrs"
    interval: 89254
    proxy: "\U0001F6AB 受限网站"
  appleproxy-classical:
    type: http
    behavior: classical
    format: yaml
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/appleproxy-classical.yaml
    path: "./ruleset/scki-mrs-appleproxy-classical.yaml"
    interval: 89254
    proxy: "\U0001F6AB 受限网站"
  siri:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/siri.mrs
    path: "./ruleset/scki-mrs-siri.mrs"
    interval: 89265
    proxy: "\U0001F6AB 受限网站"
  testflight:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/testflight.mrs
    path: "./ruleset/scki-mrs-testflight.mrs"
    interval: 89282
    proxy: "\U0001F6AB 受限网站"
  applefirmware-domain:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/applefirmware-domain.mrs
    path: "./ruleset/scki-mrs-applefirmware-domain.mrs"
    interval: 89305
    proxy: "\U0001F6AB 受限网站"
  applefirmware-classical:
    type: http
    behavior: classical
    format: yaml
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/applefirmware-classical.yaml
    path: "./ruleset/scki-mrs-applefirmware-classical.yaml"
    interval: 89305
    proxy: "\U0001F6AB 受限网站"
  download-domain:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/download-domain.mrs
    path: "./ruleset/scki-mrs-download-domain.mrs"
    interval: 89335
    proxy: "\U0001F6AB 受限网站"
  download-classical:
    type: http
    behavior: classical
    format: yaml
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/download-classical.yaml
    path: "./ruleset/scki-mrs-download-classical.yaml"
    interval: 89335
    proxy: "\U0001F6AB 受限网站"
  ubuntu:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/ubuntu.mrs
    path: "./ruleset/scki-mrs-ubuntu.mrs"
    interval: 89345
    proxy: "\U0001F6AB 受限网站"
  mozilla:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/mozilla.mrs
    path: "./ruleset/scki-mrs-mozilla.mrs"
    interval: 89368
    proxy: "\U0001F6AB 受限网站"
  apkpure:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/apkpure.mrs
    path: "./ruleset/scki-mrs-apkpure.mrs"
    interval: 89352
    proxy: "\U0001F6AB 受限网站"
  android:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/android.mrs
    path: "./ruleset/scki-mrs-android.mrs"
    interval: 89411
    proxy: "\U0001F6AB 受限网站"
  googlefcm-domain:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/googlefcm-domain.mrs
    path: "./ruleset/scki-mrs-googlefcm-domain.mrs"
    interval: 89382
    proxy: "\U0001F6AB 受限网站"
  googlefcm-ipcidr:
    type: http
    behavior: ipcidr
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/googlefcm-ipcidr.mrs
    path: "./ruleset/scki-mrs-googlefcm-ipcidr.mrs"
    interval: 89382
    proxy: "\U0001F6AB 受限网站"
  intel:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/intel.mrs
    path: "./ruleset/scki-mrs-intel.mrs"
    interval: 89435
    proxy: "\U0001F6AB 受限网站"
  nvidia:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/nvidia.mrs
    path: "./ruleset/scki-mrs-nvidia.mrs"
    interval: 89446
    proxy: "\U0001F6AB 受限网站"
  dell:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/dell.mrs
    path: "./ruleset/scki-mrs-dell.mrs"
    interval: 89456
    proxy: "\U0001F6AB 受限网站"
  hp:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/hp.mrs
    path: "./ruleset/scki-mrs-hp.mrs"
    interval: 89477
    proxy: "\U0001F6AB 受限网站"
  canon:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/canon.mrs
    path: "./ruleset/scki-mrs-canon.mrs"
    interval: 89485
    proxy: "\U0001F6AB 受限网站"
  lg-domain:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/lg-domain.mrs
    path: "./ruleset/scki-mrs-lg-domain.mrs"
    interval: 89499
    proxy: "\U0001F6AB 受限网站"
  lg-ipcidr:
    type: http
    behavior: ipcidr
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/lg-ipcidr.mrs
    path: "./ruleset/scki-mrs-lg-ipcidr.mrs"
    interval: 89499
    proxy: "\U0001F6AB 受限网站"
  cloudflare-domain:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/cloudflare-domain.mrs
    path: "./ruleset/scki-mrs-cloudflare-domain.mrs"
    interval: 89494
    proxy: "\U0001F6AB 受限网站"
  cloudflare-ipcidr:
    type: http
    behavior: ipcidr
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/cloudflare-ipcidr.mrs
    path: "./ruleset/scki-mrs-cloudflare-ipcidr.mrs"
    interval: 89494
    proxy: "\U0001F6AB 受限网站"
  akamai:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/akamai.mrs
    path: "./ruleset/scki-mrs-akamai.mrs"
    interval: 89513
    proxy: "\U0001F6AB 受限网站"
  digicert:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/digicert.mrs
    path: "./ruleset/scki-mrs-digicert.mrs"
    interval: 89535
    proxy: "\U0001F6AB 受限网站"
  globalsign:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/globalsign.mrs
    path: "./ruleset/scki-mrs-globalsign.mrs"
    interval: 89547
    proxy: "\U0001F6AB 受限网站"
  sectigo:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/sectigo.mrs
    path: "./ruleset/scki-mrs-sectigo.mrs"
    interval: 89550
    proxy: "\U0001F6AB 受限网站"
  brightcove:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/brightcove.mrs
    path: "./ruleset/scki-mrs-brightcove.mrs"
    interval: 89551
    proxy: "\U0001F6AB 受限网站"
  jwplayer:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/jwplayer.mrs
    path: "./ruleset/scki-mrs-jwplayer.mrs"
    interval: 89618
    proxy: "\U0001F6AB 受限网站"
  privatetracker-domain:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/privatetracker-domain.mrs
    path: "./ruleset/scki-mrs-privatetracker-domain.mrs"
    interval: 89594
    proxy: "\U0001F6AB 受限网站"
  privatetracker-ipcidr:
    type: http
    behavior: ipcidr
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/privatetracker-ipcidr.mrs
    path: "./ruleset/scki-mrs-privatetracker-ipcidr.mrs"
    interval: 89594
    proxy: "\U0001F6AB 受限网站"
  cnn:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/cnn.mrs
    path: "./ruleset/scki-mrs-cnn.mrs"
    interval: 89641
    proxy: "\U0001F6AB 受限网站"
  nytimes:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/nytimes.mrs
    path: "./ruleset/scki-mrs-nytimes.mrs"
    interval: 89655
    proxy: "\U0001F6AB 受限网站"
  bloomberg:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/bloomberg.mrs
    path: "./ruleset/scki-mrs-bloomberg.mrs"
    interval: 89666
    proxy: "\U0001F6AB 受限网站"
  ebay:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/ebay.mrs
    path: "./ruleset/scki-mrs-ebay.mrs"
    interval: 89673
    proxy: "\U0001F6AB 受限网站"
  nike:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/nike.mrs
    path: "./ruleset/scki-mrs-nike.mrs"
    interval: 89699
    proxy: "\U0001F6AB 受限网站"
  adobe:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/adobe.mrs
    path: "./ruleset/scki-mrs-adobe.mrs"
    interval: 89678
    proxy: "\U0001F6AB 受限网站"
  samsung:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/samsung.mrs
    path: "./ruleset/scki-mrs-samsung.mrs"
    interval: 89696
    proxy: "\U0001F6AB 受限网站"
  tesla:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/tesla.mrs
    path: "./ruleset/scki-mrs-tesla.mrs"
    interval: 89702
    proxy: "\U0001F6AB 受限网站"
  dropbox:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/dropbox.mrs
    path: "./ruleset/scki-mrs-dropbox.mrs"
    interval: 89762
    proxy: "\U0001F6AB 受限网站"
  mega-domain:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/mega-domain.mrs
    path: "./ruleset/scki-mrs-mega-domain.mrs"
    interval: 89762
    proxy: "\U0001F6AB 受限网站"
  mega-ipcidr:
    type: http
    behavior: ipcidr
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/mega-ipcidr.mrs
    path: "./ruleset/scki-mrs-mega-ipcidr.mrs"
    interval: 89762
    proxy: "\U0001F6AB 受限网站"
  mega-classical:
    type: http
    behavior: classical
    format: yaml
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/mega-classical.yaml
    path: "./ruleset/scki-mrs-mega-classical.yaml"
    interval: 89762
    proxy: "\U0001F6AB 受限网站"
  wikipedia:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/wikipedia.mrs
    path: "./ruleset/scki-mrs-wikipedia.mrs"
    interval: 89758
    proxy: "\U0001F6AB 受限网站"
  duolingo:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/duolingo.mrs
    path: "./ruleset/scki-mrs-duolingo.mrs"
    interval: 89784
    proxy: "\U0001F6AB 受限网站"
  sukka-phishing:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/sukka-phishing.mrs
    path: "./ruleset/scki-mrs-sukka-phishing.mrs"
    interval: 89786
    proxy: "\U0001F6AB 受限网站"
  hagezi-tif:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/MiHomoer/MiHomo-Hagezi@release/HageziUltimate.mrs
    path: "./ruleset/hagezi-tif.mrs"
    interval: 89809
    proxy: "\U0001F6AB 受限网站"
  szkane-ai-domain:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/szkane-ai-domain.mrs
    path: "./ruleset/scki-mrs-szkane-ai-domain.mrs"
    interval: 89808
    proxy: "\U0001F6AB 受限网站"
  szkane-ai-ipcidr:
    type: http
    behavior: ipcidr
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/szkane-ai-ipcidr.mrs
    path: "./ruleset/scki-mrs-szkane-ai-ipcidr.mrs"
    interval: 89808
    proxy: "\U0001F6AB 受限网站"
  szkane-ai-classical:
    type: http
    behavior: classical
    format: yaml
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/szkane-ai-classical.yaml
    path: "./ruleset/scki-mrs-szkane-ai-classical.yaml"
    interval: 89808
    proxy: "\U0001F6AB 受限网站"
  szkane-ciciai-domain:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/szkane-ciciai-domain.mrs
    path: "./ruleset/scki-mrs-szkane-ciciai-domain.mrs"
    interval: 89844
    proxy: "\U0001F6AB 受限网站"
  szkane-ciciai-ipcidr:
    type: http
    behavior: ipcidr
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/szkane-ciciai-ipcidr.mrs
    path: "./ruleset/scki-mrs-szkane-ciciai-ipcidr.mrs"
    interval: 89844
    proxy: "\U0001F6AB 受限网站"
  szkane-ciciai-classical:
    type: http
    behavior: classical
    format: yaml
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/szkane-ciciai-classical.yaml
    path: "./ruleset/scki-mrs-szkane-ciciai-classical.yaml"
    interval: 89844
    proxy: "\U0001F6AB 受限网站"
  szkane-web3-domain:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/szkane-web3-domain.mrs
    path: "./ruleset/scki-mrs-szkane-web3-domain.mrs"
    interval: 89850
    proxy: "\U0001F6AB 受限网站"
  szkane-web3-classical:
    type: http
    behavior: classical
    format: yaml
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/szkane-web3-classical.yaml
    path: "./ruleset/scki-mrs-szkane-web3-classical.yaml"
    interval: 89850
    proxy: "\U0001F6AB 受限网站"
  szkane-developer-domain:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/szkane-developer-domain.mrs
    path: "./ruleset/scki-mrs-szkane-developer-domain.mrs"
    interval: 89873
    proxy: "\U0001F6AB 受限网站"
  szkane-developer-classical:
    type: http
    behavior: classical
    format: yaml
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/szkane-developer-classical.yaml
    path: "./ruleset/scki-mrs-szkane-developer-classical.yaml"
    interval: 89873
    proxy: "\U0001F6AB 受限网站"
  szkane-khan:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/szkane-khan.mrs
    path: "./ruleset/scki-mrs-szkane-khan.mrs"
    interval: 89873
    proxy: "\U0001F6AB 受限网站"
  szkane-edutools:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/szkane-edutools.mrs
    path: "./ruleset/scki-mrs-szkane-edutools.mrs"
    interval: 89927
    proxy: "\U0001F6AB 受限网站"
  szkane-uk:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/szkane-uk.mrs
    path: "./ruleset/scki-mrs-szkane-uk.mrs"
    interval: 89896
    proxy: "\U0001F6AB 受限网站"
  szkane-bilihmt-domain:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/szkane-bilihmt-domain.mrs
    path: "./ruleset/scki-mrs-szkane-bilihmt-domain.mrs"
    interval: 89933
    proxy: "\U0001F6AB 受限网站"
  szkane-bilihmt-ipcidr:
    type: http
    behavior: ipcidr
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/szkane-bilihmt-ipcidr.mrs
    path: "./ruleset/scki-mrs-szkane-bilihmt-ipcidr.mrs"
    interval: 89933
    proxy: "\U0001F6AB 受限网站"
  szkane-netflixip:
    type: http
    behavior: ipcidr
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/szkane-netflixip.mrs
    path: "./ruleset/scki-mrs-szkane-netflixip.mrs"
    interval: 89941
    proxy: "\U0001F6AB 受限网站"
  szkane-proxygfw-domain:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/szkane-proxygfw-domain.mrs
    path: "./ruleset/scki-mrs-szkane-proxygfw-domain.mrs"
    interval: 89998
    proxy: "\U0001F6AB 受限网站"
  szkane-proxygfw-ipcidr:
    type: http
    behavior: ipcidr
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/szkane-proxygfw-ipcidr.mrs
    path: "./ruleset/scki-mrs-szkane-proxygfw-ipcidr.mrs"
    interval: 89998
    proxy: "\U0001F6AB 受限网站"
  loyalsoldier-gfw:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/MetaCubeX/meta-rules-dat@meta/geo/geosite/gfw.mrs
    path: "./ruleset/meta-gfw.mrs"
    interval: 89981
    proxy: "\U0001F6AB 受限网站"
  loyalsoldier-greatfire:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/MetaCubeX/meta-rules-dat@meta/geo/geosite/greatfire.mrs
    path: "./ruleset/meta-greatfire.mrs"
    interval: 90000
    proxy: "\U0001F6AB 受限网站"
  acc-appleai:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/acc-appleai.mrs
    path: "./ruleset/scki-mrs-acc-appleai.mrs"
    interval: 90028
    proxy: "\U0001F6AB 受限网站"
  acc-grok:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/acc-grok.mrs
    path: "./ruleset/scki-mrs-acc-grok.mrs"
    interval: 90049
    proxy: "\U0001F6AB 受限网站"
  acc-gemini:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/acc-gemini.mrs
    path: "./ruleset/scki-mrs-acc-gemini.mrs"
    interval: 90072
    proxy: "\U0001F6AB 受限网站"
  acc-copilot:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/acc-copilot.mrs
    path: "./ruleset/scki-mrs-acc-copilot.mrs"
    interval: 90038
    proxy: "\U0001F6AB 受限网站"
  vpsdance-ai-coding-domain:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/vpsdance-ai-coding-domain.mrs
    path: "./ruleset/scki-mrs-vpsdance-ai-coding-domain.mrs"
    interval: 90131
    proxy: "\U0001F6AB 受限网站"
  vpsdance-ai-coding-ipcidr:
    type: http
    behavior: ipcidr
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/vpsdance-ai-coding-ipcidr.mrs
    path: "./ruleset/scki-mrs-vpsdance-ai-coding-ipcidr.mrs"
    interval: 90131
    proxy: "\U0001F6AB 受限网站"
  vpsdance-ai-coding-classical:
    type: http
    behavior: classical
    format: yaml
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/vpsdance-ai-coding-classical.yaml
    path: "./ruleset/scki-mrs-vpsdance-ai-coding-classical.yaml"
    interval: 90131
    proxy: "\U0001F6AB 受限网站"
  acc-bank-us:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/acc-bank-us.mrs
    path: "./ruleset/scki-mrs-acc-bank-us.mrs"
    interval: 90071
    proxy: "\U0001F6AB 受限网站"
  acc-bank-uk:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/acc-bank-uk.mrs
    path: "./ruleset/scki-mrs-acc-bank-uk.mrs"
    interval: 90079
    proxy: "\U0001F6AB 受限网站"
  acc-bank-hk:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/acc-bank-hk.mrs
    path: "./ruleset/scki-mrs-acc-bank-hk.mrs"
    interval: 90075
    proxy: "\U0001F6AB 受限网站"
  acc-bank-sg:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/acc-bank-sg.mrs
    path: "./ruleset/scki-mrs-acc-bank-sg.mrs"
    interval: 90134
    proxy: "\U0001F6AB 受限网站"
  acc-bank-jp:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/acc-bank-jp.mrs
    path: "./ruleset/scki-mrs-acc-bank-jp.mrs"
    interval: 90138
    proxy: "\U0001F6AB 受限网站"
  acc-bank-au:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/acc-bank-au.mrs
    path: "./ruleset/scki-mrs-acc-bank-au.mrs"
    interval: 90146
    proxy: "\U0001F6AB 受限网站"
  acc-bank-ca:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/acc-bank-ca.mrs
    path: "./ruleset/scki-mrs-acc-bank-ca.mrs"
    interval: 90154
    proxy: "\U0001F6AB 受限网站"
  acc-bank-de:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/acc-bank-de.mrs
    path: "./ruleset/scki-mrs-acc-bank-de.mrs"
    interval: 90205
    proxy: "\U0001F6AB 受限网站"
  acc-bank-nl:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/acc-bank-nl.mrs
    path: "./ruleset/scki-mrs-acc-bank-nl.mrs"
    interval: 90223
    proxy: "\U0001F6AB 受限网站"
  acc-bank-fr:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/acc-bank-fr.mrs
    path: "./ruleset/scki-mrs-acc-bank-fr.mrs"
    interval: 90205
    proxy: "\U0001F6AB 受限网站"
  acc-vf-wise:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/acc-vf-wise.mrs
    path: "./ruleset/scki-mrs-acc-vf-wise.mrs"
    interval: 90254
    proxy: "\U0001F6AB 受限网站"
  acc-vf-monzo:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/acc-vf-monzo.mrs
    path: "./ruleset/scki-mrs-acc-vf-monzo.mrs"
    interval: 90231
    proxy: "\U0001F6AB 受限网站"
  acc-vf-revolut:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/acc-vf-revolut.mrs
    path: "./ruleset/scki-mrs-acc-vf-revolut.mrs"
    interval: 90296
    proxy: "\U0001F6AB 受限网站"
  acc-applenews:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/acc-applenews.mrs
    path: "./ruleset/scki-mrs-acc-applenews.mrs"
    interval: 90270
    proxy: "\U0001F6AB 受限网站"
  acc-apple-domain:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/acc-apple-domain.mrs
    path: "./ruleset/scki-mrs-acc-apple-domain.mrs"
    interval: 90321
    proxy: "\U0001F6AB 受限网站"
  acc-apple-ipcidr:
    type: http
    behavior: ipcidr
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/acc-apple-ipcidr.mrs
    path: "./ruleset/scki-mrs-acc-apple-ipcidr.mrs"
    interval: 90321
    proxy: "\U0001F6AB 受限网站"
  acc-microsoftapps:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/acc-microsoftapps.mrs
    path: "./ruleset/scki-mrs-acc-microsoftapps.mrs"
    interval: 90323
    proxy: "\U0001F6AB 受限网站"
  acc-signal:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/acc-signal.mrs
    path: "./ruleset/scki-mrs-acc-signal.mrs"
    interval: 90316
    proxy: "\U0001F6AB 受限网站"
  acc-rustdesk:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/acc-rustdesk.mrs
    path: "./ruleset/scki-mrs-acc-rustdesk.mrs"
    interval: 90359
    proxy: "\U0001F6AB 受限网站"
  acc-parsec:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/acc-parsec.mrs
    path: "./ruleset/scki-mrs-acc-parsec.mrs"
    interval: 90379
    proxy: "\U0001F6AB 受限网站"
  acc-alipan:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/acc-alipan.mrs
    path: "./ruleset/scki-mrs-acc-alipan.mrs"
    interval: 90376
    proxy: "\U0001F6AB 受限网站"
  acc-baidunetdisk:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/acc-baidunetdisk.mrs
    path: "./ruleset/scki-mrs-acc-baidunetdisk.mrs"
    interval: 90370
    proxy: "\U0001F6AB 受限网站"
  acc-weiyun-domain:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/acc-weiyun-domain.mrs
    path: "./ruleset/scki-mrs-acc-weiyun-domain.mrs"
    interval: 90425
    proxy: "\U0001F6AB 受限网站"
  acc-weiyun-ipcidr:
    type: http
    behavior: ipcidr
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/acc-weiyun-ipcidr.mrs
    path: "./ruleset/scki-mrs-acc-weiyun-ipcidr.mrs"
    interval: 90425
    proxy: "\U0001F6AB 受限网站"
  acc-kwai:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/acc-kwai.mrs
    path: "./ruleset/scki-mrs-acc-kwai.mrs"
    interval: 90404
    proxy: "\U0001F6AB 受限网站"
  acc-fl-bilibili-domain:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/acc-fl-bilibili-domain.mrs
    path: "./ruleset/scki-mrs-acc-fl-bilibili-domain.mrs"
    interval: 90405
    proxy: "\U0001F6AB 受限网站"
  acc-fl-bilibili-ipcidr:
    type: http
    behavior: ipcidr
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/acc-fl-bilibili-ipcidr.mrs
    path: "./ruleset/scki-mrs-acc-fl-bilibili-ipcidr.mrs"
    interval: 90405
    proxy: "\U0001F6AB 受限网站"
  acc-fl-kuaishou:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/acc-fl-kuaishou.mrs
    path: "./ruleset/scki-mrs-acc-fl-kuaishou.mrs"
    interval: 90489
    proxy: "\U0001F6AB 受限网站"
  acc-fl-xigua:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/acc-fl-xigua.mrs
    path: "./ruleset/scki-mrs-acc-fl-xigua.mrs"
    interval: 90489
    proxy: "\U0001F6AB 受限网站"
  acc-fl-weibo:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/acc-fl-weibo.mrs
    path: "./ruleset/scki-mrs-acc-fl-weibo.mrs"
    interval: 90488
    proxy: "\U0001F6AB 受限网站"
  acc-fl-zhihu-domain:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/acc-fl-zhihu-domain.mrs
    path: "./ruleset/scki-mrs-acc-fl-zhihu-domain.mrs"
    interval: 90505
    proxy: "\U0001F6AB 受限网站"
  acc-fl-zhihu-ipcidr:
    type: http
    behavior: ipcidr
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/acc-fl-zhihu-ipcidr.mrs
    path: "./ruleset/scki-mrs-acc-fl-zhihu-ipcidr.mrs"
    interval: 90505
    proxy: "\U0001F6AB 受限网站"
  acc-fl-tieba-domain:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/acc-fl-tieba-domain.mrs
    path: "./ruleset/scki-mrs-acc-fl-tieba-domain.mrs"
    interval: 90528
    proxy: "\U0001F6AB 受限网站"
  acc-fl-tieba-ipcidr:
    type: http
    behavior: ipcidr
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/acc-fl-tieba-ipcidr.mrs
    path: "./ruleset/scki-mrs-acc-fl-tieba-ipcidr.mrs"
    interval: 90528
    proxy: "\U0001F6AB 受限网站"
  acc-fl-douban-domain:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/acc-fl-douban-domain.mrs
    path: "./ruleset/scki-mrs-acc-fl-douban-domain.mrs"
    interval: 90560
    proxy: "\U0001F6AB 受限网站"
  acc-fl-douban-ipcidr:
    type: http
    behavior: ipcidr
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/acc-fl-douban-ipcidr.mrs
    path: "./ruleset/scki-mrs-acc-fl-douban-ipcidr.mrs"
    interval: 90560
    proxy: "\U0001F6AB 受限网站"
  acc-fl-xianyu-domain:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/acc-fl-xianyu-domain.mrs
    path: "./ruleset/scki-mrs-acc-fl-xianyu-domain.mrs"
    interval: 90540
    proxy: "\U0001F6AB 受限网站"
  acc-fl-xianyu-ipcidr:
    type: http
    behavior: ipcidr
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/acc-fl-xianyu-ipcidr.mrs
    path: "./ruleset/scki-mrs-acc-fl-xianyu-ipcidr.mrs"
    interval: 90540
    proxy: "\U0001F6AB 受限网站"
  acc-hijackingplus-domain:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/acc-hijackingplus-domain.mrs
    path: "./ruleset/scki-mrs-acc-hijackingplus-domain.mrs"
    interval: 90594
    proxy: "\U0001F6AB 受限网站"
  acc-hijackingplus-ipcidr:
    type: http
    behavior: ipcidr
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/acc-hijackingplus-ipcidr.mrs
    path: "./ruleset/scki-mrs-acc-hijackingplus-ipcidr.mrs"
    interval: 90594
    proxy: "\U0001F6AB 受限网站"
  acc-blockhttpdnsplus:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/acc-blockhttpdnsplus.mrs
    path: "./ruleset/scki-mrs-acc-blockhttpdnsplus.mrs"
    interval: 90613
    proxy: "\U0001F6AB 受限网站"
  acc-prerepaireasyprivacy:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/acc-prerepaireasyprivacy.mrs
    path: "./ruleset/scki-mrs-acc-prerepaireasyprivacy.mrs"
    interval: 90585
    proxy: "\U0001F6AB 受限网站"
  acc-unsupportvpn:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/acc-unsupportvpn.mrs
    path: "./ruleset/scki-mrs-acc-unsupportvpn.mrs"
    interval: 90635
    proxy: "\U0001F6AB 受限网站"
  acc-macappupgrade:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/acc-macappupgrade.mrs
    path: "./ruleset/scki-mrs-acc-macappupgrade.mrs"
    interval: 90615
    proxy: "\U0001F6AB 受限网站"
  acc-fastly:
    type: http
    behavior: ipcidr
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/acc-fastly.mrs
    path: "./ruleset/scki-mrs-acc-fastly.mrs"
    interval: 90669
    proxy: "\U0001F6AB 受限网站"
  acc-chinamax:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/acc-chinamax.mrs
    path: "./ruleset/scki-mrs-acc-chinamax.mrs"
    interval: 90693
    proxy: "\U0001F6AB 受限网站"
  acc-homeip-us:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/acc-homeip-us.mrs
    path: "./ruleset/scki-mrs-acc-homeip-us.mrs"
    interval: 90703
    proxy: "\U0001F6AB 受限网站"
  acc-homeip-jp:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/acc-homeip-jp.mrs
    path: "./ruleset/scki-mrs-acc-homeip-jp.mrs"
    interval: 90762
    proxy: "\U0001F6AB 受限网站"
  acc-waybackmachine-domain:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/acc-waybackmachine-domain.mrs
    path: "./ruleset/scki-mrs-acc-waybackmachine-domain.mrs"
    interval: 90730
    proxy: "\U0001F6AB 受限网站"
  acc-waybackmachine-ipcidr:
    type: http
    behavior: ipcidr
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/acc-waybackmachine-ipcidr.mrs
    path: "./ruleset/scki-mrs-acc-waybackmachine-ipcidr.mrs"
    interval: 90730
    proxy: "\U0001F6AB 受限网站"
  acc-pornhub:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/acc-pornhub.mrs
    path: "./ruleset/scki-mrs-acc-pornhub.mrs"
    interval: 90755
    proxy: "\U0001F6AB 受限网站"
  acc-aqara-cn:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/acc-aqara-cn.mrs
    path: "./ruleset/scki-mrs-acc-aqara-cn.mrs"
    interval: 90756
    proxy: "\U0001F6AB 受限网站"
  acc-aqara-global-domain:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/acc-aqara-global-domain.mrs
    path: "./ruleset/scki-mrs-acc-aqara-global-domain.mrs"
    interval: 90781
    proxy: "\U0001F6AB 受限网站"
  acc-aqara-global-ipcidr:
    type: http
    behavior: ipcidr
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/acc-aqara-global-ipcidr.mrs
    path: "./ruleset/scki-mrs-acc-aqara-global-ipcidr.mrs"
    interval: 90781
    proxy: "\U0001F6AB 受限网站"
  acc-emuleserver:
    type: http
    behavior: ipcidr
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/acc-emuleserver.mrs
    path: "./ruleset/scki-mrs-acc-emuleserver.mrs"
    interval: 90803
    proxy: "\U0001F6AB 受限网站"
  acc-geo-d-asia-east:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/acc-geo-d-asia-east.mrs
    path: "./ruleset/scki-mrs-acc-geo-d-asia-east.mrs"
    interval: 90816
    proxy: "\U0001F6AB 受限网站"
  acc-geo-d-asia-eastsouth:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/acc-geo-d-asia-eastsouth.mrs
    path: "./ruleset/scki-mrs-acc-geo-d-asia-eastsouth.mrs"
    interval: 90841
    proxy: "\U0001F6AB 受限网站"
  acc-geo-d-asia-south:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/acc-geo-d-asia-south.mrs
    path: "./ruleset/scki-mrs-acc-geo-d-asia-south.mrs"
    interval: 90866
    proxy: "\U0001F6AB 受限网站"
  acc-geo-d-asia-central:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/acc-geo-d-asia-central.mrs
    path: "./ruleset/scki-mrs-acc-geo-d-asia-central.mrs"
    interval: 90865
    proxy: "\U0001F6AB 受限网站"
  acc-geo-d-asia-west:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/acc-geo-d-asia-west.mrs
    path: "./ruleset/scki-mrs-acc-geo-d-asia-west.mrs"
    interval: 90869
    proxy: "\U0001F6AB 受限网站"
  acc-geo-d-asia-china:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/acc-geo-d-asia-china.mrs
    path: "./ruleset/scki-mrs-acc-geo-d-asia-china.mrs"
    interval: 90928
    proxy: "\U0001F6AB 受限网站"
  acc-geo-d-america-north:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/acc-geo-d-america-north.mrs
    path: "./ruleset/scki-mrs-acc-geo-d-america-north.mrs"
    interval: 90902
    proxy: "\U0001F6AB 受限网站"
  acc-geo-d-america-south:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/acc-geo-d-america-south.mrs
    path: "./ruleset/scki-mrs-acc-geo-d-america-south.mrs"
    interval: 90932
    proxy: "\U0001F6AB 受限网站"
  acc-geo-d-europe-west:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/acc-geo-d-europe-west.mrs
    path: "./ruleset/scki-mrs-acc-geo-d-europe-west.mrs"
    interval: 90960
    proxy: "\U0001F6AB 受限网站"
  acc-geo-d-europe-east:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/acc-geo-d-europe-east.mrs
    path: "./ruleset/scki-mrs-acc-geo-d-europe-east.mrs"
    interval: 90954
    proxy: "\U0001F6AB 受限网站"
  acc-geo-d-oceania:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/acc-geo-d-oceania.mrs
    path: "./ruleset/scki-mrs-acc-geo-d-oceania.mrs"
    interval: 90980
    proxy: "\U0001F6AB 受限网站"
  acc-geo-d-antarctica:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/acc-geo-d-antarctica.mrs
    path: "./ruleset/scki-mrs-acc-geo-d-antarctica.mrs"
    interval: 91002
    proxy: "\U0001F6AB 受限网站"
  acc-geo-d-africa-north:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/acc-geo-d-africa-north.mrs
    path: "./ruleset/scki-mrs-acc-geo-d-africa-north.mrs"
    interval: 91012
    proxy: "\U0001F6AB 受限网站"
  acc-geo-d-africa-south:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/acc-geo-d-africa-south.mrs
    path: "./ruleset/scki-mrs-acc-geo-d-africa-south.mrs"
    interval: 91047
    proxy: "\U0001F6AB 受限网站"
  acc-geo-d-africa-west:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/acc-geo-d-africa-west.mrs
    path: "./ruleset/scki-mrs-acc-geo-d-africa-west.mrs"
    interval: 91043
    proxy: "\U0001F6AB 受限网站"
  acc-geo-d-africa-east:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/acc-geo-d-africa-east.mrs
    path: "./ruleset/scki-mrs-acc-geo-d-africa-east.mrs"
    interval: 91029
    proxy: "\U0001F6AB 受限网站"
  acc-geo-d-africa-central:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/acc-geo-d-africa-central.mrs
    path: "./ruleset/scki-mrs-acc-geo-d-africa-central.mrs"
    interval: 91084
    proxy: "\U0001F6AB 受限网站"
  acc-geo-ip-asia-east:
    type: http
    behavior: classical
    url: https://fastly.jsdelivr.net/gh/Accademia/Additional_Rule_For_Clash@main/GeoRouting_For_IP/GeoRouting_Asia_East_GeoIP.yaml
    path: "./ruleset/acc-GeoIP-Asia_East.yaml"
    interval: 91073
    proxy: "\U0001F6AB 受限网站"
  acc-geo-ip-asia-eastsouth:
    type: http
    behavior: classical
    url: https://fastly.jsdelivr.net/gh/Accademia/Additional_Rule_For_Clash@main/GeoRouting_For_IP/GeoRouting_Asia_EastSouth_GeoIP.yaml
    path: "./ruleset/acc-GeoIP-Asia_EastSouth.yaml"
    interval: 91095
    proxy: "\U0001F6AB 受限网站"
  acc-geo-ip-asia-south:
    type: http
    behavior: classical
    url: https://fastly.jsdelivr.net/gh/Accademia/Additional_Rule_For_Clash@main/GeoRouting_For_IP/GeoRouting_Asia_South_GeoIP.yaml
    path: "./ruleset/acc-GeoIP-Asia_South.yaml"
    interval: 91131
    proxy: "\U0001F6AB 受限网站"
  acc-geo-ip-asia-central:
    type: http
    behavior: classical
    url: https://fastly.jsdelivr.net/gh/Accademia/Additional_Rule_For_Clash@main/GeoRouting_For_IP/GeoRouting_Asia_Central_GeoIP.yaml
    path: "./ruleset/acc-GeoIP-Asia_Central.yaml"
    interval: 91146
    proxy: "\U0001F6AB 受限网站"
  acc-geo-ip-asia-west:
    type: http
    behavior: classical
    url: https://fastly.jsdelivr.net/gh/Accademia/Additional_Rule_For_Clash@main/GeoRouting_For_IP/GeoRouting_Asia_West_GeoIP.yaml
    path: "./ruleset/acc-GeoIP-Asia_West.yaml"
    interval: 91127
    proxy: "\U0001F6AB 受限网站"
  acc-geo-ip-asia-china:
    type: http
    behavior: classical
    url: https://fastly.jsdelivr.net/gh/Accademia/Additional_Rule_For_Clash@main/GeoRouting_For_IP/GeoRouting_Asia_China_GeoIP.yaml
    path: "./ruleset/acc-GeoIP-Asia_China.yaml"
    interval: 91125
    proxy: "\U0001F6AB 受限网站"
  acc-geo-ip-america-north:
    type: http
    behavior: classical
    url: https://fastly.jsdelivr.net/gh/Accademia/Additional_Rule_For_Clash@main/GeoRouting_For_IP/GeoRouting_America_North_GeoIP.yaml
    path: "./ruleset/acc-GeoIP-America_North.yaml"
    interval: 91175
    proxy: "\U0001F6AB 受限网站"
  acc-geo-ip-america-south:
    type: http
    behavior: classical
    url: https://fastly.jsdelivr.net/gh/Accademia/Additional_Rule_For_Clash@main/GeoRouting_For_IP/GeoRouting_America_South_GeoIP.yaml
    path: "./ruleset/acc-GeoIP-America_South.yaml"
    interval: 91175
    proxy: "\U0001F6AB 受限网站"
  acc-geo-ip-europe-west:
    type: http
    behavior: classical
    url: https://fastly.jsdelivr.net/gh/Accademia/Additional_Rule_For_Clash@main/GeoRouting_For_IP/GeoRouting_Europe_West_GeoIP.yaml
    path: "./ruleset/acc-GeoIP-Europe_West.yaml"
    interval: 91171
    proxy: "\U0001F6AB 受限网站"
  acc-geo-ip-europe-east:
    type: http
    behavior: classical
    url: https://fastly.jsdelivr.net/gh/Accademia/Additional_Rule_For_Clash@main/GeoRouting_For_IP/GeoRouting_Europe_East_GeoIP.yaml
    path: "./ruleset/acc-GeoIP-Europe_East.yaml"
    interval: 91201
    proxy: "\U0001F6AB 受限网站"
  acc-geo-ip-oceania:
    type: http
    behavior: classical
    url: https://fastly.jsdelivr.net/gh/Accademia/Additional_Rule_For_Clash@main/GeoRouting_For_IP/GeoRouting_Oceania_GeoIP.yaml
    path: "./ruleset/acc-GeoIP-Oceania.yaml"
    interval: 91224
    proxy: "\U0001F6AB 受限网站"
  acc-geo-ip-antarctica:
    type: http
    behavior: classical
    url: https://fastly.jsdelivr.net/gh/Accademia/Additional_Rule_For_Clash@main/GeoRouting_For_IP/GeoRouting_Antarctica_GeoIP.yaml
    path: "./ruleset/acc-GeoIP-Antarctica.yaml"
    interval: 91227
    proxy: "\U0001F6AB 受限网站"
  acc-geo-ip-africa-north:
    type: http
    behavior: classical
    url: https://fastly.jsdelivr.net/gh/Accademia/Additional_Rule_For_Clash@main/GeoRouting_For_IP/GeoRouting_Africa_North_GeoIP.yaml
    path: "./ruleset/acc-GeoIP-Africa_North.yaml"
    interval: 91248
    proxy: "\U0001F6AB 受限网站"
  acc-geo-ip-africa-south:
    type: http
    behavior: classical
    url: https://fastly.jsdelivr.net/gh/Accademia/Additional_Rule_For_Clash@main/GeoRouting_For_IP/GeoRouting_Africa_South_GeoIP.yaml
    path: "./ruleset/acc-GeoIP-Africa_South.yaml"
    interval: 91267
    proxy: "\U0001F6AB 受限网站"
  acc-geo-ip-africa-west:
    type: http
    behavior: classical
    url: https://fastly.jsdelivr.net/gh/Accademia/Additional_Rule_For_Clash@main/GeoRouting_For_IP/GeoRouting_Africa_West_GeoIP.yaml
    path: "./ruleset/acc-GeoIP-Africa_West.yaml"
    interval: 91272
    proxy: "\U0001F6AB 受限网站"
  acc-geo-ip-africa-east:
    type: http
    behavior: classical
    url: https://fastly.jsdelivr.net/gh/Accademia/Additional_Rule_For_Clash@main/GeoRouting_For_IP/GeoRouting_Africa_East_GeoIP.yaml
    path: "./ruleset/acc-GeoIP-Africa_East.yaml"
    interval: 91308
    proxy: "\U0001F6AB 受限网站"
  acc-geo-ip-africa-central:
    type: http
    behavior: classical
    url: https://fastly.jsdelivr.net/gh/Accademia/Additional_Rule_For_Clash@main/GeoRouting_For_IP/GeoRouting_Africa_Central_GeoIP.yaml
    path: "./ruleset/acc-GeoIP-Africa_Central.yaml"
    interval: 91307
    proxy: "\U0001F6AB 受限网站"
  scki-adfp-direct:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/scki-adfp-direct.mrs
    path: "./ruleset/scki-mrs-scki-adfp-direct.mrs"
    interval: 604800
    proxy: "🚫 受限网站"
  scki-adfp-intl-site:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/scki-adfp-intl-site.mrs
    path: "./ruleset/scki-mrs-scki-adfp-intl-site.mrs"
    interval: 604800
    proxy: "🚫 受限网站"
  scki-adfp-payments:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/scki-adfp-payments.mrs
    path: "./ruleset/scki-mrs-scki-adfp-payments.mrs"
    interval: 604800
    proxy: "🚫 受限网站"
  scki-cnmedia-guard:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/scki-cnmedia-guard.mrs
    path: "./ruleset/scki-mrs-scki-cnmedia-guard.mrs"
    interval: 604800
    proxy: "🚫 受限网站"
  scki-local-direct-domain:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/scki-local-direct-domain.mrs
    path: "./ruleset/scki-mrs-scki-local-direct-domain.mrs"
    interval: 604800
    proxy: "🚫 受限网站"
  scki-local-direct-ipcidr:
    type: http
    behavior: ipcidr
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/scki-local-direct-ipcidr.mrs
    path: "./ruleset/scki-mrs-scki-local-direct-ipcidr.mrs"
    interval: 604800
    proxy: "🚫 受限网站"
  scki-local-process-direct:
    type: http
    behavior: classical
    format: text
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/supplemental/clash/local-process-direct.list
    path: ./ruleset/scki-local-process-direct.list
    interval: 604800
    proxy: "🚫 受限网站"
  scki-work-process:
    type: http
    behavior: classical
    format: text
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/supplemental/clash/work-process.list
    path: ./ruleset/scki-work-process.list
    interval: 604800
    proxy: "🚫 受限网站"
  scki-gfw-guard:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/scki-gfw-guard.mrs
    path: "./ruleset/scki-mrs-scki-gfw-guard.mrs"
    interval: 604800
    proxy: "🚫 受限网站"
  scki-youtube-guard:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/scki-youtube-guard.mrs
    path: "./ruleset/scki-mrs-scki-youtube-guard.mrs"
    interval: 604800
    proxy: "🚫 受限网站"
  scki-google-mail-intl:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/scki-google-mail-intl.mrs
    path: "./ruleset/scki-mrs-scki-google-mail-intl.mrs"
    interval: 604800
    proxy: "🚫 受限网站"
  scki-google-work:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/scki-google-work.mrs
    path: "./ruleset/scki-mrs-scki-google-work.mrs"
    interval: 604800
    proxy: "🚫 受限网站"
  scki-download-guard:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/scki-download-guard.mrs
    path: "./ruleset/scki-mrs-scki-download-guard.mrs"
    interval: 604800
    proxy: "🚫 受限网站"
  scki-cnsite-guard:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/scki-cnsite-guard.mrs
    path: "./ruleset/scki-mrs-scki-cnsite-guard.mrs"
    interval: 604800
    proxy: "🚫 受限网站"
  scki-work-guard:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/scki-work-guard.mrs
    path: "./ruleset/scki-mrs-scki-work-guard.mrs"
    interval: 604800
    proxy: "🚫 受限网站"
  scki-ai-supplement:
    type: http
    behavior: domain
    format: mrs
    url: https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/mihomo-mrs/scki-ai-supplement.mrs
    path: "./ruleset/scki-mrs-scki-ai-supplement.mrs"
    interval: 604800
    proxy: "🚫 受限网站"
rules:
- "RULE-SET,scki-adfp-direct,DIRECT"
- "RULE-SET,scki-adfp-intl-site,🌐 国外网站"
- "RULE-SET,scki-adfp-payments,🏦 金融支付"
- "RULE-SET,scki-cnmedia-guard,📺 国内流媒体"
- "RULE-SET,anti-ad,🛑 广告拦截"
- "RULE-SET,sukka-phishing,🛑 广告拦截"
- "RULE-SET,hagezi-tif,🛑 广告拦截"
- "RULE-SET,acc-hijackingplus-domain,🛑 广告拦截"
- "RULE-SET,acc-hijackingplus-ipcidr,🛑 广告拦截"
- "RULE-SET,acc-blockhttpdnsplus,🛑 广告拦截"
- "RULE-SET,acc-prerepaireasyprivacy,🛑 广告拦截"
- "RULE-SET,acc-unsupportvpn,🛑 广告拦截"
- "GEOSITE,category-ads-all,🛑 广告拦截"
- "RULE-SET,advertising-domain,🛑 广告拦截"
- "RULE-SET,advertising-ipcidr,🛑 广告拦截"
- "RULE-SET,advertisingmitv,🛑 广告拦截"
- "RULE-SET,adobeactivation-domain,🛑 广告拦截"
- "RULE-SET,adobeactivation-ipcidr,🛑 广告拦截"
- "RULE-SET,blockhttpdns-domain,🛑 广告拦截"
- "RULE-SET,blockhttpdns-ipcidr,🛑 广告拦截"
- "RULE-SET,domob,🛑 广告拦截"
- "RULE-SET,hijacking-domain,🛑 广告拦截"
- "RULE-SET,hijacking-ipcidr,🛑 广告拦截"
- "RULE-SET,jiguangtuisong,🛑 广告拦截"
- "RULE-SET,miuiprivacy,🛑 广告拦截"
- "RULE-SET,privacy-domain,🛑 广告拦截"
- "RULE-SET,privacy-ipcidr,🛑 广告拦截"
- "RULE-SET,youmengchuangxiang,🛑 广告拦截"
- "RULE-SET,amap,🏠 国内网站"
- "AND,((DST-PORT,443),(NETWORK,UDP),(GEOSITE,youtube)),📹 YouTube"
- "AND,((DST-PORT,443),(NETWORK,UDP),(GEOSITE,google)),🔍 Google 服务"
- "AND,((DST-PORT,443),(NETWORK,UDP),(RULE-SET,microsoft)),Ⓜ️ 微软服务"
- "AND,((DST-PORT,443),(NETWORK,UDP),(RULE-SET,apple)),🍎 苹果服务"
- "AND,((DST-PORT,443),(NETWORK,UDP),(NOT,((GEOSITE,cn)))),REJECT"
- "DST-PORT,7680,REJECT"
- "GEOSITE,private,DIRECT"
- "GEOIP,private,DIRECT,no-resolve"
- "RULE-SET,scki-local-direct-domain,DIRECT"
- "RULE-SET,scki-local-direct-ipcidr,DIRECT"
- "RULE-SET,scki-local-process-direct,DIRECT"
- "RULE-SET,scki-work-process,🧑‍💼 会议协作"
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
- "DOMAIN-SUFFIX,binance.vision,💰 加密货币"
- "DOMAIN-SUFFIX,binance.info,💰 加密货币"
- "DOMAIN-SUFFIX,binance.org,💰 加密货币"
- "RULE-SET,scki-gfw-guard,🚫 受限网站"
- "RULE-SET,scki-youtube-guard,📹 YouTube"
- "RULE-SET,scki-cnsite-guard,🏠 国内网站"
- "RULE-SET,openai,🤖 AI 服务"
- "RULE-SET,claude,🤖 AI 服务"
- "RULE-SET,gemini,🤖 AI 服务"
- "RULE-SET,scki-work-guard,🧑‍💼 会议协作"
- "RULE-SET,copilot-domain,🤖 AI 服务"
- "RULE-SET,copilot-ipcidr,🤖 AI 服务"
- "RULE-SET,copilot-classical,🤖 AI 服务"
- "RULE-SET,scki-ai-supplement,🤖 AI 服务"
- "RULE-SET,civitai,🤖 AI 服务"
- "RULE-SET,scki-google-mail-intl,🌐 国外网站"
- "RULE-SET,googlevoice,💬 即时通讯"
- "RULE-SET,scki-google-work,🧑‍💼 会议协作"
- "RULE-SET,scki-download-guard,📥 下载更新"
- "RULE-SET,googlefcm-domain,📥 下载更新"
- "RULE-SET,googlefcm-ipcidr,📥 下载更新"
- "RULE-SET,google,🔍 Google 服务"
- "RULE-SET,google-ip,🔍 Google 服务,no-resolve"
- "RULE-SET,szkane-ai-domain,🤖 AI 服务"
- "RULE-SET,szkane-ai-ipcidr,🤖 AI 服务"
- "RULE-SET,szkane-ai-classical,🤖 AI 服务"
- "RULE-SET,szkane-ciciai-domain,🤖 AI 服务"
- "RULE-SET,szkane-ciciai-ipcidr,🤖 AI 服务"
- "RULE-SET,szkane-ciciai-classical,🤖 AI 服务"
- "RULE-SET,acc-appleai,🤖 AI 服务"
- "RULE-SET,acc-grok,🤖 AI 服务"
- "RULE-SET,acc-gemini,🤖 AI 服务"
- "RULE-SET,acc-copilot,🤖 AI 服务"
- "RULE-SET,vpsdance-ai-coding-domain,🤖 AI 服务"
- "RULE-SET,vpsdance-ai-coding-ipcidr,🤖 AI 服务"
- "RULE-SET,vpsdance-ai-coding-classical,🤖 AI 服务"
- "DOMAIN-SUFFIX,tradingview.com,💰 加密货币"
- "DOMAIN-SUFFIX,tvcdn.com,💰 加密货币"
- "DOMAIN-SUFFIX,coinglass.com,💰 加密货币"
- "DOMAIN-SUFFIX,hyperliquid.xyz,💰 加密货币"
- "DOMAIN-SUFFIX,hyperliquid-testnet.xyz,💰 加密货币"
- "RULE-SET,cryptocurrency,💰 加密货币"
- "DOMAIN-SUFFIX,eth.limo,💰 加密货币"
- "DOMAIN-SUFFIX,glitternode.ru,💰 加密货币"
- "RULE-SET,binance,💰 加密货币"
- "RULE-SET,szkane-web3-domain,💰 加密货币"
- "RULE-SET,szkane-web3-classical,💰 加密货币"
- "RULE-SET,paypal,🏦 金融支付"
- "DOMAIN-SUFFIX,wise.com,🏦 金融支付"
- "DOMAIN-SUFFIX,transferwise.com,🏦 金融支付"
- "DOMAIN-SUFFIX,revolut.com,🏦 金融支付"
- "DOMAIN-SUFFIX,revolut.me,🏦 金融支付"
- "DOMAIN-SUFFIX,braintree-api.com,🏦 金融支付"
- "DOMAIN-SUFFIX,cash.app,🏦 金融支付"
- "DOMAIN-SUFFIX,squareup.com,🏦 金融支付"
- "DOMAIN-SUFFIX,square.com,🏦 金融支付"
- "DOMAIN-SUFFIX,adyen.com,🏦 金融支付"
- "DOMAIN-SUFFIX,checkout.com,🏦 金融支付"
- "DOMAIN-SUFFIX,klarna.com,🏦 金融支付"
- "DOMAIN-SUFFIX,afterpay.com,🏦 金融支付"
- "DOMAIN-SUFFIX,plaid.com,🏦 金融支付"
- "DOMAIN-SUFFIX,midtrans.com,🏦 金融支付"
- "DOMAIN-SUFFIX,gopay.co.id,🏦 金融支付"
- "DOMAIN-SUFFIX,ovo.id,🏦 金融支付"
- "DOMAIN-SUFFIX,dana.id,🏦 金融支付"
- "DOMAIN-SUFFIX,shopeepay.co.id,🏦 金融支付"
- "DOMAIN-SUFFIX,xendit.co,🏦 金融支付"
- "DOMAIN-SUFFIX,doku.com,🏦 金融支付"
- "RULE-SET,stripe,🏦 金融支付"
- "RULE-SET,visa,🏦 金融支付"
- "RULE-SET,tigerfintech,🏦 金融支付"
- "RULE-SET,acc-bank-us,🏦 金融支付"
- "RULE-SET,acc-bank-uk,🏦 金融支付"
- "RULE-SET,acc-bank-hk,🏦 金融支付"
- "RULE-SET,acc-bank-sg,🏦 金融支付"
- "RULE-SET,acc-bank-jp,🏦 金融支付"
- "RULE-SET,acc-bank-au,🏦 金融支付"
- "RULE-SET,acc-bank-ca,🏦 金融支付"
- "RULE-SET,acc-bank-de,🏦 金融支付"
- "RULE-SET,acc-bank-nl,🏦 金融支付"
- "RULE-SET,acc-bank-fr,🏦 金融支付"
- "RULE-SET,acc-vf-wise,🏦 金融支付"
- "RULE-SET,acc-vf-monzo,🏦 金融支付"
- "RULE-SET,acc-vf-revolut,🏦 金融支付"
- "DOMAIN,login.live.com,Ⓜ️ 微软服务"
- "DOMAIN,g.live.com,Ⓜ️ 微软服务"
- "DOMAIN-SUFFIX,officeapps.live.com,Ⓜ️ 微软服务"
- "DOMAIN-SUFFIX,outlook.com,🌐 国外网站"
- "DOMAIN-SUFFIX,outlook.live.com,🌐 国外网站"
- "DOMAIN-SUFFIX,hotmail.com,🌐 国外网站"
- "DOMAIN,mail.live.com,🌐 国外网站"
- "DOMAIN,outlook.office.com,🌐 国外网站"
- "DOMAIN,mail.yahoo.com,🌐 国外网站"
- "DOMAIN-SUFFIX,ymail.com,🌐 国外网站"
- "DOMAIN-SUFFIX,tutanota.com,🌐 国外网站"
- "DOMAIN-SUFFIX,tuta.com,🌐 国外网站"
- "DOMAIN,mail.zoho.com,🌐 国外网站"
- "DOMAIN,mail.zoho.eu,🌐 国外网站"
- "DOMAIN,mail.zoho.in,🌐 国外网站"
- "DOMAIN,mail.zoho.com.au,🌐 国外网站"
- "DOMAIN,mail.zoho.jp,🌐 国外网站"
- "DOMAIN,mail.me.com,🌐 国外网站"
- "DOMAIN-SUFFIX,fastmail.com,🌐 国外网站"
- "DOMAIN-SUFFIX,fastmail.fm,🌐 国外网站"
- "RULE-SET,mail,🌐 国外网站"
- "RULE-SET,mailru,🌐 国外网站"
- "RULE-SET,protonmail,🌐 国外网站"
- "RULE-SET,spark,🌐 国外网站"
- "DOMAIN-SUFFIX,mail.qq.com,DIRECT"
- "DOMAIN-SUFFIX,mail.163.com,DIRECT"
- "DOMAIN-SUFFIX,mail.126.com,DIRECT"
- "DOMAIN-SUFFIX,mail.sina.com.cn,DIRECT"
- "DOMAIN-SUFFIX,mail.aliyun.com,DIRECT"
- "RULE-SET,telegram,💬 即时通讯"
- "RULE-SET,telegram-ip,💬 即时通讯,no-resolve"
- "RULE-SET,discord,💬 即时通讯"
- "RULE-SET,whatsapp-domain,💬 即时通讯"
- "RULE-SET,whatsapp-ipcidr,💬 即时通讯"
- "RULE-SET,line-domain,💬 即时通讯"
- "RULE-SET,line-ipcidr,💬 即时通讯"
- "RULE-SET,kakaotalk-domain,💬 即时通讯"
- "RULE-SET,kakaotalk-ipcidr,💬 即时通讯"
- "DOMAIN-SUFFIX,skype.com,💬 即时通讯"
- "DOMAIN-SUFFIX,skypeecs.net,💬 即时通讯"
- "DOMAIN-SUFFIX,skypeforbusiness.com,💬 即时通讯"
- "DOMAIN-SUFFIX,sfbassets.com,💬 即时通讯"
- "DOMAIN-SUFFIX,lync.com,💬 即时通讯"
- "DOMAIN-SUFFIX,signal.org,💬 即时通讯"
- "DOMAIN-SUFFIX,whispersystems.org,💬 即时通讯"
- "DOMAIN-SUFFIX,signal.art,💬 即时通讯"
- "DOMAIN-SUFFIX,viber.com,💬 即时通讯"
- "DOMAIN-SUFFIX,viber.io,💬 即时通讯"
- "DOMAIN-SUFFIX,element.io,💬 即时通讯"
- "DOMAIN-SUFFIX,matrix.org,💬 即时通讯"
- "DOMAIN-SUFFIX,zalo.me,💬 即时通讯"
- "DOMAIN-SUFFIX,zalopay.vn,💬 即时通讯"
- "DOMAIN-SUFFIX,wire.com,💬 即时通讯"
- "DOMAIN-SUFFIX,threema.ch,💬 即时通讯"
- "RULE-SET,telegramnl,💬 即时通讯,no-resolve"
- "RULE-SET,telegramsg,💬 即时通讯,no-resolve"
- "RULE-SET,telegramus,💬 即时通讯,no-resolve"
- "RULE-SET,zalo,💬 即时通讯"
- "RULE-SET,italkbb-domain,💬 即时通讯"
- "RULE-SET,italkbb-classical,💬 即时通讯"
- "RULE-SET,acc-signal,💬 即时通讯"
- "DOMAIN-SUFFIX,icq.com,💬 即时通讯"
- "RULE-SET,twitter,📱 社交媒体"
- "RULE-SET,twitter-ip,📱 社交媒体,no-resolve"
- "RULE-SET,reddit,📱 社交媒体"
- "RULE-SET,facebook-domain,📱 社交媒体"
- "RULE-SET,facebook-ipcidr,📱 社交媒体"
- "RULE-SET,facebook-classical,📱 社交媒体"
- "RULE-SET,facebook-ip,📱 社交媒体,no-resolve"
- "RULE-SET,instagram,📱 社交媒体"
- "RULE-SET,snapchat,📱 社交媒体"
- "RULE-SET,pinterest,📱 社交媒体"
- "RULE-SET,linkedin,📱 社交媒体"
- "DOMAIN-SUFFIX,mastodon.social,📱 社交媒体"
- "DOMAIN-SUFFIX,joinmastodon.org,📱 社交媒体"
- "DOMAIN-SUFFIX,threads.net,📱 社交媒体"
- "DOMAIN-SUFFIX,bsky.app,📱 社交媒体"
- "DOMAIN-SUFFIX,bsky.social,📱 社交媒体"
- "DOMAIN-SUFFIX,quora.com,📱 社交媒体"
- "DOMAIN-SUFFIX,medium.com,📱 社交媒体"
- "DOMAIN-SUFFIX,flickr.com,📱 社交媒体"
- "DOMAIN-SUFFIX,lemon8-app.com,📱 社交媒体"
- "RULE-SET,tumblr,📱 社交媒体"
- "RULE-SET,clubhouse,📱 社交媒体"
- "RULE-SET,clubhouseip-domain,📱 社交媒体"
- "RULE-SET,clubhouseip-ipcidr,📱 社交媒体,no-resolve"
- "RULE-SET,pixiv,📱 社交媒体"
- "RULE-SET,truthsocial,📱 社交媒体"
- "RULE-SET,vk,📱 社交媒体"
- "RULE-SET,blued,🏠 国内网站"
- "RULE-SET,disqus,📱 社交媒体"
- "RULE-SET,imgur,📱 社交媒体"
- "RULE-SET,pixnet,📱 社交媒体"
- "RULE-SET,zoom,🧑‍💼 会议协作"
- "RULE-SET,slack,🧑‍💼 会议协作"
- "RULE-SET,teams,🧑‍💼 会议协作"
- "DOMAIN-SUFFIX,webex.com,🧑‍💼 会议协作"
- "DOMAIN-SUFFIX,wbx2.com,🧑‍💼 会议协作"
- "DOMAIN-SUFFIX,ciscospark.com,🧑‍💼 会议协作"
- "DOMAIN-SUFFIX,figma.com,🧑‍💼 会议协作"
- "DOMAIN-SUFFIX,linear.app,🧑‍💼 会议协作"
- "DOMAIN-SUFFIX,jira.com,🧑‍💼 会议协作"
- "DOMAIN-SUFFIX,asana.com,🧑‍💼 会议协作"
- "DOMAIN-SUFFIX,monday.com,🧑‍💼 会议协作"
- "DOMAIN-SUFFIX,clickup.com,🧑‍💼 会议协作"
- "DOMAIN-SUFFIX,basecamp.com,🧑‍💼 会议协作"
- "DOMAIN-SUFFIX,airtable.com,🧑‍💼 会议协作"
- "DOMAIN-SUFFIX,miro.com,🧑‍💼 会议协作"
- "DOMAIN-SUFFIX,canva.com,🧑‍💼 会议协作"
- "DOMAIN-SUFFIX,coda.io,🧑‍💼 会议协作"
- "DOMAIN-SUFFIX,loom.com,🧑‍💼 会议协作"
- "DOMAIN-SUFFIX,larksuite.com,🧑‍💼 会议协作"
- "DOMAIN-SUFFIX,larkoffice.com,🧑‍💼 会议协作"
- "DOMAIN-SUFFIX,gotomeeting.com,🧑‍💼 会议协作"
- "DOMAIN-SUFFIX,logmein.com,🧑‍💼 会议协作"
- "DOMAIN-SUFFIX,goto.com,🧑‍💼 会议协作"
- "RULE-SET,atlassian,🧑‍💼 会议协作"
- "RULE-SET,notion,🧑‍💼 会议协作"
- "RULE-SET,teamviewer-domain,🧑‍💼 会议协作"
- "RULE-SET,teamviewer-ipcidr,🧑‍💼 会议协作"
- "RULE-SET,zoho,🧑‍💼 会议协作"
- "RULE-SET,salesforce,🧑‍💼 会议协作"
- "RULE-SET,zendesk,🧑‍💼 会议协作"
- "RULE-SET,intercom,🧑‍💼 会议协作"
- "RULE-SET,remotedesktop,🧑‍💼 会议协作"
- "RULE-SET,acc-rustdesk,🧑‍💼 会议协作"
- "RULE-SET,acc-parsec,🧑‍💼 会议协作"
- "DOMAIN-SUFFIX,feishu.cn,DIRECT"
- "DOMAIN-SUFFIX,dingtalk.com,DIRECT"
- "DOMAIN-SUFFIX,welink.huaweicloud.com,DIRECT"
- "RULE-SET,bilibili,📺 国内流媒体"
- "RULE-SET,tiktok,🎵 TikTok"
- "RULE-SET,youtube,📹 YouTube"
- "RULE-SET,netflix,🎥 Netflix"
- "RULE-SET,netflix-ip,🎥 Netflix,no-resolve"
- "RULE-SET,szkane-netflixip,🎥 Netflix,no-resolve"
- "RULE-SET,disney-domain,🎬 Disney+"
- "RULE-SET,disney-classical,🎬 Disney+"
- "RULE-SET,hbo-domain,📡 HBO/Max"
- "RULE-SET,hbo-classical,📡 HBO/Max"
- "RULE-SET,hulu-domain,📺 Hulu"
- "RULE-SET,hulu-classical,📺 Hulu"
- "RULE-SET,primevideo,🎬 Prime Video"
- "RULE-SET,amazon-domain,🎬 Prime Video"
- "RULE-SET,amazon-ipcidr,🎬 Prime Video"
- "RULE-SET,amazon-classical,🎬 Prime Video"
- "RULE-SET,spotify,🎵 音乐流媒体"
- "RULE-SET,soundcloud,🎵 音乐流媒体"
- "RULE-SET,pandora,🎵 音乐流媒体"
- "RULE-SET,pandoratv,🎵 音乐流媒体"
- "RULE-SET,tidal,🎵 音乐流媒体"
- "RULE-SET,deezer,🎵 音乐流媒体"
- "RULE-SET,overcast,🎵 音乐流媒体"
- "RULE-SET,lastfm,🎵 音乐流媒体"
- "RULE-SET,qobuz-domain,🎵 音乐流媒体"
- "RULE-SET,qobuz-ipcidr,🎵 音乐流媒体"
- "RULE-SET,szkane-bilihmt-domain,🇭🇰 香港流媒体"
- "RULE-SET,szkane-bilihmt-ipcidr,🇭🇰 香港流媒体"
- "DOMAIN-SUFFIX,mytv.com.hk,🇭🇰 香港流媒体"
- "DOMAIN-SUFFIX,viu.com,🇭🇰 香港流媒体"
- "DOMAIN-SUFFIX,viu.tv,🇭🇰 香港流媒体"
- "DOMAIN-SUFFIX,hktv.com.hk,🇭🇰 香港流媒体"
- "DOMAIN-SUFFIX,hktvmall.com,🇭🇰 香港流媒体"
- "DOMAIN-SUFFIX,nowtv.com,🇭🇰 香港流媒体"
- "DOMAIN-SUFFIX,icable.com,🇭🇰 香港流媒体"
- "DOMAIN-SUFFIX,hmvod.com.hk,🇭🇰 香港流媒体"
- "RULE-SET,mytvsuper,🇭🇰 香港流媒体"
- "RULE-SET,tvb,🇭🇰 香港流媒体"
- "RULE-SET,nowe,🇭🇰 香港流媒体"
- "RULE-SET,rthk,🇭🇰 香港流媒体"
- "RULE-SET,cabletv,🇭🇰 香港流媒体"
- "RULE-SET,moov,🇭🇰 香港流媒体"
- "RULE-SET,bahamut,🇹🇼 台湾流媒体"
- "RULE-SET,kktv,🇹🇼 台湾流媒体"
- "DOMAIN-SUFFIX,elta.tv,🇹🇼 台湾流媒体"
- "DOMAIN-SUFFIX,mod.cht.com.tw,🇹🇼 台湾流媒体"
- "DOMAIN-SUFFIX,ofiii.com,🇹🇼 台湾流媒体"
- "DOMAIN-SUFFIX,pts.org.tw,🇹🇼 台湾流媒体"
- "DOMAIN-SUFFIX,4gtv.tv,🇹🇼 台湾流媒体"
- "RULE-SET,litv,🇹🇼 台湾流媒体"
- "RULE-SET,friday,🇹🇼 台湾流媒体"
- "RULE-SET,hamivideo,🇹🇼 台湾流媒体"
- "RULE-SET,linetv-domain,🇹🇼 台湾流媒体"
- "RULE-SET,linetv-classical,🇹🇼 台湾流媒体"
- "RULE-SET,vidoltv,🇹🇼 台湾流媒体"
- "RULE-SET,taiwangood,🇹🇼 台湾流媒体"
- "RULE-SET,cht,🇹🇼 台湾流媒体"
- "RULE-SET,abema,🇯🇵 日韩流媒体"
- "RULE-SET,dazn,🇯🇵 日韩流媒体"
- "DOMAIN-SUFFIX,unext.jp,🇯🇵 日韩流媒体"
- "DOMAIN-SUFFIX,nhk.jp,🇯🇵 日韩流媒体"
- "DOMAIN-SUFFIX,nhk.or.jp,🇯🇵 日韩流媒体"
- "DOMAIN-SUFFIX,dtv.jp,🇯🇵 日韩流媒体"
- "DOMAIN-SUFFIX,paravi.jp,🇯🇵 日韩流媒体"
- "DOMAIN-SUFFIX,videomarket.jp,🇯🇵 日韩流媒体"
- "DOMAIN-SUFFIX,fod.fujitv.co.jp,🇯🇵 日韩流媒体"
- "DOMAIN-SUFFIX,gyao.yahoo.co.jp,🇯🇵 日韩流媒体"
- "DOMAIN-SUFFIX,music.jp,🇯🇵 日韩流媒体"
- "DOMAIN-SUFFIX,radiko.jp,🇯🇵 日韩流媒体"
- "DOMAIN-SUFFIX,lemino.docomo.ne.jp,🇯🇵 日韩流媒体"
- "DOMAIN-SUFFIX,wowow.co.jp,🇯🇵 日韩流媒体"
- "DOMAIN-SUFFIX,wavve.com,🇯🇵 日韩流媒体"
- "DOMAIN-SUFFIX,tving.com,🇯🇵 日韩流媒体"
- "DOMAIN-SUFFIX,watcha.com,🇯🇵 日韩流媒体"
- "DOMAIN-SUFFIX,coupangplay.com,🇯🇵 日韩流媒体"
- "DOMAIN-SUFFIX,sbs.co.kr,🇯🇵 日韩流媒体"
- "DOMAIN-SUFFIX,kbs.co.kr,🇯🇵 日韩流媒体"
- "DOMAIN-SUFFIX,mbc.co.kr,🇯🇵 日韩流媒体"
- "DOMAIN-SUFFIX,jtbc.co.kr,🇯🇵 日韩流媒体"
- "DOMAIN-SUFFIX,tvn.cjenm.com,🇯🇵 日韩流媒体"
- "DOMAIN-SUFFIX,afreecatv.com,🇯🇵 日韩流媒体"
- "DOMAIN-SUFFIX,tv.naver.com,🇯🇵 日韩流媒体"
- "DOMAIN-SUFFIX,now.naver.com,🇯🇵 日韩流媒体"
- "DOMAIN-SUFFIX,vod.naver.com,🇯🇵 日韩流媒体"
- "DOMAIN-SUFFIX,navertv.naver.com,🇯🇵 日韩流媒体"
- "DOMAIN-SUFFIX,kakaotv.daum.net,🇯🇵 日韩流媒体"
- "DOMAIN-SUFFIX,navercorp.com,🇯🇵 日韩流媒体"
- "RULE-SET,dmm-domain,🇯🇵 日韩流媒体"
- "RULE-SET,dmm-ipcidr,🇯🇵 日韩流媒体"
- "RULE-SET,tver,🇯🇵 日韩流媒体"
- "RULE-SET,niconico,🇯🇵 日韩流媒体"
- "RULE-SET,rakuten,🇯🇵 日韩流媒体"
- "RULE-SET,japonx,🇯🇵 日韩流媒体"
- "RULE-SET,nikkei,🇯🇵 日韩流媒体"
- "RULE-SET,bbc,🇪🇺 欧洲流媒体"
- "DOMAIN-SUFFIX,nowtv.co.uk,🇪🇺 欧洲流媒体"
- "DOMAIN-SUFFIX,canalplus.com,🇪🇺 欧洲流媒体"
- "DOMAIN-SUFFIX,mycanal.fr,🇪🇺 欧洲流媒体"
- "DOMAIN-SUFFIX,france.tv,🇪🇺 欧洲流媒体"
- "DOMAIN-SUFFIX,tf1.fr,🇪🇺 欧洲流媒体"
- "DOMAIN-SUFFIX,molotov.tv,🇪🇺 欧洲流媒体"
- "DOMAIN-SUFFIX,arte.tv,🇪🇺 欧洲流媒体"
- "DOMAIN-SUFFIX,joyn.de,🇪🇺 欧洲流媒体"
- "DOMAIN-SUFFIX,zdf.de,🇪🇺 欧洲流媒体"
- "DOMAIN-SUFFIX,ard.de,🇪🇺 欧洲流媒体"
- "DOMAIN-SUFFIX,ardmediathek.de,🇪🇺 欧洲流媒体"
- "DOMAIN-SUFFIX,rtlplus.com,🇪🇺 欧洲流媒体"
- "DOMAIN-SUFFIX,raiplay.it,🇪🇺 欧洲流媒体"
- "DOMAIN-SUFFIX,rtve.es,🇪🇺 欧洲流媒体"
- "DOMAIN-SUFFIX,videoland.com,🇪🇺 欧洲流媒体"
- "DOMAIN-SUFFIX,ruutu.fi,🇪🇺 欧洲流媒体"
- "DOMAIN-SUFFIX,tv2.dk,🇪🇺 欧洲流媒体"
- "DOMAIN-SUFFIX,svtplay.se,🇪🇺 欧洲流媒体"
- "DOMAIN-SUFFIX,nrk.no,🇪🇺 欧洲流媒体"
- "DOMAIN-SUFFIX,ivi.ru,🇪🇺 欧洲流媒体"
- "DOMAIN-SUFFIX,kinopoisk.ru,🇪🇺 欧洲流媒体"
- "DOMAIN-SUFFIX,okko.tv,🇪🇺 欧洲流媒体"
- "DOMAIN-SUFFIX,more.tv,🇪🇺 欧洲流媒体"
- "RULE-SET,itv,🇪🇺 欧洲流媒体"
- "RULE-SET,all4,🇪🇺 欧洲流媒体"
- "RULE-SET,my5,🇪🇺 欧洲流媒体"
- "RULE-SET,skygo,🇪🇺 欧洲流媒体"
- "RULE-SET,britboxuk,🇪🇺 欧洲流媒体"
- "RULE-SET,londonreal,🇪🇺 欧洲流媒体"
- "RULE-SET,szkane-uk,🇪🇺 欧洲流媒体"
- "RULE-SET,viu-domain,🌐 其他国外流媒体"
- "RULE-SET,viu-classical,🌐 其他国外流媒体"
- "DOMAIN-SUFFIX,iq.com,🌐 其他国外流媒体"
- "DOMAIN-SUFFIX,vidio.com,🌐 其他国外流媒体"
- "DOMAIN-SUFFIX,vidio.static6.com,🌐 其他国外流媒体"
- "DOMAIN-SUFFIX,rctiplus.com,🌐 其他国外流媒体"
- "DOMAIN-SUFFIX,visionplus.id,🌐 其他国外流媒体"
- "DOMAIN-SUFFIX,genflix.co.id,🌐 其他国外流媒体"
- "DOMAIN-SUFFIX,goplay.co.id,🌐 其他国外流媒体"
- "DOMAIN-SUFFIX,maxstream.tv,🌐 其他国外流媒体"
- "RULE-SET,biliintl,🌐 其他国外流媒体"
- "DOMAIN-SUFFIX,iflix.com,🌐 其他国外流媒体"
- "DOMAIN-SUFFIX,catchplay.com,🌐 其他国外流媒体"
- "DOMAIN-SUFFIX,trueid.net,🌐 其他国外流媒体"
- "DOMAIN-SUFFIX,dimsum.my,🌐 其他国外流媒体"
- "RULE-SET,asianmedia-domain,🌐 其他国外流媒体"
- "RULE-SET,asianmedia-ipcidr,🌐 其他国外流媒体"
- "RULE-SET,iqiyiintl-domain,🌐 其他国外流媒体"
- "RULE-SET,iqiyiintl-ipcidr,🌐 其他国外流媒体"
- "RULE-SET,iqiyiintl-classical,🌐 其他国外流媒体"
- "RULE-SET,joox-domain,🌐 其他国外流媒体"
- "RULE-SET,joox-ipcidr,🌐 其他国外流媒体"
- "RULE-SET,joox-classical,🌐 其他国外流媒体"
- "RULE-SET,mewatch,🌐 其他国外流媒体"
- "RULE-SET,viki,🌐 其他国外流媒体"
- "RULE-SET,wetv-domain,🌐 其他国外流媒体"
- "RULE-SET,wetv-ipcidr,🌐 其他国外流媒体"
- "RULE-SET,wetv-classical,🌐 其他国外流媒体"
- "RULE-SET,zee,🌐 其他国外流媒体"
- "RULE-SET,acc-kwai,🌐 其他国外流媒体"
- "RULE-SET,paramount,🌐 其他国外流媒体"
- "RULE-SET,peacock,🌐 其他国外流媒体"
- "RULE-SET,twitch-domain,🌐 其他国外流媒体"
- "RULE-SET,twitch-ipcidr,🌐 其他国外流媒体"
- "RULE-SET,twitch-classical,🌐 其他国外流媒体"
- "DOMAIN-SUFFIX,crunchyroll.com,🌐 其他国外流媒体"
- "DOMAIN-SUFFIX,vrv.co,🌐 其他国外流媒体"
- "DOMAIN-SUFFIX,pluto.tv,🌐 其他国外流媒体"
- "DOMAIN-SUFFIX,tubi.tv,🌐 其他国外流媒体"
- "DOMAIN-SUFFIX,fubo.tv,🌐 其他国外流媒体"
- "DOMAIN-SUFFIX,appletv.com,🌐 其他国外流媒体"
- "RULE-SET,cbs-domain,🌐 其他国外流媒体"
- "RULE-SET,cbs-classical,🌐 其他国外流媒体"
- "RULE-SET,nbc,🌐 其他国外流媒体"
- "RULE-SET,pbs,🌐 其他国外流媒体"
- "RULE-SET,attwatchtv,🌐 其他国外流媒体"
- "RULE-SET,fox,🌐 其他国外流媒体"
- "RULE-SET,fubotv,🌐 其他国外流媒体"
- "RULE-SET,sling,🌐 其他国外流媒体"
- "RULE-SET,vimeo,🌐 其他国外流媒体"
- "RULE-SET,dailymotion,🌐 其他国外流媒体"
- "RULE-SET,discoveryplus,🌐 其他国外流媒体"
- "RULE-SET,americasvoice,🌐 其他国外流媒体"
- "RULE-SET,cake,🌐 其他国外流媒体"
- "RULE-SET,dood,🌐 其他国外流媒体"
- "RULE-SET,emby-domain,🌐 其他国外流媒体"
- "RULE-SET,emby-classical,🌐 其他国外流媒体"
- "DOMAIN-SUFFIX,aws.amazon.com,🔧 工具与服务"
- "DOMAIN-SUFFIX,elasticbeanstalk.com,🔧 工具与服务"
- "RULE-SET,bing,🔧 工具与服务"
- "DOMAIN-SUFFIX,yahoo.com,🔧 工具与服务"
- "DOMAIN-SUFFIX,yahoo.co.jp,🔧 工具与服务"
- "DOMAIN-SUFFIX,duckduckgo.com,🔧 工具与服务"
- "DOMAIN-SUFFIX,ddg.co,🔧 工具与服务"
- "DOMAIN-SUFFIX,brave.com,🔧 工具与服务"
- "DOMAIN-SUFFIX,ecosia.org,🔧 工具与服务"
- "DOMAIN-SUFFIX,startpage.com,🔧 工具与服务"
- "DOMAIN-SUFFIX,you.com,🔧 工具与服务"
- "DOMAIN-SUFFIX,search.naver.com,🔧 工具与服务"
- "RULE-SET,scholar,🔍 Google 服务"
- "RULE-SET,yandex-domain,🔧 工具与服务"
- "RULE-SET,yandex-ipcidr,🔧 工具与服务"
- "RULE-SET,github,🔧 工具与服务"
- "RULE-SET,docker,🔧 工具与服务"
- "RULE-SET,gitlab,🔧 工具与服务"
- "GEOSITE,category-dev,🔧 工具与服务"
- "DOMAIN-SUFFIX,npmjs.com,🔧 工具与服务"
- "DOMAIN-SUFFIX,npmjs.org,🔧 工具与服务"
- "DOMAIN-SUFFIX,yarnpkg.com,🔧 工具与服务"
- "DOMAIN-SUFFIX,crates.io,🔧 工具与服务"
- "DOMAIN-SUFFIX,rubygems.org,🔧 工具与服务"
- "DOMAIN-SUFFIX,packagist.org,🔧 工具与服务"
- "DOMAIN-SUFFIX,maven.org,🔧 工具与服务"
- "DOMAIN-SUFFIX,nuget.org,🔧 工具与服务"
- "DOMAIN-SUFFIX,cocoapods.org,🔧 工具与服务"
- "DOMAIN-SUFFIX,stackoverflow.com,🔧 工具与服务"
- "DOMAIN-SUFFIX,stackexchange.com,🔧 工具与服务"
- "DOMAIN-SUFFIX,sstatic.net,🔧 工具与服务"
- "DOMAIN-SUFFIX,vercel.com,🔧 工具与服务"
- "DOMAIN-SUFFIX,vercel.app,🔧 工具与服务"
- "DOMAIN-SUFFIX,netlify.app,🔧 工具与服务"
- "DOMAIN-SUFFIX,netlify.com,🔧 工具与服务"
- "DOMAIN-SUFFIX,pages.dev,🔧 工具与服务"
- "DOMAIN-SUFFIX,workers.dev,🔧 工具与服务"
- "DOMAIN,dash.cloudflare.com,🔧 工具与服务"
- "DOMAIN,api.cloudflare.com,🔧 工具与服务"
- "DOMAIN,developers.cloudflare.com,🔧 工具与服务"
- "DOMAIN,www.cloudflare.com,🔧 工具与服务"
- "DOMAIN-SUFFIX,heroku.com,🔧 工具与服务"
- "DOMAIN-SUFFIX,herokuapp.com,🔧 工具与服务"
- "DOMAIN-SUFFIX,fly.io,🔧 工具与服务"
- "DOMAIN-SUFFIX,railway.app,🔧 工具与服务"
- "DOMAIN-SUFFIX,render.com,🔧 工具与服务"
- "DOMAIN-SUFFIX,supabase.com,🔧 工具与服务"
- "DOMAIN-SUFFIX,supabase.co,🔧 工具与服务"
- "DOMAIN-SUFFIX,planetscale.com,🔧 工具与服务"
- "DOMAIN-SUFFIX,neon.tech,🔧 工具与服务"
- "DOMAIN-SUFFIX,digitalocean.com,🔧 工具与服务"
- "DOMAIN-SUFFIX,vultr.com,🔧 工具与服务"
- "DOMAIN-SUFFIX,linode.com,🔧 工具与服务"
- "DOMAIN-SUFFIX,sentry.io,🔧 工具与服务"
- "DOMAIN-SUFFIX,datadog.com,🔧 工具与服务"
- "DOMAIN-SUFFIX,grafana.com,🔧 工具与服务"
- "DOMAIN-SUFFIX,postman.com,🔧 工具与服务"
- "DOMAIN-SUFFIX,jetbrains.com,🔧 工具与服务"
- "DOMAIN-SUFFIX,hashicorp.com,🔧 工具与服务"
- "DOMAIN-SUFFIX,terraform.io,🔧 工具与服务"
- "DOMAIN-SUFFIX,vagrantup.com,🔧 工具与服务"
- "RULE-SET,developer,🔧 工具与服务"
- "RULE-SET,python,🔧 工具与服务"
- "RULE-SET,gitbook,🔧 工具与服务"
- "RULE-SET,jfrog,🔧 工具与服务"
- "RULE-SET,sublimetext,🔧 工具与服务"
- "RULE-SET,wordpress,🔧 工具与服务"
- "RULE-SET,wix,🔧 工具与服务"
- "RULE-SET,cisco,🔧 工具与服务"
- "RULE-SET,ibm,🔧 工具与服务"
- "RULE-SET,oracle,🔧 工具与服务"
- "RULE-SET,unity-domain,🔧 工具与服务"
- "RULE-SET,unity-classical,🔧 工具与服务"
- "RULE-SET,szkane-developer-domain,🔧 工具与服务"
- "RULE-SET,szkane-developer-classical,🔧 工具与服务"
- "RULE-SET,onedrive,Ⓜ️ 微软服务"
- "RULE-SET,microsoft,Ⓜ️ 微软服务"
- "RULE-SET,microsoftedge,Ⓜ️ 微软服务"
- "RULE-SET,acc-microsoftapps,Ⓜ️ 微软服务"
- "RULE-SET,applemusic-domain,🍎 苹果服务"
- "RULE-SET,applemusic-classical,🍎 苹果服务"
- "RULE-SET,icloud,🍎 苹果服务"
- "RULE-SET,apple,🍎 苹果服务"
- "RULE-SET,appstore,🍎 苹果服务"
- "RULE-SET,appletv-domain,🍎 苹果服务"
- "RULE-SET,appletv-classical,🍎 苹果服务"
- "RULE-SET,applenews,🍎 苹果服务"
- "RULE-SET,appledev,🍎 苹果服务"
- "RULE-SET,appleproxy-domain,🍎 苹果服务"
- "RULE-SET,appleproxy-classical,🍎 苹果服务"
- "RULE-SET,siri,🍎 苹果服务"
- "RULE-SET,testflight,🍎 苹果服务"
- "RULE-SET,applefirmware-domain,🍎 苹果服务"
- "RULE-SET,applefirmware-classical,🍎 苹果服务"
- "RULE-SET,acc-applenews,🍎 苹果服务"
- "RULE-SET,acc-apple-domain,🍎 苹果服务"
- "RULE-SET,acc-apple-ipcidr,🍎 苹果服务"
- "RULE-SET,systemota,📥 下载更新"
- "DOMAIN-SUFFIX,windowsupdate.com,📥 下载更新"
- "DOMAIN-SUFFIX,update.microsoft.com,📥 下载更新"
- "DOMAIN-SUFFIX,download.microsoft.com,📥 下载更新"
- "DOMAIN-SUFFIX,delivery.mp.microsoft.com,📥 下载更新"
- "DOMAIN-SUFFIX,officecdn.microsoft.com,📥 下载更新"
- "DOMAIN-SUFFIX,officecdn.microsoft.com.edgesuite.net,📥 下载更新"
- "DOMAIN-SUFFIX,archive.ubuntu.com,📥 下载更新"
- "DOMAIN-SUFFIX,security.ubuntu.com,📥 下载更新"
- "DOMAIN-SUFFIX,mirrors.kernel.org,📥 下载更新"
- "DOMAIN-SUFFIX,dl.fedoraproject.org,📥 下载更新"
- "DOMAIN-SUFFIX,repo.anaconda.com,📥 下载更新"
- "DOMAIN-SUFFIX,conda.anaconda.org,📥 下载更新"
- "DOMAIN-SUFFIX,repo.continuum.io,📥 下载更新"
- "DOMAIN-SUFFIX,sourceforge.net,📥 下载更新"
- "DOMAIN-SUFFIX,fosshub.com,📥 下载更新"
- "DOMAIN-SUFFIX,filehippo.com,📥 下载更新"
- "DOMAIN-SUFFIX,softonic.com,📥 下载更新"
- "DOMAIN-SUFFIX,gcr.io,📥 下载更新"
- "DOMAIN-SUFFIX,ghcr.io,📥 下载更新"
- "DOMAIN-SUFFIX,quay.io,📥 下载更新"
- "DOMAIN-SUFFIX,registry.k8s.io,📥 下载更新"
- "RULE-SET,download-domain,📥 下载更新"
- "RULE-SET,download-classical,📥 下载更新"
- "RULE-SET,ubuntu,📥 下载更新"
- "RULE-SET,mozilla,📥 下载更新"
- "RULE-SET,apkpure,📥 下载更新"
- "RULE-SET,android,📥 下载更新"
- "RULE-SET,intel,📥 下载更新"
- "RULE-SET,nvidia,📥 下载更新"
- "RULE-SET,dell,📥 下载更新"
- "RULE-SET,hp,📥 下载更新"
- "RULE-SET,canon,📥 下载更新"
- "RULE-SET,lg-domain,📥 下载更新"
- "RULE-SET,lg-ipcidr,📥 下载更新"
- "RULE-SET,acc-macappupgrade,📥 下载更新"
- "GEOSITE,tracker,🛰️ BT/PT Tracker"
- "DOMAIN-SUFFIX,tracker.opentrackr.org,🛰️ BT/PT Tracker"
- "DOMAIN-SUFFIX,open.stealth.si,🛰️ BT/PT Tracker"
- "DOMAIN-SUFFIX,tracker.torrent.eu.org,🛰️ BT/PT Tracker"
- "DOMAIN-SUFFIX,exodus.desync.com,🛰️ BT/PT Tracker"
- "DOMAIN-SUFFIX,tracker.openbittorrent.com,🛰️ BT/PT Tracker"
- "DOMAIN-SUFFIX,tracker.publicbt.com,🛰️ BT/PT Tracker"
- "DOMAIN-SUFFIX,tracker.dler.org,🛰️ BT/PT Tracker"
- "RULE-SET,privatetracker-domain,🛰️ BT/PT Tracker"
- "RULE-SET,privatetracker-ipcidr,🛰️ BT/PT Tracker"
- "RULE-SET,acc-emuleserver,🛰️ BT/PT Tracker"
- "DOMAIN-SUFFIX,jsdelivr.net,🚫 受限网站"
- "DOMAIN-SUFFIX,cloudflare-dns.com,🚫 受限网站"
- "GEOSITE,gfw,🚫 受限网站"
- "RULE-SET,loyalsoldier-gfw,🚫 受限网站"
- "RULE-SET,loyalsoldier-greatfire,🚫 受限网站"
- "RULE-SET,szkane-proxygfw-domain,🚫 受限网站"
- "RULE-SET,szkane-proxygfw-ipcidr,🚫 受限网站"
- "DOMAIN-SUFFIX,mihoyo.com,🕹️ 国内游戏"
- "DOMAIN-SUFFIX,miyoushe.com,🕹️ 国内游戏"
- "DOMAIN-SUFFIX,yuanshen.com,🕹️ 国内游戏"
- "DOMAIN-SUFFIX,bhsr.com,🕹️ 国内游戏"
- "DOMAIN-SUFFIX,zenlesszonezero.com,🕹️ 国内游戏"
- "DOMAIN,game.163.com,🕹️ 国内游戏"
- "DOMAIN-SUFFIX,gm.163.com,🕹️ 国内游戏"
- "DOMAIN-SUFFIX,ds.163.com,🕹️ 国内游戏"
- "DOMAIN-SUFFIX,nie.163.com,🕹️ 国内游戏"
- "DOMAIN-SUFFIX,nie.netease.com,🕹️ 国内游戏"
- "DOMAIN-SUFFIX,update.netease.com,🕹️ 国内游戏"
- "DOMAIN-SUFFIX,netease.com,🕹️ 国内游戏"
- "DOMAIN-SUFFIX,wegame.com,🕹️ 国内游戏"
- "DOMAIN-SUFFIX,wegame.com.cn,🕹️ 国内游戏"
- "DOMAIN-SUFFIX,perfect-world.com,🕹️ 国内游戏"
- "DOMAIN-SUFFIX,wanmei.com,🕹️ 国内游戏"
- "DOMAIN-SUFFIX,xd.com,🕹️ 国内游戏"
- "DOMAIN-SUFFIX,taptap.com,🕹️ 国内游戏"
- "DOMAIN-SUFFIX,taptap.io,🕹️ 国内游戏"
- "DOMAIN-SUFFIX,papegames.com,🕹️ 国内游戏"
- "DOMAIN-SUFFIX,hypergryph.com,🕹️ 国内游戏"
- "DOMAIN-SUFFIX,gryphline.com,🕹️ 国内游戏"
- "DOMAIN-SUFFIX,lilith.com,🕹️ 国内游戏"
- "RULE-SET,steamcn,🕹️ 国内游戏"
- "RULE-SET,wanmeishijie,🕹️ 国内游戏"
- "RULE-SET,wankahuanju,🕹️ 国内游戏"
- "RULE-SET,majsoul,🕹️ 国内游戏"
- "RULE-SET,steam,🎮 国外游戏"
- "RULE-SET,epic,🎮 国外游戏"
- "RULE-SET,playstation,🎮 国外游戏"
- "RULE-SET,nintendo-domain,🎮 国外游戏"
- "RULE-SET,nintendo-ipcidr,🎮 国外游戏"
- "RULE-SET,xbox,🎮 国外游戏"
- "RULE-SET,ea,🎮 国外游戏"
- "RULE-SET,blizzard-domain,🎮 国外游戏"
- "RULE-SET,blizzard-ipcidr,🎮 国外游戏"
- "GEOSITE,category-games,🎮 国外游戏"
- "RULE-SET,rockstar,🎮 国外游戏"
- "RULE-SET,riot,🎮 国外游戏"
- "RULE-SET,gog,🎮 国外游戏"
- "RULE-SET,supercell-domain,🎮 国外游戏"
- "RULE-SET,supercell-ipcidr,🎮 国外游戏"
- "RULE-SET,garena,🎮 国外游戏"
- "RULE-SET,hoyoverse,🎮 国外游戏"
- "RULE-SET,ubi,🎮 国外游戏"
- "RULE-SET,sony,🎮 国外游戏"
- "DOMAIN-SUFFIX,amazonaws.com,🌐 国外网站"
- "DOMAIN-SUFFIX,awsstatic.com,🌐 国外网站"
- "RULE-SET,cloudflare-ip,🌐 国外网站,no-resolve"
- "RULE-SET,cloudfront-ip,🌐 国外网站,no-resolve"
- "RULE-SET,fastly-ip,🌐 国外网站,no-resolve"
- "DOMAIN-SUFFIX,akamai.net,🌐 国外网站"
- "DOMAIN-SUFFIX,akamaized.net,🌐 国外网站"
- "DOMAIN-SUFFIX,akamaihd.net,🌐 国外网站"
- "DOMAIN-SUFFIX,akamaiedge.net,🌐 国外网站"
- "DOMAIN-SUFFIX,akamaitechnologies.com,🌐 国外网站"
- "DOMAIN-SUFFIX,edgekey.net,🌐 国外网站"
- "DOMAIN-SUFFIX,edgesuite.net,🌐 国外网站"
- "DOMAIN-SUFFIX,cloudfront.net,🌐 国外网站"
- "DOMAIN-SUFFIX,fastly.net,🌐 国外网站"
- "DOMAIN-SUFFIX,fastlylb.net,🌐 国外网站"
- "DOMAIN-SUFFIX,kxcdn.com,🌐 国外网站"
- "DOMAIN-SUFFIX,stackpathdns.com,🌐 国外网站"
- "DOMAIN-SUFFIX,stackpathcdn.com,🌐 国外网站"
- "DOMAIN-SUFFIX,b-cdn.net,🌐 国外网站"
- "DOMAIN-SUFFIX,bunny.net,🌐 国外网站"
- "DOMAIN-SUFFIX,bunnycdn.com,🌐 国外网站"
- "DOMAIN-SUFFIX,cdn77.org,🌐 国外网站"
- "DOMAIN-SUFFIX,azureedge.net,🌐 国外网站"
- "DOMAIN-SUFFIX,azurefd.net,🌐 国外网站"
- "DOMAIN-SUFFIX,msecnd.net,🌐 国外网站"
- "DOMAIN-SUFFIX,unpkg.com,🌐 国外网站"
- "DOMAIN-SUFFIX,r2.dev,🌐 国外网站"
- "DOMAIN-SUFFIX,ziffstatic.com,🌐 国外网站"
- "DOMAIN-SUFFIX,ucoz.ru,🌐 国外网站"
- "DOMAIN-SUFFIX,ucoz.net,🌐 国外网站"
- "RULE-SET,cloudflare-domain,🌐 国外网站"
- "RULE-SET,cloudflare-ipcidr,🌐 国外网站"
- "RULE-SET,akamai,🌐 国外网站"
- "RULE-SET,digicert,🌐 国外网站"
- "RULE-SET,globalsign,🌐 国外网站"
- "RULE-SET,sectigo,🌐 国外网站"
- "RULE-SET,brightcove,🌐 国外网站"
- "RULE-SET,jwplayer,🌐 国外网站"
- "RULE-SET,acc-fastly,🌐 国外网站"
- "DOMAIN-SUFFIX,letsencrypt.org,🌐 国外网站"
- "DOMAIN-SUFFIX,lencr.org,🌐 国外网站"
- "DOMAIN-SUFFIX,tokopedia.com,🌐 国外网站"
- "DOMAIN-SUFFIX,tokopedia.net,🌐 国外网站"
- "DOMAIN-SUFFIX,shopee.co.id,🌐 国外网站"
- "DOMAIN-SUFFIX,bukalapak.com,🌐 国外网站"
- "DOMAIN-SUFFIX,blibli.com,🌐 国外网站"
- "DOMAIN-SUFFIX,lazada.co.id,🌐 国外网站"
- "DOMAIN-SUFFIX,grab.com,🌐 国外网站"
- "DOMAIN-SUFFIX,gojek.com,🌐 国外网站"
- "DOMAIN-SUFFIX,gojek.co.id,🌐 国外网站"
- "DOMAIN-SUFFIX,traveloka.com,🌐 国外网站"
- "DOMAIN-SUFFIX,tiket.com,🌐 国外网站"
- "DOMAIN-SUFFIX,telkomsel.com,🌐 国外网站"
- "DOMAIN-SUFFIX,telkom.co.id,🌐 国外网站"
- "DOMAIN-SUFFIX,indosatooredoo.com,🌐 国外网站"
- "DOMAIN-SUFFIX,im3.co.id,🌐 国外网站"
- "DOMAIN-SUFFIX,xl.co.id,🌐 国外网站"
- "DOMAIN-SUFFIX,smartfren.com,🌐 国外网站"
- "DOMAIN-SUFFIX,tri.co.id,🌐 国外网站"
- "DOMAIN-SUFFIX,by.u.id,🌐 国外网站"
- "DOMAIN-SUFFIX,myrepublic.co.id,🌐 国外网站"
- "DOMAIN-SUFFIX,firstmedia.com,🌐 国外网站"
- "DOMAIN-SUFFIX,biznet.id,🌐 国外网站"
- "DOMAIN-SUFFIX,go.id,🌐 国外网站"
- "DOMAIN-SUFFIX,or.id,🌐 国外网站"
- "DOMAIN-SUFFIX,kompas.com,🌐 国外网站"
- "DOMAIN-SUFFIX,detik.com,🌐 国外网站"
- "DOMAIN-SUFFIX,tempo.co,🌐 国外网站"
- "DOMAIN-SUFFIX,cnnindonesia.com,🌐 国外网站"
- "DOMAIN-SUFFIX,cnbcindonesia.com,🌐 国外网站"
- "DOMAIN-SUFFIX,liputan6.com,🌐 国外网站"
- "DOMAIN-SUFFIX,tribunnews.com,🌐 国外网站"
- "DOMAIN-SUFFIX,kumparan.com,🌐 国外网站"
- "DOMAIN-SUFFIX,idntimes.com,🌐 国外网站"
- "DOMAIN-SUFFIX,gofood.co.id,🌐 国外网站"
- "DOMAIN-SUFFIX,grabfood.com,🌐 国外网站"
- "DOMAIN-SUFFIX,66tutup.com,🌐 国外网站"
- "GEOIP,ID,🌐 国外网站,no-resolve"
- "RULE-SET,acc-homeip-us,🌐 国外网站,no-resolve"
- "RULE-SET,acc-homeip-jp,🌐 国外网站,no-resolve"
- "RULE-SET,acc-aqara-global-domain,🌐 国外网站"
- "RULE-SET,acc-aqara-global-ipcidr,🌐 国外网站"
- "RULE-SET,cnn,🌐 国外网站"
- "RULE-SET,nytimes,🌐 国外网站"
- "RULE-SET,bloomberg,🌐 国外网站"
- "RULE-SET,ebay,🌐 国外网站"
- "RULE-SET,nike,🌐 国外网站"
- "RULE-SET,adobe,🌐 国外网站"
- "RULE-SET,samsung,🌐 国外网站"
- "RULE-SET,tesla,🌐 国外网站"
- "RULE-SET,dropbox,🌐 国外网站"
- "RULE-SET,mega-domain,🌐 国外网站"
- "RULE-SET,mega-ipcidr,🌐 国外网站"
- "RULE-SET,mega-classical,🌐 国外网站"
- "RULE-SET,wikipedia,🌐 国外网站"
- "RULE-SET,duolingo,🌐 国外网站"
- "RULE-SET,proxy,🌐 国外网站"
- "RULE-SET,acc-waybackmachine-domain,🌐 国外网站"
- "RULE-SET,acc-waybackmachine-ipcidr,🌐 国外网站"
- "RULE-SET,acc-pornhub,🌐 国外网站"
- "RULE-SET,szkane-khan,🌐 国外网站"
- "RULE-SET,szkane-edutools,🌐 国外网站"
- "RULE-SET,naver-domain,🌐 国外网站"
- "RULE-SET,naver-ipcidr,🌐 国外网站"
- "RULE-SET,naver-classical,🌐 国外网站"
- "RULE-SET,ehgallery-domain,🌐 国外网站"
- "RULE-SET,ehgallery-ipcidr,🌐 国外网站"
- "RULE-SET,acc-geo-d-asia-east,🌐 国外网站"
- "RULE-SET,acc-geo-d-asia-eastsouth,🌐 国外网站"
- "RULE-SET,acc-geo-d-asia-south,🌐 国外网站"
- "RULE-SET,acc-geo-d-asia-central,🌐 国外网站"
- "RULE-SET,acc-geo-d-asia-west,🌐 国外网站"
- "RULE-SET,acc-geo-d-america-north,🌐 国外网站"
- "RULE-SET,acc-geo-d-america-south,🌐 国外网站"
- "RULE-SET,acc-geo-d-europe-west,🌐 国外网站"
- "RULE-SET,acc-geo-d-europe-east,🌐 国外网站"
- "RULE-SET,acc-geo-d-oceania,🌐 国外网站"
- "RULE-SET,acc-geo-d-antarctica,🌐 国外网站"
- "RULE-SET,acc-geo-d-africa-north,🌐 国外网站"
- "RULE-SET,acc-geo-d-africa-south,🌐 国外网站"
- "RULE-SET,acc-geo-d-africa-west,🌐 国外网站"
- "RULE-SET,acc-geo-d-africa-east,🌐 国外网站"
- "RULE-SET,acc-geo-d-africa-central,🌐 国外网站"
- "RULE-SET,acc-geo-ip-asia-east,🌐 国外网站,no-resolve"
- "RULE-SET,acc-geo-ip-asia-eastsouth,🌐 国外网站,no-resolve"
- "RULE-SET,acc-geo-ip-asia-south,🌐 国外网站,no-resolve"
- "RULE-SET,acc-geo-ip-asia-central,🌐 国外网站,no-resolve"
- "RULE-SET,acc-geo-ip-asia-west,🌐 国外网站,no-resolve"
- "RULE-SET,acc-geo-ip-america-north,🌐 国外网站,no-resolve"
- "RULE-SET,acc-geo-ip-america-south,🌐 国外网站,no-resolve"
- "RULE-SET,acc-geo-ip-europe-west,🌐 国外网站,no-resolve"
- "RULE-SET,acc-geo-ip-europe-east,🌐 国外网站,no-resolve"
- "RULE-SET,acc-geo-ip-oceania,🌐 国外网站,no-resolve"
- "RULE-SET,acc-geo-ip-antarctica,🌐 国外网站,no-resolve"
- "RULE-SET,acc-geo-ip-africa-north,🌐 国外网站,no-resolve"
- "RULE-SET,acc-geo-ip-africa-south,🌐 国外网站,no-resolve"
- "RULE-SET,acc-geo-ip-africa-west,🌐 国外网站,no-resolve"
- "RULE-SET,acc-geo-ip-africa-east,🌐 国外网站,no-resolve"
- "RULE-SET,acc-geo-ip-africa-central,🌐 国外网站,no-resolve"
- "DOMAIN-SUFFIX,archive.org,🌐 国外网站"
- "DOMAIN-SUFFIX,udemy.com,🌐 国外网站"
- "DOMAIN-SUFFIX,udemycdn.com,🌐 国外网站"
- "DOMAIN-SUFFIX,grammarly.com,🌐 国外网站"
- "DOMAIN-SUFFIX,grammarly.io,🌐 国外网站"
- "DOMAIN-SUFFIX,jetbrains.net,🌐 国外网站"
- "DOMAIN-SUFFIX,theguardian.com,🌐 国外网站"
- "DOMAIN-SUFFIX,guardianapis.com,🌐 国外网站"
- "DOMAIN-SUFFIX,box.com,🌐 国外网站"
- "DOMAIN-SUFFIX,boxcdn.net,🌐 国外网站"
- "DOMAIN-SUFFIX,noip.com,🌐 国外网站"
- "DOMAIN-SUFFIX,bca.co.id,🏦 金融支付"
- "DOMAIN-SUFFIX,klikbca.com,🏦 金融支付"
- "DOMAIN-SUFFIX,bni.co.id,🏦 金融支付"
- "DOMAIN-SUFFIX,bri.co.id,🏦 金融支付"
- "DOMAIN-SUFFIX,bankmandiri.co.id,🏦 金融支付"
- "DOMAIN-SUFFIX,danamon.co.id,🏦 金融支付"
- "DOMAIN-SUFFIX,permatabank.com,🏦 金融支付"
- "DOMAIN-SUFFIX,cimbniaga.co.id,🏦 金融支付"
- "DOMAIN-SUFFIX,btn.co.id,🏦 金融支付"
- "DOMAIN-SUFFIX,ocbcnisp.com,🏦 金融支付"
- "DOMAIN-SUFFIX,banksinarmas.com,🏦 金融支付"
- "DOMAIN-SUFFIX,idx.co.id,🏦 金融支付"
- "DOMAIN-SUFFIX,ksei.co.id,🏦 金融支付"
- "DOMAIN-SUFFIX,iqiyi.com,📺 国内流媒体"
- "DOMAIN-SUFFIX,iqiyipic.com,📺 国内流媒体"
- "DOMAIN-SUFFIX,71.am,📺 国内流媒体"
- "DOMAIN-SUFFIX,youku.com,📺 国内流媒体"
- "DOMAIN-SUFFIX,ykimg.com,📺 国内流媒体"
- "DOMAIN-SUFFIX,soku.com,📺 国内流媒体"
- "DOMAIN-SUFFIX,v.qq.com,📺 国内流媒体"
- "DOMAIN-SUFFIX,video.qq.com,📺 国内流媒体"
- "DOMAIN-KEYWORD,tencentvideo,📺 国内流媒体"
- "DOMAIN-SUFFIX,mgtv.com,📺 国内流媒体"
- "DOMAIN-SUFFIX,hitv.com,📺 国内流媒体"
- "DOMAIN-SUFFIX,hunantv.com,📺 国内流媒体"
- "DOMAIN-SUFFIX,ixigua.com,📺 国内流媒体"
- "DOMAIN-SUFFIX,pstatp.com,📺 国内流媒体"
- "DOMAIN-SUFFIX,snssdk.com,📺 国内流媒体"
- "DOMAIN-SUFFIX,sohu.com,📺 国内流媒体"
- "DOMAIN-SUFFIX,music.163.com,📺 国内流媒体"
- "DOMAIN-SUFFIX,ntes53.netease.com,📺 国内流媒体"
- "DOMAIN-SUFFIX,y.qq.com,📺 国内流媒体"
- "DOMAIN-SUFFIX,music.qq.com,📺 国内流媒体"
- "DOMAIN-SUFFIX,kugou.com,📺 国内流媒体"
- "DOMAIN-SUFFIX,kuwo.cn,📺 国内流媒体"
- "DOMAIN-SUFFIX,xiaohongshu.com,📺 国内流媒体"
- "DOMAIN-SUFFIX,xhscdn.com,📺 国内流媒体"
- "DOMAIN-SUFFIX,kuaishou.com,📺 国内流媒体"
- "DOMAIN-SUFFIX,gifshow.com,📺 国内流媒体"
- "DOMAIN-SUFFIX,weibo.com,📺 国内流媒体"
- "DOMAIN-SUFFIX,weibo.cn,📺 国内流媒体"
- "DOMAIN-SUFFIX,sinaimg.cn,📺 国内流媒体"
- "RULE-SET,iqiyi-domain,📺 国内流媒体"
- "RULE-SET,iqiyi-ipcidr,📺 国内流媒体"
- "RULE-SET,iqiyi-classical,📺 国内流媒体"
- "RULE-SET,youku-domain,📺 国内流媒体"
- "RULE-SET,youku-ipcidr,📺 国内流媒体"
- "RULE-SET,tencentvideo-domain,📺 国内流媒体"
- "RULE-SET,tencentvideo-ipcidr,📺 国内流媒体"
- "RULE-SET,douyin,📺 国内流媒体"
- "RULE-SET,bytedance-domain,📺 国内流媒体"
- "RULE-SET,bytedance-ipcidr,📺 国内流媒体"
- "RULE-SET,bytedance-classical,📺 国内流媒体"
- "RULE-SET,kuaishou,📺 国内流媒体"
- "RULE-SET,weibo,📺 国内流媒体"
- "RULE-SET,xiaohongshu,📺 国内流媒体"
- "RULE-SET,neteasemusic-domain,📺 国内流媒体"
- "RULE-SET,neteasemusic-ipcidr,📺 国内流媒体"
- "RULE-SET,kugoukuwo-domain,📺 国内流媒体"
- "RULE-SET,kugoukuwo-ipcidr,📺 国内流媒体"
- "RULE-SET,sohu,📺 国内流媒体"
- "RULE-SET,douyu,📺 国内流媒体"
- "RULE-SET,huya,📺 国内流媒体"
- "RULE-SET,himalaya,📺 国内流媒体"
- "RULE-SET,cctv,📺 国内流媒体"
- "RULE-SET,hunantv,📺 国内流媒体"
- "RULE-SET,pptv,📺 国内流媒体"
- "RULE-SET,funshion,📺 国内流媒体"
- "RULE-SET,letv,📺 国内流媒体"
- "RULE-SET,taihemusic,📺 国内流媒体"
- "RULE-SET,kukemusic,📺 国内流媒体"
- "RULE-SET,hibymusic,📺 国内流媒体"
- "RULE-SET,miwu,📺 国内流媒体"
- "RULE-SET,migu,📺 国内流媒体"
- "RULE-SET,iptvmainland,📺 国内流媒体"
- "RULE-SET,iptvother,📺 国内流媒体"
- "RULE-SET,cibn,📺 国内流媒体"
- "RULE-SET,bestv,📺 国内流媒体"
- "RULE-SET,huashutv,📺 国内流媒体"
- "RULE-SET,smg,📺 国内流媒体"
- "RULE-SET,hwtv,📺 国内流媒体"
- "RULE-SET,nivodtv,📺 国内流媒体"
- "RULE-SET,olevod,📺 国内流媒体"
- "RULE-SET,dandanzan,📺 国内流媒体"
- "RULE-SET,dandanplay,📺 国内流媒体"
- "RULE-SET,tiantiankankan,📺 国内流媒体"
- "RULE-SET,yizhibo,📺 国内流媒体"
- "RULE-SET,ku6,📺 国内流媒体"
- "RULE-SET,56,📺 国内流媒体"
- "RULE-SET,cetv,📺 国内流媒体"
- "RULE-SET,yyets,📺 国内流媒体"
- "RULE-SET,acc-alipan,📺 国内流媒体"
- "RULE-SET,acc-baidunetdisk,📺 国内流媒体"
- "RULE-SET,acc-weiyun-domain,📺 国内流媒体"
- "RULE-SET,acc-weiyun-ipcidr,📺 国内流媒体"
- "RULE-SET,acc-fl-bilibili-domain,📺 国内流媒体"
- "RULE-SET,acc-fl-bilibili-ipcidr,📺 国内流媒体"
- "RULE-SET,acc-fl-kuaishou,📺 国内流媒体"
- "RULE-SET,acc-fl-xigua,📺 国内流媒体"
- "RULE-SET,acc-fl-weibo,📺 国内流媒体"
- "RULE-SET,acc-fl-zhihu-domain,📺 国内流媒体"
- "RULE-SET,acc-fl-zhihu-ipcidr,📺 国内流媒体"
- "RULE-SET,acc-fl-tieba-domain,📺 国内流媒体"
- "RULE-SET,acc-fl-tieba-ipcidr,📺 国内流媒体"
- "RULE-SET,acc-fl-douban-domain,📺 国内流媒体"
- "RULE-SET,acc-fl-douban-ipcidr,📺 国内流媒体"
- "RULE-SET,acc-fl-xianyu-domain,📺 国内流媒体"
- "RULE-SET,acc-fl-xianyu-ipcidr,📺 国内流媒体"
- "DOMAIN-SUFFIX,163.com,🏠 国内网站"
- "DOMAIN-SUFFIX,126.com,🏠 国内网站"
- "DOMAIN-SUFFIX,126.net,🏠 国内网站"
- "DOMAIN-SUFFIX,jianguoyun.com,🏠 国内网站"
- "DOMAIN-SUFFIX,baomitu.com,🏠 国内网站"
- "DOMAIN-SUFFIX,bootcss.com,🏠 国内网站"
- "DOMAIN-SUFFIX,staticfile.org,🏠 国内网站"
- "DOMAIN-SUFFIX,upaiyun.com,🏠 国内网站"
- "DOMAIN-SUFFIX,zhimg.com,🏠 国内网站"
- "RULE-SET,cn,🏠 国内网站"
- "RULE-SET,cn-ip,🏠 国内网站,no-resolve"
- "DOMAIN-SUFFIX,alimama.com,🏠 国内网站"
- "DOMAIN-SUFFIX,zxtdjy.com,🏠 国内网站"
- "DOMAIN-SUFFIX,zhihu.co,🏠 国内网站"
- "RULE-SET,acc-chinamax,🏠 国内网站"
- "DOMAIN-SUFFIX,bbys.app,DIRECT"
- "RULE-SET,acc-aqara-cn,🏠 国内网站"
- "RULE-SET,acc-geo-d-asia-china,🏠 国内网站"
- "RULE-SET,acc-geo-ip-asia-china,🏠 国内网站,no-resolve"
- "GEOIP,cloudflare,🌐 国外网站,no-resolve"
- "GEOIP,telegram,💬 即时通讯,no-resolve"
- "GEOIP,netflix,🎥 Netflix,no-resolve"
- "GEOIP,facebook,📱 社交媒体,no-resolve"
- "GEOIP,twitter,📱 社交媒体,no-resolve"
- "GEOIP,google,🔍 Google 服务,no-resolve"
- "GEOIP,CN,🏠 国内网站,no-resolve"
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

VERSION = "v5.4.39-oc-normal.1"

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
