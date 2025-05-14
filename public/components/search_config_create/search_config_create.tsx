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

  const [pipelineOptions, setPipelineOptions] = useState<Array<{ label: string }>>([]);
  const [selectedPipeline, setSelectedPipeline] = useState<Array<{ label: string }>>([]);
  const [isLoadingPipelines, setIsLoadingPipelines] = useState(false);

  const fetchPipelines = async () => {
    setIsLoadingPipelines(true);
    try {
      const response = await http.get(ServiceEndpoints.GetPipelines);
      const options = Object.keys(response).map(pipelineId => ({
        label: pipelineId,
      }));
      setPipelineOptions(options);

      // If there's an existing searchPipeline value, set it as selected
      if (searchPipeline) {
        setSelectedPipeline([{
           label: searchPipeline,
        }]);
      }
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
              queryBody={queryBody}
              setQueryBody={setQueryBody}
              queryBodyError={queryBodyError}
              setQueryBodyError={setQueryBodyError}
              setSearchPipeline={setSearchPipeline}
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
