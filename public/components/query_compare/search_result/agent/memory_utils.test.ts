/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { extractMemoryId, addMemoryIdToQuery, removeMemoryIdFromQuery } from './memory_utils';

describe('memory_utils', () => {
  const validQuery = '{"query":{"agentic":{"memory_id":"test-123"}}}';
  const queryWithoutMemory = '{"query":{"match":{"title":"test"}}}';
  const queryWithoutAgentic = '{"query":{"match":{"title":"test"}}}';
  const invalidJson = '{"invalid": json}';

  describe('extractMemoryId', () => {
    it('should extract memory ID from valid query', () => {
      expect(extractMemoryId(validQuery)).toBe('test-123');
    });

    it('should return null when no memory ID exists', () => {
      expect(extractMemoryId(queryWithoutMemory)).toBeNull();
    });

    it('should return null when no agentic section exists', () => {
      expect(extractMemoryId(queryWithoutAgentic)).toBeNull();
    });

    it('should throw error for invalid JSON', () => {
      expect(() => extractMemoryId(invalidJson)).toThrow();
    });
  });

  describe('addMemoryIdToQuery', () => {
    it('should add memory ID to existing agentic query', () => {
      const result = addMemoryIdToQuery(queryWithoutAgentic.replace('match', 'agentic'), 'new-123');
      const parsed = JSON.parse(result);
      expect(parsed.query.agentic.memory_id).toBe('new-123');
    });

    it('should return original string for invalid JSON', () => {
      const result = addMemoryIdToQuery(invalidJson, 'new-123');
      expect(result).toBe(invalidJson);
    });

    it('should return original string when no agentic section', () => {
      const result = addMemoryIdToQuery(queryWithoutMemory, 'new-123');
      expect(result).toBe(queryWithoutMemory);
    });
  });

  describe('removeMemoryIdFromQuery', () => {
    it('should remove memory ID from query', () => {
      const result = removeMemoryIdFromQuery(validQuery);
      const parsed = JSON.parse(result);
      expect(parsed.query.agentic.memory_id).toBeUndefined();
    });

    it('should return original string for invalid JSON', () => {
      const result = removeMemoryIdFromQuery(invalidJson);
      expect(result).toBe(invalidJson);
    });

    it('should return original string when no memory ID exists', () => {
      const result = removeMemoryIdFromQuery(queryWithoutMemory);
      expect(result).toBe(queryWithoutMemory);
    });
  });
});
