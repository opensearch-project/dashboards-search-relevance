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
} from '@elastic/eui';
import { JudgmentCreateProps, JudgmentType } from '../types';
import { useJudgmentForm } from '../hooks/use_judgment_form';
import { JudgmentPreview } from '../components/judgment_preview';
import { JudgmentForm } from '../components/judgment_form';
import { DataSourceSelector } from '../../common/datasource_selector';

export const JudgmentCreate: React.FC<JudgmentCreateProps> = ({
  http,
  notifications,
  history,
  savedObjects,
  dataSourceEnabled = false,
  dataSourceManagement,
}) => {
  const [selectedDataSource, setSelectedDataSource] = useState<string>('');
  // When multi-data-source is enabled, the OSD DataSourceSelector resolves its
  // default asynchronously. Defer the initial fetch until it reports.
  const [dataSourceInitialized, setDataSourceInitialized] = useState(!dataSourceEnabled);

  const handleDataSourceChange = useCallback((id: string) => {
    setSelectedDataSource(id);
    setDataSourceInitialized(true);
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
    indexOptions,
    isLoadingQuerySets,
    isLoadingSearchConfigs,
    isLoadingModels,
    isLoadingIndexes,
    nameError,
    newContextField,
    setNewContextField,
    addContextField,
    removeContextField,
    validateAndSubmit,
    handleJudgmentFileContent,
    dateRangeError,
    parsedJudgments,
    parseSummary,
  } = useJudgmentForm(
    http,
    notifications,
    selectedDataSource || undefined,
    dataSourceEnabled,
    dataSourceInitialized
  );

  const handleSubmit = useCallback(() => {
    validateAndSubmit(() => {
      history.push('/judgment');
    });
  }, [validateAndSubmit, history]);

  const handleCancel = useCallback(() => {
    history.push('/judgment');
  }, [history]);

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
          {dataSourceEnabled && dataSourceManagement && savedObjects && (
            <DataSourceSelector
              dataSourceEnabled={dataSourceEnabled}
              dataSourceManagement={dataSourceManagement}
              savedObjects={savedObjects}
              selectedDataSource={selectedDataSource}
              setSelectedDataSource={handleDataSourceChange}
            />
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
            indexOptions={indexOptions}
            isLoadingQuerySets={isLoadingQuerySets}
            isLoadingSearchConfigs={isLoadingSearchConfigs}
            isLoadingModels={isLoadingModels}
            isLoadingIndexes={isLoadingIndexes}
            newContextField={newContextField}
            setNewContextField={setNewContextField}
            addContextField={addContextField}
            removeContextField={removeContextField}
            dateRangeError={dateRangeError}
            handleJudgmentFileContent={handleJudgmentFileContent}
            httpClient={http}
          />

          {formData.type === JudgmentType.IMPORT && (
              <JudgmentPreview parsedJudgments={parsedJudgments} parseSummary={parseSummary} />
          )}

        </EuiFlexItem>
      </EuiPanel>
    </EuiPageTemplate>
  );
};

export const JudgmentCreateWithRouter = withRouter(JudgmentCreate);
