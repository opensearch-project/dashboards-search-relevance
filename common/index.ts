/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

export const PLUGIN_ID = 'searchRelevanceWorkbench';
export const PLUGIN_NAME = 'Search Relevance Workbench';
export const COMPARE_SEARCH_RESULTS_TITLE = 'Compare Search Results';

export enum ServiceEndpoints {
  // OpenSearch node APIs
  GetIndexes = '/api/relevancy/search/indexes',
  GetPipelines = '/api/relevancy/search/pipelines',
  GetSearchResults = '/api/relevancy/search',
  GetSingleSearchResults = '/api/relevancy/single_search',
  GetStats = '/api/relevancy/stats',
  GetClusterSettings = '/api/relevancy/cluster_settings',

  // Search Relevance node APIs
  QuerySets = '/api/relevancy/query_sets',
  SearchConfigurations = '/api/relevancy/search_configurations',
  Judgments = '/api/relevancy/judgments',
  Experiments = '/api/relevancy/experiments',
}

export enum BackendEndpoints {
  QuerySets = '/_plugins/_search_relevance/query_sets',
  SearchConfigurations = '/_plugins/_search_relevance/search_configurations',
  Judgments = '/_plugins/_search_relevance/judgments',
  Experiments = '/_plugins/_search_relevance/experiments',
}

export const SEARCH_API = '/_search';

// Query1 for the left search and Query2 for the right search page
export const QUERY_NUMBER_ONE = '1';
export const QUERY_NUMBER_TWO = '2';

export enum RouteTemplateType {
  SingleQueryComparison = 'singleQueryComparison',
  QuerySetComparison = 'querySetComparison',
  SearchEvaluation = 'searchEvaluation',
  HybridOptimizer = 'hybridOptimizer',
}

export enum Routes {
  Home = '/',
  ExperimentListing = '/experiment',
  ExperimentView = '/experiment/view/:entityId',
  ExperimentViewPrefix = '/experiment/view',
  ExperimentCreate = '/experiment/create',
  ExperimentCreateSingleQueryComparison = `/experiment/create/${RouteTemplateType.SingleQueryComparison}`,
  ExperimentCreateQuerySetComparison = `/experiment/create/${RouteTemplateType.QuerySetComparison}`,
  ExperimentCreateSearchEvaluation = `/experiment/create/${RouteTemplateType.SearchEvaluation}`,
  ExperimentCreateHybridOptimizer = `/experiment/create/${RouteTemplateType.HybridOptimizer}`,
  ExperimentCreateTemplate = `/experiment/create/:templateId(${Object.values(RouteTemplateType).join('|')})`,
  QuerySetListing = '/querySet',
  QuerySetView = '/querySet/view/:entityId',
  QuerySetViewPrefix = '/querySet/view',
  QuerySetCreate = '/querySet/create',
  SearchConfigurationListing = '/searchConfiguration',
  SearchConfigurationView = '/searchConfiguration/view/:entityId',
  SearchConfigurationViewPrefix = '/searchConfiguration/view',
  SearchConfigurationCreate = '/searchConfiguration/create',
  JudgmentListing = '/judgment',
  JudgmentView = '/judgment/view/:entityId',
  JudgmentViewPrefix = '/judgment/view',
  JudgmentCreate = '/judgment/create',
}
