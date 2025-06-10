/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */
export interface DocumentsIndex {
  'docs.count': string;
  'docs.deleted': string;
  health: 'green' | 'yellow';
  index: string;
  pri: string;
  'pri.store.size': string;
  rep: string;
  status: 'open' | 'close';
  'store.size': string;
  uuid: string;
}

export interface IDocType {
  [key: string]: any;
}

export interface Document {
  _index: string;
  _id: string;
  _score: number;
  _source: IDocType;
  fields: IDocType;
}

export interface SearchResults {
  took: number;
  timed_out: boolean;
  _shards: {
    total: number;
    successful: number;
    skipped: number;
    failed: number;
  };
  hits: {
    total: {
      value: number;
      relation: string;
    };
    max_score: number;
    hits: Document[];
  };
}

export enum SelectIndexError {
  unselected = 'An index is required to compare search results. Select an index.',
}

export enum QueryStringError {
  empty = 'A query is required. Enter a query.',
  invalid = 'Query syntax is invalid. Enter a valid query.',
}

export interface ErrorResponse {
  body: string;
  statusCode: number;
}

export interface QueryError {
  selectIndex: SelectIndexError | string;
  queryString: QueryStringError | string;
  errorResponse: ErrorResponse;
}

export const initialQueryErrorState: QueryError = {
  selectIndex: '',
  queryString: '',
  errorResponse: {
    body: '',
    statusCode: 200,
  },
};

export const enum ExperimentStatus {
  RUNNING = 'RUNNING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

export const enum ExperimentType {
  PAIRWISE_COMPARISON = 'PAIRWISE_COMPARISON',
  POINTWISE_EVALUATION = 'POINTWISE_EVALUATION',
  HYBRID_OPTIMIZER = 'HYBRID_OPTIMIZER',
}

export interface ExperimentBase {
  status: ExperimentStatus;
  id: string;
  timestamp: string;
  querySetId: string;
  k: number;
  size: number;
}

export type Experiment =
  | PairwiseComparisonExperiment
  | EvaluationExperiment
  | HybridOptimizerExperiment;

export type PairwiseComparisonExperiment = ExperimentBase & {
  type: ExperimentType.PAIRWISE_COMPARISON;
  searchConfigurationList: string[];
};

export type EvaluationExperiment = ExperimentBase & {
  type: ExperimentType.POINTWISE_EVALUATION;
  searchConfigurationId: string;
  judgmentId: string;
};

interface HybridOptimizerResults {
  [queryText: string]: {
    [searchConfigId: string]: {
      [variantId: string]: string; // evaluationResultId
    };
  };
}

export type HybridOptimizerExperiment = ExperimentBase & {
  type: ExperimentType.HYBRID_OPTIMIZER;
  searchConfigurationId: string;
  judgmentId: string;
  results: HybridOptimizerResults;
};

export interface JudgmentRating {
  docId: string;
  rating: string;
}

export interface QueryJudgment {
  query: string;
  ratings: JudgmentRating[];
}

export interface JudgmentSet {
  name: string;
  description: string;
  type: string;
  judgmentRatings: QueryJudgment[];
}

export const printType = (type: string) => {
  switch (type) {
    case ExperimentType.PAIRWISE_COMPARISON:
      return 'Comparison';
    case ExperimentType.POINTWISE_EVALUATION:
      return 'Evaluation';
    case ExperimentType.HYBRID_OPTIMIZER:
      return 'Hybrid Optimizer';
    default:
      return 'Unknown';
  }
};

export interface Metrics {
  [key: string]: number;
}

export type MetricsCollection = Metrics[];

// Evaluation (multiple metric results for a single query)
export interface QueryEvaluation {
  queryText: string;
  metrics: Metrics;
  documentIds: string[];
}

export interface QuerySnapshot {
  queryText: string;
  documentIds: string[];
}

export type ParseResult<T> = { success: true; data: T } | { success: false; errors: string[] };

export const parseError = (error: string): ParseResult<any> => {
  return { success: false, errors: [error] };
};

export function combineResults(...results: Array<ParseResult<any>>): ParseResult<any[]> {
  const errors: string[] = [];
  const values: any[] = [];

  for (const result of results) {
    if (result.success) {
      values.push(result.data);
    } else {
      errors.push(...result.errors);
    }
  }

  return errors.length > 0 ? { success: false, errors } : { success: true, data: values };
}

export const parseMetrics = (textualMetrics: { [key: string]: number }): Metrics => {
  return Object.fromEntries(
    Object.entries(textualMetrics).map(([key, value]) => [key, parseFloat(value)])
  ) as Metrics;
};

// Currently this function consumes the response of a pairwise comparison experiment
// In the future this will be applied to an endpoint dedicated to evaluations
export const toQueryEvaluations = (source: any): ParseResult<QueryEvaluation[]> => {
  if (source.status === ExperimentStatus.COMPLETED && !source.results) {
    return parseError('Missing results for completed experiment');
  }

  let hasPairwiseComparison = true;
  const res = Object.entries(source.results).map(([queryText, value]) => {
    const metrics = value as { pairwiseComparison?: { [key: string]: number[] } };
    if (!metrics?.pairwiseComparison) {
      hasPairwiseComparison = false;
    }
    return {
      queryText,
      metrics: parseMetrics(metrics.pairwiseComparison),
    };
  });

  if (!hasPairwiseComparison) {
    return parseError('Missing pairwise comparison metrics');
  }

  return { success: true, data: res };
};

export const toQueryEvaluation = (source: any): ParseResult<QueryEvaluation[]> => {
  if (!source.searchText) {
    return parseError('Missing search text');
  }
  if (!source.metrics) {
    return parseError('Missing metrics');
  }

  return {
    success: true,
    data: {
      queryText: source.searchText,
      metrics: parseMetrics(source.metrics),
      documentIds: source.documentIds,
    },
  };
};

export const toQuerySnapshots = (source: any, queryName: string): ParseResult<QuerySnapshot[]> => {
  if (source.status === ExperimentStatus.COMPLETED && !source.results) {
    return parseError('Missing results for completed experiment');
  }

  const data: QuerySnapshot[] = [];
  Object.entries(source.results).forEach(([queryText, value]) => {
    if (value[queryName]) {
      data.push({
        queryText,
        documentIds: value[queryName],
      });
    }
  });
  return { success: true, data };
};

export const toExperiment = (source: any): ParseResult<Experiment> => {
  // Validate required base fields exist
  if (!source.id || !source.timestamp || !source.querySetId || source.size === undefined) {
    return parseError('Missing one of required fields: id, timestamp, querySetId, size');
  }

  if (source.status === ExperimentStatus.COMPLETED && !source.results) {
    return parseError('Missing results for completed experiment');
  }

  if (!source.searchConfigurationList) {
    return parseError('Missing required field: searchConfigurationList');
  }

  const size = source.results ? Object.keys(source.results).length : 0;

  // Handle different experiment types
  switch (source.type) {
    case ExperimentType.PAIRWISE_COMPARISON:
      if (source.searchConfigurationList.length < 2) {
        return parseError('Missing 2 search configurations for pairwise comparison');
      }
      return {
        success: true,
        data: {
          type: ExperimentType.PAIRWISE_COMPARISON,
          status: source.status,
          id: source.id,
          k: source.size,
          querySetId: source.querySetId,
          timestamp: source.timestamp,
          searchConfigurationList: source.searchConfigurationList,
          size,
        },
      };

    case ExperimentType.POINTWISE_EVALUATION:
      if (source.searchConfigurationList.length < 1) {
        return parseError(
          'Missing search configuration for UBI evaluation (searchConfigurationList).'
        );
      }
      if (!source.judgmentList || source.judgmentList.length < 1) {
        return parseError('Missing judgment for UBI evaluation (judgmentList).');
      }
      return {
        success: true,
        data: {
          type: ExperimentType.POINTWISE_EVALUATION,
          status: source.status,
          id: source.id,
          k: source.size,
          querySetId: source.querySetId,
          timestamp: source.timestamp,
          searchConfigurationId: source.searchConfigurationList[0],
          judgmentId: source.judgmentList[0],
          size,
        },
      };

    case 'HYBRID_OPTIMIZER':
      if (source.searchConfigurationList.length < 1) {
        return parseError(
          'Missing search configuration for hybrid optimizer (searchConfigurationList).'
        );
      }
      if (!source.judgmentList || source.judgmentList.length < 1) {
        return parseError('Missing judgment for hybrid optimizer (judgmentList).');
      }
      return {
        success: true,
        data: {
          type: 'HYBRID_OPTIMIZER',
          status: source.status,
          id: source.id,
          k: source.size,
          querySetId: source.querySetId,
          timestamp: source.timestamp,
          searchConfigurationId: source.searchConfigurationList[0],
          judgmentId: source.judgmentList[0],
          size,
        },
      };

    default:
      return parseError(`Unknown experiment type: ${source.type}`);
  }
};
