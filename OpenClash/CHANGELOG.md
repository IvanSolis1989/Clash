# OpenClash — 变更日志

> 覆盖 `OpenClash/OpenClash(mihomo).sh`（Normal）+
> `OpenClash/OpenClash(mihomo-smart).sh`（Full，完整版）。
>
> 两份脚本版本号各自独立递增，但主版本号跟随 Clash Party 主线。

---

## v5.4.20-oc-normal.1 / v5.4.20-oc-smart.1 (2026-05-30)

借鉴 Proxy-override 批 B · #6 节点过滤关键词补充（Normal / Smart 同步；spec：`docs/2026-05-30-proxy-override-借鉴设计.md`）：

- Ruby `INFO_PATTERNS` reject 数组新增：中文 `/免费/` `/试用/` `/应急/`；英文 `/\bSign\b/i` `/\bLogin\b/i` `/\bRegister\b/i` `/\bHelp\b/i` `/\bFAQ\b/i`（`\b` 词边界防误伤 Signal；`/注册/` Register 中文已存在）
- 不加「更新」「地址」（误伤风险高，owner spec 排除）
- 一致性回归：`tools/test-info-node-filter.js` 覆盖两份 .sh 的 Ruby INFO_PATTERNS
- 🔢 版本：v5.4.19-oc-* → v5.4.20-oc-*

## v5.4.19-oc-normal.1 / v5.4.19-oc-smart.1 (2026-05-30)

借鉴 Proxy-override 批 A（Normal / Smart 同步；跟随 Clash Party v5.4.19；spec：`docs/2026-05-30-proxy-override-借鉴设计.md`）：

- ✅ #2 国内 SDK/CDN 直连前置
  - jpush / `msg.umeng.com` 前置到 `RULE-SET,jiguangtuisong` / `youmengchuangxiang` 广告拦截规则之前强制 DIRECT（沿用 paddle / 小米误杀前置白名单段）
  - `baomitu.com` / `bootcss.com` / `staticfile.org` / `upaiyun.com` 前置到 🏠 国内网站段 `RULE-SET,cn` 之前
- ✅ #3 fake-ip-filter 补全 10 条（远控 todesk/oray/sunlogin/teamviewer/anydesk · 游戏 battlenet.com.cn/wotgame.cn/wggames.cn/wowsgame.cn · B站 P2P mcdn.bilivideo.cn）
- ✅ #5 `direct-nameserver-follow-policy: true`（direct 出口域名解析遵循 nameserver-policy；本仓库 policy 仅含境外 CDN，零国内误伤）
- 🔢 版本：v5.4.17-oc-* → v5.4.19-oc-*（全产物跳过烧毁的 .18 统一到 v5.4.19；含 VERSION_TAG + 内嵌 Ruby VERSION 双处）
## v5.4.17-oc-normal.2 / v5.4.17-oc-smart.2 (2026-05-30)

- ★ FIX#KR-WB：Ruby `REGIONS` 裸 `KR` 补词边界 `\bKR\b`（与同文件 HK/TW/JP/SG/US 一致）
  - 原 `/KR/i` 子串匹配，误把 Ukraine / Krakow / Kraken 等含 kr 串节点分到 🇯🇵 日韩节点
  - `\b` 把数字视为词字符，"KR01" 数字紧邻不命中（与 HK01/TW01 同；conf 产物用 lookbehind 允许数字边界，KR01 命中——各端既有风格差异，已记录）
  - §1.5 审计：Normal 与 Full 同构，同步修复；主线 Clash Party×3 JS + CMFA 本就带边界，未改
- ★ FIX#DEDUP：删除 rules 末尾重复死规则 noip.com / GEOIP,cloudflare / GEOIP,CN（各 1 处）
  - 与前段同条目字面重复，因规则顺序短路永不执行、目标组相同；删除零分流影响
- ★ FIX#HOSTS-ALIGN：`use-hosts: false` → `true`，并补全 hosts 缺失的 `dns.alidns.com` / `doh.pub`
  - 对齐主线：hosts 固定全部自用 DoH 域名 IP（alidns/doh.pub/google/cloudflare），消除 fake-ip 冷启动循环依赖
  - 此前 `use-hosts:false` 让 hosts 块失效（报告误判为"应删 hosts"，实为应启用）；§1 DNS 联动 CMFA 同步
- 回归测试见 `tools/test-kr-boundary.js`

## v5.4.17-oc-normal.1 / v5.4.17-oc-smart.1 (2026-05-26)

- ✅ FIX#DNS-SPLIT-BOOTSTRAP：Normal / Smart 同步 Clash Party v5.4.17 DNS 合同
  - `default-nameserver` 纯 IP；`nameserver` / `direct-nameserver` 固定国内 DoH
  - `proxy-server-nameserver` 固定 Cloudflare + Google DoH，AliDNS + DNSPod DoH 兜底
  - `fallback` 固定 Cloudflare + Google DoH，关闭 `prefer-h3`、开启 `respect-rules: true` 并补齐 `fallback-filter.geosite`

## v5.4.16-oc-normal.2 / v5.4.16-oc-smart.2 (2026-05-22)

- ✅ FEAT#GAME-ACCEL：新增游戏加速器 `PROCESS-NAME -> DIRECT` 白名单
  - 新增 16 条 PROCESS-NAME 规则（UU / 小黑 / 迅游 / 雷神 / NNer 加速器）
  - Normal + Smart 同步

## v5.4.16-oc-normal.1 / v5.4.16-oc-smart.1 (2026-05-20)

- ✅ FIX#149-P0：Normal / Smart 同步前置 `paddle.com -> 🏦 金融支付`
  - 覆盖 anti-AD/DustinWin 对 `analytics.paddle.com` 的误拦截
  - heredoc YAML 中该规则位于所有广告/钓鱼/威胁情报 `RULE-SET` 之前，避免 Antigravity 账号设置回跳失败

## v5.4.15-oc-normal.1 / v5.4.15-oc-smart.1 (2026-05-20)

- 🧾 DOC#GEOSITE-LEDGER：Normal / Smart 同步 Clash Party v5.4.15 元数据与台账引用。
- ♻️ REFACTOR#AD-FP-MODULE：heredoc YAML 的 rules 顶部显式标记 Anti-ad false-positive allowlist；白名单仍前置于广告/钓鱼/威胁情报规则。

## v5.4.14-oc-normal.1 / v5.4.14-oc-smart.1 (2026-05-20)

- ✅ FIX#CF-R2-P0：Normal / Smart 同步前置 `cloudflarestorage.com -> 🌐 国外网站`
  - 当前 Sukka phishing 源包含 Cloudflare R2 存储域，原后段国外网站规则会被广告段首匹配覆盖
  - heredoc YAML 在广告/钓鱼/威胁情报规则之前增加白名单，并删除后段重复条目

## v5.4.13-oc-normal.1 / v5.4.13-oc-smart.1 (2026-05-19)

- ✅ FIX#STUN-REALIP：OpenClash Normal / Smart 同步 STUN/TURN 真实 IP 与端口直连
  - heredoc DNS `fake-ip-filter` 补充 STUN/TURN 通配、`stun1-4.l.google.com` 与 `global.turn.twilio.com`
  - 规则尾段补齐 `DST-PORT 5349 / 19302 / 19305 / 19307 -> DIRECT`
  - UDP/443 仍保持 QUIC 屏蔽策略，不作为默认 STUN/TURN 例外

## v5.4.12-oc-normal.1 / v5.4.12-oc-smart.1 (2026-05-12)

- ✅ FIX#RD-REALIP：OpenClash Normal / Smart heredoc DNS `fake-ip-filter` 补充 `+.rustdesk.com`
  - RustDesk relay/API 仍走 `🧑‍💼 会议协作`，但域名解析返回真实 IP，避免 fake-ip 影响会合与中继阶段

## v5.4.11-oc-normal.1 / v5.4.11-oc-smart.1 (2026-05-12)

- ✅ FIX#RD-PROC：RustDesk 进程规则从 `DIRECT` 改为 `🧑‍💼 会议协作`，`rustdesk.com` 域名保护继续前置于 Copilot 规则
- ✅ FIX#DNS-BOOTSTRAP：heredoc YAML 的 DNS 服务器改为 IP-first，避免路由器冷启动时 DoH 自举失败

## v5.4.9-oc-normal.1 / v5.4.9-oc-smart.1 (2026-05-11)

- ✅ FEAT#LOCAL-TOOLS：语法同步 Clash Party v5.4.9 的桌面本地工具 `PROCESS-NAME -> DIRECT` 白名单
  - OpenClash 路由器端通常无法看到局域网客户端进程名，因此该清单主要用于保持 mihomo 规则形态一致
  - 不改变 proxy-groups / rule-providers / DNS 语义

## v5.4.8-oc-normal.2 / v5.4.8-oc-smart.2 (2026-05-11)

- ★ META#VERSION：同步脚本头部、`VERSION_TAG` 与内嵌 Ruby `VERSION`
  - Normal / Smart 均明确对齐 Clash Party v5.4.8
  - 不改变 proxy-groups / rule-providers / rules 语义

## v5.4.8-oc-normal.1 / v5.4.8-oc-smart.1 (2026-05-09)

- ★ ORDER#RULE-TAIL：同步 Clash Party v5.4.8 规则尾段匹配顺序
  - Normal 与 Smart heredoc YAML 同步
  - 仅调整 `rules:` 顺序，不调整 proxy-groups / Ruby 区域分类

## v5.4.7-oc-normal.1 / v5.4.7-oc-smart.1 (2026-05-09)

- ★ FEAT#TikTok：新增独立 `🎵 TikTok` 业务组（32 业务组），置于 `📺 国内流媒体` 与 `🎥 Netflix` 之间
  - heredoc YAML proxy-groups / rules 同步；Smart 版 Ruby `REGIONS` 同步
- ★ FIX#HK：Ruby `REGIONS["HK"]` 正则加 `|港`，补全广港/深港等 IEPL/IPLC 跨境专线节点分类

## v5.4.6-oc-normal.1 / v5.4.6-oc-smart.1 (2026-05-08)

- ★ FEAT#145：WeChat CDN 直连
  - 两份 shell 脚本 rules 段新增 `DOMAIN-SUFFIX,cdn.weixin.qq.com,DIRECT`（置于 iwipwedabay.com 后、binance 前）
  - 跟随 Clash Party v5.4.6 基线

## v5.4.5-oc-normal.1 / v5.4.5-oc-smart.1 (2026-05-07)

- ★ 全球节点置顶 + 全产品组顺序同步（跟随基线 v5.4.5）

## v5.4.4-oc-normal.1 / v5.4.4-oc-smart.1 (2026-05-07)

- ★ FIX#144：bbys.app DIRECT 规则
  - 两份 shell 脚本 rules 段新增 `DOMAIN-SUFFIX,bbys.app,DIRECT`（置于 acc-chinamax 后、GFW 前），bbys.app 视频域名直连
- ★ FEAT#143：家宽 Ruby RESIDENTIAL_PATTERNS 新增 IPLC/IEPL/专线识别
  - 两份 shell 脚本的 `RESIDENTIAL_PATTERNS` 数组追加 `/\biplc\b/i`、`/\biepl\b/i` 以及 `专线` 关键词，匹配含 IPLC/IEPL/专线标识的家宽类型节点
- ★ FIX#142（DNS 冷启动）为 Clash Party JS 专属修复，静态配置豁免（无同构改动）
- Bump: `v5.4.3-oc-normal.1` → `v5.4.4-oc-normal.1` / `v5.4.3-oc-smart.1` → `v5.4.4-oc-smart.1`

## v5.4.3-oc-normal.1 / v5.4.3-oc-smart.1 (2026-05-06)

- ★ FEAT：家宽 Ruby RESIDENTIAL_PATTERNS 添加 `\bhome\b` 关键词（跟随 Clash Party v5.4.3 基线）
  - 两份 shell 脚本的 `RESIDENTIAL_PATTERNS` 数组追加 `/\bhome\b/i`，匹配仅含 Home 的节点名

## v5.4.2-oc-normal.1 / v5.4.2-oc-smart.1 (2026-05-05)

- ★ FIX#41-P0：小米核心服务 DIRECT 白名单（跟随 Clash Party v5.4.2 基线）
  - 新增 11 条 DIRECT 规则前置广告拦截段，修复 miuiprivacy/advertisingmitv 误杀认证安全域名
  - Normal + Smart 两份 shell 同步修改

## v5.4.0 (2026-05-05) — 新增 🇸🇬 狮城节点 + 🏡 狮城家宽 独立区域组

- ★ FEAT#SG：跟随 Clash Party v5.4.0 基线，新增狮城节点组
  - 新加坡从 🌏 亚太节点 中拆分为独立区域
  - 区域组总数：18 → 20（10 全部 + 10 家宽），总组数：49 → 51

## v5.3.0 (2026-04-26) — 流媒体分组架构重构

- ★ REFACTOR#2：跟随 Clash Party v5.3.0 基线，流媒体 7→13 组（按平台拆分）
  - 拆出：🎥 Netflix / 🎬 Disney+ / 📡 HBO/Max / 📺 Hulu / 🎬 Prime Video / 📹 YouTube / 🎵 音乐流媒体
  - 新增 🌐 其他国外流媒体 兜底
  - 业务组 25→31，总组 43→49

## Normal（`OpenClash(mihomo).sh`，非 Smart 内核 / url-test 版）

### v5.4.0-oc-normal.1 (2026-05-05)

- ★ FEAT#SG：新增 🇸🇬 狮城节点 + 🏡 狮城家宽 独立 url-test 区域组
  - 新加坡从 🌏 亚太节点 中拆分为独立区域
  - 区域组总数：18 → 20（10 全部 + 10 家宽），总组数：49 → 51
  - 跟随基线 Clash Party v5.4.0

### v5.3.0-oc-normal.2 (2026-04-26) — FIX: fake-ip-filter 清理 + sniffer skip-domain 无效条目

- ★ FIX：清理 3 条币安域名在 `fake-ip-filter` 中的残留（Smart/CMFA 均无此条目，不一致）
  - 移除 `+.binance.com` / `+.binancefuture.com` / `+.binance.vision`
  - 币安路由已由 sniffer SNI 识别 + `DOMAIN-SUFFIX` 规则正确处理，fake-ip-filter 豁免为冗余
- ★ FIX：`sniffer.skip-domain` 移除无效条目 `Mijia Cloud`（含空格，非合法域名，永不匹配任何 SNI hostname）
- 版本号 `v5.3.0-oc-normal.1` → `v5.3.0-oc-normal.2`

### v5.3.0-oc-normal.1 (2026-04-26) — 同上

### v5.2.11-oc-normal.1 (2026-04-26) — 业务组合并：4 个冗余组 → 保留组 + 新增「🔧 工具与服务」

- ★ **合并业务策略组（28 → 25）：** 跟随 Clash Party v5.2.11 基线清理
  - 删除 `📧 邮件服务`：规则全部改路由到 `🌐 国外网站`
  - 删除 `🔍 搜索引擎` + `📟 开发者服务`：合并为 `🔧 工具与服务`
  - 删除 `☁️ 云与CDN`：规则全部改路由到 `🌐 国外网站`
  - `📥 下载更新`：`*id003` → `*id002`（默认代理优先级提高）
- Bump: `v5.2.10-oc-normal.2` → `v5.2.11-oc-normal.1`
- 同步 OpenClash Full（相同改动）

### v5.2.10-oc-normal.2 (2026-04-25) — FIX: sniffer.skip-domain 误含币安域名导致 TLS 流量按 IP 路由

- ★ **FIX：OpenClash sniffer.skip-domain 误含 3 条币安域名，导致 TLS SNI 改写被跳过**
  - 现象：freqtrade/量化交易容器访问 `data.binance.vision`、`fapi.binance.com` 等时出现
    `ContentLengthError` / `Cannot connect` / `TimeoutError`
  - 根因：`sniffer.skip-domain` 含 `+.binance.com` / `+.binancefuture.com` / `+.binance.vision`，
    sniffer 嗅出 SNI 后跳过域名改写，导致流量按原始 IP 路由 → 不命中
    `DOMAIN-SUFFIX,binance.*,💰 加密货币` → `MATCH` → 🐟 漏网之鱼 → 代理节点拒接或无 SNI 流量超时
  - 修复：删除 `skip-domain` 中 3 条币安条目，保留 `+.push.apple.com` 和 `Mijia Cloud`。
    fake-ip 层仍正常给币安分配真实 IP，sniffer 嗅出 SNI 后按 `DOMAIN-SUFFIX` 规则正确分流到 💰 加密货币组
  - 版本号 `v5.2.10-oc-normal.1` → `v5.2.10-oc-normal.2`

### v5.2.10-oc-normal.1 (2026-04-25) — 境外 DoH 端点改路由到 🚫 受限网站

- ★ **FIX#39**（同构联动）：跟随 Clash Party v5.2.10 基线
  - `DOMAIN,dns.google,☁️ 云与CDN` → `"DOMAIN,dns.google,\U0001F6AB 受限网站"`
  - `DOMAIN,dns.google.com,☁️ 云与CDN` → `"DOMAIN,dns.google.com,\U0001F6AB 受限网站"`
  - `DOMAIN-SUFFIX,cloudflare-dns.com,☁️ 云与CDN` → `"DOMAIN-SUFFIX,cloudflare-dns.com,\U0001F6AB 受限网站"`
  - 用 `\U0001F6AB` 转义形式与本文件中其他 `🚫 受限网站` 规则保持一致
- ★ 同步 Ruby 脚本 `VERSION` 常量 + heredoc 头部 `VERSION_TAG`
- Bump: `v5.2.9-oc-normal.5` → `v5.2.10-oc-normal.1`（主版本追平到 v5.2.10）

### v5.2.9-oc-normal.5 (2026-04-25) — 兼容性审计修复

- ★ FIX-OC-01：REGIONS 正则补齐 HK/TW/JP/SG/US 的 `\b` word boundary
  - `HK` → `\bHK\b`（防命中 HKG/HKUST）、`TW` → `\bTW\b`（防命中 TWN/TWICE）
  - `JP` → `\bJP\b`（防命中 JPG/JPMorgan）、`SG` → `\bSG\b`（防命中 SGP）
  - `US\b` → `\bUS\b`（补起始 boundary，防 FOCUS 等内含 US 的词误匹配）
  - 同步 OpenClash Full
- ★ FIX-OC-01α：显式补齐 alpha-3 码 `HKG`/`TWN`/`JPN`/`SGP`（`\b` 丢失子串匹配能力后需显式声明，与 FIX#24 的 `KOR` 做法一致）
- Bump: `v5.2.8-oc-normal.4` → `v5.2.9-oc-normal.5`

### v5.2.8-oc-normal.4 (2026-04-24) — DNSPod DoH 端点切换为纯 IP 形式

- ★ `nameserver` / `proxy-server-nameserver` / `direct-nameserver` 三段里的
  `https://doh.pub/dns-query` 全部替换为 `https://1.12.12.12/dns-query`
  - DNSPod 纯 IP 形式 DoH 端点，**无需 bootstrap 解析 `doh.pub` 域名**，消除冷启动时
    DoH 自依赖的潜在死锁
- 版本号 `v5.2.8-oc-normal.3` → `v5.2.8-oc-normal.4`

### v5.2.8-oc-normal.3 (2026-04-23)

- ★ **FIX#28-P0**（节点分类多归属）：🌏 亚太节点组缺 HK/TW/JP/KR、🌎 美洲节点组缺 US
  - 现象（用户报告）：OpenClash 亚太组里看不到香港/台湾/日韩节点；美洲组里看不到美国节点。
  - 根因：Ruby 分类循环用 `GROUP_MAP.each { ... break }`，每个节点的 region code 只会命中 `GROUP_MAP` 里第一个包含它的条目 → HK 永远停在 `"HK" => ["HK"]`、US 永远停在 `"US" => ["US"]`，永远走不到 `"APAC"` / `"AM"` 条目。而 Clash Party JS 主线语义是 `apacNodes = c.HK.concat(c.TW, c.CN, c.JP, c.KR, c.SG, c.APAC_OTHER)` / `americasNodes = c.US.concat(c.AM)`，子区域与所属大洲**同时归属**。
  - 修复（L4275 ~ L4332）：
    - `GROUP_MAP["APAC"]` 扩充为 `["HK", "TW", "JP", "KR", "SG", "IN", "TH", "VN", "MY", "ID", "PH", "AU", "NZ", "TR", "AE"]`
    - `GROUP_MAP["AM"]` 扩充为 `["US", "CA", "MX", "BR", "AR"]`
    - 分类循环去掉 `break` —— 同一节点可同时进入子区域组（香港/台湾/日韩/美国）与所属大洲组（亚太/美洲）
  - 同构 bug 审计（CLAUDE.md §1.5 强制）：Ruby 双脚本 + CMFA YAML 均命中同构 bug，本 PR 一并修复（OpenClash Normal / OpenClash Full / CMFA）。Clash Party JS / Clash Party Normal JS / Shadowrocket / Surge / Loon / QX 经核对均已有正确覆盖，无需改动；SingBox / v2rayN 无运行时节点分类（N/A）。

### v5.2.7-oc-normal.1 (2026-04-23)

- ★ **FIX#27-P1**（与 Clash Party v5.2.7 同步）：消除 mihomo 加载 3 个 classical rule-provider 的 parse warning
  - 现象：OpenClash → mihomo 启动 / reload 日志反复打印
    - `parse classical rule [USER-AGENT,TikTok*] error: unsupported rule type: USER-AGENT`
    - `parse classical rule [USER-AGENT,BBCiPlayer*] error: unsupported rule type: USER-AGENT`
    - `parse classical rule [IP-CIDR , 17.253.4.125] error: payloadRule error`
  - 根因：upstream `szkane/ClashRuleSet` 的 `CiciAi.list` / `UK.list` 各有 1 行 USER-AGENT（mihomo 不识别）；upstream `Accademia/...` 的 `Grok.yaml` 有 1 行 `IP-CIDR         , 17.253.4.125`（多余空格 + 缺 mask）
  - 修复：把 `szkane-ciciai` / `szkane-uk` / `acc-grok` 的 URL 切到本仓库 `mirrors/` 子目录的清洗副本（仅删问题行，剩余规则字节级一致）
  - 跟随基线：Clash Party v5.2.7 → Normal bump 到 `v5.2.7-oc-normal.1`

### v5.2.6-oc-normal.1 (2026-04-22)

- ★ **FIX#24-P0**（同构 bug 补齐）：Ruby `REGIONS` 哈希补 `KOR` 字面量
  - 现象：`KR  => /韩国|韓國|KR|Korea|Korean|🇰🇷|Seoul/i`。Ruby 正则对 `"KOR 01"` 做子串匹配时，
    `KR` 不是 `KOR` 的子串（字母序 K-O-R，无连续 K-R），`Korea` 也不是 `KOR` 的子串 → `KOR` 节点
    被归为 `nil`（UNCLASSIFIED），从而不进入 🇯🇵 日韩节点组
  - 修复：L4086 追加 `KOR` 字面量 → `KR  => /韩国|韓國|KR|KOR|Korea|Korean|🇰🇷|Seoul/i`
  - 附注：`TW` 已通过 `/TW/i` 子串命中 `TWN`、`JP` 已通过 `/JP/i` 子串命中 `JPN`、`SG` 已通过
    `/SG/i` 子串命中 `SGP`，这三个本次无需改（Ruby 正则无 word boundary，与 JS 行为不同）
  - 同步 Clash Party v5.2.6 FIX#24

## Normal（`OpenClash(mihomo).sh`）

### v5.3.5-dedup-acc-china (2026-04-20)

- ★ 同步 Clash Party v5.2.5 FIX#23-P1：删除 `acc-china`（与 `geosite:cn` 纯重复；Normal 从 v5.3.4 起已不含 `acc-geositecn`，本次只删 `acc-china`）
- 收益：Normal provider 数 136 → 135；省 ~2 MB 内存 + 1 次冷启动 HTTP 拉取

### v5.3.4-align-dns-baseline (2026-04-20)

- ★ 对齐 Clash Party 基线 DNS（`Clash Party/README.md` 第 99-132 行）：
  - `use-hosts: true` → `false`
  - `default-nameserver` 从纯海外（1.1.1.1 / 8.8.8.8 / 9.9.9.9 …）改为基线顺序：`223.5.5.5 / 119.29.29.29 / 1.1.1.1 / 8.8.8.8`
  - `nameserver`: `223.5.5.5` DoH + `doh.pub` DoH（国内域名走国内解析）
  - `direct-nameserver`: 同 `nameserver`（走国内 DoH）
  - `proxy-server-nameserver`: `1.1.1.1` + `8.8.8.8` + `223.5.5.5` + `doh.pub`（4 项）
  - `fallback`: 仅 `1.1.1.1` + `8.8.8.8`（基线只列两个）
  - 删除非基线的 `direct-nameserver-follow-policy: false`
  - 移除"救援模式"注释（原救援模式已由 `nameserver-policy` 的 jsdelivr/github 直连策略覆盖）

### v5.3.3-align-rp-proxy-gfw (2026-04-20)

- ★ rule-providers `proxy: DIRECT` → `proxy: 🚫 受限网站`（136 处），对齐 Clash Party FIX#17-P0

### v5.3.2-dns-rescue-no-rules (之前)

- ★ 基础版本，含 DNS 冷启动救援 + 内存优化

### v5.3.1 性能基线（历史）

基于 `v5.2.4-oc` 针对 OOM 问题重构：

- **优化 #1** `geodata-loader: standard → memconservative`：节省 ~400–600 MB。`geosite.dat` / `geoip.dat` 改为 mmap 按需读取；代价：首次规则命中延迟 +几 ms（路由器场景无感）。
- **优化 #2** `rule-providers` 387 → 136（砍 65%）：节省 ~800–1,100 MB。
  - 合并 Google 家族（GoogleSearch / Drive / Earth / FCM / Voice → google 单项）
  - 合并 Apple 细分（AppleTV / News / Dev / Proxy / Siri / TestFlight / Firmware / FindMy → apple + icloud）
  - 删除区域化通讯分片（TelegramNL / SG / US、KakaoTalk、Zalo、GoogleVoice、iTalkBB）
  - 删除低频冷门（大陆长尾流媒体、欧洲 / 日本分区、非洲 / 南美 GeoRouting）
  - 删除冗余广告拦截（10+ 个功能重叠的 blackmatrix7 广告集）

保留不变：9 个 Smart 组（`uselightgbm: true + include-all-proxies: true`）、动态节点分类、DNS 多层架构、sniffer 配置、TLS 指纹注入、节点过滤、TCP 并发。

---

## Full（`OpenClash(mihomo-smart).sh`）

### v5.4.0-oc-smart.1 (2026-05-05)

- ★ FEAT#SG：新增 🇸🇬 狮城节点 + 🏡 狮城家宽 独立 Smart 区域组
  - 新加坡从 🌏 亚太节点 中拆分为独立区域
  - 区域组总数：18 → 20（10 全部 + 10 家宽），总组数：49 → 51
  - 跟随基线 Clash Party v5.4.0

### v5.3.0-oc-full.2 (2026-04-26) — FIX: sniffer skip-domain 无效条目

- ★ FIX：`sniffer.skip-domain` 移除无效条目 `Mijia Cloud`（含空格，非合法域名，永不匹配任何 SNI hostname；与 CMFA 对齐）
- 版本号 `v5.3.0-oc-full.1` → `v5.3.0-oc-full.2`

### v5.3.0-oc-full.1 (2026-04-26) — 同上

### v5.2.11-oc-full.1 (2026-04-26) — 业务组合并：28 → 25（与 Normal 同步）

- ★ **业务组合并（28 → 25）：** 与 Normal 同步
  - 删除 `📧 邮件服务`（规则路由到 `🌐 国外网站`）
  - 删除 `🔍 搜索引擎` + `📟 开发者服务`（合并为 `🔧 工具与服务`）
  - 删除 `☁️ 云与CDN`（规则路由到 `🌐 国外网站`）
  - `📥 下载更新` 默认代理从 DIRECT 优先改为代理优先
- Bump: `v5.2.10-oc-full.2` → `v5.2.11-oc-full.1`

### v5.2.10-oc-full.2 (2026-04-25) — FIX: sniffer.skip-domain 误含币安域名导致 TLS 流量按 IP 路由

- ★ sniffer.skip-domain 删除 3 条币安域名（与 Normal 同步）
  - 根因 / 修复 / 影响同 Normal `v5.2.10-oc-normal.2`
  - 版本号 `v5.2.10-oc-full.1` → `v5.2.10-oc-full.2`

### v5.2.10-oc-full.1 (2026-04-25) — 境外 DoH 端点改路由到 🚫 受限网站

- ★ **FIX#39**（同构联动，与 Normal 完全一致）：跟随 Clash Party v5.2.10 基线
  - `DOMAIN,dns.google,☁️ 云与CDN` → `"DOMAIN,dns.google,\U0001F6AB 受限网站"`
  - `DOMAIN,dns.google.com,☁️ 云与CDN` → `"DOMAIN,dns.google.com,\U0001F6AB 受限网站"`
  - `DOMAIN-SUFFIX,cloudflare-dns.com,☁️ 云与CDN` → `"DOMAIN-SUFFIX,cloudflare-dns.com,\U0001F6AB 受限网站"`
- Bump: `v5.2.9-oc-full.5` → `v5.2.10-oc-full.1`（主版本追平到 v5.2.10）

### v5.2.9-oc-full.5 (2026-04-25) — 兼容性审计修复

- ★ FIX-OC-01：REGIONS 正则补齐 HK/TW/JP/SG/US 的 `\b` word boundary（与 Normal 同步）
- ★ FIX-OC-01α：显式补齐 alpha-3 码 `HKG`/`TWN`/`JPN`/`SGP`（与 Normal 同步）
- Bump: `v5.2.8-oc-full.4` → `v5.2.9-oc-full.5`

### v5.2.8-oc-full.4 (2026-04-24) — DNSPod DoH 端点切换为纯 IP 形式

- ★ `nameserver` / `proxy-server-nameserver` / `direct-nameserver` 三段里的
  `https://doh.pub/dns-query` 全部替换为 `https://1.12.12.12/dns-query`（与 Normal 同步）
  - DNSPod 纯 IP 形式 DoH 端点，**无需 bootstrap 解析 `doh.pub` 域名**，消除冷启动时
    DoH 自依赖的潜在死锁
- 版本号 `v5.2.8-oc-full.3` → `v5.2.8-oc-full.4`（shell + Ruby 两处 VERSION 同步 bump）

### v5.2.8-oc-full.3 (2026-04-23)

- ★ **FIX#28-P0**（节点分类多归属，与 Normal 同步）：
  - 现象 / 根因 / 修复同 `v5.2.8-oc-normal.3`（L4273 ~ L4325 对应位置）。
  - `GROUP_MAP["APAC"]` 扩展到 HK+TW+JP+KR+SG+其它亚太国家，`GROUP_MAP["AM"]` 扩展到 US+CA+MX+BR+AR，循环移除 `break`。
  - 同构 bug 审计：见 Normal v5.2.8-oc-normal.3 条目。

### v5.2.7-oc-full.1 (2026-04-23)

- ★ **FIX#27-P1**（与 Clash Party v5.2.7 同步）：消除 mihomo 加载 3 个 classical rule-provider 的 parse warning
  - 现象 / 根因：同 Normal 版 v5.2.7-oc-normal.1 —— upstream `CiciAi.list` / `UK.list` 各 1 行 `USER-AGENT,*`、`Grok.yaml` 1 行 `IP-CIDR         , 17.253.4.125`（多余空格 + 缺 mask）
  - 修复：把 `szkane-ciciai` / `szkane-uk` / `acc-grok` 的 URL 切到本仓库 `mirrors/` 子目录的清洗副本
  - 跟随基线：Clash Party v5.2.7 → Full bump 到 `v5.2.7-oc-full.1`

### v5.2.6-oc-full.1 (2026-04-22)

- ★ **FIX#24-P0**（同构 bug 补齐）：Ruby `REGIONS` 哈希补 `KOR` 字面量
  - 同 Normal 版 v5.2.6-oc-normal.1：L4085 `KR` 正则追加 `KOR`
  - 同步 Clash Party v5.2.6 FIX#24

### v5.2.5-oc-full.1 (2026-04-20)

- ★ 同步 Clash Party v5.2.5 FIX#23-P1：删除 `acc-geositecn` + `acc-china`（与 `geosite:cn` 纯重复）
- 收益：full provider 数 387 → 385；省 ~5 MB 内存 + 2 次冷启动 HTTP 拉取
- Ruby Psych 解析验证：`providers=385 rules=975`（预期减 2 provider、减 2 rule line）

### v5.2.4-oc-full.1 (2026-04-20)

- ★ 同步 Clash Party v5.2.4 FIX#22-P0：snapchat rule-provider 拉取 403 修复
  - MetaCubeX meta-rules-dat 上游文件名是 `snap.mrs` 不是 `snapchat.mrs`
  - URL 改为 `.../geosite/snap.mrs`；path 改为 `./ruleset/meta-snap.mrs`
  - provider ID 保持 `snapchat`（`[Rule]` 段引用不变）

### v5.2.3-oc-full.2 (2026-04-20)

- ★ 对齐 Clash Party 基线 DNS（`Clash Party/README.md` 第 99-132 行）：
  - `use-hosts: true` → `false`
  - `default-nameserver`: `223.5.5.5 / 119.29.29.29 / 1.1.1.1 / 8.8.8.8`（基线顺序）
  - `nameserver / direct-nameserver`: `223.5.5.5` DoH + `doh.pub` DoH
  - `proxy-server-nameserver`: `1.1.1.1` + `8.8.8.8` + `223.5.5.5` + `doh.pub`
  - `fallback`: `1.1.1.1` + `8.8.8.8`
  - 删除非基线字段 `direct-nameserver-follow-policy`
  - 移除"救援模式"注释（功能仍在，靠 `nameserver-policy` 覆盖）

### v5.2.3-oc-full.1 (2026-04-20)

- ★ 同步 Clash Party v5.2.3 FIX#21-P1：BBC / Snapchat(Snap) 规则从 blackmatrix7 classical yaml 切换到 MetaCubeX meta-rules-dat 的 `.mrs` geosite（domain + mrs），消除 mihomo 对 `USER-AGENT,BBCiPlayer*` 与 `USER-AGENT,TikTok*` 的解析警告。
- ★ **CRITICAL FIX**：删除被意外追加在末尾的 Normal `rule-providers`(136) + `rules`(678) 块（原文件 6115 行 → 4285 行）。Ruby 的 Psych YAML 解析器对重复顶层键遵循 "last-wins" 规则，之前这两个追加块会静默覆盖前面的 Smart 块，导致 `OpenClash(mihomo-smart).sh` 实际运行时跑的是 Normal 内容，并且 Normal 块里 ad-block providers 还错用了 `proxy: DIRECT`。修复后 OC Smart 真正实现了与 Clash Party 主线的规则数量对齐。
- ★ 头部注释按 `CLAUDE.md §1.3` 扩展（介绍 / 架构 / 变更日志 / 基线对齐声明）。

### v5.2.2-oc-full (初版)

- ★ 从 Clash Party v5.2.2 JS 主线转换为 OpenClash heredoc YAML + Ruby 处理器。
