# Open Mail CLI - Agent 定位文档

## 核心定位

**Open Mail CLI 是完整的本地邮件基础设施，让 AI Agent 能够访问现有邮箱账户，并可选地创建 Agent 专属邮箱。**

### 我们是什么
- 本地运行的邮件客户端，支持 IMAP/SMTP 协议
- 为 AI Agent 提供程序化接口（CLI/HTTP API）访问邮箱
- 基于 SQLite 的本地数据存储，支持复杂查询和历史数据处理
- 支持多账户、多服务商（Gmail、Outlook、QQ Mail 等）
- 支持集成第三方邮箱服务，为 Agent 创建专属邮箱（详见独立项目）

### 我们不是什么
- ❌ 不是云端托管服务（数据存储在本地）
- ❌ 不是人类邮件客户端（UI 优化为程序化访问）
- ❌ 不是纯 CLI 工具（也提供 HTTP API）

## 与 AgentMail 的区别

| 维度 | Open Mail CLI | AgentMail |
|------|---------------|-----------|
| **核心场景** | 访问现有账户 + Agent 专属邮箱 | Agent 专属邮箱 |
| **数据位置** | 本地 SQLite | 云端托管 |
| **历史数据** | 完整历史（可追溯多年） | 从创建时开始 |
| **集成方式** | 本地 Server + API | 云端 HTTP API |
| **成本模型** | 免费（自托管） | 按量付费 |
| **隐私模型** | 数据不离开本地 | 数据在第三方服务器 |
| **部署方式** | 本地/自托管 | 完全托管 |
| **适用对象** | 需要本地处理的 Agent | 需要云端托管的 Agent |

**关键区别**：
- **AgentMail**: 纯云端托管，按量付费，适合不想管理基础设施的场景
- **Open Mail CLI**: 本地部署，自托管，适合需要隐私、历史数据、本地处理的场景

**互补关系**: 两者服务不同需求，可以共存。某些场景下甚至可以同时使用。

## 目标使用场景

### ✅ 核心场景

**场景 A: 访问现有邮箱账户**

1. **个人助理 Agent**
   - 管理用户的 Gmail/Outlook 账户
   - 自动回复会议邀请、整理日程
   - 搜索历史邮件、提取信息

2. **客服 Agent**
   - 访问公司的 `support@company.com`
   - 自动分类工单、起草回复
   - 分析客户邮件历史

3. **销售自动化 Agent**
   - 监控团队的 `sales@company.com`
   - 自动发送跟进邮件
   - 追踪客户沟通历史

4. **数据处理 Agent**
   - 处理发票、订单确认等邮件
   - 从历史邮件中提取结构化数据
   - 批量处理大量邮件

5. **研究 Agent**
   - 搜索多年的学术通信记录
   - 分析邮件往来模式
   - 提取关键信息和联系人

**场景 B: Agent 专属邮箱（通过集成第三方邮箱服务）**

6. **接收验证码和 OTP**
   - Agent 注册服务时接收验证邮件
   - 自动提取验证码
   - 完成自动化注册流程

7. **Agent 间通信**
   - 多个 Agent 通过邮件协作
   - 异步任务通知
   - 工作流触发

8. **接收系统通知**
   - 监控告警邮件
   - CI/CD 通知
   - 服务状态更新

**关键优势**: 支持集成第三方邮箱服务（详见独立项目），Open Mail CLI 可以同时支持"访问现有账户"和"创建 Agent 专属邮箱"两种场景。

### ✅ 适用部署环境

- **本地开发环境** - 开发者机器上运行
- **服务器部署** - 云服务器或本地服务器
- **容器化部署** - Docker 容器
- **CI/CD 环境** - 自动化流程中
- **边缘设备** - 支持 Node.js 的任何设备

## 核心价值主张

### 1. 访问现有账户
**问题**：Agent 需要管理人类或组织的现有邮箱，无法更改邮箱地址。
**方案**：支持任何 IMAP/SMTP 服务商，连接现有账户。

### 2. 本地数据处理
**问题**：历史邮件数据量大（数年、数万封），云端 API 查询成本高、速度慢。
**方案**：本地 SQLite 存储，支持复杂 SQL 查询，无 API 限制。

### 3. 深度本地集成
**问题**：Agent 需要与本地文件系统、数据库、其他服务深度集成。
**方案**：Plugin 系统、本地 SDK、直接访问文件系统。

### 4. 隐私和安全
**问题**：敏感邮件不能发送到第三方服务器。
**方案**：数据完全本地存储，加密凭据，不依赖外部服务。

### 5. 成本效益
**问题**：大量邮件处理的 API 调用成本高。
**方案**：自托管，无 API 调用费用，一次部署长期使用。

### 6. 完整解决方案
**问题**：Agent 既需要访问现有账户，又需要自己的邮箱地址。
**方案**：支持集成第三方邮箱服务（详见独立项目），同时支持两种场景。

## 技术架构优势

### 本地优先 + 服务集成架构
```
┌─────────────────────────────────────┐
│         AI Agent                    │
│  (Claude Code, Cursor, Custom)      │
└──────────────┬──────────────────────┘
               │
               ├─ CLI Interface
               ├─ HTTP API (Local Server)
               └─ 编程集成（Agent 自己写代码）
               │
┌──────────────▼──────────────────────┐
│      Open Mail CLI                  │
│  ┌──────────────────────────────┐   │
│  │   Local SQLite Database      │   │
│  │   (历史数据、索引、缓存)      │   │
│  └──────────────────────────────┘   │
│                                     │
│  ┌──────────────────────────────┐   │
│  │   Sync Daemon                │   │
│  │   (持续监控、事件触发)        │   │
│  └──────────────────────────────┘   │
│                                     │
│  ┌──────────────────────────────┐   │
│  │   Local HTTP Server          │   │
│  │   (RESTful API)              │   │
│  └──────────────────────────────┘   │
└──────────────┬──────────────────────┘
               │
               ├─ IMAP (接收)
               ├─ SMTP (发送)
               └─ 第三方邮箱服务（可选）
               │
┌──────────────▼──────────────────────┐
│   邮箱服务                           │
│   - 现有账户: Gmail, Outlook, etc.  │
│   - Agent 专属: 第三方邮箱服务       │
└─────────────────────────────────────┘
```

### 关键能力

1. **多账户管理**
   - 同时连接多个邮箱账户
   - 统一查询和操作接口
   - 账户级别的配置和权限

2. **增量同步**
   - 只同步新邮件，避免重复下载
   - 冲突解决机制
   - 断点续传

3. **持续监控**
   - Daemon 模式后台运行
   - 新邮件实时触发事件
   - Webhook/脚本集成

4. **本地查询**
   - 复杂 SQL 查询
   - 全文搜索
   - 无 API 速率限制

5. **批量操作**
   - 批量发送、标记、移动
   - 事务性操作
   - 错误恢复

## 功能优先级框架

基于"本地邮件基础设施"定位，功能优先级如下：

### P0 - 核心能力（必须有）
- 多账户支持（已实现）
- 本地 SQLite 存储（已实现）
- CLI 接口（已实现）
- 同步 Daemon（已实现）
- 搜索/过滤（已实现）
- 收发邮件（已实现）
- Markdown 格式输出（Agent 友好）
- 内容长度管理（分页、截断）
- Webhook/事件系统
- 标准化退出码
- 可选的简洁模式（--ids-only, --fields）

### P1 - 差异化能力（应该有）
- HTTP API 模式（本地 Server）
- 第三方邮箱服务集成（Agent 专属邮箱）
- Plugin 系统
- 数据提取/解析 API
- 模板系统（已实现）
- 批量操作 API
- 幂等性保证
- 错误重试机制

### P2 - 增强能力（可以有）
- 线程分析（已实现）
- 附件处理（已实现）

### P3 - 重新评估（低优先级）
- 垃圾邮件检测（人类已处理）
- 签名管理（低频需求）
- 桌面通知（Agent 不需要）
- 联系人管理（特定场景）
- 导入/导出（低频需求）

## Agent 集成最佳实践

### 输出格式设计原则

**核心策略**：
- **结构化数据** → JSON 格式（`--format json`）
  - 适用于：邮件列表、元数据、查询结果等有明确字段属性的内容
- **文本性内容** → Markdown/HTML 格式
  - 适用于：邮件正文、富文本内容等
- **简单结构** → Markdown 表格
  - 适用于：列表展示、人机双可读的场景

**内容长度管理**：
- 默认输出合理限制（避免超出 LLM 上下文窗口）
- 支持分页参数（`--limit`, `--offset`）
- 支持截断控制（`--full` 显示完整内容）
- 明确标注总数和当前范围

**输出模式**：
```bash
# 默认：Markdown 表格（Agent 友好）
mail-cli list

# 简洁：仅关键信息（管道友好）
mail-cli list --ids-only

# 结构化：JSON（程序化处理）
mail-cli list --format json
```

### 1. 初始化配置
```bash
# 配置账户
mail-cli account add --email user@gmail.com \
  --imap-host imap.gmail.com --imap-port 993 \
  --smtp-host smtp.gmail.com --smtp-port 465

# 首次同步
mail-cli sync --full
```

### 2. 持续监控
```bash
# 启动 Daemon，新邮件触发脚本
mail-cli sync daemon start \
  --interval 5m \
  --on-new-email "./process-email.sh" \
  --webhook http://localhost:3000/webhook
```

### 3. 程序化访问
```bash
# Markdown 表格输出（Agent 友好）
mail-cli list --unread

| ID | From | Subject | Date | Status |
|----|------|---------|------|--------|
| 1 | boss@company.com | Urgent Report | 2024-02-09 | ⭐ Unread |
| 2 | client@example.com | Project Update | 2024-02-08 | Unread |

# 简洁模式（管道友好）
mail-cli list --ids-only
1 2 3

# 可选 JSON（传统工具集成）
mail-cli list --format json | jq '.[] | select(.unread)'
```

### 4. 本地集成（编程方式）
```bash
# 启动本地 HTTP Server
mail-cli serve --port 3000

# Agent 自己写代码调用 API
```

```python
# Agent 编写的 Python 代码
import requests

# 获取邮件列表
response = requests.get('http://localhost:3000/api/emails?unread=true')
emails = response.json()

# 读取邮件
email = requests.get(f'http://localhost:3000/api/emails/{email_id}')

# 发送邮件
requests.post('http://localhost:3000/api/emails/send', json={
    'to': 'user@example.com',
    'subject': 'Hello',
    'body': 'World'
})

# 搜索邮件
results = requests.get('http://localhost:3000/api/emails/search?q=urgent')
```

```javascript
// Agent 编写的 JavaScript 代码
const response = await fetch('http://localhost:3000/api/emails?unread=true');
const emails = await response.json();
```

**优势**：
- Agent 可以用任何语言编写集成代码
- 无需维护多语言 SDK
- 更灵活和通用
- Agent 完全控制集成逻辑

## 与其他工具的关系

### 互补工具
- **AgentMail**: 纯云端托管，适合不想管理本地基础设施的场景
- **Zapier/n8n**: 复杂工作流编排
- **Local LLM**: 本地邮件内容分析
- **SQLite**: 直接查询邮件数据库

### 集成场景
```bash
# 场景 1：Agent 使用 Open Mail CLI 的两种能力
# 1. 访问人类的 Gmail
mail-cli sync --account human@gmail.com

# 2. 使用 Agent 专属邮箱（通过集成第三方邮箱服务）
mail-cli account add --email agent@yourdomain.com

# 场景 2：混合使用 Open Mail CLI 和 AgentMail
# 1. 用 Open Mail CLI 处理本地敏感数据
mail-cli sync --account sensitive@company.com

# 2. 用 AgentMail 接收公开通知
curl https://api.agentmail.to/inbox/agent@agentmail.to

# 3. 本地统一处理
./process-all-inboxes.sh
```

## 成功指标

### 技术指标
- 同步速度：1000封邮件 < 30秒
- 查询性能：复杂查询 < 100ms
- 可靠性：99.9% 同步成功率
- 资源占用：< 200MB 内存

### 使用指标
- Agent 集成数量
- 处理的邮件账户数
- 每日同步的邮件量
- Plugin/SDK 下载量

### 生态指标
- GitHub Stars
- Agent Skill 安装量
- 社区贡献的 Plugin 数量
- 文档和教程覆盖度

## 路线图

### 近期 - 基础完善
- 所有命令支持 JSON 输出
- Webhook/事件系统
- HTTP API 模式
- 完善 Agent 文档

### 中期 - 深度集成
- Plugin 系统
- Python/Node.js SDK
- 数据提取 API
- 批量操作优化

### 长期 - 生态建设
- 官方 Plugin 库
- 社区贡献指南
- 企业版功能
- 性能优化

## 总结

**Open Mail CLI 的独特价值在于：让 AI Agent 能够像人类一样访问和管理现有邮箱账户，同时提供程序化接口和本地数据处理能力。**

我们不与 AgentMail 竞争，而是服务不同的市场需求：
- **AgentMail**: Agent 作为邮件生态的独立参与者
- **Open Mail CLI**: Agent 作为现有邮箱的智能管理者

通过专注于本地处理、深度集成、隐私保护和成本效益，我们为 AI Agent 提供了访问现有邮箱的最佳解决方案。
