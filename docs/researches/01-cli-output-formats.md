# CLI 输出格式调研

**调研日期**: 2026-02-10
**调研目标**: 确定 Open Mail CLI 的输出格式策略，为 Agent 提供友好的输出格式

---

## 1. 调研背景

Open Mail CLI 的核心用户是 AI Agent，需要设计适合 Agent 解析和处理的输出格式。主要考虑：
- Agent 友好性（易于解析）
- 人类可读性（便于调试）
- Token 效率（降低 LLM 成本）
- 灵活性（支持多种场景）

---

## 2. 主流 CLI 工具输出格式分析

### 2.1 GitHub CLI (gh)

**默认输出**: 表格格式（ASCII 表格）
```
TITLE                    STATE  AUTHOR       CREATED
Fix authentication bug   OPEN   user123      2 days ago
Add new feature          OPEN   developer    1 week ago
```

**JSON 输出**: `--json` 参数
```bash
gh pr list --json number,title,state
```

**特点**:
- 默认表格格式，人类友好
- 支持 `--json` + 字段选择（`--json field1,field2`）
- 支持 `--jq` 直接过滤 JSON
- 简洁模式：`-q` 或 `--jq '.[] | .number'`

**优势**:
- 字段选择灵活（避免输出不需要的数据）
- JSON 结构清晰，易于程序化处理
- 表格格式适合人类快速浏览

### 2.2 Kubernetes CLI (kubectl)

**默认输出**: 表格格式
```
NAME                     READY   STATUS    RESTARTS   AGE
nginx-deployment-abc     1/1     Running   0          2d
redis-master-xyz         1/1     Running   1          5d
```

**多种输出格式**: `-o` 或 `--output` 参数
- `-o wide`: 扩展表格（更多列）
- `-o json`: JSON 格式
- `-o yaml`: YAML 格式
- `-o name`: 仅资源名称（简洁模式）
- `-o jsonpath`: JSONPath 查询

**特点**:
- 输出格式非常丰富
- 支持自定义列（`-o custom-columns`）
- 支持 JSONPath 查询（灵活提取数据）

**优势**:
- 适应不同场景（人类查看 vs 脚本处理）
- JSONPath 提供强大的数据提取能力
- `--output name` 简洁模式非常实用

### 2.3 Docker CLI

**默认输出**: 表格格式
```
CONTAINER ID   IMAGE          COMMAND       CREATED        STATUS
abc123def456   nginx:latest   "nginx"       2 hours ago    Up 2 hours
```

**格式化输出**: `--format` 参数（Go template）
```bash
docker ps --format "{{.ID}}: {{.Image}}"
# 输出: abc123def456: nginx:latest
```

**JSON 输出**: 部分命令支持 `--format json`

**特点**:
- 默认表格格式
- 支持 Go template 自定义格式
- 部分命令支持 JSON

**优势**:
- Go template 灵活但学习成本高
- 表格格式清晰

---

## 3. Markdown 表格 vs JSON 对比

### 3.1 Markdown 表格

**示例**:
```markdown
| ID | From              | Subject           | Date       | Status |
|----|-------------------|-------------------|------------|--------|
| 1  | alice@example.com | Meeting reminder  | 2026-02-09 | Unread |
| 2  | bob@example.com   | Project update    | 2026-02-08 | Read   |
```

**优势**:
- LLM 原生格式，训练数据中大量存在
- 人机双可读
- 语义化结构（表头明确字段含义）
- Token 效率较高（相比 JSON）

**劣势**:
- 解析需要额外逻辑（不如 JSON 直接）
- 复杂嵌套数据不适合
- 字段值包含 `|` 时需要转义

**适用场景**:
- 列表展示（邮件列表、账户列表）
- 简单结构数据
- Agent 需要快速理解数据概览

### 3.2 JSON 格式

**示例**:
```json
{
  "emails": [
    {
      "id": 1,
      "from": "alice@example.com",
      "subject": "Meeting reminder",
      "date": "2026-02-09",
      "status": "unread"
    }
  ],
  "total": 150,
  "page": 1,
  "limit": 20
}
```

**优势**:
- 结构化，易于程序化解析
- 支持复杂嵌套数据
- 标准格式，工具链成熟

**劣势**:
- Token 消耗较高（键名重复）
- 人类可读性较差（大量数据时）
- LLM 需要额外解析步骤

**适用场景**:
- 复杂数据结构（邮件详情、附件信息）
- 程序化处理（Agent 写脚本调用）
- 需要精确字段类型（数字、布尔值）

---

## 4. 其他格式考虑

### 4.1 简洁模式（IDs Only）

**示例**:
```
1 2 3 5 8 13
```

**适用场景**:
- 管道操作（`mail-cli list --ids-only | xargs mail-cli delete`）
- Agent 只需要 ID 列表进行后续操作
- 最小化 Token 消耗

### 4.2 字段选择

**示例**:
```bash
mail-cli list --fields id,subject,from
```

**优势**:
- 减少不必要的数据传输
- 降低 Token 消耗
- 提高 Agent 处理效率

---

## 5. 推荐方案

### 5.1 默认输出：Markdown 表格

**理由**:
- Agent 友好（LLM 训练数据中常见）
- 人类可读（便于调试）
- Token 效率高

**实现**:
```markdown
## Inbox (3 unread, 150 total) - Showing 1-20

| ID | From              | Subject           | Date       | Status |
|----|-------------------|-------------------|------------|--------|
| 1  | alice@example.com | Meeting reminder  | 2026-02-09 | Unread |
| 2  | bob@example.com   | Project update    | 2026-02-08 | Read   |
```

**关键点**:
- 标题行明确总数和当前范围
- 表头清晰标注字段含义
- 状态使用文本（Unread/Read）而非布尔值

### 5.2 可选 JSON 输出：`--format json`

**理由**:
- 程序化处理需求
- 复杂数据结构
- 精确类型信息

**实现**:
```bash
mail-cli list --format json
```

**输出结构**:
```json
{
  "data": [...],
  "meta": {
    "total": 150,
    "page": 1,
    "limit": 20,
    "unread": 3
  }
}
```

### 5.3 简洁模式：`--ids-only`

**理由**:
- 管道操作
- 最小化输出

**实现**:
```bash
mail-cli list --ids-only
# 输出: 1 2 3 5 8
```

### 5.4 字段选择：`--fields`

**理由**:
- 灵活控制输出内容
- 降低 Token 消耗

**实现**:
```bash
mail-cli list --fields id,subject,from
```

---

## 6. 内容长度管理策略

### 6.1 默认限制

**邮件列表**:
- 默认 20 条
- 明确标注总数和当前范围
- 示例: `Showing 1-20 of 150`

**邮件正文**:
- 默认截断 500 字符
- 明确标注截断信息
- 示例: `Body (Showing first 500 of 2,340 characters)`

### 6.2 完整内容：`--full`

```bash
mail-cli read 123 --full
```

### 6.3 分页参数

统一使用：
- `--limit <number>`: 每页数量
- `--offset <number>`: 偏移量
- `--page <number>`: 页码（自动计算 offset）

---

## 7. 实施建议

### 7.1 优先级

1. **P0 - 立即实现**:
   - Markdown 表格默认输出
   - `--format json` 支持
   - 内容长度管理（默认限制 + `--full`）

2. **P1 - 近期实现**:
   - `--ids-only` 简洁模式
   - `--fields` 字段选择
   - 统一分页参数

### 7.2 实现架构

**Formatter 抽象层**:
```typescript
interface Formatter {
  format(data: any, options: FormatOptions): string;
}

class MarkdownTableFormatter implements Formatter { }
class JSONFormatter implements Formatter { }
class IDsOnlyFormatter implements Formatter { }
```

**使用方式**:
```typescript
const formatter = getFormatter(options.format); // 'markdown' | 'json' | 'ids-only'
const output = formatter.format(emails, options);
console.log(output);
```

---

## 8. 参考资料

- GitHub CLI 文档: https://cli.github.com/manual/
- kubectl 输出格式: https://kubernetes.io/docs/reference/kubectl/
- Docker CLI 格式化: https://docs.docker.com/engine/reference/commandline/ps/
- CLI 设计最佳实践: https://clig.dev/

---

## 9. 结论

**推荐策略**:
1. **默认**: Markdown 表格（Agent 友好 + 人类可读）
2. **可选**: JSON 格式（程序化处理）
3. **简洁**: IDs Only（管道操作）
4. **灵活**: 字段选择（降低 Token）

**核心原则**:
- Agent 优先，但不牺牲人类可读性
- 提供灵活性，适应不同场景
- 明确标注元信息（总数、范围、截断）
- Token 效率优化
