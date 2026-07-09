# Egern 使用教程

> 版本：**v5.4.39-egern.1**（Build 2026-07-09；正式跟随 Clash Party v5.4.39 / CMFA 基线）

## 定位

Egern 已纳入正式同步产物，但不能直接复制 Mihomo/Clash 的 `rule-providers`。

原因很明确：Mihomo 的 `.mrs` 是 Clash Party / CMFA 最小、加载更快的规则集格式，应继续保留；Egern 官方文档没有声明可直接消费 `.mrs`，它的 `rule_set` 使用 Egern 自己的远端规则集结构。所以本目录提供 Egern 正式 Profile，由 CMFA 规则顺序生成 Egern 可导入语法：

- `Egern.yaml`：Egern Profile，可导入，可接订阅，包含 22 个 `smart` 区域组、33 个业务组、927 条 Egern 主规则和 484 个顶层 `rule_set` 引用。
- `rulesets/generated/egern/*.yaml`：由 CMFA rule-provider 和 `.mrs` manifest 生成的 Egern 原生规则集，包含 `provider-scki-*.yaml` 补充规则集。
- `tools/generate-egern-supplemental.js`：保留补充规则集的独立格式转换工具；正式 Profile 以 `tools/generate-egern-from-cmfa.js` 的 generated 输出为准。
- `tools/generate-egern-from-cmfa.js`：从 `Clash Meta For Android/CMFA(mihomo).yaml` 生成正式 Egern Profile。

## 快速导入

1. 打开 `Egern/Egern.yaml`。
2. 把 `policy_groups -> Subscribe -> urls` 里的示例订阅改成你的订阅地址。
3. 导入 Egern。
4. 在 Egern 里检查远端 `rule_set` 是否下载成功。

## 平台边界

- Egern Profile 正式跟随 CMFA 的 474 个 rule-provider 和 929 条规则顺序生成。
- Egern 实际渲染 927 条主规则：两条桌面 `PROCESS-NAME` 补充规则不进入 Egern，因为 Egern 官方规则类型没有 Clash 风格进程名匹配。
- Mihomo `.mrs` 不在 Egern 中直接引用；生成器会映射到 `rulesets/generated/egern/*.yaml` 的 Egern 原生规则集。

## 官方依据

- Egern Policy Groups：支持 `select`、`auto_test`、`smart`、`fallback`、`load_balance`、`external`、`conditional`。
- Egern Rules：规则按顺序首个命中生效，支持 `rule_set` 引用本地或远端规则集。
- Egern DNS：支持 `bootstrap`、`upstreams`、`forward`、`proxy_nameservers`。
- MetaCubeX Rule Providers：Mihomo `format` 支持 `yaml` / `text` / `mrs`，其中 `.mrs` 当前支持 `domain` / `ipcidr`。

详见 [REFERENCE-Egern.md](./REFERENCE-Egern.md)。
