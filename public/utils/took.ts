/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Parse optional OpenSearch cluster search latency (took) from API payloads.
 * Accepts finite numbers >= 0; coerces numeric strings. Returns undefined when absent/invalid.
 */
export const parseTook = (value: unknown): number | undefined => {
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
 * Format took for table/summary display: "14 ms", "1.2 s", or "—".
 */
export const formatTook = (took: number | undefined | null): string => {
  if (took === undefined || took === null || !Number.isFinite(took) || took < 0) {
    return '—';
  }
  if (took < 1000) {
    return `${Math.round(took)} ms`;
  }
  const seconds = took / 1000;
  const rounded = seconds >= 10 ? seconds.toFixed(0) : seconds.toFixed(1).replace(/\.0$/, '');
  return `${rounded} s`;
};

/**
 * Average of finite took values. Returns undefined when none are present.
 */
export const averageTook = (values: Array<number | undefined | null>): number | undefined => {
  const present = values.filter(
    (value): value is number => typeof value === 'number' && Number.isFinite(value) && value >= 0
  );
  if (present.length === 0) {
    return undefined;
  }
  return present.reduce((sum, value) => sum + value, 0) / present.length;
};
