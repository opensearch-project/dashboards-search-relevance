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
});
