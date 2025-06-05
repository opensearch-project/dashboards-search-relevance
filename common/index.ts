/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

export const PLUGIN_ID = 'searchRelevance';
export const PLUGIN_NAME = 'Search Relevance';
export const COMPARE_SEARCH_RESULTS_TITLE = 'Compare Search Results';

export const SEARCH_RELEVANCE_EXPERIMENTAL_WORKBENCH_UI_EXPERIENCE_ENABLED =
  'search-relevance:experimental_workbench_ui_enabled';

const SEARCH_RELEVANCE_WORKBENCH_BASE_PATH = '/api/relevancy';
export const ServiceEndpoints = Object.freeze({
  // OpenSearch node APIs
  GetIndexes: `${SEARCH_RELEVANCE_WORKBENCH_BASE_PATH}/search/indexes`,
  GetPipelines: `${SEARCH_RELEVANCE_WORKBENCH_BASE_PATH}/search/pipelines`,
  GetSearchResults: `${SEARCH_RELEVANCE_WORKBENCH_BASE_PATH}/search`,
  GetSingleSearchResults: `${SEARCH_RELEVANCE_WORKBENCH_BASE_PATH}/single_search`,
  GetStats: `${SEARCH_RELEVANCE_WORKBENCH_BASE_PATH}/stats`,
  GetClusterSettings: `${SEARCH_RELEVANCE_WORKBENCH_BASE_PATH}/cluster_settings`,

  // Search Relevance node APIs
  QuerySets: `${SEARCH_RELEVANCE_WORKBENCH_BASE_PATH}/query_sets`,
  SearchConfigurations: `${SEARCH_RELEVANCE_WORKBENCH_BASE_PATH}/search_configurations`,
  Judgments: `${SEARCH_RELEVANCE_WORKBENCH_BASE_PATH}/judgments`,
  Experiments: `${SEARCH_RELEVANCE_WORKBENCH_BASE_PATH}/experiments`,
} as const);

const SEARCH_RELEVANCE_PLUGIN_BASE_PATH = '/_plugins/search_relevance';
export const BackendEndpoints = Object.freeze({
  QuerySets: `${SEARCH_RELEVANCE_PLUGIN_BASE_PATH}/query_sets`,
  SearchConfigurations: `${SEARCH_RELEVANCE_PLUGIN_BASE_PATH}/search_configurations`,
  Judgments: `${SEARCH_RELEVANCE_PLUGIN_BASE_PATH}/judgments`,
  Experiments: `${SEARCH_RELEVANCE_PLUGIN_BASE_PATH}/experiments`,
} as const);

export const SEARCH_API = '/_search';

// Query1 for the left search and Query2 for the right search page
export const QUERY_NUMBER_ONE = '1';
export const QUERY_NUMBER_TWO = '2';
