# FlClash — 变更日志

> FlClash 覆写脚本 `FlClash(mihomo).js`。
> 基线：Clash Party Normal（规则与策略 100% 对齐）。

---

## 2026-05-03：状态更新

- **FlClash v0.8.90~v0.8.92 覆写脚本功能经实测不可用。**
  - 已确认：任何对 `config["proxy-groups"]` 的修改（push/unshift/splice）均不生效
  - 已确认：最小测试脚本（仅 push 一个组 + 一条规则）同样不生效
  - FlClash GitHub 上存在 3 个相关 Open issue：#1541, #1636, #1451
- **推荐方案回退为 CMFA 静态 YAML**（`Clash Meta For Android/CMFA(mihomo).yaml`）
- JS 覆写脚本保留为占位（待 FlClash 修复后恢复）
- README 已更新，移除覆写脚本推荐，改为 CMFA YAML 路径

## v5.3.2-flclash.1 (2026-05-03)

- 初始版本，基于 Clash Party Normal v5.3.2 完整移植
  - 18 url-test 区域组（9 全部 + 9 家宽）+ 31 业务策略组
  - 371+ rule-providers + 960+ rules
  - word-boundary 正则节点分类、家宽识别、TLS 指纹注入
- 适配 FlClash：QuickJS 兼容（console.log 条件包装、数组原地修改）
- 新增必改配置文档（GeoX URL + DNS）
