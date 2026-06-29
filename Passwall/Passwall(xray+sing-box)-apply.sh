#!/bin/sh
# ═══════════════════════════════════════════════════════════════════════════
# Smart-Config-Kit for Passwall — UCI batch helper
# Version: v5.4.36-pw.1 | Build 2026-06-29 | Baseline: Clash Party v5.4.36
#
# 用途：一次性在 Passwall（全功能版）中创建 33 条 shunt rule（含域名列表 + IP 列表），
#       每条目标节点留空（NEED_CONFIG），用户之后到 LuCI 里手工选节点。
#
# 变更历史：见 Passwall/CHANGELOG.md
#
# 备注：Passwall 和 Passwall2 是 Openwrt-Passwall 组织（原 xiaorouji 个人仓库迁入）
#       并行维护的两款插件，UCI key 不同（passwall vs passwall2）。
#       本脚本操作 Passwall 全功能版；若你用 Passwall2，
#       把 CONFIG_NAME 从 "passwall" 改为 "passwall2" 即可——规则语法完全相同。
#
#       Passwall 全功能版相比 Passwall2 的额外能力：
#       • 四列表（直连/屏蔽/GFW/代理）— 可替代或补充 shunt rule
#       • TCP/UDP 节点分选（tcp_node / udp_node）
#       • ACL 规则（按客户端 IP/MAC 指定策略）
#       • trojan-plus 节点类型
#
# 用法（路径里的 ( ) 是 shell 语法 token，必须加引号）：
#   1. scp 'Passwall(xray+sing-box)-apply.sh' root@192.168.1.1:/tmp/
#   2. ssh root@192.168.1.1
#   3. sh '/tmp/Passwall(xray+sing-box)-apply.sh'
#   4. 配置节点：
#      a) LuCI → Passwall → 节点列表 → 创建 TCP 节点 + TCP 负载均衡组（按区域）
#      b) LuCI → Passwall → 分流控制 → 逐条给每个 shunt rule 指定目标 TCP 节点
#   5. 回到基本设置，确认 tcp_node 和 udp_node 设置
#
# ⚠️  警告：
#   • 本脚本在 ImmortalWrt / OpenWrt 官方源的 Passwall 上测过
#   • 运行前建议备份: cp /etc/config/passwall /etc/config/passwall.bak
#   • 默认 --replace：先删除同名 Smart-Config-Kit 旧规则，再创建 33 条新规则
#   • 可选 --append：保留既有规则并追加（可能产生副本）
# ═══════════════════════════════════════════════════════════════════════════

set -e

CONFIG_NAME="passwall"
MODE="${1:---replace}"

case "${MODE}" in
  --replace|'')
    MODE="--replace"
    ;;
  --append)
    ;;
  *)
    echo "Usage: $0 [--replace|--append]" >&2
    exit 2
    ;;
esac

is_scki_remark() {
  printf '%s\n' \
    '🛑 广告拦截' \
    '🤖 AI 服务' \
    '💰 加密货币' \
    '🏦 金融支付' \
    '💬 即时通讯' \
    '📱 社交媒体' \
    '🎵 TikTok' \
    '🧑‍💼 会议协作' \
    '📺 国内流媒体' \
    '🎥 Netflix' \
    '🎬 Disney+' \
    '📡 HBO/Max' \
    '📺 Hulu' \
    '🎬 Prime Video' \
    '📹 YouTube' \
    '🎵 音乐流媒体' \
    '🌐 其他国外流媒体' \
    '🇭🇰 香港流媒体' \
    '🇹🇼 台湾流媒体' \
    '🇯🇵 日韩流媒体' \
    '🇪🇺 欧洲流媒体' \
    '🕹️ 国内游戏' \
    '🎮 国外游戏' \
    'Ⓜ️ 微软服务' \
    '🍎 苹果服务' \
    '📥 下载更新' \
    '🛰️ BT/PT Tracker' \
    '🏠 国内网站' \
    '🚫 受限网站' \
    '🌐 国外网站' \
    '🔍 Google 服务' \
    '🔧 工具与服务' \
    '🐟 漏网之鱼' | grep -Fqx "$1"
}

cleanup_existing_scki_rules() {
  removed=0
  for section in $(uci show "${CONFIG_NAME}" | sed -n "s/^${CONFIG_NAME}\.\([^.=]*\)=shunt_rules$/\1/p"); do
    remarks="$(uci -q get "${CONFIG_NAME}.${section}.remarks" || true)"
    if is_scki_remark "${remarks}"; then
      uci delete "${CONFIG_NAME}.${section}"
      removed=$((removed + 1))
    fi
  done
  if [ "${removed}" -gt 0 ]; then
    echo "已删除旧 Smart-Config-Kit shunt rules: ${removed}"
  fi
}

if ! command -v uci >/dev/null 2>&1; then
  echo "ERROR: uci 命令不存在，本脚本只能在 OpenWrt 路由器上运行" >&2
  exit 1
fi

if [ ! -f "/etc/config/${CONFIG_NAME}" ]; then
  echo "ERROR: /etc/config/${CONFIG_NAME} 不存在，请先安装 Passwall" >&2
  exit 1
fi

echo "建议先备份: cp /etc/config/${CONFIG_NAME} /etc/config/${CONFIG_NAME}.$(date +%s).bak"
echo "运行模式: ${MODE}（--replace 会删除同名旧规则；--append 会追加）"
if [ -t 0 ]; then
  echo "按 Ctrl+C 取消，回车继续..."
  read _
fi

if [ "${MODE}" = "--replace" ]; then
  cleanup_existing_scki_rules
fi

echo "开始创建 33 条 shunt rule..."

# [01] 🛑 广告拦截
SEC="$(uci add "${CONFIG_NAME}" shunt_rules)"
uci set "${CONFIG_NAME}".${SEC}.remarks='🛑 广告拦截'
uci add_list "${CONFIG_NAME}".${SEC}.domain_list='geosite:category-ads-all'
uci set "${CONFIG_NAME}".${SEC}.network='tcp,udp'
# uci set "${CONFIG_NAME}".${SEC}.tcp_node='NEED_CONFIG_IN_LUCI'

# [02] 🤖 AI 服务
SEC="$(uci add "${CONFIG_NAME}" shunt_rules)"
uci set "${CONFIG_NAME}".${SEC}.remarks='🤖 AI 服务'
uci add_list "${CONFIG_NAME}".${SEC}.domain_list='geosite:openai'
uci add_list "${CONFIG_NAME}".${SEC}.domain_list='geosite:anthropic'
uci add_list "${CONFIG_NAME}".${SEC}.domain_list='geosite:gemini'
uci add_list "${CONFIG_NAME}".${SEC}.domain_list='geosite:copilot'
uci add_list "${CONFIG_NAME}".${SEC}.domain_list='geosite:bard'
uci add_list "${CONFIG_NAME}".${SEC}.domain_list='geosite:perplexity'
uci add_list "${CONFIG_NAME}".${SEC}.domain_list='geosite:huggingface'
uci add_list "${CONFIG_NAME}".${SEC}.domain_list='domain:cursor.com'
uci add_list "${CONFIG_NAME}".${SEC}.domain_list='domain:v0.dev'
uci add_list "${CONFIG_NAME}".${SEC}.domain_list='domain:character.ai'
uci add_list "${CONFIG_NAME}".${SEC}.domain_list='domain:mistral.ai'
uci add_list "${CONFIG_NAME}".${SEC}.domain_list='domain:cohere.ai'
uci add_list "${CONFIG_NAME}".${SEC}.domain_list='domain:cohere.com'
uci add_list "${CONFIG_NAME}".${SEC}.domain_list='domain:replicate.com'
uci add_list "${CONFIG_NAME}".${SEC}.domain_list='domain:together.ai'
uci add_list "${CONFIG_NAME}".${SEC}.domain_list='domain:runpod.io'
uci add_list "${CONFIG_NAME}".${SEC}.domain_list='domain:openrouter.ai'
uci add_list "${CONFIG_NAME}".${SEC}.domain_list='domain:suno.ai'
uci add_list "${CONFIG_NAME}".${SEC}.domain_list='domain:suno.com'
uci add_list "${CONFIG_NAME}".${SEC}.domain_list='domain:midjourney.com'
uci add_list "${CONFIG_NAME}".${SEC}.domain_list='domain:pi.ai'
uci add_list "${CONFIG_NAME}".${SEC}.domain_list='domain:inflection.ai'
uci add_list "${CONFIG_NAME}".${SEC}.domain_list='domain:ampcode.com'
uci add_list "${CONFIG_NAME}".${SEC}.domain_list='domain:ampworkers.com'
uci add_list "${CONFIG_NAME}".${SEC}.domain_list='domain:augmentcode.com'
uci add_list "${CONFIG_NAME}".${SEC}.domain_list='domain:aws.dev'
uci add_list "${CONFIG_NAME}".${SEC}.domain_list='domain:awsapps.com'
uci add_list "${CONFIG_NAME}".${SEC}.domain_list='domain:bolt.new'
uci add_list "${CONFIG_NAME}".${SEC}.domain_list='domain:codeium.com'
uci add_list "${CONFIG_NAME}".${SEC}.domain_list='domain:continue.dev'
uci add_list "${CONFIG_NAME}".${SEC}.domain_list='domain:devin.ai'
uci add_list "${CONFIG_NAME}".${SEC}.domain_list='domain:factory.ai'
uci add_list "${CONFIG_NAME}".${SEC}.domain_list='domain:kiro.dev'
uci add_list "${CONFIG_NAME}".${SEC}.domain_list='domain:lovable.dev'
uci add_list "${CONFIG_NAME}".${SEC}.domain_list='domain:lovable.app'
uci add_list "${CONFIG_NAME}".${SEC}.domain_list='domain:replit.com'
uci add_list "${CONFIG_NAME}".${SEC}.domain_list='domain:sourcegraph.com'
uci add_list "${CONFIG_NAME}".${SEC}.domain_list='domain:tabnine.com'
uci add_list "${CONFIG_NAME}".${SEC}.domain_list='domain:windsurf.com'
uci add_list "${CONFIG_NAME}".${SEC}.domain_list='domain:windsurf.ai'
uci add_list "${CONFIG_NAME}".${SEC}.domain_list='domain:zed.dev'
uci set "${CONFIG_NAME}".${SEC}.network='tcp,udp'
# uci set "${CONFIG_NAME}".${SEC}.tcp_node='NEED_CONFIG_IN_LUCI'

# [03] 💰 加密货币
SEC="$(uci add "${CONFIG_NAME}" shunt_rules)"
uci set "${CONFIG_NAME}".${SEC}.remarks='💰 加密货币'
uci add_list "${CONFIG_NAME}".${SEC}.domain_list='geosite:cryptocurrency'
uci add_list "${CONFIG_NAME}".${SEC}.domain_list='geosite:binance'
uci add_list "${CONFIG_NAME}".${SEC}.domain_list='domain:tradingview.com'
uci add_list "${CONFIG_NAME}".${SEC}.domain_list='domain:coinglass.com'
uci add_list "${CONFIG_NAME}".${SEC}.domain_list='domain:coinmarketcap.com'
uci add_list "${CONFIG_NAME}".${SEC}.domain_list='domain:coingecko.com'
uci set "${CONFIG_NAME}".${SEC}.network='tcp,udp'
# uci set "${CONFIG_NAME}".${SEC}.tcp_node='NEED_CONFIG_IN_LUCI'

# [04] 🏦 金融支付
SEC="$(uci add "${CONFIG_NAME}" shunt_rules)"
uci set "${CONFIG_NAME}".${SEC}.remarks='🏦 金融支付'
uci add_list "${CONFIG_NAME}".${SEC}.domain_list='geosite:paypal'
uci add_list "${CONFIG_NAME}".${SEC}.domain_list='geosite:stripe'
uci add_list "${CONFIG_NAME}".${SEC}.domain_list='domain:paddle.com'
uci add_list "${CONFIG_NAME}".${SEC}.domain_list='domain:wise.com'
uci add_list "${CONFIG_NAME}".${SEC}.domain_list='domain:revolut.com'
uci add_list "${CONFIG_NAME}".${SEC}.domain_list='domain:visa.com'
uci add_list "${CONFIG_NAME}".${SEC}.domain_list='domain:mastercard.com'
uci add_list "${CONFIG_NAME}".${SEC}.domain_list='domain:amex.com'
uci set "${CONFIG_NAME}".${SEC}.network='tcp,udp'
# uci set "${CONFIG_NAME}".${SEC}.tcp_node='NEED_CONFIG_IN_LUCI'

# [05] 💬 即时通讯
SEC="$(uci add "${CONFIG_NAME}" shunt_rules)"
uci set "${CONFIG_NAME}".${SEC}.remarks='💬 即时通讯'
uci add_list "${CONFIG_NAME}".${SEC}.domain_list='geosite:telegram'
uci add_list "${CONFIG_NAME}".${SEC}.domain_list='geosite:discord'
uci add_list "${CONFIG_NAME}".${SEC}.domain_list='geosite:whatsapp'
uci add_list "${CONFIG_NAME}".${SEC}.domain_list='geosite:line'
uci add_list "${CONFIG_NAME}".${SEC}.domain_list='geosite:signal'
uci add_list "${CONFIG_NAME}".${SEC}.domain_list='geosite:kakao'
uci add_list "${CONFIG_NAME}".${SEC}.domain_list='domain:kakao.com'
uci add_list "${CONFIG_NAME}".${SEC}.domain_list='domain:kakaocorp.com'
uci add_list "${CONFIG_NAME}".${SEC}.domain_list='domain:kakaotalk.com'
uci add_list "${CONFIG_NAME}".${SEC}.ip_list='geoip:telegram'
uci set "${CONFIG_NAME}".${SEC}.network='tcp,udp'
# uci set "${CONFIG_NAME}".${SEC}.tcp_node='NEED_CONFIG_IN_LUCI'

# [06] 📱 社交媒体
SEC="$(uci add "${CONFIG_NAME}" shunt_rules)"
uci set "${CONFIG_NAME}".${SEC}.remarks='📱 社交媒体'
uci add_list "${CONFIG_NAME}".${SEC}.domain_list='geosite:twitter'
uci add_list "${CONFIG_NAME}".${SEC}.domain_list='geosite:facebook'
uci add_list "${CONFIG_NAME}".${SEC}.domain_list='geosite:instagram'
uci add_list "${CONFIG_NAME}".${SEC}.domain_list='geosite:reddit'
uci add_list "${CONFIG_NAME}".${SEC}.domain_list='geosite:pinterest'
uci add_list "${CONFIG_NAME}".${SEC}.domain_list='geosite:linkedin'
uci add_list "${CONFIG_NAME}".${SEC}.domain_list='geosite:snap'
uci add_list "${CONFIG_NAME}".${SEC}.ip_list='geoip:twitter'
uci add_list "${CONFIG_NAME}".${SEC}.ip_list='geoip:facebook'
uci set "${CONFIG_NAME}".${SEC}.network='tcp,udp'
# uci set "${CONFIG_NAME}".${SEC}.tcp_node='NEED_CONFIG_IN_LUCI'

# [06b] 🎵 TikTok
SEC="$(uci add "${CONFIG_NAME}" shunt_rules)"
uci set "${CONFIG_NAME}".${SEC}.remarks='🎵 TikTok'
uci add_list "${CONFIG_NAME}".${SEC}.domain_list='geosite:tiktok'
uci set "${CONFIG_NAME}".${SEC}.network='tcp,udp'
# uci set "${CONFIG_NAME}".${SEC}.tcp_node='NEED_CONFIG_IN_LUCI'

# [07] 🧑‍💼 会议协作
SEC="$(uci add "${CONFIG_NAME}" shunt_rules)"
uci set "${CONFIG_NAME}".${SEC}.remarks='🧑‍💼 会议协作'
uci add_list "${CONFIG_NAME}".${SEC}.domain_list='geosite:zoom'
uci add_list "${CONFIG_NAME}".${SEC}.domain_list='geosite:teams'
uci add_list "${CONFIG_NAME}".${SEC}.domain_list='geosite:slack'
uci add_list "${CONFIG_NAME}".${SEC}.domain_list='geosite:notion'
uci add_list "${CONFIG_NAME}".${SEC}.domain_list='geosite:atlassian'
uci add_list "${CONFIG_NAME}".${SEC}.domain_list='domain:rustdesk.com'
uci add_list "${CONFIG_NAME}".${SEC}.domain_list='domain:meet.google.com'
uci set "${CONFIG_NAME}".${SEC}.network='tcp,udp'
# uci set "${CONFIG_NAME}".${SEC}.tcp_node='NEED_CONFIG_IN_LUCI'

# [08] 🎥 Netflix
SEC="$(uci add "${CONFIG_NAME}" shunt_rules)"
uci set "${CONFIG_NAME}".${SEC}.remarks='🎥 Netflix'
uci add_list "${CONFIG_NAME}".${SEC}.domain_list='geosite:netflix'
uci add_list "${CONFIG_NAME}".${SEC}.ip_list='geoip:netflix'
uci set "${CONFIG_NAME}".${SEC}.network='tcp,udp'
# uci set "${CONFIG_NAME}".${SEC}.tcp_node='NEED_CONFIG_IN_LUCI'

# [09] 🎬 Disney+
SEC="$(uci add "${CONFIG_NAME}" shunt_rules)"
uci set "${CONFIG_NAME}".${SEC}.remarks='🎬 Disney+'
uci add_list "${CONFIG_NAME}".${SEC}.domain_list='geosite:disney'
uci set "${CONFIG_NAME}".${SEC}.network='tcp,udp'
# uci set "${CONFIG_NAME}".${SEC}.tcp_node='NEED_CONFIG_IN_LUCI'

# [10] 📡 HBO/Max
SEC="$(uci add "${CONFIG_NAME}" shunt_rules)"
uci set "${CONFIG_NAME}".${SEC}.remarks='📡 HBO/Max'
uci add_list "${CONFIG_NAME}".${SEC}.domain_list='geosite:hbo'
uci set "${CONFIG_NAME}".${SEC}.network='tcp,udp'
# uci set "${CONFIG_NAME}".${SEC}.tcp_node='NEED_CONFIG_IN_LUCI'

# [11] 📺 Hulu
SEC="$(uci add "${CONFIG_NAME}" shunt_rules)"
uci set "${CONFIG_NAME}".${SEC}.remarks='📺 Hulu'
uci add_list "${CONFIG_NAME}".${SEC}.domain_list='geosite:hulu'
uci set "${CONFIG_NAME}".${SEC}.network='tcp,udp'
# uci set "${CONFIG_NAME}".${SEC}.tcp_node='NEED_CONFIG_IN_LUCI'

# [12] 🎬 Prime Video
SEC="$(uci add "${CONFIG_NAME}" shunt_rules)"
uci set "${CONFIG_NAME}".${SEC}.remarks='🎬 Prime Video'
uci add_list "${CONFIG_NAME}".${SEC}.domain_list='geosite:primevideo'
uci set "${CONFIG_NAME}".${SEC}.network='tcp,udp'
# uci set "${CONFIG_NAME}".${SEC}.tcp_node='NEED_CONFIG_IN_LUCI'

# [13] 📹 YouTube
SEC="$(uci add "${CONFIG_NAME}" shunt_rules)"
uci set "${CONFIG_NAME}".${SEC}.remarks='📹 YouTube'
uci add_list "${CONFIG_NAME}".${SEC}.domain_list='geosite:youtube'
uci set "${CONFIG_NAME}".${SEC}.network='tcp,udp'
# uci set "${CONFIG_NAME}".${SEC}.tcp_node='NEED_CONFIG_IN_LUCI'

# [14] 🎵 音乐流媒体
SEC="$(uci add "${CONFIG_NAME}" shunt_rules)"
uci set "${CONFIG_NAME}".${SEC}.remarks='🎵 音乐流媒体'
uci add_list "${CONFIG_NAME}".${SEC}.domain_list='geosite:spotify'
uci set "${CONFIG_NAME}".${SEC}.network='tcp,udp'
# uci set "${CONFIG_NAME}".${SEC}.tcp_node='NEED_CONFIG_IN_LUCI'

# [15] 🇭🇰 香港流媒体
SEC="$(uci add "${CONFIG_NAME}" shunt_rules)"
uci set "${CONFIG_NAME}".${SEC}.remarks='🇭🇰 香港流媒体'
uci add_list "${CONFIG_NAME}".${SEC}.domain_list='geosite:mytvsuper'
uci add_list "${CONFIG_NAME}".${SEC}.domain_list='domain:mytvsuper.com'
uci add_list "${CONFIG_NAME}".${SEC}.domain_list='domain:now.com'
uci add_list "${CONFIG_NAME}".${SEC}.domain_list='domain:viu.tv'
uci add_list "${CONFIG_NAME}".${SEC}.domain_list='domain:encoretvb.com'
uci add_list "${CONFIG_NAME}".${SEC}.domain_list='domain:rthk.hk'
uci set "${CONFIG_NAME}".${SEC}.network='tcp,udp'
# uci set "${CONFIG_NAME}".${SEC}.tcp_node='NEED_CONFIG_IN_LUCI'

# [16] 🇹🇼 台湾流媒体
SEC="$(uci add "${CONFIG_NAME}" shunt_rules)"
uci set "${CONFIG_NAME}".${SEC}.remarks='🇹🇼 台湾流媒体'
uci add_list "${CONFIG_NAME}".${SEC}.domain_list='geosite:bahamut'
uci add_list "${CONFIG_NAME}".${SEC}.domain_list='domain:bahamut.com.tw'
uci add_list "${CONFIG_NAME}".${SEC}.domain_list='domain:hinet.net'
uci add_list "${CONFIG_NAME}".${SEC}.domain_list='domain:kktv.me'
uci add_list "${CONFIG_NAME}".${SEC}.domain_list='domain:litv.tv'
uci add_list "${CONFIG_NAME}".${SEC}.domain_list='domain:hamivideo.hinet.net'
uci add_list "${CONFIG_NAME}".${SEC}.domain_list='domain:friday.tw'
uci set "${CONFIG_NAME}".${SEC}.network='tcp,udp'
# uci set "${CONFIG_NAME}".${SEC}.tcp_node='NEED_CONFIG_IN_LUCI'

# [17] 🇯🇵 日韩流媒体
SEC="$(uci add "${CONFIG_NAME}" shunt_rules)"
uci set "${CONFIG_NAME}".${SEC}.remarks='🇯🇵 日韩流媒体'
uci add_list "${CONFIG_NAME}".${SEC}.domain_list='geosite:abema'
uci add_list "${CONFIG_NAME}".${SEC}.domain_list='geosite:niconico'
uci add_list "${CONFIG_NAME}".${SEC}.domain_list='domain:dazn.com'
uci add_list "${CONFIG_NAME}".${SEC}.domain_list='domain:dmm.com'
uci add_list "${CONFIG_NAME}".${SEC}.domain_list='domain:tv-tokyo.co.jp'
uci add_list "${CONFIG_NAME}".${SEC}.domain_list='domain:tver.jp'
uci add_list "${CONFIG_NAME}".${SEC}.domain_list='domain:rakuten.tv'
uci set "${CONFIG_NAME}".${SEC}.network='tcp,udp'
# uci set "${CONFIG_NAME}".${SEC}.tcp_node='NEED_CONFIG_IN_LUCI'

# [18] 🇪🇺 欧洲流媒体
SEC="$(uci add "${CONFIG_NAME}" shunt_rules)"
uci set "${CONFIG_NAME}".${SEC}.remarks='🇪🇺 欧洲流媒体'
uci add_list "${CONFIG_NAME}".${SEC}.domain_list='geosite:bbc'
uci add_list "${CONFIG_NAME}".${SEC}.domain_list='domain:itv.com'
uci add_list "${CONFIG_NAME}".${SEC}.domain_list='domain:my5.tv'
uci add_list "${CONFIG_NAME}".${SEC}.domain_list='domain:skygo.com'
uci add_list "${CONFIG_NAME}".${SEC}.domain_list='domain:britbox.co.uk'
uci set "${CONFIG_NAME}".${SEC}.network='tcp,udp'
# uci set "${CONFIG_NAME}".${SEC}.tcp_node='NEED_CONFIG_IN_LUCI'

# [19] 🌐 其他国外流媒体（合并自原东南亚流媒体 + 美国流媒体余项）
SEC="$(uci add "${CONFIG_NAME}" shunt_rules)"
uci set "${CONFIG_NAME}".${SEC}.remarks='🌐 其他国外流媒体'
# 原东南亚流媒体
uci add_list "${CONFIG_NAME}".${SEC}.domain_list='geosite:viu'
uci add_list "${CONFIG_NAME}".${SEC}.domain_list='domain:iq.com'
uci add_list "${CONFIG_NAME}".${SEC}.domain_list='domain:wetv.vip'
uci add_list "${CONFIG_NAME}".${SEC}.domain_list='domain:vidio.com'
uci add_list "${CONFIG_NAME}".${SEC}.domain_list='domain:iqiyiintl.com'
# 其他国外流媒体（原美国流媒体剩余项）
uci add_list "${CONFIG_NAME}".${SEC}.domain_list='domain:paramountplus.com'
uci add_list "${CONFIG_NAME}".${SEC}.domain_list='domain:peacocktv.com'
uci add_list "${CONFIG_NAME}".${SEC}.domain_list='domain:twitch.tv'
uci add_list "${CONFIG_NAME}".${SEC}.domain_list='domain:crunchyroll.com'
uci add_list "${CONFIG_NAME}".${SEC}.domain_list='domain:vrv.co'
uci set "${CONFIG_NAME}".${SEC}.network='tcp,udp'
# uci set "${CONFIG_NAME}".${SEC}.tcp_node='NEED_CONFIG_IN_LUCI'

# [20] 🔍 Google 服务
SEC="$(uci add "${CONFIG_NAME}" shunt_rules)"
uci set "${CONFIG_NAME}".${SEC}.remarks='🔍 Google 服务'
uci add_list "${CONFIG_NAME}".${SEC}.domain_list='geosite:google'
uci add_list "${CONFIG_NAME}".${SEC}.domain_list='domain:scholar.google.com'
uci add_list "${CONFIG_NAME}".${SEC}.ip_list='geoip:google'
uci set "${CONFIG_NAME}".${SEC}.network='tcp,udp'
# uci set "${CONFIG_NAME}".${SEC}.tcp_node='NEED_CONFIG_IN_LUCI'

# [21] 🔧 工具与服务（非 Google 搜索引擎 + 开发者服务）
SEC="$(uci add "${CONFIG_NAME}" shunt_rules)"
uci set "${CONFIG_NAME}".${SEC}.remarks='🔧 工具与服务'
# 非 Google 搜索引擎
uci add_list "${CONFIG_NAME}".${SEC}.domain_list='geosite:bing'
uci add_list "${CONFIG_NAME}".${SEC}.domain_list='geosite:duckduckgo'
uci add_list "${CONFIG_NAME}".${SEC}.domain_list='geosite:yandex'
# 原 📟 开发者服务
uci add_list "${CONFIG_NAME}".${SEC}.domain_list='geosite:github'
uci add_list "${CONFIG_NAME}".${SEC}.domain_list='geosite:gitlab'
uci add_list "${CONFIG_NAME}".${SEC}.domain_list='geosite:docker'
uci add_list "${CONFIG_NAME}".${SEC}.domain_list='geosite:npmjs'
uci add_list "${CONFIG_NAME}".${SEC}.domain_list='geosite:pypi'
uci add_list "${CONFIG_NAME}".${SEC}.domain_list='geosite:python'
uci add_list "${CONFIG_NAME}".${SEC}.domain_list='domain:jetbrains.com'
uci add_list "${CONFIG_NAME}".${SEC}.domain_list='domain:stackoverflow.com'
uci add_list "${CONFIG_NAME}".${SEC}.domain_list='domain:stackexchange.com'
uci set "${CONFIG_NAME}".${SEC}.network='tcp,udp'
# uci set "${CONFIG_NAME}".${SEC}.tcp_node='NEED_CONFIG_IN_LUCI'


# [22] Ⓜ️ 微软服务
SEC="$(uci add "${CONFIG_NAME}" shunt_rules)"
uci set "${CONFIG_NAME}".${SEC}.remarks='Ⓜ️ 微软服务'
uci add_list "${CONFIG_NAME}".${SEC}.domain_list='geosite:microsoft'
uci add_list "${CONFIG_NAME}".${SEC}.domain_list='geosite:onedrive'
uci add_list "${CONFIG_NAME}".${SEC}.domain_list='domain:office.com'
uci add_list "${CONFIG_NAME}".${SEC}.domain_list='domain:live.com'
uci add_list "${CONFIG_NAME}".${SEC}.domain_list='domain:microsoftedge.com'
uci set "${CONFIG_NAME}".${SEC}.network='tcp,udp'
# uci set "${CONFIG_NAME}".${SEC}.tcp_node='NEED_CONFIG_IN_LUCI'

# [23] 🍎 苹果服务
SEC="$(uci add "${CONFIG_NAME}" shunt_rules)"
uci set "${CONFIG_NAME}".${SEC}.remarks='🍎 苹果服务'
uci add_list "${CONFIG_NAME}".${SEC}.domain_list='geosite:apple'
uci add_list "${CONFIG_NAME}".${SEC}.domain_list='geosite:icloud'
uci add_list "${CONFIG_NAME}".${SEC}.domain_list='domain:appstore.com'
uci add_list "${CONFIG_NAME}".${SEC}.domain_list='domain:mzstatic.com'
uci add_list "${CONFIG_NAME}".${SEC}.domain_list='domain:itunes.com'
uci add_list "${CONFIG_NAME}".${SEC}.domain_list='domain:applemusic.com'
uci add_list "${CONFIG_NAME}".${SEC}.domain_list='domain:apple-dns.net'
uci set "${CONFIG_NAME}".${SEC}.network='tcp,udp'
# uci set "${CONFIG_NAME}".${SEC}.tcp_node='NEED_CONFIG_IN_LUCI'

# [24] 📥 下载更新
SEC="$(uci add "${CONFIG_NAME}" shunt_rules)"
uci set "${CONFIG_NAME}".${SEC}.remarks='📥 下载更新'
uci add_list "${CONFIG_NAME}".${SEC}.domain_list='domain:dl.google.com'
uci add_list "${CONFIG_NAME}".${SEC}.domain_list='domain:play.googleapis.com'
uci add_list "${CONFIG_NAME}".${SEC}.domain_list='domain:msftconnecttest.com'
uci add_list "${CONFIG_NAME}".${SEC}.domain_list='domain:windowsupdate.com'
uci add_list "${CONFIG_NAME}".${SEC}.domain_list='domain:cdn-apple.com'
uci add_list "${CONFIG_NAME}".${SEC}.domain_list='domain:ubuntu.com'
uci add_list "${CONFIG_NAME}".${SEC}.domain_list='domain:mozilla.org'
uci add_list "${CONFIG_NAME}".${SEC}.domain_list='domain:apkpure.com'
uci set "${CONFIG_NAME}".${SEC}.network='tcp,udp'
# uci set "${CONFIG_NAME}".${SEC}.tcp_node='NEED_CONFIG_IN_LUCI'

# [25] 🛰️ BT/PT Tracker
SEC="$(uci add "${CONFIG_NAME}" shunt_rules)"
uci set "${CONFIG_NAME}".${SEC}.remarks='🛰️ BT/PT Tracker'
uci add_list "${CONFIG_NAME}".${SEC}.domain_list='geosite:private-tracker'
uci add_list "${CONFIG_NAME}".${SEC}.domain_list='domain:opentrackr.org'
uci add_list "${CONFIG_NAME}".${SEC}.domain_list='domain:openbittorrent.com'
uci add_list "${CONFIG_NAME}".${SEC}.domain_list='domain:nyaa.si'
uci set "${CONFIG_NAME}".${SEC}.network='tcp,udp'
# uci set "${CONFIG_NAME}".${SEC}.tcp_node='NEED_CONFIG_IN_LUCI'

# [26] 🚫 受限网站
SEC="$(uci add "${CONFIG_NAME}" shunt_rules)"
uci set "${CONFIG_NAME}".${SEC}.remarks='🚫 受限网站'
uci add_list "${CONFIG_NAME}".${SEC}.domain_list='geosite:gfw'
uci add_list "${CONFIG_NAME}".${SEC}.domain_list='geosite:greatfire'
uci set "${CONFIG_NAME}".${SEC}.network='tcp,udp'
# uci set "${CONFIG_NAME}".${SEC}.tcp_node='NEED_CONFIG_IN_LUCI'

# [27] 🕹️ 国内游戏
SEC="$(uci add "${CONFIG_NAME}" shunt_rules)"
uci set "${CONFIG_NAME}".${SEC}.remarks='🕹️ 国内游戏'
uci add_list "${CONFIG_NAME}".${SEC}.domain_list='geosite:steamcn'
uci add_list "${CONFIG_NAME}".${SEC}.domain_list='domain:mihoyo.com'
uci add_list "${CONFIG_NAME}".${SEC}.domain_list='domain:miyoushe.com'
uci add_list "${CONFIG_NAME}".${SEC}.domain_list='domain:yuanshen.com'
uci add_list "${CONFIG_NAME}".${SEC}.domain_list='domain:bhsr.com'
uci add_list "${CONFIG_NAME}".${SEC}.domain_list='domain:zenlesszonezero.com'
uci add_list "${CONFIG_NAME}".${SEC}.domain_list='domain:game.163.com'
uci add_list "${CONFIG_NAME}".${SEC}.domain_list='domain:gm.163.com'
uci add_list "${CONFIG_NAME}".${SEC}.domain_list='domain:ds.163.com'
uci add_list "${CONFIG_NAME}".${SEC}.domain_list='domain:nie.163.com'
uci add_list "${CONFIG_NAME}".${SEC}.domain_list='domain:nie.netease.com'
uci add_list "${CONFIG_NAME}".${SEC}.domain_list='domain:update.netease.com'
uci add_list "${CONFIG_NAME}".${SEC}.domain_list='domain:netease.com'
uci add_list "${CONFIG_NAME}".${SEC}.domain_list='domain:wegame.com'
uci add_list "${CONFIG_NAME}".${SEC}.domain_list='domain:wegame.com.cn'
uci add_list "${CONFIG_NAME}".${SEC}.domain_list='domain:perfect-world.com'
uci add_list "${CONFIG_NAME}".${SEC}.domain_list='domain:wanmei.com'
uci add_list "${CONFIG_NAME}".${SEC}.domain_list='domain:xd.com'
uci add_list "${CONFIG_NAME}".${SEC}.domain_list='domain:taptap.com'
uci add_list "${CONFIG_NAME}".${SEC}.domain_list='domain:taptap.io'
uci add_list "${CONFIG_NAME}".${SEC}.domain_list='domain:papegames.com'
uci add_list "${CONFIG_NAME}".${SEC}.domain_list='domain:hypergryph.com'
uci add_list "${CONFIG_NAME}".${SEC}.domain_list='domain:gryphline.com'
uci add_list "${CONFIG_NAME}".${SEC}.domain_list='domain:lilith.com'
uci add_list "${CONFIG_NAME}".${SEC}.domain_list='domain:majsoul.com'
uci add_list "${CONFIG_NAME}".${SEC}.domain_list='domain:battlenet.com.cn'
uci set "${CONFIG_NAME}".${SEC}.network='tcp,udp'
# uci set "${CONFIG_NAME}".${SEC}.tcp_node='NEED_CONFIG_IN_LUCI'

# [28] 🎮 国外游戏
SEC="$(uci add "${CONFIG_NAME}" shunt_rules)"
uci set "${CONFIG_NAME}".${SEC}.remarks='🎮 国外游戏'
uci add_list "${CONFIG_NAME}".${SEC}.domain_list='geosite:steam'
uci add_list "${CONFIG_NAME}".${SEC}.domain_list='geosite:epicgames'
uci add_list "${CONFIG_NAME}".${SEC}.domain_list='geosite:playstation'
uci add_list "${CONFIG_NAME}".${SEC}.domain_list='geosite:xbox'
uci add_list "${CONFIG_NAME}".${SEC}.domain_list='geosite:nintendo'
uci add_list "${CONFIG_NAME}".${SEC}.domain_list='domain:riotgames.com'
uci add_list "${CONFIG_NAME}".${SEC}.domain_list='domain:ea.com'
uci add_list "${CONFIG_NAME}".${SEC}.domain_list='domain:blizzard.com'
uci add_list "${CONFIG_NAME}".${SEC}.domain_list='domain:hoyoverse.com'
uci set "${CONFIG_NAME}".${SEC}.network='tcp,udp'
# uci set "${CONFIG_NAME}".${SEC}.tcp_node='NEED_CONFIG_IN_LUCI'

# [29] 🌐 国外网站（合并自原邮件服务 + 云与CDN）
SEC="$(uci add "${CONFIG_NAME}" shunt_rules)"
uci set "${CONFIG_NAME}".${SEC}.remarks='🌐 国外网站'
uci add_list "${CONFIG_NAME}".${SEC}.domain_list='geosite:geolocation-!cn'
uci add_list "${CONFIG_NAME}".${SEC}.domain_list='domain:cnn.com'
uci add_list "${CONFIG_NAME}".${SEC}.domain_list='domain:nytimes.com'
uci add_list "${CONFIG_NAME}".${SEC}.domain_list='domain:bloomberg.com'
uci add_list "${CONFIG_NAME}".${SEC}.domain_list='domain:wikipedia.org'
# 合并自原 📧 邮件服务
uci add_list "${CONFIG_NAME}".${SEC}.domain_list='geosite:gmail'
uci add_list "${CONFIG_NAME}".${SEC}.domain_list='geosite:outlook'
uci add_list "${CONFIG_NAME}".${SEC}.domain_list='geosite:protonmail'
uci add_list "${CONFIG_NAME}".${SEC}.domain_list='domain:fastmail.com'
uci add_list "${CONFIG_NAME}".${SEC}.domain_list='domain:tuta.com'
uci add_list "${CONFIG_NAME}".${SEC}.domain_list='domain:mail.ru'
# 合并自原 ☁️ 云与CDN
uci add_list "${CONFIG_NAME}".${SEC}.domain_list='geosite:cloudflare'
uci add_list "${CONFIG_NAME}".${SEC}.domain_list='domain:cloudflarestorage.com'
uci add_list "${CONFIG_NAME}".${SEC}.domain_list='geosite:fastly'
uci add_list "${CONFIG_NAME}".${SEC}.domain_list='geosite:akamai'
uci add_list "${CONFIG_NAME}".${SEC}.domain_list='domain:jsdelivr.net'
uci add_list "${CONFIG_NAME}".${SEC}.domain_list='domain:cloudfront.net'
uci add_list "${CONFIG_NAME}".${SEC}.ip_list='geoip:cloudflare'
uci add_list "${CONFIG_NAME}".${SEC}.ip_list='geoip:fastly'
uci set "${CONFIG_NAME}".${SEC}.network='tcp,udp'
# uci set "${CONFIG_NAME}".${SEC}.tcp_node='NEED_CONFIG_IN_LUCI'

# [30] 📺 国内流媒体
SEC="$(uci add "${CONFIG_NAME}" shunt_rules)"
uci set "${CONFIG_NAME}".${SEC}.remarks='📺 国内流媒体'
uci add_list "${CONFIG_NAME}".${SEC}.domain_list='geosite:bilibili'
uci add_list "${CONFIG_NAME}".${SEC}.domain_list='geosite:iqiyi'
uci add_list "${CONFIG_NAME}".${SEC}.domain_list='geosite:youku'
uci add_list "${CONFIG_NAME}".${SEC}.domain_list='geosite:tencentvideo'
uci add_list "${CONFIG_NAME}".${SEC}.domain_list='geosite:mgtv'
uci add_list "${CONFIG_NAME}".${SEC}.domain_list='geosite:douyin'
uci add_list "${CONFIG_NAME}".${SEC}.domain_list='domain:douyin.com'
uci add_list "${CONFIG_NAME}".${SEC}.domain_list='domain:douyincdn.com'
uci add_list "${CONFIG_NAME}".${SEC}.domain_list='domain:douyinpic.com'
uci add_list "${CONFIG_NAME}".${SEC}.domain_list='domain:douyinstatic.com'
uci add_list "${CONFIG_NAME}".${SEC}.domain_list='domain:douyinvod.com'
uci add_list "${CONFIG_NAME}".${SEC}.domain_list='domain:idouyinvod.com'
uci add_list "${CONFIG_NAME}".${SEC}.domain_list='domain:iesdouyin.com'
uci add_list "${CONFIG_NAME}".${SEC}.domain_list='domain:iesdouyin.net'
uci add_list "${CONFIG_NAME}".${SEC}.domain_list='domain:amemv.com'
uci add_list "${CONFIG_NAME}".${SEC}.domain_list='domain:zjcdn.com'
uci add_list "${CONFIG_NAME}".${SEC}.domain_list='geosite:netease-music'
uci add_list "${CONFIG_NAME}".${SEC}.domain_list='geosite:qqmusic'
uci set "${CONFIG_NAME}".${SEC}.network='tcp,udp'
# uci set "${CONFIG_NAME}".${SEC}.tcp_node='NEED_CONFIG_IN_LUCI'

# [31] 🏠 国内网站
SEC="$(uci add "${CONFIG_NAME}" shunt_rules)"
uci set "${CONFIG_NAME}".${SEC}.remarks='🏠 国内网站'
uci add_list "${CONFIG_NAME}".${SEC}.domain_list='domain:a-map.cn'
uci add_list "${CONFIG_NAME}".${SEC}.domain_list='domain:a-map.co'
uci add_list "${CONFIG_NAME}".${SEC}.domain_list='domain:a-map.link'
uci add_list "${CONFIG_NAME}".${SEC}.domain_list='domain:a-map.vip'
uci add_list "${CONFIG_NAME}".${SEC}.domain_list='domain:acloudrender.com'
uci add_list "${CONFIG_NAME}".${SEC}.domain_list='domain:amap.com'
uci add_list "${CONFIG_NAME}".${SEC}.domain_list='domain:amapauto.com'
uci add_list "${CONFIG_NAME}".${SEC}.domain_list='domain:anav.com'
uci add_list "${CONFIG_NAME}".${SEC}.domain_list='domain:autonavi.com'
uci add_list "${CONFIG_NAME}".${SEC}.domain_list='domain:gaode.com'
uci add_list "${CONFIG_NAME}".${SEC}.domain_list='geosite:cn'
uci add_list "${CONFIG_NAME}".${SEC}.ip_list='geoip:cn'
uci add_list "${CONFIG_NAME}".${SEC}.ip_list='geoip:private'
uci set "${CONFIG_NAME}".${SEC}.network='tcp,udp'
# uci set "${CONFIG_NAME}".${SEC}.tcp_node='NEED_CONFIG_IN_LUCI'

# [32] 🐟 漏网之鱼
SEC="$(uci add "${CONFIG_NAME}" shunt_rules)"
uci set "${CONFIG_NAME}".${SEC}.remarks='🐟 漏网之鱼'
uci set "${CONFIG_NAME}".${SEC}.network='tcp,udp'
# uci set "${CONFIG_NAME}".${SEC}.tcp_node='NEED_CONFIG_IN_LUCI'

uci commit "${CONFIG_NAME}"

echo "✓ 33 条 shunt rule 创建完成。"
echo "下一步："
echo "  1. LuCI → Passwall → 节点列表 → 按区域创建 TCP 节点 + 负载均衡组"
echo "  2. LuCI → Passwall → 分流控制 → 逐条为每个 rule 指定 tcp_node"
echo "  3. LuCI → Passwall → 基本设置 → 确认 tcp_node / udp_node 指向正确"
echo "  4. 确认规则顺序：#01 广告拦截在最前；#27-#32（国内游戏/国外游戏/国外网站/FINAL）保持在末尾"
echo "  5. 重启 Passwall: /etc/init.d/passwall restart"
echo ""
echo "======== 配置提示 ========"
echo "Passwall 全功能版比 Passwall2 多以下能力，可按需启用："
echo "  • 四列表（直连/屏蔽/GFW/代理）：在「代理」标签页开启 use_direct_list /"
echo "    use_proxy_list / use_block_list / use_gfw_list，可替代或补充 shunt rule"
echo "  • TCP/UDP 节点分选：tcp_node 走代理，udp_node 可走直连（国内游戏、BT 场景）"
echo "  • ACL 规则：按客户端 IP/MAC 指定不同分流策略"
echo "=========================="
