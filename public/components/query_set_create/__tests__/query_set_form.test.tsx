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

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the form with sampling mode correctly', () => {
    render(<QuerySetForm formState={mockFormState} filePickerId={mockFilePickerId} />);

    expect(screen.getByText('Switch to manually adding queries')).toBeInTheDocument();
    expect(screen.getByTestId('querySetNameInput')).toHaveValue('Test Query Set');
    expect(screen.getByTestId('querySetDescriptionInput')).toHaveValue('Test description');
    expect(screen.getByTestId('querySetSamplingSelect')).toHaveValue('random');
    expect(screen.getByTestId('querySetSizeInput')).toHaveValue(10);
  });

  it('renders the form with manual input mode correctly', () => {
    const manualInputFormState = {
      ...mockFormState,
      isManualInput: true,
    };

    render(<QuerySetForm formState={manualInputFormState} filePickerId={mockFilePickerId} />);

    expect(screen.getByText('Switch to sampling queries from UBI data')).toBeInTheDocument();
    expect(screen.getByTestId('querySetNameInput')).toHaveValue('Test Query Set');
    expect(screen.getByTestId('querySetDescriptionInput')).toHaveValue('Test description');
    expect(screen.getByTestId('manualQueriesFilePicker')).toBeInTheDocument();
    expect(screen.queryByTestId('querySetSamplingSelect')).not.toBeInTheDocument();
    expect(screen.queryByTestId('querySetSizeInput')).not.toBeInTheDocument();
  });

  it('handles name input change', () => {
    render(<QuerySetForm formState={mockFormState} filePickerId={mockFilePickerId} />);

    const nameInput = screen.getByTestId('querySetNameInput');
    fireEvent.change(nameInput, { target: { value: 'New Name' } });

    expect(mockFormState.setName).toHaveBeenCalledWith('New Name');
  });

  it('handles description input change', () => {
    render(<QuerySetForm formState={mockFormState} filePickerId={mockFilePickerId} />);

    const descriptionInput = screen.getByTestId('querySetDescriptionInput');
    fireEvent.change(descriptionInput, { target: { value: 'New Description' } });

    expect(mockFormState.setDescription).toHaveBeenCalledWith('New Description');
  });

  it('handles sampling method change', () => {
    render(<QuerySetForm formState={mockFormState} filePickerId={mockFilePickerId} />);

    const samplingSelect = screen.getByTestId('querySetSamplingSelect');
    fireEvent.change(samplingSelect, { target: { value: 'topn' } });

    expect(mockFormState.setSampling).toHaveBeenCalledWith('topn');
  });

  it('handles query set size change', () => {
    render(<QuerySetForm formState={mockFormState} filePickerId={mockFilePickerId} />);

    const sizeInput = screen.getByTestId('querySetSizeInput');
    fireEvent.change(sizeInput, { target: { value: '20' } });

    expect(mockFormState.setQuerySetSize).toHaveBeenCalledWith(20);
  });

  it('handles input mode toggle', () => {
    render(<QuerySetForm formState={mockFormState} filePickerId={mockFilePickerId} />);

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

    render(<QuerySetForm formState={formStateWithErrors} filePickerId={mockFilePickerId} />);

    expect(screen.getByText('Name is required')).toBeInTheDocument();
    expect(screen.getByText('Description is required')).toBeInTheDocument();
    expect(screen.getByText('Size must be positive')).toBeInTheDocument();
  });

  it('validates fields on blur', () => {
    render(<QuerySetForm formState={mockFormState} filePickerId={mockFilePickerId} />);

    const nameInput = screen.getByTestId('querySetNameInput');
    fireEvent.blur(nameInput);

    expect(mockFormState.validateField).toHaveBeenCalledWith('name', 'Test Query Set');
  });
});
