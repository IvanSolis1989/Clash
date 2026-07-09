# Egern — 变更日志

## v5.4.38-egern.1 (2026-07-09)

- FEAT#174-EGERN：新增 Egern 目录与 `Egern.yaml` Preview 配置。
- SCKI-SUPPLEMENTAL：新增 Egern 原生 YAML 补充规则集输出，引用 `rulesets/supplemental/egern/*.yaml`，不在主规则中散写广告误伤、抖音、RustDesk、Google Workspace 等零星域名。
- TOOLING：新增 `tools/generate-egern-supplemental.js`，从 Clash classical 补充规则集生成 Egern `domain_suffix_set` / `domain_set` / `ip_cidr_set` 格式。
- SCOPE：本版不声明与 Mihomo 391 rule-provider 完全等价；Egern 完整等价迁移需要后续为上游规则源建立专用转换链路。
