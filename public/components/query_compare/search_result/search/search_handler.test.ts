/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { SearchHandler } from './search_handler';
import { ServiceEndpoints } from '../../../../../common';

describe('SearchHandler', () => {
  let searchHandler: SearchHandler;
  let mockHttp: any;

  beforeEach(() => {
    mockHttp = {
      post: jest.fn().mockResolvedValue({ results: [] }),
    };
    searchHandler = new SearchHandler(mockHttp);
  });

  describe('performSearch', () => {
    it('should call http.post with correct parameters', async () => {
      const requestBody = { query: { match_all: {} } };
      const dataSourceId = 'ds-123';

      await searchHandler.performSearch(requestBody, dataSourceId);

      expect(mockHttp.post).toHaveBeenCalledWith(ServiceEndpoints.GetSearchResults, {
        body: JSON.stringify({
          query: requestBody,
          dataSourceId,
        }),
      });
    });

    it('should return search results', async () => {
      const expectedResults = { hits: { hits: [{ _id: '1' }] } };
      mockHttp.post.mockResolvedValue(expectedResults);

      const result = await searchHandler.performSearch({ query: {} }, 'ds-123');

      expect(result).toEqual(expectedResults);
    });
  });

  describe('performDualSearch', () => {
    it('should call http.post twice with separate queries', async () => {
      const requestBody1 = { query: { match: { title: 'test' } } };
      const requestBody2 = { query: { term: { status: 'active' } } };
      const dataSourceId1 = 'ds-123';
      const dataSourceId2 = 'ds-456';

      mockHttp.post
        .mockResolvedValueOnce({ result: { hits: { hits: [{ _id: '1' }] } } })
        .mockResolvedValueOnce({ result: { hits: { hits: [{ _id: '2' }] } } });

      await searchHandler.performDualSearch(requestBody1, requestBody2, dataSourceId1, dataSourceId2);

      expect(mockHttp.post).toHaveBeenCalledTimes(2);
      expect(mockHttp.post).toHaveBeenNthCalledWith(1, ServiceEndpoints.GetSearchResults, {
        body: JSON.stringify({
          query: requestBody1,
          dataSourceId: dataSourceId1,
        }),
      });
      expect(mockHttp.post).toHaveBeenNthCalledWith(2, ServiceEndpoints.GetSearchResults, {
        body: JSON.stringify({
          query: requestBody2,
          dataSourceId: dataSourceId2,
        }),
      });
    });

    it('should return dual search results', async () => {
      mockHttp.post
        .mockResolvedValueOnce({ result: { hits: { hits: [{ _id: '1' }] } } })
        .mockResolvedValueOnce({ result: { hits: { hits: [{ _id: '2' }] } } });

      const result = await searchHandler.performDualSearch(
        { query: {} },
        { query: {} },
        'ds-1',
        'ds-2'
      );

      expect(result).toEqual({
        result1: { hits: { hits: [{ _id: '1' }] } },
        result2: { hits: { hits: [{ _id: '2' }] } },
        errorMessage1: undefined,
        errorMessage2: undefined,
      });
    });
  });
});
