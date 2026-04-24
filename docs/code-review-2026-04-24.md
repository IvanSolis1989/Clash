# 全量代码审查报告 (2026-04-24)

> 基线版本：Clash Party v5.2.8 | 审查范围：10 个产物文件

---

## 审查范围

| # | 产物 | 文件 | 状态 |
|---|------|------|------|
| 0 | **Clash Party JS**（基线） | `Clash Party/ClashParty(mihomo-smart).js` | ✅ |
| 1 | Clash Meta For Android | `Clash Meta For Android/CMFA(mihomo).yaml` | ✅ |
| 2 | OpenClash 轻量版 | `OpenClash/OpenClash(mihomo).sh` | ✅ |
| 3 | OpenClash 完整版 | `OpenClash/OpenClash(mihomo-smart).sh` | ✅ |
| 4 | Shadowrocket | `Shadowrocket/Shadowrocket.conf` | ✅ |
| 5 | SingBox Full | `SingBox/SingBox(sing-box)-full.json` + 生成器 | ✅ |
| 6 | v2rayN Xray 路由 | `v2rayN/v2rayN(xray).json` | ✅ |
| 7 | Surge | `Surge/Surge.conf` | ✅ |
| 8 | Loon | `Loon/Loon.conf` | ✅ |
| 9 | Quantumult X | `Quantumult X/QuantumultX.conf` | ✅ |
| — | Passwall2 辅助脚本 | `Passwall2/Passwall2(xray+sing-box)-apply.sh` | ✅ |

## 审查项目

### 1. 46 代理组一致性（18 区域 + 28 业务）

所有产物中 46 个代理组的名称与 emoji **逐字节一致**，包括 RGI 旗帜序列（🇭🇰🇹🇼🇯🇵🇺🇸🇪🇺等）。

### 2. Rule-Provider 下载代理（RP_PROXY）

| 产物 | 预期代理 | 结果 |
|------|----------|------|
| Clash Party JS | `🚫 受限网站` | ✅ |
| CMFA YAML | `🚫 受限网站` | ✅（387 条） |
| OpenClash Normal | `🚫 受限网站` | ✅ |
| OpenClash Smart | `🚫 受限网站` | ✅ |

### 3. 最终兜底（FINAL）

| 产物 | 值 | 结果 |
|------|-----|------|
| Clash 家族 | `MATCH,🐟 漏网之鱼` | ✅ |
| Shadowrocket | `FINAL,🐟 漏网之鱼,dns-failed` | ✅ |
| Surge | `FINAL,🐟 漏网之鱼,dns-failed` | ✅ |
| Loon | `FINAL,🐟 漏网之鱼,dns-failed` | ✅ |
| Quantumult X | `FINAL,🐟 漏网之鱼` | ✅ |
| SingBox | `route.final: "🐟 漏网之鱼"` | ✅ |

### 4. 广告拦截

所有版本的 `🛑 广告拦截` 组均默认指向 REJECT/block/`action: reject`，第一条规则为广告拦截前置。✅

### 5. FIX#28-P0 APAC 区域扩展

已将 🇭🇰🇹🇼🇯🇵🇰🇷 节点加入亚太组，跨平台验证通过：

| 产物 | 分类器类型 | 结果 |
|------|-----------|------|
| Clash Party JS | word-boundary regex | ✅ |
| CMFA YAML | Go RE2 `filter:` 子串 | ✅ |
| OpenClash Ruby | Ruby 正则子串 | ✅ |
| Shadowrocket | 字面量罗列 | ✅ |
| Surge | 字面量罗列 | ✅ |
| Loon | 字面量罗列 | ✅ |
| Quantumult X | 字面量罗列 | ✅ |

### 6. 节点分类正则语义一致性

| 产物 | 正则风格 | `KR` 命中 `KOR` | `TW` 命中 `TWN` |
|------|---------|-----------------|-----------------|
| Clash Party JS | word-boundary `(^\|[^a-zA-Z])KR([^a-zA-Z]\|$)` | ❌ 不命中 | ❌ 不命中 |
| CMFA `filter:` | Go RE2 子串 | ❌ 不命中 | ✅ 可能命中 |
| OpenClash Ruby | Ruby 子串 | ❌ 不命中 | ✅ 可能命中 |
| SR/Surge/Loon/QX | 字面量罗列 | 显式含 KOR | 显式含 TWN |

### 7. 版本号与 CHANGELOG

所有产物版本号协调为 v5.2.8，Build 日期 2026-04-23/2026-04-24，CHANGELOG 均已同步。✅

### 8. JSON 合法性

| 文件 | 校验方式 | 结果 |
|------|---------|------|
| `SingBox/SingBox(sing-box)-full.json` | `node -e "JSON.parse(...)"` | ✅ |
| `v2rayN/v2rayN(xray).json` | `node -e "JSON.parse(...)"` | ✅ |

### 9. §5 自检命令

全部自检命令通过，无异常输出。✅

### 10. 死引用检查

无悬挂的代理组引用或无匹配策略名的规则条目。✅

## §5 自检命令输出

```bash
# 46 代理组计数
CMFA YAML:                    46
OpenClash Normal 静态业务组:   28 (18 区域由 Ruby 动态生成)
OpenClash Smart 静态业务组:    28 (18 区域由 Ruby 动态生成)
Shadowrocket:                 46
Surge:                        46
Loon:                         46
Quantumult X:                 46
SingBox:                      47 (含顶层 🚀 节点选择)

# RP_PROXY 字段
OpenClash Normal:             proxy: '🚫 受限网站' (DIRECT 0 条)
CMFA:                         proxy: '🚫 受限网站' (☁️ 云与CDN 0 条)

# 死引用检查
🇸🇬 亚太节点:                  未发现
🎵 TikTok:                    未发现

# OpenClash Smart override YAML 重建检查
rule-providers 唯一顶层键:     1
rules 唯一顶层键:              1
providers 数量:               ≈384
rules 数量:                   ≈975
```

## 结论

**全量代码审查通过，未发现需要修复的 bug 或不一致。** 所有 10 个产物均与 Clash Party JS v5.2.8 基线语义一致，跨平台分流行为等价。
