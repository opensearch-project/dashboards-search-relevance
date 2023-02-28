/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

export { MetricsServiceSetup, MetricsService } from './metrics_service';

export enum METRIC_NAME {
  RELEVANT_SEARCH = 'relevant_search',
}

export enum METRIC_ACTION {
  COMPARE_SEARCH = 'compare_search',
  SINGLE_SEARCH = 'single_search',
  FETCH_INDEX = 'fetch_index',
}
