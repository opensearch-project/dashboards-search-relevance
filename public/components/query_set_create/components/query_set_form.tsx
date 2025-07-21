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
  EuiForm,
  EuiFilePicker,
} from '@elastic/eui';
import { UseQuerySetFormReturn } from '../hooks/use_query_set_form';

interface QuerySetFormProps {
  formState: UseQuerySetFormReturn;
  filePickerId: string;
}

const samplingOptions = [
  { value: 'random', text: 'Random' },
  { value: 'pptss', text: 'Probability-Proportional-to-Size Sampling' },
  { value: 'topn', text: 'Top N' },
];

export const QuerySetForm: React.FC<QuerySetFormProps> = ({ formState, filePickerId }) => {
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
    errors,
    validateField,
    handleFileContent,
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
        helpText="A unique name for this query set."
        fullWidth
      >
        <EuiCompressedTextArea
          placeholder="Enter query set name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onBlur={(e) => validateField('name', e.target.value)}
          isInvalid={errors.nameError.length > 0}
          data-test-subj="querySetNameInput"
          fullWidth
        />
      </EuiCompressedFormRow>

      <EuiCompressedFormRow
        label="Description"
        isInvalid={errors.descriptionError.length > 0}
        error={errors.descriptionError}
        helpText="Detailed description of the query set purpose."
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
        <EuiFormRow
          label="Manual Queries"
          error={errors.manualQueriesError}
          isInvalid={Boolean(errors.manualQueriesError)}
          helpText="Upload an NDJSON file with queries (one JSON object per line containing queryText and referenceAnswer)"
          fullWidth
        >
          <EuiFlexGroup>
            <EuiFlexItem>
              <EuiFilePicker
                id={filePickerId}
                initialPromptText="Select or drag and drop a query file"
                onChange={(files) => handleFileContent(files)}
                display="large"
                aria-label="Upload query file"
                accept=".txt"
                data-test-subj="manualQueriesFilePicker"
                compressed
              />
            </EuiFlexItem>
          </EuiFlexGroup>
        </EuiFormRow>
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
            helpText="Number of queries in the set (must be positive)."
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
        </>
      )}
    </EuiForm>
  );
};
