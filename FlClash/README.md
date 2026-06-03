# FlClash 使用教程 — 覆写脚本版

> 目录简介：这里提供 FlClash 专用 JS 覆写脚本和导入教程，用动态节点分类复刻 Clash Party Normal 语义。
>
> 覆写脚本：`FlClash(mihomo).js`
> 适用客户端：**FlClash**（Android / Windows / macOS / Linux）
> 内核要求：FlClash >= **v0.8.85**
> 当前版本：**v5.4.22-flclash.1**（22 url-test 区域组 + 32 业务策略组；含借鉴 Proxy-override 批 A+B+C+D：国内 SDK/CDN 直连 + fake-ip-filter 补全 + direct-nameserver-follow-policy + 节点过滤 junk 关键词补充 + QUIC 精细化 + DoH-over-IP bootstrap）

<sub>💖 [支持本项目](../docs/donate.md) · ⭐ [Star](https://github.com/ivansolis1989/Smart-Config-Kit) · 🐛 [Issue](https://github.com/ivansolis1989/Smart-Config-Kit/issues)</sub>

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

<img width="360" height="800" alt="c54492ae7abbfa269f1a6cceaca65a7c" src="https://github.com/user-attachments/assets/35be12b0-39a0-43a5-8b4f-01f736c93704" />

1. FlClash → 底部「配置」→ 顶部 **「覆写脚本」**
2. 点右上角 **+**
3. 输入名称（如 `Smart分流`），选择加载方式：
   - **URL**：填入 `https://raw.githubusercontent.com/IvanSolis1989/Smart-Config-Kit/main/FlClash/FlClash%28mihomo%29.js`
   - **jsdelivr CDN**（国内更快）：`https://cdn.jsdelivr.net/gh/IvanSolis1989/Smart-Config-Kit@main/FlClash/FlClash%28mihomo%29.js`
   - **粘贴**：浏览器打开 Raw 链接，全选复制粘贴；第一行必须是 `// FlClash 覆写脚本`
4. 保存

> 如果 FlClash 弹出 `SyntaxError: unexpected token '<'`，说明当前导入内容是 HTML 页面，不是 JS 脚本。删除这个覆写脚本，改用上面的 Raw / jsdelivr 链接重新创建。

### 第 2 步：关联到订阅

<img width="360" height="800" alt="5cea3c38d68a4f179fd4c3871052fd01" src="https://github.com/user-attachments/assets/f133d259-3841-4719-9396-db2488a507fc" />

1. 返回配置页 → 点订阅卡片右上角 ⋮
2. **更多** → **覆写**
3. 选择刚才创建的覆写脚本 → 确定
4. 返回首页 → 下拉刷新（或重启 FlClash）

### 验证

点「代理」标签，应看到：
- **最多 22 个区域组**（11 全部 + 11 家宽；空区域自动跳过）：🌍 全球节点、🇭🇰 香港节点、🇸🇬 狮城节点、🌏 其他节点……
- **32 业务组**：🤖 AI 服务、🎵 TikTok、🎥 Netflix、📱 社交媒体……
- 额外检查：按根 README 的 [导入后 60 秒验证清单](../README.md#-导入后-60-秒验证清单) 确认规则下载、GEOSITE 命中与 anti-ad 误伤白名单。

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
工具 → 资源 ⋮ → 编辑 → 同步：
```yaml
geox-url:
  geoip: https://fastly.jsdelivr.net/gh/Loyalsoldier/geoip@release/geoip.dat
  mmdb: https://fastly.jsdelivr.net/gh/Loyalsoldier/geoip@release/Country.mmdb
  asn: https://fastly.jsdelivr.net/gh/Loyalsoldier/geoip@release/GeoLite2-ASN.mmdb
  geosite: https://fastly.jsdelivr.net/gh/MetaCubeX/meta-rules-dat@release/geosite.dat
geo-auto-update: true
```

### 进阶配置（DNS）
工具 → 进阶配置 ⋮ → DNS：
```yaml
dns:
  use-hosts: false
  use-system-hosts: false
  respect-rules: true
  prefer-h3: false
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
  fake-ip-filter:
    - +.stun.*.*
    - +.stun.*.*.*
    - +.turn.*.*
    - +.turn.*.*.*
    - stun.l.google.com
    - stun1.l.google.com
    - stun2.l.google.com
    - stun3.l.google.com
    - stun4.l.google.com
    - global.turn.twilio.com
    - +.rustdesk.com
  fallback-filter:
    geoip: true
    geoip-code: CN
    geosite:
      - gfw
      - geolocation-!cn
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

---

## 💖 支持本项目

→ [捐赠 / Star / PR](../docs/donate.md)
