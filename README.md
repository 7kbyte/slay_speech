# 杀戮对话 (Slay the Speech)

> 像杀戮尖塔一样说话 —— 从卡牌库中选择最合适的"牌"来表达自己。

## 这是什么？

一个前端对话工具。给定一段对话上下文 + 你想表达的意思，AI 会从 588 张杀戮尖塔卡牌名称中选出最匹配的 Top 3，你选择一张作为回复"打出"。

**核心理念**：AI 只能从预设卡牌库中选择，不能自由发挥。每张卡牌名即是你表达的方式。

## 技术栈

- **框架**: React 19 + TypeScript
- **构建**: Vite 8
- **样式**: Tailwind CSS 4
- **路由**: React Router 7
- **AI**: DeepSeek V4 Flash (默认) / V4 Pro

## 快速开始

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build
```

启动后访问 `http://localhost:5173/`。

## 使用流程

1. **设置 API Key**：进入「设置」页面，填入 [DeepSeek API Key](https://platform.deepseek.com/)
2. **构建对话**：在「对话」页面手动添加消息或点击「载入示例」
3. **出牌**：在底部输入你想表达的意思，点击「出牌」
4. **选牌**：AI 返回 3 张最合适的卡牌，点击选择一张
5. **继续对话**：选中的卡牌名作为回复加入对话，可继续下一轮

## 页面功能

### 对话页
- 手动添加/编辑/删除任意消息
- 在任意位置插入新消息
- 双角色对话（我 / TA）
- AI 选牌 Top 3，附思考过程

### 牌库管理
- 搜索卡牌（588 张）
- 添加/编辑/删除卡牌
- JSON 导入/导出牌库
- 一键重置为默认牌库

### 设置
- API Key 配置（仅存储在浏览器 localStorage）
- 自定义 API 端点
- 切换模型（V4 Flash / V4 Pro）

## 项目结构

```
src/
├── components/
│   ├── ChatBubble.tsx        # 对话气泡（可编辑/删除）
│   ├── CardSelector.tsx      # AI 选牌展示 (Top 3)
│   ├── IntentInput.tsx       # 意图输入组件
│   └── Navbar.tsx            # 导航栏
├── pages/
│   ├── ChatPage.tsx          # 对话主页面
│   ├── CardsPage.tsx         # 牌库管理页面
│   └── SettingsPage.tsx      # API 设置页面
├── services/
│   ├── api.ts                # DeepSeek API 调用 + Prompt 构建
│   └── cards.ts              # 卡牌数据加载/存储
├── store/
│   └── useStore.ts           # 全局状态管理
└── types/
    └── index.ts              # TypeScript 类型定义
```

## 卡牌数据

卡牌数据来源于杀戮尖塔 II 中文 Wiki，共 588 张卡牌，数据文件位于 `public/data/cards.json`。

## License

MIT
