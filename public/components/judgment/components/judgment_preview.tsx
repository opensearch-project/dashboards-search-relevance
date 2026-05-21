/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useCallback } from 'react';
import {
  EuiFormRow,
  EuiPanel,
  EuiText,
  EuiFlexGroup,
  EuiFlexItem,
} from '@elastic/eui';
import { JudgmentParseSummaryData, RatingItem, MAX_QUERIES_PREVIEW } from './preview/preview_types';
import { PreviewSummaryPanel } from './preview/preview_summary_panel';
import { PreviewSearchToolbar } from './preview/preview_search_toolbar';
import { PreviewQueryRow } from './preview/preview_query_row';

interface JudgmentPreviewProps {
  parsedJudgments: string[];
  parseSummary?: JudgmentParseSummaryData;
}

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
    const map: Record<string, RatingItem[]> = {};
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
              <PreviewSummaryPanel parseSummary={parseSummary} />
            </EuiFlexItem>
          )}

          <EuiFlexItem grow={false}>
            <PreviewSearchToolbar
              search={search}
              onSearchChange={setSearch}
              onExpandAll={expandAll}
              onCollapseAll={collapseAll}
            />
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
                  {cappedQueries.map((query) => (
                    <PreviewQueryRow
                      key={query}
                      query={query}
                      ratings={grouped[query] || []}
                      isExpanded={!!expandedQueries[query]}
                      onToggle={() => toggleQuery(query)}
                    />
                  ))}
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
