/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { VisualComparison, convertFromSearchResult } from '../visual_comparison';

const mockQueryResult1 = [
  { _id: '1', _score: 0.9, rank: 1, title: 'Test Document 1' },
  { _id: '2', _score: 0.8, rank: 2, title: 'Test Document 2' },
];

const mockQueryResult2 = [
  { _id: '1', _score: 0.85, rank: 2, title: 'Test Document 1' },
  { _id: '3', _score: 0.75, rank: 1, title: 'Test Document 3' },
];

const mockSearchResult = {
  hits: {
    hits: [
      {
        _id: '1',
        _score: 0.9,
        _source: { title: 'Test Document 1' },
        highlight: { title: ['<em>Test</em> Document 1'] },
      },
    ],
  },
};

const defaultProps = {
  queryResult1: mockQueryResult1,
  queryResult2: mockQueryResult2,
  queryText: 'test query',
  resultText1: 'Result 1',
  resultText2: 'Result 2',
};

describe('VisualComparison', () => {
  it('renders without crashing', () => {
    render(<VisualComparison {...defaultProps} />);
    expect(screen.getByText('Results for query:')).toBeInTheDocument();
  });

  it('displays query text', () => {
    render(<VisualComparison {...defaultProps} />);
    expect(screen.getByText('test query')).toBeInTheDocument();
  });

  it('shows field selector dropdown', () => {
    render(<VisualComparison {...defaultProps} />);
    expect(screen.getByText('Display Field:')).toBeInTheDocument();
  });

  it('shows size selector dropdown', () => {
    render(<VisualComparison {...defaultProps} />);
    expect(screen.getByText('Size:')).toBeInTheDocument();
  });

  it('displays result headers', () => {
    render(<VisualComparison {...defaultProps} />);
    expect(screen.getByText('Result 1')).toBeInTheDocument();
    expect(screen.getByText('Result 2')).toBeInTheDocument();
  });

  it('shows statistics in venn diagram', () => {
    render(<VisualComparison {...defaultProps} />);
    expect(screen.getAllByText('Unique')).toHaveLength(2);
    expect(screen.getByText('Common')).toBeInTheDocument();
  });

  it('shows empty prompt when results are not arrays', () => {
    render(<VisualComparison {...defaultProps} queryResult1={null} queryResult2={null} />);
    expect(screen.getByText('You need two Setups to display comparison.')).toBeInTheDocument();
  });

  it('handles empty results arrays', () => {
    render(<VisualComparison {...defaultProps} queryResult1={[]} queryResult2={[]} />);
    expect(screen.getAllByText('(0 results)')).toHaveLength(2);
  });
});

describe('convertFromSearchResult', () => {
  it('converts search result correctly', () => {
    const result = convertFromSearchResult(mockSearchResult);
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      _id: '1',
      _score: 0.9,
      rank: 1,
      highlight: { title: ['<em>Test</em> Document 1'] },
      title: 'Test Document 1',
    });
  });

  it('returns undefined for invalid search result', () => {
    const result = convertFromSearchResult({});
    expect(result).toBeUndefined();
  });

  it('returns undefined for null input', () => {
    const result = convertFromSearchResult(null);
    expect(result).toBeUndefined();
  });

  it('returns undefined for undefined input', () => {
    const result = convertFromSearchResult(undefined);
    expect(result).toBeUndefined();
  });

  it('correctly applies status colors for elements in both results', () => {
    const { container } = render(<VisualComparison {...defaultProps} />);

    // Find the parent container by its ID
    const result2ItemsContainer = container.querySelector('#result2-items');
    expect(result2ItemsContainer).toBeInTheDocument();

    // Find the specific result item within the container by its ID
    const result2Item1 = result2ItemsContainer.querySelector('#r2-item-1');
    expect(result2Item1).toBeInTheDocument();

    // Assert that the element with class 'bg-unchanged' exists inside the specific item
    const commonElement = result2Item1.querySelector('.bg-unchanged');
    expect(commonElement).toBeInTheDocument();
  });

  it('correctly applies status colors for elements only in left result', () => {
    const { container } = render(<VisualComparison {...defaultProps} />);

    // Find the parent container by its ID
    const result1ItemsContainer = container.querySelector('#result1-items');
    expect(result1ItemsContainer).toBeInTheDocument();

    // Find the specific result item within the container by its ID
    const result1Item2 = result1ItemsContainer.querySelector('#r1-item-2');
    expect(result1Item2).toBeInTheDocument();

    // Assert that the element with class 'bg-unchanged' exists inside the specific item
    const commonElement = result1Item2.querySelector('.bg-result-set-1');
    expect(commonElement).toBeInTheDocument();
  });

  it('correctly applies status colors for elements only in right result', () => {
    const { container } = render(<VisualComparison {...defaultProps} />);

    // Find the parent container by its ID
    const result2ItemsContainer = container.querySelector('#result2-items');
    expect(result2ItemsContainer).toBeInTheDocument();

    // Find the specific result item within the container by its ID
    const result2Item2 = result2ItemsContainer.querySelector('#r2-item-3');
    expect(result2Item2).toBeInTheDocument();

    // Assert that the element with class 'bg-unchanged' exists inside the specific item
    const commonElement = result2Item2.querySelector('.bg-result-set-2');
    expect(commonElement).toBeInTheDocument();
  });

  it('shows ItemDetailHoverPane on item click', () => {
    render(<VisualComparison {...defaultProps} />);
    // Text is not there without click
    expect(screen.queryByText('Test Document 1')).not.toBeInTheDocument();
    // Click the first item by its unique ID
    fireEvent.click(document.getElementById('r1-item-1'));
    // Assert that the title from the mock data appears in the document
    expect(screen.getByText('Test Document 1')).toBeInTheDocument();
  });
});
