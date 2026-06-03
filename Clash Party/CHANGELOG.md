# Clash Party — 变更日志

> 本文件是 `Clash Party/ClashParty(mihomo-smart).js` 的完整变更日志。
> 本 JS 覆写脚本是仓库的**主线基线**，其它所有产物（CMFA YAML / OpenClash Normal+Smart / Shadowrocket / SingBox / Surge / Loon / Quantumult X / v2rayN）跟随本版本。
>
> 主版本号 `v5.3.X`；主版本变更必须同步传递到所有 9 份产物的子版本号。

---

## v5.4.25 / v5.4.25-normal.1 (2026-06-03)

- ★ 审查修复：GEOIP 重复规则去重（`GEOIP,netflix` / `GEOIP,google` 各出现 2 次 → 保留 GEOIP 标签路由集中区块，删除散落在业务区块的冗余；延续 v5.4.24 GEOIP,ID 清理）
- ★ 审查修复：Accademia GeoRouting 34 providers（Domain×17 + IP×17）interval 从 `nextInterval()`（~24h）提升到 7 天（604800s）——区域路由规则变化极慢，减少并发刷新频率

## v5.4.24 / v5.4.24-normal.1 (2026-06-03)

- ★ CLEAN：清除 21 条冗余规则 + 3 个未引用 rule-provider（深度审查验证，下载上游原始文件逐条对比）。
  - **删除 4 条 Binance DOMAIN-SUFFIX**：`binance.com` / `binance.cloud` / `binance.me` / `binancefuture.com`（Binance RULE-SET 已包含；保留 `binance.vision` / `binance.info` / `binance.org` 不在 RULE-SET 中）
  - **删除 3 个 Google 子 RULE-SET 引用**：`googlesearch` / `googledrive` / `googleearth`（Google 元集 `DOMAIN-SUFFIX,google.com` + `DOMAIN-KEYWORD,google` 已完全覆盖；同时删除对应 3 个 provider 声明）
  - **删除 3 条 ProtonMail DOMAIN-SUFFIX**：`protonmail.com` / `proton.me` / `pm.me`（ProtonMail RULE-SET 已包含；保留 `tutanota.com` / `tuta.com` 不在该 RULE-SET 中）
  - **删除 5 条音乐流媒体 DOMAIN-SUFFIX**：`soundcloud.com` / `sndcdn.com` / `pandora.com` / `deezer.com` / `tidal.com`（各自 RULE-SET 已包含）
  - **删除 2 条社交媒体 DOMAIN-SUFFIX**：`tumblr.com` / `clubhouse.com`（各自 RULE-SET 已包含）
  - **删除 2 条流媒体 DOMAIN-SUFFIX**：`vimeo.com` / `dailymotion.com`（各自 RULE-SET 已包含）
  - **删除 1 条 GEOIP 重复**：`GEOIP,ID,🌐 国外网站`（与国外网站区块内同名规则完全重复）
  - ✅ 验证确认 Apple 子 RULE-SET（appstore/appletv/siri 等 11 个）**非冗余**：Apple.yaml 元集仅含 IP-CIDR + PROCESS-NAME + DOMAIN-KEYWORD，零 DOMAIN-SUFFIX
  - ✅ 验证确认 Mail RULE-SET **非冗余**：仅含 IMAP/SMTP/POP 服务器主机名，不含消费者域名

## v5.4.23 / v5.4.23-normal.1 (2026-06-02)

- ★ FIX#161：知乎图片 CDN `zhimg.com` + 短链 `zhihu.co` 加入 🏠 国内网站 直连（此前 `pica.zhimg.com` 未被 geosite:cn / ChinaMax 覆盖，流量落入 FINAL 被代理导致知乎图片加载失败）。
  - Clash Party JS × 2（Smart + Normal）：`DOMAIN-SUFFIX,zhimg.com` + `DOMAIN-SUFFIX,zhihu.co` → `CN_SITE`
  - 同步全产物：CMFA / OpenClash×2 / SR / Surge / Loon / QX / FlClash / SingBox(重新生成) / v2rayN / Passwall / Passwall2

## v5.4.22 / v5.4.22-normal.1 (2026-05-31)

- ★ GeTui(个推)推送 SDK `getui.com` / `getui.net` / `gepush.com` 加直连白名单（review 后补；延续 #2 jpush/umeng——被通用广告/隐私表当 tracker 拦截但承载 App 推送如米家；owner 选放行保推送可达）。

借鉴 Proxy-override 批 C · #1 QUIC 精细化（spec：`docs/2026-05-30-proxy-override-借鉴设计.md`）：

- AND 规则白名单豁免：YouTube/Google/MS/Apple 的 QUIC 流量路由到对应业务组（依赖 sniffer QUIC 嗅探 SNI → GEOSITE/RULE-SET 匹配）
- 其余非中国 QUIC → REJECT，强制回退 HTTP/2（同 Proxy-override 原版语义）
- 首次补齐 CMFA + OpenClash×2 的 QUIC AND 规则（此前缺失，与主线不对称）
- SingBox generator 扩展 QUIC 转换（AND 复合规则 → 6 条首命中 route rule）
- iOS 四件套引擎限制：block-quic/disable-udp-ports 不支持 AND/NOT 白名单豁免，标注 N/A
- 配套新增 `config.sniffer`（QUIC/443 SNI 嗅探 + `force-dns-mapping`，对齐 CMFA/OpenClash 既有 sniffer）——使 QUIC 的 GEOSITE/RULE-SET 匹配对 fake-ip-filter 真 IP 域名（如 `mcdn.bilivideo.cn`）同样生效；此前 Smart/Normal/FlClash 缺 sniffer，真 IP QUIC 会被 `NOT,((GEOSITE,cn))` 误 REJECT（review 修复）
- 兜底判据由 `GEOIP,CN` 改为 `GEOSITE,cn`（**有意的语义变更**）：fake-ip 模式下 `GEOIP,CN` 对 198.18.x.x fake IP 判不出 CN，`GEOSITE,cn` 直接匹配映射域名更可靠
- QUIC 精细化默认开；如何关闭见 `Clash Party/README.md`

## v5.4.21 / v5.4.21-normal.1 (2026-05-31)

借鉴 Proxy-override 批 D · #4 DoH-over-IP bootstrap（spec：`docs/2026-05-30-proxy-override-借鉴设计.md`）：

- `default-nameserver` 从纯明文 IP 升级为 DoH-over-IP（`https://IP/dns-query`） + 1 个明文 IP 兜底 `223.5.5.5`
- 消除 bootstrap 阶段 DNS 泄漏；阿里×2（`223.5.5.5`/`223.6.6.6`） + Google（`8.8.8.8`） + Cloudflare（`1.1.1.1`）
- 溯源：mihomo 官方 wiki 明确 `default-nameserver` 支持加密 DNS（DoH/DoT/DoQ）；mihomo ≥ 1.18.x

## v5.4.20 / v5.4.20-normal.1 (2026-05-30)

借鉴 Proxy-override 批 B · #6 节点过滤关键词补充（spec：`docs/2026-05-30-proxy-override-借鉴设计.md`）：

- junk 节点过滤器 `isInfoNode` 新增关键词：中文子串 `免费` / `试用` / `应急`；英文（`\b` 词边界，防误伤 Signal 等）`Sign` / `Login` / `Register` / `Help` / `FAQ`
- 不加「更新」「地址」（误伤风险高，owner spec 排除）
- 回归测试：新增 `tools/test-info-node-filter.js`（6 mihomo 产物源码一致性）+ 扩展 `tools/validate-js-overwrites.js` fixture（3 JS 行为断言：8 个 junk 正例被过滤 + `Signal 香港 IEPL x1` 负例保留并分类 HK，验证 `\b` 词边界生效）
- 🔢 版本：v5.4.19 → v5.4.20

## v5.4.19 / v5.4.19-normal.1 (2026-05-30)

借鉴 Proxy-override 批 A（低风险三项；设计 spec：`docs/2026-05-30-proxy-override-借鉴设计.md`）：

- ✅ #2 国内 SDK/CDN 直连前置
  - jpush(极光推送) / `msg.umeng.com`(友盟) 加进 `AD_FALSE_POSITIVE_ALLOWLIST` 强制 DIRECT——此前被 `jiguangtuisong` / `youmengchuangxiang` 规则集当 tracker 拦截，导致 App 推送/消息功能受影响（参照 P0-FIX#41 小米先例；owner 已确认主动撤回此拦截）
  - 360 `baomitu.com` / BootCDN `bootcss.com` / 七牛 `staticfile.org` / 又拍云 `upaiyun.com` 前置到 🏠 国内网站段 `RULE-SET,cn` 之前（目标用 `🏠 国内网站` 组而非 hard DIRECT，对齐同段 163.com 写法）
  - 不加 `adjust.com` / `appsflyer.com`（海外归因 SDK，避免误判直连）
- ✅ #3 fake-ip-filter 补全（10 条，需真实 IP 才能打洞/直连，同 RustDesk v5.4.12 语义）
  - 远控：`+.todesk.com` `+.oray.com` `+.sunlogin.com` `+.teamviewer.com` `+.anydesk.com`
  - 游戏：`+.battlenet.com.cn` `+.wotgame.cn` `+.wggames.cn` `+.wowsgame.cn`
  - B站 P2P：`+.mcdn.bilivideo.cn`
- ✅ #5 `direct-nameserver-follow-policy: true`
  - 让 direct 出口域名解析也遵循 `nameserver-policy`（mihomo 默认 false 会忽略它）
  - 官方文档 use case 即本场景（direct 用国内 DoH + policy 指定境外 CDN 走境外 DoH）；本仓库 policy 仅含境外 CDN，零国内误伤
  - 不抬高最低内核门槛：与已使用的 `direct-nameserver` 同字段族（耦合添加，"仅当 direct-nameserver 不为空时生效"）
- 📋 全产物联动：#2 全 14 产物（各端语法）；#3 / #5 限 6 mihomo 家族（SingBox 无 fake-ip；Loon/QX/SR 非 mihomo）
- 🔢 版本：跳过烧毁的 v5.4.18（FlClash 曾误写后回退、SingBox 漏回退停在 .18），全产物统一对齐到 v5.4.19

## v5.4.17 / v5.4.17-normal.1 (2026-05-26)

- ✅ FIX#DNS-SPLIT-BOOTSTRAP：DNS 固定为 `default-nameserver` 纯 IP 自举，其它 resolver 全部 DoH
  - `nameserver` / `direct-nameserver` 固定为 AliDNS + DNSPod DoH
  - `proxy-server-nameserver` 固定为 Cloudflare + Google DoH，AliDNS + DNSPod DoH 兜底
  - `fallback` 固定为 Cloudflare + Google DoH，`fallback-filter.geosite` 固定 `gfw` + `geolocation-!cn`
  - `prefer-h3: false`、`respect-rules: true`、`cache-algorithm: arc` 写入主线和校验，优先保证 DNS 上游连接按规则走代理/直连

## v5.4.16 / v5.4.16-normal.2 (2026-05-22)

- ✅ FEAT#GAME-ACCEL：新增游戏加速器 `PROCESS-NAME -> DIRECT` 白名单
  - 新增 16 条进程名：UU加速器（UU.exe / NeteaseUU.exe / UUGameBooster.exe / UUService.exe / UURepair.exe / NeteaseUUBrowser.exe）、小黑加速器（XiaoHeiAccelerator.exe / xhjsq.exe）、迅游加速器（xunyou.exe / XunYouAcc.exe / XunYouUpdate.exe）、雷神加速器（LeigodAcc.exe / LeigodAccel.exe / leigodaccel.exe）、NNer加速器（NNer.exe / NNerClient.exe）
  - 理由：这些工具自身是网络加速隧道，走代理会导致双重代理 / 连接失败
  - Smart JS + Normal JS + CMFA YAML + OpenClash Normal + OpenClash Smart + Surge + SingBox Full + FlClash JS 全版本联动
  - Shadowrocket / Loon / Quantumult X（iOS 端）不支持 PROCESS-NAME，跳过
  - v2rayN / Passwall / Passwall2 无运行时进程分类，跳过

## v5.4.16 / v5.4.16-normal.1 (2026-05-20)

- ✅ FIX#149-P0：前置 `DOMAIN-SUFFIX,paddle.com,🏦 金融支付`，避免 `analytics.paddle.com` 被 anti-AD/DustinWin 误拦截
  - issue #149 中 Antigravity 登录 Google 回跳后报 `There was an unexpected issue setting up your account.`
  - 当前 anti-AD/DustinWin 源包含 `analytics.paddle.com`，因此必须放在广告/钓鱼/TIF 规则之前，而不是放在后段金融支付规则里
  - Smart / Normal 两份 JS 同步，保持 `AD_FALSE_POSITIVE_ALLOWLIST` 作为唯一前置白名单模块

## v5.4.15 / v5.4.15-normal.1 (2026-05-20)

- 🧾 DOC#GEOSITE-LEDGER：新增 docs/GEOSITE_COVERAGE_LEDGER.md，记录原生 GEOSITE/GEOIP、补充 rule-provider 与误伤白名单边界。
- ♻️ REFACTOR#AD-FP-MODULE：Smart / Normal 两份 JS 将广告误伤白名单提升为 AD_FALSE_POSITIVE_ALLOWLIST，并在 injectRules() 顶部统一注入。
- 🧪 VERIFY#ORDER：白名单仍位于 anti-ad / phishing / TIF / 隐私广告规则之前，规则总量保持 1053，rule-providers 保持 385。

## v5.4.14 / v5.4.14-normal.1 (2026-05-20)

- ✅ FIX#CF-R2-P0：`cloudflarestorage.com` 误命中 Sukka phishing 源时不再进入 `🛑 广告拦截`
  - 当前 Sukka `reject_phishing` domainset 含 `+.cloudflarestorage.com`；本仓库原有 `🌐 国外网站` 规则位于广告段之后，无法覆盖首匹配
  - 将 `DOMAIN-SUFFIX,cloudflarestorage.com,🌐 国外网站` 前置到所有广告/钓鱼/威胁情报规则之前，并移除后段重复条目
  - Cloudflare R2 官方文档确认 `*.r2.cloudflarestorage.com` 是 R2 S3 API / presigned URL 正常访问域

## v5.4.13 / v5.4.13-normal.1 (2026-05-19)

- ✅ FIX#STUN-REALIP：STUN/TURN NAT 探测改为真实 IP + 标准端口直连
  - `fake-ip-filter` 补充 `stun1-4.l.google.com`、三段 STUN/TURN 通配与 `global.turn.twilio.com`
  - `DST-PORT` 补齐 `5349 / 19302 / 19305 / 19307`，并保留 `3478 / 3479`
  - UDP/443 型 TURN 仍由 QUIC 屏蔽策略控制，避免放开 HTTP/3 全局阻断

## v5.4.12 / v5.4.12-normal.1 (2026-05-12)

- ✅ FIX#RD-REALIP：RustDesk 域名加入 `fake-ip-filter` 真实 IP 回应
  - `+.rustdesk.com` 继续按规则命中 `🧑‍💼 会议协作`，但 DNS 不再返回 198.18.x fake-ip
  - 避免 RustDesk rendezvous/relay 在 TUN/fake-ip 下拿到保留地址后打洞失败

## v5.4.11 / v5.4.11-normal.1 (2026-05-12)

- ✅ FIX#RD-PROC：RustDesk 不再归入本地工具直连白名单，桌面进程 `RustDesk.exe` / `rustdesk` 统一命中 `🧑‍💼 会议协作`
  - 修复 `rs-ny.rustdesk.com` 先因 Vultr AS20473 被 `copilot` 规则误吞、后又因本地工具白名单被强制 DIRECT 的双重误路由
  - `DOMAIN-SUFFIX,rustdesk.com` 保持在 `copilot` 规则前，避免 RustDesk relay/API 域名被 AI 规则抢先命中
- ✅ FIX#DNS-BOOTSTRAP：DNS 自举改为 IP-first，`nameserver` / `direct-nameserver` / `proxy-server-nameserver` 先用 `223.5.5.5` / `119.29.29.29`
  - 避免 TUN/fake-ip 场景下 DoH 域名本身无法解析，导致 `doh.pub` / `dns.alidns.com` 全部请求死锁

## v5.4.9 / v5.4.9-normal.1 (2026-05-11)

- ✅ FEAT#LOCAL-TOOLS：新增桌面本地工具 `PROCESS-NAME -> DIRECT` 白名单
  - 覆盖 Oray / Sunlogin / AweSun / AnyDesk / ToDesk / RustDesk / TeamViewer / ZeroTier / Tailscale / frpc / frps / ngrok / natapp / cloudflared / Navicat 等常见远控、DDNS、内网穿透与数据库客户端
  - 采用精确进程名，避免照搬 `.*vpn.*` / `.*vnc.*` 这类宽泛正则造成误直连
  - 新增 `docs/process-name-compatibility.md` 与 `tools/validate-process-name-direct.js` 作为兼容清单和测试集

## v5.4.8 (2026-05-09)

- ★ ORDER#RULE-TAIL：重排中后段业务规则匹配顺序（UI 代理组顺序不变）
  - 广告拦截保持前置，`MATCH/🐟 漏网之鱼` 保持最后
  - 尾段规则顺序：`🇪🇺 欧洲流媒体` → `🌐 其他国外流媒体` → `🔧 工具与服务` → `Ⓜ️ 微软服务` → `🍎 苹果服务` → `📥 下载更新` → `🛰️ BT/PT Tracker` → `🚫 受限网站` → `🎮 国外游戏` → `🌐 国外网站` → `🕹️ 国内游戏` → `📺 国内流媒体` → `🏠 国内网站` → `🐟 漏网之鱼`
  - `📺 国内流媒体` 从 TikTok 之前移至 `🏠 国内网站` 之前，避免 `snssdk.com`/`pstatp.com` 等 ByteDance 共用域被国内流媒体抢先命中
  - TikTok 保持在国内 ByteDance 规则之前

## v5.4.7 / v5.4.7-normal.1 (2026-05-09)

- ★ FEAT#TikTok：新增独立 `🎵 TikTok` 业务组（32 业务组），置于 `📺 国内流媒体` 与 `🎥 Netflix` 之间
  - TikTok 从 `📱 社交媒体` 独立为专属 select 组，使用标准全球代理链路
  - 客户端 TLS 指纹从 SOCIAL (firefox) 提升至 STREAM (chrome)
  - `RULE-SET,tiktok` 规则目标从 `📱 社交媒体` 改为 `🎵 TikTok`，前置于 Netflix 区块
- ★ FIX#HK：香港节点分类补全——`REGION_DB` kw 追加 `'港'`
  - 修复"广港"、"深港"等 IEPL/IPLC 跨境专线节点名无法匹配 HK 分类的问题
  - JS `indexOf` 子串匹配一次性覆盖：广港/深港/沪港/京港/中港/穗港等所有 X港 变体
  - 全线产物同步（CMFA/OpenClash Ruby regex 加 `|港`；SR/Surge/Loon/QX 字面量罗列加 `|广港`）

## v5.4.6 / v5.4.6-normal.1 (2026-05-08)

- ★ FEAT#145：WeChat CDN `cdn.weixin.qq.com` 直连
  - 新增 `DOMAIN-SUFFIX,cdn.weixin.qq.com,DIRECT` 规则，所有微信 CDN 流量直连
  - 全线 14 产物同步

## v5.4.5 / v5.4.5-normal.1 (2026-05-07)

- ★ FIX#142-P0：修复 v5.4.1+ 引入的 DNS 空壳 bug——`overwriteGeneral` 创建 `config.dns` 时未提供 `nameserver`
  - 当订阅无 DNS 配置时，`if (!config.dns) config.dns = {}` 创建空 DNS 对象
  - mihomo 内核检测到 `dns` 对象存在即跳过默认 DNS，因无 nameserver 导致所有 DIRECT 连接 DNS 解析失败 → 超时
  - 修复：创建 `config.dns` 后增加 `enhanced-mode` + `nameserver` 兜底（`223.5.5.5`, `119.29.29.29`）
  - Smart JS + Normal JS 同步修复；静态配置产物（CMFA/OpenClash/SR/Surge/Loon/QX/SingBox）无运行时 DNS 创建逻辑，豁免
- ★ FIX#144：bbys.app 视频播放走直连——新增 `DOMAIN-SUFFIX,bbys.app,DIRECT` 规则
  - 该域名未被现有 rule-provider 覆盖，视频 CDN 子域可能解析到非 CN IP 走代理导致黑屏
  - Smart JS + Normal JS 同步添加；全产物同步（见各产物 CHANGELOG）
- ★ FEAT#143：IEPL/IPLC 专线节点纳入家宽组——`RESIDENTIAL_PATTERNS` 新增 `\biplc\b`, `\biepl\b`, `专线`
  - 专线（IEPL/IPLC）与家宽同为高质量非共享连接，纳入后 Smart 算法可选择专线节点
  - Smart JS + Normal JS + FlClash JS 同步修改

## v5.4.3 / v5.4.3-normal.1 (2026-05-06)

- ★ FEAT：家宽节点识别新增 `\bhome\b` 关键词——部分节点名仅含 Home（如 `HK-Home-01`），原 `home[-_ ]?(ip|broadband)` 无法匹配独立的 Home
  - `RESIDENTIAL_PATTERNS` 数组追加 `/\bhome\b/i`（JS word-boundary 匹配，防止误伤 `homepage` / `homebase` 等）
  - Smart JS + Normal JS 同步修改

## v5.4.2 / v5.4.2-normal.1 (2026-05-05)

- ★ FIX#41-P0：小米核心服务 DIRECT 白名单——修复 miuiprivacy/advertisingmitv 误杀认证安全域名
  - `auth.be.sec.miui.com`（安全认证后端）/ `idm.api.io.mi.com`（身份管理 API）在 miuiprivacy 中被 REJECT
  - 导致小米账号登录安全握手失败 → 客户端显示"网络错误"，云备份连带不可用
  - 新增 11 条 DOMAIN/DOMAIN-SUFFIX DIRECT 白名单规则，前置所有广告拦截规则段
  - Smart JS + Normal JS 同步修改；本次修复传递到全部 10 个受影响产物

## v5.4.1-normal.2 (2026-05-05)

- ★ FIX#FlClash-Review-P0：修复标准 Mihomo JS 运行时分类桶初始化回归
  - `ClashParty(mihomo).js` 补回 `HK/TW/CN/JP/KR/SG/US/EU/AM/AF/OTHER/ALL` buckets，避免 `result.ALL.push(...)` 在有节点输入时 TypeError
  - 补齐 `REGION_HOME_MAP` 的 `SG` / `OTHER` 家宽映射，并移除东南亚候选链里的重复 `SG`
  - 同构审计：Smart 主线分类桶正常；FlClash 同步修复；CMFA/OpenClash/iOS/Passwall/sing-box/v2rayN 无此 JS 初始化回归

## v5.4.0 (2026-05-05)

- ★ FEAT#SG：新增 🇸🇬 狮城节点 + 🏡 狮城家宽 独立区域组
  - 新加坡从 🌏 亚太节点 中拆分为独立区域（REGION_ORDER: GLOBAL/HK/TW/SG/JPKR/APAC/...）
  - 区域组总数：18 → 20（10 全部 + 10 家宽），总组数：49 → 51
  - 加密货币组自动包含狮城节点（低延迟 SG 优先）
  - 东南亚流媒体优先路由至狮城节点（buildSeaProxies: SG 优先）
  - BT/PT Tracker 链路加入 SG 节点
  - 同步产物：全部 12 个产物（Passwall/Passwall2/v2rayN 豁免）

## v5.3.2 (2026-04-28)

- ★ **微信/QQ 全系列进程强制 DIRECT**：Weixin.exe / WeChatAppEx.exe / QQ.exe / WeChat.exe → DIRECT
  - 四款 IM 进程全部移入 DIRECT 前置块，不再走代理组
  - 新增 `PROCESS-NAME,WeChatAppEx.exe,DIRECT`（微信桌面版辅助进程）
- 同步产物：Clash Party Normal / SingBox Full（CMFA / OpenClash 豁免）

## v5.3.1 (2026-04-28)

- ★ **Weixin.exe 进程强制 DIRECT**：微信进程直连，不走代理
  - `PROCESS-NAME,Weixin.exe,🏠 国内网站` → `PROCESS-NAME,Weixin.exe,DIRECT`
  - Weixin.exe 从 DIRECT-block 前置匹配，QQ.exe / WeChat.exe 保持 `🏠 国内网站` 不变
  - 同步产物：Clash Party Normal / SingBox Full（CMFA / OpenClash 无 PROCESS-NAME 语义，豁免）

## v5.3.0 (2026-04-26)

- ★ **REFACTOR#2**：流媒体分组架构重构——按区域 → 按平台（解决跨区低价订阅的解锁碎片化问题）
  - **拆出 5 个主流平台独立组**（跨区订阅刚需，用户可为不同平台选不同区域节点）：
    - `🎥 Netflix` — select, standardProxies（从原 🇺🇸美国流媒体 拆出）
    - `🎬 Disney+` — select, standardProxies（同上；土耳其/印度低价区极度普遍）
    - `📡 HBO/Max` — select, standardProxies（同上）
    - `📺 Hulu` — select, standardProxies（同上；含 Hulu JP `hulu.jp`/`happyon.jp` 从 🇯🇵日韩流媒体 移入）
    - `🎬 Prime Video` — select, standardProxies（同上）
  - **拆出 2 个全球平台独立组**（无需区域 IP，可走最快节点）：
    - `📹 YouTube` — select, standardProxies（从原 🇺🇸美国流媒体 拆出；全球可用，无需区域锁）
    - `🎵 音乐流媒体` — select, standardProxies（Spotify/Apple Music/Tidal/Deezer/SoundCloud/Pandora/Qobuz/Overcast；从 🇺🇸美国流媒体 + 🇪🇺欧洲流媒体 汇聚）
  - **保留 4 个区域锁区组**（这些平台永锁特定区域 IP，不存在跨区账号场景）：
    - `🇭🇰 香港流媒体` / `🇹🇼 台湾流媒体` / `🇯🇵 日韩流媒体` / `🇪🇺 欧洲流媒体`
  - **删去 `🇺🇸 美国流媒体`**（拆分为上述平台组+兜底组）、**删去 `📺 东南亚流媒体`**（并入兜底组）
  - **新增 `🌐 其他国外流媒体`** 兜底（接收 Paramount+/Peacock/Twitch/Crunchyroll/Vimeo/Dailymotion/Pluto 等 ~30 平台 + 原 SEA 全部平台）
  - 流媒体组 7→13，业务组 25→31，总组 43→49（SingBox：50）
  - 所有组均为 `select`，候选列表只含 Smart 区域组（+ DIRECT），不直接放节点
- ★ **全版本联动**：§1 强制同步全部 10 产物 + 11 子目录 README + 14 CHANGELOG

## v5.2.11 (2026-04-26)

- ★ **REFACTOR#1**：业务组合并精简 28→25（降低用户认知负担）
  - 合并 `🔍 搜索引擎` + `📟 开发者服务` → 新增 `🔧 工具与服务`（standardProxies）
  - 合并 `📧 邮件服务` → `🌐 国外网站`（standardProxies，无特殊延迟需求）
  - 合并 `☁️ 云与CDN` → `🌐 国外网站`（CDN anycast 虽有其特殊性，但低流量独立组维护成本过高）
  - `📥 下载更新` 策略从 directFirst 改为 standardProxies（proxy 优先），大流量下载走代理更合理
  - `🛰️ BT/PT Tracker` 保留独立（MetaCubeX 有独立 tracker 分类，用户需对其 REJECT→DIRECT→PROXY 三层策略可单独操控）
  - 业务组 28→25，总组 46→43（含 18 区域组）
- ★ **全版本联动**：§1 强制同步 Clash Party Normal JS / CMFA YAML / OpenClash Normal+Smart / Shadowrocket / SingBox / Surge / Loon / Quantumult X / v2rayN / Passwall / Passwall2

## v5.2.10 (2026-04-25)

- ★ **FIX#39**：境外 DoH 端点改路由到 `🚫 受限网站`（防 `☁️ 云与CDN` 被设直连导致 DoH 失败）
  - `DOMAIN,dns.google` / `DOMAIN,dns.google.com`：`${BIZ.CLOUD_CDN}` → `${BIZ.GFW}`（line ~1197-1198）
  - `DOMAIN-SUFFIX,cloudflare-dns.com`：`${BIZ.CLOUD_CDN}` → `${BIZ.GFW}`（line ~1988）
  - 动机：dns.google / cloudflare-dns.com 两个 DoH 端点在境内被 GFW 阻断，
    语义上属于"受限网站"而非"CDN"。原放在 `☁️ 云与CDN` 是历史遗留；
    若用户把 `☁️ 云与CDN` 误设为 `DIRECT`（部分玩家会这么干以减少 CDN 走代理浪费流量），
    DoH 即刻失败 → 系统级 DNS fallback → 解析劣化甚至污染。
    放在 `🚫 受限网站` 后即使 CDN 组被设直连，DoH 仍走代理，行为更稳健。
  - 国内 DNS 提供商（DNSPod `doh.pub` / 阿里 `alidns.com`）保留原配置，
    本身不被封，无需改动。
- ★ **同构联动**：Clash Party Normal JS（同目录 `ClashParty(mihomo).js`，§1.5 同源运行时）/
  CMFA YAML / OpenClash Normal+Smart / Shadowrocket / SingBox / Surge / Loon / Quantumult X 同步迁移
  - SingBox 通过 `node SingBox/SingBox(sing-box)-generator.js` 重新生成（自动继承 JS 基线）
  - v2rayN：Xray 路由只有 proxy/direct/block 三出站，dns.google / cloudflare-dns.com
    在两种分组下都是 `proxy`，无 rule diff，仅 `_meta` 版本号 bump
  - Passwall / Passwall2：原本就没有 `cloudflare-dns.com` / `dns.google` 的特化条目
    （由更上层的 `geosite:cloudflare` / `geosite:google` 在 23-cloud-cdn / 18-search 列表里覆盖）。
    要把单域名拆出来归到 26-gfw.list 必须重排整张列表的优先级（早于 18 / 23 命中），
    超出本次最小修复的范围；按 §1.4 标记为平台例外，不修改 shunt-rules，仅 bump 版本号。
- Bump: `v5.2.9` → `v5.2.10`，所有产物主版本同步追平到 `v5.2.10`

## v5.2.9 (2026-04-25)

- ★ **全量代码审查**：修复 3 个 P0/P1 基线 bug + 跨产物同构修复
  - **P0 FIX#30**：`PROCESS-NAME` 规则 QQ.exe/Weixin.exe/WeChat.exe 硬编码 `'🏠 国内网站'` → `${BIZ.CN_SITE}`（失效常量引用，若 CN_SITE 改名则死组）
  - **P1 FIX#31**：APAC_OTHER `iso` 列表缺 `IN`/`IND` alpha-2/alpha-3（印度节点 `IN 01` 被归为 UNCLASSIFIED）
  - **P1 FIX#32**：jsdelivr 规则注释写"走直连"但代码路由到 `${BIZ.GFW}`（注释 ↔ 代码矛盾）
  - **iOS 同构 FIX#33**（SR/Surge/Loon/QX）：`policy-regex-filter` 裸子串 `US`/`PL`/`SE` 跨匹配
    - `US` → 命中 `AUS`（澳大利亚节点误入美国组）
    - `PL` → 命中 `IPLC`（IPLC 专线节点误入欧洲组）
    - `SE` → 命中 `SEOUL`（首尔节点误入欧洲组）
    - 修复方式：`|US|` → `|\bUS\b|`、`|PL|` → `|\bPL\b|`、`|SE|` → `|\bSE\b|`
  - **iOS 同构 FIX#34**：非洲 filter 中 `AF` = 阿富汗 ISO 代码（不含南非等非洲国家），已移除
  - **iOS 同构 FIX#35**：`nowtv.com.uk` typo → `nowtv.co.uk`
  - **iOS 同构 FIX#36**：SR/Surge/Loon footer 日期 2026-04-16 → 2026-04-25
  - **CMFA FIX#37**：缺 `nameserver-policy`（jsdelivr/github 强制走 Cloudflare/Google DNS），已补齐
  - **Passwall2 FIX#38**：`geosite:kakaotalk` → `geosite:kakao` + 显式 domain fallback（v2fly geosite.dat 无 kakaotalk 分类）
  - **Passwall2**: 版本 v5.2.6-pw2.2 → v5.2.9-pw2.1（基线追赶 + kakaotalk 修复）

## v5.2.8 (2026-04-23)

- ★ **FIX#28-P0**：CMFA / OpenClash 亚太节点 filter 补 HK/TW/JP/KR 子串（同构 bug 补齐）
  - 本 JS 主线已有正确覆盖（`apacNodes = c.HK.concat(c.TW, c.CN, c.JP, c.KR, c.SG, c.APAC_OTHER)`），无需改动
  - CMFA YAML（`v5.2.8-cmfa.3`）：🌏 亚太节点 filter 补 `香港|HKG|台湾|TWN|日本|JPN|韩国|KOR` 等关键词
  - OpenClash Normal / Full（`v5.2.8-oc-normal.3` / `v5.2.8-oc-full.3`）：Ruby `GROUP_MAP["APAC"]` 扩充 + 去掉分类循环 `break`
  - ⛔ Shadowrocket / Surge / Loon / QX：`policy-regex-filter` / `server-tag-regex` 已有正确覆盖，无需改动
  - ⛔ SingBox / v2rayN：无运行时节点分类（N/A）
- 版本号 `v5.2.7` → `v5.2.8`（为 CMFA / OpenClash 同构修复提供基线标识）

## v5.2.7 (2026-04-23)

- ★ **FIX#27-P1**：消除 mihomo 加载 3 个 classical rule-provider 时的 parse warning
  - 现象（用户报告）：mihomo 启动 / reload 日志反复打印
    - `parse classical rule [USER-AGENT,TikTok*] error: unsupported rule type: USER-AGENT`
    - `parse classical rule [USER-AGENT,BBCiPlayer*] error: unsupported rule type: USER-AGENT`
    - `parse classical rule [IP-CIDR , 17.253.4.125] error: payloadRule error`
  - 根因定位：
    - `szkane-ciciai` → upstream `szkane/ClashRuleSet/Clash/Ruleset/CiciAi.list` 第 52 行 `USER-AGENT,TikTok*`（mihomo `classical` provider 不识别 USER-AGENT，是 Surge/iOS 遗留语法）
    - `szkane-uk` → upstream `szkane/ClashRuleSet/Clash/Ruleset/UK.list` 第 5 行 `USER-AGENT,BBCiPlayer*`（同上）
    - `acc-grok` → upstream `Accademia/Additional_Rule_For_Clash/Grok/Grok.yaml` 第 9 行 `IP-CIDR         , 17.253.4.125`（多余空格 + 缺 CIDR 掩码 → mihomo 解析失败）
  - 修复方案：在仓库根目录新增 `mirrors/` 子目录托管这 3 份**仅删去问题行**的清洗副本，把 4 个 mihomo-family 产物的 URL 切到本仓库的 jsdelivr 镜像
    - `mirrors/CiciAi.list`：去除 `USER-AGENT,TikTok*`（TikTok 域名已由 `metaDomain('tiktok','tiktok')` 提供 100% 覆盖）
    - `mirrors/UK.list`：去除 `USER-AGENT,BBCiPlayer*`（BBC 域名已由 `metaDomain('bbc','bbc')` 提供 100% 覆盖）
    - `mirrors/Grok.yaml`：去除 `IP-CIDR , 17.253.4.125`（该 IP 是 Apple `time.apple.com` 的 anycast 地址，与 Grok 路由无关）+ 规整 DOMAIN-SUFFIX 周围多余空格
  - 同步范围（FIX#27 同构审计）：
    - ✅ **Clash Party Smart JS**（本文件）：3 个 provider URL 切镜像，bump 到 `v5.2.7`
    - ✅ **Clash Party Normal JS**（`ClashParty(mihomo).js`）：3 个 provider URL 切镜像，bump 到 `v5.2.7-normal.1`
    - ✅ **CMFA YAML**（`Clash Meta For Android/CMFA(mihomo).yaml`）：3 个 provider URL 切镜像，bump 到 `v5.2.7-cmfa.1`
    - ✅ **OpenClash Smart sh**（heredoc YAML）：3 个 provider URL 切镜像，bump 到 `v5.2.7-oc-full.1`
    - ✅ **OpenClash Normal sh**（heredoc YAML）：3 个 provider URL 切镜像，bump 到 `v5.2.7-oc-normal.1`
    - ⛔ **Shadowrocket / Surge / Loon / Quantumult X**：iOS 系产物的 RULE-SET 解析器**原生支持** `USER-AGENT`（Surge / Shadowrocket / Loon / QX 都把这条规则当一等公民），同样能容忍 `IP-CIDR  , 1.2.3.4` 这种空格变体；仍可继续直接拉 szkane / Accademia 的上游 URL，无须切镜像 —— 但若上游 yaml 里有 `IP-CIDR ,` 缺 mask（mihomo 报错的本因），iOS 端会把它解析成 `1.2.3.4/32`，行为等价。审计通过、不动。
    - ⛔ **SingBox Full**：使用 sing-box 自身的 `route.rule_set`（binary `.srs` / source JSON），与 Clash classical 完全无关，零影响
    - ⛔ **v2rayN Xray routing**：纯 Xray `routing.rules` 结构，不消费 Clash classical provider，零影响
  - 兼容性：jsdelivr 对本仓库的拉取首次冷缓存 ~5 min；之后命中边缘缓存。镜像内容仅去掉问题行，剩余规则和 upstream 字节级一致。

## v5.2.6 (2026-04-22)

- ★ **FIX#24-P0**：补齐 ISO alpha-3 国家代码，修复 `TWN/JPN/KOR/SGP` 命名节点归类失败
  - 现象：机场节点命名为 `TWN 01 AnyRoute IEPL x2.5` / `JPN 01 ...` / `KOR 01 ...` / `SGP 01 ...` 时，
    `REGION_DB` 只有 alpha-2 (`TW`/`JP`/`KR`/`SG`) 与 IATA (`tpe`/`nrt`/`icn`/`sin`)，
    word-boundary 正则无法把 `TW` 匹配到 `TWN`（后面是字母 `N`），这些节点全部归为 `UNCLASSIFIED`
  - 修复：在 `REGION_DB` 的 `kw` 列表补加小写 alpha-3 ——
    TW: `twn` / JP: `jpn` / KR: `kor` / SG: `sgp` / US: 已有 `usa` / CN: 新增 `chn`
  - 同步修正：原 alpha-3 `HKG` 已在 HK 列表，验证无误
  - 影响：此前该类机场的台湾/日韩组会因全部 UNCLASSIFIED + fallback 到 `apacNodes` / `c.ALL` 而掺入 HK 等节点（见 FIX#25）

- ★ **FIX#25-P0**：统一空区域不建 Smart 组，消除 HK/全节点污染 🇹🇼 / 🇯🇵 组
  - 现象（issue 截图）：🇹🇼 台湾节点 与 🇯🇵 日韩节点 Smart 组里出现 `HKG 01~04` + `SGP 01` + `KOR 01` 等一共 11 个节点（等于 `c.ALL`），
    原因是原 fallback `c.TW.length > 0 ? c.TW : apacNodes.length > 0 ? apacNodes : c.ALL` 在 TW/JP/KR 区域为空时
    silently 把 `apacNodes`（含 HK）或 `c.ALL` 塞进去
  - 修复：HK / TW / JPKR / APAC / US 五个组统一改为**空区域不建组**（原 EU / AMERICAS / AFRICA 已是该策略）
    - `SMART.GLOBAL = c.ALL` 始终存在作为兜底
    - `STANDARD_PROXIES` 的 `filterProxies` 会自动从 28 业务组里剔除未创建的 Smart 组引用，不会产生 dangling reference
  - 配合 FIX#24：原仅有 HKG+TWN+JPN+KOR+SGP 的机场，修复前看到 🇹🇼=11 / 🇯🇵=11，修复后 🇹🇼=1 / 🇯🇵=3，符合预期

- ★ **FIX#26-P0**：`cleanupSubscription` 全量清空订阅原生 proxy-groups
  - 现象（issue 原文）：用户订阅覆写后代理组高达 60 个（本脚本期望 37 个）
  - 原逻辑仅按 4 关键词黑名单（`负载均衡` / `自动选择` / `手动选择` / `节点选择`）删除，
    机场若提供地区组（🇭🇰 香港 / 🇹🇼 台湾 / …）或流媒体组（📺 Netflix / 🎮 游戏 / …）会保留，和本脚本注入的 37 组共存
  - 修复：直接 `config['proxy-groups'] = []`
    - 安全前提：本脚本 28 业务组的 `proxies` 引用仅含 `SMART.*` + `DIRECT` + `REJECT`；Smart 组仅引用 `config.proxies` 里的节点名；
      均不依赖任何订阅原生组，清空后由脚本重新注入 37 组即为权威来源
  - 兼容性：`config.proxies`（节点本体）不动，Smart 组按节点名重新聚合

- 同步范围（v5.2.6 追加审计，修订先前评估）：
  - ✅ **Clash Party Smart JS**（本文件）：完整 3 bug 修复
  - ✅ **Clash Party Normal JS**（`ClashParty(mihomo).js`）：**共用同一份 REGION_DB / cleanupSubscription / fallback 链 —— 3 bug 100% 同构**，同步修复为 `v5.2.6-normal.1`
  - ✅ **CMFA YAML**：mihomo `filter:` 正则子串匹配缺 `TWN/JPN/KOR/SGP/🇸🇬`（TW/JP/KR 列表里只有 `Taiwan/Japan/Korea/Tokyo/Osaka/NRT/KIX/ICN/TPE` 等，无 alpha-3）—— 同步修复为 `v5.2.6`
  - ✅ **OpenClash normal / full**（Ruby REGIONS 哈希）：`/TW/i`、`/JP/i`、`/SG/i` 通过**子串匹配**能命中 `TWN/JPN/SGP`（与 JS 的 word-boundary 正则行为不同），但 `/KR/` 因字母序无法命中 `KOR` —— 两脚本各补一个 `KOR` 字面量，同步修复为 `v5.2.6-oc-{normal,full}.1`
  - ⛔ **Shadowrocket / Surge / Loon / Quantumult X**：`policy-regex-filter` / `server-tag-regex` / `NameRegex` 原文已显式包含 `TWN|JPN|KOR|TPE|NRT|ICN` 等 alpha-3，审计后无需改动（版本号暂保持 v5.2.5-*，见子目录 README 说明）
  - ⛔ **SingBox Full**：静态 outbound 列表（用户按 tag 字面量接入节点），无运行时分类器，不存在此类 bug
  - ⛔ **v2rayN Xray routing**：纯路由规则（domain/geo → outbound tag），不做节点分类，不存在此类 bug
- 审计契约补丁：本 PR 同步修订 `CLAUDE.md` / `AGENTS.md` §1.1，新增「同构 bug 全产物审计」强制动作，防止再次出现"同一 bug 只修一份产物"的漏补

## v5.2.5 (2026-04-20)

- ★ **FIX#23-P1**：去冗余（方案 B 保守优化）——删除与 `metaDomain('cn', 'cn')` 重叠的 Accademia 国内规则源
  - 删除 `acc-geositecn`（`GeositeCN/GeositeCN.yaml`）——与 geosite:cn 字节级重复
  - 删除 `acc-china`（`China/China.yaml`）——与 geosite:cn + acc-chinamax 大面积重叠
  - 保留 `acc-chinamax`（独立的 ChinaMax 列表，有独特域名覆盖）+ `metaDomain('cn', 'cn')` + `metaIpCidr('cn-ip', 'cn')`
  - 收益：减 2 个 rule-provider（373 → 371），省 ~5 MB 内存 + 2 次冷启动 HTTP 拉取
  - 精度损失：0（acc-geositecn 完全重复；acc-china 的独特域名少到可忽略）
  - 同步到 9 产物：Clash Party JS / CMFA / OC Normal / OC Smart / SingBox full（重新生成）；Shadowrocket / Surge / Loon / QX / v2rayN 不涉及（不使用 Accademia 命名空间）

## v5.2.4 (2026-04-20)

- ★ **FIX#22-P0**：`snapchat` rule-provider 拉取 403 Forbidden
  - v5.2.3 的 `metaDomain('snapchat', 'snapchat')` 指向 `geosite/snapchat.mrs`
  - MetaCubeX meta-rules-dat 上游实际文件名是 `snap.mrs` 不是 `snapchat.mrs`
  - 改为 `metaDomain('snapchat', 'snap')`：ID 保持 `snapchat`（规则引用不变）、URL 指向 `snap.mrs`
  - 已核对：`https://fastly.jsdelivr.net/gh/MetaCubeX/meta-rules-dat@meta/geo/geosite/snap.mrs` → HTTP 200

## v5.2.3 (2026-04-20)

- ★ **FIX#21-P1**：替换 bm7 BBC/Snap 规则源，消除 USER-AGENT 解析警告
  - bm7 BBC.yaml 含 `USER-AGENT,BBCiPlayer*`；bm7 Snap.yaml 含 `USER-AGENT,TikTok*`
  - Clash Party / mihomo 不支持 USER-AGENT 规则类型，reload 时产生 warning
  - 改为 Meta geosite provider：`metaDomain('bbc')` + `metaDomain('snapchat')`，保持规则覆盖并兼容解析
  - 注：v5.2.3 的 `metaDomain('snapchat','snapchat')` 有 filename typo，由 v5.2.4 FIX#22-P0 修正

## v5.2.2 (2026-04-13)

- ★ **FIX#20-P2**：PI.ai（`inflection.ai` / `pi.ai`）从 🤖 AI 服务 移至 🚫 受限网站（GFW）
  - PI.ai 在中国被 GFW 封锁，应归入受限网站组统一管理
  - 在中国：GFW 组选代理节点翻墙；在印尼：GFW 组选 DIRECT 直连
  - 无第三方 rule-provider 可用（bm7 / v2fly / MetaCubeX 均无独立规则），DOMAIN-SUFFIX 覆盖足够

## v5.2.1 (基于 04-01 ~ 04-09 日志分析，5 项修复)

- ★ **FIX#17-P0**：jsdelivr CDN 永久直连，消除 rule-provider 刷新 DNS 循环依赖
  - `RP_PROXY` 从 `BIZ.CLOUD_CDN` 改为 `BIZ.GFW`（受限网站组，中国代理 / 印尼直连）
  - `DOMAIN-SUFFIX,jsdelivr.net` 从 ☁️ 云与CDN 改为 🚫 受限网站（同组统一管理）
  - 修复前：04-06 单日 4,931 条 jsdelivr 失败（DNS resolve failed + i/o timeout）
  - 在印尼选 DIRECT 直连，在中国选代理节点绕墙，灵活切换

- ★ **FIX#18-P1**：删除已死的 ckrvxr 规则源（持续 404 Not Found）
  - 移除 `ckrvxr-antipcdn`（AntiPCDN）和 `ckrvxr-antifraud`（AntiAntiFraud）
  - provider 定义 + rules 数组引用同步清理，修复前累计 221 次 404 错误

- ★ **FIX#19-P1**：`DST-PORT,7680,REJECT` 规则顺序修复
  - 原位置在 `GEOIP,private,DIRECT` 之后，私有 IP（10.x.x.x）先匹配走 DIRECT
  - 修复：提前到 `GEOIP,private` 之前，确保 Delivery Optimization 流量被 REJECT

- ★ **FIX#20-P2**：`GSCService.exe` 加入 TUN `exclude-process`
  - fake-ip 模式下 `ip.cip.cc` 被分配假 IP，DIRECT 回连时 DNS 解析失败
  - 修复：排除 TUN 拦截，GSCService 直接走系统网络栈

---

## v5.1.9 及之前版本

v5.1.9 变更摘要（1项清理 + 1项配置调整）：
- ★ CLEAN#1-P1：清理防吞盾（FIX#14）产生的 ~16 条 dead rules
  - 防吞盾区块已将 Google 子服务规则提升至 szkane-ai 之前
  - 原位置的重复规则永远不会被匹配（first-match-wins），仅消耗 CPU 周期
  - 已删除：gmail.com×2 / googlemail.com×2 / mail.google.com×2 / inbox.google.com×2
    googlesearch×1 / googledrive×1 / googleearth×1 / google×1 / google-ip×1
    googlevoice×1 / meet.google.com×1 / meet.googleapis.com×1
    dl.google.com×1 / play.googleapis.com×1 / android.clients.google.com×1 / googlefcm×1
  - 原位置保留注释标记「已提升至防吞盾」
- ★ CFG#1-P2：移除覆写中的 geo-update-interval 和 geosite CDN URL
  - 这两项由用户在 Clash Party UI 中手动管理，覆写不再覆盖
  - geo-update-interval：移除（由 UI 控制，默认值取决于订阅/UI 设置）
  - geosite CDN URL：移除（由 UI 控制 fastly/cdn 切换策略）
  - geoip/mmdb/asn URL 保留不变（Loyalsoldier 加强版 MMDB 是脚本核心依赖）

v5.1.8 变更摘要（4项修复 + 2项性能优化 + 1项标注）：
- ★ FIX#11-P0：dns.google 被 szkane-ai 宽规则吞入「AI 服务」
  - dns.google / dns.google.com 是 Google Public DNS DoH 入口，非 AI 服务
  - 日志特征：[TCP] dial 🤖 AI 服务 (match RuleSet/szkane-ai) mihomo --> dns.google:443
  - 修复：在 AI 规则区块之前前置 DOMAIN 精准拦截到 CLOUD_CDN
- ★ FIX#14-P0：Google 全系子服务被 szkane-ai 宽规则吞入「AI 服务」（防吞盾）
  - szkane AiDomain.list 含 Google 宽域名（因 Gemini AI），导致 Google 全系子服务误走 AI 代理
  - 受影响服务：Google 搜索 / Gmail / Google Meet / Google Drive / YouTube / Google FCM / Google Voice 等
  - 修复：在 RULE-SET,szkane-ai 之前插入「Google 子服务防吞盾」
    - 邮件：gmail.com/googlemail.com/mail.google.com → EMAIL
    - 即时通讯：RULE-SET,googlevoice → IM
    - 会议协作：meet.google.com/meet.googleapis.com → WORK
    - 下载更新：dl.google.com/play.googleapis.com/RULE-SET,googlefcm → DOWNLOAD
    - 搜索引擎：RULE-SET,googlesearch/googledrive/googleearth/google/google-ip → SEARCH
    - 流媒体：youtube.com/googlevideo.com/ytimg.com/ggpht.com → STREAM_US
  - 已安全（在防吞盾之前已匹配）：Gemini(RULE-SET) / NotebookLM / Copilot / dns.google
  - 原位置 dead rules 已在 v5.1.9 CLEAN#1 中清除
- ★ PERF#2-P0：fastly.jsdelivr.net EOF 风暴缓解（03-05 单日 40+ provider 拉取失败）
  - 根因：389 providers 以 10s 步长密集拉取同一 CDN 节点，瞬时并发触发断连
  - 日志特征：[Provider] xxx pull error: ...fastly.jsdelivr.net/...xxx.yaml: EOF
  - 优化措施三合一：
    1) RP_STEP 10→15（冷启动窗口 ~65min→~97min，降低瞬时并发密度）
    2) nextInterval() 加 0~59s 随机抖动（打破整齐步长的周期性并发浪峰）
    3) bm7 provider CDN 混合策略（主力 fastly.jsdelivr.net + 备选 cdn.jsdelivr.net 轮替）
- ★ FIX#12-P1：GSCService.exe→ip.cip.cc 每 2 小时 DNS 解析失败
  - ip.cip.cc 是外部 IP 检测服务，技嘉 GCC 服务进程定时调用
  - 日志特征：dial DIRECT (match ProcessName/GSCService.exe) --> ip.cip.cc:80 error: dns resolve failed
  - 修复：新增 DOMAIN,ip.cip.cc,DIRECT（在 TUN 下允许直连 DNS 解析）
- ★ NOTE#1-P1：bm7 上游规则解析噪声（已知问题，非本脚本 bug）
  - USER-AGENT,BBCiPlayer* / USER-AGENT,TikTok*：mihomo 不支持 USER-AGENT 规则类型（Surge 语法残留）
  - IP-CIDR[空格], 17.253.4.125：bm7 Apple 相关 provider 格式错误（多余空格）
  - 来源：blackmatrix7/ios_rule_script 上游数据质量问题，每次 config reload 重复 3 条 warning
  - 处理：标注为已知噪声，不影响功能，等待上游修复
- ★ FIX#13-P2：acc-copilot 误匹配微软 Delivery Optimization 遥测域名
  - geover.prod.do.dsp.mp.microsoft.com 是微软 DO 服务，非 Copilot AI
  - 日志特征：match RuleSet/acc-copilot) --> geover.prod.do.dsp.mp.microsoft.com:443（4次/天）
  - 修复：前置 DOMAIN-SUFFIX 拦截到 DOWNLOAD 组
- ★ PERF#4-P2：geosite.dat 更新与 provider 争抢 CDN 带宽
  - 日志特征：[GEO] Failed to update GEO database: ...geosite.dat: TLS handshake timeout
  - 优化：geosite.dat 切换 cdn.jsdelivr.net（Cloudflare）与 provider 的 Fastly CDN 错开
  - geo-update-interval 24h→72h（降低更新频率，geo 数据变化缓慢）

v5.1.7 变更摘要（1项性能优化 + 1项修复）：
- ★ PERF#1-P1：3 个 domain-behavior provider 升级为 .mrs 二进制格式（降低冷启动解析开销）
  - anti-ad：yaml → DustinWin/ruleset_geodata ads.mrs（同源 privacy-protection-tools/anti-AD，每日3:00自动构建）
  - loyalsoldier-gfw：text → MetaCubeX geosite:gfw.mrs（同源 gfwlist/gfwlist → v2fly/domain-list-community，~4000+ 域名）
  - loyalsoldier-greatfire：text → MetaCubeX geosite:greatfire.mrs（同源 GreatFire Analyzer → v2fly/domain-list-community）
  - 优化前：29/389 providers 使用 .mrs（7.4%）→ 优化后：32/389（8.2%）
  - 剩余 domain-behavior 非 mrs（18个）：sukka-phishing(text,无.mrs源) + acc-geo-d-*(17,Accademia无.mrs)
  - 剩余 classical-behavior（322个）：mrs 格式不支持 classical（mihomo 内核限制）
  - 测试环境：确认 MetaCubeX geosite:gfw.mrs / geosite:greatfire.mrs CDN 可达
- ★ FIX#10-P0：hagezi-tif URL 双修（v5.1.6遗漏）
  - CDN：cdn.jsdelivr.net → fastly.jsdelivr.net（Cloudflare在国内/印尼频繁EOF）
  - 文件名：HageziTIF.mrs → HageziUltimate.mrs（实际release分支文件名，原名404）

v5.1.6 变更摘要（1项安全增强）：
- ★ FEAT#2-P0：新增 Hagezi Threat Intelligence Feeds（威胁情报）
  - 覆盖 malware(恶意软件)/cryptojacking(挖矿)/C2(命令控制)/scam(诈骗)/spam(垃圾邮件)
  - 补齐 v5.1.5 安全覆盖缺口（原仅有 ads/privacy/hijacking/phishing/anti-fraud/anti-PCDN）
  - 优先使用 MiHomoer/MiHomo-Hagezi .mrs 二进制格式（domain behavior，冷启动开销极小）
  - 备选：Hagezi 原始文本域名列表（format:text, behavior:domain）
  - 来源：hagezi/dns-blocklists ⭐20k+，每日自动构建，30+ 威胁情报源聚合
  - 挂到「🛑 广告拦截」组，默认 REJECT

v5.1.5 变更摘要（1项重构）：
- ★ REFACTOR#1-P1：删除「🇮🇩 印尼本地」独立代理组（29→28 业务策略组）
  - 印尼银行/证券（bca/bni/bri/mandiri等11家 + idx/ksei）→ 金融支付
  - 印尼电商/出行/外卖/电信/ISP/政府/新闻（~36域名）→ 国外网站
  - GEOIP,ID → 国外网站（与 GEOIP,CN→国内网站 对称，可在印尼时手动切DIRECT）
  - 印尼支付网关（midtrans/gopay/ovo/dana等）保留在金融支付组不变
  - 印尼流媒体（vidio/rctiplus等）保留在东南亚流媒体组不变
  - 删除 ID_LOCAL_PROXIES 常量

v5.1.4 变更摘要（1项新增）：
- ★ FEAT#1-P1：新增「🚫 受限网站」GFW 代理组（4源覆盖，位于 INTL_SITE 之前）
  - Loyalsoldier/clash-rules gfw.txt（GFWList 每日6:30自动构建，~4000+ 域名）
  - Loyalsoldier/clash-rules greatfire.txt（GreatFire 独立封锁探测，与 GFWList 互补）
  - GEOSITE,gfw（MetaCubeX geosite.dat 内置 GFW 标签，支持 keyword/regexp 规则类型）
  - szkane ProxyGFWlist（从 INTL_SITE 移入，GFW 域名补充）
  - 代理列表含 DIRECT（在国外时可直连被墙站点），与 INTL_SITE 语义分离
  - 数据源层级：gfwlist/gfwlist + GreatFire Analyzer → v2fly/domain-list-community → Loyalsoldier/v2ray-rules-dat → clash-rules

v5.1.3 变更摘要（3处修复）：
- ★ FIX#7-P1：Zoho 宽域名 DOMAIN-SUFFIX 收窄为 mail.zoho.* 精确子域名（防止吞掉会议协作规则）
- ★ FIX#8-P2：acc-kwai（Kwai国际版）从 CNMEDIA(DIRECT优先) 移到 STREAM_SEA（海外APP需代理）
- ★ FIX#9-P2：ehgallery 从 STREAM_US 移到 INTL_SITE（非流媒体服务，全球节点更灵活）

v5.1.2 变更摘要（6处修复）：
- ★ FIX#1-P0：Asia_China GeoRouting 从 INTL_SITE 修正为 CN_SITE（.cn域名/中国IP段误走代理）
- ★ FIX#2-P1：BilibiliHMT 从 CNMEDIA(DIRECT优先) 修正为 STREAM_HK（港澳台B站需代理解锁）
- ★ FIX#3-P1：补充5个孤儿provider规则引用（googledrive/googleearth/scholar/yandex→搜索, naver→国外网站）
- ★ FIX#4-P2：HomeIP US/JP 从 CN_SITE 修正为 INTL_SITE（美日住宅IP段不应走直连）
- ★ FIX#5-P2：Aqara Global 从 CN_SITE 修正为 INTL_SITE（绿米国际服务需代理）
- ★ FIX#6-P1：删除3个DNS provider（bm7-dns/acc-globaldns/acc-chinadns），DNS流量改为自然分流

v5.1 变更摘要（4步集成）：
- ★ Step1-P0：Ckrvxr AntiPCDN（阻止P2P CDN吸血）+ AntiAntiFraud（阻止反诈隐私上传）
- ★ Step1-P0：SukkaW reject_phishing（13万钓鱼域名拦截）
- ★ Step1-P2：szkane crypto-exchanges（Binance/OKX/Web3量化交易精准路由）
- ★ Step2：Accademia 全量35规则目录（bm7补充：AI/Bank/Signal/FakeLocation等）
- ★ Step3：szkane 全量规则（AI/CiciAI/Web3/Developer/Edu/UK等）
- ★ Step4：geox-url 切换 Loyalsoldier 加强版 MMDB（含 cloudflare/telegram/netflix IP段）
- ★ Step4：新增 GEOIP 精准标签路由（geoip:cloudflare/telegram/netflix）
- ★ D6：所有外部规则 URL 统一 fastly.jsdelivr.net CDN（v5.1.6: raw.githubusercontent.com → CDN 消除 EOF）

变更 v4.5.9→v5.0：
- ★ P0 扩展：rule-providers 从 72 扩展到 326（+254 个 bm7 规则集）
- ★ P0 扩展：实现 100% blackmatrix7 服务覆盖（排除已删除/国内兜底/聚合/重复/停服/测试规则）
- ★ P1 优化：刷新步长从 25s 缩短到 10s（冷启动窗口 ≈ 54 分钟）
- ★ P1 新增：13 个广告拦截/隐私保护 provider（Advertising/EasyPrivacy/Hijacking 等）
- ★ P1 新增：42 个国内流媒体 provider（iQIYI/Youku/Douyin/WeTV 等完整覆盖）
- ★ P1 新增：22 个美国流媒体 provider（CBS/NBC/PBS/Fox 等电视网络）
- ★ P1 新增：30 个国外网站 provider（Wikipedia/Dropbox/Airbnb/Nike/Adobe 等）
- ★ P1 新增：15 个下载更新 provider（含 D2 硬件品牌 Intel/Nvidia/Dell/HP 等）
- ★ P1 新增：15 个云与CDN provider（含 D4 CA 证书 DigiCert/GlobalSign/LetsEncrypt 等）
- ★ P1 新增：13 个苹果服务 provider（AppStore/AppleTV/Siri/TestFlight/FaceTime 等）
- ★ P1 新增：13 个开发者 provider（Developer/Python/JetBrains/Oracle/WordPress 等）
- ★ P1 新增：10 个社交媒体 provider（Pixiv/VK/Imgur/Disqus 等）
- ★ P1 新增：10 个国外游戏 provider（Rockstar/Riot/GOG/Supercell/HoYoverse 等）
- ★ P1 新增：8 个会议协作 provider（Atlassian/Notion/TeamViewer/Salesforce 等）
- ★ P1 新增：7 个香港/台湾/东南亚/欧洲流媒体 provider 各类
- ★ P1 新增：6 个搜索引擎 provider（GoogleDrive/GoogleEarth/DuckDuckGo/Yandex/Scholar 等）
- ★ P1 新增：6 个即时通讯 provider（Telegram 地区IP段/GoogleVoice/Zalo 等）
- ★ P2 新增：PrivateTracker（253 条 PT 站规则，P0 优先级）
- ★ D0 决策：Blizzard 子游戏跳过（被 Blizzard 主规则覆盖）
- ★ D1 决策：Google 子服务拆分（Drive→搜索, FCM→下载, Voice→IM）
- ★ D2 决策：硬件/消费品牌统一归入下载更新/国外网站
- ★ D3 决策：新闻媒体统一归入国外网站
- ★ D4 决策：CA 证书服务归入云与CDN
- ★ D5 决策：刷新步长 25s→10s

沿用 v4.5.8→v4.5.9（全部修复保留）：

变更 v4.5.7→v4.5.8：
- ★ P0 修复：删除 announce.php 伪域名死规则（DOMAIN-SUFFIX 无法匹配 URL 路径）
- ★ P0 修复：AWS 域名前置于 RULE-SET,amazon 之前，修复 AWS Console 被吞入「美国流媒体」
  - amazonaws.com/awsstatic.com → 云与CDN
  - aws.amazon.com/console.aws.amazon.com → 开发者服务
  - 删除 ⑱ 中对应死规则
- ★ P0 修复：Google 下载域名前置于 RULE-SET,google 之前，修复 dl.google.com 等被吞入「搜索引擎」
  - dl.google.com/play.googleapis.com/android.clients.google.com → 下载更新
  - 删除 ⑱½ 中对应死规则
- ★ P0 修复：live.com 范围收窄，防止 login.live.com/xbox.live.com 被吞入「邮件服务」
  - DOMAIN-SUFFIX,live.com → DOMAIN,mail.live.com（仅保留邮件入口）
- ★ P1 修复：naver.com 拆分为流媒体子域名，修复 search.naver.com 死规则
  - ⑪ 日韩流媒体：naver.com → tv.naver.com/now.naver.com 等具体子域名
  - ⑮ 搜索引擎：search.naver.com 恢复生效
  - naver.com 宽域名降级到 ㉑ 国外网站兜底
- ★ P1 修复：清理 ~10 条同区块内冗余后缀死规则
  - ⑮ 删除 search.yahoo.com（被 yahoo.com 覆盖）
  - ⑮ 删除 search.brave.com（被 brave.com 覆盖）
  - ⑦⅔ 删除 tv.sohu.com（被 sohu.com 覆盖）
  - ⑲½ 删除 7 条被 go.id 覆盖的政府子域名
- ★ P2 修复：TLS 指纹改用确定性哈希（按节点名），避免 WebSocket 长连接指纹漂移
- ★ P2 修复：台湾节点 Emoji 从 🇨🇳 修正为 🇹🇼
- ★ P2 新增：GEOIP,ID 印尼兜底（与 GEOIP,CN 对称，v5.1.5 移入国外网站组）

沿用 v4.5.7：
- ★ P1 变更：删除「🏠 中国智能」节点组（10→9 Smart 区域组）
- ★ P1 变更：所有「XX智能」节点组重命名为「XX节点」

沿用 v4.5.6：
- ★ P2 优化：rule-provider 刷新间隔逐条递增（25s 步长，零并发）

沿用 v4.5.5 及更早版本的所有修复。
