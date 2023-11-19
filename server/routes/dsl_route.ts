/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { schema } from '@osd/config-schema';
import { RequestParams } from '@opensearch-project/opensearch';

import { IRouter } from '../../../../src/core/server';
import { METRIC_NAME, METRIC_ACTION } from '../metrics';
import { ServiceEndpoints } from '../../common';

interface SearchResultsResponse {
  result1?: Object;
  result2?: Object;
  errorMessage1?: Object;
  errorMessage2?: Object;
}

const performance = require('perf_hooks').performance;

export function registerDslRoute(router: IRouter) {
  router.post(
    {
      path: ServiceEndpoints.GetSearchResults,
      validate: { body: schema.any() },
    },
    async (context, request, response) => {
      const { query1, query2 } = request.body;
      const actionName =
        query1 && query2 ? METRIC_ACTION.COMPARISON_SEARCH : METRIC_ACTION.SINGLE_SEARCH;
      const resBody: SearchResultsResponse = {};

      if (query1) {
        const { index, pipeline, size, ...rest } = query1;
        const params: RequestParams.Search =
          pipeline !== ''
            ? {
                index,
                size,
                body: rest,
                search_pipeline: pipeline,
              }
            : {
                index,
                size,
                body: rest,
              };

        const start = performance.now();
        try {
          const resp = await context.core.opensearch.legacy.client.callAsCurrentUser(
            'search',
            params
          );
          const end = performance.now();
          context.searchRelevance.metricsService.addMetric(
            METRIC_NAME.SEARCH_RELEVANCE,
            actionName,
            200,
            end - start
          );
          resBody.result1 = resp;
        } catch (error) {
          const end = performance.now();
          context.searchRelevance.metricsService.addMetric(
            METRIC_NAME.SEARCH_RELEVANCE,
            actionName,
            error.statusCode,
            end - start
          );

          if (error.statusCode !== 404) console.error(error);

          // Template: Error: {{Error.type}} – {{Error.reason}}
          const errorMessage = `Error: ${error.body?.error?.type} - ${error.body?.error?.reason}`;

          resBody.errorMessage1 = {
            statusCode: error.statusCode || 500,
            body: errorMessage,
          };
        }
      }

      if (query2) {
        const { index, pipeline, size, ...rest } = query2;
        const params: RequestParams.Search =
          pipeline !== ''
            ? {
                index,
                size,
                body: rest,
                search_pipeline: pipeline,
              }
            : {
                index,
                size,
                body: rest,
              };

        const start = performance.now();
        try {
          const resp = await context.core.opensearch.legacy.client.callAsCurrentUser(
            'search',
            params
          );
          const end = performance.now();
          context.searchRelevance.metricsService.addMetric(
            METRIC_NAME.SEARCH_RELEVANCE,
            actionName,
            200,
            end - start
          );
          resBody.result2 = resp;
        } catch (error) {
          const end = performance.now();
          if (error.statusCode !== 404) console.error(error);
          context.searchRelevance.metricsService.addMetric(
            METRIC_NAME.SEARCH_RELEVANCE,
            actionName,
            error.statusCode,
            end - start
          );

          // Template: Error: {{Error.type}} – {{Error.reason}}
          const errorMessage = `Error: ${error.body?.error?.type} - ${error.body?.error?.reason}`;

          resBody.errorMessage2 = {
            statusCode: error.statusCode || 500,
            body: errorMessage,
          };
        }
      }

      return response.ok({
        body: resBody,
      });
    }
  );

  router.get(
    {
      path: ServiceEndpoints.GetIndexes,
      validate: {},
    },
    async (context, request, response) => {
      const params = {
        format: 'json',
      };
      const start = performance.now();
      try {
        const resp = await context.core.opensearch.legacy.client.callAsCurrentUser(
          'cat.indices',
          params
        );
        const end = performance.now();
        context.searchRelevance.metricsService.addMetric(
          METRIC_NAME.SEARCH_RELEVANCE,
          METRIC_ACTION.FETCH_INDEX,
          200,
          end - start
        );
        return response.ok({
          body: resp,
        });
      } catch (error) {
        const end = performance.now();
        context.searchRelevance.metricsService.addMetric(
          METRIC_NAME.SEARCH_RELEVANCE,
          METRIC_ACTION.FETCH_INDEX,
          error.statusCode,
          end - start
        );
        if (error.statusCode !== 404) console.error(error);
        return response.custom({
          statusCode: error.statusCode || 500,
          body: error.message,
        });
      }
    }
  );
}
