/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

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
import React, { useCallback, useMemo, useState } from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { CoreStart, NotificationsStart, SavedObject } from '../../../../../../core/public';
import { DataSourceManagementPluginSetup } from '../../../../../../src/plugins/data_source_management/public';
import { DataSourceAttributes } from '../../../../../../src/plugins/data_source/common/data_sources';
import { QuerySetService } from '../services/query_set_service';
import { useQuerySetForm } from '../hooks/use_query_set_form';
import { QuerySetForm } from '../components/query_set_form';
import { QueryPreview } from '../components/query_preview';
import semver from 'semver';
import * as pluginManifest from '../../../../opensearch_dashboards.json';

interface QuerySetCreateProps extends RouteComponentProps {
  http: CoreStart['http'];
  notifications: NotificationsStart;
  savedObjects: CoreStart['savedObjects'];
  dataSourceEnabled: boolean;
  dataSourceManagement: DataSourceManagementPluginSetup;
}

export const QuerySetCreate: React.FC<QuerySetCreateProps> = ({ 
  http, 
  notifications, 
  history, 
  savedObjects, 
  dataSourceEnabled, 
  dataSourceManagement 
}) => {
  const formState = useQuerySetForm();
  const querySetService = useMemo(() => new QuerySetService(http), [http]);
  const filePickerId = useMemo(() => `filePicker-${Math.random().toString(36).substr(2, 9)}`, []);
  const [selectedDataSource, setSelectedDataSource] = useState<string>('');

  const onSelectedDataSource = useCallback((dataSources) => {
    const dataConnectionId = dataSources[0] ? dataSources[0].id : '';
    setSelectedDataSource(dataConnectionId);
  }, []);

  const dataSourceFilterFn = useCallback((dataSource: SavedObject<DataSourceAttributes>) => {
    const dataSourceVersion = dataSource?.attributes?.dataSourceVersion || '';
    return semver.satisfies(dataSourceVersion, pluginManifest.supportedOSDataSourceVersions);
  }, []);

  const createQuerySet = useCallback(async () => {
    if (!formState.isFormValid()) {
      return;
    }

    try {
      const querySetData = {
        name: formState.name,
        description: formState.description,
        sampling: formState.sampling,
        querySetSize: formState.querySetSize,
        querySetQueries: formState.manualQueries ? JSON.parse(formState.manualQueries) : undefined,
      };

      await querySetService.createQuerySet(querySetData, formState.isManualInput, selectedDataSource);
      notifications.toasts.addSuccess(`Query set "${formState.name}" created successfully`);
      history.push('/querySet');
    } catch (err) {
      notifications.toasts.addError(err?.body || err, {
        title: 'Failed to create query set',
      });
    }
  }, [formState, querySetService, notifications.toasts, history, selectedDataSource]);

  const handleCancel = useCallback(() => {
    history.push('/querySet');
  }, [history]);

  let DataSourceSelector;
  if (dataSourceEnabled && dataSourceManagement?.ui?.DataSourceSelector) {
    DataSourceSelector = dataSourceManagement.ui.DataSourceSelector;
  }

  return (
    <EuiPageTemplate paddingSize="l" restrictWidth="100%">
      <EuiPageHeader
        pageTitle="Query Set"
        description={
          <span>
            Create a new query set by{' '}
            <a
              href="https://docs.opensearch.org/docs/latest/search-plugins/search-relevance/query-sets/"
              target="_blank"
              rel="noopener noreferrer"
            >
              either sampling from UBI data stored in the ubi_queries index or manually uploading a
              file
            </a>
            .
          </span>
        }
        rightSideItems={[
          <EuiButtonEmpty
            onClick={handleCancel}
            iconType="cross"
            size="s"
            data-test-subj="cancelQuerySetButton"
          >
            Cancel
          </EuiButtonEmpty>,
          <EuiButton
            onClick={createQuerySet}
            fill
            size="s"
            iconType="check"
            data-test-subj="createQuerySetButton"
            color="primary"
          >
            Create Query Set
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
          <QuerySetForm formState={formState} filePickerId={filePickerId} />
          {formState.isManualInput && <QueryPreview parsedQueries={formState.parsedQueries} />}
        </EuiFlexItem>
      </EuiPanel>
    </EuiPageTemplate>
  );
};

export const QuerySetCreateWithRouter = withRouter(QuerySetCreate);
