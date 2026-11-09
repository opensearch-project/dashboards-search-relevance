/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

export interface JudgmentParseError {
    line: number;
    raw: string;
    error: string;
}

export interface JudgmentParseSummaryData {
    totalLinesRead: number;
    headerLinesSkipped: number;
    successfulRecords: number;
    failedRecords: number;
    duplicateRecords: number;
    errors: JudgmentParseError[];
    ratingDistribution: Record<string, number>;
    uniqueQueries: number;
}

export interface RatingItem {
    docId: string;
    rating: string;
}

export const MAX_QUERIES_PREVIEW = 200;
export const MAX_RATINGS_PER_QUERY_PREVIEW = 50;
export const MAX_ERROR_PREVIEW = 10;
