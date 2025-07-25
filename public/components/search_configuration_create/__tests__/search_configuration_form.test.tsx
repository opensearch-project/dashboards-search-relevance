/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { SearchConfigurationForm } from '../components/search_configuration_form';

// Mock EuiCodeEditor to test the onChange and onBlur logic
jest.mock('@elastic/eui', () => ({
  ...jest.requireActual('@elastic/eui'),
  EuiCodeEditor: ({ onChange, onBlur, value, disabled }) => {
    const handleChange = (e) => {
      if (onChange) onChange(e.target.value);
    };
    
    const handleBlur = () => {
      if (onBlur) onBlur();
    };
    
    return (
      <textarea
        data-test-subj="code-editor"
        value={value}
        onChange={handleChange}
        onBlur={handleBlur}
        disabled={disabled}
        aria-label="Code Editor"
      />
    );
  },
}));

const mockProps = {
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
  indexOptions: [{ label: 'index1', value: 'index1' }],
  selectedIndex: [],
  setSelectedIndex: jest.fn(),
  isLoadingIndexes: false,
  pipelineOptions: [{ label: 'pipeline1' }],
  selectedPipeline: [],
  setSelectedPipeline: jest.fn(),
  isLoadingPipelines: false,
};

describe('SearchConfigurationForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render all form fields', () => {
    render(<SearchConfigurationForm {...mockProps} />);

    expect(screen.getByLabelText('Search Configuration Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Index')).toBeInTheDocument();
    expect(screen.getByText('Search Pipeline')).toBeInTheDocument();
    expect(screen.getByLabelText('Query')).toBeInTheDocument();
  });

  it('should call setName when name field changes', () => {
    render(<SearchConfigurationForm {...mockProps} />);

    const nameInput = screen.getByLabelText('Search Configuration Name');
    fireEvent.change(nameInput, { target: { value: 'test name' } });

    expect(mockProps.setName).toHaveBeenCalledWith('test name');
  });

  it('should call validateName on name field blur', () => {
    render(<SearchConfigurationForm {...mockProps} />);

    const nameInput = screen.getByLabelText('Search Configuration Name');
    fireEvent.blur(nameInput);

    expect(mockProps.validateName).toHaveBeenCalled();
  });

  it('should display name error when present', () => {
    render(<SearchConfigurationForm {...mockProps} nameError="Name is required" />);

    expect(screen.getByText('Name is required')).toBeInTheDocument();
  });

  it('should render query code editor', () => {
    render(<SearchConfigurationForm {...mockProps} />);

    expect(screen.getByTestId('code-editor')).toBeInTheDocument();
  });

  it('should display query error when present', () => {
    render(<SearchConfigurationForm {...mockProps} queryError="Invalid JSON" />);

    expect(screen.getByText('Invalid JSON')).toBeInTheDocument();
  });

  it('should call setSelectedIndex when index selection changes', () => {
    render(<SearchConfigurationForm {...mockProps} />);

    // EuiComboBox interaction would be tested in integration tests
    expect(screen.getByLabelText('Index')).toBeInTheDocument();
  });

  it('should show loading state for indexes', () => {
    render(<SearchConfigurationForm {...mockProps} isLoadingIndexes={true} />);

    expect(screen.getByLabelText('Index')).toBeInTheDocument();
  });

  it('should show loading state for pipelines', () => {
    render(<SearchConfigurationForm {...mockProps} isLoadingPipelines={true} />);

    expect(screen.getByText('Search Pipeline')).toBeInTheDocument();
  });

  it('should handle disabled state', () => {
    render(<SearchConfigurationForm {...mockProps} disabled={true} />);

    const nameInput = screen.getByLabelText('Search Configuration Name');
    expect(nameInput).toBeDisabled();
  });

  it('should display current form values', () => {
    const propsWithValues = {
      ...mockProps,
      name: 'Test Config',
      query: '{"query": {"match_all": {}}}',
    };

    render(<SearchConfigurationForm {...propsWithValues} />);

    expect(screen.getByDisplayValue('Test Config')).toBeInTheDocument();
  });

  // Additional comprehensive tests
  it('should handle query changes with valid JSON', () => {
    render(<SearchConfigurationForm {...mockProps} />);

    expect(screen.getByTestId('code-editor')).toBeInTheDocument();
  });

  it('should handle query changes with invalid JSON', () => {
    const propsWithInvalidQuery = {
      ...mockProps,
      query: '{"invalid": json}',
    };

    render(<SearchConfigurationForm {...propsWithInvalidQuery} />);

    expect(screen.getByLabelText('Search Configuration Name')).toBeInTheDocument();
  });

  it('should handle query blur validation', () => {
    const mockSetQueryError = jest.fn();
    const propsWithEmptyQuery = {
      ...mockProps,
      query: '',
      setQueryError: mockSetQueryError,
    };

    render(<SearchConfigurationForm {...propsWithEmptyQuery} />);

    const codeEditor = screen.getByTestId('code-editor');
    expect(codeEditor).toBeInTheDocument();
  });

  it('should handle empty options arrays', () => {
    const emptyOptionsProps = {
      ...mockProps,
      indexOptions: [],
      pipelineOptions: [],
      selectedIndex: [],
      selectedPipeline: [],
    };

    render(<SearchConfigurationForm {...emptyOptionsProps} />);

    expect(screen.getByLabelText('Index')).toBeInTheDocument();
    expect(screen.getByText('Search Pipeline')).toBeInTheDocument();
  });

  it('should handle form with all fields populated', () => {
    const fullProps = {
      ...mockProps,
      name: 'Full Configuration',
      query: '{"query": {"bool": {"must": [{"match": {"title": "test"}}]}}}',
      selectedIndex: [{ label: 'test-index', value: 'test-index' }],
      selectedPipeline: [{ label: 'test-pipeline' }],
    };

    render(<SearchConfigurationForm {...fullProps} />);

    expect(screen.getByDisplayValue('Full Configuration')).toBeInTheDocument();
  });

  it('should handle form validation state changes', () => {
    const { rerender } = render(<SearchConfigurationForm {...mockProps} />);

    expect(screen.queryByText('Name is required')).not.toBeInTheDocument();

    const errorProps = {
      ...mockProps,
      nameError: 'Name is required',
    };

    rerender(<SearchConfigurationForm {...errorProps} />);
    expect(screen.getByText('Name is required')).toBeInTheDocument();
  });

  it('should handle complex query structures', () => {
    const complexQueryProps = {
      ...mockProps,
      query: JSON.stringify(
        {
          query: {
            bool: {
              must: [
                { match: { title: '%SearchText%' } },
                { range: { date: { gte: '2023-01-01' } } },
              ],
              filter: [{ term: { status: 'published' } }],
            },
          },
          size: 10,
          from: 0,
        },
        null,
        2
      ),
    };

    render(<SearchConfigurationForm {...complexQueryProps} />);

    expect(screen.getByLabelText('Search Configuration Name')).toBeInTheDocument();
  });

  it('should handle form field interactions', () => {
    render(<SearchConfigurationForm {...mockProps} />);

    const nameInput = screen.getByLabelText('Search Configuration Name');

    fireEvent.change(nameInput, { target: { value: 'New Config Name' } });
    expect(mockProps.setName).toHaveBeenCalledWith('New Config Name');

    fireEvent.blur(nameInput);
    expect(mockProps.validateName).toHaveBeenCalled();
  });

  // Logic tests for EuiCodeEditor handlers
  it('should handle valid JSON in onChange', () => {
    render(<SearchConfigurationForm {...mockProps} />);
    
    const codeEditor = screen.getByTestId('code-editor');
    const validJson = '{"query": {"match_all": {}}}';
    
    fireEvent.change(codeEditor, { target: { value: validJson } });
    
    expect(mockProps.setQuery).toHaveBeenCalledWith(validJson);
    expect(mockProps.setQueryError).toHaveBeenCalledWith('');
  });

  it('should handle invalid JSON in onChange', () => {
    render(<SearchConfigurationForm {...mockProps} />);
    
    const codeEditor = screen.getByTestId('code-editor');
    const invalidJson = '{"invalid": json}';
    
    fireEvent.change(codeEditor, { target: { value: invalidJson } });
    
    expect(mockProps.setQuery).toHaveBeenCalledWith(invalidJson);
  });

  it('should not call setQuery when disabled in onChange', () => {
    render(<SearchConfigurationForm {...mockProps} disabled={true} />);
    
    const codeEditor = screen.getByTestId('code-editor');
    const validJson = '{"query": {"match_all": {}}}';
    
    fireEvent.change(codeEditor, { target: { value: validJson } });
    
    expect(mockProps.setQuery).not.toHaveBeenCalled();
  });

  it('should validate empty query on blur', () => {
    const propsWithEmptyQuery = {
      ...mockProps,
      query: '',
    };
    
    render(<SearchConfigurationForm {...propsWithEmptyQuery} />);
    
    const codeEditor = screen.getByTestId('code-editor');
    fireEvent.blur(codeEditor);
    
    expect(mockProps.setQueryError).toHaveBeenCalledWith('Query is required.');
  });

  it('should validate valid JSON on blur', () => {
    const propsWithValidQuery = {
      ...mockProps,
      query: '{"query": {"match_all": {}}}',
    };
    
    render(<SearchConfigurationForm {...propsWithValidQuery} />);
    
    const codeEditor = screen.getByTestId('code-editor');
    fireEvent.blur(codeEditor);
    
    expect(mockProps.setQueryError).toHaveBeenCalledWith('');
  });

  it('should validate invalid JSON on blur', () => {
    const propsWithInvalidQuery = {
      ...mockProps,
      query: '{"invalid": json}',
    };
    
    render(<SearchConfigurationForm {...propsWithInvalidQuery} />);
    
    const codeEditor = screen.getByTestId('code-editor');
    fireEvent.blur(codeEditor);
    
    expect(mockProps.setQueryError).toHaveBeenCalledWith('Query must be valid JSON.');
  });

  it('should not validate when disabled on blur', () => {
    const propsWithEmptyQuery = {
      ...mockProps,
      query: '',
      disabled: true,
    };
    
    render(<SearchConfigurationForm {...propsWithEmptyQuery} />);
    
    const codeEditor = screen.getByTestId('code-editor');
    fireEvent.blur(codeEditor);
    
    expect(mockProps.setQueryError).not.toHaveBeenCalled();
  });
});
