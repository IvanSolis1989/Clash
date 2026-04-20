# Surge — 变更日志

> `Surge/surge-smart.conf` 的变更日志。主版本号跟随 Clash Party 主线；尾段 `-Surge.N` 独立递增。

---

## v5.2.3-Surge.1 (2026-04-20) — 初版

- ★ 从 Shadowrocket v5.2.2-SR.2 迁移，保留 9 区域 url-test 组 + 28 业务 select 组 + ~930 条规则
- ★ 适配 Surge `[General]` 原生字段：
  - `encrypted-dns-server`（DoH 专用）
  - `geoip-maxmind-url`（配置文件里直接指定 MMDB，无需 UI 手动下载）
  - `disable-geoip-db-auto-update`
  - `read-etc-hosts`（读取系统 hosts）
- ★ 删除 SR 专有 / 无效字段：
  - `private-ip-answer`
  - `dns-direct-fallback-proxy`
  - `proxy-dns-server`
  - `fallback-dns-server`（Surge 用 `encrypted-dns-server` + `dns-server` 统一管理）
- ★ `FINAL,🐟 漏网之鱼,dns-failed`（Surge 风格 FINAL，带 `dns-failed` 兜底）

### 与 Clash Party 主线的差异（Surge 引擎限制）

- 无 PROCESS-NAME（Surge Mac 支持，iOS 不支持 → 已统一删除以保持跨平台）
- 无 Smart 组 + LightGBM（Surge 核心不是 Mihomo）
- 无 TLS 指纹注入 fpByPurpose（Surge 不暴露 uTLS 控制）
- 无 GEOSITE（Surge 用 RULE-SET + 内置 MMDB；GEOIP 精准标签依赖 MMDB 替换）
- 无 rule-provider 独立调度（Surge 依赖 RULE-SET URL + 统一订阅自动更新）
