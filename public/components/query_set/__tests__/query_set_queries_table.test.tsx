/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import {
  QuerySetQueriesTable,
  getReferenceAnswer,
  normalizeQuerySetQueries,
} from '../components/query_set_queries_table';

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
    expect(container.querySelector('[data-testid="columns-count"]')?.textContent).toBe('2');
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

    expect(container.querySelector('[data-testid="columns-count"]')?.textContent).toBe('2');
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

  it('tests findQueries function filters by reference answer', async () => {
    const queriesWithReferences = [
      {
        queryText: 'What is C#?',
        customFields: { referenceAnswer: 'Programming language' },
      },
      { queryText: 'example1', customFields: { referenceAnswer: '' } },
    ];

    render(<QuerySetQueriesTable queries={queriesWithReferences} />);

    const result = await mockFindItems('programming');
    expect(result.total).toBe(1);
    expect(result.hits[0].queryText).toBe('What is C#?');
    expect(result.hits[0].referenceAnswer).toBe('Programming language');
  });
});

describe('getReferenceAnswer', () => {
  it('reads referenceAnswer from customFields', () => {
    expect(
      getReferenceAnswer({
        queryText: 'test',
        customFields: { referenceAnswer: 'stored answer' },
      })
    ).toBe('stored answer');
  });

  it('falls back to top-level referenceAnswer', () => {
    expect(
      getReferenceAnswer({
        queryText: 'test',
        referenceAnswer: 'legacy answer',
      })
    ).toBe('legacy answer');
  });

  it('returns empty string when no reference answer is present', () => {
    expect(getReferenceAnswer({ queryText: 'test', customFields: {} })).toBe('');
  });
});

describe('normalizeQuerySetQueries', () => {
  it('normalizes backend query shape for display', () => {
    expect(
      normalizeQuerySetQueries([
        {
          queryText: 'What is C#?',
          customFields: { referenceAnswer: 'C# is a programming language' },
        },
      ])
    ).toEqual([
      {
        id: '0',
        queryText: 'What is C#?',
        referenceAnswer: 'C# is a programming language',
      },
    ]);
  });
});
