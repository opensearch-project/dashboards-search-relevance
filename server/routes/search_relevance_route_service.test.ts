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
    delete: jest.fn(),
  }) as unknown as IRouter;

const getJudgmentCreateRouteSchema = (router: IRouter) => {
  const putCalls = (router.put as jest.Mock).mock.calls;
  const judgmentRoute = putCalls.find(([config]) => config.path === ServiceEndpoints.Judgments);

  if (!judgmentRoute) {
    throw new Error('Judgment create route was not registered');
  }

  return judgmentRoute[0].validate.body;
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
});
