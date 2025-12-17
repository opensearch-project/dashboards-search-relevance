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
  ScheduledExperiments: `${SEARCH_RELEVANCE_WORKBENCH_BASE_PATH}/experiments/schedule`,
} as const);

const SEARCH_RELEVANCE_PLUGIN_BASE_PATH = '/_plugins/_search_relevance';
export const BackendEndpoints = Object.freeze({
  QuerySets: `${SEARCH_RELEVANCE_PLUGIN_BASE_PATH}/query_sets`,
  SearchConfigurations: `${SEARCH_RELEVANCE_PLUGIN_BASE_PATH}/search_configurations`,
  Judgments: `${SEARCH_RELEVANCE_PLUGIN_BASE_PATH}/judgments`,
  Experiments: `${SEARCH_RELEVANCE_PLUGIN_BASE_PATH}/experiments`,
  ScheduledExperiments: `${SEARCH_RELEVANCE_PLUGIN_BASE_PATH}/experiments/schedule`,
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
  PointwiseExperimentScheduledRuns = '1edb6ad0-aac9-11f0-83f6-277d0637de48',
  SearchEvaluationIndexPattern = '1f5d2be0-57f1-11f0-8f39-7b4ad0195873',
  DeepDiveSummary = '49898070-5d6a-11f0-997f-d5fd279c0ce1',
}

// tool tip texts
export const JACCARD_TOOL_TIP = 'Jaccard index measures the similarity between two sets of documents, defined as the size of the intersection divided by the size of the union of the sets. A higher value indicates greater overlap.';
export const RBO50_TOOL_TIP = 'Rank-Biased Overlap (RBO) measures the similarity of two ranked lists. A higher value indicates more similar rankings, especially at the top. rbo50 stands for a 50% chance a hypothetical user continues to the next rank. The lower the number the stronger the top ranks are weighted.';
export const RBO90_TOOL_TIP = 'Rank-Biased Overlap (RBO) measures the similarity of two ranked lists. A higher value indicates more similar rankings, especially at the top. rbo90 stands for a 90% chance a hypothetical user continues to the next rank. The lower the number the stronger the top ranks are weighted.';
export const FREQUENCY_WEIGHTED_TOOL_TIP = 'frequencyWeighted measures the similarity of two sets of documents without duplicates. It gives higher weights to documents occurring in both result lists.';
export const NDCG_TOOL_TIP = 'Normalized Discounted Cumulative Gain (NDCG) measures the usefulness, or gain, of documents based on their position in the result list. The gain is accumulated from the top of the result list to the bottom, with documents at lower ranks being "discounted". The normalization ensures the score is between 0 and 1, where 1 is a perfect ranking.';
export const PRECISION_TOOL_TIP = 'Precision measures the proportion of retrieved documents that are relevant. For a given rank K, Precision@K is the number of relevant documents among the top K retrieved documents, divided by K.';
export const MAP_TOOL_TIP = 'Mean Average Precision (MAP) is a single-figure measure of quality across recall levels. For a single query, Average Precision (AP) is the average of the Precision values calculated at the rank of each relevant document. MAP is the mean of these Average Precision scores across multiple queries.';
export const COVERAGE_TOOL_TIP = 'Coverage represents the ratio of query-document pairs in the search results for which a relevance judgment exists. It indicates how much of the returned data has been evaluated for relevance.';

export { DISABLED_BACKEND_PLUGIN_MESSAGE, extractUserMessageFromError } from './error_handling';
