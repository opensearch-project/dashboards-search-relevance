/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  EuiButton,
  EuiButtonEmpty,
  EuiPageHeader,
  EuiPageTemplate,
  EuiPanel,
  EuiFlexGroup,
  EuiFlexItem,
} from '@elastic/eui';
import React, { useCallback, useEffect, useState } from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { NotificationsStart } from '../../../../../core/public';
import { ServiceEndpoints } from '../../../common';
import { DocumentsIndex } from '../../types';
import { ValidationPanel } from './validation_panel';
import { SearchConfigurationForm } from './search_configuration_form';

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
  const [query, setQuery] = useState('');
  const [queryError, setQueryError] = useState('');
  const [searchTemplate, setSearchTemplate] = useState('');

  const [indexOptions, setIndexOptions] = useState<Array<{ label: string; value: string }>>([]);
  const [selectedIndex, setSelectedIndex] = useState<Array<{ label: string; value: string }>>([]);
  const [isLoadingIndexes, setIsLoadingIndexes] = useState(true);

  const [pipelineOptions, setPipelineOptions] = useState<Array<{ label: string }>>([]);
  const [selectedPipeline, setSelectedPipeline] = useState<Array<{ label: string }>>([]);
  const [isLoadingPipelines, setIsLoadingPipelines] = useState(false);

  useEffect(() => {
    const fetchIndexes = async () => {
      try {
        const res = await http.get(ServiceEndpoints.GetIndexes);
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

    if (!query.trim()) {
      setQueryError('Query is required.');
      isValid = false;
    } else {
      try {
        JSON.parse(query);
        setQueryError('');
      } catch (e) {
        setQueryError('Query Body must be valid JSON.');
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

    if (selectedIndex.length === 0) {
      notifications.toasts.addWarning({
        title: 'Invalid input',
        text: 'No index. Please select an index',
      });
      return;
    }

    http
      .put(ServiceEndpoints.SearchConfigurations, {
        body: JSON.stringify({
          name,
          index: selectedIndex[0].label,
          query,
          searchPipeline: selectedPipeline.length > 0 ? selectedPipeline[0].label : '',
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
  }, [name, query, searchTemplate, history, notifications.toasts, selectedIndex, selectedPipeline]);

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

  const fetchPipelines = async () => {
    setIsLoadingPipelines(true);
    try {
      const response = await http.get(ServiceEndpoints.GetPipelines);
      const options = Object.keys(response).map((pipelineId) => ({
        label: pipelineId,
      }));
      setPipelineOptions(options);
    } catch (error) {
      notifications.toasts.addDanger('Failed to fetch search pipelines');
    } finally {
      setIsLoadingPipelines(false);
    }
  };

  useEffect(() => {
    fetchPipelines();
  }, []);

  return (
    <EuiPageTemplate paddingSize="l" restrictWidth="100%">
      <EuiPageHeader
        pageTitle="Search Configuration"
        description="Configure a new search configuration that represents all the aspects of an algorithm."
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
            <SearchConfigurationForm
              name={name}
              setName={setName}
              nameError={nameError}
              validateName={validateName}
              query={query}
              setQuery={setQuery}
              queryError={queryError}
              setQueryError={setQueryError}
              searchTemplate={searchTemplate}
              setSearchTemplate={setSearchTemplate}
              indexOptions={indexOptions}
              selectedIndex={selectedIndex}
              setSelectedIndex={setSelectedIndex}
              isLoadingIndexes={isLoadingIndexes}
              pipelineOptions={pipelineOptions}
              selectedPipeline={selectedPipeline}
              setSelectedPipeline={setSelectedPipeline}
              isLoadingPipelines={isLoadingPipelines}
            />
          </EuiPanel>
        </EuiFlexItem>
        <EuiFlexItem grow={5} style={{ maxWidth: '41.67%', maxHeight: '80vh', overflow: 'auto' }}>
          <ValidationPanel
            selectedIndex={selectedIndex}
            selectedPipeline={selectedPipeline}
            query={query}
            http={http}
            notifications={notifications}
          />
        </EuiFlexItem>
      </EuiFlexGroup>
    </EuiPageTemplate>
  );
};

export const SearchConfigurationCreateWithRouter = withRouter(SearchConfigurationCreate);
