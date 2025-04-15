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
  EuiPageHeader,
} from '@elastic/eui';
import React, { useCallback, useState } from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { NotificationsStart } from '../../../../../core/public';
import { ServiceEndpoints } from '../../../common';

interface QuerySetCreateProps extends RouteComponentProps {
  http: CoreStart['http'];
  notifications: NotificationsStart;
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

  const samplingOptions = [
    { value: 'random', text: 'Random' },
    { value: 'ppts', text: 'Probability-Proportional-to-Size Sampling' },
    { value: 'topn', text: 'Top N' },
  ];

  // Validate form fields
  const validateForm = () => {
    let isValid = true;

    // Validate name
    if (!name.trim()) {
      setNameError('Name is a required parameter.');
      isValid = false;
    } else {
      setNameError('');
    }

    // Validate description
    if (!description.trim()) {
      setDescriptionError('Description is a required parameter.');
      isValid = false;
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
          querySetQueries: manualQueries,
        }
      : {
          name,
          description,
          sampling,
          querySetSize,
        };

    http[method](endpoint, {
      body: JSON.stringify(body),
    })
      .then((response) => {
        console.log('Response:', response);
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
    <EuiPageTemplate paddingSize="l" restrictWidth="90%">
      <EuiPageHeader
        pageTitle="Query Set"
        description="Configure a new query set with sampling method and size"
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

      <EuiPanel hasBorder paddingSize="l">
        <EuiFlexGroup direction="column" gutterSize="m">
          <EuiFlexItem>
            <EuiText size="s" color="subdued">
              <p>Fill in the details below to create a new query set.</p>
            </EuiText>
          </EuiFlexItem>

          {/* Form Content */}
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
                  Switch to {isManualInput ? 'UBI Sampling' : 'Manual'} Input
                </EuiButton>
              </EuiFormRow>
              {/* Name field */}
              <EuiCompressedFormRow
                label="Name"
                isInvalid={nameError.length > 0}
                error={nameError}
                helpText="A unique name for this query set"
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
                helpText="Detailed description of the query set purpose"
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
                  helpText="Enter queries separaarated by commas (e.g., 'apple, banana, orange')"
                  fullWidth
                >
                  <EuiTextArea
                    placeholder="Enter queries separated by commas"
                    value={manualQueries}
                    onChange={(e) => setManualQueries(e.target.value)}
                    isInvalid={Boolean(manualQueriesError)}
                    fullWidth
                    rows={6}
                    data-test-subj="manualQueriesInput"
                  />
                </EuiFormRow>
              ) : (
                <>
                  {/* Sampling method field */}
                  <EuiFormRow
                    label="Sampling Method"
                    helpText="Select the sampling method for this query set"
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
                    helpText="Number of queries in the set (must be positive)"
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
          </EuiFlexItem>
        </EuiFlexGroup>
      </EuiPanel>
    </EuiPageTemplate>
  );
};

export const QuerySetCreateWithRouter = withRouter(QuerySetCreate);
