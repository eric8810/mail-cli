# 内容长度管理设计

**版本**: 1.0
**日期**: 2026-02-10
**状态**: 设计中

---

## 1. 设计目标

避免输出超出 LLM 上下文窗口，提供合理的默认限制和分页机制。

**设计原则**：
- 默认限制合理（不需要用户手动指定）
- 明确标注范围（让 Agent 知道有更多数据）
- 统一分页参数（所有命令使用相同参数）
- 保持简单（不引入复杂的截断策略）

---

## 2. 核心功能

### 2.1 默认限制策略

| 内容类型 | 默认限制 | 理由 |
|---------|---------|------|
| 邮件列表 | 20 条 | 适合 Agent 快速浏览 |
| 邮件正文 | 完整显示 | 邮件正文通常不会太长 |
| 搜索结果 | 20 条 | 与列表一致 |

**简化决策**：
- 不实现邮件正文截断（大多数邮件正文不会超出上下文）
- 如果未来需要，可以添加 `--truncate` 参数

### 2.2 分页参数

**统一参数**：
```bash
--limit <number>     # 每页数量（默认：20）
--offset <number>    # 偏移量（默认：0）
--page <number>      # 页码（自动计算 offset）
```

**优先级**：
- 如果指定 `--page`，自动计算 `offset = (page - 1) * limit`
- 如果同时指定 `--page` 和 `--offset`，`--offset` 优先

### 2.3 范围标注

**Markdown 格式**：
```markdown
## Inbox (3 unread, 150 total) - Showing 1-20
```

**JSON 格式**：
```json
{
  "data": [...],
  "meta": {
    "total": 150,
    "limit": 20,
    "offset": 0,
    "showing": "1-20"
  }
}
```

---

## 3. 架构设计

### 3.1 分页参数解析

```typescript
// src/cli/utils/pagination.ts
export interface PaginationOptions {
  limit?: number;
  offset?: number;
  page?: number;
}

export interface PaginationResult {
  limit: number;
  offset: number;
  page: number;
}

export function parsePagination(options: PaginationOptions): PaginationResult {
  const limit = options.limit || 20; // 默认 20 条

  let offset = 0;
  let page = 1;

  if (options.offset !== undefined) {
    // 优先使用 offset
    offset = options.offset;
    page = Math.floor(offset / limit) + 1;
  } else if (options.page !== undefined) {
    // 使用 page 计算 offset
    page = options.page;
    offset = (page - 1) * limit;
  }

  return { limit, offset, page };
}
```

### 3.2 范围计算

```typescript
// src/cli/utils/pagination.ts
export interface RangeInfo {
  start: number;
  end: number;
  total: number;
  showing: string;
}

export function calculateRange(offset: number, limit: number, total: number): RangeInfo {
  const start = total > 0 ? offset + 1 : 0;
  const end = Math.min(offset + limit, total);
  const showing = total > 0 ? `${start}-${end}` : '0';

  return { start, end, total, showing };
}
```

### 3.3 命令集成

```typescript
// src/cli/commands/list.ts
import { parsePagination, calculateRange } from '../utils/pagination';

export async function listCommand(options) {
  // 解析分页参数
  const { limit, offset, page } = parsePagination(options);

  // 获取数据
  const emails = emailModel.findByFolder(folder, { limit, offset });
  const total = emailModel.countByFolder(folder);
  const unread = emailModel.countUnread(folder);

  // 计算范围
  const range = calculateRange(offset, limit, total);

  // 格式化输出
  const formatter = getFormatter(options.format || 'markdown');
  const output = formatter.formatList(emails, {
    total,
    unread,
    folder,
    limit,
    offset,
    page,
    showing: range.showing
  }, options);

  console.log(output);
}
```

### 3.4 Formatter 更新

```typescript
// src/cli/formatters/markdown.ts
export class MarkdownFormatter implements Formatter {
  formatList(emails: Email[], meta: any, options: FormatOptions): string {
    const lines = [];

    // 标题（包含范围）
    lines.push(`## ${meta.folder} (${meta.unread} unread, ${meta.total} total) - Showing ${meta.showing}`);
    lines.push('');

    // 表格
    // ...

    return lines.join('\n');
  }
}

// src/cli/formatters/json.ts
export class JSONFormatter implements Formatter {
  formatList(emails: Email[], meta: any, options: FormatOptions): string {
    return JSON.stringify({
      data: emails,
      meta: {
        total: meta.total,
        unread: meta.unread,
        folder: meta.folder,
        limit: meta.limit,
        offset: meta.offset,
        page: meta.page,
        showing: meta.showing
      }
    }, null, 2);
  }
}
```

---

## 4. 命令参数规范

### 4.1 分页参数

所有列表命令支持：
```bash
--limit <number>     # 每页数量（默认：20）
--offset <number>    # 偏移量（默认：0）
--page <number>      # 页码（默认：1）
```

### 4.2 示例

```bash
# 默认：前 20 条
mail-cli list

# 指定每页 50 条
mail-cli list --limit 50

# 第 2 页
mail-cli list --page 2

# 使用 offset
mail-cli list --limit 20 --offset 40

# 搜索结果分页
mail-cli search "meeting" --page 2
```

---

## 5. 实施计划

### 5.1 阶段 1：分页工具（1 天）
- [ ] 实现 `parsePagination` 函数
- [ ] 实现 `calculateRange` 函数
- [ ] 单元测试

### 5.2 阶段 2：命令集成（1-2 天）
- [ ] 更新 list 命令
- [ ] 更新 search 命令
- [ ] 更新其他列表命令（thread list, tag filter 等）

### 5.3 阶段 3：Formatter 更新（1 天）
- [ ] 更新 MarkdownFormatter（添加范围标注）
- [ ] 更新 JSONFormatter（添加 meta 信息）
- [ ] 测试

---

## 6. 边界情况处理

### 6.1 空列表
```markdown
## Inbox (0 unread, 0 total) - Showing 0

No emails found.
```

### 6.2 超出范围
```bash
# 总共 50 条，请求第 10 页（offset 180）
mail-cli list --page 10

# 输出：空列表，但显示总数
## Inbox (3 unread, 50 total) - Showing 0

No emails in this range. Total: 50 emails.
```

### 6.3 负数参数
```bash
# 负数 limit：使用默认值 20
mail-cli list --limit -10

# 负数 offset：使用 0
mail-cli list --offset -5

# 负数 page：使用 1
mail-cli list --page -1
```

**处理逻辑**：
```typescript
export function parsePagination(options: PaginationOptions): PaginationResult {
  const limit = Math.max(options.limit || 20, 1); // 最小 1
  let offset = Math.max(options.offset || 0, 0); // 最小 0
  let page = Math.max(options.page || 1, 1); // 最小 1

  if (options.offset !== undefined) {
    offset = Math.max(options.offset, 0);
    page = Math.floor(offset / limit) + 1;
  } else if (options.page !== undefined) {
    page = Math.max(options.page, 1);
    offset = (page - 1) * limit;
  }

  return { limit, offset, page };
}
```

---

## 7. 扩展性考虑

### 7.1 未来可添加的功能

**邮件正文截断**（如果需要）：
```bash
mail-cli read 123 --truncate 500  # 截断到 500 字符
```

**游标分页**（如果需要）：
```bash
mail-cli list --cursor abc123  # 使用游标而非 offset
```

**流式输出**（如果需要）：
```bash
mail-cli list --stream  # 流式输出，不等待全部加载
```

### 7.2 扩展方式

当前设计已经预留了扩展空间：
- `PaginationOptions` 可以添加新字段
- `calculateRange` 可以支持不同的范围计算方式
- Formatter 可以根据 options 调整输出

---

## 8. 性能考虑

### 8.1 数据库查询优化

```typescript
// 使用 LIMIT 和 OFFSET
const emails = db.prepare(`
  SELECT * FROM emails
  WHERE folder = ?
  ORDER BY date DESC
  LIMIT ? OFFSET ?
`).all(folder, limit, offset);

// 总数查询（可以缓存）
const total = db.prepare(`
  SELECT COUNT(*) as count FROM emails
  WHERE folder = ?
`).get(folder).count;
```

### 8.2 缓存策略（未来）

如果性能成为问题，可以考虑：
- 缓存总数（避免每次 COUNT）
- 缓存最近的查询结果
- 使用索引优化查询

---

## 9. 测试策略

### 9.1 单元测试

```typescript
describe('parsePagination', () => {
  it('should use default values', () => {
    const result = parsePagination({});
    expect(result).toEqual({ limit: 20, offset: 0, page: 1 });
  });

  it('should calculate offset from page', () => {
    const result = parsePagination({ page: 3 });
    expect(result).toEqual({ limit: 20, offset: 40, page: 3 });
  });

  it('should handle negative values', () => {
    const result = parsePagination({ limit: -10, offset: -5, page: -1 });
    expect(result.limit).toBeGreaterThan(0);
    expect(result.offset).toBeGreaterThanOrEqual(0);
    expect(result.page).toBeGreaterThan(0);
  });
});

describe('calculateRange', () => {
  it('should calculate range correctly', () => {
    const range = calculateRange(0, 20, 150);
    expect(range).toEqual({ start: 1, end: 20, total: 150, showing: '1-20' });
  });

  it('should handle empty list', () => {
    const range = calculateRange(0, 20, 0);
    expect(range).toEqual({ start: 0, end: 0, total: 0, showing: '0' });
  });
});
```

### 9.2 集成测试

```bash
# 测试默认分页
output=$(mail-cli list)
echo "$output" | grep "Showing 1-20"

# 测试自定义 limit
output=$(mail-cli list --limit 50)
echo "$output" | grep "Showing 1-50"

# 测试分页
output=$(mail-cli list --page 2)
echo "$output" | grep "Showing 21-40"
```

---

## 10. 文档更新

需要更新的文档：
- [ ] README.md：添加分页参数说明
- [ ] CLI 使用指南：添加分页示例
- [ ] Agent 集成文档：说明如何处理分页

---

## 11. 总结

**核心设计**：
- 默认限制：20 条
- 统一参数：--limit, --offset, --page
- 明确标注：显示范围和总数
- 简单实现：不引入复杂截断

**优势**：
- Agent 友好（合理的默认值）
- 易于使用（统一的参数）
- 性能优化（LIMIT/OFFSET 查询）
- 易于扩展（预留扩展空间）

**工作量估算**：3-4 天
