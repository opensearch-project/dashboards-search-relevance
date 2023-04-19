/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { schema } from '@osd/config-schema';

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

// generate path based on index, search pipeline, and size
function generatePath(index: string, searchPipeline: string, size: number) {
  let path = `/${index}/_search?`;
  if (searchPipeline) {
    path += `&search_pipeline=${searchPipeline}`;
  }
  if (size) {
    path += `&size=${size}`;
  }
  return path;
}

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
      let resBody: SearchResultsResponse = {};

      const client = context.core.opensearch.client.asCurrentUser;

      if (query1) {
        const { index, size, searchPipeline, ...rest } = query1;

        const start = performance.now();
        try {
          const opensearchResponse1 = await client.transport.request({
            path: generatePath(index, searchPipeline, size),
            method: 'POST',
            querystring: rest,
          });
          const end = performance.now();
          context.searchRelevance.metricsService.addMetric(
            METRIC_NAME.SEARCH_RELEVANCE,
            actionName,
            200,
            end - start
          );
          resBody.result1 = opensearchResponse1.body;
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
        const { index, size, searchPipeline, ...rest } = query2;

        const start = performance.now();
        try {
          const opensearchResponse2 = await client.transport.request({
            path: generatePath(index, searchPipeline, size),
            method: 'POST',
            querystring: rest,
          });
          const end = performance.now();
          context.searchRelevance.metricsService.addMetric(
            METRIC_NAME.SEARCH_RELEVANCE,
            actionName,
            200,
            end - start
          );
          resBody.result2 = opensearchResponse2.body;
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

  // Fetch search pipelines
  router.get(
    {
      path: ServiceEndpoints.GetSearchPipelines,
      validate: {},
    },
    async (context, request, response) => {
      const params = {
        format: 'json',
      };
      try {

        const client = context.core.opensearch.client.asCurrentUser;

        const opensearchResponse = await client.transport.request(
          { path: '_search/pipeline', method:'GET'},
        );
    
        const { statusCode, body: responseContent, warnings } = opensearchResponse;
    
        return response.custom({
          statusCode: statusCode!,
          body: Object.keys(responseContent),
          headers: {
            warning: warnings || '',
          },
        });
      } catch (error) {
        if (error.statusCode !== 404) console.error(error);
        return response.custom({
          statusCode: error.statusCode || 500,
          body: error.message,
        });
      }
    }
  );
}
