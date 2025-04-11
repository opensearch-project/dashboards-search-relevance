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
    const [queryBody, setQueryBody] = useState('');
    const [queryBodyError, setQueryBodyError] = useState('');
    const [searchPipeline, setSearchPipeline] = useState('');
    const [searchTemplate, setSearchTemplate] = useState('');

    // Validate form fields
    const validateForm = () => {
      let isValid = true;

      // Validate name
      if (!name.trim()) {
        setNameError('Search Configuration Name is a required parameter.');
        isValid = false;
      } else {
        setNameError('');
      }

      // TODO: JSON validation for the Query DSL object?
      if (!queryBody.trim()) {
        setQueryBodyError('Query Body is required.');
        isValid = false;
      } else {
        try {
          JSON.parse(queryBody);
          setQueryBodyError('');
        } catch (e) {
          setQueryBodyError('Query Body must be valid JSON.');
          isValid = false;
        }
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
        body: JSON.stringify({
            "search_configuration_name": name,
            "query_body": queryBody,
        //query: {
        //  search_configuration_name: name,
        //  query_body: queryBody,
          //search_pipeline: searchPipeline,
          //search_template: searchTemplate,
        }),
      })
      .then((response) => {
        console.log('Response:', response);
        console.log('query_body:', queryBody);
        notifications.toasts.addSuccess(`Search configuration "${name}" created successfully`);
        history.push('/');
      })
      .catch((err) => {
        notifications.toasts.addError(err, {
          title: 'Failed to create search configuration',
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


    }, [name, queryBody, searchPipeline, searchTemplate, history, notifications.toasts]);

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
              label="Search Configuration Name"
              isInvalid={nameError.length > 0}
              error={nameError}
              helpText="A unique name for this search configuration"
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

            {/* Query Body */}
           <EuiCompressedFormRow
             label="Query Body"
             isInvalid={queryBodyError.length > 0}
             error={queryBodyError}
             helpText="Define the query body in JSON format"
             fullWidth
           >
             <EuiCompressedTextArea
               placeholder="Enter query body"
               value={queryBody}
               onChange={(e) => setQueryBody(e.target.value)}
               onBlur={() => {
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
               isInvalid={queryBodyError.length > 0}
               fullWidth
               rows={8}
             />
           </EuiCompressedFormRow>

            {/* Search Pipeline */}
            <EuiCompressedFormRow
              label="Search Pipeline"
              helpText="Define the search pipeline to be used"
              fullWidth
            >
              <EuiCompressedFieldText
                placeholder="Enter search pipeline"
                value={searchPipeline}
                onChange={(e) => setSearchPipeline(e.target.value)}
                fullWidth
              />
            </EuiCompressedFormRow>

            {/* Search Template */}
            <EuiCompressedFormRow
              label="Search Template"
              helpText="Define the search template"
              fullWidth
            >
              <EuiCompressedFieldText
                placeholder="Enter search template"
                value={searchTemplate}
                onChange={(e) => setSearchTemplate(e.target.value)}
                fullWidth
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
                  Create Search Configuration
                </EuiButton>
              </EuiFlexItem>
            </EuiFlexGroup>
          </EuiBottomBar>
        </EuiPageBody>
      </EuiPage>
    );
  };

  export const SearchConfigurationCreateWithRouter = withRouter(SearchConfigurationCreate);
