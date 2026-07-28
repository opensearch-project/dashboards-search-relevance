/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { Router } from 'react-router-dom';
import { createMemoryHistory } from 'history';
import { JudgmentView } from '../views/judgment_view';
import * as hooks from '../hooks/use_judgment_view';
import { JudgmentService } from '../services/judgment_service';

// Mock the hook
jest.mock('../hooks/use_judgment_view');
// Mock the service so no real HTTP is issued during editable-mode tests.
jest.mock('../services/judgment_service');

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

  it('renders processing callout when judgment status is PROCESSING', () => {
    mockUseJudgmentView.mockReturnValue({
      judgment: {
        id: '1',
        name: 'Processing Judgment',
        type: 'UBI',
        status: 'PROCESSING',
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

    expect(screen.getByTestId('judgmentProcessingCallOut')).toBeInTheDocument();
    expect(screen.getByText('PROCESSING')).toBeInTheDocument();
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

  it('renders failed docs in a separate Failed Documents table, apart from the ratings', () => {
    mockUseJudgmentView.mockReturnValue({
      judgment: {
        id: '1',
        name: 'Failures Judgment',
        type: 'LLM',
        status: 'COMPLETED',
        metadata: { totalQueries: 1, successfulQueries: 0, failedQueries: 1 },
        judgmentRatings: [
          {
            query: 'laptop',
            ratings: [{ docId: 'A1', rating: '1.0' }],
            failures: [{ docId: 'C9' }],
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

    // Failed docs get their own section rather than sharing the ratings table, so a failed
    // doc can be assigned a rating in place (see the editable-ratings tests below).
    expect(screen.getByText('Failed Documents')).toBeInTheDocument();

    // Both docs are visible: the rated one with its score, the failed one without.
    const rows = screen.getAllByRole('row');

    const failedRow = rows.find((row) => row.textContent?.includes('C9'));
    expect(failedRow).toBeDefined();
    // The failure row carries no score - it is unrated until someone edits it.
    expect(failedRow!.textContent).not.toContain('1.0');

    const ratedRow = rows.find((row) => row.textContent?.includes('A1'));
    expect(ratedRow).toBeDefined();
    expect(ratedRow!.textContent).toContain('1.0');
  });
});

describe('JudgmentView — editable ratings (LLM_JUDGMENT)', () => {
  const history = createMemoryHistory();
  const mockUpdateRatings = jest.fn();
  const mockRefresh = jest.fn();
  const mockNotifications = {
    toasts: {
      addSuccess: jest.fn(),
      addDanger: jest.fn(),
      addWarning: jest.fn(),
    },
  };

  const editableProps: any = {
    http: mockHttp,
    notifications: mockNotifications,
    id: 'j1',
    history,
    location: history.location,
    match: { params: { id: 'j1' }, isExact: true, path: '', url: '' },
  };

  const score01Judgment = {
    id: 'j1',
    name: 'Editable Judgment',
    type: 'LLM_JUDGMENT',
    status: 'COMPLETED',
    metadata: { llmJudgmentRatingType: 'SCORE0_1' },
    judgmentRatings: [
      { query: 'superhero action', ratings: [{ docId: '5', rating: '0.4' }] },
    ],
    timestamp: '2023-01-01',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (JudgmentService as jest.Mock).mockImplementation(() => ({
      updateRatings: mockUpdateRatings,
    }));
    mockUseJudgmentView.mockReturnValue({
      judgment: score01Judgment,
      loading: false,
      error: null,
      refresh: mockRefresh,
    } as any);
  });

  // Enter edit mode by clicking the top Edit button; the inline editors only appear afterwards.
  const enterEditMode = () => fireEvent.click(screen.getByTestId('editJudgmentRatingsButton'));

  it('is read-only until Edit is clicked, then shows a single numeric editor', () => {
    render(
      <Router history={history}>
        <JudgmentView {...editableProps} />
      </Router>
    );

    // Before editing: rating is plain text, no editor, no save bar.
    expect(screen.queryByRole('spinbutton')).not.toBeInTheDocument();
    expect(screen.getByText('0.4')).toBeInTheDocument();
    expect(screen.getByTestId('editJudgmentRatingsButton')).toBeInTheDocument();

    enterEditMode();

    // After clicking Edit: a single number editor (spinbutton) appears, seeded with the value.
    expect(screen.getByRole('spinbutton')).toHaveValue(0.4);
    // Edit button is replaced by the edit-mode save bar (nothing dirty yet).
    expect(screen.queryByTestId('editJudgmentRatingsButton')).not.toBeInTheDocument();
    expect(screen.getByText('Editing ratings')).toBeInTheDocument();
    // Update button is present but disabled until something changes.
    expect(screen.getByTestId('updateJudgmentRatingsButton')).toBeDisabled();
  });

  it('enables the save bar after an edit and saves batched changes', async () => {
    mockUpdateRatings.mockResolvedValue(undefined);

    render(
      <Router history={history}>
        <JudgmentView {...editableProps} />
      </Router>
    );

    enterEditMode();
    fireEvent.change(screen.getByRole('spinbutton'), { target: { value: '0.9' } });

    // Save bar now shows a count and the Update button is enabled.
    expect(screen.getByText('1 unsaved change')).toBeInTheDocument();
    expect(screen.getByTestId('updateJudgmentRatingsButton')).not.toBeDisabled();

    fireEvent.click(screen.getByTestId('updateJudgmentRatingsButton'));

    await waitFor(() =>
      expect(mockUpdateRatings).toHaveBeenCalledWith(
        'j1',
        [{ query: 'superhero action', docId: '5', rating: '0.9' }],
        undefined
      )
    );
    await waitFor(() => expect(mockRefresh).toHaveBeenCalled());
    expect(mockNotifications.toasts.addSuccess).toHaveBeenCalled();
    // Saving exits edit mode → save bar gone, Edit button back.
    await waitFor(() =>
      expect(screen.getByTestId('editJudgmentRatingsButton')).toBeInTheDocument()
    );
  });

  it('cancels edit mode and drops pending edits without calling the service', () => {
    render(
      <Router history={history}>
        <JudgmentView {...editableProps} />
      </Router>
    );

    enterEditMode();
    fireEvent.change(screen.getByRole('spinbutton'), { target: { value: '0.7' } });
    expect(screen.getByText('1 unsaved change')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Cancel'));

    // Back to read-only: no editor, service never called, stored value shown.
    expect(screen.queryByRole('spinbutton')).not.toBeInTheDocument();
    expect(mockUpdateRatings).not.toHaveBeenCalled();
    expect(screen.getByText('0.4')).toBeInTheDocument();
    expect(screen.getByTestId('editJudgmentRatingsButton')).toBeInTheDocument();
  });

  it('rejects an out-of-range rating with a danger toast and no request', async () => {
    render(
      <Router history={history}>
        <JudgmentView {...editableProps} />
      </Router>
    );

    enterEditMode();
    fireEvent.change(screen.getByRole('spinbutton'), { target: { value: '5' } });
    fireEvent.click(screen.getByTestId('updateJudgmentRatingsButton'));

    await waitFor(() =>
      expect(mockNotifications.toasts.addDanger).toHaveBeenCalled()
    );
    expect(mockUpdateRatings).not.toHaveBeenCalled();
  });

  it('surfaces a 409 conflict as a warning toast', async () => {
    mockUpdateRatings.mockRejectedValue({ body: { statusCode: 409 } });

    render(
      <Router history={history}>
        <JudgmentView {...editableProps} />
      </Router>
    );

    enterEditMode();
    fireEvent.change(screen.getByRole('spinbutton'), { target: { value: '0.9' } });
    fireEvent.click(screen.getByTestId('updateJudgmentRatingsButton'));

    await waitFor(() =>
      expect(mockNotifications.toasts.addWarning).toHaveBeenCalled()
    );
    expect(mockRefresh).not.toHaveBeenCalled();
  });

  it('renders a single Relevant/Irrelevant dropdown for RELEVANT_IRRELEVANT judgments', () => {
    mockUseJudgmentView.mockReturnValue({
      judgment: {
        ...score01Judgment,
        metadata: { llmJudgmentRatingType: 'RELEVANT_IRRELEVANT' },
        judgmentRatings: [{ query: 'q', ratings: [{ docId: '1', rating: '1.0' }] }],
      },
      loading: false,
      error: null,
      refresh: mockRefresh,
    } as any);

    render(
      <Router history={history}>
        <JudgmentView {...editableProps} />
      </Router>
    );

    enterEditMode();

    // Binary editor uses a select, not a number input.
    expect(screen.queryByRole('spinbutton')).not.toBeInTheDocument();
    expect(screen.getByText('Relevant (1.0)')).toBeInTheDocument();
  });

  it('lets a failed document be rated and saves it into the ratings shape', async () => {
    mockUpdateRatings.mockResolvedValue(undefined);
    mockUseJudgmentView.mockReturnValue({
      judgment: {
        ...score01Judgment,
        judgmentRatings: [
          {
            query: 'superhero action',
            ratings: [{ docId: '5', rating: '0.4' }],
            failures: [{ docId: '13' }],
          },
        ],
      },
      loading: false,
      error: null,
      refresh: mockRefresh,
    } as any);

    render(
      <Router history={history}>
        <JudgmentView {...editableProps} />
      </Router>
    );

    // The Failed Documents section renders and its failed doc is shown.
    expect(screen.getByText('Failed Documents')).toBeInTheDocument();
    expect(screen.getByText('13')).toBeInTheDocument();

    enterEditMode();

    // Two editable number inputs now exist: one for the rated doc, one for the failed doc.
    const inputs = screen.getAllByRole('spinbutton');
    expect(inputs).toHaveLength(2);

    // The failed-doc editor starts empty; assign it a rating.
    const failedInput = inputs.find((el) => (el as HTMLInputElement).value === '')!;
    fireEvent.change(failedInput, { target: { value: '0.6' } });

    expect(screen.getByText('1 unsaved change')).toBeInTheDocument();

    fireEvent.click(screen.getByTestId('updateJudgmentRatingsButton'));

    await waitFor(() =>
      expect(mockUpdateRatings).toHaveBeenCalledWith(
        'j1',
        [{ query: 'superhero action', docId: '13', rating: '0.6' }],
        undefined
      )
    );
    await waitFor(() => expect(mockRefresh).toHaveBeenCalled());
  });

  it('does not offer editing for non-LLM judgments', () => {
    mockUseJudgmentView.mockReturnValue({
      judgment: { ...score01Judgment, type: 'UBI_JUDGMENT' },
      loading: false,
      error: null,
      refresh: mockRefresh,
    } as any);

    render(
      <Router history={history}>
        <JudgmentView {...editableProps} />
      </Router>
    );

    // No Edit button and no editors — ratings stay read-only.
    expect(screen.queryByTestId('editJudgmentRatingsButton')).not.toBeInTheDocument();
    expect(screen.queryByRole('spinbutton')).not.toBeInTheDocument();
    expect(screen.getByText('0.4')).toBeInTheDocument();
  });

  it('does not offer editing for a non-COMPLETED LLM judgment', () => {
    mockUseJudgmentView.mockReturnValue({
      judgment: { ...score01Judgment, status: 'PROCESSING' },
      loading: false,
      error: null,
      refresh: mockRefresh,
    } as any);

    render(
      <Router history={history}>
        <JudgmentView {...editableProps} />
      </Router>
    );

    expect(screen.queryByTestId('editJudgmentRatingsButton')).not.toBeInTheDocument();
    expect(screen.queryByRole('spinbutton')).not.toBeInTheDocument();
  });
});
