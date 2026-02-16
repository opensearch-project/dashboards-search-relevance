/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

export interface QueryItem {
  queryText: string;
  referenceAnswer: string;
}

export interface FileProcessResult {
  queries: QueryItem[];
  error?: string;
}

/**
 * Attempts to parse a line as JSON (NDJSON format).
 * Returns a QueryItem if successful or null if the line is not valid JSON / missing queryText.
 */
const tryParseJsonLine = (line: string): QueryItem | null => {
  try {
    const parsed = JSON.parse(line);
    if (parsed && typeof parsed.queryText === 'string' && parsed.queryText.trim()) {
      return {
        queryText: String(parsed.queryText).trim(),
        referenceAnswer: parsed.referenceAnswer ? String(parsed.referenceAnswer).trim() : '',
      };
    }
    return null;
  } catch {
    return null;
  }
};

/**
 * Extracts the value from a key-value segment, stripping optional surrounding quotes.
 */
const extractValue = (raw: string): string => {
  const trimmed = raw.trim();
  if (trimmed.length >= 2 && trimmed.startsWith('"') && trimmed.endsWith('"')) {
    return trimmed.substring(1, trimmed.length - 1);
  }
  return trimmed;
};

/**
 * Attempts to parse a line as key-value format: query: "...", answer: "..."
 * The answer part is optional. Quotes around values are optional.
 * Returns a QueryItem if the line matches, or null otherwise.
 */
const tryParseKeyValueLine = (line: string): QueryItem | null => {
  // Match: query: <value> [, answer: <value>]
  const kvRegex = /^query:\s*(.+?)(?:,\s*answer:\s*(.+))?$/i;
  const match = line.match(kvRegex);
  if (match) {
    const queryText = extractValue(match[1].replace(/,\s*$/, ''));
    if (queryText.length > 0) {
      return {
        queryText,
        referenceAnswer: match[2] ? extractValue(match[2]) : '',
      };
    }
  }
  return null;
};

/**
 * Parses plain text, NDJSON, or key-value text into QueryItems.
 * Supports three formats (can be mixed freely):
 *  - NDJSON lines: {"queryText":"...", "referenceAnswer":"..."}
 *  - Key-value lines: query: "...", answer: "..."
 *  - Plain text lines: one query per line (no reference answer)
 */
export const parseTextQueries = (text: string): FileProcessResult => {
  const lines = text.trim().split('\n').filter((line) => line.trim().length > 0);

  if (lines.length === 0) {
    return { queries: [], error: 'No queries provided. Enter at least one query.' };
  }

  if (lines.length > 1000000) {
    return { queries: [], error: 'Too many queries found (> 1,000,000)' };
  }

  const queryList: QueryItem[] = [];

  for (const line of lines) {
    const trimmedLine = line.trim();

    // Try parsing as JSON first (NDJSON format)
    if (trimmedLine.startsWith('{')) {
      const jsonItem = tryParseJsonLine(trimmedLine);
      if (jsonItem) {
        queryList.push(jsonItem);
        continue;
      }
    }

    // Try parsing as key-value format: query: "...", answer: "..."
    const kvItem = tryParseKeyValueLine(trimmedLine);
    if (kvItem) {
      queryList.push(kvItem);
      continue;
    }

    // Plain text: entire line is the query, no reference answer
    queryList.push({
      queryText: trimmedLine,
      referenceAnswer: '',
    });
  }

  if (queryList.length === 0) {
    return { queries: [], error: 'No valid queries found.' };
  }

  return { queries: queryList };
};

export const processQueryFile = async (file: File): Promise<FileProcessResult> => {
  try {
    const text = await file.text();
    const lines = text.trim().split('\n');
    const queryList: QueryItem[] = [];

    for (const line of lines) {
      try {
        const parsed = JSON.parse(line.trim());
        if (parsed.queryText) {
          queryList.push({
            queryText: String(parsed.queryText).trim(),
            referenceAnswer: parsed.referenceAnswer ? String(parsed.referenceAnswer).trim() : '',
          });
        }
      } catch (e) {
        // console.error('Error parsing line:', line, e);
      }
    }

    if (queryList.length === 0) {
      return { queries: [], error: 'No valid queries found in file' };
    }

    if (queryList.length > 1000000) {
      return { queries: [], error: 'Too many queries found (> 1,000,000)' };
    }

    return { queries: queryList };
  } catch (error) {
    // console.error('Error processing file:', error);
    return { queries: [], error: 'Error reading file content' };
  }
};
