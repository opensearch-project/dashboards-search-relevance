/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  EuiForm,
  EuiCompressedFormRow,
  EuiFieldText,
  EuiSelect,
  EuiComboBox,
  EuiFieldNumber,
} from '@elastic/eui';
import { JudgmentType } from '../types';
import { LLMJudgmentFields } from './llm_judgment_fields';
import { UBIJudgmentFields } from './ubi_judgment_fields';
import { ImportedJudgmentFields } from './imported_judgment_fields';


interface JudgmentFormProps {
  formData: any;
  updateFormData: (updates: any) => void;
  nameError: string;
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
  dateRangeError?: string;
  indexOptions: any[];
  isLoadingIndexes: boolean;
  httpClient?: any;
}

export const JudgmentForm: React.FC<JudgmentFormProps> = ({
  formData,
  updateFormData,
  nameError,
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
  dateRangeError,
  handleJudgmentFileContent,
  indexOptions,
  isLoadingIndexes,
  httpClient,
}) => {
  return (
    <EuiForm component="form" isInvalid={Boolean(nameError)}>
      <EuiCompressedFormRow
        label="Name"
        isInvalid={nameError.length > 0}
        error={nameError}
        helpText="A unique name for these judgements."
        fullWidth
      >
        <EuiFieldText
          name="name"
          value={formData.name}
          onChange={(e) => updateFormData({ name: e.target.value })}
          isInvalid={nameError.length > 0}
          fullWidth
        />
      </EuiCompressedFormRow>

      <EuiCompressedFormRow
        label="Type"
        helpText={
          <p>
            There are many types of judgments available. Learn more in{' '}
            <a href="https://opensearch.org/docs/latest/search-plugins/search-relevance/index/">
              Types of Judgments
            </a>
            .
          </p>
        }
        fullWidth
      >
        <EuiSelect
          options={[
            { value: JudgmentType.LLM, text: 'Explicit (LLM Judge)' },
            { value: JudgmentType.UBI, text: 'Implicit (Click based)' },
            { value: JudgmentType.IMPORT, text: 'Explicit (Imported)' },
          ]}
          value={formData.type}
          onChange={(e) => updateFormData({ type: e.target.value as JudgmentType })}
        />
      </EuiCompressedFormRow>

      {formData.type === JudgmentType.LLM ? (
        <LLMJudgmentFields
          formData={formData}
          updateFormData={updateFormData}
          selectedQuerySet={selectedQuerySet}
          setSelectedQuerySet={setSelectedQuerySet}
          selectedSearchConfigs={selectedSearchConfigs}
          setSelectedSearchConfigs={setSelectedSearchConfigs}
          selectedModel={selectedModel}
          setSelectedModel={setSelectedModel}
          querySetOptions={querySetOptions}
          searchConfigOptions={searchConfigOptions}
          modelOptions={modelOptions}
          isLoadingQuerySets={isLoadingQuerySets}
          isLoadingSearchConfigs={isLoadingSearchConfigs}
          isLoadingModels={isLoadingModels}
          newContextField={newContextField}
          setNewContextField={setNewContextField}
          addContextField={addContextField}
          removeContextField={removeContextField}
          httpClient={httpClient}
        />
      ) : formData.type === JudgmentType.IMPORT ? (
         <ImportedJudgmentFields
          handleJudgmentFileContent={handleJudgmentFileContent}
        />
      ) : (
        <UBIJudgmentFields
          formData={formData}
          updateFormData={updateFormData}
          dateRangeError={dateRangeError}
          indexOptions={indexOptions}
          isLoadingIndexes={isLoadingIndexes}
        />
      )}
    </EuiForm>
  );
};
