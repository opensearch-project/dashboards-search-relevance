/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { RequestParams } from '@opensearch-project/opensearch';
import { schema } from '@osd/config-schema';

import { ILegacyScopedClusterClient, IRouter } from '../../../../src/core/server';
import { ServiceEndpoints, SEARCH_API } from '../../common';
import { METRIC_ACTION, METRIC_NAME } from '../metrics';

interface SearchResultResponse {
  result: any;
  errorMsg: any;
}

// eslint-disable-next-line @typescript-eslint/no-var-requires
const performance = require('perf_hooks').performance;

export function registerDslRoute(router: IRouter, dataSourceEnabled: boolean) {
  router.post(
    {
      path: ServiceEndpoints.GetSearchResults,
      validate: { body: schema.any() },
    },
    async (context, request, response) => {
      const { query, dataSourceId = '' } = request.body;
      const { index, pipeline = '', size = 10, ...rest } = query ?? {};

      const invalidCharactersPattern = /[\s,\"*+\/\\|?#><]/;
      if (
        !index ||
        index !== index.toLowerCase() ||
        index.startsWith('_') ||
        index.startsWith('-') ||
        invalidCharactersPattern.test(index)
      ) {
        return response.ok({
          body: {
            errorMessage: {
              statusCode: 400,
              body: 'Invalid Index or missing',
            },
          },
        });
      }

      if (
        pipeline &&
        pipeline !== '*' &&
        pipeline !== '_none' &&
        pipeline !== '' &&
        !/^[a-zA-Z0-9_\-*]+(,[a-zA-Z0-9_\-*]+)*$/.test(pipeline)
      ) {
        return response.ok({
          body: {
            errorMessage: {
              statusCode: 400,
              body: 'Invalid Pipeline',
            },
          },
        });
      }

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
            result: resp,
          },
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

        const errorMessage = `Error: ${error.body?.error?.type || 'Unknown'} - ${
          error.body?.error?.reason || 'Unknown reason'
        }`;

        return response.ok({
          body: {
            errorMessage: {
              statusCode: error.statusCode || 500,
              body: errorMessage,
            },
          },
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
          dataSourceId: schema.maybe(schema.string({ defaultValue: '' })),
        }),
      },
    },
    async (context, request, response) => {
      const params = {
        format: 'json',
      };
      const start = performance.now();
      try {
        const dataSourceId = request.params.dataSourceId;
        let callApi: ILegacyScopedClusterClient['callAsCurrentUser'];
        if (dataSourceEnabled && dataSourceId) {
          callApi = context.dataSource.opensearch.legacy.getClient(dataSourceId).callAPI;
        } else {
          callApi = context.core.opensearch.legacy.client.callAsCurrentUser;
        }
        let resp = await callApi('cat.indices', params);
        const remoteConnections = await callApi('transport.request', {
          method: 'GET',
          path: '/_remote/info',
        });
        if (Object.keys(remoteConnections).length > 0) {
          // fetch remote indices if remote clusters exist
          const remoteClusters = Object.keys(remoteConnections)
            .map((key) => `${key}:*`)
            .join(',');
          const resolveResponse = await callApi('transport.request', {
            method: 'GET',
            path: `/_resolve/index/${remoteClusters}`,
          });
          let remoteIndices = resolveResponse.indices.map((item: { name: string }) => ({
            index: item.name,
            format: 'json',
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

  // Get Indices by pattern
  router.get(
    {
      path: `${ServiceEndpoints.GetIndexesByPattern}/{pattern}/{dataSourceId?}`,
      validate: {
        params: schema.object({
          pattern: schema.string(),
          dataSourceId: schema.maybe(schema.string({ defaultValue: '' })),
        }),
      },
    },
    async (context, request, response) => {
      const start = performance.now();
      try {
        const dataSourceId = request.params.dataSourceId;
        let callApi: ILegacyScopedClusterClient['callAsCurrentUser'];
        if (dataSourceEnabled && dataSourceId) {
          callApi = context.dataSource.opensearch.legacy.getClient(dataSourceId).callAPI;
        } else {
          callApi = context.core.opensearch.legacy.client.callAsCurrentUser;
        }
        const resp = await callApi('cat.indices', {
          index: request.params.pattern,
          format: 'json',
        });
        const end = performance.now();
        context.searchRelevance.metricsService.addMetric(
          METRIC_NAME.SEARCH_RELEVANCE,
          METRIC_ACTION.FETCH_INDEX,
          200,
          end - start
        );
        return response.ok({ body: resp });
      } catch (error) {
        const end = performance.now();
        context.searchRelevance.metricsService.addMetric(
          METRIC_NAME.SEARCH_RELEVANCE,
          METRIC_ACTION.FETCH_INDEX,
          error.statusCode,
          end - start
        );
        if (error.statusCode === 404) {
          return response.ok({ body: [] });
        }
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
          dataSourceId: schema.maybe(schema.string({ defaultValue: '' })),
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
        const dataSourceId = request.params.dataSourceId;
        if (dataSourceEnabled && dataSourceId) {
          resp = (await context.dataSource.opensearch.getClient(dataSourceId)).transport;
          resp = await resp.request({
            method: 'GET',
            path: `${SEARCH_API}/pipeline`,
          });
        } else {
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
          statusCode: error.statusCode || 400,
          body: error,
        });
      }
    }
  );

  router.post(
    {
      path: ServiceEndpoints.GetSingleSearchResults,
      validate: { body: schema.any() },
    },
    async (context, request, response) => {
      const { query, dataSourceId } = request.body;
      const resBody: SearchResultResponse = {};

      const { index, size, search_pipeline, ...rest } = query;

      const params: RequestParams.Search = {
        index,
        size,
        body: rest,
      };

      if (typeof search_pipeline === 'string' && search_pipeline.trim() !== '') {
        params.search_pipeline = search_pipeline;
      }

      try {
        // Execute search
        let resp;
        if (dataSourceEnabled && dataSourceId) {
          const client = context.dataSource.opensearch.legacy.getClient(dataSourceId);
          resp = await client.callAPI('search', params);
        } else {
          resp = await context.core.opensearch.legacy.client.callAsCurrentUser('search', params);
        }

        resBody.result = resp;
      } catch (error) {
        if (error.statusCode !== 404) console.error(error);

        const errorMessage = `Error: ${error.body?.error?.type} - ${error.body?.error?.reason}`;
        resBody.errorMsg = {
          statusCode: error.statusCode || 500,
          body: errorMessage,
        };
      }

      return response.ok({
        body: resBody,
      });
    }
  );

  router.get(
    {
      path: `${ServiceEndpoints.GetClusterSettings}/{dataSourceId?}`,
      validate: {
        params: schema.object({
          dataSourceId: schema.maybe(schema.string({ defaultValue: '' })),
        }),
      },
    },
    async (context, request, response) => {
      const params = {
        include_defaults: true,
      };
      const start = performance.now();
      try {
        let callApi: ILegacyScopedClusterClient['callAsCurrentUser'];
        if (dataSourceEnabled && request.params.dataSourceId) {
          callApi = context.dataSource.opensearch.legacy.getClient(request.params.dataSourceId)
            .callAPI;
        } else {
          callApi = context.core.opensearch.legacy.client.callAsCurrentUser;
        }
        const resp = await callApi('cluster.getSettings', params);
        const end = performance.now();
        context.searchRelevance.metricsService.addMetric(
          METRIC_NAME.SEARCH_RELEVANCE,
          METRIC_ACTION.FETCH_CLUSTER_SETTINGS,
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
          METRIC_ACTION.FETCH_CLUSTER_SETTINGS,
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
}
