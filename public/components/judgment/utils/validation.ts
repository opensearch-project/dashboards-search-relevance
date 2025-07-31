/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { JudgmentType, JudgmentFormData, ComboBoxOption } from '../types';

export interface ValidationResult {
  isValid: boolean;
  errors: {
    name?: string;
    querySet?: string;
    searchConfigs?: string;
    model?: string;
  };
}

export const validateJudgmentForm = (
  data: JudgmentFormData,
  selectedQuerySet: ComboBoxOption[],
  selectedSearchConfigs: ComboBoxOption[],
  selectedModel: ComboBoxOption[]
): ValidationResult => {
  const errors: ValidationResult['errors'] = {};
  let isValid = true;

  if (!data.name?.trim()) {
    errors.name = 'Name is a required parameter.';
    isValid = false;
  }

  if (data.type === JudgmentType.LLM) {
    if (selectedQuerySet.length === 0) {
      errors.querySet = 'Please select a query set';
      isValid = false;
    }
    if (selectedSearchConfigs.length === 0) {
      errors.searchConfigs = 'Please select at least one search configuration';
      isValid = false;
    }
    if (selectedModel.length === 0) {
      errors.model = 'Please select a model id';
      isValid = false;
    }
  }

  return { isValid, errors };
};

export const isValidTokenLimit = (value: number): boolean => {
  return value >= 1000 && value <= 500000;
};
