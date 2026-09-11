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
import { LtrBackendEndpoints, ltrCreateModelPath, ServiceEndpoints } from '../../common';

/**
 * Routes backing the Learning to Rank model registry.
 *
 * These proxy to the LTR plugin's own `_ltr/*` namespace rather than
 * `_plugins/_search_relevance`. The `.ltrstore*` indices are registered system indices, so
 * the plugin's REST endpoints are the only supported way to read or write them. Requests
 * carry the calling user's credentials, so authorization stays with the LTR and security
 * plugins.
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

  router.get(
    {
      path: ServiceEndpoints.LtrFeatureSets,
      validate: {
        query: schema.object({
          size: schema.maybe(schema.number({ min: 1 })),
          from: schema.maybe(schema.number({ min: 0 })),
          prefix: schema.maybe(schema.string()),
          store: schema.maybe(schema.string()),
        }),
      },
    },
    listFeatureSets
  );

  router.post(
    {
      path: ServiceEndpoints.LtrModels,
      validate: {
        // `definition` is deliberately unconstrained: the LTR store accepts either a raw
        // string (RankLib) or embedded JSON (linear, XGBoost) and stores whichever it is
        // given. Narrowing it here would reject valid models.
        body: schema.object({
          name: schema.string({ minLength: 1 }),
          featureSetName: schema.string({ minLength: 1 }),
          modelType: schema.string({ minLength: 1 }),
          definition: schema.any(),
        }),
        query: schema.object({
          store: schema.maybe(schema.string()),
        }),
      },
    },
    createModel
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

const listFeatureSets = async (
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
      path: storePath(LtrBackendEndpoints.FeatureSets, store),
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

/**
 * Wraps the flat form payload in the nesting `_createmodel` expects. Keeping this on the
 * server means the browser never has to know the store's document shape.
 */
export const createModelBody = (model: { name: string; modelType: string; definition: any }) => ({
  model: {
    name: model.name,
    model: {
      type: model.modelType,
      definition: model.definition,
    },
  },
});

const createModel = async (
  context: RequestHandlerContext,
  request: OpenSearchDashboardsRequest,
  response: OpenSearchDashboardsResponseFactory
): Promise<IOpenSearchDashboardsResponse<any>> => {
  const { name, featureSetName, modelType, definition } = request.body as {
    name: string;
    featureSetName: string;
    modelType: string;
    definition: any;
  };
  const { store } = request.query as { store?: string };

  try {
    const caller = context.core.opensearch.legacy.client.callAsCurrentUser;
    const result = await caller('transport.request', {
      method: 'POST',
      path: storePath(ltrCreateModelPath(featureSetName), store),
      body: createModelBody({ name, modelType, definition }),
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
  } else if (/does not exist, please create it first/i.test(reason)) {
    // Same condition as above, reported differently: _createmodel checks for the store
    // itself and raises an illegal_argument rather than letting the read 404.
    ltrErrorType = 'store_not_found';
  } else if (/Stored feature set \[.*\] does not exist/i.test(reason)) {
    // The upload named a feature set that is not in the store.
    ltrErrorType = 'featureset_not_found';
  } else if (/are not updatable, please create a new one instead/i.test(reason)) {
    // The store has no update path, so a duplicate name is a name collision, not a
    // transport failure. Surfaces as 405 by way of a version conflict.
    ltrErrorType = 'model_exists';
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
