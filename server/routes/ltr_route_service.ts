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
import { LtrBackendEndpoints, ServiceEndpoints } from '../../common';

/**
 * Routes backing the Learning to Rank model registry.
 *
 * These proxy to the LTR plugin's own `_ltr/*` namespace rather than
 * `_plugins/_search_relevance`. The `.ltrstore*` indices are registered system indices, so
 * the plugin's REST endpoints are the only supported way to read them.
 */
export function registerLtrRoutes(router: IRouter): void {
  router.get(
    {
      path: ServiceEndpoints.LtrModels,
      validate: {
        query: schema.object({
          size: schema.maybe(schema.number({ min: 1 })),
          from: schema.maybe(schema.number({ min: 0 })),
          prefix: schema.maybe(schema.string()),
          store: schema.maybe(schema.string()),
        }),
      },
    },
    listModels
  );

  router.get(
    {
      path: `${ServiceEndpoints.LtrModels}/{name}`,
      validate: {
        params: schema.object({
          name: schema.string(),
        }),
        query: schema.object({
          store: schema.maybe(schema.string()),
        }),
      },
    },
    getModel
  );
}

const listModels = async (
  context: RequestHandlerContext,
  request: OpenSearchDashboardsRequest,
  response: OpenSearchDashboardsResponseFactory
): Promise<IOpenSearchDashboardsResponse<any>> => {
  const { size, from, prefix, store } = request.query as {
    size?: number;
    from?: number;
    prefix?: string;
    store?: string;
  };

  try {
    const caller = context.core.opensearch.legacy.client.callAsCurrentUser;
    const result = await caller('transport.request', {
      method: 'GET',
      path: storePath(LtrBackendEndpoints.Models, store),
      query: {
        ...(size !== undefined ? { size } : {}),
        ...(from !== undefined ? { from } : {}),
        ...(prefix ? { prefix } : {}),
      },
    });

    return response.ok({ body: result });
  } catch (err) {
    return ltrError(response, err);
  }
};

const getModel = async (
  context: RequestHandlerContext,
  request: OpenSearchDashboardsRequest,
  response: OpenSearchDashboardsResponseFactory
): Promise<IOpenSearchDashboardsResponse<any>> => {
  const { name } = request.params as { name: string };
  const { store } = request.query as { store?: string };

  try {
    const caller = context.core.opensearch.legacy.client.callAsCurrentUser;
    const result = await caller('transport.request', {
      method: 'GET',
      path: `${storePath(LtrBackendEndpoints.Models, store)}/${encodeURIComponent(name)}`,
    });

    return response.ok({ body: result });
  } catch (err) {
    return ltrError(response, err);
  }
};

/**
 * `_ltr/_model` reads the default store; `_ltr/{store}/_model` reads a named one. v1 always
 * uses the default store, but the parameter is threaded through so a store selector is a UI
 * change rather than a refactor.
 *
 * The store name is encoded: it arrives as an unconstrained query parameter, and left raw a
 * value like `../../_cluster/settings` would traverse out of the `_ltr` namespace and address
 * an unrelated API on the same cluster.
 */
export const storePath = (endpoint: string, store?: string): string => {
  if (!store) {
    return endpoint;
  }
  const [, ...rest] = endpoint.split('/').filter(Boolean);
  return `/_ltr/${encodeURIComponent(store)}/${rest.join('/')}`;
};

/**
 * Translates the two failure modes a fresh cluster actually hits into something the UI can
 * act on, rather than surfacing a raw transport error.
 */
export const ltrError = (response: OpenSearchDashboardsResponseFactory, err: any) => {
  // eslint-disable-next-line no-console
  console.error('Failed to call Learning to Rank APIs', err);

  // `response.customError` throws for anything outside 400-599, so an odd transport
  // statusCode would turn a classified LTR error into an unhandled exception.
  const rawStatusCode = err.statusCode;
  const statusCode =
    typeof rawStatusCode === 'number' && rawStatusCode >= 400 && rawStatusCode < 600
      ? rawStatusCode
      : 500;
  const rawError = err.body?.error;
  const reason: string =
    (typeof rawError === 'object' && (rawError.reason || rawError.type)) ||
    (typeof rawError === 'string' && rawError) ||
    err.message ||
    '';

  // Classified on the response body alone, deliberately not on the status code. Verified
  // against OpenSearch 3.3.0 with opensearch-ltr 3.3.0.0, these do not share a convention:
  // a missing model and a missing store are both 404, an unknown route is 400, but a
  // disabled plugin surfaces an illegal_state_exception as 500.
  let ltrErrorType: string | undefined;
  if (err.body?.found === false) {
    // The store exists; this particular model name does not.
    ltrErrorType = 'model_not_found';
  } else if (/index_not_found|no such index/i.test(reason)) {
    // LTR is installed but no feature store has been created yet.
    ltrErrorType = 'store_not_found';
  } else if (/LTR plugin is disabled/i.test(reason)) {
    ltrErrorType = 'plugin_disabled';
  } else if (/no handler found/i.test(reason)) {
    ltrErrorType = 'plugin_not_installed';
  }

  return response.customError({
    statusCode,
    body: {
      message: reason || 'Failed to call Learning to Rank APIs',
      attributes: {
        error: reason,
        ltrErrorType,
      },
    },
  });
};
