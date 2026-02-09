# 邮件客户端技术架构文档

## 1. 技术栈选型

### 1.1 核心技术
- **运行环境**: Node.js (>= 18.0.0)
- **开发语言**: JavaScript/TypeScript (推荐TypeScript)
- **包管理器**: npm

### 1.2 核心依赖库

#### IMAP客户端
- **node-imap** (v0.9.6+)
  - 成熟稳定的IMAP协议实现
  - 支持所有主流IMAP服务器
  - 支持TLS/SSL加密连接
  - 活跃的社区维护

#### SMTP客户端
- **nodemailer** (v6.9.0+)
  - 业界标准的邮件发送库
  - 支持SMTP、SMTP over TLS
  - 支持HTML邮件和附件
  - 良好的错误处理机制

#### 本地存储
- **better-sqlite3** (v9.0.0+)
  - 高性能的SQLite绑定
  - 同步API，简化代码逻辑
  - 跨平台支持
  - 适合本地数据存储

#### CLI框架
- **commander** (v11.0.0+)
  - 强大的命令行参数解析
  - 支持子命令和选项
  - 自动生成帮助信息
- **inquirer** (v9.0.0+)
  - 交互式命令行提示
  - 支持多种输入类型
  - 用户友好的配置向导

#### 其他工具库
- **chalk** (v5.0.0+) - 终端文本着色
- **ora** (v7.0.0+) - 优雅的终端加载动画
- **mailparser** (v3.6.0+) - 邮件内容解析
- **dotenv** (v16.0.0+) - 环境变量管理（开发用）

## 2. 项目目录结构

```
mail-cli/
├── src/
│   ├── index.js                 # 程序入口
│   ├── cli/
│   │   ├── index.js            # CLI主程序
│   │   ├── commands/           # 命令实现
│   │   │   ├── config.js       # 配置命令
│   │   │   ├── sync.js         # 同步命令
│   │   │   ├── list.js         # 列表命令
│   │   │   ├── read.js         # 读取命令
│   │   │   ├── send.js         # 发送命令
│   │   │   └── search.js       # 搜索命令
│   │   └── utils/              # CLI工具函数
│   │       ├── formatter.js    # 输出格式化
│   │       └── validator.js    # 输入验证
│   ├── config/
│   │   ├── index.js            # 配置管理器
│   │   ├── schema.js           # 配置模式定义
│   │   └── defaults.js         # 默认配置
│   ├── imap/
│   │   ├── client.js           # IMAP客户端封装
│   │   ├── connection.js       # 连接管理
│   │   ├── sync.js             # 邮件同步逻辑
│   │   └── parser.js           # 邮件解析
│   ├── smtp/
│   │   ├── client.js           # SMTP客户端封装
│   │   ├── sender.js           # 邮件发送逻辑
│   │   └── composer.js         # 邮件组装
│   ├── storage/
│   │   ├── database.js         # 数据库管理
│   │   ├── models/             # 数据模型
│   │   │   ├── email.js        # 邮件模型
│   │   │   ├── attachment.js   # 附件模型
│   │   │   └── folder.js       # 文件夹模型
│   │   ├── migrations/         # 数据库迁移
│   │   │   └── 001_initial.js  # 初始化表结构
│   │   └── queries.js          # 查询封装
│   └── utils/
│       ├── logger.js           # 日志工具
│       ├── errors.js           # 错误定义
│       └── helpers.js          # 通用辅助函数
├── data/                       # 数据目录（运行时创建）
│   ├── config.json            # 用户配置文件
│   ├── mail.db                # SQLite数据库
│   └── attachments/           # 附件存储目录
├── tests/
│   ├── unit/                  # 单元测试
│   ├── integration/           # 集成测试
│   └── fixtures/              # 测试数据
├── docs/                      # 文档目录
├── .gitignore
├── package.json
├── package-lock.json
├── README.md
└── LICENSE
```

## 3. 模块设计

### 3.1 配置管理模块 (config/)

**职责**:
- 读取和保存用户配置
- 验证配置有效性
- 提供配置默认值
- 支持配置加密（密码等敏感信息）

**核心接口**:
```javascript
class ConfigManager {
  load()                    // 加载配置
  save(config)              // 保存配置
  get(key)                  // 获取配置项
  set(key, value)           // 设置配置项
  validate(config)          // 验证配置
  encrypt(value)            // 加密敏感信息
  decrypt(value)            // 解密敏感信息
}
```

**配置结构**:
```json
{
  "imap": {
    "host": "imap.example.com",
    "port": 993,
    "secure": true,
    "user": "user@example.com",
    "password": "encrypted_password"
  },
  "smtp": {
    "host": "smtp.example.com",
    "port": 465,
    "secure": true,
    "user": "user@example.com",
    "password": "encrypted_password"
  },
  "storage": {
    "dataDir": "./data",
    "maxAttachmentSize": 10485760
  },
  "sync": {
    "autoSync": false,
    "syncInterval": 300000,
    "folders": ["INBOX", "Sent"]
  }
}
```

### 3.2 IMAP客户端模块 (imap/)

**职责**:
- 连接IMAP服务器
- 获取邮件列表
- 下载邮件内容和附件
- 管理邮件文件夹
- 标记邮件状态（已读/未读）

**核心接口**:
```javascript
class IMAPClient {
  connect()                           // 连接服务器
  disconnect()                        // 断开连接
  listFolders()                       // 列出文件夹
  openFolder(folderName)              // 打开文件夹
  fetchEmails(criteria)               // 获取邮件列表
  fetchEmailById(uid)                 // 获取单封邮件
  markAsRead(uid)                     // 标记为已读
  markAsUnread(uid)                   // 标记为未读
  downloadAttachment(uid, partId)     // 下载附件
}
```

**同步策略**:
- 增量同步：只下载新邮件（基于UID）
- 支持指定文件夹同步
- 支持日期范围过滤
- 附件按需下载

### 3.3 SMTP客户端模块 (smtp/)

**职责**:
- 连接SMTP服务器
- 发送邮件
- 支持附件发送
- 支持HTML和纯文本格式

**核心接口**:
```javascript
class SMTPClient {
  connect()                    // 连接服务器
  disconnect()                 // 断开连接
  sendEmail(emailData)         // 发送邮件
  verifyConnection()           // 验证连接
}

class EmailComposer {
  setFrom(address)             // 设置发件人
  setTo(addresses)             // 设置收件人
  setSubject(subject)          // 设置主题
  setBody(text, html)          // 设置正文
  addAttachment(file)          // 添加附件
  compose()                    // 组装邮件
}
```

**邮件数据结构**:
```javascript
{
  from: 'sender@example.com',
  to: ['recipient@example.com'],
  cc: [],
  bcc: [],
  subject: 'Email subject',
  text: 'Plain text content',
  html: '<p>HTML content</p>',
  attachments: [
    {
      filename: 'file.pdf',
      path: '/path/to/file.pdf'
    }
  ]
}
```

### 3.4 本地存储模块 (storage/)

**职责**:
- 管理SQLite数据库
- 存储邮件元数据和内容
- 提供查询接口
- 管理附件文件

**数据库表结构**:

```sql
-- 邮件表
CREATE TABLE emails (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  uid INTEGER NOT NULL,
  message_id TEXT UNIQUE,
  folder TEXT NOT NULL,
  from_address TEXT,
  to_address TEXT,
  cc_address TEXT,
  subject TEXT,
  date DATETIME,
  body_text TEXT,
  body_html TEXT,
  has_attachments BOOLEAN DEFAULT 0,
  is_read BOOLEAN DEFAULT 0,
  flags TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 附件表
CREATE TABLE attachments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email_id INTEGER NOT NULL,
  filename TEXT NOT NULL,
  content_type TEXT,
  size INTEGER,
  file_path TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (email_id) REFERENCES emails(id) ON DELETE CASCADE
);

-- 文件夹表
CREATE TABLE folders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT UNIQUE NOT NULL,
  delimiter TEXT,
  flags TEXT,
  last_sync DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 索引
CREATE INDEX idx_emails_uid ON emails(uid);
CREATE INDEX idx_emails_folder ON emails(folder);
CREATE INDEX idx_emails_date ON emails(date);
CREATE INDEX idx_emails_from ON emails(from_address);
CREATE INDEX idx_emails_subject ON emails(subject);
CREATE INDEX idx_attachments_email_id ON attachments(email_id);
```

**核心接口**:
```javascript
class Database {
  initialize()                      // 初始化数据库
  close()                           // 关闭连接
  runMigrations()                   // 运行迁移
}

class EmailModel {
  create(emailData)                 // 创建邮件记录
  findById(id)                      // 根据ID查找
  findByUid(uid)                    // 根据UID查找
  findByFolder(folder, options)     // 查找文件夹邮件
  search(query)                     // 搜索邮件
  update(id, data)                  // 更新邮件
  delete(id)                        // 删除邮件
  markAsRead(id)                    // 标记已读
}

class AttachmentModel {
  create(attachmentData)            // 创建附件记录
  findByEmailId(emailId)            // 查找邮件附件
  delete(id)                        // 删除附件
}
```

### 3.5 CLI界面模块 (cli/)

**职责**:
- 解析命令行参数
- 提供交互式界面
- 格式化输出
- 错误处理和提示

**命令设计**:

```bash
# 配置命令
mail-cli config                  # 交互式配置向导
mail-cli config --show           # 显示当前配置
mail-cli config --set key=value  # 设置配置项

# 同步命令
mail-cli sync                    # 同步所有文件夹
mail-cli sync --folder INBOX     # 同步指定文件夹
mail-cli sync --since 2024-01-01 # 同步指定日期后的邮件

# 列表命令
mail-cli list                    # 列出收件箱邮件
mail-cli list --folder Sent      # 列出指定文件夹
mail-cli list --unread           # 只显示未读邮件
mail-cli list --limit 20         # 限制显示数量
mail-cli list --page 2           # 分页显示

# 读取命令
mail-cli read <id>               # 读取邮件详情
mail-cli read <id> --raw         # 显示原始内容

# 发送命令
mail-cli send                    # 交互式发送
mail-cli send --to user@example.com --subject "Test" --body "Hello"

# 搜索命令
mail-cli search "keyword"        # 搜索邮件
mail-cli search --from user@example.com
mail-cli search --subject "meeting"
mail-cli search --date 2024-01-01

# 帮助命令
mail-cli --help                  # 显示帮助
mail-cli <command> --help        # 显示命令帮助
```

**输出格式示例**:
```
┌────┬──────────────────────┬─────────────────────────────┬────────────┐
│ ID │ From                 │ Subject                     │ Date       │
├────┼──────────────────────┼─────────────────────────────┼────────────┤
│ 1  │ user@example.com     │ Meeting reminder            │ 2024-01-15 │
│ 2  │ admin@example.com    │ System notification         │ 2024-01-14 │
└────┴──────────────────────┴─────────────────────────────┴────────────┘
```

## 4. 错误处理策略

### 4.1 错误分类

```javascript
// 自定义错误类
class MailClientError extends Error {
  constructor(message, code) {
    super(message);
    this.name = 'MailClientError';
    this.code = code;
  }
}

class ConfigError extends MailClientError {}
class ConnectionError extends MailClientError {}
class AuthenticationError extends MailClientError {}
class SyncError extends MailClientError {}
class StorageError extends MailClientError {}
```

### 4.2 错误处理原则

- 网络错误：自动重试（最多3次）
- 认证错误：提示用户重新配置
- 存储错误：记录日志并提示用户
- 用户输入错误：友好提示并要求重新输入
- 所有错误都应记录到日志文件

### 4.3 日志管理

```javascript
// 日志级别：ERROR, WARN, INFO, DEBUG
logger.error('Connection failed', { host, port, error });
logger.warn('Slow sync detected', { duration });
logger.info('Sync completed', { newEmails: 5 });
logger.debug('IMAP command', { command: 'FETCH' });
```

日志文件位置：`data/logs/mail-cli.log`

## 5. 安全考虑

### 5.1 密码存储
- 使用Node.js crypto模块加密密码
- 密钥存储在系统keychain（可选）
- 配置文件权限限制（chmod 600）

### 5.2 连接安全
- 强制使用TLS/SSL连接
- 验证服务器证书
- 支持自签名证书（开发环境）

### 5.3 数据安全
- 本地数据库文件权限限制
- 敏感信息不记录到日志
- 定期清理临时文件

## 6. 性能优化

### 6.1 同步优化
- 使用UID增量同步
- 并发下载邮件（限制并发数）
- 大附件延迟下载
- 连接池复用

### 6.2 查询优化
- 数据库索引优化
- 分页查询
- 查询结果缓存

### 6.3 存储优化
- 定期清理旧日志
- 附件去重存储
- 数据库定期VACUUM

## 7. package.json 配置

```json
{
  "name": "mail-cli",
  "version": "1.0.0",
  "description": "A command-line email client with IMAP/SMTP support",
  "main": "src/index.js",
  "bin": {
    "mail-cli": "./src/index.js"
  },
  "scripts": {
    "start": "node src/index.js",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "lint": "eslint src/",
    "lint:fix": "eslint src/ --fix"
  },
  "keywords": [
    "email",
    "imap",
    "smtp",
    "cli",
    "mail-cli"
  ],
  "author": "",
  "license": "MIT",
  "engines": {
    "node": ">=18.0.0"
  },
  "dependencies": {
    "better-sqlite3": "^9.0.0",
    "chalk": "^5.3.0",
    "commander": "^11.1.0",
    "dotenv": "^16.3.1",
    "inquirer": "^9.2.12",
    "mailparser": "^3.6.5",
    "node-imap": "^0.9.6",
    "nodemailer": "^6.9.7",
    "ora": "^7.0.1"
  },
  "devDependencies": {
    "eslint": "^8.54.0",
    "jest": "^29.7.0"
  }
}
```

## 8. 开发工作流

### 8.1 开发环境设置

```bash
# 克隆项目
git clone <repository-url>
cd mail-cli

# 安装依赖
npm install

# 创建环境配置（开发用）
cp .env.example .env

# 运行开发模式
npm start
```

### 8.2 代码规范

- 使用ESLint进行代码检查
- 遵循Airbnb JavaScript风格指南
- 函数和类必须有JSDoc注释
- 提交前运行lint和测试

### 8.3 Git工作流

- main分支：稳定版本
- develop分支：开发版本
- feature/*：功能分支
- bugfix/*：修复分支

### 8.4 测试策略

```bash
# 运行所有测试
npm test

# 运行特定测试
npm test -- imap.test.js

# 生成覆盖率报告
npm run test:coverage
```

## 9. 部署和发布

### 9.1 构建流程

```bash
# 安装生产依赖
npm install --production

# 运行测试
npm test

# 打包（可选）
npm pack
```

### 9.2 安装方式

**全局安装**:
```bash
npm install -g mail-cli
mail-cli --help
```

**本地安装**:
```bash
npm install mail-cli
npx mail-cli --help
```

**从源码安装**:
```bash
git clone <repository-url>
cd mail-cli
npm install
npm link
```

### 9.3 配置文件位置

- Linux/macOS: `~/.config/mail-cli/config.json`
- Windows: `%APPDATA%\mail-cli\config.json`
- 数据目录: `~/.local/share/mail-cli/` (Linux/macOS) 或 `%LOCALAPPDATA%\mail-cli\` (Windows)

## 10. 依赖关系图

```
┌─────────────────┐
│   CLI Module    │
│   (commander)   │
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
┌───▼───┐ ┌──▼────┐
│ IMAP  │ │ SMTP  │
│Module │ │Module │
└───┬───┘ └──┬────┘
    │        │
    └────┬───┘
         │
    ┌────▼────────┐
    │   Storage   │
    │   Module    │
    │  (SQLite)   │
    └─────────────┘
         │
    ┌────▼────────┐
    │   Config    │
    │   Module    │
    └─────────────┘
```

## 11. 开发优先级

### Phase 1: 基础框架（Week 1）
1. 项目结构搭建
2. 配置管理模块
3. 数据库模块和表结构
4. CLI基础框架

### Phase 2: IMAP功能（Week 2）
1. IMAP连接和认证
2. 邮件列表获取
3. 邮件内容下载
4. 本地存储集成

### Phase 3: SMTP功能（Week 3）
1. SMTP连接和认证
2. 邮件发送功能
3. 附件支持

### Phase 4: CLI完善（Week 4）
1. 所有命令实现
2. 交互式界面优化
3. 错误处理完善
4. 测试和文档

## 12. 技术风险和应对

### 12.1 IMAP协议兼容性
**风险**: 不同邮件服务器IMAP实现差异
**应对**:
- 使用成熟的node-imap库
- 针对主流服务器进行兼容性测试
- 提供配置选项应对特殊情况

### 12.2 大附件处理
**风险**: 大附件可能导致内存溢出
**应对**:
- 使用流式处理
- 设置附件大小限制
- 实现分块下载

### 12.3 并发同步
**风险**: 并发过高可能被服务器限制
**应对**:
- 限制并发连接数
- 实现请求队列
- 添加重试机制

### 12.4 跨平台兼容性
**风险**: 文件路径、权限等平台差异
**应对**:
- 使用Node.js path模块处理路径
- 使用cross-platform库
- 在多平台进行测试

## 13. 总结

本技术架构设计基于Node.js生态系统，采用模块化设计，各模块职责清晰，易于开发和维护。核心技术选型成熟稳定，能够满足邮件客户端的功能需求。通过合理的错误处理、安全措施和性能优化，可以构建一个可靠、高效的命令行邮件客户端。
