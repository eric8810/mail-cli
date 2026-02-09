<div align="center">

# 📧 Open Mail CLI

**A Modern, Feature-Rich Command-Line Email Client**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org/)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

[English](#english) | [中文](#chinese)

</div>

---

## <a name="english"></a>🌟 Why Open Mail CLI?

In an era dominated by web-based email clients, **Open Mail CLI** brings the power of email management back to the terminal. Built for developers, system administrators, and power users who value:

- **🚀 Speed**: Lightning-fast email operations without browser overhead
- **🔒 Privacy**: Your emails stay on your machine, encrypted and secure
- **⚡ Efficiency**: Keyboard-driven workflow with powerful automation
- **🎯 Focus**: Distraction-free email management in your terminal
- **🔧 Extensibility**: Built with modern Node.js, easy to customize and extend

## ✨ Key Features

### 📬 Core Email Operations
- **Full IMAP/SMTP Support** - Works with Gmail, Outlook, QQ Mail, and any standard email service
- **Offline-First Architecture** - SQLite-based local storage for instant access
- **Smart Sync** - Incremental synchronization with conflict resolution
- **Rich Email Viewing** - HTML rendering, attachment handling, and inline images

### 🎨 Advanced Features (P1)
- **📊 Email Threading** - Automatic conversation grouping and visualization
- **👥 Contact Management** - Built-in address book with groups and auto-collection
- **✍️ Email Signatures** - Multiple signatures with smart insertion
- **🛡️ Spam Detection** - Bayesian filtering with customizable rules
- **🔍 Advanced Filters** - Rule-based email automation and organization
- **⚡ Quick Filters** - One-click filtering for common scenarios
- **💾 Saved Searches** - Bookmark complex search queries
- **🔄 Background Sync** - Daemon mode for automatic email synchronization

### 🚀 Power User Features (P2)
- **📝 Email Templates** - Variable substitution with `{{placeholders}}`
- **🔔 Smart Notifications** - Desktop alerts with intelligent filtering
- **📦 Import/Export** - Full support for EML and MBOX formats
- **🔐 Multi-Account** - Manage multiple email accounts seamlessly

## 🎯 Perfect For

- **Developers** who live in the terminal
- **System Administrators** managing email automation
- **Privacy-Conscious Users** who want local email storage
- **Power Users** seeking keyboard-driven workflows
- **DevOps Engineers** integrating email into scripts and pipelines

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

```bash
# Sync your inbox
mail-cli sync

# List emails
mail-cli list

# Read an email
mail-cli read 1

# Send an email
mail-cli send --to user@example.com --subject "Hello" --body "World"

# Search emails
mail-cli search "meeting"

# Start background sync daemon
mail-cli sync daemon start
```

## 📚 Documentation

- [📖 User Guide](docs/用户使用手册.md) - Comprehensive usage guide
- [🏗️ Architecture](docs/architecture.md) - Technical architecture overview
- [🔧 Configuration](docs/requirements.md) - Detailed configuration options
- [🎨 Features](docs/功能清单.md) - Complete feature list
- [🧪 Testing](docs/P2功能测试报告.md) - Test reports and quality assurance

## 🛠️ Technology Stack

- **Runtime**: Node.js 18+ (LTS)
- **Database**: SQLite3 with better-sqlite3
- **Email Protocols**: IMAP (node-imap), SMTP (nodemailer)
- **CLI Framework**: Commander.js, Inquirer.js
- **Email Parsing**: mailparser
- **UI/UX**: Chalk, Ora, CLI-Table3

## 📊 Project Stats

- **100+ Files** - Well-organized modular architecture
- **32,000+ Lines** - Production-ready codebase
- **16 CLI Commands** - Comprehensive email management
- **41 Test Cases** - 100% pass rate
- **11 Modules** - Clean separation of concerns

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

在网页邮件客户端主导的时代，**Open Mail CLI** 将邮件管理的强大功能带回终端。专为开发者、系统管理员和高级用户打造：

- **🚀 速度**: 无浏览器开销的闪电般快速邮件操作
- **🔒 隐私**: 邮件保存在本地，加密且安全
- **⚡ 效率**: 键盘驱动的工作流，强大的自动化能力
- **🎯 专注**: 终端中无干扰的邮件管理
- **🔧 可扩展**: 基于现代 Node.js 构建，易于定制和扩展

## ✨ 核心特性

### 📬 基础邮件功能
- **完整 IMAP/SMTP 支持** - 兼容 Gmail、Outlook、QQ邮箱等所有标准邮件服务
- **离线优先架构** - 基于 SQLite 的本地存储，即时访问
- **智能同步** - 增量同步，冲突解决
- **丰富的邮件查看** - HTML 渲染、附件处理、内联图片

### 🎨 高级功能 (P1)
- **📊 邮件会话** - 自动对话分组和可视化
- **👥 联系人管理** - 内置通讯录，支持分组和自动收集
- **✍️ 邮件签名** - 多签名支持，智能插入
- **🛡️ 垃圾邮件检测** - 贝叶斯过滤，可自定义规则
- **🔍 高级过滤器** - 基于规则的邮件自动化和组织
- **⚡ 快速过滤** - 常见场景的一键过滤
- **💾 保存的搜索** - 收藏复杂搜索查询
- **🔄 后台同步** - 守护进程模式，自动邮件同步

### 🚀 专业功能 (P2)
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

```bash
# 同步收件箱
mail-cli sync

# 列出邮件
mail-cli list

# 阅读邮件
mail-cli read 1

# 发送邮件
mail-cli send --to user@example.com --subject "你好" --body "世界"

# 搜索邮件
mail-cli search "会议"

# 启动后台同步守护进程
mail-cli sync daemon start
```

## 📊 项目统计

- **100+ 文件** - 组织良好的模块化架构
- **32,000+ 行代码** - 生产就绪的代码库
- **16 个 CLI 命令** - 全面的邮件管理
- **41 个测试用例** - 100% 通过率
- **11 个模块** - 清晰的关注点分离

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

<div align="center">

**Made with ❤️ by developers, for developers**

[⬆ Back to Top](#-open-mail-cli)

</div>
