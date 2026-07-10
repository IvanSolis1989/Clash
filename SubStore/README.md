# SubStore

> 目录简介：这里是 Sub-Store 辅助资料库，放订阅处理说明、脚本模板和常见用法索引。

这个目录是 Smart-Config-Kit 的 Sub-Store 辅助资料库：放使用说明、可复用脚本模板，以及从 GitHub 常见用法里整理出来的索引。

它不修改任何正式产物的规则、策略组、DNS、嗅探、GeoX 或 rule-provider。实际分流基线仍以 `rulesets/source/routing-graph.js` 为准。

## 目录

```text
SubStore/
  README.md
  scripts/
    README.md
    local/       从本机 Mihomo/Clash Party Sub-Store 配置脱敏抽出的脚本
    common/      通用小脚本模板
    community/   GitHub 常见脚本与上游项目索引
```

## 推荐工作流

1. 在 Clash Party / Mihomo Party 内置 Sub-Store 中，把每个机场作为一条单独订阅添加。
2. 单条订阅先挂 `scripts/local/flag-airport-rename.js`，用 `name=机场名` 给节点打上稳定前缀。
3. 组合订阅里按需挂 `scripts/local/drop-invalid-nodes.js`、`scripts/local/cleanup-vless-vmess-fields.js`、`scripts/common/drop-info-nodes.js`。
4. 组合订阅最终输出 `Clash.Meta(mihomo)`，再把 Sub-Store 生成的单一 URL 填给本仓库的客户端配置。
5. 如果要在组合订阅里显示多机场合并后的流量信息，最后挂 `scripts/local/merge-subscription-userinfo.js`。

## 本地脚本

这些脚本来自当前电脑的 Mihomo Party / Clash Party Sub-Store 配置，已移除订阅 URL、token、缓存节点与具体机场默认名。

- `scripts/local/flag-airport-rename.js`：给节点加“国旗 + 机场名”前缀，并清理重复国旗。
- `scripts/local/drop-invalid-nodes.js`：过滤缺少 server/port 或使用过时 SS/SSR 加密的节点。
- `scripts/local/cleanup-vless-vmess-fields.js`：清理 VLESS 节点上混入的 VMess 残留字段。
- `scripts/local/merge-subscription-userinfo.js`：在组合订阅里汇总多个机场的 `subscription-userinfo`，并防止镜像订阅把同一账户流量重复计入。

示例参数：

```text
name=Aurora&separator=%20-%20&fallback=🌐
```

Sub-Store 的脚本参数通常可以放在脚本 URL 的 `#` 后面；官方链接参数说明也提醒 URL 参数需要 `encodeURIComponent` 编码。

## 镜像订阅流量去重

`scripts/local/merge-subscription-userinfo.js` 只处理组合订阅的流量头，不改变节点去重逻辑。它按以下优先级判断流量是否属于同一个镜像账户：

1. 自动去重：两个订阅的 `upload`、`download`、`total`、`expire` 四项均完全一致，且去掉域名后 URL 的路径和查询参数仍一致时，只计算一次。这样可覆盖“仅替换订阅域名”的常见镜像。
2. 显式去重：镜像的 CDN 缓存可能略有延迟，或两个镜像 URL 的路径不同。此时在**每条订阅 URL**的 `#` 参数中设置同一个 `flowDedup` 键：

```text
https://sub-a.example/api/v1/client/subscribe?token=...#flowDedup=airport-alpha
https://sub-b.example/mirror/subscribe?token=...#flowDedup=airport-alpha
```

`flowDedup` 是本脚本私有参数，脚本会在请求订阅前剥离该 fragment，不会传给机场。若 URL 已有其他 `#` 参数，在末尾追加 `&flowDedup=airport-alpha`；使用 JSON fragment 时，在 JSON 对象中加入 `"flowDedup":"airport-alpha"` 后再整体 URL 编码。

同一个 `flowDedup` 组内，`upload`、`download`、`total` 分别取最大值，避免旧 CDN 响应把计数回退；组内到期时间取最新值。不同机场组仍正常相加，最终组合订阅仍显示所有独立机场中最早的有效到期时间。

如果两条订阅虽然流量头相同但确实应独立计费，给它们设置 `#flowDedup=off` 可关闭自动去重。运行日志会输出 `snapshots`、`counted` 和 `deduped` 数量，但不会输出订阅 URL 或 `flowDedup` 键。

## 通用脚本

- `scripts/common/drop-info-nodes.js`：丢弃“剩余流量、到期、官网、订阅”等信息节点。
- `scripts/common/normalize-node-names.js`：折叠空白、统一分隔符、可选移除国旗。
- `scripts/common/dedupe-node-names.js`：给重复节点名追加稳定序号，避免客户端覆盖同名节点。

## 安全边界

不要提交以下内容：

- Sub-Store 导出的 `sub-store.json` / `root.json`
- 机场订阅 URL、token、UUID、password
- 缓存后的完整节点列表
- 带真实机场名或私有域名的截图

第三方 GitHub 脚本默认只放索引，不直接 vendor 到仓库。原因很朴素：很多 Gist 没有明确许可证，且常混有个人参数示例；直接复制会让后续维护和授权边界变脏。

## 参考来源

- [sub-store-org/Sub-Store](https://github.com/sub-store-org/Sub-Store)：官方支持脚本筛选、脚本操作、正则重命名等订阅处理能力。
- [Sub-Store 脚本使用说明](https://github.com/sub-store-org/Sub-Store/wiki/%E8%84%9A%E6%9C%AC%E4%BD%BF%E7%94%A8%E8%AF%B4%E6%98%8E)：官方脚本入口说明与 demo。
- [Sub-Store 链接参数说明](https://github.com/sub-store-org/Sub-Store/wiki/%E9%93%BE%E6%8E%A5%E5%8F%82%E6%95%B0%E8%AF%B4%E6%98%8E)：下载链接、`target`、`url`、`content`、`$options` 等参数说明。
- [dahaha-365/YaNet](https://github.com/dahaha-365/YaNet)：把 SubStore 作为自建订阅管理入口，并提供 Mihomo 动态覆写思路。
- [powerfullz/override-rules](https://github.com/powerfullz/override-rules)：使用 `#landing=true&loadbalance=true` 一类参数控制动态脚本行为。
