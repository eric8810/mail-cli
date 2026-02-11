# 错误处理标准化设计

**版本**: 1.0
**日期**: 2026-02-10
**状态**: 设计中

---

## 1. 设计目标

统一错误码和错误消息格式，便于 Agent 处理错误。

**设计原则**：
- 标准化退出码（遵循 Unix 惯例）
- 统一错误格式（文本和 JSON）
- 清晰的错误分类
- 保持简单（不过度设计）

---

## 2. 退出码规范

### 2.1 标准退出码

| 退出码 | 含义 | 示例 |
|-------|------|------|
| 0 | 成功 | 命令执行成功 |
| 1 | 一般错误 | 邮件不存在、操作失败 |
| 2 | 参数错误 | 缺少必需参数、参数格式错误 |
| 3 | 网络错误 | IMAP/SMTP 连接失败 |
| 4 | 认证错误 | 账户密码错误 |
| 5 | 权限错误 | 无权限访问文件 |

**简化决策**：
- 只定义 6 个退出码（0-5）
- 不引入更细粒度的错误码（避免过度设计）
- 未来如需扩展，可以添加新的退出码

### 2.2 退出码常量

```typescript
// src/utils/exit-codes.ts
export enum ExitCode {
  SUCCESS = 0,
  GENERAL_ERROR = 1,
  INVALID_ARGUMENT = 2,
  NETWORK_ERROR = 3,
  AUTH_ERROR = 4,
  PERMISSION_ERROR = 5
}
```

---

## 3. 错误格式

### 3.1 文本格式（默认）

```
Error: Email with ID 123 not found
```

**规范**：
- 前缀：`Error:` 或 `Warning:`
- 消息：清晰描述错误原因
- 颜色：红色（使用 chalk）

### 3.2 JSON 格式（--format json）

```json
{
  "error": {
    "code": "EMAIL_NOT_FOUND",
    "message": "Email with ID 123 not found",
    "exit_code": 1
  }
}
```

**规范**：
- `code`: 错误代码（大写下划线）
- `message`: 错误消息（人类可读）
- `exit_code`: 退出码

---

## 4. 错误分类

### 4.1 错误代码

| 错误代码 | 退出码 | 含义 |
|---------|-------|------|
| `EMAIL_NOT_FOUND` | 1 | 邮件不存在 |
| `ACCOUNT_NOT_FOUND` | 1 | 账户不存在 |
| `FOLDER_NOT_FOUND` | 1 | 文件夹不存在 |
| `INVALID_ARGUMENT` | 2 | 参数错误 |
| `MISSING_ARGUMENT` | 2 | 缺少参数 |
| `IMAP_CONNECTION_ERROR` | 3 | IMAP 连接失败 |
| `SMTP_CONNECTION_ERROR` | 3 | SMTP 连接失败 |
| `AUTH_FAILED` | 4 | 认证失败 |
| `PERMISSION_DENIED` | 5 | 权限不足 |
| `UNKNOWN_ERROR` | 1 | 未知错误 |

---

## 5. 架构设计

### 5.1 错误类

```typescript
// src/utils/errors.ts
export class CLIError extends Error {
  constructor(
    public code: string,
    public message: string,
    public exitCode: ExitCode = ExitCode.GENERAL_ERROR
  ) {
    super(message);
    this.name = 'CLIError';
  }

  toJSON() {
    return {
      error: {
        code: this.code,
        message: this.message,
        exit_code: this.exitCode
      }
    };
  }
}

// 便捷工厂函数
export function emailNotFound(id: number): CLIError {
  return new CLIError(
    'EMAIL_NOT_FOUND',
    `Email with ID ${id} not found`,
    ExitCode.GENERAL_ERROR
  );
}

export function accountNotFound(id: number): CLIError {
  return new CLIError(
    'ACCOUNT_NOT_FOUND',
    `Account with ID ${id} not found`,
    ExitCode.GENERAL_ERROR
  );
}

export function invalidArgument(message: string): CLIError {
  return new CLIError(
    'INVALID_ARGUMENT',
    message,
    ExitCode.INVALID_ARGUMENT
  );
}

export function networkError(message: string): CLIError {
  return new CLIError(
    'NETWORK_ERROR',
    message,
    ExitCode.NETWORK_ERROR
  );
}

export function authError(message: string): CLIError {
  return new CLIError(
    'AUTH_FAILED',
    message,
    ExitCode.AUTH_ERROR
  );
}
```

### 5.2 全局错误处理

```typescript
// src/cli/index.ts
import chalk from 'chalk';
import { CLIError } from '../utils/errors';

function handleError(error: Error, format: string = 'text') {
  if (error instanceof CLIError) {
    if (format === 'json') {
      console.error(JSON.stringify(error.toJSON(), null, 2));
    } else {
      console.error(chalk.red(`Error: ${error.message}`));
    }
    process.exit(error.exitCode);
  } else {
    // 未知错误
    if (format === 'json') {
      console.error(JSON.stringify({
        error: {
          code: 'UNKNOWN_ERROR',
          message: error.message,
          exit_code: ExitCode.GENERAL_ERROR
        }
      }, null, 2));
    } else {
      console.error(chalk.red(`Error: ${error.message}`));
    }
    process.exit(ExitCode.GENERAL_ERROR);
  }
}

// 在命令中使用
program
  .command('read <id>')
  .action(async (id, options) => {
    try {
      await readCommand(id, options);
    } catch (error) {
      handleError(error, options.format);
    }
  });
```

### 5.3 命令中使用

```typescript
// src/cli/commands/read.ts
import { emailNotFound } from '../../utils/errors';

export async function readCommand(id: number, options) {
  const email = emailModel.findById(id);

  if (!email) {
    throw emailNotFound(id);
  }

  // 正常处理
  const formatter = getFormatter(options.format);
  console.log(formatter.formatDetail(email, options));
}
```

---

## 6. 命令参数规范

### 6.1 全局参数

所有命令支持：
```bash
--format <format>    # 输出格式（影响错误格式）
```

### 6.2 示例

```bash
# 文本格式错误
$ mail-cli read 999
Error: Email with ID 999 not found

$ echo $?
1

# JSON 格式错误
$ mail-cli read 999 --format json
{
  "error": {
    "code": "EMAIL_NOT_FOUND",
    "message": "Email with ID 999 not found",
    "exit_code": 1
  }
}

$ echo $?
1
```

---

## 7. 实施计划

### 7.1 阶段 1：基础架构（1 天）
- [ ] 定义 ExitCode 枚举
- [ ] 实现 CLIError 类
- [ ] 实现错误工厂函数
- [ ] 实现全局错误处理

### 7.2 阶段 2：命令重构（2-3 天）
- [ ] 重构 read 命令
- [ ] 重构 list 命令
- [ ] 重构 send 命令
- [ ] 重构其他命令

### 7.3 阶段 3：测试（1 天）
- [ ] 单元测试：错误类
- [ ] 集成测试：各种错误场景
- [ ] 验证退出码

---

## 8. 边界情况处理

### 8.1 嵌套错误

```typescript
// IMAP 错误包装
try {
  await imapClient.connect();
} catch (error) {
  throw networkError(`IMAP connection failed: ${error.message}`);
}
```

### 8.2 多个错误

```typescript
// 批量操作时的错误
const errors = [];
for (const id of ids) {
  try {
    await deleteEmail(id);
  } catch (error) {
    errors.push({ id, error: error.message });
  }
}

if (errors.length > 0) {
  throw new CLIError(
    'BATCH_ERROR',
    `Failed to delete ${errors.length} emails`,
    ExitCode.GENERAL_ERROR
  );
}
```

### 8.3 警告 vs 错误

```typescript
// 警告：不退出
console.warn(chalk.yellow(`Warning: Email ${id} is already read`));

// 错误：退出
throw emailNotFound(id);
```

---

## 9. 扩展性考虑

### 9.1 未来可添加的功能

**详细错误信息**：
```json
{
  "error": {
    "code": "EMAIL_NOT_FOUND",
    "message": "Email with ID 123 not found",
    "exit_code": 1,
    "details": {
      "email_id": 123,
      "folder": "INBOX"
    }
  }
}
```

**错误堆栈**（调试模式）：
```bash
mail-cli read 999 --debug
Error: Email with ID 999 not found
  at readCommand (src/cli/commands/read.ts:10)
  at ...
```

**国际化**：
```typescript
export function emailNotFound(id: number, locale: string = 'en'): CLIError {
  const messages = {
    en: `Email with ID ${id} not found`,
    zh: `找不到 ID 为 ${id} 的邮件`
  };
  return new CLIError('EMAIL_NOT_FOUND', messages[locale], ExitCode.GENERAL_ERROR);
}
```

### 9.2 扩展方式

当前设计已经预留了扩展空间：
- `CLIError` 可以添加 `details` 字段
- 可以添加新的退出码
- 可以添加新的错误工厂函数

---

## 10. 测试策略

### 10.1 单元测试

```typescript
describe('CLIError', () => {
  it('should create error with correct properties', () => {
    const error = emailNotFound(123);
    expect(error.code).toBe('EMAIL_NOT_FOUND');
    expect(error.message).toContain('123');
    expect(error.exitCode).toBe(ExitCode.GENERAL_ERROR);
  });

  it('should serialize to JSON', () => {
    const error = emailNotFound(123);
    const json = error.toJSON();
    expect(json.error.code).toBe('EMAIL_NOT_FOUND');
    expect(json.error.exit_code).toBe(1);
  });
});
```

### 10.2 集成测试

```bash
# 测试退出码
mail-cli read 999
exit_code=$?
[ $exit_code -eq 1 ] || exit 1

# 测试 JSON 错误格式
output=$(mail-cli read 999 --format json 2>&1)
echo "$output" | jq '.error.code' | grep "EMAIL_NOT_FOUND"

# 测试参数错误
mail-cli send
exit_code=$?
[ $exit_code -eq 2 ] || exit 1
```

---

## 11. 文档更新

需要更新的文档：
- [ ] README.md：添加退出码说明
- [ ] CLI 使用指南：添加错误处理示例
- [ ] Agent 集成文档：说明如何处理错误

---

## 12. 总结

**核心设计**：
- 6 个标准退出码（0-5）
- 统一错误类（CLIError）
- 文本和 JSON 两种格式
- 清晰的错误分类

**优势**：
- Agent 友好（标准退出码）
- 易于调试（清晰的错误消息）
- 易于扩展（预留扩展空间）
- 简单实现（不过度设计）

**工作量估算**：4-5 天
