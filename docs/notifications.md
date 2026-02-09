# 邮件通知系统

## 概述

邮件通知系统为新邮件提供桌面通知功能，支持灵活的过滤规则和配置选项。

## 功能特性

### 1. 桌面通知
- 使用 node-notifier 库发送系统级桌面通知
- 显示发件人、主题和邮件预览
- 可配置声音提醒

### 2. 通知过滤
- **按发件人过滤**: 只接收特定发件人的通知
- **按标签过滤**: 只接收带有特定标签的邮件通知
- **仅重要邮件**: 只通知标记为重要的邮件

### 3. 配置管理
- 启用/禁用通知
- 配置过滤规则
- 自定义通知设置（声音、桌面通知）

## CLI 命令

### 启用通知
```bash
mail-cli notify enable
```

### 禁用通知
```bash
mail-cli notify disable
```

### 配置通知

#### 交互式配置
```bash
mail-cli notify config
```

#### 命令行配置
```bash
# 设置发件人过滤
mail-cli notify config --sender "boss@company.com,important@example.com"

# 设置标签过滤
mail-cli notify config --tag "urgent,important"

# 仅通知重要邮件
mail-cli notify config --important
```

### 测试通知
```bash
mail-cli notify test
```

### 查看状态
```bash
mail-cli notify status
```

## 集成说明

### 与 Sync 命令集成

通知系统已集成到邮件同步流程中：

1. 当新邮件同步到 INBOX 时自动触发通知检查
2. 根据配置的过滤规则决定是否发送通知
3. 不会通知垃圾邮件
4. 通知过程不影响同步性能（异步处理）

### 代码集成点

**文件**: `src/imap/sync.js`

在 `syncFolder` 方法中，新邮件保存后会调用通知管理器：

```javascript
// Send notification for new email (only for INBOX and not spam)
if (folderName === 'INBOX') {
  try {
    const email = emailModel.findById(emailId);
    if (email && !email.isSpam) {
      await notificationManager.notify(email);
    }
  } catch (error) {
    logger.debug('Notification failed', { emailId, error: error.message });
    // Continue without notification
  }
}
```

## 架构设计

### 核心组件

#### 1. NotificationManager (`src/notifications/manager.js`)

主要方法：
- `enable()` - 启用通知
- `disable()` - 禁用通知
- `updateFilters(filters)` - 更新过滤规则
- `updateSettings(settings)` - 更新通知设置
- `shouldNotify(email)` - 判断是否应该通知
- `notify(email)` - 发送单个邮件通知
- `notifyBatch(emails)` - 批量通知
- `test()` - 测试通知功能

#### 2. CLI Command (`src/cli/commands/notify.js`)

提供命令行接口：
- `enable` - 启用通知
- `disable` - 禁用通知
- `config` - 配置通知（交互式或命令行）
- `test` - 测试通知
- `status` - 查看通知状态

### 配置存储

通知配置存储在主配置文件中：

```javascript
{
  notifications: {
    enabled: false,
    desktop: true,
    sound: true,
    filters: {
      senders: [],
      tags: [],
      importantOnly: false
    }
  }
}
```

## 使用示例

### 场景 1: 只接收老板的邮件通知

```bash
# 启用通知
mail-cli notify enable

# 配置发件人过滤
mail-cli notify config --sender "boss@company.com"

# 测试
mail-cli notify test
```

### 场景 2: 只接收重要邮件通知

```bash
# 启用通知
mail-cli notify enable

# 配置仅重要邮件
mail-cli notify config --important

# 查看状态
mail-cli notify status
```

### 场景 3: 按标签过滤通知

```bash
# 启用通知
mail-cli notify enable

# 配置标签过滤
mail-cli notify config --tag "urgent,work"
```

## 注意事项

### 1. CLI 环境限制

- 桌面通知在某些 CLI 环境下可能不可用
- 建议在支持桌面通知的终端环境中使用
- Windows/macOS/Linux 桌面环境通常支持良好

### 2. 性能考虑

- 通知发送是异步的，不会阻塞同步流程
- 通知失败不会影响邮件同步
- 所有通知操作都有错误处理

### 3. 日志记录

所有通知活动都会记录到日志中：
- 通知发送成功/失败
- 配置更改
- 过滤规则应用

## 技术实现

### 依赖库

- **node-notifier**: 跨平台桌面通知库
  - 支持 Windows、macOS、Linux
  - 提供原生系统通知
  - 支持声音、图标等自定义选项

### 错误处理

通知系统采用防御性编程：
- 所有通知操作都包裹在 try-catch 中
- 通知失败不会影响主流程
- 错误信息记录到日志供调试

### 扩展性

系统设计支持未来扩展：
- 可添加更多通知方式（邮件、Webhook 等）
- 可扩展过滤规则（正则表达式、复杂条件等）
- 可添加通知模板自定义

## 测试建议

1. **基本功能测试**
   ```bash
   mail-cli notify enable
   mail-cli notify test
   ```

2. **过滤规则测试**
   - 配置发件人过滤后同步邮件
   - 验证只有匹配的邮件触发通知

3. **集成测试**
   - 启用通知后运行 sync 命令
   - 验证新邮件到达时收到通知

## 未来改进

1. 通知历史记录
2. 通知统计信息
3. 更复杂的过滤规则（正则表达式）
4. 通知模板自定义
5. 多种通知渠道（邮件、Webhook、Slack 等）
6. 通知优先级和分组

