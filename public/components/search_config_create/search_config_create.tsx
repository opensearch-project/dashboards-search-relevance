/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import {
    EuiFlexGroup,
    EuiFlexItem,
    EuiPage,
    EuiPageBody,
    EuiBottomBar,
    EuiButtonEmpty,
    EuiButton,
    EuiSpacer,
    EuiPanel,
    EuiText,
    EuiCompressedFormRow,
    EuiCompressedSelect,
    EuiCompressedTextArea,
    EuiCompressedFieldText,
    EuiCompressedFieldNumber,
  } from '@elastic/eui';
  import React, { useState, useCallback } from 'react';
  import { RouteComponentProps, withRouter } from 'react-router-dom';
  import { useOpenSearchDashboards } from '../../../../../src/plugins/opensearch_dashboards_react/public';
  import { NotificationsStart } from '../../../../../core/public';
  import { BASE_SEARCH_CONFIGURATION_NODE_API_PATH } from '../../../common';
  import { postSearchConfiguration } from '../../services';


  interface SearchConfigurationCreateProps extends RouteComponentProps {
    http: CoreStart['http'];
    notifications: NotificationsStart;
  }

  export const SearchConfigurationCreate: React.FC<SearchConfigurationCreateProps> = ({
    http,
    notifications,
    history,
  }) => {
    // const {
    //   chrome,
    //   setBreadcrumbs,
    //   notifications: { toasts },
    //   http,
    // } = useOpenSearchDashboards().services;

    // Form state
    const [name, setName] = useState('');
    const [nameError, setNameError] = useState('');
    const [description, setDescription] = useState('');
    const [descriptionError, setDescriptionError] = useState('');
    const [sampling, setSampling] = useState('random');
    const [querySetSize, setQuerySetSize] = useState<number>(10);
    const [querySizeError, setQuerySizeError] = useState('');

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

      // Validate query set size
      if (querySetSize <= 0) {
        setQuerySizeError('Query Set Size must be a positive integer.');
        isValid = false;
      } else {
        setQuerySizeError('');
      }

      return isValid;
    };

    // Handle form submission
    const createSearchConfiguration = useCallback(() => {
      if (!validateForm()) {
        return;
      }

    //   postQuerySet(name, description, sampling, querySetSize, http)
    //     .then(() => {
    //       notifications.toasts.addSuccess(`Query set "${name}" created successfully`);
    //       history.push('/');
    //     })
    //     .catch((err) => {
    //       notifications.toasts.addError(err, {
    //         title: 'Failed to create query set',
    //       });
    //     });

      // API call to create query set
      http.post(BASE_SEARCH_CONFIGURATION_NODE_API_PATH, {
        query: {
          name,
          description,
          sampling: sampling,
          query_set_size: querySetSize
        }
      })
      .then((response) => {
        console.log('Response:', response);
        notifications.toasts.addSuccess(`Query set "${name}" created successfully`);
        history.push('/');
      })
      .catch((err) => {
        notifications.toasts.addError(err, {
          title: 'Failed to create query set',
        });
      });

    //   http.post('/api/query_sets', {
    //     body: JSON.stringify({
    //       name,
    //       description,
    //       sampling_method: sampling,
    //       query_set_size: querySetSize,
    //     }),
    //   })
    //     .then(() => {
    //       notifications.toasts.addSuccess(`Query set "${name}" created successfully`);
    //       history.push('/query_sets');
    //     })
    //     .catch((err) => {
    //       notifications.toasts.addError(err, {
    //         title: 'Failed to create query set',
    //       });
    //     });


    }, [name, description, sampling, querySetSize, history, notifications.toasts]);

    // Handle cancel action
    const handleCancel = () => {
      history.push('/search_configurations');
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
      <EuiPage paddingSize="none">
        <EuiPageBody>
          <EuiPanel>
            <EuiText size="s">
              <h1>Create Search Configuration</h1>
            </EuiText>
            <EuiSpacer size="m" />

            {/* Name field */}
            <EuiCompressedFormRow
              label="Name"
              isInvalid={nameError.length > 0}
              error={nameError}
              helpText="A unique name for this query set"
              fullWidth
            >
              <EuiCompressedFieldText
                placeholder="Enter search configuration name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onBlur={validateName}
                isInvalid={nameError.length > 0}
                data-test-subj="searchConfigurationNameInput"
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
                data-test-subj="searchConfigurationDescriptionInput"
                fullWidth
              />
            </EuiCompressedFormRow>

            {/* Sampling method field */}
            <EuiCompressedFormRow
              label="Sampling Method"
              helpText="Select the sampling method for this query set"
              fullWidth
            >
              <EuiCompressedSelect
                options={samplingOptions}
                value={sampling}
                onChange={(e) => setSampling(e.target.value)}
                data-test-subj="searchConfigurationSamplingSelect"
              />
            </EuiCompressedFormRow>

            {/* Query set size field */}
            <EuiCompressedFormRow
              label="Query Set Size"
              isInvalid={querySizeError.length > 0}
              error={querySizeError}
              helpText="Number of queries in the set (must be positive)"
              fullWidth
            >
              <EuiCompressedFieldNumber
                value={querySetSize}
                min={0}
                onChange={(e) => {
                  const value = parseInt(e.target.value, 10);
                  setQuerySetSize(isNaN(value) ? 0 : value);
                  if (value < 0) {
                    setQuerySizeError('Query Set Size must be a non-negative integer.');
                  } else {
                    setQuerySizeError('');
                  }
                }}
                isInvalid={querySizeError.length > 0}
                data-test-subj="searchConfigurationSizeInput"
              />
            </EuiCompressedFormRow>
          </EuiPanel>

          <EuiSpacer size="xl" />
          <EuiSpacer size="xl" />

          {/* Bottom bar with actions */}
          <EuiBottomBar data-test-subj="searchConfigurationActionsBar">
            <EuiFlexGroup justifyContent="flexEnd">
              <EuiFlexItem grow={false}>
                <EuiButtonEmpty
                  onClick={handleCancel}
                  color="ghost"
                  size="s"
                  iconType="cross"
                  data-test-subj="cancelSearchConfigurationButton"
                >
                  Cancel
                </EuiButtonEmpty>
              </EuiFlexItem>
              <EuiFlexItem grow={false}>
                <EuiButton
                  onClick={createSearchConfiguration}
                  size="s"
                  iconType="check"
                  color="secondary"
                  fill
                  data-test-subj="createSearchConfigurationButton"
                >
                  Create Query Set
                </EuiButton>
              </EuiFlexItem>
            </EuiFlexGroup>
          </EuiBottomBar>
        </EuiPageBody>
      </EuiPage>
    );
  };

  export const SearchConfigurationCreateWithRouter = withRouter(SearchConfigurationCreate);
