/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { EuiPageTemplate, EuiPageHeader, EuiPanel, EuiSpacer } from '@elastic/eui';
import { CoreStart } from '../../../../../../src/core/public';
import { useQuerySetView } from '../hooks/use_query_set_view';
import { QuerySetDetails } from '../components/query_set_details';

interface QuerySetViewProps extends RouteComponentProps<{ id: string }> {
  http: CoreStart['http'];
}

export const QuerySetView: React.FC<QuerySetViewProps> = ({ http, id }) => {
  const { querySet, loading, error } = useQuerySetView(http, id);

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
      <EuiPanel hasBorder={true}>
        {querySet && <QuerySetDetails querySet={querySet} />}
      </EuiPanel>
    </EuiPageTemplate>
  );
};

export default QuerySetView;
