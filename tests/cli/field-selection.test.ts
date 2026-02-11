import { describe, it, expect } from 'vitest';
import {
  parseFieldSelection,
  selectFields,
  getAvailableFields,
  getDefaultFieldSelection,
  validateFieldSelection,
  type FieldSelection,
} from '../../src/cli/utils/field-selection';

describe('parseFieldSelection', () => {
  it('should parse simple field list', () => {
    const result = parseFieldSelection('id,from,subject');
    expect(result).toEqual({
      include: ['id', 'from', 'subject'],
      exclude: [],
    });
  });

  it('should handle wildcard', () => {
    const result = parseFieldSelection('*');
    expect(result).toEqual({
      include: '*',
      exclude: [],
    });
  });

  it('should handle exclude fields with wildcard', () => {
    const result = parseFieldSelection('*,^body,^raw');
    expect(result).toEqual({
      include: '*',
      exclude: ['body', 'raw'],
    });
  });

  it('should handle whitespace', () => {
    const result = parseFieldSelection('id, from, subject');
    expect(result.include).toEqual(['id', 'from', 'subject']);
  });

  it('should handle empty string', () => {
    const result = parseFieldSelection('');
    expect(result).toEqual({
      include: '*',
      exclude: [],
    });
  });

  it('should handle mixed include and exclude', () => {
    const result = parseFieldSelection('*,^body');
    expect(result).toEqual({
      include: '*',
      exclude: ['body'],
    });
  });

  it('should handle multiple excludes', () => {
    const result = parseFieldSelection('*,^body,^raw,^attachments');
    expect(result).toEqual({
      include: '*',
      exclude: ['body', 'raw', 'attachments'],
    });
  });

  it('should filter out empty fields', () => {
    const result = parseFieldSelection('id,,from,,subject');
    expect(result.include).toEqual(['id', 'from', 'subject']);
  });
});

describe('selectFields', () => {
  const testData = {
    id: 1,
    from: 'test@example.com',
    subject: 'Test Email',
    body: 'Email content',
    date: '2026-02-10',
  };

  it('should select specific fields', () => {
    const selection: FieldSelection = {
      include: ['id', 'from'],
      exclude: [],
    };
    const result = selectFields(testData, selection);
    expect(result).toEqual({
      id: 1,
      from: 'test@example.com',
    });
  });

  it('should select all fields with wildcard', () => {
    const selection: FieldSelection = {
      include: '*',
      exclude: [],
    };
    const result = selectFields(testData, selection);
    expect(result).toEqual(testData);
  });

  it('should exclude fields when using wildcard', () => {
    const selection: FieldSelection = {
      include: '*',
      exclude: ['body'],
    };
    const result = selectFields(testData, selection);
    expect(result).toEqual({
      id: 1,
      from: 'test@example.com',
      subject: 'Test Email',
      date: '2026-02-10',
    });
  });

  it('should exclude multiple fields', () => {
    const selection: FieldSelection = {
      include: '*',
      exclude: ['body', 'date'],
    };
    const result = selectFields(testData, selection);
    expect(result).toEqual({
      id: 1,
      from: 'test@example.com',
      subject: 'Test Email',
    });
  });

  it('should handle non-existent fields gracefully', () => {
    const selection: FieldSelection = {
      include: ['id', 'nonexistent'],
      exclude: [],
    };
    const result = selectFields(testData, selection);
    expect(result).toEqual({
      id: 1,
    });
  });

  it('should not modify original data', () => {
    const selection: FieldSelection = {
      include: '*',
      exclude: ['body'],
    };
    const original = { ...testData };
    selectFields(testData, selection);
    expect(testData).toEqual(original);
  });
});

describe('getAvailableFields', () => {
  it('should return all field names', () => {
    const data = {
      id: 1,
      from: 'test@example.com',
      subject: 'Test',
    };
    const fields = getAvailableFields(data);
    expect(fields).toEqual(['id', 'from', 'subject']);
  });

  it('should handle empty object', () => {
    const fields = getAvailableFields({});
    expect(fields).toEqual([]);
  });
});

describe('getDefaultFieldSelection', () => {
  it('should return list view defaults', () => {
    const selection = getDefaultFieldSelection('list');
    expect(selection).toEqual({
      include: ['id', 'from', 'subject', 'date', 'isRead'],
      exclude: [],
    });
  });

  it('should return search view defaults', () => {
    const selection = getDefaultFieldSelection('search');
    expect(selection).toEqual({
      include: ['id', 'from', 'subject', 'date', 'isRead'],
      exclude: [],
    });
  });

  it('should return detail view defaults', () => {
    const selection = getDefaultFieldSelection('detail');
    expect(selection).toEqual({
      include: '*',
      exclude: [],
    });
  });

  it('should return thread view defaults', () => {
    const selection = getDefaultFieldSelection('thread');
    expect(selection).toEqual({
      include: ['id', 'subject', 'participants', 'lastDate', 'messageCount'],
      exclude: [],
    });
  });

  it('should return wildcard for unknown views', () => {
    const selection = getDefaultFieldSelection('unknown');
    expect(selection).toEqual({
      include: '*',
      exclude: [],
    });
  });
});

describe('validateFieldSelection', () => {
  const availableFields = ['id', 'from', 'subject', 'body', 'date'];

  it('should return empty array for valid fields', () => {
    const selection: FieldSelection = {
      include: ['id', 'from'],
      exclude: [],
    };
    const invalid = validateFieldSelection(selection, availableFields);
    expect(invalid).toEqual([]);
  });

  it('should detect invalid include fields', () => {
    const selection: FieldSelection = {
      include: ['id', 'invalid', 'from'],
      exclude: [],
    };
    const invalid = validateFieldSelection(selection, availableFields);
    expect(invalid).toEqual(['invalid']);
  });

  it('should detect invalid exclude fields', () => {
    const selection: FieldSelection = {
      include: '*',
      exclude: ['invalid', 'body'],
    };
    const invalid = validateFieldSelection(selection, availableFields);
    expect(invalid).toEqual(['invalid']);
  });

  it('should detect multiple invalid fields', () => {
    const selection: FieldSelection = {
      include: ['id', 'invalid1'],
      exclude: ['invalid2'],
    };
    const invalid = validateFieldSelection(selection, availableFields);
    expect(invalid).toEqual(['invalid1', 'invalid2']);
  });

  it('should not validate wildcard include', () => {
    const selection: FieldSelection = {
      include: '*',
      exclude: [],
    };
    const invalid = validateFieldSelection(selection, availableFields);
    expect(invalid).toEqual([]);
  });
});
