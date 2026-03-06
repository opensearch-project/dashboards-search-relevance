/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { EuiIcon, EuiBadge } from '@elastic/eui';
import { RatingItem, MAX_RATINGS_PER_QUERY_PREVIEW } from './preview_types';

interface PreviewQueryRowProps {
    query: string;
    ratings: RatingItem[];
    isExpanded: boolean;
    onToggle: () => void;
}

export const PreviewQueryRow: React.FC<PreviewQueryRowProps> = ({
    query,
    ratings,
    isExpanded,
    onToggle,
}) => {
    const shownRatings = ratings.slice(0, MAX_RATINGS_PER_QUERY_PREVIEW);
    const isRatingsTruncated = ratings.length > MAX_RATINGS_PER_QUERY_PREVIEW;

    return (
        <li
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
                onClick={onToggle}
            >
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <span style={{ width: 18, display: 'inline-flex' }}>
                        <EuiIcon type={isExpanded ? 'arrowDown' : 'arrowRight'} size="s" />
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
                            Showing first {MAX_RATINGS_PER_QUERY_PREVIEW} of {ratings.length} ratings for this
                            query.
                        </div>
                    ) : null}
                </div>
            )}
        </li>
    );
};
