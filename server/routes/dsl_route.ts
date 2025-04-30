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
      const { query, dataSourceId = '' } = request.body;
      const { index, pipeline = '', size = 10, ...rest } = query;

      const invalidCharactersPattern = /[\s,\"*+\/\\|?#><]/;
      if (!index || index !== index.toLowerCase() || index.startsWith('_') || index.startsWith('-') || invalidCharactersPattern.test(index)) {
        return response.ok({
          body: {
            errorMessage: {
              statusCode: 400,
              body: 'Invalid Index or missing',
            }
          }
        });
      }

      if (pipeline && pipeline !== '*' && pipeline !== '_none' && pipeline !== '' && 
          !(/^[a-zA-Z0-9_\-*]+(,[a-zA-Z0-9_\-*]+)*$/.test(pipeline))) {
        return response.ok({
          body: {
            errorMessage: {
              statusCode: 400,
              body: 'Invalid Pipeline',
            }
          }
        });
      }

      // Build search parameters
      const params: RequestParams.Search = pipeline !== ''
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

      // Execute search
      const start = performance.now();
      try {
        // Select appropriate client based on data source
        let resp;
        if (dataSourceEnabled && dataSourceId) {
          const client = context.dataSource.opensearch.legacy.getClient(dataSourceId);
          resp = await client.callAPI('search', params);
        } else {
          resp = await context.core.opensearch.legacy.client.callAsCurrentUser('search', params);
        }

        const end = performance.now();
        context.searchRelevance.metricsService.addMetric(
          METRIC_NAME.SEARCH_RELEVANCE,
          METRIC_ACTION.SINGLE_SEARCH,
          200,
          end - start
        );

        return response.ok({
          body: {
            result: resp
          }
        });
      } catch (error) {
        const end = performance.now();
        context.searchRelevance.metricsService.addMetric(
          METRIC_NAME.SEARCH_RELEVANCE,
          METRIC_ACTION.SINGLE_SEARCH,
          error.statusCode || 500,
          end - start
        );

        if (error.statusCode !== 404) console.error(error);

        // Format error message consistently
        const errorMessage = `Error: ${error.body?.error?.type || 'Unknown'} - ${error.body?.error?.reason || 'Unknown reason'}`;

        return response.ok({
          body: {
            errorMessage: {
              statusCode: error.statusCode || 400,
              body: errorMessage,
            }
          }
        });
      }
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
        let resp = await callApi('cat.indices', params);
        const remoteConnections = await callApi('transport.request',{
          method: 'GET',
          path: "/_remote/info",
        });
        if (Object.keys(remoteConnections).length > 0) { // fetch remote indices if remote clusters exist
          const remoteClusters = Object.keys(remoteConnections)
            .map((key) => `${key}:*`)
            .join(',');
          const resolveResponse = await callApi('transport.request',{
            method: 'GET',
            path: `/_resolve/index/${remoteClusters}`,
          });
          let remoteIndices = resolveResponse.indices.map((item: { name: string }) => ({
            index: item.name,
            format: 'json'
          }));
          resp = resp.concat(remoteIndices);
        }
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
          statusCode: error.statusCode || 400,
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
      const params = {
        format: 'json',
      };
      const start = performance.now();
      let resBody: any = {};
      let resp;
      try {
        const dataSourceId  = request.params.dataSourceId;
        if(dataSourceEnabled && dataSourceId){
          resp = (await context.dataSource.opensearch.getClient(dataSourceId)).transport
          resp = await resp.request({
            method: 'GET',
            path: `${SEARCH_API}/pipeline`,
          })
        }
        else{
          resp = await context.core.opensearch.client.asCurrentUser.transport.request({
            method: 'GET',
            path: `${SEARCH_API}/pipeline`,
          });
        }
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
        return response.customError({
          statusCode: 404,
          body: error,
        });
      }
    }
  );
}
