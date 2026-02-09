# TypeScript 转换规范文档

## 文档信息

- **版本**: v2.0
- **创建日期**: 2026-02-08
- **项目**: mail-cli
- **目标**: 将 78 个 JavaScript 文件转换为 TypeScript（严格模式）
- **关联文档**: [类型定义参考](./typescript-type-definitions.md)

---

## 1. 转换策略与原则

### 1.1 转换策略

**策略选择**: 一次性全部转换

**理由**:
- 项目规模适中（78个文件，696KB源代码）
- 架构清晰，依赖关系明确
- 可以一次性解决所有类型问题
- 避免混合语言带来的维护复杂度

**实施方式**:
1. 按模块依赖顺序逐批转换
2. 每个模块转换完成后立即进行类型检查
3. 全部转换完成后统一构建测试
4. 保留 `.js` 文件作为备份直到验证通过

### 1.2 转换原则

**严格性原则**:
- 启用 TypeScript 严格模式 (`strict: true`，已包含 `noImplicitAny`、`strictNullChecks` 等)
- 额外启用 `noImplicitReturns`、`noUnusedLocals`、`noFallthroughCasesInSwitch`
- 所有变量必须显式声明类型
- 禁止使用 `any` 类型（除非必要且有注释说明）

**最小改动原则**:
- 保持原有代码逻辑不变
- 仅添加类型信息，不重构业务逻辑
- 保持原有的目录结构和文件组织
- 保持原有的命名约定

**类型安全原则**:
- 优先使用接口定义数据结构
- 使用联合类型处理多态情况
- 使用类型守卫进行运行时类型检查
- 为第三方库缺失的类型定义创建声明文件

**向前兼容原则**:
- 生成的 JavaScript 代码保持与原代码一致
- 确保运行时行为完全相同
- 保持与现有数据库 schema 兼容
- 保持与现有配置文件格式兼容

---

## 2. 模块系统决策

**源码**: 使用 ES Module 语法（`import`/`export`）编写
**构建产物**: 通过 tsup 编译为 CommonJS（`format: ['cjs']`），保持与 Node.js 18 的兼容性
**package.json**: 不添加 `"type": "module"`，因为构建产物是 CJS

> 说明：源码中使用 ESM 语法，tsup 负责将其转换为 CJS 输出。
> 这意味着源码中的 `import`/`export` 在运行时实际是 `require`/`module.exports`。

---

## 3. 转换模块顺序

### 3.1 依赖层次

```
Level 0: 类型定义层
├── types/index.ts           # 核心业务类型
├── types/database.ts        # 数据库类型
├── types/imap.ts            # IMAP 相关类型
├── types/smtp.ts            # SMTP 相关类型
├── types/config.ts          # 配置类型
└── types/common.ts          # 通用工具类型

Level 1: 基础工具层
├── utils/errors.ts          # 错误类定义
├── utils/logger.ts          # 日志工具
├── utils/helpers.ts         # 辅助函数
└── utils/email-parser.ts    # 邮件解析

Level 2: 配置管理层
├── config/schema.ts         # 配置验证
├── config/defaults.ts       # 默认配置
└── config/index.ts          # 配置管理器

Level 3: 数据存储层
├── storage/database.ts      # 数据库管理器
├── storage/migrations/      # 数据库迁移（4个文件）
└── storage/models/          # 数据模型（13个文件）

Level 4: 协议客户端层
├── imap/client.ts           # IMAP 客户端
├── imap/sync.ts             # IMAP 同步
├── smtp/client.ts           # SMTP 客户端
└── smtp/composer.ts         # 邮件组合

Level 5: 业务逻辑层
├── accounts/manager.ts      # 账户管理
├── contacts/manager.ts      # 联系人管理
├── threads/                 # 线程分析（3个文件）
├── filters/                 # 过滤器引擎（3个文件）
├── spam/                    # 垃圾邮件检测（3个文件）
├── templates/manager.ts     # 模板管理
├── signatures/manager.ts    # 签名管理
├── notifications/manager.ts # 通知管理
├── import-export/           # 导入导出（3个文件）
└── sync/                    # 同步管理（5个文件）

Level 6: CLI 界面层
├── cli/utils/formatter.ts   # 输出格式化
├── cli/index.ts             # CLI 主程序
└── cli/commands/            # CLI 命令（24个文件）

Level 7: 应用入口
└── index.ts                 # 主入口文件
```

### 3.2 批次划分

**批次 1: 类型定义与基础工具**
- 创建所有类型定义文件（参见 [类型定义参考](./typescript-type-definitions.md)）
- 转换 `utils/errors.ts`
- 转换 `utils/logger.ts`
- 转换 `utils/helpers.ts`
- 转换 `utils/email-parser.ts`

**批次 2: 配置与数据层**
- 转换 `config/` 模块（3个文件）
- 转换 `storage/database.ts`
- 转换 `storage/migrations/`（4个文件）
- 转换 `storage/models/`（13个文件）

**批次 3: 协议客户端**
- 转换 `imap/` 模块（2个文件）
- 转换 `smtp/` 模块（2个文件）

**批次 4: 业务逻辑**
- 转换 `accounts/`、`contacts/`、`threads/`、`filters/`
- 转换 `spam/`、`templates/`、`signatures/`、`notifications/`
- 转换 `import-export/`、`sync/`

**批次 5: CLI 层**
- 转换 `cli/utils/formatter.ts`
- 转换 `cli/index.ts`
- 转换 `cli/commands/`（24个文件）

**批次 6: 入口与验证**
- 转换 `index.ts`
- 全局类型检查
- 构建验证
- 功能测试

---

## 4. 转换规则

### 4.1 模块导入导出

**规则**:
- 所有 `require()` 转换为 `import` 语句
- 所有 `module.exports` 转换为 `export default` 或 `export`
- 使用 `import type` 导入仅用于类型的符号
- 使用相对路径导入，同目录使用 `./` 前缀

**导出策略**:
- 单例类实例：`export default new ClassName()`
- 工具函数：命名导出 `export function`
- 类型定义：命名导出 `export interface` / `export type`
- 常量：命名导出 `export const`

### 4.2 导入顺序

按以下顺序组织导入语句，各组之间用空行分隔：

1. Node.js 内置模块
2. 第三方库
3. 项目内部模块 - 类型导入（`import type`）
4. 项目内部模块 - 值导入（按层级排序）

> 建议配合 `eslint-plugin-import` 的 `import/order` 规则自动执行。

### 4.3 类型注解

**必须添加类型注解的位置**:
- 所有函数参数
- 所有函数返回值（包括 `async` 函数的 `Promise<T>`）
- 所有类属性
- 可选参数使用 `?` 标记
- 有默认值的参数可省略类型（TypeScript 可推断）

**类属性**:
- 使用 `private`、`public`、`protected` 访问修饰符
- 所有属性必须显式声明类型

### 4.4 类型断言与类型守卫

**类型断言**:
- 数据库查询结果使用 `as` 断言到具体行类型
- JSON 解析结果使用 `as` 断言到目标类型
- 禁止 `as any`，如确实需要应使用 `as unknown as TargetType` 并注释原因

**类型守卫**:
- 对外部输入（用户输入、API 响应）使用类型守卫函数验证
- 类型守卫函数签名使用 `value is Type` 返回类型

### 4.5 枚举 vs 联合类型

- 优先使用联合类型（`type Foo = 'a' | 'b'`），因为它不产生运行时代码
- 仅在需要反向映射（从值到名称）时使用 `enum`
- 对于常量对象，使用 `as const` 断言

### 4.6 错误处理

- 保持现有的错误类继承体系（`MailClientError` 为基类）
- `catch` 块中的 `error` 参数类型为 `unknown`，使用 `instanceof` 检查后再访问属性
- 所有自定义错误类添加 `code` 属性的类型注解

### 4.7 单例模式

项目当前使用 `export default new ClassName()` 模式。转换时保持此模式，但需要：
- 将构造函数标记为 `private`，防止外部创建新实例
- 同时导出类类型供外部引用：`export { ClassName }`

### 4.8 数据库类型处理

- 优先使用 `@types/better-sqlite3` 提供的类型
- 注意 SQLite 没有布尔类型，`better-sqlite3` 返回 `0` 或 `1`（number），在 `_format*` 方法中使用 `Boolean()` 转换
- 查询结果使用库提供的泛型方法或 `as` 断言

---

## 5. 命名规范

### 5.1 文件命名

- 使用 kebab-case：`email-model.ts`、`filter-engine.ts`
- 入口文件：`index.ts`

### 5.2 类型命名

- 接口和类型别名：PascalCase（`Email`、`FilterField`）
- 不使用 `I` 前缀（不用 `IEmail`）
- 输入类型添加 `Input` 后缀（`EmailCreateInput`）
- 输出类型添加 `Output` 或 `Result` 后缀（`FilterApplyResult`）

### 5.3 变量和函数命名

- 变量和函数：camelCase（`userId`、`getUserById`）
- 全局常量：UPPER_SNAKE_CASE（`MAX_ATTACHMENT_SIZE`）

### 5.4 类命名

- 类名：PascalCase（`EmailModel`、`DatabaseManager`）
- 缩写词按 PascalCase 规则处理：`ImapClient`、`SmtpClient`（不用全大写 `IMAPClient`）

> 说明：这与 TypeScript 官方编码规范一致。全大写缩写词在多个缩写词组合时会导致可读性问题。

---

## 6. 文件结构规范

每个 `.ts` 文件按以下顺序组织内容：

1. 文件描述（JSDoc）
2. 导入语句（按 4.2 节顺序）
3. 局部类型定义（仅本文件使用的类型）
4. 常量定义
5. 类定义 / 函数定义
6. 导出语句

---

## 7. 第三方库类型处理

### 7.1 有类型定义的库

直接安装 `@types/*` 包或使用库内置类型。详见 [类型定义参考](./typescript-type-definitions.md) 第 16 节。

### 7.2 缺少类型定义的库

在 `src/types/` 下创建 `.d.ts` 声明文件，使用 `declare module '库名'` 语法。

当前需要手动创建声明文件的库：`node-imap`。

### 7.3 全局类型补充

在 `src/types/global.d.ts` 中补充全局类型（如 `ProcessEnv` 扩展）。

---

## 8. 构建配置

### 8.1 tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "lib": ["ES2022"],
    "moduleResolution": "node",
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "noUnusedLocals": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "allowSyntheticDefaultImports": true,
    "isolatedModules": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "tests"]
}
```

> 注意：不启用 `noUnusedParameters`。回调函数和接口实现中经常需要声明但不使用某些参数，
> 该检查交由 ESLint 的 `@typescript-eslint/no-unused-vars` 规则处理（支持 `_` 前缀忽略）。

### 8.2 tsup 配置

```typescript
import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs'],
  dts: true,
  clean: true,
  sourcemap: true,
  target: 'node18',
  external: [
    'better-sqlite3',
    'node-imap',
    'nodemailer',
    'mailparser',
    'node-notifier'
  ],
  banner: {
    js: '#!/usr/bin/env node'
  },
  onSuccess: 'chmod +x dist/index.js'
});
```

### 8.3 package.json 变更

```json
{
  "main": "dist/index.js",
  "bin": {
    "mail-cli": "./dist/index.js"
  },
  "scripts": {
    "build": "tsup",
    "dev": "tsup --watch",
    "start": "node dist/index.js",
    "type-check": "tsc --noEmit",
    "lint": "eslint src --ext .ts",
    "lint:fix": "eslint src --ext .ts --fix"
  },
  "devDependencies": {
    "typescript": "^5.3.0",
    "tsup": "^8.0.0",
    "@types/node": "^20.10.0",
    "@types/better-sqlite3": "^7.6.8",
    "@types/inquirer": "^9.0.0",
    "@types/node-notifier": "^8.0.5",
    "@types/nodemailer": "^6.4.0",
    "@types/mailparser": "^3.4.0",
    "@types/cli-table3": "^0.6.0",
    "@typescript-eslint/eslint-plugin": "^6.13.0",
    "@typescript-eslint/parser": "^6.13.0",
    "eslint": "^8.54.0",
    "eslint-plugin-import": "^2.29.0"
  }
}
```

### 8.4 ESLint 配置

需要创建 `.eslintrc.json`：

```json
{
  "parser": "@typescript-eslint/parser",
  "parserOptions": {
    "project": "./tsconfig.json"
  },
  "plugins": ["@typescript-eslint", "import"],
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:import/typescript"
  ],
  "rules": {
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/explicit-function-return-type": "warn",
    "@typescript-eslint/no-unused-vars": ["error", { "argsIgnorePattern": "^_" }],
    "import/order": ["warn", {
      "groups": ["builtin", "external", "type", "internal"],
      "newlines-between": "always"
    }]
  }
}
```

---

## 9. 质量检查

### 9.1 每批次完成后

运行 `pnpm type-check`，确保：
- 零类型错误
- 零隐式 any 错误
- 零未使用变量错误
- 零隐式返回错误

### 9.2 全部转换完成后

**构建验证**:
- `pnpm build` 成功无错误
- `dist/` 目录包含 `.js`、`.d.ts`、`.js.map` 文件
- `./dist/index.js --help` 可正常执行

**ESLint 检查**:
- `pnpm lint` 零错误

**功能测试**:
- 所有 CLI 命令正常运行
- 数据库操作正常
- 错误处理正确
- 日志输出正常

### 9.3 代码审查清单

每个文件转换完成后，检查：

**类型安全**:
- [ ] 所有函数参数都有类型注解
- [ ] 所有函数返回值都有类型注解
- [ ] 所有类属性都有类型注解
- [ ] 没有使用 `any` 类型（除非必要且有注释）
- [ ] 正确使用可选类型 `?`

**代码质量**:
- [ ] 导入顺序正确
- [ ] 常量使用 `UPPER_SNAKE_CASE`
- [ ] 有适当的 JSDoc 注释
- [ ] 错误处理完整

**命名规范**:
- [ ] 文件名使用 kebab-case
- [ ] 类名使用 PascalCase
- [ ] 函数名使用 camelCase
- [ ] 接口名使用 PascalCase（无 I 前缀）

**构建兼容**:
- [ ] 导出方式正确（default vs named）
- [ ] 相对路径正确
- [ ] 外部依赖正确配置

---

## 10. 常见问题与解决策略

### 10.1 better-sqlite3 查询结果类型

使用 `@types/better-sqlite3` 提供的泛型方法，或在 `_format*` 方法中统一做类型转换。注意 SQLite 返回的布尔值实际是 `0`/`1`（number 类型）。

### 10.2 node-imap 回调转 Promise

node-imap 使用回调风格 API。转换时将回调包装为 Promise，在 `src/types/node-imap.d.ts` 中定义所需的类型。

### 10.3 动态属性访问

使用 `keyof` 操作符约束动态属性访问的键类型，避免使用 `any`。对于需要检查未知对象是否包含某属性的场景，使用类型守卫函数。

### 10.4 单例导出的类型引用

同时导出类类型和默认实例，使外部既可以使用实例，也可以引用类类型用于类型注解。

### 10.5 第三方库缺少类型

在 `src/types/` 下创建对应的 `.d.ts` 声明文件。仅声明项目实际使用到的 API，不需要覆盖库的全部接口。

---

## 11. 转换完成后的清理工作

### 11.1 文件清理

1. 备份原始 `.js` 源文件
2. 确认转换成功后删除 `src/` 下的 `.js` 文件
3. 更新 `.gitignore`，忽略 `src/` 下的 `.js` 文件但保留 `dist/`

### 11.2 文档更新

- [ ] 更新 README.md 中的技术栈说明
- [ ] 更新 AGENTS.md 中的构建和开发命令
- [ ] 更新 package.json 中的描述

### 11.3 CI/CD 更新

- [ ] 更新 GitHub Actions 工作流
- [ ] 添加类型检查步骤（`pnpm type-check`）
- [ ] 添加构建步骤（`pnpm build`）
- [ ] 更新发布流程

---

## 12. 附录

### 12.1 批次文件统计

| 批次 | 文件数 | 依赖关系 |
|------|--------|----------|
| 批次 1: 类型与工具 | ~10 | 无依赖 |
| 批次 2: 配置与存储 | 20 | 依赖批次1 |
| 批次 3: 协议客户端 | 4 | 依赖批次1,2 |
| 批次 4: 业务逻辑 | 21 | 依赖批次1,2,3 |
| 批次 5: CLI 层 | 26 | 依赖批次1-4 |
| 批次 6: 入口验证 | 1 | 依赖批次1-5 |

### 12.2 关键里程碑

- [ ] 里程碑 1: 类型定义完成（批次1完成）
- [ ] 里程碑 2: 数据层转换完成（批次2完成）
- [ ] 里程碑 3: 协议层转换完成（批次3完成）
- [ ] 里程碑 4: 业务层转换完成（批次4完成）
- [ ] 里程碑 5: CLI 层转换完成（批次5完成）
- [ ] 里程碑 6: 类型检查通过（零错误）
- [ ] 里程碑 7: 构建成功
- [ ] 里程碑 8: 功能测试通过
- [ ] 里程碑 9: 文档更新完成

### 12.3 风险与缓解

| 风险 | 影响 | 概率 | 缓解措施 |
|------|------|------|----------|
| 第三方库类型缺失 | 高 | 中 | 创建类型声明文件 |
| better-sqlite3 布尔值类型不匹配 | 中 | 高 | 在 `_format*` 方法中用 `Boolean()` 转换 |
| node-imap 回调转 Promise | 中 | 中 | 包装为 Promise，创建声明文件 |
| 构建工具兼容性 | 低 | 低 | 使用成熟的 tsup |
| 运行时行为变化 | 高 | 低 | 充分测试，保持逻辑不变 |

### 12.4 参考资料

- [TypeScript 官方文档](https://www.typescriptlang.org/docs/)
- [TypeScript 编码规范](https://github.com/microsoft/TypeScript/wiki/Coding-guidelines)
- [tsup 文档](https://tsup.egoist.dev/)
- [better-sqlite3 TypeScript 类型](https://github.com/WiseLibs/better-sqlite3/blob/master/docs/types.md)

---

## 版本历史

| 版本 | 日期 | 变更说明 |
|------|------|----------|
| v1.0 | 2026-02-08 | 初始版本 |
| v2.0 | 2026-02-08 | 修正技术问题，移除代码实现，数据结构抽离至独立文档 |

---

**文档结束**
