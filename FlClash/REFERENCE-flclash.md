# FlClash 参考文档

> 来源：https://github.com/chen08209/FlClash
> 获取日期：2026-05-03
> 更新于 2026-05-31（复查）：FlClash 最新版 v0.8.93（2026-05-29）。从 v0.8.92 升级 1 个版本。JS 覆写脚本 API 无变更，当前基线兼容。
> 版本：v0.8.93（最新稳定版）

---

## 1. 项目概述

FlClash 是基于 Flutter 的多平台 Mihomo（原 ClashMeta）客户端。

- **平台**：Android / Windows / macOS / Linux
- **内核**：标准 Mihomo（修改版，增加 FFI 桥接层）
- **许可证**：GPL-3.0
- **仓库**：https://github.com/chen08209/FlClash

---

## 2. 配置架构

FlClash 采用双配置系统：

| 层 | 类 | 职责 |
|---|---|---|
| 应用层 | `AppSettingProps` | UI、主题、语言、VPN 选项、自动启动等 |
| 代理引擎层 | `ClashConfig` | 端口、模式、DNS、TUN、代理组、规则等 |

### ClashConfig 关键字段

| 字段 | 类型 | 说明 |
|------|------|------|
| `mixed-port` | int | 混合代理端口（默认 7890） |
| `mode` | Mode | 路由模式：rule / global / direct |
| `allow-lan` | bool | 允许局域网连接 |
| `log-level` | LogLevel | 日志级别 |
| `ipv6` | bool | IPv6 支持 |
| `find-process-mode` | FindProcessMode | 进程匹配模式 |
| `unified-delay` | bool | 统一延迟测试 |
| `tcp-concurrent` | bool | TCP 并发连接 |
| `tun` | Tun | TUN 设备配置 |
| `dns` | Dns | DNS 解析配置 |
| `proxy-groups` | List\<ProxyGroup\> | 代理组列表 |
| `rules` | List\<String\> | 路由规则列表 |
| `rule-providers` | Map\<String,RuleProvider\> | 规则提供者 |
| `hosts` | Map\<String,String\> | 主机映射 |
| `geox-url` | GeoXUrl | GeoIP/GeoSite/ASN 数据库 URL |

---

## 3. 覆写系统

### 3.1 配置应用流水线

```
订阅拉取 → 图形化覆写合并 → 脚本评估 → YAML 编码 → 核心设置
```

覆写脚本在「图形化覆写合并」之后、「YAML 编码」之前执行，因此：
- 脚本收到的 `config` 已包含图形化覆写的修改
- 脚本对 `config` 的修改会直接影响最终传给内核的 YAML

### 3.2 图形化覆写规则（v0.8.81+）

UI 支持添加的规则类型：
- `DOMAIN-SUFFIX` — 域名后缀匹配
- `DOMAIN-KEYWORD` — 域名关键词匹配
- `DOMAIN` — 域名精确匹配
- `IP-CIDR` — IP CIDR 段匹配
- `GEOIP` — GeoIP 地理位置匹配（如 CN）
- `PROCESS-NAME` — 进程名匹配（Windows 专属）

### 3.3 JavaScript 覆写脚本（v0.8.85+）

#### 入口函数

```javascript
function main(config) {
  // 修改 config 对象
  return config;
}
```

`config` 是完整的 `ClashConfig` 对象（结构同标准 mihomo config）。

#### 支持的操作

| 操作 | 示例 |
|------|------|
| 修改代理组 | `config["proxy-groups"].push({name:"MyGroup", type:"select", proxies:[...]})` |
| 添加/替换规则 | `config.rules = ["DOMAIN-SUFFIX,example.com,DIRECT", ...config.rules]` |
| 注入规则提供者 | `config["rule-providers"]["my-rules"] = {type:"http", ...}` |
| 修改全局设置 | `config["unified-delay"] = true` |
| 修改 DNS | `config.dns = {...}` |
| 修改 TUN | `config.tun = {...}` |
| 节点过滤/注入 | `config.proxies = config.proxies.filter(...)` |

#### 覆写合并语义

| 配置段 | 操作 |
|--------|------|
| `rules` | prefix（前置插入）/ suffix（后置追加） |
| `proxies` | prefix / suffix / override（按 name 匹配覆盖） |
| `proxy-groups` | prefix / suffix / override（按 name 匹配覆盖） |
| 其他字段 | 深度合并（mixin 值覆盖 base 值） |

#### 代理组类型

- `select` — 手动选择
- `url-test` — 自动测速择优（需 `url`、`interval`、`tolerance` 字段）
- `relay` — 链式代理
- `load-balance` — 负载均衡
- `fallback` — 故障转移

#### 特殊字段

- `hidden: true` — 在代理页面隐藏该组
- `lazy: true` — 延迟测速（仅在需要时测速）

---

## 4. JS 引擎环境

FlClash 使用内置 JS 引擎（推测为 QuickJS，来自 Flutter 集成），支持：
- ES5/ES6 基础语法（`const`/`let`、箭头函数、模板字面量）
- `RegExp`（正则表达式）
- `Array` / `Object` / `Map` / `Set`
- `String` / `Number` / `Boolean`

**不确定支持的特性**：
- `console.log` — 可能不支持（本仓库脚本已做条件包装）

---

## 5. 与 Clash Party JS 的关键差异

| 维度 | Clash Party JS | FlClash 覆写脚本 |
|------|:---:|:---:|
| 执行环境 | Sub-Store JS 引擎 | FlClash 内置 QuickJS |
| `type: smart` | Smart 版支持 | 不支持（内核限制） |
| LightGBM | Smart 版支持 | 不支持（内核限制） |
| 多机场融合 | Sub-Store 合并后传入 | FlClash 单订阅传入 |
| TUN 管理 | 脚本覆写 | App UI 管理 |
| 端口管理 | 脚本覆写 | App UI 管理 |
| `config` 结构 | 标准 mihomo config | 标准 mihomo config（100% 兼容） |

---

## 6. 相关资源

| 资源 | URL |
|------|-----|
| GitHub 仓库 | https://github.com/chen08209/FlClash |
| Releases | https://github.com/chen08209/FlClash/releases |
| DeepWiki 配置管理 | https://deepwiki.com/chen08209/FlClash/6-build-and-deployment |
| DeepWiki 核心引擎 | https://deepwiki.com/chen08209/FlClash/3.1-core-network-engine |
| 覆写脚本教程 (Issue #1510) | https://github.com/chen08209/FlClash/issues/1510 |
| 进阶配置教程 (bwgss.org) | https://www.bwgss.org/4226.html |
