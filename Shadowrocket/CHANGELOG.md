# Shadowrocket — 变更日志

> `Shadowrocket/shadowrocket-smart.conf` 的变更日志。
> 主版本号跟随 Clash Party 主线；尾段（`-SR.N`）独立递增。

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
- Accademia 部分 YAML classical 保留（SR 按内容识别，可解析）
- rule-provider 的周期刷新改由 SR 的「自动更新配置」统一管理
