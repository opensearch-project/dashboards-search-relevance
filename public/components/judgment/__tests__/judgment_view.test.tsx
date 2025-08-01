/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { Router } from 'react-router-dom';
import { createMemoryHistory } from 'history';
import { JudgmentView } from '../views/judgment_view';
import * as hooks from '../hooks/use_judgment_view';

// Mock the hook
jest.mock('../hooks/use_judgment_view');

const mockUseJudgmentView = hooks.useJudgmentView as jest.MockedFunction<
  typeof hooks.useJudgmentView
>;

const mockHttp = {
  get: jest.fn(),
};

describe('JudgmentView', () => {
  const history = createMemoryHistory();
  const defaultProps = {
    http: mockHttp,
    id: '1',
    history,
    location: history.location,
    match: { params: { id: '1' }, isExact: true, path: '', url: '' },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders loading state', () => {
    mockUseJudgmentView.mockReturnValue({
      judgment: null,
      loading: true,
      error: null,
      formatJson: jest.fn(),
    });

    render(
      <Router history={history}>
        <JudgmentView {...defaultProps} />
      </Router>
    );

    expect(screen.getByText('Loading judgment data...')).toBeInTheDocument();
  });

  it('renders error state', () => {
    mockUseJudgmentView.mockReturnValue({
      judgment: null,
      loading: false,
      error: 'Failed to load judgment',
      formatJson: jest.fn(),
    });

    render(
      <Router history={history}>
        <JudgmentView {...defaultProps} />
      </Router>
    );

    expect(screen.getByText('Failed to load judgment')).toBeInTheDocument();
  });

  it('renders judgment details', () => {
    const mockFormatJson = jest.fn().mockReturnValue('{\n  "formatted": "json"\n}');
    mockUseJudgmentView.mockReturnValue({
      judgment: {
        id: '1',
        name: 'Test Judgment',
        type: 'LLM',
        status: 'COMPLETED',
        metadata: { key1: 'value1', key2: 'value2' },
        judgmentRatings: { rating1: 5, rating2: 3 },
        timestamp: '2023-01-01T00:00:00Z',
      },
      loading: false,
      error: null,
      formatJson: mockFormatJson,
    });

    render(
      <Router history={history}>
        <JudgmentView {...defaultProps} />
      </Router>
    );

    expect(screen.getByText('Judgment Details')).toBeInTheDocument();
    expect(screen.getByText('Test Judgment')).toBeInTheDocument();
    expect(screen.getByText('LLM')).toBeInTheDocument();
    expect(screen.getByText('key1:')).toBeInTheDocument();
    expect(screen.getByText('key2:')).toBeInTheDocument();
  });
});
