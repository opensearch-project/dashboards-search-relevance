/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useCallback, useEffect } from 'react';
import {
  OutputSchema,
  PromptTemplate,
  PromptValidationRequest,
  PromptValidationResponse,
  DEFAULT_USER_INSTRUCTIONS,
  SYSTEM_PROMPTS,
} from '../types/prompt_template_types';

interface UsePromptTemplateProps {
  querySetId?: string;
  modelId?: string;
  httpClient?: any; // OpenSearch Dashboards HTTP client
}

interface UsePromptTemplateReturn {
  // Prompt template state
  outputSchema: OutputSchema;
  setOutputSchema: (schema: OutputSchema) => void;
  userInstructions: string;
  setUserInstructions: (instructions: string) => void;
  placeholders: string[];

  // Validation state
  validationModelId: string;
  setValidationModelId: (modelId: string) => void;

  // Actions
  validatePrompt: (placeholderValues: Record<string, string>) => Promise<PromptValidationResponse>;
  buildFullPrompt: (placeholderValues?: Record<string, string>) => string;
  resetToDefaults: () => void;

  // Computed
  getPromptTemplate: () => PromptTemplate;
}

export const usePromptTemplate = ({
  querySetId,
  modelId,
  httpClient,
}: UsePromptTemplateProps = {}): UsePromptTemplateReturn => {
  // Prompt configuration state
  const [outputSchema, setOutputSchema] = useState<OutputSchema>(OutputSchema.SCORE_0_1);
  const [userInstructions, setUserInstructions] = useState<string>(DEFAULT_USER_INSTRUCTIONS);
  const [placeholders, setPlaceholders] = useState<string[]>([]);

  // Validation state
  const [validationModelId, setValidationModelId] = useState<string>(modelId || '');

  // Extract placeholders from user instructions
  useEffect(() => {
    const extractPlaceholders = (text: string): string[] => {
      // Match {{placeholder}} pattern
      const regex = /\{\{([^}]+)\}\}/g;
      const matches = text.matchAll(regex);
      const found = new Set<string>();

      for (const match of matches) {
        found.add(match[1].trim());
      }

      return Array.from(found);
    };

    const extractedPlaceholders = extractPlaceholders(userInstructions);
    setPlaceholders(extractedPlaceholders);
  }, [userInstructions]);

  // Update validation model when main model changes
  useEffect(() => {
    if (modelId) {
      setValidationModelId(modelId);
    }
  }, [modelId]);

  const buildFullPrompt = useCallback(
    (placeholderValues?: Record<string, string>): string => {
      const systemPrompt = SYSTEM_PROMPTS[outputSchema];
      const parts: string[] = [];

      // Add system prompt start
      parts.push(systemPrompt.start);

      // Add user instructions if provided
      if (userInstructions.trim()) {
        parts.push(userInstructions.trim());
        parts.push('');
      }

      // Add system prompt end
      parts.push(systemPrompt.end);

      return parts.join('\n');
    },
    [outputSchema, userInstructions]
  );

  const validatePrompt = useCallback(
    async (placeholderValues: Record<string, string>): Promise<PromptValidationResponse> => {
      if (!validationModelId) {
        return {
          success: false,
          error: 'Please select a model for validation',
        };
      }

      if (!httpClient) {
        return {
          success: false,
          error: 'HTTP client not available',
        };
      }

      const fullPrompt = buildFullPrompt(placeholderValues);

      try {
        // Call the backend API to validate prompt with ml_predict
        const response = await httpClient.post('/api/relevancy/judgments/validate_prompt', {
          body: JSON.stringify({
            modelId: validationModelId,
            prompt: fullPrompt,
          }),
        });

        // Parse the response from ml_predict
        // The response structure varies by model, but typically contains inference_results
        if (response && response.inference_results && response.inference_results.length > 0) {
          const result = response.inference_results[0];
          const output = result.output || [];

          // Try to extract the actual response text
          const rawResponse = output.length > 0 && output[0].result
            ? output[0].result
            : JSON.stringify(output);

          return {
            success: true,
            output: { response: rawResponse },
            rawResponse: rawResponse,
          };
        } else {
          return {
            success: false,
            error: 'No inference results returned from model',
            rawResponse: JSON.stringify(response),
          };
        }
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Validation failed',
        };
      }
    },
    [validationModelId, httpClient, buildFullPrompt]
  );

  const resetToDefaults = useCallback(() => {
    setOutputSchema(OutputSchema.SCORE_0_1);
    setUserInstructions(DEFAULT_USER_INSTRUCTIONS);
  }, []);

  const getPromptTemplate = useCallback((): PromptTemplate => {
    const systemPrompt = SYSTEM_PROMPTS[outputSchema];
    return {
      outputSchema,
      systemPromptStart: systemPrompt.start,
      systemPromptEnd: systemPrompt.end,
      userInstructions,
      placeholders,
    };
  }, [outputSchema, userInstructions, placeholders]);

  return {
    // State
    outputSchema,
    setOutputSchema,
    userInstructions,
    setUserInstructions,
    placeholders,

    // Validation
    validationModelId,
    setValidationModelId,

    // Actions
    validatePrompt,
    buildFullPrompt,
    resetToDefaults,
    getPromptTemplate,
  };
};
