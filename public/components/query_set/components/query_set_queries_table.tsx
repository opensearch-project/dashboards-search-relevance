/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { EuiText } from '@elastic/eui';
import { TableListView } from '../../../../../../src/plugins/opensearch_dashboards_react/public';

interface QueryItem {
  queryText: string;
}

interface QuerySetQueriesTableProps {
  queries: QueryItem[];
}

export const QuerySetQueriesTable: React.FC<QuerySetQueriesTableProps> = ({ queries }) => {
  const findQueries = async (searchTerm: string) => {
    if (!Array.isArray(queries)) {
      return {
        total: 0,
        hits: [],
      };
    }

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