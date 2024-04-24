/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

export const PLUGIN_ID = 'searchRelevance';
export const PLUGIN_NAME = 'Search Relevance';

export enum ServiceEndpoints {
  GetIndexes = '/api/relevancy/search/indexes',
  GetPipelines = '/api/relevancy/search/pipelines',
  GetSearchResults = '/api/relevancy/search',
  GetStats = '/api/relevancy/stats',
}

export const SEARCH_API = '/_search';

//Query1 for the left search and Query2 for the right search page
export const QUERY_NUMBER_ONE = '1';
export const QUERY_NUMBER_TWO = '2';
