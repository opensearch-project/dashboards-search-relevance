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

export function registerSearchRelevanceRoutes(
  router: IRouter,
): void {
  router.post(
    {
      path: ServiceEndpoints.QuerySets,
      validate: {
        body: schema.any(),
      },
    },
    backendAction('POST', BackendEndpoints.QuerySets),
  );
  router.get(
    {
      path: ServiceEndpoints.QuerySets,
      validate: false,
    },
    backendAction('GET', BackendEndpoints.QuerySets)
  );
  router.post(
    {
      path: ServiceEndpoints.SearchConfigurations,
      validate: {
        body: schema.any(),
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
  router.post(
    {
      path: ServiceEndpoints.Experiments,
      validate: {
        body: schema.any(),
      },
    },
    backendAction('PUT', BackendEndpoints.Experiments)
  );
}

const backendAction = (method, path) => {
  return async(
    context: RequestHandlerContext,
    req: OpenSearchDashboardsRequest,
    res: OpenSearchDashboardsResponseFactory
  ): Promise<IOpenSearchDashboardsResponse<any>> => {
      const dataSourceId = req.query.data_source;
      const caller = dataSourceId
        ? context.dataSource.opensearch.legacy.getClient(dataSourceId).callAPI
        : context.core.opensearch.legacy.client.callAsCurrentUser;
    try {
      const querySetResponse = await caller('transport.request', {
        method: method,
        path: path,
        ...((method==="POST" || method==="PUT") ? {body: req.body} : {}),
      })        
      return res.ok({body: querySetResponse});
    } catch (err) {
      return res.customError({
        statusCode: err.statusCode || 500,
        body: {
          message: err.message,
          attributes: {
            error: err.body?.error || err.message,
          },
        }
      });
    }
  };
}
