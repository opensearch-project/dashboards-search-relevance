/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

export const PLUGIN_ID = 'searchRelevance';
export const PLUGIN_NAME = 'Search Relevance';
export const COMPARE_SEARCH_RESULTS_TITLE = 'Compare Search Results';
export const SEARCH_RELEVANCE_WORKBENCH = 'Search Relevance Workbench';

/**
 * BACKEND SEARCH RELEVANCE APIs
 */
export const SEARCH_RELEVANCE_BASE_API = '/_plugins/search_relevance';
export const SEARCH_RELEVANCE_QUERY_SET_API = `${SEARCH_RELEVANCE_BASE_API}/query_sets`;
export const SEARCH_RELEVANCE_EXPERIMENT_API = `${SEARCH_RELEVANCE_BASE_API}/experiments`;
export const SEARCH_RELEVANCE_JUDGMENT_API = `${SEARCH_RELEVANCE_BASE_API}/judgments`;
export const SEARCH_RELEVANCE_SEARCH_CONFIGURATION_API = `${SEARCH_RELEVANCE_BASE_API}/search_configurations`;

/**
 * OPEN SEARCH CORE APIs
 */
export const SEARCH_API = '/_search';

/**
 * Node APIs
 */
export const BASE_NODE_API_PATH = '/api/relevancy';

// OpenSearch node APIs
export const INDEX_NODE_API_PATH = `${BASE_NODE_API_PATH}/search/indexes`;
export const SEARCH_PIPELINE_NODE_API_PATH = `${BASE_NODE_API_PATH}/search/pipelines`;
export const SEARCH_NODE_API_PATH = `${BASE_NODE_API_PATH}/search`;
export const STATS_NODE_API_PATH = `${BASE_NODE_API_PATH}/stats`;

// Search Relevance node APIs
export const BASE_QUERYSET_NODE_API_PATH = `${BASE_NODE_API_PATH}/queryset`;
export const BASE_EXPERIMENT_NODE_API_PATH = `${BASE_NODE_API_PATH}/experiment`;
export const BASE_JUDGMENT_NODE_API_PATH = `${BASE_NODE_API_PATH}/judgments`;
export const BASE_SEARCH_CONFIGURATION_NODE_API_PATH = `${BASE_NODE_API_PATH}/search_configurations`;

export const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
  Accept: 'application/json',
  'User-Agent': 'OpenSearch-Dashboards',
  'osd-xsrf': true,
};

// Query1 for the left search and Query2 for the right search page
export const QUERY_NUMBER_ONE = '1';
export const QUERY_NUMBER_TWO = '2';
