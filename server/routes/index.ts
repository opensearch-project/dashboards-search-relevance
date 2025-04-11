/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { IRouter, OpenSearchServiceSetup } from '../../../../src/core/server';
import { registerDslRoute } from './dsl_route';
import { registerMetricsRoute } from './metrics_route';

export function defineRoutes(
  router: IRouter,
  openSearchServiceSetup: OpenSearchServiceSetup,
  dataSourceEnabled: boolean
) {
  registerDslRoute(router, openSearchServiceSetup, dataSourceEnabled);
  registerMetricsRoute(router);
}

export * from './search_relevance_route_service';
