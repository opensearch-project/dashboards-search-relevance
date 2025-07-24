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

describe('Query Processor Utils', () => {
  describe('processQuery', () => {
    it('should replace %SearchText% placeholder', () => {
      const query = '{"query": {"match": {"title": "%SearchText%"}}}';
      const searchText = 'test search';

      const result = processQuery(query, searchText);

      expect(result).toBe('{"query": {"match": {"title": "test search"}}}');
    });

    it('should handle empty search text', () => {
      const query = '{"query": {"match": {"title": "%SearchText%"}}}';
      const searchText = '';

      const result = processQuery(query, searchText);

      expect(result).toBe('{"query": {"match": {"title": ""}}}');
    });
  });

  describe('prepareQueryBody', () => {
    it('should parse JSON query correctly', () => {
      const query = '{"query": {"match_all": {}}}';

      const result = prepareQueryBody(query);

      expect(result).toEqual({ query: { match_all: {} } });
    });

    it('should handle invalid JSON', () => {
      const query = '{ invalid json }';

      expect(() => prepareQueryBody(query)).toThrow();
    });
  });

  describe('buildValidationRequestBody', () => {
    it('should build request body with pipeline', () => {
      const index = 'test-index';
      const queryBody = { query: { match_all: {} } };
      const pipeline = 'test-pipeline';

      const result = buildValidationRequestBody(index, queryBody, pipeline);

      expect(result).toEqual({
        query: {
          index,
          size: 5,
          query: { match_all: {} },
          search_pipeline: pipeline,
        },
      });
    });

    it('should build request body without pipeline', () => {
      const index = 'test-index';
      const queryBody = { query: { match_all: {} } };

      const result = buildValidationRequestBody(index, queryBody);

      expect(result).toEqual({
        query: {
          index,
          size: 5,
          query: { match_all: {} },
        },
      });
    });
  });

  describe('processSearchResults', () => {
    it('should process search results correctly', () => {
      const rawResults = {
        hits: {
          hits: [
            { _id: '1', _source: { title: 'Doc 1' } },
            { _id: '2', _source: { title: 'Doc 2' } },
          ],
          total: { value: 2 },
        },
      };

      const result = processSearchResults(rawResults);

      expect(result).toEqual(rawResults);
    });

    it('should handle legacy total format', () => {
      const rawResults = {
        hits: {
          hits: [{ _id: '1', _source: { title: 'Doc 1' } }],
          total: 1,
        },
      };

      const result = processSearchResults(rawResults);

      expect(result).toEqual(rawResults);
    });
  });
});