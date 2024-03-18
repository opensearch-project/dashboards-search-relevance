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
