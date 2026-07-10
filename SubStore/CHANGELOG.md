# SubStore 变更日志

> SubStore 是辅助脚本目录，不参与 14 类客户端正式分流产物的生成。

## v6.0.2-substore.1 (2026-07-11)

- `merge-subscription-userinfo.js` 新增镜像订阅流量去重：完整且同源路径/参数的相同流量快照自动合并；不同镜像地址可通过订阅 URL 的 `flowDedup` 显式归组。
- 显式归组内对流量计数和到期时间取最新值，防止 CDN 缓存延迟使同一账户被重复累加或提前显示到期；`flowDedup=off` 可保留两个相同流量头的独立订阅。
- 新增 Node 回归测试，覆盖自动去重、独立订阅保护、显式归组、关闭去重和 SubStore runtime 持久化路径。
