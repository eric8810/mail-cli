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
  ]
});
