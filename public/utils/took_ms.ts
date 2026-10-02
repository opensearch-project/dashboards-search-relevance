/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Parse optional OpenSearch cluster search latency (tookMs) from API payloads.
 * Accepts finite numbers >= 0; coerces numeric strings. Returns undefined when absent/invalid.
 */
export const parseTookMs = (value: unknown): number | undefined => {
  if (typeof value === 'number' && Number.isFinite(value) && value >= 0) {
    return value;
  }
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value);
    if (Number.isFinite(parsed) && parsed >= 0) {
      return parsed;
    }
  }
  return undefined;
};

/**
 * Format tookMs for table/summary display: "14 ms", "1.2 s", or "—".
 */
export const formatTookMs = (tookMs: number | undefined | null): string => {
  if (tookMs === undefined || tookMs === null || !Number.isFinite(tookMs) || tookMs < 0) {
    return '—';
  }
  if (tookMs < 1000) {
    return `${Math.round(tookMs)} ms`;
  }
  const seconds = tookMs / 1000;
  const rounded = seconds >= 10 ? seconds.toFixed(0) : seconds.toFixed(1).replace(/\.0$/, '');
  return `${rounded} s`;
};

/**
 * Average of finite tookMs values. Returns undefined when none are present.
 */
export const averageTookMs = (values: Array<number | undefined | null>): number | undefined => {
  const present = values.filter(
    (value): value is number => typeof value === 'number' && Number.isFinite(value) && value >= 0
  );
  if (present.length === 0) {
    return undefined;
  }
  return present.reduce((sum, value) => sum + value, 0) / present.length;
};
