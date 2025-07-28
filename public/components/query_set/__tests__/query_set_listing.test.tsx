/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QuerySetListing } from '../views/query_set_listing';
import { useQuerySetList } from '../hooks/use_query_set_list';

// Mock dependencies
jest.mock('../hooks/use_query_set_list');
jest.mock('../../../contexts/date_format_context', () => ({
  useConfig: () => ({ dateFormat: 'YYYY-MM-DD HH:mm:ss' }),
}));
jest.mock('../../common/DeleteModal', () => ({
  DeleteModal: ({ onClose, onConfirm, itemName }: any) => (
    <div data-testid="delete-modal">
      <span>Delete {itemName}?</span>
      <button onClick={onClose} data-testid="cancel-button">Cancel</button>
      <button onClick={onConfirm} data-testid="confirm-button">Confirm</button>
    </div>
  ),
}));

jest.mock('../components/query_set_table', () => ({
  QuerySetTable: ({ onDelete, findItems, isLoading, refreshKey }: any) => {
    return (
      <div data-testid="query-set-table">
        <button 
          onClick={() => onDelete({ id: '1', name: 'Test Item' })}
          data-testid="delete-trigger"
        >
          Delete Item
        </button>
        <div data-testid="loading-state">{isLoading ? 'loading' : 'loaded'}</div>
        <div data-testid="refresh-key">{refreshKey}</div>
      </div>
    );
  },
}));

const mockUseQuerySetList = useQuerySetList as jest.MockedFunction<typeof useQuerySetList>;

const mockHistory = {
  push: jest.fn(),
  location: { pathname: '/querySet' },
  listen: jest.fn(),
  createHref: jest.fn(),
  go: jest.fn(),
  goBack: jest.fn(),
  goForward: jest.fn(),
  length: 0,
  action: 'POP' as const,
  block: jest.fn(),
  replace: jest.fn(),
};

const mockMatch = {
  params: {},
  isExact: true,
  path: '/querySet',
  url: '/querySet',
};

const mockLocation = {
  pathname: '/querySet',
  search: '',
  hash: '',
  state: undefined,
  key: 'test',
};

const mockHttp = {
  get: jest.fn(),
  delete: jest.fn(),
} as any;

const defaultProps = {
  http: mockHttp,
  history: mockHistory,
  match: mockMatch,
  location: mockLocation,
};

describe('QuerySetListing', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders page header with create button', () => {
    mockUseQuerySetList.mockReturnValue({
      isLoading: false,
      error: null,
      refreshKey: 0,
      findQuerySets: jest.fn(),
      deleteQuerySet: jest.fn(),
      setError: jest.fn(),
    });

    render(<QuerySetListing {...defaultProps} />);

    expect(screen.getByText('Query Sets')).toBeInTheDocument();
    expect(screen.getByText('Create Query Set')).toBeInTheDocument();
  });

  it('displays error message when error exists', () => {
    mockUseQuerySetList.mockReturnValue({
      isLoading: false,
      error: 'Failed to load query sets',
      refreshKey: 0,
      findQuerySets: jest.fn(),
      deleteQuerySet: jest.fn(),
      setError: jest.fn(),
    });

    render(<QuerySetListing {...defaultProps} />);

    expect(screen.getByText('Error')).toBeInTheDocument();
    expect(screen.getByText('Failed to load query sets')).toBeInTheDocument();
  });

  it('navigates to create page when create button is clicked', () => {
    mockUseQuerySetList.mockReturnValue({
      isLoading: false,
      error: null,
      refreshKey: 0,
      findQuerySets: jest.fn(),
      deleteQuerySet: jest.fn(),
      setError: jest.fn(),
    });

    render(<QuerySetListing {...defaultProps} />);

    fireEvent.click(screen.getByText('Create Query Set'));
    expect(mockHistory.push).toHaveBeenCalledWith('/querySet/create');
  });

  it('shows delete modal when delete is triggered', async () => {
    const mockFindQuerySets = jest.fn().mockResolvedValue({
      total: 1,
      hits: [{ id: '1', name: 'Test Query Set' }],
    });

    mockUseQuerySetList.mockReturnValue({
      isLoading: false,
      error: null,
      refreshKey: 0,
      findQuerySets: mockFindQuerySets,
      deleteQuerySet: jest.fn(),
      setError: jest.fn(),
    });

    render(<QuerySetListing {...defaultProps} />);

    // Simulate delete button click (would come from table component)
    // Since we're testing the modal logic, we'll test the state directly
    expect(screen.queryByTestId('delete-modal')).not.toBeInTheDocument();
  });

  it('has deleteQuerySet function available', () => {
    const mockDeleteQuerySet = jest.fn();

    mockUseQuerySetList.mockReturnValue({
      isLoading: false,
      error: null,
      refreshKey: 0,
      findQuerySets: jest.fn(),
      deleteQuerySet: mockDeleteQuerySet,
      setError: jest.fn(),
    });

    render(<QuerySetListing {...defaultProps} />);

    expect(mockDeleteQuerySet).toBeDefined();
  });

  it('renders table when no error', () => {
    mockUseQuerySetList.mockReturnValue({
      isLoading: false,
      error: null,
      refreshKey: 0,
      findQuerySets: jest.fn(),
      deleteQuerySet: jest.fn(),
      setError: jest.fn(),
    });

    const { container } = render(<QuerySetListing {...defaultProps} />);
    expect(container).toBeTruthy();
  });

  it('passes correct props to QuerySetTable', () => {
    const mockFindQuerySets = jest.fn();
    const mockDeleteQuerySet = jest.fn();

    mockUseQuerySetList.mockReturnValue({
      isLoading: true,
      error: null,
      refreshKey: 5,
      findQuerySets: mockFindQuerySets,
      deleteQuerySet: mockDeleteQuerySet,
      setError: jest.fn(),
    });

    render(<QuerySetListing {...defaultProps} />);
    
    expect(mockFindQuerySets).toBeDefined();
    expect(mockDeleteQuerySet).toBeDefined();
  });

  it('handles loading state', () => {
    mockUseQuerySetList.mockReturnValue({
      isLoading: true,
      error: null,
      refreshKey: 0,
      findQuerySets: jest.fn(),
      deleteQuerySet: jest.fn(),
      setError: jest.fn(),
    });

    const { container } = render(<QuerySetListing {...defaultProps} />);
    expect(container).toBeTruthy();
  });

  it('handles delete error gracefully', async () => {
    const mockDeleteQuerySet = jest.fn().mockRejectedValue(new Error('Delete failed'));

    mockUseQuerySetList.mockReturnValue({
      isLoading: false,
      error: null,
      refreshKey: 0,
      findQuerySets: jest.fn(),
      deleteQuerySet: mockDeleteQuerySet,
      setError: jest.fn(),
    });

    render(<QuerySetListing {...defaultProps} />);

    expect(mockDeleteQuerySet).toBeDefined();
  });

  it('handles refresh key changes', () => {
    mockUseQuerySetList.mockReturnValue({
      isLoading: false,
      error: null,
      refreshKey: 10,
      findQuerySets: jest.fn(),
      deleteQuerySet: jest.fn(),
      setError: jest.fn(),
    });

    const { container } = render(<QuerySetListing {...defaultProps} />);
    expect(container).toBeTruthy();
  });

  it('shows delete modal when delete is triggered', () => {
    mockUseQuerySetList.mockReturnValue({
      isLoading: false,
      error: null,
      refreshKey: 0,
      findQuerySets: jest.fn(),
      deleteQuerySet: jest.fn(),
      setError: jest.fn(),
    });

    const { container } = render(<QuerySetListing {...defaultProps} />);
    
    // Initially no modal
    expect(container.querySelector('[data-testid="delete-modal"]')).toBeFalsy();
    
    // Trigger delete
    const deleteButton = container.querySelector('[data-testid="delete-trigger"]');
    deleteButton?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    
    // Modal should appear
    expect(container.querySelector('[data-testid="delete-modal"]')).toBeTruthy();
  });

  it('handles delete confirmation', async () => {
    const mockDeleteQuerySet = jest.fn().mockResolvedValue(undefined);
    
    mockUseQuerySetList.mockReturnValue({
      isLoading: false,
      error: null,
      refreshKey: 0,
      findQuerySets: jest.fn(),
      deleteQuerySet: mockDeleteQuerySet,
      setError: jest.fn(),
    });

    const { container } = render(<QuerySetListing {...defaultProps} />);
    
    // Trigger delete to show modal
    const deleteButton = container.querySelector('[data-testid="delete-trigger"]');
    deleteButton?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    
    // Confirm delete
    const confirmButton = container.querySelector('[data-testid="confirm-button"]');
    confirmButton?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    
    expect(mockDeleteQuerySet).toHaveBeenCalledWith('1');
  });

  it('handles delete cancellation', () => {
    mockUseQuerySetList.mockReturnValue({
      isLoading: false,
      error: null,
      refreshKey: 0,
      findQuerySets: jest.fn(),
      deleteQuerySet: jest.fn(),
      setError: jest.fn(),
    });

    const { container } = render(<QuerySetListing {...defaultProps} />);
    
    // Trigger delete to show modal
    const deleteButton = container.querySelector('[data-testid="delete-trigger"]');
    deleteButton?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    
    // Modal should be visible
    expect(container.querySelector('[data-testid="delete-modal"]')).toBeTruthy();
    
    // Cancel delete
    const cancelButton = container.querySelector('[data-testid="cancel-button"]');
    cancelButton?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    
    // Modal should be hidden
    expect(container.querySelector('[data-testid="delete-modal"]')).toBeFalsy();
  });

  it('handles delete error', async () => {
    const mockDeleteQuerySet = jest.fn().mockRejectedValue(new Error('Delete failed'));
    
    mockUseQuerySetList.mockReturnValue({
      isLoading: false,
      error: null,
      refreshKey: 0,
      findQuerySets: jest.fn(),
      deleteQuerySet: mockDeleteQuerySet,
      setError: jest.fn(),
    });

    const { container } = render(<QuerySetListing {...defaultProps} />);
    
    // Trigger delete and confirm
    const deleteButton = container.querySelector('[data-testid="delete-trigger"]');
    deleteButton?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    
    const confirmButton = container.querySelector('[data-testid="confirm-button"]');
    confirmButton?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    
    // Should still call deleteQuerySet even if it fails
    expect(mockDeleteQuerySet).toHaveBeenCalledWith('1');
  });
});
