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
} from '@elastic/eui';
import React from 'react';
import { MetricsCollection } from '../../types/index';

interface MetricsSummaryPanelProps {
  metrics: MetricsCollection;
}

export const MetricsSummaryPanel: React.FC<MetricsSummaryPanelProps> = ({ metrics }) => {
  const formatValue = (values: number[] | undefined) => {
    if (!values || values.length === 0) return '-';
    // Calculate average of the values
    const avg = values.reduce((sum, val) => sum + val, 0) / values.length;
    return avg.toFixed(2).replace(/\.00$/, '');
  };

  // Get metric keys from the first element if available
  const metricKeys = metrics.length > 0 ? Object.keys(metrics[0]) : [];

  return (
    <EuiPanel paddingSize="l">
      <EuiTitle size="s">
        <h3>Metrics Summary</h3>
      </EuiTitle>
      <EuiHorizontalRule margin="m" />
      <EuiFlexGroup>
        {metricKeys.map((metricKey) => (
          <EuiFlexItem grow={2} key={metricKey}>
            <EuiStat
              title={formatValue(metrics.map((m) => m[metricKey]))}
              description={metricKey}
              titleSize="l"
            />
          </EuiFlexItem>
        ))}
      </EuiFlexGroup>
    </EuiPanel>
  );
};
