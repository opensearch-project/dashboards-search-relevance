/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Router } from 'react-router-dom';
import { createMemoryHistory } from 'history';
import { JudgmentListing } from '../views/judgment_listing';
import * as hooks from '../hooks/use_judgment_list';
import { Routes } from '../../../../common';

// Mock the hook
jest.mock('../hooks/use_judgment_list');
jest.mock('../../../contexts/date_format_context', () => ({
  useConfig: () => ({ dateFormat: 'YYYY-MM-DD' }),
}));
jest.mock('../../common/DeleteModal', () => ({
  DeleteModal: ({ onClose, onConfirm, itemName }: any) => (
    <div data-test-subj="delete-modal">
      <span>Delete {itemName}?</span>
      <button onClick={onClose}>Cancel</button>
      <button onClick={onConfirm}>Confirm</button>
    </div>
  ),
}));

const mockHttp = {
  get: jest.fn(),
  delete: jest.fn(),
};

const mockUseJudgmentList = hooks.useJudgmentList as jest.MockedFunction<
  typeof hooks.useJudgmentList
>;

describe('JudgmentListing', () => {
  const history = createMemoryHistory();
  const defaultProps = {
    http: mockHttp,
    history,
    location: history.location,
    match: { params: {}, isExact: true, path: '', url: '' },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseJudgmentList.mockReturnValue({
      isLoading: false,
      error: null,
      judgments: [],
      hasProcessing: false,
      isBackgroundRefreshing: false,
      refreshKey: 0,
      findJudgments: jest.fn().mockResolvedValue({
        total: 1,
        hits: [
          {
            id: '1',
            name: 'Test Judgment',
            type: 'LLM',
            status: 'COMPLETED',
            timestamp: '2023-01-01T00:00:00Z',
          },
        ],
      }),
      deleteJudgment: jest.fn().mockResolvedValue(true),
    });
  });

  it('renders judgment listing', () => {
    render(
      <Router history={history}>
        <JudgmentListing {...defaultProps} />
      </Router>
    );

    expect(screen.getByText('Judgments')).toBeInTheDocument();
    expect(screen.getByText('Create Judgment')).toBeInTheDocument();
  });

  it('navigates to create page when create button is clicked', () => {
    render(
      <Router history={history}>
        <JudgmentListing {...defaultProps} />
      </Router>
    );

    fireEvent.click(screen.getByText('Create Judgment'));
    expect(history.location.pathname).toBe(Routes.JudgmentCreate);
  });

  it('shows error message when error exists', () => {
    mockUseJudgmentList.mockReturnValue({
      isLoading: false,
      error: 'Test error',
      judgments: [],
      hasProcessing: false,
      isBackgroundRefreshing: false,
      refreshKey: 0,
      findJudgments: jest.fn(),
      deleteJudgment: jest.fn(),
    });

    render(
      <Router history={history}>
        <JudgmentListing {...defaultProps} />
      </Router>
    );

    expect(screen.getByText('Test error')).toBeInTheDocument();
  });

  it('shows processing indicator when judgments are processing', () => {
    mockUseJudgmentList.mockReturnValue({
      isLoading: false,
      error: null,
      judgments: [
        { id: '1', name: 'Test', type: 'LLM', status: 'PROCESSING', timestamp: '2023-01-01' },
      ],
      hasProcessing: true,
      isBackgroundRefreshing: false,
      refreshKey: 0,
      findJudgments: jest.fn(),
      deleteJudgment: jest.fn(),
    });

    render(
      <Router history={history}>
        <JudgmentListing {...defaultProps} />
      </Router>
    );

    expect(screen.getByText(/Auto-refreshing for 10 min/)).toBeInTheDocument();
  });

  it('handles delete confirmation', async () => {
    const mockDelete = jest.fn().mockResolvedValue(true);
    const mockFindJudgments = jest.fn().mockResolvedValue({
      total: 1,
      hits: [
        {
          id: '1',
          name: 'Test Judgment',
          type: 'LLM',
          status: 'COMPLETED',
          timestamp: '2023-01-01T00:00:00Z',
        },
      ],
    });

    mockUseJudgmentList.mockReturnValue({
      isLoading: false,
      error: null,
      judgments: [],
      hasProcessing: false,
      isBackgroundRefreshing: false,
      refreshKey: 0,
      findJudgments: mockFindJudgments,
      deleteJudgment: mockDelete,
    });

    render(
      <Router history={history}>
        <JudgmentListing {...defaultProps} />
      </Router>
    );

    // Wait for table to load and find delete button
    await waitFor(() => {
      const deleteButtons = screen.getAllByLabelText('Delete');
      expect(deleteButtons.length).toBeGreaterThan(0);
      fireEvent.click(deleteButtons[0]);
    });

    expect(screen.getByTestId('delete-modal')).toBeInTheDocument();

    // Confirm delete
    fireEvent.click(screen.getByText('Confirm'));

    expect(mockDelete).toHaveBeenCalledWith('1');
  });
});
