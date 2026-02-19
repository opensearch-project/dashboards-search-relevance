/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { processQueryFile, parseTextQueries } from '../utils/file_processor';

describe('file_processor', () => {
  describe('processQueryFile', () => {
    it('should process valid NDJSON file correctly', async () => {
      const fileContent = `{"queryText": "test query 1", "referenceAnswer": "answer 1"}
{"queryText": "test query 2", "referenceAnswer": "answer 2"}`;

      const mockFile = ({
        text: jest.fn().mockResolvedValue(fileContent),
      } as unknown) as File;

      const result = await processQueryFile(mockFile);

      expect(result.error).toBeUndefined();
      expect(result.queries).toHaveLength(2);
      expect(result.queries[0]).toEqual({
        queryText: 'test query 1',
        referenceAnswer: 'answer 1',
      });
      expect(result.queries[1]).toEqual({
        queryText: 'test query 2',
        referenceAnswer: 'answer 2',
      });
    });

    it('should handle queries without referenceAnswer', async () => {
      const fileContent = `{"queryText": "test query 1"}
{"queryText": "test query 2", "referenceAnswer": "answer 2"}`;

      const mockFile = ({
        text: jest.fn().mockResolvedValue(fileContent),
      } as unknown) as File;

      const result = await processQueryFile(mockFile);

      expect(result.error).toBeUndefined();
      expect(result.queries).toHaveLength(2);
      expect(result.queries[0]).toEqual({
        queryText: 'test query 1',
        referenceAnswer: '',
      });
    });
  });

  it('should handle 0 correctly in referenceAnswer', async () => {
    const fileContent = `{"queryText": "test query 1", "referenceAnswer": 0}\n{"queryText": "test query 2", "referenceAnswer": null}`;

    const mockFile = ({
      text: jest.fn().mockResolvedValue(fileContent),
    } as unknown) as File;

    const result = await processQueryFile(mockFile);

    expect(result.error).toBeUndefined();
    expect(result.queries).toHaveLength(2);
    expect(result.queries[0]).toEqual({
      queryText: 'test query 1',
      referenceAnswer: '0',
    });
    expect(result.queries[1]).toEqual({
      queryText: 'test query 2',
      referenceAnswer: '',
    });
  });

  it('should return error when no valid queries found', async () => {
    const fileContent = `{"invalidField": "value"}
{"anotherField": "value"}`;

    const mockFile = ({
      text: jest.fn().mockResolvedValue(fileContent),
    } as unknown) as File;

    const result = await processQueryFile(mockFile);

    expect(result.error).toBe('No valid queries found in file');
    expect(result.queries).toHaveLength(0);
  });

  it('should handle malformed JSON gracefully', async () => {
    const fileContent = `{"queryText": "valid query"}
{invalid json}
{"queryText": "another valid query"}`;

    const mockFile = ({
      text: jest.fn().mockResolvedValue(fileContent),
    } as unknown) as File;

    const result = await processQueryFile(mockFile);

    expect(result.error).toBeUndefined();
    expect(result.queries).toHaveLength(2);
    expect(result.queries[0].queryText).toBe('valid query');
    expect(result.queries[1].queryText).toBe('another valid query');
  });

  it('should handle file read errors', async () => {
    const mockFile = ({
      text: jest.fn().mockRejectedValue(new Error('File read error')),
    } as unknown) as File;

    const result = await processQueryFile(mockFile);

    expect(result.error).toBe('Error reading file content');
    expect(result.queries).toHaveLength(0);
  });
});

describe('parseTextQueries', () => {
  it('should parse simple one-per-line queries', () => {
    const text = 'red bluejeans\nred blue jeans\nbluejeans\nacid wash blue jeans';
    const result = parseTextQueries(text);

    expect(result.error).toBeUndefined();
    expect(result.queries).toHaveLength(4);
    expect(result.queries[0]).toEqual({ queryText: 'red bluejeans', referenceAnswer: '' });
    expect(result.queries[1]).toEqual({ queryText: 'red blue jeans', referenceAnswer: '' });
    expect(result.queries[2]).toEqual({ queryText: 'bluejeans', referenceAnswer: '' });
    expect(result.queries[3]).toEqual({ queryText: 'acid wash blue jeans', referenceAnswer: '' });
  });

  it('should preserve # in plain text queries (no splitting)', () => {
    const text = 'what is C#?\ncolor #FF0000';
    const result = parseTextQueries(text);

    expect(result.error).toBeUndefined();
    expect(result.queries).toHaveLength(2);
    expect(result.queries[0]).toEqual({ queryText: 'what is C#?', referenceAnswer: '' });
    expect(result.queries[1]).toEqual({ queryText: 'color #FF0000', referenceAnswer: '' });
  });

  it('should filter out empty lines', () => {
    const text = 'query one\n\n\nquery two\n   \nquery three';
    const result = parseTextQueries(text);

    expect(result.error).toBeUndefined();
    expect(result.queries).toHaveLength(3);
    expect(result.queries[0].queryText).toBe('query one');
    expect(result.queries[1].queryText).toBe('query two');
    expect(result.queries[2].queryText).toBe('query three');
  });

  it('should return error for empty string', () => {
    const result = parseTextQueries('');
    expect(result.error).toBe('No queries provided. Enter at least one query.');
    expect(result.queries).toHaveLength(0);
  });

  it('should return error for whitespace-only string', () => {
    const result = parseTextQueries('   \n   \n  ');
    expect(result.error).toBe('No queries provided. Enter at least one query.');
    expect(result.queries).toHaveLength(0);
  });

  it('should trim whitespace from plain text queries', () => {
    const text = '  red blue jeans  ';
    const result = parseTextQueries(text);

    expect(result.error).toBeUndefined();
    expect(result.queries).toHaveLength(1);
    expect(result.queries[0]).toEqual({ queryText: 'red blue jeans', referenceAnswer: '' });
  });

  it('should handle a single query', () => {
    const result = parseTextQueries('single query');

    expect(result.error).toBeUndefined();
    expect(result.queries).toHaveLength(1);
    expect(result.queries[0]).toEqual({ queryText: 'single query', referenceAnswer: '' });
  });

  it('should parse NDJSON format lines', () => {
    const text = '{"queryText":"red bluejeans","referenceAnswer":""}\n{"queryText":"what is the capital of France?","referenceAnswer":"Paris"}';
    const result = parseTextQueries(text);

    expect(result.error).toBeUndefined();
    expect(result.queries).toHaveLength(2);
    expect(result.queries[0]).toEqual({ queryText: 'red bluejeans', referenceAnswer: '' });
    expect(result.queries[1]).toEqual({ queryText: 'what is the capital of France?', referenceAnswer: 'Paris' });
  });

  it('should parse full NDJSON paste (same format as file upload)', () => {
    const text =
      '{"queryText":"red bluejeans","referenceAnswer":""}\n' +
      '{"queryText":"what is the capital of France?","referenceAnswer":"Paris"}\n' +
      '{"queryText":"query with, comma","referenceAnswer":"reference answer"}\n' +
      '{"queryText":"query with, comma no reference","referenceAnswer":""}';
    const result = parseTextQueries(text);

    expect(result.error).toBeUndefined();
    expect(result.queries).toHaveLength(4);
    expect(result.queries[0]).toEqual({ queryText: 'red bluejeans', referenceAnswer: '' });
    expect(result.queries[1]).toEqual({ queryText: 'what is the capital of France?', referenceAnswer: 'Paris' });
    expect(result.queries[2]).toEqual({ queryText: 'query with, comma', referenceAnswer: 'reference answer' });
    expect(result.queries[3]).toEqual({ queryText: 'query with, comma no reference', referenceAnswer: '' });
  });

  it('should handle mixed plain text and NDJSON lines', () => {
    const text = 'red bluejeans\n{"queryText":"what is the capital of France?","referenceAnswer":"Paris"}\nacid wash blue jeans';
    const result = parseTextQueries(text);

    expect(result.error).toBeUndefined();
    expect(result.queries).toHaveLength(3);
    expect(result.queries[0]).toEqual({ queryText: 'red bluejeans', referenceAnswer: '' });
    expect(result.queries[1]).toEqual({ queryText: 'what is the capital of France?', referenceAnswer: 'Paris' });
    expect(result.queries[2]).toEqual({ queryText: 'acid wash blue jeans', referenceAnswer: '' });
  });

  it('should handle NDJSON without referenceAnswer field', () => {
    const text = '{"queryText":"test query"}';
    const result = parseTextQueries(text);

    expect(result.error).toBeUndefined();
    expect(result.queries).toHaveLength(1);
    expect(result.queries[0]).toEqual({ queryText: 'test query', referenceAnswer: '' });
  });

  it('should handle invalid JSON gracefully and fall back to plain text', () => {
    const text = '{invalid json line}';
    const result = parseTextQueries(text);

    expect(result.error).toBeUndefined();
    expect(result.queries).toHaveLength(1);
    expect(result.queries[0]).toEqual({ queryText: '{invalid json line}', referenceAnswer: '' });
  });

  it('should handle queries with special characters as plain text', () => {
    const text = 'what is C#?\n"quoted query"\nquery with, comma';
    const result = parseTextQueries(text);

    expect(result.error).toBeUndefined();
    expect(result.queries).toHaveLength(3);
    expect(result.queries[0]).toEqual({ queryText: 'what is C#?', referenceAnswer: '' });
    expect(result.queries[1]).toEqual({ queryText: '"quoted query"', referenceAnswer: '' });
    expect(result.queries[2]).toEqual({ queryText: 'query with, comma', referenceAnswer: '' });
  });

  it('should parse key-value format with quoted values and answer', () => {
    const text = 'query: "red bluejeans", answer: "fashion query"';
    const result = parseTextQueries(text);

    expect(result.error).toBeUndefined();
    expect(result.queries).toHaveLength(1);
    expect(result.queries[0]).toEqual({ queryText: 'red bluejeans', referenceAnswer: 'fashion query' });
  });

  it('should parse key-value format without answer', () => {
    const text = 'query: "red bluejeans"';
    const result = parseTextQueries(text);

    expect(result.error).toBeUndefined();
    expect(result.queries).toHaveLength(1);
    expect(result.queries[0]).toEqual({ queryText: 'red bluejeans', referenceAnswer: '' });
  });

  it('should parse key-value format with unquoted values', () => {
    const text = 'query: red bluejeans, answer: fashion query';
    const result = parseTextQueries(text);

    expect(result.error).toBeUndefined();
    expect(result.queries).toHaveLength(1);
    expect(result.queries[0]).toEqual({ queryText: 'red bluejeans', referenceAnswer: 'fashion query' });
  });

  it('should parse key-value format with unquoted query only', () => {
    const text = 'query: red bluejeans';
    const result = parseTextQueries(text);

    expect(result.error).toBeUndefined();
    expect(result.queries).toHaveLength(1);
    expect(result.queries[0]).toEqual({ queryText: 'red bluejeans', referenceAnswer: '' });
  });

  it('should be case-insensitive for key-value keys', () => {
    const text = 'Query: "test query", Answer: "test answer"';
    const result = parseTextQueries(text);

    expect(result.error).toBeUndefined();
    expect(result.queries).toHaveLength(1);
    expect(result.queries[0]).toEqual({ queryText: 'test query', referenceAnswer: 'test answer' });
  });

  it('should handle mixed plain text, key-value, and NDJSON', () => {
    const text =
      'red bluejeans\n' +
      'query: "capital of France?", answer: "Paris"\n' +
      '{"queryText":"acid wash jeans","referenceAnswer":"denim"}\n' +
      'query: simple unquoted query\n' +
      'another plain text query';
    const result = parseTextQueries(text);

    expect(result.error).toBeUndefined();
    expect(result.queries).toHaveLength(5);
    expect(result.queries[0]).toEqual({ queryText: 'red bluejeans', referenceAnswer: '' });
    expect(result.queries[1]).toEqual({ queryText: 'capital of France?', referenceAnswer: 'Paris' });
    expect(result.queries[2]).toEqual({ queryText: 'acid wash jeans', referenceAnswer: 'denim' });
    expect(result.queries[3]).toEqual({ queryText: 'simple unquoted query', referenceAnswer: '' });
    expect(result.queries[4]).toEqual({ queryText: 'another plain text query', referenceAnswer: '' });
  });

  it('should preserve trailing comma in key-value query when no answer is provided', () => {
    const text = 'query: "ACME,"';
    const result = parseTextQueries(text);

    expect(result.error).toBeUndefined();
    expect(result.queries).toHaveLength(1);
    expect(result.queries[0]).toEqual({ queryText: 'ACME,', referenceAnswer: '' });
  });

  it('should handle 0 correctly in NDJSON referenceAnswer', () => {
    const text = '{"queryText":"test query","referenceAnswer":0}';
    const result = parseTextQueries(text);

    expect(result.error).toBeUndefined();
    expect(result.queries).toHaveLength(1);
    expect(result.queries[0]).toEqual({ queryText: 'test query', referenceAnswer: '0' });
  });

  it('should preserve empty string as referenceAnswer when null is passed in NDJSON', () => {
    const text = '{"queryText":"test query","referenceAnswer":null}';
    const result = parseTextQueries(text);

    expect(result.error).toBeUndefined();
    expect(result.queries).toHaveLength(1);
    expect(result.queries[0]).toEqual({ queryText: 'test query', referenceAnswer: '' });
  });
});
