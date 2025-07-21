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
  const [isTextInput, setIsTextInput] = useState(false);

  // file picker
  const [files, setFiles] = useState<File[]>([]);
  const filePickerRef = useRef<FilePickerRef>(null);
  const generateId = (prefix: string) => `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
  const filePickerId = generateId('filePicker');
  const [parsedQueries, setParsedQueries] = useState<string[]>([]);

  const isValidInputString = (input: string): boolean => {
      // Regex to detect characters that might break JSON parsing or cause XSS:
      // - Double quotes (")
      // - Backslashes (\)
      // - HTML tags (<, >)
      // - Control characters (U+0000 to U+001F) and other problematic unicode characters
      //   that could interfere with JSON or string parsing.
      // This regex primarily focuses on characters that would require escaping in JSON or are HTML-specific.
      const forbiddenCharsRegex = /[<>"\\\x00-\x1F]/;
      return !forbiddenCharsRegex.test(input);
    };

  const handleFileContent = async (files: FileList) => {
    if (files && files.length > 0) {
      try {
        const file = files[0];
        const text = await file.text();
        parseQueriesText(text, false); // Force JSON parsing for file uploads
        setFiles([file]);
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

  const parseQueriesText = (text: string, isPlainText = isTextInput) => {
    try {
      const lines = text.trim().split('\n');
      const queryList: Array<{ queryText: string; referenceAnswer: string }> = [];

      for (const line of lines) {
        if (!line.trim()) continue;

        try {
          // If it's plain text input, treat each line as a query
          if (isPlainText) {
            queryList.push({
              queryText: line.trim(),
              referenceAnswer: '',
            });
          } else {
            // Try to parse as JSON for file upload mode
            const parsed = JSON.parse(line.trim());
            if (parsed.queryText) {
              queryList.push({
                queryText: String(parsed.queryText).trim(),
                referenceAnswer: parsed.referenceAnswer
                  ? String(parsed.referenceAnswer).trim()
                  : '',
              });
            }
          }
        } catch (e) {
          // For plain text, this shouldn't happen
          // For JSON mode, log the error
          if (!isPlainText) {
            console.error('Error parsing line:', line, e);
          } else {
            // Even if JSON parsing fails, still add it as a plain query
            queryList.push({
              queryText: line.trim(),
              referenceAnswer: '',
            });
          }
        }
      }

      if (queryList.length === 0) {
        const errorMsg = isPlainText ? 'No valid queries found' : 'No valid queries found in file';
        setManualQueriesError(errorMsg);
        if (!isPlainText) setFiles([]);
        setManualQueries('');
        setParsedQueries([]);
        return;
      }

      if (queryList.length > 1000000) {
        setManualQueriesError('Too many queries found (> 1.000.000)');
        if (!isPlainText) setFiles([]);
        setManualQueries('');
        setParsedQueries([]);
        return;
      }

      // Store the raw query objects instead of converting to string
      setManualQueries(JSON.stringify(queryList));
      setParsedQueries(queryList.map((q) => JSON.stringify(q)));
      setManualQueriesError('');
    } catch (error) {
      console.error('Error processing queries:', error);
      setManualQueriesError('Error parsing queries');
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
    } else if (!isValidInputString(name)) {
      setNameError('Name contains invalid characters (e.g., quotes, backslashes, or HTML tags).');
      isValid = false;
    } else {
      setNameError('');
    }

    // Validate description
    if (!description.trim()) {
      setDescriptionError('Description is a required parameter.');
      isValid = false;
    } else if (description.length > 250) {
      setDescriptionError('Description is too long (> 250 characters).');
    } else if (!isValidInputString(description)) {
      setDescriptionError('Description contains invalid characters (e.g., quotes, backslashes, or HTML tags).');
      isValid = false;
    } else {
      setDescriptionError('');
    }

    // Validate based on input mode
    if (isManualInput) {
      if (!manualQueries.trim()) {
        setManualQueriesError('Manual queries are required.');
        isValid = false;
      } else if (isTextInput && parsedQueries.length === 0) {
        setManualQueriesError('No valid queries found. Please check the format.');
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
    } else if (value.length > 50) {
      setNameError('Name is too long (> 50 characters).');
    } else if (!isValidInputString(value)) {
      setNameError('Name contains invalid characters (e.g., quotes, backslashes, or HTML tags).');
    } else {
      setNameError('');
    }
  };

  // Validate description field on blur
  const validateDescription = (e) => {
    const value = e.target.value;
    if (!value.trim()) {
      setDescriptionError('Description is a required parameter.');
    } else if (value.length > 250) {
      setDescriptionError('Description is too long (> 250 characters).');
    } else if (!isValidInputString(value)) {
      setDescriptionError('Description contains invalid characters (e.g., quotes, backslashes, or HTML tags).');
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
                isInvalid={nameError.length > 0}
                data-test-subj="querySetNameInput"
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
                    error={manualQueriesError}
                    isInvalid={Boolean(manualQueriesError)}
                    helpText="Enter one query per line. Each line will be treated as a separate query."
                    fullWidth
                  >
                    <EuiTextArea
                      placeholder={`what is opensearch?\nhow to create a dashboard\nquery language syntax`}
                      onChange={(e) => {
                        setManualQueries(e.target.value);
                        if (e.target.value.trim()) {
                          parseQueriesText(e.target.value, true);
                        } else {
                          setParsedQueries([]);
                        }
                      }}
                      isInvalid={Boolean(manualQueriesError)}
                      fullWidth
                      rows={10}
                      data-test-subj="manualQueriesTextArea"
                    />
                  </EuiFormRow>
                ) : (
                  <EuiFormRow
                    label="Upload Queries"
                    error={manualQueriesError}
                    isInvalid={Boolean(manualQueriesError)}
                    helpText={`Upload an NDJSON file with queries (one JSON object per line). Example: {"queryText": "what is opensearch?", "referenceAnswer": "optional reference"}`}
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
                          helpText={`Each line should be a JSON object with queryText and optionally referenceAnswer. Example: {"queryText": "what is opensearch?"}`}
                        />
                      </EuiFlexItem>
                    </EuiFlexGroup>
                  </EuiFormRow>
                )}
              </>
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
                          {parsed.referenceAnswer && (
                            <>
                              <strong>Reference:</strong> {parsed.referenceAnswer}
                            </>
                          )}
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
