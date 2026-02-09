# 邮件签名功能使用文档

## 功能概述

邮件签名功能允许用户创建、管理和自动插入邮件签名。支持以下特性：

- 创建多个签名
- 支持纯文本和HTML格式
- 设置默认签名
- 按账户关联签名
- 模板变量支持
- 自动插入到发送的邮件中

## CLI命令

### 1. 创建签名

```bash
mail-cli signature create --name "工作签名" --text "此致敬礼，\n张三" --default
```

**选项**：
- `--name <name>`: 签名名称（必需）
- `--text <text>`: 纯文本签名内容
- `--html <html>`: HTML签名内容
- `--default`: 设置为默认签名
- `--account <email>`: 关联到特定账户

**示例**：

```bash
# 创建简单的文本签名
mail-cli signature create --name "个人签名" --text "Best regards,\nJohn"

# 创建HTML签名
mail-cli signature create --name "公司签名" --html "<p>Best regards,<br><b>John Doe</b><br>CEO</p>" --default

# 为特定账户创建签名
mail-cli signature create --name "工作签名" --text "此致敬礼，\n张三" --account work@company.com
```

### 2. 列出所有签名

```bash
mail-cli signature list
```

**选项**：
- `--account <email>`: 只显示特定账户的签名

**输出示例**：
```
Signatures (2):

#1 Work Signature [DEFAULT] (user@example.com)
  Text: Best regards,...
  HTML: Yes
  Created: 2026-02-08 10:00:00

#2 Personal Signature
  Text: Cheers,...
  Created: 2026-02-08 10:05:00
```

### 3. 编辑签名

```bash
mail-cli signature edit --id 1 --name "新名称" --text "新内容"
```

**选项**：
- `--id <id>`: 签名ID（必需）
- `--name <name>`: 新的签名名称
- `--text <text>`: 新的文本内容
- `--html <html>`: 新的HTML内容
- `--default`: 设置为默认签名
- `--account <email>`: 更改关联账户

**示例**：

```bash
# 更新签名内容
mail-cli signature edit --id 1 --text "Updated signature content"

# 更改签名名称
mail-cli signature edit --id 2 --name "新的签名名称"
```

### 4. 删除签名

```bash
mail-cli signature delete --id 1
```

**选项**：
- `--id <id>`: 要删除的签名ID（必需）

### 5. 设置默认签名

```bash
mail-cli signature set-default --id 2
```

**选项**：
- `--id <id>`: 要设置为默认的签名ID（必需）

## 模板变量

签名支持以下模板变量，会在发送邮件时自动替换：

| 变量 | 说明 | 示例 |
|------|------|------|
| `{{name}}` | 用户名 | John Doe |
| `{{email}}` | 邮箱地址 | john@example.com |
| `{{date}}` | 当前日期 | 2026-02-08 |
| `{{time}}` | 当前时间 | 10:30:00 |

**使用示例**：

```bash
mail-cli signature create --name "模板签名" --text "Best regards,\n{{name}}\n{{email}}\n{{date}}"
```

发送邮件时会自动替换为：
```
Best regards,
John Doe
john@example.com
2026-02-08
```

## 自动插入签名

签名会在以下情况自动插入到邮件中：

1. **发送新邮件**：使用 `mail-cli send` 命令时
2. **回复邮件**：使用 `mail-cli reply` 命令时
3. **转发邮件**：使用 `mail-cli forward` 命令时
4. **发送草稿**：使用 `mail-cli draft send` 命令时

系统会自动：
- 查找当前账户的默认签名
- 处理模板变量
- 将签名添加到邮件正文末尾

## 编程接口

### 签名管理器 (SignatureManager)

```javascript
const signatureManager = require('./src/signatures/manager');

// 创建签名
const id = await signatureManager.create({
  name: 'My Signature',
  text: 'Best regards,\n{{name}}',
  html: '<p>Best regards,<br>{{name}}</p>',
  isDefault: true,
  accountEmail: 'user@example.com'
});

// 获取所有签名
const signatures = await signatureManager.getAll('user@example.com');

// 获取默认签名
const defaultSig = await signatureManager.getDefault('user@example.com');

// 更新签名
await signatureManager.update(id, {
  name: 'Updated Name',
  text: 'New content'
});

// 删除签名
await signatureManager.delete(id);

// 获取用于邮件的签名（已处理模板变量）
const signature = await signatureManager.getForEmail('user@example.com', {
  name: 'John Doe',
  email: 'john@example.com'
});
```

### EmailComposer 扩展

```javascript
const EmailComposer = require('./src/smtp/composer');
const signatureManager = require('./src/signatures/manager');

const composer = new EmailComposer();
composer
  .setTo('recipient@example.com')
  .setSubject('Test Email')
  .setBody('Email content');

// 添加签名
const signature = await signatureManager.getForEmail('user@example.com');
if (signature) {
  composer.addSignature(signature);
}

const emailData = composer.compose();
```

## 数据库结构

签名存储在 `signatures` 表中：

```sql
CREATE TABLE signatures (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  content_text TEXT,
  content_html TEXT,
  is_default BOOLEAN DEFAULT 0,
  account_email TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## 注意事项

1. **默认签名**：每个账户只能有一个默认签名。设置新的默认签名会自动取消之前的默认设置。

2. **账户关联**：
   - 如果签名关联了特定账户，只有该账户发送邮件时才会使用
   - 如果签名没有关联账户（`account_email` 为 NULL），则所有账户都可以使用

3. **格式支持**：
   - 可以只提供文本格式或HTML格式
   - 建议同时提供两种格式以获得最佳兼容性
   - HTML签名会自动添加到HTML邮件中，文本签名添加到纯文本邮件中

4. **模板变量**：
   - 模板变量使用 `{{variable}}` 格式
   - 变量名区分大小写
   - 未定义的变量会保持原样

## 故障排查

### 签名未自动插入

1. 检查是否设置了默认签名：
   ```bash
   mail-cli signature list
   ```

2. 确认签名关联的账户正确：
   ```bash
   mail-cli config --show
   ```

3. 查看日志文件了解详细错误信息

### 模板变量未替换

1. 确认变量名拼写正确（区分大小写）
2. 检查是否使用了正确的格式：`{{name}}` 而不是 `{name}` 或 `$name`

## 完整示例

```bash
# 1. 创建工作签名
mail-cli signature create \
  --name "工作签名" \
  --text "此致敬礼，\n{{name}}\n{{email}}\n{{date}}" \
  --html "<p>此致敬礼，<br><b>{{name}}</b><br>{{email}}<br>{{date}}</p>" \
  --default \
  --account work@company.com

# 2. 创建个人签名
mail-cli signature create \
  --name "个人签名" \
  --text "Cheers,\n{{name}}" \
  --account personal@gmail.com

# 3. 查看所有签名
mail-cli signature list

# 4. 发送邮件（会自动添加默认签名）
mail-cli send \
  --to friend@example.com \
  --subject "Hello" \
  --body "This is a test email"

# 5. 更改默认签名
mail-cli signature set-default --id 2

# 6. 编辑签名
mail-cli signature edit --id 1 --text "Updated content"

# 7. 删除签名
mail-cli signature delete --id 1
```

## 相关文件

- `src/storage/models/signature.js` - 签名数据模型
- `src/signatures/manager.js` - 签名管理器
- `src/cli/commands/signature.js` - CLI命令实现
- `src/smtp/composer.js` - 邮件编写器（包含签名支持）
- `src/storage/migrations/002_p0_features.js` - 数据库迁移脚本
