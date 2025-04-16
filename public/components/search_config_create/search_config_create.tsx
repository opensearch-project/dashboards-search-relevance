/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  EuiButton,
  EuiButtonEmpty,
  EuiCodeEditor,
  EuiFieldText,
  EuiFlexGroup,
  EuiFlexItem,
  EuiForm,
  EuiFormRow,
  EuiPageHeader,
  EuiPageTemplate,
  EuiPanel,
  EuiText,
} from '@elastic/eui';
import React, { useCallback, useState } from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { NotificationsStart } from '../../../../../core/public';
import { ServiceEndpoints } from '../../../common';

interface SearchConfigurationCreateProps extends RouteComponentProps {
  http: CoreStart['http'];
  notifications: NotificationsStart;
}

export const SearchConfigurationCreate: React.FC<SearchConfigurationCreateProps> = ({
  http,
  notifications,
  history,
}) => {
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

    http
      .post(ServiceEndpoints.SearchConfigurations, {
        body: JSON.stringify({
          name,
          queryBody,
        }),
      })
      .then((response) => {
        console.log('Response:', response);
        console.log('query_body:', queryBody);
        notifications.toasts.addSuccess(`Search configuration "${name}" created successfully`);
        history.push('/searchConfiguration');
      })
      .catch((err) => {
        notifications.toasts.addError(err, {
          title: 'Failed to create search configuration',
        });
      });
  }, [name, queryBody, searchPipeline, searchTemplate, history, notifications.toasts]);

  // Handle cancel action
  const handleCancel = () => {
    history.push('/searchConfiguration');
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
    <EuiPageTemplate paddingSize="l" restrictWidth="100%">
      <EuiPageHeader
        pageTitle="Create Search Configuration"
        description="Configure a new search configuration with query body and options"
        rightSideItems={[
          <EuiButtonEmpty
            onClick={handleCancel}
            iconType="cross"
            size="s"
            data-test-subj="cancelSearchConfigurationButton"
          >
            Cancel
          </EuiButtonEmpty>,
          <EuiButton
            onClick={createSearchConfiguration}
            fill
            size="s"
            iconType="check"
            data-test-subj="createSearchConfigurationButton"
            color="primary"
          >
            Create Search Configuration
          </EuiButton>,
        ]}
      />
      <EuiPanel hasBorder={true}>
        <EuiFlexItem>
          <EuiForm component="form" isInvalid={Boolean(nameError || queryBodyError)}>
            <EuiFormRow
              label="Search Configuration Name"
              error={nameError}
              isInvalid={Boolean(nameError)}
              helpText="A unique name for this search configuration"
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
              />
            </EuiFormRow>

            <EuiFormRow
              label="Query Body"
              error={queryBodyError}
              isInvalid={Boolean(queryBodyError)}
              helpText="Define the query body in JSON format"
              fullWidth
            >
              <EuiCodeEditor
                mode="json"
                theme="github"
                width="100%"
                value={queryBody}
                onChange={(value) => {
                  try {
                    const parsed = JSON.parse(value);
                    const compactJson = JSON.stringify(parsed);
                    setQueryBody(compactJson);
                    setQueryBodyError('');
                  } catch {
                    // If it's not valid JSON, just set the value as-is
                    setQueryBody(value);
                  }
                }}
                setOptions={{
                  showLineNumbers: true,
                  tabSize: 2,
                }}
                onBlur={() => {
                  if (!queryBody.trim()) {
                    setQueryBodyError('Query Body is required.');
                  } else {
                    try {
                      const parsed = JSON.parse(queryBody);
                      const compactJson = JSON.stringify(parsed);
                      setQueryBody(compactJson); // Update the value to the compact version
                      setQueryBodyError('');
                    } catch {
                      setQueryBodyError('Query Body must be valid JSON.');
                    }
                  }
                }}
                isInvalid={Boolean(queryBodyError)}
                aria-label="Code Editor"
              />
            </EuiFormRow>

            <EuiFormRow
              label="Search Pipeline"
              helpText="Define the search pipeline to be used"
              fullWidth
            >
              <EuiFieldText
                placeholder="Enter search pipeline"
                value={searchPipeline}
                onChange={(e) => setSearchPipeline(e.target.value)}
                fullWidth
              />
            </EuiFormRow>

            <EuiFormRow label="Search Template" helpText="Define the search template" fullWidth>
              <EuiFieldText
                placeholder="Enter search template"
                value={searchTemplate}
                onChange={(e) => setSearchTemplate(e.target.value)}
                fullWidth
              />
            </EuiFormRow>
          </EuiForm>
        </EuiFlexItem>
      </EuiPanel>
    </EuiPageTemplate>
  );
};

export const SearchConfigurationCreateWithRouter = withRouter(SearchConfigurationCreate);
