# SingBox — 变更日志

> `SingBox/SingBox(sing-box).json`（精简）+ `SingBox/SingBox(sing-box)-full.json`（完整，由脚本生成）的变更日志。
> 主版本号跟随 Clash Party 主线。

---

## v5.2.6-sing.3 (2026-04-23) — `SingBox(sing-box).json` 补 `route.final` + 注入 `_meta` 块

跨产物审计（PR #65）发现 CLAUDE.md §3.3 硬约束违反：

- ★ **FIX#sing-01-P1**：`SingBox(sing-box).json` 的 `route` 对象缺 `final` 字段
  - 当前：`"route": { "auto_detect_interface": true, "rules": [] }`
  - 修复：`"route": { "auto_detect_interface": true, "final": "🐟 漏网之鱼", "rules": [] }`
  - 原因：sing-box 规范要求 `route.final` 指定兜底 outbound。缺字段时若 `rules` 为空（本文件就是最小模板），**流量无归属**会走到 outbounds 第一个（通常是 🚀 节点选择），和基线语义不符。
  - 权威：CLAUDE.md §3.3 明文 `route.final: "🐟 漏网之鱼"`；sing-box 官方 [route 配置](https://sing-box.sagernet.org/configuration/route/)。

- ★ **FIX#sing-02-P2**（顺手修）：`experimental._meta` 注入完整版本信息
  - 原 `_meta.name` 是 `"SingBox Smart Full"`（与文件定位"精简基础模板"不符）——保留 name 字段但本次 bump 到 `v5.2.6-sing.3` 时顺手补齐 `version` / `build` / `baseline` / `changelog` 四个字段，与 `SingBox(sing-box)-full.json` 的 _meta 块对齐。
  - `SingBox(sing-box)-full.json` 由 `SingBox(sing-box)-generator.js` 生成，其 _meta 下次生成时会自动 bump；本次未手工动它。

### 未动的相关事项（审计提及但不改）

- `SingBox(sing-box).json` 的 `route.rules` 仍为 `[]`、`rule_set` 仍为 `[]` —— 按 `SingBox/README.md:23` 声明，本文件本就是"基础模板 / 快速体验 / 学习结构"，完整规则在 `SingBox(sing-box)-full.json`。**非 bug**。
- 未来可把 README L23 的"4 rule-sets + 28 条内联规则"描述与现状对齐（另起小 PR）。

头部版本号 v5.2.5-sing.2 → v5.2.6-sing.3（对齐主线 v5.2.6）。

## v5.2.5-sing.2 (2026-04-22) — 修复 sing-box 1.13 起起不来 + 重建基础模板

用户升级 sing-box 到 1.13+ 会直接 FATAL 起不来：遗留配置里有 `type: "block"` 特殊 outbound，
1.11 废弃 / 1.13 移除（[sing-box migration](https://sing-box.sagernet.org/migration/)）。
同时 `dns.servers[*]` 用了 legacy `"address": "https://..."` 字段，1.12 起废弃、1.14 移除
（[dns server legacy](https://sing-box.sagernet.org/configuration/dns/server/legacy/)）。

复核还发现基础模板 `SingBox/SingBox(sing-box).json` 在 commit `da56387` 被误删（只剩生成产物
`SingBox(sing-box)-full.json`），`SingBox(sing-box)-generator.js` 实际一直跑不起来。

### 本次改动

- ★ FIX#sing-01-P0：**删除 `type: "block"` 特殊 outbound**（tag `🚫 拦截`）
  - 3 个 selector（`🚀 节点选择` / `🛰️ BT/PT Tracker` / `🛑 广告拦截`）的 `outbounds` 列表同步剔除该 tag
  - 路由规则已用 `action: "reject"` 表达拒绝语义（generator 正确实现），本来就没规则引用 `🚫 拦截`，只剩级联 tag 残留
- ★ FIX#sing-02-P0：**3 个 DNS server 迁移到新 schema**（`{type, server, detour}` 取代 `{address, detour}`）
  - `dns_direct`: `address: "https://223.5.5.5/dns-query"` → `type: "https", server: "223.5.5.5"`
  - `dns_proxy`:  `address: "https://1.1.1.1/dns-query"`   → `type: "https", server: "1.1.1.1"`
  - `dns_block` (`rcode://success`)：整条删除，referring DNS rule 改用 `action: "reject"`（广告 geosite 规则）
- ★ FIX#sing-03-P1：**重建 `SingBox/SingBox(sing-box).json` 基础模板**
  - 从 v5.2.5-sing.1 的 full.json 反推，剥掉 generator 会填的 `route.rule_set` / `route.rules` / `route.final`
  - 注入所有 sing-box 1.12+ 修复到基础模板，后续 `node SingBox/SingBox(sing-box)-generator.js` 跑起来就能产出正确的 full.json
- ★ 注入 `experimental._meta`（`version=v5.2.5-sing.2`、`build=2026-04-22`、`baseline=Clash Party v5.2.5`、`changelog=见 SingBox/CHANGELOG.md`）
- 重新生成 `SingBox(sing-box)-full.json`（51 outbounds + 975 rules + 391 rule_set）

### 自检

- `sing-box check -c SingBox(sing-box)-full.json` 期望通过（1.12 / 1.13 / 1.14 均可）
- `outbounds[*].type == "block"` 出现次数：0 ✓
- `dns.servers[*].address`（legacy）出现次数：0 ✓
- 任意 selector.outbounds 列表引用 `🚫 拦截`：0 ✓
- selector+urltest 共 38 个（1 顶层 + 9 区域 + 28 业务）✓（CLAUDE.md §5 期望 38）
- rule_set 与 rules 数量：391 / 975（与 v5.2.5-sing.1 等价，仅 DNS+outbound schema 修）
- `_meta.version` 以 `v5.` 开头 ✓（CLAUDE.md §5 期望）

### 生成工作流

```
# 路径里的 ( ) 是 shell 语法 token，必须加引号
node 'SingBox/SingBox(sing-box)-generator.js'
# 读 SingBox/SingBox(sing-box).json（本次重建好的 base）+ Clash Party 主线 JS
# 产出 SingBox/SingBox(sing-box)-full.json
```

### 官方文档证据

- [sing-box migration guide](https://sing-box.sagernet.org/migration/)（block outbound 1.11 deprecated, 1.13 removed）
- [v2rayN issue #7708](https://github.com/2dust/v2rayN/issues/7708)（用户实锤：1.13+ sing-box 因 deprecated special outbound FATAL）
- [sing-box DNS legacy schema](https://sing-box.sagernet.org/configuration/dns/server/legacy/)
- [sing-box DNS server](https://sing-box.sagernet.org/configuration/dns/server/)（new `type:"https"/"quic"/"udp"` schema）

---

## v5.2.5-sing.1 (2026-04-20)

- ★ 跟随 Clash Party v5.2.5 FIX#23-P1 重新生成：`acc-geositecn` + `acc-china` 两个 rule_set 从 `SingBox(sing-box)-full.json` 消失
- 重新生成命令：`node SingBox/SingBox(sing-box)-generator.js`
- 结果：`route.rules` 977 → 975；`route.rule_set` 对应减 2 项

## v5.2.3-sing.1 (2026-04-20)

- ★ Full 版本由 `SingBox/SingBox(sing-box)-generator.js` 从 Clash Party v5.2.3 JS 主线自动提取：
  - 387 rule_set 入口
  - 977 条路由规则
- ★ DNS / Sniffer / GEO 增强：
  - `dns_direct`（223.5.5.5 DoH）用于国内规则集
  - `dns_proxy`（1.1.1.1 DoH）用于代理解析
  - `dns_block`（rcode://success）用于广告域名
  - `inbounds.tun.sniff = true` + `sniff_override_destination = true`
  - `MetaCubeX/meta-rules-dat@sing` 的 geosite / geoip `.srs` 远程规则集（按日更新）
- ★ 路由规则使用 `action` + `outbound` 形式（sing-box 1.11+ 推荐）
- ★ `experimental.cache_file.enabled = true`（远程规则与 selector 选择结果可缓存）

## 初版

- 在 sing-box 上复刻 Clash Party 的 9 区域组 + 28 业务组语义
- `selector` / `urltest` 使用官方结构字段（`outbounds` / `default` / `interval` / `tolerance`）
