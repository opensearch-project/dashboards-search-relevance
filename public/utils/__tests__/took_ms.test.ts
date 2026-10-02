/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { averageTookMs, formatTookMs, parseTookMs } from '../took_ms';

describe('took_ms utils', () => {
  describe('parseTookMs', () => {
    it('accepts finite numbers >= 0', () => {
      expect(parseTookMs(0)).toBe(0);
      expect(parseTookMs(14)).toBe(14);
      expect(parseTookMs(14.5)).toBe(14.5);
    });

    it('coerces numeric strings', () => {
      expect(parseTookMs('42')).toBe(42);
    });

    it('omits invalid values', () => {
      expect(parseTookMs(undefined)).toBeUndefined();
      expect(parseTookMs(null)).toBeUndefined();
      expect(parseTookMs(-1)).toBeUndefined();
      expect(parseTookMs(Number.NaN)).toBeUndefined();
      expect(parseTookMs('')).toBeUndefined();
      expect(parseTookMs('slow')).toBeUndefined();
      expect(parseTookMs({})).toBeUndefined();
    });
  });

  describe('formatTookMs', () => {
    it('formats milliseconds under one second', () => {
      expect(formatTookMs(0)).toBe('0 ms');
      expect(formatTookMs(14)).toBe('14 ms');
      expect(formatTookMs(999)).toBe('999 ms');
    });

    it('formats seconds for values >= 1000', () => {
      expect(formatTookMs(1000)).toBe('1 s');
      expect(formatTookMs(1200)).toBe('1.2 s');
      expect(formatTookMs(10500)).toBe('11 s');
    });

    it('returns an em dash when missing', () => {
      expect(formatTookMs(undefined)).toBe('—');
      expect(formatTookMs(null)).toBe('—');
      expect(formatTookMs(-5)).toBe('—');
    });
  });

  describe('averageTookMs', () => {
    it('averages only present values', () => {
      expect(averageTookMs([10, undefined, 30, null])).toBe(20);
    });

    it('returns undefined when no values are present', () => {
      expect(averageTookMs([undefined, null])).toBeUndefined();
      expect(averageTookMs([])).toBeUndefined();
    });
  });
});
