/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { averageTook, formatTook, parseTook } from '../took';

describe('took utils', () => {
  describe('parseTook', () => {
    it('accepts finite numbers >= 0', () => {
      expect(parseTook(0)).toBe(0);
      expect(parseTook(14)).toBe(14);
      expect(parseTook(14.5)).toBe(14.5);
    });

    it('coerces numeric strings', () => {
      expect(parseTook('42')).toBe(42);
    });

    it('omits invalid values', () => {
      expect(parseTook(undefined)).toBeUndefined();
      expect(parseTook(null)).toBeUndefined();
      expect(parseTook(-1)).toBeUndefined();
      expect(parseTook(Number.NaN)).toBeUndefined();
      expect(parseTook('')).toBeUndefined();
      expect(parseTook('slow')).toBeUndefined();
      expect(parseTook({})).toBeUndefined();
    });
  });

  describe('formatTook', () => {
    it('formats milliseconds under one second', () => {
      expect(formatTook(0)).toBe('0 ms');
      expect(formatTook(14)).toBe('14 ms');
      expect(formatTook(999)).toBe('999 ms');
    });

    it('formats seconds for values >= 1000', () => {
      expect(formatTook(1000)).toBe('1 s');
      expect(formatTook(1200)).toBe('1.2 s');
      expect(formatTook(10500)).toBe('11 s');
    });

    it('returns an em dash when missing', () => {
      expect(formatTook(undefined)).toBe('—');
      expect(formatTook(null)).toBe('—');
      expect(formatTook(-5)).toBe('—');
    });
  });

  describe('averageTook', () => {
    it('averages only present values', () => {
      expect(averageTook([10, undefined, 30, null])).toBe(20);
    });

    it('returns undefined when no values are present', () => {
      expect(averageTook([undefined, null])).toBeUndefined();
      expect(averageTook([])).toBeUndefined();
    });
  });
});
