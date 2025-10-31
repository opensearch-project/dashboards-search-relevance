/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Output schema types for LLM judgment prompts
 */
export enum OutputSchema {
  SCORE_1_5 = 'SCORE_1_5',
  SCORE_0_1 = 'SCORE_0_1',
  RELEVANT_IRRELEVANT = 'RELEVANT_IRRELEVANT',
}

/**
 * Display labels for output schema options
 */
export const OUTPUT_SCHEMA_LABELS: Record<OutputSchema, string> = {
  [OutputSchema.SCORE_1_5]: 'Score 1-5',
  [OutputSchema.SCORE_0_1]: 'Score 0-1',
  [OutputSchema.RELEVANT_IRRELEVANT]: 'Relevant/Irrelevant',
};

/**
 * Output format descriptions for each schema type
 */
export const OUTPUT_SCHEMA_DESCRIPTIONS: Record<OutputSchema, string> = {
  [OutputSchema.SCORE_1_5]:
    'Rate relevance on a scale from 1 (not relevant) to 5 (highly relevant)',
  [OutputSchema.SCORE_0_1]: 'Rate relevance as 0 (not relevant) or 1 (relevant)',
  [OutputSchema.RELEVANT_IRRELEVANT]:
    'Classify as either RELEVANT or IRRELEVANT',
};

/**
 * Expected output format instructions for each schema
 */
export const OUTPUT_FORMAT_INSTRUCTIONS: Record<OutputSchema, string> = {
  [OutputSchema.SCORE_1_5]:
    'Output format: Return a JSON object with a "score" field containing an integer from 1 to 5.\nExample: {"score": 4}',
  [OutputSchema.SCORE_0_1]:
    'Output format: Return a JSON object with a "score" field containing either 0 or 1.\nExample: {"score": 1}',
  [OutputSchema.RELEVANT_IRRELEVANT]:
    'Output format: Return a JSON object with a "relevance" field containing either "RELEVANT" or "IRRELEVANT".\nExample: {"relevance": "RELEVANT"}',
};

/**
 * Common end prompt for all output schemas (from backend)
 */
const PROMPT_SEARCH_RELEVANCE_SCORE_END = `
Evaluate based on: exact matches, semantic relevance, and overall context between the SearchText and content in Hits.
When a reference is provided, evaluate based on the relevance to both SearchText and its reference.

IMPORTANT: Provide your response ONLY as a JSON array of objects, each with "id" and "rating_score" fields. You MUST include a rating for EVERY hit provided, even if the rating is 0. Do not include any explanation or additional text.`;

/**
 * System prompts for different output schemas (from backend)
 */
export const SYSTEM_PROMPTS: Record<OutputSchema, { start: string; end: string }> = {
  [OutputSchema.SCORE_1_5]: {
    start: `You are an expert search relevance rater. Your task is to evaluate the relevance between search query and results with these criteria:
- Score 5: Perfect match, highly relevant
- Score 4: Very relevant with minor variations
- Score 3: Moderately relevant
- Score 2: Slightly relevant
- Score 1: Completely irrelevant
`,
    end: PROMPT_SEARCH_RELEVANCE_SCORE_END,
  },
  [OutputSchema.SCORE_0_1]: {
    start: `You are an expert search relevance rater. Your task is to evaluate the relevance between search query and results with these criteria:
- Score 1.0: Perfect match, highly relevant
- Score 0.7-0.9: Very relevant with minor variations
- Score 0.4-0.6: Moderately relevant
- Score 0.1-0.3: Slightly relevant
- Score 0.0: Completely irrelevant
`,
    end: PROMPT_SEARCH_RELEVANCE_SCORE_END,
  },
  [OutputSchema.RELEVANT_IRRELEVANT]: {
    start: `You are an expert search relevance rater. Your task is to evaluate the relevance between search query and results with these criteria:
RELEVANT: Perfect match, highly relevant
IRRELEVANT: Completely irrelevant
`,
    end: PROMPT_SEARCH_RELEVANCE_SCORE_END,
  },
};

/**
 * Default user input instructions
 */
export const DEFAULT_USER_INSTRUCTIONS = '';

/**
 * Prompt template structure
 */
export interface PromptTemplate {
  outputSchema: OutputSchema;
  systemPromptStart: string;
  systemPromptEnd: string;
  userInstructions: string;
  placeholders: string[];
}

/**
 * Validation request for testing prompts
 */
export interface PromptValidationRequest {
  modelId: string;
  promptTemplate: string;
  placeholderValues: Record<string, string>;
}

/**
 * Validation response from LLM
 */
export interface PromptValidationResponse {
  success: boolean;
  output?: any;
  error?: string;
  rawResponse?: string;
}

/**
 * Placeholder metadata from query set
 */
export interface PlaceholderInfo {
  key: string;
  description: string;
  required: boolean;
}
