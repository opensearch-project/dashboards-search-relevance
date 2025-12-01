/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { validateQuery, rewriteQuery, prepareQueries } from './query_processor';
import { QueryError, SelectIndexError, QueryStringError, initialQueryErrorState } from '../../../../types/index';

describe('query_processor', () => {
  describe('validateQuery', () => {
    it('should set selectIndex error when no index selected', () => {
      const queryError: QueryError = { ...initialQueryErrorState };
      validateQuery('', '{"query": {}}', queryError);
      expect(queryError.selectIndex).toBe(SelectIndexError.unselected);
    });

    it('should set queryString error when query is empty', () => {
      const queryError: QueryError = { ...initialQueryErrorState };
      validateQuery('test-index', '', queryError);
      expect(queryError.queryString).toBe(QueryStringError.empty);
      expect(queryError.errorResponse.statusCode).toBe(400);
    });

    it('should not set errors for valid input', () => {
      const queryError: QueryError = { ...initialQueryErrorState };
      validateQuery('test-index', '{"query": {}}', queryError);
      expect(queryError.selectIndex).toBe('');
      expect(queryError.queryString).toBe('');
    });
  });

  describe('rewriteQuery', () => {
    it('should replace %SearchText% with search value', () => {
      const queryError: QueryError = { ...initialQueryErrorState };
      const result = rewriteQuery('test', '{"query": {"match": {"title": "%SearchText%"}}}', queryError);
      expect(result.query.match.title).toBe('test');
    });

    it('should set error for invalid JSON', () => {
      const queryError: QueryError = { ...initialQueryErrorState };
      rewriteQuery('test', '{"invalid": json}', queryError);
      expect(queryError.queryString).toBe(QueryStringError.invalid);
      expect(queryError.errorResponse.statusCode).toBe(400);
    });

    it('should return undefined for empty query string', () => {
      const queryError: QueryError = { ...initialQueryErrorState };
      const result = rewriteQuery('test', '', queryError);
      expect(result).toBeUndefined();
    });
  });

  describe('prepareQueries', () => {
    it('should prepare both queries correctly', () => {
      const result = prepareQueries(
        'search-term',
        'index1',
        'index2',
        '{"query": {"match": {"title": "%SearchText%"}}}',
        '{"query": {"term": {"status": "%SearchText%"}}}'
      );

      expect(result.jsonQueries[0].query.match.title).toBe('search-term');
      expect(result.jsonQueries[1].query.term.status).toBe('search-term');
      expect(result.queryErrors).toHaveLength(2);
    });
  });
});
