/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { parseMetrics, Metrics } from '../index';

describe('Types utilities', () => {
  describe('parseMetrics', () => {
    it('parses an array with numeric values', () => {
      const metricsArray = [
        { metric: 'ndcg@10', value: 0.85 },
        { metric: 'precision@5', value: 0.75 }
      ];
      
      const result = parseMetrics(metricsArray);
      
      expect(result).toEqual({
        'ndcg@10': 0.85,
        'precision@5': 0.75
      });
    });
    
    it('parses an array with string values', () => {
      const metricsArray = [
        { metric: 'status', value: 'Excellent' },
        { metric: 'tier', value: 'Premium' }
      ];
      
      const result = parseMetrics(metricsArray);
      
      expect(result).toEqual({
        'status': 'Excellent',
        'tier': 'Premium'
      });
    });
    
    it('parses an array with mixed numeric and string values', () => {
      const metricsArray = [
        { metric: 'ndcg@10', value: 0.85 },
        { metric: 'status', value: 'Excellent' },
        { metric: 'precision@5', value: 0.75 }
      ];
      
      const result = parseMetrics(metricsArray);
      
      expect(result).toEqual({
        'ndcg@10': 0.85,
        'status': 'Excellent',
        'precision@5': 0.75
      });
    });
    
    it('handles empty arrays', () => {
      const metricsArray: Array<{ metric: string; value: number | string }> = [];
      
      const result = parseMetrics(metricsArray);
      
      expect(result).toEqual({});
    });
    
    it('preserves the original types of values', () => {
      const metricsArray = [
        { metric: 'score', value: 1 },
        { metric: 'label', value: '1' }
      ];
      
      const result = parseMetrics(metricsArray);
      
      expect(typeof result.score).toBe('number');
      expect(typeof result.label).toBe('string');
    });
  });
});