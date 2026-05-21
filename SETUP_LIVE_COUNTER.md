# Live View Counter - 部署指南

## 🎯 功能概述

在你的 resume 页面右下角显示实时浏览统计：
- **Today**: 今日浏览人数
- **Total**: 历史总浏览人数
- **LIVE 指示器**: 显示连接状态

## 📦 已添加的文件

```
.
├── api/
│   └── stats.js                 # Vercel Serverless Function
├── resume/
│   └── index.html               # 已添加 HTML 标记和 JS 代码
├── vercel.json                  # Vercel 配置
├── package.json                 # 依赖配置
└── SETUP_LIVE_COUNTER.md       # 本文件
```

## 🚀 部署步骤

### 第一步：初始化 Vercel KV 数据库

1. 登录你的 Vercel 账户：https://vercel.com
2. 进入你的 resume 项目的 Dashboard
3. 点击 **Storage** 标签页
4. 点击 **Create** → **KV Database**
5. 命名为 `resume_stats`（或任意名称）
6. 选择地域（推荐 Hong Kong 或最近的地域）
7. 点击 **Create**

### 第二步：连接 KV 到项目

创建完 KV 后，Vercel 会自动将环境变量注入到你的项目：
- `KV_URL`
- `KV_REST_API_URL`
- `KV_REST_API_TOKEN`
- `KV_REST_API_READ_ONLY_TOKEN`

这些会自动被 `@vercel/kv` SDK 使用，**无需手动配置**。

### 第三步：推送代码

```bash
cd /Users/liuhongyang/document/my-profile
git add .
git commit -m "feat: add live view counter with real-time stats"
git push origin main  # 或你的主分支
```

### 第四步：验证部署

1. 等待 Vercel 自动部署完成（1-2 分钟）
2. 访问你的 resume 页面：https://www.agentdna.store/resume
3. 在右下角应该看到绿色的 "LIVE" 面板
4. 刷新页面，Today 数字应该增加 1

## 🎨 样式说明

面板展示：
- **极简设计**：玻璃态背景 + 清晰的数字
- **高级感**：深色主题 + 绿色 accent + 微妙的阴影
- **互联网产品感**：
  - "LIVE" badge + 脉冲点
  - 数字有"bump"动画（变化时抖动）
  - 当 API 连接正常时，边框闪烁为绿色

## 📱 响应式

- **桌面**：显示完整标签文本
- **手机** (≤600px)：隐藏标签，仅显示数字 + LIVE 指示器

## 🔄 数据刷新频率

- **前端轮询**：每 3 秒获取一次最新数据
- **动画延迟**：每次数字更新时，会有 350ms 的"bump"动画

## 🐛 常见问题

### API 返回 500 错误
- 检查 Vercel KV 是否已创建和连接
- 检查 Dashboard → Functions 标签，查看错误日志

### 页面显示 "0 0" 但不更新
- 打开浏览器控制台 (F12)
- 检查 Network 标签，看 `/api/stats` 请求是否成功
- 如果 CORS 错误，检查 API 的响应头

### 数据没有持久化
- 确认 KV 数据库已创建
- 检查 Vercel 环境变量是否正确注入

## 💾 数据存储说明

- **按天统计**：每天生成唯一 key（格式：`resume_daily_YYYY-MM-DD`）
- **总数统计**：单一 key（`resume_stats`）
- **过期策略**：每日数据保留 30 天，总数永久保存
- **无用户追踪**：只记录次数，不记录 IP/User-Agent

## 🔐 安全性

- POST 请求（记录浏览）无认证，这是有意的（静态网站）
- 不存储任何敏感信息
- API 设计上最小化，难以被滥用

## 📊 后续扩展

如果想要更多功能：

```javascript
// 示例：增加地理位置统计
// GET /api/stats/geo

// 示例：增加时间序列数据
// GET /api/stats/hourly

// 示例：增加 referrer 统计
// GET /api/stats/referrers
```

## ✅ 检查清单

- [ ] 创建了 Vercel KV 数据库
- [ ] 推送了代码到 GitHub
- [ ] Vercel 部署完成（绿色对勾）
- [ ] 访问 resume 页面看到绿色面板
- [ ] 刷新页面，数字增加

---

**需要帮助？** 检查 Vercel Dashboard 的 Functions 日志：
- 项目 → Functions → 选择 `api/stats.js`
- 查看 Logs 标签了解实时请求状态
