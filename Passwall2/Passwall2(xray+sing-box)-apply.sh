#!/bin/sh
# ═══════════════════════════════════════════════════════════════════════════
# Smart-Config-Kit for Passwall2 — fused UCI batch helper
# Version: v6.0.2-pw2.1 | Build 2026-07-10 | Baseline: Clash Party v6.0.2
#
# 用途：一次性在 Passwall2 中创建 64 条 fused shunt rule。
#       每条规则只引用 rulesets/generated/fused/sing-box/*.srs，不再维护手写域名/IP 展平列表。
#       目标节点留空，用户之后到 LuCI 里给每条 rule 选择节点/负载均衡组。
#
# 生成：node tools/generate-fused-fallback-artifacts.js
# 变更历史：见 Passwall2/CHANGELOG.md
# ═══════════════════════════════════════════════════════════════════════════

set -e

CONFIG_NAME="passwall2"
VERSION_TAG="v6.0.2-pw2.1"
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

echo "开始创建 64 条 fused shunt rule..."

# [001] scki-fused-001-direct | DIRECT
add_fused_shunt_rule 'scki-fused-001-direct | DIRECT' 'https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/sing-box/scki-fused-001-direct.srs' '0'

# [002] scki-fused-002-intl-site | 🌐 国外网站
add_fused_shunt_rule 'scki-fused-002-intl-site | 🌐 国外网站' 'https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/sing-box/scki-fused-002-intl-site.srs' '0'

# [003] scki-fused-003-payments | 🏦 金融支付
add_fused_shunt_rule 'scki-fused-003-payments | 🏦 金融支付' 'https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/sing-box/scki-fused-003-payments.srs' '0'

# [004] scki-fused-004-cnmedia | 📺 国内流媒体
add_fused_shunt_rule 'scki-fused-004-cnmedia | 📺 国内流媒体' 'https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/sing-box/scki-fused-004-cnmedia.srs' '0'

# [005] scki-fused-005-ad | 🛑 广告拦截
add_fused_shunt_rule 'scki-fused-005-ad | 🛑 广告拦截' 'https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/sing-box/scki-fused-005-ad.srs' '1'

# [006] scki-fused-006-cn-site | 🏠 国内网站
add_fused_shunt_rule 'scki-fused-006-cn-site | 🏠 国内网站' 'https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/sing-box/scki-fused-006-cn-site.srs' '0'

# [007] scki-fused-007-direct | DIRECT
add_fused_shunt_rule 'scki-fused-007-direct | DIRECT' 'https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/sing-box/scki-fused-007-direct.srs' '1'

# [008] scki-fused-008-work | 🧑‍💼 会议协作
add_fused_shunt_rule 'scki-fused-008-work | 🧑‍💼 会议协作' 'https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/sing-box/scki-fused-008-work.srs' '0'

# [009] scki-fused-009-crypto | 💰 加密货币
add_fused_shunt_rule 'scki-fused-009-crypto | 💰 加密货币' 'https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/sing-box/scki-fused-009-crypto.srs' '0'

# [010] scki-fused-010-gfw | 🚫 受限网站
add_fused_shunt_rule 'scki-fused-010-gfw | 🚫 受限网站' 'https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/sing-box/scki-fused-010-gfw.srs' '0'

# [011] scki-fused-011-youtube | 📹 YouTube
add_fused_shunt_rule 'scki-fused-011-youtube | 📹 YouTube' 'https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/sing-box/scki-fused-011-youtube.srs' '0'

# [012] scki-fused-012-cn-site | 🏠 国内网站
add_fused_shunt_rule 'scki-fused-012-cn-site | 🏠 国内网站' 'https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/sing-box/scki-fused-012-cn-site.srs' '0'

# [013] scki-fused-013-ai | 🤖 AI 服务
add_fused_shunt_rule 'scki-fused-013-ai | 🤖 AI 服务' 'https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/sing-box/scki-fused-013-ai.srs' '0'

# [014] scki-fused-014-work | 🧑‍💼 会议协作
add_fused_shunt_rule 'scki-fused-014-work | 🧑‍💼 会议协作' 'https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/sing-box/scki-fused-014-work.srs' '0'

# [015] scki-fused-015-ai | 🤖 AI 服务
add_fused_shunt_rule 'scki-fused-015-ai | 🤖 AI 服务' 'https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/sing-box/scki-fused-015-ai.srs' '1'

# [016] scki-fused-016-intl-site | 🌐 国外网站
add_fused_shunt_rule 'scki-fused-016-intl-site | 🌐 国外网站' 'https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/sing-box/scki-fused-016-intl-site.srs' '0'

# [017] scki-fused-017-im | 💬 即时通讯
add_fused_shunt_rule 'scki-fused-017-im | 💬 即时通讯' 'https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/sing-box/scki-fused-017-im.srs' '0'

# [018] scki-fused-018-work | 🧑‍💼 会议协作
add_fused_shunt_rule 'scki-fused-018-work | 🧑‍💼 会议协作' 'https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/sing-box/scki-fused-018-work.srs' '0'

# [019] scki-fused-019-download | 📥 下载更新
add_fused_shunt_rule 'scki-fused-019-download | 📥 下载更新' 'https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/sing-box/scki-fused-019-download.srs' '1'

# [020] scki-fused-020-google | 🔍 Google 服务
add_fused_shunt_rule 'scki-fused-020-google | 🔍 Google 服务' 'https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/sing-box/scki-fused-020-google.srs' '1'

# [021] scki-fused-021-ai | 🤖 AI 服务
add_fused_shunt_rule 'scki-fused-021-ai | 🤖 AI 服务' 'https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/sing-box/scki-fused-021-ai.srs' '1'

# [022] scki-fused-022-crypto | 💰 加密货币
add_fused_shunt_rule 'scki-fused-022-crypto | 💰 加密货币' 'https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/sing-box/scki-fused-022-crypto.srs' '0'

# [023] scki-fused-023-payments | 🏦 金融支付
add_fused_shunt_rule 'scki-fused-023-payments | 🏦 金融支付' 'https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/sing-box/scki-fused-023-payments.srs' '0'

# [024] scki-fused-024-microsoft | Ⓜ️ 微软服务
add_fused_shunt_rule 'scki-fused-024-microsoft | Ⓜ️ 微软服务' 'https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/sing-box/scki-fused-024-microsoft.srs' '0'

# [025] scki-fused-025-intl-site | 🌐 国外网站
add_fused_shunt_rule 'scki-fused-025-intl-site | 🌐 国外网站' 'https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/sing-box/scki-fused-025-intl-site.srs' '0'

# [026] scki-fused-026-direct | DIRECT
add_fused_shunt_rule 'scki-fused-026-direct | DIRECT' 'https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/sing-box/scki-fused-026-direct.srs' '0'

# [027] scki-fused-027-im | 💬 即时通讯
add_fused_shunt_rule 'scki-fused-027-im | 💬 即时通讯' 'https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/sing-box/scki-fused-027-im.srs' '1'

# [028] scki-fused-028-social | 📱 社交媒体
add_fused_shunt_rule 'scki-fused-028-social | 📱 社交媒体' 'https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/sing-box/scki-fused-028-social.srs' '1'

# [029] scki-fused-029-cn-site | 🏠 国内网站
add_fused_shunt_rule 'scki-fused-029-cn-site | 🏠 国内网站' 'https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/sing-box/scki-fused-029-cn-site.srs' '0'

# [030] scki-fused-030-social | 📱 社交媒体
add_fused_shunt_rule 'scki-fused-030-social | 📱 社交媒体' 'https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/sing-box/scki-fused-030-social.srs' '0'

# [031] scki-fused-031-work | 🧑‍💼 会议协作
add_fused_shunt_rule 'scki-fused-031-work | 🧑‍💼 会议协作' 'https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/sing-box/scki-fused-031-work.srs' '1'

# [032] scki-fused-032-direct | DIRECT
add_fused_shunt_rule 'scki-fused-032-direct | DIRECT' 'https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/sing-box/scki-fused-032-direct.srs' '0'

# [033] scki-fused-033-cnmedia | 📺 国内流媒体
add_fused_shunt_rule 'scki-fused-033-cnmedia | 📺 国内流媒体' 'https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/sing-box/scki-fused-033-cnmedia.srs' '0'

# [034] scki-fused-034-tiktok | 🎵 TikTok
add_fused_shunt_rule 'scki-fused-034-tiktok | 🎵 TikTok' 'https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/sing-box/scki-fused-034-tiktok.srs' '0'

# [035] scki-fused-035-youtube | 📹 YouTube
add_fused_shunt_rule 'scki-fused-035-youtube | 📹 YouTube' 'https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/sing-box/scki-fused-035-youtube.srs' '0'

# [036] scki-fused-036-netflix | 🎥 Netflix
add_fused_shunt_rule 'scki-fused-036-netflix | 🎥 Netflix' 'https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/sing-box/scki-fused-036-netflix.srs' '1'

# [037] scki-fused-037-disney | 🎬 Disney+
add_fused_shunt_rule 'scki-fused-037-disney | 🎬 Disney+' 'https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/sing-box/scki-fused-037-disney.srs' '0'

# [038] scki-fused-038-hbo-max | 📡 HBO/Max
add_fused_shunt_rule 'scki-fused-038-hbo-max | 📡 HBO/Max' 'https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/sing-box/scki-fused-038-hbo-max.srs' '0'

# [039] scki-fused-039-hulu | 📺 Hulu
add_fused_shunt_rule 'scki-fused-039-hulu | 📺 Hulu' 'https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/sing-box/scki-fused-039-hulu.srs' '0'

# [040] scki-fused-040-prime-video | 🎬 Prime Video
add_fused_shunt_rule 'scki-fused-040-prime-video | 🎬 Prime Video' 'https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/sing-box/scki-fused-040-prime-video.srs' '1'

# [041] scki-fused-041-music | 🎵 音乐流媒体
add_fused_shunt_rule 'scki-fused-041-music | 🎵 音乐流媒体' 'https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/sing-box/scki-fused-041-music.srs' '1'

# [042] scki-fused-042-stream-hk | 🇭🇰 香港流媒体
add_fused_shunt_rule 'scki-fused-042-stream-hk | 🇭🇰 香港流媒体' 'https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/sing-box/scki-fused-042-stream-hk.srs' '1'

# [043] scki-fused-043-stream-tw | 🇹🇼 台湾流媒体
add_fused_shunt_rule 'scki-fused-043-stream-tw | 🇹🇼 台湾流媒体' 'https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/sing-box/scki-fused-043-stream-tw.srs' '0'

# [044] scki-fused-044-stream-jpkr | 🇯🇵 日韩流媒体
add_fused_shunt_rule 'scki-fused-044-stream-jpkr | 🇯🇵 日韩流媒体' 'https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/sing-box/scki-fused-044-stream-jpkr.srs' '1'

# [045] scki-fused-045-stream-eu | 🇪🇺 欧洲流媒体
add_fused_shunt_rule 'scki-fused-045-stream-eu | 🇪🇺 欧洲流媒体' 'https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/sing-box/scki-fused-045-stream-eu.srs' '0'

# [046] scki-fused-046-stream-other | 🌐 其他国外流媒体
add_fused_shunt_rule 'scki-fused-046-stream-other | 🌐 其他国外流媒体' 'https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/sing-box/scki-fused-046-stream-other.srs' '1'

# [047] scki-fused-047-tools | 🔧 工具与服务
add_fused_shunt_rule 'scki-fused-047-tools | 🔧 工具与服务' 'https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/sing-box/scki-fused-047-tools.srs' '0'

# [048] scki-fused-048-google | 🔍 Google 服务
add_fused_shunt_rule 'scki-fused-048-google | 🔍 Google 服务' 'https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/sing-box/scki-fused-048-google.srs' '0'

# [049] scki-fused-049-tools | 🔧 工具与服务
add_fused_shunt_rule 'scki-fused-049-tools | 🔧 工具与服务' 'https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/sing-box/scki-fused-049-tools.srs' '1'

# [050] scki-fused-050-microsoft | Ⓜ️ 微软服务
add_fused_shunt_rule 'scki-fused-050-microsoft | Ⓜ️ 微软服务' 'https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/sing-box/scki-fused-050-microsoft.srs' '0'

# [051] scki-fused-051-apple | 🍎 苹果服务
add_fused_shunt_rule 'scki-fused-051-apple | 🍎 苹果服务' 'https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/sing-box/scki-fused-051-apple.srs' '1'

# [052] scki-fused-052-download | 📥 下载更新
add_fused_shunt_rule 'scki-fused-052-download | 📥 下载更新' 'https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/sing-box/scki-fused-052-download.srs' '1'

# [053] scki-fused-053-tracker | 🛰️ BT/PT Tracker
add_fused_shunt_rule 'scki-fused-053-tracker | 🛰️ BT/PT Tracker' 'https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/sing-box/scki-fused-053-tracker.srs' '1'

# [054] scki-fused-054-gfw | 🚫 受限网站
add_fused_shunt_rule 'scki-fused-054-gfw | 🚫 受限网站' 'https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/sing-box/scki-fused-054-gfw.srs' '1'

# [055] scki-fused-055-game-cn | 🕹️ 国内游戏
add_fused_shunt_rule 'scki-fused-055-game-cn | 🕹️ 国内游戏' 'https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/sing-box/scki-fused-055-game-cn.srs' '0'

# [056] scki-fused-056-game-intl | 🎮 国外游戏
add_fused_shunt_rule 'scki-fused-056-game-intl | 🎮 国外游戏' 'https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/sing-box/scki-fused-056-game-intl.srs' '1'

# [057] scki-fused-057-intl-site | 🌐 国外网站
add_fused_shunt_rule 'scki-fused-057-intl-site | 🌐 国外网站' 'https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/sing-box/scki-fused-057-intl-site.srs' '1'

# [058] scki-fused-058-payments | 🏦 金融支付
add_fused_shunt_rule 'scki-fused-058-payments | 🏦 金融支付' 'https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/sing-box/scki-fused-058-payments.srs' '0'

# [059] scki-fused-059-cnmedia | 📺 国内流媒体
add_fused_shunt_rule 'scki-fused-059-cnmedia | 📺 国内流媒体' 'https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/sing-box/scki-fused-059-cnmedia.srs' '1'

# [060] scki-fused-060-cn-site | 🏠 国内网站
add_fused_shunt_rule 'scki-fused-060-cn-site | 🏠 国内网站' 'https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/sing-box/scki-fused-060-cn-site.srs' '1'

# [061] scki-fused-061-direct | DIRECT
add_fused_shunt_rule 'scki-fused-061-direct | DIRECT' 'https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/sing-box/scki-fused-061-direct.srs' '0'

# [062] scki-fused-062-cn-site | 🏠 国内网站
add_fused_shunt_rule 'scki-fused-062-cn-site | 🏠 国内网站' 'https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/sing-box/scki-fused-062-cn-site.srs' '0'

# [063] scki-fused-063-intl-site | 🌐 国外网站
add_fused_shunt_rule 'scki-fused-063-intl-site | 🌐 国外网站' 'https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/sing-box/scki-fused-063-intl-site.srs' '1'

# [064] scki-fused-065-netflix | 🎥 Netflix
add_fused_shunt_rule 'scki-fused-065-netflix | 🎥 Netflix' 'https://fastly.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/rulesets/generated/fused/sing-box/scki-fused-065-netflix.srs' '1'

uci commit "${CONFIG_NAME}"
echo "完成：已写入 64 条 Smart-Config-Kit fused shunt rule。请到 LuCI 分流控制中为各规则选择目标节点。"
