/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { processJudgmentFile } from '../utils/judgment_file_processor';

const makeFile = (content: string) => {
  // JSDOM supports File
  return new File([content], 'judgments.csv', { type: 'text/csv' });
};

describe('judgment_file_processor', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return error when file is empty', async () => {
    const file = makeFile('');

    const result = await processJudgmentFile(file);

    expect(result.judgments).toEqual([]);
    expect(result.error).toEqual('File is empty.');
    expect(result.summary).toEqual({
      totalLinesRead: 0,
      headerLinesSkipped: 0,
      successfulRecords: 0,
      failedRecords: 0,
      errors: [],
      ratingDistribution: {},
      uniqueQueries: 0,
    });
  });

  it('should parse valid CSV with header row', async () => {
    const file = makeFile(`
      query,docid,rating
      laptop charger,doc1,1
      laptop charger,doc2,0
      iphone case,doc9,2
    `);

    const result = await processJudgmentFile(file);

    expect(result.error).toBeUndefined();

    // Summary checks
    expect(result.summary?.totalLinesRead).toBe(4);
    expect(result.summary?.headerLinesSkipped).toBe(1);
    expect(result.summary?.successfulRecords).toBe(3);
    expect(result.summary?.failedRecords).toBe(0);
    expect(result.summary?.uniqueQueries).toBe(2);

    expect(result.summary?.ratingDistribution).toEqual({
      '1': 1,
      '0': 1,
      '2': 1,
    });

    // Grouping checks
    expect(result.judgments).toEqual([
      {
        query: 'laptop charger',
        ratings: [
          { docId: 'doc1', rating: '1' },
          { docId: 'doc2', rating: '0' },
        ],
      },
      {
        query: 'iphone case',
        ratings: [{ docId: 'doc9', rating: '2' }],
      },
    ]);
  });

  it('should handle quoted values with commas', async () => {
    const file = makeFile(`
      query,docid,rating
      "laptop charger, 65w",doc1,1
      "laptop charger, 65w",doc2,0
    `);

    const result = await processJudgmentFile(file);

    expect(result.error).toBeUndefined();
    expect(result.summary?.successfulRecords).toBe(2);
    expect(result.summary?.failedRecords).toBe(0);
    expect(result.summary?.uniqueQueries).toBe(1);

    expect(result.judgments).toEqual([
      {
        query: 'laptop charger, 65w',
        ratings: [
          { docId: 'doc1', rating: '1' },
          { docId: 'doc2', rating: '0' },
        ],
      },
    ]);
  });

  it('should handle escaped quotes inside quoted field', async () => {
    const file = makeFile(`
      query,docid,rating
      "iphone ""pro"" case",doc1,2
    `);

    const result = await processJudgmentFile(file);

    expect(result.error).toBeUndefined();
    expect(result.summary?.successfulRecords).toBe(1);
    expect(result.summary?.failedRecords).toBe(0);

    expect(result.judgments).toEqual([
      {
        query: 'iphone "pro" case',
        ratings: [{ docId: 'doc1', rating: '2' }],
      },
    ]);
  });

  it('should count invalid column length as failed record', async () => {
    const file = makeFile(`
      query,docid,rating
      laptop,doc1
      iphone,doc2,1
    `);

    const result = await processJudgmentFile(file);

    expect(result.summary?.successfulRecords).toBe(1);
    expect(result.summary?.failedRecords).toBe(1);
    expect(result.summary?.errors.length).toBe(1);

    expect(result.summary?.errors[0]).toEqual({
      line: 2,
      raw: 'laptop,doc1',
      error: 'Invalid format. Expected 3 columns (query,docid,rating) but got 2.',
    });
  });

  it('should count missing values as failed record', async () => {
    const file = makeFile(`
      query,docid,rating
      laptop,doc1,
      iphone,doc2,1
    `);

    const result = await processJudgmentFile(file);

    expect(result.summary?.successfulRecords).toBe(1);
    expect(result.summary?.failedRecords).toBe(1);

    expect(result.summary?.errors[0].line).toBe(2);
    expect(result.summary?.errors[0].raw).toBe('laptop,doc1,');
    expect(result.summary?.errors[0].error).toContain('Missing values');
  });

  it('should count invalid rating as failed record', async () => {
    const file = makeFile(`
      query,docid,rating
      laptop,doc1,abc
      iphone,doc2,1
    `);

    const result = await processJudgmentFile(file);

    expect(result.summary?.successfulRecords).toBe(1);
    expect(result.summary?.failedRecords).toBe(1);

    expect(result.summary?.errors[0].line).toBe(2);
    expect(result.summary?.errors[0].raw).toBe('laptop,doc1,abc');
    expect(result.summary?.errors[0].error).toBe('Invalid rating "abc". Must be a number.');
  });

  it('should ignore blank lines and still compute correct line numbers', async () => {
    const file = makeFile(`
      query,docid,rating

      laptop,doc1,1

      iphone,doc2,2
    `);

    const result = await processJudgmentFile(file);

    // after trimming+filtering, total lines should be 3
    expect(result.summary?.totalLinesRead).toBe(3);
    expect(result.summary?.successfulRecords).toBe(2);
    expect(result.summary?.failedRecords).toBe(0);
  });

  it('should normalize numeric ratings consistently', async () => {
    const file = makeFile(`
      query,docid,rating
      laptop,doc1,1.0
      laptop,doc2,1
      laptop,doc3,01
    `);

    const result = await processJudgmentFile(file);

    expect(result.summary?.successfulRecords).toBe(3);
    expect(result.summary?.failedRecords).toBe(0);

    // All should normalize to "1"
    expect(result.summary?.ratingDistribution).toEqual({ '1': 3 });

    expect(result.judgments).toEqual([
      {
        query: 'laptop',
        ratings: [
          { docId: 'doc1', rating: '1' },
          { docId: 'doc2', rating: '1' },
          { docId: 'doc3', rating: '1' },
        ],
      },
    ]);
  });
});
