/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { RouteComponentProps } from 'react-router-dom';
import React, { useMemo, useState } from 'react';
import {
  EuiForm,
  EuiFormRow,
  EuiPageHeader,
  EuiPageTemplate,
  EuiPanel,
  EuiSpacer,
  EuiText,
  EuiFieldSearch,
  EuiBasicTable,
} from '@elastic/eui';
import { CoreStart } from '../../../../../../src/core/public';
import { useJudgmentView } from '../hooks/use_judgment_view';

interface JudgmentViewProps extends RouteComponentProps<{ id: string }> {
  http: CoreStart['http'];
}

/**
 * Table component for Judgment Ratings
 * Converts:
 * [
 *   { query, ratings:[{docId, rating}, ...] }
 * ]
 * into flat rows usable by EuiBasicTable
 */
const JudgmentRatingsTable = ({ ratings }: { ratings: any[] }) => {
  const [search, setSearch] = useState('');
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [sortField, setSortField] = useState<'query' | 'docId' | 'rating'>(
    'query'
  );
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Flatten JSON → table rows
  const flattened = useMemo(() => {
    if (!Array.isArray(ratings)) return [];
    return ratings.flatMap(item =>
      (item.ratings || []).map(r => ({
        query: item.query,
        docId: r.docId,
        rating: Number(r.rating),
      }))
    );
  }, [ratings]);

  // Filtering
  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return flattened.filter(row =>
      row.query.toLowerCase().includes(q) ||
      row.docId.toLowerCase().includes(q)
    );
  }, [search, flattened]);

  // Sorting
  const sorted = useMemo(() => {
    const items = [...filtered];
    items.sort((a: any, b: any) => {
      const aVal = a[sortField];
      const bVal = b[sortField];

      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
    return items;
  }, [filtered, sortField, sortDirection]);

  // Pagination: slice only the visible page
  const pageOfItems = useMemo(() => {
    const start = pageIndex * pageSize;
    return sorted.slice(start, start + pageSize);
  }, [sorted, pageIndex, pageSize]);

  // Table Columns
  const columns = [
    { field: 'query', name: 'Query', sortable: true },
    { field: 'docId', name: 'Doc ID', sortable: true },
    { field: 'rating', name: 'Rating', sortable: true },
  ];

  const pagination = {
    pageIndex,
    pageSize,
    totalItemCount: sorted.length,
    pageSizeOptions: [10, 20, 50, 100],
  };

  const sorting = {
    sort: {
      field: sortField,
      direction: sortDirection,
    },
  };

  return (
    <div>
      <EuiFieldSearch
        placeholder="Filter by query or doc ID..."
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          setPageIndex(0);
        }}
        fullWidth
        isClearable
      />

      <EuiSpacer size="m" />

      <EuiBasicTable
        items={pageOfItems}
        columns={columns}
        pagination={pagination}
        sorting={sorting}
        onChange={({ page, sort }) => {
          if (page) {
            setPageIndex(page.index);
            setPageSize(page.size);
          }
          if (sort) {
            setSortField(sort.field as any);
            setSortDirection(sort.direction);
          }
        }}
      />
    </div>
  );
};

export const JudgmentView: React.FC<JudgmentViewProps> = ({ http, id }) => {
  const { judgment, loading, error } = useJudgmentView(http, id);

  const JudgmentViewPane: React.FC = () => {
    if (!judgment) return null;

    return (
      <EuiForm>
        <EuiFormRow label="Judgment Name" fullWidth>
          <EuiText>{judgment.name}</EuiText>
        </EuiFormRow>

        <EuiFormRow label="Type" fullWidth>
          <EuiText>{judgment.type}</EuiText>
        </EuiFormRow>

        <EuiFormRow label="Metadata" fullWidth>
          <EuiText>
            {(Object.entries(judgment.metadata)).map(([key, value]) => (
              <p key={key}>
                <strong>{key}:</strong> {JSON.stringify(value)}
              </p>
            ))}
          </EuiText>
        </EuiFormRow>

        <EuiFormRow label="Judgment Ratings" fullWidth>
          <EuiPanel paddingSize="m" hasShadow={false}>
            <JudgmentRatingsTable ratings={judgment?.judgmentRatings || []} />
          </EuiPanel>
        </EuiFormRow>
      </EuiForm>
    );
  };

  if (loading) {
    return <div>Loading judgment data...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <EuiPageTemplate paddingSize="l" restrictWidth="100%">
      <EuiPageHeader pageTitle="Judgment Details" description="View the details of your judgment" />
      <EuiSpacer size="l" />
      <EuiPanel hasBorder={true}>
        <JudgmentViewPane />
      </EuiPanel>
    </EuiPageTemplate>
  );
};

export default JudgmentView;
