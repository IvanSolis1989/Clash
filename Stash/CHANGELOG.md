# Stash — 变更日志

> 本文件记录 Stash 专用 YAML 产物的变更。详细平台字段依据见 `REFERENCE-Stash-wiki.md`。

---

## v5.4.38-stash.1 (2026-07-09)

- SCKI-SUPPLEMENTAL：由 CMFA v5.4.38-cmfa.1 重新生成，保留 391 rule-provider 与 846 条规则。
- COMPAT：Stash 继续裁剪 Mihomo-only 字段；补充规则集使用 Stash 可识别的 rule-provider 结构。

## v5.4.37-stash.1 (2026-07-07)

- FEAT#173-STASH：新增 `Stash/Stash.yaml`，由 `tools/generate-stash-from-cmfa.js` 从 CMFA 自动裁剪生成。
- SYNC：保留 Clash Party v5.4.37 / CMFA v5.4.37-cmfa.1 的 22 区域组、33 业务组、376 rule-provider 与 1000 条规则。
- COMPAT：删除 Stash Wiki 未确认的 Mihomo 扩展字段：GeoX 自动更新、sniffer、provider `health-check` / `exclude-filter`、rule-provider 下载 `proxy`、Mihomo DNS fallback / direct / proxy-server nameserver 字段。
- DNS：`default-nameserver` 改为 Stash 官方示例兼容的明文 IP；保留国内/国外 `nameserver-policy` 与完整 `fake-ip-filter`。
- VERIFY：`tools/validate-artifact-contracts.js` 新增 Stash 合同检查，CI 路径触发包含 `Stash/**/*.yaml` 与 `tools/generate-stash-from-cmfa.js`。
