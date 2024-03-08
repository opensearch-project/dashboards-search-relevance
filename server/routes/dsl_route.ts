/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { RequestParams } from '@opensearch-project/opensearch';
import { schema } from '@osd/config-schema';

import { ILegacyScopedClusterClient, IRouter, OpenSearchServiceSetup } from '../../../../src/core/server';
import { SEARCH_API, ServiceEndpoints } from '../../common';
import { METRIC_ACTION, METRIC_NAME } from '../metrics';

interface SearchResultsResponse {
  result1?: Object;
  result2?: Object;
  errorMessage1?: Object;
  errorMessage2?: Object;
}

const performance = require('perf_hooks').performance;

export function registerDslRoute(router: IRouter,  openSearchServiceSetup: OpenSearchServiceSetup, dataSourceEnabled: boolean) {
  router.post(
    {
      path: ServiceEndpoints.GetSearchResults,
      validate: { body: schema.any() },
    },
    async (context, request, response) => {
      const { query1, dataSourceId1, query2, dataSourceId2 } = request.body;
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
          let resp;
          if(dataSourceEnabled && dataSourceId1){
            const client = context.dataSource.opensearch.legacy.getClient(dataSourceId1);
            resp = await client.callAPI('search', params);
          }
          else{
              resp = await context.core.opensearch.legacy.client.callAsCurrentUser(
                'search',
                params
              );
          }
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
          let resp;
          if(dataSourceEnabled && dataSourceId2){
            const client = context.dataSource.opensearch.legacy.getClient(dataSourceId2);
            resp = await client.callAPI('search', params);
          }
          else{
              resp = await context.core.opensearch.legacy.client.callAsCurrentUser(
                'search',
                params
              );
          }
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

  // Get Indices
  router.get(
    {
      path: `${ServiceEndpoints.GetIndexes}/{dataSourceId?}`,
      validate: {
        params: schema.object({
          dataSourceId: schema.maybe(schema.string({ defaultValue: '' }))
        }),
      },
    },
    async (context, request, response) => {
      const params = {
        format: 'json',
      };
      const start = performance.now();
      try {
        const dataSourceId  = request.params.dataSourceId;
        let callApi: ILegacyScopedClusterClient['callAsCurrentUser'];
        if(dataSourceEnabled && dataSourceId){
          callApi = context.dataSource.opensearch.legacy.getClient(dataSourceId).callAPI;
        } else {
          callApi = context.core.opensearch.legacy.client.callAsCurrentUser;
        }
        const resp = await callApi('cat.indices', params);
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

  // Get Pipelines
  router.get(
    {
      path: `${ServiceEndpoints.GetPipelines}/{dataSourceId?}`,
      validate: {
        params: schema.object({
          dataSourceId: schema.maybe(schema.string({ defaultValue: '' }))
        }),
      },
    },
    async (context, request, response) => {
      const start = performance.now();
      let resBody: any = {};
      let resp;
      try {
        const dataSourceId  = request.params.dataSourceId;
        if(dataSourceEnabled && dataSourceId){
          let client = await context.dataSource.opensearch.legacy.getClient(dataSourceId);
          
          resp = await client.callAPI('search.pipeline');
        }
        else{
          resp = await context.core.opensearch.client.asCurrentUser.transport.request({
            method: 'GET',
            path: `${SEARCH_API}/pipeline`,
          });
        }
        console.log(resp)
        resBody = resp.body;
        const end = performance.now();
        context.searchRelevance.metricsService.addMetric(
          METRIC_NAME.SEARCH_RELEVANCE,
          METRIC_ACTION.FETCH_PIPELINE,
          200,
          end - start
        );
        return response.ok({
          body: resBody,
        });
      } catch (error) {
        const end = performance.now();
        context.searchRelevance.metricsService.addMetric(
          METRIC_NAME.SEARCH_RELEVANCE,
          METRIC_ACTION.FETCH_PIPELINE,
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
