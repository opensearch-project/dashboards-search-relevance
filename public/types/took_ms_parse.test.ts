/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  ExperimentStatus,
  toQueryEvaluation,
  toQuerySnapshots,
} from './index';

describe('tookMs parsing', () => {
  describe('toQueryEvaluation', () => {
    it('includes tookMs when present', () => {
      const result = toQueryEvaluation({
        searchText: 'red shoes',
        metrics: [{ metric: 'NDCG@10', value: 0.82 }],
        documentIds: ['d1'],
        tookMs: 14,
      });

      expect(result.success).toBe(true);
      if (!result.success) {
        return;
      }
      expect(result.data.queryText).toBe('red shoes');
      expect(result.data.tookMs).toBe(14);
      expect(result.data.metrics).toEqual({ 'NDCG@10': 0.82 });
    });

    it('omits tookMs when absent or invalid', () => {
      const without = toQueryEvaluation({
        searchText: 'legacy',
        metrics: [{ metric: 'NDCG@10', value: 0.5 }],
        documentIds: [],
      });
      expect(without.success).toBe(true);
      if (without.success) {
        expect(without.data.tookMs).toBeUndefined();
      }

      const invalid = toQueryEvaluation({
        searchText: 'bad',
        metrics: [{ metric: 'NDCG@10', value: 0.5 }],
        documentIds: [],
        tookMs: -3,
      });
      expect(invalid.success).toBe(true);
      if (invalid.success) {
        expect(invalid.data.tookMs).toBeUndefined();
      }
    });
  });

  describe('toQuerySnapshots', () => {
    it('reads tookMs from pairwise snapshots', () => {
      const result = toQuerySnapshots(
        {
          status: ExperimentStatus.COMPLETED,
          results: [
            {
              query_text: 'red shoes',
              snapshots: [
                {
                  searchConfigurationId: 'cfg-a',
                  docIds: ['d1', 'd2'],
                  tookMs: 12,
                },
                {
                  searchConfigurationId: 'cfg-b',
                  docIds: ['d1', 'd3'],
                  tookMs: 41,
                },
              ],
            },
          ],
        },
        'cfg-b'
      );

      expect(result.success).toBe(true);
      if (!result.success) {
        return;
      }
      expect(result.data).toHaveLength(1);
      expect(result.data[0].queryText).toBe('red shoes');
      expect(result.data[0].documentIds).toEqual(['d1', 'd3']);
      expect(result.data[0].tookMs).toBe(41);
    });

    it('omits tookMs on legacy snapshots', () => {
      const result = toQuerySnapshots(
        {
          status: ExperimentStatus.COMPLETED,
          results: [
            {
              query_text: 'legacy',
              snapshots: [
                {
                  searchConfigurationId: 'cfg-a',
                  docIds: ['d1'],
                },
              ],
            },
          ],
        },
        'cfg-a'
      );

      expect(result.success).toBe(true);
      if (!result.success) {
        return;
      }
      expect(result.data[0].tookMs).toBeUndefined();
    });
  });
});
