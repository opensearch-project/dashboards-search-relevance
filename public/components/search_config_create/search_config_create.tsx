/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  EuiButton,
  EuiButtonEmpty,
  EuiCodeEditor,
  EuiFieldText,
  EuiFlexItem,
  EuiForm,
  EuiFormRow,
  EuiPageHeader,
  EuiPageTemplate,
  EuiPanel,
  EuiComboBox,
  EuiFlexGroup,
} from '@elastic/eui';
import React, { useCallback, useEffect, useState } from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { NotificationsStart } from '../../../../../core/public';
import { INDEX_NODE_API_PATH, ServiceEndpoints } from '../../../common';
import { DocumentsIndex } from '../../types';
import { ValidationPanel } from './validation_panel';

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

  const [indexOptions, setIndexOptions] = useState<Array<{ label: string; value: string }>>([]);
  const [selectedIndex, setSelectedIndex] = useState<Array<{ label: string; value: string }>>([]);
  const [isLoadingIndexes, setIsLoadingIndexes] = useState(true);

  useEffect(() => {
    const fetchIndexes = async () => {
      try {
        const res = await http.get(INDEX_NODE_API_PATH);
        const options = res.map((index: DocumentsIndex) => ({
          label: index.index,
          value: index.uuid,
        }));
        setIndexOptions(options);
      } catch (error) {
        console.error('Failed to fetch indexes', error);
        notifications.toasts.addError(error, {
          title: 'Failed to fetch indexes',
        });
        setIndexOptions([]);
      } finally {
        setIsLoadingIndexes(false);
      }
    };

    fetchIndexes();
  }, [http, notifications.toasts]);

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

    console.log("selectedIndex", selectedIndex);
    if (selectedIndex.length === 0) {
      notifications.toasts.addWarning({title: 'Invalid input', text: 'No index. Please select an index'});
      return;
    }

    http
      .put(ServiceEndpoints.SearchConfigurations, {
        body: JSON.stringify({
          name,
          index: selectedIndex[0].label,
          queryBody,
        }),
      })
      .then((response) => {
        notifications.toasts.addSuccess(`Search configuration "${name}" created successfully`);
        history.push('/searchConfiguration');
      })
      .catch((err) => {
        notifications.toasts.addError(err, {
          title: 'Failed to create search configuration',
        });
      });
  }, [name, queryBody, searchPipeline, searchTemplate, history, notifications.toasts, selectedIndex]);

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
        pageTitle="Search Configuration"
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
      <EuiFlexGroup>
        <EuiFlexItem grow={7}>
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
                  label="Index"
                  helpText="Select an index for this search configuration"
                  fullWidth
                >
                  <EuiComboBox
                    placeholder="Select an index"
                    options={indexOptions}
                    selectedOptions={selectedIndex}
                    onChange={(selected) => setSelectedIndex(selected)}
                    isClearable={true}
                    isLoading={isLoadingIndexes}
                    singleSelection={{ asPlainText: true }}
                    fullWidth
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
                        JSON.parse(value);
                        setQueryBody(value);
                        setQueryBodyError('');
                      } catch {
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
                          JSON.parse(queryBody);
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
        </EuiFlexItem>
        <EuiFlexItem grow={5} style={{ maxWidth: '41.67%', maxHeight: '80vh', overflow: 'auto' }}>
          <ValidationPanel
            selectedIndex={selectedIndex}
            queryBody={queryBody}
            http={http}
            notifications={notifications}
          />
        </EuiFlexItem>
      </EuiFlexGroup>
    </EuiPageTemplate>
  );
};

export const SearchConfigurationCreateWithRouter = withRouter(SearchConfigurationCreate);
