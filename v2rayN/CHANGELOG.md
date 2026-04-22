# v2rayN — 变更日志

> `v2rayN/v2rayn-smart-xray-routing.json` 的变更日志。
> 主版本号跟随 Clash Party 主线；尾段 `-v2n.N` 独立递增。
>
> v2rayN 本身是多核调度器，路径 A（mihomo 核）和路径 B（sing-box 核）直接复用 CMFA / SingBox 产物，不在此记录；本文件仅针对**路径 C（Xray 核）** 的 `v2rayn-smart-xray-routing.json`。

---

## v5.2.5-v2n.2 (2026-04-22) — geosite 类别兼容修复 + 版本对齐

深度审查发现 `即时通讯` 规则里 `geosite:kakaotalk` 在 **v2fly/domain-list-community 里不存在**
（仓库只有 `kakao` 类别，不带 `talk` 后缀；Loyalsoldier 扩展集同样没有）。规则加载后
silent match 0 domains，KakaoTalk 流量会下沉到 geoip / FINAL，分流不符预期。

### 改动

- ★ FIX#v2n-01-P1：**`geosite:kakaotalk` → `geosite:kakao`**（v2fly 官方类别）+ 补三个显式 domain 兜底
  - `domain:kakao.com` / `domain:kakaocorp.com` / `domain:kakaotalk.com`
  - 其他 geosite 类别（`huggingface` / `anthropic` / `perplexity` / `copilot` / `gemini` / `bard` / `openai` 等 AI 新类别）
    已逐一核对上游存在（v2fly 有 `huggingface.co/hf.co/hf.space` 等），保留
- ★ FIX#v2n-02-P2：`_meta.version` `v5.2.3-v2n.1` → **`v5.2.5-v2n.2`**（主版本对齐 Clash Party JS `VERSION='v5.2.5'`）
- ★ FIX#v2n-03-P2：`_meta.build` `2026-04-20` → `2026-04-22`；`_meta.baseline` `v5.2.4` → `v5.2.5`
- ★ FIX#v2n-04-P2：`remarks` 顶层字段 `v5.2.3` → `v5.2.5`

### 复核其他 audit 发现（保留，不改）

- **`_meta` 顶层键**：v2rayN 保存时需要 `_meta` 做 UI 展示；Xray-core 的 JSON 解析器默认 `DisallowUnknownFields=false`，`_meta` 会被忽略。保留。
- **`dns-out` outboundTag**：由 v2rayN 主配置补 outbound 定义（参考 `v2rayN/README.md`），本 routing 片段不包含 outbound 定义符合设计。保留。
- **其他 98 个 geosite 类别**：已随机抽样确认 v2fly / Loyalsoldier 覆盖，未发现其他缺失。

### 自检

```
python3 -c 'import json; d=json.load(open("v2rayN/v2rayn-smart-xray-routing.json")); print(d["_meta"]["version"])'
→ v5.2.5-v2n.2 ✓
rules 数量:                 29（不变）
kakaotalk → kakao + domain: 已修 ✓
_meta.version 以 v5. 开头:  ✓（CLAUDE.md §5 期望）
```

### 官方文档证据

- [v2fly/domain-list-community data/kakao](https://github.com/v2fly/domain-list-community/tree/master/data)（存在）vs `data/kakaotalk`（404）
- [v2fly/domain-list-community data/huggingface](https://raw.githubusercontent.com/v2fly/domain-list-community/master/data/huggingface) 存在（hf.co / hf.space / huggingface.co）

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
