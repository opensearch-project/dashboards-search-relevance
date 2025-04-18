/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

export const PLUGIN_ID = 'searchRelevance';
export const PLUGIN_NAME = 'Search Relevance';
export const COMPARE_SEARCH_RESULTS_TITLE = 'Compare Search Results';
export const SEARCH_RELEVANCE_WORKBENCH = 'Search Relevance Workbench';

export enum ServiceEndpoints {
  // OpenSearch node APIs
  GetIndexes = '/api/relevancy/search/indexes',
  GetPipelines = '/api/relevancy/search/pipelines',
  GetSearchResults = '/api/relevancy/search',
  GetStats = '/api/relevancy/stats',

  // Search Relevance node APIs
  QuerySets = '/api/relevancy/query_sets',
  SearchConfigurations = '/api/relevancy/search_configurations',
  Judgments = '/api/relevancy/judgments',
  Experiments = '/api/relevancy/experiments',
}

/**
 * BACKEND SEARCH RELEVANCE APIs
 */
export enum BackendEndpoints {
  QuerySets = '/_plugins/search_relevance/query_sets',
  SearchConfigurations = '/_plugins/search_relevance/search_configurations',
  Judgments = '/_plugins/search_relevance/judgments',
  Experiments = '/_plugins/search_relevance/experiments',
}

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
export const SINGLE_SEARCH_NODE_API_PATH = `${BASE_NODE_API_PATH}/single_search`;

export const STATS_NODE_API_PATH = `${BASE_NODE_API_PATH}/stats`;

export const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
  Accept: 'application/json',
  'User-Agent': 'OpenSearch-Dashboards',
  'osd-xsrf': true,
};

// Query1 for the left search and Query2 for the right search page
export const QUERY_NUMBER_ONE = '1';
export const QUERY_NUMBER_TWO = '2';
