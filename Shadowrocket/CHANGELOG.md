# Shadowrocket — 变更日志

> `Shadowrocket/Shadowrocket.conf` 的变更日志。
> 主版本号跟随 Clash Party 主线；尾段（`-SR.N`）独立递增。

---

## v5.2.6-SR.4 (2026-04-23) — FINAL 兜底补 `dns-failed` 标志

跨产物审计（PR #65）发现 CLAUDE.md §3.3 硬约束违反：

- ★ **FIX#SR-03-P1**：`FINAL,🐟 漏网之鱼` → `FINAL,🐟 漏网之鱼,dns-failed`
  - 文件：`Shadowrocket/Shadowrocket.conf:1340`
  - 原因：Shadowrocket 的 FINAL 规则默认只在**规则表走完**后兜底；DNS 超时/解析失败**不会**自动落入 FINAL，会直接报错。带上 `dns-failed` 标志后 DNS 失败也会走兜底节点。
  - 权威：CLAUDE.md §3.3 明文规定 `FINAL,🐟 漏网之鱼,dns-failed`；同仓库 `Surge/Surge.conf:1321` 已对齐。
  - 同期审计确认：Loon / Quantumult X 官方文档**未记载** `dns-failed` 标志——Loon `final_rule` 页无说明、QX `sample.conf` 只有 `final, <policy>` 形态，按 CLAUDE.md §2.3 保守原则**不添加**。

头部版本号 v5.2.5-SR.3 → v5.2.6-SR.4（对齐主线 v5.2.6）。

## v5.2.5-SR.3 (2026-04-22) — 移除 72 条 Clash YAML 规则集 + anti-AD/Sukka 兼容修复

深度审查发现仓库 iOS 三兄弟（Loon / Shadowrocket / Quantumult X）共享同一批"Clash Party v5.2.4 基线遗毒"：
- 72 条 Accademia Clash classical `.yaml` RULE-SET（SR 的"auto-detect yaml"只有非官方文档声称，保守视作 Loon 已验证失效同款）
- `anti-ad.net/surge.txt` 裸域名（Loon v5.2.4-Loon.3 已确认部分国内 ISP 会劫持返回 HTML）
- Sukka `List/domainset/*.conf`（Surge 专属二级路径，Loon 不认，SR 官方同样没保证）

本次按 Loon v5.2.4-Loon.2 / .3 已验证的修复模板同步应用：

### 改动

- ★ FIX#SR-01-P1：**删除 72 条 Clash classical `.yaml` RULE-SET**（71 Accademia + 1 ACL4SSR Zoom.yaml），SR 可能沉默加载为 0 条
- ★ FIX#SR-02-P0：`anti-ad.net/surge.txt` → `fastly.jsdelivr.net/gh/privacy-protection-tools/anti-AD@master/anti-ad-surge.txt`
- ★ FIX#SR-03-P0：Sukka `List/domainset/reject_phishing.conf` → `List/non_ip/reject_phishing.conf`
- ★ FIX#SR-04-P1：72 条 yaml 删除后的关键域名补 DOMAIN-SUFFIX 兜底：
  - 🏦 金融支付：Monzo / N26 / Chime + 24 国际银行（Chase / BofA / HSBC / Barclays / DBS / MUFG / RBC / ANZ 等）
  - 🧑‍💼 会议协作：Zoom × 5 / RustDesk / Parsec × 3
  - 🌐 国外网站：Wayback Machine / Pornhub × 3

### 元信息

- 版本：`v5.2.2-SR.2` → **`v5.2.5-SR.3`**（主版本对齐 Clash Party JS `VERSION = 'v5.2.5'`）
- Build：2026-04-20 → 2026-04-22
- 架构一句话：`250+ RULE-SET` → `~290 RULE-SET`
- 清理 15 行孤立的 `# Accademia xxx` 注释头（原 yaml 段已删）

### 已接受的回归损失（与 Loon 一致）

Accademia `FakeLocation × 10`（国内 APP IP 伪装）、`GeoRouting × 17 区域`、`eMuleServer`、`HomeIP`、各国银行细粒度 YAML —— 没有 `.list` 等价源；关键域名已补 DOMAIN-SUFFIX 兜底。完整覆盖请换 CMFA / OpenClash / SingBox。

### 自检

- 代理组 37 个 ✓
- `.yaml,` RULE-SET 残留：0 条 ✓
- `anti-ad.net` 残留：0 次 ✓
- `skk.moe/List/domainset/`：0 次；`List/non_ip/`：1 次 ✓

---

## v5.2.2-SR.2 (2026-04-20)

与 Clash Party 业务组严格对齐：

- ★ 移除多余的 `🎵 TikTok` 业务组（基线共 28 组），TikTok / lemon8 规则并入 `📱 社交媒体`
- ★ 修复 `💬 即时通讯` 引用的区域组 emoji 错误（`🇸🇬 亚太节点` → `🌏 亚太节点`，原引用不存在）

## v5.2.2-SR.1 (2026-04-16)

DNS 段重构，映射用户 Clash DNS 配置：

- ★ 新增 `proxy-dns-server`（隐藏参数，对应 Clash `proxy-server-nameserver`）
- ★ `fallback-dns-server` 从 system 改为国外 DoH（对应 Clash `fallback`）
- ★ `dns-server` 精简为国内 DoH（对应 Clash `nameserver + direct-nameserver`）
- ★ 标注 4 项 Clash DNS / 数据库功能无法迁移（bootstrap / respect-rules / fallback-filter / dat 格式）

## 初版 (从 Clash Party v5.2.2 迁移重构)

- 9 区域 url-test 组（`policy-regex-filter` 自动按地区聚合节点）
- 28 业务策略组（与原版 1:1 对应）
- 规则源：`blackmatrix7/ios_rule_script/rule/Shadowrocket/` + szkane + 原生 GEOIP

### 与 Clash Party 主线的差异（iOS 平台 + SR 引擎限制）

- 删除 PROCESS-NAME 规则（iOS 无进程识别 API）
- 删除 TUN `exclude-process`（SR 无该机制）
- 删除 Smart fingerprint 注入（SR 不暴露 TLS 指纹控制）
- GEOSITE 全部替换为 RULE-SET（SR 不原生支持 GEOSITE）
- Meta `.mrs` 二进制格式全部替换为 blackmatrix7 Shadowrocket `.list`
- Accademia 部分 YAML classical 保留（SR 按内容识别，可解析）— v5.2.5-SR.3 起全部删除，改用 `.list` 等价源 + DOMAIN-SUFFIX 兜底
- rule-provider 的周期刷新改由 SR 的「自动更新配置」统一管理
