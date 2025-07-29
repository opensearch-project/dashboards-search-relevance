/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { processQueryFile } from '../utils/file_processor';

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
  });
});
