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
      row.docId.toLowerCase().includes(q) ||
      row.rating.toString().includes(q)
    );
  }, [search, flattened]);

  // Pagination: slice only the visible page
  const pageOfItems = useMemo(() => {
    const start = pageIndex * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, pageIndex, pageSize]);

  // Table Columns
  const columns = [
    { field: 'query', name: 'Query' },
    { field: 'docId', name: 'Doc ID' },
    { field: 'rating', name: 'Rating' },
  ];

  // Pagination config for EUI
  const pagination = {
    pageIndex,
    pageSize,
    totalItemCount: filtered.length,
    pageSizeOptions: [10, 20, 50, 100],
  };

  return (
    <div>
      <EuiFieldSearch
        placeholder="Filter by query, doc ID, or rating..."
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
        onChange={({ page }) => {
          setPageIndex(page.index);
          setPageSize(page.size);
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
          <EuiText>{judgment?.name}</EuiText>
        </EuiFormRow>

        <EuiFormRow label="Type" fullWidth>
          <EuiText>{judgment?.type}</EuiText>
        </EuiFormRow>

        <EuiFormRow label="Metadata" fullWidth>
          <EuiText>
            {(Object.entries(judgment?.metadata || {})).map(([key, value]) => (
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
