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

export type ParseResult<T> = 
  | { success: true; data: T }
  | { success: false; errors: string[] };

export const parseError = (error: string): ParseResult<any> => {
  return { success: false, errors: [error] };
}

export function combineResults(
  ...results: ParseResult<any>[]
): ParseResult<any[]> {
  const errors: string[] = [];
  const values: any[] = [];

  for (const result of results) {
    if (result.success) {
      values.push(result.data);
    } else {
      errors.push(...result.errors);
    }
  }

  return errors.length > 0
    ? { success: false, errors }
    : { success: true, data: values };
}

// Currently this function consumes the response of a pairwise comparison experiment
// In the future this will be applied to an endpoint dedicated to evaluations
export const toQueryEvaluations = (source: any): ParseResult<Array<QueryEvaluation>> => {
  if (source.status === "COMPLETED" && !source.results) {
    return parseError("Missing results for completed experiment");
  }

  let hasPairwiseComparison = true;
  const res = Object.entries(source.results).map(([queryText, value]) => {
    const metrics = value as { pairwiseComparison?: { [key: string]: number[] } };
    if (!metrics?.pairwiseComparison) {
      hasPairwiseComparison = false;
    }
    return {
      queryText: queryText,
      metrics: metrics.pairwiseComparison,
    }
  })

  if (!hasPairwiseComparison) {
    return parseError("Missing pairwise comparison metrics");
  }

  return { success: true, data: res };
}

export const toQuerySnapshots = (source: any, queryName: string): ParseResult<Array<QuerySnapshot>> => {
  if (source.status === "COMPLETED" && !source.results) {
    return parseError("Missing results for completed experiment");
  }

  let data: QuerySnapshot[] = [];
  Object.entries(source.results).forEach(([queryText, value]) => {
    if (value[queryName]) {
      data.push({
        queryText: queryText,
        documentIds: value[queryName],
      })
    }
  })
  return { success: true, data };
}

export const toExperiment = (source: any): ParseResult<Experiment> => {
  // Validate required base fields exist
  if (!source.id || !source.timestamp || !source.querySetId ||
      source.size === undefined) {
    return parseError("Missing one of required fields: id, timestamp, querySetId, size");
  }

  if (source.status === "COMPLETED" && !source.results) {
    return parseError("Missing results for completed experiment");
  }

  const size = source.results ? Object.keys(source.results).length : 0;

  // Handle different experiment types
  switch (source.type) {
    case "PAIRWISE_COMPARISON":
      if (!source.searchConfigurationList) {
        return parseError("Missing required field: searchConfigurationList");
      }
      return {
        success: true,
        data: {
          type: "PAIRWISE_COMPARISON",
          status: source.status,
          id: source.id,
          k: source.size,
          querySetId: source.querySetId,
          timestamp: source.timestamp,
          searchConfigurationList: source.searchConfigurationList,
          size,
        },
      };

    case "LLM_EVALUATION":
      return {
        success: true,
        data: {
          type: "LLM_EVALUATION",
          status: source.status,
          id: source.id,
          k: source.size,
          querySetId: source.querySetId,
          timestamp: source.timestamp,
          size,
        },
      };

    default:
      return parseError(`Unknown experiment type: ${source.type}`);
  }
};