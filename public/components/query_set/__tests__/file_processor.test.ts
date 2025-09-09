/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { processQueryFile, processPlainTextFile } from '../utils/file_processor';

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

    it('should handle numeric values for queryText and referenceAnswer', async () => {
      const fileContent = `{"queryText": 12345, "referenceAnswer": 6789}`;

      const mockFile = ({
        text: jest.fn().mockResolvedValue(fileContent),
      } as unknown) as File;

      const result = await processQueryFile(mockFile);

      expect(result.error).toBeUndefined();
      expect(result.queries).toHaveLength(1);
      expect(result.queries[0]).toEqual({
        queryText: '12345',
        referenceAnswer: '6789',
      });
    });

    it('should handle empty file content', async () => {
      const fileContent = '';

      const mockFile = ({
        text: jest.fn().mockResolvedValue(fileContent),
      } as unknown) as File;

      const result = await processQueryFile(mockFile);

      expect(result.error).toBe('No valid queries found in file');
      expect(result.queries).toHaveLength(0);
    });

    it('should handle too many queries', async () => {
      // Mock implementation that will force the length check to fail
      jest.spyOn(Array.prototype, 'push').mockImplementationOnce(function() {
        Object.defineProperty(this, 'length', { value: 1000001 });
        return this.length;
      });

      const fileContent = `{"queryText": "query 1"}`;
      
      const mockFile = ({
        text: jest.fn().mockResolvedValue(fileContent),
      } as unknown) as File;

      const result = await processQueryFile(mockFile);

      expect(result.error).toBe('Too many queries found (> 1,000,000)');
      expect(result.queries).toHaveLength(0);
      
      // Restore the original method
      jest.restoreAllMocks();
    });
  });

  describe('processPlainTextFile', () => {
    it('should process plain text file correctly', async () => {
      const fileContent = `query 1
query 2
query 3`;

      const mockFile = ({
        text: jest.fn().mockResolvedValue(fileContent),
      } as unknown) as File;

      const result = await processPlainTextFile(mockFile);

      expect(result.error).toBeUndefined();
      expect(result.queries).toHaveLength(3);
      expect(result.queries[0]).toEqual({
        queryText: 'query 1',
        referenceAnswer: '',
      });
      expect(result.queries[1]).toEqual({
        queryText: 'query 2',
        referenceAnswer: '',
      });
      expect(result.queries[2]).toEqual({
        queryText: 'query 3',
        referenceAnswer: '',
      });
    });

    it('should handle empty lines in plain text', async () => {
      const fileContent = `query 1

query 2
  
query 3`;

      const mockFile = ({
        text: jest.fn().mockResolvedValue(fileContent),
      } as unknown) as File;

      const result = await processPlainTextFile(mockFile);

      expect(result.error).toBeUndefined();
      expect(result.queries).toHaveLength(3);
      expect(result.queries[0].queryText).toBe('query 1');
      expect(result.queries[1].queryText).toBe('query 2');
      expect(result.queries[2].queryText).toBe('query 3');
    });

    it('should return error when no valid queries found in plain text', async () => {
      const fileContent = `   
  
`;

      const mockFile = ({
        text: jest.fn().mockResolvedValue(fileContent),
      } as unknown) as File;

      const result = await processPlainTextFile(mockFile);

      expect(result.error).toBe('No valid queries found');
      expect(result.queries).toHaveLength(0);
    });

    it('should handle file read errors for plain text', async () => {
      const mockFile = ({
        text: jest.fn().mockRejectedValue(new Error('File read error')),
      } as unknown) as File;

      const result = await processPlainTextFile(mockFile);

      expect(result.error).toBe('Error reading file content');
      expect(result.queries).toHaveLength(0);
    });

    it('should handle mixed content with some JSON-like lines', async () => {
      const fileContent = `simple query
{"this": "looks like JSON but treated as plain text"}
another simple query`;

      const mockFile = ({
        text: jest.fn().mockResolvedValue(fileContent),
      } as unknown) as File;

      const result = await processPlainTextFile(mockFile);

      expect(result.error).toBeUndefined();
      expect(result.queries).toHaveLength(3);
      expect(result.queries[0].queryText).toBe('simple query');
      expect(result.queries[1].queryText).toBe('{"this": "looks like JSON but treated as plain text"}');
      expect(result.queries[2].queryText).toBe('another simple query');
    });

    it('should handle empty file content for plain text', async () => {
      const fileContent = '';

      const mockFile = ({
        text: jest.fn().mockResolvedValue(fileContent),
      } as unknown) as File;

      const result = await processPlainTextFile(mockFile);

      expect(result.error).toBe('No valid queries found');
      expect(result.queries).toHaveLength(0);
    });

    it('should handle too many queries in plain text', async () => {
      // Mock implementation that will force the length check to fail
      jest.spyOn(Array.prototype, 'push').mockImplementationOnce(function() {
        Object.defineProperty(this, 'length', { value: 1000001 });
        return this.length;
      });

      const fileContent = `query 1`;
      
      const mockFile = ({
        text: jest.fn().mockResolvedValue(fileContent),
      } as unknown) as File;

      const result = await processPlainTextFile(mockFile);

      expect(result.error).toBe('Too many queries found (> 1,000,000)');
      expect(result.queries).toHaveLength(0);
      
      // Restore the original method
      jest.restoreAllMocks();
    });
  });
});