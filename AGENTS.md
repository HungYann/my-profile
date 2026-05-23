# Portfolio Harness Dev Protocol
# ─────────────────────────────────────────────────────────────────────
# 适用项目：个人作品集 / 品牌网站（my-profile / agentdna.store）
# 技术栈：单文件 HTML + 纯 CSS 自定义属性 + 原生 ES2022 JS（无构建工具）
# 同步规则：CLAUDE.md ↔ AGENTS.md 内容保持一致
#   Claude Code 读取 CLAUDE.md；Codex / Kimi / 其他 Agent 读取 AGENTS.md
#   修改任意一个后运行：cp CLAUDE.md AGENTS.md
# ─────────────────────────────────────────────────────────────────────

## 三层 Skill 架构（Product → Design → Engineering）

```
/portfolio-pm ──PRD──► /portfolio-designer ──Visual Scheme──► /html-engineer
      ▲                                                              │
      └──────────────── 用户反馈 / 修改迭代 ◄──────────────────────┘
```

### Skill 职责

| Skill                  | 别名        | 输入                     | 输出                      | 禁止事项                     |
|------------------------|-------------|--------------------------|---------------------------|------------------------------|
| `/portfolio-pm`        | Planner     | 用户描述 / 已有简历       | `docs/{p}/PRD_{p}.md`     | 不得讨论颜色 / 动效 / 代码    |
| `/portfolio-designer`  | Designer    | PRD.md                   | `docs/{p}/{p}-visual-scheme-{date}.md` | 不得输出 HTML/CSS/JS |
| `/html-engineer`       | Generator   | PRD.md + VisualScheme.md | `{page}/index.html`       | 不得自行发明设计               |

> **关键规则**：三个 Skill 严格单向流动。Generator 无法覆写 Planner 的产品决定；Designer 无法覆写 Generator 的实现细节。如发现上游文档有误，必须返回对应 Skill 修改，不得就地 hack。

---

## Sprint Contract（每轮必须包含）

```yaml
## Sprint #{n}
goal:       # 本轮要实现的单一可交付物（一个 Section / 一个特效 / 一个 fix）
skill:      # 使用的 Skill（/portfolio-pm | /portfolio-designer | /html-engineer）
impl:       # 具体实现方案（技术路径 / 文案来源 / 设计决策）
criteria:   # 可验证的完成标准（见 Evaluator 规则）
layer:      # 涉及的文档层（prd | visual | html-structure | css-tokens | js-effects | deploy）
blocked_by: # 依赖的前序 sprint 编号（无则 none）
```

### Sprint Contract 示例

```yaml
## Sprint #3
goal:       完成 Hero Section 的 HTML 骨架 + CSS Token 绑定
skill:      /html-engineer
impl:       基于 PRD S1 Hero 规范 + Visual Scheme --color-accent/#4ade80 实现
            包含：状态 Badge / 渐变姓名 / 4 个指标卡 / 终端窗口占位
criteria:
  - [ ] Hero section 有 id="hero" 语义标签
  - [ ] 所有颜色通过 CSS 变量（不允许硬编码 hex）
  - [ ] i18n：姓名/职位/Badge 有 data-cn / data-en 属性
  - [ ] 响应式：480px 以下单列不溢出
layer:      html-structure + css-tokens
blocked_by: Sprint #2（Visual Scheme 文档）
```

---

## Evaluator 验收规则

不同文档层使用不同的验收工具：

| 层级                  | 验收方式                                                      |
|-----------------------|---------------------------------------------------------------|
| **prd**（产品文档）    | 人工审阅：北极星目标 / Section 列表 / 内容清单是否完整         |
| **visual**（视觉规范） | 人工审阅：是否所有 Token 都有具体值（无模糊描述）              |
| **html-structure**    | `grep -c '<section' index.html` 核对 Section 数量             |
| **css-tokens**        | `grep ':root' index.html` 检查 CSS 变量是否对齐 Visual Scheme  |
| **js-effects**        | 浏览器控制台：无 Error；特效正常触发；Tab 切换停帧             |
| **deploy**            | `curl -s -o /dev/null -w "%{http_code}" {URL}` = 200          |

**Evaluator 通过标准：**
- PRD / Visual 层：用户显式确认（"OK" / "确认"）
- HTML / CSS / JS 层：清单全部打勾 + 浏览器无报错
- Deploy 层：HTTP 200 + 页面内容正确渲染

**Evaluator 未通过 → 禁止进入下一 Sprint。**

---

## 文档依赖层级（不可逆向）

```
prd  →  visual-scheme  →  html-structure  →  css-tokens  →  js-effects  →  deploy
```

- 上层（右）可引用下层（左）的内容，**下层禁止引用上层**
- 例：html-engineer 可读 visual-scheme，但 visual-scheme 不得包含具体 HTML 标签
- 跨层修改需求：必须从最上游的文档层开始修改，向下游传播

### 层级说明

| 层           | 文件                                    | 负责 Skill           |
|--------------|-----------------------------------------|----------------------|
| prd          | `docs/{p}/PRD_{p}.md`                   | `/portfolio-pm`      |
| visual       | `docs/{p}/{p}-visual-scheme-{date}.md`  | `/portfolio-designer`|
| html-structure | `{page}/index.html` — `<body>` 骨架   | `/html-engineer`     |
| css-tokens   | `<style>` `:root {}` 块                 | `/html-engineer`     |
| js-effects   | `<script type="module">` 块             | `/html-engineer`     |
| deploy       | Vercel / GitHub Pages                   | `/vercel-deploy`     |

---

## 仓库目录结构

```
my-profile/
│
├── CLAUDE.md                    # Dev protocol（Claude Code 读取）
├── AGENTS.md                    # Dev protocol（其他 Agent 读取，同步自 CLAUDE.md）
├── README.md                    # 项目简介 & 快速上手
│
├── docs/                        # 所有产品 & 设计文档
│   ├── my-portfolio/
│   │   ├── PRD_my-portfolio-{date}.md          # portfolio-pm 输出
│   │   └── my-portfolio-visual-scheme-{date}.md # portfolio-designer 输出
│   └── resume/
│       └── PRD_resume-{date}.md
│
├── resume/
│   └── index.html               # 简历页（html-engineer 输出）
│
├── index.html                   # 首页（html-engineer 输出）
│
├── .claude/
│   └── commands/                # 项目级 /命令（覆盖全局）
│       └── *.md
│
└── tests/
    └── smoke/
        └── check.sh             # 快速冒烟测试（HTTP 状态 + 关键词检查）
```

---

## 开发循环守则

1. **每次对话只执行一个 Sprint**；Evaluator 未通过 → 禁止进入下一 Sprint
2. **文档优先**：在写任何代码前，必须先有 PRD + Visual Scheme
3. **层级违规处理**：Generator 发现 Visual Scheme 有误 → 停止写代码，先修文档
4. **修改范围最小化**：只改当前 Sprint 涉及的 Section / 特效，不"顺便"改其他部分
5. **每次部署前**：运行 `tests/smoke/check.sh`，确认 HTTP 200 + 关键 Section 存在

---

## 技术栈硬约束（HTML 单文件网站）

> **硬性规则**：本仓库的每个页面都是**单个 HTML 文件**，不使用任何构建工具（webpack/vite/rollup），不引入 React/Vue/Angular 等框架。

1. **文件结构**：每个页面 = 一个 `index.html`，CSS 内嵌在 `<style>` 标签内，JS 内嵌在 `<script type="module">` 标签内。外部只允许引用 Google Fonts 和 CDN 图表库（Chart.js 等）。

2. **CSS 规范**：
   - 所有颜色 / 字体 / 间距通过 `:root {}` 中的 CSS 自定义属性定义，**禁止硬编码 hex 值**
   - 动画只操作 `transform` 和 `opacity`，不触发 layout reflow
   - 必须包含 `@media (prefers-reduced-motion: reduce)` 关闭所有动画
   - 必须包含 `@media print` 深色背景转白底黑字

3. **JS 规范**：
   - 使用 `<script type="module">` ES2022 模块语法
   - 按功能模块声明对象：`const I18N = {}` / `const MatrixRain = {}` / `const Reveal = {}` 等
   - 禁止全局变量污染（所有变量必须在模块作用域内）
   - Canvas 动效必须监听 `visibilitychange` 暂停（节能）

4. **i18n 规范**（如需中英双语）：
   - 所有文字节点通过 `data-cn` / `data-en` 属性存储，JS 统一切换
   - 语言偏好存入 `localStorage('lang')`
   - `<html lang="">` 属性随切换更新

5. **SEO 必须项**（每个页面）：
   ```html
   <title>{姓名} — {职位} | {品牌}</title>
   <meta name="description" content="...（150-160字符）">
   <link rel="canonical" href="https://...">
   <!-- OG meta -->
   <!-- JSON-LD Person schema -->
   ```

6. **Sprint 校验**：Planner 制定 contract 时、Generator 输出代码前，必须自检是否满足上述约束；Evaluator 验收时额外检查是否有框架引入或内联硬编码颜色。

---

## Skill 链接与触发

```bash
# 全局 Skill 位置
~/.claude/commands/portfolio-pm.md        → /portfolio-pm
~/.claude/commands/portfolio-designer.md  → /portfolio-designer
~/.claude/commands/html-engineer.md       → /html-engineer
~/.claude/commands/vercel-deploy.md       ← /vercel-deploy（已有）

# 触发方式（Claude Code CLI）
claude                          # 启动 CLI
> /portfolio-pm                 # 产品规划
> /portfolio-designer           # 视觉设计
> /html-engineer                # 代码生成
> /vercel-deploy                # 部署
```

---

## 其他

- 当用户做出不合理的选择时，果断提醒并主动给出更好方案
- 代码审查发现违反技术约束的改动，必须拒绝并说明原因
- 所有指标数字（GMV / 性能提升 / 用户量）必须来自真实数据，禁止夸大
