# FlClash 使用教程 — 覆写脚本版

> 覆写脚本：`FlClash(mihomo).js`
> 适用客户端：**FlClash**（Android / Windows / macOS / Linux）
> 内核要求：FlClash >= **v0.8.85**

<table><tr>
<td><img width="160" alt="FlClash 截图1" src="https://github.com/user-attachments/assets/e88e0724-2bc0-4111-851e-e8aa0a9141d3"></td>
<td><img width="160" alt="FlClash 截图2" src="https://github.com/user-attachments/assets/530d9f3a-e793-423b-a4d6-85a2d4a75054"></td>
<td><img width="160" alt="FlClash 截图3" src="https://github.com/user-attachments/assets/f2b03096-3469-4d67-ab10-60bac2b82347"></td>
<td><img width="160" alt="FlClash 截图4" src="https://github.com/user-attachments/assets/be31a91a-259c-47a7-b599-fa08752bef8d"></td>
<td><img width="160" alt="FlClash 截图5" src="https://github.com/user-attachments/assets/770eb553-86c5-49a7-80f4-4fd68594888b"></td>
</tr></table>


---

## 快速开始（两步操作）

> ⚠️ **注意**：
> 1. 必须先「创建」脚本再「关联」到订阅，只粘贴不关联不会生效
> 2. 订阅转换器生成的配置可能导致兼容问题，建议使用机场**原生订阅链接**

### 第 1 步：创建覆写脚本

<img width="360" height="800" alt="5cea3c38d68a4f179fd4c3871052fd01" src="https://github.com/user-attachments/assets/c4b3cd7e-5e23-44ce-a2b7-0baccf2a2466" />


1. FlClash → 底部「配置」→ 顶部 **「覆写脚本」**
2. 点右上角 **+**
3. 输入名称（如 `Smart分流`），选择加载方式：
   - **URL**：填入 `https://raw.githubusercontent.com/IvanSolis1989/Smart-Config-Kit/main/FlClash/FlClash(mihomo).js`
   - **jsdelivr CDN**（国内更快）：`https://cdn.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/FlClash/FlClash(mihomo).js`
   - **粘贴**：浏览器打开 GitHub 链接，全选复制粘贴
4. 保存

### 第 2 步：关联到订阅

<img width="360" height="800" alt="0f18df097344c63172aa7d0a8efd7a2d" src="https://github.com/user-attachments/assets/ac560cdb-d551-4099-b569-fc3f07c8fbc8" />


1. 返回配置页 → 点订阅卡片右上角 ⋮
2. **更多** → **覆写**
3. 选择刚才创建的覆写脚本 → 确定
4. 返回首页 → 下拉刷新（或重启 FlClash）

### 验证

点「代理」标签，应看到：
- **18 区域组**（9 全部 + 9 家宽）：🌍 全球节点、🇭🇰 香港节点……
- **31 业务组**：🤖 AI 服务、🎥 Netflix、📱 社交媒体……

---

## 与 CMFA YAML 的对比

| | 覆写脚本（推荐） | CMFA YAML（备选） |
|---|---|---|
| 节点分类 | **word-boundary 正则**，TW 不误伤 TWN | Go RE2 子串匹配 |
| 订阅垃圾清理 | 自动剔除机场无用 proxy-groups | 不支持 |
| 家宽识别 | 自动识别并建独立组 | 支持（filter 正则） |
| 空区域处理 | 无节点自动跳过不建空组 | 可能产生空组 |
| Smart + LightGBM | 不支持（内核限制） | 不支持（同） |

---

## 必改配置（手动设置）

导入脚本后，以下两项需要在 FlClash UI 手动设置：

### 外部资源（GeoX URL）
配置 → 订阅卡片 ⋮ → 编辑 → 外部资源：
```yaml
geox-url:
  geoip: https://fastly.jsdelivr.net/gh/Loyalsoldier/geoip@release/geoip.dat
  mmdb: https://fastly.jsdelivr.net/gh/Loyalsoldier/geoip@release/Country.mmdb
  asn: https://fastly.jsdelivr.net/gh/Loyalsoldier/geoip@release/GeoLite2-ASN.mmdb
  geosite: https://fastly.jsdelivr.net/gh/MetaCubeX/meta-rules-dat@release/geosite.dat
geo-auto-update: true
```

### 进阶配置（DNS）
配置 → 订阅卡片 ⋮ → 编辑 → 进阶配置：
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

## 常见问题

### Q: 代理/规则标签消失了？
可能是订阅转换器生成的配置不兼容。试试用机场的**原生订阅链接**（不经转换器）。

### Q: 区域组为什么是 url-test 不是 smart？
FlClash 内核是标准 Mihomo，不支持 `type: smart` + LightGBM。

### Q: 换机场后需要重新配置吗？
不需要。覆写脚本换订阅后自动重新执行。

---

## 协议支持

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
- [覆写脚本源码](./FlClash(mihomo).js)
- [CMFA YAML（备选方案）](../Clash%20Meta%20For%20Android/CMFA(mihomo).yaml)
