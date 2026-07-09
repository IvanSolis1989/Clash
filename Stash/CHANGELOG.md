# Stash — 变更日志

> 本文件记录 Stash 专用 YAML 产物的变更。详细平台字段依据见 `REFERENCE-Stash-wiki.md`。

---

## v6.0.0-stash.1 (2026-07-09)

- SYNC：由 CMFA v6.0.0-cmfa.1 重新生成，保留融合后的 `113` 个 rule-provider 与 `130` 条规则。
- COMPAT：继续按 Stash Wiki 裁剪 Mihomo 扩展字段，Stash 不直接参与基准判定。

## v5.4.39-stash.1 (2026-07-09)

- SYNC：由 CMFA v5.4.39-cmfa.1 重新生成，保留 474 rule-provider 与 929 条规则。
- MIHOMO-MRS：继承 CMFA 的 `.mrs` partial 架构，424 个 provider 使用 `.mrs`，30 个 provider 使用残余 YAML，20 个 provider 保留原格式。
- COMPAT：继续裁剪 Stash Wiki 未确认的 Mihomo-only 字段；静态 YAML 中直接写最终 `.mrs` / 残余 YAML 地址，不保留 JS 兼容映射表。

## v5.4.38-stash.1 (2026-07-09)

- SCKI-SUPPLEMENTAL：由 CMFA v5.4.38-cmfa.1 重新生成，保留 429 rule-provider 与 884 条规则。
- MIHOMO-MRS：继承 CMFA 的 `.mrs` 迁移结果，366 个 provider 使用 `.mrs`，同时继续裁剪 Stash Wiki 未确认的 Mihomo-only 字段。
- COMPAT：Stash 继续裁剪 Mihomo-only 字段；补充规则集使用 Stash 可识别的 rule-provider 结构。

## v5.4.37-stash.1 (2026-07-07)

- FEAT#173-STASH：新增 `Stash/Stash.yaml`，由 `tools/generate-stash-from-cmfa.js` 从 CMFA 自动裁剪生成。
- SYNC：保留 Clash Party v5.4.37 / CMFA v5.4.37-cmfa.1 的 22 区域组、33 业务组、376 rule-provider 与 1000 条规则。
- COMPAT：删除 Stash Wiki 未确认的 Mihomo 扩展字段：GeoX 自动更新、sniffer、provider `health-check` / `exclude-filter`、rule-provider 下载 `proxy`、Mihomo DNS fallback / direct / proxy-server nameserver 字段。
- DNS：`default-nameserver` 改为 Stash 官方示例兼容的明文 IP；保留国内/国外 `nameserver-policy` 与完整 `fake-ip-filter`。
- VERIFY：`tools/validate-artifact-contracts.js` 新增 Stash 合同检查，CI 路径触发包含 `Stash/**/*.yaml` 与 `tools/generate-stash-from-cmfa.js`。
