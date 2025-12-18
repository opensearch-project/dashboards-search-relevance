/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { EuiPageTemplate, EuiPageHeader, EuiPanel, EuiSpacer } from '@elastic/eui';
import { CoreStart } from '../../../../../../src/core/public';
import { DataSourceManagementPluginSetup } from '../../../../../../src/plugins/data_source_management/public';
import { useQuerySetView } from '../hooks/use_query_set_view';
import { QuerySetDetails } from '../components/query_set_details';

interface QuerySetViewProps extends RouteComponentProps<{ id: string }> {
  http: CoreStart['http'];
  savedObjects: CoreStart['savedObjects'];
  dataSourceEnabled: boolean;
  dataSourceManagement: DataSourceManagementPluginSetup;
  dataSourceId?: string | null;
}

export const QuerySetView: React.FC<QuerySetViewProps> = ({ 
  http, 
  id, 
  savedObjects, 
  dataSourceEnabled, 
  dataSourceManagement,
  location,
  match,
  dataSourceId: propDataSourceId
}) => {
  // Use dataSourceId from props (query parameter) directly
  const { querySet, loading, error, refetch } = useQuerySetView(http, id, propDataSourceId || undefined);

  if (loading) {
    return <div>Loading query set data...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <EuiPageTemplate paddingSize="l" restrictWidth="100%">
      <EuiPageHeader
        pageTitle="Query Set Details"
        description="View the details of your query set"
      />
      <EuiSpacer size="l" />
      <EuiPanel hasBorder={true}>{querySet && <QuerySetDetails querySet={querySet} />}</EuiPanel>
    </EuiPageTemplate>
  );
};

export default QuerySetView;
