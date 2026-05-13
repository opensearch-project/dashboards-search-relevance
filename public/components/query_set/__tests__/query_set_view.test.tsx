/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { QuerySetView } from '../views/query_set_view';

// Mock dependencies
jest.mock('../hooks/use_query_set_view');
jest.mock('../components/query_set_details', () => ({
  QuerySetDetails: ({ querySet }: any) => (
    <div data-testid="query-set-details">
      <span data-testid="query-set-name">{querySet.name}</span>
    </div>
  ),
}));

const mockUseQuerySetView = require('../hooks/use_query_set_view')
  .useQuerySetView as jest.MockedFunction<any>;

const mockHttp = {
  get: jest.fn(),
};

const defaultProps = {
  http: mockHttp as any,
  id: 'test-id',
  history: {} as any,
  location: {} as any,
  match: { params: { id: 'test-id' } } as any,
};

describe('QuerySetView', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders loading state', () => {
    mockUseQuerySetView.mockReturnValue({
      querySet: null,
      loading: true,
      error: null,
    });

    render(<QuerySetView {...defaultProps} />);
    expect(screen.getByText('Loading query set data...')).toBeInTheDocument();
  });

  it('renders error state', () => {
    mockUseQuerySetView.mockReturnValue({
      querySet: null,
      loading: false,
      error: 'Error loading query set data',
    });

    render(<QuerySetView {...defaultProps} />);
    expect(screen.getByText('Error loading query set data')).toBeInTheDocument();
  });

  it('renders query set data', () => {
    const mockQuerySet = {
      id: 'test-id',
      name: 'Test Query Set',
      description: 'Test description',
      sampling: 'random',
      querySetQueries: [{ queryText: 'test query 1' }, { queryText: 'test query 2' }],
    };

    mockUseQuerySetView.mockReturnValue({
      querySet: mockQuerySet,
      loading: false,
      error: null,
    });

    const { container } = render(<QuerySetView {...defaultProps} />);

    expect(screen.getByText('Query Set Details')).toBeInTheDocument();
    expect(container.querySelector('[data-testid="query-set-details"]')).toBeTruthy();
    expect(container.querySelector('[data-testid="query-set-name"]')?.textContent).toBe(
      'Test Query Set'
    );
  });

  it('handles no matching query set', () => {
    mockUseQuerySetView.mockReturnValue({
      querySet: null,
      loading: false,
      error: 'No matching query set found',
    });

    render(<QuerySetView {...defaultProps} />);
    expect(screen.getByText('No matching query set found')).toBeInTheDocument();
  });

  it('calls useQuerySetView with correct parameters', () => {
    mockUseQuerySetView.mockReturnValue({
      querySet: null,
      loading: true,
      error: null,
    });

    render(<QuerySetView {...defaultProps} />);
    expect(mockUseQuerySetView).toHaveBeenCalledWith(mockHttp, 'test-id', undefined);
  });
});
