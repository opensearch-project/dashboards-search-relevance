/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import {
  EuiPageTemplate,
  EuiPageHeader,
  EuiPanel,
  EuiSpacer,
  EuiForm,
  EuiFormRow,
  EuiText,
} from '@elastic/eui';
import { CoreStart } from '../../../../../src/core/public';
import { ServiceEndpoints } from '../../../common';
import { TableListView } from '../../../../../src/plugins/opensearch_dashboards_react/public';

interface QuerySetViewProps extends RouteComponentProps<{ id: string }> {
  http: CoreStart['http'];
}

interface QueryItem {
  queryText: string;
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
        console.error('Failed to load query set', err);
        setError('Error loading query set data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchQuerySet();
  }, [http, id]);

  const QuerySetQueriesView: React.FC = () => {
    const findQueries = async (searchTerm: string) => {
      if (!querySet?.querySetQueries || !Array.isArray(querySet.querySetQueries)) {
        return {
          total: 0,
          hits: [],
        };
      }

      const queries = querySet.querySetQueries as QueryItem[];
      const filteredQueries = searchTerm
        ? queries.filter((query) =>
            query.queryText.toLowerCase().includes(searchTerm.toLowerCase())
          )
        : queries;
      return {
        total: filteredQueries.length,
        hits: filteredQueries,
      };
    };

    return (
      <TableListView
        tableColumns={[
          {
            field: 'queryText',
            name: 'Query',
            sortable: true,
            width: '100%',
          },
        ]}
        tableProps={{
          itemId: 'queryText',
          noItemsMessage: 'No queries found',
        }}
        findItems={findQueries}
        entityName="Query"
        entityNamePlural="Queries"
        initialPageSize={10}
        listingLimit={1000}
        initialFilter=""
        headingId="queriesListingHeading"
        noItemsFragment={
          <EuiText>
            <p>No queries available</p>
          </EuiText>
        }
      />
    );
  };

  const QuerySetViewPane: React.FC = () => {
    return (
      <EuiForm>
        <EuiFormRow label="Query Set Name" fullWidth>
          <EuiText>{querySet.name}</EuiText>
        </EuiFormRow>

        <EuiFormRow label="Description" fullWidth>
          <EuiText>{querySet.description}</EuiText>
        </EuiFormRow>

        <EuiFormRow label="Sampling Method" fullWidth>
          <EuiText>{querySet.sampling}</EuiText>
        </EuiFormRow>

        <EuiSpacer size="l" />

        <EuiFormRow label="Queries" fullWidth>
          <QuerySetQueriesView />
        </EuiFormRow>
      </EuiForm>
    );
  };

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
