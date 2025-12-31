/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { isNameValid } from '../utils';

describe('Utils helper functions', () => {
  describe('isNameValid', () => {
    it('returns false for names longer than 50 characters', () => {
      expect(isNameValid('Lorem ipsum dolor sit amet, consectetur adipiscing elit,')).toBe(false);
    });

    it('returns true for names less than 50 characters', () => {
      expect(isNameValid('Lorem ipsum dolor sit amet, consectetur adipiscin')).toBe(true);
    });

    it('returns false for names exactly 50 characters', () => {
      expect(isNameValid('Lorem ipsum dolor sit amet, consectetur adipiscing e')).toBe(false);
    });

    it('returns false for empty names', () => {
      expect(isNameValid('')).toBe(false);
    });

    it('returns true for names with 1 character', () => {
      expect(isNameValid('A')).toBe(true);
    });

    it('returns true for names with 49 characters', () => {
      const string49Chars = 'This string is exactly 49 characters in length...';
      expect(string49Chars.length).toBe(49);
      expect(isNameValid(string49Chars)).toBe(true);
    });
  });
});
