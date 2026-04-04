/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  processQuery,
  prepareQueryBody,
  buildValidationRequestBody,
  processSearchResults,
} from '../utils/query_processor';

describe('query_processor', () => {
  describe('processQuery', () => {
    it('should replace placeholder with search text', () => {
      const query = '{"query": {"match": {"title": "%queryText%"}}}';
      const searchText = 'test search';

      const result = processQuery(query, searchText);

      expect(result).toBe('{"query": {"match": {"title": "test search"}}}');
    });

    it('should handle multiple placeholders', () => {
      const query =
        '{"query": {"bool": {"must": [{"match": {"title": "%queryText%"}}, {"match": {"content": "%SearchText%"}}]}}}';
      const searchText = 'test';

      const result = processQuery(query, searchText);

      expect(result).toBe(
        '{"query": {"bool": {"must": [{"match": {"title": "test"}}, {"match": {"content": "test"}}]}}}'
      );
    });

    it('should handle query without placeholders', () => {
      const query = '{"query": {"match_all": {}}}';
      const searchText = 'test';

      const result = processQuery(query, searchText);

      expect(result).toBe('{"query": {"match_all": {}}}');
    });

    it('should handle empty search text', () => {
      const query = '{"query": {"match": {"title": "%queryText%"}}}';
      const searchText = '';

      const result = processQuery(query, searchText);

      expect(result).toBe('{"query": {"match": {"title": ""}}}');
    });
  });

  describe('prepareQueryBody', () => {
    it('should parse valid JSON query with query field', () => {
      const query = '{"query": {"match_all": {}}}';

      const result = prepareQueryBody(query);

      expect(result).toEqual({ query: { match_all: {} } });
    });

    it('should wrap query without query field', () => {
      const query = '{"match_all": {}}';

      const result = prepareQueryBody(query);

      expect(result).toEqual({ query: { match_all: {} } });
    });

    it('should throw error for invalid JSON', () => {
      const query = '{"query": {"match_all":}';

      expect(() => prepareQueryBody(query)).toThrow('Invalid query JSON');
    });

    it('should handle complex query structure', () => {
      const query = '{"query": {"bool": {"must": [{"match": {"title": "test"}}]}}, "size": 10}';

      const result = prepareQueryBody(query);

      expect(result).toEqual({
        query: {
          bool: {
            must: [{ match: { title: 'test' } }],
          },
        },
        size: 10,
      });
    });
  });

  describe('buildValidationRequestBody', () => {
    it('should build request body without pipeline', () => {
      const index = 'test-index';
      const queryBody = { query: { match_all: {} } };

      const result = buildValidationRequestBody(index, queryBody);

      expect(result).toEqual({
        query: {
          index: 'test-index',
          size: 5,
          query: { match_all: {} },
        },
      });
    });

    it('should build request body with pipeline', () => {
      const index = 'test-index';
      const queryBody = { query: { match_all: {} } };
      const pipeline = 'test-pipeline';

      const result = buildValidationRequestBody(index, queryBody, pipeline);

      expect(result).toEqual({
        query: {
          index: 'test-index',
          size: 5,
          query: { match_all: {} },
          search_pipeline: 'test-pipeline',
        },
      });
    });

    it('should handle custom size', () => {
      const index = 'test-index';
      const queryBody = { query: { match_all: {} } };
      const size = 10;

      const result = buildValidationRequestBody(index, queryBody, undefined, size);

      expect(result).toEqual({
        query: {
          index: 'test-index',
          size: 10,
          query: { match_all: {} },
        },
      });
    });
  });

  describe('processSearchResults', () => {
    it('should process search results with unique hits', () => {
      const searchResult = {
        hits: {
          hits: [
            { _id: '1', _source: { title: 'Test 1' }, _score: 1.5 },
            { _id: '2', _source: { title: 'Test 2' }, _score: 1.2 },
          ],
        },
      };

      const result = processSearchResults(searchResult);

      expect(result.hits.hits).toHaveLength(2);
      expect(result.hits.hits[0]._id).toBe('1');
      expect(result.hits.hits[1]._id).toBe('2');
    });

    it('should handle duplicate hits', () => {
      const searchResult = {
        hits: {
          hits: [
            { _id: '1', _source: { title: 'Test 1' }, _score: 1.5 },
            { _id: '1', _source: { title: 'Test 1 Duplicate' }, _score: 1.3 },
            { _id: '2', _source: { title: 'Test 2' }, _score: 1.2 },
          ],
        },
      };

      const result = processSearchResults(searchResult);

      expect(result.hits.hits).toHaveLength(2);
      expect(result.hits.hits[0]._id).toBe('1');
      expect(result.hits.hits[0]._source.title).toBe('Test 1');
    });

    it('should handle empty search results', () => {
      const searchResult = {
        hits: {
          hits: [],
        },
      };

      const result = processSearchResults(searchResult);

      expect(result).toEqual({
        hits: {
          hits: [],
        },
      });
    });

    it('should handle null search results', () => {
      const searchResult = null;

      const result = processSearchResults(searchResult);

      expect(result).toBeNull();
    });

    it('should handle results without hits', () => {
      const searchResult = {};

      const result = processSearchResults(searchResult);

      expect(result).toEqual({});
    });
  });
});
