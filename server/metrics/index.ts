/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

export { MetricsServiceSetup, MetricsService } from './metrics_service';

export enum METRIC_INTERVAL {
  ONE_SECOND = 1000,
  ONE_MINUTE = 60000,
}

export const DEFAULT_WINDOW_SIZE = 3;

export enum METRIC_NAME {
  SEARCH_RELEVANCE = 'search_relevance',
}

export enum METRIC_ACTION {
  SINGLE_SEARCH = 'single_search',
  FETCH_INDEX = 'fetch_index',
  FETCH_PIPELINE = 'fetch_pipeline',
}
