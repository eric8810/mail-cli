#!/usr/bin/env node
"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// src/config/defaults.ts
var defaults, defaults_default;
var init_defaults = __esm({
  "src/config/defaults.ts"() {
    "use strict";
    defaults = {
      imap: {
        host: "",
        port: 993,
        secure: true,
        user: "",
        password: ""
      },
      smtp: {
        host: "",
        port: 465,
        secure: true,
        user: "",
        password: ""
      },
      storage: {
        dataDir: "./data",
        maxAttachmentSize: 10 * 1024 * 1024
      },
      sync: {
        autoSync: false,
        syncInterval: 3e5,
        folders: ["INBOX"],
        enableDaemon: false,
        selectiveSyncEnabled: false,
        syncSince: null,
        concurrentFolders: 3,
        retryOnError: true,
        maxRetries: 3,
        retryDelay: 5e3
      },
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
    };
    defaults_default = defaults;
  }
});

// src/config/schema.ts
function isRecord(value) {
  return typeof value === "object" && value !== null;
}
function getStringField(source, key) {
  const value = source[key];
  return typeof value === "string" ? value : void 0;
}
function getNumberField(source, key) {
  const value = source[key];
  return typeof value === "number" ? value : void 0;
}
function validateConfig(config) {
  const errors = [];
  if (!isRecord(config)) {
    return {
      valid: false,
      errors: ["Config must be an object"]
    };
  }
  const imap = isRecord(config.imap) ? config.imap : null;
  const smtp = isRecord(config.smtp) ? config.smtp : null;
  if (imap) {
    if (!getStringField(imap, "host")) {
      errors.push("IMAP host is required");
    }
    if (!getStringField(imap, "user")) {
      errors.push("IMAP user is required");
    }
    if (!getStringField(imap, "password")) {
      errors.push("IMAP password is required");
    }
    const imapPort = getNumberField(imap, "port");
    if (imapPort === void 0 || imapPort < 1 || imapPort > 65535) {
      errors.push("IMAP port must be between 1 and 65535");
    }
  }
  if (smtp) {
    if (!getStringField(smtp, "host")) {
      errors.push("SMTP host is required");
    }
    if (!getStringField(smtp, "user")) {
      errors.push("SMTP user is required");
    }
    if (!getStringField(smtp, "password")) {
      errors.push("SMTP password is required");
    }
    const smtpPort = getNumberField(smtp, "port");
    if (smtpPort === void 0 || smtpPort < 1 || smtpPort > 65535) {
      errors.push("SMTP port must be between 1 and 65535");
    }
  }
  return {
    valid: errors.length === 0,
    errors
  };
}
var init_schema = __esm({
  "src/config/schema.ts"() {
    "use strict";
  }
});

// src/utils/errors.ts
var MailClientError, ConfigError, ConnectionError, AuthenticationError, SyncError, StorageError, ValidationError;
var init_errors = __esm({
  "src/utils/errors.ts"() {
    "use strict";
    MailClientError = class extends Error {
      code;
      /**
       * Create a typed mail client error.
       */
      constructor(message, code = "MAIL_CLIENT_ERROR") {
        super(message);
        this.name = "MailClientError";
        this.code = code;
        Error.captureStackTrace?.(this, new.target);
      }
    };
    ConfigError = class extends MailClientError {
      /**
       * Create a config error instance.
       */
      constructor(message, code = "CONFIG_ERROR") {
        super(message, code);
        this.name = "ConfigError";
      }
    };
    ConnectionError = class extends MailClientError {
      /**
       * Create a connection error instance.
       */
      constructor(message, code = "CONNECTION_ERROR") {
        super(message, code);
        this.name = "ConnectionError";
      }
    };
    AuthenticationError = class extends MailClientError {
      /**
       * Create an authentication error instance.
       */
      constructor(message, code = "AUTH_ERROR") {
        super(message, code);
        this.name = "AuthenticationError";
      }
    };
    SyncError = class extends MailClientError {
      /**
       * Create a sync error instance.
       */
      constructor(message, code = "SYNC_ERROR") {
        super(message, code);
        this.name = "SyncError";
      }
    };
    StorageError = class extends MailClientError {
      /**
       * Create a storage error instance.
       */
      constructor(message, code = "STORAGE_ERROR") {
        super(message, code);
        this.name = "StorageError";
      }
    };
    ValidationError = class extends MailClientError {
      /**
       * Create a validation error instance.
       */
      constructor(message, code = "VALIDATION_ERROR") {
        super(message, code);
        this.name = "ValidationError";
      }
    };
  }
});

// src/utils/helpers.ts
function encrypt(text, key = null) {
  const encryptionKey = key ?? getEncryptionKey();
  const iv = import_node_crypto.default.randomBytes(16);
  const cipher = import_node_crypto.default.createCipheriv(
    "aes-256-cbc",
    Buffer.from(encryptionKey, "hex"),
    iv
  );
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  return `${iv.toString("hex")}:${encrypted}`;
}
function decrypt(encryptedText, key = null) {
  const encryptionKey = key ?? getEncryptionKey();
  const parts = encryptedText.split(":");
  const iv = Buffer.from(parts[0], "hex");
  const encrypted = parts[1];
  const decipher = import_node_crypto.default.createDecipheriv(
    "aes-256-cbc",
    Buffer.from(encryptionKey, "hex"),
    iv
  );
  let decrypted = decipher.update(encrypted, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}
function getEncryptionKey() {
  const machineId = `${import_node_os.default.hostname()}${import_node_os.default.userInfo().username}`;
  return import_node_crypto.default.createHash("sha256").update(machineId).digest("hex");
}
function getConfigDir() {
  if (process.platform === "win32") {
    return import_node_path.default.join(
      process.env.APPDATA ?? import_node_path.default.join(import_node_os.default.homedir(), "AppData", "Roaming"),
      "open-mail-client"
    );
  }
  return import_node_path.default.join(import_node_os.default.homedir(), ".config", "open-mail-client");
}
function getDataDir() {
  if (process.platform === "win32") {
    return import_node_path.default.join(
      process.env.LOCALAPPDATA ?? import_node_path.default.join(import_node_os.default.homedir(), "AppData", "Local"),
      "open-mail-client"
    );
  }
  return import_node_path.default.join(import_node_os.default.homedir(), ".local", "share", "open-mail-client");
}
function formatDate(date) {
  if (!date) {
    return "";
  }
  const parsedDate = new Date(date);
  return parsedDate.toISOString().split("T")[0];
}
function truncate(str, maxLength = 50) {
  if (!str) {
    return "";
  }
  if (str.length <= maxLength) {
    return str;
  }
  return `${str.substring(0, maxLength - 3)}...`;
}
var import_node_crypto, import_node_os, import_node_path;
var init_helpers = __esm({
  "src/utils/helpers.ts"() {
    "use strict";
    import_node_crypto = __toESM(require("crypto"));
    import_node_os = __toESM(require("os"));
    import_node_path = __toESM(require("path"));
  }
});

// src/utils/logger.ts
var import_node_fs, import_node_path2, Logger, logger, error, warn, info, debug, setLevel, logger_default;
var init_logger = __esm({
  "src/utils/logger.ts"() {
    "use strict";
    import_node_fs = __toESM(require("fs"));
    import_node_path2 = __toESM(require("path"));
    Logger = class {
      logDir;
      logFile;
      levels;
      currentLevel;
      enableConsole;
      /**
       * Create a logger instance.
       */
      constructor(logDir = null) {
        this.logDir = logDir ?? import_node_path2.default.join(process.cwd(), "data", "logs");
        this.logFile = import_node_path2.default.join(this.logDir, "open-mail-client.log");
        this.levels = {
          ERROR: 0,
          WARN: 1,
          INFO: 2,
          DEBUG: 3
        };
        this.currentLevel = this.levels.INFO;
        this.enableConsole = false;
        this.ensureLogDir();
      }
      /**
       * Ensure the target log directory exists.
       */
      ensureLogDir() {
        if (!import_node_fs.default.existsSync(this.logDir)) {
          import_node_fs.default.mkdirSync(this.logDir, { recursive: true });
        }
      }
      /**
       * Build a timestamped log line.
       */
      formatMessage(level, message, meta = {}) {
        const timestamp = (/* @__PURE__ */ new Date()).toISOString();
        const metaStr = Object.keys(meta).length > 0 ? ` ${JSON.stringify(meta)}` : "";
        return `[${timestamp}] [${level}] ${message}${metaStr}`;
      }
      /**
       * Persist a log line to disk.
       */
      writeToFile(message) {
        try {
          import_node_fs.default.appendFileSync(this.logFile, `${message}
`);
        } catch (error2) {
          const failureMessage = error2 instanceof Error ? error2.message : String(error2);
          console.error("Failed to write to log file:", failureMessage);
        }
      }
      /**
       * Log a message for a specific level.
       */
      log(level, message, meta = {}) {
        if (this.levels[level] <= this.currentLevel) {
          const formattedMessage = this.formatMessage(level, message, meta);
          if (this.enableConsole) {
            console.log(formattedMessage);
          }
          this.writeToFile(formattedMessage);
        }
      }
      /**
       * Log an error-level message.
       */
      error(message, meta = {}) {
        this.log("ERROR", message, meta);
      }
      /**
       * Log a warn-level message.
       */
      warn(message, meta = {}) {
        this.log("WARN", message, meta);
      }
      /**
       * Log an info-level message.
       */
      info(message, meta = {}) {
        this.log("INFO", message, meta);
      }
      /**
       * Log a debug-level message.
       */
      debug(message, meta = {}) {
        this.log("DEBUG", message, meta);
      }
      /**
       * Update current logging level.
       */
      setLevel(level) {
        if (this.levels[level] !== void 0) {
          this.currentLevel = this.levels[level];
        }
      }
    };
    logger = new Logger();
    error = logger.error.bind(logger);
    warn = logger.warn.bind(logger);
    info = logger.info.bind(logger);
    debug = logger.debug.bind(logger);
    setLevel = logger.setLevel.bind(logger);
    logger_default = logger;
  }
});

// src/config/index.ts
function isRecord2(value) {
  return typeof value === "object" && value !== null;
}
function getErrorMessage(error2) {
  return error2 instanceof Error ? error2.message : String(error2);
}
function cloneConfig(config) {
  return JSON.parse(JSON.stringify(config));
}
function mergeWithDefaults(config) {
  return {
    ...defaults_default,
    ...config,
    imap: {
      ...defaults_default.imap,
      ...config.imap ?? {}
    },
    smtp: {
      ...defaults_default.smtp,
      ...config.smtp ?? {}
    },
    storage: {
      ...defaults_default.storage,
      ...config.storage ?? {}
    },
    sync: {
      ...defaults_default.sync,
      ...config.sync ?? {}
    },
    notifications: {
      ...defaults_default.notifications,
      ...config.notifications ?? {},
      filters: {
        ...defaults_default.notifications.filters,
        ...config.notifications?.filters ?? {}
      }
    }
  };
}
var import_node_fs2, import_node_path3, ConfigManager, configManager, config_default;
var init_config = __esm({
  "src/config/index.ts"() {
    "use strict";
    import_node_fs2 = __toESM(require("fs"));
    import_node_path3 = __toESM(require("path"));
    init_defaults();
    init_schema();
    init_errors();
    init_helpers();
    init_logger();
    ConfigManager = class {
      configDir;
      configFile;
      config;
      /**
       * Create config manager.
       */
      constructor(configDir = null) {
        this.configDir = configDir ?? getConfigDir();
        this.configFile = import_node_path3.default.join(this.configDir, "config.json");
        this.config = null;
      }
      /**
       * Ensure config directory exists.
       */
      ensureConfigDir() {
        if (!import_node_fs2.default.existsSync(this.configDir)) {
          import_node_fs2.default.mkdirSync(this.configDir, { recursive: true });
          logger_default.info("Created config directory", { path: this.configDir });
        }
      }
      /**
       * Load configuration from file.
       */
      load() {
        try {
          if (!import_node_fs2.default.existsSync(this.configFile)) {
            logger_default.info("Config file not found, using defaults");
            this.config = cloneConfig(defaults_default);
            return this.config;
          }
          const data = import_node_fs2.default.readFileSync(this.configFile, "utf8");
          const parsedConfig = JSON.parse(data);
          const loadedConfig = mergeWithDefaults(parsedConfig);
          if (typeof loadedConfig.imap.password === "string" && loadedConfig.imap.password.length > 0) {
            loadedConfig.imap.password = this.decrypt(loadedConfig.imap.password);
          }
          if (typeof loadedConfig.smtp.password === "string" && loadedConfig.smtp.password.length > 0) {
            loadedConfig.smtp.password = this.decrypt(loadedConfig.smtp.password);
          }
          this.config = loadedConfig;
          logger_default.info("Configuration loaded successfully");
          return this.config;
        } catch (error2) {
          const errorMessage = getErrorMessage(error2);
          logger_default.error("Failed to load configuration", { error: errorMessage });
          throw new ConfigError(`Failed to load configuration: ${errorMessage}`);
        }
      }
      /**
       * Save configuration to file.
       */
      save(config = null) {
        try {
          this.ensureConfigDir();
          const configToSave = config ?? this.config;
          if (!configToSave) {
            throw new ConfigError("No configuration to save");
          }
          const validation = this.validate(configToSave);
          if (!validation.valid) {
            throw new ConfigError(
              `Invalid configuration: ${validation.errors.join(", ")}`
            );
          }
          const encryptedConfig = cloneConfig(configToSave);
          if (encryptedConfig.imap.password) {
            encryptedConfig.imap.password = this.encrypt(
              encryptedConfig.imap.password
            );
          }
          if (encryptedConfig.smtp.password) {
            encryptedConfig.smtp.password = this.encrypt(
              encryptedConfig.smtp.password
            );
          }
          import_node_fs2.default.writeFileSync(
            this.configFile,
            JSON.stringify(encryptedConfig, null, 2)
          );
          this.config = configToSave;
          logger_default.info("Configuration saved successfully");
          return true;
        } catch (error2) {
          const errorMessage = getErrorMessage(error2);
          logger_default.error("Failed to save configuration", { error: errorMessage });
          throw new ConfigError(`Failed to save configuration: ${errorMessage}`);
        }
      }
      /**
       * Get configuration value by dot-separated key.
       */
      get(key) {
        if (!this.config) {
          this.load();
        }
        const keys = key.split(".");
        let value = this.config;
        for (const currentKey of keys) {
          if (!isRecord2(value)) {
            return void 0;
          }
          value = value[currentKey];
        }
        return value;
      }
      /**
       * Set configuration value by dot-separated key.
       */
      set(key, value) {
        if (!this.config) {
          this.load();
        }
        if (!this.config) {
          return;
        }
        const keys = key.split(".");
        let target = this.config;
        for (let index = 0; index < keys.length - 1; index += 1) {
          const segment = keys[index];
          const currentValue = target[segment];
          if (!isRecord2(currentValue)) {
            target[segment] = {};
          }
          target = target[segment];
        }
        target[keys[keys.length - 1]] = value;
      }
      /**
       * Validate configuration.
       */
      validate(config = null) {
        const configToValidate = config ?? this.config;
        return validateConfig(configToValidate);
      }
      /**
       * Encrypt sensitive data.
       */
      encrypt(value) {
        return encrypt(value);
      }
      /**
       * Decrypt sensitive data.
       */
      decrypt(value) {
        return decrypt(value);
      }
      /**
       * Check if configuration exists on disk.
       */
      exists() {
        return import_node_fs2.default.existsSync(this.configFile);
      }
    };
    configManager = new ConfigManager();
    config_default = configManager;
  }
});

// src/imap/client.ts
var import_mailparser, import_node_imap, IMAPClient, client_default;
var init_client = __esm({
  "src/imap/client.ts"() {
    "use strict";
    import_mailparser = require("mailparser");
    import_node_imap = __toESM(require("node-imap"));
    init_errors();
    init_logger();
    IMAPClient = class {
      config;
      imap;
      connected;
      constructor(config) {
        this.config = config;
        this.imap = null;
        this.connected = false;
      }
      async connect() {
        return new Promise((resolve, reject) => {
          try {
            this.imap = new import_node_imap.default({
              user: this.config.user,
              password: this.config.password,
              host: this.config.host,
              port: this.config.port,
              tls: this.config.secure,
              tlsOptions: { rejectUnauthorized: false }
            });
            this.imap.once("ready", () => {
              this.connected = true;
              logger_default.info("IMAP connection established", {
                host: this.config.host
              });
              resolve();
            });
            this.imap.once("error", (err) => {
              logger_default.error("IMAP connection error", { error: err.message });
              if (err.message.includes("auth")) {
                reject(
                  new AuthenticationError(`Authentication failed: ${err.message}`)
                );
              } else {
                reject(new ConnectionError(`Connection failed: ${err.message}`));
              }
            });
            this.imap.once("end", () => {
              this.connected = false;
              logger_default.info("IMAP connection ended");
            });
            this.imap.connect();
          } catch (error2) {
            const err = error2;
            logger_default.error("Failed to connect to IMAP", { error: err.message });
            reject(new ConnectionError(`Failed to connect: ${err.message}`));
          }
        });
      }
      disconnect() {
        if (this.imap && this.connected) {
          this.imap.end();
          logger_default.info("IMAP disconnected");
        }
      }
      getImap() {
        return this.imap;
      }
      listFolders() {
        return new Promise((resolve, reject) => {
          if (!this.connected) {
            return reject(new ConnectionError("Not connected to IMAP server"));
          }
          this.imap.getBoxes((err, boxes) => {
            if (err) {
              logger_default.error("Failed to list folders", { error: err.message });
              return reject(
                new ConnectionError(`Failed to list folders: ${err.message}`)
              );
            }
            const folders = this._flattenBoxes(boxes);
            logger_default.debug("Folders listed", { count: folders.length });
            resolve(folders);
          });
        });
      }
      openFolder(folderName = "INBOX", readOnly = true) {
        return new Promise((resolve, reject) => {
          if (!this.connected) {
            return reject(new ConnectionError("Not connected to IMAP server"));
          }
          this.imap.openBox(
            folderName,
            readOnly,
            (err, box) => {
              if (err) {
                logger_default.error("Failed to open folder", {
                  folder: folderName,
                  error: err.message
                });
                return reject(
                  new ConnectionError(`Failed to open folder: ${err.message}`)
                );
              }
              logger_default.debug("Folder opened", {
                folder: folderName,
                messages: box.messages?.total || 0
              });
              resolve(box);
            }
          );
        });
      }
      fetchEmails(criteria = ["ALL"], options = {}) {
        return new Promise((resolve, reject) => {
          if (!this.connected) {
            return reject(new ConnectionError("Not connected to IMAP server"));
          }
          const searchStartTime = Date.now();
          this.imap.search(criteria, async (err, uids) => {
            if (err) {
              logger_default.error("Failed to search emails", { error: err.message });
              return reject(
                new ConnectionError(`Failed to search emails: ${err.message}`)
              );
            }
            if (!uids || uids.length === 0) {
              logger_default.debug("No emails found");
              return resolve([]);
            }
            logger_default.info("[PERF] Email search completed", {
              count: uids.length,
              duration: `${Date.now() - searchStartTime}ms`
            });
            const batchSize = options.batchSize || 100;
            const fetchBody = options.fetchBody || false;
            const allEmails = [];
            try {
              for (let i = 0; i < uids.length; i += batchSize) {
                const batchUids = uids.slice(i, i + batchSize);
                const batchNum = Math.floor(i / batchSize) + 1;
                const totalBatches = Math.ceil(uids.length / batchSize);
                logger_default.info("[PERF] Fetching batch", {
                  batch: `${batchNum}/${totalBatches}`,
                  uids: `${i + 1}-${Math.min(i + batchSize, uids.length)}`,
                  count: batchUids.length,
                  mode: fetchBody ? "full" : "headers-only"
                });
                const batchEmails = await this._fetchBatch(batchUids, fetchBody);
                allEmails.push(...batchEmails);
                logger_default.info("[PERF] Batch fetched", {
                  batch: `${batchNum}/${totalBatches}`,
                  count: batchEmails.length,
                  total: allEmails.length
                });
              }
              logger_default.info("[PERF] All batches fetched", {
                totalCount: allEmails.length,
                duration: `${Date.now() - searchStartTime}ms`
              });
              resolve(allEmails);
            } catch (error2) {
              reject(error2);
            }
          });
        });
      }
      _fetchBatch(uids, fetchBody = false) {
        return new Promise((resolve, reject) => {
          const fetchStartTime = Date.now();
          const emails = [];
          const totalInBatch = uids.length;
          let completedInBatch = 0;
          let totalBytesReceived = 0;
          const fetchOptions = {
            bodies: fetchBody ? "" : "HEADER",
            struct: true
          };
          const fetch = this.imap.fetch(uids, fetchOptions);
          fetch.on("message", (msg, seqno) => {
            const msgStartTime = Date.now();
            const emailData = {
              uid: null,
              attributes: null,
              body: "",
              headers: null
            };
            let bytesReceived = 0;
            msg.on(
              "body",
              (stream, info2) => {
                let buffer = "";
                stream.on("data", (chunk) => {
                  const chunkSize = chunk.length;
                  bytesReceived += chunkSize;
                  totalBytesReceived += chunkSize;
                  buffer += chunk.toString("utf8");
                  if (fetchBody && bytesReceived > 100 * 1024 && bytesReceived % (50 * 1024) < chunkSize) {
                    logger_default.debug("[PERF] Receiving large email", {
                      uid: emailData.uid || "unknown",
                      received: `${Math.round(bytesReceived / 1024)}KB`,
                      progress: `${completedInBatch + 1}/${totalInBatch}`
                    });
                  }
                });
                stream.once("end", () => {
                  if (info2.which === "HEADER") {
                    emailData.headers = buffer;
                  } else {
                    emailData.body = buffer;
                  }
                });
              }
            );
            msg.once("attributes", (attrs) => {
              emailData.uid = attrs.uid;
              emailData.attributes = attrs;
            });
            msg.once("end", () => {
              completedInBatch++;
              emails.push({
                uid: emailData.uid,
                attributes: emailData.attributes,
                body: emailData.body,
                headers: emailData.headers
              });
              const elapsedTime = Date.now() - fetchStartTime;
              const avgTimePerMsg = elapsedTime / completedInBatch;
              const estimatedRemaining = Math.round(
                avgTimePerMsg * (totalInBatch - completedInBatch) / 1e3
              );
              logger_default.info("[PERF] Message fetched", {
                uid: emailData.uid,
                progress: `${completedInBatch}/${totalInBatch}`,
                percentage: `${Math.round(completedInBatch / totalInBatch * 100)}%`,
                size: `${Math.round(bytesReceived / 1024)}KB`,
                duration: `${Date.now() - msgStartTime}ms`,
                totalReceived: `${Math.round(totalBytesReceived / 1024)}KB`,
                estimatedRemaining: estimatedRemaining > 0 ? `${estimatedRemaining}s` : "finishing"
              });
            });
          });
          fetch.once("error", (err) => {
            logger_default.error("Fetch batch error", { error: err.message });
            reject(new ConnectionError(`Fetch batch error: ${err.message}`));
          });
          fetch.once("end", () => {
            const totalDuration = Date.now() - fetchStartTime;
            const avgSpeed = totalBytesReceived / (totalDuration / 1e3);
            logger_default.info("[PERF] Batch fetch completed", {
              count: emails.length,
              duration: `${totalDuration}ms`,
              totalSize: `${Math.round(totalBytesReceived / 1024)}KB`,
              avgSpeed: `${Math.round(avgSpeed / 1024)}KB/s`,
              avgPerMessage: emails.length > 0 ? `${Math.round(totalDuration / emails.length)}ms` : "N/A"
            });
            resolve(emails);
          });
        });
      }
      fetchEmailById(uid) {
        return new Promise((resolve, reject) => {
          if (!this.connected) {
            return reject(new ConnectionError("Not connected to IMAP server"));
          }
          const fetch = this.imap.fetch([uid], {
            bodies: "",
            struct: true
          });
          const emailData = {
            uid: null,
            attributes: null,
            body: "",
            headers: null
          };
          fetch.on("message", (msg) => {
            msg.on("body", (stream) => {
              let buffer = "";
              stream.on("data", (chunk) => {
                buffer += chunk.toString("utf8");
              });
              stream.once("end", () => {
                emailData.body = buffer;
              });
            });
            msg.once("attributes", (attrs) => {
              emailData.uid = attrs.uid;
              emailData.attributes = attrs;
            });
          });
          fetch.once("error", (err) => {
            logger_default.error("Fetch error", { uid, error: err.message });
            reject(new ConnectionError(`Fetch error: ${err.message}`));
          });
          fetch.once("end", () => {
            logger_default.debug("Email fetched", { uid });
            resolve({
              uid: emailData.uid,
              attributes: emailData.attributes,
              body: emailData.body,
              headers: emailData.headers
            });
          });
        });
      }
      async fetchEmailBody(uid) {
        const startTime = Date.now();
        try {
          logger_default.info("[PERF] Fetching email body on demand", { uid });
          const emailData = await this.fetchEmailById(uid);
          const parsed = await this.parseEmail(emailData);
          logger_default.info("[PERF] Email body fetched", {
            uid,
            duration: `${Date.now() - startTime}ms`,
            bodyTextSize: `${Math.round((parsed.bodyText?.length || 0) / 1024)}KB`,
            bodyHtmlSize: `${Math.round((parsed.bodyHtml?.length || 0) / 1024)}KB`
          });
          return {
            bodyText: parsed.bodyText,
            bodyHtml: parsed.bodyHtml,
            attachments: parsed.attachments
          };
        } catch (error2) {
          const err = error2;
          logger_default.error("Failed to fetch email body", { uid, error: err.message });
          throw error2;
        }
      }
      markAsRead(uid) {
        return new Promise((resolve, reject) => {
          if (!this.connected) {
            return reject(new ConnectionError("Not connected to IMAP server"));
          }
          this.imap.addFlags(uid, ["\\Seen"], (err) => {
            if (err) {
              logger_default.error("Failed to mark as read", { uid, error: err.message });
              return reject(
                new ConnectionError(`Failed to mark as read: ${err.message}`)
              );
            }
            logger_default.debug("Email marked as read", { uid });
            resolve();
          });
        });
      }
      markAsUnread(uid) {
        return new Promise((resolve, reject) => {
          if (!this.connected) {
            return reject(new ConnectionError("Not connected to IMAP server"));
          }
          this.imap.delFlags(uid, ["\\Seen"], (err) => {
            if (err) {
              logger_default.error("Failed to mark as unread", { uid, error: err.message });
              return reject(
                new ConnectionError(`Failed to mark as unread: ${err.message}`)
              );
            }
            logger_default.debug("Email marked as unread", { uid });
            resolve();
          });
        });
      }
      moveEmail(uid, targetFolder) {
        return new Promise((resolve, reject) => {
          if (!this.connected) {
            return reject(new ConnectionError("Not connected to IMAP server"));
          }
          this.imap.move(uid, targetFolder, (err) => {
            if (err) {
              logger_default.error("Failed to move email", {
                uid,
                targetFolder,
                error: err.message
              });
              return reject(
                new ConnectionError(`Failed to move email: ${err.message}`)
              );
            }
            logger_default.debug("Email moved", { uid, targetFolder });
            resolve();
          });
        });
      }
      copyEmail(uid, targetFolder) {
        return new Promise((resolve, reject) => {
          if (!this.connected) {
            return reject(new ConnectionError("Not connected to IMAP server"));
          }
          this.imap.copy(uid, targetFolder, (err) => {
            if (err) {
              logger_default.error("Failed to copy email", {
                uid,
                targetFolder,
                error: err.message
              });
              return reject(
                new ConnectionError(`Failed to copy email: ${err.message}`)
              );
            }
            logger_default.debug("Email copied", { uid, targetFolder });
            resolve();
          });
        });
      }
      createFolder(folderName) {
        return new Promise((resolve, reject) => {
          if (!this.connected) {
            return reject(new ConnectionError("Not connected to IMAP server"));
          }
          this.imap.addBox(folderName, (err) => {
            if (err) {
              logger_default.error("Failed to create folder", {
                folderName,
                error: err.message
              });
              return reject(
                new ConnectionError(`Failed to create folder: ${err.message}`)
              );
            }
            logger_default.debug("Folder created on server", { folderName });
            resolve();
          });
        });
      }
      deleteFolder(folderName) {
        return new Promise((resolve, reject) => {
          if (!this.connected) {
            return reject(new ConnectionError("Not connected to IMAP server"));
          }
          this.imap.delBox(folderName, (err) => {
            if (err) {
              logger_default.error("Failed to delete folder", {
                folderName,
                error: err.message
              });
              return reject(
                new ConnectionError(`Failed to delete folder: ${err.message}`)
              );
            }
            logger_default.debug("Folder deleted from server", { folderName });
            resolve();
          });
        });
      }
      renameFolder(oldName, newName) {
        return new Promise((resolve, reject) => {
          if (!this.connected) {
            return reject(new ConnectionError("Not connected to IMAP server"));
          }
          this.imap.renameBox(oldName, newName, (err) => {
            if (err) {
              logger_default.error("Failed to rename folder", {
                oldName,
                newName,
                error: err.message
              });
              return reject(
                new ConnectionError(`Failed to rename folder: ${err.message}`)
              );
            }
            logger_default.debug("Folder renamed on server", { oldName, newName });
            resolve();
          });
        });
      }
      batchMoveEmails(uids, targetFolder) {
        return new Promise((resolve, reject) => {
          if (!this.connected) {
            return reject(new ConnectionError("Not connected to IMAP server"));
          }
          if (!uids || uids.length === 0) {
            return resolve();
          }
          this.imap.move(uids, targetFolder, (err) => {
            if (err) {
              logger_default.error("Failed to batch move emails", {
                count: uids.length,
                targetFolder,
                error: err.message
              });
              return reject(
                new ConnectionError(`Failed to batch move emails: ${err.message}`)
              );
            }
            logger_default.debug("Emails batch moved", {
              count: uids.length,
              targetFolder
            });
            resolve();
          });
        });
      }
      batchCopyEmails(uids, targetFolder) {
        return new Promise((resolve, reject) => {
          if (!this.connected) {
            return reject(new ConnectionError("Not connected to IMAP server"));
          }
          if (!uids || uids.length === 0) {
            return resolve();
          }
          this.imap.copy(uids, targetFolder, (err) => {
            if (err) {
              logger_default.error("Failed to batch copy emails", {
                count: uids.length,
                targetFolder,
                error: err.message
              });
              return reject(
                new ConnectionError(`Failed to batch copy emails: ${err.message}`)
              );
            }
            logger_default.debug("Emails batch copied", {
              count: uids.length,
              targetFolder
            });
            resolve();
          });
        });
      }
      deleteEmail(uid, permanent = false) {
        return new Promise((resolve, reject) => {
          if (!this.connected) {
            return reject(new ConnectionError("Not connected to IMAP server"));
          }
          if (permanent) {
            this.imap.addFlags(uid, ["\\Deleted"], (err) => {
              if (err) {
                logger_default.error("Failed to mark email for deletion", {
                  uid,
                  error: err.message
                });
                return reject(
                  new ConnectionError(`Failed to mark for deletion: ${err.message}`)
                );
              }
              this.imap.expunge((expungeErr) => {
                if (expungeErr) {
                  logger_default.error("Failed to expunge email", {
                    uid,
                    error: expungeErr.message
                  });
                  return reject(
                    new ConnectionError(`Failed to expunge: ${expungeErr.message}`)
                  );
                }
                logger_default.debug("Email permanently deleted", { uid });
                resolve();
              });
            });
          } else {
            this.moveEmail(uid, "Trash").then(resolve).catch(reject);
          }
        });
      }
      batchDeleteEmails(uids, permanent = false) {
        return new Promise((resolve, reject) => {
          if (!this.connected) {
            return reject(new ConnectionError("Not connected to IMAP server"));
          }
          if (!uids || uids.length === 0) {
            return resolve();
          }
          if (permanent) {
            this.imap.addFlags(uids, ["\\Deleted"], (err) => {
              if (err) {
                logger_default.error("Failed to mark emails for deletion", {
                  count: uids.length,
                  error: err.message
                });
                return reject(
                  new ConnectionError(`Failed to mark for deletion: ${err.message}`)
                );
              }
              this.imap.expunge((expungeErr) => {
                if (expungeErr) {
                  logger_default.error("Failed to expunge emails", {
                    count: uids.length,
                    error: expungeErr.message
                  });
                  return reject(
                    new ConnectionError(`Failed to expunge: ${expungeErr.message}`)
                  );
                }
                logger_default.debug("Emails permanently deleted", { count: uids.length });
                resolve();
              });
            });
          } else {
            this.imap.move(uids, "Trash", (err) => {
              if (err) {
                logger_default.error("Failed to move emails to trash", {
                  count: uids.length,
                  error: err.message
                });
                return reject(
                  new ConnectionError(`Failed to move to trash: ${err.message}`)
                );
              }
              logger_default.debug("Emails moved to trash", { count: uids.length });
              resolve();
            });
          }
        });
      }
      async parseEmail(emailData) {
        const parseStartTime = Date.now();
        try {
          const contentToParse = emailData.body || emailData.headers || "";
          const parsed = await (0, import_mailparser.simpleParser)(contentToParse);
          const date = parsed.date || /* @__PURE__ */ new Date();
          const dateString = date instanceof Date ? date.toISOString() : String(date);
          const result = {
            uid: emailData.uid,
            messageId: parsed.messageId || void 0,
            from: Array.isArray(parsed.from) ? parsed.from.map((f) => f.text).join(", ") : parsed.from?.text || "",
            to: Array.isArray(parsed.to) ? parsed.to.map((t) => t.text).join(", ") : parsed.to?.text || "",
            cc: Array.isArray(parsed.cc) ? parsed.cc.map((c) => c.text).join(", ") : parsed.cc?.text || "",
            subject: parsed.subject || "",
            date: dateString,
            bodyText: parsed.text || "",
            bodyHtml: parsed.html || "",
            attachments: parsed.attachments || [],
            flags: emailData.attributes?.flags || []
          };
          logger_default.debug("[PERF] Email parsing completed", {
            uid: emailData.uid,
            duration: `${Date.now() - parseStartTime}ms`,
            mode: emailData.body ? "full" : "headers-only",
            bodyTextSize: result.bodyText ? `${Math.round(result.bodyText.length / 1024)}KB` : "0KB",
            bodyHtmlSize: result.bodyHtml ? `${Math.round(result.bodyHtml.length / 1024)}KB` : "0KB",
            attachmentCount: result.attachments.length
          });
          return result;
        } catch (error2) {
          const err = error2;
          logger_default.error("Failed to parse email", { error: err.message });
          throw error2;
        }
      }
      _flattenBoxes(boxes, prefix = "") {
        const folders = [];
        for (const [name, box] of Object.entries(boxes)) {
          const fullName = prefix ? `${prefix}${box.delimiter}${name}` : name;
          folders.push({
            name: fullName,
            delimiter: box.delimiter,
            flags: box.attribs || []
          });
          const boxWithChildren = box;
          if (boxWithChildren.children) {
            folders.push(...this._flattenBoxes(boxWithChildren.children, fullName));
          }
        }
        return folders;
      }
    };
    client_default = IMAPClient;
  }
});

// src/smtp/client.ts
var import_nodemailer, SMTPClient, client_default2;
var init_client2 = __esm({
  "src/smtp/client.ts"() {
    "use strict";
    import_nodemailer = __toESM(require("nodemailer"));
    init_errors();
    init_logger();
    SMTPClient = class {
      config;
      transporter;
      constructor(config) {
        this.config = config;
        this.transporter = null;
      }
      async connect() {
        try {
          this.transporter = import_nodemailer.default.createTransport({
            host: this.config.host,
            port: this.config.port,
            secure: this.config.secure,
            auth: {
              user: this.config.user,
              pass: this.config.password
            }
          });
          await this.transporter.verify();
          logger_default.info("SMTP connection established", { host: this.config.host });
          return true;
        } catch (error2) {
          const err = error2;
          logger_default.error("SMTP connection failed", { error: err.message });
          if (err.message.includes("auth")) {
            throw new AuthenticationError(`Authentication failed: ${err.message}`);
          } else {
            throw new ConnectionError(`Connection failed: ${err.message}`);
          }
        }
      }
      async verifyConnection() {
        try {
          if (!this.transporter) {
            await this.connect();
          }
          await this.transporter.verify();
          return true;
        } catch (error2) {
          const err = error2;
          logger_default.error("SMTP verification failed", { error: err.message });
          throw new ConnectionError(`Verification failed: ${err.message}`);
        }
      }
      async sendEmail(emailData) {
        try {
          if (!this.transporter) {
            await this.connect();
          }
          const mailOptions = {
            from: emailData.from || this.config.user,
            to: emailData.to,
            cc: emailData.cc,
            bcc: emailData.bcc,
            subject: emailData.subject,
            text: emailData.text,
            html: emailData.html,
            attachments: emailData.attachments,
            inReplyTo: emailData.inReplyTo,
            references: emailData.references
          };
          const info2 = await this.transporter.sendMail(mailOptions);
          logger_default.info("Email sent successfully", {
            messageId: info2.messageId,
            to: emailData.to
          });
          return {
            success: true,
            messageId: info2.messageId || "",
            response: info2.response || ""
          };
        } catch (error2) {
          const err = error2;
          logger_default.error("Failed to send email", { error: err.message });
          throw new ConnectionError(`Failed to send email: ${err.message}`);
        }
      }
      disconnect() {
        if (this.transporter) {
          this.transporter.close();
          this.transporter = null;
          logger_default.info("SMTP connection closed");
        }
      }
    };
    client_default2 = SMTPClient;
  }
});

// src/storage/migrations/001_initial.ts
function up(db) {
  db.exec(createEmailsTable);
  db.exec(createAttachmentsTable);
  db.exec(createFoldersTable);
  createIndexes.forEach((indexSql) => db.exec(indexSql));
}
var createEmailsTable, createAttachmentsTable, createFoldersTable, createIndexes;
var init_initial = __esm({
  "src/storage/migrations/001_initial.ts"() {
    "use strict";
    createEmailsTable = `
CREATE TABLE IF NOT EXISTS emails (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  uid INTEGER NOT NULL,
  message_id TEXT UNIQUE,
  folder TEXT NOT NULL,
  from_address TEXT,
  to_address TEXT,
  cc_address TEXT,
  subject TEXT,
  date DATETIME,
  body_text TEXT,
  body_html TEXT,
  has_attachments BOOLEAN DEFAULT 0,
  is_read BOOLEAN DEFAULT 0,
  flags TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
`;
    createAttachmentsTable = `
CREATE TABLE IF NOT EXISTS attachments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email_id INTEGER NOT NULL,
  filename TEXT NOT NULL,
  content_type TEXT,
  size INTEGER,
  file_path TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (email_id) REFERENCES emails(id) ON DELETE CASCADE
);
`;
    createFoldersTable = `
CREATE TABLE IF NOT EXISTS folders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT UNIQUE NOT NULL,
  delimiter TEXT,
  flags TEXT,
  last_sync DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
`;
    createIndexes = [
      "CREATE INDEX IF NOT EXISTS idx_emails_uid ON emails(uid);",
      "CREATE INDEX IF NOT EXISTS idx_emails_folder ON emails(folder);",
      "CREATE INDEX IF NOT EXISTS idx_emails_date ON emails(date);",
      "CREATE INDEX IF NOT EXISTS idx_emails_from ON emails(from_address);",
      "CREATE INDEX IF NOT EXISTS idx_emails_subject ON emails(subject);",
      "CREATE INDEX IF NOT EXISTS idx_attachments_email_id ON attachments(email_id);"
    ];
  }
});

// src/storage/migrations/002_p0_features.ts
function getErrorMessage2(error2) {
  return error2 instanceof Error ? error2.message : String(error2);
}
function up2(db) {
  alterEmailsTable.forEach((sql) => {
    try {
      db.exec(sql);
    } catch (error2) {
      const errorMessage = getErrorMessage2(error2);
      if (!errorMessage.includes("duplicate column name")) {
        throw error2;
      }
    }
  });
  db.exec(createSignaturesTable);
  db.exec(createSpamRulesTable);
  db.exec(createBlacklistTable);
  db.exec(createWhitelistTable);
  createIndexes2.forEach((indexSql) => db.exec(indexSql));
  const insertDefaultRules = db.prepare(`
    INSERT INTO spam_rules (rule_type, pattern, action, priority)
    VALUES (?, ?, ?, ?)
  `);
  const defaultRules = [
    {
      type: "keyword",
      pattern: "viagra|cialis|lottery|winner|prize",
      action: "mark_spam",
      priority: 10
    },
    {
      type: "keyword",
      pattern: "click here|act now|limited time",
      action: "mark_spam",
      priority: 5
    },
    {
      type: "header",
      pattern: "X-Spam-Flag: YES",
      action: "mark_spam",
      priority: 20
    }
  ];
  defaultRules.forEach((rule) => {
    try {
      insertDefaultRules.run(
        rule.type,
        rule.pattern,
        rule.action,
        rule.priority
      );
    } catch {
    }
  });
}
var alterEmailsTable, createSignaturesTable, createSpamRulesTable, createBlacklistTable, createWhitelistTable, createIndexes2;
var init_p0_features = __esm({
  "src/storage/migrations/002_p0_features.ts"() {
    "use strict";
    alterEmailsTable = [
      "ALTER TABLE emails ADD COLUMN is_draft BOOLEAN DEFAULT 0;",
      "ALTER TABLE emails ADD COLUMN is_deleted BOOLEAN DEFAULT 0;",
      "ALTER TABLE emails ADD COLUMN is_spam BOOLEAN DEFAULT 0;",
      "ALTER TABLE emails ADD COLUMN in_reply_to TEXT;",
      "ALTER TABLE emails ADD COLUMN email_references TEXT;",
      "ALTER TABLE emails ADD COLUMN thread_id TEXT;",
      "ALTER TABLE emails ADD COLUMN deleted_at DATETIME;"
    ];
    createSignaturesTable = `
CREATE TABLE IF NOT EXISTS signatures (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  content_text TEXT,
  content_html TEXT,
  is_default BOOLEAN DEFAULT 0,
  account_email TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
`;
    createSpamRulesTable = `
CREATE TABLE IF NOT EXISTS spam_rules (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  rule_type TEXT NOT NULL,
  pattern TEXT NOT NULL,
  action TEXT NOT NULL,
  is_enabled BOOLEAN DEFAULT 1,
  priority INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
`;
    createBlacklistTable = `
CREATE TABLE IF NOT EXISTS blacklist (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email_address TEXT UNIQUE NOT NULL,
  domain TEXT,
  reason TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
`;
    createWhitelistTable = `
CREATE TABLE IF NOT EXISTS whitelist (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email_address TEXT UNIQUE NOT NULL,
  domain TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
`;
    createIndexes2 = [
      "CREATE INDEX IF NOT EXISTS idx_emails_is_draft ON emails(is_draft);",
      "CREATE INDEX IF NOT EXISTS idx_emails_is_deleted ON emails(is_deleted);",
      "CREATE INDEX IF NOT EXISTS idx_emails_is_spam ON emails(is_spam);",
      "CREATE INDEX IF NOT EXISTS idx_emails_thread_id ON emails(thread_id);",
      "CREATE INDEX IF NOT EXISTS idx_emails_in_reply_to ON emails(in_reply_to);",
      "CREATE INDEX IF NOT EXISTS idx_signatures_account ON signatures(account_email);",
      "CREATE INDEX IF NOT EXISTS idx_signatures_is_default ON signatures(is_default);",
      "CREATE INDEX IF NOT EXISTS idx_spam_rules_type ON spam_rules(rule_type);",
      "CREATE INDEX IF NOT EXISTS idx_spam_rules_enabled ON spam_rules(is_enabled);",
      "CREATE INDEX IF NOT EXISTS idx_blacklist_email ON blacklist(email_address);",
      "CREATE INDEX IF NOT EXISTS idx_blacklist_domain ON blacklist(domain);",
      "CREATE INDEX IF NOT EXISTS idx_whitelist_email ON whitelist(email_address);",
      "CREATE INDEX IF NOT EXISTS idx_whitelist_domain ON whitelist(domain);"
    ];
  }
});

// src/storage/migrations/003_p1_features.ts
function getErrorMessage3(error2) {
  return error2 instanceof Error ? error2.message : String(error2);
}
function up3(db) {
  db.exec(createAccountsTable);
  db.exec(createTagsTable);
  db.exec(createEmailTagsTable);
  db.exec(createFiltersTable);
  db.exec(createFilterConditionsTable);
  db.exec(createFilterActionsTable);
  db.exec(createContactsTable);
  db.exec(createContactGroupsTable);
  db.exec(createContactGroupMembersTable);
  db.exec(createThreadsTable);
  db.exec(createSavedSearchesTable);
  alterEmailsTable2.forEach((sql) => {
    try {
      db.exec(sql);
    } catch (error2) {
      const errorMessage = getErrorMessage3(error2);
      if (!errorMessage.includes("duplicate column name")) {
        throw error2;
      }
    }
  });
  alterFoldersTable.forEach((sql) => {
    try {
      db.exec(sql);
    } catch (error2) {
      const errorMessage = getErrorMessage3(error2);
      if (!errorMessage.includes("duplicate column name")) {
        throw error2;
      }
    }
  });
  createIndexes3.forEach((indexSql) => db.exec(indexSql));
  const insertDefaultTags = db.prepare(`
    INSERT INTO tags (name, color, description)
    VALUES (?, ?, ?)
  `);
  const defaultTags = [
    { name: "Important", color: "#FF0000", description: "Important emails" },
    { name: "Work", color: "#0000FF", description: "Work-related emails" },
    { name: "Personal", color: "#00FF00", description: "Personal emails" },
    {
      name: "Follow Up",
      color: "#FFA500",
      description: "Emails requiring follow-up"
    },
    { name: "To Read", color: "#800080", description: "Emails to read later" }
  ];
  defaultTags.forEach((tag) => {
    try {
      insertDefaultTags.run(tag.name, tag.color, tag.description);
    } catch {
    }
  });
}
var createTagsTable, createEmailTagsTable, createFiltersTable, createFilterConditionsTable, createFilterActionsTable, createContactsTable, createContactGroupsTable, createContactGroupMembersTable, createAccountsTable, createThreadsTable, createSavedSearchesTable, alterEmailsTable2, alterFoldersTable, createIndexes3;
var init_p1_features = __esm({
  "src/storage/migrations/003_p1_features.ts"() {
    "use strict";
    createTagsTable = `
CREATE TABLE IF NOT EXISTS tags (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT UNIQUE NOT NULL,
  color TEXT DEFAULT '#808080',
  description TEXT,
  account_id INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE
);
`;
    createEmailTagsTable = `
CREATE TABLE IF NOT EXISTS email_tags (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email_id INTEGER NOT NULL,
  tag_id INTEGER NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (email_id) REFERENCES emails(id) ON DELETE CASCADE,
  FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE,
  UNIQUE(email_id, tag_id)
);
`;
    createFiltersTable = `
CREATE TABLE IF NOT EXISTS filters (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT,
  is_enabled BOOLEAN DEFAULT 1,
  priority INTEGER DEFAULT 0,
  match_all BOOLEAN DEFAULT 1,
  account_id INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE
);
`;
    createFilterConditionsTable = `
CREATE TABLE IF NOT EXISTS filter_conditions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  filter_id INTEGER NOT NULL,
  field TEXT NOT NULL,
  operator TEXT NOT NULL,
  value TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (filter_id) REFERENCES filters(id) ON DELETE CASCADE
);
`;
    createFilterActionsTable = `
CREATE TABLE IF NOT EXISTS filter_actions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  filter_id INTEGER NOT NULL,
  action_type TEXT NOT NULL,
  action_value TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (filter_id) REFERENCES filters(id) ON DELETE CASCADE
);
`;
    createContactsTable = `
CREATE TABLE IF NOT EXISTS contacts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  display_name TEXT,
  first_name TEXT,
  last_name TEXT,
  nickname TEXT,
  phone TEXT,
  company TEXT,
  job_title TEXT,
  notes TEXT,
  photo_path TEXT,
  is_favorite BOOLEAN DEFAULT 0,
  account_id INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE
);
`;
    createContactGroupsTable = `
CREATE TABLE IF NOT EXISTS contact_groups (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT,
  account_id INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE
);
`;
    createContactGroupMembersTable = `
CREATE TABLE IF NOT EXISTS contact_group_members (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  group_id INTEGER NOT NULL,
  contact_id INTEGER NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (group_id) REFERENCES contact_groups(id) ON DELETE CASCADE,
  FOREIGN KEY (contact_id) REFERENCES contacts(id) ON DELETE CASCADE,
  UNIQUE(group_id, contact_id)
);
`;
    createAccountsTable = `
CREATE TABLE IF NOT EXISTS accounts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  display_name TEXT,
  imap_host TEXT NOT NULL,
  imap_port INTEGER NOT NULL,
  imap_secure BOOLEAN DEFAULT 1,
  smtp_host TEXT NOT NULL,
  smtp_port INTEGER NOT NULL,
  smtp_secure BOOLEAN DEFAULT 1,
  username TEXT NOT NULL,
  password TEXT NOT NULL,
  is_default BOOLEAN DEFAULT 0,
  is_enabled BOOLEAN DEFAULT 1,
  sync_interval INTEGER DEFAULT 300,
  last_sync DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
`;
    createThreadsTable = `
CREATE TABLE IF NOT EXISTS threads (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  thread_id TEXT UNIQUE NOT NULL,
  subject TEXT,
  first_message_date DATETIME,
  last_message_date DATETIME,
  message_count INTEGER DEFAULT 0,
  account_id INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE
);
`;
    createSavedSearchesTable = `
CREATE TABLE IF NOT EXISTS saved_searches (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT UNIQUE NOT NULL,
  query TEXT NOT NULL,
  description TEXT,
  account_id INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE
);
`;
    alterEmailsTable2 = [
      "ALTER TABLE emails ADD COLUMN account_id INTEGER;",
      "ALTER TABLE emails ADD COLUMN is_starred BOOLEAN DEFAULT 0;",
      "ALTER TABLE emails ADD COLUMN is_important BOOLEAN DEFAULT 0;",
      "ALTER TABLE emails ADD COLUMN priority INTEGER DEFAULT 0;"
    ];
    alterFoldersTable = [
      "ALTER TABLE folders ADD COLUMN account_id INTEGER;",
      "ALTER TABLE folders ADD COLUMN parent_id INTEGER;",
      "ALTER TABLE folders ADD COLUMN is_favorite BOOLEAN DEFAULT 0;",
      "ALTER TABLE folders ADD COLUMN sort_order INTEGER DEFAULT 0;",
      "ALTER TABLE folders ADD COLUMN unread_count INTEGER DEFAULT 0;",
      "ALTER TABLE folders ADD COLUMN total_count INTEGER DEFAULT 0;"
    ];
    createIndexes3 = [
      "CREATE INDEX IF NOT EXISTS idx_tags_name ON tags(name);",
      "CREATE INDEX IF NOT EXISTS idx_tags_account ON tags(account_id);",
      "CREATE INDEX IF NOT EXISTS idx_email_tags_email ON email_tags(email_id);",
      "CREATE INDEX IF NOT EXISTS idx_email_tags_tag ON email_tags(tag_id);",
      "CREATE INDEX IF NOT EXISTS idx_filters_enabled ON filters(is_enabled);",
      "CREATE INDEX IF NOT EXISTS idx_filters_priority ON filters(priority);",
      "CREATE INDEX IF NOT EXISTS idx_filters_account ON filters(account_id);",
      "CREATE INDEX IF NOT EXISTS idx_filter_conditions_filter ON filter_conditions(filter_id);",
      "CREATE INDEX IF NOT EXISTS idx_filter_actions_filter ON filter_actions(filter_id);",
      "CREATE INDEX IF NOT EXISTS idx_contacts_email ON contacts(email);",
      "CREATE INDEX IF NOT EXISTS idx_contacts_name ON contacts(display_name);",
      "CREATE INDEX IF NOT EXISTS idx_contacts_favorite ON contacts(is_favorite);",
      "CREATE INDEX IF NOT EXISTS idx_contacts_account ON contacts(account_id);",
      "CREATE INDEX IF NOT EXISTS idx_contact_groups_account ON contact_groups(account_id);",
      "CREATE INDEX IF NOT EXISTS idx_contact_group_members_group ON contact_group_members(group_id);",
      "CREATE INDEX IF NOT EXISTS idx_contact_group_members_contact ON contact_group_members(contact_id);",
      "CREATE INDEX IF NOT EXISTS idx_accounts_email ON accounts(email);",
      "CREATE INDEX IF NOT EXISTS idx_accounts_is_default ON accounts(is_default);",
      "CREATE INDEX IF NOT EXISTS idx_accounts_is_enabled ON accounts(is_enabled);",
      "CREATE INDEX IF NOT EXISTS idx_threads_thread_id ON threads(thread_id);",
      "CREATE INDEX IF NOT EXISTS idx_threads_account ON threads(account_id);",
      "CREATE INDEX IF NOT EXISTS idx_threads_last_message ON threads(last_message_date);",
      "CREATE INDEX IF NOT EXISTS idx_saved_searches_name ON saved_searches(name);",
      "CREATE INDEX IF NOT EXISTS idx_saved_searches_account ON saved_searches(account_id);",
      "CREATE INDEX IF NOT EXISTS idx_emails_account ON emails(account_id);",
      "CREATE INDEX IF NOT EXISTS idx_emails_is_starred ON emails(is_starred);",
      "CREATE INDEX IF NOT EXISTS idx_emails_is_important ON emails(is_important);",
      "CREATE INDEX IF NOT EXISTS idx_emails_priority ON emails(priority);",
      "CREATE INDEX IF NOT EXISTS idx_folders_account ON folders(account_id);",
      "CREATE INDEX IF NOT EXISTS idx_folders_parent ON folders(parent_id);",
      "CREATE INDEX IF NOT EXISTS idx_folders_favorite ON folders(is_favorite);",
      "CREATE INDEX IF NOT EXISTS idx_folders_sort_order ON folders(sort_order);"
    ];
  }
});

// src/storage/migrations/004_p2_features.ts
function up4(db) {
  db.exec(createTemplatesTable);
  db.exec(createNotificationsTable);
  createIndexes4.forEach((indexSql) => db.exec(indexSql));
  const insertDefaultTemplate = db.prepare(`
    INSERT INTO templates (name, subject, body_text, body_html, variables)
    VALUES (?, ?, ?, ?, ?)
  `);
  const defaultTemplates = [
    {
      name: "Welcome Email",
      subject: "Welcome to {{company_name}}!",
      bodyText: "Hi {{recipient_name}},\n\nWelcome to {{company_name}}! We are excited to have you on board.\n\nBest regards,\n{{sender_name}}",
      bodyHtml: "<p>Hi {{recipient_name}},</p><p>Welcome to {{company_name}}! We are excited to have you on board.</p><p>Best regards,<br>{{sender_name}}</p>",
      variables: JSON.stringify([
        "recipient_name",
        "company_name",
        "sender_name"
      ])
    },
    {
      name: "Meeting Reminder",
      subject: "Reminder: Meeting on {{meeting_date}}",
      bodyText: "Hi {{recipient_name}},\n\nThis is a reminder about our meeting scheduled for {{meeting_date}} at {{meeting_time}}.\n\nTopic: {{meeting_topic}}\nLocation: {{meeting_location}}\n\nSee you there!\n{{sender_name}}",
      bodyHtml: "<p>Hi {{recipient_name}},</p><p>This is a reminder about our meeting scheduled for {{meeting_date}} at {{meeting_time}}.</p><p><strong>Topic:</strong> {{meeting_topic}}<br><strong>Location:</strong> {{meeting_location}}</p><p>See you there!<br>{{sender_name}}</p>",
      variables: JSON.stringify([
        "recipient_name",
        "meeting_date",
        "meeting_time",
        "meeting_topic",
        "meeting_location",
        "sender_name"
      ])
    },
    {
      name: "Follow Up",
      subject: "Following up on {{subject}}",
      bodyText: "Hi {{recipient_name}},\n\nI wanted to follow up on {{subject}}. Please let me know if you have any questions or need any additional information.\n\nBest regards,\n{{sender_name}}",
      bodyHtml: "<p>Hi {{recipient_name}},</p><p>I wanted to follow up on {{subject}}. Please let me know if you have any questions or need any additional information.</p><p>Best regards,<br>{{sender_name}}</p>",
      variables: JSON.stringify(["recipient_name", "subject", "sender_name"])
    }
  ];
  defaultTemplates.forEach((template) => {
    try {
      insertDefaultTemplate.run(
        template.name,
        template.subject,
        template.bodyText,
        template.bodyHtml,
        template.variables
      );
    } catch {
    }
  });
}
var createTemplatesTable, createNotificationsTable, createIndexes4;
var init_p2_features = __esm({
  "src/storage/migrations/004_p2_features.ts"() {
    "use strict";
    createTemplatesTable = `
CREATE TABLE IF NOT EXISTS templates (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  body_text TEXT,
  body_html TEXT,
  variables TEXT,
  account_id INTEGER,
  is_enabled BOOLEAN DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE
);
`;
    createNotificationsTable = `
CREATE TABLE IF NOT EXISTS notifications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email_id INTEGER NOT NULL,
  type TEXT NOT NULL,
  title TEXT,
  message TEXT,
  sent_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  read_at DATETIME,
  account_id INTEGER,
  FOREIGN KEY (email_id) REFERENCES emails(id) ON DELETE CASCADE,
  FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE
);
`;
    createIndexes4 = [
      "CREATE INDEX IF NOT EXISTS idx_templates_name ON templates(name);",
      "CREATE INDEX IF NOT EXISTS idx_templates_account ON templates(account_id);",
      "CREATE INDEX IF NOT EXISTS idx_templates_enabled ON templates(is_enabled);",
      "CREATE INDEX IF NOT EXISTS idx_notifications_email ON notifications(email_id);",
      "CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);",
      "CREATE INDEX IF NOT EXISTS idx_notifications_account ON notifications(account_id);",
      "CREATE INDEX IF NOT EXISTS idx_notifications_sent_at ON notifications(sent_at);",
      "CREATE INDEX IF NOT EXISTS idx_notifications_read_at ON notifications(read_at);"
    ];
  }
});

// src/storage/database.ts
function getErrorMessage4(error2) {
  return error2 instanceof Error ? error2.message : String(error2);
}
var import_node_fs3, import_node_path4, import_better_sqlite3, DatabaseManager, databaseManager, database_default;
var init_database = __esm({
  "src/storage/database.ts"() {
    "use strict";
    import_node_fs3 = __toESM(require("fs"));
    import_node_path4 = __toESM(require("path"));
    import_better_sqlite3 = __toESM(require("better-sqlite3"));
    init_errors();
    init_helpers();
    init_logger();
    init_initial();
    init_p0_features();
    init_p1_features();
    init_p2_features();
    DatabaseManager = class {
      dataDir;
      dbPath;
      db;
      /**
       * Create database manager.
       */
      constructor(dbPath = null) {
        if (dbPath) {
          this.dbPath = dbPath;
          this.dataDir = import_node_path4.default.dirname(dbPath);
        } else {
          this.dataDir = getDataDir();
          this.dbPath = import_node_path4.default.join(this.dataDir, "mail.db");
        }
        this.db = null;
      }
      /**
       * Ensure data directory exists.
       */
      ensureDataDir() {
        if (!import_node_fs3.default.existsSync(this.dataDir)) {
          import_node_fs3.default.mkdirSync(this.dataDir, { recursive: true });
          logger_default.info("Created data directory", { path: this.dataDir });
        }
      }
      /**
       * Initialize database connection.
       */
      initialize() {
        try {
          this.ensureDataDir();
          this.db = new import_better_sqlite3.default(this.dbPath);
          this.db.pragma("journal_mode = WAL");
          this.db.pragma("foreign_keys = ON");
          logger_default.info("Database initialized", { path: this.dbPath });
          this.runMigrations();
          return this.db;
        } catch (error2) {
          const errorMessage = getErrorMessage4(error2);
          logger_default.error("Failed to initialize database", { error: errorMessage });
          throw new StorageError(`Failed to initialize database: ${errorMessage}`);
        }
      }
      /**
       * Run database migrations.
       */
      runMigrations() {
        try {
          if (!this.db) {
            throw new StorageError("Database not initialized");
          }
          up(this.db);
          up2(this.db);
          up3(this.db);
          up4(this.db);
          logger_default.info("Database migrations completed");
        } catch (error2) {
          const errorMessage = getErrorMessage4(error2);
          logger_default.error("Failed to run migrations", { error: errorMessage });
          throw new StorageError(`Failed to run migrations: ${errorMessage}`);
        }
      }
      /**
       * Get database instance.
       */
      getDb() {
        if (!this.db) {
          return this.initialize();
        }
        return this.db;
      }
      /**
       * Close database connection.
       */
      close() {
        if (this.db) {
          this.db.close();
          this.db = null;
          logger_default.info("Database connection closed");
        }
      }
    };
    databaseManager = new DatabaseManager();
    database_default = databaseManager;
  }
});

// src/storage/models/account.ts
function getErrorMessage5(error2) {
  return error2 instanceof Error ? error2.message : String(error2);
}
function toNumber(value) {
  return typeof value === "bigint" ? Number(value) : value;
}
var AccountModel, accountModel, account_default;
var init_account = __esm({
  "src/storage/models/account.ts"() {
    "use strict";
    init_errors();
    init_helpers();
    init_logger();
    init_database();
    AccountModel = class {
      db;
      constructor() {
        this.db = null;
      }
      getDb() {
        if (!this.db) {
          this.db = database_default.getDb();
        }
        return this.db;
      }
      create(accountData) {
        try {
          const db = this.getDb();
          const encryptedPassword = encrypt(accountData.password);
          const stmt = db.prepare(`
        INSERT INTO accounts (
          email, display_name, imap_host, imap_port, imap_secure,
          smtp_host, smtp_port, smtp_secure, username, password,
          is_default, is_enabled, sync_interval
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
          const result = stmt.run(
            accountData.email,
            accountData.displayName ?? accountData.email,
            accountData.imapHost,
            accountData.imapPort ?? 993,
            accountData.imapSecure !== false ? 1 : 0,
            accountData.smtpHost,
            accountData.smtpPort ?? 465,
            accountData.smtpSecure !== false ? 1 : 0,
            accountData.username ?? accountData.email,
            encryptedPassword,
            accountData.isDefault ? 1 : 0,
            accountData.isEnabled !== false ? 1 : 0,
            accountData.syncInterval ?? 300
          );
          const insertId = toNumber(result.lastInsertRowid);
          logger_default.info("Account created", {
            id: insertId,
            email: accountData.email
          });
          return insertId;
        } catch (error2) {
          const errorMessage = getErrorMessage5(error2);
          logger_default.error("Failed to create account", { error: errorMessage });
          throw new StorageError(`Failed to create account: ${errorMessage}`);
        }
      }
      findById(id) {
        try {
          const db = this.getDb();
          const stmt = db.prepare(
            "SELECT * FROM accounts WHERE id = ?"
          );
          const account = stmt.get(id);
          return account ? this.formatAccount(account) : null;
        } catch (error2) {
          const errorMessage = getErrorMessage5(error2);
          logger_default.error("Failed to find account by ID", { id, error: errorMessage });
          throw new StorageError(`Failed to find account: ${errorMessage}`);
        }
      }
      findByEmail(email) {
        try {
          const db = this.getDb();
          const stmt = db.prepare(
            "SELECT * FROM accounts WHERE email = ?"
          );
          const account = stmt.get(email);
          return account ? this.formatAccount(account) : null;
        } catch (error2) {
          const errorMessage = getErrorMessage5(error2);
          logger_default.error("Failed to find account by email", {
            email,
            error: errorMessage
          });
          throw new StorageError(`Failed to find account: ${errorMessage}`);
        }
      }
      findAll(options = {}) {
        try {
          const db = this.getDb();
          const { enabledOnly = false } = options;
          let query = "SELECT * FROM accounts";
          if (enabledOnly) {
            query += " WHERE is_enabled = 1";
          }
          query += " ORDER BY is_default DESC, email ASC";
          const stmt = db.prepare(query);
          const accounts = stmt.all();
          return accounts.map((account) => this.formatAccount(account));
        } catch (error2) {
          const errorMessage = getErrorMessage5(error2);
          logger_default.error("Failed to find accounts", { error: errorMessage });
          throw new StorageError(`Failed to find accounts: ${errorMessage}`);
        }
      }
      getDefault() {
        try {
          const db = this.getDb();
          const stmt = db.prepare(
            "SELECT * FROM accounts WHERE is_default = 1 AND is_enabled = 1 LIMIT 1"
          );
          const account = stmt.get();
          return account ? this.formatAccount(account) : null;
        } catch (error2) {
          const errorMessage = getErrorMessage5(error2);
          logger_default.error("Failed to get default account", { error: errorMessage });
          throw new StorageError(`Failed to get default account: ${errorMessage}`);
        }
      }
      setDefault(id) {
        try {
          const db = this.getDb();
          const transaction = db.transaction(() => {
            db.prepare("UPDATE accounts SET is_default = 0").run();
            const stmt = db.prepare(
              "UPDATE accounts SET is_default = 1, updated_at = CURRENT_TIMESTAMP WHERE id = ?"
            );
            const result = stmt.run(id);
            if (result.changes === 0) {
              throw new StorageError("Account not found");
            }
          });
          transaction();
          logger_default.info("Default account set", { id });
          return true;
        } catch (error2) {
          const errorMessage = getErrorMessage5(error2);
          logger_default.error("Failed to set default account", {
            id,
            error: errorMessage
          });
          throw new StorageError(`Failed to set default account: ${errorMessage}`);
        }
      }
      update(id, data) {
        try {
          const db = this.getDb();
          const fields = [];
          const params = [];
          if (data.email !== void 0) {
            fields.push("email = ?");
            params.push(data.email);
          }
          if (data.displayName !== void 0) {
            fields.push("display_name = ?");
            params.push(data.displayName);
          }
          if (data.imapHost !== void 0) {
            fields.push("imap_host = ?");
            params.push(data.imapHost);
          }
          if (data.imapPort !== void 0) {
            fields.push("imap_port = ?");
            params.push(data.imapPort);
          }
          if (data.imapSecure !== void 0) {
            fields.push("imap_secure = ?");
            params.push(data.imapSecure ? 1 : 0);
          }
          if (data.smtpHost !== void 0) {
            fields.push("smtp_host = ?");
            params.push(data.smtpHost);
          }
          if (data.smtpPort !== void 0) {
            fields.push("smtp_port = ?");
            params.push(data.smtpPort);
          }
          if (data.smtpSecure !== void 0) {
            fields.push("smtp_secure = ?");
            params.push(data.smtpSecure ? 1 : 0);
          }
          if (data.username !== void 0) {
            fields.push("username = ?");
            params.push(data.username);
          }
          if (data.password !== void 0) {
            fields.push("password = ?");
            params.push(encrypt(data.password));
          }
          if (data.isEnabled !== void 0) {
            fields.push("is_enabled = ?");
            params.push(data.isEnabled ? 1 : 0);
          }
          if (data.syncInterval !== void 0) {
            fields.push("sync_interval = ?");
            params.push(data.syncInterval);
          }
          if (fields.length === 0) {
            return false;
          }
          fields.push("updated_at = CURRENT_TIMESTAMP");
          params.push(id);
          const sql = `UPDATE accounts SET ${fields.join(", ")} WHERE id = ?`;
          const stmt = db.prepare(sql);
          const result = stmt.run(...params);
          logger_default.info("Account updated", { id, changes: result.changes });
          return result.changes > 0;
        } catch (error2) {
          const errorMessage = getErrorMessage5(error2);
          logger_default.error("Failed to update account", { id, error: errorMessage });
          throw new StorageError(`Failed to update account: ${errorMessage}`);
        }
      }
      updateLastSync(id) {
        try {
          const db = this.getDb();
          const stmt = db.prepare(
            "UPDATE accounts SET last_sync = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE id = ?"
          );
          const result = stmt.run(id);
          return result.changes > 0;
        } catch (error2) {
          const errorMessage = getErrorMessage5(error2);
          logger_default.error("Failed to update last sync", { id, error: errorMessage });
          throw new StorageError(`Failed to update last sync: ${errorMessage}`);
        }
      }
      delete(id) {
        try {
          const db = this.getDb();
          const countStmt = db.prepare(
            "SELECT COUNT(*) as count FROM accounts"
          );
          const countResult = countStmt.get();
          const totalCount = countResult?.count ?? 0;
          if (totalCount === 1) {
            throw new StorageError("Cannot delete the only account");
          }
          const accountStmt = db.prepare(
            "SELECT is_default FROM accounts WHERE id = ?"
          );
          const account = accountStmt.get(id);
          if (!account) {
            throw new StorageError("Account not found");
          }
          const stmt = db.prepare("DELETE FROM accounts WHERE id = ?");
          const result = stmt.run(id);
          if (account.is_default === 1) {
            const newDefaultStmt = db.prepare(
              "UPDATE accounts SET is_default = 1 WHERE id = (SELECT id FROM accounts LIMIT 1)"
            );
            newDefaultStmt.run();
          }
          logger_default.info("Account deleted", { id, changes: result.changes });
          return result.changes > 0;
        } catch (error2) {
          const errorMessage = getErrorMessage5(error2);
          logger_default.error("Failed to delete account", { id, error: errorMessage });
          throw new StorageError(`Failed to delete account: ${errorMessage}`);
        }
      }
      count() {
        try {
          const db = this.getDb();
          const stmt = db.prepare(
            "SELECT COUNT(*) as count FROM accounts"
          );
          const result = stmt.get();
          return result?.count ?? 0;
        } catch (error2) {
          const errorMessage = getErrorMessage5(error2);
          logger_default.error("Failed to count accounts", { error: errorMessage });
          throw new StorageError(`Failed to count accounts: ${errorMessage}`);
        }
      }
      getWithPassword(id) {
        try {
          const db = this.getDb();
          const stmt = db.prepare(
            "SELECT * FROM accounts WHERE id = ?"
          );
          const account = stmt.get(id);
          return account ? this.formatAccount(account, true) : null;
        } catch (error2) {
          const errorMessage = getErrorMessage5(error2);
          logger_default.error("Failed to get account with password", {
            id,
            error: errorMessage
          });
          throw new StorageError(`Failed to get account: ${errorMessage}`);
        }
      }
      formatAccount(account, includePassword = false) {
        const formatted = {
          id: account.id,
          email: account.email,
          displayName: account.display_name,
          imapHost: account.imap_host,
          imapPort: account.imap_port,
          imapSecure: account.imap_secure === 1,
          smtpHost: account.smtp_host,
          smtpPort: account.smtp_port,
          smtpSecure: account.smtp_secure === 1,
          username: account.username,
          isDefault: account.is_default === 1,
          isEnabled: account.is_enabled === 1,
          syncInterval: account.sync_interval,
          lastSync: account.last_sync,
          createdAt: account.created_at,
          updatedAt: account.updated_at
        };
        if (includePassword) {
          formatted.password = decrypt(account.password);
        }
        return formatted;
      }
    };
    accountModel = new AccountModel();
    account_default = accountModel;
  }
});

// src/accounts/manager.ts
var require_manager = __commonJS({
  "src/accounts/manager.ts"(exports2, module2) {
    "use strict";
    init_config();
    init_client();
    init_client2();
    init_database();
    init_account();
    init_errors();
    init_logger();
    var AccountManager = class {
      /**
       * Add a new account
       */
      async addAccount(accountData) {
        try {
          this._validateAccountData(accountData);
          const existing = account_default.findByEmail(accountData.email);
          if (existing) {
            throw new ConfigError(
              `Account with email ${accountData.email} already exists`
            );
          }
          const accountCount = account_default.count();
          if (accountCount === 0) {
            accountData.isDefault = true;
          }
          const accountId = account_default.create(accountData);
          logger_default.info("Account added successfully", {
            id: accountId,
            email: accountData.email
          });
          return account_default.findById(accountId);
        } catch (error2) {
          logger_default.error("Failed to add account", { error: error2.message });
          throw error2;
        }
      }
      /**
       * Get account by ID
       */
      getAccount(id) {
        return account_default.findById(id);
      }
      /**
       * Get account with password (for connections)
       */
      getAccountWithPassword(id) {
        return account_default.getWithPassword(id);
      }
      /**
       * Get all accounts
       */
      getAllAccounts(enabledOnly = false) {
        return account_default.findAll({ enabledOnly });
      }
      /**
       * Get default account
       */
      getDefaultAccount() {
        return account_default.getDefault();
      }
      /**
       * Set account as default
       */
      setDefaultAccount(id) {
        const account = account_default.findById(id);
        if (!account) {
          throw new ConfigError("Account not found");
        }
        account_default.setDefault(id);
        logger_default.info("Default account changed", { id, email: account.email });
        return true;
      }
      /**
       * Update account
       */
      updateAccount(id, data) {
        const account = account_default.findById(id);
        if (!account) {
          throw new ConfigError("Account not found");
        }
        if (data.email && data.email !== account.email) {
          const existing = account_default.findByEmail(data.email);
          if (existing) {
            throw new ConfigError(
              `Account with email ${data.email} already exists`
            );
          }
        }
        account_default.update(id, data);
        logger_default.info("Account updated", { id });
        return account_default.findById(id);
      }
      /**
       * Delete account
       */
      deleteAccount(id) {
        const account = account_default.findById(id);
        if (!account) {
          throw new ConfigError("Account not found");
        }
        account_default.delete(id);
        logger_default.info("Account deleted", { id, email: account.email });
        return true;
      }
      /**
       * Enable account
       */
      enableAccount(id) {
        return account_default.update(id, { isEnabled: true });
      }
      /**
       * Disable account
       */
      disableAccount(id) {
        return account_default.update(id, { isEnabled: false });
      }
      /**
       * Migrate legacy single-account config to multi-account
       */
      migrateLegacyConfig() {
        try {
          const accountCount = account_default.count();
          if (accountCount > 0) {
            logger_default.info("Accounts already exist, skipping migration");
            return false;
          }
          const config = config_default.load();
          if (!config.imap || !config.smtp) {
            logger_default.info("No legacy config found, skipping migration");
            return false;
          }
          const accountData = {
            email: config.imap.user || config.smtp.user,
            displayName: config.imap.user || config.smtp.user,
            imapHost: config.imap.host,
            imapPort: config.imap.port,
            imapSecure: config.imap.secure !== false,
            smtpHost: config.smtp.host,
            smtpPort: config.smtp.port,
            smtpSecure: config.smtp.secure !== false,
            username: config.imap.user,
            password: config.imap.password,
            isDefault: true,
            isEnabled: true,
            syncInterval: 300
          };
          const accountId = account_default.create(accountData);
          logger_default.info("Legacy config migrated to account", { id: accountId });
          const db = database_default.getDb();
          const updateStmt = db.prepare(
            "UPDATE emails SET account_id = ? WHERE account_id IS NULL"
          );
          const result = updateStmt.run(accountId);
          logger_default.info("Associated existing emails with migrated account", {
            count: result.changes
          });
          const updateFoldersStmt = db.prepare(
            "UPDATE folders SET account_id = ? WHERE account_id IS NULL"
          );
          const foldersResult = updateFoldersStmt.run(accountId);
          logger_default.info("Associated existing folders with migrated account", {
            count: foldersResult.changes
          });
          return true;
        } catch (error2) {
          logger_default.error("Failed to migrate legacy config", { error: error2.message });
          throw new ConfigError(
            `Failed to migrate legacy config: ${error2.message}`
          );
        }
      }
      /**
       * Test account connection
       */
      async testAccount(id) {
        const account = account_default.getWithPassword(id);
        if (!account) {
          throw new ConfigError("Account not found");
        }
        const errors = [];
        try {
          const imapClient = new client_default({
            host: account.imapHost,
            port: account.imapPort,
            secure: account.imapSecure,
            user: account.username,
            password: account.password
          });
          await imapClient.connect();
          await imapClient.disconnect();
          logger_default.info("IMAP connection test successful", { accountId: id });
        } catch (error2) {
          errors.push({ type: "IMAP", message: error2.message });
          logger_default.error("IMAP connection test failed", {
            accountId: id,
            error: error2.message
          });
        }
        try {
          const smtpClient = new client_default2({
            host: account.smtpHost,
            port: account.smtpPort,
            secure: account.smtpSecure,
            user: account.username,
            password: account.password
          });
          await smtpClient.connect();
          await smtpClient.disconnect();
          logger_default.info("SMTP connection test successful", { accountId: id });
        } catch (error2) {
          errors.push({ type: "SMTP", message: error2.message });
          logger_default.error("SMTP connection test failed", {
            accountId: id,
            error: error2.message
          });
        }
        return {
          success: errors.length === 0,
          errors
        };
      }
      /**
       * Validate account data
       */
      _validateAccountData(data) {
        const required = ["email", "imapHost", "smtpHost", "username", "password"];
        const missing = required.filter((field) => !data[field]);
        if (missing.length > 0) {
          throw new ConfigError(`Missing required fields: ${missing.join(", ")}`);
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(data.email)) {
          throw new ConfigError("Invalid email format");
        }
        return true;
      }
    };
    module2.exports = new AccountManager();
  }
});

// src/cli/commands/account.ts
var require_account = __commonJS({
  "src/cli/commands/account.ts"(exports2, module2) {
    "use strict";
    var import_chalk8 = __toESM(require("chalk"));
    var import_prompts = __toESM(require("prompts"));
    var import_manager6 = __toESM(require_manager());
    init_logger();
    async function accountCommand2(action, options) {
      try {
        switch (action) {
          case "add":
            await addAccount(options);
            break;
          case "list":
            await listAccounts(options);
            break;
          case "show":
            await showAccount(options);
            break;
          case "edit":
            await editAccount(options);
            break;
          case "delete":
            await deleteAccount(options);
            break;
          case "default":
            await setDefaultAccount(options);
            break;
          case "enable":
            await enableAccount(options);
            break;
          case "disable":
            await disableAccount(options);
            break;
          case "test":
            await testAccount(options);
            break;
          case "migrate":
            await migrateConfig(options);
            break;
          default:
            console.log(import_chalk8.default.red(`Unknown action: ${action}`));
            console.log(
              import_chalk8.default.yellow(
                "Available actions: add, list, show, edit, delete, default, enable, disable, test, migrate"
              )
            );
        }
      } catch (error2) {
        console.error(import_chalk8.default.red("Error:"), error2.message);
        logger_default.error("Account command failed", { action, error: error2.message });
        process.exit(1);
      }
    }
    async function addAccount(options) {
      console.log(import_chalk8.default.blue.bold("\nAdd New Email Account\n"));
      const questions = [];
      if (!options.email) {
        questions.push({
          type: "text",
          name: "email",
          message: "Email address:",
          validate: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) || "Invalid email format"
        });
      }
      if (!options.name) {
        questions.push({
          type: "text",
          name: "displayName",
          message: "Display name (optional):",
          initial: options.email
        });
      }
      if (!options.imapHost) {
        questions.push({
          type: "text",
          name: "imapHost",
          message: "IMAP host:",
          validate: (value) => value.length > 0 || "IMAP host is required"
        });
      }
      if (!options.imapPort) {
        questions.push({
          type: "number",
          name: "imapPort",
          message: "IMAP port:",
          initial: 993
        });
      }
      if (!options.smtpHost) {
        questions.push({
          type: "text",
          name: "smtpHost",
          message: "SMTP host:",
          validate: (value) => value.length > 0 || "SMTP host is required"
        });
      }
      if (!options.smtpPort) {
        questions.push({
          type: "number",
          name: "smtpPort",
          message: "SMTP port:",
          initial: 465
        });
      }
      if (!options.username) {
        questions.push({
          type: "text",
          name: "username",
          message: "Username:",
          initial: options.email,
          validate: (value) => value.length > 0 || "Username is required"
        });
      }
      if (!options.password) {
        questions.push({
          type: "password",
          name: "password",
          message: "Password:",
          validate: (value) => value.length > 0 || "Password is required"
        });
      }
      const answers = await (0, import_prompts.default)(questions);
      const accountData = {
        email: options.email || answers.email,
        displayName: options.name || answers.displayName || answers.email,
        imapHost: options.imapHost || answers.imapHost,
        imapPort: options.imapPort || answers.imapPort,
        imapSecure: options.imapSecure !== false,
        smtpHost: options.smtpHost || answers.smtpHost,
        smtpPort: options.smtpPort || answers.smtpPort,
        smtpSecure: options.smtpSecure !== false,
        username: options.username || answers.username || answers.email,
        password: options.password || answers.password,
        isEnabled: true
      };
      if (options.test) {
        console.log(import_chalk8.default.yellow("\nTesting connection..."));
      }
      const account = await import_manager6.default.addAccount(accountData);
      console.log(import_chalk8.default.green("\n\u2713 Account added successfully!"));
      console.log(import_chalk8.default.gray(`Account ID: ${account.id}`));
      console.log(import_chalk8.default.gray(`Email: ${account.email}`));
      if (account.isDefault) {
        console.log(import_chalk8.default.yellow("This account is set as default"));
      }
    }
    async function listAccounts(options) {
      const accounts = import_manager6.default.getAllAccounts(options.enabledOnly);
      if (accounts.length === 0) {
        console.log(import_chalk8.default.yellow("No accounts found"));
        console.log(import_chalk8.default.gray('Use "account add" to add a new account'));
        return;
      }
      console.log(import_chalk8.default.blue.bold("\nEmail Accounts\n"));
      accounts.forEach((account) => {
        const status = [];
        if (account.isDefault) status.push(import_chalk8.default.yellow("DEFAULT"));
        if (!account.isEnabled) status.push(import_chalk8.default.red("DISABLED"));
        console.log(import_chalk8.default.bold(`[${account.id}] ${account.email}`));
        if (status.length > 0) {
          console.log(`    ${status.join(" ")}`);
        }
        console.log(import_chalk8.default.gray(`    Display Name: ${account.displayName}`));
        console.log(
          import_chalk8.default.gray(`    IMAP: ${account.imapHost}:${account.imapPort}`)
        );
        console.log(
          import_chalk8.default.gray(`    SMTP: ${account.smtpHost}:${account.smtpPort}`)
        );
        if (account.lastSync) {
          console.log(
            import_chalk8.default.gray(
              `    Last Sync: ${new Date(account.lastSync).toLocaleString()}`
            )
          );
        }
        console.log("");
      });
      console.log(import_chalk8.default.gray(`Total: ${accounts.length} account(s)`));
    }
    async function showAccount(options) {
      if (!options.id) {
        console.error(import_chalk8.default.red("Error: Account ID is required"));
        console.log(import_chalk8.default.gray("Usage: account show --id <id>"));
        process.exit(1);
      }
      const account = import_manager6.default.getAccount(options.id);
      if (!account) {
        console.error(import_chalk8.default.red(`Account with ID ${options.id} not found`));
        process.exit(1);
      }
      console.log(import_chalk8.default.blue.bold("\nAccount Details\n"));
      console.log(import_chalk8.default.bold("ID:"), account.id);
      console.log(import_chalk8.default.bold("Email:"), account.email);
      console.log(import_chalk8.default.bold("Display Name:"), account.displayName);
      console.log(import_chalk8.default.bold("Username:"), account.username);
      console.log("");
      console.log(import_chalk8.default.bold("IMAP Configuration:"));
      console.log(`  Host: ${account.imapHost}`);
      console.log(`  Port: ${account.imapPort}`);
      console.log(`  Secure: ${account.imapSecure ? "Yes" : "No"}`);
      console.log("");
      console.log(import_chalk8.default.bold("SMTP Configuration:"));
      console.log(`  Host: ${account.smtpHost}`);
      console.log(`  Port: ${account.smtpPort}`);
      console.log(`  Secure: ${account.smtpSecure ? "Yes" : "No"}`);
      console.log("");
      console.log(import_chalk8.default.bold("Status:"));
      console.log(`  Default: ${account.isDefault ? import_chalk8.default.yellow("Yes") : "No"}`);
      console.log(
        `  Enabled: ${account.isEnabled ? import_chalk8.default.green("Yes") : import_chalk8.default.red("No")}`
      );
      console.log(`  Sync Interval: ${account.syncInterval} seconds`);
      if (account.lastSync) {
        console.log(`  Last Sync: ${new Date(account.lastSync).toLocaleString()}`);
      }
      console.log("");
      console.log(
        import_chalk8.default.gray(`Created: ${new Date(account.createdAt).toLocaleString()}`)
      );
      console.log(
        import_chalk8.default.gray(`Updated: ${new Date(account.updatedAt).toLocaleString()}`)
      );
    }
    async function editAccount(options) {
      if (!options.id) {
        console.error(import_chalk8.default.red("Error: Account ID is required"));
        console.log(import_chalk8.default.gray("Usage: account edit --id <id>"));
        process.exit(1);
      }
      const account = import_manager6.default.getAccount(options.id);
      if (!account) {
        console.error(import_chalk8.default.red(`Account with ID ${options.id} not found`));
        process.exit(1);
      }
      console.log(import_chalk8.default.blue.bold("\nEdit Account\n"));
      console.log(import_chalk8.default.gray("Leave blank to keep current value\n"));
      const questions = [
        {
          type: "text",
          name: "displayName",
          message: "Display name:",
          initial: account.displayName
        },
        {
          type: "text",
          name: "imapHost",
          message: "IMAP host:",
          initial: account.imapHost
        },
        {
          type: "number",
          name: "imapPort",
          message: "IMAP port:",
          initial: account.imapPort
        },
        {
          type: "text",
          name: "smtpHost",
          message: "SMTP host:",
          initial: account.smtpHost
        },
        {
          type: "number",
          name: "smtpPort",
          message: "SMTP port:",
          initial: account.smtpPort
        },
        {
          type: "text",
          name: "username",
          message: "Username:",
          initial: account.username
        },
        {
          type: "confirm",
          name: "changePassword",
          message: "Change password?",
          initial: false
        }
      ];
      const answers = await (0, import_prompts.default)(questions);
      if (answers.changePassword) {
        const passwordAnswer = await (0, import_prompts.default)({
          type: "password",
          name: "password",
          message: "New password:",
          validate: (value) => value.length > 0 || "Password is required"
        });
        answers.password = passwordAnswer.password;
      }
      const updateData = {};
      if (answers.displayName && answers.displayName !== account.displayName) {
        updateData.displayName = answers.displayName;
      }
      if (answers.imapHost && answers.imapHost !== account.imapHost) {
        updateData.imapHost = answers.imapHost;
      }
      if (answers.imapPort && answers.imapPort !== account.imapPort) {
        updateData.imapPort = answers.imapPort;
      }
      if (answers.smtpHost && answers.smtpHost !== account.smtpHost) {
        updateData.smtpHost = answers.smtpHost;
      }
      if (answers.smtpPort && answers.smtpPort !== account.smtpPort) {
        updateData.smtpPort = answers.smtpPort;
      }
      if (answers.username && answers.username !== account.username) {
        updateData.username = answers.username;
      }
      if (answers.password) {
        updateData.password = answers.password;
      }
      if (Object.keys(updateData).length === 0) {
        console.log(import_chalk8.default.yellow("No changes made"));
        return;
      }
      import_manager6.default.updateAccount(options.id, updateData);
      console.log(import_chalk8.default.green("\n\u2713 Account updated successfully!"));
    }
    async function deleteAccount(options) {
      if (!options.id) {
        console.error(import_chalk8.default.red("Error: Account ID is required"));
        console.log(import_chalk8.default.gray("Usage: account delete --id <id>"));
        process.exit(1);
      }
      const account = import_manager6.default.getAccount(options.id);
      if (!account) {
        console.error(import_chalk8.default.red(`Account with ID ${options.id} not found`));
        process.exit(1);
      }
      if (!options.yes) {
        const answer = await (0, import_prompts.default)({
          type: "confirm",
          name: "confirm",
          message: `Delete account "${account.email}"? This will also delete all associated emails and data.`,
          initial: false
        });
        if (!answer.confirm) {
          console.log(import_chalk8.default.yellow("Cancelled"));
          return;
        }
      }
      import_manager6.default.deleteAccount(options.id);
      console.log(import_chalk8.default.green("\n\u2713 Account deleted successfully"));
    }
    async function setDefaultAccount(options) {
      if (!options.id) {
        console.error(import_chalk8.default.red("Error: Account ID is required"));
        console.log(import_chalk8.default.gray("Usage: account default --id <id>"));
        process.exit(1);
      }
      import_manager6.default.setDefaultAccount(options.id);
      const account = import_manager6.default.getAccount(options.id);
      console.log(import_chalk8.default.green(`
\u2713 "${account.email}" is now the default account`));
    }
    async function enableAccount(options) {
      if (!options.id) {
        console.error(import_chalk8.default.red("Error: Account ID is required"));
        console.log(import_chalk8.default.gray("Usage: account enable --id <id>"));
        process.exit(1);
      }
      import_manager6.default.enableAccount(options.id);
      console.log(import_chalk8.default.green("\n\u2713 Account enabled"));
    }
    async function disableAccount(options) {
      if (!options.id) {
        console.error(import_chalk8.default.red("Error: Account ID is required"));
        console.log(import_chalk8.default.gray("Usage: account disable --id <id>"));
        process.exit(1);
      }
      import_manager6.default.disableAccount(options.id);
      console.log(import_chalk8.default.yellow("\n\u2713 Account disabled"));
    }
    async function testAccount(options) {
      if (!options.id) {
        console.error(import_chalk8.default.red("Error: Account ID is required"));
        console.log(import_chalk8.default.gray("Usage: account test --id <id>"));
        process.exit(1);
      }
      const account = import_manager6.default.getAccount(options.id);
      if (!account) {
        console.error(import_chalk8.default.red(`Account with ID ${options.id} not found`));
        process.exit(1);
      }
      console.log(import_chalk8.default.blue.bold("\nTesting Account Connection\n"));
      console.log(import_chalk8.default.gray(`Account: ${account.email}
`));
      const result = await import_manager6.default.testAccount(options.id);
      if (result.success) {
        console.log(import_chalk8.default.green("\u2713 All connections successful!"));
        console.log(import_chalk8.default.green("  \u2713 IMAP connection OK"));
        console.log(import_chalk8.default.green("  \u2713 SMTP connection OK"));
      } else {
        console.log(import_chalk8.default.red("\u2717 Connection test failed\n"));
        result.errors.forEach((error2) => {
          console.log(import_chalk8.default.red(`  \u2717 ${error2.type}: ${error2.message}`));
        });
        process.exit(1);
      }
    }
    async function migrateConfig(options) {
      console.log(import_chalk8.default.blue.bold("\nMigrating Legacy Configuration\n"));
      const result = import_manager6.default.migrateLegacyConfig();
      if (result) {
        console.log(import_chalk8.default.green("\u2713 Legacy configuration migrated successfully"));
        console.log(
          import_chalk8.default.gray(
            "Your existing account has been converted to the new multi-account system"
          )
        );
      } else {
        console.log(import_chalk8.default.yellow("No migration needed"));
        console.log(
          import_chalk8.default.gray("Either accounts already exist or no legacy config was found")
        );
      }
    }
    module2.exports = accountCommand2;
  }
});

// src/cli/commands/config.ts
var require_config = __commonJS({
  "src/cli/commands/config.ts"(exports2, module2) {
    "use strict";
    var import_chalk8 = __toESM(require("chalk"));
    var import_inquirer = __toESM(require("inquirer"));
    init_config();
    init_logger();
    async function configCommand2(options) {
      try {
        if (options.show) {
          showConfig();
          return;
        }
        if (options.set) {
          setConfigValue(options.set);
          return;
        }
        await configWizard();
      } catch (error2) {
        console.error(import_chalk8.default.red("Configuration error:"), error2.message);
        logger_default.error("Config command failed", { error: error2.message });
        process.exit(1);
      }
    }
    function showConfig() {
      const currentConfig = config_default.load();
      console.log(import_chalk8.default.bold.cyan("Current Configuration:"));
      console.log(import_chalk8.default.gray("\u2500".repeat(60)));
      console.log(import_chalk8.default.bold("IMAP:"));
      console.log(`  Host: ${currentConfig.imap.host || import_chalk8.default.gray("(not set)")}`);
      console.log(`  Port: ${currentConfig.imap.port}`);
      console.log(`  Secure: ${currentConfig.imap.secure}`);
      console.log(`  User: ${currentConfig.imap.user || import_chalk8.default.gray("(not set)")}`);
      console.log(
        `  Password: ${currentConfig.imap.password ? import_chalk8.default.gray("(set)") : import_chalk8.default.gray("(not set)")}`
      );
      console.log();
      console.log(import_chalk8.default.bold("SMTP:"));
      console.log(`  Host: ${currentConfig.smtp.host || import_chalk8.default.gray("(not set)")}`);
      console.log(`  Port: ${currentConfig.smtp.port}`);
      console.log(`  Secure: ${currentConfig.smtp.secure}`);
      console.log(`  User: ${currentConfig.smtp.user || import_chalk8.default.gray("(not set)")}`);
      console.log(
        `  Password: ${currentConfig.smtp.password ? import_chalk8.default.gray("(set)") : import_chalk8.default.gray("(not set)")}`
      );
    }
    function setConfigValue(keyValue) {
      const [key, value] = keyValue.split("=");
      if (!key || value === void 0) {
        console.error(import_chalk8.default.red("Invalid format. Use: --set key=value"));
        process.exit(1);
      }
      config_default.load();
      config_default.set(key, value);
      config_default.save();
      console.log(import_chalk8.default.green(`\u2713 Configuration updated: ${key} = ${value}`));
    }
    async function configWizard() {
      console.log(import_chalk8.default.bold.cyan("Mail Client Configuration Wizard"));
      console.log(import_chalk8.default.gray("Configure your IMAP and SMTP settings\n"));
      const currentConfig = config_default.exists() ? config_default.load() : null;
      const answers = await import_inquirer.default.prompt([
        {
          type: "input",
          name: "imapHost",
          message: "IMAP Host:",
          default: currentConfig?.imap.host
        },
        {
          type: "number",
          name: "imapPort",
          message: "IMAP Port:",
          default: currentConfig?.imap.port || 993
        },
        {
          type: "confirm",
          name: "imapSecure",
          message: "Use TLS/SSL for IMAP?",
          default: currentConfig?.imap.secure !== false
        },
        {
          type: "input",
          name: "imapUser",
          message: "IMAP Username (email):",
          default: currentConfig?.imap.user
        },
        {
          type: "password",
          name: "imapPassword",
          message: "IMAP Password:",
          mask: "*"
        },
        {
          type: "input",
          name: "smtpHost",
          message: "SMTP Host:",
          default: currentConfig?.smtp.host
        },
        {
          type: "number",
          name: "smtpPort",
          message: "SMTP Port:",
          default: currentConfig?.smtp.port || 465
        },
        {
          type: "confirm",
          name: "smtpSecure",
          message: "Use TLS/SSL for SMTP?",
          default: currentConfig?.smtp.secure !== false
        },
        {
          type: "input",
          name: "smtpUser",
          message: "SMTP Username (email):",
          default: currentConfig?.smtp.user
        },
        {
          type: "password",
          name: "smtpPassword",
          message: "SMTP Password:",
          mask: "*"
        }
      ]);
      const newConfig = {
        imap: {
          host: answers.imapHost,
          port: answers.imapPort,
          secure: answers.imapSecure,
          user: answers.imapUser,
          password: answers.imapPassword
        },
        smtp: {
          host: answers.smtpHost,
          port: answers.smtpPort,
          secure: answers.smtpSecure,
          user: answers.smtpUser,
          password: answers.smtpPassword
        },
        storage: currentConfig?.storage || {
          dataDir: "./data",
          maxAttachmentSize: 10485760
        },
        sync: currentConfig?.sync || {
          autoSync: false,
          syncInterval: 3e5,
          folders: ["INBOX"]
        }
      };
      config_default.save(newConfig);
      console.log(import_chalk8.default.green("\n\u2713 Configuration saved successfully!"));
    }
    module2.exports = configCommand2;
  }
});

// src/storage/models/contact.ts
function getErrorMessage6(error2) {
  return error2 instanceof Error ? error2.message : String(error2);
}
function toNumber2(value) {
  return typeof value === "bigint" ? Number(value) : value;
}
var ContactModel, contactModel, contact_default;
var init_contact = __esm({
  "src/storage/models/contact.ts"() {
    "use strict";
    init_errors();
    init_logger();
    init_database();
    ContactModel = class {
      db;
      constructor() {
        this.db = null;
      }
      getDb() {
        if (!this.db) {
          this.db = database_default.getDb();
        }
        return this.db;
      }
      create(contactData) {
        try {
          const db = this.getDb();
          const stmt = db.prepare(`
        INSERT INTO contacts (
          email, display_name, first_name, last_name, nickname,
          phone, company, job_title, notes, photo_path,
          is_favorite, account_id
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
          const result = stmt.run(
            contactData.email,
            contactData.displayName ?? null,
            contactData.firstName ?? null,
            contactData.lastName ?? null,
            contactData.nickname ?? null,
            contactData.phone ?? null,
            contactData.company ?? null,
            contactData.jobTitle ?? null,
            contactData.notes ?? null,
            contactData.photoPath ?? null,
            contactData.isFavorite ? 1 : 0,
            contactData.accountId ?? null
          );
          const insertId = toNumber2(result.lastInsertRowid);
          logger_default.debug("Contact created", {
            id: insertId,
            email: contactData.email
          });
          return insertId;
        } catch (error2) {
          const errorMessage = getErrorMessage6(error2);
          if (errorMessage.includes("UNIQUE constraint failed")) {
            throw new StorageError(
              `Contact with email "${contactData.email}" already exists`
            );
          }
          logger_default.error("Failed to create contact", { error: errorMessage });
          throw new StorageError(`Failed to create contact: ${errorMessage}`);
        }
      }
      findAll(accountId = null, options = {}) {
        try {
          const db = this.getDb();
          const { limit = 100, offset = 0, favoriteOnly = false } = options;
          let query = "SELECT * FROM contacts WHERE 1=1";
          const params = [];
          if (accountId !== null) {
            query += " AND (account_id = ? OR account_id IS NULL)";
            params.push(accountId);
          }
          if (favoriteOnly) {
            query += " AND is_favorite = 1";
          }
          query += " ORDER BY display_name ASC, email ASC LIMIT ? OFFSET ?";
          params.push(limit, offset);
          const stmt = db.prepare(query);
          const contacts = stmt.all(...params);
          return contacts.map((contact) => this.formatContact(contact));
        } catch (error2) {
          const errorMessage = getErrorMessage6(error2);
          logger_default.error("Failed to find contacts", { error: errorMessage });
          throw new StorageError(`Failed to find contacts: ${errorMessage}`);
        }
      }
      findById(id) {
        try {
          const db = this.getDb();
          const stmt = db.prepare(
            "SELECT * FROM contacts WHERE id = ?"
          );
          const contact = stmt.get(id);
          return contact ? this.formatContact(contact) : null;
        } catch (error2) {
          const errorMessage = getErrorMessage6(error2);
          logger_default.error("Failed to find contact by ID", { id, error: errorMessage });
          throw new StorageError(`Failed to find contact: ${errorMessage}`);
        }
      }
      findByEmail(email, accountId = null) {
        try {
          const db = this.getDb();
          let query = "SELECT * FROM contacts WHERE email = ?";
          const params = [email];
          if (accountId !== null) {
            query += " AND (account_id = ? OR account_id IS NULL)";
            params.push(accountId);
          }
          const stmt = db.prepare(query);
          const contact = stmt.get(...params);
          return contact ? this.formatContact(contact) : null;
        } catch (error2) {
          const errorMessage = getErrorMessage6(error2);
          logger_default.error("Failed to find contact by email", {
            email,
            error: errorMessage
          });
          throw new StorageError(`Failed to find contact: ${errorMessage}`);
        }
      }
      search(keyword, accountId = null, options = {}) {
        try {
          const db = this.getDb();
          const { limit = 50, offset = 0 } = options;
          const searchTerm = `%${keyword}%`;
          let query = `
        SELECT * FROM contacts
        WHERE (
          email LIKE ? OR
          display_name LIKE ? OR
          first_name LIKE ? OR
          last_name LIKE ? OR
          company LIKE ? OR
          notes LIKE ?
        )
      `;
          const params = [
            searchTerm,
            searchTerm,
            searchTerm,
            searchTerm,
            searchTerm,
            searchTerm
          ];
          if (accountId !== null) {
            query += " AND (account_id = ? OR account_id IS NULL)";
            params.push(accountId);
          }
          query += " ORDER BY display_name ASC, email ASC LIMIT ? OFFSET ?";
          params.push(limit, offset);
          const stmt = db.prepare(query);
          const contacts = stmt.all(...params);
          return contacts.map((contact) => this.formatContact(contact));
        } catch (error2) {
          const errorMessage = getErrorMessage6(error2);
          logger_default.error("Failed to search contacts", {
            keyword,
            error: errorMessage
          });
          throw new StorageError(`Failed to search contacts: ${errorMessage}`);
        }
      }
      update(id, data) {
        try {
          const db = this.getDb();
          const fields = [];
          const params = [];
          const fieldMap = {
            email: "email",
            displayName: "display_name",
            firstName: "first_name",
            lastName: "last_name",
            nickname: "nickname",
            phone: "phone",
            company: "company",
            jobTitle: "job_title",
            notes: "notes",
            photoPath: "photo_path",
            isFavorite: "is_favorite",
            accountId: "account_id"
          };
          Object.keys(fieldMap).forEach(
            (key) => {
              const value = data[key];
              if (value !== void 0) {
                fields.push(`${fieldMap[key]} = ?`);
                params.push(
                  key === "isFavorite" ? value ? 1 : 0 : value
                );
              }
            }
          );
          if (fields.length === 0) {
            return false;
          }
          fields.push("updated_at = CURRENT_TIMESTAMP");
          params.push(id);
          const sql = `UPDATE contacts SET ${fields.join(", ")} WHERE id = ?`;
          const stmt = db.prepare(sql);
          const result = stmt.run(...params);
          logger_default.debug("Contact updated", { id, changes: result.changes });
          return result.changes > 0;
        } catch (error2) {
          const errorMessage = getErrorMessage6(error2);
          if (errorMessage.includes("UNIQUE constraint failed")) {
            throw new StorageError("Contact email already exists");
          }
          logger_default.error("Failed to update contact", { id, error: errorMessage });
          throw new StorageError(`Failed to update contact: ${errorMessage}`);
        }
      }
      delete(id) {
        try {
          const db = this.getDb();
          const stmt = db.prepare("DELETE FROM contacts WHERE id = ?");
          const result = stmt.run(id);
          logger_default.debug("Contact deleted", { id, changes: result.changes });
          return result.changes > 0;
        } catch (error2) {
          const errorMessage = getErrorMessage6(error2);
          logger_default.error("Failed to delete contact", { id, error: errorMessage });
          throw new StorageError(`Failed to delete contact: ${errorMessage}`);
        }
      }
      count(accountId = null) {
        try {
          const db = this.getDb();
          let query = "SELECT COUNT(*) as count FROM contacts WHERE 1=1";
          const params = [];
          if (accountId !== null) {
            query += " AND (account_id = ? OR account_id IS NULL)";
            params.push(accountId);
          }
          const stmt = db.prepare(query);
          const result = stmt.get(...params);
          return result?.count ?? 0;
        } catch (error2) {
          const errorMessage = getErrorMessage6(error2);
          logger_default.error("Failed to count contacts", { error: errorMessage });
          throw new StorageError(`Failed to count contacts: ${errorMessage}`);
        }
      }
      findOrCreate(email, data = {}) {
        try {
          const existing = this.findByEmail(email, data.accountId ?? null);
          if (existing) {
            return { contact: existing, created: false };
          }
          const contactData = {
            email,
            ...data
          };
          const id = this.create(contactData);
          const contact = this.findById(id);
          return { contact, created: true };
        } catch (error2) {
          const errorMessage = getErrorMessage6(error2);
          logger_default.error("Failed to find or create contact", {
            email,
            error: errorMessage
          });
          throw new StorageError(
            `Failed to find or create contact: ${errorMessage}`
          );
        }
      }
      formatContact(contact) {
        return {
          id: contact.id,
          email: contact.email,
          displayName: contact.display_name,
          firstName: contact.first_name,
          lastName: contact.last_name,
          nickname: contact.nickname,
          phone: contact.phone,
          company: contact.company,
          jobTitle: contact.job_title,
          notes: contact.notes,
          photoPath: contact.photo_path,
          isFavorite: contact.is_favorite === 1,
          accountId: contact.account_id,
          createdAt: contact.created_at,
          updatedAt: contact.updated_at
        };
      }
    };
    contactModel = new ContactModel();
    contact_default = contactModel;
  }
});

// src/storage/models/contact_group.ts
function getErrorMessage7(error2) {
  return error2 instanceof Error ? error2.message : String(error2);
}
function toNumber3(value) {
  return typeof value === "bigint" ? Number(value) : value;
}
var ContactGroupModel, contactGroupModel, contact_group_default;
var init_contact_group = __esm({
  "src/storage/models/contact_group.ts"() {
    "use strict";
    init_errors();
    init_logger();
    init_database();
    ContactGroupModel = class {
      db;
      constructor() {
        this.db = null;
      }
      getDb() {
        if (!this.db) {
          this.db = database_default.getDb();
        }
        return this.db;
      }
      create(groupData) {
        try {
          const db = this.getDb();
          const stmt = db.prepare(`
        INSERT INTO contact_groups (name, description, account_id)
        VALUES (?, ?, ?)
      `);
          const result = stmt.run(
            groupData.name,
            groupData.description ?? null,
            groupData.accountId ?? null
          );
          const insertId = toNumber3(result.lastInsertRowid);
          logger_default.debug("Contact group created", {
            id: insertId,
            name: groupData.name
          });
          return insertId;
        } catch (error2) {
          const errorMessage = getErrorMessage7(error2);
          logger_default.error("Failed to create contact group", { error: errorMessage });
          throw new StorageError(`Failed to create contact group: ${errorMessage}`);
        }
      }
      findAll(accountId = null) {
        try {
          const db = this.getDb();
          let query = "SELECT * FROM contact_groups WHERE 1=1";
          const params = [];
          if (accountId !== null) {
            query += " AND (account_id = ? OR account_id IS NULL)";
            params.push(accountId);
          }
          query += " ORDER BY name ASC";
          const stmt = db.prepare(query);
          const groups = stmt.all(...params);
          return groups.map((group) => this.formatGroup(group));
        } catch (error2) {
          const errorMessage = getErrorMessage7(error2);
          logger_default.error("Failed to find contact groups", { error: errorMessage });
          throw new StorageError(`Failed to find contact groups: ${errorMessage}`);
        }
      }
      findById(id) {
        try {
          const db = this.getDb();
          const stmt = db.prepare(
            "SELECT * FROM contact_groups WHERE id = ?"
          );
          const group = stmt.get(id);
          return group ? this.formatGroup(group) : null;
        } catch (error2) {
          const errorMessage = getErrorMessage7(error2);
          logger_default.error("Failed to find contact group by ID", {
            id,
            error: errorMessage
          });
          throw new StorageError(`Failed to find contact group: ${errorMessage}`);
        }
      }
      findByName(name, accountId = null) {
        try {
          const db = this.getDb();
          let query = "SELECT * FROM contact_groups WHERE name = ?";
          const params = [name];
          if (accountId !== null) {
            query += " AND (account_id = ? OR account_id IS NULL)";
            params.push(accountId);
          }
          const stmt = db.prepare(query);
          const group = stmt.get(...params);
          return group ? this.formatGroup(group) : null;
        } catch (error2) {
          const errorMessage = getErrorMessage7(error2);
          logger_default.error("Failed to find contact group by name", {
            name,
            error: errorMessage
          });
          throw new StorageError(`Failed to find contact group: ${errorMessage}`);
        }
      }
      update(id, data) {
        try {
          const db = this.getDb();
          const fields = [];
          const params = [];
          if (data.name !== void 0) {
            fields.push("name = ?");
            params.push(data.name);
          }
          if (data.description !== void 0) {
            fields.push("description = ?");
            params.push(data.description);
          }
          if (fields.length === 0) {
            return false;
          }
          fields.push("updated_at = CURRENT_TIMESTAMP");
          params.push(id);
          const sql = `UPDATE contact_groups SET ${fields.join(", ")} WHERE id = ?`;
          const stmt = db.prepare(sql);
          const result = stmt.run(...params);
          logger_default.debug("Contact group updated", { id, changes: result.changes });
          return result.changes > 0;
        } catch (error2) {
          const errorMessage = getErrorMessage7(error2);
          logger_default.error("Failed to update contact group", {
            id,
            error: errorMessage
          });
          throw new StorageError(`Failed to update contact group: ${errorMessage}`);
        }
      }
      delete(id) {
        try {
          const db = this.getDb();
          const stmt = db.prepare("DELETE FROM contact_groups WHERE id = ?");
          const result = stmt.run(id);
          logger_default.debug("Contact group deleted", { id, changes: result.changes });
          return result.changes > 0;
        } catch (error2) {
          const errorMessage = getErrorMessage7(error2);
          logger_default.error("Failed to delete contact group", {
            id,
            error: errorMessage
          });
          throw new StorageError(`Failed to delete contact group: ${errorMessage}`);
        }
      }
      addContact(groupId, contactId) {
        try {
          const db = this.getDb();
          const stmt = db.prepare(`
        INSERT INTO contact_group_members (group_id, contact_id)
        VALUES (?, ?)
      `);
          const result = stmt.run(groupId, contactId);
          const insertId = toNumber3(result.lastInsertRowid);
          logger_default.debug("Contact added to group", { groupId, contactId });
          return insertId;
        } catch (error2) {
          const errorMessage = getErrorMessage7(error2);
          if (errorMessage.includes("UNIQUE constraint failed")) {
            throw new StorageError("Contact is already in this group");
          }
          logger_default.error("Failed to add contact to group", {
            groupId,
            contactId,
            error: errorMessage
          });
          throw new StorageError(`Failed to add contact to group: ${errorMessage}`);
        }
      }
      removeContact(groupId, contactId) {
        try {
          const db = this.getDb();
          const stmt = db.prepare(`
        DELETE FROM contact_group_members
        WHERE group_id = ? AND contact_id = ?
      `);
          const result = stmt.run(groupId, contactId);
          logger_default.debug("Contact removed from group", {
            groupId,
            contactId,
            changes: result.changes
          });
          return result.changes > 0;
        } catch (error2) {
          const errorMessage = getErrorMessage7(error2);
          logger_default.error("Failed to remove contact from group", {
            groupId,
            contactId,
            error: errorMessage
          });
          throw new StorageError(
            `Failed to remove contact from group: ${errorMessage}`
          );
        }
      }
      getContacts(groupId, options = {}) {
        try {
          const db = this.getDb();
          const { limit = 100, offset = 0 } = options;
          const stmt = db.prepare(`
        SELECT c.* FROM contacts c
        INNER JOIN contact_group_members cgm ON c.id = cgm.contact_id
        WHERE cgm.group_id = ?
        ORDER BY c.display_name ASC, c.email ASC
        LIMIT ? OFFSET ?
      `);
          const contacts = stmt.all(groupId, limit, offset);
          return contacts.map((contact) => this.formatContact(contact));
        } catch (error2) {
          const errorMessage = getErrorMessage7(error2);
          logger_default.error("Failed to get contacts in group", {
            groupId,
            error: errorMessage
          });
          throw new StorageError(
            `Failed to get contacts in group: ${errorMessage}`
          );
        }
      }
      getGroupsByContact(contactId) {
        try {
          const db = this.getDb();
          const stmt = db.prepare(`
        SELECT cg.* FROM contact_groups cg
        INNER JOIN contact_group_members cgm ON cg.id = cgm.group_id
        WHERE cgm.contact_id = ?
        ORDER BY cg.name ASC
      `);
          const groups = stmt.all(contactId);
          return groups.map((group) => this.formatGroup(group));
        } catch (error2) {
          const errorMessage = getErrorMessage7(error2);
          logger_default.error("Failed to get groups for contact", {
            contactId,
            error: errorMessage
          });
          throw new StorageError(
            `Failed to get groups for contact: ${errorMessage}`
          );
        }
      }
      countContacts(groupId) {
        try {
          const db = this.getDb();
          const stmt = db.prepare(`
        SELECT COUNT(*) as count FROM contact_group_members
        WHERE group_id = ?
      `);
          const result = stmt.get(groupId);
          return result?.count ?? 0;
        } catch (error2) {
          const errorMessage = getErrorMessage7(error2);
          logger_default.error("Failed to count contacts in group", {
            groupId,
            error: errorMessage
          });
          throw new StorageError(
            `Failed to count contacts in group: ${errorMessage}`
          );
        }
      }
      formatGroup(group) {
        return {
          id: group.id,
          name: group.name,
          description: group.description,
          accountId: group.account_id,
          createdAt: group.created_at,
          updatedAt: group.updated_at
        };
      }
      formatContact(contact) {
        return {
          id: contact.id,
          email: contact.email,
          displayName: contact.display_name,
          firstName: contact.first_name,
          lastName: contact.last_name,
          nickname: contact.nickname,
          phone: contact.phone,
          company: contact.company,
          jobTitle: contact.job_title,
          notes: contact.notes,
          photoPath: contact.photo_path,
          isFavorite: contact.is_favorite === 1,
          accountId: contact.account_id,
          createdAt: contact.created_at,
          updatedAt: contact.updated_at
        };
      }
    };
    contactGroupModel = new ContactGroupModel();
    contact_group_default = contactGroupModel;
  }
});

// src/utils/email-parser.ts
function parseEmailAddress(emailString) {
  if (!emailString || typeof emailString !== "string") {
    return null;
  }
  const normalizedEmail = emailString.trim();
  const nameEmailMatch = normalizedEmail.match(/^(.+?)\s*<([^>]+)>$/);
  if (nameEmailMatch) {
    const name = nameEmailMatch[1].replace(/^["']|["']$/g, "").trim();
    const address = nameEmailMatch[2].trim();
    return { name, address };
  }
  const emailMatch = normalizedEmail.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
  if (emailMatch) {
    return { name: null, address: normalizedEmail };
  }
  return null;
}
var init_email_parser = __esm({
  "src/utils/email-parser.ts"() {
    "use strict";
  }
});

// src/contacts/manager.ts
var require_manager2 = __commonJS({
  "src/contacts/manager.ts"(exports2, module2) {
    "use strict";
    init_contact();
    init_contact_group();
    init_email_parser();
    init_errors();
    init_logger();
    var ContactManager = class {
      /**
       * Add a new contact
       */
      async addContact(contactData) {
        this._validateEmail(contactData.email);
        try {
          const id = contact_default.create(contactData);
          const contact = contact_default.findById(id);
          logger_default.info("Contact added", { id, email: contactData.email });
          return contact;
        } catch (error2) {
          logger_default.error("Failed to add contact", { error: error2.message });
          throw error2;
        }
      }
      /**
       * Get all contacts
       */
      async listContacts(accountId = null, options = {}) {
        try {
          return contact_default.findAll(accountId, options);
        } catch (error2) {
          logger_default.error("Failed to list contacts", { error: error2.message });
          throw error2;
        }
      }
      /**
       * Get contact by ID
       */
      async getContact(id) {
        try {
          const contact = contact_default.findById(id);
          if (!contact) {
            throw new ValidationError(`Contact with ID ${id} not found`);
          }
          return contact;
        } catch (error2) {
          logger_default.error("Failed to get contact", { id, error: error2.message });
          throw error2;
        }
      }
      /**
       * Update contact
       */
      async updateContact(id, data) {
        if (data.email) {
          this._validateEmail(data.email);
        }
        try {
          const updated = contact_default.update(id, data);
          if (!updated) {
            throw new ValidationError(`Contact with ID ${id} not found`);
          }
          const contact = contact_default.findById(id);
          logger_default.info("Contact updated", { id });
          return contact;
        } catch (error2) {
          logger_default.error("Failed to update contact", { id, error: error2.message });
          throw error2;
        }
      }
      /**
       * Delete contact
       */
      async deleteContact(id) {
        try {
          const deleted = contact_default.delete(id);
          if (!deleted) {
            throw new ValidationError(`Contact with ID ${id} not found`);
          }
          logger_default.info("Contact deleted", { id });
          return true;
        } catch (error2) {
          logger_default.error("Failed to delete contact", { id, error: error2.message });
          throw error2;
        }
      }
      /**
       * Search contacts
       */
      async searchContacts(keyword, accountId = null, options = {}) {
        try {
          return contact_default.search(keyword, accountId, options);
        } catch (error2) {
          logger_default.error("Failed to search contacts", {
            keyword,
            error: error2.message
          });
          throw error2;
        }
      }
      /**
       * Create contact group
       */
      async createGroup(groupData) {
        try {
          const id = contact_group_default.create(groupData);
          const group = contact_group_default.findById(id);
          logger_default.info("Contact group created", { id, name: groupData.name });
          return group;
        } catch (error2) {
          logger_default.error("Failed to create contact group", { error: error2.message });
          throw error2;
        }
      }
      /**
       * List all contact groups
       */
      async listGroups(accountId = null) {
        try {
          return contact_group_default.findAll(accountId);
        } catch (error2) {
          logger_default.error("Failed to list contact groups", { error: error2.message });
          throw error2;
        }
      }
      /**
       * Add contact to group
       */
      async addContactToGroup(contactId, groupId) {
        try {
          contact_group_default.addContact(groupId, contactId);
          logger_default.info("Contact added to group", { contactId, groupId });
          return true;
        } catch (error2) {
          logger_default.error("Failed to add contact to group", {
            contactId,
            groupId,
            error: error2.message
          });
          throw error2;
        }
      }
      /**
       * Remove contact from group
       */
      async removeContactFromGroup(contactId, groupId) {
        try {
          const removed = contact_group_default.removeContact(groupId, contactId);
          if (!removed) {
            throw new ValidationError("Contact not found in group");
          }
          logger_default.info("Contact removed from group", { contactId, groupId });
          return true;
        } catch (error2) {
          logger_default.error("Failed to remove contact from group", {
            contactId,
            groupId,
            error: error2.message
          });
          throw error2;
        }
      }
      /**
       * Get contacts in a group
       */
      async getGroupContacts(groupId, options = {}) {
        try {
          return contact_group_default.getContacts(groupId, options);
        } catch (error2) {
          logger_default.error("Failed to get group contacts", {
            groupId,
            error: error2.message
          });
          throw error2;
        }
      }
      /**
       * Auto-collect contact from email address
       */
      async autoCollectContact(emailAddress, accountId = null) {
        try {
          const parsed = parseEmailAddress(emailAddress);
          if (!parsed || !parsed.address) {
            return null;
          }
          const result = contact_default.findOrCreate(parsed.address, {
            displayName: parsed.name || null,
            accountId
          });
          if (result.created) {
            logger_default.info("Contact auto-collected", { email: parsed.address });
          }
          return result.contact;
        } catch (error2) {
          logger_default.error("Failed to auto-collect contact", {
            emailAddress,
            error: error2.message
          });
          return null;
        }
      }
      /**
       * Get contact suggestions for email composition
       */
      async getSuggestions(query, accountId = null, limit = 10) {
        try {
          if (!query || query.length < 2) {
            return [];
          }
          const contacts = await this.searchContacts(query, accountId, { limit });
          return contacts.map((contact) => ({
            email: contact.email,
            name: contact.displayName || contact.email,
            company: contact.company
          }));
        } catch (error2) {
          logger_default.error("Failed to get contact suggestions", {
            query,
            error: error2.message
          });
          return [];
        }
      }
      /**
       * Import contacts from CSV
       */
      async importFromCSV(csvData) {
        const lines = csvData.trim().split("\n");
        if (lines.length < 2) {
          throw new ValidationError(
            "CSV file must contain header and at least one contact"
          );
        }
        const header = lines[0].split(",").map((h) => h.trim().toLowerCase());
        const imported = [];
        const errors = [];
        for (let i = 1; i < lines.length; i++) {
          try {
            const values = lines[i].split(",").map((v) => v.trim());
            const contactData = {};
            header.forEach((field, index) => {
              const value = values[index];
              if (!value) return;
              switch (field) {
                case "email":
                  contactData.email = value;
                  break;
                case "name":
                case "display_name":
                  contactData.displayName = value;
                  break;
                case "first_name":
                  contactData.firstName = value;
                  break;
                case "last_name":
                  contactData.lastName = value;
                  break;
                case "phone":
                  contactData.phone = value;
                  break;
                case "company":
                  contactData.company = value;
                  break;
                case "job_title":
                case "title":
                  contactData.jobTitle = value;
                  break;
                case "notes":
                  contactData.notes = value;
                  break;
              }
            });
            if (!contactData.email) {
              errors.push({ line: i + 1, error: "Missing email address" });
              continue;
            }
            const result = contact_default.findOrCreate(
              contactData.email,
              contactData
            );
            imported.push(result.contact);
          } catch (error2) {
            errors.push({ line: i + 1, error: error2.message });
          }
        }
        logger_default.info("Contacts imported from CSV", {
          imported: imported.length,
          errors: errors.length
        });
        return { imported, errors };
      }
      /**
       * Export contacts to CSV
       */
      async exportToCSV(accountId = null) {
        try {
          const contacts = await this.listContacts(accountId, { limit: 1e4 });
          const header = "email,display_name,first_name,last_name,phone,company,job_title,notes";
          const rows = contacts.map((contact) => {
            return [
              contact.email,
              contact.displayName || "",
              contact.firstName || "",
              contact.lastName || "",
              contact.phone || "",
              contact.company || "",
              contact.jobTitle || "",
              contact.notes || ""
            ].map((field) => `"${field.replace(/"/g, '""')}"`).join(",");
          });
          return [header, ...rows].join("\n");
        } catch (error2) {
          logger_default.error("Failed to export contacts to CSV", {
            error: error2.message
          });
          throw error2;
        }
      }
      /**
       * Validate email address
       */
      _validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
          throw new ValidationError(`Invalid email address: ${email}`);
        }
      }
    };
    module2.exports = new ContactManager();
  }
});

// src/cli/commands/contact.ts
var require_contact = __commonJS({
  "src/cli/commands/contact.ts"(exports2, module2) {
    "use strict";
    var import_fs3 = __toESM(require("fs"));
    var import_chalk8 = __toESM(require("chalk"));
    var import_manager6 = __toESM(require_manager2());
    init_contact_group();
    init_logger();
    function contactCommand2(action, args, options) {
      try {
        switch (action) {
          case "add":
            return addContact(args, options);
          case "list":
            return listContacts(args, options);
          case "show":
            return showContact(args, options);
          case "edit":
            return editContact(args, options);
          case "delete":
            return deleteContact(args, options);
          case "search":
            return searchContacts(args, options);
          case "group":
            return groupCommand(args, options);
          case "import":
            return importContacts(args, options);
          case "export":
            return exportContacts(args, options);
          default:
            console.error(import_chalk8.default.red("Error:"), `Unknown action: ${action}`);
            console.log(
              import_chalk8.default.gray(
                "Available actions: add, list, show, edit, delete, search, group, import, export"
              )
            );
            process.exit(1);
        }
      } catch (error2) {
        console.error(import_chalk8.default.red("Error:"), error2.message);
        logger_default.error("Contact command failed", { action, error: error2.message });
        process.exit(1);
      }
    }
    async function addContact(args, options) {
      if (!options.email) {
        console.error(import_chalk8.default.red("Error:"), "Email address is required");
        console.log(
          import_chalk8.default.gray(
            "Usage: contact add --email <email> [--name <name>] [--phone <phone>] [--company <company>]"
          )
        );
        process.exit(1);
      }
      const contactData = {
        email: options.email,
        displayName: options.name || null,
        phone: options.phone || null,
        company: options.company || null,
        jobTitle: options.title || null,
        notes: options.notes || null
      };
      const contact = await import_manager6.default.addContact(contactData);
      console.log(import_chalk8.default.green("\u2713"), "Contact added successfully");
      console.log(import_chalk8.default.gray(`  ID: ${contact.id}`));
      console.log(import_chalk8.default.gray(`  Email: ${contact.email}`));
      if (contact.displayName) {
        console.log(import_chalk8.default.gray(`  Name: ${contact.displayName}`));
      }
      if (contact.phone) {
        console.log(import_chalk8.default.gray(`  Phone: ${contact.phone}`));
      }
      if (contact.company) {
        console.log(import_chalk8.default.gray(`  Company: ${contact.company}`));
      }
    }
    async function listContacts(args, options) {
      const groupName = options.group;
      let contacts;
      if (groupName) {
        const group = contact_group_default.findByName(groupName);
        if (!group) {
          console.error(import_chalk8.default.red("Error:"), `Group "${groupName}" not found`);
          process.exit(1);
        }
        contacts = contact_group_default.getContacts(group.id);
        console.log(import_chalk8.default.bold.cyan(`Contacts in group "${group.name}":`));
      } else {
        contacts = await import_manager6.default.listContacts(null, {
          limit: options.limit || 100,
          favoriteOnly: options.favorites || false
        });
        console.log(import_chalk8.default.bold.cyan("All Contacts:"));
      }
      if (contacts.length === 0) {
        console.log(import_chalk8.default.yellow("No contacts found."));
        return;
      }
      console.log();
      contacts.forEach((contact) => {
        const favorite = contact.isFavorite ? import_chalk8.default.yellow("\u2605 ") : "  ";
        console.log(
          `${favorite}${import_chalk8.default.bold(contact.displayName || contact.email)}`
        );
        console.log(import_chalk8.default.gray(`  ID: ${contact.id} | Email: ${contact.email}`));
        if (contact.phone) {
          console.log(import_chalk8.default.gray(`  Phone: ${contact.phone}`));
        }
        if (contact.company) {
          console.log(import_chalk8.default.gray(`  Company: ${contact.company}`));
        }
        console.log();
      });
      console.log(import_chalk8.default.gray(`Total: ${contacts.length} contacts`));
    }
    async function showContact(args, options) {
      if (!args || args.length === 0) {
        console.error(import_chalk8.default.red("Error:"), "Contact ID is required");
        console.log(import_chalk8.default.gray("Usage: contact show <id>"));
        process.exit(1);
      }
      const contactId = parseInt(args[0]);
      const contact = await import_manager6.default.getContact(contactId);
      console.log(import_chalk8.default.bold.cyan("Contact Details:"));
      console.log();
      console.log(import_chalk8.default.bold("  ID:"), contact.id);
      console.log(import_chalk8.default.bold("  Email:"), contact.email);
      if (contact.displayName) {
        console.log(import_chalk8.default.bold("  Name:"), contact.displayName);
      }
      if (contact.firstName) {
        console.log(import_chalk8.default.bold("  First Name:"), contact.firstName);
      }
      if (contact.lastName) {
        console.log(import_chalk8.default.bold("  Last Name:"), contact.lastName);
      }
      if (contact.phone) {
        console.log(import_chalk8.default.bold("  Phone:"), contact.phone);
      }
      if (contact.company) {
        console.log(import_chalk8.default.bold("  Company:"), contact.company);
      }
      if (contact.jobTitle) {
        console.log(import_chalk8.default.bold("  Job Title:"), contact.jobTitle);
      }
      if (contact.notes) {
        console.log(import_chalk8.default.bold("  Notes:"), contact.notes);
      }
      console.log(import_chalk8.default.bold("  Favorite:"), contact.isFavorite ? "Yes" : "No");
      console.log(import_chalk8.default.gray(`  Created: ${contact.createdAt}`));
      console.log(import_chalk8.default.gray(`  Updated: ${contact.updatedAt}`));
      const groups = contact_group_default.getGroupsByContact(contactId);
      if (groups.length > 0) {
        console.log();
        console.log(import_chalk8.default.bold("  Groups:"));
        groups.forEach((group) => {
          console.log(import_chalk8.default.gray(`    - ${group.name}`));
        });
      }
    }
    async function editContact(args, options) {
      if (!args || args.length === 0) {
        console.error(import_chalk8.default.red("Error:"), "Contact ID is required");
        console.log(
          import_chalk8.default.gray(
            "Usage: contact edit <id> [--name <name>] [--email <email>] [--phone <phone>] [--company <company>]"
          )
        );
        process.exit(1);
      }
      const contactId = parseInt(args[0]);
      const updateData = {};
      if (options.name !== void 0) updateData.displayName = options.name;
      if (options.email !== void 0) updateData.email = options.email;
      if (options.phone !== void 0) updateData.phone = options.phone;
      if (options.company !== void 0) updateData.company = options.company;
      if (options.title !== void 0) updateData.jobTitle = options.title;
      if (options.notes !== void 0) updateData.notes = options.notes;
      if (options.favorite !== void 0)
        updateData.isFavorite = options.favorite === "true";
      if (Object.keys(updateData).length === 0) {
        console.error(import_chalk8.default.red("Error:"), "No fields to update");
        console.log(
          import_chalk8.default.gray(
            "Usage: contact edit <id> [--name <name>] [--email <email>] [--phone <phone>] [--company <company>]"
          )
        );
        process.exit(1);
      }
      const contact = await import_manager6.default.updateContact(contactId, updateData);
      console.log(import_chalk8.default.green("\u2713"), "Contact updated successfully");
      console.log(import_chalk8.default.gray(`  ID: ${contact.id}`));
      console.log(import_chalk8.default.gray(`  Email: ${contact.email}`));
      if (contact.displayName) {
        console.log(import_chalk8.default.gray(`  Name: ${contact.displayName}`));
      }
    }
    async function deleteContact(args, options) {
      if (!args || args.length === 0) {
        console.error(import_chalk8.default.red("Error:"), "Contact ID is required");
        console.log(import_chalk8.default.gray("Usage: contact delete <id> [--yes]"));
        process.exit(1);
      }
      const contactId = parseInt(args[0]);
      const contact = await import_manager6.default.getContact(contactId);
      if (!options.yes) {
        console.log(
          import_chalk8.default.yellow("Warning:"),
          `Delete contact "${contact.displayName || contact.email}"?`
        );
        console.log(import_chalk8.default.gray("Use --yes to confirm deletion"));
        process.exit(1);
      }
      await import_manager6.default.deleteContact(contactId);
      console.log(import_chalk8.default.green("\u2713"), "Contact deleted successfully");
    }
    async function searchContacts(args, options) {
      if (!args || args.length === 0) {
        console.error(import_chalk8.default.red("Error:"), "Search keyword is required");
        console.log(import_chalk8.default.gray("Usage: contact search <keyword>"));
        process.exit(1);
      }
      const keyword = args.join(" ");
      const contacts = await import_manager6.default.searchContacts(keyword, null, {
        limit: options.limit || 50
      });
      if (contacts.length === 0) {
        console.log(import_chalk8.default.yellow(`No contacts found matching "${keyword}".`));
        return;
      }
      console.log(import_chalk8.default.bold.cyan(`Search results for "${keyword}":`));
      console.log();
      contacts.forEach((contact) => {
        const favorite = contact.isFavorite ? import_chalk8.default.yellow("\u2605 ") : "  ";
        console.log(
          `${favorite}${import_chalk8.default.bold(contact.displayName || contact.email)}`
        );
        console.log(import_chalk8.default.gray(`  ID: ${contact.id} | Email: ${contact.email}`));
        if (contact.phone) {
          console.log(import_chalk8.default.gray(`  Phone: ${contact.phone}`));
        }
        if (contact.company) {
          console.log(import_chalk8.default.gray(`  Company: ${contact.company}`));
        }
        console.log();
      });
      console.log(import_chalk8.default.gray(`Found: ${contacts.length} contacts`));
    }
    async function groupCommand(args, options) {
      if (!args || args.length === 0) {
        console.error(import_chalk8.default.red("Error:"), "Group action is required");
        console.log(
          import_chalk8.default.gray("Available actions: create, list, add, remove, show")
        );
        process.exit(1);
      }
      const action = args[0];
      const subArgs = args.slice(1);
      switch (action) {
        case "create":
          return createGroup(subArgs, options);
        case "list":
          return listGroups(options);
        case "add":
          return addToGroup(subArgs, options);
        case "remove":
          return removeFromGroup(subArgs, options);
        case "show":
          return showGroup(subArgs, options);
        default:
          console.error(import_chalk8.default.red("Error:"), `Unknown group action: ${action}`);
          console.log(
            import_chalk8.default.gray("Available actions: create, list, add, remove, show")
          );
          process.exit(1);
      }
    }
    async function createGroup(args, options) {
      if (!args || args.length === 0) {
        console.error(import_chalk8.default.red("Error:"), "Group name is required");
        console.log(
          import_chalk8.default.gray("Usage: contact group create <name> [--description <text>]")
        );
        process.exit(1);
      }
      const name = args.join(" ");
      const group = await import_manager6.default.createGroup({
        name,
        description: options.description || null
      });
      console.log(import_chalk8.default.green("\u2713"), `Group "${group.name}" created successfully`);
      console.log(import_chalk8.default.gray(`  ID: ${group.id}`));
      if (group.description) {
        console.log(import_chalk8.default.gray(`  Description: ${group.description}`));
      }
    }
    async function listGroups(options) {
      const groups = await import_manager6.default.listGroups();
      if (groups.length === 0) {
        console.log(import_chalk8.default.yellow("No groups found."));
        return;
      }
      console.log(import_chalk8.default.bold.cyan("Contact Groups:"));
      console.log();
      for (const group of groups) {
        const count = contact_group_default.countContacts(group.id);
        console.log(import_chalk8.default.bold(group.name), import_chalk8.default.gray(`(${count} contacts)`));
        console.log(import_chalk8.default.gray(`  ID: ${group.id}`));
        if (group.description) {
          console.log(import_chalk8.default.gray(`  ${group.description}`));
        }
        console.log();
      }
      console.log(import_chalk8.default.gray(`Total: ${groups.length} groups`));
    }
    async function addToGroup(args, options) {
      if (!args || args.length < 2) {
        console.error(
          import_chalk8.default.red("Error:"),
          "Contact ID and group name are required"
        );
        console.log(
          import_chalk8.default.gray("Usage: contact group add <contact-id> <group-name>")
        );
        process.exit(1);
      }
      const contactId = parseInt(args[0]);
      const groupName = args.slice(1).join(" ");
      const contact = await import_manager6.default.getContact(contactId);
      const group = contact_group_default.findByName(groupName);
      if (!group) {
        console.error(import_chalk8.default.red("Error:"), `Group "${groupName}" not found`);
        process.exit(1);
      }
      await import_manager6.default.addContactToGroup(contactId, group.id);
      console.log(
        import_chalk8.default.green("\u2713"),
        `Contact "${contact.displayName || contact.email}" added to group "${group.name}"`
      );
    }
    async function removeFromGroup(args, options) {
      if (!args || args.length < 2) {
        console.error(
          import_chalk8.default.red("Error:"),
          "Contact ID and group name are required"
        );
        console.log(
          import_chalk8.default.gray("Usage: contact group remove <contact-id> <group-name>")
        );
        process.exit(1);
      }
      const contactId = parseInt(args[0]);
      const groupName = args.slice(1).join(" ");
      const contact = await import_manager6.default.getContact(contactId);
      const group = contact_group_default.findByName(groupName);
      if (!group) {
        console.error(import_chalk8.default.red("Error:"), `Group "${groupName}" not found`);
        process.exit(1);
      }
      await import_manager6.default.removeContactFromGroup(contactId, group.id);
      console.log(
        import_chalk8.default.green("\u2713"),
        `Contact "${contact.displayName || contact.email}" removed from group "${group.name}"`
      );
    }
    async function showGroup(args, options) {
      if (!args || args.length === 0) {
        console.error(import_chalk8.default.red("Error:"), "Group name is required");
        console.log(import_chalk8.default.gray("Usage: contact group show <group-name>"));
        process.exit(1);
      }
      const groupName = args.join(" ");
      const group = contact_group_default.findByName(groupName);
      if (!group) {
        console.error(import_chalk8.default.red("Error:"), `Group "${groupName}" not found`);
        process.exit(1);
      }
      console.log(import_chalk8.default.bold.cyan("Group Details:"));
      console.log();
      console.log(import_chalk8.default.bold("  Name:"), group.name);
      console.log(import_chalk8.default.bold("  ID:"), group.id);
      if (group.description) {
        console.log(import_chalk8.default.bold("  Description:"), group.description);
      }
      const contacts = await import_manager6.default.getGroupContacts(group.id);
      console.log();
      console.log(import_chalk8.default.bold("  Contacts:"), contacts.length);
      if (contacts.length > 0) {
        console.log();
        contacts.forEach((contact) => {
          console.log(
            `    - ${contact.displayName || contact.email} (${contact.email})`
          );
        });
      }
    }
    async function importContacts(args, options) {
      if (!args || args.length === 0) {
        console.error(import_chalk8.default.red("Error:"), "CSV file path is required");
        console.log(import_chalk8.default.gray("Usage: contact import <file.csv>"));
        process.exit(1);
      }
      const filePath = args[0];
      if (!import_fs3.default.existsSync(filePath)) {
        console.error(import_chalk8.default.red("Error:"), `File not found: ${filePath}`);
        process.exit(1);
      }
      const csvData = import_fs3.default.readFileSync(filePath, "utf-8");
      const result = await import_manager6.default.importFromCSV(csvData);
      console.log(import_chalk8.default.green("\u2713"), "Import completed");
      console.log(import_chalk8.default.gray(`  Imported: ${result.imported.length} contacts`));
      if (result.errors.length > 0) {
        console.log(import_chalk8.default.yellow(`  Errors: ${result.errors.length}`));
        console.log();
        console.log(import_chalk8.default.yellow("Errors:"));
        result.errors.forEach((error2) => {
          console.log(import_chalk8.default.gray(`  Line ${error2.line}: ${error2.error}`));
        });
      }
    }
    async function exportContacts(args, options) {
      if (!args || args.length === 0) {
        console.error(import_chalk8.default.red("Error:"), "Output file path is required");
        console.log(import_chalk8.default.gray("Usage: contact export <file.csv>"));
        process.exit(1);
      }
      const filePath = args[0];
      const csvData = await import_manager6.default.exportToCSV();
      import_fs3.default.writeFileSync(filePath, csvData, "utf-8");
      console.log(import_chalk8.default.green("\u2713"), `Contacts exported to ${filePath}`);
    }
    module2.exports = contactCommand2;
  }
});

// src/storage/models/email.ts
var EmailModel, email_default;
var init_email = __esm({
  "src/storage/models/email.ts"() {
    "use strict";
    init_errors();
    init_logger();
    init_database();
    EmailModel = class {
      db = null;
      _getDb() {
        if (!this.db) {
          this.db = database_default.getDb();
        }
        return this.db;
      }
      create(emailData) {
        try {
          const db = this._getDb();
          const stmt = db.prepare(`
        INSERT INTO emails (
          uid, message_id, folder, from_address, to_address, cc_address,
          subject, date, body_text, body_html, has_attachments, is_read, flags
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
          const result = stmt.run(
            emailData.uid,
            emailData.messageId,
            emailData.folder,
            emailData.from,
            emailData.to,
            emailData.cc || null,
            emailData.subject,
            emailData.date,
            emailData.bodyText || null,
            emailData.bodyHtml || null,
            emailData.hasAttachments ? 1 : 0,
            emailData.isRead ? 1 : 0,
            emailData.flags ? JSON.stringify(emailData.flags) : null
          );
          logger_default.debug("Email created", { id: result.lastInsertRowid });
          return result.lastInsertRowid;
        } catch (error2) {
          const errorMessage = error2 instanceof Error ? error2.message : String(error2);
          logger_default.error("Failed to create email", { error: errorMessage });
          throw new StorageError(`Failed to create email: ${errorMessage}`);
        }
      }
      findById(id) {
        try {
          const db = this._getDb();
          const stmt = db.prepare("SELECT * FROM emails WHERE id = ?");
          const email = stmt.get(id);
          return email ? this._formatEmail(email) : null;
        } catch (error2) {
          const errorMessage = error2 instanceof Error ? error2.message : String(error2);
          logger_default.error("Failed to find email by ID", { id, error: errorMessage });
          throw new StorageError(`Failed to find email: ${errorMessage}`);
        }
      }
      findByUid(uid, folder = "INBOX") {
        try {
          const db = this._getDb();
          const stmt = db.prepare(
            "SELECT * FROM emails WHERE uid = ? AND folder = ?"
          );
          const email = stmt.get(uid, folder);
          return email ? this._formatEmail(email) : null;
        } catch (error2) {
          const errorMessage = error2 instanceof Error ? error2.message : String(error2);
          logger_default.error("Failed to find email by UID", { uid, error: errorMessage });
          throw new StorageError(`Failed to find email: ${errorMessage}`);
        }
      }
      findByMessageId(messageId) {
        try {
          const db = this._getDb();
          const stmt = db.prepare("SELECT * FROM emails WHERE message_id = ?");
          const email = stmt.get(messageId);
          return email ? this._formatEmail(email) : null;
        } catch (error2) {
          const errorMessage = error2 instanceof Error ? error2.message : String(error2);
          logger_default.error("Failed to find email by message ID", {
            messageId,
            error: errorMessage
          });
          throw new StorageError(`Failed to find email: ${errorMessage}`);
        }
      }
      findByFolder(folder = "INBOX", options = {}) {
        try {
          const db = this._getDb();
          const { limit = 50, offset = 0, unreadOnly = false } = options;
          let query = "SELECT * FROM emails WHERE folder = ?";
          const params = [folder];
          if (unreadOnly) {
            query += " AND is_read = 0";
          }
          query += " ORDER BY date DESC LIMIT ? OFFSET ?";
          params.push(limit, offset);
          const stmt = db.prepare(query);
          const emails = stmt.all(...params);
          return emails.map((email) => this._formatEmail(email));
        } catch (error2) {
          const errorMessage = error2 instanceof Error ? error2.message : String(error2);
          logger_default.error("Failed to find emails by folder", {
            folder,
            error: errorMessage
          });
          throw new StorageError(`Failed to find emails: ${errorMessage}`);
        }
      }
      search(query) {
        try {
          const db = this._getDb();
          const {
            keyword,
            from,
            to,
            cc,
            subject,
            folder,
            dateFrom,
            dateTo,
            starred,
            flagged,
            unread,
            hasAttachment,
            noAttachment,
            tag,
            accountId,
            limit = 100,
            offset = 0
          } = query;
          let sql = "SELECT DISTINCT e.* FROM emails e";
          const params = [];
          const conditions = [];
          if (tag) {
            sql += " LEFT JOIN email_tags et ON e.id = et.email_id";
            sql += " LEFT JOIN tags t ON et.tag_id = t.id";
          }
          conditions.push("e.is_deleted = 0");
          if (keyword) {
            conditions.push(
              "(e.subject LIKE ? OR e.body_text LIKE ? OR e.from_address LIKE ?)"
            );
            const searchTerm = `%${keyword}%`;
            params.push(searchTerm, searchTerm, searchTerm);
          }
          if (from) {
            conditions.push("e.from_address LIKE ?");
            params.push(`%${from}%`);
          }
          if (to) {
            conditions.push("e.to_address LIKE ?");
            params.push(`%${to}%`);
          }
          if (cc) {
            conditions.push("e.cc_address LIKE ?");
            params.push(`%${cc}%`);
          }
          if (subject) {
            conditions.push("e.subject LIKE ?");
            params.push(`%${subject}%`);
          }
          if (folder) {
            conditions.push("e.folder = ?");
            params.push(folder);
          }
          if (dateFrom) {
            conditions.push("e.date >= ?");
            params.push(dateFrom);
          }
          if (dateTo) {
            conditions.push("e.date <= ?");
            params.push(dateTo);
          }
          if (starred !== void 0) {
            conditions.push("e.is_starred = ?");
            params.push(starred ? 1 : 0);
          }
          if (flagged !== void 0) {
            conditions.push("e.is_important = ?");
            params.push(flagged ? 1 : 0);
          }
          if (unread !== void 0) {
            conditions.push("e.is_read = ?");
            params.push(unread ? 0 : 1);
          }
          if (hasAttachment !== void 0) {
            conditions.push("e.has_attachments = ?");
            params.push(hasAttachment ? 1 : 0);
          }
          if (noAttachment) {
            conditions.push("e.has_attachments = 0");
          }
          if (tag) {
            conditions.push("t.name = ?");
            params.push(tag);
          }
          if (accountId !== void 0) {
            conditions.push("e.account_id = ?");
            params.push(accountId);
          }
          if (conditions.length > 0) {
            sql += " WHERE " + conditions.join(" AND ");
          }
          sql += " ORDER BY e.date DESC";
          sql += " LIMIT ? OFFSET ?";
          params.push(limit, offset);
          const stmt = db.prepare(sql);
          const emails = stmt.all(...params);
          return emails.map((email) => this._formatEmail(email));
        } catch (error2) {
          const errorMessage = error2 instanceof Error ? error2.message : String(error2);
          logger_default.error("Failed to search emails", { error: errorMessage });
          throw new StorageError(`Failed to search emails: ${errorMessage}`);
        }
      }
      update(id, data) {
        try {
          const db = this._getDb();
          const fields = [];
          const params = [];
          if (data.isRead !== void 0) {
            fields.push("is_read = ?");
            params.push(data.isRead ? 1 : 0);
          }
          if (data.flags !== void 0) {
            fields.push("flags = ?");
            params.push(JSON.stringify(data.flags));
          }
          if (data.bodyText !== void 0) {
            fields.push("body_text = ?");
            params.push(data.bodyText);
          }
          if (data.bodyHtml !== void 0) {
            fields.push("body_html = ?");
            params.push(data.bodyHtml);
          }
          if (fields.length === 0) {
            return false;
          }
          fields.push("updated_at = CURRENT_TIMESTAMP");
          params.push(id);
          const sql = `UPDATE emails SET ${fields.join(", ")} WHERE id = ?`;
          const stmt = db.prepare(sql);
          const result = stmt.run(...params);
          logger_default.debug("Email updated", { id, changes: result.changes });
          return result.changes > 0;
        } catch (error2) {
          const errorMessage = error2 instanceof Error ? error2.message : String(error2);
          logger_default.error("Failed to update email", { id, error: errorMessage });
          throw new StorageError(`Failed to update email: ${errorMessage}`);
        }
      }
      updateBody(id, bodyData) {
        return this.update(id, {
          bodyText: bodyData.bodyText,
          bodyHtml: bodyData.bodyHtml
        });
      }
      markAsRead(id) {
        return this.update(id, { isRead: true });
      }
      markAsUnread(id) {
        return this.update(id, { isRead: false });
      }
      updateFolder(id, folder) {
        try {
          const db = this._getDb();
          const stmt = db.prepare(`
        UPDATE emails SET folder = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `);
          const result = stmt.run(folder, id);
          logger_default.debug("Email folder updated", {
            id,
            folder,
            changes: result.changes
          });
          return result.changes > 0;
        } catch (error2) {
          const errorMessage = error2 instanceof Error ? error2.message : String(error2);
          logger_default.error("Failed to update email folder", {
            id,
            folder,
            error: errorMessage
          });
          throw new StorageError(`Failed to update email folder: ${errorMessage}`);
        }
      }
      markAsSpam(id) {
        try {
          const db = this._getDb();
          const stmt = db.prepare(`
        UPDATE emails SET is_spam = 1, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `);
          const result = stmt.run(id);
          logger_default.debug("Email marked as spam", { id, changes: result.changes });
          return result.changes > 0;
        } catch (error2) {
          const errorMessage = error2 instanceof Error ? error2.message : String(error2);
          logger_default.error("Failed to mark email as spam", { id, error: errorMessage });
          throw new StorageError(`Failed to mark email as spam: ${errorMessage}`);
        }
      }
      unmarkAsSpam(id) {
        try {
          const db = this._getDb();
          const stmt = db.prepare(`
        UPDATE emails SET is_spam = 0, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `);
          const result = stmt.run(id);
          logger_default.debug("Email unmarked as spam", { id, changes: result.changes });
          return result.changes > 0;
        } catch (error2) {
          const errorMessage = error2 instanceof Error ? error2.message : String(error2);
          logger_default.error("Failed to unmark email as spam", {
            id,
            error: errorMessage
          });
          throw new StorageError(`Failed to unmark email as spam: ${errorMessage}`);
        }
      }
      findSpam(options = {}) {
        try {
          const db = this._getDb();
          const { limit = 50, offset = 0 } = options;
          const query = `
        SELECT * FROM emails
        WHERE is_spam = 1 AND is_deleted = 0
        ORDER BY date DESC
        LIMIT ? OFFSET ?
      `;
          const stmt = db.prepare(query);
          const emails = stmt.all(limit, offset);
          return emails.map((email) => this._formatEmail(email));
        } catch (error2) {
          const errorMessage = error2 instanceof Error ? error2.message : String(error2);
          logger_default.error("Failed to find spam emails", { error: errorMessage });
          throw new StorageError(`Failed to find spam emails: ${errorMessage}`);
        }
      }
      countSpam() {
        try {
          const db = this._getDb();
          const stmt = db.prepare(
            "SELECT COUNT(*) as count FROM emails WHERE is_spam = 1 AND is_deleted = 0"
          );
          const result = stmt.get();
          return result.count;
        } catch (error2) {
          const errorMessage = error2 instanceof Error ? error2.message : String(error2);
          logger_default.error("Failed to count spam emails", { error: errorMessage });
          throw new StorageError(`Failed to count spam emails: ${errorMessage}`);
        }
      }
      saveDraft(draftData) {
        try {
          const db = this._getDb();
          if (draftData.id) {
            const stmt = db.prepare(`
          UPDATE emails SET
            to_address = ?,
            cc_address = ?,
            subject = ?,
            body_text = ?,
            body_html = ?,
            updated_at = CURRENT_TIMESTAMP
          WHERE id = ? AND is_draft = 1
        `);
            const result = stmt.run(
              draftData.to || "",
              draftData.cc || "",
              draftData.subject || "",
              draftData.bodyText || "",
              draftData.bodyHtml || "",
              draftData.id
            );
            logger_default.debug("Draft updated", {
              id: draftData.id,
              changes: result.changes
            });
            return draftData.id;
          } else {
            const stmt = db.prepare(`
          INSERT INTO emails (
            uid, message_id, folder, from_address, to_address, cc_address,
            subject, date, body_text, body_html, has_attachments, is_read, is_draft, flags
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);
            const result = stmt.run(
              draftData.uid || 0,
              draftData.messageId || `draft-${Date.now()}@local`,
              "Drafts",
              draftData.from || "",
              draftData.to || "",
              draftData.cc || "",
              draftData.subject || "",
              (/* @__PURE__ */ new Date()).toISOString(),
              draftData.bodyText || "",
              draftData.bodyHtml || "",
              0,
              0,
              1,
              JSON.stringify(["\\Draft"])
            );
            logger_default.debug("Draft created", { id: result.lastInsertRowid });
            return result.lastInsertRowid;
          }
        } catch (error2) {
          const errorMessage = error2 instanceof Error ? error2.message : String(error2);
          logger_default.error("Failed to save draft", { error: errorMessage });
          throw new StorageError(`Failed to save draft: ${errorMessage}`);
        }
      }
      findDrafts(options = {}) {
        try {
          const db = this._getDb();
          const { limit = 50, offset = 0 } = options;
          const query = `
        SELECT * FROM emails
        WHERE is_draft = 1
        ORDER BY updated_at DESC
        LIMIT ? OFFSET ?
      `;
          const stmt = db.prepare(query);
          const drafts = stmt.all(limit, offset);
          return drafts.map((draft) => this._formatEmail(draft));
        } catch (error2) {
          const errorMessage = error2 instanceof Error ? error2.message : String(error2);
          logger_default.error("Failed to find drafts", { error: errorMessage });
          throw new StorageError(`Failed to find drafts: ${errorMessage}`);
        }
      }
      deleteDraft(id) {
        try {
          const db = this._getDb();
          const stmt = db.prepare(
            "DELETE FROM emails WHERE id = ? AND is_draft = 1"
          );
          const result = stmt.run(id);
          logger_default.debug("Draft deleted", { id, changes: result.changes });
          return result.changes > 0;
        } catch (error2) {
          const errorMessage = error2 instanceof Error ? error2.message : String(error2);
          logger_default.error("Failed to delete draft", { id, error: errorMessage });
          throw new StorageError(`Failed to delete draft: ${errorMessage}`);
        }
      }
      convertDraftToSent(id, messageId) {
        try {
          const db = this._getDb();
          const stmt = db.prepare(`
        UPDATE emails SET
          is_draft = 0,
          folder = 'Sent',
          message_id = ?,
          date = CURRENT_TIMESTAMP,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ? AND is_draft = 1
      `);
          const result = stmt.run(messageId, id);
          logger_default.debug("Draft converted to sent", { id, changes: result.changes });
          return result.changes > 0;
        } catch (error2) {
          const errorMessage = error2 instanceof Error ? error2.message : String(error2);
          logger_default.error("Failed to convert draft", { id, error: errorMessage });
          throw new StorageError(`Failed to convert draft: ${errorMessage}`);
        }
      }
      countDrafts() {
        try {
          const db = this._getDb();
          const stmt = db.prepare(
            "SELECT COUNT(*) as count FROM emails WHERE is_draft = 1"
          );
          const result = stmt.get();
          return result.count;
        } catch (error2) {
          const errorMessage = error2 instanceof Error ? error2.message : String(error2);
          logger_default.error("Failed to count drafts", { error: errorMessage });
          throw new StorageError(`Failed to count drafts: ${errorMessage}`);
        }
      }
      markAsDeleted(id) {
        try {
          const db = this._getDb();
          const stmt = db.prepare(`
        UPDATE emails
        SET is_deleted = 1, deleted_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `);
          const result = stmt.run(id);
          logger_default.debug("Email marked as deleted", { id, changes: result.changes });
          return result.changes > 0;
        } catch (error2) {
          const errorMessage = error2 instanceof Error ? error2.message : String(error2);
          logger_default.error("Failed to mark email as deleted", {
            id,
            error: errorMessage
          });
          throw new StorageError(
            `Failed to mark email as deleted: ${errorMessage}`
          );
        }
      }
      restoreDeleted(id) {
        try {
          const db = this._getDb();
          const stmt = db.prepare(`
        UPDATE emails
        SET is_deleted = 0, deleted_at = NULL, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `);
          const result = stmt.run(id);
          logger_default.debug("Email restored", { id, changes: result.changes });
          return result.changes > 0;
        } catch (error2) {
          const errorMessage = error2 instanceof Error ? error2.message : String(error2);
          logger_default.error("Failed to restore email", { id, error: errorMessage });
          throw new StorageError(`Failed to restore email: ${errorMessage}`);
        }
      }
      findDeleted(options = {}) {
        try {
          const db = this._getDb();
          const { limit = 50, offset = 0 } = options;
          const sql = `
        SELECT * FROM emails
        WHERE is_deleted = 1
        ORDER BY deleted_at DESC
        LIMIT ? OFFSET ?
      `;
          const stmt = db.prepare(sql);
          const emails = stmt.all(limit, offset);
          return emails.map((email) => this._formatEmail(email));
        } catch (error2) {
          const errorMessage = error2 instanceof Error ? error2.message : String(error2);
          logger_default.error("Failed to find deleted emails", { error: errorMessage });
          throw new StorageError(`Failed to find deleted emails: ${errorMessage}`);
        }
      }
      countDeleted() {
        try {
          const db = this._getDb();
          const stmt = db.prepare(
            "SELECT COUNT(*) as count FROM emails WHERE is_deleted = 1"
          );
          const result = stmt.get();
          return result.count;
        } catch (error2) {
          const errorMessage = error2 instanceof Error ? error2.message : String(error2);
          logger_default.error("Failed to count deleted emails", { error: errorMessage });
          throw new StorageError(`Failed to count deleted emails: ${errorMessage}`);
        }
      }
      permanentlyDelete(id) {
        try {
          const db = this._getDb();
          const stmt = db.prepare("DELETE FROM emails WHERE id = ?");
          const result = stmt.run(id);
          logger_default.debug("Email permanently deleted", {
            id,
            changes: result.changes
          });
          return result.changes > 0;
        } catch (error2) {
          const errorMessage = error2 instanceof Error ? error2.message : String(error2);
          logger_default.error("Failed to permanently delete email", {
            id,
            error: errorMessage
          });
          throw new StorageError(
            `Failed to permanently delete email: ${errorMessage}`
          );
        }
      }
      emptyTrash() {
        try {
          const db = this._getDb();
          const stmt = db.prepare("DELETE FROM emails WHERE is_deleted = 1");
          const result = stmt.run();
          logger_default.info("Trash emptied", { deleted: result.changes });
          return result.changes;
        } catch (error2) {
          const errorMessage = error2 instanceof Error ? error2.message : String(error2);
          logger_default.error("Failed to empty trash", { error: errorMessage });
          throw new StorageError(`Failed to empty trash: ${errorMessage}`);
        }
      }
      findByThreadId(threadId, options = {}) {
        try {
          const db = this._getDb();
          const { limit = 50, offset = 0 } = options;
          const query = `
        SELECT * FROM emails
        WHERE thread_id = ? AND is_deleted = 0
        ORDER BY date ASC
        LIMIT ? OFFSET ?
      `;
          const stmt = db.prepare(query);
          const emails = stmt.all(threadId, limit, offset);
          return emails.map((email) => this._formatEmail(email));
        } catch (error2) {
          const errorMessage = error2 instanceof Error ? error2.message : String(error2);
          logger_default.error("Failed to find emails by thread ID", {
            threadId,
            error: errorMessage
          });
          throw new StorageError(
            `Failed to find emails by thread ID: ${errorMessage}`
          );
        }
      }
      updateThreadMetadata(id, metadata) {
        try {
          const db = this._getDb();
          const fields = [];
          const params = [];
          if (metadata.inReplyTo !== void 0) {
            fields.push("in_reply_to = ?");
            params.push(metadata.inReplyTo);
          }
          if (metadata.references !== void 0) {
            fields.push("references = ?");
            params.push(metadata.references);
          }
          if (metadata.threadId !== void 0) {
            fields.push("thread_id = ?");
            params.push(metadata.threadId);
          }
          if (fields.length === 0) {
            return false;
          }
          fields.push("updated_at = CURRENT_TIMESTAMP");
          params.push(id);
          const sql = `UPDATE emails SET ${fields.join(", ")} WHERE id = ?`;
          const stmt = db.prepare(sql);
          const result = stmt.run(...params);
          logger_default.debug("Email thread metadata updated", {
            id,
            changes: result.changes
          });
          return result.changes > 0;
        } catch (error2) {
          const errorMessage = error2 instanceof Error ? error2.message : String(error2);
          logger_default.error("Failed to update thread metadata", {
            id,
            error: errorMessage
          });
          throw new StorageError(
            `Failed to update thread metadata: ${errorMessage}`
          );
        }
      }
      delete(id) {
        return this.permanentlyDelete(id);
      }
      markAsStarred(id) {
        try {
          const db = this._getDb();
          const stmt = db.prepare(`
        UPDATE emails
        SET is_starred = 1, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `);
          const result = stmt.run(id);
          logger_default.debug("Email marked as starred", { id, changes: result.changes });
          return result.changes > 0;
        } catch (error2) {
          const errorMessage = error2 instanceof Error ? error2.message : String(error2);
          logger_default.error("Failed to mark email as starred", {
            id,
            error: errorMessage
          });
          throw new StorageError(
            `Failed to mark email as starred: ${errorMessage}`
          );
        }
      }
      unmarkAsStarred(id) {
        try {
          const db = this._getDb();
          const stmt = db.prepare(`
        UPDATE emails
        SET is_starred = 0, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `);
          const result = stmt.run(id);
          logger_default.debug("Email unmarked as starred", {
            id,
            changes: result.changes
          });
          return result.changes > 0;
        } catch (error2) {
          const errorMessage = error2 instanceof Error ? error2.message : String(error2);
          logger_default.error("Failed to unmark email as starred", {
            id,
            error: errorMessage
          });
          throw new StorageError(
            `Failed to unmark email as starred: ${errorMessage}`
          );
        }
      }
      markAsImportant(id) {
        try {
          const db = this._getDb();
          const stmt = db.prepare(`
        UPDATE emails
        SET is_important = 1, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `);
          const result = stmt.run(id);
          logger_default.debug("Email marked as important", {
            id,
            changes: result.changes
          });
          return result.changes > 0;
        } catch (error2) {
          const errorMessage = error2 instanceof Error ? error2.message : String(error2);
          logger_default.error("Failed to mark email as important", {
            id,
            error: errorMessage
          });
          throw new StorageError(
            `Failed to mark email as important: ${errorMessage}`
          );
        }
      }
      unmarkAsImportant(id) {
        try {
          const db = this._getDb();
          const stmt = db.prepare(`
        UPDATE emails
        SET is_important = 0, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `);
          const result = stmt.run(id);
          logger_default.debug("Email unmarked as important", {
            id,
            changes: result.changes
          });
          return result.changes > 0;
        } catch (error2) {
          const errorMessage = error2 instanceof Error ? error2.message : String(error2);
          logger_default.error("Failed to unmark email as important", {
            id,
            error: errorMessage
          });
          throw new StorageError(
            `Failed to unmark email as important: ${errorMessage}`
          );
        }
      }
      findStarred(options = {}) {
        try {
          const db = this._getDb();
          const { limit = 50, offset = 0, folder = null } = options;
          let query = "SELECT * FROM emails WHERE is_starred = 1 AND is_deleted = 0";
          const params = [];
          if (folder) {
            query += " AND folder = ?";
            params.push(folder);
          }
          query += " ORDER BY date DESC LIMIT ? OFFSET ?";
          params.push(limit, offset);
          const stmt = db.prepare(query);
          const emails = stmt.all(...params);
          return emails.map((email) => this._formatEmail(email));
        } catch (error2) {
          const errorMessage = error2 instanceof Error ? error2.message : String(error2);
          logger_default.error("Failed to find starred emails", { error: errorMessage });
          throw new StorageError(`Failed to find starred emails: ${errorMessage}`);
        }
      }
      findImportant(options = {}) {
        try {
          const db = this._getDb();
          const { limit = 50, offset = 0, folder = null } = options;
          let query = "SELECT * FROM emails WHERE is_important = 1 AND is_deleted = 0";
          const params = [];
          if (folder) {
            query += " AND folder = ?";
            params.push(folder);
          }
          query += " ORDER BY date DESC LIMIT ? OFFSET ?";
          params.push(limit, offset);
          const stmt = db.prepare(query);
          const emails = stmt.all(...params);
          return emails.map((email) => this._formatEmail(email));
        } catch (error2) {
          const errorMessage = error2 instanceof Error ? error2.message : String(error2);
          logger_default.error("Failed to find important emails", { error: errorMessage });
          throw new StorageError(
            `Failed to find important emails: ${errorMessage}`
          );
        }
      }
      countStarred(folder = null) {
        try {
          const db = this._getDb();
          let query = "SELECT COUNT(*) as count FROM emails WHERE is_starred = 1 AND is_deleted = 0";
          const params = [];
          if (folder) {
            query += " AND folder = ?";
            params.push(folder);
          }
          const stmt = db.prepare(query);
          const result = stmt.get(...params);
          return result.count;
        } catch (error2) {
          const errorMessage = error2 instanceof Error ? error2.message : String(error2);
          logger_default.error("Failed to count starred emails", { error: errorMessage });
          throw new StorageError(`Failed to count starred emails: ${errorMessage}`);
        }
      }
      countImportant(folder = null) {
        try {
          const db = this._getDb();
          let query = "SELECT COUNT(*) as count FROM emails WHERE is_important = 1 AND is_deleted = 0";
          const params = [];
          if (folder) {
            query += " AND folder = ?";
            params.push(folder);
          }
          const stmt = db.prepare(query);
          const result = stmt.get(...params);
          return result.count;
        } catch (error2) {
          const errorMessage = error2 instanceof Error ? error2.message : String(error2);
          logger_default.error("Failed to count important emails", { error: errorMessage });
          throw new StorageError(
            `Failed to count important emails: ${errorMessage}`
          );
        }
      }
      countByFolder(folder = "INBOX", unreadOnly = false) {
        try {
          const db = this._getDb();
          let sql = "SELECT COUNT(*) as count FROM emails WHERE folder = ?";
          const params = [folder];
          if (unreadOnly) {
            sql += " AND is_read = 0";
          }
          const stmt = db.prepare(sql);
          const result = stmt.get(...params);
          return result.count;
        } catch (error2) {
          const errorMessage = error2 instanceof Error ? error2.message : String(error2);
          logger_default.error("Failed to count emails", { folder, error: errorMessage });
          throw new StorageError(`Failed to count emails: ${errorMessage}`);
        }
      }
      _formatEmail(email) {
        return {
          id: email.id,
          uid: email.uid,
          messageId: email.message_id,
          folder: email.folder,
          from: email.from_address,
          to: email.to_address,
          cc: email.cc_address || "",
          subject: email.subject,
          date: email.date,
          bodyText: email.body_text || "",
          bodyHtml: email.body_html || "",
          hasAttachments: email.has_attachments === 1,
          isRead: email.is_read === 1,
          isDraft: email.is_draft === 1,
          isDeleted: email.is_deleted === 1,
          isSpam: email.is_spam === 1,
          isStarred: email.is_starred === 1,
          isImportant: email.is_important === 1,
          priority: email.priority || 0,
          deletedAt: email.deleted_at,
          inReplyTo: email.in_reply_to,
          references: email.references,
          threadId: email.thread_id,
          accountId: email.account_id,
          flags: email.flags ? JSON.parse(email.flags) : [],
          createdAt: email.created_at,
          updatedAt: email.updated_at
        };
      }
    };
    email_default = new EmailModel();
  }
});

// src/filters/executor.ts
var require_executor = __commonJS({
  "src/filters/executor.ts"(exports2, module2) {
    "use strict";
    init_email();
    init_logger();
    var ActionExecutor = class {
      /**
       * Execute a single action on an email
       */
      async executeAction(email, action) {
        const { type, value } = action;
        try {
          switch (type) {
            case "move":
              return await this._moveEmail(email, value);
            case "mark_read":
              return await this._markAsRead(email);
            case "mark_unread":
              return await this._markAsUnread(email);
            case "star":
              return await this._starEmail(email);
            case "unstar":
              return await this._unstarEmail(email);
            case "flag":
              return await this._flagEmail(email);
            case "unflag":
              return await this._unflagEmail(email);
            case "delete":
              return await this._deleteEmail(email);
            case "mark_spam":
              return await this._markAsSpam(email);
            case "add_tag":
              return await this._addTag(email, value);
            case "remove_tag":
              return await this._removeTag(email, value);
            default:
              logger_default.warn("Unknown action type", { type });
              return { success: false, message: `Unknown action type: ${type}` };
          }
        } catch (error2) {
          logger_default.error("Failed to execute action", {
            emailId: email.id,
            action: type,
            error: error2.message
          });
          return { success: false, message: error2.message };
        }
      }
      /**
       * Execute multiple actions on an email
       */
      async executeActions(email, actions) {
        const results = [];
        for (const action of actions) {
          const result = await this.executeAction(email, action);
          results.push({
            action: action.type,
            ...result
          });
        }
        return results;
      }
      /**
       * Move email to folder
       */
      async _moveEmail(email, folder) {
        try {
          const db = email_default._getDb();
          const stmt = db.prepare(
            "UPDATE emails SET folder = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?"
          );
          stmt.run(folder, email.id);
          logger_default.debug("Email moved", { emailId: email.id, folder });
          return { success: true, message: `Moved to ${folder}` };
        } catch (error2) {
          throw new Error(`Failed to move email: ${error2.message}`);
        }
      }
      /**
       * Mark email as read
       */
      async _markAsRead(email) {
        await email_default.markAsRead(email.id);
        logger_default.debug("Email marked as read", { emailId: email.id });
        return { success: true, message: "Marked as read" };
      }
      /**
       * Mark email as unread
       */
      async _markAsUnread(email) {
        await email_default.markAsUnread(email.id);
        logger_default.debug("Email marked as unread", { emailId: email.id });
        return { success: true, message: "Marked as unread" };
      }
      /**
       * Star email
       */
      async _starEmail(email) {
        try {
          const db = email_default._getDb();
          const stmt = db.prepare(
            "UPDATE emails SET is_starred = 1, updated_at = CURRENT_TIMESTAMP WHERE id = ?"
          );
          stmt.run(email.id);
          logger_default.debug("Email starred", { emailId: email.id });
          return { success: true, message: "Starred" };
        } catch (error2) {
          throw new Error(`Failed to star email: ${error2.message}`);
        }
      }
      /**
       * Unstar email
       */
      async _unstarEmail(email) {
        try {
          const db = email_default._getDb();
          const stmt = db.prepare(
            "UPDATE emails SET is_starred = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ?"
          );
          stmt.run(email.id);
          logger_default.debug("Email unstarred", { emailId: email.id });
          return { success: true, message: "Unstarred" };
        } catch (error2) {
          throw new Error(`Failed to unstar email: ${error2.message}`);
        }
      }
      /**
       * Flag email
       */
      async _flagEmail(email) {
        try {
          const db = email_default._getDb();
          const stmt = db.prepare(
            "UPDATE emails SET is_flagged = 1, updated_at = CURRENT_TIMESTAMP WHERE id = ?"
          );
          stmt.run(email.id);
          logger_default.debug("Email flagged", { emailId: email.id });
          return { success: true, message: "Flagged" };
        } catch (error2) {
          throw new Error(`Failed to flag email: ${error2.message}`);
        }
      }
      /**
       * Unflag email
       */
      async _unflagEmail(email) {
        try {
          const db = email_default._getDb();
          const stmt = db.prepare(
            "UPDATE emails SET is_flagged = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ?"
          );
          stmt.run(email.id);
          logger_default.debug("Email unflagged", { emailId: email.id });
          return { success: true, message: "Unflagged" };
        } catch (error2) {
          throw new Error(`Failed to unflag email: ${error2.message}`);
        }
      }
      /**
       * Delete email (soft delete)
       */
      async _deleteEmail(email) {
        await email_default.markAsDeleted(email.id);
        logger_default.debug("Email deleted", { emailId: email.id });
        return { success: true, message: "Deleted" };
      }
      /**
       * Mark email as spam
       */
      async _markAsSpam(email) {
        await email_default.markAsSpam(email.id);
        logger_default.debug("Email marked as spam", { emailId: email.id });
        return { success: true, message: "Marked as spam" };
      }
      /**
       * Add tag to email
       */
      async _addTag(email, tagName) {
        try {
          const db = email_default._getDb();
          const tagStmt = db.prepare("SELECT id FROM tags WHERE name = ?");
          const tag = tagStmt.get(tagName);
          if (!tag) {
            return { success: false, message: `Tag "${tagName}" not found` };
          }
          const insertStmt = db.prepare(`
        INSERT OR IGNORE INTO email_tags (email_id, tag_id)
        VALUES (?, ?)
      `);
          insertStmt.run(email.id, tag.id);
          logger_default.debug("Tag added to email", { emailId: email.id, tagName });
          return { success: true, message: `Tagged with "${tagName}"` };
        } catch (error2) {
          throw new Error(`Failed to add tag: ${error2.message}`);
        }
      }
      /**
       * Remove tag from email
       */
      async _removeTag(email, tagName) {
        try {
          const db = email_default._getDb();
          const tagStmt = db.prepare("SELECT id FROM tags WHERE name = ?");
          const tag = tagStmt.get(tagName);
          if (!tag) {
            return { success: false, message: `Tag "${tagName}" not found` };
          }
          const deleteStmt = db.prepare(
            "DELETE FROM email_tags WHERE email_id = ? AND tag_id = ?"
          );
          deleteStmt.run(email.id, tag.id);
          logger_default.debug("Tag removed from email", { emailId: email.id, tagName });
          return { success: true, message: `Removed tag "${tagName}"` };
        } catch (error2) {
          throw new Error(`Failed to remove tag: ${error2.message}`);
        }
      }
    };
    module2.exports = new ActionExecutor();
  }
});

// src/filters/matcher.ts
var require_matcher = __commonJS({
  "src/filters/matcher.ts"(exports2, module2) {
    "use strict";
    init_logger();
    var ConditionMatcher = class {
      /**
       * Check if email matches a single condition
       */
      matchCondition(email, condition) {
        const { field, operator, value } = condition;
        const emailValue = this._getEmailField(email, field);
        if (emailValue === null || emailValue === void 0) {
          return false;
        }
        switch (operator) {
          case "equals":
            return this._matchEquals(emailValue, value);
          case "not_equals":
            return !this._matchEquals(emailValue, value);
          case "contains":
            return this._matchContains(emailValue, value);
          case "not_contains":
            return !this._matchContains(emailValue, value);
          case "starts_with":
            return this._matchStartsWith(emailValue, value);
          case "ends_with":
            return this._matchEndsWith(emailValue, value);
          case "matches_regex":
            return this._matchRegex(emailValue, value);
          case "greater_than":
            return this._matchGreaterThan(emailValue, value);
          case "less_than":
            return this._matchLessThan(emailValue, value);
          case "is_empty":
            return this._matchIsEmpty(emailValue);
          case "is_not_empty":
            return !this._matchIsEmpty(emailValue);
          default:
            logger_default.warn("Unknown operator", { operator });
            return false;
        }
      }
      /**
       * Check if email matches all conditions (AND logic)
       */
      matchAll(email, conditions) {
        if (!conditions || conditions.length === 0) {
          return true;
        }
        return conditions.every(
          (condition) => this.matchCondition(email, condition)
        );
      }
      /**
       * Check if email matches any condition (OR logic)
       */
      matchAny(email, conditions) {
        if (!conditions || conditions.length === 0) {
          return true;
        }
        return conditions.some(
          (condition) => this.matchCondition(email, condition)
        );
      }
      /**
       * Get email field value by field name
       */
      _getEmailField(email, field) {
        switch (field) {
          case "from":
            return email.from || "";
          case "to":
            return email.to || "";
          case "cc":
            return email.cc || "";
          case "subject":
            return email.subject || "";
          case "body":
            return (email.bodyText || "") + " " + (email.bodyHtml || "");
          case "has_attachments":
            return email.hasAttachments;
          case "size":
            return this._calculateEmailSize(email);
          case "date":
            return email.date;
          case "folder":
            return email.folder || "";
          default:
            logger_default.warn("Unknown field", { field });
            return null;
        }
      }
      /**
       * Calculate approximate email size
       */
      _calculateEmailSize(email) {
        let size = 0;
        if (email.bodyText) size += email.bodyText.length;
        if (email.bodyHtml) size += email.bodyHtml.length;
        if (email.subject) size += email.subject.length;
        return size;
      }
      /**
       * Match equals operator
       */
      _matchEquals(emailValue, conditionValue) {
        if (typeof emailValue === "boolean") {
          return emailValue === (conditionValue === "true" || conditionValue === true);
        }
        return String(emailValue).toLowerCase() === String(conditionValue).toLowerCase();
      }
      /**
       * Match contains operator
       */
      _matchContains(emailValue, conditionValue) {
        return String(emailValue).toLowerCase().includes(String(conditionValue).toLowerCase());
      }
      /**
       * Match starts_with operator
       */
      _matchStartsWith(emailValue, conditionValue) {
        return String(emailValue).toLowerCase().startsWith(String(conditionValue).toLowerCase());
      }
      /**
       * Match ends_with operator
       */
      _matchEndsWith(emailValue, conditionValue) {
        return String(emailValue).toLowerCase().endsWith(String(conditionValue).toLowerCase());
      }
      /**
       * Match regex operator
       */
      _matchRegex(emailValue, pattern) {
        try {
          const regex = new RegExp(pattern, "i");
          return regex.test(String(emailValue));
        } catch (error2) {
          logger_default.error("Invalid regex pattern", { pattern, error: error2.message });
          return false;
        }
      }
      /**
       * Match greater_than operator
       */
      _matchGreaterThan(emailValue, conditionValue) {
        const numValue = Number(emailValue);
        const numCondition = Number(conditionValue);
        if (isNaN(numValue) || isNaN(numCondition)) {
          return false;
        }
        return numValue > numCondition;
      }
      /**
       * Match less_than operator
       */
      _matchLessThan(emailValue, conditionValue) {
        const numValue = Number(emailValue);
        const numCondition = Number(conditionValue);
        if (isNaN(numValue) || isNaN(numCondition)) {
          return false;
        }
        return numValue < numCondition;
      }
      /**
       * Match is_empty operator
       */
      _matchIsEmpty(emailValue) {
        if (emailValue === null || emailValue === void 0) {
          return true;
        }
        if (typeof emailValue === "string") {
          return emailValue.trim() === "";
        }
        if (Array.isArray(emailValue)) {
          return emailValue.length === 0;
        }
        return false;
      }
    };
    module2.exports = new ConditionMatcher();
  }
});

// src/storage/models/filter.ts
function getErrorMessage8(error2) {
  return error2 instanceof Error ? error2.message : String(error2);
}
function toNumber4(value) {
  return typeof value === "bigint" ? Number(value) : value;
}
var FilterModel, filterModel, filter_default;
var init_filter = __esm({
  "src/storage/models/filter.ts"() {
    "use strict";
    init_errors();
    init_logger();
    init_database();
    FilterModel = class {
      db;
      constructor() {
        this.db = null;
      }
      getDb() {
        if (!this.db) {
          this.db = database_default.getDb();
        }
        return this.db;
      }
      create(filterData) {
        try {
          const db = this.getDb();
          const stmt = db.prepare(`
        INSERT INTO filters (
          name, description, is_enabled, priority, match_all, account_id
        ) VALUES (?, ?, ?, ?, ?, ?)
      `);
          const result = stmt.run(
            filterData.name,
            filterData.description ?? null,
            filterData.isEnabled !== void 0 ? filterData.isEnabled ? 1 : 0 : 1,
            filterData.priority ?? 0,
            filterData.matchAll !== void 0 ? filterData.matchAll ? 1 : 0 : 1,
            filterData.accountId ?? null
          );
          const filterId = toNumber4(result.lastInsertRowid);
          logger_default.debug("Filter created", { id: filterId });
          return filterId;
        } catch (error2) {
          const errorMessage = getErrorMessage8(error2);
          logger_default.error("Failed to create filter", { error: errorMessage });
          throw new StorageError(`Failed to create filter: ${errorMessage}`);
        }
      }
      addCondition(filterId, condition) {
        try {
          const db = this.getDb();
          const stmt = db.prepare(`
        INSERT INTO filter_conditions (filter_id, field, operator, value)
        VALUES (?, ?, ?, ?)
      `);
          const result = stmt.run(
            filterId,
            condition.field,
            condition.operator,
            condition.value
          );
          const conditionId = toNumber4(result.lastInsertRowid);
          logger_default.debug("Filter condition added", { filterId, conditionId });
          return conditionId;
        } catch (error2) {
          const errorMessage = getErrorMessage8(error2);
          logger_default.error("Failed to add filter condition", {
            filterId,
            error: errorMessage
          });
          throw new StorageError(`Failed to add filter condition: ${errorMessage}`);
        }
      }
      addAction(filterId, action) {
        try {
          const db = this.getDb();
          const stmt = db.prepare(`
        INSERT INTO filter_actions (filter_id, action_type, action_value)
        VALUES (?, ?, ?)
      `);
          const result = stmt.run(filterId, action.type, action.value ?? null);
          const actionId = toNumber4(result.lastInsertRowid);
          logger_default.debug("Filter action added", { filterId, actionId });
          return actionId;
        } catch (error2) {
          const errorMessage = getErrorMessage8(error2);
          logger_default.error("Failed to add filter action", {
            filterId,
            error: errorMessage
          });
          throw new StorageError(`Failed to add filter action: ${errorMessage}`);
        }
      }
      findById(id) {
        try {
          const db = this.getDb();
          const filterStmt = db.prepare(
            "SELECT * FROM filters WHERE id = ?"
          );
          const filter = filterStmt.get(id);
          if (!filter) {
            return null;
          }
          const conditionsStmt = db.prepare(
            "SELECT * FROM filter_conditions WHERE filter_id = ?"
          );
          const conditions = conditionsStmt.all(id);
          const actionsStmt = db.prepare(
            "SELECT * FROM filter_actions WHERE filter_id = ?"
          );
          const actions = actionsStmt.all(id);
          return this.formatFilter(filter, conditions, actions);
        } catch (error2) {
          const errorMessage = getErrorMessage8(error2);
          logger_default.error("Failed to find filter by ID", { id, error: errorMessage });
          throw new StorageError(`Failed to find filter: ${errorMessage}`);
        }
      }
      findAll(options = {}) {
        try {
          const db = this.getDb();
          const { enabledOnly = false, accountId = null } = options;
          let query = "SELECT * FROM filters WHERE 1=1";
          const params = [];
          if (enabledOnly) {
            query += " AND is_enabled = 1";
          }
          if (accountId !== null) {
            query += " AND (account_id = ? OR account_id IS NULL)";
            params.push(accountId);
          }
          query += " ORDER BY priority DESC, id ASC";
          const stmt = db.prepare(query);
          const filters = stmt.all(...params);
          return filters.map((filter) => {
            const conditionsStmt = db.prepare(
              "SELECT * FROM filter_conditions WHERE filter_id = ?"
            );
            const conditions = conditionsStmt.all(filter.id);
            const actionsStmt = db.prepare(
              "SELECT * FROM filter_actions WHERE filter_id = ?"
            );
            const actions = actionsStmt.all(filter.id);
            return this.formatFilter(filter, conditions, actions);
          });
        } catch (error2) {
          const errorMessage = getErrorMessage8(error2);
          logger_default.error("Failed to find filters", { error: errorMessage });
          throw new StorageError(`Failed to find filters: ${errorMessage}`);
        }
      }
      update(id, data) {
        try {
          const db = this.getDb();
          const fields = [];
          const params = [];
          if (data.name !== void 0) {
            fields.push("name = ?");
            params.push(data.name);
          }
          if (data.description !== void 0) {
            fields.push("description = ?");
            params.push(data.description);
          }
          if (data.isEnabled !== void 0) {
            fields.push("is_enabled = ?");
            params.push(data.isEnabled ? 1 : 0);
          }
          if (data.priority !== void 0) {
            fields.push("priority = ?");
            params.push(data.priority);
          }
          if (data.matchAll !== void 0) {
            fields.push("match_all = ?");
            params.push(data.matchAll ? 1 : 0);
          }
          if (fields.length === 0) {
            return false;
          }
          fields.push("updated_at = CURRENT_TIMESTAMP");
          params.push(id);
          const sql = `UPDATE filters SET ${fields.join(", ")} WHERE id = ?`;
          const stmt = db.prepare(sql);
          const result = stmt.run(...params);
          logger_default.debug("Filter updated", { id, changes: result.changes });
          return result.changes > 0;
        } catch (error2) {
          const errorMessage = getErrorMessage8(error2);
          logger_default.error("Failed to update filter", { id, error: errorMessage });
          throw new StorageError(`Failed to update filter: ${errorMessage}`);
        }
      }
      delete(id) {
        try {
          const db = this.getDb();
          const stmt = db.prepare("DELETE FROM filters WHERE id = ?");
          const result = stmt.run(id);
          logger_default.debug("Filter deleted", { id, changes: result.changes });
          return result.changes > 0;
        } catch (error2) {
          const errorMessage = getErrorMessage8(error2);
          logger_default.error("Failed to delete filter", { id, error: errorMessage });
          throw new StorageError(`Failed to delete filter: ${errorMessage}`);
        }
      }
      enable(id) {
        return this.update(id, { isEnabled: true });
      }
      disable(id) {
        return this.update(id, { isEnabled: false });
      }
      deleteConditions(filterId) {
        try {
          const db = this.getDb();
          const stmt = db.prepare(
            "DELETE FROM filter_conditions WHERE filter_id = ?"
          );
          const result = stmt.run(filterId);
          logger_default.debug("Filter conditions deleted", {
            filterId,
            changes: result.changes
          });
          return result.changes;
        } catch (error2) {
          const errorMessage = getErrorMessage8(error2);
          logger_default.error("Failed to delete filter conditions", {
            filterId,
            error: errorMessage
          });
          throw new StorageError(
            `Failed to delete filter conditions: ${errorMessage}`
          );
        }
      }
      deleteActions(filterId) {
        try {
          const db = this.getDb();
          const stmt = db.prepare("DELETE FROM filter_actions WHERE filter_id = ?");
          const result = stmt.run(filterId);
          logger_default.debug("Filter actions deleted", {
            filterId,
            changes: result.changes
          });
          return result.changes;
        } catch (error2) {
          const errorMessage = getErrorMessage8(error2);
          logger_default.error("Failed to delete filter actions", {
            filterId,
            error: errorMessage
          });
          throw new StorageError(
            `Failed to delete filter actions: ${errorMessage}`
          );
        }
      }
      formatFilter(filter, conditions = [], actions = []) {
        return {
          id: filter.id,
          name: filter.name,
          description: filter.description,
          isEnabled: filter.is_enabled === 1,
          priority: filter.priority,
          matchAll: filter.match_all === 1,
          accountId: filter.account_id,
          conditions: conditions.map((condition) => ({
            id: condition.id,
            field: condition.field,
            operator: condition.operator,
            value: condition.value
          })),
          actions: actions.map((action) => ({
            id: action.id,
            type: action.action_type,
            value: action.action_value
          })),
          createdAt: filter.created_at,
          updatedAt: filter.updated_at
        };
      }
    };
    filterModel = new FilterModel();
    filter_default = filterModel;
  }
});

// src/filters/engine.ts
var require_engine = __commonJS({
  "src/filters/engine.ts"(exports2, module2) {
    "use strict";
    var import_executor = __toESM(require_executor());
    var import_matcher = __toESM(require_matcher());
    init_email();
    init_filter();
    init_logger();
    var FilterEngine = class {
      /**
       * Apply all enabled filters to an email
       */
      async applyFilters(email, options = {}) {
        try {
          const { accountId = null } = options;
          const filters = filter_default.findAll({
            enabledOnly: true,
            accountId
          });
          if (filters.length === 0) {
            logger_default.debug("No filters to apply", { emailId: email.id });
            return { matched: false, appliedFilters: [] };
          }
          const appliedFilters = [];
          for (const filter of filters) {
            const matched = this._matchFilter(email, filter);
            if (matched) {
              logger_default.debug("Filter matched", {
                emailId: email.id,
                filterId: filter.id,
                filterName: filter.name
              });
              const results = await import_executor.default.executeActions(email, filter.actions);
              appliedFilters.push({
                filterId: filter.id,
                filterName: filter.name,
                actions: results
              });
              email = await email_default.findById(email.id);
            }
          }
          return {
            matched: appliedFilters.length > 0,
            appliedFilters
          };
        } catch (error2) {
          logger_default.error("Failed to apply filters", {
            emailId: email.id,
            error: error2.message
          });
          throw error2;
        }
      }
      /**
       * Test if an email matches a filter (without executing actions)
       */
      testFilter(email, filterId) {
        try {
          const filter = filter_default.findById(filterId);
          if (!filter) {
            throw new Error(`Filter ${filterId} not found`);
          }
          const matched = this._matchFilter(email, filter);
          return {
            matched,
            filter: {
              id: filter.id,
              name: filter.name,
              conditions: filter.conditions,
              actions: filter.actions
            }
          };
        } catch (error2) {
          logger_default.error("Failed to test filter", {
            emailId: email.id,
            filterId,
            error: error2.message
          });
          throw error2;
        }
      }
      /**
       * Apply filters to multiple emails
       */
      async applyFiltersToEmails(emails, options = {}) {
        const results = [];
        for (const email of emails) {
          try {
            const result = await this.applyFilters(email, options);
            results.push({
              emailId: email.id,
              ...result
            });
          } catch (error2) {
            logger_default.error("Failed to apply filters to email", {
              emailId: email.id,
              error: error2.message
            });
            results.push({
              emailId: email.id,
              error: error2.message
            });
          }
        }
        return results;
      }
      /**
       * Apply a specific filter to an email
       */
      async applyFilter(email, filterId) {
        try {
          const filter = filter_default.findById(filterId);
          if (!filter) {
            throw new Error(`Filter ${filterId} not found`);
          }
          if (!filter.isEnabled) {
            return {
              matched: false,
              message: "Filter is disabled"
            };
          }
          const matched = this._matchFilter(email, filter);
          if (!matched) {
            return {
              matched: false,
              message: "Email does not match filter conditions"
            };
          }
          const results = await import_executor.default.executeActions(email, filter.actions);
          return {
            matched: true,
            filterId: filter.id,
            filterName: filter.name,
            actions: results
          };
        } catch (error2) {
          logger_default.error("Failed to apply filter", {
            emailId: email.id,
            filterId,
            error: error2.message
          });
          throw error2;
        }
      }
      /**
       * Check if email matches filter conditions
       */
      _matchFilter(email, filter) {
        if (!filter.conditions || filter.conditions.length === 0) {
          return true;
        }
        if (filter.matchAll) {
          return import_matcher.default.matchAll(email, filter.conditions);
        } else {
          return import_matcher.default.matchAny(email, filter.conditions);
        }
      }
      /**
       * Get filter statistics
       */
      getStatistics() {
        try {
          const allFilters = filter_default.findAll();
          const enabledFilters = filter_default.findAll({ enabledOnly: true });
          return {
            totalFilters: allFilters.length,
            enabledFilters: enabledFilters.length,
            disabledFilters: allFilters.length - enabledFilters.length
          };
        } catch (error2) {
          logger_default.error("Failed to get filter statistics", { error: error2.message });
          throw error2;
        }
      }
    };
    module2.exports = new FilterEngine();
  }
});

// src/notifications/manager.ts
var require_manager3 = __commonJS({
  "src/notifications/manager.ts"(exports2, module2) {
    "use strict";
    var import_path4 = __toESM(require("path"));
    var import_node_notifier = __toESM(require("node-notifier"));
    init_config();
    init_logger();
    var NotificationManager = class {
      constructor() {
        this.enabled = false;
        this.config = {
          enabled: false,
          filters: {
            senders: [],
            // Filter by sender email
            tags: [],
            // Filter by tags
            importantOnly: false
            // Only notify for important emails
          },
          sound: true,
          desktop: true
        };
        this.loadConfig();
      }
      /**
       * Load notification configuration
       */
      loadConfig() {
        try {
          const cfg = config_default.load();
          if (cfg.notifications) {
            this.config = { ...this.config, ...cfg.notifications };
            this.enabled = this.config.enabled;
          }
        } catch (error2) {
          logger_default.error("Failed to load notification config", {
            error: error2.message
          });
        }
      }
      /**
       * Save notification configuration
       */
      saveConfig() {
        try {
          const cfg = config_default.load();
          cfg.notifications = this.config;
          config_default.save(cfg);
          logger_default.info("Notification config saved");
        } catch (error2) {
          logger_default.error("Failed to save notification config", {
            error: error2.message
          });
          throw error2;
        }
      }
      /**
       * Enable notifications
       */
      enable() {
        this.enabled = true;
        this.config.enabled = true;
        this.saveConfig();
        logger_default.info("Notifications enabled");
        return true;
      }
      /**
       * Disable notifications
       */
      disable() {
        this.enabled = false;
        this.config.enabled = false;
        this.saveConfig();
        logger_default.info("Notifications disabled");
        return true;
      }
      /**
       * Update notification filters
       */
      updateFilters(filters) {
        if (filters.senders !== void 0) {
          this.config.filters.senders = Array.isArray(filters.senders) ? filters.senders : [filters.senders];
        }
        if (filters.tags !== void 0) {
          this.config.filters.tags = Array.isArray(filters.tags) ? filters.tags : [filters.tags];
        }
        if (filters.importantOnly !== void 0) {
          this.config.filters.importantOnly = filters.importantOnly;
        }
        this.saveConfig();
        logger_default.info("Notification filters updated", {
          filters: this.config.filters
        });
        return this.config.filters;
      }
      /**
       * Update notification settings
       */
      updateSettings(settings) {
        if (settings.sound !== void 0) {
          this.config.sound = settings.sound;
        }
        if (settings.desktop !== void 0) {
          this.config.desktop = settings.desktop;
        }
        this.saveConfig();
        logger_default.info("Notification settings updated", { settings });
        return this.config;
      }
      /**
       * Check if email should trigger notification
       */
      shouldNotify(email) {
        if (!this.enabled) {
          return false;
        }
        if (this.config.filters.importantOnly && !email.isImportant) {
          return false;
        }
        if (this.config.filters.senders.length > 0) {
          const senderEmail = email.from?.address || email.from;
          const matchesSender = this.config.filters.senders.some(
            (sender) => senderEmail.toLowerCase().includes(sender.toLowerCase())
          );
          if (!matchesSender) {
            return false;
          }
        }
        if (this.config.filters.tags.length > 0 && email.tags) {
          const emailTags = Array.isArray(email.tags) ? email.tags : [email.tags];
          const matchesTag = this.config.filters.tags.some(
            (tag) => emailTags.includes(tag)
          );
          if (!matchesTag) {
            return false;
          }
        }
        return true;
      }
      /**
       * Send desktop notification
       */
      async sendDesktopNotification(email) {
        if (!this.config.desktop) {
          return;
        }
        try {
          const from = email.from?.address || email.from || "Unknown";
          const subject = email.subject || "(No subject)";
          const preview = this.getEmailPreview(email);
          import_node_notifier.default.notify({
            title: `New Email from ${from}`,
            message: `${subject}

${preview}`,
            sound: this.config.sound,
            wait: false,
            icon: import_path4.default.join(__dirname, "../../assets/mail-icon.png"),
            timeout: 10
          });
          logger_default.info("Desktop notification sent", { from, subject });
        } catch (error2) {
          logger_default.error("Failed to send desktop notification", {
            error: error2.message
          });
        }
      }
      /**
       * Get email preview text
       */
      getEmailPreview(email, maxLength = 100) {
        let text = email.text || email.textAsHtml || "";
        text = text.replace(/\s+/g, " ").trim();
        if (text.length > maxLength) {
          text = text.substring(0, maxLength) + "...";
        }
        return text || "(No preview available)";
      }
      /**
       * Log notification
       */
      logNotification(email) {
        const from = email.from?.address || email.from || "Unknown";
        const subject = email.subject || "(No subject)";
        logger_default.info("Email notification", {
          from,
          subject,
          date: email.date,
          isImportant: email.isImportant
        });
      }
      /**
       * Notify about new email
       */
      async notify(email) {
        if (!this.shouldNotify(email)) {
          return false;
        }
        try {
          await this.sendDesktopNotification(email);
          this.logNotification(email);
          return true;
        } catch (error2) {
          logger_default.error("Failed to send notification", { error: error2.message });
          return false;
        }
      }
      /**
       * Notify about multiple new emails
       */
      async notifyBatch(emails) {
        if (!this.enabled || !Array.isArray(emails) || emails.length === 0) {
          return 0;
        }
        let notifiedCount = 0;
        for (const email of emails) {
          const notified = await this.notify(email);
          if (notified) {
            notifiedCount++;
          }
        }
        if (notifiedCount > 1 && this.config.desktop) {
          try {
            import_node_notifier.default.notify({
              title: "New Emails",
              message: `You have ${notifiedCount} new emails`,
              sound: this.config.sound,
              wait: false,
              timeout: 5
            });
          } catch (error2) {
            logger_default.error("Failed to send batch notification", {
              error: error2.message
            });
          }
        }
        return notifiedCount;
      }
      /**
       * Test notification
       */
      async test() {
        try {
          import_node_notifier.default.notify({
            title: "Mail Client - Test Notification",
            message: "Notifications are working correctly!",
            sound: this.config.sound,
            wait: false,
            timeout: 5
          });
          logger_default.info("Test notification sent");
          return true;
        } catch (error2) {
          logger_default.error("Failed to send test notification", {
            error: error2.message
          });
          throw error2;
        }
      }
      /**
       * Get current configuration
       */
      getConfig() {
        return {
          enabled: this.enabled,
          ...this.config
        };
      }
      /**
       * Get filter statistics
       */
      getFilterStats() {
        return {
          senderCount: this.config.filters.senders.length,
          tagCount: this.config.filters.tags.length,
          importantOnly: this.config.filters.importantOnly
        };
      }
    };
    module2.exports = new NotificationManager();
  }
});

// src/spam/rules.ts
function checkKeywords(pattern, email) {
  try {
    const regex = new RegExp(pattern, "i");
    const subject = email.subject || "";
    const body = email.bodyText || "";
    if (regex.test(subject)) {
      return {
        matched: true,
        reason: `Spam keyword found in subject: "${subject.match(regex)[0]}"`
      };
    }
    if (regex.test(body)) {
      const match = body.match(regex);
      return {
        matched: true,
        reason: `Spam keyword found in body: "${match ? match[0] : "keyword"}"`
      };
    }
    return { matched: false };
  } catch (error2) {
    return { matched: false };
  }
}
function checkSuspiciousLinks(pattern, email) {
  try {
    const body = email.bodyText || "";
    const html = email.bodyHtml || "";
    const suspiciousPatterns = [
      /bit\.ly|tinyurl|goo\.gl/i,
      // URL shorteners
      /\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/,
      // IP addresses
      /https?:\/\/[^\s]+\.(tk|ml|ga|cf|gq)/i
      // Suspicious TLDs
    ];
    for (const suspPattern of suspiciousPatterns) {
      if (suspPattern.test(body) || suspPattern.test(html)) {
        return {
          matched: true,
          reason: "Suspicious link detected (URL shortener or suspicious domain)"
        };
      }
    }
    if (pattern) {
      const regex = new RegExp(pattern, "i");
      if (regex.test(body) || regex.test(html)) {
        return {
          matched: true,
          reason: "Suspicious link pattern matched"
        };
      }
    }
    return { matched: false };
  } catch (error2) {
    return { matched: false };
  }
}
function checkHeaders(pattern, email) {
  try {
    const spamIndicators = [
      { key: "X-Spam-Flag", value: "YES" },
      { key: "X-Spam-Status", value: "Yes" }
    ];
    if (pattern.includes("X-Spam-Flag: YES") || pattern.includes("X-Spam-Status: Yes")) {
      return { matched: false };
    }
    return { matched: false };
  } catch (error2) {
    return { matched: false };
  }
}
var init_rules = __esm({
  "src/spam/rules.ts"() {
    "use strict";
  }
});

// src/storage/models/spam.ts
function getErrorMessage9(error2) {
  return error2 instanceof Error ? error2.message : String(error2);
}
function toNumber5(value) {
  return typeof value === "bigint" ? Number(value) : value;
}
var SpamModel, spamModel, spam_default;
var init_spam = __esm({
  "src/storage/models/spam.ts"() {
    "use strict";
    init_errors();
    init_logger();
    init_database();
    SpamModel = class {
      db;
      constructor() {
        this.db = null;
      }
      getDb() {
        if (!this.db) {
          this.db = database_default.getDb();
        }
        return this.db;
      }
      createRule(ruleData) {
        try {
          const db = this.getDb();
          const stmt = db.prepare(`
        INSERT INTO spam_rules (
          rule_type, pattern, action, is_enabled, priority
        ) VALUES (?, ?, ?, ?, ?)
      `);
          const result = stmt.run(
            ruleData.ruleType,
            ruleData.pattern,
            ruleData.action,
            ruleData.isEnabled !== void 0 ? ruleData.isEnabled ? 1 : 0 : 1,
            ruleData.priority ?? 0
          );
          const insertId = toNumber5(result.lastInsertRowid);
          logger_default.debug("Spam rule created", { id: insertId });
          return insertId;
        } catch (error2) {
          const errorMessage = getErrorMessage9(error2);
          logger_default.error("Failed to create spam rule", { error: errorMessage });
          throw new StorageError(`Failed to create spam rule: ${errorMessage}`);
        }
      }
      findAllRules(enabledOnly = false) {
        try {
          const db = this.getDb();
          let query = "SELECT * FROM spam_rules";
          if (enabledOnly) {
            query += " WHERE is_enabled = 1";
          }
          query += " ORDER BY priority DESC, created_at ASC";
          const stmt = db.prepare(query);
          const rules = stmt.all();
          return rules.map((rule) => this.formatRule(rule));
        } catch (error2) {
          const errorMessage = getErrorMessage9(error2);
          logger_default.error("Failed to find spam rules", { error: errorMessage });
          throw new StorageError(`Failed to find spam rules: ${errorMessage}`);
        }
      }
      updateRule(id, data) {
        try {
          const db = this.getDb();
          const fields = [];
          const params = [];
          if (data.ruleType !== void 0) {
            fields.push("rule_type = ?");
            params.push(data.ruleType);
          }
          if (data.pattern !== void 0) {
            fields.push("pattern = ?");
            params.push(data.pattern);
          }
          if (data.action !== void 0) {
            fields.push("action = ?");
            params.push(data.action);
          }
          if (data.isEnabled !== void 0) {
            fields.push("is_enabled = ?");
            params.push(data.isEnabled ? 1 : 0);
          }
          if (data.priority !== void 0) {
            fields.push("priority = ?");
            params.push(data.priority);
          }
          if (fields.length === 0) {
            return false;
          }
          params.push(id);
          const sql = `UPDATE spam_rules SET ${fields.join(", ")} WHERE id = ?`;
          const stmt = db.prepare(sql);
          const result = stmt.run(...params);
          logger_default.debug("Spam rule updated", { id, changes: result.changes });
          return result.changes > 0;
        } catch (error2) {
          const errorMessage = getErrorMessage9(error2);
          logger_default.error("Failed to update spam rule", { id, error: errorMessage });
          throw new StorageError(`Failed to update spam rule: ${errorMessage}`);
        }
      }
      deleteRule(id) {
        try {
          const db = this.getDb();
          const stmt = db.prepare("DELETE FROM spam_rules WHERE id = ?");
          const result = stmt.run(id);
          logger_default.debug("Spam rule deleted", { id, changes: result.changes });
          return result.changes > 0;
        } catch (error2) {
          const errorMessage = getErrorMessage9(error2);
          logger_default.error("Failed to delete spam rule", { id, error: errorMessage });
          throw new StorageError(`Failed to delete spam rule: ${errorMessage}`);
        }
      }
      addToBlacklist(emailAddress, reason = null) {
        try {
          const db = this.getDb();
          const domain = this.extractDomain(emailAddress);
          const stmt = db.prepare(`
        INSERT OR REPLACE INTO blacklist (email_address, domain, reason)
        VALUES (?, ?, ?)
      `);
          const result = stmt.run(emailAddress, domain, reason);
          const insertId = toNumber5(result.lastInsertRowid);
          logger_default.debug("Email added to blacklist", { emailAddress });
          return insertId;
        } catch (error2) {
          const errorMessage = getErrorMessage9(error2);
          logger_default.error("Failed to add to blacklist", {
            emailAddress,
            error: errorMessage
          });
          throw new StorageError(`Failed to add to blacklist: ${errorMessage}`);
        }
      }
      removeFromBlacklist(emailAddress) {
        try {
          const db = this.getDb();
          const stmt = db.prepare("DELETE FROM blacklist WHERE email_address = ?");
          const result = stmt.run(emailAddress);
          logger_default.debug("Email removed from blacklist", {
            emailAddress,
            changes: result.changes
          });
          return result.changes > 0;
        } catch (error2) {
          const errorMessage = getErrorMessage9(error2);
          logger_default.error("Failed to remove from blacklist", {
            emailAddress,
            error: errorMessage
          });
          throw new StorageError(
            `Failed to remove from blacklist: ${errorMessage}`
          );
        }
      }
      isBlacklisted(emailAddress) {
        try {
          const db = this.getDb();
          const domain = this.extractDomain(emailAddress);
          const stmt = db.prepare(`
        SELECT COUNT(*) as count FROM blacklist
        WHERE email_address = ? OR domain = ?
      `);
          const result = stmt.get(emailAddress, domain);
          return (result?.count ?? 0) > 0;
        } catch (error2) {
          const errorMessage = getErrorMessage9(error2);
          logger_default.error("Failed to check blacklist", {
            emailAddress,
            error: errorMessage
          });
          throw new StorageError(`Failed to check blacklist: ${errorMessage}`);
        }
      }
      getBlacklist() {
        try {
          const db = this.getDb();
          const stmt = db.prepare(
            "SELECT * FROM blacklist ORDER BY created_at DESC"
          );
          return stmt.all();
        } catch (error2) {
          const errorMessage = getErrorMessage9(error2);
          logger_default.error("Failed to get blacklist", { error: errorMessage });
          throw new StorageError(`Failed to get blacklist: ${errorMessage}`);
        }
      }
      addToWhitelist(emailAddress) {
        try {
          const db = this.getDb();
          const domain = this.extractDomain(emailAddress);
          const stmt = db.prepare(`
        INSERT OR REPLACE INTO whitelist (email_address, domain)
        VALUES (?, ?)
      `);
          const result = stmt.run(emailAddress, domain);
          const insertId = toNumber5(result.lastInsertRowid);
          logger_default.debug("Email added to whitelist", { emailAddress });
          return insertId;
        } catch (error2) {
          const errorMessage = getErrorMessage9(error2);
          logger_default.error("Failed to add to whitelist", {
            emailAddress,
            error: errorMessage
          });
          throw new StorageError(`Failed to add to whitelist: ${errorMessage}`);
        }
      }
      removeFromWhitelist(emailAddress) {
        try {
          const db = this.getDb();
          const stmt = db.prepare("DELETE FROM whitelist WHERE email_address = ?");
          const result = stmt.run(emailAddress);
          logger_default.debug("Email removed from whitelist", {
            emailAddress,
            changes: result.changes
          });
          return result.changes > 0;
        } catch (error2) {
          const errorMessage = getErrorMessage9(error2);
          logger_default.error("Failed to remove from whitelist", {
            emailAddress,
            error: errorMessage
          });
          throw new StorageError(
            `Failed to remove from whitelist: ${errorMessage}`
          );
        }
      }
      isWhitelisted(emailAddress) {
        try {
          const db = this.getDb();
          const domain = this.extractDomain(emailAddress);
          const stmt = db.prepare(`
        SELECT COUNT(*) as count FROM whitelist
        WHERE email_address = ? OR domain = ?
      `);
          const result = stmt.get(emailAddress, domain);
          return (result?.count ?? 0) > 0;
        } catch (error2) {
          const errorMessage = getErrorMessage9(error2);
          logger_default.error("Failed to check whitelist", {
            emailAddress,
            error: errorMessage
          });
          throw new StorageError(`Failed to check whitelist: ${errorMessage}`);
        }
      }
      getWhitelist() {
        try {
          const db = this.getDb();
          const stmt = db.prepare(
            "SELECT * FROM whitelist ORDER BY created_at DESC"
          );
          return stmt.all();
        } catch (error2) {
          const errorMessage = getErrorMessage9(error2);
          logger_default.error("Failed to get whitelist", { error: errorMessage });
          throw new StorageError(`Failed to get whitelist: ${errorMessage}`);
        }
      }
      extractDomain(emailAddress) {
        const match = emailAddress.match(/@(.+)$/);
        return match ? match[1] : null;
      }
      formatRule(rule) {
        return {
          id: rule.id,
          ruleType: rule.rule_type,
          pattern: rule.pattern,
          action: rule.action,
          isEnabled: rule.is_enabled === 1,
          priority: rule.priority,
          createdAt: rule.created_at
        };
      }
    };
    spamModel = new SpamModel();
    spam_default = spamModel;
  }
});

// src/spam/filter.ts
var require_filter = __commonJS({
  "src/spam/filter.ts"(exports2, module2) {
    "use strict";
    init_rules();
    init_email();
    init_spam();
    init_logger();
    var SpamFilter = class {
      constructor() {
        this.threshold = 50;
        this.rules = [];
      }
      /**
       * Initialize spam filter with rules from database
       */
      async initialize() {
        try {
          this.rules = await spam_default.findAllRules(true);
          logger_default.info("Spam filter initialized", { rulesCount: this.rules.length });
        } catch (error2) {
          logger_default.error("Failed to initialize spam filter", {
            error: error2.message
          });
          throw error2;
        }
      }
      /**
       * Detect if an email is spam
       * @param {Object} email - Email object to check
       * @returns {Object} - { isSpam: boolean, score: number, reasons: string[] }
       */
      async detectSpam(email) {
        const result = {
          isSpam: false,
          score: 0,
          reasons: []
        };
        try {
          if (await spam_default.isWhitelisted(email.from)) {
            logger_default.debug("Email from whitelisted sender", { from: email.from });
            return result;
          }
          if (await spam_default.isBlacklisted(email.from)) {
            result.isSpam = true;
            result.score = 100;
            result.reasons.push("Sender is blacklisted");
            logger_default.debug("Email from blacklisted sender", { from: email.from });
            return result;
          }
          for (const rule of this.rules) {
            const ruleResult = this._applyRule(rule, email);
            if (ruleResult.matched) {
              result.score += this._getRuleWeight(rule);
              result.reasons.push(ruleResult.reason);
            }
          }
          result.isSpam = result.score >= this.threshold;
          logger_default.debug("Spam detection completed", {
            emailId: email.id,
            from: email.from,
            score: result.score,
            isSpam: result.isSpam
          });
          return result;
        } catch (error2) {
          logger_default.error("Spam detection failed", { error: error2.message });
          throw error2;
        }
      }
      /**
       * Apply a single spam rule to an email
       */
      _applyRule(rule, email) {
        try {
          switch (rule.ruleType) {
            case "keyword":
              return checkKeywords(rule.pattern, email);
            case "link":
              return checkSuspiciousLinks(rule.pattern, email);
            case "header":
              return checkHeaders(rule.pattern, email);
            default:
              return { matched: false };
          }
        } catch (error2) {
          logger_default.error("Failed to apply spam rule", {
            ruleId: rule.id,
            error: error2.message
          });
          return { matched: false };
        }
      }
      /**
       * Get weight for a spam rule based on priority
       */
      _getRuleWeight(rule) {
        return rule.priority || 10;
      }
      /**
       * Filter a single email
       * Marks as spam if detected
       */
      async filterEmail(emailId) {
        try {
          const email = await email_default.findById(emailId);
          if (!email) {
            throw new Error(`Email not found: ${emailId}`);
          }
          const detection = await this.detectSpam(email);
          if (detection.isSpam) {
            await email_default.markAsSpam(emailId);
            logger_default.info("Email marked as spam", {
              emailId,
              score: detection.score,
              reasons: detection.reasons
            });
          }
          return detection;
        } catch (error2) {
          logger_default.error("Failed to filter email", { emailId, error: error2.message });
          throw error2;
        }
      }
      /**
       * Filter multiple emails
       */
      async filterEmails(emailIds) {
        const results = [];
        for (const emailId of emailIds) {
          try {
            const result = await this.filterEmail(emailId);
            results.push({ emailId, ...result });
          } catch (error2) {
            results.push({ emailId, error: error2.message });
          }
        }
        return results;
      }
      /**
       * Learn from user feedback
       * Updates rules based on user marking emails as spam/not spam
       */
      async learnFromFeedback(emailId, isSpam) {
        try {
          const email = await email_default.findById(emailId);
          if (!email) {
            throw new Error(`Email not found: ${emailId}`);
          }
          if (isSpam) {
            await this._learnSpamPatterns(email);
          } else {
            await this._learnHamPatterns(email);
          }
          logger_default.info("Learned from user feedback", { emailId, isSpam });
        } catch (error2) {
          logger_default.error("Failed to learn from feedback", {
            emailId,
            error: error2.message
          });
          throw error2;
        }
      }
      /**
       * Extract and learn spam patterns from email
       */
      async _learnSpamPatterns(email) {
        const subject = email.subject.toLowerCase();
        const spamKeywords = [
          "free",
          "winner",
          "prize",
          "click here",
          "act now",
          "limited time"
        ];
        for (const keyword of spamKeywords) {
          if (subject.includes(keyword)) {
            const existingRules = await spam_default.findAllRules();
            const hasRule = existingRules.some(
              (r) => r.ruleType === "keyword" && r.pattern.includes(keyword)
            );
            if (!hasRule) {
              await spam_default.createRule({
                ruleType: "keyword",
                pattern: keyword,
                action: "mark_spam",
                priority: 5
              });
              logger_default.debug("Created new spam keyword rule", { keyword });
            }
          }
        }
      }
      /**
       * Learn from ham (non-spam) patterns
       */
      async _learnHamPatterns(email) {
        logger_default.debug("Learning from ham email", { from: email.from });
      }
      /**
       * Get spam statistics
       */
      async getStatistics() {
        try {
          const spamCount = await email_default.countSpam();
          const blacklistCount = (await spam_default.getBlacklist()).length;
          const whitelistCount = (await spam_default.getWhitelist()).length;
          const rulesCount = (await spam_default.findAllRules()).length;
          return {
            spamCount,
            blacklistCount,
            whitelistCount,
            rulesCount,
            threshold: this.threshold
          };
        } catch (error2) {
          logger_default.error("Failed to get spam statistics", { error: error2.message });
          throw error2;
        }
      }
    };
    module2.exports = new SpamFilter();
  }
});

// src/storage/models/attachment.ts
function getErrorMessage10(error2) {
  return error2 instanceof Error ? error2.message : String(error2);
}
function toNumber6(value) {
  return typeof value === "bigint" ? Number(value) : value;
}
var AttachmentModel, attachmentModel, attachment_default;
var init_attachment = __esm({
  "src/storage/models/attachment.ts"() {
    "use strict";
    init_errors();
    init_logger();
    init_database();
    AttachmentModel = class {
      db;
      constructor() {
        this.db = null;
      }
      getDb() {
        if (!this.db) {
          this.db = database_default.getDb();
        }
        return this.db;
      }
      create(attachmentData) {
        try {
          const db = this.getDb();
          const stmt = db.prepare(`
        INSERT INTO attachments (email_id, filename, content_type, size, file_path)
        VALUES (?, ?, ?, ?, ?)
      `);
          const result = stmt.run(
            attachmentData.emailId,
            attachmentData.filename,
            attachmentData.contentType ?? null,
            attachmentData.size ?? null,
            attachmentData.filePath ?? null
          );
          const insertId = toNumber6(result.lastInsertRowid);
          logger_default.debug("Attachment created", { id: insertId });
          return insertId;
        } catch (error2) {
          const errorMessage = getErrorMessage10(error2);
          logger_default.error("Failed to create attachment", { error: errorMessage });
          throw new StorageError(`Failed to create attachment: ${errorMessage}`);
        }
      }
      findByEmailId(emailId) {
        try {
          const db = this.getDb();
          const stmt = db.prepare(
            "SELECT * FROM attachments WHERE email_id = ?"
          );
          const attachments = stmt.all(emailId);
          return attachments.map((attachment) => this.formatAttachment(attachment));
        } catch (error2) {
          const errorMessage = getErrorMessage10(error2);
          logger_default.error("Failed to find attachments", {
            emailId,
            error: errorMessage
          });
          throw new StorageError(`Failed to find attachments: ${errorMessage}`);
        }
      }
      delete(id) {
        try {
          const db = this.getDb();
          const stmt = db.prepare("DELETE FROM attachments WHERE id = ?");
          const result = stmt.run(id);
          logger_default.debug("Attachment deleted", { id, changes: result.changes });
          return result.changes > 0;
        } catch (error2) {
          const errorMessage = getErrorMessage10(error2);
          logger_default.error("Failed to delete attachment", { id, error: errorMessage });
          throw new StorageError(`Failed to delete attachment: ${errorMessage}`);
        }
      }
      formatAttachment(attachment) {
        return {
          id: attachment.id,
          emailId: attachment.email_id,
          filename: attachment.filename,
          contentType: attachment.content_type,
          size: attachment.size,
          filePath: attachment.file_path,
          createdAt: attachment.created_at
        };
      }
    };
    attachmentModel = new AttachmentModel();
    attachment_default = attachmentModel;
  }
});

// src/storage/models/folder.ts
function getErrorMessage11(error2) {
  return error2 instanceof Error ? error2.message : String(error2);
}
function toNumber7(value) {
  return typeof value === "bigint" ? Number(value) : value;
}
var FolderModel, folderModel, folder_default;
var init_folder = __esm({
  "src/storage/models/folder.ts"() {
    "use strict";
    init_errors();
    init_logger();
    init_database();
    FolderModel = class {
      db;
      constructor() {
        this.db = null;
      }
      getDb() {
        if (!this.db) {
          this.db = database_default.getDb();
        }
        return this.db;
      }
      upsert(folderData) {
        try {
          const db = this.getDb();
          const stmt = db.prepare(`
        INSERT INTO folders (name, delimiter, flags, last_sync, account_id, parent_id, is_favorite, sort_order)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(name) DO UPDATE SET
          delimiter = excluded.delimiter,
          flags = excluded.flags,
          last_sync = excluded.last_sync,
          account_id = excluded.account_id,
          parent_id = excluded.parent_id,
          is_favorite = excluded.is_favorite,
          sort_order = excluded.sort_order
      `);
          const result = stmt.run(
            folderData.name,
            folderData.delimiter ?? "/",
            folderData.flags ? JSON.stringify(folderData.flags) : null,
            folderData.lastSync ?? null,
            folderData.accountId ?? null,
            folderData.parentId ?? null,
            folderData.isFavorite ? 1 : 0,
            folderData.sortOrder ?? 0
          );
          logger_default.debug("Folder upserted", { name: folderData.name });
          return result.lastInsertRowid ? toNumber7(result.lastInsertRowid) : result.changes;
        } catch (error2) {
          const errorMessage = getErrorMessage11(error2);
          logger_default.error("Failed to upsert folder", { error: errorMessage });
          throw new StorageError(`Failed to upsert folder: ${errorMessage}`);
        }
      }
      create(folderData) {
        try {
          const db = this.getDb();
          const stmt = db.prepare(`
        INSERT INTO folders (name, delimiter, flags, account_id, parent_id, is_favorite, sort_order)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);
          const result = stmt.run(
            folderData.name,
            folderData.delimiter ?? "/",
            folderData.flags ? JSON.stringify(folderData.flags) : null,
            folderData.accountId ?? null,
            folderData.parentId ?? null,
            folderData.isFavorite ? 1 : 0,
            folderData.sortOrder ?? 0
          );
          const insertId = toNumber7(result.lastInsertRowid);
          logger_default.debug("Folder created", { name: folderData.name, id: insertId });
          return insertId;
        } catch (error2) {
          const errorMessage = getErrorMessage11(error2);
          logger_default.error("Failed to create folder", { error: errorMessage });
          throw new StorageError(`Failed to create folder: ${errorMessage}`);
        }
      }
      deleteByName(name) {
        try {
          const db = this.getDb();
          const stmt = db.prepare("DELETE FROM folders WHERE name = ?");
          const result = stmt.run(name);
          logger_default.debug("Folder deleted", { name, changes: result.changes });
          return result.changes > 0;
        } catch (error2) {
          const errorMessage = getErrorMessage11(error2);
          logger_default.error("Failed to delete folder", { name, error: errorMessage });
          throw new StorageError(`Failed to delete folder: ${errorMessage}`);
        }
      }
      rename(oldName, newName) {
        try {
          const db = this.getDb();
          const stmt = db.prepare("UPDATE folders SET name = ? WHERE name = ?");
          const result = stmt.run(newName, oldName);
          logger_default.debug("Folder renamed", {
            oldName,
            newName,
            changes: result.changes
          });
          return result.changes > 0;
        } catch (error2) {
          const errorMessage = getErrorMessage11(error2);
          logger_default.error("Failed to rename folder", {
            oldName,
            newName,
            error: errorMessage
          });
          throw new StorageError(`Failed to rename folder: ${errorMessage}`);
        }
      }
      findChildren(parentId) {
        try {
          const db = this.getDb();
          const stmt = db.prepare(
            "SELECT * FROM folders WHERE parent_id = ? ORDER BY sort_order, name"
          );
          const folders = stmt.all(parentId);
          return folders.map((folder) => this.formatFolder(folder));
        } catch (error2) {
          const errorMessage = getErrorMessage11(error2);
          logger_default.error("Failed to find child folders", {
            parentId,
            error: errorMessage
          });
          throw new StorageError(`Failed to find child folders: ${errorMessage}`);
        }
      }
      updateCounts(name, unreadCount, totalCount) {
        try {
          const db = this.getDb();
          const stmt = db.prepare(
            "UPDATE folders SET unread_count = ?, total_count = ? WHERE name = ?"
          );
          const result = stmt.run(unreadCount, totalCount, name);
          logger_default.debug("Folder counts updated", { name, unreadCount, totalCount });
          return result.changes > 0;
        } catch (error2) {
          const errorMessage = getErrorMessage11(error2);
          logger_default.error("Failed to update folder counts", {
            name,
            error: errorMessage
          });
          throw new StorageError(`Failed to update folder counts: ${errorMessage}`);
        }
      }
      findAll() {
        try {
          const db = this.getDb();
          const stmt = db.prepare(
            "SELECT * FROM folders ORDER BY name"
          );
          const folders = stmt.all();
          return folders.map((folder) => this.formatFolder(folder));
        } catch (error2) {
          const errorMessage = getErrorMessage11(error2);
          logger_default.error("Failed to find folders", { error: errorMessage });
          throw new StorageError(`Failed to find folders: ${errorMessage}`);
        }
      }
      findByName(name) {
        try {
          const db = this.getDb();
          const stmt = db.prepare(
            "SELECT * FROM folders WHERE name = ?"
          );
          const folder = stmt.get(name);
          return folder ? this.formatFolder(folder) : null;
        } catch (error2) {
          const errorMessage = getErrorMessage11(error2);
          logger_default.error("Failed to find folder", { name, error: errorMessage });
          throw new StorageError(`Failed to find folder: ${errorMessage}`);
        }
      }
      updateLastSync(name, lastSync = (/* @__PURE__ */ new Date()).toISOString()) {
        try {
          const db = this.getDb();
          const stmt = db.prepare(
            "UPDATE folders SET last_sync = ? WHERE name = ?"
          );
          const result = stmt.run(lastSync, name);
          logger_default.debug("Folder last sync updated", { name, lastSync });
          return result.changes > 0;
        } catch (error2) {
          const errorMessage = getErrorMessage11(error2);
          logger_default.error("Failed to update folder last sync", {
            name,
            error: errorMessage
          });
          throw new StorageError(`Failed to update folder: ${errorMessage}`);
        }
      }
      formatFolder(folder) {
        let flags = [];
        if (folder.flags) {
          try {
            const parsed = JSON.parse(folder.flags);
            flags = Array.isArray(parsed) ? parsed.filter((item) => typeof item === "string") : [];
          } catch {
            flags = [];
          }
        }
        return {
          id: folder.id,
          name: folder.name,
          delimiter: folder.delimiter,
          flags,
          lastSync: folder.last_sync,
          accountId: folder.account_id,
          parentId: folder.parent_id,
          isFavorite: folder.is_favorite === 1,
          sortOrder: folder.sort_order ?? 0,
          unreadCount: folder.unread_count ?? 0,
          totalCount: folder.total_count ?? 0,
          createdAt: folder.created_at
        };
      }
    };
    folderModel = new FolderModel();
    folder_default = folderModel;
  }
});

// src/imap/sync.ts
var import_fs, import_path, import_manager, import_engine, import_manager2, import_filter, IMAPSync, sync_default;
var init_sync = __esm({
  "src/imap/sync.ts"() {
    "use strict";
    import_fs = __toESM(require("fs"));
    import_path = __toESM(require("path"));
    init_client();
    import_manager = __toESM(require_manager2());
    import_engine = __toESM(require_engine());
    import_manager2 = __toESM(require_manager3());
    import_filter = __toESM(require_filter());
    init_attachment();
    init_email();
    init_folder();
    init_errors();
    init_helpers();
    init_logger();
    IMAPSync = class {
      config;
      accountId;
      client;
      attachmentDir;
      enableSpamFilter;
      spamFilterInitialized;
      enableFilters;
      constructor(config) {
        this.config = config;
        this.accountId = config.accountId;
        this.client = null;
        this.attachmentDir = import_path.default.join(getDataDir(), "attachments");
        this.enableSpamFilter = config.enableSpamFilter !== false;
        this.spamFilterInitialized = false;
        this.enableFilters = config.enableFilters !== false;
      }
      async _initializeSpamFilter() {
        if (this.enableSpamFilter && !this.spamFilterInitialized) {
          try {
            await import_filter.default.initialize();
            this.spamFilterInitialized = true;
            logger_default.info("Spam filter initialized for sync");
          } catch (error2) {
            const err = error2;
            logger_default.error("Failed to initialize spam filter", {
              error: err.message
            });
            this.enableSpamFilter = false;
          }
        }
      }
      _ensureAttachmentDir() {
        if (!import_fs.default.existsSync(this.attachmentDir)) {
          import_fs.default.mkdirSync(this.attachmentDir, { recursive: true });
          logger_default.info("Created attachment directory", { path: this.attachmentDir });
        }
      }
      async syncFolders(folders = ["INBOX"]) {
        const syncStartTime = Date.now();
        try {
          logger_default.info("[PERF] Starting sync process");
          const connectStartTime = Date.now();
          this.client = new client_default(this.config);
          await this.client.connect();
          logger_default.info("[PERF] IMAP connection established", {
            duration: `${Date.now() - connectStartTime}ms`
          });
          const spamFilterStartTime = Date.now();
          await this._initializeSpamFilter();
          if (this.enableSpamFilter) {
            logger_default.info("[PERF] Spam filter initialized", {
              duration: `${Date.now() - spamFilterStartTime}ms`
            });
          }
          const results = {
            success: true,
            folders: {},
            totalNew: 0,
            totalErrors: 0,
            spamDetected: 0,
            filtersApplied: 0
          };
          for (const folderName of folders) {
            const folderStartTime = Date.now();
            try {
              logger_default.info("[PERF] Starting folder sync", { folder: folderName });
              const result = await this.syncFolder(folderName);
              results.folders[folderName] = result;
              results.totalNew += result.newEmails;
              results.spamDetected += result.spamDetected || 0;
              results.filtersApplied += result.filtersApplied || 0;
              logger_default.info("[PERF] Folder sync completed", {
                folder: folderName,
                duration: `${Date.now() - folderStartTime}ms`,
                newEmails: result.newEmails
              });
            } catch (error2) {
              const err = error2;
              logger_default.error("Failed to sync folder", {
                folder: folderName,
                error: err.message
              });
              results.folders[folderName] = { error: err.message };
              results.totalErrors++;
            }
          }
          this.client.disconnect();
          logger_default.info("[PERF] Sync completed", {
            totalDuration: `${Date.now() - syncStartTime}ms`,
            totalNew: results.totalNew,
            totalErrors: results.totalErrors,
            spamDetected: results.spamDetected
          });
          return results;
        } catch (error2) {
          const err = error2;
          logger_default.error("Sync failed", { error: err.message });
          if (this.client) {
            this.client.disconnect();
          }
          throw new SyncError(`Sync failed: ${err.message}`);
        }
      }
      async syncFolder(folderName) {
        logger_default.info("Syncing folder", { folder: folderName });
        const openFolderStartTime = Date.now();
        const box = await this.client.openFolder(folderName, true);
        logger_default.info("[PERF] Folder opened", {
          folder: folderName,
          duration: `${Date.now() - openFolderStartTime}ms`,
          totalMessages: box.messages?.total || 0
        });
        const lastUid = this._getLastUid(folderName);
        let criteria = ["ALL"];
        if (lastUid > 0) {
          criteria = [`UID ${lastUid + 1}:*`];
          logger_default.debug("Incremental sync", {
            folder: folderName,
            fromUid: lastUid + 1
          });
        } else {
          logger_default.debug("Full sync", { folder: folderName });
        }
        const fetchStartTime = Date.now();
        const emails = await this.client.fetchEmails(criteria);
        logger_default.info("[PERF] Fetched emails from server", {
          folder: folderName,
          count: emails.length,
          duration: `${Date.now() - fetchStartTime}ms`
        });
        let newEmails = 0;
        let spamDetected = 0;
        let filtersApplied = 0;
        const processingStartTime = Date.now();
        for (const emailData of emails) {
          const emailStartTime = Date.now();
          try {
            const existing = email_default.findByUid(emailData.uid, folderName);
            if (existing) {
              logger_default.debug("Email already exists", { uid: emailData.uid });
              continue;
            }
            const parseStartTime = Date.now();
            const parsed = await this.client.parseEmail(emailData);
            logger_default.debug("[PERF] Email parsed", {
              uid: emailData.uid,
              duration: `${Date.now() - parseStartTime}ms`
            });
            if (parsed.messageId) {
              const existingByMessageId = email_default.findByMessageId(
                parsed.messageId
              );
              if (existingByMessageId) {
                logger_default.debug("Email with same message_id already exists", {
                  uid: emailData.uid,
                  messageId: parsed.messageId
                });
                continue;
              }
            }
            const dbStartTime = Date.now();
            const emailId = email_default.create({
              uid: parsed.uid,
              messageId: parsed.messageId || "",
              folder: folderName,
              accountId: this.accountId,
              from: parsed.from,
              to: parsed.to,
              cc: parsed.cc,
              subject: parsed.subject,
              date: parsed.date,
              bodyText: parsed.bodyText,
              bodyHtml: parsed.bodyHtml,
              hasAttachments: parsed.attachments.length > 0,
              isRead: parsed.flags.includes("\\Seen"),
              flags: parsed.flags
            });
            logger_default.debug("[PERF] Email saved to database", {
              uid: parsed.uid,
              duration: `${Date.now() - dbStartTime}ms`
            });
            if (parsed.attachments.length > 0) {
              const attachmentStartTime = Date.now();
              await this._saveAttachments(emailId, parsed.attachments);
              logger_default.debug("[PERF] Attachments saved", {
                emailId,
                count: parsed.attachments.length,
                duration: `${Date.now() - attachmentStartTime}ms`
              });
            }
            if (this.enableSpamFilter && folderName === "INBOX") {
              try {
                const spamStartTime = Date.now();
                const email = email_default.findById(emailId);
                const spamResult = await import_filter.default.detectSpam(email);
                if (spamResult.isSpam) {
                  await email_default.markAsSpam(emailId);
                  logger_default.info("Email marked as spam during sync", {
                    emailId,
                    score: spamResult.score,
                    reasons: spamResult.reasons
                  });
                  spamDetected++;
                }
                logger_default.debug("[PERF] Spam filter processed", {
                  emailId,
                  duration: `${Date.now() - spamStartTime}ms`
                });
              } catch (error2) {
                logger_default.error("Spam filter failed for email", {
                  emailId,
                  error: error2.message
                });
              }
            }
            if (this.enableFilters) {
              try {
                const filterStartTime = Date.now();
                const email = email_default.findById(emailId);
                const filterResult = await import_engine.default.applyFilters(email, {
                  accountId: this.accountId
                });
                if (filterResult.matched) {
                  logger_default.info("Filters applied to email during sync", {
                    emailId,
                    filtersCount: filterResult.appliedFilters.length,
                    filters: filterResult.appliedFilters.map(
                      (f) => f.filterName
                    )
                  });
                  filtersApplied++;
                }
                logger_default.debug("[PERF] Filter engine processed", {
                  emailId,
                  duration: `${Date.now() - filterStartTime}ms`
                });
              } catch (error2) {
                logger_default.error("Filter engine failed for email", {
                  emailId,
                  error: error2.message
                });
              }
            }
            try {
              const contactStartTime = Date.now();
              if (parsed.from) {
                await import_manager.default.autoCollectContact(parsed.from);
              }
              if (folderName === "Sent" || folderName === "SENT") {
                const recipients = [
                  ...parsed.to ? parsed.to.split(",") : [],
                  ...parsed.cc ? parsed.cc.split(",") : []
                ];
                for (const recipient of recipients) {
                  await import_manager.default.autoCollectContact(recipient.trim());
                }
              }
              logger_default.debug("[PERF] Contact auto-collection completed", {
                emailId,
                duration: `${Date.now() - contactStartTime}ms`
              });
            } catch (error2) {
              logger_default.debug("Contact auto-collection failed", {
                emailId,
                error: error2.message
              });
            }
            if (folderName === "INBOX") {
              try {
                const email = email_default.findById(emailId);
                if (email && !email.isSpam) {
                  await import_manager2.default.notify(email);
                }
              } catch (error2) {
                logger_default.debug("Notification failed", {
                  emailId,
                  error: error2.message
                });
              }
            }
            newEmails++;
            logger_default.debug("[PERF] Email processing completed", {
              uid: parsed.uid,
              id: emailId,
              totalDuration: `${Date.now() - emailStartTime}ms`
            });
          } catch (error2) {
            logger_default.error("Failed to save email", {
              uid: emailData.uid,
              error: error2.message
            });
          }
        }
        logger_default.info("[PERF] All emails processed", {
          folder: folderName,
          count: emails.length,
          duration: `${Date.now() - processingStartTime}ms`,
          avgPerEmail: emails.length > 0 ? `${Math.round((Date.now() - processingStartTime) / emails.length)}ms` : "N/A"
        });
        folder_default.upsert({
          name: folderName,
          delimiter: "/",
          flags: [],
          lastSync: (/* @__PURE__ */ new Date()).toISOString()
        });
        logger_default.info("Folder sync completed", {
          folder: folderName,
          newEmails,
          spamDetected,
          filtersApplied
        });
        return {
          newEmails,
          totalEmails: box.messages?.total || 0,
          spamDetected,
          filtersApplied
        };
      }
      async _saveAttachments(emailId, attachments) {
        this._ensureAttachmentDir();
        for (const attachment of attachments) {
          try {
            const filename = attachment.filename || `attachment_${Date.now()}`;
            const sanitizedFilename = this._sanitizeFilename(filename);
            const filePath = import_path.default.join(
              this.attachmentDir,
              `${emailId}_${sanitizedFilename}`
            );
            import_fs.default.writeFileSync(filePath, attachment.content);
            attachment_default.create({
              emailId,
              filename: sanitizedFilename,
              contentType: attachment.contentType,
              size: attachment.size,
              filePath
            });
            logger_default.debug("Attachment saved", {
              emailId,
              filename: sanitizedFilename
            });
          } catch (error2) {
            logger_default.error("Failed to save attachment", {
              emailId,
              error: error2.message
            });
          }
        }
      }
      _getLastUid(folderName) {
        try {
          const emails = email_default.findByFolder(folderName, {
            limit: 1,
            offset: 0
          });
          if (emails.length > 0) {
            return emails[0].uid;
          }
          return 0;
        } catch (error2) {
          logger_default.error("Failed to get last UID", {
            folder: folderName,
            error: error2.message
          });
          return 0;
        }
      }
      _sanitizeFilename(filename) {
        return filename.replace(/[<>:"/\\|?*]/g, "_").replace(/\s+/g, " ").trim().substring(0, 255);
      }
      async syncDrafts() {
        try {
          logger_default.info("Syncing drafts from server");
          if (!this.client) {
            this.client = new client_default(this.config);
            await this.client.connect();
          }
          await this.client.openFolder("Drafts", true);
          const emails = await this.client.fetchEmails(["ALL"]);
          logger_default.info("Fetched drafts from server", { count: emails.length });
          let syncedDrafts = 0;
          for (const emailData of emails) {
            try {
              const existing = email_default.findByUid(emailData.uid, "Drafts");
              if (existing) {
                logger_default.debug("Draft already exists", { uid: emailData.uid });
                continue;
              }
              const parsed = await this.client.parseEmail(emailData);
              email_default.saveDraft({
                uid: parsed.uid,
                messageId: parsed.messageId,
                from: parsed.from,
                to: parsed.to,
                cc: parsed.cc,
                subject: parsed.subject,
                bodyText: parsed.bodyText,
                bodyHtml: parsed.bodyHtml
              });
              syncedDrafts++;
              logger_default.debug("Draft synced", { uid: parsed.uid });
            } catch (error2) {
              logger_default.error("Failed to sync draft", {
                uid: emailData.uid,
                error: error2.message
              });
            }
          }
          logger_default.info("Drafts sync completed", { synced: syncedDrafts });
          return { synced: syncedDrafts, total: emails.length };
        } catch (error2) {
          const err = error2;
          logger_default.error("Failed to sync drafts", { error: err.message });
          throw new SyncError(`Failed to sync drafts: ${err.message}`);
        }
      }
      async uploadDraft(draftData) {
        try {
          logger_default.info("Uploading draft to server");
          if (!this.client) {
            this.client = new client_default(this.config);
            await this.client.connect();
          }
          await this.client.openFolder("Drafts", false);
          const message = this._composeDraftMessage(draftData);
          await this._appendMessage("Drafts", message, ["\\Draft"]);
          logger_default.info("Draft uploaded to server");
          return true;
        } catch (error2) {
          const err = error2;
          logger_default.error("Failed to upload draft", { error: err.message });
          throw new SyncError(`Failed to upload draft: ${err.message}`);
        }
      }
      _composeDraftMessage(draftData) {
        const lines = [];
        if (draftData.from) {
          lines.push(`From: ${draftData.from}`);
        }
        if (draftData.to) {
          lines.push(`To: ${draftData.to}`);
        }
        if (draftData.cc) {
          lines.push(`Cc: ${draftData.cc}`);
        }
        if (draftData.subject) {
          lines.push(`Subject: ${draftData.subject}`);
        }
        lines.push(`Date: ${(/* @__PURE__ */ new Date()).toUTCString()}`);
        lines.push(
          `Message-ID: ${draftData.messageId || `<draft-${Date.now()}@local>`}`
        );
        lines.push("MIME-Version: 1.0");
        lines.push("Content-Type: text/plain; charset=utf-8");
        lines.push("");
        lines.push(draftData.bodyText || "");
        return lines.join("\r\n");
      }
      _appendMessage(folderName, message, flags = []) {
        return new Promise((resolve, reject) => {
          const imap = this.client?.getImap();
          if (!imap) {
            return reject(new SyncError("IMAP client not connected"));
          }
          imap.append(
            message,
            { mailbox: folderName, flags },
            (err) => {
              if (err) {
                logger_default.error("Failed to append message", {
                  folder: folderName,
                  error: err.message
                });
                return reject(
                  new SyncError(`Failed to append message: ${err.message}`)
                );
              }
              logger_default.debug("Message appended", { folder: folderName });
              resolve();
            }
          );
        });
      }
    };
    sync_default = IMAPSync;
  }
});

// src/smtp/composer.ts
var import_fs2, import_path2, EmailComposer, composer_default;
var init_composer = __esm({
  "src/smtp/composer.ts"() {
    "use strict";
    import_fs2 = __toESM(require("fs"));
    import_path2 = __toESM(require("path"));
    init_logger();
    EmailComposer = class {
      emailData;
      constructor() {
        this.emailData = {
          from: null,
          to: [],
          cc: [],
          bcc: [],
          subject: "",
          text: "",
          html: "",
          attachments: [],
          inReplyTo: null,
          references: null
        };
      }
      setFrom(address) {
        this.emailData.from = address;
        return this;
      }
      setTo(addresses) {
        this.emailData.to = Array.isArray(addresses) ? addresses : [addresses];
        return this;
      }
      setCc(addresses) {
        this.emailData.cc = Array.isArray(addresses) ? addresses : [addresses];
        return this;
      }
      setBcc(addresses) {
        this.emailData.bcc = Array.isArray(addresses) ? addresses : [addresses];
        return this;
      }
      setSubject(subject) {
        this.emailData.subject = subject;
        return this;
      }
      setBody(text, html = null) {
        this.emailData.text = text;
        if (html) {
          this.emailData.html = html;
        }
        return this;
      }
      addAttachment(filePath, filename = null) {
        try {
          if (!import_fs2.default.existsSync(filePath)) {
            throw new Error(`File not found: ${filePath}`);
          }
          const attachmentName = filename || import_path2.default.basename(filePath);
          this.emailData.attachments.push({
            filename: attachmentName,
            path: filePath
          });
          logger_default.debug("Attachment added", { filename: attachmentName });
          return this;
        } catch (error2) {
          const err = error2;
          logger_default.error("Failed to add attachment", {
            filePath,
            error: err.message
          });
          throw error2;
        }
      }
      addAttachmentFromBuffer(buffer, filename, contentType = "application/octet-stream") {
        this.emailData.attachments.push({
          filename,
          content: buffer,
          contentType
        });
        logger_default.debug("Attachment added from buffer", { filename });
        return this;
      }
      compose() {
        if (!this.emailData.to || this.emailData.to.length === 0) {
          throw new Error("Recipient (to) is required");
        }
        if (!this.emailData.subject) {
          throw new Error("Subject is required");
        }
        if (!this.emailData.text && !this.emailData.html) {
          throw new Error("Email body (text or html) is required");
        }
        logger_default.debug("Email composed", {
          to: this.emailData.to,
          subject: this.emailData.subject,
          attachments: this.emailData.attachments.length
        });
        return { ...this.emailData };
      }
      setInReplyTo(messageId) {
        this.emailData.inReplyTo = messageId;
        return this;
      }
      setReferences(references) {
        this.emailData.references = references;
        return this;
      }
      quoteOriginalEmail(originalEmail) {
        const header = `On ${originalEmail.date}, ${originalEmail.from} wrote:

`;
        const quoted = originalEmail.bodyText.split("\n").map((line) => "> " + line).join("\n");
        return header + quoted;
      }
      buildReferences(originalEmail) {
        const refs = [];
        if (originalEmail.references) {
          refs.push(originalEmail.references);
        }
        if (originalEmail.messageId) {
          refs.push(originalEmail.messageId);
        }
        return refs.join(" ");
      }
      getAllRecipients(originalEmail, selfEmail) {
        const recipients = [];
        if (originalEmail.from && originalEmail.from !== selfEmail) {
          recipients.push(originalEmail.from);
        }
        if (originalEmail.to) {
          const toAddresses = originalEmail.to.split(",").map((e) => e.trim());
          toAddresses.forEach((addr) => {
            if (addr && addr !== selfEmail && !recipients.includes(addr)) {
              recipients.push(addr);
            }
          });
        }
        if (originalEmail.cc) {
          const ccAddresses = originalEmail.cc.split(",").map((e) => e.trim());
          ccAddresses.forEach((addr) => {
            if (addr && addr !== selfEmail && !recipients.includes(addr)) {
              recipients.push(addr);
            }
          });
        }
        return recipients;
      }
      addSignature(signature) {
        if (!signature) {
          return this;
        }
        if (signature.contentHtml && this.emailData.html) {
          this.emailData.html += "\n\n" + signature.contentHtml;
        } else if (signature.contentHtml && !this.emailData.html) {
          this.emailData.html = signature.contentHtml;
        }
        if (signature.contentText) {
          this.emailData.text += "\n\n" + signature.contentText;
        }
        logger_default.debug("Signature added to email");
        return this;
      }
      reset() {
        this.emailData = {
          from: null,
          to: [],
          cc: [],
          bcc: [],
          subject: "",
          text: "",
          html: "",
          attachments: [],
          inReplyTo: null,
          references: null
        };
        return this;
      }
    };
    composer_default = EmailComposer;
  }
});

// src/cli/commands/draft.ts
var require_draft = __commonJS({
  "src/cli/commands/draft.ts"(exports2, module2) {
    "use strict";
    var import_chalk8 = __toESM(require("chalk"));
    var import_cli_table32 = __toESM(require("cli-table3"));
    var import_inquirer = __toESM(require("inquirer"));
    var import_ora3 = __toESM(require("ora"));
    init_config();
    init_sync();
    init_client2();
    init_composer();
    init_email();
    init_logger();
    async function draftCommand2(action, options) {
      try {
        switch (action) {
          case "save":
            await saveDraft(options);
            break;
          case "list":
            await listDrafts(options);
            break;
          case "edit":
            await editDraft(options);
            break;
          case "delete":
            await deleteDraft(options);
            break;
          case "send":
            await sendDraft(options);
            break;
          case "sync":
            await syncDrafts(options);
            break;
          default:
            console.error(import_chalk8.default.red(`Unknown action: ${action}`));
            console.log(
              import_chalk8.default.gray("Available actions: save, list, edit, delete, send, sync")
            );
            process.exit(1);
        }
      } catch (error2) {
        console.error(import_chalk8.default.red("Error:"), error2.message);
        logger_default.error("Draft command failed", { action, error: error2.message });
        process.exit(1);
      }
    }
    async function saveDraft(options) {
      let draftData;
      if (options.to && options.subject && options.body) {
        draftData = {
          to: options.to,
          cc: options.cc || "",
          subject: options.subject,
          bodyText: options.body
        };
      } else {
        draftData = await interactiveDraftCompose();
      }
      const spinner = (0, import_ora3.default)("Saving draft...").start();
      try {
        const draftId = email_default.saveDraft(draftData);
        spinner.succeed("Draft saved successfully!");
        console.log(import_chalk8.default.gray(`Draft ID: ${draftId}`));
        if (options.sync) {
          await syncDraftToServer(draftId);
        }
      } catch (error2) {
        spinner.fail("Failed to save draft");
        throw error2;
      }
    }
    async function listDrafts(options) {
      const spinner = (0, import_ora3.default)("Loading drafts...").start();
      try {
        const drafts = email_default.findDrafts({ limit: options.limit || 50 });
        spinner.stop();
        if (drafts.length === 0) {
          console.log(import_chalk8.default.yellow("No drafts found."));
          return;
        }
        console.log(import_chalk8.default.bold.cyan(`
Drafts (${drafts.length}):
`));
        const table = new import_cli_table32.default({
          head: ["ID", "To", "Subject", "Updated"],
          colWidths: [8, 30, 40, 20]
        });
        drafts.forEach((draft) => {
          table.push([
            draft.id,
            truncate3(draft.to || "(no recipient)", 28),
            truncate3(draft.subject || "(no subject)", 38),
            formatDate3(draft.updatedAt)
          ]);
        });
        console.log(table.toString());
        console.log(import_chalk8.default.gray(`
Total: ${drafts.length} drafts`));
      } catch (error2) {
        spinner.fail("Failed to load drafts");
        throw error2;
      }
    }
    async function editDraft(options) {
      const draftId = options.id || options._[1];
      if (!draftId) {
        console.error(import_chalk8.default.red("Draft ID is required"));
        console.log(import_chalk8.default.gray("Usage: mail-cli draft edit <draft-id>"));
        process.exit(1);
      }
      const spinner = (0, import_ora3.default)("Loading draft...").start();
      try {
        const draft = email_default.findById(draftId);
        if (!draft || !draft.isDraft) {
          spinner.fail("Draft not found");
          process.exit(1);
        }
        spinner.stop();
        console.log(import_chalk8.default.bold.cyan("Edit Draft"));
        console.log();
        const answers = await import_inquirer.default.prompt([
          {
            type: "input",
            name: "to",
            message: "To:",
            default: draft.to
          },
          {
            type: "input",
            name: "cc",
            message: "CC:",
            default: draft.cc
          },
          {
            type: "input",
            name: "subject",
            message: "Subject:",
            default: draft.subject
          },
          {
            type: "editor",
            name: "body",
            message: "Body:",
            default: draft.bodyText
          },
          {
            type: "confirm",
            name: "confirm",
            message: "Save changes?",
            default: true
          }
        ]);
        if (!answers.confirm) {
          console.log(import_chalk8.default.yellow("Changes cancelled."));
          return;
        }
        const updateSpinner = (0, import_ora3.default)("Updating draft...").start();
        email_default.saveDraft({
          id: draftId,
          to: answers.to,
          cc: answers.cc,
          subject: answers.subject,
          bodyText: answers.body
        });
        updateSpinner.succeed("Draft updated successfully!");
      } catch (error2) {
        spinner.fail("Failed to edit draft");
        throw error2;
      }
    }
    async function deleteDraft(options) {
      const draftId = options.id || options._[1];
      if (!draftId) {
        console.error(import_chalk8.default.red("Draft ID is required"));
        console.log(import_chalk8.default.gray("Usage: mail-cli draft delete <draft-id>"));
        process.exit(1);
      }
      const draft = email_default.findById(draftId);
      if (!draft || !draft.isDraft) {
        console.error(import_chalk8.default.red("Draft not found"));
        process.exit(1);
      }
      console.log(import_chalk8.default.bold.yellow("Delete Draft"));
      console.log(import_chalk8.default.gray(`To: ${draft.to}`));
      console.log(import_chalk8.default.gray(`Subject: ${draft.subject}`));
      console.log();
      const { confirm } = await import_inquirer.default.prompt([
        {
          type: "confirm",
          name: "confirm",
          message: "Are you sure you want to delete this draft?",
          default: false
        }
      ]);
      if (!confirm) {
        console.log(import_chalk8.default.yellow("Deletion cancelled."));
        return;
      }
      const spinner = (0, import_ora3.default)("Deleting draft...").start();
      try {
        email_default.deleteDraft(draftId);
        spinner.succeed("Draft deleted successfully!");
      } catch (error2) {
        spinner.fail("Failed to delete draft");
        throw error2;
      }
    }
    async function sendDraft(options) {
      const draftId = options.id || options._[1];
      if (!draftId) {
        console.error(import_chalk8.default.red("Draft ID is required"));
        console.log(import_chalk8.default.gray("Usage: mail-cli draft send <draft-id>"));
        process.exit(1);
      }
      const draft = email_default.findById(draftId);
      if (!draft || !draft.isDraft) {
        console.error(import_chalk8.default.red("Draft not found"));
        process.exit(1);
      }
      if (!draft.to || !draft.subject) {
        console.error(import_chalk8.default.red("Draft is incomplete. Please edit it first."));
        console.log(
          import_chalk8.default.gray("Missing: ") + (!draft.to ? "recipient " : "") + (!draft.subject ? "subject" : "")
        );
        process.exit(1);
      }
      console.log(import_chalk8.default.bold.cyan("Send Draft"));
      console.log(import_chalk8.default.gray(`To: ${draft.to}`));
      console.log(import_chalk8.default.gray(`Subject: ${draft.subject}`));
      console.log();
      const { confirm } = await import_inquirer.default.prompt([
        {
          type: "confirm",
          name: "confirm",
          message: "Send this draft?",
          default: true
        }
      ]);
      if (!confirm) {
        console.log(import_chalk8.default.yellow("Sending cancelled."));
        return;
      }
      const spinner = (0, import_ora3.default)("Sending email...").start();
      try {
        const cfg = config_default.load();
        if (!cfg.smtp.host || !cfg.smtp.user || !cfg.smtp.password) {
          spinner.fail("SMTP configuration incomplete");
          console.error(import_chalk8.default.red("Please run: mail-cli config"));
          process.exit(1);
        }
        const composer = new composer_default();
        composer.setTo(draft.to.split(",").map((e) => e.trim())).setSubject(draft.subject).setBody(draft.bodyText || "", draft.bodyHtml || "");
        if (draft.cc) {
          composer.setCc(draft.cc.split(",").map((e) => e.trim()));
        }
        const smtpClient = new client_default2(cfg.smtp);
        const result = await smtpClient.sendEmail(composer.compose());
        email_default.convertDraftToSent(draftId, result.messageId);
        spinner.succeed("Email sent successfully!");
        console.log(import_chalk8.default.gray(`Message ID: ${result.messageId}`));
        smtpClient.disconnect();
      } catch (error2) {
        spinner.fail("Failed to send email");
        throw error2;
      }
    }
    async function syncDrafts(options) {
      const spinner = (0, import_ora3.default)("Syncing drafts with server...").start();
      try {
        const cfg = config_default.load();
        if (!cfg.imap.host || !cfg.imap.user || !cfg.imap.password) {
          spinner.fail("IMAP configuration incomplete");
          console.error(import_chalk8.default.red("Please run: mail-cli config"));
          process.exit(1);
        }
        const sync = new sync_default(cfg.imap);
        const result = await sync.syncDrafts();
        spinner.succeed("Drafts synced successfully!");
        console.log(import_chalk8.default.gray(`Synced: ${result.synced} drafts`));
        console.log(import_chalk8.default.gray(`Total on server: ${result.total} drafts`));
      } catch (error2) {
        spinner.fail("Failed to sync drafts");
        throw error2;
      }
    }
    async function interactiveDraftCompose() {
      console.log(import_chalk8.default.bold.cyan("Compose Draft"));
      console.log();
      const answers = await import_inquirer.default.prompt([
        {
          type: "input",
          name: "to",
          message: "To (comma-separated):"
        },
        {
          type: "input",
          name: "cc",
          message: "CC (comma-separated, optional):"
        },
        {
          type: "input",
          name: "subject",
          message: "Subject:"
        },
        {
          type: "editor",
          name: "body",
          message: "Body (opens editor):"
        }
      ]);
      return {
        to: answers.to,
        cc: answers.cc,
        subject: answers.subject,
        bodyText: answers.body
      };
    }
    async function syncDraftToServer(draftId) {
      const spinner = (0, import_ora3.default)("Syncing draft to server...").start();
      try {
        const cfg = config_default.load();
        const draft = email_default.findById(draftId);
        const sync = new sync_default(cfg.imap);
        await sync.uploadDraft(draft);
        spinner.succeed("Draft synced to server");
      } catch (error2) {
        spinner.warn("Failed to sync draft to server (saved locally)");
        logger_default.error("Failed to sync draft to server", {
          draftId,
          error: error2.message
        });
      }
    }
    function truncate3(str, maxLength) {
      if (!str) return "";
      if (str.length <= maxLength) return str;
      return str.substring(0, maxLength - 3) + "...";
    }
    function formatDate3(dateString) {
      if (!dateString) return "";
      const date = new Date(dateString);
      const now = /* @__PURE__ */ new Date();
      const diff = now - date;
      const days = Math.floor(diff / (1e3 * 60 * 60 * 24));
      if (days === 0) {
        return date.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit"
        });
      } else if (days === 1) {
        return "Yesterday";
      } else if (days < 7) {
        return `${days} days ago`;
      } else {
        return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      }
    }
    module2.exports = draftCommand2;
  }
});

// src/cli/utils/formatter.ts
function formatEmailList(emails) {
  if (!emails || emails.length === 0) {
    return import_chalk2.default.yellow("No emails found.");
  }
  const rows = [];
  rows.push([
    import_chalk2.default.bold("ID"),
    import_chalk2.default.bold("From"),
    import_chalk2.default.bold("Subject"),
    import_chalk2.default.bold("Date"),
    import_chalk2.default.bold("Status")
  ]);
  for (const email of emails) {
    const status = email.isRead ? import_chalk2.default.gray("Read") : import_chalk2.default.green("Unread");
    rows.push([
      email.id.toString(),
      truncate(email.from, 25),
      truncate(email.subject, 40),
      formatDate(email.date),
      status
    ]);
  }
  return formatTable(rows);
}
function formatTable(rows) {
  if (!rows || rows.length === 0) return "";
  const colWidths = [];
  for (let i = 0; i < rows[0].length; i++) {
    colWidths[i] = Math.max(...rows.map((row) => stripAnsi(row[i]).length));
  }
  const lines = [];
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const cells = row.map((cell, j) => {
      const stripped = stripAnsi(cell);
      const padding = " ".repeat(colWidths[j] - stripped.length);
      return cell + padding;
    });
    lines.push(cells.join("  "));
    if (i === 0) {
      lines.push(colWidths.map((w) => "\u2500".repeat(w)).join("  "));
    }
  }
  return lines.join("\n");
}
function stripAnsi(str) {
  let output = "";
  let index = 0;
  while (index < str.length) {
    const currentChar = str[index];
    const nextChar = str[index + 1];
    if (currentChar === "\x1B" && nextChar === "[") {
      index += 2;
      while (index < str.length && str[index] !== "m") {
        index += 1;
      }
      if (index < str.length) {
        index += 1;
      }
      continue;
    }
    output += currentChar;
    index += 1;
  }
  return output;
}
function formatSyncResults(results) {
  const lines = [];
  lines.push(import_chalk2.default.bold.green("Sync Results"));
  lines.push(import_chalk2.default.gray("\u2500".repeat(60)));
  for (const [folder, result] of Object.entries(results.folders)) {
    if (result.error) {
      lines.push(`${import_chalk2.default.red("\u2717")} ${folder}: ${import_chalk2.default.red(result.error)}`);
    } else {
      lines.push(
        `${import_chalk2.default.green("\u2713")} ${folder}: ${result.newEmails} new emails`
      );
    }
  }
  lines.push(import_chalk2.default.gray("\u2500".repeat(60)));
  lines.push(`${import_chalk2.default.bold("Total new emails:")} ${results.totalNew}`);
  if (results.totalErrors > 0) {
    lines.push(`${import_chalk2.default.bold("Errors:")} ${import_chalk2.default.red(results.totalErrors)}`);
  }
  return lines.join("\n");
}
var import_chalk2;
var init_formatter = __esm({
  "src/cli/utils/formatter.ts"() {
    "use strict";
    import_chalk2 = __toESM(require("chalk"));
    init_helpers();
  }
});

// src/cli/commands/folder.ts
var require_folder = __commonJS({
  "src/cli/commands/folder.ts"(exports2, module2) {
    "use strict";
    var import_commander3 = require("commander");
    init_config();
    init_client();
    init_email();
    init_folder();
    init_logger();
    init_formatter();
    var folderCommand2 = new import_commander3.Command("folder");
    folderCommand2.description("Manage email folders");
    folderCommand2.command("create <name>").description("Create a new folder").option("-p, --parent <parent>", "Parent folder name").option("-f, --favorite", "Mark as favorite").action(async (name, options) => {
      try {
        logger_default.info("Creating folder", { name, parent: options.parent });
        const imapConfig = config_default.get("imap");
        const client = new client_default(imapConfig);
        await client.connect();
        await client.createFolder(name);
        let parentId = null;
        if (options.parent) {
          const parentFolder = folder_default.findByName(options.parent);
          if (parentFolder) {
            parentId = parentFolder.id;
          }
        }
        folder_default.create({
          name,
          delimiter: "/",
          parentId,
          isFavorite: options.favorite || false
        });
        client.disconnect();
        console.log(`Folder "${name}" created successfully`);
      } catch (error2) {
        logger_default.error("Failed to create folder", { error: error2.message });
        console.error(`Error: ${error2.message}`);
        process.exit(1);
      }
    });
    folderCommand2.command("list").description("List all folders").option("-t, --tree", "Display as tree structure").action(async (options) => {
      try {
        logger_default.info("Listing folders");
        const folders = folder_default.findAll();
        if (folders.length === 0) {
          console.log("No folders found");
          return;
        }
        if (options.tree) {
          displayFolderTree(folders);
        } else {
          const tableData = folders.map((folder) => ({
            Name: folder.name,
            Unread: folder.unreadCount,
            Total: folder.totalCount,
            Favorite: folder.isFavorite ? "Yes" : "No",
            "Last Sync": folder.lastSync ? new Date(folder.lastSync).toLocaleString() : "Never"
          }));
          console.log(formatTable(tableData));
        }
      } catch (error2) {
        logger_default.error("Failed to list folders", { error: error2.message });
        console.error(`Error: ${error2.message}`);
        process.exit(1);
      }
    });
    function displayFolderTree(folders) {
      const folderMap = /* @__PURE__ */ new Map();
      const rootFolders = [];
      folders.forEach((folder) => {
        folderMap.set(folder.id, { ...folder, children: [] });
      });
      folders.forEach((folder) => {
        if (folder.parentId) {
          const parent = folderMap.get(folder.parentId);
          if (parent) {
            parent.children.push(folderMap.get(folder.id));
          } else {
            rootFolders.push(folderMap.get(folder.id));
          }
        } else {
          rootFolders.push(folderMap.get(folder.id));
        }
      });
      function printTree(folder, prefix = "", isLast = true) {
        const connector = isLast ? "\u2514\u2500\u2500 " : "\u251C\u2500\u2500 ";
        const favorite = folder.isFavorite ? " \u2605" : "";
        const counts = ` (${folder.unreadCount}/${folder.totalCount})`;
        console.log(prefix + connector + folder.name + favorite + counts);
        const childPrefix = prefix + (isLast ? "    " : "\u2502   ");
        folder.children.forEach((child, index) => {
          printTree(child, childPrefix, index === folder.children.length - 1);
        });
      }
      rootFolders.forEach((folder, index) => {
        printTree(folder, "", index === rootFolders.length - 1);
      });
    }
    folderCommand2.command("rename <old-name> <new-name>").description("Rename a folder").action(async (oldName, newName) => {
      try {
        logger_default.info("Renaming folder", { oldName, newName });
        const imapConfig = config_default.get("imap");
        const client = new client_default(imapConfig);
        await client.connect();
        await client.renameFolder(oldName, newName);
        folder_default.rename(oldName, newName);
        client.disconnect();
        console.log(`Folder "${oldName}" renamed to "${newName}" successfully`);
      } catch (error2) {
        logger_default.error("Failed to rename folder", { error: error2.message });
        console.error(`Error: ${error2.message}`);
        process.exit(1);
      }
    });
    folderCommand2.command("delete <name>").description("Delete a folder").action(async (name) => {
      try {
        logger_default.info("Deleting folder", { name });
        const imapConfig = config_default.get("imap");
        const client = new client_default(imapConfig);
        await client.connect();
        await client.deleteFolder(name);
        folder_default.deleteByName(name);
        client.disconnect();
        console.log(`Folder "${name}" deleted successfully`);
      } catch (error2) {
        logger_default.error("Failed to delete folder", { error: error2.message });
        console.error(`Error: ${error2.message}`);
        process.exit(1);
      }
    });
    folderCommand2.command("move <email-ids> <folder>").description("Move email(s) to a folder (comma-separated IDs for batch)").action(async (emailIds, folder) => {
      try {
        const ids = emailIds.split(",").map((id) => parseInt(id.trim()));
        logger_default.info("Moving emails to folder", { ids, folder });
        const imapConfig = config_default.get("imap");
        const client = new client_default(imapConfig);
        await client.connect();
        const uids = [];
        for (const id of ids) {
          const email = email_default.findById(id);
          if (!email) {
            console.warn(`Email ID ${id} not found, skipping`);
            continue;
          }
          await client.openFolder(email.folder, false);
          uids.push(email.uid);
        }
        if (uids.length > 0) {
          if (uids.length === 1) {
            await client.moveEmail(uids[0], folder);
          } else {
            await client.batchMoveEmails(uids, folder);
          }
          ids.forEach((id) => {
            email_default.updateFolder(id, folder);
          });
          console.log(
            `${uids.length} email(s) moved to "${folder}" successfully`
          );
        } else {
          console.log("No valid emails found to move");
        }
        client.disconnect();
      } catch (error2) {
        logger_default.error("Failed to move emails", { error: error2.message });
        console.error(`Error: ${error2.message}`);
        process.exit(1);
      }
    });
    folderCommand2.command("copy <email-ids> <folder>").description("Copy email(s) to a folder (comma-separated IDs for batch)").action(async (emailIds, folder) => {
      try {
        const ids = emailIds.split(",").map((id) => parseInt(id.trim()));
        logger_default.info("Copying emails to folder", { ids, folder });
        const imapConfig = config_default.get("imap");
        const client = new client_default(imapConfig);
        await client.connect();
        const uids = [];
        for (const id of ids) {
          const email = email_default.findById(id);
          if (!email) {
            console.warn(`Email ID ${id} not found, skipping`);
            continue;
          }
          await client.openFolder(email.folder, false);
          uids.push(email.uid);
        }
        if (uids.length > 0) {
          if (uids.length === 1) {
            await client.copyEmail(uids[0], folder);
          } else {
            await client.batchCopyEmails(uids, folder);
          }
          console.log(
            `${uids.length} email(s) copied to "${folder}" successfully`
          );
        } else {
          console.log("No valid emails found to copy");
        }
        client.disconnect();
      } catch (error2) {
        logger_default.error("Failed to copy emails", { error: error2.message });
        console.error(`Error: ${error2.message}`);
        process.exit(1);
      }
    });
    module2.exports = folderCommand2;
  }
});

// src/cli/commands/forward.ts
var require_forward = __commonJS({
  "src/cli/commands/forward.ts"(exports2, module2) {
    "use strict";
    var import_chalk8 = __toESM(require("chalk"));
    var import_inquirer = __toESM(require("inquirer"));
    var import_ora3 = __toESM(require("ora"));
    init_config();
    init_client2();
    init_composer();
    init_attachment();
    init_email();
    init_logger();
    async function forwardCommand2(emailId, options) {
      try {
        const cfg = config_default.load();
        if (!cfg.smtp.host || !cfg.smtp.user || !cfg.smtp.password) {
          console.error(
            import_chalk8.default.red("SMTP configuration incomplete. Please run: mail-cli config")
          );
          process.exit(1);
        }
        const originalEmail = email_default.findById(emailId);
        if (!originalEmail) {
          console.error(import_chalk8.default.red(`Email with ID ${emailId} not found`));
          process.exit(1);
        }
        console.log(import_chalk8.default.bold.cyan("Forwarding:"));
        console.log(import_chalk8.default.gray(`From: ${originalEmail.from}`));
        console.log(import_chalk8.default.gray(`Subject: ${originalEmail.subject}`));
        console.log(import_chalk8.default.gray(`Date: ${originalEmail.date}`));
        console.log();
        let recipients;
        if (options.to) {
          recipients = options.to.split(",").map((e) => e.trim());
        } else {
          const answers = await import_inquirer.default.prompt([
            {
              type: "input",
              name: "to",
              message: "Forward to (comma-separated):",
              validate: (input) => input.trim() ? true : "Recipient is required"
            }
          ]);
          recipients = answers.to.split(",").map((e) => e.trim());
        }
        const composer = new composer_default();
        composer.setTo(recipients);
        let subject = originalEmail.subject;
        if (!subject.toLowerCase().startsWith("fwd:")) {
          subject = `Fwd: ${subject}`;
        }
        composer.setSubject(subject);
        let forwardMessage = "";
        if (options.body) {
          forwardMessage = options.body;
        } else {
          const answers = await import_inquirer.default.prompt([
            {
              type: "input",
              name: "message",
              message: "Forward message (optional):"
            }
          ]);
          forwardMessage = answers.message;
        }
        const forwardHeader = `---------- Forwarded message ---------
From: ${originalEmail.from}
Date: ${originalEmail.date}
Subject: ${originalEmail.subject}
To: ${originalEmail.to}
`;
        let fullBody = "";
        if (forwardMessage) {
          fullBody = forwardMessage + "\n\n";
        }
        fullBody += forwardHeader + "\n" + originalEmail.bodyText;
        composer.setBody(fullBody);
        if (originalEmail.hasAttachments && !options.noAttachments) {
          try {
            const attachments = attachment_default.findByEmailId(emailId);
            if (attachments && attachments.length > 0) {
              console.log(
                import_chalk8.default.gray(`Including ${attachments.length} attachment(s)`)
              );
              for (const attachment of attachments) {
                if (attachment.filePath) {
                  composer.addAttachment(attachment.filePath, attachment.filename);
                }
              }
            }
          } catch (error2) {
            console.warn(
              import_chalk8.default.yellow(`Warning: Could not attach files: ${error2.message}`)
            );
          }
        }
        if (!options.to) {
          const { confirm } = await import_inquirer.default.prompt([
            {
              type: "confirm",
              name: "confirm",
              message: "Send this forwarded email?",
              default: true
            }
          ]);
          if (!confirm) {
            console.log(import_chalk8.default.yellow("Forward cancelled."));
            process.exit(0);
          }
        }
        const spinner = (0, import_ora3.default)("Forwarding email...").start();
        const smtpClient = new client_default2(cfg.smtp);
        const emailData = composer.compose();
        const result = await smtpClient.sendEmail(emailData);
        spinner.succeed("Email forwarded successfully!");
        console.log(import_chalk8.default.gray(`Message ID: ${result.messageId}`));
        smtpClient.disconnect();
      } catch (error2) {
        console.error(import_chalk8.default.red("Error:"), error2.message);
        logger_default.error("Forward command failed", { error: error2.message });
        process.exit(1);
      }
    }
    module2.exports = forwardCommand2;
  }
});

// src/import-export/eml.ts
var require_eml = __commonJS({
  "src/import-export/eml.ts"(exports2, module2) {
    "use strict";
    var import_fs3 = require("fs");
    var import_mailparser2 = require("mailparser");
    init_errors();
    init_logger();
    var EmlHandler = class {
      /**
       * Parse EML file
       * @param {string} filePath - Path to EML file
       * @returns {Promise<Object>} Parsed email data
       */
      async parse(filePath) {
        try {
          logger_default.debug("Parsing EML file", { filePath });
          const emlContent = await import_fs3.promises.readFile(filePath, "utf8");
          const parsed = await (0, import_mailparser2.simpleParser)(emlContent);
          const emailData = {
            messageId: parsed.messageId,
            from: this._formatAddress(parsed.from),
            to: this._formatAddress(parsed.to),
            cc: this._formatAddress(parsed.cc),
            bcc: this._formatAddress(parsed.bcc),
            subject: parsed.subject || "(No Subject)",
            date: parsed.date ? parsed.date.toISOString() : (/* @__PURE__ */ new Date()).toISOString(),
            bodyText: parsed.text || "",
            bodyHtml: parsed.html || "",
            headers: parsed.headers,
            attachments: []
          };
          if (parsed.attachments && parsed.attachments.length > 0) {
            emailData.attachments = parsed.attachments.map((att) => ({
              filename: att.filename,
              contentType: att.contentType,
              size: att.size,
              content: att.content
            }));
          }
          logger_default.debug("EML file parsed successfully", {
            messageId: emailData.messageId,
            attachmentCount: emailData.attachments.length
          });
          return emailData;
        } catch (error2) {
          logger_default.error("Failed to parse EML file", {
            filePath,
            error: error2.message
          });
          throw new StorageError(`Failed to parse EML file: ${error2.message}`);
        }
      }
      /**
       * Generate EML file from email data
       * @param {Object} emailData - Email data
       * @param {string} filePath - Output file path
       * @returns {Promise<void>}
       */
      async generate(emailData, filePath) {
        try {
          logger_default.debug("Generating EML file", { filePath });
          const emlContent = this._buildEmlContent(emailData);
          await import_fs3.promises.writeFile(filePath, emlContent, "utf8");
          logger_default.info("EML file generated successfully", { filePath });
        } catch (error2) {
          logger_default.error("Failed to generate EML file", {
            filePath,
            error: error2.message
          });
          throw new StorageError(`Failed to generate EML file: ${error2.message}`);
        }
      }
      /**
       * Build EML content from email data
       * @param {Object} emailData - Email data
       * @returns {string} EML content
       */
      _buildEmlContent(emailData) {
        const lines = [];
        if (emailData.messageId) {
          lines.push(`Message-ID: ${emailData.messageId}`);
        }
        if (emailData.date) {
          const date = new Date(emailData.date);
          lines.push(`Date: ${date.toUTCString()}`);
        }
        if (emailData.from) {
          lines.push(`From: ${emailData.from}`);
        }
        if (emailData.to) {
          lines.push(`To: ${emailData.to}`);
        }
        if (emailData.cc) {
          lines.push(`Cc: ${emailData.cc}`);
        }
        if (emailData.subject) {
          lines.push(`Subject: ${emailData.subject}`);
        }
        lines.push("MIME-Version: 1.0");
        if (emailData.bodyHtml && emailData.bodyText) {
          const boundary = `----=_Part_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          lines.push(`Content-Type: multipart/alternative; boundary="${boundary}"`);
          lines.push("");
          lines.push(`--${boundary}`);
          lines.push("Content-Type: text/plain; charset=utf-8");
          lines.push("Content-Transfer-Encoding: 8bit");
          lines.push("");
          lines.push(emailData.bodyText);
          lines.push("");
          lines.push(`--${boundary}`);
          lines.push("Content-Type: text/html; charset=utf-8");
          lines.push("Content-Transfer-Encoding: 8bit");
          lines.push("");
          lines.push(emailData.bodyHtml);
          lines.push("");
          lines.push(`--${boundary}--`);
        } else if (emailData.bodyHtml) {
          lines.push("Content-Type: text/html; charset=utf-8");
          lines.push("Content-Transfer-Encoding: 8bit");
          lines.push("");
          lines.push(emailData.bodyHtml);
        } else {
          lines.push("Content-Type: text/plain; charset=utf-8");
          lines.push("Content-Transfer-Encoding: 8bit");
          lines.push("");
          lines.push(emailData.bodyText || "");
        }
        return lines.join("\r\n");
      }
      /**
       * Format address for display
       * @param {Object|Array} address - Address object or array
       * @returns {string} Formatted address
       */
      _formatAddress(address) {
        if (!address) return "";
        if (Array.isArray(address)) {
          return address.map((addr) => {
            if (addr.name) {
              return `"${addr.name}" <${addr.address}>`;
            }
            return addr.address;
          }).join(", ");
        }
        if (address.value && Array.isArray(address.value)) {
          return this._formatAddress(address.value);
        }
        if (address.name) {
          return `"${address.name}" <${address.address}>`;
        }
        return address.address || address.toString();
      }
    };
    module2.exports = new EmlHandler();
  }
});

// src/import-export/mbox.ts
var require_mbox = __commonJS({
  "src/import-export/mbox.ts"(exports2, module2) {
    "use strict";
    var import_fs3 = require("fs");
    var import_mailparser2 = require("mailparser");
    init_errors();
    init_logger();
    var MboxHandler = class {
      /**
       * Parse MBOX file
       * @param {string} filePath - Path to MBOX file
       * @param {Function} onEmail - Callback for each parsed email
       * @returns {Promise<number>} Number of emails parsed
       */
      async parse(filePath, onEmail) {
        try {
          logger_default.debug("Parsing MBOX file", { filePath });
          const mboxContent = await import_fs3.promises.readFile(filePath, "utf8");
          const emails = this._splitMboxMessages(mboxContent);
          let count = 0;
          for (const emailContent of emails) {
            try {
              const parsed = await (0, import_mailparser2.simpleParser)(emailContent);
              const emailData = {
                messageId: parsed.messageId,
                from: this._formatAddress(parsed.from),
                to: this._formatAddress(parsed.to),
                cc: this._formatAddress(parsed.cc),
                bcc: this._formatAddress(parsed.bcc),
                subject: parsed.subject || "(No Subject)",
                date: parsed.date ? parsed.date.toISOString() : (/* @__PURE__ */ new Date()).toISOString(),
                bodyText: parsed.text || "",
                bodyHtml: parsed.html || "",
                headers: parsed.headers,
                attachments: []
              };
              if (parsed.attachments && parsed.attachments.length > 0) {
                emailData.attachments = parsed.attachments.map((att) => ({
                  filename: att.filename,
                  contentType: att.contentType,
                  size: att.size,
                  content: att.content
                }));
              }
              await onEmail(emailData);
              count++;
            } catch (error2) {
              logger_default.warn("Failed to parse email in MBOX", {
                error: error2.message
              });
            }
          }
          logger_default.info("MBOX file parsed successfully", { filePath, count });
          return count;
        } catch (error2) {
          logger_default.error("Failed to parse MBOX file", {
            filePath,
            error: error2.message
          });
          throw new StorageError(`Failed to parse MBOX file: ${error2.message}`);
        }
      }
      /**
       * Generate MBOX file from emails
       * @param {Array<Object>} emails - Array of email data
       * @param {string} filePath - Output file path
       * @returns {Promise<void>}
       */
      async generate(emails, filePath) {
        try {
          logger_default.debug("Generating MBOX file", { filePath, count: emails.length });
          const mboxContent = this._buildMboxContent(emails);
          await import_fs3.promises.writeFile(filePath, mboxContent, "utf8");
          logger_default.info("MBOX file generated successfully", {
            filePath,
            count: emails.length
          });
        } catch (error2) {
          logger_default.error("Failed to generate MBOX file", {
            filePath,
            error: error2.message
          });
          throw new StorageError(`Failed to generate MBOX file: ${error2.message}`);
        }
      }
      /**
       * Append email to existing MBOX file
       * @param {Object} emailData - Email data
       * @param {string} filePath - MBOX file path
       * @returns {Promise<void>}
       */
      async append(emailData, filePath) {
        try {
          const emailContent = this._buildEmailContent(emailData);
          const mboxEntry = this._wrapInMboxFormat(emailContent, emailData.date);
          await import_fs3.promises.appendFile(filePath, mboxEntry, "utf8");
          logger_default.debug("Email appended to MBOX", { filePath });
        } catch (error2) {
          logger_default.error("Failed to append to MBOX file", {
            filePath,
            error: error2.message
          });
          throw new StorageError(`Failed to append to MBOX file: ${error2.message}`);
        }
      }
      /**
       * Split MBOX content into individual messages
       * @param {string} mboxContent - MBOX file content
       * @returns {Array<string>} Array of email contents
       */
      _splitMboxMessages(mboxContent) {
        const messages = [];
        const lines = mboxContent.split("\n");
        let currentMessage = [];
        let inMessage = false;
        for (const line of lines) {
          if (line.startsWith("From ") && inMessage) {
            messages.push(currentMessage.join("\n"));
            currentMessage = [];
          } else if (line.startsWith("From ")) {
            inMessage = true;
            continue;
          }
          if (inMessage) {
            currentMessage.push(line);
          }
        }
        if (currentMessage.length > 0) {
          messages.push(currentMessage.join("\n"));
        }
        return messages;
      }
      /**
       * Build MBOX content from emails
       * @param {Array<Object>} emails - Array of email data
       * @returns {string} MBOX content
       */
      _buildMboxContent(emails) {
        const entries = emails.map((email) => {
          const emailContent = this._buildEmailContent(email);
          return this._wrapInMboxFormat(emailContent, email.date);
        });
        return entries.join("");
      }
      /**
       * Build email content
       * @param {Object} emailData - Email data
       * @returns {string} Email content
       */
      _buildEmailContent(emailData) {
        const lines = [];
        if (emailData.messageId) {
          lines.push(`Message-ID: ${emailData.messageId}`);
        }
        if (emailData.date) {
          const date = new Date(emailData.date);
          lines.push(`Date: ${date.toUTCString()}`);
        }
        if (emailData.from) {
          lines.push(`From: ${emailData.from}`);
        }
        if (emailData.to) {
          lines.push(`To: ${emailData.to}`);
        }
        if (emailData.cc) {
          lines.push(`Cc: ${emailData.cc}`);
        }
        if (emailData.subject) {
          lines.push(`Subject: ${emailData.subject}`);
        }
        lines.push("MIME-Version: 1.0");
        if (emailData.bodyHtml && emailData.bodyText) {
          const boundary = `----=_Part_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          lines.push(`Content-Type: multipart/alternative; boundary="${boundary}"`);
          lines.push("");
          lines.push(`--${boundary}`);
          lines.push("Content-Type: text/plain; charset=utf-8");
          lines.push("");
          lines.push(emailData.bodyText);
          lines.push("");
          lines.push(`--${boundary}`);
          lines.push("Content-Type: text/html; charset=utf-8");
          lines.push("");
          lines.push(emailData.bodyHtml);
          lines.push("");
          lines.push(`--${boundary}--`);
        } else if (emailData.bodyHtml) {
          lines.push("Content-Type: text/html; charset=utf-8");
          lines.push("");
          lines.push(emailData.bodyHtml);
        } else {
          lines.push("Content-Type: text/plain; charset=utf-8");
          lines.push("");
          lines.push(emailData.bodyText || "");
        }
        return lines.join("\r\n");
      }
      /**
       * Wrap email content in MBOX format
       * @param {string} emailContent - Email content
       * @param {string} date - Email date
       * @returns {string} MBOX formatted entry
       */
      _wrapInMboxFormat(emailContent, date) {
        const emailDate = date ? new Date(date) : /* @__PURE__ */ new Date();
        const fromLine = `From MAILER-DAEMON ${emailDate.toString()}\r
`;
        const escapedContent = emailContent.replace(/^From /gm, ">From ");
        return fromLine + escapedContent + "\r\n\r\n";
      }
      /**
       * Format address for display
       * @param {Object|Array} address - Address object or array
       * @returns {string} Formatted address
       */
      _formatAddress(address) {
        if (!address) return "";
        if (Array.isArray(address)) {
          return address.map((addr) => {
            if (addr.name) {
              return `"${addr.name}" <${addr.address}>`;
            }
            return addr.address;
          }).join(", ");
        }
        if (address.value && Array.isArray(address.value)) {
          return this._formatAddress(address.value);
        }
        if (address.name) {
          return `"${address.name}" <${address.address}>`;
        }
        return address.address || address.toString();
      }
    };
    module2.exports = new MboxHandler();
  }
});

// src/import-export/manager.ts
var require_manager4 = __commonJS({
  "src/import-export/manager.ts"(exports2, module2) {
    "use strict";
    var import_fs3 = require("fs");
    var import_path4 = __toESM(require("path"));
    var import_eml = __toESM(require_eml());
    var import_mbox = __toESM(require_mbox());
    init_attachment();
    init_email();
    init_errors();
    init_helpers();
    init_logger();
    var ImportExportManager = class {
      /**
       * Export single email to EML file
       * @param {number} emailId - Email ID
       * @param {string} filePath - Output file path
       * @returns {Promise<void>}
       */
      async exportEmailToEml(emailId, filePath) {
        try {
          logger_default.info("Exporting email to EML", { emailId, filePath });
          const email = email_default.findById(emailId);
          if (!email) {
            throw new StorageError("Email not found");
          }
          const attachments = attachment_default.findByEmailId(emailId);
          const attachmentsWithContent = [];
          for (const att of attachments) {
            try {
              const content = await import_fs3.promises.readFile(att.filePath);
              attachmentsWithContent.push({
                filename: att.filename,
                contentType: att.contentType,
                size: att.size,
                content
              });
            } catch (error2) {
              logger_default.warn("Failed to read attachment file", {
                filePath: att.filePath,
                error: error2.message
              });
            }
          }
          const emailData = {
            messageId: email.messageId,
            from: email.fromAddress,
            to: email.toAddress,
            cc: email.ccAddress,
            subject: email.subject,
            date: email.date,
            bodyText: email.bodyText,
            bodyHtml: email.bodyHtml,
            attachments: attachmentsWithContent
          };
          await import_eml.default.generate(emailData, filePath);
          logger_default.info("Email exported to EML successfully", { emailId, filePath });
        } catch (error2) {
          logger_default.error("Failed to export email to EML", {
            emailId,
            error: error2.message
          });
          throw error2;
        }
      }
      /**
       * Export folder to MBOX file
       * @param {string} folderName - Folder name
       * @param {string} filePath - Output file path
       * @param {Function} onProgress - Progress callback
       * @returns {Promise<number>} Number of emails exported
       */
      async exportFolderToMbox(folderName, filePath, onProgress = null) {
        try {
          logger_default.info("Exporting folder to MBOX", { folderName, filePath });
          const emails = email_default.findByFolder(folderName, {
            limit: 999999,
            offset: 0
          });
          if (emails.length === 0) {
            logger_default.warn("No emails found in folder", { folderName });
            return 0;
          }
          const emailsData = [];
          for (let i = 0; i < emails.length; i++) {
            const email = emails[i];
            const attachments = attachment_default.findByEmailId(email.id);
            const attachmentsWithContent = [];
            for (const att of attachments) {
              try {
                const content = await import_fs3.promises.readFile(att.filePath);
                attachmentsWithContent.push({
                  filename: att.filename,
                  contentType: att.contentType,
                  size: att.size,
                  content
                });
              } catch (error2) {
                logger_default.warn("Failed to read attachment file", {
                  filePath: att.filePath,
                  error: error2.message
                });
              }
            }
            emailsData.push({
              messageId: email.messageId,
              from: email.fromAddress,
              to: email.toAddress,
              cc: email.ccAddress,
              subject: email.subject,
              date: email.date,
              bodyText: email.bodyText,
              bodyHtml: email.bodyHtml,
              attachments: attachmentsWithContent
            });
            if (onProgress) {
              onProgress(i + 1, emails.length);
            }
          }
          await import_mbox.default.generate(emailsData, filePath);
          logger_default.info("Folder exported to MBOX successfully", {
            folderName,
            filePath,
            count: emails.length
          });
          return emails.length;
        } catch (error2) {
          logger_default.error("Failed to export folder to MBOX", {
            folderName,
            error: error2.message
          });
          throw error2;
        }
      }
      /**
       * Export all emails to MBOX file
       * @param {string} filePath - Output file path
       * @param {Function} onProgress - Progress callback
       * @returns {Promise<number>} Number of emails exported
       */
      async exportAllToMbox(filePath, onProgress = null) {
        try {
          logger_default.info("Exporting all emails to MBOX", { filePath });
          const emails = email_default.search({ limit: 999999, offset: 0 });
          if (emails.length === 0) {
            logger_default.warn("No emails found");
            return 0;
          }
          const emailsData = [];
          for (let i = 0; i < emails.length; i++) {
            const email = emails[i];
            const attachments = attachment_default.findByEmailId(email.id);
            const attachmentsWithContent = [];
            for (const att of attachments) {
              try {
                const content = await import_fs3.promises.readFile(att.filePath);
                attachmentsWithContent.push({
                  filename: att.filename,
                  contentType: att.contentType,
                  size: att.size,
                  content
                });
              } catch (error2) {
                logger_default.warn("Failed to read attachment file", {
                  filePath: att.filePath,
                  error: error2.message
                });
              }
            }
            emailsData.push({
              messageId: email.messageId,
              from: email.fromAddress,
              to: email.toAddress,
              cc: email.ccAddress,
              subject: email.subject,
              date: email.date,
              bodyText: email.bodyText,
              bodyHtml: email.bodyHtml,
              attachments: attachmentsWithContent
            });
            if (onProgress) {
              onProgress(i + 1, emails.length);
            }
          }
          await import_mbox.default.generate(emailsData, filePath);
          logger_default.info("All emails exported to MBOX successfully", {
            filePath,
            count: emails.length
          });
          return emails.length;
        } catch (error2) {
          logger_default.error("Failed to export all emails to MBOX", {
            error: error2.message
          });
          throw error2;
        }
      }
      /**
       * Import EML file
       * @param {string} filePath - EML file path
       * @param {string} folder - Target folder (default: INBOX)
       * @param {number} accountId - Account ID
       * @returns {Promise<Object>} Import result
       */
      async importEml(filePath, folder = "INBOX", accountId = null) {
        try {
          logger_default.info("Importing EML file", { filePath, folder });
          const emailData = await import_eml.default.parse(filePath);
          if (emailData.messageId) {
            const existing = email_default.findByMessageId(emailData.messageId);
            if (existing) {
              logger_default.warn("Email already exists (duplicate Message-ID)", {
                messageId: emailData.messageId
              });
              return {
                success: false,
                reason: "duplicate",
                messageId: emailData.messageId
              };
            }
          }
          const emailId = email_default.create({
            uid: null,
            messageId: emailData.messageId,
            folder,
            from: emailData.from,
            to: emailData.to,
            cc: emailData.cc,
            subject: emailData.subject,
            date: emailData.date,
            bodyText: emailData.bodyText,
            bodyHtml: emailData.bodyHtml,
            hasAttachments: emailData.attachments.length > 0,
            isRead: false,
            flags: [],
            accountId
          });
          if (emailData.attachments.length > 0) {
            const dataDir = getDataDir();
            const attachmentsDir = import_path4.default.join(dataDir, "attachments");
            await import_fs3.promises.mkdir(attachmentsDir, { recursive: true });
            for (const attachment of emailData.attachments) {
              const attachmentPath = import_path4.default.join(
                attachmentsDir,
                `${emailId}_${attachment.filename}`
              );
              await import_fs3.promises.writeFile(attachmentPath, attachment.content);
              attachment_default.create({
                emailId,
                filename: attachment.filename,
                contentType: attachment.contentType,
                size: attachment.size,
                filePath: attachmentPath
              });
            }
          }
          logger_default.info("EML file imported successfully", { filePath, emailId });
          return {
            success: true,
            emailId,
            attachmentCount: emailData.attachments.length
          };
        } catch (error2) {
          logger_default.error("Failed to import EML file", {
            filePath,
            error: error2.message
          });
          throw error2;
        }
      }
      /**
       * Import MBOX file
       * @param {string} filePath - MBOX file path
       * @param {string} folder - Target folder (default: INBOX)
       * @param {number} accountId - Account ID
       * @param {Function} onProgress - Progress callback
       * @returns {Promise<Object>} Import result
       */
      async importMbox(filePath, folder = "INBOX", accountId = null, onProgress = null) {
        try {
          logger_default.info("Importing MBOX file", { filePath, folder });
          let imported = 0;
          let skipped = 0;
          let errors = 0;
          const onEmail = async (emailData) => {
            try {
              if (emailData.messageId) {
                const existing = email_default.findByMessageId(emailData.messageId);
                if (existing) {
                  logger_default.debug("Skipping duplicate email", {
                    messageId: emailData.messageId
                  });
                  skipped++;
                  if (onProgress) {
                    onProgress({ imported, skipped, errors });
                  }
                  return;
                }
              }
              const emailId = email_default.create({
                uid: null,
                messageId: emailData.messageId,
                folder,
                from: emailData.from,
                to: emailData.to,
                cc: emailData.cc,
                subject: emailData.subject,
                date: emailData.date,
                bodyText: emailData.bodyText,
                bodyHtml: emailData.bodyHtml,
                hasAttachments: emailData.attachments.length > 0,
                isRead: false,
                flags: [],
                accountId
              });
              if (emailData.attachments.length > 0) {
                const dataDir = getDataDir();
                const attachmentsDir = import_path4.default.join(dataDir, "attachments");
                await import_fs3.promises.mkdir(attachmentsDir, { recursive: true });
                for (const attachment of emailData.attachments) {
                  const attachmentPath = import_path4.default.join(
                    attachmentsDir,
                    `${emailId}_${attachment.filename}`
                  );
                  await import_fs3.promises.writeFile(attachmentPath, attachment.content);
                  attachment_default.create({
                    emailId,
                    filename: attachment.filename,
                    contentType: attachment.contentType,
                    size: attachment.size,
                    filePath: attachmentPath
                  });
                }
              }
              imported++;
              if (onProgress) {
                onProgress({ imported, skipped, errors });
              }
            } catch (error2) {
              logger_default.error("Failed to import email from MBOX", {
                error: error2.message
              });
              errors++;
              if (onProgress) {
                onProgress({ imported, skipped, errors });
              }
            }
          };
          await import_mbox.default.parse(filePath, onEmail);
          logger_default.info("MBOX file imported successfully", {
            filePath,
            imported,
            skipped,
            errors
          });
          return { success: true, imported, skipped, errors };
        } catch (error2) {
          logger_default.error("Failed to import MBOX file", {
            filePath,
            error: error2.message
          });
          throw error2;
        }
      }
      /**
       * Batch export emails to MBOX
       * @param {Array<number>} emailIds - Array of email IDs
       * @param {string} filePath - Output file path
       * @param {Function} onProgress - Progress callback
       * @returns {Promise<number>} Number of emails exported
       */
      async batchExportToMbox(emailIds, filePath, onProgress = null) {
        try {
          logger_default.info("Batch exporting emails to MBOX", {
            count: emailIds.length,
            filePath
          });
          const emailsData = [];
          for (let i = 0; i < emailIds.length; i++) {
            const emailId = emailIds[i];
            const email = email_default.findById(emailId);
            if (!email) {
              logger_default.warn("Email not found, skipping", { emailId });
              continue;
            }
            const attachments = attachment_default.findByEmailId(emailId);
            emailsData.push({
              messageId: email.messageId,
              from: email.fromAddress,
              to: email.toAddress,
              cc: email.ccAddress,
              subject: email.subject,
              date: email.date,
              bodyText: email.bodyText,
              bodyHtml: email.bodyHtml,
              attachments
            });
            if (onProgress) {
              onProgress(i + 1, emailIds.length);
            }
          }
          await import_mbox.default.generate(emailsData, filePath);
          logger_default.info("Batch export to MBOX completed", {
            filePath,
            count: emailsData.length
          });
          return emailsData.length;
        } catch (error2) {
          logger_default.error("Failed to batch export to MBOX", { error: error2.message });
          throw error2;
        }
      }
    };
    module2.exports = new ImportExportManager();
  }
});

// src/threads/analyzer.ts
var require_analyzer = __commonJS({
  "src/threads/analyzer.ts"(exports2, module2) {
    "use strict";
    init_logger();
    var ThreadAnalyzer = class {
      /**
       * Normalize subject by removing Re:, Fwd:, etc. prefixes
       */
      normalizeSubject(subject) {
        if (!subject) return "";
        return subject.replace(/^(re|fw|fwd|回复|转发):\s*/gi, "").trim().toLowerCase();
      }
      /**
       * Extract email addresses from References header
       */
      parseReferences(references) {
        if (!references) return [];
        return references.split(/[\s,]+/).map((ref) => ref.trim()).filter((ref) => ref.length > 0);
      }
      /**
       * Calculate subject similarity score (0-1)
       */
      calculateSubjectSimilarity(subject1, subject2) {
        const norm1 = this.normalizeSubject(subject1);
        const norm2 = this.normalizeSubject(subject2);
        if (!norm1 || !norm2) return 0;
        if (norm1 === norm2) return 1;
        const maxLen = Math.max(norm1.length, norm2.length);
        const distance = this._levenshteinDistance(norm1, norm2);
        return 1 - distance / maxLen;
      }
      /**
       * Levenshtein distance algorithm
       */
      _levenshteinDistance(str1, str2) {
        const matrix = [];
        for (let i = 0; i <= str2.length; i++) {
          matrix[i] = [i];
        }
        for (let j = 0; j <= str1.length; j++) {
          matrix[0][j] = j;
        }
        for (let i = 1; i <= str2.length; i++) {
          for (let j = 1; j <= str1.length; j++) {
            if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
              matrix[i][j] = matrix[i - 1][j - 1];
            } else {
              matrix[i][j] = Math.min(
                matrix[i - 1][j - 1] + 1,
                matrix[i][j - 1] + 1,
                matrix[i - 1][j] + 1
              );
            }
          }
        }
        return matrix[str2.length][str1.length];
      }
      /**
       * Analyze email relationships and determine thread connections
       * Returns array of { emailId, parentId, confidence }
       */
      analyzeRelationships(emails) {
        const relationships = [];
        const messageIdMap = /* @__PURE__ */ new Map();
        emails.forEach((email) => {
          if (email.messageId) {
            messageIdMap.set(email.messageId, email);
          }
        });
        emails.forEach((email) => {
          let parentId = null;
          let confidence = 0;
          let method = null;
          if (email.inReplyTo) {
            const parent = messageIdMap.get(email.inReplyTo);
            if (parent) {
              parentId = parent.id;
              confidence = 1;
              method = "in-reply-to";
            }
          }
          if (!parentId && email.references) {
            const refs = this.parseReferences(email.references);
            for (let i = refs.length - 1; i >= 0; i--) {
              const parent = messageIdMap.get(refs[i]);
              if (parent) {
                parentId = parent.id;
                confidence = 0.9;
                method = "references";
                break;
              }
            }
          }
          if (!parentId && email.subject) {
            const normalizedSubject = this.normalizeSubject(email.subject);
            let bestMatch = null;
            let bestScore = 0;
            emails.forEach((otherEmail) => {
              if (otherEmail.id === email.id) return;
              if (!otherEmail.subject) return;
              if (new Date(otherEmail.date) >= new Date(email.date)) return;
              const similarity = this.calculateSubjectSimilarity(
                email.subject,
                otherEmail.subject
              );
              if (similarity > bestScore && similarity >= 0.8) {
                bestScore = similarity;
                bestMatch = otherEmail;
              }
            });
            if (bestMatch) {
              parentId = bestMatch.id;
              confidence = bestScore * 0.7;
              method = "subject-similarity";
            }
          }
          relationships.push({
            emailId: email.id,
            parentId,
            confidence,
            method
          });
          logger_default.debug("Analyzed email relationship", {
            emailId: email.id,
            subject: email.subject,
            parentId,
            confidence,
            method
          });
        });
        return relationships;
      }
      /**
       * Find thread root for an email
       */
      findThreadRoot(email, relationships) {
        const relationshipMap = /* @__PURE__ */ new Map();
        relationships.forEach((rel) => {
          relationshipMap.set(rel.emailId, rel);
        });
        let current = email;
        const visited = /* @__PURE__ */ new Set();
        while (current) {
          if (visited.has(current.id)) {
            logger_default.warn("Circular reference detected in thread", {
              emailId: current.id
            });
            break;
          }
          visited.add(current.id);
          const rel = relationshipMap.get(current.id);
          if (!rel || !rel.parentId) {
            return current;
          }
          const parent = relationships.find((r) => r.emailId === rel.parentId);
          if (!parent) {
            return current;
          }
          current = { id: rel.parentId };
        }
        return current;
      }
    };
    module2.exports = new ThreadAnalyzer();
  }
});

// src/threads/builder.ts
var ThreadBuilder, builder_default;
var init_builder = __esm({
  "src/threads/builder.ts"() {
    "use strict";
    init_logger();
    ThreadBuilder = class {
      /**
       * Build thread tree from emails
       * Returns array of thread roots with nested children
       */
      buildThreads(emails, relationships) {
        if (!emails || emails.length === 0) {
          return [];
        }
        const emailMap = /* @__PURE__ */ new Map();
        emails.forEach((email) => {
          emailMap.set(email.id, {
            ...email,
            children: [],
            depth: 0
          });
        });
        const relationshipMap = /* @__PURE__ */ new Map();
        relationships.forEach((rel) => {
          relationshipMap.set(rel.emailId, rel);
        });
        const roots = [];
        emails.forEach((email) => {
          const emailNode = emailMap.get(email.id);
          const rel = relationshipMap.get(email.id);
          if (rel && rel.parentId) {
            const parent = emailMap.get(rel.parentId);
            if (parent) {
              parent.children.push(emailNode);
              emailNode.depth = parent.depth + 1;
              emailNode.parentId = rel.parentId;
              emailNode.confidence = rel.confidence;
              emailNode.method = rel.method;
            } else {
              roots.push(emailNode);
            }
          } else {
            roots.push(emailNode);
          }
        });
        const sortChildren = (node) => {
          if (node.children && node.children.length > 0) {
            node.children.sort((a, b) => new Date(a.date) - new Date(b.date));
            node.children.forEach((child) => sortChildren(child));
          }
        };
        roots.forEach((root) => sortChildren(root));
        roots.sort((a, b) => {
          const aLatest = this._getLatestDate(a);
          const bLatest = this._getLatestDate(b);
          return new Date(bLatest) - new Date(aLatest);
        });
        logger_default.debug("Built threads", {
          totalEmails: emails.length,
          threadCount: roots.length
        });
        return roots;
      }
      /**
       * Get latest date in thread (including children)
       */
      _getLatestDate(node) {
        let latest = node.date;
        if (node.children && node.children.length > 0) {
          node.children.forEach((child) => {
            const childLatest = this._getLatestDate(child);
            if (new Date(childLatest) > new Date(latest)) {
              latest = childLatest;
            }
          });
        }
        return latest;
      }
      /**
       * Get thread statistics
       */
      getThreadStats(thread) {
        const stats = {
          messageCount: 0,
          participants: /* @__PURE__ */ new Set(),
          firstDate: thread.date,
          lastDate: thread.date,
          hasUnread: false,
          depth: 0
        };
        const traverse = (node, currentDepth = 0) => {
          stats.messageCount++;
          stats.depth = Math.max(stats.depth, currentDepth);
          if (node.from) {
            stats.participants.add(node.from);
          }
          if (new Date(node.date) < new Date(stats.firstDate)) {
            stats.firstDate = node.date;
          }
          if (new Date(node.date) > new Date(stats.lastDate)) {
            stats.lastDate = node.date;
          }
          if (!node.isRead) {
            stats.hasUnread = true;
          }
          if (node.children && node.children.length > 0) {
            node.children.forEach((child) => traverse(child, currentDepth + 1));
          }
        };
        traverse(thread);
        return {
          ...stats,
          participants: Array.from(stats.participants)
        };
      }
      /**
       * Flatten thread tree to array
       */
      flattenThread(thread) {
        const result = [];
        const traverse = (node) => {
          result.push(node);
          if (node.children && node.children.length > 0) {
            node.children.forEach((child) => traverse(child));
          }
        };
        traverse(thread);
        return result;
      }
      /**
       * Generate thread ID from root email
       */
      generateThreadId(rootEmail) {
        if (rootEmail.messageId) {
          return `thread-${rootEmail.messageId}`;
        }
        return `thread-${rootEmail.id}`;
      }
      /**
       * Find thread by email ID
       */
      findThreadByEmailId(threads, emailId) {
        for (const thread of threads) {
          const found = this._findInThread(thread, emailId);
          if (found) {
            return thread;
          }
        }
        return null;
      }
      /**
       * Find email in thread tree
       */
      _findInThread(node, emailId) {
        if (node.id === emailId) {
          return node;
        }
        if (node.children && node.children.length > 0) {
          for (const child of node.children) {
            const found = this._findInThread(child, emailId);
            if (found) {
              return found;
            }
          }
        }
        return null;
      }
    };
    builder_default = new ThreadBuilder();
  }
});

// src/cli/commands/thread.ts
function formatThreadTree(thread, options = {}) {
  const { expanded = true, depth = 0, prefix = "", isLast = true } = options;
  const lines = [];
  const connector = depth === 0 ? "" : isLast ? "\u2514\u2500 " : "\u251C\u2500 ";
  const childPrefix = depth === 0 ? "" : isLast ? "   " : "\u2502  ";
  const unreadMark = thread.isRead ? " " : import_chalk3.default.bold.blue("\u25CF");
  const starMark = thread.isStarred ? import_chalk3.default.yellow("\u2605") : " ";
  const from = thread.from || "Unknown";
  const subject = thread.subject || "(No subject)";
  const date = new Date(thread.date).toLocaleString();
  lines.push(
    `${prefix}${connector}${unreadMark}${starMark} ${import_chalk3.default.cyan(from)} - ${import_chalk3.default.white(subject)} ${import_chalk3.default.gray(date)}`
  );
  if (expanded && thread.children && thread.children.length > 0) {
    thread.children.forEach((child, index) => {
      const isLastChild = index === thread.children.length - 1;
      const childLines = formatThreadTree(child, {
        expanded,
        depth: depth + 1,
        prefix: prefix + childPrefix,
        isLast: isLastChild
      });
      lines.push(...childLines);
    });
  } else if (thread.children && thread.children.length > 0) {
    lines.push(
      `${prefix}${childPrefix}${import_chalk3.default.gray(`   [${thread.children.length} more messages...]`)}`
    );
  }
  return lines;
}
async function listThreads(options = {}) {
  try {
    const { folder = "INBOX", limit = 20, accountId = null } = options;
    console.log(import_chalk3.default.bold(`
Threaded view of ${folder}:
`));
    const emails = await email_default.findByFolder(folder, {
      limit: limit * 5,
      // Fetch more to build threads
      includeDeleted: false
    });
    if (emails.length === 0) {
      console.log(import_chalk3.default.gray("No emails found."));
      return;
    }
    const relationships = import_analyzer.default.analyzeRelationships(emails);
    const threads = builder_default.buildThreads(emails, relationships);
    threads.slice(0, limit).forEach((thread, index) => {
      const stats = builder_default.getThreadStats(thread);
      const threadLines = formatThreadTree(thread, { expanded: false });
      console.log(threadLines.join("\n"));
      console.log(
        import_chalk3.default.gray(
          `  ${stats.messageCount} messages, ${stats.participants.length} participants, ${stats.hasUnread ? import_chalk3.default.blue("unread") : "all read"}`
        )
      );
      console.log("");
    });
    console.log(
      import_chalk3.default.gray(
        `Showing ${Math.min(limit, threads.length)} of ${threads.length} threads`
      )
    );
  } catch (error2) {
    logger_default.error("Failed to list threads", { error: error2.message });
    console.error(import_chalk3.default.red(`Error: ${error2.message}`));
    process.exit(1);
  }
}
async function showThread(emailId, options = {}) {
  try {
    const { expanded = true } = options;
    const email = await email_default.findById(emailId);
    if (!email) {
      console.error(import_chalk3.default.red(`Email ${emailId} not found.`));
      process.exit(1);
    }
    const emails = await email_default.findByFolder(email.folder, {
      limit: 1e3,
      includeDeleted: false
    });
    const relationships = import_analyzer.default.analyzeRelationships(emails);
    const threads = builder_default.buildThreads(emails, relationships);
    const thread = builder_default.findThreadByEmailId(threads, emailId);
    if (!thread) {
      console.error(import_chalk3.default.red("Thread not found."));
      process.exit(1);
    }
    console.log(import_chalk3.default.bold("\nThread:\n"));
    const stats = builder_default.getThreadStats(thread);
    const threadLines = formatThreadTree(thread, { expanded });
    console.log(threadLines.join("\n"));
    console.log("");
    console.log(import_chalk3.default.bold("Thread Statistics:"));
    console.log(import_chalk3.default.gray(`  Messages: ${stats.messageCount}`));
    console.log(import_chalk3.default.gray(`  Participants: ${stats.participants.join(", ")}`));
    console.log(
      import_chalk3.default.gray(
        `  First message: ${new Date(stats.firstDate).toLocaleString()}`
      )
    );
    console.log(
      import_chalk3.default.gray(`  Last message: ${new Date(stats.lastDate).toLocaleString()}`)
    );
    console.log(import_chalk3.default.gray(`  Max depth: ${stats.depth}`));
    console.log(import_chalk3.default.gray(`  Unread: ${stats.hasUnread ? "Yes" : "No"}`));
  } catch (error2) {
    logger_default.error("Failed to show thread", { error: error2.message });
    console.error(import_chalk3.default.red(`Error: ${error2.message}`));
    process.exit(1);
  }
}
async function deleteThread(emailId, options = {}) {
  try {
    const { permanent = false } = options;
    const email = await email_default.findById(emailId);
    if (!email) {
      console.error(import_chalk3.default.red(`Email ${emailId} not found.`));
      process.exit(1);
    }
    const emails = await email_default.findByFolder(email.folder, {
      limit: 1e3,
      includeDeleted: false
    });
    const relationships = import_analyzer.default.analyzeRelationships(emails);
    const threads = builder_default.buildThreads(emails, relationships);
    const thread = builder_default.findThreadByEmailId(threads, emailId);
    if (!thread) {
      console.error(import_chalk3.default.red("Thread not found."));
      process.exit(1);
    }
    const threadEmails = builder_default.flattenThread(thread);
    console.log(
      import_chalk3.default.yellow(`
Deleting thread with ${threadEmails.length} messages...`)
    );
    for (const threadEmail of threadEmails) {
      if (permanent) {
        await email_default.permanentlyDelete(threadEmail.id);
      } else {
        await email_default.moveToTrash(threadEmail.id);
      }
    }
    console.log(
      import_chalk3.default.green(`\u2713 Thread deleted (${threadEmails.length} messages)`)
    );
  } catch (error2) {
    logger_default.error("Failed to delete thread", { error: error2.message });
    console.error(import_chalk3.default.red(`Error: ${error2.message}`));
    process.exit(1);
  }
}
async function moveThread(emailId, targetFolder, options = {}) {
  try {
    const email = await email_default.findById(emailId);
    if (!email) {
      console.error(import_chalk3.default.red(`Email ${emailId} not found.`));
      process.exit(1);
    }
    const emails = await email_default.findByFolder(email.folder, {
      limit: 1e3,
      includeDeleted: false
    });
    const relationships = import_analyzer.default.analyzeRelationships(emails);
    const threads = builder_default.buildThreads(emails, relationships);
    const thread = builder_default.findThreadByEmailId(threads, emailId);
    if (!thread) {
      console.error(import_chalk3.default.red("Thread not found."));
      process.exit(1);
    }
    const threadEmails = builder_default.flattenThread(thread);
    console.log(
      import_chalk3.default.yellow(
        `
Moving thread with ${threadEmails.length} messages to ${targetFolder}...`
      )
    );
    for (const threadEmail of threadEmails) {
      await email_default.move(threadEmail.id, targetFolder);
    }
    console.log(
      import_chalk3.default.green(
        `\u2713 Thread moved to ${targetFolder} (${threadEmails.length} messages)`
      )
    );
  } catch (error2) {
    logger_default.error("Failed to move thread", { error: error2.message });
    console.error(import_chalk3.default.red(`Error: ${error2.message}`));
    process.exit(1);
  }
}
var import_chalk3, import_analyzer;
var init_thread = __esm({
  "src/cli/commands/thread.ts"() {
    "use strict";
    import_chalk3 = __toESM(require("chalk"));
    init_email();
    import_analyzer = __toESM(require_analyzer());
    init_builder();
    init_logger();
  }
});

// src/storage/models/tag.ts
function getErrorMessage12(error2) {
  return error2 instanceof Error ? error2.message : String(error2);
}
function toNumber8(value) {
  return typeof value === "bigint" ? Number(value) : value;
}
var TagModel, tagModel, tag_default;
var init_tag = __esm({
  "src/storage/models/tag.ts"() {
    "use strict";
    init_errors();
    init_logger();
    init_database();
    TagModel = class {
      db;
      constructor() {
        this.db = null;
      }
      getDb() {
        if (!this.db) {
          this.db = database_default.getDb();
        }
        return this.db;
      }
      create(tagData) {
        try {
          const db = this.getDb();
          const stmt = db.prepare(`
        INSERT INTO tags (name, color, description, account_id)
        VALUES (?, ?, ?, ?)
      `);
          const result = stmt.run(
            tagData.name,
            tagData.color ?? "#808080",
            tagData.description ?? null,
            tagData.accountId ?? null
          );
          const insertId = toNumber8(result.lastInsertRowid);
          logger_default.debug("Tag created", { id: insertId, name: tagData.name });
          return insertId;
        } catch (error2) {
          const errorMessage = getErrorMessage12(error2);
          if (errorMessage.includes("UNIQUE constraint failed")) {
            throw new StorageError(`Tag "${tagData.name}" already exists`);
          }
          logger_default.error("Failed to create tag", { error: errorMessage });
          throw new StorageError(`Failed to create tag: ${errorMessage}`);
        }
      }
      findAll(accountId = null) {
        try {
          const db = this.getDb();
          let query = "SELECT * FROM tags";
          const params = [];
          if (accountId !== null) {
            query += " WHERE account_id = ? OR account_id IS NULL";
            params.push(accountId);
          }
          query += " ORDER BY name ASC";
          const stmt = db.prepare(query);
          const tags = stmt.all(...params);
          return tags.map((tag) => this.formatTag(tag));
        } catch (error2) {
          const errorMessage = getErrorMessage12(error2);
          logger_default.error("Failed to find tags", { error: errorMessage });
          throw new StorageError(`Failed to find tags: ${errorMessage}`);
        }
      }
      findById(id) {
        try {
          const db = this.getDb();
          const stmt = db.prepare(
            "SELECT * FROM tags WHERE id = ?"
          );
          const tag = stmt.get(id);
          return tag ? this.formatTag(tag) : null;
        } catch (error2) {
          const errorMessage = getErrorMessage12(error2);
          logger_default.error("Failed to find tag by ID", { id, error: errorMessage });
          throw new StorageError(`Failed to find tag: ${errorMessage}`);
        }
      }
      findByName(name, accountId = null) {
        try {
          const db = this.getDb();
          let query = "SELECT * FROM tags WHERE name = ?";
          const params = [name];
          if (accountId !== null) {
            query += " AND (account_id = ? OR account_id IS NULL)";
            params.push(accountId);
          }
          const stmt = db.prepare(query);
          const tag = stmt.get(...params);
          return tag ? this.formatTag(tag) : null;
        } catch (error2) {
          const errorMessage = getErrorMessage12(error2);
          logger_default.error("Failed to find tag by name", { name, error: errorMessage });
          throw new StorageError(`Failed to find tag: ${errorMessage}`);
        }
      }
      update(id, data) {
        try {
          const db = this.getDb();
          const fields = [];
          const params = [];
          if (data.name !== void 0) {
            fields.push("name = ?");
            params.push(data.name);
          }
          if (data.color !== void 0) {
            fields.push("color = ?");
            params.push(data.color);
          }
          if (data.description !== void 0) {
            fields.push("description = ?");
            params.push(data.description);
          }
          if (fields.length === 0) {
            return false;
          }
          fields.push("updated_at = CURRENT_TIMESTAMP");
          params.push(id);
          const sql = `UPDATE tags SET ${fields.join(", ")} WHERE id = ?`;
          const stmt = db.prepare(sql);
          const result = stmt.run(...params);
          logger_default.debug("Tag updated", { id, changes: result.changes });
          return result.changes > 0;
        } catch (error2) {
          const errorMessage = getErrorMessage12(error2);
          if (errorMessage.includes("UNIQUE constraint failed")) {
            throw new StorageError("Tag name already exists");
          }
          logger_default.error("Failed to update tag", { id, error: errorMessage });
          throw new StorageError(`Failed to update tag: ${errorMessage}`);
        }
      }
      delete(id) {
        try {
          const db = this.getDb();
          const stmt = db.prepare("DELETE FROM tags WHERE id = ?");
          const result = stmt.run(id);
          logger_default.debug("Tag deleted", { id, changes: result.changes });
          return result.changes > 0;
        } catch (error2) {
          const errorMessage = getErrorMessage12(error2);
          logger_default.error("Failed to delete tag", { id, error: errorMessage });
          throw new StorageError(`Failed to delete tag: ${errorMessage}`);
        }
      }
      addToEmail(emailId, tagId) {
        try {
          const db = this.getDb();
          const stmt = db.prepare(`
        INSERT INTO email_tags (email_id, tag_id)
        VALUES (?, ?)
      `);
          const result = stmt.run(emailId, tagId);
          const insertId = toNumber8(result.lastInsertRowid);
          logger_default.debug("Tag added to email", { emailId, tagId });
          return insertId;
        } catch (error2) {
          const errorMessage = getErrorMessage12(error2);
          if (errorMessage.includes("UNIQUE constraint failed")) {
            throw new StorageError("Email already has this tag");
          }
          logger_default.error("Failed to add tag to email", {
            emailId,
            tagId,
            error: errorMessage
          });
          throw new StorageError(`Failed to add tag to email: ${errorMessage}`);
        }
      }
      removeFromEmail(emailId, tagId) {
        try {
          const db = this.getDb();
          const stmt = db.prepare(`
        DELETE FROM email_tags
        WHERE email_id = ? AND tag_id = ?
      `);
          const result = stmt.run(emailId, tagId);
          logger_default.debug("Tag removed from email", {
            emailId,
            tagId,
            changes: result.changes
          });
          return result.changes > 0;
        } catch (error2) {
          const errorMessage = getErrorMessage12(error2);
          logger_default.error("Failed to remove tag from email", {
            emailId,
            tagId,
            error: errorMessage
          });
          throw new StorageError(
            `Failed to remove tag from email: ${errorMessage}`
          );
        }
      }
      findByEmailId(emailId) {
        try {
          const db = this.getDb();
          const stmt = db.prepare(`
        SELECT t.* FROM tags t
        INNER JOIN email_tags et ON t.id = et.tag_id
        WHERE et.email_id = ?
        ORDER BY t.name ASC
      `);
          const tags = stmt.all(emailId);
          return tags.map((tag) => this.formatTag(tag));
        } catch (error2) {
          const errorMessage = getErrorMessage12(error2);
          logger_default.error("Failed to find tags for email", {
            emailId,
            error: errorMessage
          });
          throw new StorageError(`Failed to find tags for email: ${errorMessage}`);
        }
      }
      findEmailsByTag(tagId, options = {}) {
        try {
          const db = this.getDb();
          const { limit = 50, offset = 0 } = options;
          const stmt = db.prepare(`
        SELECT e.* FROM emails e
        INNER JOIN email_tags et ON e.id = et.email_id
        WHERE et.tag_id = ? AND e.is_deleted = 0
        ORDER BY e.date DESC
        LIMIT ? OFFSET ?
      `);
          return stmt.all(tagId, limit, offset);
        } catch (error2) {
          const errorMessage = getErrorMessage12(error2);
          logger_default.error("Failed to find emails by tag", {
            tagId,
            error: errorMessage
          });
          throw new StorageError(`Failed to find emails by tag: ${errorMessage}`);
        }
      }
      countEmailsByTag(tagId) {
        try {
          const db = this.getDb();
          const stmt = db.prepare(`
        SELECT COUNT(*) as count FROM email_tags et
        INNER JOIN emails e ON et.email_id = e.id
        WHERE et.tag_id = ? AND e.is_deleted = 0
      `);
          const result = stmt.get(tagId);
          return result?.count ?? 0;
        } catch (error2) {
          const errorMessage = getErrorMessage12(error2);
          logger_default.error("Failed to count emails by tag", {
            tagId,
            error: errorMessage
          });
          throw new StorageError(`Failed to count emails by tag: ${errorMessage}`);
        }
      }
      formatTag(tag) {
        return {
          id: tag.id,
          name: tag.name,
          color: tag.color,
          description: tag.description,
          accountId: tag.account_id,
          createdAt: tag.created_at,
          updatedAt: tag.updated_at
        };
      }
    };
    tagModel = new TagModel();
    tag_default = tagModel;
  }
});

// src/cli/utils/field-selection.ts
function parseFieldSelection(input) {
  if (!input || input === "*") {
    return { include: "*", exclude: [] };
  }
  const fields = input.split(",").map((f) => f.trim()).filter((f) => f);
  const exclude = [];
  const include = [];
  for (const field of fields) {
    if (field.startsWith("^")) {
      exclude.push(field.slice(1));
    } else if (field === "*") {
      return { include: "*", exclude };
    } else {
      include.push(field);
    }
  }
  return { include, exclude };
}
function selectFields(data, selection) {
  if (selection.include === "*") {
    const result2 = { ...data };
    for (const field of selection.exclude) {
      delete result2[field];
    }
    return result2;
  }
  const result = {};
  for (const field of selection.include) {
    if (field in data) {
      result[field] = data[field];
    }
  }
  return result;
}
function getDefaultFieldSelection(view) {
  switch (view) {
    case "list":
    case "search":
      return {
        include: ["id", "from", "subject", "date", "isRead"],
        exclude: []
      };
    case "detail":
    case "read":
      return {
        include: "*",
        exclude: []
      };
    case "thread":
      return {
        include: ["id", "subject", "participants", "lastDate", "messageCount"],
        exclude: []
      };
    default:
      return {
        include: "*",
        exclude: []
      };
  }
}
var init_field_selection = __esm({
  "src/cli/utils/field-selection.ts"() {
    "use strict";
  }
});

// src/cli/formatters/markdown.ts
var MarkdownFormatter;
var init_markdown = __esm({
  "src/cli/formatters/markdown.ts"() {
    "use strict";
    init_helpers();
    init_field_selection();
    MarkdownFormatter = class {
      formatList(data, meta, options) {
        if (!data || data.length === 0) {
          return "No results found.";
        }
        const selection = options.fields ? parseFieldSelection(options.fields) : getDefaultFieldSelection("list");
        const filteredData = data.map((item) => selectFields(item, selection));
        const lines = [];
        const showing = meta.showing ? `Showing ${meta.showing}` : "";
        const unreadTotal = `${meta.unread ?? 0} unread, ${meta.total ?? data.length} total`;
        const title = meta.folder || "Results";
        const header = showing ? `${title} (${unreadTotal}) - ${showing}` : `${title} (${unreadTotal})`;
        lines.push(`## ${header}`);
        lines.push("");
        const tableHeaders = this.buildTableHeaders(selection, filteredData[0]);
        lines.push(tableHeaders.header);
        lines.push(tableHeaders.separator);
        for (let i = 0; i < filteredData.length; i++) {
          const item = filteredData[i];
          const originalItem = data[i];
          const row = this.buildTableRow(selection, item, originalItem);
          lines.push(row);
        }
        if (meta.totalPages) {
          lines.push("");
          lines.push(
            `Page ${meta.page || 1} of ${meta.totalPages} (${meta.total} total emails)`
          );
        }
        return lines.join("\n");
      }
      formatDetail(data, options) {
        const selection = options.fields ? parseFieldSelection(options.fields) : getDefaultFieldSelection("detail");
        const filtered = selectFields(data, selection);
        const lines = [];
        lines.push("## Email Details");
        lines.push("");
        const fieldOrder = [
          "id",
          "from",
          "to",
          "cc",
          "bcc",
          "subject",
          "date",
          "isRead",
          "isStarred",
          "isFlagged",
          "attachments",
          "bodyText",
          "bodyHtml"
        ];
        for (const field of fieldOrder) {
          if (!(field in filtered)) continue;
          const value = filtered[field];
          if (value === void 0 || value === null) continue;
          switch (field) {
            case "id":
              lines.push(`- **ID:** ${value}`);
              break;
            case "from":
              lines.push(`- **From:** ${this.escapeMarkdown(String(value))}`);
              break;
            case "to":
              lines.push(`- **To:** ${this.escapeMarkdown(String(value))}`);
              break;
            case "cc":
              lines.push(`- **CC:** ${this.escapeMarkdown(String(value))}`);
              break;
            case "bcc":
              lines.push(`- **BCC:** ${this.escapeMarkdown(String(value))}`);
              break;
            case "subject":
              lines.push(`- **Subject:** ${this.escapeMarkdown(String(value))}`);
              break;
            case "date":
              lines.push(`- **Date:** ${this.formatDateISO(value)}`);
              break;
            case "isRead":
              lines.push(`- **Status:** ${value ? "Read" : "Unread"}`);
              break;
            case "isStarred":
              if (value) lines.push(`- **Starred:** Yes`);
              break;
            case "isFlagged":
              if (value) lines.push(`- **Flagged (Important):** Yes`);
              break;
            case "attachments":
              if (Array.isArray(value) && value.length > 0) {
                lines.push(`- **Attachments:** ${value.length}`);
                for (const att of value) {
                  lines.push(`  - ${att.filename} (${this.formatFileSize(att.size)})`);
                }
              }
              break;
          }
        }
        if ("bodyText" in filtered || "bodyHtml" in filtered) {
          lines.push("");
          lines.push("### Body");
          lines.push("");
          const body = filtered.bodyText || filtered.bodyHtml || "";
          lines.push(body || "(No content)");
        }
        return lines.join("\n");
      }
      buildTableHeaders(selection, sampleData) {
        const fields = selection.include === "*" ? Object.keys(sampleData).filter((f) => !selection.exclude.includes(f)) : selection.include;
        const headers = [];
        const separators = [];
        for (const field of fields) {
          const headerName = this.getFieldDisplayName(field);
          headers.push(` ${headerName} `);
          separators.push("".padStart(headerName.length + 2, "-"));
        }
        return {
          header: `|${headers.join("|")}|`,
          separator: `|${separators.join("|")}|`
        };
      }
      buildTableRow(selection, item, originalItem) {
        const fields = selection.include === "*" ? Object.keys(item).filter((f) => !selection.exclude.includes(f)) : selection.include;
        const values = [];
        for (const field of fields) {
          const value = this.formatFieldValue(field, item[field], originalItem);
          values.push(` ${value} `);
        }
        return `|${values.join("|")}|`;
      }
      getFieldDisplayName(field) {
        const displayNames = {
          id: "ID",
          from: "From",
          to: "To",
          cc: "CC",
          bcc: "BCC",
          subject: "Subject",
          date: "Date",
          isRead: "Status",
          isStarred: "Starred",
          isFlagged: "Flagged",
          hasAttachments: "Attachments",
          folder: "Folder",
          bodyText: "Body",
          bodyHtml: "HTML",
          threadId: "Thread",
          accountId: "Account"
        };
        return displayNames[field] || field.charAt(0).toUpperCase() + field.slice(1);
      }
      formatFieldValue(field, value, originalItem) {
        if (value === void 0 || value === null) {
          return "";
        }
        switch (field) {
          case "id":
          case "threadId":
          case "accountId":
            return String(value);
          case "from":
          case "to":
          case "cc":
          case "bcc":
            return this.escapeMarkdownForTable(truncate(String(value), 20));
          case "subject":
            return this.escapeMarkdownForTable(truncate(String(value), 30));
          case "date":
            return formatDate(value);
          case "isRead":
            return value ? "Read" : "Unread";
          case "isStarred":
          case "isFlagged":
          case "hasAttachments":
            return value ? "Yes" : "No";
          case "bodyText":
          case "bodyHtml":
            return this.escapeMarkdownForTable(truncate(String(value), 50));
          case "folder":
            return this.escapeMarkdownForTable(String(value));
          default:
            if (typeof value === "object") {
              return this.escapeMarkdownForTable(JSON.stringify(value));
            }
            return this.escapeMarkdownForTable(truncate(String(value), 30));
        }
      }
      escapeMarkdown(text) {
        if (!text) return "";
        return text.replace(/\|/g, "\\|");
      }
      escapeMarkdownForTable(text) {
        if (!text) return "";
        return text.replace(/\|/g, "\\|").replace(/\n/g, " ");
      }
      formatDateISO(date) {
        if (!date) return "";
        if (typeof date === "string" && date.includes("T")) {
          return date;
        }
        return new Date(date).toISOString();
      }
      formatFileSize(bytes) {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
      }
    };
  }
});

// src/cli/formatters/json.ts
var JSONFormatter;
var init_json = __esm({
  "src/cli/formatters/json.ts"() {
    "use strict";
    init_field_selection();
    JSONFormatter = class {
      formatList(data, meta, options) {
        const selection = options.fields ? parseFieldSelection(options.fields) : getDefaultFieldSelection("list");
        const filteredData = data.map((item) => {
          const sanitized = this.sanitizeItem(item);
          return selectFields(sanitized, selection);
        });
        const result = {
          data: filteredData,
          meta: this.sanitizeMeta(meta)
        };
        return JSON.stringify(result, null, 2);
      }
      formatDetail(data, options) {
        const selection = options.fields ? parseFieldSelection(options.fields) : getDefaultFieldSelection("detail");
        const sanitized = this.sanitizeItem(data);
        const filtered = selectFields(sanitized, selection);
        const result = {
          data: filtered
        };
        return JSON.stringify(result, null, 2);
      }
      sanitizeData(data) {
        if (Array.isArray(data)) {
          return data.map((item) => this.sanitizeItem(item));
        }
        return this.sanitizeItem(data);
      }
      sanitizeItem(item) {
        if (!item) return item;
        const result = {};
        for (const key of Object.keys(item)) {
          if (typeof key === "string" && key.startsWith("_")) continue;
          const keyString = key;
          if (keyString.includes("password") || keyString.includes("token") || keyString.includes("secret")) {
            result[keyString] = "***REDACTED***";
          } else if (keyString === "bodyHtml") {
            result[keyString] = item[keyString] ? "<HTML content>" : null;
          } else {
            result[keyString] = item[keyString];
          }
        }
        return result;
      }
      sanitizeMeta(meta) {
        const result = {};
        for (const key of Object.keys(meta)) {
          result[key] = meta[key];
        }
        return result;
      }
    };
  }
});

// src/cli/formatters/ids-only.ts
var IDsOnlyFormatter;
var init_ids_only = __esm({
  "src/cli/formatters/ids-only.ts"() {
    "use strict";
    IDsOnlyFormatter = class {
      formatList(data, meta, options) {
        if (!data || data.length === 0) {
          return "";
        }
        return data.map((item) => item.id).join(" ");
      }
      formatDetail(data, options) {
        return String(data?.id || "");
      }
    };
  }
});

// src/cli/formatters/index.ts
function getFormatter(format = "markdown") {
  switch (format) {
    case "json":
      return new JSONFormatter();
    case "ids-only":
      return new IDsOnlyFormatter();
    case "markdown":
    default:
      return new MarkdownFormatter();
  }
}
var init_formatters = __esm({
  "src/cli/formatters/index.ts"() {
    "use strict";
    init_markdown();
    init_json();
    init_ids_only();
  }
});

// src/cli/utils/pagination.ts
function parsePagination(options = {}) {
  const limit = Math.max(options.limit ?? 20, 1);
  let offset = 0;
  let page = 1;
  if (options.offset !== void 0) {
    offset = Math.max(options.offset, 0);
    page = Math.floor(offset / limit) + 1;
  } else if (options.page !== void 0) {
    page = Math.max(options.page, 1);
    offset = (page - 1) * limit;
  }
  return { limit, offset, page };
}
function calculateRange(offset, limit, total) {
  if (total === 0 || offset >= total) {
    return { start: 0, end: 0, total, showing: "0" };
  }
  const start = offset + 1;
  const end = Math.min(offset + limit, total);
  const showing = `${start}-${end}`;
  return { start, end, total, showing };
}
var init_pagination = __esm({
  "src/cli/utils/pagination.ts"() {
    "use strict";
  }
});

// src/cli/commands/list.ts
var require_list = __commonJS({
  "src/cli/commands/list.ts"(exports2, module2) {
    "use strict";
    var import_chalk8 = __toESM(require("chalk"));
    init_thread();
    init_account();
    init_email();
    init_tag();
    var import_analyzer2 = __toESM(require_analyzer());
    init_builder();
    init_logger();
    init_formatters();
    init_pagination();
    function listCommand2(options) {
      try {
        const folder = options.folder || "INBOX";
        const { limit, offset, page } = parsePagination(options);
        const unreadOnly = options.unread || false;
        const starred = options.starred || false;
        const flagged = options.flagged || false;
        const tag = options.tag || null;
        const accountId = options.account ? parseInt(options.account) : null;
        const allAccounts = options.allAccounts || false;
        const threadView = options.thread || false;
        let emails;
        let total;
        let title;
        if (starred) {
          title = "Starred Emails";
          emails = email_default.findStarred({
            limit,
            offset,
            folder: options.folder ? folder : null,
            accountId,
            allAccounts
          });
          total = email_default.countStarred(
            options.folder ? folder : null,
            accountId,
            allAccounts
          );
        } else if (flagged) {
          title = "Flagged (Important) Emails";
          emails = email_default.findImportant({
            limit,
            offset,
            folder: options.folder ? folder : null,
            accountId,
            allAccounts
          });
          total = email_default.countImportant(
            options.folder ? folder : null,
            accountId,
            allAccounts
          );
        } else if (tag) {
          const tagObj = tag_default.findByName(tag);
          if (!tagObj) {
            console.error(import_chalk8.default.red("Error:"), `Tag "${tag}" not found`);
            process.exit(1);
          }
          title = `Emails tagged with "${tag}"`;
          const rawEmails = tag_default.findEmailsByTag(tagObj.id, {
            limit,
            offset,
            accountId,
            allAccounts
          });
          emails = rawEmails.map((email) => email_default._formatEmail(email));
          total = tag_default.countEmailsByTag(tagObj.id, accountId, allAccounts);
        } else {
          title = `Emails in ${folder}`;
          emails = email_default.findByFolder(folder, {
            limit,
            offset,
            unreadOnly,
            accountId,
            allAccounts
          });
          total = email_default.countByFolder(
            folder,
            unreadOnly,
            accountId,
            allAccounts
          );
        }
        if (accountId) {
          const account = account_default.findById(accountId);
          if (account) {
            title += ` (${account.email})`;
          }
        } else if (allAccounts) {
          title += " (All Accounts)";
        }
        const format = options.idsOnly ? "ids-only" : options.format || "markdown";
        if (threadView) {
          if (format === "ids-only" || format === "json") {
            console.log(
              import_chalk8.default.yellow(
                "Thread view is not supported with --format json or --ids-only. Use flat view."
              )
            );
            return;
          }
          const allEmails = email_default.findByFolder(folder, {
            limit: limit * 5,
            offset: 0,
            unreadOnly,
            accountId,
            allAccounts
          });
          if (allEmails.length === 0) {
            const range = calculateRange(offset, limit, total);
            const formatter = getFormatter(format);
            const meta = {
              total,
              unread: email_default.countByFolder(folder, true),
              folder: title,
              page,
              limit,
              offset,
              totalPages: Math.ceil(total / limit),
              showing: range.showing
            };
            console.log(formatter.formatList([], meta, options));
            return;
          }
          const relationships = import_analyzer2.default.analyzeRelationships(allEmails);
          const threads = builder_default.buildThreads(allEmails, relationships);
          threads.slice(0, limit).forEach((thread, index) => {
            const stats = builder_default.getThreadStats(thread);
            const threadLines = formatThreadTree(thread, { expanded: false });
            console.log(threadLines.join("\n"));
            console.log(
              import_chalk8.default.gray(
                `  ${stats.messageCount} messages, ${stats.participants.length} participants, ${stats.hasUnread ? import_chalk8.default.blue("unread") : "all read"}`
              )
            );
            console.log("");
          });
          console.log(
            import_chalk8.default.gray(
              `Showing ${Math.min(limit, threads.length)} of ${threads.length} threads (thread view)`
            )
          );
        } else {
          const formatter = getFormatter(format);
          const range = calculateRange(offset, limit, total);
          const unreadCount = options.folder ? email_default.countByFolder(folder, true) : unreadOnly ? total : email_default.countByFolder(folder, true);
          const meta = {
            total,
            unread: unreadCount,
            folder,
            page,
            limit,
            offset,
            totalPages: Math.ceil(total / limit),
            showing: range.showing
          };
          const output = formatter.formatList(emails, meta, options);
          console.log(output);
        }
        if (format === "markdown") {
          if (unreadOnly) {
            console.log(import_chalk8.default.gray("Showing unread emails only"));
          }
        }
      } catch (error2) {
        console.error(import_chalk8.default.red("Error:"), error2.message);
        logger_default.error("List command failed", { error: error2.message });
        process.exit(1);
      }
    }
    module2.exports = listCommand2;
  }
});

// src/cli/commands/notify.ts
var require_notify = __commonJS({
  "src/cli/commands/notify.ts"(exports2, module2) {
    "use strict";
    var import_chalk8 = __toESM(require("chalk"));
    var import_inquirer = __toESM(require("inquirer"));
    var import_manager6 = __toESM(require_manager3());
    init_logger();
    async function notifyCommand2(action, options = {}) {
      try {
        switch (action) {
          case "enable":
            return handleEnable();
          case "disable":
            return handleDisable();
          case "config":
            return handleConfig(options);
          case "test":
            return handleTest();
          case "status":
            return handleStatus();
          default:
            console.error(import_chalk8.default.red(`Unknown notify command: ${action}`));
            console.log(
              "Available commands: enable, disable, config, test, status"
            );
            process.exit(1);
        }
      } catch (error2) {
        console.error(import_chalk8.default.red("Error:"), error2.message);
        logger_default.error("Notify command failed", { action, error: error2.message });
        process.exit(1);
      }
    }
    function handleEnable() {
      import_manager6.default.enable();
      console.log(import_chalk8.default.green("\u2713 Notifications enabled"));
      console.log();
      console.log(
        import_chalk8.default.gray('Use "notify config" to configure notification filters')
      );
      console.log(import_chalk8.default.gray('Use "notify test" to test notifications'));
    }
    function handleDisable() {
      import_manager6.default.disable();
      console.log(import_chalk8.default.yellow("\u2713 Notifications disabled"));
    }
    async function handleConfig(options) {
      const currentConfig = import_manager6.default.getConfig();
      console.log(import_chalk8.default.blue("Current Notification Configuration:"));
      console.log();
      displayConfig(currentConfig);
      console.log();
      if (options.sender || options.tag || options.important !== void 0) {
        return handleConfigOptions(options);
      }
      const answers = await import_inquirer.default.prompt([
        {
          type: "list",
          name: "action",
          message: "What would you like to configure?",
          choices: [
            { name: "Add sender filter", value: "add-sender" },
            { name: "Remove sender filter", value: "remove-sender" },
            { name: "Add tag filter", value: "add-tag" },
            { name: "Remove tag filter", value: "remove-tag" },
            { name: "Toggle important only", value: "toggle-important" },
            { name: "Toggle sound", value: "toggle-sound" },
            { name: "Toggle desktop notifications", value: "toggle-desktop" },
            { name: "Clear all filters", value: "clear-filters" },
            { name: "Back", value: "back" }
          ]
        }
      ]);
      if (answers.action === "back") {
        return;
      }
      await handleConfigAction(answers.action, currentConfig);
    }
    function handleConfigOptions(options) {
      const filters = {};
      if (options.sender) {
        const senders = options.sender.split(",").map((s) => s.trim());
        filters.senders = senders;
        console.log(import_chalk8.default.green(`\u2713 Sender filter set: ${senders.join(", ")}`));
      }
      if (options.tag) {
        const tags = options.tag.split(",").map((t) => t.trim());
        filters.tags = tags;
        console.log(import_chalk8.default.green(`\u2713 Tag filter set: ${tags.join(", ")}`));
      }
      if (options.important !== void 0) {
        filters.importantOnly = options.important;
        console.log(import_chalk8.default.green(`\u2713 Important only: ${options.important}`));
      }
      if (Object.keys(filters).length > 0) {
        import_manager6.default.updateFilters(filters);
      }
    }
    async function handleConfigAction(action, currentConfig) {
      switch (action) {
        case "add-sender": {
          const answer = await import_inquirer.default.prompt([
            {
              type: "input",
              name: "sender",
              message: "Enter sender email or domain:",
              validate: (input) => input.trim().length > 0 || "Sender cannot be empty"
            }
          ]);
          const senders = [...currentConfig.filters.senders, answer.sender.trim()];
          import_manager6.default.updateFilters({ senders });
          console.log(import_chalk8.default.green(`\u2713 Added sender filter: ${answer.sender}`));
          break;
        }
        case "remove-sender": {
          if (currentConfig.filters.senders.length === 0) {
            console.log(import_chalk8.default.yellow("No sender filters to remove"));
            break;
          }
          const answer = await import_inquirer.default.prompt([
            {
              type: "list",
              name: "sender",
              message: "Select sender to remove:",
              choices: currentConfig.filters.senders
            }
          ]);
          const senders = currentConfig.filters.senders.filter(
            (s) => s !== answer.sender
          );
          import_manager6.default.updateFilters({ senders });
          console.log(import_chalk8.default.green(`\u2713 Removed sender filter: ${answer.sender}`));
          break;
        }
        case "add-tag": {
          const answer = await import_inquirer.default.prompt([
            {
              type: "input",
              name: "tag",
              message: "Enter tag name:",
              validate: (input) => input.trim().length > 0 || "Tag cannot be empty"
            }
          ]);
          const tags = [...currentConfig.filters.tags, answer.tag.trim()];
          import_manager6.default.updateFilters({ tags });
          console.log(import_chalk8.default.green(`\u2713 Added tag filter: ${answer.tag}`));
          break;
        }
        case "remove-tag": {
          if (currentConfig.filters.tags.length === 0) {
            console.log(import_chalk8.default.yellow("No tag filters to remove"));
            break;
          }
          const answer = await import_inquirer.default.prompt([
            {
              type: "list",
              name: "tag",
              message: "Select tag to remove:",
              choices: currentConfig.filters.tags
            }
          ]);
          const tags = currentConfig.filters.tags.filter((t) => t !== answer.tag);
          import_manager6.default.updateFilters({ tags });
          console.log(import_chalk8.default.green(`\u2713 Removed tag filter: ${answer.tag}`));
          break;
        }
        case "toggle-important": {
          const importantOnly = !currentConfig.filters.importantOnly;
          import_manager6.default.updateFilters({ importantOnly });
          console.log(
            import_chalk8.default.green(
              `\u2713 Important only: ${importantOnly ? "enabled" : "disabled"}`
            )
          );
          break;
        }
        case "toggle-sound": {
          const sound = !currentConfig.sound;
          import_manager6.default.updateSettings({ sound });
          console.log(import_chalk8.default.green(`\u2713 Sound: ${sound ? "enabled" : "disabled"}`));
          break;
        }
        case "toggle-desktop": {
          const desktop = !currentConfig.desktop;
          import_manager6.default.updateSettings({ desktop });
          console.log(
            import_chalk8.default.green(
              `\u2713 Desktop notifications: ${desktop ? "enabled" : "disabled"}`
            )
          );
          break;
        }
        case "clear-filters": {
          import_manager6.default.updateFilters({
            senders: [],
            tags: [],
            importantOnly: false
          });
          console.log(import_chalk8.default.green("\u2713 All filters cleared"));
          break;
        }
      }
    }
    async function handleTest() {
      console.log(import_chalk8.default.blue("Sending test notification..."));
      try {
        await import_manager6.default.test();
        console.log(import_chalk8.default.green("\u2713 Test notification sent"));
        console.log();
        console.log(import_chalk8.default.gray("Check your system notifications"));
      } catch (error2) {
        console.error(import_chalk8.default.red("\u2717 Failed to send test notification"));
        console.error(import_chalk8.default.red("Error:"), error2.message);
        console.log();
        console.log(
          import_chalk8.default.yellow(
            "Note: Desktop notifications may not work in all environments"
          )
        );
      }
    }
    function handleStatus() {
      const config = import_manager6.default.getConfig();
      const stats = import_manager6.default.getFilterStats();
      console.log(import_chalk8.default.blue("Notification Status:"));
      console.log();
      if (config.enabled) {
        console.log(import_chalk8.default.green("\u2713 Enabled"));
      } else {
        console.log(import_chalk8.default.yellow("\u2717 Disabled"));
      }
      console.log();
      console.log(import_chalk8.default.blue("Settings:"));
      console.log(
        import_chalk8.default.gray(
          `  Desktop notifications: ${config.desktop ? "enabled" : "disabled"}`
        )
      );
      console.log(import_chalk8.default.gray(`  Sound: ${config.sound ? "enabled" : "disabled"}`));
      console.log();
      console.log(import_chalk8.default.blue("Filters:"));
      console.log(import_chalk8.default.gray(`  Sender filters: ${stats.senderCount}`));
      console.log(import_chalk8.default.gray(`  Tag filters: ${stats.tagCount}`));
      console.log(
        import_chalk8.default.gray(`  Important only: ${stats.importantOnly ? "yes" : "no"}`)
      );
      if (config.filters.senders.length > 0) {
        console.log();
        console.log(import_chalk8.default.blue("Sender Filters:"));
        config.filters.senders.forEach((sender) => {
          console.log(import_chalk8.default.gray(`  - ${sender}`));
        });
      }
      if (config.filters.tags.length > 0) {
        console.log();
        console.log(import_chalk8.default.blue("Tag Filters:"));
        config.filters.tags.forEach((tag) => {
          console.log(import_chalk8.default.gray(`  - ${tag}`));
        });
      }
    }
    function displayConfig(config) {
      console.log(
        import_chalk8.default.gray(`  Status: ${config.enabled ? "enabled" : "disabled"}`)
      );
      console.log(
        import_chalk8.default.gray(`  Desktop: ${config.desktop ? "enabled" : "disabled"}`)
      );
      console.log(import_chalk8.default.gray(`  Sound: ${config.sound ? "enabled" : "disabled"}`));
      console.log(
        import_chalk8.default.gray(
          `  Important only: ${config.filters.importantOnly ? "yes" : "no"}`
        )
      );
      console.log(import_chalk8.default.gray(`  Sender filters: ${config.filters.senders.length}`));
      console.log(import_chalk8.default.gray(`  Tag filters: ${config.filters.tags.length}`));
    }
    module2.exports = notifyCommand2;
  }
});

// src/cli/commands/read.ts
var require_read = __commonJS({
  "src/cli/commands/read.ts"(exports2, module2) {
    "use strict";
    var import_chalk8 = __toESM(require("chalk"));
    var import_ora3 = __toESM(require("ora"));
    init_config();
    init_client();
    init_attachment();
    init_email();
    init_logger();
    init_formatters();
    async function readCommand2(emailId, options) {
      try {
        if (!emailId) {
          console.error(import_chalk8.default.red("Error: Email ID is required"));
          console.log("Usage: mail-cli read <id>");
          process.exit(1);
        }
        const email = email_default.findById(emailId);
        if (!email) {
          console.error(import_chalk8.default.red(`Email with ID ${emailId} not found`));
          process.exit(1);
        }
        if (!email.bodyText && !email.bodyHtml) {
          const spinner = (0, import_ora3.default)("Fetching email body from server...").start();
          try {
            const cfg = config_default.load();
            if (!cfg.imap.host || !cfg.imap.user || !cfg.imap.password) {
              spinner.warn(
                "IMAP configuration incomplete. Showing email without body."
              );
            } else {
              const imapClient = new client_default(cfg.imap);
              await imapClient.connect();
              await imapClient.openFolder(email.folder, true);
              const bodyData = await imapClient.fetchEmailBody(email.uid);
              email_default.updateBody(emailId, {
                bodyText: bodyData.bodyText,
                bodyHtml: bodyData.bodyHtml
              });
              email.bodyText = bodyData.bodyText;
              email.bodyHtml = bodyData.bodyHtml;
              imapClient.disconnect();
              spinner.succeed("Email body fetched from server");
            }
          } catch (error2) {
            spinner.fail("Failed to fetch email body from server");
            logger_default.error("Failed to fetch email body", {
              emailId,
              error: error2.message
            });
            console.log(import_chalk8.default.yellow("Showing email without body content"));
          }
        }
        const attachments = email.hasAttachments ? attachment_default.findByEmailId(emailId) : [];
        const format = options.format || "markdown";
        const formatter = getFormatter(format);
        const emailWithAttachments = { ...email, attachments };
        const output = formatter.formatDetail(emailWithAttachments, options);
        if (format !== "ids-only") {
          console.log();
        }
        console.log(output);
        if (format === "markdown") {
          console.log();
        }
        if (!email.isRead) {
          email_default.markAsRead(emailId);
          if (format === "markdown") {
            console.log(import_chalk8.default.gray("(Marked as read)"));
          }
        }
      } catch (error2) {
        console.error(import_chalk8.default.red("Error:"), error2.message);
        logger_default.error("Read command failed", { emailId, error: error2.message });
        process.exit(1);
      }
    }
    module2.exports = readCommand2;
  }
});

// src/cli/commands/reply.ts
var require_reply = __commonJS({
  "src/cli/commands/reply.ts"(exports2, module2) {
    "use strict";
    var import_chalk8 = __toESM(require("chalk"));
    var import_inquirer = __toESM(require("inquirer"));
    var import_ora3 = __toESM(require("ora"));
    init_config();
    init_client2();
    init_composer();
    init_email();
    init_logger();
    async function replyCommand2(emailId, options) {
      try {
        const cfg = config_default.load();
        if (!cfg.smtp.host || !cfg.smtp.user || !cfg.smtp.password) {
          console.error(
            import_chalk8.default.red("SMTP configuration incomplete. Please run: mail-cli config")
          );
          process.exit(1);
        }
        const originalEmail = email_default.findById(emailId);
        if (!originalEmail) {
          console.error(import_chalk8.default.red(`Email with ID ${emailId} not found`));
          process.exit(1);
        }
        console.log(import_chalk8.default.bold.cyan("Replying to:"));
        console.log(import_chalk8.default.gray(`From: ${originalEmail.from}`));
        console.log(import_chalk8.default.gray(`Subject: ${originalEmail.subject}`));
        console.log(import_chalk8.default.gray(`Date: ${originalEmail.date}`));
        console.log();
        const composer = new composer_default();
        if (options.all) {
          const allRecipients = composer.getAllRecipients(
            originalEmail,
            cfg.smtp.user
          );
          if (allRecipients.length === 0) {
            console.error(import_chalk8.default.red("No recipients found for reply-all"));
            process.exit(1);
          }
          composer.setTo(allRecipients);
          console.log(import_chalk8.default.gray(`Reply to all: ${allRecipients.join(", ")}`));
        } else {
          composer.setTo([originalEmail.from]);
          console.log(import_chalk8.default.gray(`Reply to: ${originalEmail.from}`));
        }
        let subject = originalEmail.subject;
        if (!subject.toLowerCase().startsWith("re:")) {
          subject = `Re: ${subject}`;
        }
        composer.setSubject(subject);
        if (originalEmail.messageId) {
          composer.setInReplyTo(originalEmail.messageId);
        }
        composer.setReferences(composer.buildReferences(originalEmail));
        let replyBody;
        if (options.body) {
          replyBody = options.body;
        } else if (options.editor) {
          const answers = await import_inquirer.default.prompt([
            {
              type: "editor",
              name: "body",
              message: "Reply body (opens editor):",
              validate: (input) => input.trim() ? true : "Reply body is required"
            }
          ]);
          replyBody = answers.body;
        } else {
          const answers = await import_inquirer.default.prompt([
            {
              type: "input",
              name: "body",
              message: "Reply body:",
              validate: (input) => input.trim() ? true : "Reply body is required"
            }
          ]);
          replyBody = answers.body;
        }
        const quotedBody = composer.quoteOriginalEmail(originalEmail);
        const fullBody = replyBody + "\n\n" + quotedBody;
        composer.setBody(fullBody);
        if (!options.body) {
          const { confirm } = await import_inquirer.default.prompt([
            {
              type: "confirm",
              name: "confirm",
              message: "Send this reply?",
              default: true
            }
          ]);
          if (!confirm) {
            console.log(import_chalk8.default.yellow("Reply cancelled."));
            process.exit(0);
          }
        }
        const spinner = (0, import_ora3.default)("Sending reply...").start();
        const smtpClient = new client_default2(cfg.smtp);
        const emailData = composer.compose();
        const result = await smtpClient.sendEmail(emailData);
        spinner.succeed("Reply sent successfully!");
        console.log(import_chalk8.default.gray(`Message ID: ${result.messageId}`));
        smtpClient.disconnect();
      } catch (error2) {
        console.error(import_chalk8.default.red("Error:"), error2.message);
        logger_default.error("Reply command failed", { error: error2.message });
        process.exit(1);
      }
    }
    module2.exports = replyCommand2;
  }
});

// src/storage/models/saved-search.ts
function getErrorMessage13(error2) {
  return error2 instanceof Error ? error2.message : String(error2);
}
function toNumber9(value) {
  return typeof value === "bigint" ? Number(value) : value;
}
var SavedSearchModel, savedSearchModel, saved_search_default;
var init_saved_search = __esm({
  "src/storage/models/saved-search.ts"() {
    "use strict";
    init_errors();
    init_logger();
    init_database();
    SavedSearchModel = class {
      db;
      constructor() {
        this.db = null;
      }
      getDb() {
        if (!this.db) {
          this.db = database_default.getDb();
        }
        return this.db;
      }
      create(searchData) {
        try {
          const db = this.getDb();
          const stmt = db.prepare(`
        INSERT INTO saved_searches (name, query, description, account_id)
        VALUES (?, ?, ?, ?)
      `);
          const result = stmt.run(
            searchData.name,
            JSON.stringify(searchData.query),
            searchData.description ?? null,
            searchData.accountId ?? null
          );
          const insertId = toNumber9(result.lastInsertRowid);
          logger_default.debug("Saved search created", { id: insertId });
          return insertId;
        } catch (error2) {
          const errorMessage = getErrorMessage13(error2);
          logger_default.error("Failed to create saved search", { error: errorMessage });
          throw new StorageError(`Failed to create saved search: ${errorMessage}`);
        }
      }
      findById(id) {
        try {
          const db = this.getDb();
          const stmt = db.prepare(
            "SELECT * FROM saved_searches WHERE id = ?"
          );
          return stmt.get(id) ?? null;
        } catch (error2) {
          const errorMessage = getErrorMessage13(error2);
          logger_default.error("Failed to find saved search by ID", {
            id,
            error: errorMessage
          });
          throw new StorageError(`Failed to find saved search: ${errorMessage}`);
        }
      }
      findByName(name) {
        try {
          const db = this.getDb();
          const stmt = db.prepare(
            "SELECT * FROM saved_searches WHERE name = ?"
          );
          return stmt.get(name) ?? null;
        } catch (error2) {
          const errorMessage = getErrorMessage13(error2);
          logger_default.error("Failed to find saved search by name", {
            name,
            error: errorMessage
          });
          throw new StorageError(`Failed to find saved search: ${errorMessage}`);
        }
      }
      findAll(accountId = null) {
        try {
          const db = this.getDb();
          let query = "SELECT * FROM saved_searches";
          const params = [];
          if (accountId !== null) {
            query += " WHERE account_id = ?";
            params.push(accountId);
          }
          query += " ORDER BY name ASC";
          const stmt = db.prepare(query);
          return stmt.all(...params);
        } catch (error2) {
          const errorMessage = getErrorMessage13(error2);
          logger_default.error("Failed to find saved searches", { error: errorMessage });
          throw new StorageError(`Failed to find saved searches: ${errorMessage}`);
        }
      }
      update(id, data) {
        try {
          const db = this.getDb();
          const fields = [];
          const params = [];
          if (data.name !== void 0) {
            fields.push("name = ?");
            params.push(data.name);
          }
          if (data.query !== void 0) {
            fields.push("query = ?");
            params.push(JSON.stringify(data.query));
          }
          if (data.description !== void 0) {
            fields.push("description = ?");
            params.push(data.description);
          }
          if (fields.length === 0) {
            return false;
          }
          fields.push("updated_at = CURRENT_TIMESTAMP");
          params.push(id);
          const sql = `UPDATE saved_searches SET ${fields.join(", ")} WHERE id = ?`;
          const stmt = db.prepare(sql);
          const result = stmt.run(...params);
          logger_default.debug("Saved search updated", { id, changes: result.changes });
          return result.changes > 0;
        } catch (error2) {
          const errorMessage = getErrorMessage13(error2);
          logger_default.error("Failed to update saved search", {
            id,
            error: errorMessage
          });
          throw new StorageError(`Failed to update saved search: ${errorMessage}`);
        }
      }
      delete(id) {
        try {
          const db = this.getDb();
          const stmt = db.prepare("DELETE FROM saved_searches WHERE id = ?");
          const result = stmt.run(id);
          logger_default.debug("Saved search deleted", { id, changes: result.changes });
          return result.changes > 0;
        } catch (error2) {
          const errorMessage = getErrorMessage13(error2);
          logger_default.error("Failed to delete saved search", {
            id,
            error: errorMessage
          });
          throw new StorageError(`Failed to delete saved search: ${errorMessage}`);
        }
      }
      count(accountId = null) {
        try {
          const db = this.getDb();
          let query = "SELECT COUNT(*) as count FROM saved_searches";
          const params = [];
          if (accountId !== null) {
            query += " WHERE account_id = ?";
            params.push(accountId);
          }
          const stmt = db.prepare(query);
          const result = stmt.get(...params);
          return result?.count ?? 0;
        } catch (error2) {
          const errorMessage = getErrorMessage13(error2);
          logger_default.error("Failed to count saved searches", { error: errorMessage });
          throw new StorageError(`Failed to count saved searches: ${errorMessage}`);
        }
      }
    };
    savedSearchModel = new SavedSearchModel();
    saved_search_default = savedSearchModel;
  }
});

// src/cli/commands/search.ts
var require_search = __commonJS({
  "src/cli/commands/search.ts"(exports2, module2) {
    "use strict";
    var import_chalk8 = __toESM(require("chalk"));
    init_email();
    init_saved_search();
    init_logger();
    init_formatters();
    init_pagination();
    function searchCommand2(action, options) {
      try {
        if (action === "save") {
          return saveSearch(options);
        } else if (action === "load") {
          return loadSearch(options);
        } else if (action === "list-saved") {
          return listSavedSearches();
        } else if (action === "delete-saved") {
          return deleteSavedSearch(options);
        }
        const keyword = action;
        const query = buildSearchQuery(keyword, options);
        if (Object.keys(query).length === 0 || Object.keys(query).length === 1 && query.limit) {
          console.error(import_chalk8.default.red("Error: Please provide search criteria"));
          console.log("Usage: mail-cli search <keyword> [options]");
          console.log();
          console.log("Options:");
          console.log("  --from <email>        Search by sender");
          console.log("  --to <email>          Search by recipient");
          console.log("  --cc <email>          Search by CC");
          console.log("  --subject <text>      Search by subject");
          console.log("  --folder <name>       Search in specific folder");
          console.log("  --date <date>         Search from date (YYYY-MM-DD)");
          console.log("  --date-to <date>      Search to date (YYYY-MM-DD)");
          console.log("  --starred             Search starred emails");
          console.log("  --flagged             Search flagged emails");
          console.log("  --unread              Search unread emails");
          console.log("  --has-attachment      Search emails with attachments");
          console.log("  --no-attachment       Search emails without attachments");
          console.log("  --tag <name>          Search by tag");
          console.log("  --limit <number>      Limit results (default: 100)");
          console.log();
          console.log("Saved searches:");
          console.log("  search save --name <name>    Save current search");
          console.log("  search load --name <name>    Load saved search");
          console.log("  search list-saved            List saved searches");
          console.log("  search delete-saved --name <name>  Delete saved search");
          process.exit(1);
        }
        console.log(import_chalk8.default.bold.cyan("Search Criteria:"));
        displaySearchCriteria(query);
        console.log();
        console.log(import_chalk8.default.bold.cyan("Search Results:"));
        console.log();
        const { limit, offset, page } = parsePagination(options);
        query.limit = limit;
        query.offset = offset;
        const emails = email_default.search(query);
        if (emails.length === 0) {
          const range2 = calculateRange(offset, limit, 0);
          const format2 = options.idsOnly ? "ids-only" : options.format || "markdown";
          const formatter2 = getFormatter(format2);
          const meta2 = {
            total: 0,
            unread: 0,
            page,
            limit,
            offset,
            totalPages: 0,
            showing: range2.showing
          };
          console.log(formatter2.formatList(emails, meta2, options));
          return;
        }
        const format = options.idsOnly ? "ids-only" : options.format || "markdown";
        if (format !== "ids-only") {
          console.log(import_chalk8.default.bold.cyan("Search Results:"));
          console.log();
        }
        const range = calculateRange(offset, limit, emails.length);
        const formatter = getFormatter(format);
        const meta = {
          total: emails.length,
          unread: emails.filter((e) => !e.isRead).length,
          page,
          limit,
          offset,
          totalPages: page,
          showing: range.showing
        };
        const output = formatter.formatList(emails, meta, options);
        console.log(output);
        if (format === "markdown") {
          console.log();
          console.log(import_chalk8.default.gray(`Found ${emails.length} email(s)`));
        }
        global.lastSearchQuery = query;
      } catch (error2) {
        console.error(import_chalk8.default.red("Error:"), error2.message);
        logger_default.error("Search command failed", { error: error2.message });
        process.exit(1);
      }
    }
    function buildSearchQuery(keyword, options) {
      const query = {};
      if (keyword && keyword !== "save" && keyword !== "load" && keyword !== "list-saved" && keyword !== "delete-saved") {
        query.keyword = keyword;
      }
      if (options.from) query.from = options.from;
      if (options.to) query.to = options.to;
      if (options.cc) query.cc = options.cc;
      if (options.subject) query.subject = options.subject;
      if (options.folder) query.folder = options.folder;
      if (options.date) query.dateFrom = options.date;
      if (options.dateTo) query.dateTo = options.dateTo;
      if (options.starred) query.starred = true;
      if (options.flagged) query.flagged = true;
      if (options.unread) query.unread = true;
      if (options.hasAttachment) query.hasAttachment = true;
      if (options.noAttachment) query.noAttachment = true;
      if (options.tag) query.tag = options.tag;
      if (options.limit) query.limit = parseInt(options.limit);
      return query;
    }
    function displaySearchCriteria(query) {
      const criteria = [];
      if (query.keyword) criteria.push(`Keyword: "${query.keyword}"`);
      if (query.from) criteria.push(`From: ${query.from}`);
      if (query.to) criteria.push(`To: ${query.to}`);
      if (query.cc) criteria.push(`CC: ${query.cc}`);
      if (query.subject) criteria.push(`Subject: ${query.subject}`);
      if (query.folder) criteria.push(`Folder: ${query.folder}`);
      if (query.dateFrom) criteria.push(`From date: ${query.dateFrom}`);
      if (query.dateTo) criteria.push(`To date: ${query.dateTo}`);
      if (query.starred) criteria.push("Starred: Yes");
      if (query.flagged) criteria.push("Flagged: Yes");
      if (query.unread) criteria.push("Unread: Yes");
      if (query.hasAttachment) criteria.push("Has attachment: Yes");
      if (query.noAttachment) criteria.push("Has attachment: No");
      if (query.tag) criteria.push(`Tag: ${query.tag}`);
      if (query.limit) criteria.push(`Limit: ${query.limit}`);
      criteria.forEach((c) => console.log(import_chalk8.default.gray(`  ${c}`)));
    }
    function saveSearch(options) {
      if (!options.name) {
        console.error(import_chalk8.default.red("Error: Search name is required"));
        console.log("Usage: search save --name <name>");
        process.exit(1);
      }
      if (!global.lastSearchQuery) {
        console.error(import_chalk8.default.red("Error: No search to save. Run a search first."));
        process.exit(1);
      }
      try {
        const searchId = saved_search_default.create({
          name: options.name,
          query: global.lastSearchQuery,
          description: options.description || ""
        });
        console.log(
          import_chalk8.default.green("\u2713"),
          `Search "${options.name}" saved successfully`
        );
        console.log(import_chalk8.default.gray(`  ID: ${searchId}`));
      } catch (error2) {
        console.error(import_chalk8.default.red("Error:"), error2.message);
        process.exit(1);
      }
    }
    function loadSearch(options) {
      if (!options.name) {
        console.error(import_chalk8.default.red("Error: Search name is required"));
        console.log("Usage: search load --name <name>");
        process.exit(1);
      }
      try {
        const savedSearch = saved_search_default.findByName(options.name);
        if (!savedSearch) {
          console.error(
            import_chalk8.default.red("Error:"),
            `Saved search "${options.name}" not found`
          );
          process.exit(1);
        }
        console.log(import_chalk8.default.bold.cyan(`Loading saved search: "${savedSearch.name}"`));
        if (savedSearch.description) {
          console.log(import_chalk8.default.gray(`  ${savedSearch.description}`));
        }
        console.log();
        const query = JSON.parse(savedSearch.query);
        console.log(import_chalk8.default.bold.cyan("Search Criteria:"));
        displaySearchCriteria(query);
        console.log();
        console.log(import_chalk8.default.bold.cyan("Search Results:"));
        console.log();
        const { limit, offset, page } = parsePagination(options);
        query.limit = limit;
        query.offset = offset;
        const emails = email_default.search(query);
        if (emails.length === 0) {
          const range2 = calculateRange(offset, limit, 0);
          const format2 = options.idsOnly ? "ids-only" : options.format || "markdown";
          const formatter2 = getFormatter(format2);
          const meta2 = {
            total: 0,
            unread: 0,
            page,
            limit,
            offset,
            totalPages: 0,
            showing: range2.showing
          };
          console.log(formatter2.formatList(emails, meta2, options));
          return;
        }
        const format = options.idsOnly ? "ids-only" : options.format || "markdown";
        const range = calculateRange(offset, limit, emails.length);
        const formatter = getFormatter(format);
        const meta = {
          total: emails.length,
          unread: emails.filter((e) => !e.isRead).length,
          page,
          limit,
          offset,
          totalPages: page,
          showing: range.showing
        };
        console.log(formatter.formatList(emails, meta, options));
        global.lastSearchQuery = query;
      } catch (error2) {
        console.error(import_chalk8.default.red("Error:"), error2.message);
        process.exit(1);
      }
    }
    function listSavedSearches() {
      try {
        const searches = saved_search_default.findAll();
        if (searches.length === 0) {
          console.log(import_chalk8.default.yellow("No saved searches found."));
          return;
        }
        console.log(import_chalk8.default.bold.cyan("Saved Searches:"));
        console.log();
        searches.forEach((search) => {
          console.log(import_chalk8.default.bold(search.name));
          console.log(import_chalk8.default.gray(`  ID: ${search.id}`));
          if (search.description) {
            console.log(import_chalk8.default.gray(`  ${search.description}`));
          }
          const query = JSON.parse(search.query);
          const criteriaCount = Object.keys(query).length;
          console.log(import_chalk8.default.gray(`  Criteria: ${criteriaCount} condition(s)`));
          console.log(
            import_chalk8.default.gray(`  Created: ${new Date(search.created_at).toLocaleString()}`)
          );
          console.log();
        });
        console.log(import_chalk8.default.gray(`Total: ${searches.length} saved search(es)`));
      } catch (error2) {
        console.error(import_chalk8.default.red("Error:"), error2.message);
        process.exit(1);
      }
    }
    function deleteSavedSearch(options) {
      if (!options.name) {
        console.error(import_chalk8.default.red("Error: Search name is required"));
        console.log("Usage: search delete-saved --name <name>");
        process.exit(1);
      }
      try {
        const savedSearch = saved_search_default.findByName(options.name);
        if (!savedSearch) {
          console.error(
            import_chalk8.default.red("Error:"),
            `Saved search "${options.name}" not found`
          );
          process.exit(1);
        }
        saved_search_default.delete(savedSearch.id);
        console.log(
          import_chalk8.default.green("\u2713"),
          `Saved search "${options.name}" deleted successfully`
        );
      } catch (error2) {
        console.error(import_chalk8.default.red("Error:"), error2.message);
        process.exit(1);
      }
    }
    module2.exports = searchCommand2;
  }
});

// src/storage/models/signature.ts
function getErrorMessage14(error2) {
  return error2 instanceof Error ? error2.message : String(error2);
}
function toNumber10(value) {
  return typeof value === "bigint" ? Number(value) : value;
}
var SignatureModel, signatureModel, signature_default;
var init_signature = __esm({
  "src/storage/models/signature.ts"() {
    "use strict";
    init_errors();
    init_logger();
    init_database();
    SignatureModel = class {
      db;
      constructor() {
        this.db = null;
      }
      getDb() {
        if (!this.db) {
          this.db = database_default.getDb();
        }
        return this.db;
      }
      create(signatureData) {
        try {
          const db = this.getDb();
          if (signatureData.isDefault && signatureData.accountEmail) {
            this.unsetDefaultForAccount(signatureData.accountEmail);
          }
          const stmt = db.prepare(`
        INSERT INTO signatures (
          name, content_text, content_html, is_default, account_email
        ) VALUES (?, ?, ?, ?, ?)
      `);
          const result = stmt.run(
            signatureData.name,
            signatureData.contentText ?? null,
            signatureData.contentHtml ?? null,
            signatureData.isDefault ? 1 : 0,
            signatureData.accountEmail ?? null
          );
          const insertId = toNumber10(result.lastInsertRowid);
          logger_default.debug("Signature created", { id: insertId });
          return insertId;
        } catch (error2) {
          const errorMessage = getErrorMessage14(error2);
          logger_default.error("Failed to create signature", { error: errorMessage });
          throw new StorageError(`Failed to create signature: ${errorMessage}`);
        }
      }
      findById(id) {
        try {
          const db = this.getDb();
          const stmt = db.prepare(
            "SELECT * FROM signatures WHERE id = ?"
          );
          const signature = stmt.get(id);
          return signature ? this.formatSignature(signature) : null;
        } catch (error2) {
          const errorMessage = getErrorMessage14(error2);
          logger_default.error("Failed to find signature by ID", {
            id,
            error: errorMessage
          });
          throw new StorageError(`Failed to find signature: ${errorMessage}`);
        }
      }
      findAll(accountEmail = null) {
        try {
          const db = this.getDb();
          let query = "SELECT * FROM signatures";
          const params = [];
          if (accountEmail) {
            query += " WHERE account_email = ? OR account_email IS NULL";
            params.push(accountEmail);
          }
          query += " ORDER BY is_default DESC, created_at DESC";
          const stmt = db.prepare(query);
          const signatures = stmt.all(...params);
          return signatures.map((signature) => this.formatSignature(signature));
        } catch (error2) {
          const errorMessage = getErrorMessage14(error2);
          logger_default.error("Failed to find signatures", { error: errorMessage });
          throw new StorageError(`Failed to find signatures: ${errorMessage}`);
        }
      }
      findDefault(accountEmail = null) {
        try {
          const db = this.getDb();
          let query = "SELECT * FROM signatures WHERE is_default = 1";
          const params = [];
          if (accountEmail) {
            query += " AND (account_email = ? OR account_email IS NULL)";
            params.push(accountEmail);
          }
          query += " ORDER BY account_email DESC LIMIT 1";
          const stmt = db.prepare(query);
          const signature = stmt.get(...params);
          return signature ? this.formatSignature(signature) : null;
        } catch (error2) {
          const errorMessage = getErrorMessage14(error2);
          logger_default.error("Failed to find default signature", { error: errorMessage });
          throw new StorageError(
            `Failed to find default signature: ${errorMessage}`
          );
        }
      }
      update(id, data) {
        try {
          const db = this.getDb();
          const fields = [];
          const params = [];
          if (data.name !== void 0) {
            fields.push("name = ?");
            params.push(data.name);
          }
          if (data.contentText !== void 0) {
            fields.push("content_text = ?");
            params.push(data.contentText);
          }
          if (data.contentHtml !== void 0) {
            fields.push("content_html = ?");
            params.push(data.contentHtml);
          }
          if (data.isDefault !== void 0) {
            fields.push("is_default = ?");
            params.push(data.isDefault ? 1 : 0);
            if (data.isDefault) {
              const signature = this.findById(id);
              if (signature?.accountEmail) {
                this.unsetDefaultForAccount(signature.accountEmail, id);
              }
            }
          }
          if (data.accountEmail !== void 0) {
            fields.push("account_email = ?");
            params.push(data.accountEmail);
          }
          if (fields.length === 0) {
            return false;
          }
          fields.push("updated_at = CURRENT_TIMESTAMP");
          params.push(id);
          const sql = `UPDATE signatures SET ${fields.join(", ")} WHERE id = ?`;
          const stmt = db.prepare(sql);
          const result = stmt.run(...params);
          logger_default.debug("Signature updated", { id, changes: result.changes });
          return result.changes > 0;
        } catch (error2) {
          const errorMessage = getErrorMessage14(error2);
          logger_default.error("Failed to update signature", { id, error: errorMessage });
          throw new StorageError(`Failed to update signature: ${errorMessage}`);
        }
      }
      setAsDefault(id) {
        const signature = this.findById(id);
        if (!signature) {
          throw new StorageError("Signature not found");
        }
        if (signature.accountEmail) {
          this.unsetDefaultForAccount(signature.accountEmail, id);
        }
        return this.update(id, { isDefault: true });
      }
      unsetDefaultForAccount(accountEmail, exceptId = null) {
        try {
          const db = this.getDb();
          let query = "UPDATE signatures SET is_default = 0 WHERE account_email = ?";
          const params = [accountEmail];
          if (exceptId) {
            query += " AND id != ?";
            params.push(exceptId);
          }
          const stmt = db.prepare(query);
          stmt.run(...params);
        } catch (error2) {
          const errorMessage = getErrorMessage14(error2);
          logger_default.error("Failed to unset default signatures", {
            error: errorMessage
          });
          throw new StorageError(
            `Failed to unset default signatures: ${errorMessage}`
          );
        }
      }
      delete(id) {
        try {
          const db = this.getDb();
          const stmt = db.prepare("DELETE FROM signatures WHERE id = ?");
          const result = stmt.run(id);
          logger_default.debug("Signature deleted", { id, changes: result.changes });
          return result.changes > 0;
        } catch (error2) {
          const errorMessage = getErrorMessage14(error2);
          logger_default.error("Failed to delete signature", { id, error: errorMessage });
          throw new StorageError(`Failed to delete signature: ${errorMessage}`);
        }
      }
      formatSignature(signature) {
        return {
          id: signature.id,
          name: signature.name,
          contentText: signature.content_text,
          contentHtml: signature.content_html,
          isDefault: signature.is_default === 1,
          accountEmail: signature.account_email,
          createdAt: signature.created_at,
          updatedAt: signature.updated_at
        };
      }
    };
    signatureModel = new SignatureModel();
    signature_default = signatureModel;
  }
});

// src/signatures/manager.ts
var require_manager5 = __commonJS({
  "src/signatures/manager.ts"(exports2, module2) {
    "use strict";
    init_signature();
    init_logger();
    var SignatureManager = class {
      /**
       * Create a new signature
       */
      async create(options) {
        const {
          name,
          text,
          html,
          isDefault = false,
          accountEmail = null
        } = options;
        if (!name) {
          throw new Error("Signature name is required");
        }
        if (!text && !html) {
          throw new Error("Signature content (text or html) is required");
        }
        const signatureData = {
          name,
          contentText: text,
          contentHtml: html,
          isDefault,
          accountEmail
        };
        const id = signature_default.create(signatureData);
        logger_default.info("Signature created", { id, name });
        return id;
      }
      /**
       * Get signature by ID
       */
      async getById(id) {
        return signature_default.findById(id);
      }
      /**
       * Get all signatures
       */
      async getAll(accountEmail = null) {
        return signature_default.findAll(accountEmail);
      }
      /**
       * Get default signature for an account
       */
      async getDefault(accountEmail = null) {
        return signature_default.findDefault(accountEmail);
      }
      /**
       * Update signature
       */
      async update(id, options) {
        const signature = signature_default.findById(id);
        if (!signature) {
          throw new Error(`Signature not found: ${id}`);
        }
        const updateData = {};
        if (options.name !== void 0) {
          updateData.name = options.name;
        }
        if (options.text !== void 0) {
          updateData.contentText = options.text;
        }
        if (options.html !== void 0) {
          updateData.contentHtml = options.html;
        }
        if (options.isDefault !== void 0) {
          updateData.isDefault = options.isDefault;
        }
        if (options.accountEmail !== void 0) {
          updateData.accountEmail = options.accountEmail;
        }
        const updated = signature_default.update(id, updateData);
        if (updated) {
          logger_default.info("Signature updated", { id });
        }
        return updated;
      }
      /**
       * Set signature as default
       */
      async setDefault(id) {
        const result = signature_default.setAsDefault(id);
        logger_default.info("Signature set as default", { id });
        return result;
      }
      /**
       * Delete signature
       */
      async delete(id) {
        const signature = signature_default.findById(id);
        if (!signature) {
          throw new Error(`Signature not found: ${id}`);
        }
        const deleted = signature_default.delete(id);
        if (deleted) {
          logger_default.info("Signature deleted", { id, name: signature.name });
        }
        return deleted;
      }
      /**
       * Process signature template variables
       */
      processTemplate(signature, variables = {}) {
        const defaultVars = {
          name: variables.name || "",
          email: variables.email || "",
          date: (/* @__PURE__ */ new Date()).toLocaleDateString(),
          time: (/* @__PURE__ */ new Date()).toLocaleTimeString()
        };
        const allVars = { ...defaultVars, ...variables };
        let processedText = signature.contentText || "";
        let processedHtml = signature.contentHtml || "";
        Object.keys(allVars).forEach((key) => {
          const regex = new RegExp(`\\{\\{${key}\\}\\}`, "g");
          processedText = processedText.replace(regex, allVars[key]);
          processedHtml = processedHtml.replace(regex, allVars[key]);
        });
        return {
          text: processedText,
          html: processedHtml
        };
      }
      /**
       * Get signature for email composition
       * Returns processed signature with template variables replaced
       */
      async getForEmail(accountEmail = null, variables = {}) {
        const signature = await this.getDefault(accountEmail);
        if (!signature) {
          return null;
        }
        return this.processTemplate(signature, variables);
      }
    };
    module2.exports = new SignatureManager();
  }
});

// src/cli/commands/send.ts
var require_send = __commonJS({
  "src/cli/commands/send.ts"(exports2, module2) {
    "use strict";
    var import_chalk8 = __toESM(require("chalk"));
    var import_inquirer = __toESM(require("inquirer"));
    var import_ora3 = __toESM(require("ora"));
    init_config();
    var import_manager6 = __toESM(require_manager2());
    var import_manager7 = __toESM(require_manager5());
    init_client2();
    init_composer();
    init_logger();
    async function sendCommand2(options) {
      try {
        const cfg = config_default.load();
        if (!cfg.smtp.host || !cfg.smtp.user || !cfg.smtp.password) {
          console.error(
            import_chalk8.default.red("SMTP configuration incomplete. Please run: mail-cli config")
          );
          process.exit(1);
        }
        let emailData;
        if (options.to && options.subject && options.body) {
          const composer = new composer_default();
          composer.setTo(options.to.split(",").map((e) => e.trim())).setSubject(options.subject).setBody(options.body);
          if (options.cc) {
            composer.setCc(options.cc.split(",").map((e) => e.trim()));
          }
          try {
            const signature = await import_manager7.default.getForEmail(cfg.smtp.user, {
              name: cfg.smtp.user.split("@")[0],
              email: cfg.smtp.user
            });
            if (signature) {
              composer.addSignature(signature);
            }
          } catch (error2) {
            logger_default.debug("Could not add signature", { error: error2.message });
          }
          emailData = composer.compose();
        } else {
          emailData = await interactiveSend();
        }
        const spinner = (0, import_ora3.default)("Sending email...").start();
        const smtpClient = new client_default2(cfg.smtp);
        const result = await smtpClient.sendEmail(emailData);
        spinner.succeed("Email sent successfully!");
        console.log(import_chalk8.default.gray(`Message ID: ${result.messageId}`));
        try {
          const recipients = [
            ...emailData.to || [],
            ...emailData.cc || [],
            ...emailData.bcc || []
          ];
          for (const recipient of recipients) {
            await import_manager6.default.autoCollectContact(recipient);
          }
        } catch (error2) {
          logger_default.debug("Failed to auto-collect contacts", { error: error2.message });
        }
        smtpClient.disconnect();
      } catch (error2) {
        console.error(import_chalk8.default.red("Error:"), error2.message);
        logger_default.error("Send command failed", { error: error2.message });
        process.exit(1);
      }
    }
    async function interactiveSend() {
      console.log(import_chalk8.default.bold.cyan("Compose Email"));
      console.log();
      const answers = await import_inquirer.default.prompt([
        {
          type: "input",
          name: "to",
          message: "To (comma-separated):",
          validate: (input) => input.trim() ? true : "Recipient is required"
        },
        {
          type: "input",
          name: "cc",
          message: "CC (comma-separated, optional):"
        },
        {
          type: "input",
          name: "subject",
          message: "Subject:",
          validate: (input) => input.trim() ? true : "Subject is required"
        },
        {
          type: "editor",
          name: "body",
          message: "Body (opens editor):",
          validate: (input) => input.trim() ? true : "Body is required"
        },
        {
          type: "input",
          name: "attachments",
          message: "Attachments (comma-separated file paths, optional):"
        },
        {
          type: "confirm",
          name: "confirm",
          message: "Send this email?",
          default: true
        }
      ]);
      if (!answers.confirm) {
        console.log(import_chalk8.default.yellow("Email cancelled."));
        process.exit(0);
      }
      const composer = new composer_default();
      composer.setTo(answers.to.split(",").map((e) => e.trim())).setSubject(answers.subject).setBody(answers.body);
      if (answers.cc) {
        composer.setCc(answers.cc.split(",").map((e) => e.trim()));
      }
      if (answers.attachments) {
        const files = answers.attachments.split(",").map((f) => f.trim());
        for (const file of files) {
          try {
            composer.addAttachment(file);
          } catch (error2) {
            console.error(
              import_chalk8.default.yellow(
                `Warning: Could not add attachment ${file}: ${error2.message}`
              )
            );
          }
        }
      }
      try {
        const cfg = config_default.load();
        const signature = await import_manager7.default.getForEmail(cfg.smtp.user, {
          name: cfg.smtp.user.split("@")[0],
          email: cfg.smtp.user
        });
        if (signature) {
          composer.addSignature(signature);
        }
      } catch (error2) {
        logger_default.debug("Could not add signature", { error: error2.message });
      }
      return composer.compose();
    }
    module2.exports = sendCommand2;
  }
});

// src/sync/account-manager.ts
var require_account_manager = __commonJS({
  "src/sync/account-manager.ts"(exports2, module2) {
    "use strict";
    init_database();
    init_logger();
    var AccountManager = class {
      constructor() {
        this.db = null;
      }
      _getDb() {
        if (!this.db) {
          this.db = database_default.getDb();
        }
        return this.db;
      }
      /**
       * Get account by ID or email
       */
      getAccount(identifier) {
        try {
          const db = this._getDb();
          let query;
          if (typeof identifier === "number") {
            query = db.prepare(
              "SELECT * FROM accounts WHERE id = ? AND is_enabled = 1"
            );
          } else {
            query = db.prepare(
              "SELECT * FROM accounts WHERE email = ? AND is_enabled = 1"
            );
          }
          const account = query.get(identifier);
          return account || null;
        } catch (error2) {
          logger_default.error("Failed to get account", {
            identifier,
            error: error2.message
          });
          return null;
        }
      }
      /**
       * Get all enabled accounts
       */
      getAllAccounts() {
        try {
          const db = this._getDb();
          const query = db.prepare(
            "SELECT * FROM accounts WHERE is_enabled = 1 ORDER BY is_default DESC, email ASC"
          );
          return query.all();
        } catch (error2) {
          logger_default.error("Failed to get all accounts", { error: error2.message });
          return [];
        }
      }
      /**
       * Get default account
       */
      getDefaultAccount() {
        try {
          const db = this._getDb();
          const query = db.prepare(
            "SELECT * FROM accounts WHERE is_default = 1 AND is_enabled = 1 LIMIT 1"
          );
          return query.get() || null;
        } catch (error2) {
          logger_default.error("Failed to get default account", { error: error2.message });
          return null;
        }
      }
      /**
       * Get IMAP config for account
       */
      getImapConfig(accountId) {
        const account = this.getAccount(accountId);
        if (!account) {
          return null;
        }
        return {
          host: account.imap_host,
          port: account.imap_port,
          secure: account.imap_secure === 1,
          user: account.username,
          password: account.password,
          accountId: account.id,
          accountEmail: account.email
        };
      }
      /**
       * Get sync interval for account
       */
      getSyncInterval(accountId) {
        const account = this.getAccount(accountId);
        if (!account || !account.sync_interval) {
          return 3e5;
        }
        return account.sync_interval * 1e3;
      }
      /**
       * Update last sync time for account
       */
      updateLastSync(accountId) {
        try {
          const db = this._getDb();
          const query = db.prepare(
            "UPDATE accounts SET last_sync = CURRENT_TIMESTAMP WHERE id = ?"
          );
          query.run(accountId);
          logger_default.debug("Updated last sync time", { accountId });
        } catch (error2) {
          logger_default.error("Failed to update last sync time", {
            accountId,
            error: error2.message
          });
        }
      }
      /**
       * Check if accounts table exists
       */
      accountsTableExists() {
        try {
          const db = this._getDb();
          const query = db.prepare(
            "SELECT name FROM sqlite_master WHERE type='table' AND name='accounts'"
          );
          const result = query.get();
          return !!result;
        } catch (error2) {
          logger_default.error("Failed to check accounts table", { error: error2.message });
          return false;
        }
      }
      /**
       * Get account-specific folders
       */
      getAccountFolders(accountId) {
        try {
          const db = this._getDb();
          const query = db.prepare(
            "SELECT name FROM folders WHERE account_id = ? OR account_id IS NULL ORDER BY name"
          );
          const folders = query.all(accountId);
          return folders.map((f) => f.name);
        } catch (error2) {
          logger_default.error("Failed to get account folders", {
            accountId,
            error: error2.message
          });
          return ["INBOX"];
        }
      }
    };
    module2.exports = new AccountManager();
  }
});

// src/cli/commands/signature.ts
var require_signature = __commonJS({
  "src/cli/commands/signature.ts"(exports2, module2) {
    "use strict";
    var import_chalk8 = __toESM(require("chalk"));
    var import_manager6 = __toESM(require_manager5());
    init_logger();
    async function signatureCommand2(action, options = {}) {
      try {
        switch (action) {
          case "create":
            await createSignature(options);
            break;
          case "list":
            await listSignatures(options);
            break;
          case "edit":
            await editSignature(options);
            break;
          case "delete":
            await deleteSignature(options);
            break;
          case "set-default":
            await setDefaultSignature(options);
            break;
          default:
            console.error(import_chalk8.default.red(`Unknown action: ${action}`));
            console.log(
              "Available actions: create, list, edit, delete, set-default"
            );
            process.exit(1);
        }
      } catch (error2) {
        logger_default.error("Signature command failed", { action, error: error2.message });
        console.error(import_chalk8.default.red(`Error: ${error2.message}`));
        process.exit(1);
      }
    }
    async function createSignature(options) {
      const { name, text, html, default: isDefault, account } = options;
      if (!name) {
        throw new Error("Signature name is required (--name)");
      }
      if (!text && !html) {
        throw new Error("Signature content is required (--text or --html)");
      }
      const id = await import_manager6.default.create({
        name,
        text,
        html,
        isDefault: isDefault || false,
        accountEmail: account
      });
      console.log(import_chalk8.default.green(`\u2713 Signature created successfully`));
      console.log(`  ID: ${id}`);
      console.log(`  Name: ${name}`);
      if (isDefault) {
        console.log(import_chalk8.default.yellow("  Set as default"));
      }
    }
    async function listSignatures(options) {
      const { account } = options;
      const signatures = await import_manager6.default.getAll(account);
      if (signatures.length === 0) {
        console.log(import_chalk8.default.yellow("No signatures found"));
        return;
      }
      console.log(import_chalk8.default.bold(`
Signatures (${signatures.length}):
`));
      signatures.forEach((sig) => {
        const defaultBadge = sig.isDefault ? import_chalk8.default.yellow(" [DEFAULT]") : "";
        const accountInfo = sig.accountEmail ? import_chalk8.default.gray(` (${sig.accountEmail})`) : "";
        console.log(
          `${import_chalk8.default.cyan(`#${sig.id}`)} ${import_chalk8.default.bold(sig.name)}${defaultBadge}${accountInfo}`
        );
        if (sig.contentText) {
          const preview = sig.contentText.substring(0, 60);
          console.log(
            import_chalk8.default.gray(
              `  Text: ${preview}${sig.contentText.length > 60 ? "..." : ""}`
            )
          );
        }
        if (sig.contentHtml) {
          console.log(import_chalk8.default.gray(`  HTML: Yes`));
        }
        console.log(
          import_chalk8.default.gray(`  Created: ${new Date(sig.createdAt).toLocaleString()}`)
        );
        console.log();
      });
    }
    async function editSignature(options) {
      const { id, name, text, html, default: isDefault, account } = options;
      if (!id) {
        throw new Error("Signature ID is required (--id)");
      }
      const updateData = {};
      if (name !== void 0) updateData.name = name;
      if (text !== void 0) updateData.text = text;
      if (html !== void 0) updateData.html = html;
      if (isDefault !== void 0) updateData.isDefault = isDefault;
      if (account !== void 0) updateData.accountEmail = account;
      if (Object.keys(updateData).length === 0) {
        throw new Error("No update data provided");
      }
      const updated = await import_manager6.default.update(id, updateData);
      if (updated) {
        console.log(import_chalk8.default.green(`\u2713 Signature #${id} updated successfully`));
      } else {
        console.log(import_chalk8.default.yellow(`No changes made to signature #${id}`));
      }
    }
    async function deleteSignature(options) {
      const { id } = options;
      if (!id) {
        throw new Error("Signature ID is required (--id)");
      }
      const deleted = await import_manager6.default.delete(id);
      if (deleted) {
        console.log(import_chalk8.default.green(`\u2713 Signature #${id} deleted successfully`));
      } else {
        console.log(import_chalk8.default.yellow(`Signature #${id} not found`));
      }
    }
    async function setDefaultSignature(options) {
      const { id } = options;
      if (!id) {
        throw new Error("Signature ID is required (--id)");
      }
      await import_manager6.default.setDefault(id);
      console.log(import_chalk8.default.green(`\u2713 Signature #${id} set as default`));
    }
    module2.exports = signatureCommand2;
  }
});

// src/cli/commands/spam.ts
var require_spam = __commonJS({
  "src/cli/commands/spam.ts"(exports2, module2) {
    "use strict";
    var import_filter2 = __toESM(require_filter());
    init_email();
    init_spam();
    init_logger();
    init_formatter();
    async function markAsSpam(emailId) {
      try {
        const email = await email_default.findById(emailId);
        if (!email) {
          console.error(`Error: Email with ID ${emailId} not found`);
          return;
        }
        await email_default.markAsSpam(emailId);
        console.log(`Email #${emailId} marked as spam`);
        await import_filter2.default.learnFromFeedback(emailId, true);
        console.log("Spam filter updated based on your feedback");
      } catch (error2) {
        console.error("Failed to mark email as spam:", error2.message);
        logger_default.error("Mark as spam failed", { emailId, error: error2.message });
      }
    }
    async function unmarkAsSpam(emailId) {
      try {
        const email = await email_default.findById(emailId);
        if (!email) {
          console.error(`Error: Email with ID ${emailId} not found`);
          return;
        }
        await email_default.unmarkAsSpam(emailId);
        console.log(`Email #${emailId} unmarked as spam`);
        await import_filter2.default.learnFromFeedback(emailId, false);
        console.log("Spam filter updated based on your feedback");
      } catch (error2) {
        console.error("Failed to unmark email as spam:", error2.message);
        logger_default.error("Unmark as spam failed", { emailId, error: error2.message });
      }
    }
    async function listSpam(options = {}) {
      try {
        const { limit = 20, offset = 0 } = options;
        const spamEmails = await email_default.findSpam({ limit, offset });
        const totalCount = await email_default.countSpam();
        if (spamEmails.length === 0) {
          console.log("No spam emails found");
          return;
        }
        console.log(`
Spam Emails (${spamEmails.length} of ${totalCount}):
`);
        const tableData = spamEmails.map((email) => ({
          ID: email.id,
          From: email.from.substring(0, 30),
          Subject: email.subject.substring(0, 40),
          Date: new Date(email.date).toLocaleDateString()
        }));
        console.log(formatTable(tableData));
      } catch (error2) {
        console.error("Failed to list spam emails:", error2.message);
        logger_default.error("List spam failed", { error: error2.message });
      }
    }
    async function addToBlacklist(emailAddress, reason) {
      try {
        await spam_default.addToBlacklist(emailAddress, reason);
        console.log(`Added ${emailAddress} to blacklist`);
        if (reason) {
          console.log(`Reason: ${reason}`);
        }
      } catch (error2) {
        console.error("Failed to add to blacklist:", error2.message);
        logger_default.error("Add to blacklist failed", {
          emailAddress,
          error: error2.message
        });
      }
    }
    async function removeFromBlacklist(emailAddress) {
      try {
        const removed = await spam_default.removeFromBlacklist(emailAddress);
        if (removed) {
          console.log(`Removed ${emailAddress} from blacklist`);
        } else {
          console.log(`${emailAddress} was not in blacklist`);
        }
      } catch (error2) {
        console.error("Failed to remove from blacklist:", error2.message);
        logger_default.error("Remove from blacklist failed", {
          emailAddress,
          error: error2.message
        });
      }
    }
    async function listBlacklist() {
      try {
        const blacklist = await spam_default.getBlacklist();
        if (blacklist.length === 0) {
          console.log("Blacklist is empty");
          return;
        }
        console.log(`
Blacklist (${blacklist.length} entries):
`);
        const tableData = blacklist.map((entry) => ({
          ID: entry.id,
          Email: entry.email_address,
          Domain: entry.domain || "N/A",
          Reason: (entry.reason || "N/A").substring(0, 30),
          Added: new Date(entry.created_at).toLocaleDateString()
        }));
        console.log(formatTable(tableData));
      } catch (error2) {
        console.error("Failed to list blacklist:", error2.message);
        logger_default.error("List blacklist failed", { error: error2.message });
      }
    }
    async function addToWhitelist(emailAddress) {
      try {
        await spam_default.addToWhitelist(emailAddress);
        console.log(`Added ${emailAddress} to whitelist`);
      } catch (error2) {
        console.error("Failed to add to whitelist:", error2.message);
        logger_default.error("Add to whitelist failed", {
          emailAddress,
          error: error2.message
        });
      }
    }
    async function removeFromWhitelist(emailAddress) {
      try {
        const removed = await spam_default.removeFromWhitelist(emailAddress);
        if (removed) {
          console.log(`Removed ${emailAddress} from whitelist`);
        } else {
          console.log(`${emailAddress} was not in whitelist`);
        }
      } catch (error2) {
        console.error("Failed to remove from whitelist:", error2.message);
        logger_default.error("Remove from whitelist failed", {
          emailAddress,
          error: error2.message
        });
      }
    }
    async function listWhitelist() {
      try {
        const whitelist = await spam_default.getWhitelist();
        if (whitelist.length === 0) {
          console.log("Whitelist is empty");
          return;
        }
        console.log(`
Whitelist (${whitelist.length} entries):
`);
        const tableData = whitelist.map((entry) => ({
          ID: entry.id,
          Email: entry.email_address,
          Domain: entry.domain || "N/A",
          Added: new Date(entry.created_at).toLocaleDateString()
        }));
        console.log(formatTable(tableData));
      } catch (error2) {
        console.error("Failed to list whitelist:", error2.message);
        logger_default.error("List whitelist failed", { error: error2.message });
      }
    }
    async function runFilter(options = {}) {
      try {
        console.log("Initializing spam filter...");
        await import_filter2.default.initialize();
        console.log("Scanning inbox for spam...");
        const emails = await email_default.findByFolder("INBOX", { limit: 100 });
        const unscannedEmails = emails.filter((e) => !e.isSpam && !e.isDeleted);
        if (unscannedEmails.length === 0) {
          console.log("No emails to scan");
          return;
        }
        console.log(`Scanning ${unscannedEmails.length} emails...`);
        let spamCount = 0;
        for (const email of unscannedEmails) {
          const result = await import_filter2.default.filterEmail(email.id);
          if (result.isSpam) {
            spamCount++;
            console.log(
              `  [SPAM] Email #${email.id}: ${email.subject.substring(0, 50)}`
            );
            console.log(
              `         Score: ${result.score}, Reasons: ${result.reasons.join(", ")}`
            );
          }
        }
        console.log(`
Scan complete: ${spamCount} spam emails detected`);
      } catch (error2) {
        console.error("Failed to run spam filter:", error2.message);
        logger_default.error("Run filter failed", { error: error2.message });
      }
    }
    async function showStatistics() {
      try {
        await import_filter2.default.initialize();
        const stats = await import_filter2.default.getStatistics();
        console.log("\nSpam Filter Statistics:\n");
        console.log(`  Spam emails: ${stats.spamCount}`);
        console.log(`  Blacklist entries: ${stats.blacklistCount}`);
        console.log(`  Whitelist entries: ${stats.whitelistCount}`);
        console.log(`  Active rules: ${stats.rulesCount}`);
        console.log(`  Detection threshold: ${stats.threshold}`);
      } catch (error2) {
        console.error("Failed to get statistics:", error2.message);
        logger_default.error("Get statistics failed", { error: error2.message });
      }
    }
    async function spamCommand2(action, ...args) {
      try {
        switch (action) {
          case "mark":
            if (!args[0]) {
              console.error("Usage: mail-cli spam mark <email-id>");
              return;
            }
            await markAsSpam(parseInt(args[0]));
            break;
          case "unmark":
            if (!args[0]) {
              console.error("Usage: mail-cli spam unmark <email-id>");
              return;
            }
            await unmarkAsSpam(parseInt(args[0]));
            break;
          case "list":
            await listSpam();
            break;
          case "blacklist":
            const blacklistAction = args[0];
            if (blacklistAction === "add") {
              if (!args[1]) {
                console.error(
                  "Usage: mail-cli spam blacklist add <email> [reason]"
                );
                return;
              }
              await addToBlacklist(args[1], args.slice(2).join(" "));
            } else if (blacklistAction === "remove") {
              if (!args[1]) {
                console.error("Usage: mail-cli spam blacklist remove <email>");
                return;
              }
              await removeFromBlacklist(args[1]);
            } else if (blacklistAction === "list") {
              await listBlacklist();
            } else {
              console.error(
                "Usage: mail-cli spam blacklist <add|remove|list> [email]"
              );
            }
            break;
          case "whitelist":
            const whitelistAction = args[0];
            if (whitelistAction === "add") {
              if (!args[1]) {
                console.error("Usage: mail-cli spam whitelist add <email>");
                return;
              }
              await addToWhitelist(args[1]);
            } else if (whitelistAction === "remove") {
              if (!args[1]) {
                console.error("Usage: mail-cli spam whitelist remove <email>");
                return;
              }
              await removeFromWhitelist(args[1]);
            } else if (whitelistAction === "list") {
              await listWhitelist();
            } else {
              console.error(
                "Usage: mail-cli spam whitelist <add|remove|list> [email]"
              );
            }
            break;
          case "filter":
            await runFilter();
            break;
          case "stats":
            await showStatistics();
            break;
          default:
            console.log("Spam Management Commands:");
            console.log(
              "  mail-cli spam mark <email-id>           - Mark email as spam"
            );
            console.log(
              "  mail-cli spam unmark <email-id>         - Unmark email as spam"
            );
            console.log(
              "  mail-cli spam list                      - List spam emails"
            );
            console.log(
              "  mail-cli spam blacklist add <email>     - Add to blacklist"
            );
            console.log(
              "  mail-cli spam blacklist remove <email>  - Remove from blacklist"
            );
            console.log(
              "  mail-cli spam blacklist list            - List blacklist"
            );
            console.log(
              "  mail-cli spam whitelist add <email>     - Add to whitelist"
            );
            console.log(
              "  mail-cli spam whitelist remove <email>  - Remove from whitelist"
            );
            console.log(
              "  mail-cli spam whitelist list            - List whitelist"
            );
            console.log(
              "  mail-cli spam filter                    - Run spam filter on inbox"
            );
            console.log(
              "  mail-cli spam stats                     - Show spam statistics"
            );
        }
      } catch (error2) {
        console.error("Spam command failed:", error2.message);
        logger_default.error("Spam command failed", { action, error: error2.message });
      }
    }
    module2.exports = spamCommand2;
  }
});

// src/sync/daemon.ts
var require_daemon = __commonJS({
  "src/sync/daemon.ts"(exports2, module2) {
    "use strict";
    var import_child_process = require("child_process");
    var import_fs3 = __toESM(require("fs"));
    var import_path4 = __toESM(require("path"));
    init_helpers();
    init_logger();
    var SyncDaemon = class {
      constructor() {
        this.dataDir = getDataDir();
        this.pidFile = import_path4.default.join(this.dataDir, "sync-daemon.pid");
        this.logFile = import_path4.default.join(this.dataDir, "sync-daemon.log");
        this.workerScript = import_path4.default.join(__dirname, "daemon-worker.js");
      }
      /**
       * Start daemon process
       */
      async start(options = {}) {
        if (this.isRunning()) {
          const pid = this._readPidFile();
          throw new Error(`Daemon already running with PID ${pid}`);
        }
        logger_default.info("Starting sync daemon", options);
        if (!import_fs3.default.existsSync(this.dataDir)) {
          import_fs3.default.mkdirSync(this.dataDir, { recursive: true });
        }
        const daemonOptions = {
          interval: options.interval || 3e5,
          // 5 minutes default
          folders: options.folders || ["INBOX"],
          account: options.account || null
        };
        const child = (0, import_child_process.spawn)(
          process.execPath,
          [this.workerScript, JSON.stringify(daemonOptions)],
          {
            detached: true,
            stdio: ["ignore", "pipe", "pipe"],
            cwd: process.cwd(),
            env: process.env
          }
        );
        this._writePidFile(child.pid);
        const logStream = import_fs3.default.createWriteStream(this.logFile, { flags: "a" });
        child.stdout.pipe(logStream);
        child.stderr.pipe(logStream);
        child.unref();
        logger_default.info("Sync daemon started", { pid: child.pid });
        return {
          pid: child.pid,
          logFile: this.logFile,
          options: daemonOptions
        };
      }
      /**
       * Stop daemon process
       */
      async stop() {
        if (!this.isRunning()) {
          throw new Error("Daemon is not running");
        }
        const pid = this._readPidFile();
        logger_default.info("Stopping sync daemon", { pid });
        try {
          process.kill(pid, "SIGTERM");
          await this._waitForProcessExit(pid, 5e3);
          this._removePidFile();
          logger_default.info("Sync daemon stopped", { pid });
          return { success: true, pid };
        } catch (error2) {
          logger_default.error("Failed to stop daemon", { pid, error: error2.message });
          try {
            process.kill(pid, "SIGKILL");
            this._removePidFile();
            logger_default.warn("Daemon force killed", { pid });
            return { success: true, pid, forcedKill: true };
          } catch (killError) {
            this._removePidFile();
            throw new Error(`Failed to stop daemon: ${error2.message}`);
          }
        }
      }
      /**
       * Get daemon status
       */
      getStatus() {
        const isRunning = this.isRunning();
        const pid = isRunning ? this._readPidFile() : null;
        const status = {
          isRunning,
          pid,
          pidFile: this.pidFile,
          logFile: this.logFile
        };
        if (import_fs3.default.existsSync(this.logFile)) {
          status.logSize = import_fs3.default.statSync(this.logFile).size;
          status.lastModified = import_fs3.default.statSync(this.logFile).mtime;
        }
        return status;
      }
      /**
       * Get daemon logs
       */
      getLogs(lines = 50) {
        if (!import_fs3.default.existsSync(this.logFile)) {
          return "";
        }
        const content = import_fs3.default.readFileSync(this.logFile, "utf8");
        const logLines = content.split("\n").filter((line) => line.trim());
        return logLines.slice(-lines).join("\n");
      }
      /**
       * Clear daemon logs
       */
      clearLogs() {
        if (import_fs3.default.existsSync(this.logFile)) {
          import_fs3.default.writeFileSync(this.logFile, "");
          logger_default.info("Daemon logs cleared");
        }
      }
      /**
       * Check if daemon is running
       */
      isRunning() {
        if (!import_fs3.default.existsSync(this.pidFile)) {
          return false;
        }
        const pid = this._readPidFile();
        if (!pid) {
          return false;
        }
        try {
          process.kill(pid, 0);
          return true;
        } catch (error2) {
          this._removePidFile();
          return false;
        }
      }
      /**
       * Write PID file
       * @private
       */
      _writePidFile(pid) {
        import_fs3.default.writeFileSync(this.pidFile, pid.toString(), "utf8");
      }
      /**
       * Read PID file
       * @private
       */
      _readPidFile() {
        try {
          const content = import_fs3.default.readFileSync(this.pidFile, "utf8");
          return parseInt(content.trim(), 10);
        } catch (error2) {
          return null;
        }
      }
      /**
       * Remove PID file
       * @private
       */
      _removePidFile() {
        if (import_fs3.default.existsSync(this.pidFile)) {
          import_fs3.default.unlinkSync(this.pidFile);
        }
      }
      /**
       * Wait for process to exit
       * @private
       */
      _waitForProcessExit(pid, timeout = 5e3) {
        return new Promise((resolve, reject) => {
          const startTime = Date.now();
          const checkInterval = 100;
          const check = () => {
            try {
              process.kill(pid, 0);
              if (Date.now() - startTime > timeout) {
                reject(new Error("Timeout waiting for process to exit"));
              } else {
                setTimeout(check, checkInterval);
              }
            } catch (error2) {
              resolve();
            }
          };
          check();
        });
      }
    };
    module2.exports = SyncDaemon;
  }
});

// src/sync/scheduler.ts
var require_scheduler = __commonJS({
  "src/sync/scheduler.ts"(exports2, module2) {
    "use strict";
    var import_events = __toESM(require("events"));
    init_config();
    var import_account_manager2 = __toESM(require_account_manager());
    init_sync();
    init_logger();
    var SyncScheduler = class extends import_events.default {
      constructor(options = {}) {
        super();
        this.config = options.config || config_default.load();
        this.interval = options.interval || this.config.sync.syncInterval || 3e5;
        this.folders = options.folders || this.config.sync.folders || ["INBOX"];
        this.account = options.account || null;
        this.isRunning = false;
        this.timer = null;
        this.syncManager = null;
        this.lastSyncTime = null;
        this.lastSyncResult = null;
        this.stats = {
          totalSyncs: 0,
          successfulSyncs: 0,
          failedSyncs: 0,
          totalNewEmails: 0,
          totalErrors: 0
        };
      }
      /**
       * Start automatic synchronization
       */
      async start() {
        if (this.isRunning) {
          logger_default.warn("Scheduler already running");
          return;
        }
        logger_default.info("Starting sync scheduler", {
          interval: this.interval,
          folders: this.folders,
          account: this.account
        });
        this.isRunning = true;
        this.emit("started", { interval: this.interval, folders: this.folders });
        await this._runSync();
        this._scheduleNextSync();
      }
      /**
       * Stop automatic synchronization
       */
      stop() {
        if (!this.isRunning) {
          logger_default.warn("Scheduler not running");
          return;
        }
        logger_default.info("Stopping sync scheduler");
        if (this.timer) {
          clearTimeout(this.timer);
          this.timer = null;
        }
        this.isRunning = false;
        this.emit("stopped");
      }
      /**
       * Get scheduler status
       */
      getStatus() {
        return {
          isRunning: this.isRunning,
          interval: this.interval,
          folders: this.folders,
          account: this.account,
          lastSyncTime: this.lastSyncTime,
          lastSyncResult: this.lastSyncResult,
          stats: this.stats,
          nextSyncIn: this.timer ? this.interval : null
        };
      }
      /**
       * Update sync interval
       */
      setInterval(newInterval) {
        if (newInterval < 6e4) {
          throw new Error("Sync interval must be at least 60000ms (1 minute)");
        }
        logger_default.info("Updating sync interval", {
          old: this.interval,
          new: newInterval
        });
        this.interval = newInterval;
        if (this.isRunning) {
          if (this.timer) {
            clearTimeout(this.timer);
          }
          this._scheduleNextSync();
        }
      }
      /**
       * Update folders to sync
       */
      setFolders(folders) {
        if (!Array.isArray(folders) || folders.length === 0) {
          throw new Error("Folders must be a non-empty array");
        }
        logger_default.info("Updating sync folders", { old: this.folders, new: folders });
        this.folders = folders;
      }
      /**
       * Run sync immediately (manual trigger)
       */
      async syncNow() {
        if (!this.isRunning) {
          throw new Error("Scheduler not running. Start it first with start()");
        }
        logger_default.info("Manual sync triggered");
        await this._runSync();
      }
      /**
       * Schedule next sync
       * @private
       */
      _scheduleNextSync() {
        this.timer = setTimeout(async () => {
          await this._runSync();
          if (this.isRunning) {
            this._scheduleNextSync();
          }
        }, this.interval);
      }
      /**
       * Run synchronization
       * @private
       */
      async _runSync() {
        const syncStartTime = Date.now();
        this.stats.totalSyncs++;
        try {
          logger_default.info("Running scheduled sync", {
            folders: this.folders,
            account: this.account
          });
          this.emit("sync-start", { folders: this.folders, account: this.account });
          if (!this.syncManager) {
            const imapConfig = this.account ? this._getAccountConfig(this.account) : this.config.imap;
            this.syncManager = new sync_default(imapConfig);
          }
          const results = await this.syncManager.syncFolders(this.folders);
          this.stats.successfulSyncs++;
          this.stats.totalNewEmails += results.totalNew || 0;
          this.stats.totalErrors += results.totalErrors || 0;
          this.lastSyncTime = (/* @__PURE__ */ new Date()).toISOString();
          this.lastSyncResult = {
            success: true,
            ...results,
            duration: Date.now() - syncStartTime
          };
          logger_default.info("Scheduled sync completed", {
            duration: Date.now() - syncStartTime,
            newEmails: results.totalNew,
            errors: results.totalErrors
          });
          this.emit("sync-complete", this.lastSyncResult);
        } catch (error2) {
          this.stats.failedSyncs++;
          this.lastSyncTime = (/* @__PURE__ */ new Date()).toISOString();
          this.lastSyncResult = {
            success: false,
            error: error2.message,
            duration: Date.now() - syncStartTime
          };
          logger_default.error("Scheduled sync failed", {
            error: error2.message,
            duration: Date.now() - syncStartTime
          });
          this.emit("sync-error", { error: error2.message });
        }
      }
      /**
       * Get account-specific IMAP config
       * @private
       */
      _getAccountConfig(accountId) {
        if (import_account_manager2.default.accountsTableExists()) {
          const imapConfig = import_account_manager2.default.getImapConfig(accountId);
          if (imapConfig) {
            logger_default.info("Using account-specific IMAP config", { accountId });
            return imapConfig;
          }
        }
        logger_default.warn(
          "Account not found or accounts table not available, using default config",
          { accountId }
        );
        return this.config.imap;
      }
    };
    module2.exports = SyncScheduler;
  }
});

// src/cli/commands/sync.ts
var require_sync = __commonJS({
  "src/cli/commands/sync.ts"(exports2, module2) {
    "use strict";
    var import_chalk8 = __toESM(require("chalk"));
    var import_ora3 = __toESM(require("ora"));
    init_config();
    init_sync();
    var import_account_manager2 = __toESM(require_account_manager());
    var import_daemon = __toESM(require_daemon());
    var import_scheduler = __toESM(require_scheduler());
    init_logger();
    init_formatter();
    async function syncCommand2(action, options = {}) {
      if (action === "daemon") {
        return handleDaemonCommand(options);
      }
      if (options.auto) {
        return handleAutoSync(options);
      }
      return handleRegularSync(action, options);
    }
    async function handleRegularSync(action, options) {
      const spinner = (0, import_ora3.default)("Initializing sync...").start();
      try {
        const cfg = config_default.load();
        if (!cfg.imap.host || !cfg.imap.user || !cfg.imap.password) {
          spinner.fail("Configuration incomplete. Please run: mail-cli config");
          process.exit(1);
        }
        let folders = cfg.sync.folders || ["INBOX"];
        if (options.folders) {
          folders = options.folders.split(",").map((f) => f.trim());
        } else if (options.folder) {
          folders = [options.folder];
        }
        const account = options.account || null;
        spinner.text = `Syncing folders: ${folders.join(", ")}`;
        const imapConfig = account ? getAccountConfig(cfg, account) : cfg.imap;
        const syncManager = new sync_default(imapConfig);
        if (options.since) {
          spinner.info(
            `Date filtering (--since) will be implemented in future version`
          );
        }
        const results = await syncManager.syncFolders(folders);
        spinner.succeed("Sync completed");
        console.log();
        console.log(formatSyncResults(results));
        displaySyncStats(results);
      } catch (error2) {
        spinner.fail("Sync failed");
        console.error(import_chalk8.default.red("Error:"), error2.message);
        logger_default.error("Sync command failed", { error: error2.message });
        process.exit(1);
      }
    }
    async function handleAutoSync(options) {
      console.log(import_chalk8.default.blue("Starting automatic sync mode..."));
      try {
        const cfg = config_default.load();
        const interval = options.interval ? parseInt(options.interval) * 6e4 : cfg.sync.syncInterval || 3e5;
        const folders = options.folders ? options.folders.split(",").map((f) => f.trim()) : cfg.sync.folders || ["INBOX"];
        const account = options.account || null;
        const scheduler = new import_scheduler.default({
          config: cfg,
          interval,
          folders,
          account
        });
        scheduler.on("started", (info2) => {
          console.log(import_chalk8.default.green("\u2713 Auto sync started"));
          console.log(import_chalk8.default.gray(`  Interval: ${info2.interval / 1e3}s`));
          console.log(import_chalk8.default.gray(`  Folders: ${info2.folders.join(", ")}`));
          console.log();
          console.log(import_chalk8.default.yellow("Press Ctrl+C to stop"));
        });
        scheduler.on("sync-start", (info2) => {
          console.log(
            import_chalk8.default.blue(`[${(/* @__PURE__ */ new Date()).toLocaleTimeString()}] Syncing...`)
          );
        });
        scheduler.on("sync-complete", (result) => {
          console.log(
            import_chalk8.default.green(`[${(/* @__PURE__ */ new Date()).toLocaleTimeString()}] \u2713 Sync completed`)
          );
          console.log(import_chalk8.default.gray(`  New emails: ${result.totalNew}`));
          console.log(import_chalk8.default.gray(`  Duration: ${result.duration}ms`));
          if (result.spamDetected > 0) {
            console.log(import_chalk8.default.yellow(`  Spam detected: ${result.spamDetected}`));
          }
          console.log();
        });
        scheduler.on("sync-error", (error2) => {
          console.error(
            import_chalk8.default.red(
              `[${(/* @__PURE__ */ new Date()).toLocaleTimeString()}] \u2717 Sync failed: ${error2.error}`
            )
          );
          console.log();
        });
        process.on("SIGINT", () => {
          console.log();
          console.log(import_chalk8.default.yellow("Stopping auto sync..."));
          scheduler.stop();
          const stats = scheduler.getStatus().stats;
          console.log();
          console.log(import_chalk8.default.blue("Auto Sync Statistics:"));
          console.log(import_chalk8.default.gray(`  Total syncs: ${stats.totalSyncs}`));
          console.log(import_chalk8.default.gray(`  Successful: ${stats.successfulSyncs}`));
          console.log(import_chalk8.default.gray(`  Failed: ${stats.failedSyncs}`));
          console.log(import_chalk8.default.gray(`  Total new emails: ${stats.totalNewEmails}`));
          process.exit(0);
        });
        await scheduler.start();
      } catch (error2) {
        console.error(import_chalk8.default.red("Error:"), error2.message);
        logger_default.error("Auto sync failed", { error: error2.message });
        process.exit(1);
      }
    }
    async function handleDaemonCommand(options) {
      const daemon = new import_daemon.default();
      const subcommand = options.subcommand || "status";
      try {
        switch (subcommand) {
          case "start":
            await handleDaemonStart(daemon, options);
            break;
          case "stop":
            await handleDaemonStop(daemon);
            break;
          case "status":
            handleDaemonStatus(daemon);
            break;
          case "logs":
            handleDaemonLogs(daemon, options);
            break;
          default:
            console.error(import_chalk8.default.red(`Unknown daemon command: ${subcommand}`));
            console.log("Available commands: start, stop, status, logs");
            process.exit(1);
        }
      } catch (error2) {
        console.error(import_chalk8.default.red("Error:"), error2.message);
        logger_default.error("Daemon command failed", { subcommand, error: error2.message });
        process.exit(1);
      }
    }
    async function handleDaemonStart(daemon, options) {
      const spinner = (0, import_ora3.default)("Starting sync daemon...").start();
      try {
        const cfg = config_default.load();
        const daemonOptions = {
          interval: options.interval ? parseInt(options.interval) * 6e4 : cfg.sync.syncInterval || 3e5,
          folders: options.folders ? options.folders.split(",").map((f) => f.trim()) : cfg.sync.folders || ["INBOX"],
          account: options.account || null
        };
        const result = await daemon.start(daemonOptions);
        spinner.succeed("Sync daemon started");
        console.log();
        console.log(import_chalk8.default.blue("Daemon Information:"));
        console.log(import_chalk8.default.gray(`  PID: ${result.pid}`));
        console.log(import_chalk8.default.gray(`  Log file: ${result.logFile}`));
        console.log(import_chalk8.default.gray(`  Interval: ${result.options.interval / 1e3}s`));
        console.log(import_chalk8.default.gray(`  Folders: ${result.options.folders.join(", ")}`));
        console.log();
        console.log(import_chalk8.default.yellow('Use "sync daemon logs" to view logs'));
        console.log(import_chalk8.default.yellow('Use "sync daemon stop" to stop the daemon'));
      } catch (error2) {
        spinner.fail("Failed to start daemon");
        throw error2;
      }
    }
    async function handleDaemonStop(daemon) {
      const spinner = (0, import_ora3.default)("Stopping sync daemon...").start();
      try {
        const result = await daemon.stop();
        spinner.succeed("Sync daemon stopped");
        console.log();
        console.log(import_chalk8.default.gray(`  PID: ${result.pid}`));
        if (result.forcedKill) {
          console.log(import_chalk8.default.yellow("  (Force killed)"));
        }
      } catch (error2) {
        spinner.fail("Failed to stop daemon");
        throw error2;
      }
    }
    function handleDaemonStatus(daemon) {
      const status = daemon.getStatus();
      console.log(import_chalk8.default.blue("Sync Daemon Status:"));
      console.log();
      if (status.isRunning) {
        console.log(import_chalk8.default.green("\u2713 Running"));
        console.log(import_chalk8.default.gray(`  PID: ${status.pid}`));
        console.log(import_chalk8.default.gray(`  Log file: ${status.logFile}`));
        if (status.logSize !== void 0) {
          console.log(import_chalk8.default.gray(`  Log size: ${formatBytes(status.logSize)}`));
          console.log(
            import_chalk8.default.gray(`  Last activity: ${status.lastModified.toLocaleString()}`)
          );
        }
      } else {
        console.log(import_chalk8.default.yellow("\u2717 Not running"));
      }
      console.log();
      console.log(import_chalk8.default.gray(`PID file: ${status.pidFile}`));
    }
    function handleDaemonLogs(daemon, options) {
      const lines = options.lines ? parseInt(options.lines) : 50;
      const logs = daemon.getLogs(lines);
      if (!logs) {
        console.log(import_chalk8.default.yellow("No logs available"));
        return;
      }
      console.log(import_chalk8.default.blue(`Last ${lines} log entries:`));
      console.log();
      console.log(logs);
    }
    function displaySyncStats(results) {
      console.log(import_chalk8.default.blue("Sync Statistics:"));
      console.log(import_chalk8.default.gray(`  Total new emails: ${results.totalNew}`));
      console.log(import_chalk8.default.gray(`  Total errors: ${results.totalErrors}`));
      if (results.spamDetected > 0) {
        console.log(import_chalk8.default.yellow(`  Spam detected: ${results.spamDetected}`));
      }
      if (results.filtersApplied > 0) {
        console.log(import_chalk8.default.green(`  Filters applied: ${results.filtersApplied}`));
      }
      console.log();
      console.log(import_chalk8.default.blue("Folders:"));
      for (const [folder, result] of Object.entries(results.folders)) {
        if (result.error) {
          console.log(import_chalk8.default.red(`  \u2717 ${folder}: ${result.error}`));
        } else {
          console.log(import_chalk8.default.green(`  \u2713 ${folder}: ${result.newEmails} new emails`));
        }
      }
    }
    function getAccountConfig(cfg, accountId) {
      if (import_account_manager2.default.accountsTableExists()) {
        const imapConfig = import_account_manager2.default.getImapConfig(accountId);
        if (imapConfig) {
          logger_default.info("Using account-specific IMAP config", { accountId });
          return imapConfig;
        }
      }
      logger_default.warn(
        "Account not found or accounts table not available, using default config",
        { accountId }
      );
      return cfg.imap;
    }
    function formatBytes(bytes) {
      if (bytes === 0) return "0 Bytes";
      const k = 1024;
      const sizes = ["Bytes", "KB", "MB", "GB"];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
    }
    module2.exports = syncCommand2;
  }
});

// src/cli/commands/tag.ts
var require_tag = __commonJS({
  "src/cli/commands/tag.ts"(exports2, module2) {
    "use strict";
    var import_chalk8 = __toESM(require("chalk"));
    init_email();
    init_tag();
    init_logger();
    init_formatter();
    function tagCommand2(action, args, options) {
      try {
        switch (action) {
          case "create":
            return createTag(args, options);
          case "list":
            return listTags(options);
          case "delete":
            return deleteTag(args, options);
          case "add":
            return addTagToEmail(args, options);
          case "remove":
            return removeTagFromEmail(args, options);
          case "filter":
            return filterByTag(args, options);
          default:
            console.error(import_chalk8.default.red("Error:"), `Unknown action: ${action}`);
            console.log(
              import_chalk8.default.gray(
                "Available actions: create, list, delete, add, remove, filter"
              )
            );
            process.exit(1);
        }
      } catch (error2) {
        console.error(import_chalk8.default.red("Error:"), error2.message);
        logger_default.error("Tag command failed", { action, error: error2.message });
        process.exit(1);
      }
    }
    function createTag(args, options) {
      if (!args || args.length === 0) {
        console.error(import_chalk8.default.red("Error:"), "Tag name is required");
        console.log(
          import_chalk8.default.gray(
            "Usage: tag create <name> [--color <color>] [--description <text>]"
          )
        );
        process.exit(1);
      }
      const name = args[0];
      const color = options.color || "#808080";
      const description = options.description || "";
      const tagId = tag_default.create({ name, color, description });
      console.log(import_chalk8.default.green("\u2713"), `Tag "${name}" created successfully`);
      console.log(import_chalk8.default.gray(`  ID: ${tagId}`));
      console.log(import_chalk8.default.gray(`  Color: ${color}`));
      if (description) {
        console.log(import_chalk8.default.gray(`  Description: ${description}`));
      }
    }
    function listTags(options) {
      const tags = tag_default.findAll();
      if (tags.length === 0) {
        console.log(import_chalk8.default.yellow("No tags found."));
        return;
      }
      console.log(import_chalk8.default.bold.cyan("Tags:"));
      console.log();
      tags.forEach((tag) => {
        const emailCount = tag_default.countEmailsByTag(tag.id);
        const colorBox = import_chalk8.default.hex(tag.color)("\u25A0");
        console.log(
          `${colorBox} ${import_chalk8.default.bold(tag.name)} ${import_chalk8.default.gray(`(${emailCount} emails)`)}`
        );
        console.log(import_chalk8.default.gray(`  ID: ${tag.id}`));
        if (tag.description) {
          console.log(import_chalk8.default.gray(`  ${tag.description}`));
        }
        console.log();
      });
      console.log(import_chalk8.default.gray(`Total: ${tags.length} tags`));
    }
    function deleteTag(args, options) {
      if (!args || args.length === 0) {
        console.error(import_chalk8.default.red("Error:"), "Tag name or ID is required");
        console.log(import_chalk8.default.gray("Usage: tag delete <name|id>"));
        process.exit(1);
      }
      const identifier = args[0];
      let tag;
      if (/^\d+$/.test(identifier)) {
        tag = tag_default.findById(parseInt(identifier));
      } else {
        tag = tag_default.findByName(identifier);
      }
      if (!tag) {
        console.error(import_chalk8.default.red("Error:"), `Tag "${identifier}" not found`);
        process.exit(1);
      }
      const emailCount = tag_default.countEmailsByTag(tag.id);
      if (emailCount > 0 && !options.yes) {
        console.log(
          import_chalk8.default.yellow("Warning:"),
          `This tag is used by ${emailCount} email(s)`
        );
        console.log(import_chalk8.default.gray("Use --yes to confirm deletion"));
        process.exit(1);
      }
      tag_default.delete(tag.id);
      console.log(import_chalk8.default.green("\u2713"), `Tag "${tag.name}" deleted successfully`);
    }
    function addTagToEmail(args, options) {
      if (!args || args.length < 2) {
        console.error(import_chalk8.default.red("Error:"), "Email ID and tag name are required");
        console.log(import_chalk8.default.gray("Usage: tag add <email-id> <tag-name>"));
        process.exit(1);
      }
      const emailId = parseInt(args[0]);
      const tagName = args[1];
      const email = email_default.findById(emailId);
      if (!email) {
        console.error(import_chalk8.default.red("Error:"), `Email with ID ${emailId} not found`);
        process.exit(1);
      }
      let tag = tag_default.findByName(tagName);
      if (!tag) {
        console.log(import_chalk8.default.yellow("Tag not found, creating new tag..."));
        const tagId = tag_default.create({ name: tagName });
        tag = tag_default.findById(tagId);
      }
      tag_default.addToEmail(emailId, tag.id);
      console.log(import_chalk8.default.green("\u2713"), `Tag "${tag.name}" added to email #${emailId}`);
      console.log(import_chalk8.default.gray(`  Subject: ${email.subject}`));
    }
    function removeTagFromEmail(args, options) {
      if (!args || args.length < 2) {
        console.error(import_chalk8.default.red("Error:"), "Email ID and tag name are required");
        console.log(import_chalk8.default.gray("Usage: tag remove <email-id> <tag-name>"));
        process.exit(1);
      }
      const emailId = parseInt(args[0]);
      const tagName = args[1];
      const email = email_default.findById(emailId);
      if (!email) {
        console.error(import_chalk8.default.red("Error:"), `Email with ID ${emailId} not found`);
        process.exit(1);
      }
      const tag = tag_default.findByName(tagName);
      if (!tag) {
        console.error(import_chalk8.default.red("Error:"), `Tag "${tagName}" not found`);
        process.exit(1);
      }
      const removed = tag_default.removeFromEmail(emailId, tag.id);
      if (removed) {
        console.log(
          import_chalk8.default.green("\u2713"),
          `Tag "${tag.name}" removed from email #${emailId}`
        );
      } else {
        console.log(import_chalk8.default.yellow("Email does not have this tag"));
      }
    }
    function filterByTag(args, options) {
      if (!args || args.length === 0) {
        console.error(import_chalk8.default.red("Error:"), "Tag name is required");
        console.log(
          import_chalk8.default.gray(
            "Usage: tag filter <tag-name> [--limit <number>] [--page <number>]"
          )
        );
        process.exit(1);
      }
      const tagName = args[0];
      const limit = options.limit || 50;
      const page = options.page || 1;
      const offset = (page - 1) * limit;
      const tag = tag_default.findByName(tagName);
      if (!tag) {
        console.error(import_chalk8.default.red("Error:"), `Tag "${tagName}" not found`);
        process.exit(1);
      }
      console.log(import_chalk8.default.bold.cyan(`Emails tagged with "${tag.name}":`));
      console.log();
      const emails = tag_default.findEmailsByTag(tag.id, { limit, offset });
      if (emails.length === 0) {
        console.log(import_chalk8.default.yellow("No emails found with this tag."));
        return;
      }
      const formattedEmails = emails.map((email) => email_default._formatEmail(email));
      console.log(formatEmailList(formattedEmails));
      console.log();
      const total = tag_default.countEmailsByTag(tag.id);
      const totalPages = Math.ceil(total / limit);
      console.log(
        import_chalk8.default.gray(`Page ${page} of ${totalPages} (${total} total emails)`)
      );
    }
    module2.exports = tagCommand2;
  }
});

// src/storage/models/template.ts
function getErrorMessage15(error2) {
  return error2 instanceof Error ? error2.message : String(error2);
}
function toNumber11(value) {
  return typeof value === "bigint" ? Number(value) : value;
}
var TemplateModel, templateModel, template_default;
var init_template = __esm({
  "src/storage/models/template.ts"() {
    "use strict";
    init_errors();
    init_logger();
    init_database();
    TemplateModel = class {
      db;
      constructor() {
        this.db = null;
      }
      getDb() {
        if (!this.db) {
          this.db = database_default.getDb();
        }
        return this.db;
      }
      create(templateData) {
        try {
          const db = this.getDb();
          const stmt = db.prepare(`
        INSERT INTO templates (
          name, subject, body_text, body_html, variables, account_id, is_enabled
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
      `);
          const result = stmt.run(
            templateData.name,
            templateData.subject,
            templateData.bodyText ?? null,
            templateData.bodyHtml ?? null,
            templateData.variables ? JSON.stringify(templateData.variables) : null,
            templateData.accountId ?? null,
            templateData.isEnabled !== void 0 ? templateData.isEnabled ? 1 : 0 : 1
          );
          const insertId = toNumber11(result.lastInsertRowid);
          logger_default.debug("Template created", { id: insertId });
          return insertId;
        } catch (error2) {
          const errorMessage = getErrorMessage15(error2);
          logger_default.error("Failed to create template", { error: errorMessage });
          throw new StorageError(`Failed to create template: ${errorMessage}`);
        }
      }
      findById(id) {
        try {
          const db = this.getDb();
          const stmt = db.prepare(
            "SELECT * FROM templates WHERE id = ?"
          );
          const template = stmt.get(id);
          return template ? this.formatTemplate(template) : null;
        } catch (error2) {
          const errorMessage = getErrorMessage15(error2);
          logger_default.error("Failed to find template by ID", {
            id,
            error: errorMessage
          });
          throw new StorageError(`Failed to find template: ${errorMessage}`);
        }
      }
      findAll(accountId = null) {
        try {
          const db = this.getDb();
          let query = "SELECT * FROM templates WHERE 1=1";
          const params = [];
          if (accountId) {
            query += " AND (account_id = ? OR account_id IS NULL)";
            params.push(accountId);
          }
          query += " ORDER BY created_at DESC";
          const stmt = db.prepare(query);
          const templates = stmt.all(...params);
          return templates.map((template) => this.formatTemplate(template));
        } catch (error2) {
          const errorMessage = getErrorMessage15(error2);
          logger_default.error("Failed to find templates", { error: errorMessage });
          throw new StorageError(`Failed to find templates: ${errorMessage}`);
        }
      }
      findByName(name, accountId = null) {
        try {
          const db = this.getDb();
          let query = "SELECT * FROM templates WHERE name = ?";
          const params = [name];
          if (accountId) {
            query += " AND (account_id = ? OR account_id IS NULL)";
            params.push(accountId);
          }
          query += " LIMIT 1";
          const stmt = db.prepare(query);
          const template = stmt.get(...params);
          return template ? this.formatTemplate(template) : null;
        } catch (error2) {
          const errorMessage = getErrorMessage15(error2);
          logger_default.error("Failed to find template by name", {
            name,
            error: errorMessage
          });
          throw new StorageError(`Failed to find template: ${errorMessage}`);
        }
      }
      update(id, data) {
        try {
          const db = this.getDb();
          const fields = [];
          const params = [];
          if (data.name !== void 0) {
            fields.push("name = ?");
            params.push(data.name);
          }
          if (data.subject !== void 0) {
            fields.push("subject = ?");
            params.push(data.subject);
          }
          if (data.bodyText !== void 0) {
            fields.push("body_text = ?");
            params.push(data.bodyText);
          }
          if (data.bodyHtml !== void 0) {
            fields.push("body_html = ?");
            params.push(data.bodyHtml);
          }
          if (data.variables !== void 0) {
            fields.push("variables = ?");
            params.push(data.variables ? JSON.stringify(data.variables) : null);
          }
          if (data.accountId !== void 0) {
            fields.push("account_id = ?");
            params.push(data.accountId);
          }
          if (data.isEnabled !== void 0) {
            fields.push("is_enabled = ?");
            params.push(data.isEnabled ? 1 : 0);
          }
          if (fields.length === 0) {
            return false;
          }
          fields.push("updated_at = CURRENT_TIMESTAMP");
          params.push(id);
          const sql = `UPDATE templates SET ${fields.join(", ")} WHERE id = ?`;
          const stmt = db.prepare(sql);
          const result = stmt.run(...params);
          logger_default.debug("Template updated", { id, changes: result.changes });
          return result.changes > 0;
        } catch (error2) {
          const errorMessage = getErrorMessage15(error2);
          logger_default.error("Failed to update template", { id, error: errorMessage });
          throw new StorageError(`Failed to update template: ${errorMessage}`);
        }
      }
      delete(id) {
        try {
          const db = this.getDb();
          const stmt = db.prepare("DELETE FROM templates WHERE id = ?");
          const result = stmt.run(id);
          logger_default.debug("Template deleted", { id, changes: result.changes });
          return result.changes > 0;
        } catch (error2) {
          const errorMessage = getErrorMessage15(error2);
          logger_default.error("Failed to delete template", { id, error: errorMessage });
          throw new StorageError(`Failed to delete template: ${errorMessage}`);
        }
      }
      formatTemplate(template) {
        let variables = [];
        if (template.variables) {
          try {
            const parsed = JSON.parse(template.variables);
            variables = Array.isArray(parsed) ? parsed : [];
          } catch {
            variables = [];
          }
        }
        return {
          id: template.id,
          name: template.name,
          subject: template.subject,
          bodyText: template.body_text,
          bodyHtml: template.body_html,
          variables,
          accountId: template.account_id,
          isEnabled: template.is_enabled === 1,
          createdAt: template.created_at,
          updatedAt: template.updated_at
        };
      }
    };
    templateModel = new TemplateModel();
    template_default = templateModel;
  }
});

// src/templates/manager.ts
var require_manager6 = __commonJS({
  "src/templates/manager.ts"(exports2, module2) {
    "use strict";
    init_template();
    init_logger();
    var TemplateManager = class {
      /**
       * Create a new template
       */
      async create(options) {
        const {
          name,
          subject,
          text,
          html,
          variables,
          accountId,
          isEnabled = true
        } = options;
        if (!name) {
          throw new Error("Template name is required");
        }
        if (!subject) {
          throw new Error("Template subject is required");
        }
        if (!text && !html) {
          throw new Error("Template content (text or html) is required");
        }
        const templateData = {
          name,
          subject,
          bodyText: text,
          bodyHtml: html,
          variables: variables || this._extractVariables(subject, text, html),
          accountId,
          isEnabled
        };
        const id = template_default.create(templateData);
        logger_default.info("Template created", { id, name });
        return id;
      }
      /**
       * Get template by ID
       */
      async getById(id) {
        return template_default.findById(id);
      }
      /**
       * Get template by name
       */
      async getByName(name, accountId = null) {
        return template_default.findByName(name, accountId);
      }
      /**
       * Get all templates
       */
      async getAll(accountId = null) {
        return template_default.findAll(accountId);
      }
      /**
       * Update template
       */
      async update(id, options) {
        const template = template_default.findById(id);
        if (!template) {
          throw new Error(`Template not found: ${id}`);
        }
        const updateData = {};
        if (options.name !== void 0) {
          updateData.name = options.name;
        }
        if (options.subject !== void 0) {
          updateData.subject = options.subject;
        }
        if (options.text !== void 0) {
          updateData.bodyText = options.text;
        }
        if (options.html !== void 0) {
          updateData.bodyHtml = options.html;
        }
        if (options.variables !== void 0) {
          updateData.variables = options.variables;
        }
        if (options.accountId !== void 0) {
          updateData.accountId = options.accountId;
        }
        if (options.isEnabled !== void 0) {
          updateData.isEnabled = options.isEnabled;
        }
        const updated = template_default.update(id, updateData);
        if (updated) {
          logger_default.info("Template updated", { id });
        }
        return updated;
      }
      /**
       * Delete template
       */
      async delete(id) {
        const template = template_default.findById(id);
        if (!template) {
          throw new Error(`Template not found: ${id}`);
        }
        const deleted = template_default.delete(id);
        if (deleted) {
          logger_default.info("Template deleted", { id, name: template.name });
        }
        return deleted;
      }
      /**
       * Render template with variables
       */
      async render(templateId, variables = {}) {
        const template = await this.getById(templateId);
        if (!template) {
          throw new Error(`Template not found: ${templateId}`);
        }
        return this.renderTemplate(template, variables);
      }
      /**
       * Render template object with variables
       */
      renderTemplate(template, variables = {}) {
        const defaultVars = {
          date: (/* @__PURE__ */ new Date()).toLocaleDateString(),
          time: (/* @__PURE__ */ new Date()).toLocaleTimeString(),
          datetime: (/* @__PURE__ */ new Date()).toLocaleString()
        };
        const allVars = { ...defaultVars, ...variables };
        let renderedSubject = template.subject;
        let renderedText = template.bodyText || "";
        let renderedHtml = template.bodyHtml || "";
        Object.keys(allVars).forEach((key) => {
          const regex = new RegExp(`\\{\\{${key}\\}\\}`, "g");
          const value = allVars[key] || "";
          renderedSubject = renderedSubject.replace(regex, value);
          renderedText = renderedText.replace(regex, value);
          renderedHtml = renderedHtml.replace(regex, value);
        });
        return {
          subject: renderedSubject,
          text: renderedText,
          html: renderedHtml
        };
      }
      /**
       * Extract variables from template content
       */
      _extractVariables(subject, text, html) {
        const variableRegex = /\{\{(\w+)\}\}/g;
        const variables = /* @__PURE__ */ new Set();
        const extractFromString = (str) => {
          if (!str) return;
          let match;
          while ((match = variableRegex.exec(str)) !== null) {
            variables.add(match[1]);
          }
        };
        extractFromString(subject);
        extractFromString(text);
        extractFromString(html);
        return Array.from(variables);
      }
      /**
       * Get template for email composition
       */
      async getForEmail(templateId, variables = {}) {
        return this.render(templateId, variables);
      }
    };
    module2.exports = new TemplateManager();
  }
});

// src/cli/commands/template.ts
var require_template = __commonJS({
  "src/cli/commands/template.ts"(exports2, module2) {
    "use strict";
    var import_chalk8 = __toESM(require("chalk"));
    var import_manager6 = __toESM(require_manager6());
    init_logger();
    async function templateCommand2(action, options = {}) {
      try {
        switch (action) {
          case "create":
            await createTemplate(options);
            break;
          case "list":
            await listTemplates(options);
            break;
          case "show":
            await showTemplate(options);
            break;
          case "edit":
            await editTemplate(options);
            break;
          case "delete":
            await deleteTemplate(options);
            break;
          case "use":
            await useTemplate(options);
            break;
          default:
            console.error(import_chalk8.default.red(`Unknown action: ${action}`));
            console.log("Available actions: create, list, show, edit, delete, use");
            process.exit(1);
        }
      } catch (error2) {
        logger_default.error("Template command failed", { action, error: error2.message });
        console.error(import_chalk8.default.red(`Error: ${error2.message}`));
        process.exit(1);
      }
    }
    async function createTemplate(options) {
      const { name, subject, text, html, account } = options;
      if (!name) {
        throw new Error("Template name is required (--name)");
      }
      if (!subject) {
        throw new Error("Template subject is required (--subject)");
      }
      if (!text && !html) {
        throw new Error("Template content is required (--text or --html)");
      }
      const id = await import_manager6.default.create({
        name,
        subject,
        text,
        html,
        accountId: account
      });
      console.log(import_chalk8.default.green(`\u2713 Template created successfully`));
      console.log(`  ID: ${id}`);
      console.log(`  Name: ${name}`);
      console.log(`  Subject: ${subject}`);
    }
    async function listTemplates(options) {
      const { account } = options;
      const templates = await import_manager6.default.getAll(account);
      if (templates.length === 0) {
        console.log(import_chalk8.default.yellow("No templates found"));
        return;
      }
      console.log(import_chalk8.default.bold(`
Templates (${templates.length}):
`));
      templates.forEach((tpl) => {
        const enabledBadge = tpl.isEnabled ? import_chalk8.default.green(" [ENABLED]") : import_chalk8.default.gray(" [DISABLED]");
        const accountInfo = tpl.accountId ? import_chalk8.default.gray(` (Account: ${tpl.accountId})`) : "";
        console.log(
          `${import_chalk8.default.cyan(`#${tpl.id}`)} ${import_chalk8.default.bold(tpl.name)}${enabledBadge}${accountInfo}`
        );
        console.log(import_chalk8.default.gray(`  Subject: ${tpl.subject}`));
        if (tpl.variables && tpl.variables.length > 0) {
          console.log(import_chalk8.default.gray(`  Variables: ${tpl.variables.join(", ")}`));
        }
        if (tpl.bodyText) {
          const preview = tpl.bodyText.substring(0, 60).replace(/\n/g, " ");
          console.log(
            import_chalk8.default.gray(`  Text: ${preview}${tpl.bodyText.length > 60 ? "..." : ""}`)
          );
        }
        if (tpl.bodyHtml) {
          console.log(import_chalk8.default.gray(`  HTML: Yes`));
        }
        console.log(
          import_chalk8.default.gray(`  Created: ${new Date(tpl.createdAt).toLocaleString()}`)
        );
        console.log();
      });
    }
    async function showTemplate(options) {
      const { id, name } = options;
      if (!id && !name) {
        throw new Error("Template ID (--id) or name (--name) is required");
      }
      let template;
      if (id) {
        template = await import_manager6.default.getById(id);
      } else {
        template = await import_manager6.default.getByName(name);
      }
      if (!template) {
        console.log(import_chalk8.default.yellow(`Template not found`));
        return;
      }
      console.log(import_chalk8.default.bold(`
Template #${template.id}: ${template.name}
`));
      console.log(`${import_chalk8.default.bold("Subject:")} ${template.subject}`);
      console.log(
        `${import_chalk8.default.bold("Status:")} ${template.isEnabled ? import_chalk8.default.green("Enabled") : import_chalk8.default.gray("Disabled")}`
      );
      if (template.accountId) {
        console.log(`${import_chalk8.default.bold("Account ID:")} ${template.accountId}`);
      }
      if (template.variables && template.variables.length > 0) {
        console.log(`${import_chalk8.default.bold("Variables:")} ${template.variables.join(", ")}`);
      }
      if (template.bodyText) {
        console.log(`
${import_chalk8.default.bold("Text Content:")}`);
        console.log(import_chalk8.default.gray(template.bodyText));
      }
      if (template.bodyHtml) {
        console.log(`
${import_chalk8.default.bold("HTML Content:")}`);
        console.log(import_chalk8.default.gray(template.bodyHtml));
      }
      console.log(
        `
${import_chalk8.default.gray("Created:")} ${new Date(template.createdAt).toLocaleString()}`
      );
      console.log(
        `${import_chalk8.default.gray("Updated:")} ${new Date(template.updatedAt).toLocaleString()}`
      );
    }
    async function editTemplate(options) {
      const { id, name, subject, text, html, account, enabled } = options;
      if (!id) {
        throw new Error("Template ID is required (--id)");
      }
      const updateData = {};
      if (name !== void 0) updateData.name = name;
      if (subject !== void 0) updateData.subject = subject;
      if (text !== void 0) updateData.text = text;
      if (html !== void 0) updateData.html = html;
      if (account !== void 0) updateData.accountId = account;
      if (enabled !== void 0) updateData.isEnabled = enabled;
      if (Object.keys(updateData).length === 0) {
        throw new Error("No update data provided");
      }
      const updated = await import_manager6.default.update(id, updateData);
      if (updated) {
        console.log(import_chalk8.default.green(`\u2713 Template #${id} updated successfully`));
      } else {
        console.log(import_chalk8.default.yellow(`No changes made to template #${id}`));
      }
    }
    async function deleteTemplate(options) {
      const { id } = options;
      if (!id) {
        throw new Error("Template ID is required (--id)");
      }
      const deleted = await import_manager6.default.delete(id);
      if (deleted) {
        console.log(import_chalk8.default.green(`\u2713 Template #${id} deleted successfully`));
      } else {
        console.log(import_chalk8.default.yellow(`Template #${id} not found`));
      }
    }
    async function useTemplate(options) {
      const { id, name, vars } = options;
      if (!id && !name) {
        throw new Error("Template ID (--id) or name (--name) is required");
      }
      let template;
      if (id) {
        template = await import_manager6.default.getById(id);
      } else {
        template = await import_manager6.default.getByName(name);
      }
      if (!template) {
        console.log(import_chalk8.default.yellow(`Template not found`));
        return;
      }
      const variables = {};
      if (vars) {
        vars.split(",").forEach((pair) => {
          const [key, value] = pair.split("=");
          if (key && value) {
            variables[key.trim()] = value.trim();
          }
        });
      }
      const rendered = import_manager6.default.renderTemplate(template, variables);
      console.log(import_chalk8.default.bold(`
Rendered Email:
`));
      console.log(`${import_chalk8.default.bold("Subject:")} ${rendered.subject}`);
      if (rendered.text) {
        console.log(`
${import_chalk8.default.bold("Text Content:")}`);
        console.log(rendered.text);
      }
      if (rendered.html) {
        console.log(`
${import_chalk8.default.bold("HTML Content:")}`);
        console.log(import_chalk8.default.gray(rendered.html));
      }
      if (template.variables && template.variables.length > 0) {
        const missingVars = template.variables.filter(
          (v) => !variables[v] && !["date", "time", "datetime"].includes(v)
        );
        if (missingVars.length > 0) {
          console.log(
            import_chalk8.default.yellow(`
Note: Missing variables: ${missingVars.join(", ")}`)
          );
        }
      }
    }
    module2.exports = templateCommand2;
  }
});

// src/cli/index.ts
var import_chalk7 = __toESM(require("chalk"));
var import_commander2 = require("commander");

// package.json
var package_default = {
  name: "open-mail-cli",
  version: "1.0.5",
  description: "A command-line email client with IMAP/SMTP support",
  main: "dist/index.js",
  bin: {
    "mail-cli": "./dist/index.js"
  },
  scripts: {
    build: "tsup",
    dev: "tsup --watch",
    start: "tsx src/index.ts",
    test: "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage",
    "type-check": "tsc --noEmit",
    lint: "eslint src tests --ext .ts",
    "lint:fix": "eslint src tests --ext .ts --fix",
    format: 'prettier --write ".src/**/*.ts" ".tests/**/*.ts"',
    "format:check": 'prettier --check ".src/**/*.ts" ".tests/**/*.ts"',
    prepare: "husky",
    "build:binary": "pnpm build && pkg dist/index.js --targets node18-macos-x64,node18-macos-arm64,node18-linux-x64,node18-linux-arm64,node18-win-x64 --output dist/binary/open-mail-cli",
    "build:binary:macos": "pnpm build && pkg dist/index.js --targets node18-macos-arm64 --output dist/binary/open-mail-cli-macos",
    "build:binary:linux": "pnpm build && pkg dist/index.js --targets node18-linux-x64 --output dist/binary/open-mail-cli-linux",
    "build:binary:windows": "pnpm build && pkg dist/index.js --targets node18-win-x64 --output dist/binary/open-mail-cli.exe",
    prepublishOnly: "pnpm build && pnpm lint"
  },
  "lint-staged": {
    "src/**/*.ts": [
      "eslint --fix",
      "prettier --write"
    ],
    "tests/**/*.ts": [
      "eslint --fix",
      "prettier --write"
    ]
  },
  keywords: [
    "email",
    "imap",
    "smtp",
    "cli",
    "email-cli"
  ],
  author: "",
  license: "MIT",
  engines: {
    node: ">=18.0.0"
  },
  dependencies: {
    "@hono/node-server": "^1.19.9",
    "@hono/swagger-ui": "^0.5.3",
    "@hono/zod-openapi": "^1.2.1",
    "@hono/zod-validator": "^0.7.6",
    "better-sqlite3": "^9.0.0",
    chalk: "^4.1.2",
    "cli-table3": "^0.6.3",
    commander: "^11.1.0",
    dotenv: "^16.3.1",
    hono: "^4.11.9",
    inquirer: "^8.2.6",
    mailparser: "^3.6.5",
    "node-imap": "^0.9.6",
    "node-notifier": "^10.0.1",
    nodemailer: "^6.9.7",
    ora: "^5.4.1",
    prompts: "^2.4.2",
    zod: "^4.3.6"
  },
  devDependencies: {
    "@types/better-sqlite3": "^7.6.13",
    "@types/inquirer": "^9.0.9",
    "@types/mailparser": "^3.4.6",
    "@types/node": "^25.2.2",
    "@types/node-notifier": "^8.0.5",
    "@types/nodemailer": "^7.0.9",
    "@typescript-eslint/eslint-plugin": "^8.54.0",
    "@typescript-eslint/parser": "^8.54.0",
    "@vitest/coverage-v8": "^4.0.18",
    eslint: "^8.54.0",
    "eslint-plugin-import": "^2.32.0",
    husky: "^9.1.7",
    jest: "^29.7.0",
    "lint-staged": "^16.2.7",
    pkg: "^5.8.1",
    prettier: "^3.8.1",
    tsup: "^8.5.1",
    tsx: "^4.21.0",
    typescript: "^5.9.3",
    vitest: "^4.0.18"
  },
  packageManager: "pnpm@10.15.1+sha512.34e538c329b5553014ca8e8f4535997f96180a1d0f614339357449935350d924e22f8614682191264ec33d1462ac21561aff97f6bb18065351c162c7e8f6de67",
  files: [
    "dist",
    "README.md",
    "LICENSE"
  ]
};

// src/cli/index.ts
var import_account2 = __toESM(require_account());
var import_config3 = __toESM(require_config());
var import_contact = __toESM(require_contact());

// src/cli/commands/delete.ts
var import_chalk = __toESM(require("chalk"));
init_config();
init_client();
init_email();
init_logger();
async function deleteCommand(emailId, options) {
  try {
    const permanent = options.permanent || false;
    const email = email_default.findById(emailId);
    if (!email) {
      console.error(import_chalk.default.red(`Error: Email with ID ${emailId} not found`));
      process.exit(1);
    }
    if (email.isDeleted && !permanent) {
      console.log(
        import_chalk.default.yellow(
          "Email is already in trash. Use --permanent to delete permanently."
        )
      );
      return;
    }
    if (permanent) {
      const confirmMsg = options.yes ? "y" : await promptConfirm(
        "Are you sure you want to permanently delete this email? This cannot be undone. (y/n): "
      );
      if (confirmMsg.toLowerCase() !== "y") {
        console.log(import_chalk.default.yellow("Delete cancelled"));
        return;
      }
      const cfg = config_default.load();
      if (cfg.imap.host && cfg.imap.user && cfg.imap.password) {
        const imapClient = new client_default({
          user: cfg.imap.user,
          password: cfg.imap.password,
          host: cfg.imap.host,
          port: cfg.imap.port,
          secure: cfg.imap.secure
        });
        try {
          await imapClient.connect();
          await imapClient.openFolder(email.folder, false);
          await imapClient.deleteEmail(email.uid, true);
          await imapClient.disconnect();
        } catch (imapError) {
          logger_default.warn("IMAP delete failed, continuing with local delete", {
            error: imapError.message
          });
        }
      }
      email_default.permanentlyDelete(emailId);
      console.log(import_chalk.default.green(`Email ${emailId} permanently deleted`));
      logger_default.info("Email permanently deleted", { emailId });
    } else {
      const cfg = config_default.load();
      if (cfg.imap.host && cfg.imap.user && cfg.imap.password) {
        const imapClient = new client_default({
          user: cfg.imap.user,
          password: cfg.imap.password,
          host: cfg.imap.host,
          port: cfg.imap.port,
          secure: cfg.imap.secure
        });
        try {
          await imapClient.connect();
          await imapClient.openFolder(email.folder, false);
          await imapClient.deleteEmail(email.uid, false);
          await imapClient.disconnect();
        } catch (imapError) {
          logger_default.warn(
            "IMAP move to trash failed, continuing with local operation",
            { error: imapError.message }
          );
        }
      }
      email_default.markAsDeleted(emailId);
      console.log(import_chalk.default.green(`Email ${emailId} moved to trash`));
      logger_default.info("Email moved to trash", { emailId });
    }
  } catch (error2) {
    console.error(import_chalk.default.red(`Error deleting email: ${error2.message}`));
    logger_default.error("Delete command failed", { error: error2.message });
    process.exit(1);
  }
}
function promptConfirm(message) {
  return new Promise((resolve) => {
    const readline = require("readline").createInterface({
      input: process.stdin,
      output: process.stdout
    });
    readline.question(message, (answer) => {
      readline.close();
      resolve(answer);
    });
  });
}

// src/cli/index.ts
var import_draft = __toESM(require_draft());
var import_folder2 = __toESM(require_folder());
var import_forward = __toESM(require_forward());

// src/cli/commands/import-export.ts
var import_path3 = __toESM(require("path"));
var import_commander = require("commander");
var import_ora = __toESM(require("ora"));
var import_manager3 = __toESM(require_manager());
var import_manager4 = __toESM(require_manager4());
init_logger();
var importExportCommand = new import_commander.Command("export");
importExportCommand.description("Import and export emails");
importExportCommand.command("email <id> <file>").description("Export a single email to EML format").action(async (id, file) => {
  const spinner = (0, import_ora.default)("Exporting email...").start();
  try {
    const emailId = parseInt(id);
    const filePath = import_path3.default.resolve(file);
    await import_manager4.default.exportEmailToEml(emailId, filePath);
    spinner.succeed(`Email exported to ${filePath}`);
  } catch (error2) {
    spinner.fail("Export failed");
    logger_default.error("Failed to export email", { error: error2.message });
    console.error(`Error: ${error2.message}`);
    process.exit(1);
  }
});
importExportCommand.command("folder <folder> <file>").description("Export a folder to MBOX format").action(async (folder, file) => {
  const spinner = (0, import_ora.default)("Exporting folder...").start();
  try {
    const filePath = import_path3.default.resolve(file);
    let lastProgress = 0;
    const count = await import_manager4.default.exportFolderToMbox(
      folder,
      filePath,
      (current, total) => {
        const progress = Math.floor(current / total * 100);
        if (progress !== lastProgress) {
          spinner.text = `Exporting folder... ${current}/${total} (${progress}%)`;
          lastProgress = progress;
        }
      }
    );
    spinner.succeed(
      `Exported ${count} emails from folder "${folder}" to ${filePath}`
    );
  } catch (error2) {
    spinner.fail("Export failed");
    logger_default.error("Failed to export folder", { error: error2.message });
    console.error(`Error: ${error2.message}`);
    process.exit(1);
  }
});
importExportCommand.command("all <file>").description("Export all emails to MBOX format").action(async (file) => {
  const spinner = (0, import_ora.default)("Exporting all emails...").start();
  try {
    const filePath = import_path3.default.resolve(file);
    let lastProgress = 0;
    const count = await import_manager4.default.exportAllToMbox(
      filePath,
      (current, total) => {
        const progress = Math.floor(current / total * 100);
        if (progress !== lastProgress) {
          spinner.text = `Exporting all emails... ${current}/${total} (${progress}%)`;
          lastProgress = progress;
        }
      }
    );
    spinner.succeed(`Exported ${count} emails to ${filePath}`);
  } catch (error2) {
    spinner.fail("Export failed");
    logger_default.error("Failed to export all emails", { error: error2.message });
    console.error(`Error: ${error2.message}`);
    process.exit(1);
  }
});
var importCommand = new import_commander.Command("import");
importCommand.description("Import emails from files");
importCommand.command("eml <file>").description("Import an EML file").option("-f, --folder <folder>", "Target folder", "INBOX").option("-a, --account <id>", "Account ID").action(async (file, options) => {
  const spinner = (0, import_ora.default)("Importing EML file...").start();
  try {
    const filePath = import_path3.default.resolve(file);
    let accountId = null;
    if (options.account) {
      accountId = parseInt(options.account);
    } else {
      const defaultAccount = import_manager3.default.getDefaultAccount();
      if (defaultAccount) {
        accountId = defaultAccount.id;
      }
    }
    const result = await import_manager4.default.importEml(
      filePath,
      options.folder,
      accountId
    );
    if (result.success) {
      spinner.succeed(
        `Email imported successfully (ID: ${result.emailId}, Attachments: ${result.attachmentCount})`
      );
    } else {
      spinner.warn(
        `Email skipped: ${result.reason} (Message-ID: ${result.messageId})`
      );
    }
  } catch (error2) {
    spinner.fail("Import failed");
    logger_default.error("Failed to import EML file", { error: error2.message });
    console.error(`Error: ${error2.message}`);
    process.exit(1);
  }
});
importCommand.command("mbox <file>").description("Import an MBOX file").option("-f, --folder <folder>", "Target folder", "INBOX").option("-a, --account <id>", "Account ID").action(async (file, options) => {
  const spinner = (0, import_ora.default)("Importing MBOX file...").start();
  try {
    const filePath = import_path3.default.resolve(file);
    let accountId = null;
    if (options.account) {
      accountId = parseInt(options.account);
    } else {
      const defaultAccount = import_manager3.default.getDefaultAccount();
      if (defaultAccount) {
        accountId = defaultAccount.id;
      }
    }
    const result = await import_manager4.default.importMbox(
      filePath,
      options.folder,
      accountId,
      (progress) => {
        spinner.text = `Importing MBOX... Imported: ${progress.imported}, Skipped: ${progress.skipped}, Errors: ${progress.errors}`;
      }
    );
    spinner.succeed(
      `MBOX import completed: ${result.imported} imported, ${result.skipped} skipped, ${result.errors} errors`
    );
  } catch (error2) {
    spinner.fail("Import failed");
    logger_default.error("Failed to import MBOX file", { error: error2.message });
    console.error(`Error: ${error2.message}`);
    process.exit(1);
  }
});

// src/cli/index.ts
var import_list = __toESM(require_list());

// src/cli/commands/mark.ts
var import_chalk4 = __toESM(require("chalk"));
init_email();
init_logger();
function starCommand(emailId, options) {
  try {
    const id = parseInt(emailId);
    const email = email_default.findById(id);
    if (!email) {
      console.error(import_chalk4.default.red("Error:"), `Email with ID ${id} not found`);
      process.exit(1);
    }
    email_default.markAsStarred(id);
    console.log(import_chalk4.default.green("\u2713"), `Email #${id} marked as starred`);
    console.log(import_chalk4.default.gray(`  Subject: ${email.subject}`));
  } catch (error2) {
    console.error(import_chalk4.default.red("Error:"), error2.message);
    logger_default.error("Star command failed", { emailId, error: error2.message });
    process.exit(1);
  }
}
function unstarCommand(emailId, options) {
  try {
    const id = parseInt(emailId);
    const email = email_default.findById(id);
    if (!email) {
      console.error(import_chalk4.default.red("Error:"), `Email with ID ${id} not found`);
      process.exit(1);
    }
    email_default.unmarkAsStarred(id);
    console.log(import_chalk4.default.green("\u2713"), `Email #${id} unmarked as starred`);
    console.log(import_chalk4.default.gray(`  Subject: ${email.subject}`));
  } catch (error2) {
    console.error(import_chalk4.default.red("Error:"), error2.message);
    logger_default.error("Unstar command failed", { emailId, error: error2.message });
    process.exit(1);
  }
}
function flagCommand(emailId, options) {
  try {
    const id = parseInt(emailId);
    const email = email_default.findById(id);
    if (!email) {
      console.error(import_chalk4.default.red("Error:"), `Email with ID ${id} not found`);
      process.exit(1);
    }
    email_default.markAsImportant(id);
    console.log(import_chalk4.default.green("\u2713"), `Email #${id} marked as important (flagged)`);
    console.log(import_chalk4.default.gray(`  Subject: ${email.subject}`));
  } catch (error2) {
    console.error(import_chalk4.default.red("Error:"), error2.message);
    logger_default.error("Flag command failed", { emailId, error: error2.message });
    process.exit(1);
  }
}
function unflagCommand(emailId, options) {
  try {
    const id = parseInt(emailId);
    const email = email_default.findById(id);
    if (!email) {
      console.error(import_chalk4.default.red("Error:"), `Email with ID ${id} not found`);
      process.exit(1);
    }
    email_default.unmarkAsImportant(id);
    console.log(
      import_chalk4.default.green("\u2713"),
      `Email #${id} unmarked as important (unflagged)`
    );
    console.log(import_chalk4.default.gray(`  Subject: ${email.subject}`));
  } catch (error2) {
    console.error(import_chalk4.default.red("Error:"), error2.message);
    logger_default.error("Unflag command failed", { emailId, error: error2.message });
    process.exit(1);
  }
}

// src/cli/index.ts
var import_notify = __toESM(require_notify());
var import_read = __toESM(require_read());
var import_reply = __toESM(require_reply());
var import_search = __toESM(require_search());
var import_send = __toESM(require_send());

// src/cli/commands/serve.ts
var import_chalk5 = __toESM(require("chalk"));
var import_ora2 = __toESM(require("ora"));
init_database();

// src/api/server.ts
var import_node_server = require("@hono/node-server");
var import_zod_openapi = require("@hono/zod-openapi");
var import_logger27 = require("hono/logger");
var import_pretty_json = require("hono/pretty-json");
var import_swagger_ui = require("@hono/swagger-ui");

// src/api/routes/index.ts
var import_hono4 = require("hono");

// src/api/routes/emails.ts
var import_hono = require("hono");
var import_zod_validator = require("@hono/zod-validator");

// src/api/controllers/email.ts
init_email();
init_client2();
init_composer();
init_config();
init_logger();
async function list(c) {
  try {
    const folder = c.req.query("folder") || "INBOX";
    const limit = parseInt(c.req.query("limit") || "20", 10);
    const offset = parseInt(c.req.query("offset") || "0", 10);
    const emails = email_default.findByFolder(folder, { limit, offset });
    const total = email_default.countByFolder(folder);
    return c.json({
      data: emails,
      meta: { total, limit, offset }
    });
  } catch (error2) {
    logger_default.error("Failed to list emails", { error: error2.message });
    throw new Error("Failed to list emails");
  }
}
async function get(c) {
  try {
    const id = parseInt(c.req.param("id"), 10);
    if (isNaN(id)) {
      return c.json(
        { error: { code: "INVALID_ID", message: "Invalid email ID" } },
        400
      );
    }
    const email = email_default.findById(id);
    if (!email) {
      const error2 = new Error("Email not found");
      error2.name = "NotFoundError";
      throw error2;
    }
    return c.json({ data: email });
  } catch (error2) {
    logger_default.error("Failed to get email", { error: error2.message });
    throw error2;
  }
}
async function send(c) {
  try {
    const data = c.req.valid("json");
    const cfg = config_default.load();
    if (!cfg.smtp.host || !cfg.smtp.user || !cfg.smtp.password) {
      return c.json(
        {
          error: {
            code: "SMTP_NOT_CONFIGURED",
            message: "SMTP configuration incomplete"
          }
        },
        400
      );
    }
    const composer = new composer_default();
    composer.setTo([data.to]).setSubject(data.subject).setBody(data.body);
    if (data.cc) {
      composer.setCc(data.cc);
    }
    if (data.bcc) {
      composer.setBcc(data.bcc);
    }
    if (data.reply_to) {
      composer.setReplyTo(data.reply_to);
    }
    const emailData = composer.compose();
    const smtpClient = new client_default2(cfg.smtp);
    const result = await smtpClient.sendEmail(emailData);
    smtpClient.disconnect();
    return c.json(
      {
        data: {
          id: result.messageId,
          status: "sent",
          message_id: result.messageId,
          response: result.response
        }
      },
      201
    );
  } catch (error2) {
    logger_default.error("Failed to send email", { error: error2.message });
    throw new Error("Failed to send email");
  }
}
async function markRead(c) {
  try {
    const id = parseInt(c.req.param("id"), 10);
    if (isNaN(id)) {
      return c.json(
        { error: { code: "INVALID_ID", message: "Invalid email ID" } },
        400
      );
    }
    const isRead = c.req.query("read") === "true";
    email_default.markAsRead(id);
    return c.json({
      data: {
        id,
        is_read: isRead
      }
    });
  } catch (error2) {
    logger_default.error("Failed to mark email as read", {
      error: error2.message
    });
    throw new Error("Failed to mark email as read");
  }
}
async function star(c) {
  try {
    const id = parseInt(c.req.param("id"), 10);
    if (isNaN(id)) {
      return c.json(
        { error: { code: "INVALID_ID", message: "Invalid email ID" } },
        400
      );
    }
    const isStarred = c.req.query("starred") === "true";
    email_default.markAsStarred(id);
    return c.json({
      data: {
        id,
        is_starred: isStarred
      }
    });
  } catch (error2) {
    logger_default.error("Failed to star email", { error: error2.message });
    throw new Error("Failed to star email");
  }
}

// src/api/schemas/email.ts
var import_zod = require("zod");
var SendEmailSchema = import_zod.z.object({
  to: import_zod.z.string().email("Invalid email address"),
  subject: import_zod.z.string().min(1, "Subject is required"),
  body: import_zod.z.string().min(1, "Body is required"),
  cc: import_zod.z.array(import_zod.z.string().email()).optional(),
  bcc: import_zod.z.array(import_zod.z.string().email()).optional(),
  reply_to: import_zod.z.string().optional()
});

// src/api/routes/emails.ts
var app = new import_hono.Hono();
app.get("/", list);
app.get("/:id", get);
app.post("/", (0, import_zod_validator.zValidator)("json", SendEmailSchema), send);
app.post("/:id/mark-read", markRead);
app.post("/:id/star", star);
var emails_default = app;

// src/api/routes/accounts.ts
var import_hono2 = require("hono");
var import_zod_validator2 = require("@hono/zod-validator");

// src/api/controllers/account.ts
var import_manager5 = __toESM(require_manager());
init_logger();
async function list2(c) {
  try {
    const accounts = import_manager5.default.getAllAccounts();
    return c.json({
      data: (accounts || []).map(
        (acc) => ({
          id: acc.id,
          email: acc.email,
          name: acc.name,
          enabled: acc.enabled
        })
      )
    });
  } catch (error2) {
    logger_default.error("Failed to list accounts", {
      error: error2.message
    });
    throw new Error("Failed to list accounts");
  }
}
async function get2(c) {
  try {
    const id = parseInt(c.req.param("id"), 10);
    if (isNaN(id)) {
      return c.json(
        { error: { code: "INVALID_ID", message: "Invalid account ID" } },
        400
      );
    }
    const account = import_manager5.default.getAccount(id);
    if (!account) {
      const error2 = new Error("Account not found");
      error2.name = "NotFoundError";
      throw error2;
    }
    return c.json({
      data: {
        id: account.id,
        email: account.email,
        name: account.name,
        enabled: account.enabled
      }
    });
  } catch (error2) {
    logger_default.error("Failed to get account", { error: error2.message });
    throw error2;
  }
}
async function add(c) {
  try {
    const data = await c.req.json();
    const accountId = await import_manager5.default.addAccount(data);
    const account = import_manager5.default.getAccount(accountId);
    if (!account) {
      return c.json(
        {
          error: {
            code: "ACCOUNT_NOT_CREATED",
            message: "Failed to create account"
          }
        },
        500
      );
    }
    return c.json(
      {
        data: {
          id: account.id,
          email: data.email
        }
      },
      201
    );
  } catch (error2) {
    logger_default.error("Failed to add account", { error: error2.message });
    throw new Error("Failed to add account");
  }
}

// src/api/schemas/account.ts
var import_zod2 = require("zod");
var AddAccountSchema = import_zod2.z.object({
  email: import_zod2.z.string().email("Invalid email address"),
  name: import_zod2.z.string().min(1, "Name is required"),
  imap_host: import_zod2.z.string().min(1, "IMAP host is required"),
  imap_port: import_zod2.z.number().int().min(1).max(65535),
  imap_secure: import_zod2.z.boolean().default(true),
  smtp_host: import_zod2.z.string().min(1, "SMTP host is required"),
  smtp_port: import_zod2.z.number().int().min(1).max(65535),
  smtp_secure: import_zod2.z.boolean().default(true),
  username: import_zod2.z.string().min(1, "Username is required"),
  password: import_zod2.z.string().min(1, "Password is required")
});

// src/api/routes/accounts.ts
var app2 = new import_hono2.Hono();
app2.get("/", list2);
app2.get("/:id", get2);
app2.post("/", (0, import_zod_validator2.zValidator)("json", AddAccountSchema), add);
var accounts_default = app2;

// src/api/routes/sync.ts
var import_hono3 = require("hono");

// src/api/controllers/sync.ts
var import_account_manager = __toESM(require_account_manager());
init_logger();
var syncJobs = /* @__PURE__ */ new Map();
async function trigger(c) {
  try {
    const accountIdStr = c.req.query("account_id");
    const folder = c.req.query("folder");
    const jobId = `sync-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    syncJobs.set(jobId, { status: "started" });
    const accountId = accountIdStr ? parseInt(accountIdStr, 10) : void 0;
    import_account_manager.default.syncAccount(accountId, folder).then(() => {
      syncJobs.set(jobId, { status: "completed" });
    }).catch((error2) => {
      syncJobs.set(jobId, { status: "failed", error: error2.message });
    });
    return c.json({
      data: {
        job_id: jobId,
        status: "started"
      }
    });
  } catch (error2) {
    logger_default.error("Failed to trigger sync", { error: error2.message });
    throw new Error("Failed to trigger sync");
  }
}
async function getStatus(c) {
  try {
    const jobId = c.req.query("job_id");
    if (!jobId) {
      return c.json(
        { error: { code: "MISSING_JOB_ID", message: "Job ID is required" } },
        400
      );
    }
    const job = syncJobs.get(jobId);
    if (!job) {
      return c.json(
        { error: { code: "JOB_NOT_FOUND", message: "Sync job not found" } },
        404
      );
    }
    return c.json({
      data: {
        job_id: jobId,
        ...job
      }
    });
  } catch (error2) {
    logger_default.error("Failed to get sync status", {
      error: error2.message
    });
    throw new Error("Failed to get sync status");
  }
}

// src/api/routes/sync.ts
var app3 = new import_hono3.Hono();
app3.post("/", trigger);
app3.get("/status", getStatus);
var sync_default2 = app3;

// src/api/routes/index.ts
var app4 = new import_hono4.Hono();
app4.route("/emails", emails_default);
app4.route("/accounts", accounts_default);
app4.route("/sync", sync_default2);
var routes_default = app4;

// src/api/middlewares/error.ts
var errorHandler = (err, c) => {
  console.error("API Error:", err);
  if (err.name === "NotFoundError") {
    return c.json(
      {
        error: {
          code: "NOT_FOUND",
          message: err.message
        }
      },
      404
    );
  }
  if (err.name === "ValidationError") {
    return c.json(
      {
        error: {
          code: "VALIDATION_ERROR",
          message: err.message
        }
      },
      400
    );
  }
  return c.json(
    {
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: "An unexpected error occurred"
      }
    },
    500
  );
};

// src/api/middlewares/localhost.ts
init_logger();
var localhostOnly = async (c, next) => {
  const clientIP = c.req.header("x-forwarded-for") || c.req.header("x-real-ip") || "127.0.0.1";
  if (clientIP !== "127.0.0.1" && clientIP !== "::1" && clientIP !== "localhost") {
    logger_default.warn("Access denied from non-localhost IP", { ip: clientIP });
    return c.json(
      {
        error: {
          code: "ACCESS_DENIED",
          message: "Access is only allowed from localhost"
        }
      },
      403
    );
  }
  await next();
  return;
};

// src/api/server.ts
init_logger();
var app5 = new import_zod_openapi.OpenAPIHono();
app5.use("*", (0, import_logger27.logger)());
app5.use("*", (0, import_pretty_json.prettyJSON)());
app5.use("*", localhostOnly());
app5.route("/api", routes_default);
app5.onError(errorHandler);
app5.doc("/api/openapi.json", {
  openapi: "3.0.0",
  info: {
    title: "Open Mail CLI API",
    version: "1.0.0",
    description: "HTTP API for Open Mail CLI - Local email management via RESTful interface"
  }
});
app5.get("/api/docs", (0, import_swagger_ui.swaggerUI)({ url: "/api/openapi.json" }));
app5.get(
  "/health",
  (c) => c.json({ status: "ok", timestamp: (/* @__PURE__ */ new Date()).toISOString() })
);
function startServer(port = 3e3, hostname = "127.0.0.1") {
  try {
    const server = (0, import_node_server.serve)({
      fetch: app5.fetch,
      port,
      hostname
    });
    logger_default.info(`API Server running at http://${hostname}:${port}`);
    logger_default.info(
      `API Documentation available at http://${hostname}:${port}/api/docs`
    );
    return server;
  } catch (error2) {
    logger_default.error("Failed to start API server", {
      error: error2.message
    });
    throw error2;
  }
}

// src/cli/commands/serve.ts
init_logger();
var DEFAULT_PORT = 3e3;
var DEFAULT_HOSTNAME = "127.0.0.1";
async function serveCommand(options) {
  const spinner = (0, import_ora2.default)();
  const port = options.port || DEFAULT_PORT;
  const hostname = options["allow-remote"] ? "0.0.0.0" : options.host || DEFAULT_HOSTNAME;
  try {
    spinner.start("Initializing database...");
    database_default.getDb();
    spinner.succeed("Database initialized");
    spinner.start(`Starting API server at http://${hostname}:${port}...`);
    startServer(port, hostname);
    spinner.succeed(
      import_chalk5.default.green(
        `API server is running at ${import_chalk5.default.cyan(`http://${hostname}:${port}`)}`
      )
    );
    console.log("");
    console.log(import_chalk5.default.bold("Available endpoints:"));
    console.log(
      import_chalk5.default.cyan(`  \u2022 Health check:     http://${hostname}:${port}/health`)
    );
    console.log(
      import_chalk5.default.cyan(`  \u2022 API docs:         http://${hostname}:${port}/api/docs`)
    );
    console.log(
      import_chalk5.default.cyan(
        `  \u2022 OpenAPI spec:     http://${hostname}:${port}/api/openapi.json`
      )
    );
    console.log("");
    console.log(import_chalk5.default.bold("API endpoints:"));
    console.log(import_chalk5.default.cyan(`  \u2022 GET  /api/emails           List emails`));
    console.log(import_chalk5.default.cyan(`  \u2022 GET  /api/emails/:id       Get email details`));
    console.log(import_chalk5.default.cyan(`  \u2022 POST /api/emails           Send email`));
    console.log(
      import_chalk5.default.cyan(`  \u2022 POST /api/emails/:id/mark-read   Mark as read`)
    );
    console.log(import_chalk5.default.cyan(`  \u2022 POST /api/emails/:id/star         Star email`));
    console.log(import_chalk5.default.cyan(`  \u2022 GET  /api/accounts         List accounts`));
    console.log(import_chalk5.default.cyan(`  \u2022 POST /api/accounts         Add account`));
    console.log(import_chalk5.default.cyan(`  \u2022 POST /api/sync             Trigger sync`));
    console.log(import_chalk5.default.cyan(`  \u2022 GET  /api/sync/status      Get sync status`));
    console.log("");
    logger_default.info("API Server started", { port, hostname });
  } catch (error2) {
    spinner.fail(import_chalk5.default.red("Failed to start API server"));
    logger_default.error("Serve command failed", { error: error2.message });
    console.error(import_chalk5.default.red("Error:"), error2.message);
    process.exit(1);
  }
}
var serve_default = serveCommand;

// src/cli/index.ts
var import_signature = __toESM(require_signature());
var import_spam = __toESM(require_spam());
var import_sync2 = __toESM(require_sync());
var import_tag = __toESM(require_tag());
var import_template = __toESM(require_template());
init_thread();

// src/cli/commands/trash.ts
var import_chalk6 = __toESM(require("chalk"));
var import_cli_table3 = __toESM(require("cli-table3"));
init_email();
init_logger();
function listTrashCommand(options) {
  try {
    const limit = options.limit || 50;
    const offset = options.offset || 0;
    const deletedEmails = email_default.findDeleted({ limit, offset });
    const totalCount = email_default.countDeleted();
    if (deletedEmails.length === 0) {
      console.log(import_chalk6.default.yellow("Trash is empty"));
      return;
    }
    const table = new import_cli_table3.default({
      head: [
        import_chalk6.default.cyan("ID"),
        import_chalk6.default.cyan("From"),
        import_chalk6.default.cyan("Subject"),
        import_chalk6.default.cyan("Deleted At"),
        import_chalk6.default.cyan("Folder")
      ],
      colWidths: [8, 30, 40, 20, 15]
    });
    deletedEmails.forEach((email) => {
      table.push([
        email.id,
        truncate2(email.from, 28),
        truncate2(email.subject, 38),
        formatDate2(email.deletedAt),
        email.folder
      ]);
    });
    console.log(import_chalk6.default.bold("\nTrash:"));
    console.log(table.toString());
    console.log(
      import_chalk6.default.gray(
        `
Showing ${deletedEmails.length} of ${totalCount} deleted emails`
      )
    );
    if (totalCount > limit) {
      console.log(import_chalk6.default.gray(`Use --limit and --offset to see more`));
    }
    logger_default.info("Trash listed", {
      count: deletedEmails.length,
      total: totalCount
    });
  } catch (error2) {
    console.error(import_chalk6.default.red(`Error listing trash: ${error2.message}`));
    logger_default.error("List trash command failed", { error: error2.message });
    process.exit(1);
  }
}
async function emptyTrashCommand(options) {
  try {
    const count = email_default.countDeleted();
    if (count === 0) {
      console.log(import_chalk6.default.yellow("Trash is already empty"));
      return;
    }
    const confirmMsg = options.yes ? "y" : await promptConfirm2(
      `Are you sure you want to permanently delete ${count} emails from trash? This cannot be undone. (y/n): `
    );
    if (confirmMsg.toLowerCase() !== "y") {
      console.log(import_chalk6.default.yellow("Empty trash cancelled"));
      return;
    }
    const deletedCount = email_default.emptyTrash();
    console.log(
      import_chalk6.default.green(`Trash emptied: ${deletedCount} emails permanently deleted`)
    );
    logger_default.info("Trash emptied", { deletedCount });
  } catch (error2) {
    console.error(import_chalk6.default.red(`Error emptying trash: ${error2.message}`));
    logger_default.error("Empty trash command failed", { error: error2.message });
    process.exit(1);
  }
}
function restoreCommand(emailId, options) {
  try {
    const email = email_default.findById(emailId);
    if (!email) {
      console.error(import_chalk6.default.red(`Error: Email with ID ${emailId} not found`));
      process.exit(1);
    }
    if (!email.isDeleted) {
      console.log(import_chalk6.default.yellow("Email is not in trash"));
      return;
    }
    email_default.restoreDeleted(emailId);
    console.log(import_chalk6.default.green(`Email ${emailId} restored from trash`));
    logger_default.info("Email restored", { emailId });
  } catch (error2) {
    console.error(import_chalk6.default.red(`Error restoring email: ${error2.message}`));
    logger_default.error("Restore command failed", { error: error2.message });
    process.exit(1);
  }
}
function batchRestoreCommand(emailIds, options) {
  try {
    const ids = emailIds.split(",").map((id) => parseInt(id.trim())).filter((id) => !isNaN(id));
    if (ids.length === 0) {
      console.error(import_chalk6.default.red("Error: No valid email IDs provided"));
      process.exit(1);
    }
    let successCount = 0;
    let failCount = 0;
    for (const id of ids) {
      try {
        const email = email_default.findById(id);
        if (!email) {
          console.log(import_chalk6.default.yellow(`Email ${id} not found, skipping`));
          failCount++;
          continue;
        }
        if (!email.isDeleted) {
          console.log(import_chalk6.default.yellow(`Email ${id} is not in trash, skipping`));
          failCount++;
          continue;
        }
        email_default.restoreDeleted(id);
        successCount++;
      } catch (error2) {
        console.log(
          import_chalk6.default.yellow(`Failed to restore email ${id}: ${error2.message}`)
        );
        failCount++;
      }
    }
    console.log(import_chalk6.default.green(`
Batch restore completed:`));
    console.log(import_chalk6.default.green(`  Success: ${successCount}`));
    if (failCount > 0) {
      console.log(import_chalk6.default.yellow(`  Failed: ${failCount}`));
    }
    logger_default.info("Batch restore completed", { successCount, failCount });
  } catch (error2) {
    console.error(import_chalk6.default.red(`Error in batch restore: ${error2.message}`));
    logger_default.error("Batch restore command failed", { error: error2.message });
    process.exit(1);
  }
}
async function trashCommand(action, args, options) {
  switch (action) {
    case "list":
      listTrashCommand(options);
      break;
    case "empty":
      await emptyTrashCommand(options);
      break;
    case "restore":
      if (!args) {
        console.error(import_chalk6.default.red("Error: Email ID required for restore"));
        process.exit(1);
      }
      if (args.includes(",")) {
        batchRestoreCommand(args, options);
      } else {
        restoreCommand(parseInt(args), options);
      }
      break;
    default:
      console.error(import_chalk6.default.red(`Error: Unknown trash action: ${action}`));
      console.log(import_chalk6.default.yellow("Available actions: list, empty, restore"));
      process.exit(1);
  }
}
function truncate2(str, maxLength) {
  if (!str) return "";
  if (str.length <= maxLength) return str;
  return str.substring(0, maxLength - 3) + "...";
}
function formatDate2(dateString) {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  return date.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}
function promptConfirm2(message) {
  return new Promise((resolve) => {
    const readline = require("readline").createInterface({
      input: process.stdin,
      output: process.stdout
    });
    readline.question(message, (answer) => {
      readline.close();
      resolve(answer);
    });
  });
}

// src/cli/index.ts
var VALID_FORMATS = ["markdown", "json", "ids-only"];
function validateFormat(value) {
  if (!VALID_FORMATS.includes(value)) {
    throw new Error(
      `Invalid format '${value}'. Valid formats: ${VALID_FORMATS.join(", ")}`
    );
  }
  return value;
}
function createCLI() {
  const program = new import_commander2.Command();
  program.name("mail-cli").description("A command-line email client with IMAP/SMTP support").version(package_default.version);
  program.command("config").description("Configure IMAP and SMTP settings").option("--show", "Show current configuration").option("--set <key=value>", "Set a configuration value").action(import_config3.default);
  program.command("sync [action]").description("Synchronize emails from IMAP server").option("--folder <name>", "Sync specific folder (default: INBOX)").option("--folders <names>", "Sync multiple folders (comma-separated)").option("--since <date>", "Sync emails since date (YYYY-MM-DD)").option("--account <id>", "Sync specific account").option("--auto", "Start automatic sync mode").option(
    "--interval <minutes>",
    "Sync interval in minutes (default: 5)",
    parseInt
  ).action((action, options) => {
    if (action === "daemon") {
      const subcommand = process.argv[4];
      options.subcommand = subcommand;
      options.lines = parseInt(
        process.argv.find((arg) => arg.startsWith("--lines="))?.split("=")[1] || "50",
        10
      );
    }
    (0, import_sync2.default)(action, options);
  });
  program.command("list").description("List emails from local storage").option(
    "--folder <name>",
    "List emails from specific folder (default: INBOX)"
  ).option("--unread", "Show only unread emails").option("--starred", "Show only starred emails").option("--flagged", "Show only flagged (important) emails").option("--tag <name>", "Filter by tag name").option("--account <id>", "Filter by account ID", parseInt).option("--all-accounts", "Show emails from all accounts (unified inbox)").option(
    "--limit <number>",
    "Number of emails to show (default: 50)",
    parseInt
  ).option("--page <number>", "Page number (default: 1)", parseInt).option("--thread", "Display emails in thread view").option(
    "--format <format>",
    "Output format (markdown, json, ids-only)",
    validateFormat,
    "markdown"
  ).option("--ids-only", "Output only email IDs (same as --format ids-only)").option(
    "--fields <fields>",
    'Select fields to display (comma-separated, e.g., "id,from,subject" or "*,^body")'
  ).action(import_list.default);
  program.command("read <id>").description("Read email details").option("--raw", "Show raw email content").option(
    "--format <format>",
    "Output format (markdown, json, ids-only)",
    validateFormat,
    "markdown"
  ).option(
    "--fields <fields>",
    'Select fields to display (comma-separated, e.g., "id,from,subject" or "*,^body")'
  ).action(import_read.default);
  program.command("send").description("Send an email").option("--to <addresses>", "Recipient email addresses (comma-separated)").option("--cc <addresses>", "CC email addresses (comma-separated)").option("--subject <text>", "Email subject").option("--body <text>", "Email body").action(import_send.default);
  program.command("search [keyword]").description("Search emails").option("--from <address>", "Search by sender").option("--subject <text>", "Search by subject").option("--folder <name>", "Search in specific folder").option("--date <date>", "Search from date (YYYY-MM-DD)").option(
    "--format <format>",
    "Output format (markdown, json, ids-only)",
    validateFormat,
    "markdown"
  ).option("--ids-only", "Output only email IDs (same as --format ids-only)").option(
    "--fields <fields>",
    'Select fields to display (comma-separated, e.g., "id,from,subject" or "*,^body")'
  ).action(import_search.default);
  program.command("draft <action>").description("Manage drafts (save|list|edit|delete|send|sync)").option("--id <id>", "Draft ID", parseInt).option("--to <addresses>", "Recipient email addresses (comma-separated)").option("--cc <addresses>", "CC email addresses (comma-separated)").option("--subject <text>", "Email subject").option("--body <text>", "Email body").option("--sync", "Sync draft to IMAP server").option(
    "--limit <number>",
    "Number of drafts to show (default: 50)",
    parseInt
  ).action(import_draft.default);
  program.command("spam <action> [args...]").description(
    "Manage spam (mark|unmark|list|blacklist|whitelist|filter|stats)"
  ).action(import_spam.default);
  program.command("signature <action>").description("Manage signatures (create|list|edit|delete|set-default)").option("--id <id>", "Signature ID", parseInt).option("--name <name>", "Signature name").option("--text <text>", "Signature text content").option("--html <html>", "Signature HTML content").option("--default", "Set as default signature").option("--account <email>", "Account email address").action(import_signature.default);
  program.command("template <action>").description("Manage email templates (create|list|show|edit|delete|use)").option("--id <id>", "Template ID", parseInt).option("--name <name>", "Template name").option("--subject <subject>", "Template subject").option("--text <text>", "Template text content").option("--html <html>", "Template HTML content").option("--account <id>", "Account ID", parseInt).option(
    "--enabled <boolean>",
    "Enable/disable template",
    (val) => val === "true"
  ).option(
    "--vars <vars>",
    "Variables for template rendering (key=value,key2=value2)"
  ).action(import_template.default);
  program.command("notify <action>").description(
    "Manage email notifications (enable|disable|config|test|status)"
  ).option(
    "--sender <email>",
    "Filter by sender email or domain (comma-separated)"
  ).option("--tag <name>", "Filter by tag name (comma-separated)").option("--important", "Only notify for important emails").action(import_notify.default);
  program.command("delete <email-id>").description("Delete email (move to trash or permanently delete)").option("--permanent", "Permanently delete email").option("--yes", "Skip confirmation prompt").action(deleteCommand);
  program.command("trash <action> [args]").description("Manage trash (list|empty|restore)").option(
    "--limit <number>",
    "Number of emails to show (default: 50)",
    parseInt
  ).option("--offset <number>", "Offset for pagination (default: 0)", parseInt).option("--yes", "Skip confirmation prompt").action(trashCommand);
  program.command("reply <email-id>").description("Reply to an email").option("--all", "Reply to all recipients").option("--body <text>", "Reply body (non-interactive mode)").option("--editor", "Use editor for reply body").action(import_reply.default);
  program.command("forward <email-id>").description("Forward an email").option("--to <addresses>", "Forward to (comma-separated)").option("--body <text>", "Forward message").option("--no-attachments", "Do not include attachments").action(import_forward.default);
  program.command("tag <action> [args...]").description("Manage tags (create|list|delete|add|remove|filter)").option("--color <color>", "Tag color in hex format (e.g., #FF0000)").option("--description <text>", "Tag description").option(
    "--limit <number>",
    "Number of emails to show (default: 50)",
    parseInt
  ).option("--page <number>", "Page number (default: 1)", parseInt).option("--yes", "Skip confirmation prompt").action(import_tag.default);
  program.command("star <email-id>").description("Mark email as starred").action(starCommand);
  program.command("unstar <email-id>").description("Remove starred mark from email").action(unstarCommand);
  program.command("flag <email-id>").description("Mark email as important (flagged)").action(flagCommand);
  program.command("unflag <email-id>").description("Remove important mark from email").action(unflagCommand);
  program.command("account <action>").description(
    "Manage email accounts (add|list|show|edit|delete|default|enable|disable|test|migrate)"
  ).option("--id <id>", "Account ID", parseInt).option("--email <email>", "Email address").option("--name <name>", "Display name").option("--imap-host <host>", "IMAP server host").option("--imap-port <port>", "IMAP server port", parseInt).option("--smtp-host <host>", "SMTP server host").option("--smtp-port <port>", "SMTP server port", parseInt).option("--username <username>", "Account username").option("--password <password>", "Account password").option("--test", "Test connection after adding account").option("--enabled-only", "Show only enabled accounts").option("--yes", "Skip confirmation prompts").action(import_account2.default);
  program.command("contact <action> [args...]").description(
    "Manage contacts (add|list|show|edit|delete|search|group|import|export)"
  ).option("--email <email>", "Contact email address").option("--name <name>", "Contact display name").option("--phone <phone>", "Contact phone number").option("--company <company>", "Contact company").option("--title <title>", "Contact job title").option("--notes <notes>", "Contact notes").option("--favorite <boolean>", "Mark as favorite (true/false)").option("--group <name>", "Filter by group name").option("--favorites", "Show only favorite contacts").option("--limit <number>", "Number of results to show", parseInt).option("--description <text>", "Group description").option("--yes", "Skip confirmation prompts").action(import_contact.default);
  program.command("folder <action> [args...]").description("Manage folders (list|create|delete|rename|favorite|stats)").option("--name <name>", "Folder name").option("--new-name <name>", "New folder name (for rename)").option("--parent <name>", "Parent folder name").option("--account <id>", "Account ID", parseInt).option("--yes", "Skip confirmation prompts").action(import_folder2.default);
  program.command("thread <action> [args...]").description("Manage email threads (list|show|delete|move)").option("--folder <name>", "Folder to list threads from (default: INBOX)").option(
    "--limit <number>",
    "Number of threads to show (default: 20)",
    parseInt
  ).option("--account <id>", "Filter by account ID", parseInt).option("--expanded", "Show expanded thread view").option("--permanent", "Permanently delete thread").option(
    "--fields <fields>",
    'Select fields to display (comma-separated, e.g., "id,subject,messageCount")'
  ).action((action, args, options) => {
    if (action === "list") {
      listThreads(options);
    } else if (action === "show" && args.length > 0) {
      showThread(parseInt(args[0], 10), options);
    } else if (action === "delete" && args.length > 0) {
      deleteThread(parseInt(args[0], 10), options);
    } else if (action === "move" && args.length > 1) {
      moveThread(parseInt(args[0], 10), args[1], options);
    } else {
      console.error(
        import_chalk7.default.red("Invalid thread command. Use: list|show|delete|move")
      );
      process.exit(1);
    }
  });
  program.addCommand(importExportCommand);
  program.addCommand(importCommand);
  program.command("serve").description("Start HTTP API server for email management").option("-p, --port <number>", "Port number (default: 3000)", parseInt).option("-h, --host <host>", "Host address (default: 127.0.0.1)").option("--allow-remote", "Allow remote connections (bind to 0.0.0.0)").action(serve_default);
  return program;
}
var cli_default = createCLI;

// src/index.ts
init_database();
init_logger();
async function main() {
  try {
    database_default.initialize();
    const program = cli_default();
    await program.parseAsync(process.argv);
  } catch (error2) {
    const errorMessage = error2 instanceof Error ? error2.message : String(error2);
    logger_default.error("Application error", { error: errorMessage });
    console.error("Fatal error:", errorMessage);
    process.exit(1);
  }
}
process.on("uncaughtException", (error2) => {
  logger_default.error("Uncaught exception", { error: error2.message });
  console.error("Uncaught exception:", error2.message);
  process.exit(1);
});
process.on("unhandledRejection", (reason) => {
  logger_default.error("Unhandled rejection", { reason });
  console.error("Unhandled rejection:", reason);
  process.exit(1);
});
main();
//# sourceMappingURL=index.js.map