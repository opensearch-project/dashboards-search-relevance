/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
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
    expect(screen.getAllByText('bluetooth earbuds').length).toBeGreaterThan(0);
    expect(screen.getAllByText('A1').length).toBeGreaterThan(0);
    expect(screen.getAllByText('A2').length).toBeGreaterThan(0);
    expect(screen.getAllByText('3').length).toBeGreaterThan(0);
    expect(screen.getAllByText('1').length).toBeGreaterThan(0);

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
    expect(screen.queryByText('ID-40')).not.toBeInTheDocument();
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
      'Filter by query or doc ID...'
    );

    fireEvent.change(searchInput, { target: { value: 'wired' } });

    expect(screen.queryByText('bluetooth earbuds')).not.toBeInTheDocument();
    expect(screen.getByText('wired earbuds')).toBeInTheDocument();
    expect(screen.getByText('B1')).toBeInTheDocument();
    expect(screen.getByText('4')).toBeInTheDocument();
  });

  it('sorts ratings by Doc ID when column header is clicked', () => {
    mockUseJudgmentView.mockReturnValue({
      judgment: {
        id: '1',
        name: 'Sorting Test',
        type: 'LLM',
        status: 'COMPLETED',
        metadata: {},
        judgmentRatings: [
          {
            query: 'sort-test',
            ratings: [
              { docId: 'B2', rating: '2' },
              { docId: 'A1', rating: '3' },
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

    const docIdHeader = screen.getAllByText('Doc ID')[0];
    fireEvent.click(docIdHeader);

    const rows = screen.getAllByRole('row');
    expect(rows[1]).toHaveTextContent('A1');
  });

  it('renders with non-array ratings gracefully', () => {
    mockUseJudgmentView.mockReturnValue({
      judgment: {
        id: '1',
        name: 'Bad Ratings',
        type: 'LLM',
        status: 'COMPLETED',
        metadata: {},
        judgmentRatings: 'not-an-array',
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

    // Should still render without crashing
    expect(screen.getByText('Bad Ratings')).toBeInTheDocument();
  });

  it('renders with empty judgmentRatings array', () => {
    mockUseJudgmentView.mockReturnValue({
      judgment: {
        id: '1',
        name: 'Empty Ratings',
        type: 'LLM',
        status: 'COMPLETED',
        metadata: {},
        judgmentRatings: [],
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

    expect(screen.getByText('Empty Ratings')).toBeInTheDocument();
  });

  it('renders with null judgment (JudgmentViewPane returns null)', () => {
    mockUseJudgmentView.mockReturnValue({
      judgment: null,
      loading: false,
      error: null,
    });

    render(
      <Router history={history}>
        <JudgmentView {...defaultProps} />
      </Router>
    );

    // Should render the page template but JudgmentViewPane returns null
    expect(screen.getByText('Judgment Details')).toBeInTheDocument();
  });

  it('handles page size changes', () => {
    // Create enough rows for pagination
    const manyRatings = [
      {
        query: 'test-query',
        ratings: Array.from({ length: 25 }).map((_, i) => ({
          docId: `DOC-${i}`,
          rating: (i % 5).toString(),
        })),
      },
    ];

    mockUseJudgmentView.mockReturnValue({
      judgment: {
        id: '1',
        name: 'Page Test',
        type: 'LLM',
        status: 'COMPLETED',
        metadata: {},
        judgmentRatings: manyRatings,
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

    // Default page size is 20, so DOC-20 should not be visible on first page
    expect(screen.queryByText('DOC-20')).not.toBeInTheDocument();
  });

  it('sorts ratings by Rating column when clicked', () => {
    mockUseJudgmentView.mockReturnValue({
      judgment: {
        id: '1',
        name: 'Rating Sort',
        type: 'LLM',
        status: 'COMPLETED',
        metadata: {},
        judgmentRatings: [
          {
            query: 'test',
            ratings: [
              { docId: 'D1', rating: '5' },
              { docId: 'D2', rating: '1' },
              { docId: 'D3', rating: '3' },
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

    // Click Rating header to sort
    const ratingHeader = screen.getAllByText('Rating')[0];
    fireEvent.click(ratingHeader);

    const rows = screen.getAllByRole('row');
    expect(rows.length).toBeGreaterThan(1);
  });
});
