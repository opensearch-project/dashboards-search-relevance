/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

export interface ImportedJudgmentItem {
  query: string;
  ratings: {
    docId: string;
    rating: string;
  }[];
}

export const processJudgmentFile = async (
  file: File
): Promise<{ judgments: ImportedJudgmentItem[]; error?: string }> => {
  try {
    const text = await file.text();
    const lines = text.split('\n').map((line) => line.trim()).filter(Boolean);

    if (lines.length === 0) {
      return { judgments: [], error: 'File is empty.' };
    }

    const grouped: Record<string, { docId: string; rating: string }[]> = {};

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      if (line.startsWith('query,')) {
        continue;
      }

      const parts = line.split(',');
      if (parts.length !== 3) {
        return {
          judgments: [],
          error: `Invalid format on line ${i + 1}. Expected "query,docid,rating".`,
        };
      }

      const [query, docId, rating] = parts.map((p) => p.trim());

      if (!query || !docId || !rating) {
        return {
          judgments: [],
          error: `Missing values on line ${i + 1}.`,
        };
      }

      if (isNaN(Number(rating))) {
        return {
          judgments: [],
          error: `Invalid rating on line ${i + 1}. Must be a number.`,
        };
      }

      if (!grouped[query]) {
        grouped[query] = [];
      }

      grouped[query].push({
        docId,
        rating: String(rating),
      });
    }

    const judgments: ImportedJudgmentItem[] = Object.entries(grouped).map(
      ([query, ratings]) => ({
        query,
        ratings,
      })
    );

    return { judgments };
  } catch (e) {
    return {
      judgments: [],
      error: 'Failed to parse judgment file.',
    };
  }
};
