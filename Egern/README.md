# Egern 使用教程

> 版本：**v5.4.38-egern.1**（Build 2026-07-09，Preview；跟随 Clash Party v5.4.38 基线）

## 定位

Egern 值得纳入仓库，但不适合直接复制 Mihomo/Clash 的 `rule-providers`。

原因很明确：Egern 支持远端 `rule_set`，但它的 rule set 文件是 YAML 结构，例如 `domain_suffix_set` / `ip_cidr_set`，不能直接消费 Clash classical 或 Mihomo `.mrs`。所以本目录先提供 Egern 原生首版：

- `Egern.yaml`：Egern Profile，可导入，可接订阅，可使用 22 个区域选择思路和 33 个业务组。
- `rulesets/supplemental/egern/*.yaml`：由 `rulesets/supplemental/clash/*.list` 转换来的 Egern 专用补充规则集。
- `tools/generate-egern-supplemental.js`：补充规则集转换工具。

## 快速导入

1. 打开 `Egern/Egern.yaml`。
2. 把 `policy_groups -> Subscribe -> urls` 里的示例订阅改成你的订阅地址。
3. 导入 Egern。
4. 在 Egern 里检查 `rulesets/supplemental/egern/*.yaml` 远端规则集是否下载成功。

## 当前边界

- 本版不是 391 个 Mihomo provider 的完全等价迁移。
- 桌面 `PROCESS-NAME` 补充规则不进入 Egern；Egern 官方规则类型没有 Clash 风格 `PROCESS-NAME`。
- 后续如果要做到完全等价，需要为 bm7 / Accademia / szkane / VPSDance 等上游规则统一建立 Egern YAML 转换链路。

## 官方依据

- Egern Policy Groups：支持 `select`、`auto_test`、`smart`、`fallback`、`load_balance`、`external`、`conditional`。
- Egern Rules：规则按顺序首个命中生效，支持 `rule_set` 引用本地或远端规则集。
- Egern DNS：支持 `bootstrap`、`upstreams`、`forward`、`proxy_nameservers`。

详见 [REFERENCE-Egern.md](./REFERENCE-Egern.md)。
