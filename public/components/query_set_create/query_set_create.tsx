/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  EuiButton,
  EuiButtonEmpty,
  EuiPageTemplate,
  EuiFieldNumber,
  EuiFlexGroup,
  EuiCompressedFormRow,
  EuiCompressedTextArea,
  EuiFlexItem,
  EuiPanel,
  EuiSelect,
  EuiFormRow,
  EuiForm,
  EuiTextArea,
  EuiText,
  EuiFilePicker,
  EuiPageHeader,
} from '@elastic/eui';
import React, { useCallback, useRef, useState } from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { CoreStart, NotificationsStart } from '../../../../../core/public';
import { ServiceEndpoints } from '../../../common';

interface QuerySetCreateProps extends RouteComponentProps {
  http: CoreStart['http'];
  notifications: NotificationsStart;
}

interface FilePickerRef {
  removeFiles: () => void;
}

export const QuerySetCreate: React.FC<QuerySetCreateProps> = ({ http, notifications, history }) => {
  // Form states for ubi sampling
  const [name, setName] = useState('');
  const [nameError, setNameError] = useState('');
  const [description, setDescription] = useState('');
  const [descriptionError, setDescriptionError] = useState('');
  const [sampling, setSampling] = useState('random');
  const [querySetSize, setQuerySetSize] = useState<number>(10);
  const [querySizeError, setQuerySizeError] = useState('');

  // Form states for manual input
  const [isManualInput, setIsManualInput] = useState(false);
  const [manualQueries, setManualQueries] = useState('');
  const [manualQueriesError, setManualQueriesError] = useState('');

  // file picker
  const [files, setFiles] = useState<File[]>([]);
  const filePickerRef = useRef<FilePickerRef>(null);
  const generateId = (prefix: string) => `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
  const filePickerId = generateId('filePicker');
  const [parsedQueries, setParsedQueries] = useState<string[]>([]);

  const handleFileContent = async (files: FileList) => {
    if (files && files.length > 0) {
      try {
        const file = files[0];
        const text = await file.text();
        const lines = text.trim().split('\n');
        const queryList: Array<{ queryText: string; referenceAnswer: string }> = [];

        for (const line of lines) {
          try {
            const parsed = JSON.parse(line.trim());
            if (parsed.queryText) {
              queryList.push({
                queryText: String(parsed.queryText).trim(),
                referenceAnswer: parsed.referenceAnswer
                  ? String(parsed.referenceAnswer).trim()
                  : '',
              });
            }
          } catch (e) {
            console.error('Error parsing line:', line, e);
          }
        }

        if (queryList.length === 0) {
          setManualQueriesError('No valid queries found in file');
          setFiles([]);
          setManualQueries('');
          setParsedQueries([]);
          return;
        }

        if (queryList.length > 1000000) {
          setManualQueriesError('Too many queries found (> 1.000.000)');
          setFiles([]);
          setManualQueries('');
          setParsedQueries([]);
          return;
        }

        // Store the raw query objects instead of converting to string
        setManualQueries(JSON.stringify(queryList));
        setParsedQueries(queryList.map((q) => JSON.stringify(q)));
        setFiles([file]);
        setManualQueriesError('');
      } catch (error) {
        console.error('Error processing file:', error);
        setManualQueriesError('Error reading file content');
        setFiles([]);
        setManualQueries('');
        setParsedQueries([]);
      }
    } else {
      setFiles([]);
      setManualQueries('');
      setParsedQueries([]);
    }
  };

  const samplingOptions = [
    { value: 'random', text: 'Random' },
    { value: 'pptss', text: 'Probability-Proportional-to-Size Sampling' },
    { value: 'topn', text: 'Top N' },
  ];

  // Validate form fields
  const validateForm = () => {
    let isValid = true;

    // Validate name
    if (!name.trim()) {
      setNameError('Name is a required parameter.');
      isValid = false;
    } else if (name.length > 50) {
      setNameError('Name is too long (> 50 characters).');
    } else {
      setNameError('');
    }

    // Validate description
    if (!description.trim()) {
      setDescriptionError('Description is a required parameter.');
      isValid = false;
    } else if (description.length > 250) {
      setDescriptionError('Description is too long (> 250 characters).');
    } else {
      setDescriptionError('');
    }

    // Validate based on input mode
    if (isManualInput) {
      if (!manualQueries.trim()) {
        setManualQueriesError('Manual queries are required.');
        isValid = false;
      } else {
        setManualQueriesError('');
      }
    } else {
      if (querySetSize <= 0) {
        setQuerySizeError('Query Set Size must be a positive integer.');
        isValid = false;
      } else {
        setQuerySizeError('');
      }
    }

    return isValid;
  };

  // Handle form submission
  const createQuerySet = useCallback(() => {
    if (!validateForm()) {
      return;
    }

    const endpoint = ServiceEndpoints.QuerySets;
    const method = isManualInput ? 'put' : 'post';

    const body = isManualInput
      ? {
          name,
          description,
          sampling: 'manual',
          querySetQueries: JSON.parse(manualQueries),
        }
      : {
          name,
          description,
          sampling,
          querySetSize,
        };

    http[method](endpoint, {
      body: JSON.stringify(body),
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then((response) => {
        notifications.toasts.addSuccess(`Query set "${name}" created successfully`);
        history.push('/querySet');
      })
      .catch((err) => {
        notifications.toasts.addError(err, {
          title: 'Failed to create query set',
        });
      });
  }, [
    name,
    description,
    sampling,
    querySetSize,
    manualQueries,
    isManualInput,
    history,
    notifications.toasts,
  ]);

  // Handle cancel action
  const handleCancel = () => {
    history.push('/querySet');
  };

  // Validate name field on blur
  const validateName = (e) => {
    const value = e.target.value;
    if (!value.trim()) {
      setNameError('Name is a required parameter.');
    } else {
      setNameError('');
    }
  };

  // Validate description field on blur
  const validateDescription = (e) => {
    const value = e.target.value;
    if (!value.trim()) {
      setDescriptionError('Description is a required parameter.');
    } else {
      setDescriptionError('');
    }
  };

  return (
    <EuiPageTemplate paddingSize="l" restrictWidth="100%">
      <EuiPageHeader
        pageTitle="Query Set"
        description={
                <span>
                  Create a new query set by{' '}
                  <a href="https://docs.opensearch.org/docs/latest/search-plugins/search-relevance/query-sets/" target="_blank" rel="noopener noreferrer">
                    either sampling from UBI data stored in the ubi_queries index or manually uploading a file
                  </a>
                  .
                </span>
              }
        rightSideItems={[
          <EuiButtonEmpty
            onClick={handleCancel}
            iconType="cross"
            size="s"
            data-test-subj="cancelQuerySetButton"
          >
            Cancel
          </EuiButtonEmpty>,
          <EuiButton
            onClick={createQuerySet}
            fill
            size="s"
            iconType="check"
            data-test-subj="createQuerySetButton"
            color="primary"
          >
            Create Query Set
          </EuiButton>,
        ]}
      />

      {/* Form Content */}
      <EuiPanel hasBorder={true}>
        <EuiFlexItem>
          <EuiForm
            component="form"
            isInvalid={Boolean(
              nameError || descriptionError || querySizeError || manualQueriesError
            )}
          >
            <EuiFormRow fullWidth>
              <EuiButton
                onClick={() => setIsManualInput(!isManualInput)}
                size="s"
                iconType={isManualInput ? 'aggregate' : 'inputOutput'}
              >
                Switch to{' '}
                {isManualInput ? 'sampling queries from UBI data' : 'manually adding queries'}
              </EuiButton>
            </EuiFormRow>
            {/* Name field */}
            <EuiCompressedFormRow
              label="Name"
              isInvalid={nameError.length > 0}
              error={nameError}
              helpText="A unique name for this query set."
              fullWidth
            >
              <EuiCompressedTextArea
                placeholder="Enter query set name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onBlur={validateName}
                isInvalid={descriptionError.length > 0}
                data-test-subj="querySetDescriptionInput"
                fullWidth
              />
            </EuiCompressedFormRow>
            {/* Description field */}
            <EuiCompressedFormRow
              label="Description"
              isInvalid={descriptionError.length > 0}
              error={descriptionError}
              helpText="Detailed description of the query set purpose."
              fullWidth
            >
              <EuiCompressedTextArea
                placeholder="Describe the purpose of this query set"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                onBlur={validateDescription}
                isInvalid={descriptionError.length > 0}
                data-test-subj="querySetDescriptionInput"
                fullWidth
              />
            </EuiCompressedFormRow>
            {isManualInput ? (
              <EuiFormRow
                label="Manual Queries"
                error={manualQueriesError}
                isInvalid={Boolean(manualQueriesError)}
                helpText="Upload an NDJSON file with queries (one JSON object per line containing queryText and referenceAnswer)"
                fullWidth
              >
                <EuiFlexGroup>
                  <EuiFlexItem>
                    <EuiFilePicker
                      ref={filePickerRef}
                      id={filePickerId}
                      initialPromptText="Select or drag and drop a query file"
                      onChange={(files) => handleFileContent(files)}
                      display="large"
                      aria-label="Upload query file"
                      accept=".txt"
                      data-test-subj="manualQueriesFilePicker"
                      compressed
                      helpText="Upload a text file containing JSON objects (one per line) with queryText and referenceAnswer fields"
                    />
                  </EuiFlexItem>
                </EuiFlexGroup>
              </EuiFormRow>
            ) : (
              <>
                {/* Sampling method field */}
                <EuiFormRow
                  label="Sampling Method"
                  helpText={
                    <span>
                    Select the sampling method for this query set. Requires ubi_queries index and query events adhering to the{' '}
                    <a href="https://docs.opensearch.org/docs/latest/search-plugins/ubi/schemas/#ubi-queries-index" target="_blank" rel="noopener noreferrer">
                      UBI schema
                    </a>
                    .<br />
                    "Random" picks a random sample, "Probability-Proportional-to-Size Sampling" picks a frequency-weighted sample, "Top N" picks the N most frequent queries.
                    </span>
                    }
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

                {/* Query set size field */}
                <EuiFormRow
                  label="Query Set Size"
                  error={querySizeError}
                  isInvalid={Boolean(querySizeError)}
                  helpText="Number of queries in the set (must be positive)."
                  fullWidth
                >
                  <EuiFieldNumber
                    value={querySetSize}
                    min={1}
                    onChange={(e) => {
                      const value = parseInt(e.target.value, 10);
                      setQuerySetSize(isNaN(value) ? 0 : value);
                      setQuerySizeError(value < 1 ? 'Query Set Size must be positive.' : '');
                    }}
                    isInvalid={Boolean(querySizeError)}
                    fullWidth
                    data-test-subj="querySetSizeInput"
                  />
                </EuiFormRow>
              </>
            )}
          </EuiForm>
          {isManualInput && parsedQueries.length > 0 && (
            <EuiFormRow fullWidth label="Parsed Queries Preview">
              <EuiPanel paddingSize="s">
                <EuiText size="s">
                  <h4>Preview ({parsedQueries.length} queries)</h4>
                  <ul>
                    {parsedQueries.slice(0, 5).map((query, idx) => {
                      const parsed = JSON.parse(query);
                      return (
                        <li key={idx}>
                          <strong>Query:</strong> {parsed.queryText}
                          <br />
                          <strong>Reference:</strong> {parsed.referenceAnswer}
                        </li>
                      );
                    })}
                  </ul>
                  {parsedQueries.length > 5 && (
                    <p>... and {parsedQueries.length - 5} more queries</p>
                  )}
                </EuiText>
              </EuiPanel>
            </EuiFormRow>
          )}
        </EuiFlexItem>
      </EuiPanel>
    </EuiPageTemplate>
  );
};

export const QuerySetCreateWithRouter = withRouter(QuerySetCreate);
