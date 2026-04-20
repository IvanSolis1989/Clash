# Loon — 变更日志

> `Loon/loon-smart.conf` 的变更日志。主版本号跟随 Clash Party 主线；尾段 `-Loon.N` 独立递增。

---

## v5.2.3-Loon.1 (2026-04-20) — 初版

- ★ 从 Surge v5.2.3-Surge.1 迁移，保留 9 区域 url-test 组 + 28 业务 select 组 + ~930 条规则
- ★ RULE-SET 仍放在 `[Rule]` 段内（Surge 兼容语法，Loon 原生支持）；未拆分到 `[Remote Rule]` 以最小化 diff 并保留和 Surge 版的可 diff 性
- ★ Loon `[General]` 原生字段：
  - `dns-server`（并发 DoH / 系统 DNS）+ `doh-server`（DoH 专用）
  - `skip-proxy`（私有网段 + 银行支付，避免 TUN 劫持）
  - `ipv6-enabled = true`
- ★ 删除 Surge 独有字段：
  - `geoip-maxmind-url`（Loon 需 UI 手动下载 MMDB，不支持配置文件指定）
  - `read-etc-hosts` / `exclude-simple-hostnames`（Surge Mac 专属）
  - `encrypted-dns-follow-outbound-mode`（Loon 无该开关）
  - `block-quic = all-proxy`（Loon 用 `disable-udp-ports` 替代）

### 与 Clash Party 主线的差异（Loon 引擎限制）

- 无 PROCESS-NAME（iOS 无进程 API）
- 无 Smart 组 + LightGBM（Loon 核心不是 Mihomo）
- 无 TLS 指纹注入 fpByPurpose（Loon 不暴露 uTLS 控制）
- 无 GEOSITE（Loon 用 RULE-SET + 内置 MMDB；GEOIP 精准标签依赖 MMDB 替换）
