/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { ConfigResult } from '../types';

export interface SignificanceResult {
  zScore: number;
  pValue: number;
  winner: 'A' | 'B' | null;
  significant: boolean;
}

/**
 * Standard normal cumulative distribution function, via the Zelen & Severo approximation
 * (Abramowitz & Stegun 26.2.17). Accurate to ~7.5e-8, which is far tighter than the
 * precision needed to compare a p-value against 0.05.
 */
export const normalCDF = (x: number): number => {
  const t = 1 / (1 + 0.2316419 * Math.abs(x));
  const d = 0.3989422804 * Math.exp((-x * x) / 2);
  const p =
    d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
  return x > 0 ? 1 - p : p;
};

/**
 * Two-sided binomial test (normal approximation) of whether the click split between the two
 * configurations differs from an even 50/50.
 *
 * Under team draft interleaving each result is equally likely to have been drafted by either
 * configuration, so the null hypothesis is p = 0.5. A significant p-value means the observed
 * imbalance is unlikely to be chance alone.
 *
 * @param results the two configurations' click counts, ordered [A, B]
 * @returns null when there are not two configurations or no clicks at all, otherwise the verdict
 */
export const calculateSignificance = (results: ConfigResult[]): SignificanceResult | null => {
  if (results.length < 2) return null;

  const clicksA = results[0].doc_count;
  const clicksB = results[1].doc_count;
  const total = clicksA + clicksB;
  if (total === 0) return null;

  const p = 0.5;
  const expected = total * p;
  const stdDev = Math.sqrt(total * p * (1 - p));

  // Signed: positive means A drew more clicks, negative means B did.
  const zScore = (clicksA - expected) / stdDev;
  const pValue = 2 * (1 - normalCDF(Math.abs(zScore)));
  const winner = clicksA === clicksB ? null : clicksA > clicksB ? 'A' : 'B';

  // A tie can never be significant, however many clicks were collected.
  return { zScore, pValue, winner, significant: pValue < 0.05 && winner !== null };
};

/** Percentage of total clicks, guarding the zero-click case so the bars render at 0 rather than NaN. */
export const clickPercentage = (count: number, total: number): number =>
  total ? (count / total) * 100 : 0;
