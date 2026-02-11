# 事件系统与 Webhook 设计

**版本**: 1.0
**日期**: 2026-02-10
**状态**: 设计中

---

## 1. 设计目标

在特定事件发生时（如新邮件到达）通知 Agent，支持自动化工作流。

**设计原则**：
- 简单优先（使用 Node.js EventEmitter，不引入 Redis）
- 核心功能（Webhook + 基本重试）
- 保持扩展性（未来可添加更多事件类型）
- 本地优先（事件日志存储在 SQLite）

---

## 2. 核心功能

### 2.1 支持的功能

| 功能 | 优先级 | 说明 |
|------|--------|------|
| EventEmitter 事件总线 | P0 | 内部事件系统 |
| Webhook HTTP POST | P0 | 发送 HTTP 通知 |
| 基本重试机制 | P0 | 指数退避重试 |
| 事件日志（SQLite） | P0 | 记录事件历史 |
| `email.received` 事件 | P0 | 新邮件到达 |

**不实现**（暂缓）：
- Redis/消息队列（过度设计）
- 复杂的事件过滤（可以后续添加）
- Webhook 签名验证（暂时不需要）
- 脚本执行（可以后续添加）
- 多个 Webhook 配置（先支持单个）

### 2.2 事件类型

**P0 - 核心事件**：
- `email.received`: 新邮件到达

**P1 - 未来扩展**：
- `email.sent`: 邮件发送成功
- `sync.completed`: 同步完成
- `sync.failed`: 同步失败

---

## 3. 架构设计

### 3.1 事件总线

```typescript
// src/events/bus.ts
import { EventEmitter } from 'events';

export interface MailEvent {
  type: string;
  timestamp: string;
  data: any;
}

export class MailEventBus extends EventEmitter {
  private static instance: MailEventBus;

  static getInstance(): MailEventBus {
    if (!this.instance) {
      this.instance = new MailEventBus();
    }
    return this.instance;
  }

  emitEmailReceived(email: Email) {
    const event: MailEvent = {
      type: 'email.received',
      timestamp: new Date().toISOString(),
      data: {
        email_id: email.id,
        from: email.from,
        subject: email.subject,
        folder: email.folder,
        account_id: email.accountId
      }
    };

    this.emit('email.received', event);
  }
}
```

### 3.2 Webhook Handler

```typescript
// src/events/webhook-handler.ts
import fetch from 'node-fetch';
import { MailEvent } from './bus';
import { eventLogModel } from '../storage/models/event-log';

export class WebhookHandler {
  private webhookUrl: string | null = null;
  private maxRetries: number = 3;

  constructor() {
    // 从配置读取 Webhook URL
    this.loadConfig();
  }

  private loadConfig() {
    const config = configModel.get('webhook_url');
    this.webhookUrl = config?.value || null;
  }

  async handle(event: MailEvent) {
    if (!this.webhookUrl) {
      return; // 未配置 Webhook
    }

    await this.sendWithRetry(event);
  }

  private async sendWithRetry(event: MailEvent, attempt: number = 0) {
    try {
      const response = await fetch(this.webhookUrl!, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(event),
        timeout: 5000 // 5 秒超时
      });

      if (response.ok) {
        // 成功
        eventLogModel.create({
          event_type: event.type,
          event_data: JSON.stringify(event.data),
          webhook_url: this.webhookUrl,
          webhook_status: 'success',
          retry_count: attempt
        });
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (error) {
      if (attempt < this.maxRetries) {
        // 重试
        const delay = Math.pow(2, attempt) * 1000; // 指数退避
        await this.sleep(delay);
        await this.sendWithRetry(event, attempt + 1);
      } else {
        // 失败
        eventLogModel.create({
          event_type: event.type,
          event_data: JSON.stringify(event.data),
          webhook_url: this.webhookUrl,
          webhook_status: 'failed',
          retry_count: attempt,
          last_error: error.message
        });
      }
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
```

### 3.3 事件日志模型

```typescript
// src/storage/models/event-log.ts
export interface EventLog {
  id: number;
  event_type: string;
  event_data: string; // JSON
  created_at: string;
  webhook_url: string | null;
  webhook_status: 'success' | 'failed' | 'pending';
  retry_count: number;
  last_error: string | null;
}

export class EventLogModel {
  create(data: Partial<EventLog>): EventLog {
    const stmt = db.prepare(`
      INSERT INTO event_logs (event_type, event_data, webhook_url, webhook_status, retry_count, last_error)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      data.event_type,
      data.event_data,
      data.webhook_url,
      data.webhook_status || 'pending',
      data.retry_count || 0,
      data.last_error || null
    );

    return this.findById(result.lastInsertRowid as number)!;
  }

  findById(id: number): EventLog | null {
    return db.prepare('SELECT * FROM event_logs WHERE id = ?').get(id) as EventLog | null;
  }

  findAll(options: { limit?: number; offset?: number } = {}): EventLog[] {
    const limit = options.limit || 50;
    const offset = options.offset || 0;

    return db.prepare(`
      SELECT * FROM event_logs
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `).all(limit, offset) as EventLog[];
  }
}

export const eventLogModel = new EventLogModel();
```

### 3.4 数据库迁移

```sql
-- src/storage/migrations/005_event_logs.sql
CREATE TABLE IF NOT EXISTS event_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  event_type TEXT NOT NULL,
  event_data TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  webhook_url TEXT,
  webhook_status TEXT DEFAULT 'pending',
  retry_count INTEGER DEFAULT 0,
  last_error TEXT
);

CREATE INDEX idx_event_logs_type ON event_logs(event_type);
CREATE INDEX idx_event_logs_created_at ON event_logs(created_at);
```

### 3.5 初始化

```typescript
// src/events/index.ts
import { MailEventBus } from './bus';
import { WebhookHandler } from './webhook-handler';

export function initializeEvents() {
  const eventBus = MailEventBus.getInstance();
  const webhookHandler = new WebhookHandler();

  // 注册 Webhook Handler
  eventBus.on('email.received', (event) => {
    webhookHandler.handle(event);
  });
}
```

### 3.6 触发事件

```typescript
// src/imap/sync.ts
import { MailEventBus } from '../events/bus';

export async function syncEmails(account: Account) {
  // ... 同步逻辑

  for (const email of newEmails) {
    // 保存到数据库
    const savedEmail = emailModel.create(email);

    // 触发事件
    const eventBus = MailEventBus.getInstance();
    eventBus.emitEmailReceived(savedEmail);
  }
}
```

---

## 4. 配置管理

### 4.1 配置格式

```json
{
  "webhook": {
    "enabled": true,
    "url": "https://example.com/webhook",
    "max_retries": 3
  }
}
```

### 4.2 CLI 命令

```bash
# 配置 Webhook URL
mail-cli config set webhook.url https://example.com/webhook

# 启用 Webhook
mail-cli config set webhook.enabled true

# 查看配置
mail-cli config get webhook

# 测试 Webhook
mail-cli webhook test
```

### 4.3 Webhook 测试命令

```typescript
// src/cli/commands/webhook.ts
export async function webhookTestCommand() {
  const webhookUrl = configModel.get('webhook.url')?.value;

  if (!webhookUrl) {
    console.error('Webhook URL not configured');
    process.exit(1);
  }

  // 发送测试事件
  const testEvent: MailEvent = {
    type: 'test',
    timestamp: new Date().toISOString(),
    data: { message: 'This is a test event' }
  };

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testEvent),
      timeout: 5000
    });

    if (response.ok) {
      console.log('Webhook test successful');
    } else {
      console.error(`Webhook test failed: HTTP ${response.status}`);
      process.exit(1);
    }
  } catch (error) {
    console.error(`Webhook test failed: ${error.message}`);
    process.exit(1);
  }
}
```

---

## 5. 事件日志查询

### 5.1 CLI 命令

```bash
# 查看事件日志
mail-cli events list

# 查看失败的事件
mail-cli events list --status failed

# 查看特定类型的事件
mail-cli events list --type email.received
```

### 5.2 命令实现

```typescript
// src/cli/commands/events.ts
export async function eventsListCommand(options) {
  const { limit, offset } = parsePagination(options);
  const events = eventLogModel.findAll({ limit, offset });

  // 格式化输出
  const formatter = getFormatter(options.format || 'markdown');
  const output = formatter.formatList(events, { total: events.length }, options);

  console.log(output);
}
```

---

## 6. 实施计划

### 6.1 阶段 1：事件总线（1 天）
- [ ] 实现 MailEventBus
- [ ] 实现 `emitEmailReceived` 方法
- [ ] 单元测试

### 6.2 阶段 2：Webhook Handler（2 天）
- [ ] 实现 WebhookHandler
- [ ] 实现重试机制
- [ ] 实现事件日志模型
- [ ] 数据库迁移

### 6.3 阶段 3：集成（1 天）
- [ ] 在同步流程中触发事件
- [ ] 实现配置管理
- [ ] 实现 CLI 命令

### 6.4 阶段 4：测试（1 天）
- [ ] 单元测试
- [ ] 集成测试
- [ ] Webhook 测试

---

## 7. 扩展性考虑

### 7.1 未来可添加的功能

**更多事件类型**：
```typescript
eventBus.emitEmailSent(email);
eventBus.emitSyncCompleted(result);
eventBus.emitSyncFailed(error);
```

**事件过滤**：
```json
{
  "webhook": {
    "url": "https://example.com/webhook",
    "filters": {
      "from": "important@company.com",
      "folder": "INBOX"
    }
  }
}
```

**多个 Webhook**：
```json
{
  "webhooks": [
    {
      "name": "Main Webhook",
      "url": "https://example.com/webhook1",
      "events": ["email.received"]
    },
    {
      "name": "Backup Webhook",
      "url": "https://example.com/webhook2",
      "events": ["sync.failed"]
    }
  ]
}
```

**脚本执行**：
```json
{
  "scripts": [
    {
      "event": "email.received",
      "path": "/path/to/script.sh"
    }
  ]
}
```

### 7.2 扩展方式

当前设计已经预留了扩展空间：
- EventBus 可以添加新的 emit 方法
- WebhookHandler 可以支持多个 URL
- 事件日志可以添加更多字段

---

## 8. 测试策略

### 8.1 单元测试

```typescript
describe('MailEventBus', () => {
  it('should emit email.received event', (done) => {
    const eventBus = MailEventBus.getInstance();

    eventBus.on('email.received', (event) => {
      expect(event.type).toBe('email.received');
      expect(event.data.email_id).toBeDefined();
      done();
    });

    eventBus.emitEmailReceived({ id: 1, from: 'test@example.com' } as Email);
  });
});

describe('WebhookHandler', () => {
  it('should send webhook successfully', async () => {
    // Mock fetch
    global.fetch = jest.fn().mockResolvedValue({ ok: true });

    const handler = new WebhookHandler();
    await handler.handle({
      type: 'email.received',
      timestamp: new Date().toISOString(),
      data: { email_id: 1 }
    });

    expect(fetch).toHaveBeenCalled();
  });

  it('should retry on failure', async () => {
    // Mock fetch to fail twice, then succeed
    global.fetch = jest.fn()
      .mockRejectedValueOnce(new Error('Network error'))
      .mockRejectedValueOnce(new Error('Network error'))
      .mockResolvedValueOnce({ ok: true });

    const handler = new WebhookHandler();
    await handler.handle({
      type: 'email.received',
      timestamp: new Date().toISOString(),
      data: { email_id: 1 }
    });

    expect(fetch).toHaveBeenCalledTimes(3);
  });
});
```

### 8.2 集成测试

```bash
# 启动测试 Webhook 服务器
node test/webhook-server.js &

# 配置 Webhook
mail-cli config set webhook.url http://localhost:3000/webhook

# 触发同步（应该触发 Webhook）
mail-cli sync

# 检查事件日志
mail-cli events list | grep "email.received"

# 测试 Webhook
mail-cli webhook test
```

---

## 9. 文档更新

需要更新的文档：
- [ ] README.md：添加 Webhook 说明
- [ ] CLI 使用指南：添加事件和 Webhook 命令
- [ ] Agent 集成文档：说明如何接收 Webhook

---

## 10. 总结

**核心设计**：
- EventEmitter 事件总线（简单、零依赖）
- Webhook HTTP POST（基本通知）
- 指数退避重试（可靠性）
- SQLite 事件日志（本地存储）

**优势**：
- 简单实现（不引入 Redis）
- 可靠性（重试机制）
- 可追溯（事件日志）
- 易于扩展（预留扩展空间）

**工作量估算**：5-6 天
