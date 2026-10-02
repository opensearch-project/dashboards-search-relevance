/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  buildQueryEvaluationRows,
  countQueryOutcomes,
  getQueryExecutionOrder,
  getQueryTextsFromQuerySet,
  mapQueryStatusesFromVariants,
  mapTookMsFromVariants,
} from '../query_evaluation_builder';

describe('query_evaluation_builder', () => {
  it('extracts query texts from array and object query sets', () => {
    expect(
      getQueryTextsFromQuerySet([
        { queryText: 'laptop', category: 'tech' },
        { queryText: 'phone', category: 'tech' },
      ])
    ).toEqual(['laptop', 'phone']);

    expect(getQueryTextsFromQuerySet({ a: 'laptop', b: 'phone' })).toEqual(['laptop', 'phone']);
  });

  it('maps variant statuses to queries when counts align', () => {
    const statuses = mapQueryStatusesFromVariants(
      ['query-a', 'query-b'],
      [
        { timestamp: '2026-01-01T00:00:00Z', status: 'ERROR', results: { error: 'boom' } },
        {
          timestamp: '2026-01-01T00:00:01Z',
          status: 'COMPLETED',
          results: { details: 'no search hits found' },
        },
      ]
    );

    expect(statuses.get('query-a')).toBe('failed');
    expect(statuses.get('query-b')).toBe('zero_results');
  });

  it('builds rows for successful, failed, and missing queries', () => {
    const rows = buildQueryEvaluationRows({
      queryTexts: ['success-query', 'failed-query', 'missing-query'],
      evaluationByQueryText: new Map([
        [
          'success-query',
          {
            queryText: 'success-query',
            metrics: { ndcg: 0.5 },
            documentIds: ['doc-1'],
          },
        ],
      ]),
      experimentResults: [{ queryText: 'failed-query' }],
      variantStatusByQueryText: new Map(),
    });

    expect(rows).toHaveLength(3);
    expect(rows[0].status).toBe('success');
    expect(rows[1].status).toBe('failed');
    expect(rows[2].status).toBe('not_run');
  });

  it('uses variant status for zero-results queries', () => {
    const rows = buildQueryEvaluationRows({
      queryTexts: ['zsr-query'],
      evaluationByQueryText: new Map(),
      experimentResults: [{ queryText: 'zsr-query' }],
      variantStatusByQueryText: new Map([['zsr-query', 'zero_results']]),
    });

    expect(rows[0].status).toBe('zero_results');
    expect(rows[0].statusMessage).toContain('zero search results');
  });

  it('maps tookMs from zero-hit variant results', () => {
    const tookMsByQuery = mapTookMsFromVariants(
      ['zsr-query', 'failed-query'],
      [
        {
          timestamp: '2026-01-01T00:00:00Z',
          status: 'COMPLETED',
          results: { details: 'no search hits found', tookMs: 9 },
        },
        {
          timestamp: '2026-01-01T00:00:01Z',
          status: 'ERROR',
          results: { error: 'boom' },
        },
      ]
    );

    expect(tookMsByQuery.get('zsr-query')).toBe(9);
    expect(tookMsByQuery.has('failed-query')).toBe(false);
  });

  it('attaches variant tookMs to zero-results rows', () => {
    const rows = buildQueryEvaluationRows({
      queryTexts: ['zsr-query'],
      evaluationByQueryText: new Map(),
      experimentResults: [{ queryText: 'zsr-query' }],
      variantStatusByQueryText: new Map([['zsr-query', 'zero_results']]),
      tookMsByQueryText: new Map([['zsr-query', 11]]),
    });

    expect(rows[0].status).toBe('zero_results');
    expect(rows[0].tookMs).toBe(11);
  });

  it('prefers evaluation tookMs over variant tookMs for successful rows', () => {
    const rows = buildQueryEvaluationRows({
      queryTexts: ['success-query'],
      evaluationByQueryText: new Map([
        [
          'success-query',
          {
            queryText: 'success-query',
            metrics: { ndcg: 0.5 },
            documentIds: ['doc-1'],
            tookMs: 14,
          },
        ],
      ]),
      experimentResults: [],
      variantStatusByQueryText: new Map(),
      tookMsByQueryText: new Map([['success-query', 99]]),
    });

    expect(rows[0].tookMs).toBe(14);
  });

  it('counts outcomes for notifications', () => {
    const counts = countQueryOutcomes([
      { queryText: 'a', metrics: {}, documentIds: [], status: 'success' },
      { queryText: 'b', metrics: {}, documentIds: [], status: 'failed' },
      { queryText: 'c', metrics: {}, documentIds: [], status: 'zero_results' },
      { queryText: 'd', metrics: {}, documentIds: [], status: 'not_run' },
    ]);

    expect(counts).toEqual({ success: 1, failed: 1, zeroResults: 1, notRun: 1 });
  });

  it('preserves query execution order from experiment results', () => {
    expect(
      getQueryExecutionOrder([
        { queryText: 'second' },
        { queryText: 'first' },
        { queryText: 'second' },
      ])
    ).toEqual(['second', 'first']);
  });
});
