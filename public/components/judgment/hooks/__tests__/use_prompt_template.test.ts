/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import { usePromptTemplate } from '../use_prompt_template';
import { JudgmentService } from '../../services/judgment_service';
import { OutputSchema } from '../../types/prompt_template_types';

// Mock the JudgmentService
jest.mock('../../services/judgment_service');

describe('usePromptTemplate', () => {
  let mockHttpClient: any;
  let mockFetchQuerySetById: jest.Mock;

  beforeEach(() => {
    mockHttpClient = {
      post: jest.fn(),
    };
    mockFetchQuerySetById = jest.fn();
    (JudgmentService as jest.Mock).mockImplementation(() => ({
      fetchQuerySetById: mockFetchQuerySetById,
    }));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('initialization', () => {
    it('should initialize with default values', () => {
      const { result } = renderHook(() => usePromptTemplate());

      expect(result.current.outputSchema).toBe(OutputSchema.SCORE_0_1);
      expect(result.current.userInstructions).toBe('');
      expect(result.current.placeholders).toEqual([]);
      expect(result.current.validPlaceholders).toEqual([]);
      expect(result.current.invalidPlaceholders).toEqual([]);
      expect(result.current.availableQuerySetFields).toEqual([]);
    });

    it('should initialize validationModelId with provided modelId', () => {
      const { result } = renderHook(() => usePromptTemplate({ modelId: 'test-model-123' }));

      expect(result.current.validationModelId).toBe('test-model-123');
    });
  });

  describe('querySet field fetching', () => {
    it('should fetch querySet fields when querySetId is provided', async () => {
      const mockQuerySetData = {
        id: 'qs1',
        name: 'Test Query Set',
        querySetQueries: [
          {
            queryText: 'test query',
            category: 'tech',
            referenceAnswer: 'answer',
          },
        ],
      };
      mockFetchQuerySetById.mockResolvedValue(mockQuerySetData);

      const { result } = renderHook(() =>
        usePromptTemplate({
          querySetId: 'qs1',
          httpClient: mockHttpClient,
        })
      );

      await waitFor(() => expect(result.current.availableQuerySetFields.length).toBeGreaterThan(0));

      expect(mockFetchQuerySetById).toHaveBeenCalledWith('qs1');
      expect(result.current.availableQuerySetFields).toEqual([
        'queryText',
        'category',
        'referenceAnswer',
      ]);
    });

    it('should filter out internal fields starting with underscore', async () => {
      const mockQuerySetData = {
        querySetQueries: [
          {
            queryText: 'test',
            _id: 'internal-id',
            _source: 'internal-source',
            category: 'tech',
          },
        ],
      };
      mockFetchQuerySetById.mockResolvedValue(mockQuerySetData);

      const { result } = renderHook(() =>
        usePromptTemplate({
          querySetId: 'qs1',
          httpClient: mockHttpClient,
        })
      );

      await waitFor(() => expect(result.current.availableQuerySetFields).toBeDefined());

      expect(result.current.availableQuerySetFields).toEqual(['queryText', 'category']);
    });

    it('should handle empty querySetQueries', async () => {
      const mockQuerySetData = {
        querySetQueries: [],
      };
      mockFetchQuerySetById.mockResolvedValue(mockQuerySetData);

      const { result } = renderHook(() =>
        usePromptTemplate({
          querySetId: 'qs1',
          httpClient: mockHttpClient,
        })
      );

      await waitFor(() => expect(result.current.availableQuerySetFields).toBeDefined());

      expect(result.current.availableQuerySetFields).toEqual([]);
    });

    it('should handle fetchQuerySetById error', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      mockFetchQuerySetById.mockRejectedValue(new Error('Failed to fetch'));

      const { result } = renderHook(() =>
        usePromptTemplate({
          querySetId: 'qs1',
          httpClient: mockHttpClient,
        })
      );

      await waitFor(() => expect(result.current.availableQuerySetFields).toBeDefined());

      expect(result.current.availableQuerySetFields).toEqual([]);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Failed to fetch querySet fields:',
        expect.any(Error)
      );

      consoleErrorSpy.mockRestore();
    });

    it('should not fetch when querySetId is not provided', () => {
      renderHook(() =>
        usePromptTemplate({
          httpClient: mockHttpClient,
        })
      );

      expect(mockFetchQuerySetById).not.toHaveBeenCalled();
    });

    it('should not fetch when httpClient is not provided', () => {
      renderHook(() =>
        usePromptTemplate({
          querySetId: 'qs1',
        })
      );

      expect(mockFetchQuerySetById).not.toHaveBeenCalled();
    });
  });

  describe('placeholder extraction', () => {
    it('should extract placeholders from user instructions', () => {
      const { result } = renderHook(() => usePromptTemplate());

      act(() => {
        result.current.setUserInstructions('Rate {{queryText}} for {{category}}');
      });

      expect(result.current.placeholders).toEqual(['queryText', 'category']);
    });

    it('should handle multiple occurrences of same placeholder', () => {
      const { result } = renderHook(() => usePromptTemplate());

      act(() => {
        result.current.setUserInstructions('{{query}} is {{query}} and {{query}}');
      });

      expect(result.current.placeholders).toEqual(['query']);
    });

    it('should trim whitespace from placeholders', () => {
      const { result } = renderHook(() => usePromptTemplate());

      act(() => {
        result.current.setUserInstructions('{{ queryText }} and {{  category  }}');
      });

      expect(result.current.placeholders).toEqual(['queryText', 'category']);
    });

    it('should handle no placeholders', () => {
      const { result } = renderHook(() => usePromptTemplate());

      act(() => {
        result.current.setUserInstructions('Rate the relevance without placeholders');
      });

      expect(result.current.placeholders).toEqual([]);
    });
  });

  describe('placeholder validation', () => {
    it('should mark all placeholders as valid when no querySet is selected', () => {
      const { result } = renderHook(() => usePromptTemplate());

      act(() => {
        result.current.setUserInstructions('{{queryText}} {{category}} {{unknown}}');
      });

      expect(result.current.validPlaceholders).toEqual(['queryText', 'category', 'unknown']);
      expect(result.current.invalidPlaceholders).toEqual([]);
    });

    it('should validate placeholders against querySet fields', async () => {
      const mockQuerySetData = {
        querySetQueries: [
          {
            queryText: 'test',
            category: 'tech',
          },
        ],
      };
      mockFetchQuerySetById.mockResolvedValue(mockQuerySetData);

      const { result } = renderHook(() =>
        usePromptTemplate({
          querySetId: 'qs1',
          httpClient: mockHttpClient,
        })
      );

      await waitFor(() => expect(result.current.availableQuerySetFields).toBeDefined());

      expect(result.current.availableQuerySetFields).toEqual(['queryText', 'category']);

      act(() => {
        result.current.setUserInstructions('{{queryText}} {{category}} {{unknown}}');
      });

      expect(result.current.validPlaceholders).toEqual(['queryText', 'category']);
      expect(result.current.invalidPlaceholders).toEqual(['unknown']);
    });

    it('should mark all placeholders as invalid when none match querySet fields', async () => {
      const mockQuerySetData = {
        querySetQueries: [
          {
            field1: 'value1',
            field2: 'value2',
          },
        ],
      };
      mockFetchQuerySetById.mockResolvedValue(mockQuerySetData);

      const { result } = renderHook(() =>
        usePromptTemplate({
          querySetId: 'qs1',
          httpClient: mockHttpClient,
        })
      );

      await waitFor(() => expect(result.current.availableQuerySetFields).toEqual(['field1', 'field2']));

      expect(result.current.availableQuerySetFields).toEqual(['field1', 'field2']);

      act(() => {
        result.current.setUserInstructions('{{queryText}} {{category}}');
      });

      expect(result.current.validPlaceholders).toEqual([]);
      expect(result.current.invalidPlaceholders).toEqual(['queryText', 'category']);
    });
  });

  describe('validatePrompt', () => {
    it('should return error when validationModelId is not set', async () => {
      const { result } = renderHook(() => usePromptTemplate({ httpClient: mockHttpClient }));

      const response = await result.current.validatePrompt({
        placeholderValues: {},
      });

      expect(response.success).toBe(false);
      expect(response.error).toBe('Please select a model for validation');
    });

    it('should return error when httpClient is not available', async () => {
      const { result } = renderHook(() => usePromptTemplate({ modelId: 'model1' }));

      const response = await result.current.validatePrompt({
        placeholderValues: {},
      });

      expect(response.success).toBe(false);
      expect(response.error).toBe('HTTP client not available');
    });

    it('should call API with correct payload for SCORE_0_1 output schema', async () => {
      const mockResponse = {
        success: true,
        rawResponse: 'The model response text',
        fullResponse: { inference_results: [{ output: 'model output' }] },
      };
      mockHttpClient.post.mockResolvedValue(mockResponse);

      const { result } = renderHook(() =>
        usePromptTemplate({ modelId: 'model1', httpClient: mockHttpClient })
      );

      act(() => {
        result.current.setOutputSchema(OutputSchema.SCORE_0_1);
        result.current.setUserInstructions('Rate {{queryText}}');
      });

      const response = await result.current.validatePrompt({
        placeholderValues: { queryText: 'test query' },
      });

      expect(mockHttpClient.post).toHaveBeenCalledWith('/api/relevancy/judgments/validate_prompt', {
        body: expect.stringContaining('"modelId":"model1"'),
      });
      expect(mockHttpClient.post).toHaveBeenCalledWith('/api/relevancy/judgments/validate_prompt', {
        body: expect.stringContaining('"placeholderValues":{"queryText":"test query"}'),
      });

      expect(response.success).toBe(true);
      expect(response.rawResponse).toBe('The model response text');
    });

    it('should use fullResponse when rawResponse is not available', async () => {
      const mockResponse = {
        success: true,
        fullResponse: { inference_results: [{ output: 'full response data' }] },
      };
      mockHttpClient.post.mockResolvedValue(mockResponse);

      const { result } = renderHook(() =>
        usePromptTemplate({ modelId: 'model1', httpClient: mockHttpClient })
      );

      const response = await result.current.validatePrompt({
        placeholderValues: {},
      });

      expect(response.success).toBe(true);
      expect(response.rawResponse).toBe(JSON.stringify(mockResponse.fullResponse, null, 2));
    });

    it('should handle validation failure with no judgment results', async () => {
      mockHttpClient.post.mockResolvedValue({ success: false });

      const { result } = renderHook(() =>
        usePromptTemplate({ modelId: 'model1', httpClient: mockHttpClient })
      );

      const response = await result.current.validatePrompt({
        placeholderValues: {},
      });

      expect(response.success).toBe(false);
      expect(response.error).toBe('No response returned from model');
    });

    it('should handle API error with body.message', async () => {
      mockHttpClient.post.mockRejectedValue({
        body: { message: 'API error message' },
      });

      const { result } = renderHook(() =>
        usePromptTemplate({ modelId: 'model1', httpClient: mockHttpClient })
      );

      const response = await result.current.validatePrompt({
        placeholderValues: {},
      });

      expect(response.success).toBe(false);
      expect(response.error).toBe('API error message');
    });

    it('should handle API error with error.message when no body', async () => {
      mockHttpClient.post.mockRejectedValue({
        message: 'Direct error message',
      });

      const { result } = renderHook(() =>
        usePromptTemplate({ modelId: 'model1', httpClient: mockHttpClient })
      );

      const response = await result.current.validatePrompt({
        placeholderValues: {},
      });

      expect(response.success).toBe(false);
      expect(response.error).toBe('Direct error message');
    });

    it('should handle API error with body.attributes.error string', async () => {
      mockHttpClient.post.mockRejectedValue({
        body: {
          message: 'Main error',
          attributes: { error: 'Detailed error string' },
        },
      });

      const { result } = renderHook(() =>
        usePromptTemplate({ modelId: 'model1', httpClient: mockHttpClient })
      );

      const response = await result.current.validatePrompt({
        placeholderValues: {},
      });

      expect(response.success).toBe(false);
      expect(response.error).toBe('Main error\n\nDetails: Detailed error string');
    });

    it('should handle API error with body.attributes.error.reason', async () => {
      mockHttpClient.post.mockRejectedValue({
        body: {
          message: 'Main error',
          attributes: { error: { reason: 'Error reason' } },
        },
      });

      const { result } = renderHook(() =>
        usePromptTemplate({ modelId: 'model1', httpClient: mockHttpClient })
      );

      const response = await result.current.validatePrompt({
        placeholderValues: {},
      });

      expect(response.success).toBe(false);
      expect(response.error).toBe('Main error\n\nDetails: Error reason');
    });

    it('should handle generic error with message', async () => {
      mockHttpClient.post.mockRejectedValue(new Error('Network error'));

      const { result } = renderHook(() =>
        usePromptTemplate({ modelId: 'model1', httpClient: mockHttpClient })
      );

      const response = await result.current.validatePrompt({
        placeholderValues: {},
      });

      expect(response.success).toBe(false);
      expect(response.error).toBe('Network error');
    });

  });

  describe('buildFullPrompt', () => {
    it('should build prompt with system prompt and user instructions', () => {
      const { result } = renderHook(() => usePromptTemplate());

      act(() => {
        result.current.setUserInstructions('Custom instructions here');
      });

      const fullPrompt = result.current.buildFullPrompt();

      expect(fullPrompt).toContain('Custom instructions here');
      expect(fullPrompt).toContain('You are an expert');
    });

    it('should handle empty user instructions', () => {
      const { result } = renderHook(() => usePromptTemplate());

      act(() => {
        result.current.setUserInstructions('');
      });

      const fullPrompt = result.current.buildFullPrompt();

      expect(fullPrompt).toContain('You are an expert');
      expect(fullPrompt.trim().split('\n').filter((line) => line.trim()).length).toBeGreaterThan(0);
    });
  });

  describe('getPromptTemplate', () => {
    it('should return complete prompt template', () => {
      const { result } = renderHook(() => usePromptTemplate());

      act(() => {
        result.current.setOutputSchema(OutputSchema.SCORE_0_1);
        result.current.setUserInstructions('Rate {{queryText}}');
      });

      const template = result.current.getPromptTemplate();

      expect(template.outputSchema).toBe(OutputSchema.SCORE_0_1);
      expect(template.userInstructions).toBe('Rate {{queryText}}');
      expect(template.placeholders).toEqual(['queryText']);
      expect(template.systemPromptStart).toContain('You are an expert');
      expect(template.systemPromptEnd).toBeTruthy();
    });
  });

  describe('resetToDefaults', () => {
    it('should reset to default values', () => {
      const { result } = renderHook(() => usePromptTemplate());

      act(() => {
        result.current.setOutputSchema(OutputSchema.RELEVANT_IRRELEVANT);
        result.current.setUserInstructions('Custom instructions');
      });

      act(() => {
        result.current.resetToDefaults();
      });

      expect(result.current.outputSchema).toBe(OutputSchema.SCORE_0_1);
      expect(result.current.userInstructions).toBe('');
    });
  });

  describe('modelId synchronization', () => {
    it('should update validationModelId when modelId prop changes', () => {
      const { result, rerender } = renderHook(
        ({ modelId }) => usePromptTemplate({ modelId }),
        {
          initialProps: { modelId: 'model1' },
        }
      );

      expect(result.current.validationModelId).toBe('model1');

      rerender({ modelId: 'model2' });

      expect(result.current.validationModelId).toBe('model2');
    });
  });
});
