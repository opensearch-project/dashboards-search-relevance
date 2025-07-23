/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { QueryPreview } from '../components/query_preview';

describe('QueryPreview', () => {
  it('renders nothing when no queries are provided', () => {
    const { container } = render(<QueryPreview parsedQueries={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders preview with queries correctly', () => {
    const mockQueries = [
      JSON.stringify({ queryText: 'test query 1', referenceAnswer: 'answer 1' }),
      JSON.stringify({ queryText: 'test query 2', referenceAnswer: 'answer 2' }),
      JSON.stringify({ queryText: 'test query 3', referenceAnswer: 'answer 3' }),
    ];

    render(<QueryPreview parsedQueries={mockQueries} />);

    expect(screen.getByText('Preview (3 queries)')).toBeInTheDocument();
    expect(screen.getByText(/test query 1/)).toBeInTheDocument();
    expect(screen.getByText(/answer 1/)).toBeInTheDocument();
    expect(screen.getByText(/test query 2/)).toBeInTheDocument();
    expect(screen.getByText(/answer 2/)).toBeInTheDocument();
    expect(screen.getByText(/test query 3/)).toBeInTheDocument();
    expect(screen.getByText(/answer 3/)).toBeInTheDocument();
  });

  it('shows truncated preview for more than 5 queries', () => {
    const mockQueries = Array(10)
      .fill(0)
      .map((_, i) =>
        JSON.stringify({
          queryText: `test query ${i + 1}`,
          referenceAnswer: `answer ${i + 1}`,
        })
      );

    render(<QueryPreview parsedQueries={mockQueries} />);

    expect(screen.getByText('Preview (10 queries)')).toBeInTheDocument();
    expect(screen.getByText(/test query 1/)).toBeInTheDocument();
    expect(screen.getByText(/test query 5/)).toBeInTheDocument();
    expect(screen.queryByText(/test query 6/)).not.toBeInTheDocument();
    expect(screen.getByText('... and 5 more queries')).toBeInTheDocument();
  });

  it('handles queries without reference answers', () => {
    const mockQueries = [
      JSON.stringify({ queryText: 'test query 1' }),
      JSON.stringify({ queryText: 'test query 2', referenceAnswer: '' }),
    ];

    render(<QueryPreview parsedQueries={mockQueries} />);

    expect(screen.getByText('Preview (2 queries)')).toBeInTheDocument();
    expect(screen.getByText('test query 1')).toBeInTheDocument();
    expect(screen.getByText('test query 2')).toBeInTheDocument();
  });
});
