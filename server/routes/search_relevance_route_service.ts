/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { schema } from '@osd/config-schema';
import {
  IOpenSearchDashboardsResponse,
  IRouter,
  OpenSearchDashboardsRequest,
  OpenSearchDashboardsResponseFactory,
  RequestHandlerContext,
} from '../../../../src/core/server';
import { ServiceEndpoints, BackendEndpoints, DISABLED_BACKEND_PLUGIN_MESSAGE } from '../../common';

export function registerSearchRelevanceRoutes(router: IRouter): void {
  router.post(
    {
      path: ServiceEndpoints.QuerySets,
      validate: {
        body: schema.object({
          name: schema.string(),
          description: schema.string(),
          sampling: schema.string(),
          querySetSize: schema.number(),
        }),
      },
    },
    backendAction('POST', BackendEndpoints.QuerySets)
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
      },
    },
    backendAction('PUT', BackendEndpoints.QuerySets)
  );
  router.get(
    {
      path: ServiceEndpoints.QuerySets,
      validate: false,
    },
    backendAction('GET', BackendEndpoints.QuerySets)
  );
  router.delete(
    {
      path: `${ServiceEndpoints.QuerySets}/{id}`,
      validate: {
        params: schema.object({
          id: schema.string(),
        }),
      },
    },
    backendAction('DELETE', BackendEndpoints.QuerySets)
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
      },
    },
    backendAction('PUT', BackendEndpoints.SearchConfigurations)
  );
  router.get(
    {
      path: ServiceEndpoints.SearchConfigurations,
      validate: false,
    },
    backendAction('GET', BackendEndpoints.SearchConfigurations)
  );
  router.delete(
    {
      path: `${ServiceEndpoints.SearchConfigurations}/{id}`,
      validate: {
        params: schema.object({
          id: schema.string(),
        }),
      },
    },
    backendAction('DELETE', BackendEndpoints.SearchConfigurations)
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
      },
    },
    backendAction('PUT', BackendEndpoints.Experiments)
  );
  router.get(
    {
      path: ServiceEndpoints.Experiments,
      validate: false,
    },
    backendAction('GET', BackendEndpoints.Experiments)
  );
  router.get(
    {
      path: `${ServiceEndpoints.Experiments}/{id}`,
      validate: {
        params: schema.object({
          id: schema.string(),
        }),
      },
    },
    backendAction('GET', BackendEndpoints.Experiments)
  );
  router.get(
    {
      path: `${ServiceEndpoints.SearchConfigurations}/{id}`,
      validate: {
        params: schema.object({
          id: schema.string(),
        }),
      },
    },
    backendAction('GET', BackendEndpoints.SearchConfigurations)
  );
  router.get(
    {
      path: `${ServiceEndpoints.QuerySets}/{id}`,
      validate: {
        params: schema.object({
          id: schema.string(),
        }),
      },
    },
    backendAction('GET', BackendEndpoints.QuerySets)
  );
  router.delete(
    {
      path: `${ServiceEndpoints.Experiments}/{id}`,
      validate: {
        params: schema.object({
          id: schema.string(),
        }),
      },
    },
    backendAction('DELETE', BackendEndpoints.Experiments)
  );
  router.post(
    {
      path: `${ServiceEndpoints.ScheduledExperiments}`,
      validate: {
        body: schema.object({
          experimentId: schema.string(),
          cronExpression: schema.string()
        }),
      }
    },
    backendAction('POST', `${BackendEndpoints.ScheduledExperiments}`)
  );
  router.get(
    {
      path: `${ServiceEndpoints.ScheduledExperiments}`,
      validate: false,
    },
    backendAction('GET', `${BackendEndpoints.ScheduledExperiments}`)
  );
  router.get(
    {
      path: `${ServiceEndpoints.ScheduledExperiments}/{id}`,
      validate: {
        params: schema.object({
          id: schema.string(),
        }),
      },
    },
    backendAction('GET', BackendEndpoints.ScheduledExperiments)
  );
  router.delete(
    {
      path: `${ServiceEndpoints.ScheduledExperiments}/{id}`,
      validate: {
        params: schema.object({
          id: schema.string(),
        }),
      },
    },
    backendAction('DELETE', BackendEndpoints.ScheduledExperiments)
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
          endDate: schema.maybe(schema.string())
        }),
      },
    },
    backendAction('PUT', BackendEndpoints.Judgments)
  );
  router.get(
    {
      path: ServiceEndpoints.Judgments,
      validate: false,
    },
    backendAction('GET', BackendEndpoints.Judgments)
  );
  router.get(
    {
      path: `${ServiceEndpoints.Judgments}/{id}`,
      validate: {
        params: schema.object({
          id: schema.string(),
        }),
      },
    },
    backendAction('GET', BackendEndpoints.Judgments)
  );
  router.delete(
    {
      path: `${ServiceEndpoints.Judgments}/{id}`,
      validate: {
        params: schema.object({
          id: schema.string(),
        }),
      },
    },
    backendAction('DELETE', BackendEndpoints.Judgments)
  );
}

const backendAction = (method, path) => {
  return async (
    context: RequestHandlerContext,
    req: OpenSearchDashboardsRequest,
    res: OpenSearchDashboardsResponseFactory
  ): Promise<IOpenSearchDashboardsResponse<any>> => {
    const dataSourceId = req.query.data_source;
    const caller = dataSourceId
      ? context.dataSource.opensearch.legacy.getClient(dataSourceId).callAPI
      : context.core.opensearch.legacy.client.callAsCurrentUser;

    try {
      let response;
      if (method === 'DELETE') {
        const { id } = req.params;
        const deletePath = `${path}/${id}`;
        response = await caller('transport.request', {
          method,
          path: deletePath,
        });
      } else if (method === 'GET' && req.params.id) {
        // Handle GET request for individual experiment
        const getPath = `${path}/${req.params.id}`;
        response = await caller('transport.request', {
          method,
          path: getPath,
        });
      } else {
        // Handle PUT, POST, GET as before
        response = await caller('transport.request', {
          method,
          path,
          ...(method === 'POST' || method === 'PUT' ? { body: req.body } : {}),
        });
      }

      return res.ok({ body: response });
    } catch (err) {

      console.error('Failed to call search-relevance APIs', err); // Keep for full server-side logging

      let clientMessage = err.message; // Default to the err.message from transport.request
      let clientAttributesError = err.body?.error || err.message; // Default attributes error

      // Check if the backend error body contains the specific message
      if (err.body && typeof err.body === 'string' && err.body.includes(DISABLED_BACKEND_PLUGIN_MESSAGE)) {
          clientMessage = DISABLED_BACKEND_PLUGIN_MESSAGE;
          clientAttributesError = DISABLED_BACKEND_PLUGIN_MESSAGE;
      }
      // If the backend error body is a JSON object with a message/reason
      else if (err.body && typeof err.body === 'object') {
          // Check for common backend error formats
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
          // Fallback if specific message not found in complex body, but body has a message
          else if (err.body.message && typeof err.body.message === 'string') {
              clientMessage = err.body.message;
              clientAttributesError = err.body.message;
          }
      }

      return res.customError({
        statusCode: err.statusCode || 500,
        body: {
          message: clientMessage, // Use the determined message
          attributes: {
            error: clientAttributesError, // Use the determined attributes error
          },
        },
      });
    }
  };
};
