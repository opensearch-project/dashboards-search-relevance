/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { formatElapsedDuration } from '../duration';

describe('formatElapsedDuration', () => {
  it('formats sub-minute durations as seconds', () => {
    expect(formatElapsedDuration(0)).toBe('0s');
    expect(formatElapsedDuration(999)).toBe('0s');
    expect(formatElapsedDuration(1000)).toBe('1s');
    expect(formatElapsedDuration(45000)).toBe('45s');
    expect(formatElapsedDuration(59999)).toBe('59s');
  });

  it('formats minute-scale durations as minutes and seconds', () => {
    expect(formatElapsedDuration(60000)).toBe('1m 00s');
    expect(formatElapsedDuration(83000)).toBe('1m 23s');
    expect(formatElapsedDuration(59 * 60000 + 9000)).toBe('59m 09s');
  });

  it('formats hour-scale durations as hours and minutes', () => {
    expect(formatElapsedDuration(3600000)).toBe('1h 00m');
    expect(formatElapsedDuration(3600000 + 2 * 60000)).toBe('1h 02m');
  });

  it('clamps negative or non-finite values to 0s', () => {
    expect(formatElapsedDuration(-5000)).toBe('0s');
    expect(formatElapsedDuration(NaN)).toBe('0s');
    expect(formatElapsedDuration(Infinity)).toBe('0s');
  });
});
