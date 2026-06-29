# Phase 1: Code Quality & Architecture Review

## Code Quality Findings

### Critical (3)

| ID | 文件 | 问题 | 描述 |
|----|------|------|------|
| C-1 | `Clash Party/ClashParty(mihomo-smart).js:1275-2279` | `injectRules()` 1000 行单体函数 | 该函数占文件 ~40%，混合数据（域名列表、rule-set 引用）与控制流，审查规则变更需滚动整个函数。Normal JS 和 FlClash JS 同构。**建议**：提取规则为声明式数据结构 + 迭代渲染。 |
| M-1 | 3 个 JS 文件（Smart/Normal/FlClash） | ~95% 代码重复无共享模块 | `REGION_DB`、`LOCAL_TOOL_DIRECT_PROCESS_NAMES`、`isInfoNode()`、`classifyAllNodes()`、`injectRuleProviders()`、`injectRules()`、`overwriteGeneral()` 等核心函数逐字复制。任何 bug（如 FIX#24-26）需在 3 处同步修复。**建议**：提取 `shared-core.js`，构建时内联打包。 |
| S-1 | 3 个 JS 文件 | SRP 违反 — 2500 行 god object | 每个文件混合 7 项职责：节点分类、家宽检测、代理组构建、rule-provider 管理、规则注入、通用配置覆写、订阅清理。受限于运行时环境（Sub-Store/FlClash 单文件沙箱），但构建时可用 bundler 合并模块。 |

### High (5)

| ID | 文件 | 问题 | 描述 |
|----|------|------|------|
| C-2 | `Clash Party/ClashParty(mihomo-smart).js:439-1274` | `injectRuleProviders()` ~840 行重复定义 | 200+ 个 `config['rule-providers'][id] = {...}` 赋值，结构几乎相同。Accademia 系列（行 980-1239）逐条手写而非循环。**建议**：数据表 + 单循环。 |
| D-1 | 3 个 JS 文件 + SingBox generator | 6 个代理构建函数跨 4 文件复制 | `buildStandardProxies`、`buildHomeFirstProxies`、`buildDirectFirstProxies` 等。SingBox generator 用 ES6+ 重写一遍。**建议**：提取共享模块。 |
| D-2 | 3 个 JS 文件 | `REGION_DB` 逐字节复制 3 次 | FIX#24-26 直接受害者——alpha-3 代码增补需 3 处同步。**建议**：同 M-1。 |
| M-3 | 4 个文件 | `SMART`/`BIZ` 常量独立定义 4 次 | 54 个代理组 emoji 名称（含 ZWJ `🧑‍💼`）在 4 处独立定义，缺字/错字只在运行时被验证器捕获。SingBox 53 组 vs 其他 54 组已文档化为预期差异。**建议**：共享常量 + 字节级验证。 |
| S-2 | 全部产物文件 | OCP 违反 — 新增业务组需改 8+ 位置 | 新增业务组需改：BIZ 常量 → injectBusinessGroups() → 代理顺序 → rules 数组 → OpenClash YAML → SR conf → Surge/Loon/QX → SingBox → Passwall list。**建议**：声明式配置 + 跨产物生成器。 |

### Medium (4)

| ID | 文件 | 问题 | 描述 |
|----|------|------|------|
| C-3 | `Clash Party/ClashParty(mihomo-smart).js:2534-2594` | `main()` 高圈复杂度 — 22 个条件分支 | 22 个 `if (c.XXX.length > 0)` 顺序检查，模式完全相同。**建议**：数据驱动循环。 |
| M-2 | Passwall/Passwall2 全部 32 个 `.list` 文件 | 仅第 5 行不同（"Passwall" vs "Passwall2"） | 32 对文件内容完全相同，仅一行名称差异。更新一方遗忘另一方即静默分裂。**建议**：模板 + 生成脚本或符号链接。 |
| D-3 | OpenClash Normal + Smart shell 脚本（各 ~4600 行） | ~90% heredoc YAML 重复 | DNS 块、sniffer 配置、大部分业务组定义完全相同，差异仅在区域组类型和 rule-providers 数量。**建议**：抽取共享 heredoc 或模板系统。 |
| A-2 | CMFA YAML → SR/Surge/Loon/QX 翻译链 | 缺乏自动化翻译管线 | CMFA→SR、SR→Surge、SR→Loon 各有手工翻译，无脚本保证。QX 更是完全独立手工维护。**建议**：构建翻译管线，至少覆盖 CMFA→SR→Surge→Loon。 |

---

## Architecture Findings

### Critical (2)

| ID | 问题 | 影响 | 建议 |
|----|------|------|------|
| A-1 | **无声明式基线 Schema**：54 组名、384+ rule-providers、975+ 规则行分散在各产物中，无单一权威数据源 | 添加/修改任何策略需 8+ 文件手工同步，极易遗漏。CLAUDE.md §1 强制"先改 Clash Party JS"但无法机械保证下游产品无漂移 | 创建 `schema/groups.json` + `schema/rules.json` + `schema/providers.json` 作为机器可读的权威数据源；所有产物从此 schema 生成或验证 |
| A-3 | **跨产物验证覆盖不完整**：`validate-artifact-contracts.js` 检查组计数和 JSON 合法性，但不验证：(1) 组名 emoji 字节级一致；(2) rule-provider URL 完全匹配；(3) 规则目标组名匹配；(4) DNS 语义等价 | 产物可漂移到语义不等价而验证器不报错 | 扩展验证器：增加组名字节比较、rule-provider URL 对比、规则目标组名正则校验 |

### High (3)

| ID | 问题 | 影响 | 建议 |
|----|------|------|------|
| A-4 | **SingBox 生成器是唯一自动化管线**，其余 10 个产物全部手工维护 | SingBox 有 generator.js 保证与基线对齐，但 CMFA/OpenClash/SR/Surge/Loon/QX/Passwall 无类似保障 | 为每个产物构建 generator（至少覆盖 CMFA/OpenClash/SR） |
| A-5 | **依赖方向有时逆转**：CLAUDE.md 规定"先改 Clash Party JS → 同步下游"，但实际工作流常先改 CMFA YAML（更易调试），再反向同步 JS | 基线权威性被削弱，可能引入不一致 | 严格执行 "JS-first" 工作流；或接受 CMFA-first 但升级其为并列基线 |
| A-6 | **OpenClash Smart 的 Ruby 运行时动态生成区域组**，其他产品静态定义 | OpenClash Smart 的区域组在 Ruby 代码中动态生成（`make_smart_group()`），与 JS 的 `classifyAllNodes()` 逻辑分离，两者需独立维护 | 将 Ruby `REGIONS` 哈希与 JS `REGION_DB` 统一到声明式 schema |

### Medium (2)

| ID | 问题 | 影响 | 建议 |
|----|------|------|------|
| A-7 | **验证工具不覆盖 Passwall list 内容**：只检查 `.sh` 脚本中的组名，不验证 `.list` 规则内容与其他产物等价 | Passwall list 可漂移 | 在 `validate-artifact-contracts.js` 中增加 Passwall list 内容验证 |
| A-8 | **子目录 CHANGELOG 格式不统一**：有的用 `★ FIX#NN-PN:` 前缀，有的无前缀；日期格式混用 | 降低 CHANGELOG 可读性和机器可解析性 | 统一 CHANGELOG 格式，考虑用 `keep-changelog` 标准 |

---

## Critical Issues for Phase 2 Context

以下发现需在 Phase 2 安全审查中重点关注：

1. **M-1/D-2（代码重复）** → 重复代码导致安全修复需多处同步，遗漏即产生安全漏洞。特别关注 `REGION_DB` 中 alpha-3 代码覆盖完整性。
2. **A-3（验证覆盖不完整）** → 验证器不检查 rule-provider URL 完全匹配，恶意或错误 URL 可绕过检测。
3. **A-1（无声明式基线 Schema）** → 缺乏单一权威数据源意味着产物漂移无法被系统性检测。
4. **JS 脚本中 `eval()`/动态代码执行风险** → 覆写脚本运行在 Sub-Store/FlClash VM 沙箱中，需确认沙箱隔离是否充分。
5. **Shell 脚本中变量注入风险** → OpenClash/Passwall shell 脚本使用环境变量构造 heredoc，需检查是否有注入向量。
