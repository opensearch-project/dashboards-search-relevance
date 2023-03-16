/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { MetricsServiceSetup } from './metrics/metrics_service';

export interface SearchRelevancePluginRequestContext {
  metricsService: MetricsServiceSetup;
}

declare module '../../../src/core/server' {
  interface RequestHandlerContext {
    searchRelevance: SearchRelevancePluginRequestContext;
  }
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface SearchRelevancePluginSetup {}
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface SearchRelevancePluginStart {}
