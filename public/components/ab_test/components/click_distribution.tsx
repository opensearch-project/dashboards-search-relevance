/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { EuiProgress, EuiSpacer, EuiText, EuiTextColor, EuiTitle } from '@elastic/eui';
import { ConfigResult } from '../types';
import { clickPercentage } from '../utils/statistics';
import { shortenId } from '../utils/query_display';

interface ClickDistributionProps {
  results: ConfigResult[];
  totalClicks: number;
}

/**
 * Clicks each configuration received, as labelled progress bars.
 *
 * Colours come from the theme's palette (`vis0`/`vis1`) rather than fixed hex values so the
 * chart stays legible in both light and dark mode.
 */
export const ClickDistribution: React.FC<ClickDistributionProps> = ({ results, totalClicks }) => (
  <>
    <EuiTitle size="s">
      <h3>Click Distribution (Total: {totalClicks})</h3>
    </EuiTitle>
    <EuiSpacer size="m" />
    {results.map((bucket) => (
      <React.Fragment key={bucket.key}>
        <EuiProgress
          value={bucket.doc_count}
          max={totalClicks || 1}
          color={bucket.label === 'A' ? 'vis0' : 'vis1'}
          size="l"
          label={
            <EuiText size="s">
              <strong>Config {bucket.label}</strong>{' '}
              <EuiTextColor color="subdued">{shortenId(bucket.key)}</EuiTextColor>
            </EuiText>
          }
          valueText={`${bucket.doc_count} (${clickPercentage(bucket.doc_count, totalClicks).toFixed(
            1
          )}%)`}
          aria-label={`Clicks for configuration ${bucket.label}`}
        />
        <EuiSpacer size="m" />
      </React.Fragment>
    ))}
  </>
);
