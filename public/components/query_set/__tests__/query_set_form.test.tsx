/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { QuerySetForm } from '../components/query_set_form';

describe('QuerySetForm', () => {
  const mockFormState = {
    name: 'Test Query Set',
    setName: jest.fn(),
    description: 'Test description',
    setDescription: jest.fn(),
    sampling: 'random',
    setSampling: jest.fn(),
    querySetSize: 10,
    setQuerySetSize: jest.fn(),
    isManualInput: false,
    setIsManualInput: jest.fn(),
    manualQueries: '',
    setManualQueries: jest.fn(),
    files: [],
    setFiles: jest.fn(),
    parsedQueries: [],
    setParsedQueries: jest.fn(),
    ubiQueriesIndex: '',
    setUbiQueriesIndex: jest.fn(),
    ubiEventsIndex: '',
    setUbiEventsIndex: jest.fn(),
    manualInputMethod: 'file' as 'file' | 'text',
    setManualInputMethod: jest.fn(),
    manualQueryText: '',
    setManualQueryText: jest.fn(),
    errors: {
      nameError: '',
      descriptionError: '',
      querySizeError: '',
      manualQueriesError: '',
    },
    validateField: jest.fn(),
    isFormValid: jest.fn(),
    handleFileContent: jest.fn(),
    clearFileData: jest.fn(),
  };

  const mockFilePickerId = 'test-file-picker-id';
  const mockIndexOptions = [
    { label: 'ubi_queries_index_1', value: 'uuid1' },
    { label: 'ubi_queries_index_2', value: 'uuid2' },
  ];

  const mockOnShowHelp = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the form with sampling mode correctly', () => {
    render(<QuerySetForm formState={mockFormState} filePickerId={mockFilePickerId} indexOptions={mockIndexOptions} isLoadingIndexes={false} onShowHelp={mockOnShowHelp} />);

    expect(screen.getByText('Switch to manually adding queries')).toBeInTheDocument();
    expect(screen.getAllByTestId('querySetDescriptionInput')[0]).toHaveValue('Test Query Set');
    expect(screen.getAllByTestId('querySetDescriptionInput')[1]).toHaveValue('Test description');
    expect(screen.getByTestId('querySetSamplingSelect')).toHaveValue('random');
    expect(screen.getByTestId('querySetSizeInput')).toHaveValue(10);
  });

  it('renders the form with manual input mode correctly', () => {
    const manualInputFormState = {
      ...mockFormState,
      isManualInput: true,
    };

    render(<QuerySetForm formState={manualInputFormState} filePickerId={mockFilePickerId} indexOptions={mockIndexOptions} isLoadingIndexes={false} onShowHelp={mockOnShowHelp} />);

    expect(screen.getByText('Switch to sampling queries from UBI data')).toBeInTheDocument();
    expect(screen.getAllByTestId('querySetDescriptionInput')[0]).toHaveValue('Test Query Set');
    expect(screen.getAllByTestId('querySetDescriptionInput')[1]).toHaveValue('Test description');
    expect(screen.getByTestId('manualQueriesFilePicker')).toBeInTheDocument();
    expect(screen.getByText('Help')).toBeInTheDocument();
    expect(screen.queryByTestId('querySetSamplingSelect')).not.toBeInTheDocument();
    expect(screen.queryByTestId('querySetSizeInput')).not.toBeInTheDocument();
  });

  it('renders the form with text input mode correctly', () => {
    const textInputFormState = {
      ...mockFormState,
      isManualInput: true,
      manualInputMethod: 'text' as const,
    };

    render(<QuerySetForm formState={textInputFormState} filePickerId={mockFilePickerId} indexOptions={mockIndexOptions} isLoadingIndexes={false} onShowHelp={mockOnShowHelp} />);

    expect(screen.getByTestId('manualQueriesTextInput')).toBeInTheDocument();
    expect(screen.getByText('Help')).toBeInTheDocument();
    expect(screen.queryByText('Query format')).not.toBeInTheDocument(); // Help is now in flyout
    expect(screen.queryByTestId('manualQueriesFilePicker')).not.toBeInTheDocument();
  });

  it('handles manual input method change', () => {
    const manualInputFormState = {
      ...mockFormState,
      isManualInput: true,
    };
    render(<QuerySetForm formState={manualInputFormState} filePickerId={mockFilePickerId} indexOptions={mockIndexOptions} isLoadingIndexes={false} onShowHelp={mockOnShowHelp} />);

    // Find the select (combobox)
    const methodSelect = screen.getByTestId('inputMethodSelect');
    fireEvent.change(methodSelect, { target: { value: 'text' } });

    expect(mockFormState.setManualInputMethod).toHaveBeenCalledWith('text');
  });

  it('handles help button click', () => {
    const textInputFormState = {
      ...mockFormState,
      isManualInput: true,
      manualInputMethod: 'text' as const,
    };
    render(<QuerySetForm formState={textInputFormState} filePickerId={mockFilePickerId} indexOptions={mockIndexOptions} isLoadingIndexes={false} onShowHelp={mockOnShowHelp} />);

    fireEvent.click(screen.getByText('Help'));
    expect(mockOnShowHelp).toHaveBeenCalled();
  });

  it('handles manual query text change', () => {
    const textInputFormState = {
      ...mockFormState,
      isManualInput: true,
      manualInputMethod: 'text' as const,
    };
    render(<QuerySetForm formState={textInputFormState} filePickerId={mockFilePickerId} indexOptions={mockIndexOptions} isLoadingIndexes={false} onShowHelp={mockOnShowHelp} />);

    const textArea = screen.getByTestId('manualQueriesTextInput');
    fireEvent.change(textArea, { target: { value: 'query1\nquery2' } });

    expect(mockFormState.setManualQueryText).toHaveBeenCalledWith('query1\nquery2');
  });

  it('handles name input change', () => {
    render(<QuerySetForm formState={mockFormState} filePickerId={mockFilePickerId} indexOptions={mockIndexOptions} isLoadingIndexes={false} onShowHelp={mockOnShowHelp} />);

    const nameInput = screen.getAllByTestId('querySetDescriptionInput')[0];
    fireEvent.change(nameInput, { target: { value: 'New Name' } });

    expect(mockFormState.setName).toHaveBeenCalledWith('New Name');
  });

  it('handles description input change', () => {
    render(<QuerySetForm formState={mockFormState} filePickerId={mockFilePickerId} indexOptions={mockIndexOptions} isLoadingIndexes={false} onShowHelp={mockOnShowHelp} />);

    const descriptionInput = screen.getAllByTestId('querySetDescriptionInput')[1];
    fireEvent.change(descriptionInput, { target: { value: 'New Description' } });

    expect(mockFormState.setDescription).toHaveBeenCalledWith('New Description');
  });

  it('handles sampling method change', () => {
    render(<QuerySetForm formState={mockFormState} filePickerId={mockFilePickerId} indexOptions={mockIndexOptions} isLoadingIndexes={false} onShowHelp={mockOnShowHelp} />);

    const samplingSelect = screen.getByTestId('querySetSamplingSelect');
    fireEvent.change(samplingSelect, { target: { value: 'topn' } });

    expect(mockFormState.setSampling).toHaveBeenCalledWith('topn');
  });

  it('handles query set size change', () => {
    render(<QuerySetForm formState={mockFormState} filePickerId={mockFilePickerId} indexOptions={mockIndexOptions} isLoadingIndexes={false} onShowHelp={mockOnShowHelp} />);

    const sizeInput = screen.getByTestId('querySetSizeInput');
    fireEvent.change(sizeInput, { target: { value: '20' } });

    expect(mockFormState.setQuerySetSize).toHaveBeenCalledWith(20);
  });

  it('handles input mode toggle', () => {
    render(<QuerySetForm formState={mockFormState} filePickerId={mockFilePickerId} indexOptions={mockIndexOptions} isLoadingIndexes={false} onShowHelp={mockOnShowHelp} />);

    const toggleButton = screen.getByText('Switch to manually adding queries');
    fireEvent.click(toggleButton);

    expect(mockFormState.setIsManualInput).toHaveBeenCalledWith(true);
  });

  it('displays validation errors', () => {
    const formStateWithErrors = {
      ...mockFormState,
      errors: {
        nameError: 'Name is required',
        descriptionError: 'Description is required',
        querySizeError: 'Size must be positive',
        manualQueriesError: '',
      },
    };

    render(<QuerySetForm formState={formStateWithErrors} filePickerId={mockFilePickerId} indexOptions={mockIndexOptions} isLoadingIndexes={false} onShowHelp={mockOnShowHelp} />);

    expect(screen.getByText('Name is required')).toBeInTheDocument();
    expect(screen.getByText('Description is required')).toBeInTheDocument();
    expect(screen.getByText('Size must be positive')).toBeInTheDocument();
  });

  it('validates fields on blur', () => {
    render(<QuerySetForm formState={mockFormState} filePickerId={mockFilePickerId} indexOptions={mockIndexOptions} isLoadingIndexes={false} onShowHelp={mockOnShowHelp} />);

    const nameInput = screen.getAllByTestId('querySetDescriptionInput')[0];
    fireEvent.blur(nameInput);

    expect(mockFormState.validateField).toHaveBeenCalledWith('name', 'Test Query Set');
  });
});
