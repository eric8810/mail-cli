# 📧 Open Mail CLI

**A Powerful Email Client Built for AI Agents**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org/)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

[English](#english) | [中文](#chinese)

</div>

---

## <a name="english"></a>🌟 Why Open Mail CLI?

**Open Mail CLI** is a complete local email infrastructure specifically designed for AI agents and automation tools. It provides a reliable, programmatic interface for email operations that AI agents can use autonomously:

- **🤖 Agent-First Design** - Built from the ground up for AI agents and automation tools
- **📡 Multiple Interfaces** - CLI for simple tasks, HTTP API for programmatic integration
- **⚡ Reliable Operations** - Offline-first architecture with conflict resolution
- **🔒 Secure & Private** - Local storage with encrypted credentials, data never leaves your machine
- **🔧 Easy Integration** - Perfect for Claude Code, Cursor, and other AI coding agents
- **🎯 Complete Solution** - Access existing accounts + optional agent email addresses
- **📊 Context-Aware** - Markdown output optimized for LLMs, with smart pagination

## ✨ Key Features

### 🤖 Agent Integration (NEW)

These features are designed to make AI agents work with email reliably and efficiently:

- **Structured Output** - `--format` flag supports Markdown, JSON, and HTML; Markdown tables are optimized for LLM context windows, JSON enables programmatic parsing
- **Field Selection** - `--fields` flag lets agents request only the data they need (e.g. `--fields id,subject,from`), reducing token usage and keeping responses focused
- **Standardized Exit Codes** - Consistent exit codes (0=success, 1=error, 2=args, 3=network, 4=auth, 5=permission) allow agents to branch logic based on failure type without parsing error text
- **JSON Error Output** - When `--format json` is set, errors are returned as structured JSON with error code, message, and category — agents can handle failures programmatically
- **Event System & Webhooks** - `mail-cli webhook` registers HTTP endpoints or local scripts triggered on new email arrival, enabling agents to react to incoming mail in real-time
- **OpenAPI Documentation** - Swagger UI at `/api/docs` and OpenAPI spec at `/api/openapi.json` let agents discover and call HTTP APIs with full schema awareness
- **Smart Pagination** - `--limit`, `--offset`, `--page` with range annotations (Showing 1-20 of 150) help agents navigate large mailboxes without context overflow

### 📬 Core Email Operations
- **Full IMAP/SMTP Support** - Works with Gmail, Outlook, QQ Mail, and any standard email service
- **Offline-First Architecture** - SQLite-based local storage for instant access
- **Smart Sync** - Incremental synchronization with conflict resolution
- **Rich Email Viewing** - HTML rendering, attachment handling, and inline images

### 🎨 Advanced Features
- **📊 Email Threading** - Automatic conversation grouping and visualization
- **👥 Contact Management** - Built-in address book with groups and auto-collection
- **✍️ Email Signatures** - Multiple signatures with smart insertion
- **🛡️ Spam Detection** - Bayesian filtering with customizable rules
- **🔍 Advanced Filters** - Rule-based email automation and organization
- **⚡ Quick Filters** - One-click filtering for common scenarios
- **💾 Saved Searches** - Bookmark complex search queries
- **🔄 Background Sync** - Daemon mode for automatic email synchronization

### 🚀 Power User Features
- **📝 Email Templates** - Variable substitution with `{{placeholders}}`
- **🔔 Smart Notifications** - Desktop alerts with intelligent filtering
- **📦 Import/Export** - Full support for EML and MBOX formats
- **🔐 Multi-Account** - Manage multiple email accounts seamlessly

## 🎯 Perfect For

- **AI Agents** (Claude Code, Cursor, etc.) that need email capabilities
- **Automation Tools** that require programmatic email access
- **CI/CD Pipelines** for email notifications and reports
- **Monitoring Systems** that send alerts via email
- **Bots** that need to read/write emails as part of their workflow

## 🤖 Agent Skills

Open Mail CLI is available as an [Agent Skill](https://skills.sh) for AI coding agents (Claude Code, Cursor, etc.). Install the skill to give your agent the ability to send, receive, search, and manage emails.

```bash
npx skills add eric8810/open-mail-cli
```

Once installed, the agent can use `mail-cli` commands to handle email tasks autonomously — sending messages, checking inbox, managing contacts, and more.

## 🚀 Quick Start

### Installation

```bash
# Clone the repository
git clone https://github.com/eric8810/open-mail-cli.git
cd open-mail-cli

# Install dependencies
npm install

# Link globally (optional)
npm link
```

### First-Time Setup

```bash
# Interactive configuration wizard
mail-cli config

# Or configure manually
mail-cli config --set imap.host=imap.gmail.com
mail-cli config --set imap.port=993
mail-cli config --set smtp.host=smtp.gmail.com
mail-cli config --set smtp.port=465
```

### Basic Usage

#### CLI Mode (Simple Tasks)
```bash
# Sync your inbox
mail-cli sync

# List emails (with field selection and format control)
mail-cli list --format json --fields id,subject,from,date

# Read an email
mail-cli read 1

# Send an email
mail-cli send --to user@example.com --subject "Hello" --body "World"

# Search emails
mail-cli search "meeting"

# Register a webhook for new email events
mail-cli webhook add --url http://localhost:8080/on-new-mail --event new_email

# Start background sync daemon
mail-cli sync daemon start
```

#### HTTP API Mode (Programmatic Integration)
```bash
# Start local server
mail-cli serve --port 3000
```

```python
# Agent writes code to integrate
import requests

# Get unread emails
emails = requests.get('http://localhost:3000/api/emails?unread=true').json()

# Send email
requests.post('http://localhost:3000/api/emails/send', json={
    'to': 'user@example.com',
    'subject': 'Hello',
    'body': 'World'
})
```

## 📚 Documentation

- [📖 User Guide](docs/用户使用手册.md) - Comprehensive usage guide
- [🎯 Agent Positioning](docs/AGENT_POSITIONING.md) - Why Open Mail CLI for agents
- [🔌 HTTP API Design](docs/HTTP_API_DESIGN.md) - Programmatic integration guide
- [📝 Output Format](docs/OUTPUT_FORMAT_DESIGN.md) - Markdown output for LLMs
- [📏 Content Management](docs/CONTENT_LENGTH_MANAGEMENT.md) - Pagination and truncation
- [🏗️ Architecture](docs/architecture.md) - Technical architecture overview
- [🔧 Configuration](docs/requirements.md) - Detailed configuration options
- [🎨 Features](docs/功能清单.md) - Complete feature list
- [🧪 Testing](docs/P2功能测试报告.md) - Test reports and quality assurance

## 🛠️ Technology Stack

- **Runtime**: Node.js 18+ (LTS)
- **Database**: SQLite3 with better-sqlite3
- **Email Protocols**: IMAP (node-imap), SMTP (nodemailer)
- **HTTP API**: Hono (lightweight web framework), Zod (request validation), OpenAPI / Swagger UI
- **CLI Framework**: Commander.js, Inquirer.js
- **Email Parsing**: mailparser
- **UI/UX**: Chalk, Ora, CLI-Table3

## 📊 Project Stats

- **140+ Files** - Well-organized modular architecture
- **26,000+ Lines** - Production-ready codebase
- **26 CLI Commands** - Comprehensive email management
- **167 Test Cases** - Covering formatters, pagination, field selection, HTTP API, and more
- **19 Modules** - Clean separation of concerns

## 🎨 Feature Highlights

### Email Templates with Variables
```bash
# Create a template
mail-cli template create --name "Meeting" \
  --subject "Meeting on {{date}}" \
  --text "Hi {{name}}, let's meet at {{time}}"

# Use the template
mail-cli template use 1 --var name=John --var time="2pm"
```

### Smart Notifications
```bash
# Enable notifications
mail-cli notify enable

# Configure filters
mail-cli notify config --sender boss@company.com --important-only

# Test notifications
mail-cli notify test
```

### Import/Export
```bash
# Export folder to MBOX
mail-cli export folder INBOX backup.mbox

# Import emails from EML
mail-cli import eml message.eml --folder INBOX
```

## 🤝 Contributing

We welcome contributions! Whether it's:

- 🐛 Bug reports
- 💡 Feature requests
- 📝 Documentation improvements
- 🔧 Code contributions

Please read our [Contributing Guide](CONTRIBUTING.md) to get started.

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

Built with ❤️ using these amazing open-source projects:
- [node-imap](https://github.com/mscdex/node-imap) - IMAP client
- [nodemailer](https://nodemailer.com/) - SMTP client
- [better-sqlite3](https://github.com/WiseLibs/better-sqlite3) - SQLite wrapper
- [Commander.js](https://github.com/tj/commander.js) - CLI framework
- [mailparser](https://github.com/nodemailer/mailparser) - Email parser

## 🌟 Star History

If you find this project useful, please consider giving it a ⭐!

---

## <a name="chinese"></a>🌟 为什么选择 Open Mail CLI？

**Open Mail CLI** 是一个专为 AI 代理和自动化工具设计的完整本地邮件基础设施。它为 AI 代理提供了可靠、可编程的邮件操作接口：

- **🤖 AI 优先设计** - 专为 AI 代理和自动化工具从零打造
- **📡 多种接口** - CLI 用于简单任务，HTTP API 用于编程集成
- **⚡ 可靠操作** - 离线优先架构，内置冲突解决
- **🔒 安全私密** - 本地存储，凭据加密，数据不离开本地
- **🔧 易于集成** - 完美适配 Claude Code、Cursor 等编程代理
- **🎯 完整解决方案** - 访问现有账户 + 可选的 Agent 专属邮箱
- **📊 上下文感知** - Markdown 输出优化 LLM 解析，智能分页

## ✨ 核心特性

### 🤖 Agent 集成能力（NEW）

这些特性专为 AI Agent 可靠、高效地处理邮件而设计：

- **结构化输出** - `--format` 支持 Markdown、JSON、HTML 三种格式；Markdown 表格针对 LLM 上下文窗口优化，JSON 便于程序化解析
- **字段选择** - `--fields` 让 Agent 只获取所需数据（如 `--fields id,subject,from`），减少 token 消耗，保持响应精简
- **标准化退出码** - 统一退出码（0=成功, 1=错误, 2=参数错误, 3=网络错误, 4=认证错误, 5=权限错误），Agent 无需解析错误文本即可判断失败类型并分支处理
- **JSON 错误输出** - `--format json` 时错误以结构化 JSON 返回（含错误码、消息、分类），Agent 可程序化处理异常
- **事件系统与 Webhook** - `mail-cli webhook` 注册 HTTP 端点或本地脚本，新邮件到达时自动触发，Agent 可实时响应收件
- **OpenAPI 文档** - Swagger UI（`/api/docs`）和 OpenAPI 规范（`/api/openapi.json`）让 Agent 自动发现和调用 HTTP API
- **智能分页** - `--limit`、`--offset`、`--page` 配合范围标注（Showing 1-20 of 150），帮助 Agent 在大邮箱中导航而不溢出上下文

### 📬 基础邮件功能
- **完整 IMAP/SMTP 支持** - 兼容 Gmail、Outlook、QQ邮箱等所有标准邮件服务
- **离线优先架构** - 基于 SQLite 的本地存储，即时访问
- **智能同步** - 增量同步，冲突解决
- **丰富的邮件查看** - HTML 渲染、附件处理、内联图片

### 🎨 高级功能
- **📊 邮件会话** - 自动对话分组和可视化
- **👥 联系人管理** - 内置通讯录，支持分组和自动收集
- **✍️ 邮件签名** - 多签名支持，智能插入
- **🛡️ 垃圾邮件检测** - 贝叶斯过滤，可自定义规则
- **🔍 高级过滤器** - 基于规则的邮件自动化和组织
- **⚡ 快速过滤** - 常见场景的一键过滤
- **💾 保存的搜索** - 收藏复杂搜索查询
- **🔄 后台同步** - 守护进程模式，自动邮件同步

### 🚀 专业功能
- **📝 邮件模板** - 支持 `{{占位符}}` 变量替换
- **🔔 智能通知** - 桌面提醒，智能过滤
- **📦 导入/导出** - 完整支持 EML 和 MBOX 格式
- **🔐 多账户** - 无缝管理多个邮箱账户

## 🤖 Agent Skills

Open Mail CLI 已作为 [Agent Skill](https://skills.sh) 发布，支持 AI 编程代理（Claude Code、Cursor 等）。安装此 skill 可赋予你的 agent 收发、搜索和管理邮件的能力。

```bash
npx skills add eric8810/open-mail-cli
```

安装后，agent 可以自主使用 `mail-cli` 命令处理邮件任务——发送消息、查看收件箱、管理联系人等。

## 🚀 快速开始

### 安装

```bash
# 克隆仓库
git clone https://github.com/eric8810/open-mail-cli.git
cd open-mail-cli

# 安装依赖
npm install

# 全局链接（可选）
npm link
```

### 首次配置

```bash
# 交互式配置向导
mail-cli config

# 或手动配置
mail-cli config --set imap.host=imap.gmail.com
mail-cli config --set imap.port=993
```

### 基本使用

#### CLI 模式（简单任务）
```bash
# 同步收件箱
mail-cli sync

# 列出邮件（支持字段选择和格式控制）
mail-cli list --format json --fields id,subject,from,date

# 阅读邮件
mail-cli read 1

# 发送邮件
mail-cli send --to user@example.com --subject "你好" --body "世界"

# 搜索邮件
mail-cli search "会议"

# 注册新邮件事件的 Webhook
mail-cli webhook add --url http://localhost:8080/on-new-mail --event new_email

# 启动后台同步守护进程
mail-cli sync daemon start
```

#### HTTP API 模式（编程集成）
```bash
# 启动本地服务器
mail-cli serve --port 3000
```

```python
# Agent 编写代码集成
import requests

# 获取未读邮件
emails = requests.get('http://localhost:3000/api/emails?unread=true').json()

# 发送邮件
requests.post('http://localhost:3000/api/emails/send', json={
    'to': 'user@example.com',
    'subject': '你好',
    'body': '世界'
})
```

## 📊 项目统计

- **140+ 文件** - 组织良好的模块化架构
- **26,000+ 行代码** - 生产就绪的代码库
- **26 个 CLI 命令** - 全面的邮件管理
- **167 个测试用例** - 覆盖格式化器、分页、字段选择、HTTP API 等
- **19 个模块** - 清晰的关注点分离

## 🤝 贡献

我们欢迎各种形式的贡献：

- 🐛 Bug 报告
- 💡 功能建议
- 📝 文档改进
- 🔧 代码贡献

请阅读我们的[贡献指南](CONTRIBUTING.md)开始参与。

## 📜 许可证

本项目采用 MIT 许可证 - 详见 [LICENSE](LICENSE) 文件。

---

**Built for AI agents, by developers**

[⬆ Back to Top](#-open-mail-cli)
