/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { renderHook, act } from '@testing-library/react';
import { usePromptTemplate } from '../hooks/use_prompt_template';
import { OutputSchema, DEFAULT_USER_INSTRUCTIONS } from '../types/prompt_template_types';

// Mock JudgmentService
const mockFetchQuerySetById = jest.fn();
jest.mock('../services/judgment_service', () => ({
    JudgmentService: jest.fn(() => ({
        fetchQuerySetById: mockFetchQuerySetById,
    })),
}));

const mockHttpClient = {
    get: jest.fn(),
    post: jest.fn(),
};

describe('usePromptTemplate', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should initialize with default values', () => {
        const { result } = renderHook(() => usePromptTemplate());

        expect(result.current.outputSchema).toBe(OutputSchema.SCORE_0_1);
        expect(result.current.userInstructions).toBe(DEFAULT_USER_INSTRUCTIONS);
        expect(result.current.placeholders).toEqual([]);
        expect(result.current.validPlaceholders).toEqual([]);
        expect(result.current.invalidPlaceholders).toEqual([]);
        expect(result.current.availableQuerySetFields).toEqual([]);
        expect(result.current.validationModelId).toBe('');
    });

    it('should initialize validationModelId from modelId prop', () => {
        const { result } = renderHook(() =>
            usePromptTemplate({ modelId: 'test-model' })
        );

        expect(result.current.validationModelId).toBe('test-model');
    });

    it('should update outputSchema', () => {
        const { result } = renderHook(() => usePromptTemplate());

        act(() => {
            result.current.setOutputSchema(OutputSchema.RELEVANT_IRRELEVANT);
        });

        expect(result.current.outputSchema).toBe(OutputSchema.RELEVANT_IRRELEVANT);
    });

    it('should update userInstructions', () => {
        const { result } = renderHook(() => usePromptTemplate());

        act(() => {
            result.current.setUserInstructions('Custom instructions');
        });

        expect(result.current.userInstructions).toBe('Custom instructions');
    });

    it('should extract placeholders from user instructions', () => {
        const { result } = renderHook(() => usePromptTemplate());

        act(() => {
            result.current.setUserInstructions('Rate {{query}} against {{document}}');
        });

        expect(result.current.placeholders).toContain('query');
        expect(result.current.placeholders).toContain('document');
    });

    it('should handle duplicate placeholders', () => {
        const { result } = renderHook(() => usePromptTemplate());

        act(() => {
            result.current.setUserInstructions('{{query}} and also {{query}}');
        });

        expect(result.current.placeholders).toEqual(['query']);
    });

    it('should handle instructions with no placeholders', () => {
        const { result } = renderHook(() => usePromptTemplate());

        act(() => {
            result.current.setUserInstructions('Just plain text');
        });

        expect(result.current.placeholders).toEqual([]);
    });

    it('should fetch querySet fields when querySetId changes', async () => {
        mockFetchQuerySetById.mockResolvedValue({
            querySetQueries: [{ queryText: 'test', category: 'cat1', _id: '1' }],
        });

        const { result, rerender } = renderHook(
            (props) => usePromptTemplate(props),
            { initialProps: { querySetId: 'qs1', httpClient: mockHttpClient } }
        );

        // Wait for the useEffect to run
        await act(async () => {
            await new Promise((resolve) => setTimeout(resolve, 0));
        });

        expect(result.current.availableQuerySetFields).toEqual(['queryText', 'category']);
    });

    it('should set empty fields when querySetId is empty', async () => {
        const { result } = renderHook(() =>
            usePromptTemplate({ querySetId: '', httpClient: mockHttpClient })
        );

        await act(async () => {
            await new Promise((resolve) => setTimeout(resolve, 0));
        });

        expect(result.current.availableQuerySetFields).toEqual([]);
    });

    it('should set empty fields when httpClient is not available', async () => {
        const { result } = renderHook(() =>
            usePromptTemplate({ querySetId: 'qs1' })
        );

        await act(async () => {
            await new Promise((resolve) => setTimeout(resolve, 0));
        });

        expect(result.current.availableQuerySetFields).toEqual([]);
    });

    it('should handle fetch querySet fields error', async () => {
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => { });
        mockFetchQuerySetById.mockRejectedValue(new Error('Fetch error'));

        renderHook(() =>
            usePromptTemplate({ querySetId: 'qs1', httpClient: mockHttpClient })
        );

        await act(async () => {
            await new Promise((resolve) => setTimeout(resolve, 0));
        });

        expect(consoleSpy).toHaveBeenCalledWith(
            'Failed to fetch querySet fields:',
            expect.any(Error)
        );
        consoleSpy.mockRestore();
    });

    it('should handle empty querySetQueries', async () => {
        mockFetchQuerySetById.mockResolvedValue({
            querySetQueries: [],
        });

        const { result } = renderHook(() =>
            usePromptTemplate({ querySetId: 'qs1', httpClient: mockHttpClient })
        );

        await act(async () => {
            await new Promise((resolve) => setTimeout(resolve, 0));
        });

        expect(result.current.availableQuerySetFields).toEqual([]);
    });

    it('should validate placeholders against querySet fields', async () => {
        mockFetchQuerySetById.mockResolvedValue({
            querySetQueries: [{ queryText: 'test', category: 'cat1', _id: '1' }],
        });

        const { result } = renderHook(() =>
            usePromptTemplate({ querySetId: 'qs1', httpClient: mockHttpClient })
        );

        await act(async () => {
            await new Promise((resolve) => setTimeout(resolve, 0));
        });

        act(() => {
            result.current.setUserInstructions('Rate {{queryText}} and {{badField}}');
        });

        expect(result.current.validPlaceholders).toContain('queryText');
        expect(result.current.invalidPlaceholders).toContain('badField');
    });

    it('should treat all placeholders as valid when no querySet fields available', () => {
        const { result } = renderHook(() => usePromptTemplate());

        act(() => {
            result.current.setUserInstructions('Rate {{anyField}}');
        });

        expect(result.current.validPlaceholders).toContain('anyField');
        expect(result.current.invalidPlaceholders).toEqual([]);
    });

    it('should update validationModelId when modelId prop changes', () => {
        const { result, rerender } = renderHook(
            (props) => usePromptTemplate(props),
            { initialProps: { modelId: 'model1' } }
        );

        expect(result.current.validationModelId).toBe('model1');

        rerender({ modelId: 'model2' });

        expect(result.current.validationModelId).toBe('model2');
    });

    it('should build full prompt with system prompts and user instructions', () => {
        const { result } = renderHook(() => usePromptTemplate());

        act(() => {
            result.current.setUserInstructions('Custom instruction text');
        });

        const prompt = result.current.buildFullPrompt();

        expect(prompt).toContain('Custom instruction text');
        expect(prompt).toContain('expert search relevance rater');
    });

    it('should build full prompt with empty user instructions', () => {
        const { result } = renderHook(() => usePromptTemplate());

        act(() => {
            result.current.setUserInstructions('');
        });

        const prompt = result.current.buildFullPrompt();

        // Should still contain system prompt parts
        expect(prompt).toContain('expert search relevance rater');
    });

    it('should build full prompt for RELEVANT_IRRELEVANT schema', () => {
        const { result } = renderHook(() => usePromptTemplate());

        act(() => {
            result.current.setOutputSchema(OutputSchema.RELEVANT_IRRELEVANT);
            result.current.setUserInstructions('Test');
        });

        const prompt = result.current.buildFullPrompt();

        expect(prompt).toContain('RELEVANT');
        expect(prompt).toContain('IRRELEVANT');
    });

    it('should return prompt template', () => {
        const { result } = renderHook(() => usePromptTemplate());

        const template = result.current.getPromptTemplate();

        expect(template.outputSchema).toBe(OutputSchema.SCORE_0_1);
        expect(template.systemPromptStart).toBeDefined();
        expect(template.systemPromptEnd).toBeDefined();
        expect(template.userInstructions).toBeDefined();
        expect(template.placeholders).toEqual([]);
    });

    it('should reset to defaults', () => {
        const { result } = renderHook(() => usePromptTemplate());

        act(() => {
            result.current.setOutputSchema(OutputSchema.RELEVANT_IRRELEVANT);
            result.current.setUserInstructions('Custom');
        });

        act(() => {
            result.current.resetToDefaults();
        });

        expect(result.current.outputSchema).toBe(OutputSchema.SCORE_0_1);
        expect(result.current.userInstructions).toBe(DEFAULT_USER_INSTRUCTIONS);
    });

    describe('validatePrompt', () => {
        it('should return error when no modelId is set', async () => {
            const { result } = renderHook(() =>
                usePromptTemplate({ httpClient: mockHttpClient })
            );

            const response = await act(async () => {
                return result.current.validatePrompt({ placeholderValues: {} });
            });

            expect(response.success).toBe(false);
            expect(response.error).toBe('Please select a model for validation');
        });

        it('should return error when httpClient is not available', async () => {
            const { result } = renderHook(() =>
                usePromptTemplate({ modelId: 'model1' })
            );

            const response = await act(async () => {
                return result.current.validatePrompt({ placeholderValues: {} });
            });

            expect(response.success).toBe(false);
            expect(response.error).toBe('HTTP client not available');
        });

        it('should handle successful validation', async () => {
            mockHttpClient.post.mockResolvedValue({
                success: true,
                rawResponse: '{"score": 0.85}',
            });

            const { result } = renderHook(() =>
                usePromptTemplate({ modelId: 'model1', httpClient: mockHttpClient })
            );

            const response = await act(async () => {
                return result.current.validatePrompt({
                    placeholderValues: { query: 'test' },
                });
            });

            expect(response.success).toBe(true);
            expect(response.rawResponse).toBe('{"score": 0.85}');
        });

        it('should handle successful validation without rawResponse', async () => {
            mockHttpClient.post.mockResolvedValue({
                success: true,
                fullResponse: { score: 0.85 },
            });

            const { result } = renderHook(() =>
                usePromptTemplate({ modelId: 'model1', httpClient: mockHttpClient })
            );

            const response = await act(async () => {
                return result.current.validatePrompt({
                    placeholderValues: { query: 'test' },
                });
            });

            expect(response.success).toBe(true);
            expect(response.rawResponse).toContain('0.85');
        });

        it('should handle failed validation response', async () => {
            mockHttpClient.post.mockResolvedValue({
                success: false,
            });

            const { result } = renderHook(() =>
                usePromptTemplate({ modelId: 'model1', httpClient: mockHttpClient })
            );

            const response = await act(async () => {
                return result.current.validatePrompt({ placeholderValues: {} });
            });

            expect(response.success).toBe(false);
            expect(response.error).toBe('No response returned from model');
        });

        it('should handle validation error with body.message', async () => {
            const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => { });
            mockHttpClient.post.mockRejectedValue({
                body: { message: 'Model not found' },
            });

            const { result } = renderHook(() =>
                usePromptTemplate({ modelId: 'model1', httpClient: mockHttpClient })
            );

            const response = await act(async () => {
                return result.current.validatePrompt({ placeholderValues: {} });
            });

            expect(response.success).toBe(false);
            expect(response.error).toBe('Model not found');
            consoleSpy.mockRestore();
        });

        it('should handle validation error with error.message', async () => {
            const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => { });
            mockHttpClient.post.mockRejectedValue(new Error('Network error'));

            const { result } = renderHook(() =>
                usePromptTemplate({ modelId: 'model1', httpClient: mockHttpClient })
            );

            const response = await act(async () => {
                return result.current.validatePrompt({ placeholderValues: {} });
            });

            expect(response.success).toBe(false);
            expect(response.error).toBe('Network error');
            consoleSpy.mockRestore();
        });

        it('should handle validation error with attributes.error string', async () => {
            const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => { });
            mockHttpClient.post.mockRejectedValue({
                body: {
                    message: 'Validation failed',
                    attributes: { error: 'Detailed error info' },
                },
            });

            const { result } = renderHook(() =>
                usePromptTemplate({ modelId: 'model1', httpClient: mockHttpClient })
            );

            const response = await act(async () => {
                return result.current.validatePrompt({ placeholderValues: {} });
            });

            expect(response.success).toBe(false);
            expect(response.error).toContain('Validation failed');
            expect(response.error).toContain('Detailed error info');
            consoleSpy.mockRestore();
        });

        it('should handle validation error with attributes.error.reason', async () => {
            const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => { });
            mockHttpClient.post.mockRejectedValue({
                body: {
                    message: 'Validation failed',
                    attributes: { error: { reason: 'Model quota exceeded' } },
                },
            });

            const { result } = renderHook(() =>
                usePromptTemplate({ modelId: 'model1', httpClient: mockHttpClient })
            );

            const response = await act(async () => {
                return result.current.validatePrompt({ placeholderValues: {} });
            });

            expect(response.success).toBe(false);
            expect(response.error).toContain('Model quota exceeded');
            consoleSpy.mockRestore();
        });

        it('should not duplicate error message and details when they are the same', async () => {
            const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => { });
            mockHttpClient.post.mockRejectedValue({
                body: {
                    message: 'Same message',
                    attributes: { error: 'Same message' },
                },
            });

            const { result } = renderHook(() =>
                usePromptTemplate({ modelId: 'model1', httpClient: mockHttpClient })
            );

            const response = await act(async () => {
                return result.current.validatePrompt({ placeholderValues: {} });
            });

            expect(response.success).toBe(false);
            expect(response.error).toBe('Same message');
            // Should not contain "Details:" when error == message
            expect(response.error).not.toContain('Details:');
            consoleSpy.mockRestore();
        });

        it('should handle validation error without body', async () => {
            const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => { });
            mockHttpClient.post.mockRejectedValue({});

            const { result } = renderHook(() =>
                usePromptTemplate({ modelId: 'model1', httpClient: mockHttpClient })
            );

            const response = await act(async () => {
                return result.current.validatePrompt({ placeholderValues: {} });
            });

            expect(response.success).toBe(false);
            expect(response.error).toBe('Validation failed');
            expect(response.rawResponse).toBeUndefined();
            consoleSpy.mockRestore();
        });
    });
});
