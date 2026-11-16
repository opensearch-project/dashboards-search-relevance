/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Format an elapsed duration (in milliseconds) for display, e.g. "12s", "1m 23s", "1h 02m".
 * Negative or non-finite values are clamped to "0s" (e.g. clock skew between client and server).
 */
export const formatElapsedDuration = (elapsedMs: number): string => {
  if (!Number.isFinite(elapsedMs) || elapsedMs < 0) {
    return '0s';
  }

  const totalSeconds = Math.floor(elapsedMs / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}h ${String(minutes).padStart(2, '0')}m`;
  }
  if (minutes > 0) {
    return `${minutes}m ${String(seconds).padStart(2, '0')}s`;
  }
  return `${seconds}s`;
};
