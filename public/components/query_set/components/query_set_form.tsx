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
import { EuiTextArea } from '@elastic/eui';

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
    isTextInput,
    setIsTextInput,
    manualQueries,
    setManualQueries,
    parsedQueries,
    setParsedQueries,
    errors,
    validateField,
    handleFileContent,
    parseQueriesText,
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
          <EuiFormRow fullWidth>
            <EuiButton
              onClick={() => setIsTextInput(!isTextInput)}
              size="s"
              iconType={isTextInput ? 'document' : 'editorAlignLeft'}
              data-test-subj="toggleQueryInputMethod"
            >
              Switch to {isTextInput ? 'file upload' : 'simple text input'}
            </EuiButton>
          </EuiFormRow>
          
          {isTextInput ? (
            <EuiFormRow
              label="Enter Queries"
              error={errors.manualQueriesError}
              isInvalid={Boolean(errors.manualQueriesError)}
              helpText="Enter one query per line. Each line will be treated as a separate query."
              fullWidth
            >
              <EuiTextArea
                placeholder={`what is opensearch?\nhow to create a dashboard\nquery language syntax`}
                onChange={(e) => {
                  if (e.target.value.trim()) {
                    parseQueriesText(e.target.value, true);
                  } else {
                    setParsedQueries([]);
                    setManualQueries('');
                  }
                }}
                isInvalid={Boolean(errors.manualQueriesError)}
                fullWidth
                rows={10}
                data-test-subj="manualQueriesTextArea"
              />
            </EuiFormRow>
          ) : (
            <EuiFormRow
              label="Upload Queries"
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
            helpText="Pick the number of queries making up this query set (must be positive)."
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
