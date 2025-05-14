/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  EuiForm,
  EuiFormRow,
  EuiFieldText,
  EuiComboBox,
  EuiCodeEditor,
} from '@elastic/eui';

interface SearchConfigurationFormProps {
  name: string;
  setName: (name: string) => void;
  nameError: string;
  validateName: (e: React.FocusEvent<HTMLInputElement>) => void;
  queryBody: string;
  setQueryBody: (queryBody: string) => void;
  queryBodyError: string;
  setQueryBodyError: (error: string) => void;
  searchPipeline: string;
  setSearchPipeline: (pipeline: string) => void;
  searchTemplate: string;
  setSearchTemplate: (template: string) => void;
  indexOptions: Array<{ label: string; value: string }>;
  selectedIndex: Array<{ label: string; value: string }>;
  setSelectedIndex: (selected: Array<{ label: string; value: string }>) => void;
  isLoadingIndexes: boolean;
  disabled?: boolean;
  pipelineOptions: Array<{ label: string }>;
  selectedPipeline: Array<{ label: string }>;
  setSelectedPipeline: (selected: Array<{ label: string }>) => void;
  isLoadingPipelines: boolean;
}

export const SearchConfigurationForm: React.FC<SearchConfigurationFormProps> = ({
  name,
  setName,
  nameError,
  validateName,
  queryBody,
  setQueryBody,
  queryBodyError,
  setQueryBodyError,
  setSearchPipeline,
  searchTemplate,
  setSearchTemplate,
  indexOptions,
  selectedIndex,
  setSelectedIndex,
  isLoadingIndexes,
  pipelineOptions,
  selectedPipeline,
  setSelectedPipeline,
  isLoadingPipelines,
  disabled = false,
}) => (
  <EuiForm component="form" isInvalid={Boolean(nameError || queryBodyError)}>
    <EuiFormRow
      label="Search Configuration Name"
      error={nameError}
      isInvalid={Boolean(nameError)}
      helpText="A unique name for this search configuration."
      fullWidth
    >
      <EuiFieldText
        placeholder="Enter search configuration name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        onBlur={validateName}
        isInvalid={Boolean(nameError)}
        fullWidth
        data-test-subj="searchConfigurationNameInput"
        disabled={disabled}
      />
    </EuiFormRow>

    <EuiFormRow
      label="Index"
      helpText="Select an index for this search configuration."
      fullWidth
    >
      <EuiComboBox
        placeholder="Select an index"
        options={indexOptions}
        selectedOptions={selectedIndex}
        onChange={(selected) => setSelectedIndex(selected)}
        isClearable={!disabled}
        isLoading={isLoadingIndexes}
        singleSelection={{ asPlainText: true }}
        fullWidth
        isDisabled={disabled}
      />
    </EuiFormRow>

    <EuiFormRow
      label="Query Body"
      error={queryBodyError}
      isInvalid={Boolean(queryBodyError)}
      helpText="Define the query body in JSON format.  Use %SearchText% to represent the specific query text."
      fullWidth
    >
      <EuiCodeEditor
        height="10em"
        mode="json"
        theme="github"
        width="100%"
        value={queryBody}
        onChange={(value) => {
          if (disabled) return;
          try {
            JSON.parse(value);
            setQueryBody(value);
            setQueryBodyError('');
          } catch {
            setQueryBody(value);
          }
        }}
        setOptions={{
          showLineNumbers: true,
          tabSize: 2,
          readOnly: disabled,
        }}
        onBlur={() => {
          if (disabled) return;
          if (!queryBody.trim()) {
            setQueryBodyError('Query Body is required.');
          } else {
            try {
              JSON.parse(queryBody);
              setQueryBodyError('');
            } catch {
              setQueryBodyError('Query Body must be valid JSON.');
            }
          }
        }}
        isInvalid={Boolean(queryBodyError)}
        aria-label="Code Editor"
      />
    </EuiFormRow>

    <EuiFormRow label="Search Pipeline" helpText="Define the search pipeline to be used." fullWidth>
      <EuiComboBox
        placeholder="Select a search pipeline"
        options={pipelineOptions}
        selectedOptions={selectedPipeline}
        onChange={(selected) => {
          setSelectedPipeline(selected);
          setSearchPipeline(selected[0]?.label || '');
        }}
        singleSelection={{ asPlainText: true }}
        isLoading={isLoadingPipelines}
        fullWidth
        isDisabled={disabled}
        isClearable={!disabled}
      />
    </EuiFormRow>

    <EuiFormRow label="Search Template" helpText="Define the search template." fullWidth>
      <EuiFieldText
        placeholder="Enter search template"
        value={searchTemplate}
        onChange={(e) => setSearchTemplate(e.target.value)}
        fullWidth
        disabled={disabled}
      />
    </EuiFormRow>
  </EuiForm>
);
