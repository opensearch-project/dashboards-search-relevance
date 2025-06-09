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
import { ServiceEndpoints, BackendEndpoints } from '../../common';

export function registerSearchRelevanceRoutes(router: IRouter): void {
  router.post(
    {
      path: ServiceEndpoints.QuerySets,
      validate: {
        body: schema.object({
          name: schema.string(),
          description: schema.string(),
          sampling: schema.string(),
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
      console.error('Failed to call search-relevance APIs', err);
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
  };
};
