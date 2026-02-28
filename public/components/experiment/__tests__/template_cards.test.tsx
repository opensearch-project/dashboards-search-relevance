/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { TemplateCards } from '../template_card/template_cards';
import { Routes } from '../../../../common';

jest.mock('../../../contexts/date_format_context', () => ({
  useConfig: () => ({ dateFormat: 'YYYY-MM-DD' }),
}));

jest.mock('../../../../../../src/plugins/opensearch_dashboards_react/public', () => ({
  useOpenSearchDashboards: () => ({
    services: { http: {} },
  }),
}));

describe('TemplateCards', () => {
  const mockHistory = { push: jest.fn() };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders all template cards', () => {
    render(<TemplateCards history={mockHistory} />);

    expect(screen.getByText('Query Analysis')).toBeInTheDocument();
    expect(screen.getByText('Query Set Comparison')).toBeInTheDocument();
    expect(screen.getByText('Search Evaluation')).toBeInTheDocument();
    expect(screen.getByText('Hybrid Search Optimizer')).toBeInTheDocument();
  });

  it('navigates to correct routes when cards are clicked', () => {
    render(<TemplateCards history={mockHistory} />);

    fireEvent.click(screen.getByText('Query Analysis'));
    expect(mockHistory.push).toHaveBeenCalledWith(Routes.ExperimentCreateQueryAnalysis);

    fireEvent.click(screen.getByText('Query Set Comparison'));
    expect(mockHistory.push).toHaveBeenCalledWith(Routes.ExperimentCreateQuerySetComparison);

    fireEvent.click(screen.getByText('Search Evaluation'));
    expect(mockHistory.push).toHaveBeenCalledWith(Routes.ExperimentCreateSearchEvaluation);

    fireEvent.click(screen.getByText('Hybrid Search Optimizer'));
    expect(mockHistory.push).toHaveBeenCalledWith(Routes.ExperimentCreateHybridOptimizer);
  });
});
