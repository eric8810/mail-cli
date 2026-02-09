# 过滤规则引擎

过滤规则引擎允许您自动化邮件处理，根据条件自动执行操作。

## 功能特性

### 支持的条件字段
- `from` - 发件人地址
- `to` - 收件人地址
- `cc` - 抄送地址
- `subject` - 邮件主题
- `body` - 邮件正文
- `has_attachments` - 是否有附件
- `size` - 邮件大小
- `date` - 邮件日期
- `folder` - 所在文件夹

### 支持的操作符
- `equals` - 等于
- `not_equals` - 不等于
- `contains` - 包含
- `not_contains` - 不包含
- `starts_with` - 开头是
- `ends_with` - 结尾是
- `matches_regex` - 正则匹配
- `greater_than` - 大于
- `less_than` - 小于
- `is_empty` - 为空
- `is_not_empty` - 不为空

### 支持的动作
- `move` - 移动到文件夹
- `mark_read` - 标记为已读
- `mark_unread` - 标记为未读
- `star` - 加星标
- `unstar` - 取消星标
- `flag` - 标记重要
- `unflag` - 取消重要
- `delete` - 删除
- `mark_spam` - 标记为垃圾邮件
- `add_tag` - 添加标签
- `remove_tag` - 移除标签

## 使用示例

### 1. 创建过滤规则
```bash
mail-cli filter create --name "工作邮件" --description "自动处理工作相关邮件"
```

### 2. 添加条件
```bash
# 添加条件：发件人包含公司域名
mail-cli filter add-condition 1 --field from --operator contains --value "@company.com"

# 添加条件：主题包含"紧急"
mail-cli filter add-condition 1 --field subject --operator contains --value "紧急"
```

### 3. 添加动作
```bash
# 移动到"工作"文件夹
mail-cli filter add-action 1 --type move --value "Work"

# 标记为重要
mail-cli filter add-action 1 --type flag

# 添加"工作"标签
mail-cli filter add-action 1 --type add_tag --value "工作"
