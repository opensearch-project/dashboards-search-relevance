/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

// Name validation 0>Name<=50
export const isNameValid = (name: string) => {
  return name.length >= 50 || name.length === 0 ? false : true;
};

// Characters that make spreadsheet apps treat a cell as a formula (CSV/formula injection).
const CSV_FORMULA_PREFIXES = ['=', '+', '-', '@', '\t', '\r'];

/**
 * Escape a value for use as a single CSV cell. Values that a spreadsheet would evaluate as a
 * formula are prefixed with a single quote, and values containing a delimiter, quote, or newline
 * are wrapped in double quotes with embedded quotes doubled (RFC 4180).
 */
export const escapeCsvCell = (value: unknown): string => {
  let cell = value === null || value === undefined ? '' : String(value);
  if (CSV_FORMULA_PREFIXES.some((prefix) => cell.startsWith(prefix))) {
    cell = `'${cell}`;
  }
  if (/[",\r\n]/.test(cell)) {
    cell = `"${cell.replace(/"/g, '""')}"`;
  }
  return cell;
};
