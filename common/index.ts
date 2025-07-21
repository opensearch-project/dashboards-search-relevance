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
  GetModels: `${SEARCH_RELEVANCE_WORKBENCH_BASE_PATH}/models`,

  // Search Relevance node APIs
  QuerySets: `${SEARCH_RELEVANCE_WORKBENCH_BASE_PATH}/query_sets`,
  SearchConfigurations: `${SEARCH_RELEVANCE_WORKBENCH_BASE_PATH}/search_configurations`,
  Judgments: `${SEARCH_RELEVANCE_WORKBENCH_BASE_PATH}/judgments`,
  Experiments: `${SEARCH_RELEVANCE_WORKBENCH_BASE_PATH}/experiments`,
} as const);

const SEARCH_RELEVANCE_PLUGIN_BASE_PATH = '/_plugins/_search_relevance';
export const BackendEndpoints = Object.freeze({
  QuerySets: `${SEARCH_RELEVANCE_PLUGIN_BASE_PATH}/query_sets`,
  SearchConfigurations: `${SEARCH_RELEVANCE_PLUGIN_BASE_PATH}/search_configurations`,
  Judgments: `${SEARCH_RELEVANCE_PLUGIN_BASE_PATH}/judgments`,
  Experiments: `${SEARCH_RELEVANCE_PLUGIN_BASE_PATH}/experiments`,
} as const);

const ML_COMMON_PLUGIN_BASE_PATH = '_plugins/_ml';
export const ML_MODEL_ROUTE_PREFIX = `${ML_COMMON_PLUGIN_BASE_PATH}/models`;

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
  ExperimentCreateTemplate = `/experiment/create/:templateId(${Object.values(
    RouteTemplateType
  ).join('|')})`,
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

export enum SavedObjectIds {
  ExperimentDeepDive = '75b6ca00-58af-11f0-a87e-4d769b1dbd6c',
  ExperimentVariantComparison = 'fbf11670-58c8-11f0-a340-41deff9f2f7f',
  SearchEvaluationIndexPattern = '1f5d2be0-57f1-11f0-8f39-7b4ad0195873',
}
