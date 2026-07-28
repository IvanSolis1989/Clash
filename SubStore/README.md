# Sub-Store：多机场订阅聚合与部署教程

> 这里处理的是**订阅与节点管理**，不是分流规则。Smart-Config-Kit 的规则、策略组、DNS、嗅探、GeoX 与 rule-provider 仍以 `rulesets/source/routing-graph.js` 为唯一基线。

当你想把机场 A、B、C 的节点合成一份节点池，再交给 FlClash / Clash Party 的同一份覆写脚本统一分类时，Sub-Store 是推荐的聚合层。它解决“多订阅 → 一条客户端订阅 URL”；本仓库继续解决“这一条配置里的全部节点 → 区域组、业务组与分流规则”。

```text
多个机场原生订阅
  → Sub-Store：单订阅标识、组合清洗、去重、可选流量头合并
  → 一条 Clash.Meta(mihomo) 订阅 URL
  → FlClash / Clash Party 单一 Profile + Smart-Config-Kit 覆写
  → 22 区域组 + 33 业务组
```

## 先判断是否需要聚合

| 目标 | 合适方案 |
|---|---|
| 在两个机场之间手动切换 | 客户端保留多个独立 Profile 即可 |
| 多个机场节点进入同一个“香港节点 / 全球节点 / AI 服务”等策略组 | 使用本教程的 Sub-Store 组合订阅 |
| 想让覆写脚本自行保存 URL、token、拉取并合并节点 | 不推荐；这会把订阅管理、凭据保存和刷新失败处理塞进覆写脚本 |

FlClash 的覆写运行在当前选中的单份配置上：它会处理这份配置的 `proxies`，不会读取其他 Profile 的订阅内容。因此“能添加多条 Profile”不等于“能得到一个合并后的活动节点池”。

## 安全边界（先读）

- 订阅 URL、token、UUID、密码和完整节点列表都是私密数据；不要贴到 Issue、聊天记录、仓库或公共截图中。
- 优先使用你信任的本地或自托管 Sub-Store；不要把公网可访问的后端裸露出来。
- 官方 Sub-Store 已说明 `sub.store` 相关模块域名并非其持有的公共域名，错误路由可能造成数据暴露。使用模块方案前先读官方安全公告；本教程的 Docker 方案默认仅监听本机。
- `sub-store.json` / `root.json` 是个人配置备份，不应提交到本仓库。

## 方式一：使用客户端内置 Sub-Store（最省事）

如果你已有 Clash Party 或 Mihomo Party 的内置 Sub-Store，不需要额外部署服务：

1. 在内置 Sub-Store 中把每个机场作为一条独立订阅加入。
2. 按下方“单订阅处理”给每个机场加稳定前缀。
3. 创建组合订阅，按下方顺序挂清洗和去重脚本。
4. 输出目标选择 `Clash.Meta(mihomo)`，复制组合订阅生成的一条 URL。
5. 在 FlClash 或 Clash Party 中只导入这条 URL，并关联本仓库的覆写脚本。

## 方式二：自托管 Sub-Store（Docker）

适用于没有内置 Sub-Store、希望控制数据位置，或要让多个客户端共同使用同一条组合订阅的用户。下面采用 [官方 Docker 镜像说明](https://hub.docker.com/r/xream/sub-store) 的本机监听、持久化目录和前后端路径配置；先在可信设备上部署，再决定是否需要受控的远程访问。

### 1. 准备环境

- 安装并启动 Docker。Windows 用户可使用 Docker Desktop + WSL；Linux / macOS / WSL 用户可直接在 shell 中操作。
- 新建一个**不在本仓库、不会同步或公开**的目录，例如 `scki-substore/`。容器的数据会放在该目录的 `data/` 中。
- 先准备一个仅由字母、数字和连字符组成的随机路径，例如 `/scki-7gC2kY9mQ4pL`。它用于隔离后端路径，**不是身份验证**；不要复用教程示例或把它当作唯一防护。
- 保持服务只在本机监听；除非你能自行配置 HTTPS、认证、访问控制和反向代理，不要暴露到公网。

### 2. 写入 Compose 配置

在私有目录创建 `compose.yaml`。请把 `SUB_STORE_FRONTEND_BACKEND_PATH` 中的示例路径替换为自己生成的路径，并在下方所有 URL 中保持一致；镜像 tag 固定是为了可复现，升级前请到 [官方 Tags](https://hub.docker.com/r/xream/sub-store/tags) 查看可用版本。

```yaml
services:
  sub-store:
    image: xream/sub-store:2.36.23
    container_name: scki-substore
    restart: always
    environment:
      # 自行生成；必须以 / 开头，且只使用字母、数字、连字符
      SUB_STORE_FRONTEND_BACKEND_PATH: /scki-7gC2kY9mQ4pL
      # 仅允许本机前端访问本机后端
      SUB_STORE_CORS_ALLOWED_ORIGINS: http://127.0.0.1:3001,http://localhost:3001
    ports:
      # 仅暴露前端端口到回环地址；不要映射 3000 到公网
      - "127.0.0.1:3001:3001"
    volumes:
      # 私密持久化数据；不要提交、同步或公开该目录
      - ./data:/opt/app/data
```

### 3. 启动并验证

在 `compose.yaml` 所在目录运行：

```bash
docker compose up -d
docker compose ps
docker compose logs --tail=100 sub-store
```

健康检查应返回当前环境信息（PowerShell 可把 `curl` 换成 `curl.exe`）：

```bash
curl -fsS http://127.0.0.1:3001/scki-7gC2kY9mQ4pL/api/utils/env
```

随后在同一台设备打开：

```text
http://127.0.0.1:3001?api=http://127.0.0.1:3001/scki-7gC2kY9mQ4pL
```

页面能打开、健康检查返回成功，才开始添加订阅。若显示后端不可达，逐项核对端口、`SUB_STORE_FRONTEND_BACKEND_PATH` 和浏览器 URL 里的路径是否完全相同。

### 4. 日常维护、升级与备份

```bash
# 查看状态与日志
docker compose ps
docker compose logs --tail=100 sub-store

# 升级：先确认目标 tag，再拉取和重建；./data 会保留
docker compose pull
docker compose up -d

# 停止服务但保留私密数据
docker compose stop
```

`./data` 中会保存个人配置和订阅数据。升级前把它备份到私有、加密的位置；不要把该目录提交到 Git、同步到公共网盘或贴进排障截图。若确需跨设备使用，不要简单把 `127.0.0.1` 改成 `0.0.0.0`：请使用自己的 HTTPS 反向代理，并加认证或 VPN；官方文档特别提示后端主机设置不应直接暴露，随机路径不能替代访问控制。

## 聚合步骤：从多条机场订阅到一条 Mihomo URL

### 第 1 步：逐条添加机场原生订阅

每个机场单独创建一条订阅，优先使用机场提供的原生订阅链接。不要先经过来历不明的在线转换器，也不要把 URL、token 或节点截图发到公开 Issue。

### 第 2 步：单订阅先加机场前缀

给每个机场挂一次 [`flag-airport-rename.js`](./scripts/local/flag-airport-rename.js)。它输出“国旗 + 机场名 + 原节点名”，能保留来源、避免名称冲突，也不会妨碍地区识别。

脚本 URL 示例（把 `Airport-A` 改为你的本地标识，不要使用真实 token）：

```text
https://raw.githubusercontent.com/IvanSolis1989/Smart-Config-Kit/main/SubStore/scripts/local/flag-airport-rename.js#name=Airport-A&separator=%20-%20&fallback=%F0%9F%8C%90
```

对 Airport-B、Airport-C 使用不同的 `name`。参数放在 `#` 后，不会随脚本请求发送给 GitHub。

### 第 3 步：创建组合订阅并按顺序处理

将所有单订阅加入一个组合订阅，然后按下面顺序添加脚本。前三项是常规清洗；名称样式不一致时再规范化，最后才处理重复名称与可选流量头。

| 顺序 | 脚本 | 作用 |
|---|---|---|
| 1 | [`drop-invalid-nodes.js`](./scripts/local/drop-invalid-nodes.js) | 移除缺少 server/port 或使用已淘汰 SS/SSR 加密的节点 |
| 2 | [`cleanup-vless-vmess-fields.js`](./scripts/local/cleanup-vless-vmess-fields.js) | 去掉 VLESS 节点混入的 VMess 残留字段 |
| 3 | [`drop-info-nodes.js`](./scripts/common/drop-info-nodes.js) | 移除“剩余流量 / 到期 / 官网”等伪节点 |
| 4（可选） | [`normalize-node-names.js`](./scripts/common/normalize-node-names.js) | 统一常见命名样式；保留默认参数即可，只有明确需要时再启用附加改写 |
| 5（名称仍有重复时） | [`dedupe-node-names.js`](./scripts/common/dedupe-node-names.js) | 为仍然重名的节点追加稳定序号，避免客户端覆盖 |
| 6（可选，最后） | [`merge-subscription-userinfo.js`](./scripts/local/merge-subscription-userinfo.js) | 汇总独立机场的流量头，并防止镜像订阅重复计量 |

从 GitHub 打开脚本后复制 **Raw** 地址填入 Sub-Store。不要直接修改仓库脚本来写入机场 URL 或 token。

### 第 4 步：输出单一订阅 URL

组合订阅的目标格式选择 **`Clash.Meta(mihomo)`**。Sub-Store 生成的一条下载/订阅 URL 才是给 FlClash 或 Clash Party 使用的入口；不要把多条原始机场 URL 分别关联到同一覆写逻辑，期望它们自动变成一个节点池。

### 第 5 步：导入 FlClash 或 Clash Party

1. 新建或更新**一条**远程 Profile，URL 填组合订阅输出。
2. FlClash：按 [`FlClash/README.md`](../FlClash/README.md) 创建并关联 `FlClash(mihomo).js` 覆写脚本。
3. Clash Party：导入组合订阅后，使用对应 Smart / Normal 覆写脚本。
4. 刷新订阅并查看节点：每个机场都应能通过前缀追溯来源，区域组应同时看到各机场符合地区条件的节点。

## 验证清单

- 组合订阅只有一条客户端导入 URL，且输出格式为 `Clash.Meta(mihomo)`。
- Airport-A / Airport-B 等前缀都能在代理列表中找到；没有“流量、到期、官网”等伪节点。
- FlClash 日志中的处理节点数等于组合后的节点总数，而不是某一个机场的数量。
- 区域组和业务组正常出现；FlClash 使用覆写脚本时应看到最多 22 个区域组和 33 个业务组。
- 同名节点没有被静默覆盖；必要时检查 `dedupe-node-names.js` 的日志。
- 流量统计仅在使用可选脚本后检查：独立机场应相加，镜像订阅应只计一次。

## 镜像订阅流量去重

[`merge-subscription-userinfo.js`](./scripts/local/merge-subscription-userinfo.js) 只处理组合订阅的流量头，不改变节点去重逻辑。

1. 自动去重：两个订阅去掉域名后路径和查询参数一致，且 `total`、`expire` 相同，按同一镜像账户处理；`upload`、`download` 允许存在小幅 CDN 缓存差异。
2. 显式去重：镜像 URL 路径不同或元数据不同，在每条订阅 URL 的 `#` 参数中设置同一个 `flowDedup` 键。

```text
https://sub-a.example/api/v1/client/subscribe?token=...#flowDedup=airport-alpha
https://sub-b.example/mirror/subscribe?token=...#flowDedup=airport-alpha
```

同一 `flowDedup` 组内，`upload`、`download`、`total` 取最大值，到期时间取最新值；独立机场仍相加。若两条相同流量头确实是独立计费，使用 `#flowDedup=off` 禁用自动去重。脚本日志不会输出订阅 URL 或 `flowDedup` 值。

## 常见问题

### FlClash 里能存多条订阅，为什么还要 Sub-Store？

多条 Profile 用于切换；覆写脚本只处理当前活动 Profile 的配置。Sub-Store 的作用是先把多个机场变为一份 `proxies` 列表，让同一覆写脚本能一次完成分类。

### 组合后策略组为空或只剩一个机场的节点？

确认客户端导入的是组合订阅的一条输出 URL，并且覆写脚本关联在这条 Profile 上。随后刷新该 Profile；不要分别刷新多个原始机场 Profile 后期待客户端自动合并。

### 节点名称重复、来源看不出来怎么办？

先对每个单订阅使用 `flag-airport-rename.js`，再在组合订阅使用 `dedupe-node-names.js`。前者保留来源，后者处理仍然重复的名称。

### 为什么不把订阅 URL 直接写进 Smart-Config-Kit 的 JS？

订阅管理需要处理凭据、刷新、故障隔离、流量头和节点去重；将私密 URL 放进公开脚本既不安全，也让覆写脚本承担不属于它的职责。仓库只提供脱敏的聚合脚本模板。

## 目录与参考

```text
SubStore/
  README.md                 本教程
  scripts/
    README.md               脚本用途与推荐顺序
    local/                  从本机配置脱敏抽出的聚合脚本
    common/                 可复用通用脚本
    community/              上游脚本索引
```

- [Sub-Store 官方仓库](https://github.com/sub-store-org/Sub-Store)：格式转换、订阅整理、脚本操作与多订阅收集能力。
- [Sub-Store 官方 Docker 镜像说明](https://hub.docker.com/r/xream/sub-store)：本机端口绑定、数据持久化、后端路径、CORS 与健康检查参数。
- [Sub-Store 官方 Wiki](https://github.com/sub-store-org/Sub-Store/wiki)：Docker 部署入口；环境变量以 Docker 镜像说明为准。
- [Sub-Store 官方安全公告](https://github.com/sub-store-org/Sub-Store#substore-domain-safety-notice)：使用模块或公共前端前应理解的数据暴露边界。
- [FlClash 覆写教程](../FlClash/README.md)：将组合后的单一 URL 接入本仓库 FlClash 覆写。
