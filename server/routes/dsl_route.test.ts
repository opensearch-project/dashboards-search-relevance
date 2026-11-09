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

// Pull the handler and route config registered for POST at `path`.
const getPostRoute = (router: IRouter, path: string) => {
  const calls = (router.post as jest.Mock).mock.calls;
  const route = calls.find(([config]) => config.path === path);

  if (!route) {
    throw new Error(`Route not registered: POST ${path}`);
  }

  return { config: route[0], handler: route[1] };
};

const createMockContext = () => {
  const callAsCurrentUser = jest.fn().mockResolvedValue({ hits: { hits: [] } });
  const callAPI = jest.fn().mockResolvedValue({ hits: { hits: [] } });
  const addMetric = jest.fn();

  return {
    context: {
      core: { opensearch: { legacy: { client: { callAsCurrentUser } } } },
      dataSource: { opensearch: { legacy: { getClient: jest.fn(() => ({ callAPI })) } } },
      searchRelevance: { metricsService: { addMetric } },
    } as any,
    callAsCurrentUser,
    callAPI,
    addMetric,
  };
};

const mockResponse = {
  ok: jest.fn((payload) => payload),
  custom: jest.fn((payload) => payload),
  customError: jest.fn((payload) => payload),
} as any;

describe('registerDslRoute', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('does not register a separate single_search route', () => {
    const router = createMockRouter();
    registerDslRoute(router, false);

    const paths = (router.post as jest.Mock).mock.calls.map(([config]) => config.path);

    expect(paths).toEqual([ServiceEndpoints.GetSearchResults]);
    expect(paths).not.toContain('/api/relevancy/single_search');
  });

  describe('search route', () => {
    it('declares a query schema so dataSourceId survives validation', () => {
      const router = createMockRouter();
      registerDslRoute(router, true);

      const { config } = getPostRoute(router, ServiceEndpoints.GetSearchResults);

      expect(config.validate.query).toBeDefined();
      expect(config.validate.query.validate({ dataSourceId: 'ds-1' })).toEqual({
        dataSourceId: 'ds-1',
      });
    });

    it('routes to the data source client using dataSourceId from the query parameter', async () => {
      const router = createMockRouter();
      registerDslRoute(router, true);
      const { handler } = getPostRoute(router, ServiceEndpoints.GetSearchResults);
      const { context, callAPI, callAsCurrentUser } = createMockContext();

      await handler(
        context,
        { body: { query: { index: 'test-index' } }, query: { dataSourceId: 'ds-1' } } as any,
        mockResponse
      );

      expect(context.dataSource.opensearch.legacy.getClient).toHaveBeenCalledWith('ds-1');
      expect(callAPI).toHaveBeenCalledWith('search', {
        index: 'test-index',
        size: 10,
        body: {},
      });
      expect(callAsCurrentUser).not.toHaveBeenCalled();
    });

    it('falls back to the local cluster when no dataSourceId is supplied', async () => {
      const router = createMockRouter();
      registerDslRoute(router, true);
      const { handler } = getPostRoute(router, ServiceEndpoints.GetSearchResults);
      const { context, callAPI, callAsCurrentUser } = createMockContext();

      await handler(context, { body: { query: { index: 'test-index' } }, query: {} } as any, mockResponse);

      expect(callAsCurrentUser).toHaveBeenCalledWith('search', {
        index: 'test-index',
        size: 10,
        body: {},
      });
      expect(callAPI).not.toHaveBeenCalled();
    });

    it('ignores dataSourceId when the data source feature is disabled', async () => {
      const router = createMockRouter();
      registerDslRoute(router, false);
      const { handler } = getPostRoute(router, ServiceEndpoints.GetSearchResults);
      const { context, callAPI, callAsCurrentUser } = createMockContext();

      await handler(
        context,
        { body: { query: { index: 'test-index' } }, query: { dataSourceId: 'ds-1' } } as any,
        mockResponse
      );

      expect(callAsCurrentUser).toHaveBeenCalled();
      expect(callAPI).not.toHaveBeenCalled();
    });

    it('forwards the pipeline as search_pipeline when one is given', async () => {
      const router = createMockRouter();
      registerDslRoute(router, false);
      const { handler } = getPostRoute(router, ServiceEndpoints.GetSearchResults);
      const { context, callAsCurrentUser } = createMockContext();

      await handler(
        context,
        {
          body: { query: { index: 'test-index', size: 5, pipeline: 'my-pipeline', query: { match_all: {} } } },
          query: {},
        } as any,
        mockResponse
      );

      expect(callAsCurrentUser).toHaveBeenCalledWith('search', {
        index: 'test-index',
        size: 5,
        body: { query: { match_all: {} } },
        search_pipeline: 'my-pipeline',
      });
    });

    it('rejects an invalid index without calling OpenSearch', async () => {
      const router = createMockRouter();
      registerDslRoute(router, false);
      const { handler } = getPostRoute(router, ServiceEndpoints.GetSearchResults);
      const { context, callAsCurrentUser } = createMockContext();

      const result = await handler(
        context,
        { body: { query: { index: 'Invalid Index' } }, query: {} } as any,
        mockResponse
      );

      expect(result.body.errorMessage).toEqual({
        statusCode: 400,
        body: 'Invalid Index or missing',
      });
      expect(callAsCurrentUser).not.toHaveBeenCalled();
    });

    it('rejects an invalid pipeline without calling OpenSearch', async () => {
      const router = createMockRouter();
      registerDslRoute(router, false);
      const { handler } = getPostRoute(router, ServiceEndpoints.GetSearchResults);
      const { context, callAsCurrentUser } = createMockContext();

      const result = await handler(
        context,
        { body: { query: { index: 'test-index', pipeline: 'bad pipeline!' } }, query: {} } as any,
        mockResponse
      );

      expect(result.body.errorMessage).toEqual({ statusCode: 400, body: 'Invalid Pipeline' });
      expect(callAsCurrentUser).not.toHaveBeenCalled();
    });

    it('reports search failures as an errorMessage', async () => {
      const router = createMockRouter();
      registerDslRoute(router, false);
      const { handler } = getPostRoute(router, ServiceEndpoints.GetSearchResults);
      const { context, callAsCurrentUser } = createMockContext();
      callAsCurrentUser.mockRejectedValue({
        statusCode: 404,
        body: { error: { type: 'index_not_found_exception', reason: 'no such index' } },
      });

      const result = await handler(
        context,
        { body: { query: { index: 'missing-index' } }, query: {} } as any,
        mockResponse
      );

      expect(result.body.errorMessage).toEqual({
        statusCode: 404,
        body: 'Error: index_not_found_exception - no such index',
      });
    });
  });
});
