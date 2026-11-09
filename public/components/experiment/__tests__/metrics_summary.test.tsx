/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import {
  MetricsSummaryPanel,
  getBaseMetricName,
  getMetricTooltip,
  metricDescriptions,
} from '../metrics/metrics_summary';

describe('getBaseMetricName', () => {
  it('strips the @k suffix and lowercases the result', () => {
    expect(getBaseMetricName('recall@10')).toBe('recall');
    expect(getBaseMetricName('NDCG@5')).toBe('ndcg');
    expect(getBaseMetricName('frequencyWeighted')).toBe('frequencyweighted');
  });
});

describe('getMetricTooltip', () => {
  it.each(Object.keys(metricDescriptions))(
    'resolves a real tooltip for metric key "%s"',
    (metricKey) => {
      expect(getMetricTooltip(metricKey)).toBe(metricDescriptions[metricKey]);
    }
  );

  it.each(['recall@10', 'ndcg@5', 'frequencyWeighted', 'MRR'])(
    'resolves a real tooltip for @k-suffixed or differently-cased name "%s"',
    (metricKey) => {
      const tooltip = getMetricTooltip(metricKey);
      expect(tooltip).not.toMatch(/No description available/);
    }
  );

  it('falls back to a "no description" message for an unknown metric', () => {
    expect(getMetricTooltip('totallyMadeUp')).toBe(
      'No description available for totallymadeup'
    );
  });
});

describe('MetricsSummaryPanel', () => {
  it('renders metrics summary title', () => {
    const mockMetrics = [];

    render(<MetricsSummaryPanel metrics={mockMetrics} />);

    expect(screen.getByText('Metrics Summary')).toBeInTheDocument();
  });

  it('renders metrics with values', () => {
    const mockMetrics = [
      { 'ndcg@10': 0.85, 'precision@5': 0.75 },
      { 'ndcg@10': 0.9, 'precision@5': 0.8 },
    ];

    render(<MetricsSummaryPanel metrics={mockMetrics} />);

    expect(screen.getByText('ndcg@10')).toBeInTheDocument();
    expect(screen.getByText('precision@5')).toBeInTheDocument();
    expect(screen.getByText('0.88')).toBeInTheDocument(); // Average of ndcg@10
    expect(screen.getByText('0.78')).toBeInTheDocument(); // Average of precision@5
  });

  it('handles empty metrics', () => {
    const mockMetrics = [];

    render(<MetricsSummaryPanel metrics={mockMetrics} />);

    expect(screen.getByText('Metrics Summary')).toBeInTheDocument();
  });

  it('shows average time taken separately from relevance metrics', () => {
    const mockMetrics = [{ 'ndcg@10': 0.8 }];

    render(<MetricsSummaryPanel metrics={mockMetrics} tookValues={[10, undefined, 30]} />);

    expect(screen.getByText('Avg. time taken')).toBeInTheDocument();
    expect(screen.getByText('20 ms')).toBeInTheDocument();
    expect(screen.getByText('0.80')).toBeInTheDocument();
  });

  it('hides avg time taken when no took values exist', () => {
    render(<MetricsSummaryPanel metrics={[{ 'ndcg@10': 0.5 }]} tookValues={[undefined, null]} />);

    expect(screen.queryByText('Avg. time taken')).not.toBeInTheDocument();
  });

  it('hides avg time taken when tookValues is not provided', () => {
    render(<MetricsSummaryPanel metrics={[{ 'ndcg@10': 0.5 }]} />);

    expect(screen.queryByText('Avg. time taken')).not.toBeInTheDocument();
  });
});
