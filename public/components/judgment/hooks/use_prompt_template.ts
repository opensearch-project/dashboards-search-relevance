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
import { JudgmentService } from '../services/judgment_service';

interface UsePromptTemplateProps {
  querySetId?: string;
  modelId?: string;
  httpClient?: any; // OpenSearch Dashboards HTTP client
}

interface ValidatePromptParams {
  placeholderValues: Record<string, string>;
  searchConfigurationList: string[];
  contextFields: string[];
  size?: number;
  tokenLimit?: number;
  ignoreFailure?: boolean;
}

interface UsePromptTemplateReturn {
  // Prompt template state
  outputSchema: OutputSchema;
  setOutputSchema: (schema: OutputSchema) => void;
  userInstructions: string;
  setUserInstructions: (instructions: string) => void;
  placeholders: string[];
  validPlaceholders: string[];
  invalidPlaceholders: string[];
  availableQuerySetFields: string[];

  // Validation state
  validationModelId: string;
  setValidationModelId: (modelId: string) => void;

  // Actions
  validatePrompt: (params: ValidatePromptParams) => Promise<PromptValidationResponse>;
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
  const [availableQuerySetFields, setAvailableQuerySetFields] = useState<string[]>([]);
  const [validPlaceholders, setValidPlaceholders] = useState<string[]>([]);
  const [invalidPlaceholders, setInvalidPlaceholders] = useState<string[]>([]);

  // Validation state
  const [validationModelId, setValidationModelId] = useState<string>(modelId || '');

  // Fetch querySet fields when querySetId changes
  useEffect(() => {
    const fetchQuerySetFields = async () => {
      if (!querySetId || !httpClient) {
        setAvailableQuerySetFields([]);
        return;
      }

      try {
        const service = new JudgmentService(httpClient);
        const querySetData = await service.fetchQuerySetById(querySetId);

        // Extract field names from the first query in querySetQueries
        if (querySetData && querySetData.querySetQueries && querySetData.querySetQueries.length > 0) {
          const firstQuery = querySetData.querySetQueries[0];
          // Get all field names except internal ones
          const fields = Object.keys(firstQuery).filter(key => !key.startsWith('_'));
          setAvailableQuerySetFields(fields);
        } else {
          setAvailableQuerySetFields([]);
        }
      } catch (error) {
        console.error('Failed to fetch querySet fields:', error);
        setAvailableQuerySetFields([]);
      }
    };

    fetchQuerySetFields();
  }, [querySetId, httpClient]);

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

  // Validate placeholders against querySet fields
  useEffect(() => {
    if (availableQuerySetFields.length === 0) {
      // If no querySet is selected, all placeholders are valid
      setValidPlaceholders(placeholders);
      setInvalidPlaceholders([]);
    } else {
      const valid: string[] = [];
      const invalid: string[] = [];

      placeholders.forEach(placeholder => {
        if (availableQuerySetFields.includes(placeholder)) {
          valid.push(placeholder);
        } else {
          invalid.push(placeholder);
        }
      });

      setValidPlaceholders(valid);
      setInvalidPlaceholders(invalid);
    }
  }, [placeholders, availableQuerySetFields]);

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

  const validatePrompt = useCallback(
    async ({
      placeholderValues,
      searchConfigurationList,
      contextFields,
      size = 5,
      tokenLimit = 4000,
      ignoreFailure = false,
    }: ValidatePromptParams): Promise<PromptValidationResponse> => {
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

      if (!searchConfigurationList || searchConfigurationList.length === 0) {
        return {
          success: false,
          error: 'Please select at least one search configuration',
        };
      }

      // Convert OutputSchema to backend llmJudgmentRatingType format
      const llmJudgmentRatingType = outputSchema === OutputSchema.SCORE_0_1
        ? 'SCORE0_1'
        : 'RELEVANT_IRRELEVANT';

      // Backend expects promptTemplate as a string (just the user instructions)
      const promptTemplate = userInstructions;

      const requestBody = {
        modelId: validationModelId,
        promptTemplate,
        placeholderValues,
        searchConfigurationList,
        contextFields,
        size,
        tokenLimit,
        ignoreFailure,
        llmJudgmentRatingType,
      };

      console.log('Validation request:', requestBody);

      try {
        // Call the backend API to validate prompt by creating a temporary judgment
        const response = await httpClient.post('/api/relevancy/judgments/validate_prompt', {
          body: JSON.stringify(requestBody),
        });

        // Parse the response from judgment API
        if (response && response.success) {
          return {
            success: true,
            output: response.judgmentResult,
            rawResponse: JSON.stringify(response.ratings, null, 2),
          };
        } else {
          return {
            success: false,
            error: 'No judgment results returned',
            rawResponse: JSON.stringify(response),
          };
        }
      } catch (error: any) {
        console.error('Validation error:', error);

        // Extract detailed error message
        let errorMessage = 'Validation failed';
        let errorDetails = '';

        if (error?.body?.message) {
          errorMessage = error.body.message;
        } else if (error?.message) {
          errorMessage = error.message;
        }

        // Try to get additional error details
        if (error?.body?.attributes?.error) {
          if (typeof error.body.attributes.error === 'string') {
            errorDetails = error.body.attributes.error;
          } else if (error.body.attributes.error?.reason) {
            errorDetails = error.body.attributes.error.reason;
          }
        }

        // Combine error message and details
        const fullError = errorDetails && errorDetails !== errorMessage
          ? `${errorMessage}\n\nDetails: ${errorDetails}`
          : errorMessage;

        return {
          success: false,
          error: fullError,
          rawResponse: error?.body ? JSON.stringify(error.body, null, 2) : undefined,
        };
      }
    },
    [validationModelId, httpClient, outputSchema, getPromptTemplate]
  );

  const resetToDefaults = useCallback(() => {
    setOutputSchema(OutputSchema.SCORE_0_1);
    setUserInstructions(DEFAULT_USER_INSTRUCTIONS);
  }, []);

  return {
    // State
    outputSchema,
    setOutputSchema,
    userInstructions,
    setUserInstructions,
    placeholders,
    validPlaceholders,
    invalidPlaceholders,
    availableQuerySetFields,

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
