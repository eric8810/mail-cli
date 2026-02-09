# 垃圾邮件过滤功能

## 功能概述

垃圾邮件过滤功能提供了全面的垃圾邮件检测和管理能力，包括：

- 自动垃圾邮件检测引擎
- 黑名单/白名单管理
- 手动标记垃圾邮件
- 学习型过滤器（根据用户反馈自动优化）
- 多种检测规则（关键词、链接、邮件头等）

## 文件结构

```
src/spam/
├── filter.js          # 垃圾邮件过滤引擎
└── rules.js           # 检测规则定义

src/storage/models/
└── spam.js            # 垃圾邮件数据模型（黑白名单、规则管理）

src/cli/commands/
└── spam.js            # CLI命令实现
```

## 数据库表

### spam_rules 表
存储垃圾邮件检测规则：
- `rule_type`: 规则类型（keyword, link, header）
- `pattern`: 匹配模式（正则表达式或关键词）
- `action`: 动作（mark_spam, delete, move）
- `is_enabled`: 是否启用
- `priority`: 优先级（影响检测权重）

### blacklist 表
存储黑名单邮箱地址：
- `email_address`: 邮箱地址
- `domain`: 域名
- `reason`: 加入黑名单的原因

### whitelist 表
存储白名单邮箱地址：
- `email_address`: 邮箱地址
- `domain`: 域名

### emails 表扩展
新增字段：
- `is_spam`: 是否为垃圾邮件（布尔值）

## CLI 命令使用

### 1. 标记垃圾邮件

```bash
# 标记邮件为垃圾邮件
mail-cli spam mark <email-id>

# 取消垃圾邮件标记
mail-cli spam unmark <email-id>
```

### 2. 查看垃圾邮件

```bash
# 列出所有垃圾邮件
mail-cli spam list
```

### 3. 黑名单管理

```bash
# 添加到黑名单
mail-cli spam blacklist add spam@example.com "发送垃圾邮件"

# 从黑名单移除
mail-cli spam blacklist remove spam@example.com

# 查看黑名单
mail-cli spam blacklist list
```

### 4. 白名单管理

```bash
# 添加到白名单
mail-cli spam whitelist add friend@example.com

# 从白名单移除
mail-cli spam whitelist remove friend@example.com

# 查看白名单
mail-cli spam whitelist list
```

### 5. 运行垃圾邮件过滤

```bash
# 手动扫描收件箱中的垃圾邮件
mail-cli spam filter
```

### 6. 查看统计信息

```bash
# 显示垃圾邮件过滤统计
mail-cli spam stats
```

## 检测规则

### 1. 关键词检测
检测邮件主题和正文中的垃圾邮件关键词：
- viagra, cialis, lottery, winner, prize
- click here, act now, limited time
- free, urgent, congratulations

### 2. 可疑链接检测
检测邮件中的可疑链接：
- URL 缩短服务（bit.ly, tinyurl, goo.gl）
- IP 地址链接
- 可疑顶级域名（.tk, .ml, .ga, .cf, .gq）

### 3. 邮件头检测
检测邮件头中的垃圾邮件标记：
- X-Spam-Flag: YES
- X-Spam-Status: Yes

### 4. 发件人信誉检测
检测可疑的发件人模式：
- noreply@, no-reply@, donotreply@
- 包含大量数字的邮箱
- 超长随机字符串邮箱

### 5. 内容特征检测
- 过度使用大写字母（超过70%）
- 过度使用标点符号（!!!, ???）
- 钓鱼邮件常见短语

## 垃圾邮件检测流程

1. **白名单检查**（最高优先级）
   - 如果发件人在白名单中，直接通过

2. **黑名单检查**
   - 如果发件人在黑名单中，立即标记为垃圾邮件

3. **规则检查**
   - 应用所有启用的检测规则
   - 每个匹配的规则增加垃圾邮件分数
   - 分数基于规则的优先级

4. **阈值判断**
   - 如果总分数 >= 50，标记为垃圾邮件

## 学习型过滤器

当用户手动标记邮件为垃圾邮件时，系统会：
1. 分析邮件内容提取特征
2. 自动创建新的检测规则
3. 提高相似邮件的检测准确率

示例：
```bash
# 标记邮件为垃圾邮件，系统会学习其特征
mail-cli spam mark 123

# 输出：
# Email #123 marked as spam
# Spam filter updated based on your feedback
```

## API 使用示例

### 在代码中使用垃圾邮件过滤器

```javascript
const spamFilter = require('./src/spam/filter');
const emailModel = require('./src/storage/models/email');

// 初始化过滤器
await spamFilter.initialize();

// 检测单个邮件
const email = await emailModel.findById(123);
const result = await spamFilter.detectSpam(email);

console.log(result);
// {
//   isSpam: true,
//   score: 65,
//   reasons: ['Sender is blacklisted', 'Spam keyword found in subject']
// }

// 过滤邮件并自动标记
await spamFilter.filterEmail(123);

// 批量过滤
const results = await spamFilter.filterEmails([123, 124, 125]);

// 学习用户反馈
await spamFilter.learnFromFeedback(123, true); // 标记为垃圾邮件
await spamFilter.learnFromFeedback(124, false); // 标记为非垃圾邮件

// 获取统计信息
const stats = await spamFilter.getStatistics();
console.log(stats);
// {
//   spamCount: 42,
//   blacklistCount: 10,
//   whitelistCount: 5,
//   rulesCount: 15,
//   threshold: 50
// }
```

### 黑白名单管理

```javascript
const spamModel = require('./src/storage/models/spam');

// 黑名单操作
await spamModel.addToBlacklist('spam@example.com', '发送垃圾邮件');
await spamModel.removeFromBlacklist('spam@example.com');
const isBlacklisted = await spamModel.isBlacklisted('spam@example.com');
const blacklist = await spamModel.getBlacklist();

// 白名单操作
await spamModel.addToWhitelist('friend@example.com');
await spamModel.removeFromWhitelist('friend@example.com');
const isWhitelisted = await spamModel.isWhitelisted('friend@example.com');
const whitelist = await spamModel.getWhitelist();

// 规则管理
await spamModel.createRule({
  ruleType: 'keyword',
  pattern: 'viagra|cialis',
  action: 'mark_spam',
  priority: 10
});

const rules = await spamModel.findAllRules(true); // 只获取启用的规则
await spamModel.updateRule(1, { isEnabled: false });
await spamModel.deleteRule(1);
```

## 配置选项

### 调整检测阈值

在 `src/spam/filter.js` 中修改：

```javascript
constructor() {
  this.threshold = 50; // 默认阈值为 50
}
```

- 降低阈值：更严格，可能产生误报
- 提高阈值：更宽松，可能漏检垃圾邮件

### 自定义检测规则

通过数据库添加自定义规则：

```javascript
await spamModel.createRule({
  ruleType: 'keyword',
  pattern: '自定义关键词',
  action: 'mark_spam',
  isEnabled: true,
  priority: 15  // 优先级越高，权重越大
});
```

## 性能考虑

1. **规则缓存**：过滤器初始化时加载所有规则到内存
2. **批量处理**：使用 `filterEmails()` 批量处理多个邮件
3. **索引优化**：数据库表已创建必要的索引
4. **异步处理**：所有操作都是异步的，不会阻塞主线程

## 注意事项

1. **白名单优先级最高**：白名单中的邮件永远不会被标记为垃圾邮件
2. **黑名单立即生效**：黑名单中的邮件会立即被标记为垃圾邮件
3. **学习需要时间**：学习型过滤器需要积累一定数量的样本才能提高准确率
4. **定期审查**：建议定期审查垃圾邮件文件夹，避免误报

## 故障排查

### 问题：垃圾邮件检测不准确

解决方案：
1. 检查黑白名单是否正确配置
2. 查看检测规则是否启用：`mail-cli spam stats`
3. 调整检测阈值
4. 手动标记更多样本以改进学习型过滤器

### 问题：合法邮件被误标记为垃圾邮件

解决方案：
1. 将发件人添加到白名单：`mail-cli spam whitelist add sender@example.com`
2. 取消垃圾邮件标记：`mail-cli spam unmark <email-id>`
3. 系统会学习并减少类似误报

### 问题：垃圾邮件过滤器不工作

解决方案：
1. 确保数据库迁移已执行
2. 检查日志文件查看错误信息
3. 手动运行过滤器：`mail-cli spam filter`

## 未来改进方向

1. **贝叶斯过滤器**：实现基于概率的垃圾邮件检测
2. **机器学习集成**：使用 ML 模型提高检测准确率
3. **实时过滤**：在邮件同步时自动过滤
4. **协同过滤**：基于社区反馈的垃圾邮件数据库
5. **图像识别**：检测邮件中的垃圾图片

## 相关文件

- `src/spam/filter.js` - 过滤引擎核心逻辑
- `src/spam/rules.js` - 检测规则实现
- `src/storage/models/spam.js` - 数据模型
- `src/cli/commands/spam.js` - CLI 命令
- `src/storage/migrations/002_p0_features.js` - 数据库迁移
