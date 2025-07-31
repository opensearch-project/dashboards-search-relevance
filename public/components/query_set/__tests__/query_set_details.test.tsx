/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { QuerySetDetails } from '../components/query_set_details';

// Mock the queries table component
jest.mock('../components/query_set_queries_table', () => ({
  QuerySetQueriesTable: ({ queries }: any) => (
    <div data-testid="queries-table">
      <span data-testid="queries-count">{queries.length}</span>
    </div>
  ),
}));

const mockQuerySet = {
  name: 'Test Query Set',
  description: 'Test description for query set',
  sampling: 'random',
  querySetQueries: [
    { queryText: 'test query 1' },
    { queryText: 'test query 2' },
    { queryText: 'test query 3' },
  ],
};

describe('QuerySetDetails', () => {
  it('renders query set information correctly', () => {
    render(<QuerySetDetails querySet={mockQuerySet} />);

    expect(screen.getByText('Test Query Set')).toBeInTheDocument();
    expect(screen.getByText('Test description for query set')).toBeInTheDocument();
    expect(screen.getByText('random')).toBeInTheDocument();
  });

  it('renders form labels correctly', () => {
    render(<QuerySetDetails querySet={mockQuerySet} />);

    expect(screen.getByText('Query Set Name')).toBeInTheDocument();
    expect(screen.getByText('Description')).toBeInTheDocument();
    expect(screen.getByText('Sampling Method')).toBeInTheDocument();
    expect(screen.getByText('Queries')).toBeInTheDocument();
  });

  it('passes queries to QuerySetQueriesTable', () => {
    const { container } = render(<QuerySetDetails querySet={mockQuerySet} />);

    expect(container.querySelector('[data-testid="queries-table"]')).toBeTruthy();
    expect(container.querySelector('[data-testid="queries-count"]')?.textContent).toBe('3');
  });

  it('handles empty queries array', () => {
    const querySetWithNoQueries = {
      ...mockQuerySet,
      querySetQueries: [],
    };

    const { container } = render(<QuerySetDetails querySet={querySetWithNoQueries} />);

    expect(container.querySelector('[data-testid="queries-count"]')?.textContent).toBe('0');
  });

  it('handles undefined queries', () => {
    const querySetWithUndefinedQueries = {
      ...mockQuerySet,
      querySetQueries: undefined as any,
    };

    const { container } = render(<QuerySetDetails querySet={querySetWithUndefinedQueries} />);

    expect(container.querySelector('[data-testid="queries-table"]')).toBeTruthy();
  });

  it('renders with different sampling methods', () => {
    const querySetWithDifferentSampling = {
      ...mockQuerySet,
      sampling: 'systematic',
    };

    render(<QuerySetDetails querySet={querySetWithDifferentSampling} />);

    expect(screen.getByText('systematic')).toBeInTheDocument();
  });
});
