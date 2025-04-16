/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { IRouter } from '../../../../src/core/server';
import { ServiceEndpoints } from '../../common';

export function registerMetricsRoute(router: IRouter) {
  router.get(
    {
      path: ServiceEndpoints.GetStats,
      validate: false,
    },
    async (context, _, response) => {
      try {
        const metrics = context.searchRelevance.metricsService.getStats();
        return response.ok({
          body: JSON.stringify(metrics, null, 2),
        });
      } catch (error) {
        console.error(error);
        return response.custom({
          statusCode: error.statusCode || 500,
          body: error.message,
        });
      }
    }
  );
}
