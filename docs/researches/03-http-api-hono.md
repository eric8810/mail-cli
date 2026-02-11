# HTTP API 模式调研（基于 Hono）

**调研日期**: 2026-02-10
**调研目标**: 设计本地 HTTP Server，让 Agent 通过 HTTP API 访问邮件功能

---

## 1. 调研背景

Open Mail CLI 需要提供 HTTP API 模式，让 Agent 可以通过 HTTP 请求访问邮件功能。主要需求：
- 本地运行的 HTTP Server
- RESTful API 设计
- 仅允许本地访问（localhost only）
- 简单的认证策略（暂不实现复杂验证）
- API 文档生成

**技术选型**: Hono 框架（用户指定）

---

## 2. Hono 框架调研

### 2.1 Hono 简介

**官网**: https://hono.dev/

**特点**:
- 超快速（比 Express 快 4 倍）
- 轻量级（~12KB）
- 支持多运行时（Node.js, Bun, Deno, Cloudflare Workers）
- TypeScript 原生支持
- 中间件系统
- 类似 Express 的 API

**性能对比**:
```
Hono:     ~50,000 req/s
Fastify:  ~45,000 req/s
Express:  ~12,000 req/s
```

### 2.2 基本使用

**安装**:
```bash
npm install hono
```

**Hello World**:
```typescript
import { Hono } from 'hono';

const app = new Hono();

app.get('/', (c) => {
  return c.json({ message: 'Hello Hono!' });
});

export default app;
```

**Node.js 适配器**:
```typescript
import { serve } from '@hono/node-server';
import { Hono } from 'hono';

const app = new Hono();

app.get('/', (c) => c.json({ message: 'Hello' }));

serve({
  fetch: app.fetch,
  port: 3000,
});
```

### 2.3 路由系统

**基本路由**:
```typescript
app.get('/emails', (c) => { /* ... */ });
app.post('/emails', (c) => { /* ... */ });
app.get('/emails/:id', (c) => { /* ... */ });
app.put('/emails/:id', (c) => { /* ... */ });
app.delete('/emails/:id', (c) => { /* ... */ });
```

**路由分组**:
```typescript
const api = new Hono();

api.get('/emails', listEmails);
api.post('/emails', createEmail);

app.route('/api', api);
// 结果: /api/emails
```

**路由参数**:
```typescript
app.get('/emails/:id', (c) => {
  const id = c.req.param('id');
  return c.json({ id });
});
```

**查询参数**:
```typescript
app.get('/emails', (c) => {
  const folder = c.req.query('folder'); // ?folder=INBOX
  const limit = c.req.query('limit');
  return c.json({ folder, limit });
});
```

### 2.4 中间件系统

**内置中间件**:
```typescript
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { prettyJSON } from 'hono/pretty-json';

app.use('*', logger());
app.use('*', prettyJSON());
app.use('/api/*', cors());
```

**自定义中间件**:
```typescript
app.use('*', async (c, next) => {
  console.log(`[${c.req.method}] ${c.req.url}`);
  await next();
});
```

### 2.5 错误处理

**全局错误处理**:
```typescript
app.onError((err, c) => {
  console.error(`Error: ${err.message}`);
  return c.json({
    error: err.message,
    status: 500
  }, 500);
});
```

**自定义错误**:
```typescript
class NotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NotFoundError';
  }
}

app.get('/emails/:id', async (c) => {
  const email = await findEmail(c.req.param('id'));
  if (!email) {
    throw new NotFoundError('Email not found');
  }
  return c.json(email);
});
```

### 2.6 验证

**使用 Zod 验证**:
```typescript
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';

const schema = z.object({
  to: z.string().email(),
  subject: z.string().min(1),
  body: z.string()
});

app.post('/emails', zValidator('json', schema), async (c) => {
  const data = c.req.valid('json');
  // data 已验证
  return c.json({ success: true });
});
```

---

## 3. RESTful API 设计最佳实践

### 3.1 资源命名

**规则**:
- 使用复数名词（`/emails` 而非 `/email`）
- 使用小写字母
- 使用连字符分隔（`/email-templates` 而非 `/emailTemplates`）
- 避免动词（`GET /emails` 而非 `/getEmails`）

**示例**:
```
GET    /api/emails          # 获取邮件列表
POST   /api/emails          # 发送邮件
GET    /api/emails/:id      # 获取邮件详情
PUT    /api/emails/:id      # 更新邮件
DELETE /api/emails/:id      # 删除邮件

GET    /api/accounts        # 获取账户列表
POST   /api/accounts        # 添加账户
GET    /api/accounts/:id    # 获取账户详情

POST   /api/sync            # 触发同步
GET    /api/sync/status     # 获取同步状态
```

### 3.2 HTTP 方法

**标准方法**:
- `GET`: 获取资源（幂等、安全）
- `POST`: 创建资源
- `PUT`: 更新资源（幂等）
- `PATCH`: 部分更新资源
- `DELETE`: 删除资源（幂等）

**非标准操作**:
```
POST /api/emails/:id/mark-read    # 标记为已读
POST /api/emails/:id/star         # 标记星标
POST /api/emails/:id/move         # 移动邮件
```

### 3.3 状态码

**常用状态码**:
- `200 OK`: 成功
- `201 Created`: 创建成功
- `204 No Content`: 成功但无返回内容
- `400 Bad Request`: 请求参数错误
- `401 Unauthorized`: 未认证
- `403 Forbidden`: 无权限
- `404 Not Found`: 资源不存在
- `500 Internal Server Error`: 服务器错误

### 3.4 响应格式

**成功响应**:
```json
{
  "data": {
    "id": 123,
    "from": "alice@example.com",
    "subject": "Meeting"
  }
}
```

**列表响应**:
```json
{
  "data": [...],
  "meta": {
    "total": 150,
    "page": 1,
    "limit": 20
  }
}
```

**错误响应**:
```json
{
  "error": {
    "code": "EMAIL_NOT_FOUND",
    "message": "Email with ID 123 not found",
    "details": {}
  }
}
```

### 3.5 分页

**查询参数**:
```
GET /api/emails?limit=20&offset=0
GET /api/emails?page=1&per_page=20
```

**响应头**:
```
Link: <https://api.example.com/emails?page=2>; rel="next",
      <https://api.example.com/emails?page=5>; rel="last"
```

### 3.6 过滤和排序

**过滤**:
```
GET /api/emails?folder=INBOX&unread=true
GET /api/emails?from=alice@example.com
```

**排序**:
```
GET /api/emails?sort=date&order=desc
GET /api/emails?sort=-date  # - 表示降序
```

---

## 4. 本地访问限制方案

### 4.1 监听地址限制

**仅监听 localhost**:
```typescript
serve({
  fetch: app.fetch,
  port: 3000,
  hostname: '127.0.0.1', // 仅监听本地
});
```

**验证**:
```bash
# 可以访问
curl http://127.0.0.1:3000/api/emails

# 无法访问（从其他机器）
curl http://192.168.1.100:3000/api/emails
```

### 4.2 中间件检查

**额外的 IP 检查中间件**:
```typescript
app.use('*', async (c, next) => {
  const clientIP = c.req.header('x-forwarded-for') ||
                   c.req.header('x-real-ip') ||
                   'unknown';

  // 检查是否为本地请求
  if (!['127.0.0.1', 'localhost', '::1'].includes(clientIP)) {
    return c.json({ error: 'Access denied' }, 403);
  }

  await next();
});
```

### 4.3 配置选项

**配置文件**:
```json
{
  "server": {
    "enabled": false,
    "port": 3000,
    "hostname": "127.0.0.1",
    "allow_remote": false
  }
}
```

**CLI 命令**:
```bash
# 启动 Server（仅本地）
mail-cli serve

# 指定端口
mail-cli serve --port 3001

# 允许远程访问（开发模式，需要明确指定）
mail-cli serve --allow-remote
```

---

## 5. API 文档生成

### 5.1 OpenAPI/Swagger

**使用 @hono/zod-openapi**:
```bash
npm install @hono/zod-openapi
```

**定义 API**:
```typescript
import { createRoute, OpenAPIHono } from '@hono/zod-openapi';
import { z } from 'zod';

const app = new OpenAPIHono();

const EmailSchema = z.object({
  id: z.number(),
  from: z.string().email(),
  subject: z.string(),
  date: z.string()
});

const route = createRoute({
  method: 'get',
  path: '/api/emails',
  request: {
    query: z.object({
      folder: z.string().optional(),
      limit: z.number().optional()
    })
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: z.object({
            data: z.array(EmailSchema),
            meta: z.object({
              total: z.number()
            })
          })
        }
      },
      description: 'List of emails'
    }
  }
});

app.openapi(route, (c) => {
  // 实现
});
```

**生成文档**:
```typescript
app.doc('/api/openapi.json', {
  openapi: '3.0.0',
  info: {
    title: 'Open Mail CLI API',
    version: '1.0.0'
  }
});
```

### 5.2 Swagger UI

**集成 Swagger UI**:
```typescript
import { swaggerUI } from '@hono/swagger-ui';

app.get('/api/docs', swaggerUI({ url: '/api/openapi.json' }));
```

**访问文档**:
```
http://127.0.0.1:3000/api/docs
```

---

## 6. API 设计示例

### 6.1 邮件相关 API

**列出邮件**:
```
GET /api/emails?folder=INBOX&limit=20&offset=0

Response:
{
  "data": [
    {
      "id": 123,
      "from": "alice@example.com",
      "to": "me@example.com",
      "subject": "Meeting",
      "date": "2026-02-10T10:00:00Z",
      "is_read": false,
      "folder": "INBOX"
    }
  ],
  "meta": {
    "total": 150,
    "limit": 20,
    "offset": 0
  }
}
```

**获取邮件详情**:
```
GET /api/emails/123

Response:
{
  "data": {
    "id": 123,
    "from": "alice@example.com",
    "to": "me@example.com",
    "subject": "Meeting",
    "body_text": "Let's meet tomorrow...",
    "body_html": "<p>Let's meet tomorrow...</p>",
    "date": "2026-02-10T10:00:00Z",
    "is_read": false,
    "folder": "INBOX",
    "attachments": [
      {
        "filename": "document.pdf",
        "size": 102400,
        "content_type": "application/pdf"
      }
    ]
  }
}
```

**发送邮件**:
```
POST /api/emails

Request:
{
  "to": "bob@example.com",
  "subject": "Hello",
  "body": "Hi Bob!"
}

Response:
{
  "data": {
    "id": 124,
    "status": "sent"
  }
}
```

**标记为已读**:
```
POST /api/emails/123/mark-read

Response:
{
  "data": {
    "id": 123,
    "is_read": true
  }
}
```

### 6.2 账户相关 API

**列出账户**:
```
GET /api/accounts

Response:
{
  "data": [
    {
      "id": 1,
      "email": "me@gmail.com",
      "name": "My Gmail",
      "enabled": true
    }
  ]
}
```

**添加账户**:
```
POST /api/accounts

Request:
{
  "email": "me@outlook.com",
  "name": "My Outlook",
  "imap_host": "outlook.office365.com",
  "imap_port": 993,
  "smtp_host": "smtp.office365.com",
  "smtp_port": 587,
  "username": "me@outlook.com",
  "password": "password123"
}

Response:
{
  "data": {
    "id": 2,
    "email": "me@outlook.com"
  }
}
```

### 6.3 同步相关 API

**触发同步**:
```
POST /api/sync

Request:
{
  "account_id": 1,
  "folder": "INBOX"
}

Response:
{
  "data": {
    "status": "started",
    "job_id": "sync-123"
  }
}
```

**获取同步状态**:
```
GET /api/sync/status?job_id=sync-123

Response:
{
  "data": {
    "job_id": "sync-123",
    "status": "completed",
    "new_emails": 5,
    "completed_at": "2026-02-10T10:05:00Z"
  }
}
```

---

## 7. 实现架构

### 7.1 项目结构

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
│   ├── schemas/
│   │   ├── email.ts        # 邮件相关 Schema
│   │   └── account.ts      # 账户相关 Schema
│   └── controllers/
│       ├── email.ts        # 邮件控制器
│       └── account.ts      # 账户控制器
```

### 7.2 Server 入口

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

// 错误处理
app.onError(errorHandler);

// 健康检查
app.get('/health', (c) => c.json({ status: 'ok' }));

export function startServer(port: number = 3000) {
  serve({
    fetch: app.fetch,
    port,
    hostname: '127.0.0.1',
  });

  console.log(`Server running at http://127.0.0.1:${port}`);
}
```

### 7.3 路由示例

```typescript
// src/api/routes/emails.ts
import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import * as emailController from '../controllers/email';

const app = new Hono();

// 列出邮件
app.get('/', emailController.list);

// 获取邮件详情
app.get('/:id', emailController.get);

// 发送邮件
const sendSchema = z.object({
  to: z.string().email(),
  subject: z.string(),
  body: z.string()
});

app.post('/', zValidator('json', sendSchema), emailController.send);

// 标记为已读
app.post('/:id/mark-read', emailController.markRead);

export default app;
```

### 7.4 控制器示例

```typescript
// src/api/controllers/email.ts
import { Context } from 'hono';
import emailModel from '../../storage/models/email';

export async function list(c: Context) {
  const folder = c.req.query('folder') || 'INBOX';
  const limit = parseInt(c.req.query('limit') || '20');
  const offset = parseInt(c.req.query('offset') || '0');

  const emails = emailModel.findByFolder(folder, { limit, offset });
  const total = emailModel.countByFolder(folder);

  return c.json({
    data: emails,
    meta: { total, limit, offset }
  });
}

export async function get(c: Context) {
  const id = parseInt(c.req.param('id'));
  const email = emailModel.findById(id);

  if (!email) {
    return c.json({ error: 'Email not found' }, 404);
  }

  return c.json({ data: email });
}

export async function send(c: Context) {
  const data = c.req.valid('json');
  // 发送邮件逻辑
  return c.json({ data: { id: 123, status: 'sent' } }, 201);
}

export async function markRead(c: Context) {
  const id = parseInt(c.req.param('id'));
  emailModel.markAsRead(id);
  return c.json({ data: { id, is_read: true } });
}
```

---

## 8. 推荐方案

### 8.1 技术栈

- **框架**: Hono
- **运行时**: Node.js（@hono/node-server）
- **验证**: Zod + @hono/zod-validator
- **文档**: @hono/zod-openapi + Swagger UI
- **测试**: Vitest

### 8.2 实施优先级

**P0 - 核心功能**:
1. HTTP Server 基础框架（Hono）
2. 本地访问限制（hostname: 127.0.0.1）
3. 邮件相关 API（list, get, send）
4. 账户相关 API（list, add）
5. 错误处理中间件

**P1 - 增强功能**:
6. 同步 API
7. API 文档生成（OpenAPI）
8. Swagger UI 集成
9. 请求验证（Zod）
10. 日志中间件

**P2 - 高级功能**:
11. 更多邮件操作 API
12. Webhook 管理 API
13. 性能监控

---

## 9. 参考资料

- Hono 官方文档: https://hono.dev/
- RESTful API 设计指南: https://restfulapi.net/
- OpenAPI 规范: https://swagger.io/specification/
- @hono/zod-openapi: https://github.com/honojs/middleware/tree/main/packages/zod-openapi

---

## 10. 结论

**推荐方案**:
1. **框架**: Hono（快速、轻量、TypeScript 友好）
2. **访问限制**: 仅监听 127.0.0.1（简单有效）
3. **API 设计**: RESTful 风格
4. **文档**: OpenAPI + Swagger UI
5. **验证**: Zod（类型安全）

**核心原则**:
- 简单优先（暂不实现复杂认证）
- 本地优先（仅允许 localhost 访问）
- 类型安全（TypeScript + Zod）
- 文档完善（OpenAPI）
