/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  EuiButton,
  EuiFieldNumber,
  EuiFlexGroup,
  EuiCompressedFormRow,
  EuiCompressedTextArea,
  EuiFlexItem,
  EuiSelect,
  EuiFormRow,
  EuiPanel,
  EuiForm,
  EuiFilePicker,
  EuiComboBox,
  EuiText,
  EuiCodeBlock,
  EuiSpacer,
  EuiButtonEmpty,
} from '@elastic/eui';
import { UseQuerySetFormReturn } from '../hooks/use_query_set_form';

interface QuerySetFormProps {
  formState: UseQuerySetFormReturn;
  filePickerId: string;
  indexOptions: Array<{ label: string; value: string }>;
  isLoadingIndexes: boolean;
  onShowHelp: () => void;
}

const samplingOptions = [
  { value: 'random', text: 'Random' },
  { value: 'pptss', text: 'Probability-Proportional-to-Size Sampling' },
  { value: 'topn', text: 'Top N' },
];

const inputOptions = [
  { value: 'file', text: 'Upload file' },
  { value: 'text', text: 'Text input' },
];

export const QuerySetForm: React.FC<QuerySetFormProps> = ({ formState, filePickerId, indexOptions, isLoadingIndexes, onShowHelp }) => {
  const {
    name,
    setName,
    description,
    setDescription,
    sampling,
    setSampling,
    querySetSize,
    setQuerySetSize,
    isManualInput,
    setIsManualInput,
    ubiQueriesIndex,
    setUbiQueriesIndex,
    errors,
    validateField,
    handleFileContent,
    manualInputMethod,
    setManualInputMethod,
    manualQueryText,
    setManualQueryText,
  } = formState;

  return (
    <EuiForm component="form" isInvalid={Object.values(errors).some((error) => error.length > 0)}>
      <EuiFormRow fullWidth>
        <EuiButton
          onClick={() => setIsManualInput(!isManualInput)}
          size="s"
          iconType={isManualInput ? 'aggregate' : 'inputOutput'}
        >
          Switch to {isManualInput ? 'sampling queries from UBI data' : 'manually adding queries'}
        </EuiButton>
      </EuiFormRow>

      <EuiCompressedFormRow
        label="Name"
        isInvalid={errors.nameError.length > 0}
        error={errors.nameError}
        helpText="Choose an expressive name for this query set (< 50 characters)."
        fullWidth
      >
        <EuiCompressedTextArea
          placeholder="Enter query set name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onBlur={(e) => validateField('name', e.target.value)}
          isInvalid={errors.nameError.length > 0}
          data-test-subj="querySetDescriptionInput"
          fullWidth
        />
      </EuiCompressedFormRow>

      <EuiCompressedFormRow
        label="Description"
        isInvalid={errors.descriptionError.length > 0}
        error={errors.descriptionError}
        helpText="Describe the query set (< 250 characters)."
        fullWidth
      >
        <EuiCompressedTextArea
          placeholder="Describe the purpose of this query set"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          onBlur={(e) => validateField('description', e.target.value)}
          isInvalid={errors.descriptionError.length > 0}
          data-test-subj="querySetDescriptionInput"
          fullWidth
        />
      </EuiCompressedFormRow>

      {isManualInput ? (
        <>
          <EuiFormRow
            label="Input Method"
            helpText="Choose how you want to provide queries."
            fullWidth
          >
            <EuiSelect
              options={inputOptions}
              value={manualInputMethod}
              onChange={(e) => setManualInputMethod(e.target.value as 'file' | 'text')}
              fullWidth
              data-test-subj="inputMethodSelect"
            />
          </EuiFormRow>

          {manualInputMethod === 'file' ? (
            <EuiFormRow
              label="Upload File"
              error={errors.manualQueriesError}
              isInvalid={Boolean(errors.manualQueriesError)}
              helpText="Upload an NDJSON file with queries (one JSON object per line containing queryText and referenceAnswer)"
              labelAppend={
                <EuiText size="xs">
                  <EuiButtonEmpty size="xs" color="primary" onClick={onShowHelp}>
                    Help
                  </EuiButtonEmpty>
                </EuiText>
              }
              fullWidth
            >
              <EuiFlexGroup>
                <EuiFlexItem>
                  <EuiFilePicker
                    id={filePickerId}
                    initialPromptText="Select or drag and drop a query file"
                    onChange={(files) => files && handleFileContent(files)}
                    display="large"
                    aria-label="Upload query file"
                    accept=".txt"
                    data-test-subj="manualQueriesFilePicker"
                    compressed
                    fullWidth
                  />
                </EuiFlexItem>
              </EuiFlexGroup>
            </EuiFormRow>
          ) : (
            <EuiFormRow
              label="Manual Queries"
              error={errors.manualQueriesError}
              isInvalid={Boolean(errors.manualQueriesError)}
              helpText="Enter queries, one per line."
              labelAppend={
                <EuiText size="xs">
                  <EuiButtonEmpty size="xs" color="primary" onClick={onShowHelp}>
                    Help
                  </EuiButtonEmpty>
                </EuiText>
              }
              fullWidth
            >
              <EuiFlexGroup>
                <EuiFlexItem>
                  <EuiCompressedTextArea
                    placeholder="Enter queries, one per line..."
                    value={manualQueryText}
                    onChange={(e) => setManualQueryText(e.target.value)}
                    rows={10}
                    isInvalid={Boolean(errors.manualQueriesError)}
                    fullWidth
                    data-test-subj="manualQueriesTextInput"
                  />
                </EuiFlexItem>
              </EuiFlexGroup>
            </EuiFormRow>
          )}
        </>
      ) : (
        <>
          <EuiFormRow
            label="Sampling Method"
            helpText="Select the sampling method for this query set."
            fullWidth
          >
            <EuiSelect
              options={samplingOptions}
              value={sampling}
              onChange={(e) => setSampling(e.target.value)}
              data-test-subj="querySetSamplingSelect"
              fullWidth
            />
          </EuiFormRow>

          <EuiFormRow
            label="Query Set Size"
            error={errors.querySizeError}
            isInvalid={Boolean(errors.querySizeError)}
            helpText="Pick the amount of queries for this query set (must be positive)."
            fullWidth
          >
            <EuiFieldNumber
              value={querySetSize}
              min={1}
              onChange={(e) => {
                const value = parseInt(e.target.value, 10);
                setQuerySetSize(isNaN(value) ? 0 : value);
              }}
              isInvalid={Boolean(errors.querySizeError)}
              fullWidth
              data-test-subj="querySetSizeInput"
            />
          </EuiFormRow>

          <EuiFormRow
            label="UBI Queries Index (Optional)"
            helpText="Select from UBI queries indexes or type a custom index name and press Enter. Leave empty to use default."
            fullWidth
          >
            <EuiComboBox
              placeholder="Select or type UBI queries index"
              options={indexOptions}
              selectedOptions={ubiQueriesIndex ? [{ label: ubiQueriesIndex, value: ubiQueriesIndex }] : []}
              onChange={(selected) => setUbiQueriesIndex(selected[0]?.label || '')}
              onCreateOption={(searchValue) => {
                const trimmed = searchValue.trim();
                if (trimmed) {
                  setUbiQueriesIndex(trimmed);
                }
              }}
              singleSelection={{ asPlainText: true }}
              isLoading={isLoadingIndexes}
              isClearable={true}
              fullWidth
              customOptionText="Use custom index: {searchValue}"
            />
          </EuiFormRow>

        </>
      )}
    </EuiForm>
  );
};
