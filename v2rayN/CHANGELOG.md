# v2rayN — 变更日志

> `v2rayN/v2rayn-smart-xray-routing.json` 的变更日志。
> 主版本号跟随 Clash Party 主线；尾段 `-v2n.N` 独立递增。
>
> v2rayN 本身是多核调度器，路径 A（mihomo 核）和路径 B（sing-box 核）直接复用 CMFA / SingBox 产物，不在此记录；本文件仅针对**路径 C（Xray 核）** 的 `v2rayn-smart-xray-routing.json`。

---

## v5.2.3-v2n.1 (2026-04-20) — 初版

- ★ 基于 Clash Party v5.2.3 提取关键业务域名，生成 Xray routing rule
- ★ 29 条路由规则，分发：
  - `proxy` × 20（AI / 加密货币 / 流媒体 / 社交 / 开发者 / GFW 等业务组折叠到 proxy 出站）
  - `direct` × 6（私有网段 / 国内网站 / 国内流媒体 / 国内游戏 / 苹果服务默认 / BT tracker）
  - `block` × 2（广告拦截 / Windows Delivery Optimization 端口 7680）
  - `dns-out` × 1（DNS 劫持）
- ★ 使用 geosite + geoip 关键字组合：`geosite:openai` / `geosite:netflix` / `geoip:cn` 等
- ★ 包含 `_meta` 元数据块（`name` / `version` / `build` / `baseline` / `note` / `changelog`），方便 v2rayN UI 展示

### 已知限制（Xray 核的设计约束，非 bug）

- ❌ 无 28 业务组 → 9 区域组的两层结构（Xray routing 只有 proxy / direct / block 三出站）
- ❌ 无 LightGBM 自动择优
- ❌ 无 Smart 组 `uselightgbm: true`
- ❌ 无 373+ rule-provider 自动更新（Xray 依赖 `geosite.dat` / `geoip.dat` 数据库，不是 rule-provider 机制）
- ⚠️ `geosite:snapchat` 等关键字依赖 v2rayN 集成的 geosite 数据库；少量在 Clash 里使用的分类名在 v2fly 的 geosite 里可能不存在

要完整体验请改用路径 A（mihomo 核）或路径 B（sing-box 核），详见 `v2rayN/README.md`。
