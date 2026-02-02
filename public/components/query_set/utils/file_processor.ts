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

export const parseQueryFromLine = (line: string): QueryItem | null => {
  const trimmedLine = line.trim();
  if (!trimmedLine) return null;

  // Try JSON first
  try {
    const parsed = JSON.parse(trimmedLine);
    if (typeof parsed === 'object' && parsed !== null && parsed.queryText) {
      return {
        queryText: String(parsed.queryText).trim(),
        referenceAnswer: parsed.referenceAnswer ? String(parsed.referenceAnswer).trim() : '',
      };
    }
  } catch (e) {
    // Not valid JSON, continue to CSV/Text parsing
  }

  // Simple CSV parser: separate by comma, respect double quotes
  const parts: string[] = [];
  let current = '';
  let inQuote = false;

  for (let i = 0; i < trimmedLine.length; i++) {
    const char = trimmedLine[i];
    if (char === '"') {
      // Handle escaped quotes ("")
      if (i + 1 < trimmedLine.length && trimmedLine[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuote = !inQuote;
      }
    } else if (char === ',' && !inQuote) {
      parts.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  parts.push(current.trim());

  // If we have at least 2 parts, treat as query + reference
  // If we have 1 part, treat as just query
  if (parts.length >= 2) {
    // If the first part is empty, it's invalid
    if (!parts[0]) return null;
    return {
      queryText: parts[0],
      referenceAnswer: parts[1]
    };
  } else if (parts.length === 1 && parts[0]) {
    return {
      queryText: parts[0],
      referenceAnswer: ''
    };
  }

  return null;
};

export const processQueryFile = async (file: File): Promise<FileProcessResult> => {
  try {
    const text = await file.text();
    const lines = text.trim().split('\n');
    const queryList: QueryItem[] = [];

    for (const line of lines) {
      const queryItem = parseQueryFromLine(line);
      if (queryItem) {
        queryList.push(queryItem);
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

