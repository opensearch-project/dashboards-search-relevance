/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { buildJudgmentPayload } from '../utils/form_processor';
import { JudgmentType } from '../types';

describe('form_processor', () => {
  describe('buildJudgmentPayload', () => {
    it('should build LLM judgment payload', () => {
      const formData = {
        name: 'test judgment',
        type: JudgmentType.LLM,
        size: 5,
        tokenLimit: 4000,
        ignoreFailure: false,
        contextFields: ['field1', 'field2'],
      };

      const result = buildJudgmentPayload(
        formData,
        [{ label: 'qs1', value: 'qs1' }],
        [{ label: 'sc1', value: 'sc1' }],
        [{ label: 'model1', value: 'model1' }]
      );

      expect(result).toEqual({
        name: 'test judgment',
        type: JudgmentType.LLM,
        querySetId: 'qs1',
        searchConfigurationList: ['sc1'],
        size: 5,
        modelId: 'model1',
        contextFields: ['field1', 'field2'],
      });
    });

    it('should build UBI judgment payload', () => {
      const formData = {
        name: 'test judgment',
        type: JudgmentType.UBI,
        clickModel: 'coec',
        maxRank: 20,
      };

      const result = buildJudgmentPayload(formData, [], [], []);

      expect(result).toEqual({
        name: 'test judgment',
        type: JudgmentType.UBI,
        clickModel: 'coec',
        maxRank: 20,
      });
    });

    it('should build LLM payload with custom token limit', () => {
      const formData = {
        name: 'test judgment',
        type: JudgmentType.LLM,
        size: 5,
        tokenLimit: 5000,
        ignoreFailure: true,
      };

      const result = buildJudgmentPayload(
        formData,
        [{ label: 'qs1', value: 'qs1' }],
        [{ label: 'sc1', value: 'sc1' }],
        [{ label: 'model1', value: 'model1' }]
      );

      expect(result).toEqual({
        name: 'test judgment',
        type: JudgmentType.LLM,
        querySetId: 'qs1',
        searchConfigurationList: ['sc1'],
        size: 5,
        modelId: 'model1',
        tokenLimit: 5000,
        ignoreFailure: true,
      });
    });
    
    it('should build UBI judgment payload with date range', () => {
      const formData = {
        name: 'test judgment',
        type: JudgmentType.UBI,
        clickModel: 'coec',
        maxRank: 20,
        startDate: '2023-01-01',
        endDate: '2023-12-31',
      };

      const result = buildJudgmentPayload(formData, [], [], []);

      expect(result).toEqual({
        name: 'test judgment',
        type: JudgmentType.UBI,
        clickModel: 'coec',
        maxRank: 20,
        startDate: '2023-01-01',
        endDate: '2023-12-31',
      });
    });

    it('should handle empty selected query set or model', () => {
      const formData = {
        name: 'test judgment',
        type: JudgmentType.LLM,
        size: 5,
        tokenLimit: 4000,
      };

      const result = buildJudgmentPayload(
        formData,
        [],
        [{ label: 'sc1', value: 'sc1' }],
        []
      );

      expect(result).toEqual({
        name: 'test judgment',
        type: JudgmentType.LLM,
        querySetId: undefined,
        searchConfigurationList: ['sc1'],
        size: 5,
        modelId: undefined,
      });
    });

    it('should build LLM payload without optional fields', () => {
      const formData = {
        name: 'test judgment',
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

      expect(result).toEqual({
        name: 'test judgment',
        type: JudgmentType.LLM,
        querySetId: 'qs1',
        searchConfigurationList: ['sc1'],
        size: 5,
        modelId: 'model1',
      });
    
      it('should handle undefined contextFields in LLM payload', () => {
        const formData = {
          name: 'test judgment',
          type: JudgmentType.LLM,
          size: 5,
          tokenLimit: 4000,
          // contextFields intentionally left undefined
        };

        const result = buildJudgmentPayload(
          formData,
          [{ label: 'qs1', value: 'qs1' }],
          [{ label: 'sc1', value: 'sc1' }],
          [{ label: 'model1', value: 'model1' }]
        );

        expect(result).toEqual({
          name: 'test judgment',
          type: JudgmentType.LLM,
          querySetId: 'qs1',
          searchConfigurationList: ['sc1'],
          size: 5,
          modelId: 'model1',
        });
      
        // Explicitly verify contextFields is not present
        expect(result).not.toHaveProperty('contextFields');
      });
    });
  });
});
