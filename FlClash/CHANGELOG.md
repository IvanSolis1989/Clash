# FlClash — 变更日志

> FlClash 覆写脚本 `FlClash(mihomo).js`，使用标准 Mihomo 内核的 url-test 区域组。
> 基线：Clash Party Normal（规则与策略 100% 对齐）。

---

## v5.4.25-flclash.1 (2026-06-03)

- ★ 审查修复：GEOIP 重复规则去重（`GEOIP,netflix` / `GEOIP,google` / `GEOIP,ID` 各出现 2 次 → 保留 GEOIP 标签路由集中区块）

## v5.4.24-flclash.1 (2026-06-03)

- ★ CLEAN：清除 18 条冗余规则 + 3 个未引用 provider（同步基线 v5.4.24，下载上游文件逐条验证）。
  - 删除 4 条 Binance DOMAIN-SUFFIX（binance.com/cloud/me/future.com，RULE-SET 已含）
  - 删除 3 个 Google 子 RULE-SET 引用 + provider（googlesearch/googledrive/googleearth，Google 元集已覆盖）
  - 删除 3 条 ProtonMail DOMAIN-SUFFIX（protonmail.com/proton.me/pm.me，RULE-SET 已含）
  - 删除 5 条音乐流媒体 DOMAIN-SUFFIX（soundcloud/sndcdn/pandora/deezer/tidal，各自 RULE-SET 已含）
  - 删除 2 条社交媒体 DOMAIN-SUFFIX（tumblr/clubhouse，各自 RULE-SET 已含）
  - 删除 2 条流媒体 DOMAIN-SUFFIX（vimeo/dailymotion，各自 RULE-SET 已含）

## v5.4.23-flclash.1 (2026-06-02)

- ★ FIX#161：`DOMAIN-SUFFIX,zhimg.com` + `DOMAIN-SUFFIX,zhihu.co` → 🏠 国内网站 直连（知乎图片 CDN + 短链，同步基线）。

## v5.4.22-flclash.1 (2026-05-31)

- ★ GeTui(个推)推送 SDK `getui.com` / `getui.net` / `gepush.com` 加直连白名单（review 后补；延续 #2，被通用广告/隐私表当 tracker 拦截但承载 App 推送如米家；owner 选放行）。

#1 借鉴 Proxy-override：QUIC 精细化——AND 规则白名单豁免（YouTube/Google/MS/Apple 的 QUIC 走对应业务组）；其余非 CN QUIC REJECT。

- 配套新增 `config.sniffer`（QUIC/443 SNI 嗅探 + `force-dns-mapping`，对齐 CMFA/OpenClash）——使真 IP QUIC（fake-ip-filter 域名）也能 GEOSITE 匹配，避免误 REJECT（review 修复）。
- 兜底判据 `GEOIP,CN` → `GEOSITE,cn`（fake-ip 下更可靠）。

## v5.4.21-flclash.1 (2026-05-31)

#4 借鉴 Proxy-override：`default-nameserver` 从纯明文 IP 升级为 DoH-over-IP + 1 明文兜底；消除 bootstrap 阶段 DNS 泄漏。

## v5.4.20-flclash.1 (2026-05-30)

借鉴 Proxy-override 批 B · #6 节点过滤关键词补充（跟随 Clash Party v5.4.20）：

- junk 节点过滤器 `isInfoNode` 新增：中文 `免费` / `试用` / `应急`；英文（`\b` 词边界）`Sign` / `Login` / `Register` / `Help` / `FAQ`
- 不加「更新」「地址」（误伤风险高）
- 回归：`tools/validate-js-overwrites.js` flclash target fixture（junk 过滤 + Signal 守卫）+ `tools/test-info-node-filter.js` 一致性
- 🔢 版本：v5.4.19-flclash.1 → v5.4.20-flclash.1

## v5.4.19-flclash.1 (2026-05-30)

借鉴 Proxy-override 批 A（跟随 Clash Party v5.4.19；spec：`docs/2026-05-30-proxy-override-借鉴设计.md`）：

- ✅ #2 国内 SDK/CDN 直连前置：jpush / `msg.umeng.com` 加 `AD_FALSE_POSITIVE_ALLOWLIST` 强制 DIRECT（绕过 `jiguangtuisong` / `youmengchuangxiang` 拦截）；`baomitu.com` / `bootcss.com` / `staticfile.org` / `upaiyun.com` 前置到 🏠 国内网站段
- ✅ #3 fake-ip-filter 补全 10 条（远控 todesk/oray/sunlogin/teamviewer/anydesk · 游戏 battlenet.com.cn/wotgame.cn/wggames.cn/wowsgame.cn · B站 P2P mcdn.bilivideo.cn）
- ✅ #5 `direct-nameserver-follow-policy: true`（direct 出口域名解析遵循 nameserver-policy；本仓库 policy 仅含境外 CDN，零国内误伤）
- 🔢 版本对齐：v5.4.18-flclash.2 → v5.4.19-flclash.1（全产物跳过烧毁的 .18 统一到 v5.4.19）

## v5.4.18-flclash.2 (2026-05-30)
## v5.4.17-flclash.2 (2026-05-30)

- ★ FIX#VERSION-PREFIX：主版本前缀由误写的 v5.4.18 修正为 v5.4.17，对齐 baseline（主线 Smart JS）与其余 9 产物（CLAUDE.md §4；修复 validate-artifact-contracts 的 `js.flclash.version-prefix` 检查。内容（url-test/DNS 调优）不变，仅版本号前缀修正）
- ⚡ PERF#URLTEST-LATENCY：url-test 组参数全面调优，解决卡顿/高延迟/无法联网
  - `lazy: false`（全组节点主动测速，不再只测当前节点，避免"卡在劣化节点上"）
  - `interval: 120 → 180`（lazy=false 下合理拉长间隔，减少全组测速风暴）
  - `tolerance: 30 → 10`（切换阈值从 30ms 降至 10ms，节点劣化时更快切换）
- ⚡ PERF#DNS-RESILIENCE：DNS 引导与代理层优化
  - `default-nameserver` 移除境外 `1.1.1.1` / `8.8.8.8`，改用 `223.5.5.5` / `119.29.29.29` / `180.76.76.76`（全量国内自举，打破 fake-ip 循环依赖）
  - `proxy-server-nameserver` 不再混入国内 DoH（代理链路 DNS 纯走境外 Cloudflare/Google DoH）

## v5.4.17-flclash.1 (2026-05-26)

- ✅ FIX#DNS-SPLIT-BOOTSTRAP：同步 Clash Party Normal v5.4.17 DNS 合同
  - `default-nameserver` 纯 IP，自举以外的 resolver 全部 DoH
  - 关闭 `prefer-h3`，开启 `respect-rules: true`，并补齐 `nameserver-policy` / `fallback-filter.geosite`

## v5.4.16-flclash.2 (2026-05-22)

- ✅ FEAT#GAME-ACCEL：新增游戏加速器 `PROCESS-NAME -> DIRECT` 白名单
  - 新增 16 条进程名（UU / 小黑 / 迅游 / 雷神 / NNer 加速器），同步 Clash Party Normal 基线

## v5.4.16-flclash.1 (2026-05-20)

- ✅ FIX#149-P0：同步 Clash Party Normal v5.4.16，前置 `paddle.com -> 🏦 金融支付`
  - 覆盖 anti-AD/DustinWin 对 `analytics.paddle.com` 的误拦截，避免 Antigravity 账号设置/许可链路被广告规则抢先命中

## v5.4.15-flclash.1 (2026-05-20)

- 🧾 DOC#GEOSITE-LEDGER：同步 Clash Party Normal v5.4.15，新增 GEOSITE 覆盖台账引用。
- ♻️ REFACTOR#AD-FP-MODULE：将广告误伤白名单提升为 AD_FALSE_POSITIVE_ALLOWLIST，并在 injectRules() 顶部统一注入。

## v5.4.14-flclash.1 (2026-05-20)

- ✅ FIX#CF-R2-P0：同步 Clash Party Normal v5.4.14，前置 `cloudflarestorage.com -> 🌐 国外网站`
  - 覆盖 Sukka phishing 对 Cloudflare R2 存储域的误拦截
  - 后段 `🌐 国外网站` 重复条目已移除

## v5.4.13-flclash.1 (2026-05-19)

- ✅ FIX#STUN-REALIP：同步 Clash Party Normal v5.4.13，补齐 STUN/TURN fake-ip 排除与标准端口直连
  - 覆写脚本会把 STUN/TURN 通配、`stun1-4.l.google.com`、`global.turn.twilio.com` 合并进 `fake-ip-filter`
  - `DST-PORT 5349 / 19302 / 19305 / 19307` 走 `DIRECT`

## v5.4.12-flclash.2 (2026-05-12)

- 📝 DOC#IMPORT-HTML：FlClash 导入 URL 改为 `%28mihomo%29` 编码写法，并补充 `unexpected token '<'` 排障说明
  - 该错误表示客户端拿到 GitHub/错误页 HTML，而不是 JS 脚本；规则与 DNS 逻辑不变

## v5.4.12-flclash.1 (2026-05-12)

- ✅ FIX#RD-REALIP：覆写脚本在 DNS `fake-ip-filter` 中保留 `+.rustdesk.com`
  - 与 Clash Party Normal v5.4.12 对齐，RustDesk 仍走会议协作代理链路但 DNS 使用真实 IP

## v5.4.11-flclash.1 (2026-05-12)

- ✅ FIX#RD-PROC：RustDesk 进程规则从本地工具 `DIRECT` 白名单移出，改走 `🧑‍💼 会议协作`
- ✅ FIX#DNS-BOOTSTRAP：内置 DNS 示例与脚本输出均改为 IP-first，降低 DoH 域名解析死锁概率

## v5.4.9-flclash.1 (2026-05-11)

- ✅ FEAT#LOCAL-TOOLS：跟随 Clash Party v5.4.9 新增桌面本地工具 `PROCESS-NAME -> DIRECT` 白名单
  - Windows/macOS/Linux 可命中；Android 端不依赖该清单
  - 清单由 `tools/fixtures/process-name-direct-tools.json` 与 `tools/validate-process-name-direct.js` 校验

## v5.4.8-flclash.1 (2026-05-09)

- ★ ORDER#RULE-TAIL：跟随 Clash Party Normal v5.4.8-normal.1 重排规则尾段匹配顺序

## v5.4.7-flclash.1 (2026-05-09)

- ★ FEAT#TikTok：新增独立 `🎵 TikTok` 业务组（32 业务组），置于 `📺 国内流媒体` 与 `🎥 Netflix` 之间
  - 跟随 Clash Party Normal v5.4.7-normal.1 基线；BIZ + groups + rules + FP 同步
- ★ FIX#HK：`REGION_DB` HK kw 加 `'港'`，补全广港/深港等 IEPL/IPLC 跨境专线节点分类

## v5.4.6-flclash.1 (2026-05-08)

- ★ FEAT#145：WeChat CDN 直连 — 新增 `DOMAIN-SUFFIX,cdn.weixin.qq.com,DIRECT`
  - 置于 iwipwedabay.com 后、binance 前
  - 跟随 Clash Party Normal v5.4.6-normal.1 基线

## v5.4.5-flclash.1 (2026-05-07)

- ★ 全球节点置顶 + 全产品组顺序同步（跟随基线 v5.4.5）

## v5.4.4-flclash.1 (2026-05-07)

- ★ FIX#142-CRITICAL：DNS 安全兜底 nameserver 注入 — 避免空 DNS 导致 DIRECT 超时
  - overwriteGeneral 新增 DNS 保护代码，在 App UI 未配置 DNS 时自动注入 `223.5.5.5` / `119.29.29.29`
  - 设置 `enhanced-mode: fake-ip` 确保 DNS 解析模式不会因外部配置缺失而失效
- ★ FIX#144-P1：bbys.app DIRECT 直连规则
  - injectRules 中 acc-chinamax 规则后新增 `DOMAIN-SUFFIX,bbys.app,DIRECT`
- ★ FEAT#143：IEPL/IPLC 家宽识别关键词扩展
  - RESIDENTIAL_PATTERNS 新增 `/\biplc\b/i`、`/\biepl\b/i`、`/专线/` 三条规则
- 跟随基线 Clash Party v5.4.4

## v5.4.3-flclash.1 (2026-05-06)

- ★ FEAT：家宽节点识别新增 `\bhome\b` 关键词（跟随 Clash Party v5.4.3 基线）
  - `RESIDENTIAL_PATTERNS` 数组追加 `/\bhome\b/i`，匹配仅含 Home 的节点名

## v5.4.2-flclash.2 (2026-05-05)

- ★ FIX#41-P0-QuickJS：injectRules 重赋值 → 原地 splice+push（修复 QuickJS ↔ Dart FFI 桥接层丢失路由规则）
  - `config.rules = [...]` 在 FlClash QuickJS 环境中创建新数组，Dart 端持有旧引用 → 所有规则丢失
  - 改为 `_newRules` 临时数组 + `config.rules.splice(0)` + 逐个 `push` 原地写入
  - 此 bug 导致 FlClash 用户在 cleanupSubscription 清空规则后注入的 1000+ 条规则全部丢失

## v5.4.2-flclash.1 (2026-05-05)

- ★ FIX#41-P0：小米核心服务 DIRECT 白名单（跟随 Clash Party v5.4.2 基线）
  - 新增 11 条 DIRECT 规则前置广告拦截段，修复 miuiprivacy/advertisingmitv 误杀认证安全域名

## v5.4.1-flclash.2 (2026-05-05)

- ★ FIX#FlClash-Review-P0：恢复 FlClash 覆写脚本的有效 UTF-8 字符串字面量
  - 修复 `REGION_DB` / `SMART` / `BIZ` 被 mojibake 破坏后产生的 `SyntaxError`
  - 从 `ClashParty(mihomo).js` 重新同步干净规则逻辑，并保留 FlClash 的 QuickJS 日志包装与数组原地修改约束
- ★ FIX#FlClash-Review-P0：补回 `classifyAllNodes` 初始化 buckets
  - 样例 `TWN 01 AnyRoute IEPL x2.5` → 台湾，`SGP 01 AnyRoute IEPL x2.5` → 狮城，未知家宽节点 → 其他家宽
  - 同构审计：Clash Party Normal 同步修复；Smart 主线正常；其余静态/非 JS 产物无此初始化回归

## v5.4.0-flclash.1 (2026-05-05)

- ★ FEAT#SG：新增 🇸🇬 狮城节点 + 🏡 狮城家宽 独立区域组
  - 新加坡从 🌏 亚太节点 中拆分为独立区域
  - 区域组总数：18 → 20（10 全部 + 10 家宽），总组数：49 → 51
  - 跟随基线 Clash Party v5.4.0

## v5.3.2-flclash.1 (2026-05-03)

- 初始版本，基于 Clash Party Normal v5.3.2 完整移植
  - 18 url-test 区域组（9 全部 + 9 家宽）+ 31 业务策略组（含 13 流媒体平台组）
  - 371+ rule-providers，覆盖 AI/流媒体/游戏/金融/社交/开发等全部场景
  - word-boundary 正则节点分类（REGION_DB 同 Clash Party v5.3.2）
  - 家宽自动识别 + 信息节点过滤
  - 订阅垃圾 proxy-groups / rules / rule-providers 自动清理
  - TLS 指纹自动注入（client-fingerprint）
- 适配 FlClash 覆写脚本环境：
  - `console.log` → 条件包装（兼容 QuickJS 引擎）
  - 全局设置精简：移除 `geox-url`/`geodata-mode`/TUN/端口覆写（FlClash UI 托管）
  - 数组操作改用原地修改（splice/push），避免 QuickJS FFI 桥接层重赋值丢失
- **导入方式确认**：FlClash 覆写脚本需要两步操作——先在「覆写脚本」创建脚本，再在订阅「更多→覆写」关联
- 必改配置文档化：GeoX URL（外部资源）+ DNS（进阶配置）
- 与 CMFA YAML 并行提供
