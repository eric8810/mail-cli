import fs from 'node:fs';
import path from 'node:path';

/**
 * Log levels supported by the logger.
 */
export type LogLevel = 'ERROR' | 'WARN' | 'INFO' | 'DEBUG';

/**
 * Simple logger utility that logs to both console and file.
 */
export class Logger {
  private logDir: string;
  private logFile: string;
  private levels: Record<LogLevel, number>;
  private currentLevel: number;

  /**
   * Create a logger instance.
   */
  constructor(logDir: string | null = null) {
    this.logDir = logDir ?? path.join(process.cwd(), 'data', 'logs');
    this.logFile = path.join(this.logDir, 'open-mail-client.log');
    this.levels = {
      ERROR: 0,
      WARN: 1,
      INFO: 2,
      DEBUG: 3,
    };
    this.currentLevel = this.levels.INFO;
    this.ensureLogDir();
  }

  /**
   * Ensure the target log directory exists.
   */
  private ensureLogDir(): void {
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
  }

  /**
   * Build a timestamped log line.
   */
  private formatMessage(
    level: LogLevel,
    message: string,
    meta: Record<string, unknown> = {}
  ): string {
    const timestamp = new Date().toISOString();
    const metaStr =
      Object.keys(meta).length > 0 ? ` ${JSON.stringify(meta)}` : '';
    return `[${timestamp}] [${level}] ${message}${metaStr}`;
  }

  /**
   * Persist a log line to disk.
   */
  private writeToFile(message: string): void {
    try {
      fs.appendFileSync(this.logFile, `${message}\n`);
    } catch (error) {
      const failureMessage =
        error instanceof Error ? error.message : String(error);
      console.error('Failed to write to log file:', failureMessage);
    }
  }

  /**
   * Log a message for a specific level.
   */
  private log(
    level: LogLevel,
    message: string,
    meta: Record<string, unknown> = {}
  ): void {
    if (this.levels[level] <= this.currentLevel) {
      const formattedMessage = this.formatMessage(level, message, meta);
      console.log(formattedMessage);
      this.writeToFile(formattedMessage);
    }
  }

  /**
   * Log an error-level message.
   */
  error(message: string, meta: Record<string, unknown> = {}): void {
    this.log('ERROR', message, meta);
  }

  /**
   * Log a warn-level message.
   */
  warn(message: string, meta: Record<string, unknown> = {}): void {
    this.log('WARN', message, meta);
  }

  /**
   * Log an info-level message.
   */
  info(message: string, meta: Record<string, unknown> = {}): void {
    this.log('INFO', message, meta);
  }

  /**
   * Log a debug-level message.
   */
  debug(message: string, meta: Record<string, unknown> = {}): void {
    this.log('DEBUG', message, meta);
  }

  /**
   * Update current logging level.
   */
  setLevel(level: LogLevel): void {
    if (this.levels[level] !== undefined) {
      this.currentLevel = this.levels[level];
    }
  }
}

/**
 * Shared singleton logger instance.
 */
const logger = new Logger();

// Keep CommonJS require() callers working during migration.
export const error = logger.error.bind(logger);
export const warn = logger.warn.bind(logger);
export const info = logger.info.bind(logger);
export const debug = logger.debug.bind(logger);
export const setLevel = logger.setLevel.bind(logger);

export default logger;
