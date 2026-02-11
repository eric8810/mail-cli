# Plugin 系统调研

**调研日期**: 2026-02-10
**调研目标**: 设计灵活且安全的 Plugin 系统，支持第三方扩展功能

---

## 1. 调研背景

Open Mail CLI 需要支持 Plugin 系统，让第三方开发者可以扩展功能。核心问题：
1. **应该暴露哪些内容给 Plugin？**
2. **Plugin 可以做什么？**
3. **如何保证安全性和稳定性？**

---

## 2. 核心问题分析

### 2.1 应该暴露哪些内容给 Plugin？

**选项分析**:

| 内容类型 | 是否暴露 | 理由 | 风险 |
|---------|---------|------|------|
| **数据库访问** | ❌ 不暴露 | 直接访问数据库风险太高，可能破坏数据完整性 | 高 |
| **邮件模型（只读）** | ✅ 暴露 | Plugin 需要读取邮件数据进行处理 | 低 |
| **邮件模型（写入）** | ⚠️ 有限暴露 | 允许添加自定义字段，但不允许修改核心字段 | 中 |
| **配置（只读）** | ✅ 暴露 | Plugin 需要读取配置（如账户信息） | 低 |
| **配置（写入）** | ⚠️ 有限暴露 | 允许 Plugin 保存自己的配置，但不允许修改核心配置 | 中 |
| **内部 API** | ✅ 暴露 | 提供高层 API（如发送邮件、搜索邮件） | 低 |
| **工具函数** | ✅ 暴露 | 提供常用工具（如日期格式化、邮件解析） | 低 |
| **事件系统** | ✅ 暴露 | Plugin 可以监听和触发事件 | 低 |
| **生命周期钩子** | ✅ 暴露 | Plugin 可以在特定时机执行代码 | 低 |
| **CLI 命令注册** | ✅ 暴露 | Plugin 可以添加自定义命令 | 低 |
| **HTTP API 端点** | ✅ 暴露 | Plugin 可以添加自定义 API | 低 |

**推荐暴露内容**:
1. ✅ 邮件模型（只读 + 有限写入）
2. ✅ 配置（只读 + Plugin 专属配置写入）
3. ✅ 高层 API（发送、搜索、标记等）
4. ✅ 工具函数
5. ✅ 事件系统
6. ✅ 生命周期钩子
7. ✅ CLI 命令注册
8. ✅ HTTP API 端点注册

### 2.2 Plugin 可以做什么？

**能力清单**:

| 能力 | 是否允许 | 使用场景 | 实现方式 |
|------|---------|---------|---------|
| **读取邮件内容** | ✅ 允许 | 数据分析、内容提取 | 提供 API |
| **修改邮件核心字段** | ❌ 不允许 | 风险太高 | - |
| **添加自定义字段** | ✅ 允许 | 标签、分类、元数据 | metadata 字段 |
| **扩展 CLI 命令** | ✅ 允许 | 自定义功能 | 命令注册 API |
| **添加 HTTP API 端点** | ✅ 允许 | 自定义 API | 路由注册 API |
| **监听事件** | ✅ 允许 | 自动化处理 | 事件订阅 API |
| **触发事件** | ✅ 允许 | 通知其他 Plugin | 事件发布 API |
| **发送邮件** | ✅ 允许 | 自动回复、转发 | 发送 API |
| **调用外部服务** | ✅ 允许 | 集成第三方服务 | HTTP 客户端 |
| **修改邮件处理流程** | ✅ 允许 | 自定义过滤、分类 | Hook 系统 |
| **访问文件系统** | ⚠️ 有限允许 | 读写 Plugin 专属目录 | 沙箱路径 |
| **执行系统命令** | ❌ 不允许 | 安全风险 | - |

**推荐能力**:
1. ✅ 读取邮件（只读）
2. ✅ 添加自定义字段（metadata）
3. ✅ 扩展 CLI 命令
4. ✅ 添加 HTTP API 端点
5. ✅ 监听和触发事件
6. ✅ 发送邮件
7. ✅ 调用外部服务
8. ✅ 修改邮件处理流程（Hook）
9. ⚠️ 访问 Plugin 专属目录

---

## 3. 插件架构模式调研

### 3.1 Hook 系统（Webpack 风格）

**特点**:
- 在特定时机执行 Plugin 代码
- Plugin 可以修改数据流
- 同步和异步 Hook

**示例**:
```typescript
// Webpack Plugin
class MyPlugin {
  apply(compiler) {
    compiler.hooks.emit.tapAsync('MyPlugin', (compilation, callback) => {
      // 在输出文件前执行
      callback();
    });
  }
}
```

**Open Mail CLI 应用**:
```typescript
class EmailProcessorPlugin {
  apply(pluginAPI) {
    // 在邮件接收后执行
    pluginAPI.hooks.emailReceived.tap('EmailProcessor', (email) => {
      // 处理邮件
      email.metadata.processed = true;
      return email;
    });
  }
}
```

**优势**:
- 灵活性高
- 可以修改数据流
- 适合复杂处理逻辑

**劣势**:
- 学习成本高
- 需要定义大量 Hook 点

### 3.2 Event-driven 系统（ESLint 风格）

**特点**:
- 基于事件监听
- Plugin 订阅感兴趣的事件
- 不修改数据流，只执行副作用

**示例**:
```typescript
// ESLint Plugin
module.exports = {
  rules: {
    'my-rule': {
      create(context) {
        return {
          // 监听 AST 节点
          FunctionDeclaration(node) {
            // 检查逻辑
          }
        };
      }
    }
  }
};
```

**Open Mail CLI 应用**:
```typescript
class NotificationPlugin {
  constructor(pluginAPI) {
    // 监听新邮件事件
    pluginAPI.on('email.received', async (email) => {
      // 发送通知
      await sendNotification(email);
    });
  }
}
```

**优势**:
- 简单易懂
- 低耦合
- 适合副作用操作

**劣势**:
- 无法修改数据流
- 不适合复杂处理逻辑

### 3.3 混合模式（推荐）

**结合 Hook 和 Event**:
- **Hook**: 用于修改数据流（邮件处理、过滤）
- **Event**: 用于副作用操作（通知、日志）

**示例**:
```typescript
class MyPlugin {
  apply(pluginAPI) {
    // Hook: 修改邮件内容
    pluginAPI.hooks.beforeEmailSave.tap('MyPlugin', (email) => {
      email.metadata.category = detectCategory(email);
      return email;
    });

    // Event: 发送通知
    pluginAPI.on('email.received', async (email) => {
      await sendNotification(email);
    });
  }
}
```

---

## 4. 其他工具的插件系统调研

### 4.1 Babel Plugin

**架构**:
- 访问者模式（Visitor Pattern）
- 遍历 AST，在特定节点执行转换

**示例**:
```javascript
module.exports = function() {
  return {
    visitor: {
      Identifier(path) {
        // 转换标识符
        path.node.name = path.node.name.toUpperCase();
      }
    }
  };
};
```

**启发**:
- 定义清晰的访问点
- Plugin 只处理感兴趣的部分
- 不影响其他部分

### 4.2 Rollup Plugin

**架构**:
- 生命周期钩子
- 每个阶段都有对应的 Hook

**示例**:
```javascript
export default function myPlugin() {
  return {
    name: 'my-plugin',
    buildStart() {
      // 构建开始
    },
    transform(code, id) {
      // 转换代码
      return { code, map: null };
    },
    buildEnd() {
      // 构建结束
    }
  };
}
```

**启发**:
- 明确的生命周期
- 每个阶段的职责清晰
- 返回值明确

### 4.3 Vite Plugin

**架构**:
- 兼容 Rollup Plugin
- 额外的 Vite 特定 Hook

**示例**:
```javascript
export default function myPlugin() {
  return {
    name: 'my-plugin',
    configureServer(server) {
      // 配置开发服务器
      server.middlewares.use((req, res, next) => {
        // 自定义中间件
        next();
      });
    }
  };
}
```

**启发**:
- 可以扩展 HTTP Server
- Plugin 可以添加中间件

---

## 5. 插件安全隔离方案

### 5.1 权限控制

**权限级别**:
```typescript
enum PluginPermission {
  READ_EMAILS = 'read:emails',
  WRITE_EMAILS = 'write:emails',
  SEND_EMAILS = 'send:emails',
  READ_CONFIG = 'read:config',
  WRITE_CONFIG = 'write:config',
  NETWORK = 'network',
  FILE_SYSTEM = 'filesystem'
}
```

**Plugin 声明权限**:
```json
{
  "name": "my-plugin",
  "version": "1.0.0",
  "permissions": [
    "read:emails",
    "network"
  ]
}
```

**运行时检查**:
```typescript
class PluginAPI {
  checkPermission(permission: PluginPermission) {
    if (!this.plugin.permissions.includes(permission)) {
      throw new Error(`Permission denied: ${permission}`);
    }
  }

  async sendEmail(data) {
    this.checkPermission(PluginPermission.SEND_EMAILS);
    // 发送邮件
  }
}
```

### 5.2 沙箱隔离

**文件系统隔离**:
```typescript
class PluginFileSystem {
  constructor(pluginName: string) {
    this.basePath = path.join(PLUGIN_DATA_DIR, pluginName);
  }

  readFile(filename: string) {
    const fullPath = path.join(this.basePath, filename);
    // 检查路径是否在沙箱内
    if (!fullPath.startsWith(this.basePath)) {
      throw new Error('Path traversal detected');
    }
    return fs.readFileSync(fullPath);
  }
}
```

**网络隔离**:
```typescript
class PluginHTTPClient {
  constructor(plugin: Plugin) {
    this.plugin = plugin;
  }

  async fetch(url: string) {
    // 检查权限
    if (!this.plugin.permissions.includes('network')) {
      throw new Error('Network permission denied');
    }

    // 检查 URL 白名单（可选）
    if (!this.isAllowedURL(url)) {
      throw new Error('URL not allowed');
    }

    return fetch(url);
  }
}
```

### 5.3 资源限制

**CPU 和内存限制**:
```typescript
class PluginRunner {
  async run(plugin: Plugin, timeout = 5000) {
    return Promise.race([
      plugin.execute(),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Timeout')), timeout)
      )
    ]);
  }
}
```

---

## 6. 插件发现和加载机制

### 6.1 插件发现

**方式 1: 目录扫描**:
```
~/.mail-cli/plugins/
├── plugin-a/
│   ├── package.json
│   └── index.js
├── plugin-b/
│   ├── package.json
│   └── index.js
```

**方式 2: npm 包**:
```bash
npm install mail-cli-plugin-notification
```

**约定**:
- 包名以 `mail-cli-plugin-` 开头
- 或在 `package.json` 中声明 `keywords: ["mail-cli-plugin"]`

### 6.2 插件加载

**加载流程**:
```typescript
class PluginLoader {
  async loadPlugins() {
    const plugins = [];

    // 1. 扫描插件目录
    const pluginDirs = await this.scanPluginDirectory();

    // 2. 加载每个插件
    for (const dir of pluginDirs) {
      const plugin = await this.loadPlugin(dir);
      plugins.push(plugin);
    }

    // 3. 验证插件
    for (const plugin of plugins) {
      this.validatePlugin(plugin);
    }

    // 4. 初始化插件
    for (const plugin of plugins) {
      await this.initializePlugin(plugin);
    }

    return plugins;
  }

  async loadPlugin(dir: string) {
    const packageJson = require(path.join(dir, 'package.json'));
    const pluginModule = require(dir);

    return {
      name: packageJson.name,
      version: packageJson.version,
      permissions: packageJson.permissions || [],
      module: pluginModule
    };
  }
}
```

### 6.3 插件配置

**全局配置**:
```json
{
  "plugins": {
    "enabled": ["plugin-a", "plugin-b"],
    "disabled": ["plugin-c"],
    "config": {
      "plugin-a": {
        "api_key": "xxx"
      }
    }
  }
}
```

**CLI 命令**:
```bash
# 列出插件
mail-cli plugin list

# 启用插件
mail-cli plugin enable plugin-a

# 禁用插件
mail-cli plugin disable plugin-a

# 配置插件
mail-cli plugin config plugin-a --set api_key=xxx
```

---

## 7. Plugin API 设计

### 7.1 核心 API

```typescript
interface PluginAPI {
  // 邮件操作
  emails: {
    find(query: EmailQuery): Promise<Email[]>;
    findById(id: number): Promise<Email | null>;
    send(data: SendEmailData): Promise<Email>;
    markAsRead(id: number): Promise<void>;
    addMetadata(id: number, key: string, value: any): Promise<void>;
  };

  // 账户操作
  accounts: {
    list(): Promise<Account[]>;
    findById(id: number): Promise<Account | null>;
  };

  // 配置操作
  config: {
    get(key: string): any;
    set(key: string, value: any): Promise<void>; // Plugin 专属配置
  };

  // 事件系统
  events: {
    on(event: string, handler: Function): void;
    emit(event: string, data: any): void;
  };

  // Hook 系统
  hooks: {
    beforeEmailSave: SyncHook<Email>;
    afterEmailReceived: AsyncHook<Email>;
    // ... 更多 Hook
  };

  // CLI 命令注册
  cli: {
    registerCommand(name: string, handler: CommandHandler): void;
  };

  // HTTP API 注册
  http: {
    registerRoute(method: string, path: string, handler: RouteHandler): void;
  };

  // 工具函数
  utils: {
    parseEmail(raw: string): ParsedEmail;
    formatDate(date: Date): string;
    // ... 更多工具
  };

  // 文件系统（沙箱）
  fs: {
    readFile(path: string): Promise<Buffer>;
    writeFile(path: string, data: Buffer): Promise<void>;
  };

  // HTTP 客户端
  http: {
    fetch(url: string, options?: RequestInit): Promise<Response>;
  };

  // 日志
  logger: {
    info(message: string): void;
    error(message: string): void;
    debug(message: string): void;
  };
}
```

### 7.2 Plugin 接口

```typescript
interface Plugin {
  name: string;
  version: string;
  permissions: PluginPermission[];

  // 初始化
  apply(api: PluginAPI): void | Promise<void>;

  // 可选：卸载
  destroy?(): void | Promise<void>;
}
```

### 7.3 Plugin 示例

**示例 1: 邮件分类 Plugin**:
```typescript
export default class EmailCategoryPlugin implements Plugin {
  name = 'email-category';
  version = '1.0.0';
  permissions = [PluginPermission.READ_EMAILS, PluginPermission.WRITE_EMAILS];

  apply(api: PluginAPI) {
    // Hook: 在邮件保存前添加分类
    api.hooks.beforeEmailSave.tap('EmailCategory', (email) => {
      const category = this.detectCategory(email);
      email.metadata.category = category;
      return email;
    });
  }

  detectCategory(email: Email): string {
    if (email.from.includes('github.com')) return 'dev';
    if (email.subject.includes('invoice')) return 'finance';
    return 'general';
  }
}
```

**示例 2: Slack 通知 Plugin**:
```typescript
export default class SlackNotificationPlugin implements Plugin {
  name = 'slack-notification';
  version = '1.0.0';
  permissions = [PluginPermission.READ_EMAILS, PluginPermission.NETWORK];

  apply(api: PluginAPI) {
    const webhookURL = api.config.get('slack_webhook_url');

    // Event: 新邮件到达时发送 Slack 通知
    api.events.on('email.received', async (email) => {
      if (email.metadata.important) {
        await api.http.fetch(webhookURL, {
          method: 'POST',
          body: JSON.stringify({
            text: `New important email from ${email.from}: ${email.subject}`
          })
        });
      }
    });
  }
}
```

**示例 3: 自定义 CLI 命令 Plugin**:
```typescript
export default class CustomCommandPlugin implements Plugin {
  name = 'custom-command';
  version = '1.0.0';
  permissions = [PluginPermission.READ_EMAILS];

  apply(api: PluginAPI) {
    // 注册自定义命令
    api.cli.registerCommand('stats', async (options) => {
      const emails = await api.emails.find({ folder: 'INBOX' });
      console.log(`Total emails: ${emails.length}`);
    });
  }
}
```

---

## 8. Hook 点设计

### 8.1 邮件生命周期 Hook

```typescript
// 邮件接收流程
hooks.beforeEmailFetch    // IMAP 获取前
hooks.afterEmailFetch     // IMAP 获取后
hooks.beforeEmailParse    // 解析前
hooks.afterEmailParse     // 解析后
hooks.beforeEmailSave     // 保存到数据库前
hooks.afterEmailSave      // 保存到数据库后
hooks.afterEmailReceived  // 完整接收流程后

// 邮件发送流程
hooks.beforeEmailSend     // 发送前
hooks.afterEmailSend      // 发送后

// 邮件操作
hooks.beforeEmailDelete   // 删除前
hooks.afterEmailDelete    // 删除后
hooks.beforeEmailMove     // 移动前
hooks.afterEmailMove      // 移动后
```

### 8.2 同步流程 Hook

```typescript
hooks.beforeSync          // 同步开始前
hooks.afterSync           // 同步完成后
hooks.syncError           // 同步错误
```

### 8.3 CLI 命令 Hook

```typescript
hooks.beforeCommand       // 命令执行前
hooks.afterCommand        // 命令执行后
hooks.commandError        // 命令错误
```

---

## 9. 推荐方案

### 9.1 架构设计

**混合模式**:
- **Hook 系统**: 用于修改数据流
- **Event 系统**: 用于副作用操作
- **权限控制**: 声明式权限
- **沙箱隔离**: 文件系统和网络隔离

### 9.2 暴露内容

**推荐暴露**:
1. ✅ 邮件模型（只读 + metadata 写入）
2. ✅ 配置（只读 + Plugin 专属配置）
3. ✅ 高层 API（发送、搜索、标记）
4. ✅ 工具函数
5. ✅ 事件系统
6. ✅ Hook 系统
7. ✅ CLI 命令注册
8. ✅ HTTP API 注册

**不暴露**:
1. ❌ 直接数据库访问
2. ❌ 系统命令执行
3. ❌ 核心配置修改

### 9.3 Plugin 能力

**允许**:
1. ✅ 读取邮件
2. ✅ 添加 metadata
3. ✅ 扩展 CLI 命令
4. ✅ 添加 HTTP API
5. ✅ 监听和触发事件
6. ✅ 发送邮件
7. ✅ 调用外部服务
8. ✅ 修改邮件处理流程

**不允许**:
1. ❌ 修改核心字段
2. ❌ 执行系统命令
3. ❌ 访问任意文件

### 9.4 实施优先级

**P0 - 核心功能**:
1. Plugin 加载器
2. 基本 API（emails, config, events）
3. Event 系统
4. 权限检查

**P1 - 增强功能**:
5. Hook 系统
6. CLI 命令注册
7. HTTP API 注册
8. 沙箱隔离

**P2 - 高级功能**:
9. Plugin 市场
10. Plugin 更新机制
11. Plugin 监控

---

## 10. 参考资料

- Webpack Plugin API: https://webpack.js.org/api/plugins/
- Babel Plugin Handbook: https://github.com/jamiebuilds/babel-handbook
- Rollup Plugin API: https://rollupjs.org/plugin-development/
- ESLint Plugin: https://eslint.org/docs/latest/extend/plugins

---

## 11. 结论

**核心设计**:
1. **混合架构**: Hook（数据流） + Event（副作用）
2. **权限控制**: 声明式权限，运行时检查
3. **沙箱隔离**: 文件系统和网络隔离
4. **清晰边界**: 明确暴露内容和 Plugin 能力

**核心原则**:
- 安全优先（权限控制、沙箱隔离）
- 灵活性（Hook + Event）
- 易用性（清晰的 API）
- 可扩展性（CLI 命令、HTTP API）
