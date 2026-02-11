# 字段选择机制设计

**版本**: 1.0
**日期**: 2026-02-10
**状态**: 设计中

---

## 1. 设计目标

允许用户选择要输出的字段，减少不必要的数据传输，使输出更简洁。

**设计原则**：
- 简单语法（逗号分隔的字段名）
- 支持通配符（`*` 表示所有字段）
- 支持排除字段（`^field` 语法）
- 保持向后兼容（不指定时显示默认字段）

---

## 2. 核心功能

### 2.1 支持的语法

| 语法 | 示例 | 说明 |
|------|------|------|
| 选择特定字段 | `--fields id,from,subject` | 只输出指定字段 |
| 选择所有字段 | `--fields '*'` | 输出所有可用字段 |
| 排除特定字段 | `--fields '*,^body'` | 输出除 body 外的所有字段 |
| 混合使用 | `--fields '*,^body,^raw'` | 排除多个字段 |

### 2.2 使用场景

**邮件列表（精简视图）**：
```bash
mail-cli list --fields id,from,subject,date
```

**搜索（仅显示发件人和主题）**：
```bash
mail-cli search "meeting" --fields from,subject
```

**API（排除敏感字段）**：
```bash
mail-cli list --format json --fields '*,^body,^raw_headers'
```

**管道操作（仅ID）**：
```bash
mail-cli list --fields id | xargs mail-cli delete
```

### 2.3 默认字段

不同命令的默认字段：

**list/search 命令**：
```
id, from, subject, date, status, is_read
```

**read 命令**（默认显示所有）：
```
*
```

**thread 命令**：
```
id, subject, participants, last_date, message_count
```

---

## 3. 架构设计

### 3.1 字段选择解析器

```typescript
// src/cli/utils/field-selection.ts

export interface FieldSelection {
  include: string[] | '*';  // 包含的字段
  exclude: string[];        // 排除的字段
}

export function parseFieldSelection(input: string): FieldSelection {
  if (!input || input === '*') {
    return { include: '*', exclude: [] };
  }

  const fields = input.split(',').map(f => f.trim());
  const exclude: string[] = [];
  const include: string[] = [];

  for (const field of fields) {
    if (field.startsWith('^')) {
      exclude.push(field.slice(1));
    } else if (field === '*') {
      return { include: '*', exclude };
    } else {
      include.push(field);
    }
  }

  return { include, exclude };
}

export function selectFields<T extends Record<string, any>>(
  data: T,
  selection: FieldSelection
): Partial<T> {
  if (selection.include === '*') {
    // 展开所有字段，然后排除
    const result = { ...data };
    for (const field of selection.exclude) {
      delete result[field];
    }
    return result;
  }

  // 只包含指定字段
  const result: Partial<T> = {};
  for (const field of selection.include) {
    if (field in data) {
      result[field] = data[field];
    }
  }
  return result;
}

export function getAvailableFields<T>(data: T): string[] {
  return Object.keys(data as Record<string, any>);
}
```

### 3.2 Formatter 集成

```typescript
// src/cli/formatters/base.ts
export interface FormatOptions {
  format?: 'markdown' | 'json' | 'ids-only';
  full?: boolean;
  fields?: string;  // 字段选择字符串
}

// src/cli/formatters/markdown.ts
export class MarkdownFormatter implements Formatter {
  formatList(emails: Email[], meta: any, options: FormatOptions): string {
    // 解析字段选择
    const selection = options.fields 
      ? parseFieldSelection(options.fields)
      : this.getDefaultSelection('list');

    // 应用字段选择
    const filteredEmails = emails.map(email => selectFields(email, selection));

    // 生成表格...
  }

  private getDefaultSelection(view: string): FieldSelection {
    switch (view) {
      case 'list':
        return { include: ['id', 'from', 'subject', 'date', 'status'], exclude: [] };
      case 'detail':
        return { include: '*', exclude: [] };
      default:
        return { include: '*', exclude: [] };
    }
  }
}
```

### 3.3 命令集成

```typescript
// src/cli/commands/list.ts
export async function listCommand(options) {
  const { limit, offset } = parsePagination(options);
  const emails = emailModel.findByFolder(folder, { limit, offset });

  // 字段选择
  const fieldSelection = options.fields 
    ? parseFieldSelection(options.fields)
    : { include: ['id', 'from', 'subject', 'date', 'is_read'], exclude: [] };

  // 应用字段选择到数据
  const selectedEmails = emails.map(email => selectFields(email, fieldSelection));

  const formatter = getFormatter(options.format || 'markdown');
  const output = formatter.formatList(selectedEmails, { total, unread, folder }, options);

  console.log(output);
}
```

---

## 4. 命令参数规范

### 4.1 全局参数

所有数据输出命令支持：
```bash
--fields <fields>    # 选择要显示的字段（逗号分隔）
```

### 4.2 示例

```bash
# 默认输出
mail-cli list

# 只显示ID和主题
mail-cli list --fields id,subject

# 显示所有字段
mail-cli list --fields '*'

# 排除邮件正文（节省带宽）
mail-cli list --format json --fields '*,^body'

# 搜索时只显示发件人
mail-cli search "meeting" --fields from,subject

# 读取邮件时排除原始内容
mail-cli read 123 --fields '*,^raw_content,^raw_headers'

# 线程列表
mail-cli thread list --fields id,subject,message_count,last_date
```

### 4.3 JSON 输出时的特殊处理

当使用 `--format json` 时，字段选择会影响返回的 JSON 结构：

```bash
# 完整 JSON
mail-cli list --format json
# 输出包含所有字段

# 精简 JSON
mail-cli list --format json --fields id,from,subject
# 输出只包含 id, from, subject

# 排除敏感字段
mail-cli list --format json --fields '*,^body,^attachments'
```

---

## 5. 实施计划

### 5.1 阶段 1：字段选择工具（1 天）
- [x] 实现 `parseFieldSelection` 函数
- [x] 实现 `selectFields` 函数
- [x] 实现 `getAvailableFields` 函数
- [x] 单元测试

### 5.2 阶段 2：Formatter 更新（1 天）
- [x] 更新 MarkdownFormatter（支持字段选择）
- [x] 更新 JSONFormatter（支持字段选择）
- [x] 处理默认字段逻辑
- [ ] 测试

### 5.3 阶段 3：命令集成（1 天）
- [x] 更新 list 命令
- [x] 更新 search 命令
- [x] 更新 read 命令
- [x] 更新 thread 命令
- [ ] 其他支持 --fields 的命令

---

## 6. 边界情况处理

### 6.1 无效字段名

```bash
mail-cli list --fields id,invalid_field

# 处理：忽略无效字段，发出警告
# Warning: Unknown field 'invalid_field' ignored
```

### 6.2 嵌套字段（未来扩展）

```typescript
// 未来可能支持嵌套字段
export function selectNestedFields<T>(
  data: T,
  selection: string[]
): Partial<T> {
  const result: any = {};
  for (const field of selection) {
    if (field.includes('.')) {
      // 处理嵌套字段，如 'from.name'
      const parts = field.split('.');
      // ... 递归获取嵌套值
    }
  }
  return result;
}
```

### 6.3 空选择

```bash
mail-cli list --fields ""

# 处理：显示默认字段，等同于不提供 --fields
```

---

## 7. 扩展性考虑

### 7.1 未来可添加的功能

**字段别名**：
```bash
mail-cli list --fields "sender=from,title=subject"
# 输出字段使用别名
```

**字段格式化**：
```bash
mail-cli list --fields "date:short,from:email-only"
# 使用特定的字段格式化器
```

**条件字段**：
```bash
mail-cli list --fields "if(unread,subject,^subject)"
# 根据条件选择字段
```

**保存字段模板**：
```bash
mail-cli config set fields.myview "id,from,subject"
mail-cli list --fields @myview
```

### 7.2 扩展方式

当前设计已经预留了扩展空间：
- `parseFieldSelection` 可以支持更复杂的语法
- `selectFields` 可以支持嵌套对象
- Formatter 可以添加字段格式化器

---

## 8. API 集成

HTTP API 也支持字段选择：

```bash
# GET 请求使用 query 参数
GET /api/emails?fields=id,from,subject

# 排除字段
GET /api/emails?fields=*,^body
```

控制器实现：
```typescript
// src/api/controllers/email.ts
export async function list(c: Context) {
  const folder = c.req.query('folder') || 'INBOX';
  const fields = c.req.query('fields');

  const emails = emailModel.findByFolder(folder);

  // 应用字段选择
  if (fields) {
    const selection = parseFieldSelection(fields);
    emails = emails.map(email => selectFields(email, selection));
  }

  return c.json({ data: emails });
}
```

---

## 9. 测试策略

### 9.1 单元测试

```typescript
describe('parseFieldSelection', () => {
  it('should parse simple field list', () => {
    const result = parseFieldSelection('id,from,subject');
    expect(result).toEqual({
      include: ['id', 'from', 'subject'],
      exclude: []
    });
  });

  it('should handle exclude fields', () => {
    const result = parseFieldSelection('*, ^body');
    expect(result).toEqual({
      include: '*',
      exclude: ['body']
    });
  });

  it('should handle whitespace', () => {
    const result = parseFieldSelection('id, from, subject');
    expect(result.include).toEqual(['id', 'from', 'subject']);
  });
});

describe('selectFields', () => {
  const data = {
    id: 1,
    from: 'test@example.com',
    subject: 'Test',
    body: 'Content'
  };

  it('should select specific fields', () => {
    const result = selectFields(data, { include: ['id', 'from'], exclude: [] });
    expect(result).toEqual({ id: 1, from: 'test@example.com' });
  });

  it('should exclude fields when using wildcard', () => {
    const result = selectFields(data, { include: '*', exclude: ['body'] });
    expect(result).toEqual({ id: 1, from: 'test@example.com', subject: 'Test' });
  });
});
```

### 9.2 集成测试

```bash
# 测试字段选择
output=$(mail-cli list --fields id,subject)
echo "$output" | grep "| ID | Subject |"
echo "$output" | grep -v "| From |"

# 测试 JSON 字段选择
output=$(mail-cli list --format json --fields id,subject)
echo "$output" | jq '.data[0] | keys' | grep -E "(id|subject)"

# 测试排除字段
output=$(mail-cli list --format json --fields '*,^body')
echo "$output" | jq '.data[0] | has("body")' | grep "false"
```

---

## 10. 文档更新

需要更新的文档：
- [ ] README.md：添加 --fields 参数说明
- [ ] CLI 使用指南：添加字段选择示例
- [ ] API 文档：添加字段选择支持

---

## 11. 总结

**核心设计**：
- 简单语法：逗号分隔的字段列表
- 通配符支持：`*` 表示所有字段
- 排除语法：`^field` 排除特定字段
- 后向兼容：不提供 `--fields` 时使用默认字段

**优势**：
- 灵活（可以选择任意字段组合）
- 简洁（减少不必要的数据）
- Agent 友好（可以获取精简数据）
- 性能优化（减少数据处理）

**工作量估算**：3 天

