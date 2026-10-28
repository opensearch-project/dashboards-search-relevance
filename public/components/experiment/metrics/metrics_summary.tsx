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
  AVG_TOOK_TOOL_TIP,
  RECALL_TOOL_TIP,
  MRR_TOOL_TIP,
  DCG_TOOL_TIP,
} from '../../../../common';
import { averageTook, formatTook } from '../../../utils/took';

interface MetricsSummaryPanelProps {
  metrics: MetricsCollection;
  /** Per-query took values; averaged separately from relevance metrics. */
  tookValues?: Array<number | undefined | null>;
}

// tool tip texts, keyed by lowercased base metric name (see getBaseMetricName)
export const metricDescriptions: { [key: string]: string } = {
  jaccard: JACCARD_TOOL_TIP,
  rbo50: RBO50_TOOL_TIP,
  rbo90: RBO90_TOOL_TIP,
  frequencyweighted: FREQUENCY_WEIGHTED_TOOL_TIP,
  ndcg: NDCG_TOOL_TIP,
  precision: PRECISION_TOOL_TIP,
  map: MAP_TOOL_TIP,
  coverage: COVERAGE_TOOL_TIP,
  recall: RECALL_TOOL_TIP,
  mrr: MRR_TOOL_TIP,
  dcg: DCG_TOOL_TIP,
};

// metrics for evaluations are stored with @k, need to extract the base name
export const getBaseMetricName = (fullMetricName: string): string => {
  const parts = fullMetricName.split('@');
  return parts[0].toLowerCase();
};

export const getMetricTooltip = (fullMetricName: string): string => {
  const baseMetricName = getBaseMetricName(fullMetricName);
  return metricDescriptions[baseMetricName] || `No description available for ${baseMetricName}`;
};

export const MetricsSummaryPanel: React.FC<MetricsSummaryPanelProps> = ({
  metrics,
  tookValues,
}) => {
  const formatValue = (values: number[] | undefined) => {
    if (!values || values.length === 0) return '-';
    // Calculate average of the values
    const avg = values.reduce((sum, val) => sum + val, 0) / values.length;
    return avg.toFixed(2).replace(/\.00$/, '');
  };

  // Get metric keys from the first element if available
  const metricKeys = metrics.length > 0 ? Object.keys(metrics[0]) : [];
  const hasTook = tookValues?.some((value) => value !== undefined && value !== null) ?? false;
  const avgTook = hasTook ? averageTook(tookValues) : undefined;

  return (
    <EuiPanel paddingSize="l">
      <EuiTitle size="s">
        <h3>Metrics Summary</h3>
      </EuiTitle>
      <EuiHorizontalRule margin="m" />
      <EuiFlexGroup>
        {metricKeys.map((metricKey) => {
          const tooltipContent = getMetricTooltip(metricKey);
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
        {hasTook && (
          <EuiFlexItem grow={2} key="avg-took-ms">
            <EuiStat
              title={formatTook(avgTook)}
              description={
                <EuiToolTip content={AVG_TOOK_TOOL_TIP}>
                  <span data-test-subj="avgTookSummary">Avg. time taken</span>
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
