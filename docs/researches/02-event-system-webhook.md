# 事件系统与 Webhook 调研

**调研日期**: 2026-02-10
**调研目标**: 设计适合 Agent 自动化工作流的事件系统和 Webhook 机制

---

## 1. 调研背景

Open Mail CLI 需要在特定事件发生时（如新邮件到达）通知 Agent，支持自动化工作流。主要需求：
- 新邮件到达时触发 Webhook
- 支持自定义脚本执行
- 可靠的事件传递（重试机制）
- 灵活的配置（多个 Webhook、过滤条件）

---

## 2. Webhook 实现方案调研

### 2.1 基本 Webhook 模式

**工作流程**:
1. 事件发生（新邮件到达）
2. 构造 Webhook payload（JSON）
3. 发送 HTTP POST 请求到配置的 URL
4. 处理响应（成功/失败）
5. 失败时重试

**Payload 结构示例**:
```json
{
  "event": "email.received",
  "timestamp": "2026-02-10T10:30:00Z",
  "data": {
    "email_id": 123,
    "from": "alice@example.com",
    "subject": "Meeting reminder",
    "folder": "INBOX",
    "account_id": 1
  }
}
```

### 2.2 重试机制

**指数退避策略**:
- 第 1 次重试: 1 秒后
- 第 2 次重试: 2 秒后
- 第 3 次重试: 4 秒后
- 第 4 次重试: 8 秒后
- 第 5 次重试: 16 秒后
- 最多重试 5 次

**实现参考**:
```typescript
async function sendWebhook(url: string, payload: any, retries = 5) {
  for (let i = 0; i <= retries; i++) {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        timeout: 5000 // 5 秒超时
      });

      if (response.ok) {
        return { success: true };
      }
    } catch (error) {
      if (i === retries) {
        return { success: false, error };
      }
      await sleep(Math.pow(2, i) * 1000); // 指数退避
    }
  }
}
```

### 2.3 Webhook 安全性

**签名验证**:
- 使用 HMAC-SHA256 签名
- 配置 secret key
- 在 HTTP Header 中传递签名

**示例**:
```typescript
const signature = crypto
  .createHmac('sha256', secret)
  .update(JSON.stringify(payload))
  .digest('hex');

headers['X-Webhook-Signature'] = signature;
```

**接收方验证**:
```python
import hmac
import hashlib

def verify_signature(payload, signature, secret):
    expected = hmac.new(
        secret.encode(),
        payload.encode(),
        hashlib.sha256
    ).hexdigest()
    return hmac.compare_digest(expected, signature)
```

---

## 3. 事件系统架构调研

### 3.1 EventEmitter 模式（Node.js 内置）

**特点**:
- 同步/异步事件处理
- 简单易用
- 适合单进程应用

**示例**:
```typescript
import { EventEmitter } from 'events';

class MailEventBus extends EventEmitter {
  emitEmailReceived(email: Email) {
    this.emit('email.received', email);
  }
}

// 使用
eventBus.on('email.received', async (email) => {
  await sendWebhook(webhookUrl, email);
});
```

**优势**:
- 零依赖（Node.js 内置）
- 性能好
- 适合本地事件

**劣势**:
- 仅限单进程
- 无持久化
- 无分布式支持

### 3.2 消息队列模式

**常见方案**:
- Redis Pub/Sub
- RabbitMQ
- Kafka

**特点**:
- 持久化事件
- 分布式支持
- 可靠性高

**Redis Pub/Sub 示例**:
```typescript
import Redis from 'ioredis';

const redis = new Redis();

// 发布事件
redis.publish('email.received', JSON.stringify(email));

// 订阅事件
redis.subscribe('email.received');
redis.on('message', (channel, message) => {
  const email = JSON.parse(message);
  // 处理事件
});
```

**优势**:
- 持久化（Redis Streams）
- 支持多订阅者
- 可靠性高

**劣势**:
- 需要额外依赖（Redis）
- 复杂度增加
- 对于本地 CLI 工具可能过度设计

### 3.3 混合方案

**推荐架构**:
- 内部使用 EventEmitter（简单、高效）
- Webhook 作为外部通知机制
- 事件日志持久化到 SQLite

**流程**:
```
新邮件到达
  ↓
EventEmitter.emit('email.received')
  ↓
├─ Webhook Handler → 发送 HTTP POST
├─ Script Handler → 执行自定义脚本
└─ Logger → 记录到 SQLite
```

---

## 4. 其他邮件客户端事件机制调研

### 4.1 Thunderbird

**事件机制**:
- 基于 XPCOM 事件系统
- 支持扩展监听事件
- 事件类型: `msgAdded`, `folderLoaded`, `msgDeleted`

**特点**:
- 丰富的事件类型
- 扩展可以注册监听器
- 同步和异步事件

### 4.2 Mailspring

**事件机制**:
- 基于 Electron IPC
- 主进程和渲染进程通信
- 支持 Webhook 插件

**特点**:
- 插件可以监听邮件事件
- 支持 Webhook 通知
- 事件持久化到本地数据库

### 4.3 Nylas Mail（已停止维护，但架构值得参考）

**事件机制**:
- Flux 架构
- Action → Store → View
- 支持插件监听 Store 变化

**特点**:
- 单向数据流
- 事件可追溯
- 插件友好

---

## 5. 脚本触发机制

### 5.1 Shell 脚本执行

**配置示例**:
```json
{
  "events": {
    "email.received": {
      "script": "/path/to/script.sh",
      "args": ["{{email.id}}", "{{email.from}}"]
    }
  }
}
```

**执行方式**:
```typescript
import { spawn } from 'child_process';

function executeScript(scriptPath: string, args: string[]) {
  const child = spawn(scriptPath, args);

  child.stdout.on('data', (data) => {
    console.log(`Script output: ${data}`);
  });

  child.on('exit', (code) => {
    console.log(`Script exited with code ${code}`);
  });
}
```

### 5.2 Node.js 脚本执行

**配置示例**:
```json
{
  "events": {
    "email.received": {
      "script": "/path/to/handler.js",
      "type": "node"
    }
  }
}
```

**脚本接口**:
```javascript
// handler.js
module.exports = async function(event) {
  const { email } = event.data;

  // 处理逻辑
  console.log(`New email from ${email.from}`);

  // 返回结果
  return { success: true };
};
```

---

## 6. 事件类型设计

### 6.1 核心事件

**邮件相关**:
- `email.received`: 新邮件到达
- `email.sent`: 邮件发送成功
- `email.read`: 邮件被标记为已读
- `email.deleted`: 邮件被删除
- `email.moved`: 邮件被移动到其他文件夹

**同步相关**:
- `sync.started`: 同步开始
- `sync.completed`: 同步完成
- `sync.failed`: 同步失败

**账户相关**:
- `account.added`: 账户添加
- `account.removed`: 账户移除
- `account.error`: 账户错误（认证失败等）

### 6.2 事件过滤

**配置示例**:
```json
{
  "webhooks": [
    {
      "url": "https://example.com/webhook",
      "events": ["email.received"],
      "filters": {
        "from": "important@company.com",
        "folder": "INBOX",
        "unread": true
      }
    }
  ]
}
```

**过滤逻辑**:
- 只有满足所有过滤条件的事件才触发 Webhook
- 支持正则表达式匹配
- 支持多个 Webhook 配置不同过滤条件

---

## 7. 事件日志

### 7.1 日志结构

**SQLite 表设计**:
```sql
CREATE TABLE event_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  event_type TEXT NOT NULL,
  event_data TEXT NOT NULL, -- JSON
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  webhook_url TEXT,
  webhook_status TEXT, -- 'success', 'failed', 'pending'
  retry_count INTEGER DEFAULT 0,
  last_error TEXT
);
```

### 7.2 日志查询

**CLI 命令**:
```bash
# 查看事件日志
mail-cli events list

# 查看失败的 Webhook
mail-cli events list --status failed

# 重试失败的 Webhook
mail-cli events retry <event-id>
```

---

## 8. 配置格式设计

### 8.1 Webhook 配置

**配置文件**: `~/.mail-cli/config.json`

```json
{
  "webhooks": [
    {
      "name": "Main Webhook",
      "url": "https://example.com/webhook",
      "secret": "your-secret-key",
      "events": ["email.received", "email.sent"],
      "filters": {
        "folder": "INBOX",
        "unread": true
      },
      "retry": {
        "max_attempts": 5,
        "backoff": "exponential"
      },
      "enabled": true
    }
  ],
  "scripts": [
    {
      "name": "Email Processor",
      "path": "/path/to/script.sh",
      "events": ["email.received"],
      "filters": {
        "from": ".*@important-domain\\.com"
      },
      "enabled": true
    }
  ]
}
```

### 8.2 CLI 命令管理

```bash
# 添加 Webhook
mail-cli webhook add --url https://example.com/webhook --events email.received

# 列出 Webhooks
mail-cli webhook list

# 测试 Webhook
mail-cli webhook test <webhook-id>

# 禁用 Webhook
mail-cli webhook disable <webhook-id>

# 删除 Webhook
mail-cli webhook delete <webhook-id>
```

---

## 9. 推荐方案

### 9.1 事件系统架构

**核心组件**:
```
┌─────────────────────────────────────┐
│         Mail Event Bus              │
│      (EventEmitter based)           │
└──────────────┬──────────────────────┘
               │
       ┌───────┴────────┐
       │                │
   ┌───▼────┐      ┌───▼────┐
   │Webhook │      │Script  │
   │Handler │      │Handler │
   └───┬────┘      └───┬────┘
       │                │
   ┌───▼────┐      ┌───▼────┐
   │HTTP    │      │Child   │
   │Request │      │Process │
   └───┬────┘      └───┬────┘
       │                │
   ┌───▼────────────────▼────┐
   │    Event Logger          │
   │    (SQLite)              │
   └──────────────────────────┘
```

### 9.2 实施优先级

**P0 - 核心功能**:
1. EventEmitter 事件总线
2. Webhook HTTP POST 发送
3. 基本重试机制（指数退避）
4. 事件日志（SQLite）
5. `email.received` 事件

**P1 - 增强功能**:
6. 脚本执行支持
7. 事件过滤
8. 多 Webhook 配置
9. Webhook 签名验证
10. CLI 命令管理 Webhook

**P2 - 高级功能**:
11. 更多事件类型
12. 事件重放
13. Webhook 监控和统计

### 9.3 实现建议

**EventBus 实现**:
```typescript
// src/events/bus.ts
import { EventEmitter } from 'events';

export class MailEventBus extends EventEmitter {
  private static instance: MailEventBus;

  static getInstance() {
    if (!this.instance) {
      this.instance = new MailEventBus();
    }
    return this.instance;
  }

  emitEmailReceived(email: Email) {
    this.emit('email.received', {
      event: 'email.received',
      timestamp: new Date().toISOString(),
      data: email
    });
  }
}
```

**Webhook Handler**:
```typescript
// src/events/webhook-handler.ts
export class WebhookHandler {
  async handle(event: MailEvent) {
    const webhooks = await this.getMatchingWebhooks(event);

    for (const webhook of webhooks) {
      await this.sendWithRetry(webhook, event);
    }
  }

  private async sendWithRetry(webhook: Webhook, event: MailEvent) {
    // 实现重试逻辑
  }
}
```

---

## 10. 参考资料

- GitHub Webhooks: https://docs.github.com/en/webhooks
- Stripe Webhooks: https://stripe.com/docs/webhooks
- Node.js EventEmitter: https://nodejs.org/api/events.html
- Webhook 最佳实践: https://webhooks.fyi/

---

## 11. 结论

**推荐方案**:
1. **事件系统**: EventEmitter（简单、高效、零依赖）
2. **Webhook**: HTTP POST + 指数退避重试
3. **脚本支持**: Shell/Node.js 脚本执行
4. **事件日志**: SQLite 持久化
5. **配置管理**: JSON 配置文件 + CLI 命令

**核心原则**:
- 简单优先（避免过度设计）
- 可靠性（重试机制、日志记录）
- 灵活性（多 Webhook、过滤条件）
- Agent 友好（清晰的事件结构）
