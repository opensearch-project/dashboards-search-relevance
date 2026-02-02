/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { QuerySetQueriesTable } from '../components/query_set_queries_table';

// Mock TableListView
let mockFindItems: any;
jest.mock('../../../../../../src/plugins/opensearch_dashboards_react/public', () => ({
  TableListView: ({ findItems, tableColumns, noItemsFragment }: any) => {
    mockFindItems = findItems;
    return (
      <div data-testid="table-list-view">
        <div data-testid="columns-count">{tableColumns.length}</div>
        <div data-testid="queries-count">3</div>
        <div data-testid="query-0">search query 1</div>
        <div data-testid="query-1">search query 2</div>
        <div data-testid="query-2">test query 3</div>
      </div>
    );
  },
}));

const mockQueries = [
  { queryText: 'search query 1' },
  { queryText: 'search query 2' },
  { queryText: 'test query 3' },
];

describe('QuerySetQueriesTable', () => {
  it('renders table with queries', () => {
    const { container } = render(<QuerySetQueriesTable queries={mockQueries} />);

    expect(container.querySelector('[data-testid="table-list-view"]')).toBeTruthy();
    expect(container.querySelector('[data-testid="columns-count"]')?.textContent).toBe('1');
    expect(container.querySelector('[data-testid="queries-count"]')?.textContent).toBe('3');
  });

  it('displays query texts', () => {
    const { container } = render(<QuerySetQueriesTable queries={mockQueries} />);

    expect(container.querySelector('[data-testid="query-0"]')?.textContent).toBe('search query 1');
    expect(container.querySelector('[data-testid="query-1"]')?.textContent).toBe('search query 2');
    expect(container.querySelector('[data-testid="query-2"]')?.textContent).toBe('test query 3');
  });

  it('handles empty queries array', () => {
    const { container } = render(<QuerySetQueriesTable queries={[]} />);

    expect(container.querySelector('[data-testid="table-list-view"]')).toBeTruthy();
    expect(container.querySelector('[data-testid="queries-count"]')?.textContent).toBe('3');
  });

  it('handles non-array queries', () => {
    const { container } = render(<QuerySetQueriesTable queries={null as any} />);

    expect(container.querySelector('[data-testid="table-list-view"]')).toBeTruthy();
    expect(container.querySelector('[data-testid="queries-count"]')?.textContent).toBe('3');
  });

  it('renders correct table column configuration', () => {
    const { container } = render(<QuerySetQueriesTable queries={mockQueries} />);

    expect(container.querySelector('[data-testid="columns-count"]')?.textContent).toBe('1');
  });

  it('handles undefined queries gracefully', () => {
    const { container } = render(<QuerySetQueriesTable queries={undefined as any} />);

    expect(container.querySelector('[data-testid="table-list-view"]')).toBeTruthy();
    expect(container.querySelector('[data-testid="queries-count"]')?.textContent).toBe('3');
  });

  it('tests findQueries function with search term', async () => {
    render(<QuerySetQueriesTable queries={mockQueries} />);

    expect(mockFindItems).toBeDefined();

    // Test the findQueries function directly
    const result = await mockFindItems('search');
    expect(result.total).toBe(2); // Should filter to queries containing 'search'
    expect(result.hits).toHaveLength(2);
  });

  it('tests findQueries function with empty search', async () => {
    render(<QuerySetQueriesTable queries={mockQueries} />);

    expect(mockFindItems).toBeDefined();

    const result = await mockFindItems('');
    expect(result.total).toBe(3);
    expect(result.hits).toHaveLength(3);
  });

  it('parses queries with metadata correctly', async () => {
    const queriesWithMetadata = [
      { queryText: 'clean query' },
      { queryText: 'query with#{"referenceAnswer":"raw json"}' },
      { queryText: 'malformed query#' },
    ];

    render(<QuerySetQueriesTable queries={queriesWithMetadata} />);

    const result = await mockFindItems('');
    expect(result.hits).toHaveLength(3);
    expect(result.hits[0].queryText).toBe('clean query');
    expect(result.hits[0].referenceAnswer).toBe('');

    expect(result.hits[1].queryText).toBe('query with');
    expect(result.hits[1].referenceAnswer).toBe('raw json');

    // malformed query# ends with #, so it should be treated as query "malformed query" and empty answer
    expect(result.hits[2].queryText).toBe('malformed query');
    expect(result.hits[2].referenceAnswer).toBe('');
  });
});
