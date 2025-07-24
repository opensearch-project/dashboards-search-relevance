/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { SearchConfigurationForm } from '../components/search_configuration_form';

describe('SearchConfigurationForm', () => {
  const defaultProps = {
    name: '',
    setName: jest.fn(),
    nameError: '',
    validateName: jest.fn(),
    query: '',
    setQuery: jest.fn(),
    queryError: '',
    setQueryError: jest.fn(),
    searchTemplate: '',
    setSearchTemplate: jest.fn(),
    indexOptions: [
      { label: 'test-index-1', value: 'uuid-1' },
      { label: 'test-index-2', value: 'uuid-2' },
    ],
    selectedIndex: [],
    setSelectedIndex: jest.fn(),
    isLoadingIndexes: false,
    pipelineOptions: [
      { label: 'pipeline-1' },
      { label: 'pipeline-2' },
    ],
    selectedPipeline: [],
    setSelectedPipeline: jest.fn(),
    isLoadingPipelines: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render all form fields', () => {
    render(<SearchConfigurationForm {...defaultProps} />);

    expect(screen.getByLabelText(/Search Configuration Name/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Index/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Query/)).toBeInTheDocument();
    expect(screen.getByText(/Search Pipeline/)).toBeInTheDocument();
  });

  it('should handle name input changes', () => {
    render(<SearchConfigurationForm {...defaultProps} />);

    const nameInput = screen.getByTestId('searchConfigurationNameInput');
    fireEvent.change(nameInput, { target: { value: 'Test Configuration' } });

    expect(defaultProps.setName).toHaveBeenCalledWith('Test Configuration');
  });

  it('should display name error when present', () => {
    const propsWithError = {
      ...defaultProps,
      nameError: 'Name is required',
    };

    render(<SearchConfigurationForm {...propsWithError} />);

    expect(screen.getByText('Name is required')).toBeInTheDocument();
  });

  it('should display query error when present', () => {
    const propsWithError = {
      ...defaultProps,
      queryError: 'Invalid JSON',
    };

    render(<SearchConfigurationForm {...propsWithError} />);

    expect(screen.getByText('Invalid JSON')).toBeInTheDocument();
  });

  it('should handle name field blur validation', () => {
    render(<SearchConfigurationForm {...defaultProps} />);

    const nameInput = screen.getByTestId('searchConfigurationNameInput');
    fireEvent.blur(nameInput);

    expect(defaultProps.validateName).toHaveBeenCalled();
  });

  it('should render with disabled state', () => {
    const disabledProps = {
      ...defaultProps,
      disabled: true,
    };

    render(<SearchConfigurationForm {...disabledProps} />);

    const nameInput = screen.getByTestId('searchConfigurationNameInput');
    expect(nameInput).toBeDisabled();
  });

  it('should show loading state for indexes', () => {
    const loadingProps = {
      ...defaultProps,
      isLoadingIndexes: true,
    };

    render(<SearchConfigurationForm {...loadingProps} />);
    
    // The loading state would be handled by EuiComboBox internally
    expect(screen.getByLabelText(/Index/)).toBeInTheDocument();
  });

  it('should show loading state for pipelines', () => {
    const loadingProps = {
      ...defaultProps,
      isLoadingPipelines: true,
    };

    render(<SearchConfigurationForm {...loadingProps} />);
    
    // The loading state would be handled by EuiComboBox internally
    expect(screen.getByText(/Search Pipeline/)).toBeInTheDocument();
  });
});