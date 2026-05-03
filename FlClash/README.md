# FlClash 使用教程

> 适用客户端：**FlClash**（Android / Windows / macOS / Linux）

---

## 当前推荐：CMFA 静态 YAML

**FlClash v0.8.92 覆写脚本功能存在 bug**（关联任何覆写脚本后「代理」「规则」标签消失），
已提交 [Issue #1994](https://github.com/chen08209/FlClash/issues/1994) 跟踪。

在官方修复前，请使用 CMFA 静态 YAML：

1. 下载 [`Clash Meta For Android/CMFA(mihomo).yaml`](../Clash%20Meta%20For%20Android/CMFA(mihomo).yaml)
2. 用文本编辑器打开，找到 `url:` 行（约第 31 行），替换为你的机场订阅地址
3. FlClash → 配置 → **+** → **从文件导入** → 选择修改后的 YAML
4. 启动即可

### 必改配置（导入 YAML 后手动设置）

**① 外部资源（GeoX URL）**：编辑配置 → 外部资源标签：
```yaml
geox-url:
  geoip: https://fastly.jsdelivr.net/gh/Loyalsoldier/geoip@release/geoip.dat
  mmdb: https://fastly.jsdelivr.net/gh/Loyalsoldier/geoip@release/Country.mmdb
  asn: https://fastly.jsdelivr.net/gh/Loyalsoldier/geoip@release/GeoLite2-ASN.mmdb
  geosite: https://fastly.jsdelivr.net/gh/MetaCubeX/meta-rules-dat@release/geosite.dat
geo-auto-update: true
```

**② 进阶配置（DNS）**：编辑配置 → 进阶配置标签：
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

## 覆写脚本（待 FlClash 修复后启用）

`FlClash(mihomo).js` 是基于 Clash Party Normal JS 移植的覆写脚本，
提供动态节点分类、家宽识别、订阅清理等能力。
当前因 FlClash v0.8.92 bug（[#1994](https://github.com/chen08209/FlClash/issues/1994)）暂不可用，
待官方修复后恢复推荐。

---

## 相关链接
- [FlClash GitHub](https://github.com/chen08209/FlClash)
- [Bug 跟踪：Issue #1994](https://github.com/chen08209/FlClash/issues/1994)
- [CMFA 使用教程](../Clash%20Meta%20For%20Android/README.md)
