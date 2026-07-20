/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { schema } from '@osd/config-schema';
import {
  ILegacyScopedClusterClient,
  IOpenSearchDashboardsResponse,
  IRouter,
  OpenSearchDashboardsRequest,
  OpenSearchDashboardsResponseFactory,
  RequestHandlerContext,
} from '../../../../src/core/server';
import { ServiceEndpoints, BackendEndpoints, DISABLED_BACKEND_PLUGIN_MESSAGE } from '../../common';

const queryWithDataSource = schema.maybe(schema.object({}, { unknowns: 'allow' }));

export function registerSearchRelevanceRoutes(router: IRouter, dataSourceEnabled: boolean): void {
  router.post(
    {
      path: ServiceEndpoints.QuerySets,
      validate: {
        body: schema.object({
          name: schema.string(),
          description: schema.string(),
          sampling: schema.string(),
          querySetSize: schema.number(),
          ubiQueriesIndex: schema.maybe(schema.string()),
        }),
        query: queryWithDataSource,
      },
    },
    backendAction('POST', BackendEndpoints.QuerySets, dataSourceEnabled)
  );
  router.put(
    {
      path: ServiceEndpoints.QuerySets,
      validate: {
        body: schema.object({
          name: schema.string(),
          description: schema.string(),
          sampling: schema.string(),
          querySetQueries: schema.oneOf([
            schema.arrayOf(
              schema.object({
                queryText: schema.string(),
                referenceAnswer: schema.maybe(schema.string()),
              }),
              { minSize: 1 }
            ),
            schema.string(),
          ]),
        }),
        query: queryWithDataSource,
      },
    },
    backendAction('PUT', BackendEndpoints.QuerySets, dataSourceEnabled)
  );
  router.get(
    {
      path: ServiceEndpoints.QuerySets,
      validate: {
        query: queryWithDataSource,
      },
    },
    backendAction('GET', BackendEndpoints.QuerySets, dataSourceEnabled)
  );
  router.delete(
    {
      path: `${ServiceEndpoints.QuerySets}/{id}`,
      validate: {
        params: schema.object({
          id: schema.string(),
        }),
        query: queryWithDataSource,
      },
    },
    backendAction('DELETE', BackendEndpoints.QuerySets, dataSourceEnabled)
  );
  router.put(
    {
      path: ServiceEndpoints.SearchConfigurations,
      validate: {
        body: schema.object({
          name: schema.string(),
          index: schema.string(),
          query: schema.string(),
          searchPipeline: schema.maybe(schema.string()),
        }),
        query: queryWithDataSource,
      },
    },
    backendAction('PUT', BackendEndpoints.SearchConfigurations, dataSourceEnabled)
  );
  router.get(
    {
      path: ServiceEndpoints.SearchConfigurations,
      validate: {
        query: queryWithDataSource,
      },
    },
    backendAction('GET', BackendEndpoints.SearchConfigurations, dataSourceEnabled)
  );
  router.delete(
    {
      path: `${ServiceEndpoints.SearchConfigurations}/{id}`,
      validate: {
        params: schema.object({
          id: schema.string(),
        }),
        query: queryWithDataSource,
      },
    },
    backendAction('DELETE', BackendEndpoints.SearchConfigurations, dataSourceEnabled)
  );
  router.post(
    {
      path: ServiceEndpoints.Experiments,
      validate: {
        body: schema.object({
          querySetId: schema.string(),
          searchConfigurationList: schema.arrayOf(schema.string()),
          size: schema.number(),
          type: schema.string(),
          // TODO: make mandatory conditional on experiment type
          judgmentList: schema.maybe(schema.arrayOf(schema.string())),
        }),
        query: queryWithDataSource,
      },
    },
    backendAction('PUT', BackendEndpoints.Experiments, dataSourceEnabled)
  );
  router.get(
    {
      path: ServiceEndpoints.Experiments,
      validate: {
        query: queryWithDataSource,
      },
    },
    backendAction('GET', BackendEndpoints.Experiments, dataSourceEnabled)
  );
  router.get(
    {
      path: `${ServiceEndpoints.Experiments}/{id}`,
      validate: {
        params: schema.object({
          id: schema.string(),
        }),
        query: queryWithDataSource,
      },
    },
    backendAction('GET', BackendEndpoints.Experiments, dataSourceEnabled)
  );
  router.get(
    {
      path: `${ServiceEndpoints.SearchConfigurations}/{id}`,
      validate: {
        params: schema.object({
          id: schema.string(),
        }),
        query: queryWithDataSource,
      },
    },
    backendAction('GET', BackendEndpoints.SearchConfigurations, dataSourceEnabled)
  );
  router.get(
    {
      path: `${ServiceEndpoints.QuerySets}/{id}`,
      validate: {
        params: schema.object({
          id: schema.string(),
        }),
        query: queryWithDataSource,
      },
    },
    backendAction('GET', BackendEndpoints.QuerySets, dataSourceEnabled)
  );
  router.delete(
    {
      path: `${ServiceEndpoints.Experiments}/{id}`,
      validate: {
        params: schema.object({
          id: schema.string(),
        }),
        query: queryWithDataSource,
      },
    },
    backendAction('DELETE', BackendEndpoints.Experiments, dataSourceEnabled)
  );
  router.post(
    {
      path: `${ServiceEndpoints.ScheduledExperiments}`,
      validate: {
        body: schema.object({
          experimentId: schema.string(),
          cronExpression: schema.string({ minLength: 9 })
        }),
        query: queryWithDataSource,
      }
    },
    backendAction('POST', `${BackendEndpoints.ScheduledExperiments}`, dataSourceEnabled)
  );
  router.get(
    {
      path: `${ServiceEndpoints.ScheduledExperiments}`,
      validate: {
        query: queryWithDataSource,
      },
    },
    backendAction('GET', `${BackendEndpoints.ScheduledExperiments}`, dataSourceEnabled)
  );
  router.get(
    {
      path: `${ServiceEndpoints.ScheduledExperiments}/{id}`,
      validate: {
        params: schema.object({
          id: schema.string(),
        }),
        query: queryWithDataSource,
      },
    },
    backendAction('GET', BackendEndpoints.ScheduledExperiments, dataSourceEnabled)
  );
  router.delete(
    {
      path: `${ServiceEndpoints.ScheduledExperiments}/{id}`,
      validate: {
        params: schema.object({
          id: schema.string(),
        }),
        query: queryWithDataSource,
      },
    },
    backendAction('DELETE', BackendEndpoints.ScheduledExperiments, dataSourceEnabled)
  );
  router.put(
    {
      path: ServiceEndpoints.Judgments,
      validate: {
        body: schema.object({
          name: schema.string(),
          type: schema.string(),
          querySetId: schema.maybe(schema.string()),
          searchConfigurationList: schema.maybe(schema.arrayOf(schema.string())),
          size: schema.maybe(schema.number()),
          modelId: schema.maybe(schema.string()),
          tokenLimit: schema.maybe(schema.string()),
          ignoreFailure: schema.maybe(schema.boolean()),
          contextFields: schema.maybe(schema.arrayOf(schema.string())),
          promptTemplate: schema.maybe(schema.string()),
          clickModel: schema.maybe(schema.string()),
          maxRank: schema.maybe(schema.number()),
          startDate: schema.maybe(schema.string()),
          endDate: schema.maybe(schema.string()),
          judgmentRatings: schema.maybe(
            schema.arrayOf(
              schema.object({
                query: schema.string(),
                ratings: schema.arrayOf(
                  schema.object({
                    docId: schema.string(),
                    rating: schema.oneOf([schema.string(), schema.number()]),
                  })
                ),
              })
            )
          ),
          ubiEventsIndex: schema.maybe(schema.string()),
        }),
        query: queryWithDataSource,
      },
    },
    backendAction('PUT', BackendEndpoints.Judgments, dataSourceEnabled)
  );
  router.get(
    {
      path: ServiceEndpoints.Judgments,
      validate: {
        query: queryWithDataSource,
      },
    },
    backendAction('GET', BackendEndpoints.Judgments, dataSourceEnabled, { passQueryParams: ['status'] })
  );
  router.get(
    {
      path: `${ServiceEndpoints.Judgments}/{id}`,
      validate: {
        params: schema.object({
          id: schema.string(),
        }),
        query: queryWithDataSource,
      },
    },
    backendAction('GET', BackendEndpoints.Judgments, dataSourceEnabled)
  );
  router.delete(
    {
      path: `${ServiceEndpoints.Judgments}/{id}`,
      validate: {
        params: schema.object({
          id: schema.string(),
        }),
        query: queryWithDataSource,
      },
    },
    backendAction('DELETE', BackendEndpoints.Judgments, dataSourceEnabled)
  );

  // AB Test routes
  router.get(
    {
      path: ServiceEndpoints.AbTests,
      validate: {
        query: queryWithDataSource,
      },
    },
    backendAction('GET', BackendEndpoints.AbTests, dataSourceEnabled)
  );
  router.put(
    {
      path: `${ServiceEndpoints.AbTests}/{id}`,
      validate: {
        params: schema.object({
          id: schema.string(),
        }),
        body: schema.object({
          name: schema.string(),
          search_configuration_a: schema.string(),
          search_configuration_b: schema.string(),
          size: schema.maybe(schema.number()),
        }),
        query: queryWithDataSource,
      },
    },
    backendAction('PUT', BackendEndpoints.AbTests, dataSourceEnabled)
  );
  router.put(
    {
      path: `${ServiceEndpoints.AbTests}/{id}/_update`,
      validate: {
        params: schema.object({
          id: schema.string(),
        }),
        body: schema.object({
          enabled: schema.maybe(schema.boolean()),
          size: schema.maybe(schema.number()),
          search_configuration_a: schema.maybe(schema.string()),
          search_configuration_b: schema.maybe(schema.string()),
        }),
        query: queryWithDataSource,
      },
    },
    async (context, req, res) => {
      const { id } = req.params as { id: string };
      const dataSourceId = (req.query as any)?.dataSourceId;
      let callApi;
      if (dataSourceEnabled && dataSourceId) {
        callApi = context.dataSource.opensearch.legacy.getClient(dataSourceId).callAPI;
      } else {
        callApi = context.core.opensearch.legacy.client.callAsCurrentUser;
      }
      try {
        const response = await callApi('transport.request', {
          method: 'PUT',
          path: `${BackendEndpoints.AbTests}/${id}/_update`,
          body: req.body,
        });
        return res.ok({ body: response });
      } catch (err) {
        return res.customError({ statusCode: err.statusCode || 500, body: { message: err.message } });
      }
    }
  );
  router.delete(
    {
      path: `${ServiceEndpoints.AbTests}/{id}`,
      validate: {
        params: schema.object({
          id: schema.string(),
        }),
        query: queryWithDataSource,
      },
    },
    backendAction('DELETE', BackendEndpoints.AbTests, dataSourceEnabled)
  );
  router.put(
    {
      path: `${ServiceEndpoints.AbTests}/ubi_index`,
      validate: {
        body: schema.object({
          index: schema.string(),
          mapping: schema.maybe(schema.any()),
        }),
        query: queryWithDataSource,
      },
    },
    async (context, req, res) => {
      const callApi = context.core.opensearch.legacy.client.callAsCurrentUser;
      try {
        const customMapping = req.body.mapping || {
          mappings: {
            properties: {
              action_name: { type: 'keyword' },
              timestamp: { type: 'date' },
              event_attributes: {
                properties: {
                  object: {
                    properties: {
                      id: { type: 'keyword' },
                      search_configuration_uuid: { type: 'keyword' },
                    },
                  },
                  position: {
                    properties: {
                      ordinal: { type: 'integer' },
                    },
                  },
                  ab_test_id: { type: 'keyword' },
                },
              },
            },
          },
        };
        const response = await callApi('transport.request', {
          method: 'PUT',
          path: `/${req.body.index}`,
          body: customMapping,
        });
        return res.ok({ body: response });
      } catch (err) {
        return res.customError({ statusCode: err.statusCode || 500, body: { message: err.message } });
      }
    }
  );
  router.post(
    {
      path: `${ServiceEndpoints.AbTests}/results`,
      validate: {
        body: schema.object({
          index: schema.string(),
          test_id: schema.string(),
        }),
        query: queryWithDataSource,
      },
    },
    async (context, req, res) => {
      const callApi = context.core.opensearch.legacy.client.callAsCurrentUser;
      try {
        const response = await callApi('transport.request', {
          method: 'POST',
          path: `/${req.body.index}/_search`,
          body: {
            size: 0,
            query: { term: { 'event_attributes.ab_test_id': req.body.test_id } },
            aggs: {
              clicks_per_config: {
                terms: { field: 'event_attributes.object.search_configuration_uuid' }
              }
            },
          },
        });
        return res.ok({ body: response });
      } catch (err) {
        return res.customError({ statusCode: err.statusCode || 500, body: { message: err.message } });
      }
    }
  );
  router.post(
    {
      path: `${ServiceEndpoints.AbTests}/register_click`,
      validate: {
        body: schema.object({
          test_id: schema.string(),
          search_configuration_uuid: schema.string(),
          doc_id: schema.string(),
          title: schema.maybe(schema.string()),
          position: schema.maybe(schema.number()),
          ubi_index: schema.maybe(schema.string()),
        }),
        query: queryWithDataSource,
      },
    },
    async (context, req, res) => {
      const callApi = context.core.opensearch.legacy.client.callAsCurrentUser;
      const targetIndex = req.body.ubi_index || 'ubi_events';
      try {
        // Auto-create index with correct mappings if it doesn't exist
        try {
          await callApi('transport.request', { method: 'HEAD', path: `/${targetIndex}` });
        } catch (e) {
          await callApi('transport.request', {
            method: 'PUT',
            path: `/${targetIndex}`,
            body: {
              mappings: {
                properties: {
                  action_name: { type: 'keyword' },
                  timestamp: { type: 'date' },
                  event_attributes: {
                    properties: {
                      object: { properties: { id: { type: 'keyword' }, search_configuration_uuid: { type: 'keyword' } } },
                      position: { properties: { ordinal: { type: 'integer' } } },
                      ab_test_id: { type: 'keyword' },
                    },
                  },
                },
              },
            },
          });
        }
        const response = await callApi('transport.request', {
          method: 'POST',
          path: `/${targetIndex}/_doc`,
          body: {
            timestamp: new Date().toISOString(),
            action_name: 'click',
            event_attributes: {
              object: {
                id: req.body.doc_id,
                search_configuration_uuid: req.body.search_configuration_uuid,
              },
              position: { ordinal: req.body.position || 0 },
              ab_test_id: req.body.test_id,
            },
          },
        });
        return res.ok({ body: response });
      } catch (err) {
        return res.customError({ statusCode: err.statusCode || 500, body: { message: err.message } });
      }
    }
  );
  router.post(
    {
      path: `${ServiceEndpoints.AbTests}/{id}/_search`,
      validate: {
        params: schema.object({
          id: schema.string(),
        }),
        body: schema.object({
          query_params: schema.recordOf(schema.string(), schema.string()),
        }),
        query: queryWithDataSource,
      },
    },
    async (context, req, res) => {
      const { id } = req.params as { id: string };
      const dataSourceId = (req.query as any)?.dataSourceId;
      let callApi;
      if (dataSourceEnabled && dataSourceId) {
        callApi = context.dataSource.opensearch.legacy.getClient(dataSourceId).callAPI;
      } else {
        callApi = context.core.opensearch.legacy.client.callAsCurrentUser;
      }
      try {
        const response = await callApi('transport.request', {
          method: 'POST',
          path: `${BackendEndpoints.AbTests}/${id}/_search`,
          body: req.body,
        });
        return res.ok({ body: response });
      } catch (err) {
        return res.customError({ statusCode: err.statusCode || 500, body: { message: err.message } });
      }
    }
  );

  router.post(
    {
      path: ServiceEndpoints.ValidatePrompt,
      validate: {
        body: schema.object({
          modelId: schema.string(),
          promptTemplate: schema.string(),
          placeholderValues: schema.recordOf(schema.string(), schema.string()),
        }),
        query: queryWithDataSource,
      },
    },
    async (context, req, res) => {
      const {
        modelId,
        promptTemplate,
        placeholderValues,
      } = req.body;

      const dataSourceId = (req.query as any)?.dataSourceId;
      let caller: ILegacyScopedClusterClient['callAsCurrentUser'];
      if (dataSourceEnabled && dataSourceId) {
        caller = context.dataSource.opensearch.legacy.getClient(dataSourceId).callAPI;
      } else {
        caller = context.core.opensearch.legacy.client.callAsCurrentUser;
      }

      try {
        // Step 1: Build the prompt by substituting placeholders
        let filledPrompt = promptTemplate;
        Object.keys(placeholderValues).forEach((key) => {
          const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
          filledPrompt = filledPrompt.replace(regex, placeholderValues[key]);
        });

        // Step 2: Make direct predict call to the model
        const predictBody = {
          parameters: {
            messages: [
              {
                role: 'user',
                content: filledPrompt,
              },
            ],
          },
        };

        const predictResponse = await caller('transport.request', {
          method: 'POST',
          path: `/_plugins/_ml/models/${modelId}/_predict`,
          body: predictBody,
        });

        // Step 3: Extract the response
        const inference_results = predictResponse?.inference_results?.[0];
        const output = inference_results?.output;

        let responseText = '';
        if (output) {
          if (Array.isArray(output)) {
            responseText = output.map(item => item.result || item.response || '').join('\n');
          } else if (typeof output === 'object') {
            responseText = output.response || output.result || JSON.stringify(output);
          } else {
            responseText = String(output);
          }
        }

        return res.ok({
          body: {
            success: true,
            rawResponse: responseText,
            fullResponse: predictResponse,
          },
        });
      } catch (err) {
        console.error('Failed to validate prompt:', err);

        return res.customError({
          statusCode: err.statusCode || 500,
          body: {
            message: err.message,
            attributes: {
              error: err.body?.error || err.message,
            },
          },
        });
      }
    }
  );
}

const backendAction = (
  method: string,
  path: string,
  dataSourceEnabled: boolean,
  options?: { passQueryParams?: string[] }
) => {
  return async (
    context: RequestHandlerContext,
    req: OpenSearchDashboardsRequest,
    res: OpenSearchDashboardsResponseFactory
  ): Promise<IOpenSearchDashboardsResponse<any>> => {
    const dataSourceId = (req.query as any)?.dataSourceId;
    let callApi: ILegacyScopedClusterClient['callAsCurrentUser'];
    if (dataSourceEnabled && dataSourceId) {
      callApi = context.dataSource.opensearch.legacy.getClient(dataSourceId).callAPI;
    } else {
      callApi = context.core.opensearch.legacy.client.callAsCurrentUser;
    }

    try {
      let response;
      if (method === 'DELETE') {
        const { id } = req.params;
        const deletePath = `${path}/${id}`;
        response = await callApi('transport.request', {
          method,
          path: deletePath,
        });
      } else if (method === 'GET' && req.params.id) {
        const getPath = `${path}/${req.params.id}`;
        response = await callApi('transport.request', {
          method,
          path: getPath,
        });
      } else if ((method === 'PUT' || method === 'POST') && req.params && (req.params as any).id) {
        const idPath = `${path}/${(req.params as any).id}`;
        response = await callApi('transport.request', {
          method,
          path: idPath,
          body: req.body,
        });
      } else {
        // Handle PUT, POST, GET as before
        // Build backend path with optional query params
        let backendPath = path;
        if (options?.passQueryParams && options.passQueryParams.length > 0) {
          const queryParams: string[] = [];
          options.passQueryParams.forEach((param) => {
            const value = (req.query as any)?.[param];
            if (value) {
              queryParams.push(`${param}=${value}`);
            }
          });
          if (queryParams.length > 0) {
            backendPath = `${path}?${queryParams.join('&')}`;
          }
        }
        response = await callApi('transport.request', {
          method,
          path: backendPath,
          ...(method === 'POST' || method === 'PUT' ? { body: req.body } : {}),
        });
      }

      return res.ok({ body: response });
    } catch (err) {

      console.error('Failed to call search-relevance APIs', err);

      let clientMessage = err.message;
      let clientAttributesError = err.body?.error || err.message;

      if (err.body && typeof err.body === 'string' && err.body.includes(DISABLED_BACKEND_PLUGIN_MESSAGE)) {
          clientMessage = DISABLED_BACKEND_PLUGIN_MESSAGE;
          clientAttributesError = DISABLED_BACKEND_PLUGIN_MESSAGE;
      }
      else if (err.body && typeof err.body === 'object') {
          if (err.body.message && typeof err.body.message === 'string' && err.body.message.includes(DISABLED_BACKEND_PLUGIN_MESSAGE)) {
              clientMessage = DISABLED_BACKEND_PLUGIN_MESSAGE;
              clientAttributesError = DISABLED_BACKEND_PLUGIN_MESSAGE;
          } else if (err.body.reason && typeof err.body.reason === 'string' && err.body.reason.includes(DISABLED_BACKEND_PLUGIN_MESSAGE)) {
              clientMessage = DISABLED_BACKEND_PLUGIN_MESSAGE;
              clientAttributesError = DISABLED_BACKEND_PLUGIN_MESSAGE;
          } else if (err.body.error && typeof err.body.error === 'object' && err.body.error.reason && typeof err.body.error.reason === 'string' && err.body.error.reason.includes(DISABLED_BACKEND_PLUGIN_MESSAGE)) {
              clientMessage = DISABLED_BACKEND_PLUGIN_MESSAGE;
              clientAttributesError = DISABLED_BACKEND_PLUGIN_MESSAGE;
          }
          else if (err.body.message && typeof err.body.message === 'string') {
              clientMessage = err.body.message;
              clientAttributesError = err.body.message;
          }
      }

      return res.customError({
        statusCode: err.statusCode || 500,
        body: {
          message: clientMessage,
          attributes: {
            error: clientAttributesError,
          },
        },
      });
    }
  };
};
