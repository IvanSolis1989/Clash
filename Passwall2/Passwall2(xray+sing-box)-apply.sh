#!/bin/sh
# ═══════════════════════════════════════════════════════════════════════════
# Smart-Config-Kit for Passwall2 — fused UCI batch helper
# Version: v6.0.9-pw2.1 | Build 2026-07-19 | Baseline: Clash Party v6.0.9
#
# 用途：一次性在 Passwall2 中创建 66 条 fused shunt rule。
#       每条规则只引用 rulesets/generated/fused/sing-box/*.srs，不再维护手写域名/IP 展平列表。
#       目标节点留空，用户之后到 LuCI 里给每条 rule 选择节点/负载均衡组。
#
# 生成：node tools/generate-fused-fallback-artifacts.js
# 变更历史：见 Passwall2/CHANGELOG.md
# ═══════════════════════════════════════════════════════════════════════════

set -e

CONFIG_NAME="passwall2"
VERSION_TAG="v6.0.9-pw2.1"
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
  case "$1" in
    scki-fused-*) return 0 ;;
  esac
  printf '%s\n' \
    "🛑 广告拦截" \
    "🤖 AI 服务" \
    "💰 加密货币" \
    "🏦 金融支付" \
    "💬 即时通讯" \
    "📱 社交媒体" \
    "🎵 TikTok" \
    "🧑‍💼 会议协作" \
    "📺 国内流媒体" \
    "🎥 Netflix" \
    "🎬 Disney+" \
    "📡 HBO/Max" \
    "📺 Hulu" \
    "🎬 Prime Video" \
    "📹 YouTube" \
    "🎵 音乐流媒体" \
    "🌐 其他国外流媒体" \
    "🇭🇰 香港流媒体" \
    "🇹🇼 台湾流媒体" \
    "🇯🇵 日韩流媒体" \
    "🇪🇺 欧洲流媒体" \
    "🕹️ 国内游戏" \
    "🎮 国外游戏" \
    "Ⓜ️ 微软服务" \
    "🍎 苹果服务" \
    "📥 下载更新" \
    "🛰️ BT/PT Tracker" \
    "🏠 国内网站" \
    "🚫 受限网站" \
    "🌐 国外网站" \
    "🔍 Google 服务" \
    "🔧 工具与服务" \
    "🐟 漏网之鱼" \
    | grep -Fqx "$1"
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

add_fused_shunt_rule() {
  remarks="$1"
  url="$2"
  has_ip="$3"
  SEC="$(uci add "${CONFIG_NAME}" shunt_rules)"
  uci set "${CONFIG_NAME}".${SEC}.remarks="${remarks}"
  uci add_list "${CONFIG_NAME}".${SEC}.domain_list="rule-set:remote:${url}"
  if [ "${has_ip}" = "1" ]; then
    uci add_list "${CONFIG_NAME}".${SEC}.ip_list="rule-set:remote:${url}"
  fi
  uci set "${CONFIG_NAME}".${SEC}.network='tcp,udp'
  # Passwall2 在 LuCI 中设置统一 node。
}

if ! command -v uci >/dev/null 2>&1; then
  echo "ERROR: uci 命令不存在，本脚本只能在 OpenWrt 路由器上运行" >&2
  exit 1
fi

if [ ! -f "/etc/config/${CONFIG_NAME}" ]; then
  echo "ERROR: /etc/config/${CONFIG_NAME} 不存在，请先安装 Passwall2" >&2
  exit 1
fi

echo "建议先备份: cp /etc/config/${CONFIG_NAME} /etc/config/${CONFIG_NAME}.$(date +%s).bak"
echo "运行模式: ${MODE}（--replace 会删除旧 Smart-Config-Kit 规则；--append 会追加）"
if [ -t 0 ]; then
  echo "按 Ctrl+C 取消，回车继续..."
  read _
fi

if [ "${MODE}" = "--replace" ]; then
  cleanup_existing_scki_rules
fi

echo "开始创建 66 条 fused shunt rule..."

# [001] scki-fused-001-direct | DIRECT
add_fused_shunt_rule 'scki-fused-001-direct | DIRECT' 'https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/sing-box/scki-fused-001-direct.srs?scki=v6.0.9' '0'

# [002] scki-fused-002-intl-site | 🌐 国外网站
add_fused_shunt_rule 'scki-fused-002-intl-site | 🌐 国外网站' 'https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/sing-box/scki-fused-002-intl-site.srs?scki=v6.0.9' '0'

# [003] scki-fused-003-payments | 🏦 金融支付
add_fused_shunt_rule 'scki-fused-003-payments | 🏦 金融支付' 'https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/sing-box/scki-fused-003-payments.srs?scki=v6.0.9' '0'

# [004] scki-fused-004-ai | 🤖 AI 服务
add_fused_shunt_rule 'scki-fused-004-ai | 🤖 AI 服务' 'https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/sing-box/scki-fused-004-ai.srs?scki=v6.0.9' '0'

# [005] scki-fused-005-cnmedia | 📺 国内流媒体
add_fused_shunt_rule 'scki-fused-005-cnmedia | 📺 国内流媒体' 'https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/sing-box/scki-fused-005-cnmedia.srs?scki=v6.0.9' '0'

# [006] scki-fused-006-ad | 🛑 广告拦截
add_fused_shunt_rule 'scki-fused-006-ad | 🛑 广告拦截' 'https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/sing-box/scki-fused-006-ad.srs?scki=v6.0.9' '1'

# [007] scki-fused-007-cn-site | 🏠 国内网站
add_fused_shunt_rule 'scki-fused-007-cn-site | 🏠 国内网站' 'https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/sing-box/scki-fused-007-cn-site.srs?scki=v6.0.9' '0'

# [008] scki-fused-008-direct | DIRECT
add_fused_shunt_rule 'scki-fused-008-direct | DIRECT' 'https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/sing-box/scki-fused-008-direct.srs?scki=v6.0.9' '1'

# [009] scki-fused-009-work | 🧑‍💼 会议协作
add_fused_shunt_rule 'scki-fused-009-work | 🧑‍💼 会议协作' 'https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/sing-box/scki-fused-009-work.srs?scki=v6.0.9' '0'

# [010] scki-fused-010-crypto | 💰 加密货币
add_fused_shunt_rule 'scki-fused-010-crypto | 💰 加密货币' 'https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/sing-box/scki-fused-010-crypto.srs?scki=v6.0.9' '0'

# [011] scki-fused-011-gfw | 🚫 受限网站
add_fused_shunt_rule 'scki-fused-011-gfw | 🚫 受限网站' 'https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/sing-box/scki-fused-011-gfw.srs?scki=v6.0.9' '0'

# [012] scki-fused-012-youtube | 📹 YouTube
add_fused_shunt_rule 'scki-fused-012-youtube | 📹 YouTube' 'https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/sing-box/scki-fused-012-youtube.srs?scki=v6.0.9' '0'

# [013] scki-fused-013-cn-site | 🏠 国内网站
add_fused_shunt_rule 'scki-fused-013-cn-site | 🏠 国内网站' 'https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/sing-box/scki-fused-013-cn-site.srs?scki=v6.0.9' '0'

# [014] scki-fused-014-ai | 🤖 AI 服务
add_fused_shunt_rule 'scki-fused-014-ai | 🤖 AI 服务' 'https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/sing-box/scki-fused-014-ai.srs?scki=v6.0.9' '0'

# [015] scki-fused-015-work | 🧑‍💼 会议协作
add_fused_shunt_rule 'scki-fused-015-work | 🧑‍💼 会议协作' 'https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/sing-box/scki-fused-015-work.srs?scki=v6.0.9' '0'

# [016] scki-fused-016-ai | 🤖 AI 服务
add_fused_shunt_rule 'scki-fused-016-ai | 🤖 AI 服务' 'https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/sing-box/scki-fused-016-ai.srs?scki=v6.0.9' '1'

# [017] scki-fused-017-intl-site | 🌐 国外网站
add_fused_shunt_rule 'scki-fused-017-intl-site | 🌐 国外网站' 'https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/sing-box/scki-fused-017-intl-site.srs?scki=v6.0.9' '0'

# [018] scki-fused-018-im | 💬 即时通讯
add_fused_shunt_rule 'scki-fused-018-im | 💬 即时通讯' 'https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/sing-box/scki-fused-018-im.srs?scki=v6.0.9' '0'

# [019] scki-fused-019-work | 🧑‍💼 会议协作
add_fused_shunt_rule 'scki-fused-019-work | 🧑‍💼 会议协作' 'https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/sing-box/scki-fused-019-work.srs?scki=v6.0.9' '0'

# [020] scki-fused-020-download | 📥 下载更新
add_fused_shunt_rule 'scki-fused-020-download | 📥 下载更新' 'https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/sing-box/scki-fused-020-download.srs?scki=v6.0.9' '1'

# [021] scki-fused-021-google | 🔍 Google 服务
add_fused_shunt_rule 'scki-fused-021-google | 🔍 Google 服务' 'https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/sing-box/scki-fused-021-google.srs?scki=v6.0.9' '1'

# [022] scki-fused-022-tools | 🔧 工具与服务
add_fused_shunt_rule 'scki-fused-022-tools | 🔧 工具与服务' 'https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/sing-box/scki-fused-022-tools.srs?scki=v6.0.9' '0'

# [023] scki-fused-023-ai | 🤖 AI 服务
add_fused_shunt_rule 'scki-fused-023-ai | 🤖 AI 服务' 'https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/sing-box/scki-fused-023-ai.srs?scki=v6.0.9' '1'

# [024] scki-fused-024-crypto | 💰 加密货币
add_fused_shunt_rule 'scki-fused-024-crypto | 💰 加密货币' 'https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/sing-box/scki-fused-024-crypto.srs?scki=v6.0.9' '0'

# [025] scki-fused-025-payments | 🏦 金融支付
add_fused_shunt_rule 'scki-fused-025-payments | 🏦 金融支付' 'https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/sing-box/scki-fused-025-payments.srs?scki=v6.0.9' '0'

# [026] scki-fused-026-microsoft | Ⓜ️ 微软服务
add_fused_shunt_rule 'scki-fused-026-microsoft | Ⓜ️ 微软服务' 'https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/sing-box/scki-fused-026-microsoft.srs?scki=v6.0.9' '0'

# [027] scki-fused-027-intl-site | 🌐 国外网站
add_fused_shunt_rule 'scki-fused-027-intl-site | 🌐 国外网站' 'https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/sing-box/scki-fused-027-intl-site.srs?scki=v6.0.9' '0'

# [028] scki-fused-028-direct | DIRECT
add_fused_shunt_rule 'scki-fused-028-direct | DIRECT' 'https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/sing-box/scki-fused-028-direct.srs?scki=v6.0.9' '0'

# [029] scki-fused-029-im | 💬 即时通讯
add_fused_shunt_rule 'scki-fused-029-im | 💬 即时通讯' 'https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/sing-box/scki-fused-029-im.srs?scki=v6.0.9' '1'

# [030] scki-fused-030-social | 📱 社交媒体
add_fused_shunt_rule 'scki-fused-030-social | 📱 社交媒体' 'https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/sing-box/scki-fused-030-social.srs?scki=v6.0.9' '1'

# [031] scki-fused-031-cn-site | 🏠 国内网站
add_fused_shunt_rule 'scki-fused-031-cn-site | 🏠 国内网站' 'https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/sing-box/scki-fused-031-cn-site.srs?scki=v6.0.9' '0'

# [032] scki-fused-032-social | 📱 社交媒体
add_fused_shunt_rule 'scki-fused-032-social | 📱 社交媒体' 'https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/sing-box/scki-fused-032-social.srs?scki=v6.0.9' '0'

# [033] scki-fused-033-work | 🧑‍💼 会议协作
add_fused_shunt_rule 'scki-fused-033-work | 🧑‍💼 会议协作' 'https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/sing-box/scki-fused-033-work.srs?scki=v6.0.9' '1'

# [034] scki-fused-034-direct | DIRECT
add_fused_shunt_rule 'scki-fused-034-direct | DIRECT' 'https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/sing-box/scki-fused-034-direct.srs?scki=v6.0.9' '0'

# [035] scki-fused-035-cnmedia | 📺 国内流媒体
add_fused_shunt_rule 'scki-fused-035-cnmedia | 📺 国内流媒体' 'https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/sing-box/scki-fused-035-cnmedia.srs?scki=v6.0.9' '0'

# [036] scki-fused-036-tiktok | 🎵 TikTok
add_fused_shunt_rule 'scki-fused-036-tiktok | 🎵 TikTok' 'https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/sing-box/scki-fused-036-tiktok.srs?scki=v6.0.9' '0'

# [037] scki-fused-037-youtube | 📹 YouTube
add_fused_shunt_rule 'scki-fused-037-youtube | 📹 YouTube' 'https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/sing-box/scki-fused-037-youtube.srs?scki=v6.0.9' '0'

# [038] scki-fused-038-netflix | 🎥 Netflix
add_fused_shunt_rule 'scki-fused-038-netflix | 🎥 Netflix' 'https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/sing-box/scki-fused-038-netflix.srs?scki=v6.0.9' '1'

# [039] scki-fused-039-disney | 🎬 Disney+
add_fused_shunt_rule 'scki-fused-039-disney | 🎬 Disney+' 'https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/sing-box/scki-fused-039-disney.srs?scki=v6.0.9' '0'

# [040] scki-fused-040-hbo-max | 📡 HBO/Max
add_fused_shunt_rule 'scki-fused-040-hbo-max | 📡 HBO/Max' 'https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/sing-box/scki-fused-040-hbo-max.srs?scki=v6.0.9' '0'

# [041] scki-fused-041-hulu | 📺 Hulu
add_fused_shunt_rule 'scki-fused-041-hulu | 📺 Hulu' 'https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/sing-box/scki-fused-041-hulu.srs?scki=v6.0.9' '0'

# [042] scki-fused-042-prime-video | 🎬 Prime Video
add_fused_shunt_rule 'scki-fused-042-prime-video | 🎬 Prime Video' 'https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/sing-box/scki-fused-042-prime-video.srs?scki=v6.0.9' '1'

# [043] scki-fused-043-music | 🎵 音乐流媒体
add_fused_shunt_rule 'scki-fused-043-music | 🎵 音乐流媒体' 'https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/sing-box/scki-fused-043-music.srs?scki=v6.0.9' '1'

# [044] scki-fused-044-stream-hk | 🇭🇰 香港流媒体
add_fused_shunt_rule 'scki-fused-044-stream-hk | 🇭🇰 香港流媒体' 'https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/sing-box/scki-fused-044-stream-hk.srs?scki=v6.0.9' '1'

# [045] scki-fused-045-stream-tw | 🇹🇼 台湾流媒体
add_fused_shunt_rule 'scki-fused-045-stream-tw | 🇹🇼 台湾流媒体' 'https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/sing-box/scki-fused-045-stream-tw.srs?scki=v6.0.9' '0'

# [046] scki-fused-046-stream-jpkr | 🇯🇵 日韩流媒体
add_fused_shunt_rule 'scki-fused-046-stream-jpkr | 🇯🇵 日韩流媒体' 'https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/sing-box/scki-fused-046-stream-jpkr.srs?scki=v6.0.9' '1'

# [047] scki-fused-047-stream-eu | 🇪🇺 欧洲流媒体
add_fused_shunt_rule 'scki-fused-047-stream-eu | 🇪🇺 欧洲流媒体' 'https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/sing-box/scki-fused-047-stream-eu.srs?scki=v6.0.9' '0'

# [048] scki-fused-048-stream-other | 🌐 其他国外流媒体
add_fused_shunt_rule 'scki-fused-048-stream-other | 🌐 其他国外流媒体' 'https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/sing-box/scki-fused-048-stream-other.srs?scki=v6.0.9' '1'

# [049] scki-fused-049-tools | 🔧 工具与服务
add_fused_shunt_rule 'scki-fused-049-tools | 🔧 工具与服务' 'https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/sing-box/scki-fused-049-tools.srs?scki=v6.0.9' '0'

# [050] scki-fused-050-google | 🔍 Google 服务
add_fused_shunt_rule 'scki-fused-050-google | 🔍 Google 服务' 'https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/sing-box/scki-fused-050-google.srs?scki=v6.0.9' '0'

# [051] scki-fused-051-tools | 🔧 工具与服务
add_fused_shunt_rule 'scki-fused-051-tools | 🔧 工具与服务' 'https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/sing-box/scki-fused-051-tools.srs?scki=v6.0.9' '1'

# [052] scki-fused-052-microsoft | Ⓜ️ 微软服务
add_fused_shunt_rule 'scki-fused-052-microsoft | Ⓜ️ 微软服务' 'https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/sing-box/scki-fused-052-microsoft.srs?scki=v6.0.9' '0'

# [053] scki-fused-053-apple | 🍎 苹果服务
add_fused_shunt_rule 'scki-fused-053-apple | 🍎 苹果服务' 'https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/sing-box/scki-fused-053-apple.srs?scki=v6.0.9' '1'

# [054] scki-fused-054-download | 📥 下载更新
add_fused_shunt_rule 'scki-fused-054-download | 📥 下载更新' 'https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/sing-box/scki-fused-054-download.srs?scki=v6.0.9' '1'

# [055] scki-fused-055-tracker | 🛰️ BT/PT Tracker
add_fused_shunt_rule 'scki-fused-055-tracker | 🛰️ BT/PT Tracker' 'https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/sing-box/scki-fused-055-tracker.srs?scki=v6.0.9' '1'

# [056] scki-fused-056-gfw | 🚫 受限网站
add_fused_shunt_rule 'scki-fused-056-gfw | 🚫 受限网站' 'https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/sing-box/scki-fused-056-gfw.srs?scki=v6.0.9' '1'

# [057] scki-fused-057-game-cn | 🕹️ 国内游戏
add_fused_shunt_rule 'scki-fused-057-game-cn | 🕹️ 国内游戏' 'https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/sing-box/scki-fused-057-game-cn.srs?scki=v6.0.9' '0'

# [058] scki-fused-058-game-intl | 🎮 国外游戏
add_fused_shunt_rule 'scki-fused-058-game-intl | 🎮 国外游戏' 'https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/sing-box/scki-fused-058-game-intl.srs?scki=v6.0.9' '1'

# [059] scki-fused-059-intl-site | 🌐 国外网站
add_fused_shunt_rule 'scki-fused-059-intl-site | 🌐 国外网站' 'https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/sing-box/scki-fused-059-intl-site.srs?scki=v6.0.9' '1'

# [060] scki-fused-060-payments | 🏦 金融支付
add_fused_shunt_rule 'scki-fused-060-payments | 🏦 金融支付' 'https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/sing-box/scki-fused-060-payments.srs?scki=v6.0.9' '0'

# [061] scki-fused-061-cnmedia | 📺 国内流媒体
add_fused_shunt_rule 'scki-fused-061-cnmedia | 📺 国内流媒体' 'https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/sing-box/scki-fused-061-cnmedia.srs?scki=v6.0.9' '1'

# [062] scki-fused-062-cn-site | 🏠 国内网站
add_fused_shunt_rule 'scki-fused-062-cn-site | 🏠 国内网站' 'https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/sing-box/scki-fused-062-cn-site.srs?scki=v6.0.9' '1'

# [063] scki-fused-063-direct | DIRECT
add_fused_shunt_rule 'scki-fused-063-direct | DIRECT' 'https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/sing-box/scki-fused-063-direct.srs?scki=v6.0.9' '0'

# [064] scki-fused-064-cn-site | 🏠 国内网站
add_fused_shunt_rule 'scki-fused-064-cn-site | 🏠 国内网站' 'https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/sing-box/scki-fused-064-cn-site.srs?scki=v6.0.9' '0'

# [065] scki-fused-065-intl-site | 🌐 国外网站
add_fused_shunt_rule 'scki-fused-065-intl-site | 🌐 国外网站' 'https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/sing-box/scki-fused-065-intl-site.srs?scki=v6.0.9' '1'

# [066] scki-fused-067-netflix | 🎥 Netflix
add_fused_shunt_rule 'scki-fused-067-netflix | 🎥 Netflix' 'https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/sing-box/scki-fused-067-netflix.srs?scki=v6.0.9' '1'

uci commit "${CONFIG_NAME}"
echo "完成：已写入 66 条 Smart-Config-Kit fused shunt rule。请到 LuCI 分流控制中为各规则选择目标节点。"
