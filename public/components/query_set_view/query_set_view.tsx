/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { CoreStart } from '../../../../../src/core/public';
import { ServiceEndpoints } from '../../../common';
import {
  EuiPageTemplate,
  EuiPageHeader,
  EuiPanel,
  EuiSpacer,
  EuiForm,
  EuiFormRow,
  EuiText,
} from '@elastic/eui';
import {
  TableListView,
} from '../../../../../src/plugins/opensearch_dashboards_react/public';  


interface QuerySetViewProps extends RouteComponentProps<{ id: string }> {
  http: CoreStart['http'];
}

export const QuerySetView: React.FC<QuerySetViewProps> = ({ http, id }) => {
  const [querySet, setQuerySet] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchQuerySet = async () => {
      try {
        setLoading(true);
        const response = await http.get(ServiceEndpoints.QuerySets);
        const list = response ? response.hits.hits.map((hit: any) => ({ ...hit._source })) : [];
        const filteredList = list.filter((item) => item.id === id);

        if (filteredList.length > 0) {
          setQuerySet(filteredList[0]);
        } else {
          setError('No matching query set found');
        }
      } catch (err) {
        setError('Error loading query set data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchQuerySet();
  }, [http, id]);

  const QuerySetQueriesView: React.FC = () => {
    const findQueries = async (search: any) => {
      const queryEntries = Object.entries(querySet.querySetQueries).map(entry => ({query: entry[0], count: entry[1]}))
      const filteredQueryEntries = search ? queryEntries.filter(q => q.query.includes(search)) : queryEntries
      return {hits: filteredQueryEntries, total: filteredQueryEntries.length}
    }

    return (
      <TableListView
        entityName="Query"
        entityNamePlural="Queries"
        tableColumns={[
          {field: 'query', name: 'Query', dataType: 'string', sortable: true},
          {field: 'count', name: 'Count', dataType: 'number', sortable: true},
        ]}
        findItems={findQueries}
        loading={loading}
        pagination={{
          initialPageSize: 10,
          pageSizeOptions: [5, 10, 20, 50],
        }}
        search={{
          box: {
            incremental: true,
            placeholder: 'Query...',
            schema: true,
          },
        }}
      />
    );
  };

  const QuerySetViewPane: React.FC = () => (
    <EuiForm>
      <EuiFormRow
        label="Query Set Name"
        fullWidth
      >
        <EuiText>{querySet.name}</EuiText>
      </EuiFormRow>

      <EuiFormRow
        label="Description"
        fullWidth
      >
        <EuiText>{querySet.description}</EuiText>
      </EuiFormRow>

      <EuiFormRow
        label="Sampling Method"
        fullWidth
      >
        <EuiText>{querySet.sampling}</EuiText>
      </EuiFormRow>

      <EuiSpacer size="l" />

      <EuiFormRow
        label="Queries"
        fullWidth
      >
        <QuerySetQueriesView />
      </EuiFormRow>
    </EuiForm>
  );

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
        <QuerySetViewPane />
      </EuiPanel>
    </EuiPageTemplate>
  );
};

export default QuerySetView;
