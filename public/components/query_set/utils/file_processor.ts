/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

export interface QueryItem {
  queryText: string;
  referenceAnswer?: string;
}

export interface FileProcessResult {
  queries: QueryItem[];
  error?: string;
}

export const processPlainTextFile = async (file: File): Promise<FileProcessResult> => {
  try {
    const text = await file.text();
    const lines = text.trim().split('\n');
    const queryList: QueryItem[] = [];

    for (const line of lines) {
      if (!line.trim()) continue;

      // Each line is a query in plain text mode
      queryList.push({
        queryText: line.trim(),
      });
    }

    if (queryList.length === 0) {
      return { queries: [], error: 'No valid queries found' };
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

export const processQueryFile = async (file: File): Promise<FileProcessResult> => {
  try {
    const text = await file.text();
    const lines = text.trim().split('\n');
    const queryList: QueryItem[] = [];

    for (const line of lines) {
      if (!line.trim()) continue;

      try {
        // Parse each line as JSON
        const parsed = JSON.parse(line.trim());
        if (parsed.queryText) {
          const queryItem: QueryItem = {
            queryText: String(parsed.queryText).trim(),
          };
          if (parsed.referenceAnswer) {
            queryItem.referenceAnswer = String(parsed.referenceAnswer).trim();
          }
          queryList.push(queryItem);
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
