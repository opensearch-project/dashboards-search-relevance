/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { validateJudgmentForm, isValidTokenLimit } from '../utils/validation';
import { JudgmentType } from '../types';

describe('validation', () => {
  describe('validateJudgmentForm', () => {
    it('should validate required name field', () => {
      const result = validateJudgmentForm({ name: '', type: JudgmentType.LLM }, [], [], []);
      expect(result.isValid).toBe(false);
      expect(result.errors.name).toBe('Name is a required parameter.');
    });

    it('should validate LLM judgment requirements', () => {
      const result = validateJudgmentForm({ name: 'test', type: JudgmentType.LLM }, [], [], []);
      expect(result.isValid).toBe(false);
      expect(result.errors.querySet).toBe('Please select a query set');
      expect(result.errors.searchConfigs).toBe('Please select at least one search configuration');
      expect(result.errors.model).toBe('Please select a model id');
    });

    it('should pass validation for valid LLM judgment', () => {
      const result = validateJudgmentForm(
        { name: 'test', type: JudgmentType.LLM },
        [{ label: 'qs1', value: 'qs1' }],
        [{ label: 'sc1', value: 'sc1' }],
        [{ label: 'model1', value: 'model1' }]
      );
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual({});
    });
  });

  describe('isValidTokenLimit', () => {
    it('should validate token limit range', () => {
      expect(isValidTokenLimit(999)).toBe(false);
      expect(isValidTokenLimit(1000)).toBe(true);
      expect(isValidTokenLimit(4000)).toBe(true);
      expect(isValidTokenLimit(500000)).toBe(true);
      expect(isValidTokenLimit(500001)).toBe(false);
    });
  });

  it('should pass validation for valid UBI judgment', () => {
    const result = validateJudgmentForm({ name: 'test', type: JudgmentType.UBI }, [], [], []);
    expect(result.isValid).toBe(true);
    expect(result.errors).toEqual({});
  });
});
