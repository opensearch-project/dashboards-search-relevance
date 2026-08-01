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
    post: jest.fn(),
  } as unknown as IRouter);

const getSearchHandler = (router: IRouter) => {
  const route = (router.post as jest.Mock).mock.calls.find(
    ([config]) => config.path === ServiceEndpoints.GetSearchResults
  );

  if (!route) {
    throw new Error('Search route was not registered');
  }

  return route[1];
};

describe('registerDslRoute', () => {
  let router: IRouter;
  let callAPI: jest.Mock;
  let callAsCurrentUser: jest.Mock;
  let getClient: jest.Mock;
  let addMetric: jest.Mock;
  let context: any;
  let response: { ok: jest.Mock };

  beforeEach(() => {
    router = createMockRouter();
    registerDslRoute(router, true);

    callAPI = jest.fn();
    callAsCurrentUser = jest.fn();
    getClient = jest.fn().mockReturnValue({ callAPI });
    addMetric = jest.fn();
    context = {
      dataSource: { opensearch: { legacy: { getClient } } },
      core: { opensearch: { legacy: { client: { callAsCurrentUser } } } },
      searchRelevance: { metricsService: { addMetric } },
    };
    response = { ok: jest.fn() };
  });

  it('forwards the data source and pipeline through the unified search route', async () => {
    const result = { hits: { hits: [] } };
    callAPI.mockResolvedValue(result);
    const request = {
      body: {
        query: {
          index: 'products',
          size: 5,
          pipeline: 'my-pipeline',
          query: { match_all: {} },
        },
        dataSourceId: 'data-source-1',
      },
    };

    await getSearchHandler(router)(context, request, response);

    expect(getClient).toHaveBeenCalledWith('data-source-1');
    expect(callAPI).toHaveBeenCalledWith('search', {
      index: 'products',
      size: 5,
      body: { query: { match_all: {} } },
      search_pipeline: 'my-pipeline',
    });
    expect(callAsCurrentUser).not.toHaveBeenCalled();
    expect(response.ok).toHaveBeenCalledWith({ body: { result } });
  });

  it('returns a string error body from search failures', async () => {
    callAPI.mockRejectedValue({
      statusCode: 404,
      body: { error: { type: 'index_not_found_exception', reason: 'missing index' } },
    });

    await getSearchHandler(router)(
      context,
      {
        body: {
          query: { index: 'products', query: { match_all: {} } },
          dataSourceId: 'data-source-1',
        },
      },
      response
    );

    expect(response.ok).toHaveBeenCalledWith({
      body: {
        errorMessage: {
          statusCode: 404,
          body: 'Error: index_not_found_exception - missing index',
        },
      },
    });
  });
});
