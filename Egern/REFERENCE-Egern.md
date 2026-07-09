# Egern 语法参考与纳入判断

## 结论

有必要增加 Egern，但应分阶段接入。

Egern 的能力足够承载本仓库的分流模型：它有订阅型 `external` 策略组、区域自动测速 `auto_test`、业务 `select` 组、顺序匹配规则、远端 `rule_set` 和 DNS forward。限制在于规则集格式：Egern `rule_set` 需要 YAML set 结构，而不是 Clash classical 行格式，也不是 Mihomo `.mrs`。

因此 v5.4.38-egern.1 先做：

- Egern 原生 Profile。
- Egern 原生补充规则集。
- 不把零星单条域名/IP散写进主规则。

暂不做：

- 全量 bm7 / Accademia / szkane / VPSDance 规则源转换。
- Mihomo `.mrs` 直接复用。
- 桌面 `PROCESS-NAME` 规则同步。

## 官方语法依据

- Policy Groups：Egern 支持 `select`、`auto_test`、`smart`、`fallback`、`load_balance`、`external`、`conditional`，且 `external` 可加载订阅。
  <https://egernapp.com/docs/configuration/policy_groups/>
- Rules：规则按出现顺序首个命中生效，`rule_set` 可引用本地或远端规则集。
  <https://egernapp.com/docs/configuration/rules/>
- Rule Sets：远端规则集使用 `domain_set`、`domain_suffix_set`、`domain_keyword_set`、`ip_cidr_set`、`ip_cidr6_set` 等 YAML 字段。
  <https://egernapp.com/docs/configuration/rules/>
- DNS：Egern 支持 `bootstrap`、`upstreams`、`forward`、`proxy_nameservers`，可表达本仓库的国内/国外/代理 DNS 分层。
  <https://egernapp.com/docs/configuration/dns/>
- Profile：主配置支持 `policy_groups`、`rules`、`dns`、`default_subscription_group`、`default_proxy_group` 等顶层字段。
  <https://egernapp.com/docs/configuration/example/>

## 后续完整等价迁移条件

1. 为每类上游规则源建立稳定转换器：
   - Clash classical -> Egern YAML set。
   - Surge/Loon 远端 list -> Egern YAML set。
   - Mihomo `.mrs` 不直接复用，除非 Egern 官方明确支持。
2. 建立 Egern 合同校验：
   - 22 区域组 + 33 业务组存在。
   - 补充规则集早于广告/国外尾部/AI 宽规则。
   - 规则集 URL 全部可下载。
3. 明确不支持项：
   - `PROCESS-NAME` 不同步。
   - Mihomo `GEOSITE` / `GEOIP` provider 语法不直接照搬。
   - Mihomo DNS `nameserver-policy` 不逐字段照搬，改用 Egern `dns.forward`。
