# Clash 自用覆写脚本 / 配置集合

一套面向 **Mihomo Smart 内核** 的多平台 Clash 覆写脚本与配置文件，统一「9 区域 × 28 业务组」架构，跨 Android / iOS / OpenWrt / 桌面端保持同一套分流逻辑。

> 仓库目标：让同一份机场订阅在不同设备上获得**一致的分流体验**、**精细的业务归组**和**尽可能低的误判率**。

---

## 目录结构

```
Clash/
├── Clash Meta For Android/     # CMFA (Android) 独立 YAML 配置
│   └── clash-smart-cmfa.yaml
├── Clash Party/                # Clash Verge / Mihomo Party 等桌面端 JS 覆写
│   ├── Clash Smart内核覆写脚本.js
│   └── 其他配置在UI里面填写      # DNS / Sniffer / GeoX 等 UI 粘贴片段
├── OpenClash/                  # OpenWrt 路由器端
│   ├── openclash_custom_overwrite.sh   # Bash 覆写脚本（主）
│   ├── clash-smart-openclash.conf      # OpenClash 界面开关配置
│   └── 使用方法.md                      # 图文使用说明
└── Shadowrocket/               # iOS / macOS 小火箭
    └── shadowrocket-smart.conf
```

---

## 核心架构

所有平台遵循同一套拓扑，确保从手机到路由器的行为一致：

### 1. 9 个区域 Smart 组（节点自动聚合）

按节点名称关键字与 ISO 国家代码自动分类，无需手动维护：

| 区域 ID | 覆盖范围 |
|---------|----------|
| **HK** | 香港 |
| **TW** | 台湾 |
| **CN** | 回国节点 / 国内中转 / 电信联通移动 |
| **JP** | 日本（东京/大阪/横滨/名古屋…） |
| **KR** | 韩国（首尔/釜山/仁川…） |
| **SG** | 新加坡 |
| **US** | 美国（LAX/SJC/SFO/SEA/JFK 等 30+ 城市） |
| **EU** | 欧洲（英法德荷瑞士瑞典等 40+ 国家） |
| **AM** | 美洲（加拿大/墨西哥/巴西/阿根廷等） |
| **AF** | 非洲（埃及/南非/尼日利亚等） |
| **APAC_OTHER** | 亚太其他（马来/印尼/泰国/越南/菲律宾/印度/中东/澳新等） |

每个区域组均启用：
- `url-test` 自动择优
- `uselightgbm: true`（Mihomo Smart LightGBM 模型）
- `include-all-proxies: true`（全订阅候选池）

### 2. 28 个业务策略组（精细分流）

覆盖主流 SaaS 与本地化场景，部分代表性分组：

- **AI 服务**：OpenAI / ChatGPT / Claude / Gemini / Copilot / Perplexity / Grok …
- **流媒体**：Netflix / Disney+ / HBO Max / YouTube / Prime Video / Spotify / Apple TV / Bilibili / 爱奇艺 / 腾讯视频 …
- **社交通讯**：Telegram / Twitter/X / Discord / WhatsApp / LINE / Signal …
- **开发工具**：GitHub / GitLab / Docker / NPM / PyPI / jsdelivr …
- **云与 CDN**、**游戏加速**、**受限网站 (GFW)**、**广告拦截**、**隐私追踪**、**支付/银行**、**Apple / Microsoft / Google 服务** 等。

### 3. 规则源

- 基于 **blackmatrix7 / MetaCubeX / Loyalsoldier / bm7** 等上游规则集
- `rule-providers` 数量根据平台不同：
  - Clash Party / CMFA：**375+**
  - OpenClash（R4S 4GB 内存优化版）：**136**（由 387 精简，降低 OOM 风险）
- 自动回退 `GEOIP,CN` / `GEOSITE,cn` / `GEOIP,private` 多层兜底

### 4. DNS 与 Sniffer

- **DNS 三层架构**：`default-nameserver`（bootstrap）→ `nameserver`（国内 DoH）→ `proxy-server-nameserver` / `direct-nameserver` / `fallback`（国外 DoH + geoip CN 过滤）
- `respect-rules: true`：DNS 查询遵循路由规则（防 DNS 泄漏 + 精准分流）
- **Sniffer**：同时开启 HTTP / TLS / QUIC 嗅探，`force-dns-mapping + override-destination`，解决 fake-ip 下 SNI 识别问题
- 默认 **fake-ip** 模式，过滤常见 STUN / NTP / 内网 / 支付域名

### 5. 节点过滤

覆写脚本会自动剔除：
- 信息类假节点：`导航网址` / `剩余流量` / `到期` / `重置` / `官网`
- 倍率警示节点：`10x` / `20x` / `100x` 等高倍率扣费节点

---

## 各平台使用说明

### Clash Party（Clash Verge Rev / Mihomo Party / 桌面端）

1. 在客户端「订阅」中添加机场订阅（建议配合 **Sub-Store** 多订阅融合，脚本已针对 Sub-Store 的节点命名优化）。
2. 进入「覆写脚本 / Override」→ 新建 **JavaScript** 类型脚本。
3. 粘贴 `Clash Party/Clash Smart内核覆写脚本.js` 的全部内容。
4. 在客户端设置界面将 `Clash Party/其他配置在UI里面填写` 中的 **GeoX URL / DNS / Sniffer** 段粘贴到「Mixin 配置」或对应设置栏。
5. 应用覆写，重启内核。

> 脚本版本：**v5.2.2**（2026-04-13），支持 SUB-STORE 多机场融合、jsdelivr 永久直连（避免 rule-provider 刷新 DNS 循环依赖）等修复。

### Clash Meta For Android (CMFA)

1. 打开 `Clash Meta For Android/clash-smart-cmfa.yaml`，将文件顶部 `proxy-providers` → `Subscribe` → `url` 字段替换为你的机场订阅链接。
2. 在 CMFA 中「配置」→ 导入本地文件，选择上面保存的 YAML。
3. 首次导入后 CMFA 会自动拉取 Loyalsoldier 增强版 `geoip.dat / Country.mmdb / GeoLite2-ASN.mmdb / geosite.dat`。
4. 所有 GEOSITE/GEOIP 高级标签已用等效 RULE-SET 替代，无需等待 dat 下载即可生效。

### OpenClash（OpenWrt 路由器）

目标设备参考：**NanoPi R4S 4GB** 等中端路由器。

1. 登录 OpenWrt LuCI → **Services / 服务** → **OpenClash**。
2. 「**覆写设置 / Overwrite Settings**」页：
   - 上传并启用 `OpenClash/openclash_custom_overwrite.sh`
   - 勾选「启用自定义覆写 (Enable Custom Overwrite)」
3. 「**插件设置 / Plugin Settings**」页：
   - 参考 `OpenClash/clash-smart-openclash.conf` 中的每一项按字段填入（或直接写入 `/etc/config/openclash`）。
   - 关键项：`CORE_TYPE=Smart`、`GEODATA_LOADER=standard`（4GB 内存可用；2GB 设备建议改 `memconservative`）、`CHINA_IP_ROUTE=0`（避免 Step3 注入 geosite 解析错误）。
4. 「**规则设置**」→ 选择你的 Smart 内核，保存并应用。
5. 详细图文步骤：见 `OpenClash/使用方法.md`。

内存优化要点（由 v5.3.x 内置）：
- `geodata-loader: memconservative` 可再节省 400–600 MB；
- `rule-providers` 从 387 精简到 136（Google/Apple 家族合并、删除区域化冗余、合并广告拦截集），节省 800–1,100 MB；
- 保留完整 9 Smart 组、动态节点分类、DNS 多层架构、TLS 指纹注入。

### Shadowrocket（iOS / macOS）

1. 将 `Shadowrocket/shadowrocket-smart.conf` 托管至可访问 URL（GitHub Raw / jsDelivr / 自有服务器均可）。
2. Shadowrocket → **配置** → 右上角 ➕ → 粘贴 URL → 下载。
3. 点击该配置 → **使用配置**（触发 rule-set 下载，首次约 250+ 个规则集，需要保持代理开启）。
4. 代理分组页面手动为 28 个业务组选择初始节点/子组。
5. 首页 → **连通性测试**，确认 9 个区域组已正确聚合节点。

与 Clash Party 原版的差异（受 iOS 平台 / SR 引擎限制）：
- 不支持 `PROCESS-NAME` 规则、TUN `exclude-process`、Smart fingerprint 注入；
- `GEOSITE` 全部替换为 `RULE-SET`；
- Meta `.mrs` 二进制格式替换为 blackmatrix7 Shadowrocket `.list`；
- `rule-provider` 周期刷新由 SR「自动更新配置」统一管理。

---

## 版本 / 更新日志

- **v5.2.2**（2026-04-13）— Clash Party：PI.ai 移入 GFW 组；jsdelivr CDN 永久直连；删除已死的 ckrvxr 规则源；`DST-PORT,7680,REJECT` 顺序修复；`GSCService.exe` 加入 TUN exclude-process。
- **v5.2.2-SR.1**（2026-04-16）— Shadowrocket：DNS 段重构，映射 Clash 原版 `proxy-server-nameserver` / `fallback`。
- **v5.3.x-oc-slim** — OpenClash：R4S 4GB 内存优化版，DNS 冷启动修复。

完整历史请参阅各脚本文件顶部的 `CHANGELOG` 注释块。

---

## 依赖上游

本仓库仅做**编排与覆写**，规则集与数据库均来自以下优秀开源项目：

- [MetaCubeX/mihomo](https://github.com/MetaCubeX/mihomo) — Smart 内核
- [vernesong/mihomo](https://github.com/vernesong/mihomo/releases/download/LightGBM-Model/Model.bin) — LightGBM 模型
- [Loyalsoldier/geoip](https://github.com/Loyalsoldier/geoip) — 增强版 geoip.dat / Country.mmdb / GeoLite2-ASN.mmdb
- [MetaCubeX/meta-rules-dat](https://github.com/MetaCubeX/meta-rules-dat) — geosite.dat
- [blackmatrix7/ios_rule_script](https://github.com/blackmatrix7/ios_rule_script) — 业务分流规则集
- [bm7 / sub-store](https://github.com/sub-store-org/Sub-Store) — 多机场融合订阅

---

## 免责声明

- 本仓库**仅供个人学习与研究网络技术使用**，不提供任何机场订阅。
- 请遵守所在地区的法律法规，合理合法地使用本项目。
- 所有脚本/配置均为「自用分享」，作者不对因使用本项目造成的任何直接或间接后果负责。

---

## License

如无特别说明，本仓库内容以 **MIT License** 开放。上游规则集与数据库各自遵循原项目许可。
