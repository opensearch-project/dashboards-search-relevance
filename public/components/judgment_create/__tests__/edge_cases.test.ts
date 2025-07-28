/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { buildJudgmentPayload } from '../utils/form_processor';
import { validateJudgmentForm } from '../utils/validation';
import { JudgmentType } from '../types';

describe('Edge Cases', () => {
  describe('buildJudgmentPayload edge cases', () => {
    it('should handle empty context fields array', () => {
      const formData = {
        name: 'test',
        type: JudgmentType.LLM,
        size: 5,
        tokenLimit: 4000,
        contextFields: [],
      };

      const result = buildJudgmentPayload(
        formData,
        [{ label: 'qs1', value: 'qs1' }],
        [{ label: 'sc1', value: 'sc1' }],
        [{ label: 'model1', value: 'model1' }]
      );

      expect(result.contextFields).toBeUndefined();
    });

    it('should handle default token limit', () => {
      const formData = {
        name: 'test',
        type: JudgmentType.LLM,
        size: 5,
        tokenLimit: 4000, // Default value
      };

      const result = buildJudgmentPayload(
        formData,
        [{ label: 'qs1', value: 'qs1' }],
        [{ label: 'sc1', value: 'sc1' }],
        [{ label: 'model1', value: 'model1' }]
      );

      expect(result.tokenLimit).toBeUndefined();
    });

    it('should handle false ignoreFailure', () => {
      const formData = {
        name: 'test',
        type: JudgmentType.LLM,
        size: 5,
        ignoreFailure: false,
      };

      const result = buildJudgmentPayload(
        formData,
        [{ label: 'qs1', value: 'qs1' }],
        [{ label: 'sc1', value: 'sc1' }],
        [{ label: 'model1', value: 'model1' }]
      );

      expect(result.ignoreFailure).toBeUndefined();
    });
  });

  describe('validateJudgmentForm edge cases', () => {
    it('should handle whitespace-only name', () => {
      const result = validateJudgmentForm({ name: '   ', type: JudgmentType.LLM }, [], [], []);
      expect(result.isValid).toBe(false);
      expect(result.errors.name).toBe('Name is a required parameter.');
    });

    it('should handle undefined contextFields', () => {
      const formData = {
        name: 'test',
        type: JudgmentType.LLM,
        contextFields: undefined,
      };

      const result = validateJudgmentForm(formData, [], [], []);
      expect(result.isValid).toBe(false); // Still fails due to other required fields
    });
  });
});
