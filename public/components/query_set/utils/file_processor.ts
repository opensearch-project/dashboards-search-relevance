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

export const processQueryFile = async (file: File, isPlainText: boolean = false): Promise<FileProcessResult> => {
  try {
    const text = await file.text();
    const lines = text.trim().split('\n');
    const queryList: QueryItem[] = [];

    for (const line of lines) {
      if (!line.trim()) continue;

      try {
        // If it's plain text input, treat each line as a query
        if (isPlainText) {
          queryList.push({
            queryText: line.trim(),
            referenceAnswer: '',
          });
        } else {
          // Try to parse as JSON for file upload mode
          const parsed = JSON.parse(line.trim());
          if (parsed.queryText) {
            queryList.push({
              queryText: String(parsed.queryText).trim(),
              referenceAnswer: parsed.referenceAnswer ? String(parsed.referenceAnswer).trim() : '',
            });
          }
        }
      } catch (e) {
        // For plain text, this shouldn't happen
        // For JSON mode, log the error
        if (!isPlainText) {
          // console.error('Error parsing line:', line, e);
        } else {
          // Even if JSON parsing fails, still add it as a plain query
          queryList.push({
            queryText: line.trim(),
            referenceAnswer: '',
          });
        }
      }
    }

    if (queryList.length === 0) {
      const errorMsg = isPlainText ? 'No valid queries found' : 'No valid queries found in file';
      return { queries: [], error: errorMsg };
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
