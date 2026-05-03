# FlClash 使用教程

> 适用客户端：**FlClash**（Android / Windows / macOS / Linux）

---

## 推荐方案：CMFA 静态 YAML（已验证可用）

FlClash 用户**直接导入 CMFA YAML**，这是目前唯一稳定可用的方案。

1. 下载 [`Clash Meta For Android/CMFA(mihomo).yaml`](../Clash%20Meta%20For%20Android/CMFA(mihomo).yaml)
2. 用文本编辑器打开，找到 `url:` 行（约第 31 行），替换为你的机场订阅
3. FlClash → 配置 → **+** → **从文件导入** → 选择修改后的 YAML
4. 导入后按需在 FlClash 内配置 GeoX URL（外部资源）和 DNS（进阶配置），详见下方 §必改配置

---

## 实验方案：JS 覆写脚本（暂不可用 ⚠️）

`FlClash(mihomo).js` 是本仓库为 FlClash 编写的覆写脚本，
基于 Clash Party Normal JS 移植，理论上提供动态节点分类、家宽识别、订阅清理等能力。

**但 FlClash v0.8.90~v0.8.92 存在覆写脚本相关的未修复 bug：**
- [Issue #1541](https://github.com/chen08209/FlClash/issues/1541) — 自定义代理组不显示
- [Issue #1636](https://github.com/chen08209/FlClash/issues/1636) — 规则目标下拉框缺少代理组
- [Issue #1451](https://github.com/chen08209/FlClash/issues/1451) — 脚本在特定版本失效
- 实测：v0.8.92 中覆写脚本对 `config["proxy-groups"]` 的任何修改都不生效

**待 FlClash 修复上述 issue 后，覆写脚本将作为推荐方案。** 目前请使用 CMFA YAML。

---

## 必改配置（CMFA YAML 导入后手动设置）

> 以下两项需要在使用 CMFA YAML 后在 FlClash UI 内手动配置。

### ① 外部资源（GeoX 数据库）

1. FlClash → 配置 → 点击配置卡片右上角 ⋮ → **编辑**
2. 切换到 **外部资源** 标签
3. 填入：

```yaml
geox-url:
  geoip: https://fastly.jsdelivr.net/gh/Loyalsoldier/geoip@release/geoip.dat
  mmdb: https://fastly.jsdelivr.net/gh/Loyalsoldier/geoip@release/Country.mmdb
  asn: https://fastly.jsdelivr.net/gh/Loyalsoldier/geoip@release/GeoLite2-ASN.mmdb
  geosite: https://fastly.jsdelivr.net/gh/MetaCubeX/meta-rules-dat@release/geosite.dat
geo-auto-update: true
```

### ② 进阶配置（DNS）

1. 同上位置 → 切换到 **进阶配置** 标签
2. 填入：

```yaml
dns:
  use-hosts: false
  use-system-hosts: false
  respect-rules: true
  default-nameserver:
    - 223.5.5.5
    - 119.29.29.29
    - 1.1.1.1
    - 8.8.8.8
  nameserver:
    - https://dns.alidns.com/dns-query
    - https://doh.pub/dns-query
  proxy-server-nameserver:
    - https://cloudflare-dns.com/dns-query
    - https://dns.google/dns-query
    - https://dns.alidns.com/dns-query
    - https://doh.pub/dns-query
  direct-nameserver:
    - https://dns.alidns.com/dns-query
    - https://doh.pub/dns-query
  fallback:
    - https://cloudflare-dns.com/dns-query
    - https://dns.google/dns-query
  fallback-filter:
    geoip: true
    geoip-code: CN
    ipcidr:
      - 240.0.0.0/4
      - 0.0.0.0/32
      - 127.0.0.0/8
      - 10.0.0.0/8
      - 192.168.0.0/16
    domain: []
```

---

## 协议支持

FlClash 底层是 Mihomo 内核，协议支持：

| 协议 | 支持 |
|---|:-:|
| Shadowsocks (SS) / SSR | ✅ |
| VMess / VLESS（含 REALITY + XTLS-Vision） | ✅ |
| Trojan（含 Trojan-Go） | ✅ |
| Hysteria v1/v2 / TUIC v5 | ✅ |
| WireGuard / AnyTLS / ShadowTLS / Snell v4 | ✅ |

---

## 相关链接

- [FlClash GitHub](https://github.com/chen08209/FlClash)
- [CMFA 使用教程](../Clash%20Meta%20For%20Android/README.md)
- [覆写脚本 Issue 追踪](https://github.com/chen08209/FlClash/issues/1541)
