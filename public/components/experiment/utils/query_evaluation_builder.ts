/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { QueryEvaluation } from '../../../types/index';

export type QueryEvaluationStatus = 'success' | 'zero_results' | 'failed' | 'not_run';

export interface QueryEvaluationRow extends QueryEvaluation {
  status: QueryEvaluationStatus;
  statusMessage?: string;
}

export interface ExperimentResultEntry {
  queryText?: string;
  evaluationId?: string;
}

export interface ExperimentVariantSource {
  timestamp?: string;
  status?: string;
  results?: {
    error?: string;
    details?: string;
    evaluationResultId?: string;
  };
}

export interface QueryOutcomeCounts {
  success: number;
  zeroResults: number;
  failed: number;
  notRun: number;
}

const NO_HITS_DETAIL = 'no search hits found';

export const getQueryTextsFromQuerySet = (querySetQueries: unknown): string[] => {
  if (!querySetQueries) {
    return [];
  }

  if (Array.isArray(querySetQueries)) {
    return querySetQueries
      .map((entry) => {
        if (typeof entry === 'string') {
          return entry;
        }
        if (entry && typeof entry === 'object' && 'queryText' in entry) {
          return String((entry as { queryText: string }).queryText);
        }
        return null;
      })
      .filter((text): text is string => Boolean(text));
  }

  if (typeof querySetQueries === 'object') {
    return Object.values(querySetQueries as Record<string, string>).filter(
      (text) => typeof text === 'string' && text.length > 0
    );
  }

  return [];
};

export const getQueryExecutionOrder = (experimentResults: ExperimentResultEntry[]): string[] => {
  const order: string[] = [];
  const seen = new Set<string>();

  for (const result of experimentResults) {
    const queryText = result?.queryText;
    if (queryText && !seen.has(queryText)) {
      seen.add(queryText);
      order.push(queryText);
    }
  }

  return order;
};

const classifyVariant = (variant: ExperimentVariantSource): QueryEvaluationStatus | null => {
  const results = variant.results ?? {};
  const details = typeof results.details === 'string' ? results.details : '';

  if (variant.status === 'ERROR' || results.error) {
    return 'failed';
  }

  if (details.toLowerCase().includes(NO_HITS_DETAIL)) {
    return 'zero_results';
  }

  if (results.evaluationResultId) {
    return 'success';
  }

  return null;
};

export const mapQueryStatusesFromVariants = (
  queryExecutionOrder: string[],
  variants: ExperimentVariantSource[]
): Map<string, QueryEvaluationStatus> => {
  const statusByQuery = new Map<string, QueryEvaluationStatus>();

  if (queryExecutionOrder.length === 0 || variants.length !== queryExecutionOrder.length) {
    return statusByQuery;
  }

  const sortedVariants = [...variants].sort((a, b) =>
    String(a.timestamp ?? '').localeCompare(String(b.timestamp ?? ''))
  );

  queryExecutionOrder.forEach((queryText, index) => {
    const variantStatus = classifyVariant(sortedVariants[index]);
    if (variantStatus && variantStatus !== 'success') {
      statusByQuery.set(queryText, variantStatus);
    }
  });

  return statusByQuery;
};

const getStatusMessage = (status: QueryEvaluationStatus, errorMessage?: string): string | undefined => {
  switch (status) {
    case 'failed':
      return errorMessage || 'Query failed to execute';
    case 'zero_results':
      return 'Query succeeded but returned zero search results';
    case 'not_run':
      return 'Query was not evaluated';
    default:
      return undefined;
  }
};

export const buildQueryEvaluationRows = ({
  queryTexts,
  evaluationByQueryText,
  experimentResults,
  variantStatusByQueryText,
}: {
  queryTexts: string[];
  evaluationByQueryText: Map<string, QueryEvaluation>;
  experimentResults: ExperimentResultEntry[];
  variantStatusByQueryText: Map<string, QueryEvaluationStatus>;
}): QueryEvaluationRow[] => {
  const experimentResultsByQuery = new Map<string, ExperimentResultEntry[]>();

  for (const result of experimentResults) {
    const queryText = result?.queryText;
    if (!queryText) {
      continue;
    }
    const existing = experimentResultsByQuery.get(queryText) ?? [];
    existing.push(result);
    experimentResultsByQuery.set(queryText, existing);
  }

  return queryTexts.map((queryText) => {
    const evaluation = evaluationByQueryText.get(queryText);
    if (evaluation) {
      return {
        ...evaluation,
        status: 'success',
      };
    }

    const variantStatus = variantStatusByQueryText.get(queryText);
    const experimentEntries = experimentResultsByQuery.get(queryText) ?? [];
    const hasEvaluationId = experimentEntries.some((entry) => Boolean(entry.evaluationId));

    if (hasEvaluationId) {
      return {
        queryText,
        metrics: {},
        documentIds: [],
        status: 'success',
      };
    }

    if (variantStatus) {
      return {
        queryText,
        metrics: {},
        documentIds: [],
        status: variantStatus,
        statusMessage: getStatusMessage(variantStatus),
      };
    }

    if (experimentEntries.length > 0) {
      return {
        queryText,
        metrics: {},
        documentIds: [],
        status: 'failed',
        statusMessage: getStatusMessage('failed'),
      };
    }

    return {
      queryText,
      metrics: {},
      documentIds: [],
      status: 'not_run',
      statusMessage: getStatusMessage('not_run'),
    };
  });
};

export const countQueryOutcomes = (rows: QueryEvaluationRow[]): QueryOutcomeCounts => {
  return rows.reduce(
    (counts, row) => {
      switch (row.status) {
        case 'zero_results':
          counts.zeroResults++;
          break;
        case 'failed':
          counts.failed++;
          break;
        case 'not_run':
          counts.notRun++;
          break;
        default:
          counts.success++;
      }
      return counts;
    },
    { success: 0, zeroResults: 0, failed: 0, notRun: 0 }
  );
};

export const parseVariantSources = (hits: Array<{ _source?: ExperimentVariantSource }>): ExperimentVariantSource[] =>
  hits.map((hit) => hit._source).filter((source): source is ExperimentVariantSource => Boolean(source));
