# Quantumult X — 变更日志

> `Quantumult X/qx-smart.conf` 的变更日志。主版本号跟随 Clash Party 主线；尾段 `-QX.N` 独立递增。
>
> 本文件**由 `tools/srk_to_qx.py`（或等价脚本）从 Shadowrocket 自动转换**生成。重新同步时请运行该脚本而不是手工改 `.conf`。

---

## v5.2.3-QX.1 (2026-04-20) — 初版

- ★ 从 Shadowrocket v5.2.2-SR.2 + Surge v5.2.3-Surge.1 自动转换生成
- ★ `[Proxy Group]` 映射到 QX `[policy]`：
  - `url-test` → `url-latency-benchmark`（QX 专用延迟择优）
  - `select` → `static`（QX 专用手选）
- ★ `[Rule]` 段拆分为：
  - `[filter_local]`（inline 规则）
  - `[filter_remote]`（RULE-SET URL）
- ★ 规则类型转换：
  - `DOMAIN-SUFFIX` → `host-suffix`
  - `DOMAIN-KEYWORD` → `host-keyword`
  - `DOMAIN` → `host`
  - `IP-CIDR` → `ip-cidr`
  - `GEOIP` → `geoip`
  - `FINAL` → `final`
  - `REJECT` → `reject`、`DIRECT` → `direct`（QX 策略名小写约定）
- ★ rule-set URL 路径 `/rule/Shadowrocket/` 自动改写为 `/rule/QuantumultX/`（blackmatrix7 在该目录下提供 QX 专用 `.list` 格式，语法一致）

### 与 Clash Party 主线的差异（QX 引擎限制）

- 无 Mihomo Smart 组 / LightGBM（QX 核心不是 Mihomo）
- 无 TLS 指纹注入（QX 不暴露 uTLS 控制）
- 无 PROCESS-NAME（iOS 无进程 API；已在转换时跳过）
- 无 URL-REGEX（QX `filter_local` 不支持；已在转换时跳过）
- GEOSITE 全部替换为 `filter_remote` RULE-SET
- Meta `.mrs` 二进制 → blackmatrix7 QuantumultX `.list`

### 重要使用提示

- ⚠️ **订阅节点**：QX 不会自动解析 `[server_local]` / `[server_remote]` 段落里的节点；必须在 `[server_remote]` 填机场订阅 URL，或在 `[server_local]` 手动粘贴节点。
- `resource_parser_url` 已预置 KOP-XIAO 的通用解析器，可吃非标准订阅格式。
- `rewrite_local` / `rewrite_remote` / `task_local` / `mitm` 段默认留空，按需自行扩展。
