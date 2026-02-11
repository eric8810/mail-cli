# HTTP API 模式设计

**版本**: 1.0
**日期**: 2026-02-10
**状态**: 设计中

---

## 1. 设计目标

提供本地 HTTP Server，让 Agent 通过 HTTP API 访问邮件功能。

**设计原则**：
- 简单优先（基于 Hono，轻量级）
- 本地优先（仅允许 localhost 访问）
- 核心功能（邮件、账户、同步 API）
- 保持扩展性（未来可添加更多 API）

---

## 2. 核心功能

### 2.1 支持的功能

| 功能 | 优先级 | 说明 |
|------|--------|------|
| HTTP Server（Hono） | P0 | 基础框架 |
| 邮件相关 API | P0 | 列表、详情、发送 |
| 账户管理 API | P0 | 列表、添加 |
| 同步 API | P0 | 触发同步 |
| 本地访问限制 | P0 | 仅 127.0.0.1 |
| 错误处理 | P0 | 统一错误格式 |

**不实现**（暂缓）：
- OpenAPI 文档生成（可以后续添加）
- 复杂的请求验证（暂时不需要）
- 认证机制（本地访问不需要）
- CORS 支持（本地访问不需要）

### 2.2 API 端点

**邮件相关**：
- `GET /api/emails` - 列出邮件
- `GET /api/emails/:id` - 获取邮件详情
- `POST /api/emails` - 发送邮件
- `POST /api/emails/:id/mark-read` - 标记为已读

**账户相关**：
- `GET /api/accounts` - 列出账户
- `POST /api/accounts` - 添加账户
- `GET /api/accounts/:id` - 获取账户详情

**同步相关**：
- `POST /api/sync` - 触发同步
- `GET /api/sync/status` - 获取同步状态

**健康检查**：
- `GET /health` - 健康检查

---

## 3. 架构设计

### 3.1 项目结构

```
src/
├── api/
│   ├── server.ts           # HTTP Server 入口
│   ├── routes/
│   │   ├── emails.ts       # 邮件相关路由
│   │   ├── accounts.ts     # 账户相关路由
│   │   ├── sync.ts         # 同步相关路由
│   │   └── index.ts        # 路由汇总
│   ├── middlewares/
│   │   ├── error.ts        # 错误处理中间件
│   │   ├── logger.ts       # 日志中间件
│   │   └── localhost.ts    # 本地访问限制中间件
│   └── controllers/
│       ├── email.ts        # 邮件控制器
│       ├── account.ts      # 账户控制器
│       └── sync.ts         # 同步控制器
```

### 3.2 Server 入口

```typescript
// src/api/server.ts
import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { logger } from 'hono/logger';
import { prettyJSON } from 'hono/pretty-json';

import emailRoutes from './routes/emails';
import accountRoutes from './routes/accounts';
import syncRoutes from './routes/sync';
import { errorHandler } from './middlewares/error';
import { localhostOnly } from './middlewares/localhost';

const app = new Hono();

// 中间件
app.use('*', logger());
app.use('*', prettyJSON());
app.use('*', localhostOnly());

// 路由
app.route('/api/emails', emailRoutes);
app.route('/api/accounts', accountRoutes);
app.route('/api/sync', syncRoutes);

// 健康检查
app.get('/health', (c) => c.json({ status: 'ok' }));

// 错误处理
app.onError(errorHandler);

export function startServer(port: number = 3000) {
  serve({
    fetch: app.fetch,
    port,
    hostname: '127.0.0.1', // 仅监听本地
  });

  console.log(`Server running at http://127.0.0.1:${port}`);
}
```

### 3.3 本地访问限制中间件

```typescript
// src/api/middlewares/localhost.ts
import { Context, Next } from 'hono';

export async function localhostOnly(c: Context, next: Next) {
  // Hono 在 Node.js 环境下无法直接获取客户端 IP
  // 依赖 serve 的 hostname 配置（仅监听 127.0.0.1）
  await next();
}
```

**说明**：通过 `serve({ hostname: '127.0.0.1' })`，Server 只监听本地地址，外部无法访问。

### 3.4 错误处理中间件

```typescript
// src/api/middlewares/error.ts
import { Context } from 'hono';
import { CLIError } from '../../utils/errors';

export function errorHandler(err: Error, c: Context) {
  console.error(`API Error: ${err.message}`);

  if (err instanceof CLIError) {
    return c.json({
      error: {
        code: err.code,
        message: err.message
      }
    }, err.exitCode === 2 ? 400 : 500);
  }

  return c.json({
    error: {
      code: 'INTERNAL_ERROR',
      message: err.message
    }
  }, 500);
}
```

### 3.5 邮件路由

```typescript
// src/api/routes/emails.ts
import { Hono } from 'hono';
import * as emailController from '../controllers/email';

const app = new Hono();

// 列出邮件
app.get('/', emailController.list);

// 获取邮件详情
app.get('/:id', emailController.get);

// 发送邮件
app.post('/', emailController.send);

// 标记为已读
app.post('/:id/mark-read', emailController.markRead);

export default app;
```

### 3.6 邮件控制器

```typescript
// src/api/controllers/email.ts
import { Context } from 'hono';
import emailModel from '../../storage/models/email';
import { emailNotFound, invalidArgument } from '../../utils/errors';
import { parsePagination, calculateRange } from '../../cli/utils/pagination';

export async function list(c: Context) {
  const folder = c.req.query('folder') || 'INBOX';
  const limit = parseInt(c.req.query('limit') || '20');
  const offset = parseInt(c.req.query('offset') || '0');

  const emails = emailModel.findByFolder(folder, { limit, offset });
  const total = emailModel.countByFolder(folder);
  const unread = emailModel.countUnread(folder);

  const range = calculateRange(offset, limit, total);

  return c.json({
    data: emails,
    meta: {
      total,
      unread,
      folder,
      limit,
      offset,
      showing: range.showing
    }
  });
}

export async function get(c: Context) {
  const id = parseInt(c.req.param('id'));

  if (isNaN(id)) {
    throw invalidArgument('Invalid email ID');
  }

  const email = emailModel.findById(id);

  if (!email) {
    throw emailNotFound(id);
  }

  return c.json({ data: email });
}

export async function send(c: Context) {
  const body = await c.req.json();

  // 验证参数
  if (!body.to || !body.subject || !body.body) {
    throw invalidArgument('Missing required fields: to, subject, body');
  }

  // 发送邮件逻辑
  // TODO: 实现发送逻辑

  return c.json({
    data: {
      id: 123,
      status: 'sent'
    }
  }, 201);
}

export async function markRead(c: Context) {
  const id = parseInt(c.req.param('id'));

  if (isNaN(id)) {
    throw invalidArgument('Invalid email ID');
  }

  const email = emailModel.findById(id);

  if (!email) {
    throw emailNotFound(id);
  }

  emailModel.markAsRead(id);

  return c.json({
    data: {
      id,
      is_read: true
    }
  });
}
```

### 3.7 CLI 命令

```typescript
// src/cli/commands/serve.ts
import { startServer } from '../../api/server';

export async function serveCommand(options) {
  const port = options.port || 3000;

  console.log(`Starting HTTP API server on port ${port}...`);
  startServer(port);
}
```

```typescript
// src/cli/index.ts
program
  .command('serve')
  .description('Start HTTP API server')
  .option('--port <number>', 'Port to listen on (default: 3000)', parseInt)
  .action(serveCommand);
```

---

## 4. API 规范

### 4.1 请求格式

**查询参数**：
```
GET /api/emails?folder=INBOX&limit=20&offset=0
```

**请求体（JSON）**：
```json
POST /api/emails
{
  "to": "bob@example.com",
  "subject": "Hello",
  "body": "Hi Bob!"
}
```

### 4.2 响应格式

**成功响应**：
```json
{
  "data": { ... }
}
```

**列表响应**：
```json
{
  "data": [ ... ],
  "meta": {
    "total": 150,
    "limit": 20,
    "offset": 0,
    "showing": "1-20"
  }
}
```

**错误响应**：
```json
{
  "error": {
    "code": "EMAIL_NOT_FOUND",
    "message": "Email with ID 123 not found"
  }
}
```

### 4.3 状态码

- `200 OK`: 成功
- `201 Created`: 创建成功
- `400 Bad Request`: 参数错误
- `404 Not Found`: 资源不存在
- `500 Internal Server Error`: 服务器错误

---

## 5. 实施计划

### 5.1 阶段 1：基础框架（1-2 天）
- [ ] 安装 Hono 和依赖
- [ ] 实现 Server 入口
- [ ] 实现中间件（logger, error, localhost）
- [ ] 实现健康检查

### 5.2 阶段 2：邮件 API（2 天）
- [ ] 实现邮件路由
- [ ] 实现邮件控制器（list, get, send, markRead）
- [ ] 测试

### 5.3 阶段 3：账户和同步 API（1-2 天）
- [ ] 实现账户路由和控制器
- [ ] 实现同步路由和控制器
- [ ] 测试

### 5.4 阶段 4：CLI 集成（1 天）
- [ ] 实现 serve 命令
- [ ] 测试

---

## 6. 使用示例

### 6.1 启动 Server

```bash
# 默认端口 3000
mail-cli serve

# 指定端口
mail-cli serve --port 3001
```

### 6.2 API 调用

```bash
# 健康检查
curl http://127.0.0.1:3000/health

# 列出邮件
curl http://127.0.0.1:3000/api/emails?folder=INBOX&limit=10

# 获取邮件详情
curl http://127.0.0.1:3000/api/emails/123

# 发送邮件
curl -X POST http://127.0.0.1:3000/api/emails \
  -H "Content-Type: application/json" \
  -d '{"to":"bob@example.com","subject":"Hello","body":"Hi!"}'

# 标记为已读
curl -X POST http://127.0.0.1:3000/api/emails/123/mark-read
```

---

## 7. 扩展性考虑

### 7.1 未来可添加的功能

**OpenAPI 文档**：
```typescript
import { swaggerUI } from '@hono/swagger-ui';

app.get('/api/docs', swaggerUI({ url: '/api/openapi.json' }));
```

**请求验证**：
```typescript
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';

const sendEmailSchema = z.object({
  to: z.string().email(),
  subject: z.string().min(1),
  body: z.string()
});

app.post('/', zValidator('json', sendEmailSchema), emailController.send);
```

**认证机制**（如果需要远程访问）：
```typescript
app.use('/api/*', async (c, next) => {
  const token = c.req.header('Authorization');
  if (!token || !verifyToken(token)) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  await next();
});
```

### 7.2 扩展方式

当前设计已经预留了扩展空间：
- 可以添加新的路由和控制器
- 可以添加新的中间件
- 可以添加请求验证

---

## 8. 测试策略

### 8.1 单元测试

```typescript
describe('Email Controller', () => {
  it('should list emails', async () => {
    const c = createMockContext({ query: { folder: 'INBOX' } });
    await emailController.list(c);

    expect(c.json).toHaveBeenCalledWith({
      data: expect.any(Array),
      meta: expect.objectContaining({ total: expect.any(Number) })
    });
  });

  it('should throw error for invalid email ID', async () => {
    const c = createMockContext({ param: { id: 'invalid' } });

    await expect(emailController.get(c)).rejects.toThrow('Invalid email ID');
  });
});
```

### 8.2 集成测试

```bash
# 启动 Server
mail-cli serve --port 3001 &
SERVER_PID=$!

# 测试健康检查
curl http://127.0.0.1:3001/health | jq '.status' | grep "ok"

# 测试邮件列表
curl http://127.0.0.1:3001/api/emails | jq '.data | length'

# 测试错误处理
curl http://127.0.0.1:3001/api/emails/999 | jq '.error.code' | grep "EMAIL_NOT_FOUND"

# 停止 Server
kill $SERVER_PID
```

---

## 9. 文档更新

需要更新的文档：
- [ ] README.md：添加 HTTP API 说明
- [ ] API 使用指南：添加 API 端点文档
- [ ] Agent 集成文档：添加 HTTP API 调用示例

---

## 10. 总结

**核心设计**：
- Hono 框架（轻量、快速）
- 本地访问（仅 127.0.0.1）
- RESTful API（标准设计）
- 统一错误处理

**优势**：
- 简单实现（Hono 轻量级）
- 安全（本地访问限制）
- Agent 友好（标准 REST API）
- 易于扩展（预留扩展空间）

**工作量估算**：6-7 天
