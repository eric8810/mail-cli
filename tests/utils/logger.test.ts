import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { Logger } from '../../src/utils/logger.ts';

describe('logger', () => {
  let tempDir = '';
  let logger: Logger;
  let consoleLogSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'mail-cli-logger-'));
    logger = new Logger(tempDir);
    consoleLogSpy = vi
      .spyOn(console, 'log')
      .mockImplementation(() => undefined);
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  it('writes log line to file', () => {
    logger.info('Info message', { scope: 'unit-test' });

    const logFile = path.join(tempDir, 'open-mail-client.log');
    const content = fs.readFileSync(logFile, 'utf8');

    expect(fs.existsSync(logFile)).toBe(true);
    expect(content).toContain('[INFO] Info message');
    expect(content).toContain('"scope":"unit-test"');
  });

  it('respects current log level', () => {
    logger.setLevel('WARN');
    logger.info('should not be logged');
    logger.warn('should be logged');

    expect(consoleLogSpy).toHaveBeenCalledTimes(1);
    const firstCall = consoleLogSpy.mock.calls[0][0];
    expect(firstCall).toContain('[WARN] should be logged');
  });
});
