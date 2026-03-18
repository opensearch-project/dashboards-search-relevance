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
          clickModel: schema.maybe(schema.string()),
          maxRank: schema.maybe(schema.number()),
          startDate: schema.maybe(schema.string()),
          endDate: schema.maybe(schema.string()),
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
