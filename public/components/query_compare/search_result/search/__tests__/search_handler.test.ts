/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { SearchHandler } from '../search_handler';
import { ServiceEndpoints } from '../../../../../../common';

describe('SearchHandler', () => {
  const mockHttp = {
    post: jest.fn(),
  };

  let searchHandler: SearchHandler;

  beforeEach(() => {
    searchHandler = new SearchHandler(mockHttp as any);
    jest.clearAllMocks();
  });

  describe('performSearch', () => {
    it('should perform single search with correct parameters', async () => {
      const requestBody = { query: 'test' };
      const dataSourceId = 'test-datasource';

      mockHttp.post.mockResolvedValue({ hits: { hits: [] } });

      await searchHandler.performSearch(requestBody, dataSourceId);

      expect(mockHttp.post).toHaveBeenCalledWith(ServiceEndpoints.GetSearchResults, {
        body: JSON.stringify({
          query: requestBody,
          dataSourceId,
        }),
      });
    });
  });

  describe('performDualSearch', () => {
    it('should perform two parallel searches with correct parameters', async () => {
      const requestBody1 = { query: 'test1' };
      const requestBody2 = { query: 'test2' };
      const dataSourceId1 = 'datasource1';
      const dataSourceId2 = 'datasource2';

      mockHttp.post.mockResolvedValue({ result: { hits: { hits: [] } } });

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
  });
});
