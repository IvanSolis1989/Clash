# Smart-Config-Kit — 变更日志

> 仓库级变更摘要。各产物的详细变更见对应子目录 `CHANGELOG.md`。
> 主版本号由 `Clash Party/ClashParty(mihomo-smart).js` 内 `const VERSION` 唯一决定。
> 覆盖 12 个客户端形态的等价实现：Clash Party JS / CMFA / OpenClash(Normal+Smart) / Shadowrocket / Surge / Loon / Quantumult X / SingBox / v2rayN / Passwall / Passwall2 / FlClash。

---

## v5.4.24 (2026-06-03)

- CLEAN：清除全产物 21 条冗余规则 + 3 个未引用 rule-provider（深度审查验证，逐条对比上游原始文件）
- 删除 Binance/Google 子/ProtonMail/音乐/社交/流媒体重复 DOMAIN-SUFFIX + GEOIP 重复条目
- 根 README 精简 + CHANGELOG 规范写入 CLAUDE.md / AGENTS.md
- 同步：全 14 文件（含 FlClash）

## v5.4.23 (2026-06-02)

- FIX#161：zhimg.com / zhihu.co 加入国内网站直连（知乎图片 CDN + 短链未被 geosite:cn 覆盖）
- FIX#162：SR/Surge/Loon/QX 修复失效远程规则 URL（HaGeZi TIF 403 / RemoteDesktop 不存在 / BiliIntl 路径更名）
- 同步：全 12 产物

## v5.4.22 (2026-05-31)

- GeTui(个推)推送 SDK getui.com / getui.net / gepush.com 加直连白名单（避免被广告/隐私表拦截导致 App 推送失败）
- 借鉴 Proxy-override #1 QUIC 精细化：AND 规则白名单豁免（YouTube/Google/MS/Apple），其余非 CN QUIC REJECT
- 首次补齐 CMFA + OpenClash + FlClash 的 QUIC AND 规则；SingBox generator 扩展 QUIC 转换
- 兜底判据 GEOIP,CN -> GEOSITE,cn（fake-ip 下更可靠）
- 配套新增 sniffer（QUIC/443 SNI 嗅探 + force-dns-mapping）
- iOS 四件套标注 N/A（block-quic/disable-udp-ports 不支持 AND/NOT 白名单豁免）

## v5.4.21 (2026-05-31)

- 借鉴 Proxy-override #4 DoH-over-IP bootstrap：default-nameserver 从纯明文 IP 升级为 DoH-over-IP + 1 明文兜底
- 消除 bootstrap 阶段 DNS 泄漏（阿里 + Google + Cloudflare DoH-over-IP）

## v5.4.20 (2026-05-30)

- 借鉴 Proxy-override #6 节点过滤关键词补充：isInfoNode 新增中文「免费/试用/应急」+ 英文 Sign/Login/Register/Help/FAQ（\b 词边界防误伤 Signal）
- 回归测试：新增 tools/test-info-node-filter.js（6 mihomo 产物一致性）+ 扩展 validate-js-overwrites.js fixture

## v5.4.19 (2026-05-30)

- 借鉴 Proxy-override 批 A 低风险三项：
  - #2 国内 SDK/CDN 直连前置（jpush/umeng 加入白名单；baomitu/bootcss/staticfile/upaiyun 前置国内网站段）
  - #3 fake-ip-filter 补全 10 条（远控 todesk/oray/sunlogin/teamviewer/anydesk + 游戏 battlenet + B站 P2P mcdn.bilivideo.cn）
  - #5 direct-nameserver-follow-policy: true（direct 出口域名解析遵循 nameserver-policy）
- 全产物联动：#2 全 14 产物；#3/#5 限 6 mihomo 家族
- 版本统一跳过烧毁的 v5.4.18，全产物对齐到 v5.4.19

## v5.4.17 (2026-05-26)

- FIX#DNS-SPLIT-BOOTSTRAP：DNS 固定 default-nameserver 纯 IP 自举，其它 resolver 全部 DoH
- nameserver/direct-nameserver 固定国内 DoH；proxy-server-nameserver/fallback 固定境外 DoH
- prefer-h3: false / respect-rules: true / cache-algorithm: arc 写入主线
- OpenClash FIX#KR-WB：Ruby REGIONS 裸 KR 补词边界；FIX#HOSTS-ALIGN：use-hosts 修正为 true
- SingBox DNS 冗余修复 + rule_set 去重

## v5.4.16 (2026-05-22 / 2026-05-20)

- FEAT#GAME-ACCEL：新增 16 条游戏加速器 PROCESS-NAME -> DIRECT 白名单（UU/小黑/迅游/雷神/NNer）
- FIX#149-P0：paddle.com 前置到金融支付，避免 analytics.paddle.com 被 anti-AD 误拦截
- Surge FIX#SURGE-PORT-RULE：DST-PORT -> DEST-PORT（Surge 官方语法）

## v5.4.15 (2026-05-20)

- DOC#GEOSITE-LEDGER：新增 docs/GEOSITE_COVERAGE_LEDGER.md 覆盖台账
- REFACTOR#AD-FP-MODULE：广告误伤白名单提升为 AD_FALSE_POSITIVE_ALLOWLIST，injectRules() 顶部统一注入

## v5.4.14 (2026-05-20)

- FIX#CF-R2-P0：cloudflarestorage.com 前置到国外网站，避免 Sukka phishing 把 Cloudflare R2 存储域误导向广告拦截

## v5.4.13 (2026-05-19)

- FIX#STUN-REALIP：STUN/TURN NAT 探测改为真实 IP + 标准端口直连
- fake-ip-filter 补充 stun1-4.l.google.com / STUN/TURN 通配 / global.turn.twilio.com
- DST-PORT 补齐 5349 / 19302 / 19305 / 19307

## v5.4.12 (2026-05-12)

- FIX#RD-REALIP：RustDesk 域名加入 fake-ip-filter 真实 IP 回应，避免 rendezvous/relay 在 TUN/fake-ip 下打洞失败
- Loon FIX#LOON-REMOTE-RULE：288 条远程规则集 URL 恢复到 [Remote Rule] 段

## v5.4.11 (2026-05-12)

- FIX#RD-PROC：RustDesk 桌面进程统一命中会议协作（不再归入本地工具直连白名单）
- FIX#DNS-BOOTSTRAP：DNS 自举改为 IP-first，避免 TUN/fake-ip 下 DoH 域名无法解析导致死锁

## v5.4.9 (2026-05-11)

- FEAT#LOCAL-TOOLS：新增桌面本地工具 PROCESS-NAME -> DIRECT 白名单
- 覆盖 Oray/Sunlogin/AweSun/AnyDesk/ToDesk/RustDesk/TeamViewer/ZeroTier/Tailscale/frpc/frps/ngrok/natapp/cloudflared/Navicat
- 新增 docs/process-name-compatibility.md 与 tools/validate-process-name-direct.js

## v5.4.8 (2026-05-09)

- ORDER#RULE-TAIL：重排中后段业务规则匹配顺序（UI 代理组顺序不变）
- 国内流媒体从 TikTok 之前移至国内网站之前，避免 ByteDance 共用域被抢先命中

## v5.4.7 (2026-05-09)

- FEAT#TikTok：新增独立「🎵 TikTok」业务组（32 业务组），从社交媒体独立为专属 select 组
- FIX#HK：香港节点分类补全——REGION_DB kw 追加「港」，修复广港/深港等 IEPL/IPLC 跨境专线节点名匹配

## v5.4.6 (2026-05-08)

- FEAT#145：WeChat CDN cdn.weixin.qq.com 直连（全线 14 产物同步）

## v5.4.5 (2026-05-07)

- 全球节点置顶 + 全产品组顺序同步

## v5.4.3 (2026-05-06)

- 家宽节点识别新增 \bhome\b 关键词（部分节点名仅含 Home，原 home[-_ ]?(ip|broadband) 无法匹配）

## v5.4.2 (2026-05-05)

- FIX#41-P0：小米核心服务 DIRECT 白名单——修复 miuiprivacy/advertisingmitv 误杀认证安全域名（11 条规则前置广告拦截段）

## v5.4.1-normal.2 (2026-05-05)

- FIX#FlClash-Review-P0：修复标准 Mihomo JS 运行时分类桶初始化回归（HK/TW/CN/JP/KR/SG/US/EU/AM/AF/OTHER/ALL buckets）

## v5.4.0 (2026-05-05)

- FEAT#SG：新增「🇸🇬 狮城节点」+「🏡 狮城家宽」独立区域组
- 新加坡从亚太节点中拆分为独立区域（REGION_ORDER: GLOBAL/HK/TW/SG/JPKR/APAC/...）
- 区域组 18 -> 20（10 全部 + 10 家宽），总组 49 -> 51
- 同步：全部 12 个产物

## v5.3.2 (2026-04-28)

- 微信/QQ 全系列进程强制 DIRECT（Weixin.exe / WeChatAppEx.exe / QQ.exe / WeChat.exe）

## v5.3.1 (2026-04-28)

- Weixin.exe 进程强制 DIRECT（微信进程直连，不走代理）

## v5.3.0 (2026-04-26)

- ★ REFACTOR#2：流媒体分组架构重构——按区域 -> 按平台（7 -> 13 流媒体组）
- 拆出 5 个主流平台独立组：Netflix / Disney+ / HBO/Max / Hulu / Prime Video
- 拆出 2 个全球平台独立组：YouTube / 音乐流媒体
- 保留 4 个区域锁区组：香港/台湾/日韩/欧洲流媒体
- 删除美国流媒体 + 东南亚流媒体，新增「🌐 其他国外流媒体」兜底
- 流媒体组 7 -> 13，业务组 25 -> 31，总组 43 -> 49
- 全版本联动：全部 10 产物 + 11 子目录 README + 14 CHANGELOG

## v5.2.11 (2026-04-26)

- ★ REFACTOR#1：业务组合并精简 28 -> 25（降低用户认知负担）
- 合并搜索引擎+开发者服务 -> 工具与服务；邮件服务 -> 国外网站；云与CDN -> 国外网站
- 下载更新策略从 DIRECT 优先改为代理优先；BT/PT Tracker 保留独立
- 全版本联动

## v5.2.10 (2026-04-25)

- FIX#39：境外 DoH 端点（dns.google / cloudflare-dns.com）从云与CDN改路由到受限网站（防 CDN 组被设直连导致 DoH 失败）
- 同构联动全产物；v2rayN/Passwall/Passwall2 标记平台例外

## v5.2.9 (2026-04-25)

- 全量代码审查：修复 3 个 P0/P1 基线 bug + 跨产物同构修复
  - P0 FIX#30：PROCESS-NAME 规则硬编码常量引用失效
  - P1 FIX#31：APAC_OTHER iso 列表缺 IN/IND（印度节点归类失败）
  - P1 FIX#32：jsdelivr 规则注释与代码矛盾
  - iOS 同构 FIX#33~#36：SR/Surge/Loon/QX 裸子串 US/PL/SE 跨匹配 + nowtv typo + 日期
  - CMFA FIX#37：补齐 nameserver-policy
  - Passwall2 FIX#38：geosite:kakaotalk -> geosite:kakao

## v5.2.8 (2026-04-23)

- FIX#28-P0：CMFA/OpenClash 亚太节点 filter 补 HK/TW/JP/KR 子串（同构 bug 补齐）
- OpenClash Ruby GROUP_MAP 扩充 + 去掉分类循环 break

## v5.2.7 (2026-04-23)

- FIX#27-P1：消除 mihomo 加载 3 个 classical rule-provider 时的 parse warning
- 新建 mirrors/ 目录托管 CiciAi.list / UK.list / Grok.yaml 清洗副本（仅删问题行）
- 4 个 mihomo-family 产物 URL 切到本仓库 jsdelivr 镜像

## v5.2.6 (2026-04-22)

- FIX#24-P0：补齐 ISO alpha-3 国家代码（TWN/JPN/KOR/SGP），修复命名节点归类失败
- FIX#25-P0：统一空区域不建 Smart 组，消除 HK/全节点污染台湾/日韩组
- FIX#26-P0：cleanupSubscription 全量清空订阅原生 proxy-groups
- 同步修正：本 PR 同步修订 CLAUDE.md/AGENTS.md，新增同构 bug 全产物审计强制动作

## v5.2.5 (2026-04-20)

- FIX#23-P1：删除 acc-geositecn + acc-china 两个与 geosite:cn 纯重复的 rule-provider（省 ~5 MB 内存）

## v5.2.4 (2026-04-20)

- FIX#22-P0：snapchat rule-provider 拉取 403 修复（meta-rules-dat 上游文件名 snap.mrs 非 snapchat.mrs）

## v5.2.3 (2026-04-20)

- FIX#21-P1：替换 bm7 BBC/Snap 规则源为 MetaCubeX geosite provider，消除 USER-AGENT 解析警告
- 初版 Loon / Surge / Quantumult X / v2rayN / Passwall2 产物

## v5.2.2 (2026-04-13)

- FIX#20-P2：PI.ai（inflection.ai/pi.ai）从 AI 服务移至受限网站（GFW 封锁）
- 初版 Shadowrocket / FlClash 产物；初版 OpenClash Full 产物

## v5.2.1 (2026-04-01 ~ 04-09)

- FIX#17-P0：jsdelivr CDN 永久直连，RP_PROXY 从云与CDN改为受限网站（修复 DNS 循环依赖，单日 4931 条失败）
- FIX#18-P1：删除已死的 ckrvxr 规则源（持续 404）
- FIX#19-P1：DST-PORT,7680,REJECT 规则顺序修复（提前到 GEOIP,private 之前）
- FIX#20-P2：GSCService.exe 加入 TUN exclude-process

## v5.1.9 (2026-03)

- CLEAN#1-P1：清理防吞盾（FIX#14）产生的 ~16 条 dead rules
- CFG#1-P2：移除覆写中的 geo-update-interval 和 geosite CDN URL（由用户 UI 管理）

## v5.1.8 (2026-03)

- FIX#11-P0：dns.google 被 szkane-ai 宽规则吞入 AI 服务（前置 DOMAIN 拦截到 CLOUD_CDN）
- FIX#14-P0：Google 全系子服务被 szkane-ai 宽规则吞入 AI 服务（防吞盾：邮件/IM/会议/下载/搜索/流媒体）
- PERF#2-P0：fastly.jsdelivr.net EOF 风暴缓解（步长 10s -> 15s + 随机抖动 + CDN 混合策略）
- FIX#12-P1：GSCService.exe -> ip.cip.cc DNS 解析失败
- FIX#13-P2：acc-copilot 误匹配微软 Delivery Optimization 遥测域名
- PERF#4-P2：geosite.dat CDN 错开 + geo-update-interval 24h -> 72h

## v5.1.7 (2026-03)

- PERF#1-P1：3 个 domain-behavior provider 升级为 .mrs 二进制格式（anti-ad / loyalsoldier-gfw / loyalsoldier-greatfire）
- FIX#10-P0：hagezi-tif URL 双修（CDN + 文件名）

## v5.1.6 (2026-03)

- FEAT#2-P0：新增 Hagezi Threat Intelligence Feeds（威胁情报：malware/cryptojacking/C2/scam/spam）

## v5.1.5 (2026-03)

- REFACTOR#1-P1：删除「🇮🇩 印尼本地」独立代理组（29 -> 28 业务策略组）
- 印尼银行/电商/出行等域名分拆到金融支付/国外网站；GEOIP,ID -> 国外网站

## v5.1.4 (2026-03)

- FEAT#1-P1：新增「🚫 受限网站」GFW 代理组（4 源覆盖：Loyalsoldier gfw/greatfire + GEOSITE,gfw + szkane ProxyGFWlist）

## v5.1.3 (2026-03)

- FIX#7-P1：Zoho 宽域名收窄为 mail.zoho.* 精确子域名
- FIX#8-P2：Kwai 国际版从国内媒体移到东南亚流媒体（海外 APP 需代理）
- FIX#9-P2：ehgallery 从美国流媒体移到国外网站（非流媒体服务）

## v5.1.2 (2026-03)

- FIX#1-P0：Asia_China GeoRouting 从国外网站修正为国内网站（.cn 域名/中国 IP 段误走代理）
- FIX#2-P1：BilibiliHMT 从国内媒体修正为香港流媒体（港澳台 B 站需代理解锁）
- FIX#3-P1：补充 5 个孤儿 provider 规则引用
- FIX#4~#6：HomeIP US/JP 归属修正 + Aqara Global 归属修正 + 删除 3 个 DNS provider

## v5.1 (2026-02 ~ 2026-03)

- 集成 Ckrvxr AntiPCDN + SukkaW reject_phishing + szkane crypto-exchanges
- 集成 Accademia 全量 35 规则目录 + szkane 全量规则
- geox-url 切换 Loyalsoldier 加强版 MMDB（含 cloudflare/telegram/netflix IP 段）
- 新增 GEOIP 精准标签路由（geoip:cloudflare/telegram/netflix）
- 所有外部规则 URL 统一 fastly.jsdelivr.net CDN

## v5.0 (2026-01 ~ 2026-02)

- ★ rule-providers 从 72 扩展到 326（+254 个 blackmatrix7 规则集）
- 实现 100% blackmatrix7 服务覆盖（排除已删除/国内兜底/聚合/重复/停服/测试规则）
- 刷新步长从 25s 缩短到 10s（冷启动窗口约 54 分钟）
- 新增 13 个广告拦截/隐私保护 provider
- 新增 42 个国内流媒体 / 22 个美国流媒体 / 30 个国外网站 / 15 个下载更新 / 15 个云与CDN / 13 个苹果服务 / 13 个开发者 / 10 个社交媒体 / 10 个国外游戏 / 8 个会议协作 / 7 个区域流媒体 / 6 个搜索引擎 / 6 个即时通讯 provider

## v4.5.8 (2025-12)

- P0 修复：AWS 域名前置于 RULE-SET,amazon 之前；Google 下载域名前置于 RULE-SET,google 之前
- P0 修复：live.com 范围收窄（DOMAIN-SUFFIX -> DOMAIN,mail.live.com）
- P1 修复：naver.com 拆分为流媒体子域名；清理 ~10 条同区块内冗余死规则
- P2 修复：TLS 指纹改用确定性哈希；台湾节点 Emoji 修正

---

> 更早版本（v4.5.7 及之前）见 `Clash Party/CHANGELOG.md`。
