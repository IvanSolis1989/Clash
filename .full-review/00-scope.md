# Review Scope

## Target

Smart-Config-Kit 全量代码审查 — 对仓库所有产物文件进行全面审查，重点关注：
1. **跨产物一致性**：12 个客户端配置是否与 Clash Party JS 基线语义等价
2. **语法正确性**：各平台专有语法陷阱是否被正确处理
3. **规则对齐**：rule-provider、规则顺序、代理组命名是否跨版本同步
4. **版本号/CHANGELOG 一致性**：所有产物版本号是否对齐
5. **代码质量与安全**：JS 覆写脚本、Shell 脚本、JSON 生成器的质量和安全性

## Files

### 核心产物（12 个客户端形态）

| # | 文件 | 类型 |
|---|------|------|
| 0 | `Clash Party/ClashParty(mihomo-smart).js` | JS 覆写脚本（基线/权威源） |
| 0b | `Clash Party/ClashParty(mihomo).js` | JS 覆写脚本（Normal 版） |
| 1 | `Clash Meta For Android/CMFA(mihomo).yaml` | 原生 YAML |
| 2 | `OpenClash/OpenClash(mihomo).sh` | Shell + heredoc YAML（Normal） |
| 3 | `OpenClash/OpenClash(mihomo-smart).sh` | Shell + heredoc YAML（Smart/Full） |
| 4 | `Shadowrocket/Shadowrocket.conf` | iOS SR 私有 conf |
| 5 | `SingBox/SingBox(sing-box)-full.json` + `SingBox/SingBox(sing-box)-generator.js` | JSON（脚本生成） |
| 6 | `v2rayN/v2rayN(xray).json` | Xray 路由 JSON |
| 7 | `Surge/Surge.conf` | Surge conf |
| 8 | `Loon/Loon.conf` | Loon conf |
| 9 | `Quantumult X/QuantumultX.conf` | QX conf |
| 10 | `Passwall/Passwall(xray+sing-box)-apply.sh` + `Passwall/shunt-rules/*.list` (31 files) | OpenWrt 全功能 |
| 10B | `Passwall2/Passwall2(xray+sing-box)-apply.sh` + `Passwall2/shunt-rules/*.list` (31 files) | OpenWrt 精简 |
| 11 | `FlClash/FlClash(mihomo).js` | JS 覆写脚本（FlClash 移植版） |

### 辅助文件

| 类别 | 文件 |
|------|------|
| 验证工具 | `tools/validate-artifact-contracts.js`, `tools/validate-js-overwrites.js`, `tools/validate-process-name-direct.js`, `tools/test-*.js` |
| 文档 | 根 `README.md`, 根 `CHANGELOG.md`, 各子目录 `README.md`/`CHANGELOG.md`/`REFERENCE-*.md` |
| 镜像 | `mirrors/*.list`, `mirrors/*.yaml` |
| CI | `.github/workflows/*.yml` |

## Flags

- Security Focus: no
- Performance Critical: no
- Strict Mode: no
- Framework: mihomo-multi-client（12 客户端多产物同步架构）

## Review Phases

1. Code Quality & Architecture
2. Security & Performance
3. Testing & Documentation
4. Best Practices & Standards
5. Consolidated Report
