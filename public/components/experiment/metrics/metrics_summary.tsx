/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  EuiFlexGroup,
  EuiFlexItem,
  EuiPanel,
  EuiStat,
  EuiTitle,
  EuiHorizontalRule,
  EuiToolTip,
} from '@elastic/eui';
import React from 'react';
import { MetricsCollection } from '../../../types';
import {
  JACCARD_TOOL_TIP,
  RBO50_TOOL_TIP,
  RBO90_TOOL_TIP,
  FREQUENCY_WEIGHTED_TOOL_TIP,
  NDCG_TOOL_TIP,
  PRECISION_TOOL_TIP,
  MAP_TOOL_TIP,
  COVERAGE_TOOL_TIP,
  AVG_TOOK_MS_TOOL_TIP,
} from '../../../../common';
import { averageTookMs, formatTookMs } from '../../../utils/took_ms';

interface MetricsSummaryPanelProps {
  metrics: MetricsCollection;
  /** Per-query tookMs values; averaged separately from relevance metrics. */
  tookMsValues?: Array<number | undefined | null>;
}

export const MetricsSummaryPanel: React.FC<MetricsSummaryPanelProps> = ({
  metrics,
  tookMsValues,
}) => {
  const formatValue = (values: number[] | undefined) => {
    if (!values || values.length === 0) return '-';
    // Calculate average of the values
    const avg = values.reduce((sum, val) => sum + val, 0) / values.length;
    return avg.toFixed(2).replace(/\.00$/, '');
  };
  // tool tip texts
  const metricDescriptions: { [key: string]: string } = {
    jaccard: JACCARD_TOOL_TIP,
    rbo50: RBO50_TOOL_TIP,
    rbo90: RBO90_TOOL_TIP,
    frequencyWeighted: FREQUENCY_WEIGHTED_TOOL_TIP,
    ndcg: NDCG_TOOL_TIP,
    precision: PRECISION_TOOL_TIP,
    map: MAP_TOOL_TIP,
    coverage: COVERAGE_TOOL_TIP,
  };

  // metrics for evaluations are stored with @k, need to extract the base name
  const getBaseMetricName = (fullMetricName: string): string => {
    const parts = fullMetricName.split('@');
    return parts[0].toLowerCase();
  };

  // Get metric keys from the first element if available
  const metricKeys = metrics.length > 0 ? Object.keys(metrics[0]) : [];
  const avgTookMs = tookMsValues ? averageTookMs(tookMsValues) : undefined;

  return (
    <EuiPanel paddingSize="l">
      <EuiTitle size="s">
        <h3>Metrics Summary</h3>
      </EuiTitle>
      <EuiHorizontalRule margin="m" />
      <EuiFlexGroup>
        {metricKeys.map((metricKey) => {
          // Get the base name for lookup
          const baseMetricName = getBaseMetricName(metricKey);
          const tooltipContent =
            metricDescriptions[baseMetricName] || `No description available for ${baseMetricName}`;
          return (
            <EuiFlexItem grow={2} key={metricKey}>
              <EuiStat
                title={formatValue(metrics.map((m) => m[metricKey]))}
                description={
                  <EuiToolTip content={tooltipContent}>
                    <span>{metricKey}</span>
                  </EuiToolTip>
                }
                titleSize="l"
              />
            </EuiFlexItem>
          );
        })}
        {tookMsValues && (
          <EuiFlexItem grow={2} key="avg-took-ms">
            <EuiStat
              title={formatTookMs(avgTookMs)}
              description={
                <EuiToolTip content={AVG_TOOK_MS_TOOL_TIP}>
                  <span data-test-subj="avgTookMsSummary">Avg. time taken</span>
                </EuiToolTip>
              }
              titleSize="l"
            />
          </EuiFlexItem>
        )}
      </EuiFlexGroup>
    </EuiPanel>
  );
};
