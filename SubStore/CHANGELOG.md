# SubStore 变更日志

> SubStore 是辅助脚本目录，不参与 14 类客户端正式分流产物的生成。

## v6.0.2-substore.2 (2026-07-11)

- 修复真实 CDN 镜像的计数漂移：同一账户的镜像可有几 KB 级 `upload` / `download` 缓存差异，不能以四项流量头逐字节相等作为自动去重前提。
- 自动身份改为 host 无关的订阅路径/参数 + 相同 `total` / `expire`；镜像组内继续取每个计数最大值。不同账户仍要求路径/参数身份一致，路径或计划元数据不同的镜像继续使用 `flowDedup` 显式归组。
- 修复 Clash Party 内置 Sub-Store 的 logger receiver 问题：`$substore.info` 必须以 `$substore` 为 receiver 调用。此前最终状态日志会抛错并使脚本事务回退，导致旧流量头没有被新汇总结果覆盖。

## v6.0.2-substore.1 (2026-07-11)

- `merge-subscription-userinfo.js` 新增镜像订阅流量去重：完整且同源路径/参数的相同流量快照自动合并；不同镜像地址可通过订阅 URL 的 `flowDedup` 显式归组。
- 显式归组内对流量计数和到期时间取最新值，防止 CDN 缓存延迟使同一账户被重复累加或提前显示到期；`flowDedup=off` 可保留两个相同流量头的独立订阅。
- 新增 Node 回归测试，覆盖自动去重、独立订阅保护、显式归组、关闭去重和 SubStore runtime 持久化路径。
