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
    // Not valid JSON, continue to text parsing
  }

  // Plain text format: queryText#referenceAnswer
  // The '#' character is the separator between query and reference answer
  const hashIndex = trimmedLine.indexOf('#');
  if (hashIndex > 0) {
    const queryText = trimmedLine.substring(0, hashIndex).trim();
    const referenceAnswer = trimmedLine.substring(hashIndex + 1).trim();
    if (queryText) {
      return { queryText, referenceAnswer };
    }
  }

  // No '#' separator — treat entire line as query text
  return {
    queryText: trimmedLine,
    referenceAnswer: ''
  };
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
