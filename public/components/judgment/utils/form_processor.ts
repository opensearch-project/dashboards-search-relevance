/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { JudgmentType, JudgmentFormData, ComboBoxOption } from '../types';

export const buildJudgmentPayload = (
  formData: JudgmentFormData,
  selectedQuerySet: ComboBoxOption[],
  selectedSearchConfigs: ComboBoxOption[],
  selectedModel: ComboBoxOption[]
): JudgmentFormData => {
  const basePayload = {
    name: formData.name.trim(),
    type: formData.type,
  };

  if (formData.type === JudgmentType.LLM) {
    return {
      ...basePayload,
      querySetId: selectedQuerySet[0]?.value,
      searchConfigurationList: selectedSearchConfigs.map((config) => config.value),
      size: formData.size,
      modelId: selectedModel[0]?.value,
      ...(formData.contextFields?.length && { contextFields: formData.contextFields }),
      ...(formData.tokenLimit !== 4000 && { tokenLimit: formData.tokenLimit }),
      ...(formData.ignoreFailure && { ignoreFailure: formData.ignoreFailure }),
    };
  }

  return {
    ...basePayload,
    clickModel: formData.clickModel,
    maxRank: formData.maxRank,
    startDate: formData.startDate,
    endDate: formData.endDate,
    ...(formData.ubiEventsIndex && { ubiEventsIndex: formData.ubiEventsIndex }),
  };
};
