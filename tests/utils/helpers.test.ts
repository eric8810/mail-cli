import { describe, expect, it } from 'vitest';

import {
  decrypt,
  encrypt,
  formatDate,
  getConfigDir,
  getDataDir,
  getEncryptionKey,
  truncate,
} from '../../src/utils/helpers.ts';

describe('helpers', () => {
  it('encrypts and decrypts with explicit key', () => {
    const key = 'a'.repeat(64);
    const sourceText = 'hello-world';
    const encrypted = encrypt(sourceText, key);
    const decrypted = decrypt(encrypted, key);

    expect(encrypted).toContain(':');
    expect(decrypted).toBe(sourceText);
  });

  it('creates deterministic encryption key shape', () => {
    const key = getEncryptionKey();

    expect(key).toHaveLength(64);
    expect(key).toMatch(/^[a-f0-9]+$/);
  });

  it('returns platform-specific directories', () => {
    expect(getConfigDir()).toContain('open-mail-client');
    expect(getDataDir()).toContain('open-mail-client');
  });

  it('formats date as YYYY-MM-DD', () => {
    expect(formatDate('2026-02-08T09:00:00.000Z')).toBe('2026-02-08');
    expect(formatDate(null)).toBe('');
  });

  it('truncates long strings and keeps short strings', () => {
    expect(truncate('short', 10)).toBe('short');
    expect(truncate('1234567890', 8)).toBe('12345...');
    expect(truncate('', 8)).toBe('');
  });
});
