/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useCallback, useState } from 'react';
import { withRouter } from 'react-router-dom';
import {
  EuiButton,
  EuiButtonEmpty,
  EuiPageTemplate,
  EuiFlexItem,
  EuiPanel,
  EuiPageHeader,
  EuiFlexGroup,
  EuiCompressedFormRow,
  EuiSpacer,
} from '@elastic/eui';
import { JudgmentCreateProps } from '../types';
import { useJudgmentForm } from '../hooks/use_judgment_form';
import { JudgmentForm } from '../components/judgment_form';
import { CoreStart, SavedObject } from '../../../../../../src/core/public';
import { DataSourceManagementPluginSetup } from '../../../../../../src/plugins/data_source_management/public';
import { DataSourceAttributes } from '../../../../../../src/plugins/data_source/common/data_sources';
import semver from 'semver';
import * as pluginManifest from '../../../../opensearch_dashboards.json';

export const JudgmentCreate: React.FC<JudgmentCreateProps> = ({ 
  http, 
  notifications, 
  history, 
  savedObjects, 
  dataSourceEnabled, 
  dataSourceManagement 
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
    formData,
    updateFormData,
    selectedQuerySet,
    setSelectedQuerySet,
    selectedSearchConfigs,
    setSelectedSearchConfigs,
    selectedModel,
    setSelectedModel,
    querySetOptions,
    searchConfigOptions,
    modelOptions,
    isLoadingQuerySets,
    isLoadingSearchConfigs,
    isLoadingModels,
    nameError,
    newContextField,
    setNewContextField,
    addContextField,
    removeContextField,
    validateAndSubmit,
    dateRangeError,
  } = useJudgmentForm(http, notifications, selectedDataSource);

  const handleSubmit = useCallback(() => {
    validateAndSubmit(() => {
      history.push('/judgment');
    });
  }, [validateAndSubmit, history]);

  const handleCancel = useCallback(() => {
    history.push('/judgment');
  }, [history]);

  let DataSourceSelector;
  if (dataSourceEnabled && dataSourceManagement?.ui?.DataSourceSelector) {
    DataSourceSelector = dataSourceManagement.ui.DataSourceSelector;
  }

  return (
    <EuiPageTemplate paddingSize="l" restrictWidth="100%">
      <EuiPageHeader
        pageTitle="Judgment List"
        description="Configure a new judgment list."
        rightSideItems={[
          <EuiButtonEmpty
            onClick={handleCancel}
            iconType="cross"
            size="s"
            data-test-subj="cancelJudgmentButton"
          >
            Cancel
          </EuiButtonEmpty>,
          <EuiButton
            onClick={handleSubmit}
            fill
            size="s"
            iconType="check"
            data-test-subj="createJudgmentButton"
            color="primary"
          >
            Create Judgment List
          </EuiButton>,
        ]}
      />

      <EuiPanel hasBorder={true}>
        <EuiFlexItem>
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
          <JudgmentForm
            formData={formData}
            updateFormData={updateFormData}
            nameError={nameError}
            selectedQuerySet={selectedQuerySet}
            setSelectedQuerySet={setSelectedQuerySet}
            selectedSearchConfigs={selectedSearchConfigs}
            setSelectedSearchConfigs={setSelectedSearchConfigs}
            selectedModel={selectedModel}
            setSelectedModel={setSelectedModel}
            querySetOptions={querySetOptions}
            searchConfigOptions={searchConfigOptions}
            modelOptions={modelOptions}
            isLoadingQuerySets={isLoadingQuerySets}
            isLoadingSearchConfigs={isLoadingSearchConfigs}
            isLoadingModels={isLoadingModels}
            newContextField={newContextField}
            setNewContextField={setNewContextField}
            addContextField={addContextField}
            removeContextField={removeContextField}
            dateRangeError={dateRangeError}
          />
        </EuiFlexItem>
      </EuiPanel>
    </EuiPageTemplate>
  );
};

export const JudgmentCreateWithRouter = withRouter(JudgmentCreate);
