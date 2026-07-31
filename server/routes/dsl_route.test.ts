/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { IRouter } from '../../../../src/core/server';
import { ServiceEndpoints } from '../../common';
import { registerDslRoute } from './dsl_route';

const createMockRouter = () =>
  ({
    get: jest.fn(),
    put: jest.fn(),
    post: jest.fn(),
    delete: jest.fn(),
  } as unknown as IRouter);

const getSingleSearchRoute = (router: IRouter) => {
  const postCalls = (router.post as jest.Mock).mock.calls;
  const route = postCalls.find(
    ([config]) => config.path === ServiceEndpoints.GetSingleSearchResults
  );

  if (!route) {
    throw new Error('Single search route was not registered');
  }

  const [config, handler] = route;
  return { config, handler };
};

const searchBody = {
  query: {
    index: 'products',
    size: 5,
    query: { match: { product_title: 'airpods' } },
  },
};

const searchHits = { hits: { total: { value: 2 }, hits: [{ _id: 'a' }, { _id: 'b' }] } };

describe('registerDslRoute — single search', () => {
  describe('route registration', () => {
    it('declares a query schema so dataSourceId survives request validation', () => {
      const router = createMockRouter();
      registerDslRoute(router, true);

      const { config } = getSingleSearchRoute(router);

      expect(config.validate.query).toBeDefined();
      expect(config.validate.query.validate({ dataSourceId: 'ds-1' })).toEqual({
        dataSourceId: 'ds-1',
      });
    });

    it('accepts a request with no query parameters', () => {
      const router = createMockRouter();
      registerDslRoute(router, true);

      const { config } = getSingleSearchRoute(router);

      expect(() => config.validate.query.validate(undefined)).not.toThrow();
    });

    it('rejects a repeated dataSourceId parameter', () => {
      const router = createMockRouter();
      registerDslRoute(router, true);

      const { config } = getSingleSearchRoute(router);

      expect(() => config.validate.query.validate({ dataSourceId: ['ds-1', 'ds-2'] })).toThrow(
        /expected value of type \[string\]/
      );
    });
  });

  describe('data source routing', () => {
    let callAPI: jest.Mock;
    let callAsCurrentUser: jest.Mock;
    let getClient: jest.Mock;
    let mockContext: any;
    let mockResponse: { ok: jest.Mock };

    beforeEach(() => {
      callAPI = jest.fn().mockResolvedValue(searchHits);
      callAsCurrentUser = jest.fn().mockResolvedValue({ hits: { total: { value: 0 }, hits: [] } });
      getClient = jest.fn().mockReturnValue({ callAPI });
      mockContext = {
        dataSource: { opensearch: { legacy: { getClient } } },
        core: { opensearch: { legacy: { client: { callAsCurrentUser } } } },
      };
      mockResponse = { ok: jest.fn() };
    });

    const invoke = async (
      dataSourceEnabled: boolean,
      request: { body: any; query?: any }
    ) => {
      const router = createMockRouter();
      registerDslRoute(router, dataSourceEnabled);
      const { handler } = getSingleSearchRoute(router);
      await handler(mockContext, request, mockResponse);
    };

    it('queries the selected data source when dataSourceId arrives as a query parameter', async () => {
      await invoke(true, { body: searchBody, query: { dataSourceId: 'ds-1' } });

      expect(getClient).toHaveBeenCalledWith('ds-1');
      expect(callAPI).toHaveBeenCalledWith('search', {
        index: 'products',
        size: 5,
        body: { query: { match: { product_title: 'airpods' } } },
      });
      expect(callAsCurrentUser).not.toHaveBeenCalled();
      expect(mockResponse.ok).toHaveBeenCalledWith({ body: { result: searchHits } });
    });

    it('falls back to the local cluster when no dataSourceId is supplied', async () => {
      await invoke(true, { body: searchBody, query: {} });

      expect(getClient).not.toHaveBeenCalled();
      expect(callAsCurrentUser).toHaveBeenCalledWith('search', {
        index: 'products',
        size: 5,
        body: { query: { match: { product_title: 'airpods' } } },
      });
    });

    it('ignores dataSourceId when multiple data sources are disabled', async () => {
      await invoke(false, { body: searchBody, query: { dataSourceId: 'ds-1' } });

      expect(getClient).not.toHaveBeenCalled();
      expect(callAsCurrentUser).toHaveBeenCalled();
    });

    it('passes search_pipeline through and keeps it out of the search body', async () => {
      await invoke(true, {
        body: { query: { ...searchBody.query, search_pipeline: 'hybrid-pipeline' } },
        query: { dataSourceId: 'ds-1' },
      });

      expect(callAPI).toHaveBeenCalledWith('search', {
        index: 'products',
        size: 5,
        body: { query: { match: { product_title: 'airpods' } } },
        search_pipeline: 'hybrid-pipeline',
      });
    });
  });
});
