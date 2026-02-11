/**
 * Field Selection Utilities
 *
 * Provides utilities for parsing and applying field selection to data objects.
 * Supports:
 * - Selecting specific fields: "id,from,subject"
 * - Wildcard selection: "*"
 * - Field exclusion: "*,^body,^raw"
 */

export interface FieldSelection {
  include: string[] | '*';
  exclude: string[];
}

/**
 * Parse field selection string into structured format
 *
 * @param input - Field selection string (e.g., "id,from,subject" or "*,^body")
 * @returns Parsed field selection
 *
 * @example
 * parseFieldSelection("id,from,subject")
 * // => { include: ["id", "from", "subject"], exclude: [] }
 *
 * parseFieldSelection("*,^body,^raw")
 * // => { include: "*", exclude: ["body", "raw"] }
 */
export function parseFieldSelection(input: string): FieldSelection {
  if (!input || input === '*') {
    return { include: '*', exclude: [] };
  }

  const fields = input
    .split(',')
    .map((f) => f.trim())
    .filter((f) => f);
  const exclude: string[] = [];
  const include: string[] = [];

  for (const field of fields) {
    if (field.startsWith('^')) {
      exclude.push(field.slice(1));
    } else if (field === '*') {
      return { include: '*', exclude };
    } else {
      include.push(field);
    }
  }

  return { include, exclude };
}

/**
 * Apply field selection to a data object
 *
 * @param data - Source data object
 * @param selection - Field selection to apply
 * @returns Filtered data object with only selected fields
 *
 * @example
 * const data = { id: 1, from: "test@example.com", subject: "Test", body: "Content" };
 * selectFields(data, { include: ["id", "from"], exclude: [] })
 * // => { id: 1, from: "test@example.com" }
 *
 * selectFields(data, { include: "*", exclude: ["body"] })
 * // => { id: 1, from: "test@example.com", subject: "Test" }
 */
export function selectFields<T extends Record<string, unknown>>(
  data: T,
  selection: FieldSelection
): Partial<T> {
  if (selection.include === '*') {
    // Include all fields, then exclude specified ones
    const result = { ...data };
    for (const field of selection.exclude) {
      delete result[field];
    }
    return result;
  }

  // Only include specified fields
  const result: Partial<T> = {};
  for (const field of selection.include) {
    if (field in data) {
      result[field] = data[field];
    }
  }
  return result;
}

/**
 * Get list of available fields from a data object
 *
 * @param data - Data object to inspect
 * @returns Array of field names
 *
 * @example
 * getAvailableFields({ id: 1, from: "test@example.com", subject: "Test" })
 * // => ["id", "from", "subject"]
 */
export function getAvailableFields<T>(data: T): string[] {
  return Object.keys(data as Record<string, unknown>);
}

/**
 * Get default field selection for a specific view
 *
 * @param view - View type (list, detail, search, thread)
 * @returns Default field selection for the view
 */
export function getDefaultFieldSelection(view: string): FieldSelection {
  switch (view) {
    case 'list':
    case 'search':
      return {
        include: ['id', 'from', 'subject', 'date', 'isRead'],
        exclude: [],
      };
    case 'detail':
    case 'read':
      return {
        include: '*',
        exclude: [],
      };
    case 'thread':
      return {
        include: ['id', 'subject', 'participants', 'lastDate', 'messageCount'],
        exclude: [],
      };
    default:
      return {
        include: '*',
        exclude: [],
      };
  }
}

/**
 * Validate field names against available fields
 * Returns array of invalid field names
 *
 * @param selection - Field selection to validate
 * @param availableFields - List of valid field names
 * @returns Array of invalid field names
 */
export function validateFieldSelection(
  selection: FieldSelection,
  availableFields: string[]
): string[] {
  const invalid: string[] = [];
  const fieldSet = new Set(availableFields);

  if (selection.include !== '*') {
    for (const field of selection.include) {
      if (!fieldSet.has(field)) {
        invalid.push(field);
      }
    }
  }

  for (const field of selection.exclude) {
    if (!fieldSet.has(field)) {
      invalid.push(field);
    }
  }

  return invalid;
}
