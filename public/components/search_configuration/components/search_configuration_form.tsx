/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { memo } from 'react';
import { EuiForm, EuiFormRow, EuiFieldText, EuiComboBox, EuiCodeEditor } from '@elastic/eui';

interface SearchConfigurationFormProps {
  name: string;
  setName: (name: string) => void;
  nameError: string;
  validateName: (e: React.FocusEvent<HTMLInputElement>) => void;
  query: string;
  setQuery: (queryBody: string) => void;
  queryError: string;
  setQueryError: (error: string) => void;
  searchTemplate: string;
  setSearchTemplate: (template: string) => void;
  indexOptions: Array<{ label: string; value: string }>;
  selectedIndex: Array<{ label: string; value: string }>;
  setSelectedIndex: (selected: Array<{ label: string; value: string }>) => void;
  isLoadingIndexes: boolean;
  pipelineOptions: Array<{ label: string }>;
  selectedPipeline: Array<{ label: string }>;
  setSelectedPipeline: (selected: Array<{ label: string }>) => void;
  isLoadingPipelines: boolean;
  disabled?: boolean;
}

export const SearchConfigurationForm: React.FC<SearchConfigurationFormProps> = memo(
  ({
    name,
    setName,
    nameError,
    validateName,
    query,
    setQuery,
    queryError,
    setQueryError,
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
    <EuiForm component="form" isInvalid={Boolean(nameError || queryError)}>
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

      <EuiFormRow label="Index" helpText="Select an index for this search configuration." fullWidth>
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
        label="Query"
        error={queryError}
        isInvalid={Boolean(queryError)}
        helpText="Define the query in JSON format. Use %queryText% to represent the specific query text."
        fullWidth
      >
        <EuiCodeEditor
          height="10em"
          mode="json"
          theme="github"
          width="100%"
          value={query}
          onChange={(value) => {
            if (disabled) return;
            try {
              JSON.parse(value);
              setQuery(value);
              setQueryError('');
            } catch {
              setQuery(value);
            }
          }}
          setOptions={{
            showLineNumbers: true,
            tabSize: 2,
            readOnly: disabled,
          }}
          onBlur={() => {
            if (disabled) return;
            if (!query.trim()) {
              setQueryError('Query is required.');
            } else {
              try {
                JSON.parse(query);
                setQueryError('');
              } catch {
                setQueryError('Query must be valid JSON.');
              }
            }
          }}
          isInvalid={Boolean(queryError)}
          aria-label="Code Editor"
        />
      </EuiFormRow>

      <EuiFormRow
        label={
          <p>
            Search Pipeline <i> - optional </i>
          </p>
        }
        helpText="Define the search pipeline to be used."
        fullWidth
      >
        <EuiComboBox
          placeholder="Select a search pipeline"
          options={pipelineOptions}
          selectedOptions={selectedPipeline}
          onChange={(selected) => {
            setSelectedPipeline(selected);
          }}
          singleSelection={{ asPlainText: true }}
          isLoading={isLoadingPipelines}
          fullWidth
          isDisabled={disabled}
          isClearable={!disabled}
        />
      </EuiFormRow>
    </EuiForm>
  )
);
