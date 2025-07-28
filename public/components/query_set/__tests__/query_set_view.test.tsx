/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { QuerySetView } from '../../query_set_view/query_set_view';

// Mock dependencies
jest.mock('../../../../../../src/plugins/opensearch_dashboards_react/public', () => ({
  TableListView: ({ findItems, noItemsFragment }: any) => (
    <div data-testid="table-view">
      {findItems ? 'Table with data' : noItemsFragment}
    </div>
  ),
}));

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
    mockHttp.get.mockImplementation(() => new Promise(() => {}));
    render(<QuerySetView {...defaultProps} />);
    expect(screen.getByText('Loading query set data...')).toBeInTheDocument();
  });

  it('renders error state', async () => {
    mockHttp.get.mockRejectedValue(new Error('Network error'));
    render(<QuerySetView {...defaultProps} />);
    
    await waitFor(() => {
      expect(screen.getByText('Error loading query set data')).toBeInTheDocument();
    });
  });

  it('renders query set data', async () => {
    const mockData = {
      hits: {
        hits: [{
          _source: {
            id: 'test-id',
            name: 'Test Query Set',
            description: 'Test description',
            sampling: 'random',
            querySetQueries: [
              { queryText: 'test query 1' },
              { queryText: 'test query 2' }
            ]
          }
        }]
      }
    };
    
    mockHttp.get.mockResolvedValue(mockData);
    render(<QuerySetView {...defaultProps} />);
    
    await waitFor(() => {
      expect(screen.getByText('Query Set Details')).toBeInTheDocument();
      expect(screen.getByText('Test Query Set')).toBeInTheDocument();
      expect(screen.getByText('Test description')).toBeInTheDocument();
      expect(screen.getByText('random')).toBeInTheDocument();
    });
  });

  it('handles no matching query set', async () => {
    const mockData = {
      hits: {
        hits: [{
          _source: {
            id: 'different-id',
            name: 'Different Query Set'
          }
        }]
      }
    };
    
    mockHttp.get.mockResolvedValue(mockData);
    render(<QuerySetView {...defaultProps} />);
    
    await waitFor(() => {
      expect(screen.getByText('No matching query set found')).toBeInTheDocument();
    });
  });
});