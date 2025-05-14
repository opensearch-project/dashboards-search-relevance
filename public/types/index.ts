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

export interface datasourceElements {
  index : DocumentsIndex [],
  dataConnectionId: string,
  pipeline: {}
}

export type ExperimentBase = {
  status: "RUNNING" | "COMPLETED" | "FAILED";
  id: string;
  timestamp: string;
  querySetId: string;
  k: number;
  size: number;
};

export type Experiment =
  | (ExperimentBase & {
      type: "PAIRWISE_COMPARISON";
      searchConfigurationList: string[];
    })
  | (ExperimentBase & {
      type: "LLM_EVALUATION";
    })

// Evaluation (multiple metric results for a single query)
export type QueryEvaluation = {
  queryText: string;
  metrics: {
    [key: string]: number[];
  };
}

export type QuerySnapshot = {
  queryText: string;
  documentIds: string[];
}

// Currently this function consumes the response of a pairwise comparison experiment
// In the future this will be applied to an endpoint dedicated to evaluations
export const toQueryEvaluations = (source: any): Array<QueryEvaluation> | null => {
  if (!source?.results?.metrics) {
    return null;
  }

  const metrics = source.results.metrics;

  return Object.entries(metrics).map(([queryText, value]) => ({
    queryText: queryText,
    metrics: value.pairwiseComparison,
  }))
}

export const toQuerySnapshots = (source: any, queryName: string): Array<QuerySnapshot> | null => {
  if (!source?.results?.metrics) {
    return null;
  }

  const metrics = source.results.metrics;
  return Object.entries(metrics).map(([queryText, value]) => ({
    queryText: queryText,
    documentIds: value[queryName],
  }))
}

export const toExperiment = (source: any): Experiment | null => {
  // Validate required base fields exist
  if (!source.id || !source.timestamp || !source.querySetId ||
      source.k === undefined) {
    return null;
  }

  const size = source.results?.queryTexts?.length ?? 0;

  // Handle different experiment types
  switch (source.type) {
    case "PAIRWISE_COMPARISON":
      if (!source.searchConfigurationList) {
        return null;
      }
      return {
        type: "PAIRWISE_COMPARISON",
        status: "COMPLETED",
        id: source.id,
        k: source.k,
        querySetId: source.querySetId,
        timestamp: source.timestamp,
        searchConfigurationList: source.searchConfigurationList,
        size,
      };

    case "LLM_EVALUATION":
      return {
        type: "LLM_EVALUATION",
        status: "COMPLETED",
        id: source.id,
        k: source.k,
        querySetId: source.querySetId,
        timestamp: source.timestamp,
        size,
      };

    default: // default case while there is no type
      return {
        type: "PAIRWISE_COMPARISON",
        status: "COMPLETED",
        id: source.id,
        k: source.k,
        querySetId: source.querySetId,
        timestamp: source.timestamp,
        searchConfigurationList: source.searchConfigurationList,
        size,
      };
  }
};