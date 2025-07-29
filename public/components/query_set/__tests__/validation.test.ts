/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { validateForm, hasValidationErrors } from '../utils/validation';

describe('validation utils', () => {
  describe('validateForm', () => {
    it('should return no errors for valid form data', () => {
      const formData = {
        name: 'Test Query Set',
        description: 'Test description',
        querySetSize: 10,
        manualQueries: '',
        isManualInput: false,
      };

      const errors = validateForm(formData);

      expect(errors.nameError).toBe('');
      expect(errors.descriptionError).toBe('');
      expect(errors.querySizeError).toBe('');
      expect(errors.manualQueriesError).toBe('');
    });

    it('should return name error when name is empty', () => {
      const formData = {
        name: '',
        description: 'Test description',
        querySetSize: 10,
        manualQueries: '',
        isManualInput: false,
      };

      const errors = validateForm(formData);

      expect(errors.nameError).toBe('Name is a required parameter.');
    });

    it('should return description error when description is empty', () => {
      const formData = {
        name: 'Test Query Set',
        description: '',
        querySetSize: 10,
        manualQueries: '',
        isManualInput: false,
      };

      const errors = validateForm(formData);

      expect(errors.descriptionError).toBe('Description is a required parameter.');
    });

    it('should return query size error when size is invalid for non-manual input', () => {
      const formData = {
        name: 'Test Query Set',
        description: 'Test description',
        querySetSize: 0,
        manualQueries: '',
        isManualInput: false,
      };

      const errors = validateForm(formData);

      expect(errors.querySizeError).toBe('Query Set Size must be a positive integer.');
    });

    it('should return manual queries error when manual input is empty', () => {
      const formData = {
        name: 'Test Query Set',
        description: 'Test description',
        querySetSize: 10,
        manualQueries: '',
        isManualInput: true,
      };

      const errors = validateForm(formData);

      expect(errors.manualQueriesError).toBe('Manual queries are required.');
    });
  });

  describe('hasValidationErrors', () => {
    it('should return false when no errors exist', () => {
      const errors = {
        nameError: '',
        descriptionError: '',
        querySizeError: '',
        manualQueriesError: '',
      };

      expect(hasValidationErrors(errors)).toBe(false);
    });

    it('should return true when errors exist', () => {
      const errors = {
        nameError: 'Name is required',
        descriptionError: '',
        querySizeError: '',
        manualQueriesError: '',
      };

      expect(hasValidationErrors(errors)).toBe(true);
    });
  });
});
