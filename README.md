# 🚀 科学上网智能分流配置中心

> 一套以 **Mihomo Smart 内核 JS 覆写脚本**为基线、同步产出 12 种客户端等价配置的分流体系。同一套策略覆盖 Windows / macOS / Linux / Android / iOS / OpenWrt，避免”设备 A 可用、设备 B 抽风”。
>
> - 🧩 **22 区域组 + 32 业务组**：按语义精细分流（AI / 流媒体 / 社交 / 游戏 / 广告拦截 …），385+ rule-provider 全覆盖
> - ⚡ **Smart / Normal 双内核**：同规则量，按内核能力选 `smart`（LightGBM ML 择路）或经典 `url-test`
> - 🤖 **AI 全仓维护**：代码 / 规则 / 文档均由 AI 编写迭代；[Issue](https://github.com/ivansolis1989/Smart-Config-Kit/issues/new/choose) 触发 AI 自动回答，[Telegram 群](https://t.me/Olympus_Habitue) 可讨论
> - ⚠️ Mihomo 内核由本人实测，其他内核请自行验证后使用

<sub>💖 [支持本项目](./docs/donate.md) · ⭐ [Star](https://github.com/ivansolis1989/Smart-Config-Kit) · 🐛 [Issue](https://github.com/ivansolis1989/Smart-Config-Kit/issues)</sub>

---

## 🧭 分流策略设计框架（重点）

```mermaid
---
config:
  flowchart:
    htmlLabels: true
    wrappingWidth: 800
---
flowchart TB
    A(["📡&nbsp;订阅节点池"])
    A --> B{{"节点清洗&nbsp;·&nbsp;命名识别&nbsp;·&nbsp;保留倍率节点&nbsp;+&nbsp;家宽识别"}}
    B --> C("🌍&nbsp;<b>区域层</b>&nbsp;Smart&nbsp;Region&nbsp;—&nbsp;按地区聚合&nbsp;+&nbsp;url-test&nbsp;/&nbsp;Smart&nbsp;自动择路")
    C --> D("🧱&nbsp;<b>业务层</b>&nbsp;Service&nbsp;Policy&nbsp;—&nbsp;AI&nbsp;/&nbsp;流媒体&nbsp;/&nbsp;社交&nbsp;/&nbsp;开发&nbsp;/&nbsp;CDN&nbsp;/&nbsp;广告&nbsp;按语义分组")
    D --> E("📚&nbsp;<b>规则层</b>&nbsp;Rule&nbsp;Provider&nbsp;—&nbsp;社区规则源拼装&nbsp;+&nbsp;按平台资源裁剪")
    E --> F("🔍&nbsp;<b>DNS·嗅探层</b>&nbsp;Resolver+Sniffer&nbsp;—&nbsp;分层&nbsp;DNS（国内/国外/回退）+&nbsp;嗅探协同")
    F --> G("🛟&nbsp;<b>兜底层</b>&nbsp;Fallback&nbsp;—&nbsp;GEOIP&nbsp;/&nbsp;GEOSITE&nbsp;/&nbsp;Private&nbsp;兜底")

    style A fill:#FFE9E9,stroke:#C0392B,stroke-width:2px,color:#000
    style B fill:#F5F5F5,stroke:#888,stroke-width:1px,color:#000
    style C fill:#FFF6E9,stroke:#F39C12,stroke-width:2px,color:#000
    style D fill:#EEF9F1,stroke:#27AE60,stroke-width:2px,color:#000
    style E fill:#EAF4FF,stroke:#4A90E2,stroke-width:2px,color:#000
    style F fill:#F3F0FF,stroke:#8E44AD,stroke-width:2px,color:#000
    style G fill:#FFEFF0,stroke:#E74C3C,stroke-width:2px,color:#000
```

每一层只做一件事，上层稳定下层就稳定——订阅换了、机场改了、规则上游变了，只影响**对应那一层**，不会全链路翻车。

---

## 🧩 Smart 分流规则：32 代理组速览（含 14 流媒体平台组）

为了让结构更清晰，下面用”**分层卡片 + 关系图**”展示 32 个代理组，而不是单一大表。

```mermaid
flowchart LR
    A(入口总控 2组) --> B(核心业务 10组)
    B --> C(区域选路 8组)
    C --> D(基础能力 5组)
    D --> E(兜底直连 3组)

    style A fill:#EAF4FF,stroke:#4A90E2,stroke-width:1px
    style B fill:#EEF9F1,stroke:#27AE60,stroke-width:1px
    style C fill:#FFF6E9,stroke:#F39C12,stroke-width:1px
    style D fill:#F3F0FF,stroke:#8E44AD,stroke-width:1px
    style E fill:#FFEFF0,stroke:#E74C3C,stroke-width:1px
```

### 🗂️ 代理组与主要 Rule-Providers 对照（Clash Party 实际 32 业务组）

> 只列“主要/高频命中”项，并标明规则来源仓库；不再混入节点组（HK/US/全球节点等）。

| 代理组（与脚本一致） | 主要 rule-providers（示例） | 主要来源仓库 |
|---|---|---|
| 🤖 AI 服务 | `openai` `claude` `gemini` `copilot` `szkane-ai` `acc-copilot` | MetaCubeX / blackmatrix7 / szkane / Accademia |
| 💰 加密货币 | `cryptocurrency` `binance` `szkane-web3` | blackmatrix7 / szkane |
| 🏦 金融支付 | `paypal` `stripe` `paddle.com` `visa` `tigerfintech` `acc-bank-*` `acc-vf-*` | blackmatrix7 / Accademia / 本地误伤白名单 |
| 💬 即时通讯 | `telegram` `telegram-ip` `discord` `whatsapp` `line` `kakaotalk` `acc-signal` | MetaCubeX / blackmatrix7 / Accademia |
| 📱 社交媒体 | `twitter` `twitter-ip` `tiktok` `facebook` `instagram` `snapchat` `reddit` | MetaCubeX / blackmatrix7 |
| 🧑‍💼 会议协作 | `zoom` `slack` `teams` `atlassian` `notion` `remotedesktop` `acc-rustdesk` `domain-suffix:rustdesk.com` | ACL4SSR / blackmatrix7 / Accademia |
| 📺 国内流媒体 | `bilibili` `iqiyi` `youku` `tencentvideo` `douyin` `neteasemusic` | blackmatrix7 |
| 🎵 TikTok | `tiktok` | MetaCubeX |
| 🎥 Netflix | `netflix` `netflix-ip` `szkane-netflixip` | MetaCubeX / szkane |
| 🎬 Disney+ | `disney` | blackmatrix7 |
| 📡 HBO/Max | `hbo` | blackmatrix7 |
| 📺 Hulu | `hulu` | blackmatrix7 |
| 🎬 Prime Video | `primevideo` `amazon` | blackmatrix7 |
| 📹 YouTube | `youtube` | MetaCubeX |
| 🎵 音乐流媒体 | `spotify` `tidal` `deezer` `soundcloud` `pandora` `lastfm` `qobuz` `overcast` | blackmatrix7 |
| 🇭🇰 香港流媒体 | `mytvsuper` `tvb` `encoretvb` `nowe` `rthk` `szkane-bilihmt` | blackmatrix7 / szkane |
| 🇹🇼 台湾流媒体 | `bahamut` `kktv` `litv` `hamivideo` `linetv` `friday` | blackmatrix7 |
| 🇯🇵 日韩流媒体 | `abema` `dazn` `dmm` `tver` `niconico` `rakuten` | blackmatrix7 |
| 🇪🇺 欧洲流媒体 | `bbc` `itv` `all4` `my5` `skygo` `britboxuk` `szkane-uk` | MetaCubeX / blackmatrix7 / szkane |
| 🌐 其他国外流媒体 | `viu` `biliintl` `iqiyiintl` `wetv` `viki` `paramount` `peacock` `twitch` `vimeo` `dailymotion` `acc-kwai` | blackmatrix7 / Accademia |
| 🕹️ 国内游戏 | `steamcn` `wanmeishijie` `wankahuanju` `majsoul` | blackmatrix7 |
| 🎮 国外游戏 | `steam` `epic` `playstation` `xbox` `riot` `ea` `hoyoverse` | blackmatrix7 |
| 🔧 工具与服务 | `google` `google-ip` `googlesearch` `bing` `scholar` `yandex` `github` `docker` `gitlab` `python` `developer` `szkane-developer` | MetaCubeX / blackmatrix7 / szkane |
| Ⓜ️ 微软服务 | `onedrive` `microsoft` `microsoftedge` `acc-microsoftapps` | blackmatrix7 / Accademia |
| 🍎 苹果服务 | `apple` `icloud` `appstore` `appletv` `applemusic` `acc-apple` `acc-applenews` | blackmatrix7 / Accademia |
| 📥 下载更新 | `googlefcm` `systemota` `download` `ubuntu` `mozilla` `android` `acc-macappupgrade` | blackmatrix7 / Accademia |
| 🛰️ BT/PT Tracker | `privatetracker` `acc-emuleserver` | blackmatrix7 / Accademia |
| 🏠 国内网站 | `cn` `cn-ip` `acc-geositecn` `acc-chinamax` `acc-china` `acc-geo-d-asia-china` | MetaCubeX / blackmatrix7 / Accademia |
| 🚫 受限网站 | `loyalsoldier-gfw` `loyalsoldier-greatfire` `szkane-proxygfw` | Loyalsoldier / szkane |
| 🌐 国外网站 | `proxy` `cnn` `nytimes` `bloomberg` `ebay` `wikipedia` `acc-waybackmachine` `mail` `protonmail` `cloudflare` `fastly` `akamai` | blackmatrix7 / Accademia / szkane / MetaCubeX |
| 🐟 漏网之鱼 | 以 GEOSITE/GEOIP/FINAL 兜底为主（非单一固定 provider） | MetaCubeX（geo 规则） |
| 🛑 广告拦截 | `anti-ad` `sukka-phishing` `hagezi-tif` `advertising` `privacy` `acc-unsupportvpn` | DustinWin / SukkaW / Hagezi / blackmatrix7 / Accademia |


---

## 🎯 差异化价值：为什么在 geosite / geoip 之上还要叠加 300 个 rule-provider

> IP 分类（国家码 / 服务标签）直接用原生 Loyalsoldier `geoip.dat`，**零增量**。补充全在域名分类层，且每条 rule-provider 必须回答「比原生 dat 多解决了什么」，否则拒绝加入。
>
> 代理组嵌套 / Smart / LightGBM 等架构能力见上一章。覆盖审查流程见 [docs/GEOSITE_COVERAGE_LEDGER.md](./docs/GEOSITE_COVERAGE_LEDGER.md)。

| 类型 | geosite 做不到的事 | 本仓库怎么补 | 典型例子 |
|---|---|---|---|
| **① 新兴服务** | 新 AI / Web3 上线后 2–4 周才收录 | `szkane-ai` / `acc-grok` + 手工 `DOMAIN-SUFFIX` | cursor.com · character.ai · openrouter.ai · CiciAI |
| **② 子类拆分** | `geosite:apple` 是一个整体，无法让 AppStore 直连 + TestFlight 走代理 | bm7 拆成 12 个独立 provider | Apple / Google / Microsoft 家族各子服务独立决策 |
| **③ 安全纵深** | `category-ads-all` 只管广告，不管钓鱼 / 恶意软件 / SDK 埋点 / DNS 劫持 | 9 个来源互补覆盖不同威胁类型 | anti-AD（广告）+ sukka-phishing（13 万钓鱼）+ hagezi-tif（malware/C2） |
| **④ 地区长尾** | 国际社区不维护中国特有 SDK / 港澳台细分 / IoT ASN | szkane / Accademia 补充 | B 站港澳台版 · 绿米 IoT · 美日住宅 IP 段 |

> **加法原则**：和 geosite >95% 重叠 → ❌ 拒绝加入（v5.2.5 据此删 `acc-geositecn` / `acc-china`）。

---

## 🛡️ DNS 净化

> 分流规则配得再好，DNS 漏了照样白搭。GFW 污染 / ISP 劫持 / 运营商审计 / 节点 IP 暴露——**全从 DNS 层下手**。加密 DoH 不是可选项，是必选项。

### 本仓库的 DNS 四层分工

```mermaid
---
config:
  flowchart:
    htmlLabels: true
    wrappingWidth: 1000
    nodeSpacing: 50
    rankSpacing: 60
  themeVariables:
    fontSize: 18px
---
flowchart TB
    Start(["<b>🚀 客户端启动</b>"])

    L1["<b>① default-nameserver</b> &nbsp;·&nbsp; 明文 UDP &nbsp;·&nbsp; 仅用于 bootstrap<br/><br/><b>223.5.5.5 &nbsp;·&nbsp; 119.29.29.29 &nbsp;·&nbsp; 1.1.1.1 &nbsp;·&nbsp; 8.8.8.8</b><br/>启动时解析下方 DoH 服务的域名（dns.alidns.com 等）<br/>只查 4 个 IP，不参与任何业务查询 &nbsp;→&nbsp; 零暴露面"]

    Gate{{"<b>🔀 按域名性质分三路查询</b>"}}

    L2["<b>② nameserver</b> &nbsp;·&nbsp; 国内域名主通道 &nbsp;·&nbsp; DoH<br/><br/><b>AliDNS</b> &nbsp; https://dns.alidns.com/dns-query<br/><b>DNSPod</b> &nbsp; https://doh.pub/dns-query<br/>大陆站点 / 国内 CDN 用国内权威 DoH &nbsp;→&nbsp; 不被 ISP 记录"]

    L3["<b>③ proxy-server-nameserver</b> &nbsp;·&nbsp; 机场节点域名解析 &nbsp;·&nbsp; DoH<br/><br/><b>Cloudflare</b> &nbsp; https://cloudflare-dns.com/dns-query<br/><b>Google</b> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; https://dns.google/dns-query<br/><b>AliDNS</b> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; https://dns.alidns.com/dns-query<br/><b>DNSPod</b> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; https://doh.pub/dns-query<br/>解析 node.xxx-airport.com 走加密 DoH<br/>→&nbsp; 节点域名与 IP 都不暴露给 ISP，也不被 DNS 污染"]

    L4["<b>④ fallback</b> &nbsp;·&nbsp; 海外域名回退通道 &nbsp;·&nbsp; DoH + GeoIP 解毒<br/><br/><b>Cloudflare</b> &nbsp; https://cloudflare-dns.com/dns-query<br/><b>Google</b> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; https://dns.google/dns-query<br/><b>fallback-filter.geoip-code: CN</b><br/>海外域名若查出 CN 段 IP（说明被污染）<br/>→&nbsp; 自动切 fallback 重查，避开 GFW 注入的假 IP"]

    Start --> L1
    L1 ==>|"<b>bootstrap 成功后，所有业务查询全走加密 DoH</b>"| Gate
    Gate -->|"国内域名 / 国内 CDN"| L2
    Gate -->|"机场节点域名"| L3
    Gate -->|"海外域名"| L4
    L2 ~~~ L3
    L3 ~~~ L4

    style Start fill:#FFE9E9,stroke:#C0392B,stroke-width:3px,color:#000
    style L1 fill:#F5F5F5,stroke:#555,stroke-width:2px,color:#000
    style Gate fill:#FFF6E9,stroke:#F39C12,stroke-width:3px,color:#000
    style L2 fill:#EEF9F1,stroke:#27AE60,stroke-width:2px,color:#000
    style L3 fill:#EAF4FF,stroke:#4A90E2,stroke-width:2px,color:#000
    style L4 fill:#F3F0FF,stroke:#8E44AD,stroke-width:2px,color:#000
```

> 完整 YAML + 验证命令 + 各端 DNS 内置状态表，见 `Clash Party/README.md` 第四章。

---

## ✅ 导入后 60 秒验证清单

导入任一端产物后，先看这 6 件事，能快速判断是配置问题、规则下载问题，还是节点质量问题。

1. **节点与策略组存在**：Mihomo / Apple 系客户端应看到 22 区域组 + 32 业务组；sing-box Full 应看到 53 个出站；v2rayN Xray 路径没有业务策略组是正常限制。
2. **规则源下载完成**：Clash / OpenClash / CMFA / FlClash 里 `rule-providers` 不应有大面积 403 / 404；Surge / Loon / QX 看远程规则列表是否下载成功；sing-box 看 `rule_set` 是否全部可用。
3. **广告误伤安全阀生效**：访问或规则测试 `paddle.com` 应命中 `🏦 金融支付`，`cloudflarestorage.com` 应命中 `🌐 国外网站`，都不是 `🛑 广告拦截`；小米账号/云服务域名应走 `DIRECT`。
4. **GEOSITE 基础命中正常**：`geosite:private` / 局域网应直连，`geosite:gfw` 应进入 `🚫 受限网站`，`geosite:category-ads-all` 应进入广告拦截。
5. **DNS 没泄漏**：按上方 DNS 检查确认只看到预期 DoH 上游，不应看到本地 ISP DNS。
6. **最终兜底可解释**：连接日志里落到 `🐟 漏网之鱼` 的域名要能解释；如果某个新服务长期落入 FINAL，再按 [GEOSITE 覆盖台账](./docs/GEOSITE_COVERAGE_LEDGER.md) 判断是否补 provider。

---

## 🔌 各端协议支持 + 快速导入速查

一张表搞定："**机场给什么协议 → 选哪个端 → 去哪看教程**"。列名缩写 + 具体配置文件 → 见表下方。

| 协议 | Clash<br>Party | CMFA | Open<br>Clash | Shadow<br>rocket | Surge | Loon | QX | sing-<br>box | v2rayN<br>Xray | v2rayN<br>mihomo |
|---|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|
| **SS (+ 2022)** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **SSR** | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ | ❌ | ❌ | ✅¹ |
| **VMess** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **VLESS** | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ | ⚠️ | ✅ | ✅ | ✅ |
| **REALITY + Vision** | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ | ⚠️ | ✅ | ✅ | ✅ |
| **Trojan** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Hysteria 1** | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ | ❌ | ✅ | ❌ | ✅ |
| **Hysteria 2** | ✅ | ✅ | ✅ | ✅ | ⚠️² | ✅ | ❌ | ✅ | ❌ | ✅ |
| **TUIC v5** | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ | ❌ | ✅ | ❌ | ✅ |
| **WireGuard** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ | ⚠️ | ✅ |
| **AnyTLS** | ✅ | ✅ | ✅ | ✅ | ❌ | ⚠️ | ✅ | ✅ | ❌ | ✅ |
| **ShadowTLS** | ✅ | ✅ | ✅ | ✅ | ❌ | ⚠️ | ❌ | ✅ | ❌ | ✅ |
| **Snell v4** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ✅¹ |
| **Mieru** | ✅ | ✅ | ✅ | ⚠️ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅¹ |
| **SSH 出站** | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ✅ |
| **HTTP / SOCKS5** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **LightGBM 自动择优** | ✅³ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **📖 子目录** | [Clash Party](./Clash%20Party/) | [CMFA](./Clash%20Meta%20For%20Android/) | [OpenClash](./OpenClash/) | [Shadow<br>rocket](./Shadowrocket/) | [Surge](./Surge/) | [Loon](./Loon/) | [QX](./Quantumult%20X/) | [SingBox](./SingBox/) | [v2rayN](./v2rayN/) | [v2rayN](./v2rayN/) |

> ✅ 原生支持 · ⚠️ 部分 / 新版本才有 · ❌ 不支持
> ¹ 需 v2rayN 切到 mihomo 核心 · ² Surge 5.9+ 才有 · ³ 需 mihomo Smart Alpha + JS 覆写

**🏷️ 缩写速查**：Clash Party = Clash Party / Clash Verge Rev / Mihomo Party · CMFA = Clash Meta For Android（含 [ClashMi](https://github.com/KaringX/clashmi)）· FlClash = 跨平台 Flutter GUI · QX = Quantumult X · sing-box = SFA / SFM / SFI / Hiddify / Karing / HomeProxy · v2rayN Xray = v2rayN 默认核 · v2rayN mihomo = v2rayN 切 mihomo/sing-box 核

**📁 配置文件**：每个子目录的 `README.md` 内有完整说明，点击上方 📖 列进入。

**💡 选客户端**：常用协议（SS / VMess / Trojan）→ 按设备挑；VLESS + REALITY → Mihomo / sing-box / SR / Loon / v2rayN；Hysteria 2 / TUIC → 避开 Surge 旧版 / QX / Xray；想要 **LightGBM 自动择优** → 只能走 Clash Party / OpenClash + Smart Alpha 内核。

**🔌 软路由**：ShellClash（mihomo 核）→ 用 CMFA YAML · HomeProxy（sing-box 核）→ 用 SingBox JSON · Passwall / Passwall2（无 mihomo）→ 首选迁移到 OpenClash，或用 `Passwall2/` 展平参考 · SSR Plus+（已停更）→ 换 OpenClash · Happ（Xray 核）→ 用 v2rayN Xray JSON。详见各子目录 `README.md`。

---

## 📌 适用人群

- 想“一套配置跑多端”的用户；
- 不想手工维护大量策略组但又追求精细分流的用户；
- 希望借助 AI 持续优化配置工程质量的用户。

---

## 🙏 致谢

本仓库做**编排、覆写、适配**，真正的重活靠这些项目：

**🧠 内核**：[mihomo](https://github.com/MetaCubeX/mihomo) / [Smart Alpha](https://github.com/MetaCubeX/mihomo/tree/Alpha) / [LightGBM](https://github.com/vernesong/mihomo/releases/download/LightGBM-Model/Model.bin) / [sing-box](https://github.com/SagerNet/sing-box) / [Xray](https://github.com/XTLS/Xray-core) / [hiddify-sing-box](https://github.com/hiddify/hiddify-sing-box)

**📱 客户端**：[mihomo-party](https://github.com/mihomo-party-org/mihomo-party) / [Verge Rev](https://github.com/clash-verge-rev/clash-verge-rev) / [CMFA](https://github.com/MetaCubeX/ClashMetaForAndroid) / [FlClash](https://github.com/chen08209/FlClash) / [OpenClash](https://github.com/vernesong/OpenClash) / [HomeProxy](https://github.com/immortalwrt/homeproxy) / [ShellCrash](https://github.com/juewuy/ShellCrash) / [Passwall2](https://github.com/Openwrt-Passwall/openwrt-passwall2) / [v2rayN](https://github.com/2dust/v2rayN) / [Hiddify](https://github.com/hiddify/hiddify-app)

**📚 规则库**：[geosite](https://github.com/MetaCubeX/meta-rules-dat) / [geoip](https://github.com/Loyalsoldier/geoip) / [clash-rules](https://github.com/Loyalsoldier/clash-rules) / [v2ray-rules-dat](https://github.com/Loyalsoldier/v2ray-rules-dat)

**📦 规则集**：[bm7](https://github.com/blackmatrix7/ios_rule_script) / [Accademia](https://github.com/Accademia/Additional_Rule_For_Clash) / [DustinWin](https://github.com/DustinWin/ruleset_geodata) / [ACL4SSR](https://github.com/ACL4SSR/ACL4SSR) / [SukkaW](https://github.com/SukkaW/Surge) / [Hagezi](https://github.com/hagezi/dns-blocklists) / [MiHomo-Hagezi](https://github.com/MiHomoer/MiHomo-Hagezi) / [szkane](https://github.com/szkane/Rules) / [anti-AD](https://github.com/privacy-protection-tools/anti-AD)

**🛠️ 工具**：[Sub-Store](https://github.com/sub-store-org/Sub-Store) / [PROCESS-NAME 兼容清单](./docs/process-name-compatibility.md) / [QX 脚本](https://github.com/KOP-XIAO/QuantumultX) / [Qure 图标](https://github.com/Koolson/Qure) / [domain-list-community](https://github.com/v2fly/domain-list-community)

**💳 闭源客户端**：[Shadowrocket](https://apps.apple.com/app/shadowrocket/id932747118) / [Surge](https://nssurge.com/) / [Loon](https://apps.apple.com/app/loon/id1373567447) / [Quantumult X](https://apps.apple.com/app/quantumult-x/id1443988620)

> 遗漏了你的项目？欢迎 [开 Issue](https://github.com/ivansolis1989/Smart-Config-Kit/issues) 指出——**所有真正做事的人都值得被点名**。

---

## 💖 支持本项目

→ [捐赠 / Star / PR](./docs/donate.md)

---

## 📄 免责声明

本仓库是一个**纯技术学习项目**——记录一套代理分流策略在不同客户端上的等价实现，帮助开发者理解各代理引擎的配置语法差异。仓库不提供任何节点、订阅或翻墙服务。

- 所有配置文件仅供**个人技术研究与学习**，请勿用于违反所在地法律法规的用途。
- 使用前请确认符合当地法律，风险自担。
- 本项目不鼓励也不协助任何形式的违规传播。

---

## 📄 License

默认采用 **MIT License**。第三方规则与数据资产遵循其各自许可证。
