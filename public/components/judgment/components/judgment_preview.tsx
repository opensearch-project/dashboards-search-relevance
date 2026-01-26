/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import {
  EuiFormRow,
  EuiPanel,
  EuiText,
  EuiButton,
  EuiFlexGroup,
  EuiFlexItem,
  EuiSelect,
} from '@elastic/eui';

interface JudgmentPreviewProps {
  parsedJudgments: string[];
}

const PAGE_SIZE_OPTIONS = [
  { value: 2, text: '2 / page' },
  { value: 5, text: '5 / page' },
  { value: 10, text: '10 / page' },
  { value: 20, text: '20 / page' },
];

export const JudgmentPreview: React.FC<JudgmentPreviewProps> = ({ parsedJudgments }) => {
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState<number>(2);

  const totalPages = useMemo(() => {
    return Math.max(1, Math.ceil(parsedJudgments.length / pageSize));
  }, [parsedJudgments.length, pageSize]);

  const pagedJudgments = useMemo(() => {
    const start = pageIndex * pageSize;
    return parsedJudgments.slice(start, start + pageSize);
  }, [pageIndex, parsedJudgments, pageSize]);

  if (parsedJudgments.length === 0) {
    return null;
  }

  return (
    <EuiFormRow fullWidth label="Parsed Judgments Preview">
      <EuiPanel paddingSize="s">

        {/* ✅ SCROLL LOCKED CONTENT */}
        <div style={{ maxHeight: 360, overflowY: 'auto', paddingRight: 8 }}>
          <EuiText size="s">
            <h4>
              Preview ({parsedJudgments.length} judgments)
            </h4>

            <ul>
              {pagedJudgments.map((item, idx) => {
                const parsed = JSON.parse(item);
                return (
                  <li key={idx}>
                    <strong>Query:</strong> {parsed.query}
                    <br />
                    <strong>Ratings:</strong>
                    <ul>
                      {parsed.ratings.map((r, rIdx) => (
                        <li key={rIdx}>
                          Doc ID: {r.docId}, Rating: {r.rating}
                        </li>
                      ))}
                    </ul>
                  </li>
                );
              })}
            </ul>
          </EuiText>
        </div>

        {/* ✅ PAGINATION BAR STAYS FIXED */}
        <EuiFlexGroup alignItems="center" justifyContent="spaceBetween" gutterSize="m">
          <EuiFlexItem grow={false}>
            <EuiSelect
              options={PAGE_SIZE_OPTIONS}
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setPageIndex(0);
              }}
              compressed
            />
          </EuiFlexItem>

          <EuiFlexItem grow={false}>
            <EuiText size="s">
              Page <strong>{pageIndex + 1}</strong> of <strong>{totalPages}</strong>
            </EuiText>
          </EuiFlexItem>

          <EuiFlexItem grow={false}>
            <EuiFlexGroup gutterSize="s">
              <EuiFlexItem grow={false}>
                <EuiButton
                  size="s"
                  onClick={() => setPageIndex((p) => Math.max(p - 1, 0))}
                  isDisabled={pageIndex === 0}
                >
                  Previous
                </EuiButton>
              </EuiFlexItem>

              <EuiFlexItem grow={false}>
                <EuiButton
                  size="s"
                  onClick={() => setPageIndex((p) => Math.min(p + 1, totalPages - 1))}
                  isDisabled={pageIndex === totalPages - 1}
                >
                  Next
                </EuiButton>
              </EuiFlexItem>
            </EuiFlexGroup>
          </EuiFlexItem>
        </EuiFlexGroup>
      </EuiPanel>
    </EuiFormRow>
  );
};
