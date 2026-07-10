# Sub-Store Scripts

这里放 Sub-Store 的“脚本操作 / 脚本筛选”辅助脚本。

## local

`local/` 来自本机 Mihomo Party / Clash Party 的 Sub-Store 配置，已脱敏。推荐顺序：

1. 单条机场订阅：`flag-airport-rename.js`
2. 组合订阅：`drop-invalid-nodes.js`
3. 组合订阅：`cleanup-vless-vmess-fields.js`
4. 组合订阅：`../common/drop-info-nodes.js`
5. 组合订阅最后：`merge-subscription-userinfo.js`

`merge-subscription-userinfo.js` 会正常累加独立机场的流量；镜像订阅可在订阅 URL 中用相同的 `#flowDedup=...` 键归组，具体示例和自动去重边界见 [上级 README](../README.md#镜像订阅流量去重)。

## common

`common/` 是仓库维护的通用模板，不绑定任何机场：

- `drop-info-nodes.js`
- `normalize-node-names.js`
- `dedupe-node-names.js`

## community

`community/` 只做 GitHub 常见脚本索引。无明确许可证、过度依赖外部 API、或容易暴露个人参数的脚本不直接复制进仓库。

