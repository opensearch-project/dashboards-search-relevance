/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ValidationPanel } from '../components/validation_panel';

// Mock the ResultsPanel component
jest.mock('../components/results_panel', () => ({
  ResultsPanel: ({ isValidating, searchResults }: any) => (
    <div data-test-subj="results-panel">
      {isValidating && <div>Validating...</div>}
      {searchResults && <div>Search Results</div>}
    </div>
  ),
}));

describe('ValidationPanel', () => {
  const defaultProps = {
    testSearchText: '',
    setTestSearchText: jest.fn(),
    isValidating: false,
    searchResults: null,
    onValidate: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render validation panel', () => {
    render(<ValidationPanel {...defaultProps} />);

    expect(screen.getByTestId('testSearchTextInput')).toBeInTheDocument();
    expect(screen.getByTestId('validateSearchQueryButton')).toBeInTheDocument();
  });

  it('should handle test search text changes', () => {
    render(<ValidationPanel {...defaultProps} />);

    const input = screen.getByTestId('testSearchTextInput');
    fireEvent.change(input, { target: { value: 'test query' } });

    expect(defaultProps.setTestSearchText).toHaveBeenCalledWith('test query');
  });

  it('should handle validate button click', () => {
    render(<ValidationPanel {...defaultProps} />);

    const validateButton = screen.getByTestId('validateSearchQueryButton');
    fireEvent.click(validateButton);

    expect(defaultProps.onValidate).toHaveBeenCalled();
  });

  it('should show loading state when validating', () => {
    const loadingProps = {
      ...defaultProps,
      isValidating: true,
    };

    render(<ValidationPanel {...loadingProps} />);

    expect(screen.getByText('Validating...')).toBeInTheDocument();
  });

  it('should display search results when available', () => {
    const resultsProps = {
      ...defaultProps,
      searchResults: { hits: [] },
    };

    render(<ValidationPanel {...resultsProps} />);

    expect(screen.getByText('Search Results')).toBeInTheDocument();
  });
});
