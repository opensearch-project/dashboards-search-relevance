/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useCallback } from 'react';
import { EuiFlexGroup, EuiFlexItem, EuiCompressedFormRow, EuiSpacer } from '@elastic/eui';
import { CoreStart } from '../../../../../src/core/public';
import { DataSourceManagementPluginSetup } from '../../../../../src/plugins/data_source_management/public';
import { useOpenSearchDashboards } from '../../../../../src/plugins/opensearch_dashboards_react/public';
import { useDataSourceFilter } from './datasource_utils';

interface DataSourceSelectorProps {
  dataSourceEnabled: boolean;
  dataSourceManagement: DataSourceManagementPluginSetup;
  savedObjects: CoreStart['savedObjects'];
  selectedDataSource: string;
  setSelectedDataSource: (id: string) => void;
  label?: string;
  compressed?: boolean;
  onChange?: () => void;
  notifications?: any;
  disabled?: boolean;
  fullWidth?: boolean;
  removePrepend?: boolean;
}

export const DataSourceSelector: React.FC<DataSourceSelectorProps> = ({
  dataSourceEnabled,
  dataSourceManagement,
  savedObjects,
  selectedDataSource,
  setSelectedDataSource,
  label = "Data source",
  compressed = true,
  onChange,
  notifications,
  disabled = false,
  fullWidth = false,
  removePrepend = true
}) => {
  const { services } = useOpenSearchDashboards();
  const onSelectedDataSource = useCallback((dataSources) => {
    const dataConnectionId = dataSources[0] ? dataSources[0].id : '';
    setSelectedDataSource(dataConnectionId);
    onChange?.();
  }, [setSelectedDataSource, onChange]);
  const dataSourceFilter = useDataSourceFilter();

  if (!dataSourceEnabled || !dataSourceManagement?.ui?.DataSourceSelector) {
    return null;
  }

  const FormRow = compressed ? EuiCompressedFormRow : EuiCompressedFormRow;

  return (
    <>
    <EuiSpacer size="m" />
      <EuiFlexGroup>
        <EuiFlexItem grow={false} style={{ minWidth: '300px' }}>
          <FormRow fullWidth label={label}>
            <dataSourceManagement.ui.DataSourceSelector
              compressed={compressed}
              savedObjectsClient={savedObjects?.client}
              notifications={notifications || services.notifications}
              onSelectedDataSource={onSelectedDataSource}
              disabled={disabled}
              fullWidth={fullWidth}
              removePrepend={removePrepend}
              dataSourceFilter={dataSourceFilter}
            />
          </FormRow>
        </EuiFlexItem>
      </EuiFlexGroup>
    </>
  );
};
