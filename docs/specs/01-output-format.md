# 输出格式优化设计

**版本**: 1.0
**日期**: 2026-02-10
**状态**: 设计中

---

## 1. 设计目标

为 Agent 提供友好的输出格式，支持：
- Markdown 表格（默认，Agent 友好）
- JSON 格式（程序化处理）
- 简洁模式（管道操作）

**设计原则**：
- 简单优先，避免过度设计
- 保持扩展性，未来可添加更多格式
- 统一接口，所有命令使用相同的格式化逻辑

---

## 2. 核心功能

### 2.1 支持的格式

| 格式 | 参数 | 用途 | 优先级 |
|------|------|------|--------|
| Markdown 表格 | 默认 | Agent 友好，人类可读 | P0 |
| JSON | `--format json` | 程序化处理 | P0 |
| IDs Only | `--ids-only` | 管道操作 | P0 |

**不实现**（暂缓）：
- HTML 格式（边角料）
- 字段选择 `--fields`（可以后续添加）
- YAML 格式（不需要）

### 2.2 Markdown 表格格式

**示例输出**：
```markdown
## Inbox (3 unread, 150 total)

| ID | From              | Subject           | Date       | Status |
|----|-------------------|-------------------|------------|--------|
| 1  | alice@example.com | Meeting reminder  | 2026-02-09 | Unread |
| 2  | bob@example.com   | Project update    | 2026-02-08 | Read   |
```

**规范**：
- 标题行：显示文件夹名称、未读数、总数
- 表头：清晰的列名
- 数据行：对齐、截断长文本
- 状态：使用文本（Unread/Read）而非布尔值

### 2.3 JSON 格式

**示例输出**：
```json
{
  "data": [
    {
      "id": 1,
      "from": "alice@example.com",
      "subject": "Meeting reminder",
      "date": "2026-02-09T10:00:00Z",
      "is_read": false
    }
  ],
  "meta": {
    "total": 150,
    "unread": 3,
    "folder": "INBOX"
  }
}
```

**规范**：
- 顶层结构：`data` + `meta`
- `data`: 数组或对象
- `meta`: 元信息（总数、分页等）
- 日期格式：ISO 8601

### 2.4 简洁模式（IDs Only）

**示例输出**：
```
1 2 3 5 8
```

**规范**：
- 仅输出 ID，空格分隔
- 适合管道操作：`mail-cli list --ids-only | xargs mail-cli delete`

---

## 3. 架构设计

### 3.1 Formatter 抽象层

```typescript
// src/cli/formatters/base.ts
export interface FormatOptions {
  format?: 'markdown' | 'json' | 'ids-only';
  full?: boolean;
  // 未来扩展：fields, pretty, etc.
}

export interface Formatter {
  formatList(data: any[], meta: any, options: FormatOptions): string;
  formatDetail(data: any, options: FormatOptions): string;
}
```

### 3.2 具体实现

```typescript
// src/cli/formatters/markdown.ts
export class MarkdownFormatter implements Formatter {
  formatList(emails: Email[], meta: any, options: FormatOptions): string {
    const lines = [];

    // 标题
    lines.push(`## ${meta.folder} (${meta.unread} unread, ${meta.total} total)`);
    lines.push('');

    // 表格
    lines.push('| ID | From | Subject | Date | Status |');
    lines.push('|----|------|---------|------|--------|');

    for (const email of emails) {
      lines.push(`| ${email.id} | ${truncate(email.from, 20)} | ${truncate(email.subject, 30)} | ${formatDate(email.date)} | ${email.is_read ? 'Read' : 'Unread'} |`);
    }

    return lines.join('\n');
  }

  formatDetail(email: Email, options: FormatOptions): string {
    // 详情格式
  }
}

// src/cli/formatters/json.ts
export class JSONFormatter implements Formatter {
  formatList(emails: Email[], meta: any, options: FormatOptions): string {
    return JSON.stringify({ data: emails, meta }, null, 2);
  }

  formatDetail(email: Email, options: FormatOptions): string {
    return JSON.stringify({ data: email }, null, 2);
  }
}

// src/cli/formatters/ids-only.ts
export class IDsOnlyFormatter implements Formatter {
  formatList(emails: Email[], meta: any, options: FormatOptions): string {
    return emails.map(e => e.id).join(' ');
  }

  formatDetail(email: Email, options: FormatOptions): string {
    return String(email.id);
  }
}
```

### 3.3 Formatter 工厂

```typescript
// src/cli/formatters/index.ts
export function getFormatter(format: string): Formatter {
  switch (format) {
    case 'json':
      return new JSONFormatter();
    case 'ids-only':
      return new IDsOnlyFormatter();
    case 'markdown':
    default:
      return new MarkdownFormatter();
  }
}
```

### 3.4 命令集成

```typescript
// src/cli/commands/list.ts
import { getFormatter } from '../formatters';

export async function listCommand(options) {
  // 获取数据
  const emails = emailModel.findByFolder(folder, { limit, offset });
  const total = emailModel.countByFolder(folder);
  const unread = emailModel.countUnread(folder);

  // 格式化输出
  const formatter = getFormatter(options.format || 'markdown');
  const output = formatter.formatList(emails, { total, unread, folder }, options);

  console.log(output);
}
```

---

## 4. 命令参数规范

### 4.1 全局参数

所有命令支持：
```bash
--format <format>    # 输出格式：markdown, json, ids-only（默认：markdown）
--ids-only           # 简洁模式（等同于 --format ids-only）
```

### 4.2 示例

```bash
# 默认 Markdown 表格
mail-cli list

# JSON 格式
mail-cli list --format json

# 简洁模式
mail-cli list --ids-only

# 读取邮件详情（JSON）
mail-cli read 123 --format json
```

---

## 5. 实施计划

### 5.1 阶段 1：基础架构（1-2 天）
- [ ] 创建 Formatter 接口
- [ ] 实现 MarkdownFormatter
- [ ] 实现 JSONFormatter
- [ ] 实现 IDsOnlyFormatter
- [ ] 实现 Formatter 工厂

### 5.2 阶段 2：命令集成（2-3 天）
- [ ] 更新 list 命令
- [ ] 更新 read 命令
- [ ] 更新 search 命令
- [ ] 更新其他主要命令

### 5.3 阶段 3：测试（1 天）
- [ ] 单元测试：各 Formatter
- [ ] 集成测试：命令输出
- [ ] 验证 Agent 解析准确性

---

## 6. 扩展性考虑

### 6.1 未来可添加的格式
- HTML 格式（用于邮件正文）
- CSV 格式（用于数据导出）
- 自定义模板

### 6.2 未来可添加的选项
- `--fields`: 字段选择
- `--pretty`: 美化输出
- `--no-header`: 不显示表头

### 6.3 扩展方式

添加新格式只需：
1. 实现 `Formatter` 接口
2. 在工厂函数中注册
3. 更新命令参数文档

---

## 7. 注意事项

### 7.1 文本截断
- 长文本需要截断（避免表格错位）
- 截断位置：From 20 字符，Subject 30 字符
- 截断标记：`...`

### 7.2 特殊字符处理
- Markdown 表格中的 `|` 需要转义为 `\|`
- JSON 中的特殊字符自动转义

### 7.3 性能考虑
- Formatter 应该是轻量级的
- 避免在 Formatter 中进行数据库查询
- 大量数据时考虑流式输出（未来）

---

## 8. 测试策略

### 8.1 单元测试
```typescript
describe('MarkdownFormatter', () => {
  it('should format email list as markdown table', () => {
    const formatter = new MarkdownFormatter();
    const emails = [{ id: 1, from: 'test@example.com', subject: 'Test', date: new Date(), is_read: false }];
    const output = formatter.formatList(emails, { total: 1, unread: 1, folder: 'INBOX' }, {});

    expect(output).toContain('| ID | From | Subject |');
    expect(output).toContain('| 1 | test@example.com | Test |');
  });
});
```

### 8.2 集成测试
```bash
# 测试 Markdown 输出
output=$(mail-cli list)
echo "$output" | grep "| ID | From | Subject |"

# 测试 JSON 输出
output=$(mail-cli list --format json)
echo "$output" | jq '.data[0].id'

# 测试简洁模式
output=$(mail-cli list --ids-only)
echo "$output" | grep -E '^[0-9 ]+$'
```

---

## 9. 文档更新

需要更新的文档：
- [ ] README.md：添加输出格式说明
- [ ] CLI 使用指南：添加 --format 参数说明
- [ ] Agent 集成文档：添加格式解析示例

---

## 10. 总结

**核心设计**：
- 三种格式：Markdown（默认）、JSON、IDs Only
- 统一接口：Formatter 抽象层
- 简单实现：避免过度设计

**优势**：
- Agent 友好（Markdown 表格）
- 程序化处理（JSON）
- 管道操作（IDs Only）
- 易于扩展（新格式只需实现接口）

**工作量估算**：4-6 天
