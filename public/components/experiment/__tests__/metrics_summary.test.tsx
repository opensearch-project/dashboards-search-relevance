/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { MetricsSummaryPanel } from '../metrics/metrics_summary';

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

  it('handles string values in metrics', () => {
    const mockMetrics = [
      { 'ndcg@10': 0.85, 'status': 'Excellent' },
      { 'ndcg@10': 0.9, 'status': 'Excellent' },
    ];

    render(<MetricsSummaryPanel metrics={mockMetrics} />);

    expect(screen.getByText('ndcg@10')).toBeInTheDocument();
    expect(screen.getByText('status')).toBeInTheDocument();
    expect(screen.getByText('0.88')).toBeInTheDocument(); // Average of ndcg@10
    expect(screen.getByText('Excellent')).toBeInTheDocument(); // String value
  });

  it('handles mixed numeric and string values', () => {
    const mockMetrics = [
      { 'metric1': 0.5, 'metric2': 'Value1' },
      { 'metric1': 0.7, 'metric2': 'Value2' },
      { 'metric1': 0.9, 'metric2': 'Value1' }
    ];

    render(<MetricsSummaryPanel metrics={mockMetrics} />);

    expect(screen.getByText('metric1')).toBeInTheDocument();
    expect(screen.getByText('metric2')).toBeInTheDocument();
    expect(screen.getByText('0.70')).toBeInTheDocument(); // Average of metric1
    expect(screen.getByText('Value1')).toBeInTheDocument(); // First string value is used
  });
});
