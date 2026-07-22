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
  EuiCallOut,
} from '@elastic/eui';
import { CoreStart } from '../../../../../../src/core/public';
import { useJudgmentView } from '../hooks/use_judgment_view';

interface JudgmentViewProps extends RouteComponentProps<{ id: string }> {
  http: CoreStart['http'];
  dataSourceId?: string | null;
}

/**
 * Generic table for a judgment's per-query document lists (ratings or failures).
 * Flattens:
 * [
 *   { query, [listField]: [{docId, ...}, ...] }
 * ]
 * into rows and renders them with search, sort and pagination.
 *
 * @param data      the judgmentRatings array
 * @param listField which per-query list to flatten ('ratings' or 'failures')
 * @param mapRow    maps a raw list item to a table row
 * @param columns   the EuiBasicTable columns to display
 */
const JudgmentDocsTable = ({
  data,
  listField,
  mapRow,
  columns,
}: {
  data: any[];
  listField: string;
  mapRow: (query: string, item: any) => Record<string, any>;
  columns: Array<{ field: string; name: string; sortable?: boolean }>;
}) => {
  const [search, setSearch] = useState('');
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [sortField, setSortField] = useState<string>('query');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Flatten JSON → table rows
  const flattened = useMemo(() => {
    if (!Array.isArray(data)) return [];
    return data.flatMap((item) => (item[listField] || []).map((entry: any) => mapRow(item.query, entry)));
  }, [data, listField, mapRow]);

  // Filtering (by query or docId)
  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return flattened.filter(
      (row) =>
        String(row.query).toLowerCase().includes(q) || String(row.docId).toLowerCase().includes(q)
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

// Ratings: query + docId + numeric rating.
const JudgmentRatingsTable = ({ judgmentRatings }: { judgmentRatings: any[] }) => (
  <JudgmentDocsTable
    data={judgmentRatings}
    listField="ratings"
    mapRow={(query, r) => ({ query, docId: r.docId, rating: Number(r.rating) })}
    columns={[
      { field: 'query', name: 'Query', sortable: true },
      { field: 'docId', name: 'Doc ID', sortable: true },
      { field: 'rating', name: 'Rating', sortable: true },
    ]}
  />
);

// Failures: query + docId (no rating column, since these docs were not rated).
const JudgmentFailuresTable = ({ judgmentRatings }: { judgmentRatings: any[] }) => (
  <JudgmentDocsTable
    data={judgmentRatings}
    listField="failures"
    mapRow={(query, f) => ({ query, docId: f.docId })}
    columns={[
      { field: 'query', name: 'Query', sortable: true },
      { field: 'docId', name: 'Doc ID', sortable: true },
    ]}
  />
);

export const JudgmentView: React.FC<JudgmentViewProps> = ({ http, id, dataSourceId }) => {
  const { judgment, loading, error } = useJudgmentView(http, id, dataSourceId);

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

        <EuiFormRow label="Status" fullWidth>
          <EuiText>{judgment.status}</EuiText>
        </EuiFormRow>

        {judgment.status === 'PROCESSING' && (
          <>
            <EuiSpacer size="m" />
            <EuiCallOut
              title="Judgment processing"
              color="primary"
              iconType="clock"
              data-test-subj="judgmentProcessingCallOut"
            >
              <p>Judgment ratings are being generated. This page will update automatically.</p>
            </EuiCallOut>
          </>
        )}

        <EuiFormRow label="Metadata" fullWidth>
          <EuiText>
            {Object.entries(judgment.metadata).map(([key, value]) => (
              <p key={key}>
                <strong>{key}:</strong> {JSON.stringify(value)}
              </p>
            ))}
          </EuiText>
        </EuiFormRow>

        <EuiFormRow label="Judgment Ratings" fullWidth>
          <EuiPanel paddingSize="m" hasShadow={false}>
            <JudgmentRatingsTable judgmentRatings={judgment?.judgmentRatings || []} />
          </EuiPanel>
        </EuiFormRow>

        {/* Only show the failed-documents table when the judgment actually has failures. */}
        {Array.isArray(judgment?.judgmentRatings) &&
          judgment.judgmentRatings.some(
            (item: any) => Array.isArray(item.failures) && item.failures.length > 0
          ) && (
          <EuiFormRow label="Failed Documents" fullWidth>
            <EuiPanel paddingSize="m" hasShadow={false}>
              <JudgmentFailuresTable judgmentRatings={judgment?.judgmentRatings || []} />
            </EuiPanel>
          </EuiFormRow>
        )}
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
