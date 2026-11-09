/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { IRouter } from '../../../../src/core/server';
import { ServiceEndpoints } from '../../common';
import { registerMetricsRoute } from './metrics_route';

const createMockRouter = () =>
  ({
    get: jest.fn(),
    put: jest.fn(),
    post: jest.fn(),
    delete: jest.fn(),
  } as unknown as IRouter);

const getMetricsStatsRoute = (router: IRouter) => {
  const getCalls = (router.get as jest.Mock).mock.calls;
  const statsRoute = getCalls.find(([config]) => config.path === ServiceEndpoints.GetStats);

  if (!statsRoute) {
    throw new Error('Metrics stats route was not registered');
  }

  const [config, handler] = statsRoute;
  return { config, handler };
};

const sampleStats = {
  data: {
    search_relevance: {
      fetch_index: {
        200: { response_time_total: 120, count: 2 },
      },
    },
  },
  overall: {
    response_time_avg: 60,
    requests_per_second: 0.033,
  },
  counts_by_component: { search_relevance: 2 },
  counts_by_status_code: { 200: 2 },
};

describe('registerMetricsRoute', () => {
  let router: IRouter;
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    router = createMockRouter();
    registerMetricsRoute(router);
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  describe('route registration', () => {
    it('registers a single GET route at the stats endpoint without validation and without auth', () => {
      expect(router.get).toHaveBeenCalledTimes(1);
      expect(router.get).toHaveBeenCalledWith(
        expect.objectContaining({
          path: ServiceEndpoints.GetStats,
          validate: false,
          options: {
            authRequired: false,
          },
        }),
        expect.any(Function)
      );
    });
  });

  describe('request handling', () => {
    let getStats: jest.Mock;
    let mockContext: {
      searchRelevance: { metricsService: { getStats: jest.Mock } };
    };
    let mockResponse: { ok: jest.Mock; custom: jest.Mock };

    beforeEach(() => {
      getStats = jest.fn();
      mockContext = {
        searchRelevance: {
          metricsService: {
            getStats,
          },
        },
      };
      mockResponse = {
        ok: jest.fn(),
        custom: jest.fn(),
      };
    });

    const invokeHandler = async () => {
      const { handler } = getMetricsStatsRoute(router);
      await handler(mockContext, {}, mockResponse);
    };

    it('returns metrics from the metrics service as pretty-printed JSON', async () => {
      getStats.mockReturnValue(sampleStats);

      await invokeHandler();

      expect(getStats).toHaveBeenCalledTimes(1);
      expect(mockResponse.ok).toHaveBeenCalledWith({
        body: JSON.stringify(sampleStats, null, 2),
      });
      expect(mockResponse.custom).not.toHaveBeenCalled();
    });

    it('propagates the error status code when getStats throws an error with one', async () => {
      const error = Object.assign(new Error('metrics unavailable'), { statusCode: 503 });
      getStats.mockImplementation(() => {
        throw error;
      });

      await invokeHandler();

      expect(mockResponse.custom).toHaveBeenCalledWith({
        statusCode: 503,
        body: 'metrics unavailable',
      });
      expect(mockResponse.ok).not.toHaveBeenCalled();
      expect(consoleErrorSpy).toHaveBeenCalledWith(error);
    });

    it('falls back to a 500 status code when getStats throws a plain error', async () => {
      getStats.mockImplementation(() => {
        throw new Error('unexpected failure');
      });

      await invokeHandler();

      expect(mockResponse.custom).toHaveBeenCalledWith({
        statusCode: 500,
        body: 'unexpected failure',
      });
      expect(mockResponse.ok).not.toHaveBeenCalled();
    });
  });
});
