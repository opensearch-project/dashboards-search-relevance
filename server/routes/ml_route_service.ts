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
import { ML_MODEL_ROUTE_PREFIX, SEARCH_API, ServiceEndpoints } from '../../common';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const performance = require('perf_hooks').performance;

export function registerMLRoutes(router: IRouter, dataSourceEnabled: boolean) {
  router.post(
    {
      path: `${ServiceEndpoints.GetModels}/{dataSourceId?}`,
      validate: {
        params: schema.object({
          dataSourceId: schema.maybe(schema.string({ defaultValue: '' })),
        }),
      },
    },
    backendAction('POST', `${ML_MODEL_ROUTE_PREFIX}${SEARCH_API}`, dataSourceEnabled)
  );
}

const backendAction = (method, path, dataSourceEnabled) => {
  return async (
    context: RequestHandlerContext,
    request: OpenSearchDashboardsRequest,
    response: OpenSearchDashboardsResponseFactory
  ): Promise<IOpenSearchDashboardsResponse<any>> => {
    try {
      const dataSourceId = request.params.dataSourceId;
      let callApi: ILegacyScopedClusterClient['callAsCurrentUser'];
      if (dataSourceEnabled && dataSourceId) {
        callApi = context.dataSource.opensearch.legacy.getClient(dataSourceId).callAPI;
      } else {
        callApi = context.core.opensearch.legacy.client.callAsCurrentUser;
      }
      const resp = await callApi('transport.request', {
        method,
        path,
        body: {
          query: {
            match_all: {},
          },
          size: 1000,
        },
      });
      return response.ok({
        body: resp,
      });
    } catch (err) {
      console.error('Failed to call ml-commons APIs', err);
      return response.customError({
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
