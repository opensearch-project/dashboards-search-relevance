/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { ResultsPanel } from '../components/results_panel';

describe('ResultsPanel', () => {
  const mockResults = {
    hits: {
      hits: [
        {
          _id: '1',
          _source: { title: 'Test Document 1', content: 'Test content 1' },
        },
        {
          _id: '2',
          _source: { title: 'Test Document 2', content: 'Test content 2' },
        },
      ],
    },
  };

  it('should render results when provided', () => {
    render(<ResultsPanel isValidating={false} searchResults={mockResults} />);

    expect(screen.getByText('Search Results (2 hits)')).toBeInTheDocument();
    expect(screen.getByText('Test Document 1')).toBeInTheDocument();
    expect(screen.getByText('Test Document 2')).toBeInTheDocument();
  });

  it('should render loading spinner when validating', () => {
    const { container } = render(<ResultsPanel isValidating={true} searchResults={null} />);

    expect(container.querySelector('.euiLoadingSpinner')).toBeInTheDocument();
  });

  it('should render nothing when results are null', () => {
    const { container } = render(<ResultsPanel isValidating={false} searchResults={null} />);

    expect(container.firstChild).toBeNull();
  });

  it('should render nothing when results are empty', () => {
    const emptyResults = { hits: { hits: [] } };
    const { container } = render(
      <ResultsPanel isValidating={false} searchResults={emptyResults} />
    );

    expect(container.firstChild).toBeNull();
  });

  it('should display document IDs', () => {
    render(<ResultsPanel isValidating={false} searchResults={mockResults} />);

    expect(screen.getAllByText('1')).toHaveLength(2); // Rank and ID columns
    expect(screen.getAllByText('2')).toHaveLength(2); // Rank and ID columns
  });
});
