/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  EuiButton,
  EuiButtonEmpty,
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

const SAMPLE_NDJSON_URL =
  'https://raw.githubusercontent.com/opensearch-project/dashboards-search-relevance/main/samples/query_set_example_with_references.ndjson';

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

  const downloadSampleNDJSON = async () => {
    try {
      const response = await fetch(SAMPLE_NDJSON_URL);
      const text = await response.text();

      const blob = new Blob([text], {
        type: 'application/x-ndjson',
      });

      const url = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.download = 'queryset-sample.ndjson';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to download sample NDJSON:', err);
    }
  };


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
        <EuiFormRow
          label="Manual Queries"
          error={errors.manualQueriesError}
          isInvalid={Boolean(errors.manualQueriesError)}
          helpText="Upload an NDJSON file with queries (one JSON object per line containing queryText and referenceAnswer). You can also download a sample template."
          fullWidth
        >
          <EuiFlexGroup alignItems="center" gutterSize="s">
            <EuiFlexItem grow={false} style={{ minWidth: 400 }}>
              <EuiFilePicker
                id={filePickerId}
                initialPromptText="Select or drag and drop a query file"
                onChange={(files) => handleFileContent(files)}
                display="large"
                aria-label="Upload query file"
                accept=".ndjson,.json,application/json"
                data-test-subj="manualQueriesFilePicker"
              />
            </EuiFlexItem>

            <EuiFlexItem grow={false}>
              <EuiButtonEmpty
                size="xs"
                iconType="download"
                onClick={downloadSampleNDJSON}
                data-test-subj="downloadSampleNDJSON"
                flush="left"
              >
                Download sample NDJSON
              </EuiButtonEmpty>
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
        </>
      )}
    </EuiForm>
  );
};
