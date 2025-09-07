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

    it('should return different error message for text input when queries are empty', () => {
      const formData = {
        name: 'Test Query Set',
        description: 'Test description',
        querySetSize: 10,
        manualQueries: '',
        isManualInput: true,
        isTextInput: true,
      };

      const errors = validateForm(formData);

      expect(errors.manualQueriesError).toBe('Please enter at least one query.');
    });

    it('should return error when name is too long', () => {
      const formData = {
        name: 'A'.repeat(51), // 51 characters
        description: 'Test description',
        querySetSize: 10,
        manualQueries: '',
        isManualInput: false,
      };

      const errors = validateForm(formData);

      expect(errors.nameError).toBe('Name is too long (> 50 characters).');
    });

    it('should return error when name contains invalid characters', () => {
      const formData = {
        name: 'Test <script>alert("XSS")</script>',
        description: 'Test description',
        querySetSize: 10,
        manualQueries: '',
        isManualInput: false,
      };

      const errors = validateForm(formData);

      expect(errors.nameError).toBe('Name contains invalid characters (e.g., quotes, backslashes, or HTML tags).');
    });

    it('should return error when description is too long', () => {
      const formData = {
        name: 'Test Query Set',
        description: 'A'.repeat(251), // 251 characters
        querySetSize: 10,
        manualQueries: '',
        isManualInput: false,
      };

      const errors = validateForm(formData);

      expect(errors.descriptionError).toBe('Description is too long (> 250 characters).');
    });

    it('should return error when description contains invalid characters', () => {
      const formData = {
        name: 'Test Query Set',
        description: 'Description with "quotes" and \\backslashes',
        querySetSize: 10,
        manualQueries: '',
        isManualInput: false,
      };

      const errors = validateForm(formData);

      expect(errors.descriptionError).toBe('Description contains invalid characters (e.g., quotes, backslashes, or HTML tags).');
    });

    describe('isValidInputString', () => {
      const { isValidInputString } = require('../utils/validation');

      it('should return true for valid strings', () => {
        expect(isValidInputString('Valid string')).toBe(true);
        expect(isValidInputString('123456789')).toBe(true);
        expect(isValidInputString('Special chars: !@#$%^&*()_+-=[]{}|;:,./?')).toBe(true);
      });

      it('should return false for strings with double quotes', () => {
        expect(isValidInputString('String with "quotes"')).toBe(false);
      });

      it('should return false for strings with backslashes', () => {
        expect(isValidInputString('String with \\backslash')).toBe(false);
      });

      it('should return false for strings with HTML tags', () => {
        expect(isValidInputString('String with <tags>')).toBe(false);
      });

      it('should return false for strings with control characters', () => {
        expect(isValidInputString('String with \u0000 control char')).toBe(false);
        expect(isValidInputString('String with \u0001 control char')).toBe(false);
      });
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
