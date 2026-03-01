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
    manualInputMethod: 'file' as const,
    setManualInputMethod: jest.fn(),
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
    handleTextChange: jest.fn(),
    handleManualInputMethodChange: jest.fn(),
  };

  const mockFilePickerId = 'test-file-picker-id';
  const mockIndexOptions = [
    { label: 'ubi_queries_index_1', value: 'uuid1' },
    { label: 'ubi_queries_index_2', value: 'uuid2' },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the form with sampling mode correctly', () => {
    render(<QuerySetForm formState={mockFormState} filePickerId={mockFilePickerId} indexOptions={mockIndexOptions} isLoadingIndexes={false} />);

    expect(screen.getByText('Switch to manually adding queries')).toBeInTheDocument();
    expect(screen.getAllByTestId('querySetDescriptionInput')[0]).toHaveValue('Test Query Set');
    expect(screen.getAllByTestId('querySetDescriptionInput')[1]).toHaveValue('Test description');
    expect(screen.getByTestId('querySetSamplingSelect')).toHaveValue('random');
    expect(screen.getByTestId('querySetSizeInput')).toHaveValue(10);
  });

  it('renders the form with manual input mode and file picker by default', () => {
    const manualInputFormState = {
      ...mockFormState,
      isManualInput: true,
      manualInputMethod: 'file' as const,
    };

    render(<QuerySetForm formState={manualInputFormState} filePickerId={mockFilePickerId} indexOptions={mockIndexOptions} isLoadingIndexes={false} />);

    expect(screen.getByText('Switch to sampling queries from UBI data')).toBeInTheDocument();
    expect(screen.getByTestId('manualInputMethodSelect')).toHaveValue('file');
    expect(screen.getByTestId('manualQueriesFilePicker')).toBeInTheDocument();
    expect(screen.queryByTestId('manualQueriesTextInput')).not.toBeInTheDocument();
    expect(screen.queryByTestId('querySetSamplingSelect')).not.toBeInTheDocument();
    expect(screen.queryByTestId('querySetSizeInput')).not.toBeInTheDocument();
  });

  it('renders the text input area when manual input method is text', () => {
    const textInputFormState = {
      ...mockFormState,
      isManualInput: true,
      manualInputMethod: 'text' as const,
    };

    render(<QuerySetForm formState={textInputFormState} filePickerId={mockFilePickerId} indexOptions={mockIndexOptions} isLoadingIndexes={false} />);

    expect(screen.getByTestId('manualInputMethodSelect')).toHaveValue('text');
    expect(screen.getByTestId('manualQueriesTextInput')).toBeInTheDocument();
    expect(screen.queryByTestId('manualQueriesFilePicker')).not.toBeInTheDocument();
  });

  it('handles input method dropdown change', () => {
    const manualInputFormState = {
      ...mockFormState,
      isManualInput: true,
    };

    render(<QuerySetForm formState={manualInputFormState} filePickerId={mockFilePickerId} indexOptions={mockIndexOptions} isLoadingIndexes={false} />);

    const methodSelect = screen.getByTestId('manualInputMethodSelect');
    fireEvent.change(methodSelect, { target: { value: 'text' } });

    expect(mockFormState.handleManualInputMethodChange).toHaveBeenCalledWith('text');
  });

  it('calls handleTextChange when typing in the text area', () => {
    const textInputFormState = {
      ...mockFormState,
      isManualInput: true,
      manualInputMethod: 'text' as const,
    };

    render(<QuerySetForm formState={textInputFormState} filePickerId={mockFilePickerId} indexOptions={mockIndexOptions} isLoadingIndexes={false} />);

    const textArea = screen.getByTestId('manualQueriesTextInput');
    fireEvent.change(textArea, { target: { value: 'red blue jeans\nbluejeans' } });

    expect(mockFormState.handleTextChange).toHaveBeenCalledWith('red blue jeans\nbluejeans');
  });

  it('handles name input change', () => {
    render(<QuerySetForm formState={mockFormState} filePickerId={mockFilePickerId} indexOptions={mockIndexOptions} isLoadingIndexes={false} />);

    const nameInput = screen.getAllByTestId('querySetDescriptionInput')[0];
    fireEvent.change(nameInput, { target: { value: 'New Name' } });

    expect(mockFormState.setName).toHaveBeenCalledWith('New Name');
  });

  it('handles description input change', () => {
    render(<QuerySetForm formState={mockFormState} filePickerId={mockFilePickerId} indexOptions={mockIndexOptions} isLoadingIndexes={false} />);

    const descriptionInput = screen.getAllByTestId('querySetDescriptionInput')[1];
    fireEvent.change(descriptionInput, { target: { value: 'New Description' } });

    expect(mockFormState.setDescription).toHaveBeenCalledWith('New Description');
  });

  it('handles sampling method change', () => {
    render(<QuerySetForm formState={mockFormState} filePickerId={mockFilePickerId} indexOptions={mockIndexOptions} isLoadingIndexes={false} />);

    const samplingSelect = screen.getByTestId('querySetSamplingSelect');
    fireEvent.change(samplingSelect, { target: { value: 'topn' } });

    expect(mockFormState.setSampling).toHaveBeenCalledWith('topn');
  });

  it('handles query set size change', () => {
    render(<QuerySetForm formState={mockFormState} filePickerId={mockFilePickerId} indexOptions={mockIndexOptions} isLoadingIndexes={false} />);

    const sizeInput = screen.getByTestId('querySetSizeInput');
    fireEvent.change(sizeInput, { target: { value: '20' } });

    expect(mockFormState.setQuerySetSize).toHaveBeenCalledWith(20);
  });

  it('handles input mode toggle', () => {
    render(<QuerySetForm formState={mockFormState} filePickerId={mockFilePickerId} indexOptions={mockIndexOptions} isLoadingIndexes={false} />);

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

    render(<QuerySetForm formState={formStateWithErrors} filePickerId={mockFilePickerId} indexOptions={mockIndexOptions} isLoadingIndexes={false} />);

    expect(screen.getByText('Name is required')).toBeInTheDocument();
    expect(screen.getByText('Description is required')).toBeInTheDocument();
    expect(screen.getByText('Size must be positive')).toBeInTheDocument();
  });

  it('displays manual queries error for file upload mode', () => {
    const formStateWithErrors = {
      ...mockFormState,
      isManualInput: true,
      manualInputMethod: 'file' as const,
      errors: {
        nameError: '',
        descriptionError: '',
        querySizeError: '',
        manualQueriesError: 'No valid queries found in file',
      },
    };

    render(<QuerySetForm formState={formStateWithErrors} filePickerId={mockFilePickerId} indexOptions={mockIndexOptions} isLoadingIndexes={false} />);

    expect(screen.getByText('No valid queries found in file')).toBeInTheDocument();
  });

  it('displays manual queries error for text input mode', () => {
    const formStateWithErrors = {
      ...mockFormState,
      isManualInput: true,
      manualInputMethod: 'text' as const,
      errors: {
        nameError: '',
        descriptionError: '',
        querySizeError: '',
        manualQueriesError: 'No queries provided. Enter at least one query.',
      },
    };

    render(<QuerySetForm formState={formStateWithErrors} filePickerId={mockFilePickerId} indexOptions={mockIndexOptions} isLoadingIndexes={false} />);

    expect(screen.getByText('No queries provided. Enter at least one query.')).toBeInTheDocument();
  });

  it('validates fields on blur', () => {
    render(<QuerySetForm formState={mockFormState} filePickerId={mockFilePickerId} indexOptions={mockIndexOptions} isLoadingIndexes={false} />);

    const nameInput = screen.getAllByTestId('querySetDescriptionInput')[0];
    fireEvent.blur(nameInput);

    expect(mockFormState.validateField).toHaveBeenCalledWith('name', 'Test Query Set');
  });

  it('does not show input method dropdown in sampling mode', () => {
    render(<QuerySetForm formState={mockFormState} filePickerId={mockFilePickerId} indexOptions={mockIndexOptions} isLoadingIndexes={false} />);

    expect(screen.queryByTestId('manualInputMethodSelect')).not.toBeInTheDocument();
  });

  it('shows correct help text for text input mode', () => {
    const textInputFormState = {
      ...mockFormState,
      isManualInput: true,
      manualInputMethod: 'text' as const,
    };

    render(<QuerySetForm formState={textInputFormState} filePickerId={mockFilePickerId} indexOptions={mockIndexOptions} isLoadingIndexes={false} />);

    expect(screen.getByText(/Enter queries in any format/)).toBeInTheDocument();
  });

  it('switches input method from file back to text', () => {
    const manualInputFormState = {
      ...mockFormState,
      isManualInput: true,
      manualInputMethod: 'text' as const,
    };

    render(<QuerySetForm formState={manualInputFormState} filePickerId={mockFilePickerId} indexOptions={mockIndexOptions} isLoadingIndexes={false} />);

    const methodSelect = screen.getByTestId('manualInputMethodSelect');
    fireEvent.change(methodSelect, { target: { value: 'file' } });

    expect(mockFormState.handleManualInputMethodChange).toHaveBeenCalledWith('file');
  });

  it('renders help button in manual input mode with file upload', () => {
    const manualInputFormState = {
      ...mockFormState,
      isManualInput: true,
      manualInputMethod: 'file' as const,
    };

    render(<QuerySetForm formState={manualInputFormState} filePickerId={mockFilePickerId} indexOptions={mockIndexOptions} isLoadingIndexes={false} />);

    expect(screen.getByTestId('querySetHelpButton')).toBeInTheDocument();
  });

  it('renders help button in manual input mode with text input', () => {
    const manualInputFormState = {
      ...mockFormState,
      isManualInput: true,
      manualInputMethod: 'text' as const,
    };

    render(<QuerySetForm formState={manualInputFormState} filePickerId={mockFilePickerId} indexOptions={mockIndexOptions} isLoadingIndexes={false} />);

    expect(screen.getByTestId('querySetHelpButton')).toBeInTheDocument();
  });

  it('does not render help button in sampling mode', () => {
    render(<QuerySetForm formState={mockFormState} filePickerId={mockFilePickerId} indexOptions={mockIndexOptions} isLoadingIndexes={false} />);

    expect(screen.queryByTestId('querySetHelpButton')).not.toBeInTheDocument();
  });
});
