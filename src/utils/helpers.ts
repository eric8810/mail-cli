import crypto from 'node:crypto';
import os from 'node:os';
import path from 'node:path';

/**
 * Encrypt a string using AES-256-CBC.
 */
export function encrypt(text: string, key: string | null = null): string {
  const encryptionKey = key ?? getEncryptionKey();
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(
    'aes-256-cbc',
    Buffer.from(encryptionKey, 'hex'),
    iv
  );
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return `${iv.toString('hex')}:${encrypted}`;
}

/**
 * Decrypt a string encrypted by the encrypt helper.
 */
export function decrypt(
  encryptedText: string,
  key: string | null = null
): string {
  const encryptionKey = key ?? getEncryptionKey();
  const parts = encryptedText.split(':');
  const iv = Buffer.from(parts[0], 'hex');
  const encrypted = parts[1];
  const decipher = crypto.createDecipheriv(
    'aes-256-cbc',
    Buffer.from(encryptionKey, 'hex'),
    iv
  );
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

/**
 * Build a deterministic encryption key from host and user identity.
 */
export function getEncryptionKey(): string {
  const machineId = `${os.hostname()}${os.userInfo().username}`;
  return crypto.createHash('sha256').update(machineId).digest('hex');
}

/**
 * Get platform-specific config directory.
 */
export function getConfigDir(): string {
  if (process.platform === 'win32') {
    return path.join(
      process.env.APPDATA ?? path.join(os.homedir(), 'AppData', 'Roaming'),
      'open-mail-client'
    );
  }

  return path.join(os.homedir(), '.config', 'open-mail-client');
}

/**
 * Get platform-specific data directory.
 */
export function getDataDir(): string {
  if (process.platform === 'win32') {
    return path.join(
      process.env.LOCALAPPDATA ?? path.join(os.homedir(), 'AppData', 'Local'),
      'open-mail-client'
    );
  }

  return path.join(os.homedir(), '.local', 'share', 'open-mail-client');
}

/**
 * Format date to YYYY-MM-DD.
 */
export function formatDate(
  date: string | number | Date | null | undefined
): string {
  if (!date) {
    return '';
  }

  const parsedDate = new Date(date);
  return parsedDate.toISOString().split('T')[0];
}

/**
 * Truncate a string to max length with ellipsis.
 */
export function truncate(
  str: string | null | undefined,
  maxLength = 50
): string {
  if (!str) {
    return '';
  }

  if (str.length <= maxLength) {
    return str;
  }

  return `${str.substring(0, maxLength - 3)}...`;
}
