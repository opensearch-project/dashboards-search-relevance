/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

describe('Memory Management Functions', () => {
  const extractMemoryId = (queryString: string): string | null => {
    try {
      const query = JSON.parse(queryString);
      return query?.query?.agentic?.memory_id || null;
    } catch {
      return null;
    }
  };

  const addMemoryIdToQuery = (queryString: string, memoryId: string): string => {
    try {
      const query = JSON.parse(queryString);
      if (query?.query?.agentic) {
        query.query.agentic.memory_id = memoryId;
        return JSON.stringify(query, null, 2);
      }
    } catch {}
    return queryString;
  };

  const removeMemoryIdFromQuery = (queryString: string): string => {
    try {
      const query = JSON.parse(queryString);
      if (query?.query?.agentic?.memory_id) {
        delete query.query.agentic.memory_id;
        return JSON.stringify(query, null, 2);
      }
    } catch {}
    return queryString;
  };

  describe('extractMemoryId', () => {
    it('should extract memory ID from agentic query', () => {
      const queryString = JSON.stringify({
        query: {
          agentic: {
            query_text: 'Find shoes',
            memory_id: 'test-memory-id'
          }
        }
      });
      expect(extractMemoryId(queryString)).toBe('test-memory-id');
    });

    it('should return null when no memory ID exists', () => {
      const queryString = JSON.stringify({
        query: {
          agentic: {
            query_text: 'Find shoes'
          }
        }
      });
      expect(extractMemoryId(queryString)).toBeNull();
    });

    it('should return null for invalid JSON', () => {
      expect(extractMemoryId('invalid json')).toBeNull();
    });

    it('should return null for non-agentic query', () => {
      const queryString = JSON.stringify({
        query: {
          match: { title: 'test' }
        }
      });
      expect(extractMemoryId(queryString)).toBeNull();
    });
  });

  describe('addMemoryIdToQuery', () => {
    it('should add memory ID to agentic query', () => {
      const queryString = JSON.stringify({
        query: {
          agentic: {
            query_text: 'Find shoes'
          }
        }
      });
      const result = addMemoryIdToQuery(queryString, 'new-memory-id');
      const parsed = JSON.parse(result);
      expect(parsed.query.agentic.memory_id).toBe('new-memory-id');
    });

    it('should return original string for non-agentic query', () => {
      const queryString = JSON.stringify({
        query: {
          match: { title: 'test' }
        }
      });
      const result = addMemoryIdToQuery(queryString, 'memory-id');
      expect(result).toBe(queryString);
    });

    it('should return original string for invalid JSON', () => {
      const invalidJson = 'invalid json';
      const result = addMemoryIdToQuery(invalidJson, 'memory-id');
      expect(result).toBe(invalidJson);
    });
  });

  describe('removeMemoryIdFromQuery', () => {
    it('should remove memory ID from agentic query', () => {
      const queryString = JSON.stringify({
        query: {
          agentic: {
            query_text: 'Find shoes',
            memory_id: 'test-memory-id'
          }
        }
      });
      const result = removeMemoryIdFromQuery(queryString);
      const parsed = JSON.parse(result);
      expect(parsed.query.agentic.memory_id).toBeUndefined();
      expect(parsed.query.agentic.query_text).toBe('Find shoes');
    });

    it('should return original string when no memory ID exists', () => {
      const queryString = JSON.stringify({
        query: {
          agentic: {
            query_text: 'Find shoes'
          }
        }
      });
      const result = removeMemoryIdFromQuery(queryString);
      expect(result).toBe(queryString);
    });

    it('should return original string for invalid JSON', () => {
      const invalidJson = 'invalid json';
      const result = removeMemoryIdFromQuery(invalidJson);
      expect(result).toBe(invalidJson);
    });
  });
});