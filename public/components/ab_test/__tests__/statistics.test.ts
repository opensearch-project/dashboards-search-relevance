/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { ConfigResult } from '../types';
import { calculateSignificance, clickPercentage, normalCDF } from '../utils/statistics';

const buckets = (clicksA: number, clicksB: number): ConfigResult[] => [
  { key: 'uuid-a', doc_count: clicksA, label: 'A' },
  { key: 'uuid-b', doc_count: clicksB, label: 'B' },
];

describe('normalCDF', () => {
  it('returns 0.5 at the mean', () => {
    expect(normalCDF(0)).toBeCloseTo(0.5, 4);
  });

  it('matches known standard normal values', () => {
    expect(normalCDF(1)).toBeCloseTo(0.8413, 3);
    expect(normalCDF(1.96)).toBeCloseTo(0.975, 3);
    expect(normalCDF(-1.96)).toBeCloseTo(0.025, 3);
  });

  it('is symmetric about zero', () => {
    expect(normalCDF(1.4) + normalCDF(-1.4)).toBeCloseTo(1, 4);
  });
});

describe('calculateSignificance', () => {
  it('returns null when there are fewer than two configurations', () => {
    expect(calculateSignificance([])).toBeNull();
    expect(calculateSignificance([{ key: 'uuid-a', doc_count: 5, label: 'A' }])).toBeNull();
  });

  it('returns null when no clicks have been recorded', () => {
    expect(calculateSignificance(buckets(0, 0))).toBeNull();
  });

  it('reports no winner and no significance on an exact tie', () => {
    const stats = calculateSignificance(buckets(50, 50))!;

    expect(stats.zScore).toBeCloseTo(0, 6);
    expect(stats.pValue).toBeCloseTo(1, 3);
    expect(stats.winner).toBeNull();
    expect(stats.significant).toBe(false);
  });

  it('names A the winner when A has more clicks, with a positive z-score', () => {
    const stats = calculateSignificance(buckets(80, 20))!;

    expect(stats.zScore).toBeGreaterThan(0);
    expect(stats.winner).toBe('A');
    expect(stats.significant).toBe(true);
  });

  it('names B the winner when B has more clicks, with a negative z-score', () => {
    const stats = calculateSignificance(buckets(20, 80))!;

    expect(stats.zScore).toBeLessThan(0);
    expect(stats.winner).toBe('B');
    expect(stats.significant).toBe(true);
  });

  it('is symmetric: swapping A and B gives the same p-value', () => {
    const a = calculateSignificance(buckets(70, 30))!;
    const b = calculateSignificance(buckets(30, 70))!;

    expect(a.pValue).toBeCloseTo(b.pValue, 10);
    expect(a.zScore).toBeCloseTo(-b.zScore, 10);
  });

  it('does not call a small imbalance significant', () => {
    // 6 vs 4 is a z of ~0.63 -- nowhere near p < 0.05.
    const stats = calculateSignificance(buckets(6, 4))!;

    expect(stats.winner).toBe('A');
    expect(stats.pValue).toBeGreaterThan(0.05);
    expect(stats.significant).toBe(false);
  });

  it('computes the textbook z-score for a known split', () => {
    // 60/40 of 100: expected 50, stdDev 5, so z = (60 - 50) / 5 = 2.
    const stats = calculateSignificance(buckets(60, 40))!;

    expect(stats.zScore).toBeCloseTo(2, 6);
    expect(stats.pValue).toBeCloseTo(0.0455, 3);
    expect(stats.significant).toBe(true);
  });

  it('treats a single one-sided bucket as a significant sweep', () => {
    const stats = calculateSignificance(buckets(30, 0))!;

    expect(stats.winner).toBe('A');
    expect(stats.significant).toBe(true);
  });
});

describe('clickPercentage', () => {
  it('returns the share of the total as a percentage', () => {
    expect(clickPercentage(25, 100)).toBe(25);
    expect(clickPercentage(1, 3)).toBeCloseTo(33.333, 3);
  });

  it('returns 0 rather than NaN when the total is zero', () => {
    expect(clickPercentage(0, 0)).toBe(0);
  });
});
