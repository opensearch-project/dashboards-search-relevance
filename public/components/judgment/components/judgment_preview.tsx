/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useCallback } from 'react';
import {
  EuiFormRow,
  EuiPanel,
  EuiText,
  EuiButton,
  EuiFlexGroup,
  EuiFlexItem,
  EuiFieldSearch,
  EuiSpacer,
  EuiBadge,
  EuiHorizontalRule,
} from '@elastic/eui';

interface JudgmentPreviewProps {
  parsedJudgments: string[];
  parseSummary?: {
    totalLinesRead: number;
    headerLinesSkipped: number;
    successfulRecords: number;
    failedRecords: number;
    errors: {
      line: number;
      raw: string;
      error: string;
    }[];
    ratingDistribution: Record<string, number>;
    uniqueQueries: number;
  };
}

const MAX_QUERIES_PREVIEW = 200;
const MAX_RATINGS_PER_QUERY_PREVIEW = 50;
const MAX_ERROR_PREVIEW = 10;

export const JudgmentPreview: React.FC<JudgmentPreviewProps> = ({
  parsedJudgments,
  parseSummary,
}) => {
  const [expandedQueries, setExpandedQueries] = useState<Record<string, boolean>>({});
  const [search, setSearch] = useState('');

  const parsedObjects = useMemo(() => {
    return parsedJudgments
      .map((s) => {
        try {
          return JSON.parse(s);
        } catch (e) {
          return null;
        }
      })
      .filter(Boolean);
  }, [parsedJudgments]);

  const grouped = useMemo(() => {
    const map: Record<string, { docId: string; rating: string }[]> = {};
    for (const item of parsedObjects as any[]) {
      if (!item?.query) continue;
      if (!map[item.query]) map[item.query] = [];
      map[item.query].push(...(item.ratings || []));
    }
    return map;
  }, [parsedObjects]);

  const allQueries = useMemo(() => {
    return Object.keys(grouped).sort((a, b) => a.localeCompare(b));
  }, [grouped]);

  const filteredQueries = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return allQueries;

    return allQueries.filter((query) => {
      if (query.toLowerCase().includes(q)) return true;

      const ratings = grouped[query] || [];
      return ratings.some((r) => {
        const doc = String(r.docId || '').toLowerCase();
        const rating = String(r.rating || '').toLowerCase();
        return doc.includes(q) || rating.includes(q);
      });
    });
  }, [allQueries, grouped, search]);

  const cappedQueries = useMemo(() => {
    return filteredQueries.slice(0, MAX_QUERIES_PREVIEW);
  }, [filteredQueries]);

  const isQueryListTruncated = filteredQueries.length > MAX_QUERIES_PREVIEW;

  const expandAll = useCallback(() => {
    const next: Record<string, boolean> = {};
    for (const q of cappedQueries) next[q] = true;
    setExpandedQueries(next);
  }, [cappedQueries]);

  const collapseAll = useCallback(() => {
    setExpandedQueries({});
  }, []);

  const toggleQuery = useCallback((query: string) => {
    setExpandedQueries((prev) => ({
      ...prev,
      [query]: !prev[query],
    }));
  }, []);

  const hasAnyPreviewData =
    (parsedJudgments && parsedJudgments.length > 0) ||
    (parseSummary && (parseSummary.failedRecords > 0 || parseSummary.successfulRecords > 0));

  if (!hasAnyPreviewData) {
    return null;
  }

  return (
    <EuiFormRow fullWidth label="Parsed Judgments Preview">
      <EuiPanel paddingSize="s">
        <EuiFlexGroup direction="column" gutterSize="s">
          <EuiFlexItem grow={false}>
            <EuiText size="s">
              <h4>Preview</h4>
            </EuiText>
          </EuiFlexItem>

          {parseSummary && (
            <EuiFlexItem grow={false}>
              <EuiPanel paddingSize="s" color="subdued">
                <EuiFlexGroup gutterSize="s" alignItems="center" wrap>
                  <EuiFlexItem grow={false}>
                    <EuiBadge color={parseSummary.failedRecords > 0 ? 'warning' : 'success'}>
                      {parseSummary.failedRecords > 0
                        ? 'Parsed with warnings'
                        : 'Successfully parsed'}
                    </EuiBadge>
                  </EuiFlexItem>

                  <EuiFlexItem grow={false}>
                    <EuiText size="s">
                      <strong>{parseSummary.successfulRecords}</strong> successful records •{' '}
                      <strong>{parseSummary.failedRecords}</strong> failed records •{' '}
                      <strong>{parseSummary.uniqueQueries}</strong> unique queries
                    </EuiText>
                  </EuiFlexItem>

                  <EuiFlexItem grow={false}>
                    <EuiText size="s">
                      Total lines read: <strong>{parseSummary.totalLinesRead}</strong>
                      {parseSummary.headerLinesSkipped > 0 ? (
                        <>
                          {' '}
                          • headers skipped: <strong>{parseSummary.headerLinesSkipped}</strong>
                        </>
                      ) : null}
                    </EuiText>
                  </EuiFlexItem>
                </EuiFlexGroup>

                <EuiSpacer size="s" />

                <EuiText size="s">
                  <strong>Rating Distribution:</strong>{' '}
                  {Object.keys(parseSummary.ratingDistribution || {}).length === 0
                    ? 'N/A'
                    : Object.entries(parseSummary.ratingDistribution)
                        .sort(([a], [b]) => Number(b) - Number(a))
                        .map(([k, v]) => `${k}: ${v}`)
                        .join(' • ')}
                </EuiText>

                {parseSummary.failedRecords > 0 && parseSummary.errors?.length > 0 && (
                  <>
                    <EuiHorizontalRule margin="s" />
                    <EuiText size="s">
                      <strong>Sample Errors:</strong>
                      <ul style={{ marginTop: 8 }}>
                        {parseSummary.errors.slice(0, MAX_ERROR_PREVIEW).map((e, idx) => (
                          <li key={idx}>
                            <strong>Line {e.line}:</strong> {e.error}
                            <br />
                            <code style={{ opacity: 0.9 }}>{e.raw}</code>
                          </li>
                        ))}
                      </ul>
                      {parseSummary.errors.length > MAX_ERROR_PREVIEW ? (
                        <div style={{ opacity: 0.8 }}>
                          Showing {MAX_ERROR_PREVIEW} of {parseSummary.errors.length} errors.
                        </div>
                      ) : null}
                    </EuiText>
                  </>
                )}
              </EuiPanel>
            </EuiFlexItem>
          )}

          <EuiFlexItem grow={false}>
            <EuiFlexGroup gutterSize="s" alignItems="center" justifyContent="spaceBetween">
              <EuiFlexItem grow={true}>
                <EuiFieldSearch
                  fullWidth
                  compressed
                  placeholder="Search query, doc ID, or rating (Ctrl+F also works)"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </EuiFlexItem>

              <EuiFlexItem grow={false}>
                <EuiFlexGroup gutterSize="s">
                  <EuiFlexItem grow={false}>
                    <EuiButton size="s" onClick={expandAll}>
                      Expand All
                    </EuiButton>
                  </EuiFlexItem>

                  <EuiFlexItem grow={false}>
                    <EuiButton size="s" onClick={collapseAll}>
                      Collapse All
                    </EuiButton>
                  </EuiFlexItem>
                </EuiFlexGroup>
              </EuiFlexItem>
            </EuiFlexGroup>
          </EuiFlexItem>

          {isQueryListTruncated && (
            <EuiFlexItem grow={false}>
              <EuiText size="s" style={{ opacity: 0.85 }}>
                Showing first <strong>{MAX_QUERIES_PREVIEW}</strong> of{' '}
                <strong>{filteredQueries.length}</strong> matching queries. Refine search to narrow
                results.
              </EuiText>
            </EuiFlexItem>
          )}

          <EuiFlexItem grow={false}>
            <div style={{ maxHeight: 360, overflowY: 'auto', paddingRight: 8 }}>
              <EuiText size="s">
                <ul style={{ listStyle: 'none', paddingLeft: 0, margin: 0 }}>
                  {cappedQueries.map((query) => {
                    const ratings = grouped[query] || [];
                    const isExpanded = !!expandedQueries[query];

                    const shownRatings = ratings.slice(0, MAX_RATINGS_PER_QUERY_PREVIEW);
                    const isRatingsTruncated = ratings.length > MAX_RATINGS_PER_QUERY_PREVIEW;

                    return (
                      <li
                        key={query}
                        style={{
                          borderBottom: '1px solid rgba(0,0,0,0.08)',
                          padding: '10px 0',
                        }}
                      >
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            cursor: 'pointer',
                            userSelect: 'none',
                          }}
                          onClick={() => toggleQuery(query)}
                        >
                          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                            <span style={{ width: 18, display: 'inline-block' }}>
                              {isExpanded ? '▼' : '▶'}
                            </span>
                            <strong>{query}</strong>
                          </div>

                          <EuiBadge color="hollow">{ratings.length} ratings</EuiBadge>
                        </div>

                        {isExpanded && (
                          <div style={{ marginLeft: 26, marginTop: 8 }}>
                            <ul style={{ margin: 0 }}>
                              {shownRatings.map((r, idx) => (
                                <li key={idx}>
                                  Doc ID: {r.docId} • Rating: {r.rating}
                                </li>
                              ))}
                            </ul>

                            {isRatingsTruncated ? (
                              <div style={{ marginTop: 6, opacity: 0.85 }}>
                                Showing first {MAX_RATINGS_PER_QUERY_PREVIEW} of {ratings.length}{' '}
                                ratings for this query.
                              </div>
                            ) : null}
                          </div>
                        )}
                      </li>
                    );
                  })}
                </ul>

                {filteredQueries.length === 0 ? (
                  <div style={{ padding: 12, opacity: 0.8 }}>
                    No matches found for "<strong>{search}</strong>"
                  </div>
                ) : null}
              </EuiText>
            </div>
          </EuiFlexItem>
        </EuiFlexGroup>
      </EuiPanel>
    </EuiFormRow>
  );
};
