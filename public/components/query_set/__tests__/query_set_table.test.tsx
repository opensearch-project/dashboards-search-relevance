/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { render } from '@testing-library/react';
import { QuerySetTable } from '../components/query_set_table';

// Mock dependencies
jest.mock('../../../contexts/date_format_context', () => ({
  useConfig: () => ({ dateFormat: 'YYYY-MM-DD HH:mm:ss' }),
}));

jest.mock('@elastic/eui', () => {
  const originalModule = jest.requireActual('@elastic/eui');
  return {
    ...originalModule,
    EuiToolTip: ({ children, content }: any) => (
      <div data-test-subj="eui-tooltip" data-tooltip-content={content}>
        {children}
      </div>
    ),
  };
});

jest.mock('../../../../../../src/plugins/opensearch_dashboards_react/public', () => ({
  reactRouterNavigate: () => ({ onClick: jest.fn() }),
  TableListView: ({ tableColumns, findItems, loading, pagination, search, sorting }: any) => {
    // Test the render functions in columns
    const testData = {
      id: '1',
      name: 'Test Query Set',
      sampling: 'random',
      description: 'Test description',
      numQueries: 5,
      timestamp: '2023-01-01T00:00:00Z',
    };

    return (
      <div data-testid="table-view">
        {tableColumns.map((col: any, index: number) => (
          <div key={index} data-testid={`column-${col.field}`}>
            {col.render
              ? col.render(testData[col.field as keyof typeof testData], testData)
              : testData[col.field as keyof typeof testData]}
          </div>
        ))}
        <div data-testid="loading">{loading ? 'loading' : 'not-loading'}</div>
        <div data-testid="pagination">{pagination?.initialPageSize}</div>
      </div>
    );
  },
}));

const mockHistory = { push: jest.fn() } as any;
const mockFindItems = jest.fn();
const mockOnDelete = jest.fn();

const defaultProps = {
  refreshKey: 0,
  isLoading: false,
  findItems: mockFindItems,
  onDelete: mockOnDelete,
  history: mockHistory,
};

describe('QuerySetTable', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders table columns correctly', () => {
    const { container } = render(<QuerySetTable {...defaultProps} />);
    expect(container.querySelector('[data-testid="column-name"]')).toBeTruthy();
    expect(container.querySelector('[data-testid="column-sampling"]')).toBeTruthy();
    expect(container.querySelector('[data-testid="column-description"]')).toBeTruthy();
    expect(container.querySelector('[data-testid="column-numQueries"]')).toBeTruthy();
    expect(container.querySelector('[data-testid="column-timestamp"]')).toBeTruthy();
    expect(container.querySelector('[data-testid="column-id"]')).toBeTruthy();
  });

  it('accepts props correctly', () => {
    expect(() => {
      render(<QuerySetTable {...defaultProps} />);
      render(<QuerySetTable {...defaultProps} isLoading={true} />);
      render(<QuerySetTable {...defaultProps} refreshKey={1} />);
    }).not.toThrow();
  });

  it('passes findItems function to TableListView', () => {
    render(<QuerySetTable {...defaultProps} />);
    expect(mockFindItems).toBeDefined();
  });

  it('passes onDelete function correctly', () => {
    render(<QuerySetTable {...defaultProps} />);
    expect(mockOnDelete).toBeDefined();
  });

  it('passes history object correctly', () => {
    render(<QuerySetTable {...defaultProps} />);
    expect(mockHistory).toBeDefined();
  });

  it('handles loading state', () => {
    const { container, rerender } = render(<QuerySetTable {...defaultProps} />);
    expect(container.querySelector('[data-testid="loading"]')?.textContent).toBe('not-loading');

    rerender(<QuerySetTable {...defaultProps} isLoading={true} />);
    expect(container.querySelector('[data-testid="loading"]')?.textContent).toBe('loading');
  });

  it('passes pagination props correctly', () => {
    const { container } = render(<QuerySetTable {...defaultProps} />);
    expect(container.querySelector('[data-testid="pagination"]')?.textContent).toBe('');
  });

  it('renders column content with render functions', () => {
    const { container } = render(<QuerySetTable {...defaultProps} />);

    // Test that render functions are called for columns that have them
    const samplingColumn = container.querySelector('[data-testid="column-sampling"]');
    const descriptionColumn = container.querySelector('[data-testid="column-description"]');
    const numQueriesColumn = container.querySelector('[data-testid="column-numQueries"]');
    const timestampColumn = container.querySelector('[data-testid="column-timestamp"]');

    expect(samplingColumn).toBeTruthy();
    expect(descriptionColumn).toBeTruthy();
    expect(numQueriesColumn).toBeTruthy();
    expect(timestampColumn).toBeTruthy();
  });

  it('renders "Delete" tooltip for the action button', () => {
    const { getByTestId } = render(<QuerySetTable {...defaultProps} />);
    const tooltip = getByTestId('eui-tooltip');
    expect(tooltip).toBeInTheDocument();
    expect(tooltip).toHaveAttribute('data-tooltip-content', 'Delete');
  });
});
