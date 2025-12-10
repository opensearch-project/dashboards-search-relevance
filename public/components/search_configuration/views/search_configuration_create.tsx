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
  EuiCompressedFormRow,
  EuiSpacer,
} from '@elastic/eui';
import React, { useCallback, useState } from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { CoreStart, NotificationsStart, SavedObject } from '../../../../../../src/core/public';
import { DataSourceManagementPluginSetup } from '../../../../../../src/plugins/data_source_management/public';
import { DataSourceAttributes } from '../../../../../../src/plugins/data_source/common/data_sources';
import { SearchConfigurationForm } from '../components/search_configuration_form';
import { ValidationPanel } from '../components/validation_panel';
import { useSearchConfigurationForm } from '../hooks/use_search_configuration_form';
import semver from 'semver';
import * as pluginManifest from '../../../../opensearch_dashboards.json';

interface SearchConfigurationCreateProps extends RouteComponentProps {
  http: CoreStart['http'];
  notifications: NotificationsStart;
  savedObjects: CoreStart['savedObjects'];
  dataSourceEnabled: boolean;
  dataSourceManagement: DataSourceManagementPluginSetup;
}

export const SearchConfigurationCreate: React.FC<SearchConfigurationCreateProps> = ({
  http,
  notifications,
  history,
  savedObjects,
  dataSourceEnabled,
  dataSourceManagement,
}) => {
  const [selectedDataSource, setSelectedDataSource] = useState<string>('');

  const onSelectedDataSource = useCallback((dataSources) => {
    const dataConnectionId = dataSources[0] ? dataSources[0].id : '';
    setSelectedDataSource(dataConnectionId);
  }, []);

  const dataSourceFilterFn = useCallback((dataSource: SavedObject<DataSourceAttributes>) => {
    const dataSourceVersion = dataSource?.attributes?.dataSourceVersion || '';
    return semver.satisfies(dataSourceVersion, pluginManifest.supportedOSDataSourceVersions);
  }, []);
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
    dataSourceId: selectedDataSource,
  });

  // Handle cancel action
  const handleCancel = useCallback(() => {
    history.push('/searchConfiguration');
  }, [history]);

  let DataSourceSelector;
  if (dataSourceEnabled && dataSourceManagement?.ui?.DataSourceSelector) {
    DataSourceSelector = dataSourceManagement.ui.DataSourceSelector;
  }

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
            {dataSourceEnabled && DataSourceSelector && (
              <>
                <EuiFlexGroup>
                  <EuiFlexItem>
                    <EuiCompressedFormRow fullWidth label="Data Source">
                      <DataSourceSelector
                        compressed={true}
                        savedObjectsClient={savedObjects?.client}
                        notifications={notifications}
                        onSelectedDataSource={onSelectedDataSource}
                        disabled={false}
                        fullWidth={false}
                        removePrepend={true}
                        dataSourceFilter={dataSourceFilterFn}
                      />
                    </EuiCompressedFormRow>
                  </EuiFlexItem>
                </EuiFlexGroup>
                <EuiSpacer size="m" />
              </>
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
