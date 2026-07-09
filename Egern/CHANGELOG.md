# Egern — 变更日志

## v6.0.0-egern.1 (2026-07-09)

- FUSED-RULESETS：由融合后的 CMFA 规则顺序重新生成，Egern 不直接引用 Mihomo `.mrs`。
- EGERN-NATIVE：输出 118 个 Egern 原生 YAML 规则集，主配置渲染 130 条规则、113 个 rule_set 引用。
- PLATFORM：GEOIP / PROCESS-NAME 等官方能力限制继续记录为平台例外，不当作同步遗漏。

## v5.4.39-egern.1 (2026-07-09)

- SYNC：由 CMFA v6.0.0-cmfa.1 重新生成，跟随 113 个融合 rule-provider / 130 rules 的主线顺序。
- EGERN-NATIVE：Egern 不直接引用 Mihomo `.mrs`；生成器通过 `.mrs` manifest 回溯上游来源，输出 487 个 Egern 原生 YAML 规则集。
- PARITY：`Egern/Egern.yaml` 当前渲染 927 条主规则与 484 个顶层 `rule_set`；两个桌面 `PROCESS-NAME` 补充规则继续作为官方能力限制跳过。
- VERIFY：合同校验改为检查 generated Egern `scki-*` 规则集，而不是旧的 supplemental preview 路径。

## v5.4.38-egern.2 (2026-07-09)

- EGERN-FORMAL：`Egern/Egern.yaml` 从 Preview 升级为正式同步产物，跟随 CMFA 规则顺序生成。
- SYNC：同步 CMFA 429 个 rule-provider 和 884 条规则；Egern 渲染 882 条主规则与 439 个顶层 `rule_set`，仅排除官方未支持的 2 条桌面 `PROCESS-NAME` 补充规则。
- POLICY：区域组从 `auto_test` 改为 Egern 官方 `smart`，保留 22 个区域组与 33 个业务组。
- TOOLING：新增 `tools/generate-egern-from-cmfa.js`，把 Mihomo `.mrs` 规则源映射为本仓库生成的 Egern 原生 YAML 规则集；Clash Party / CMFA / OpenClash / FlClash / Stash 继续保留 `.mrs`。
- VERIFY：`tools/validate-artifact-contracts.js` 改为校验正式 Egern 产物，不再按 Preview 范围检查。

## v5.4.38-egern.1 (2026-07-09)

- FEAT#174-EGERN：新增 Egern 目录与 `Egern.yaml` Preview 配置。
- SCKI-SUPPLEMENTAL：新增 Egern 原生 YAML 补充规则集输出，引用 `rulesets/supplemental/egern/*.yaml`，不在主规则中散写广告误伤、抖音、RustDesk、Google Workspace 等零星域名。
- TOOLING：新增 `tools/generate-egern-supplemental.js`，从 Clash classical 补充规则集生成 Egern `domain_suffix_set` / `domain_set` / `ip_cidr_set` 格式。
- SCOPE：本版不声明与 Mihomo 391 rule-provider 完全等价；Egern 完整等价迁移需要后续为上游规则源建立专用转换链路。
