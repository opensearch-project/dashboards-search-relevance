/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from 'react';
import { EuiText } from '@elastic/eui';
import { TableListView } from '../../../../../../src/plugins/opensearch_dashboards_react/public';

interface QueryItem {
  queryText: string;
}

interface ParsedQueryItem {
  id: string; // unique key for table
  queryText: string;
  referenceAnswer: string;
  originalText: string; // for filtering
}

interface QuerySetQueriesTableProps {
  queries: QueryItem[];
}

export const QuerySetQueriesTable: React.FC<QuerySetQueriesTableProps> = ({ queries }) => {
  const parsedQueries = useMemo(() => {
    if (!Array.isArray(queries)) return [];

    return queries.map((item, index) => {
      const rawText = item.queryText || '';
      const separatorIndex = rawText.lastIndexOf('#');

      let cleanQuery = rawText;
      let referenceAnswer = '';

      if (separatorIndex !== -1) {
        const potentialJson = rawText.substring(separatorIndex + 1);
        try {
          const metadata = JSON.parse(potentialJson);
          if (metadata && typeof metadata === 'object' && 'referenceAnswer' in metadata) {
            cleanQuery = rawText.substring(0, separatorIndex);
            referenceAnswer = metadata.referenceAnswer || '';
          }
        } catch (e) {
          // If JSON parse fails, check if it looks like a JSON object.
          // If so, try to regex extract the referenceAnswer to be robust against minor formatting issues.
          // This avoids showing raw metadata if JSON.parse fails.
          if (potentialJson.trim().startsWith('{')) {
            const match = potentialJson.match(/"referenceAnswer"\s*:\s*"([^"]*)"/);
            if (match && match[1]) {
              cleanQuery = rawText.substring(0, separatorIndex);
              referenceAnswer = match[1];
            } else {
              // If it looks like JSON but we can't extract the answer, assume it's metadata we should hide.
              cleanQuery = rawText.substring(0, separatorIndex);
              referenceAnswer = '';
            }
          } else {
            // Treat as simple Query#Answer format
            cleanQuery = rawText.substring(0, separatorIndex);
            referenceAnswer = potentialJson;
          }
        }
      }

      return {
        id: `${index}-${cleanQuery}`,
        queryText: cleanQuery,
        referenceAnswer,
        originalText: rawText,
      };
    });
  }, [queries]);

  const findQueries = async (searchTerm: string): Promise<{ total: number; hits: any[] }> => {
    if (!parsedQueries.length) {
      return {
        total: 0,
        hits: [],
      };
    }

    const filteredQueries = searchTerm
      ? parsedQueries.filter((query) =>
        query.queryText.toLowerCase().includes(searchTerm.toLowerCase()) ||
        query.referenceAnswer.toLowerCase().includes(searchTerm.toLowerCase())
      )
      : parsedQueries;

    return {
      total: filteredQueries.length,
      hits: filteredQueries,
    };
  };

  const tableColumns = [
    {
      field: 'queryText',
      name: 'Query',
      sortable: true,
      width: '100%',
      render: (value: string, item: ParsedQueryItem) => {
        if (item.referenceAnswer) {
          return (
            <EuiText size="s">
              {item.queryText}#{item.referenceAnswer}
            </EuiText>
          );
        }
        return <EuiText size="s">{item.queryText}</EuiText>;
      }
    },
  ];

  return (
    <TableListView
      tableListTitle="Queries"
      tableColumns={tableColumns}
      findItems={findQueries}
      entityName="Query"
      entityNamePlural="Queries"
      initialPageSize={10}
      listingLimit={1000}
      initialFilter=""
      headingId="queriesListingHeading"
      // @ts-ignore
      toastNotifications={{}}
      noItemsFragment={
        <EuiText>
          <p>No queries available</p>
        </EuiText>
      }
    />
  );
};
