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
import React, { useCallback, useState } from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { CoreStart, NotificationsStart } from '../../../../../../src/core/public';
import { DataSourceManagementPluginSetup } from '../../../../../../src/plugins/data_source_management/public';
import { SearchConfigurationForm } from '../components/search_configuration_form';
import { ValidationPanel } from '../components/validation_panel';
import { useSearchConfigurationForm } from '../hooks/use_search_configuration_form';
import { DataSourceSelector } from '../../common/datasource_selector';

interface SearchConfigurationCreateProps extends RouteComponentProps {
  http: CoreStart['http'];
  notifications: NotificationsStart;
  savedObjects?: CoreStart['savedObjects'];
  dataSourceEnabled?: boolean;
  dataSourceManagement?: DataSourceManagementPluginSetup;
}

export const SearchConfigurationCreate: React.FC<SearchConfigurationCreateProps> = ({
  http,
  notifications,
  history,
  savedObjects,
  dataSourceEnabled = false,
  dataSourceManagement,
}) => {
  const [selectedDataSource, setSelectedDataSource] = useState<string>('');
  const {
    // Form state
    name,
    setName,
    nameError,
    validateNameField,
    query,
    setQuery,
    queryError,
    setQueryError,
    searchTemplate,
    setSearchTemplate,

    // Index state
    indexOptions,
    selectedIndex,
    setSelectedIndex,
    isLoadingIndexes,

    // Pipeline state
    pipelineOptions,
    selectedPipeline,
    setSelectedPipeline,
    isLoadingPipelines,

    // Validation state
    testSearchText,
    setTestSearchText,
    isValidating,
    searchResults,

    // Actions
    validateSearchQuery,
    createSearchConfiguration,
  } = useSearchConfigurationForm({
    http,
    notifications,
    onSuccess: () => history.push('/searchConfiguration'),
    dataSourceId: selectedDataSource || undefined,
    dataSourceEnabled,
  });

  // Handle cancel action
  const handleCancel = useCallback(() => {
    history.push('/searchConfiguration');
  }, [history]);

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
            {dataSourceEnabled && dataSourceManagement && savedObjects && (
              <DataSourceSelector
                dataSourceEnabled={dataSourceEnabled}
                dataSourceManagement={dataSourceManagement}
                savedObjects={savedObjects}
                selectedDataSource={selectedDataSource}
                setSelectedDataSource={setSelectedDataSource}
              />
            )}
            <SearchConfigurationForm
              name={name}
              setName={setName}
              nameError={nameError}
              validateName={validateNameField}
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
            testSearchText={testSearchText}
            setTestSearchText={setTestSearchText}
            isValidating={isValidating}
            searchResults={searchResults}
            onValidate={validateSearchQuery}
          />
        </EuiFlexItem>
      </EuiFlexGroup>
    </EuiPageTemplate>
  );
};

export const SearchConfigurationCreateWithRouter = withRouter(SearchConfigurationCreate);
