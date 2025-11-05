/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { validateName, validateQuery, validateIndex, validateForm } from '../utils/validation';

describe('Search Configuration Validation', () => {
  describe('validateName', () => {
    it('should return error for empty name', () => {
      expect(validateName('')).toBe('Search Configuration Name is a required parameter.');
      expect(validateName('  ')).toBe('Search Configuration Name is a required parameter.');
    });

    it('should return empty string for valid name', () => {
      expect(validateName('Test Configuration')).toBe('');
    });
  });

  describe('validateDescription', () => {
    it('should return error for empty description', () => {
      expect(validateName('')).toBe('Description is a required parameter.');
      expect(validateName('  ')).toBe('Description is a required parameter.');
    });

    it('should return empty string for valid description', () => {
      expect(validateName('sample description')).toBe('');
    });
  });

  describe('validateQuery', () => {
    it('should return error for empty query', () => {
      expect(validateQuery('')).toBe('Query is required.');
      expect(validateQuery('  ')).toBe('Query is required.');
    });

    it('should return error for invalid JSON', () => {
      expect(validateQuery('{ invalid json }')).toBe('Query Body must be valid JSON.');
    });

    it('should return empty string for valid JSON', () => {
      expect(validateQuery('{"query": {"match_all": {}}}')).toBe('');
    });
  });

  describe('validateIndex', () => {
    it('should return error for empty index selection', () => {
      expect(validateIndex([])).toBe('No index selected. Please select an index.');
    });

    it('should return empty string for valid index selection', () => {
      expect(validateIndex([{ label: 'test-index', value: 'uuid' }])).toBe('');
    });
  });

  describe('validateForm', () => {
    it('should return all validation results', () => {
      const result = validateForm('', '', []);
      expect(result.isValid).toBe(false);
      expect(result.nameError).toBe('Search Configuration Name is a required parameter.');
      expect(result.queryError).toBe('Query is required.');
      expect(result.indexError).toBe('No index selected. Please select an index.');
    });

    it('should return valid for correct inputs', () => {
      const result = validateForm('Test Configuration', '{"query": {"match_all": {}}}', [
        { label: 'test-index', value: 'uuid' },
      ]);
      expect(result.isValid).toBe(true);
      expect(result.nameError).toBe('');
      expect(result.queryError).toBe('');
      expect(result.indexError).toBe('');
    });
  });
});
