/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from 'react';
import { EuiText } from '@elastic/eui';
import { TableListView } from '../../../../../../src/plugins/opensearch_dashboards_react/public';

interface StoredQueryItem {
  queryText: string;
  referenceAnswer?: string;
  customFields?: {
    referenceAnswer?: string;
  };
}

export interface DisplayQueryItem {
  id: string;
  queryText: string;
  referenceAnswer: string;
}

interface QuerySetQueriesTableProps {
  queries: StoredQueryItem[];
}

export const getReferenceAnswer = (query: StoredQueryItem): string => {
  const customFieldAnswer = query.customFields?.referenceAnswer;
  if (customFieldAnswer !== undefined && customFieldAnswer !== null) {
    return String(customFieldAnswer);
  }
  if (query.referenceAnswer !== undefined && query.referenceAnswer !== null) {
    return String(query.referenceAnswer);
  }
  return '';
};

export const normalizeQuerySetQueries = (queries: StoredQueryItem[]): DisplayQueryItem[] => {
  return queries.map((query, index) => ({
    id: String(index),
    queryText: query.queryText ?? '',
    referenceAnswer: getReferenceAnswer(query),
  }));
};

export const QuerySetQueriesTable: React.FC<QuerySetQueriesTableProps> = ({ queries }) => {
  const normalizedQueries = useMemo(
    () => (Array.isArray(queries) ? normalizeQuerySetQueries(queries) : []),
    [queries]
  );

  const findQueries = async (searchTerm: string) => {
    const term = searchTerm.toLowerCase();
    const filteredQueries = searchTerm
      ? normalizedQueries.filter(
          (query) =>
            query.queryText.toLowerCase().includes(term) ||
            query.referenceAnswer.toLowerCase().includes(term)
        )
      : normalizedQueries;
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
          width: '50%',
        },
        {
          field: 'referenceAnswer',
          name: 'Reference Answer',
          sortable: true,
          width: '50%',
          render: (referenceAnswer: string) => (
            <EuiText size="s">{referenceAnswer || '—'}</EuiText>
          ),
        },
      ]}
      tableProps={{
        itemId: 'id',
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
