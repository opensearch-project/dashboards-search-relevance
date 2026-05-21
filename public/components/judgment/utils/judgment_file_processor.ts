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

export interface JudgmentParseError {
  line: number;
  raw: string;
  error: string;
}

export interface JudgmentParseSummary {
  totalLinesRead: number;
  headerLinesSkipped: number;
  successfulRecords: number;
  failedRecords: number;
  duplicateRecords: number;
  errors: JudgmentParseError[];
  ratingDistribution: Record<string, number>;
  uniqueQueries: number;
}

const isHeaderRow = (cells: string[]) => {
  if (cells.length < 3) return false;
  const a = (cells[0] || '').trim().toLowerCase();
  const b = (cells[1] || '').trim().toLowerCase();
  const c = (cells[2] || '').trim().toLowerCase();
  return a === 'query' && b === 'docid' && c === 'rating';
};

const parseCsvLine = (line: string): string[] => {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];

    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
        continue;
      }
      inQuotes = !inQuotes;
      continue;
    }

    if (ch === ',' && !inQuotes) {
      result.push(current);
      current = '';
      continue;
    }

    current += ch;
  }

  result.push(current);
  return result.map((s) => s.trim());
};

const isValidRating = (rating: string) => {
  if (rating === null || rating === undefined) return false;
  const trimmed = String(rating).trim();
  if (trimmed === '') return false;

  const n = Number(trimmed);
  if (Number.isNaN(n)) return false;

  return true;
};

export const processJudgmentFile = async (
  file: File
): Promise<{ judgments: ImportedJudgmentItem[]; error?: string; summary?: JudgmentParseSummary }> => {
  try {
    const text = await file.text();

    const rawLines = text.split(/\r?\n/);

    // Intentionally filter out empty/whitespace-only lines before counting.
    // totalLinesRead reflects meaningful data lines, not blank lines from
    // editors or trailing newlines. Showing "12 lines (1 empty)" would be
    // noise — users only care about how many records were processed.
    const lines = rawLines.map((line) => line.trim()).filter((l) => l.length > 0);

    const summary: JudgmentParseSummary = {
      totalLinesRead: lines.length,
      headerLinesSkipped: 0,
      successfulRecords: 0,
      failedRecords: 0,
      duplicateRecords: 0,
      errors: [],
      ratingDistribution: {},
      uniqueQueries: 0,
    };

    if (lines.length === 0) {
      return { judgments: [], error: 'File is empty.', summary };
    }

    const grouped: Record<string, { docId: string; rating: string }[]> = {};

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const lineNo = i + 1;

      const parts = parseCsvLine(line);

      if (isHeaderRow(parts)) {
        summary.headerLinesSkipped++;
        continue;
      }

      if (parts.length !== 3) {
        summary.failedRecords++;
        summary.errors.push({
          line: lineNo,
          raw: line,
          error: `Invalid format. Expected 3 columns (query,docid,rating) but got ${parts.length}.`,
        });
        continue;
      }

      const [query, docId, rating] = parts.map((p) => (p ?? '').trim());

      if (!query || !docId || !rating) {
        summary.failedRecords++;
        summary.errors.push({
          line: lineNo,
          raw: line,
          error: `Missing values. query/docId/rating must all be present.`,
        });
        continue;
      }

      if (!isValidRating(rating)) {
        summary.failedRecords++;
        summary.errors.push({
          line: lineNo,
          raw: line,
          error: `Invalid rating "${rating}". Must be a number.`,
        });
        continue;
      }

      if (!grouped[query]) grouped[query] = [];

      const isDuplicate = grouped[query].some((r) => r.docId === docId);
      if (isDuplicate) {
        summary.duplicateRecords++;
        summary.errors.push({
          line: lineNo,
          raw: line,
          error: `Duplicate entry for query "${query}" and docId "${docId}". Skipped.`,
        });
        continue;
      }

      const normalizedRating = String(Number(rating));

      grouped[query].push({
        docId,
        rating: normalizedRating,
      });

      summary.successfulRecords++;

      summary.ratingDistribution[normalizedRating] =
        (summary.ratingDistribution[normalizedRating] || 0) + 1;
    }

    const judgments: ImportedJudgmentItem[] = Object.entries(grouped).map(([query, ratings]) => ({
      query,
      ratings,
    }));

    summary.uniqueQueries = judgments.length;

    return { judgments, summary };
  } catch (e) {
    return {
      judgments: [],
      error: 'Failed to parse judgment file.',
      summary: {
        totalLinesRead: 0,
        headerLinesSkipped: 0,
        successfulRecords: 0,
        failedRecords: 0,
        duplicateRecords: 0,
        errors: [],
        ratingDistribution: {},
        uniqueQueries: 0,
      },
    };
  }
};
