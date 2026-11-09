/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { IRouter } from '../../../../src/core/server';
import { ServiceEndpoints } from '../../common';
import { registerSearchRelevanceRoutes } from './search_relevance_route_service';

const createMockRouter = () =>
  ({
    get: jest.fn(),
    put: jest.fn(),
    post: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
    patch: jest.fn(),
  }) as unknown as IRouter;

const getJudgmentCreateRouteSchema = (router: IRouter) => {
  const putCalls = (router.put as jest.Mock).mock.calls;
  const judgmentRoute = putCalls.find(([config]) => config.path === ServiceEndpoints.Judgments);

  if (!judgmentRoute) {
    throw new Error('Judgment create route was not registered');
  }

  return judgmentRoute[0].validate.body;
};

// Look up the params schema for an id-scoped route registered via `method` at `path`.
const getParamsSchema = (router: IRouter, method: 'put' | 'post', path: string) => {
  const calls = (router[method] as jest.Mock).mock.calls;
  const route = calls.find(([config]) => config.path === path);

  if (!route) {
    throw new Error(`Route not registered: ${method.toUpperCase()} ${path}`);
  }

  return route[0].validate.params;
};

describe('registerSearchRelevanceRoutes', () => {
  describe('judgment create route validation', () => {
    let bodySchema: ReturnType<typeof getJudgmentCreateRouteSchema>;

    beforeEach(() => {
      const router = createMockRouter();
      registerSearchRelevanceRoutes(router, false);
      bodySchema = getJudgmentCreateRouteSchema(router);
    });

    it('accepts tokenLimit as a number, matching the client payload', () => {
      const payload = {
        name: 'test judgment',
        type: 'LLM',
        querySetId: 'qs-1',
        searchConfigurationList: ['sc-1'],
        size: 5,
        modelId: 'model-1',
        tokenLimit: 1000,
      };

      expect(bodySchema.validate(payload)).toEqual(payload);
    });

    it('rejects non-numeric tokenLimit values', () => {
      expect(() =>
        bodySchema.validate({
          name: 'test judgment',
          type: 'LLM',
          tokenLimit: 'not-a-number',
        })
      ).toThrow();
    });
  });

  // The id from these routes is interpolated into the backend transport.request path, so it must
  // reject path separators and encoded traversal before it can reach an unintended endpoint.
  describe('id-scoped route param validation', () => {
    let router: IRouter;

    beforeEach(() => {
      router = createMockRouter();
      registerSearchRelevanceRoutes(router, false);
    });

    const idScopedRoutes: Array<['put' | 'post', string]> = [
      ['put', `${ServiceEndpoints.Judgments}/{id}`],
      ['post', `${ServiceEndpoints.JudgmentRetry}/{id}`],
    ];

    it.each(idScopedRoutes)('accepts a UUID-shaped id for %s %s', (method, path) => {
      const params = getParamsSchema(router, method, path);
      const id = '550e8400-e29b-41d4-a716-446655440000';
      expect(params.validate({ id })).toEqual({ id });
    });

    it.each(idScopedRoutes)(
      'rejects an id with encoded path traversal for %s %s',
      (method, path) => {
        const params = getParamsSchema(router, method, path);
        expect(() => params.validate({ id: '..%2F..%2F_cluster%2Fsettings' })).toThrow();
      }
    );

    it.each(idScopedRoutes)('rejects an id with a raw slash for %s %s', (method, path) => {
      const params = getParamsSchema(router, method, path);
      expect(() => params.validate({ id: 'foo/_cluster/settings' })).toThrow();
    });
  });
});
