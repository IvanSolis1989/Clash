#!/bin/sh
# ═══════════════════════════════════════════════════════════════════════════
# Smart-Config-Kit for Passwall2 — UCI batch helper
# Version: v5.2.5-pw2.1
#
# 用途：一次性在 Passwall2 中创建 28 条 shunt rule（含域名列表 + IP 列表），
#       每条目标节点留空（NEED_CONFIG），用户之后到 LuCI 里手工选节点。
#
# 用法：
#   1. scp apply-shunt-rules.sh root@192.168.1.1:/tmp/
#   2. ssh root@192.168.1.1
#   3. sh /tmp/apply-shunt-rules.sh
#   4. LuCI → Passwall2 → 分流控制 → 逐条给每个 shunt rule 指定目标节点
#
# ⚠️  警告：
#   • 本脚本只在 Passwall2 主流分支（iceeeder/xiaorouter/immortalwrt）测过
#   • 运行前建议备份: cp /etc/config/passwall2 /etc/config/passwall2.bak
#   • 运行会 append 28 条新规则，不会删除既有的（重复运行会产生副本）
# ═══════════════════════════════════════════════════════════════════════════

set -e

CONFIG_NAME="passwall2"

if ! command -v uci >/dev/null 2>&1; then
  echo "ERROR: uci 命令不存在，本脚本只能在 OpenWrt 路由器上运行" >&2
  exit 1
fi

if [ ! -f "/etc/config/${CONFIG_NAME}" ]; then
  echo "ERROR: /etc/config/${CONFIG_NAME} 不存在，请先安装 Passwall2" >&2
  exit 1
fi

echo "建议先备份: cp /etc/config/${CONFIG_NAME} /etc/config/${CONFIG_NAME}.$(date +%s).bak"
echo "按 Ctrl+C 取消，回车继续..."
read _

echo "开始创建 28 条 shunt rule..."

# [01] 🤖 AI 服务
SEC="$(uci add ${CONFIG_NAME} shunt_rules)"
uci set ${CONFIG_NAME}.${SEC}.remarks='🤖 AI 服务'
uci add_list ${CONFIG_NAME}.${SEC}.domain_list='geosite:openai'
uci add_list ${CONFIG_NAME}.${SEC}.domain_list='geosite:anthropic'
uci add_list ${CONFIG_NAME}.${SEC}.domain_list='geosite:gemini'
uci add_list ${CONFIG_NAME}.${SEC}.domain_list='geosite:copilot'
uci add_list ${CONFIG_NAME}.${SEC}.domain_list='geosite:bard'
uci add_list ${CONFIG_NAME}.${SEC}.domain_list='geosite:perplexity'
uci add_list ${CONFIG_NAME}.${SEC}.domain_list='geosite:huggingface'
uci add_list ${CONFIG_NAME}.${SEC}.domain_list='domain-suffix:cursor.com'
uci add_list ${CONFIG_NAME}.${SEC}.domain_list='domain-suffix:v0.dev'
uci add_list ${CONFIG_NAME}.${SEC}.domain_list='domain-suffix:character.ai'
uci add_list ${CONFIG_NAME}.${SEC}.domain_list='domain-suffix:mistral.ai'
uci add_list ${CONFIG_NAME}.${SEC}.domain_list='domain-suffix:cohere.ai'
uci add_list ${CONFIG_NAME}.${SEC}.domain_list='domain-suffix:cohere.com'
uci add_list ${CONFIG_NAME}.${SEC}.domain_list='domain-suffix:replicate.com'
uci add_list ${CONFIG_NAME}.${SEC}.domain_list='domain-suffix:together.ai'
uci add_list ${CONFIG_NAME}.${SEC}.domain_list='domain-suffix:runpod.io'
uci add_list ${CONFIG_NAME}.${SEC}.domain_list='domain-suffix:openrouter.ai'
uci add_list ${CONFIG_NAME}.${SEC}.domain_list='domain-suffix:suno.ai'
uci add_list ${CONFIG_NAME}.${SEC}.domain_list='domain-suffix:suno.com'
uci add_list ${CONFIG_NAME}.${SEC}.domain_list='domain-suffix:midjourney.com'
uci add_list ${CONFIG_NAME}.${SEC}.domain_list='domain-suffix:pi.ai'
uci add_list ${CONFIG_NAME}.${SEC}.domain_list='domain-suffix:inflection.ai'
uci set ${CONFIG_NAME}.${SEC}.network='tcp,udp'
# uci set ${CONFIG_NAME}.${SEC}.node='NEED_CONFIG_IN_LUCI'

# [02] 💰 加密货币
SEC="$(uci add ${CONFIG_NAME} shunt_rules)"
uci set ${CONFIG_NAME}.${SEC}.remarks='💰 加密货币'
uci add_list ${CONFIG_NAME}.${SEC}.domain_list='geosite:cryptocurrency'
uci add_list ${CONFIG_NAME}.${SEC}.domain_list='geosite:binance'
uci add_list ${CONFIG_NAME}.${SEC}.domain_list='domain-suffix:tradingview.com'
uci add_list ${CONFIG_NAME}.${SEC}.domain_list='domain-suffix:coinglass.com'
uci add_list ${CONFIG_NAME}.${SEC}.domain_list='domain-suffix:coinmarketcap.com'
uci add_list ${CONFIG_NAME}.${SEC}.domain_list='domain-suffix:coingecko.com'
uci set ${CONFIG_NAME}.${SEC}.network='tcp,udp'
# uci set ${CONFIG_NAME}.${SEC}.node='NEED_CONFIG_IN_LUCI'

# [03] 🏦 金融支付
SEC="$(uci add ${CONFIG_NAME} shunt_rules)"
uci set ${CONFIG_NAME}.${SEC}.remarks='🏦 金融支付'
uci add_list ${CONFIG_NAME}.${SEC}.domain_list='geosite:paypal'
uci add_list ${CONFIG_NAME}.${SEC}.domain_list='geosite:stripe'
uci add_list ${CONFIG_NAME}.${SEC}.domain_list='domain-suffix:wise.com'
uci add_list ${CONFIG_NAME}.${SEC}.domain_list='domain-suffix:revolut.com'
uci add_list ${CONFIG_NAME}.${SEC}.domain_list='domain-suffix:visa.com'
uci add_list ${CONFIG_NAME}.${SEC}.domain_list='domain-suffix:mastercard.com'
uci add_list ${CONFIG_NAME}.${SEC}.domain_list='domain-suffix:amex.com'
uci set ${CONFIG_NAME}.${SEC}.network='tcp,udp'
# uci set ${CONFIG_NAME}.${SEC}.node='NEED_CONFIG_IN_LUCI'

# [04] 📧 邮件服务
SEC="$(uci add ${CONFIG_NAME} shunt_rules)"
uci set ${CONFIG_NAME}.${SEC}.remarks='📧 邮件服务'
uci add_list ${CONFIG_NAME}.${SEC}.domain_list='geosite:gmail'
uci add_list ${CONFIG_NAME}.${SEC}.domain_list='geosite:outlook'
uci add_list ${CONFIG_NAME}.${SEC}.domain_list='geosite:protonmail'
uci add_list ${CONFIG_NAME}.${SEC}.domain_list='domain-suffix:fastmail.com'
uci add_list ${CONFIG_NAME}.${SEC}.domain_list='domain-suffix:tuta.com'
uci add_list ${CONFIG_NAME}.${SEC}.domain_list='domain-suffix:mail.ru'
uci set ${CONFIG_NAME}.${SEC}.network='tcp,udp'
# uci set ${CONFIG_NAME}.${SEC}.node='NEED_CONFIG_IN_LUCI'

# [05] 💬 即时通讯
SEC="$(uci add ${CONFIG_NAME} shunt_rules)"
uci set ${CONFIG_NAME}.${SEC}.remarks='💬 即时通讯'
uci add_list ${CONFIG_NAME}.${SEC}.domain_list='geosite:telegram'
uci add_list ${CONFIG_NAME}.${SEC}.domain_list='geosite:discord'
uci add_list ${CONFIG_NAME}.${SEC}.domain_list='geosite:whatsapp'
uci add_list ${CONFIG_NAME}.${SEC}.domain_list='geosite:line'
uci add_list ${CONFIG_NAME}.${SEC}.domain_list='geosite:signal'
uci add_list ${CONFIG_NAME}.${SEC}.domain_list='geosite:kakaotalk'
uci add_list ${CONFIG_NAME}.${SEC}.ip_list='geoip:telegram'
uci set ${CONFIG_NAME}.${SEC}.network='tcp,udp'
# uci set ${CONFIG_NAME}.${SEC}.node='NEED_CONFIG_IN_LUCI'

# [06] 📱 社交媒体
SEC="$(uci add ${CONFIG_NAME} shunt_rules)"
uci set ${CONFIG_NAME}.${SEC}.remarks='📱 社交媒体'
uci add_list ${CONFIG_NAME}.${SEC}.domain_list='geosite:twitter'
uci add_list ${CONFIG_NAME}.${SEC}.domain_list='geosite:facebook'
uci add_list ${CONFIG_NAME}.${SEC}.domain_list='geosite:instagram'
uci add_list ${CONFIG_NAME}.${SEC}.domain_list='geosite:tiktok'
uci add_list ${CONFIG_NAME}.${SEC}.domain_list='geosite:reddit'
uci add_list ${CONFIG_NAME}.${SEC}.domain_list='geosite:pinterest'
uci add_list ${CONFIG_NAME}.${SEC}.domain_list='geosite:linkedin'
uci add_list ${CONFIG_NAME}.${SEC}.domain_list='geosite:snap'
uci add_list ${CONFIG_NAME}.${SEC}.ip_list='geoip:twitter'
uci add_list ${CONFIG_NAME}.${SEC}.ip_list='geoip:facebook'
uci set ${CONFIG_NAME}.${SEC}.network='tcp,udp'
# uci set ${CONFIG_NAME}.${SEC}.node='NEED_CONFIG_IN_LUCI'

# [07] 🧑‍💼 会议协作
SEC="$(uci add ${CONFIG_NAME} shunt_rules)"
uci set ${CONFIG_NAME}.${SEC}.remarks='🧑‍💼 会议协作'
uci add_list ${CONFIG_NAME}.${SEC}.domain_list='geosite:zoom'
uci add_list ${CONFIG_NAME}.${SEC}.domain_list='geosite:teams'
uci add_list ${CONFIG_NAME}.${SEC}.domain_list='geosite:slack'
uci add_list ${CONFIG_NAME}.${SEC}.domain_list='geosite:notion'
uci add_list ${CONFIG_NAME}.${SEC}.domain_list='geosite:atlassian'
uci add_list ${CONFIG_NAME}.${SEC}.domain_list='domain-suffix:meet.google.com'
uci set ${CONFIG_NAME}.${SEC}.network='tcp,udp'
# uci set ${CONFIG_NAME}.${SEC}.node='NEED_CONFIG_IN_LUCI'

# [08] 📺 国内流媒体
SEC="$(uci add ${CONFIG_NAME} shunt_rules)"
uci set ${CONFIG_NAME}.${SEC}.remarks='📺 国内流媒体'
uci add_list ${CONFIG_NAME}.${SEC}.domain_list='geosite:bilibili'
uci add_list ${CONFIG_NAME}.${SEC}.domain_list='geosite:iqiyi'
uci add_list ${CONFIG_NAME}.${SEC}.domain_list='geosite:youku'
uci add_list ${CONFIG_NAME}.${SEC}.domain_list='geosite:tencentvideo'
uci add_list ${CONFIG_NAME}.${SEC}.domain_list='geosite:mgtv'
uci add_list ${CONFIG_NAME}.${SEC}.domain_list='geosite:douyin'
uci add_list ${CONFIG_NAME}.${SEC}.domain_list='geosite:netease-music'
uci add_list ${CONFIG_NAME}.${SEC}.domain_list='geosite:qqmusic'
uci set ${CONFIG_NAME}.${SEC}.network='tcp,udp'
# uci set ${CONFIG_NAME}.${SEC}.node='NEED_CONFIG_IN_LUCI'

# [09] 📺 东南亚流媒体
SEC="$(uci add ${CONFIG_NAME} shunt_rules)"
uci set ${CONFIG_NAME}.${SEC}.remarks='📺 东南亚流媒体'
uci add_list ${CONFIG_NAME}.${SEC}.domain_list='geosite:viu'
uci add_list ${CONFIG_NAME}.${SEC}.domain_list='domain-suffix:iq.com'
uci add_list ${CONFIG_NAME}.${SEC}.domain_list='domain-suffix:wetv.vip'
uci add_list ${CONFIG_NAME}.${SEC}.domain_list='domain-suffix:vidio.com'
uci add_list ${CONFIG_NAME}.${SEC}.domain_list='domain-suffix:iqiyiintl.com'
uci set ${CONFIG_NAME}.${SEC}.network='tcp,udp'
# uci set ${CONFIG_NAME}.${SEC}.node='NEED_CONFIG_IN_LUCI'

# [10] 🇺🇸 美国流媒体
SEC="$(uci add ${CONFIG_NAME} shunt_rules)"
uci set ${CONFIG_NAME}.${SEC}.remarks='🇺🇸 美国流媒体'
uci add_list ${CONFIG_NAME}.${SEC}.domain_list='geosite:youtube'
uci add_list ${CONFIG_NAME}.${SEC}.domain_list='geosite:netflix'
uci add_list ${CONFIG_NAME}.${SEC}.domain_list='geosite:disney'
uci add_list ${CONFIG_NAME}.${SEC}.domain_list='geosite:hbo'
uci add_list ${CONFIG_NAME}.${SEC}.domain_list='geosite:hulu'
uci add_list ${CONFIG_NAME}.${SEC}.domain_list='geosite:spotify'
uci add_list ${CONFIG_NAME}.${SEC}.domain_list='geosite:primevideo'
uci add_list ${CONFIG_NAME}.${SEC}.domain_list='domain-suffix:paramountplus.com'
uci add_list ${CONFIG_NAME}.${SEC}.domain_list='domain-suffix:peacocktv.com'
uci add_list ${CONFIG_NAME}.${SEC}.domain_list='domain-suffix:twitch.tv'
uci add_list ${CONFIG_NAME}.${SEC}.ip_list='geoip:netflix'
uci set ${CONFIG_NAME}.${SEC}.network='tcp,udp'
# uci set ${CONFIG_NAME}.${SEC}.node='NEED_CONFIG_IN_LUCI'

# [11] 🇭🇰 香港流媒体
SEC="$(uci add ${CONFIG_NAME} shunt_rules)"
uci set ${CONFIG_NAME}.${SEC}.remarks='🇭🇰 香港流媒体'
uci add_list ${CONFIG_NAME}.${SEC}.domain_list='geosite:mytvsuper'
uci add_list ${CONFIG_NAME}.${SEC}.domain_list='domain-suffix:mytvsuper.com'
uci add_list ${CONFIG_NAME}.${SEC}.domain_list='domain-suffix:now.com'
uci add_list ${CONFIG_NAME}.${SEC}.domain_list='domain-suffix:viu.tv'
uci add_list ${CONFIG_NAME}.${SEC}.domain_list='domain-suffix:encoretvb.com'
uci add_list ${CONFIG_NAME}.${SEC}.domain_list='domain-suffix:rthk.hk'
uci set ${CONFIG_NAME}.${SEC}.network='tcp,udp'
# uci set ${CONFIG_NAME}.${SEC}.node='NEED_CONFIG_IN_LUCI'

# [12] 🇹🇼 台湾流媒体
SEC="$(uci add ${CONFIG_NAME} shunt_rules)"
uci set ${CONFIG_NAME}.${SEC}.remarks='🇹🇼 台湾流媒体'
uci add_list ${CONFIG_NAME}.${SEC}.domain_list='geosite:bahamut'
uci add_list ${CONFIG_NAME}.${SEC}.domain_list='domain-suffix:bahamut.com.tw'
uci add_list ${CONFIG_NAME}.${SEC}.domain_list='domain-suffix:hinet.net'
uci add_list ${CONFIG_NAME}.${SEC}.domain_list='domain-suffix:kktv.me'
uci add_list ${CONFIG_NAME}.${SEC}.domain_list='domain-suffix:litv.tv'
uci add_list ${CONFIG_NAME}.${SEC}.domain_list='domain-suffix:hamivideo.hinet.net'
uci add_list ${CONFIG_NAME}.${SEC}.domain_list='domain-suffix:friday.tw'
uci set ${CONFIG_NAME}.${SEC}.network='tcp,udp'
# uci set ${CONFIG_NAME}.${SEC}.node='NEED_CONFIG_IN_LUCI'

# [13] 🇯🇵 日韩流媒体
SEC="$(uci add ${CONFIG_NAME} shunt_rules)"
uci set ${CONFIG_NAME}.${SEC}.remarks='🇯🇵 日韩流媒体'
uci add_list ${CONFIG_NAME}.${SEC}.domain_list='geosite:abema'
uci add_list ${CONFIG_NAME}.${SEC}.domain_list='geosite:niconico'
uci add_list ${CONFIG_NAME}.${SEC}.domain_list='domain-suffix:dazn.com'
uci add_list ${CONFIG_NAME}.${SEC}.domain_list='domain-suffix:dmm.com'
uci add_list ${CONFIG_NAME}.${SEC}.domain_list='domain-suffix:tv-tokyo.co.jp'
uci add_list ${CONFIG_NAME}.${SEC}.domain_list='domain-suffix:tver.jp'
uci add_list ${CONFIG_NAME}.${SEC}.domain_list='domain-suffix:rakuten.tv'
uci set ${CONFIG_NAME}.${SEC}.network='tcp,udp'
# uci set ${CONFIG_NAME}.${SEC}.node='NEED_CONFIG_IN_LUCI'

# [14] 🇪🇺 欧洲流媒体
SEC="$(uci add ${CONFIG_NAME} shunt_rules)"
uci set ${CONFIG_NAME}.${SEC}.remarks='🇪🇺 欧洲流媒体'
uci add_list ${CONFIG_NAME}.${SEC}.domain_list='geosite:bbc'
uci add_list ${CONFIG_NAME}.${SEC}.domain_list='domain-suffix:itv.com'
uci add_list ${CONFIG_NAME}.${SEC}.domain_list='domain-suffix:channel4.com'
uci add_list ${CONFIG_NAME}.${SEC}.domain_list='domain-suffix:my5.tv'
uci add_list ${CONFIG_NAME}.${SEC}.domain_list='domain-suffix:sky.com'
uci add_list ${CONFIG_NAME}.${SEC}.domain_list='domain-suffix:skygo.com'
uci add_list ${CONFIG_NAME}.${SEC}.domain_list='domain-suffix:britbox.co.uk'
uci set ${CONFIG_NAME}.${SEC}.network='tcp,udp'
# uci set ${CONFIG_NAME}.${SEC}.node='NEED_CONFIG_IN_LUCI'

# [15] 🕹️ 国内游戏
SEC="$(uci add ${CONFIG_NAME} shunt_rules)"
uci set ${CONFIG_NAME}.${SEC}.remarks='🕹️ 国内游戏'
uci add_list ${CONFIG_NAME}.${SEC}.domain_list='geosite:steamcn'
uci add_list ${CONFIG_NAME}.${SEC}.domain_list='domain-suffix:wanmei.com'
uci add_list ${CONFIG_NAME}.${SEC}.domain_list='domain-suffix:majsoul.com'
uci add_list ${CONFIG_NAME}.${SEC}.domain_list='domain-suffix:battlenet.com.cn'
uci set ${CONFIG_NAME}.${SEC}.network='tcp,udp'
# uci set ${CONFIG_NAME}.${SEC}.node='NEED_CONFIG_IN_LUCI'

# [16] 🎮 国外游戏
SEC="$(uci add ${CONFIG_NAME} shunt_rules)"
uci set ${CONFIG_NAME}.${SEC}.remarks='🎮 国外游戏'
uci add_list ${CONFIG_NAME}.${SEC}.domain_list='geosite:steam'
uci add_list ${CONFIG_NAME}.${SEC}.domain_list='geosite:epicgames'
uci add_list ${CONFIG_NAME}.${SEC}.domain_list='geosite:playstation'
uci add_list ${CONFIG_NAME}.${SEC}.domain_list='geosite:xbox'
uci add_list ${CONFIG_NAME}.${SEC}.domain_list='geosite:nintendo'
uci add_list ${CONFIG_NAME}.${SEC}.domain_list='domain-suffix:riotgames.com'
uci add_list ${CONFIG_NAME}.${SEC}.domain_list='domain-suffix:ea.com'
uci add_list ${CONFIG_NAME}.${SEC}.domain_list='domain-suffix:blizzard.com'
uci add_list ${CONFIG_NAME}.${SEC}.domain_list='domain-suffix:hoyoverse.com'
uci add_list ${CONFIG_NAME}.${SEC}.domain_list='domain-suffix:mihoyo.com'
uci set ${CONFIG_NAME}.${SEC}.network='tcp,udp'
# uci set ${CONFIG_NAME}.${SEC}.node='NEED_CONFIG_IN_LUCI'

# [17] 🔍 搜索引擎
SEC="$(uci add ${CONFIG_NAME} shunt_rules)"
uci set ${CONFIG_NAME}.${SEC}.remarks='🔍 搜索引擎'
uci add_list ${CONFIG_NAME}.${SEC}.domain_list='geosite:google'
uci add_list ${CONFIG_NAME}.${SEC}.domain_list='geosite:bing'
uci add_list ${CONFIG_NAME}.${SEC}.domain_list='geosite:duckduckgo'
uci add_list ${CONFIG_NAME}.${SEC}.domain_list='geosite:yandex'
uci add_list ${CONFIG_NAME}.${SEC}.domain_list='domain-suffix:scholar.google.com'
uci add_list ${CONFIG_NAME}.${SEC}.ip_list='geoip:google'
uci set ${CONFIG_NAME}.${SEC}.network='tcp,udp'
# uci set ${CONFIG_NAME}.${SEC}.node='NEED_CONFIG_IN_LUCI'

# [18] 📟 开发者服务
SEC="$(uci add ${CONFIG_NAME} shunt_rules)"
uci set ${CONFIG_NAME}.${SEC}.remarks='📟 开发者服务'
uci add_list ${CONFIG_NAME}.${SEC}.domain_list='geosite:github'
uci add_list ${CONFIG_NAME}.${SEC}.domain_list='geosite:gitlab'
uci add_list ${CONFIG_NAME}.${SEC}.domain_list='geosite:docker'
uci add_list ${CONFIG_NAME}.${SEC}.domain_list='geosite:npmjs'
uci add_list ${CONFIG_NAME}.${SEC}.domain_list='geosite:pypi'
uci add_list ${CONFIG_NAME}.${SEC}.domain_list='geosite:python'
uci add_list ${CONFIG_NAME}.${SEC}.domain_list='domain-suffix:jetbrains.com'
uci add_list ${CONFIG_NAME}.${SEC}.domain_list='domain-suffix:stackoverflow.com'
uci add_list ${CONFIG_NAME}.${SEC}.domain_list='domain-suffix:stackexchange.com'
uci set ${CONFIG_NAME}.${SEC}.network='tcp,udp'
# uci set ${CONFIG_NAME}.${SEC}.node='NEED_CONFIG_IN_LUCI'

# [19] Ⓜ️ 微软服务
SEC="$(uci add ${CONFIG_NAME} shunt_rules)"
uci set ${CONFIG_NAME}.${SEC}.remarks='Ⓜ️ 微软服务'
uci add_list ${CONFIG_NAME}.${SEC}.domain_list='geosite:microsoft'
uci add_list ${CONFIG_NAME}.${SEC}.domain_list='geosite:onedrive'
uci add_list ${CONFIG_NAME}.${SEC}.domain_list='domain-suffix:office.com'
uci add_list ${CONFIG_NAME}.${SEC}.domain_list='domain-suffix:live.com'
uci add_list ${CONFIG_NAME}.${SEC}.domain_list='domain-suffix:microsoftedge.com'
uci set ${CONFIG_NAME}.${SEC}.network='tcp,udp'
# uci set ${CONFIG_NAME}.${SEC}.node='NEED_CONFIG_IN_LUCI'

# [20] 🍎 苹果服务
SEC="$(uci add ${CONFIG_NAME} shunt_rules)"
uci set ${CONFIG_NAME}.${SEC}.remarks='🍎 苹果服务'
uci add_list ${CONFIG_NAME}.${SEC}.domain_list='geosite:apple'
uci add_list ${CONFIG_NAME}.${SEC}.domain_list='geosite:icloud'
uci add_list ${CONFIG_NAME}.${SEC}.domain_list='domain-suffix:appstore.com'
uci add_list ${CONFIG_NAME}.${SEC}.domain_list='domain-suffix:mzstatic.com'
uci add_list ${CONFIG_NAME}.${SEC}.domain_list='domain-suffix:itunes.com'
uci add_list ${CONFIG_NAME}.${SEC}.domain_list='domain-suffix:applemusic.com'
uci add_list ${CONFIG_NAME}.${SEC}.domain_list='domain-suffix:apple-dns.net'
uci set ${CONFIG_NAME}.${SEC}.network='tcp,udp'
# uci set ${CONFIG_NAME}.${SEC}.node='NEED_CONFIG_IN_LUCI'

# [21] 📥 下载更新
SEC="$(uci add ${CONFIG_NAME} shunt_rules)"
uci set ${CONFIG_NAME}.${SEC}.remarks='📥 下载更新'
uci add_list ${CONFIG_NAME}.${SEC}.domain_list='domain-suffix:dl.google.com'
uci add_list ${CONFIG_NAME}.${SEC}.domain_list='domain-suffix:play.googleapis.com'
uci add_list ${CONFIG_NAME}.${SEC}.domain_list='domain-suffix:msftconnecttest.com'
uci add_list ${CONFIG_NAME}.${SEC}.domain_list='domain-suffix:windowsupdate.com'
uci add_list ${CONFIG_NAME}.${SEC}.domain_list='domain-suffix:cdn-apple.com'
uci add_list ${CONFIG_NAME}.${SEC}.domain_list='domain-suffix:ubuntu.com'
uci add_list ${CONFIG_NAME}.${SEC}.domain_list='domain-suffix:mozilla.org'
uci add_list ${CONFIG_NAME}.${SEC}.domain_list='domain-suffix:apkpure.com'
uci set ${CONFIG_NAME}.${SEC}.network='tcp,udp'
# uci set ${CONFIG_NAME}.${SEC}.node='NEED_CONFIG_IN_LUCI'

# [22] ☁️ 云与CDN
SEC="$(uci add ${CONFIG_NAME} shunt_rules)"
uci set ${CONFIG_NAME}.${SEC}.remarks='☁️ 云与CDN'
uci add_list ${CONFIG_NAME}.${SEC}.domain_list='geosite:cloudflare'
uci add_list ${CONFIG_NAME}.${SEC}.domain_list='geosite:fastly'
uci add_list ${CONFIG_NAME}.${SEC}.domain_list='geosite:akamai'
uci add_list ${CONFIG_NAME}.${SEC}.domain_list='domain-suffix:jsdelivr.net'
uci add_list ${CONFIG_NAME}.${SEC}.domain_list='domain-suffix:cloudfront.net'
uci add_list ${CONFIG_NAME}.${SEC}.ip_list='geoip:cloudflare'
uci add_list ${CONFIG_NAME}.${SEC}.ip_list='geoip:fastly'
uci set ${CONFIG_NAME}.${SEC}.network='tcp,udp'
# uci set ${CONFIG_NAME}.${SEC}.node='NEED_CONFIG_IN_LUCI'

# [23] 🛰️ BT/PT Tracker
SEC="$(uci add ${CONFIG_NAME} shunt_rules)"
uci set ${CONFIG_NAME}.${SEC}.remarks='🛰️ BT/PT Tracker'
uci add_list ${CONFIG_NAME}.${SEC}.domain_list='geosite:private-tracker'
uci add_list ${CONFIG_NAME}.${SEC}.domain_list='domain-suffix:opentrackr.org'
uci add_list ${CONFIG_NAME}.${SEC}.domain_list='domain-suffix:openbittorrent.com'
uci add_list ${CONFIG_NAME}.${SEC}.domain_list='domain-suffix:nyaa.si'
uci set ${CONFIG_NAME}.${SEC}.network='tcp,udp'
# uci set ${CONFIG_NAME}.${SEC}.node='NEED_CONFIG_IN_LUCI'

# [24] 🏠 国内网站
SEC="$(uci add ${CONFIG_NAME} shunt_rules)"
uci set ${CONFIG_NAME}.${SEC}.remarks='🏠 国内网站'
uci add_list ${CONFIG_NAME}.${SEC}.domain_list='geosite:cn'
uci add_list ${CONFIG_NAME}.${SEC}.ip_list='geoip:cn'
uci add_list ${CONFIG_NAME}.${SEC}.ip_list='geoip:private'
uci set ${CONFIG_NAME}.${SEC}.network='tcp,udp'
# uci set ${CONFIG_NAME}.${SEC}.node='NEED_CONFIG_IN_LUCI'

# [25] 🚫 受限网站
SEC="$(uci add ${CONFIG_NAME} shunt_rules)"
uci set ${CONFIG_NAME}.${SEC}.remarks='🚫 受限网站'
uci add_list ${CONFIG_NAME}.${SEC}.domain_list='geosite:gfw'
uci add_list ${CONFIG_NAME}.${SEC}.domain_list='geosite:greatfire'
uci set ${CONFIG_NAME}.${SEC}.network='tcp,udp'
# uci set ${CONFIG_NAME}.${SEC}.node='NEED_CONFIG_IN_LUCI'

# [26] 🌐 国外网站
SEC="$(uci add ${CONFIG_NAME} shunt_rules)"
uci set ${CONFIG_NAME}.${SEC}.remarks='🌐 国外网站'
uci add_list ${CONFIG_NAME}.${SEC}.domain_list='geosite:geolocation-!cn'
uci add_list ${CONFIG_NAME}.${SEC}.domain_list='domain-suffix:cnn.com'
uci add_list ${CONFIG_NAME}.${SEC}.domain_list='domain-suffix:nytimes.com'
uci add_list ${CONFIG_NAME}.${SEC}.domain_list='domain-suffix:bloomberg.com'
uci add_list ${CONFIG_NAME}.${SEC}.domain_list='domain-suffix:wikipedia.org'
uci set ${CONFIG_NAME}.${SEC}.network='tcp,udp'
# uci set ${CONFIG_NAME}.${SEC}.node='NEED_CONFIG_IN_LUCI'

# [27] 🐟 漏网之鱼 FINAL
SEC="$(uci add ${CONFIG_NAME} shunt_rules)"
uci set ${CONFIG_NAME}.${SEC}.remarks='🐟 漏网之鱼 FINAL'
uci set ${CONFIG_NAME}.${SEC}.network='tcp,udp'
# uci set ${CONFIG_NAME}.${SEC}.node='NEED_CONFIG_IN_LUCI'

# [28] 🛑 广告拦截
SEC="$(uci add ${CONFIG_NAME} shunt_rules)"
uci set ${CONFIG_NAME}.${SEC}.remarks='🛑 广告拦截'
uci add_list ${CONFIG_NAME}.${SEC}.domain_list='geosite:category-ads-all'
uci set ${CONFIG_NAME}.${SEC}.network='tcp,udp'
# uci set ${CONFIG_NAME}.${SEC}.node='NEED_CONFIG_IN_LUCI'

uci commit ${CONFIG_NAME}

echo "✓ 28 条 shunt rule 创建完成。"
echo "下一步："
echo "  1. LuCI → Passwall2 → 分流控制 → 逐条为每个 rule 指定目标节点"
echo "  2. 确认规则顺序：#24-#28（国内/受限/国外/FINAL/广告）保持在末尾"
echo "  3. 重启 Passwall2: /etc/init.d/passwall2 restart"
