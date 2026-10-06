/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
    EuiPanel,
    EuiText,
    EuiFlexGroup,
    EuiFlexItem,
    EuiSpacer,
    EuiBadge,
    EuiHorizontalRule,
} from '@elastic/eui';
import { JudgmentParseSummaryData, MAX_ERROR_PREVIEW } from './preview_types';

interface PreviewSummaryPanelProps {
    parseSummary: JudgmentParseSummaryData;
}

export const PreviewSummaryPanel: React.FC<PreviewSummaryPanelProps> = ({ parseSummary }) => {
    return (
        <EuiPanel paddingSize="s" color="subdued">
            <EuiFlexGroup gutterSize="s" alignItems="center" wrap>
                <EuiFlexItem grow={false}>
                    <EuiBadge color={parseSummary.failedRecords > 0 ? 'warning' : 'success'}>
                        {parseSummary.failedRecords > 0 ? 'Parsed with warnings' : 'Successfully parsed'}
                    </EuiBadge>
                </EuiFlexItem>

                <EuiFlexItem grow={false}>
                    <EuiText size="s">
                        <strong>{parseSummary.successfulRecords}</strong> successful records •{' '}
                        <strong>{parseSummary.failedRecords}</strong> failed records •{' '}
                        {parseSummary.duplicateRecords > 0 && (
                            <>
                                <strong>{parseSummary.duplicateRecords}</strong> duplicates skipped •{' '}
                            </>
                        )}
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
    );
};
