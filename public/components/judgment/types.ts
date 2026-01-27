/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

export enum JudgmentType {
  LLM = 'LLM_JUDGMENT',
  UBI = 'UBI_JUDGMENT',
}

export interface ComboBoxOption {
  label: string;
  value: string;
}

export interface ModelOption extends ComboBoxOption {
  state: string;
  algorithm: string;
}

export interface JudgmentFormData {
  name: string;
  type: JudgmentType;
  // LLM specific
  querySetId?: string;
  searchConfigurationList?: string[];
  size?: number;
  modelId?: string;
  contextFields?: string[];
  tokenLimit?: number;
  ignoreFailure?: boolean;
  promptTemplate?: any; // Prompt template configuration
  // UBI specific
  clickModel?: string;
  maxRank?: number;
  startDate?: string;
  endDate?: string;
  ubiEventsIndex?: string;
}

export interface JudgmentCreateProps {
  http: any;
  notifications: any;
  history: any;
}

// Re-export prompt template types
export * from './types/prompt_template_types';
