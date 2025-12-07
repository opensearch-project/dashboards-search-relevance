/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { fireEvent, render, screen } from "@testing-library/react";
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
    });

    render(
      <Router history={history}>
        <JudgmentView {...defaultProps} />
      </Router>
    );

    expect(screen.getByText('Failed to load judgment')).toBeInTheDocument();
  });

  it('renders judgment metadata & flattened ratings table', () => {
    mockUseJudgmentView.mockReturnValue({
      judgment: {
        id: '1',
        name: 'Test Judgment',
        type: 'LLM',
        status: 'COMPLETED',
        metadata: { key1: 'value1' },
        judgmentRatings: [
          {
            query: 'bluetooth earbuds',
            ratings: [
              { docId: 'A1', rating: '3' },
              { docId: 'A2', rating: '1' },
            ],
          },
        ],
        timestamp: '2023-01-01',
      },
      loading: false,
      error: null,
    });

    render(
      <Router history={history}>
        <JudgmentView {...defaultProps} />
      </Router>
    );

    // Metadata
    expect(screen.getByText('Test Judgment')).toBeInTheDocument();
    expect(screen.getByText('LLM')).toBeInTheDocument();
    expect(screen.getByText('key1:')).toBeInTheDocument();

    // Flattened table rows
    expect(screen.getByText('bluetooth earbuds')).toBeInTheDocument();
    expect(screen.getByText('A1')).toBeInTheDocument();
    expect(screen.getByText('A2')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('filters table results using search box', () => {
    mockUseJudgmentView.mockReturnValue({
      judgment: {
        id: '1',
        name: 'Test Judgment',
        type: 'LLM',
        status: 'COMPLETED',
        metadata: {},
        judgmentRatings: [
          {
            query: 'bluetooth earbuds',
            ratings: [{ docId: 'A1', rating: '3' }],
          },
          {
            query: 'wired earbuds',
            ratings: [{ docId: 'B1', rating: '4' }],
          },
        ],
        timestamp: '2023-01-01',
      },
      loading: false,
      error: null,
    });

    render(
      <Router history={history}>
        <JudgmentView {...defaultProps} />
      </Router>
    );

    const searchInput = screen.getByPlaceholderText(
      'Filter by query, doc ID, or rating...'
    );

    // Search for query "wired"
    fireEvent.change(searchInput, { target: { value: 'wired' } });

    expect(screen.queryByText('bluetooth earbuds')).not.toBeInTheDocument();
    expect(screen.getByText('wired earbuds')).toBeInTheDocument();
    expect(screen.getByText('B1')).toBeInTheDocument();
    expect(screen.getByText('4')).toBeInTheDocument();
  });

  it('shows paginated rows (slice of full results)', () => {
    // Create many rows to trigger pagination
    const bigRatings = [
      {
        query: 'q1',
        ratings: Array.from({ length: 50 }).map((_, i) => ({
          docId: `ID-${i}`,
          rating: (i % 5).toString(),
        })),
      },
    ];

    mockUseJudgmentView.mockReturnValue({
      judgment: {
        id: '1',
        name: 'Big Judgment',
        type: 'LLM',
        status: 'COMPLETED',
        metadata: {},
        judgmentRatings: bigRatings,
        timestamp: '2023-01-01',
      },
      loading: false,
      error: null,
    });

    render(
      <Router history={history}>
        <JudgmentView {...defaultProps} />
      </Router>
    );

    // Verify that NOT all 50 records show (pagination works)
    expect(screen.queryByText('ID-40')).not.toBeInTheDocument(); // outside first page
  });
});
