/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  EuiCompressedFormRow,
  EuiComboBox,
  EuiFieldNumber,
  EuiSpacer,
  EuiAccordion,
} from '@elastic/eui';
import { AdvancedSettings } from './advanced_settings';

interface LLMJudgmentFieldsProps {
  formData: any;
  updateFormData: (updates: any) => void;
  selectedQuerySet: any[];
  setSelectedQuerySet: (value: any[]) => void;
  selectedSearchConfigs: any[];
  setSelectedSearchConfigs: (value: any[]) => void;
  selectedModel: any[];
  setSelectedModel: (value: any[]) => void;
  querySetOptions: any[];
  searchConfigOptions: any[];
  modelOptions: any[];
  isLoadingQuerySets: boolean;
  isLoadingSearchConfigs: boolean;
  isLoadingModels: boolean;
  newContextField: string;
  setNewContextField: (value: string) => void;
  addContextField: () => void;
  removeContextField: (field: string) => void;
  httpClient?: any;
}

export const LLMJudgmentFields: React.FC<LLMJudgmentFieldsProps> = ({
  formData,
  updateFormData,
  selectedQuerySet,
  setSelectedQuerySet,
  selectedSearchConfigs,
  setSelectedSearchConfigs,
  selectedModel,
  setSelectedModel,
  querySetOptions,
  searchConfigOptions,
  modelOptions,
  isLoadingQuerySets,
  isLoadingSearchConfigs,
  isLoadingModels,
  newContextField,
  setNewContextField,
  addContextField,
  removeContextField,
  httpClient,
}) => {
  const [isAdvancedSettingsOpen, setIsAdvancedSettingsOpen] = useState(false);

  return (
    <>
      <EuiCompressedFormRow label="Query Set" fullWidth>
        <EuiComboBox
          placeholder="Select a query set"
          options={querySetOptions}
          selectedOptions={selectedQuerySet}
          onChange={setSelectedQuerySet}
          singleSelection={{ asPlainText: true }}
          isLoading={isLoadingQuerySets}
          fullWidth
        />
      </EuiCompressedFormRow>

      <EuiCompressedFormRow label="Search Configurations" fullWidth>
        <EuiComboBox
          placeholder="Select configurations"
          options={searchConfigOptions}
          selectedOptions={selectedSearchConfigs}
          onChange={setSelectedSearchConfigs}
          isLoading={isLoadingSearchConfigs}
          fullWidth
        />
      </EuiCompressedFormRow>

      <EuiCompressedFormRow
        label="K Value"
        helpText="The number of documents from the result list to include in the judging process."
        fullWidth
      >
        <EuiFieldNumber
          value={formData.size}
          onChange={(e) => updateFormData({ size: parseInt(e.target.value, 10) })}
          min={1}
          fullWidth
        />
      </EuiCompressedFormRow>

      <EuiCompressedFormRow
        label="Model ID"
        helpText="The ID of the LLM model that is used for the judging process."
        fullWidth
      >
        <EuiComboBox
          placeholder="Select a model"
          options={modelOptions}
          selectedOptions={selectedModel}
          onChange={setSelectedModel}
          singleSelection={{ asPlainText: true }}
          isLoading={isLoadingModels}
          fullWidth
        />
      </EuiCompressedFormRow>

      <EuiSpacer size="m" />
      <EuiAccordion
        id="advancedSettings"
        buttonContent="Advanced Settings"
        paddingSize="m"
        onToggle={setIsAdvancedSettingsOpen}
      >
        <EuiSpacer size="m" />
        <AdvancedSettings
          formData={formData}
          updateFormData={updateFormData}
          newContextField={newContextField}
          setNewContextField={setNewContextField}
          addContextField={addContextField}
          removeContextField={removeContextField}
          modelOptions={modelOptions.map((opt) => ({ label: opt.label, value: opt.value }))}
          httpClient={httpClient}
        />
      </EuiAccordion>
    </>
  );
};
