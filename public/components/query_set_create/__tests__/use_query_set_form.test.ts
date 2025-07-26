/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { renderHook, act } from '@testing-library/react-hooks';
import { useQuerySetForm } from '../hooks/use_query_set_form';
import * as validation from '../utils/validation';
import * as fileProcessor from '../utils/file_processor';

jest.mock('../utils/validation');
jest.mock('../utils/file_processor');

describe('useQuerySetForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (validation.validateForm as jest.Mock).mockReturnValue({
      nameError: '',
      descriptionError: '',
      querySizeError: '',
      manualQueriesError: '',
    });
    (validation.hasValidationErrors as jest.Mock).mockReturnValue(false);
    (fileProcessor.processQueryFile as jest.Mock).mockResolvedValue({
      queries: [{ queryText: 'test query', referenceAnswer: 'test answer' }],
      error: undefined,
    });
  });

  it('initializes with default values', () => {
    const { result } = renderHook(() => useQuerySetForm());

    expect(result.current.name).toBe('');
    expect(result.current.description).toBe('');
    expect(result.current.sampling).toBe('random');
    expect(result.current.querySetSize).toBe(10);
    expect(result.current.isManualInput).toBe(false);
    expect(result.current.manualQueries).toBe('');
    expect(result.current.files).toEqual([]);
    expect(result.current.parsedQueries).toEqual([]);
    expect(result.current.errors).toEqual({
      nameError: '',
      descriptionError: '',
      querySizeError: '',
      manualQueriesError: '',
    });
  });

  it('updates name correctly', () => {
    const { result } = renderHook(() => useQuerySetForm());

    act(() => {
      result.current.setName('New Query Set');
    });

    expect(result.current.name).toBe('New Query Set');
  });

  it('updates description correctly', () => {
    const { result } = renderHook(() => useQuerySetForm());

    act(() => {
      result.current.setDescription('New Description');
    });

    expect(result.current.description).toBe('New Description');
  });

  it('updates sampling correctly', () => {
    const { result } = renderHook(() => useQuerySetForm());

    act(() => {
      result.current.setSampling('topn');
    });

    expect(result.current.sampling).toBe('topn');
  });

  it('updates querySetSize correctly', () => {
    const { result } = renderHook(() => useQuerySetForm());

    act(() => {
      result.current.setQuerySetSize(20);
    });

    expect(result.current.querySetSize).toBe(20);
  });

  it('toggles isManualInput correctly', () => {
    const { result } = renderHook(() => useQuerySetForm());

    act(() => {
      result.current.setIsManualInput(true);
    });

    expect(result.current.isManualInput).toBe(true);
  });

  it('validates fields correctly', () => {
    // Mock validateForm to return the expected error for empty name
    (validation.validateForm as jest.Mock).mockReturnValue({
      nameError: 'Name is a required parameter.',
      descriptionError: '',
      querySizeError: '',
      manualQueriesError: '',
    });
    
    const { result } = renderHook(() => useQuerySetForm());

    act(() => {
      result.current.validateField('name', '');
    });

    expect(result.current.errors.nameError).toBe('Name is a required parameter.');
  });

  it('validates form correctly', () => {
    (validation.validateForm as jest.Mock).mockReturnValue({
      nameError: 'Name is required',
      descriptionError: '',
      querySizeError: '',
      manualQueriesError: '',
    });
    (validation.hasValidationErrors as jest.Mock).mockReturnValue(true);

    const { result } = renderHook(() => useQuerySetForm());

    let isValid;
    act(() => {
      isValid = result.current.isFormValid();
    });

    expect(isValid).toBe(false);
    expect(validation.validateForm).toHaveBeenCalled();
    expect(validation.hasValidationErrors).toHaveBeenCalled();
  });

  it('handles file content correctly', async () => {
    const mockFile = new File(['test content'], 'test.txt', { type: 'text/plain' });
    const mockFileList = ({
      0: mockFile,
      length: 1,
      item: () => mockFile,
    } as unknown) as FileList;

    const { result, waitForNextUpdate } = renderHook(() => useQuerySetForm());

    act(() => {
      result.current.handleFileContent(mockFileList);
    });

    await waitForNextUpdate();

    expect(fileProcessor.processQueryFile).toHaveBeenCalledWith(mockFile);
    expect(result.current.manualQueries).toBe(
      JSON.stringify([{ queryText: 'test query', referenceAnswer: 'test answer' }])
    );
    expect(result.current.parsedQueries).toEqual([
      JSON.stringify({ queryText: 'test query', referenceAnswer: 'test answer' }),
    ]);
    expect(result.current.files).toEqual([mockFile]);
  });

  it('handles file processing errors', async () => {
    (fileProcessor.processQueryFile as jest.Mock).mockResolvedValue({
      queries: [],
      error: 'Invalid file format',
    });

    const mockFile = new File(['invalid content'], 'test.txt', { type: 'text/plain' });
    const mockFileList = ({
      0: mockFile,
      length: 1,
      item: () => mockFile,
    } as unknown) as FileList;

    const { result, waitForNextUpdate } = renderHook(() => useQuerySetForm());

    act(() => {
      result.current.handleFileContent(mockFileList);
    });

    await waitForNextUpdate();

    expect(result.current.errors.manualQueriesError).toBe('Invalid file format');
    expect(result.current.files).toEqual([]);
    expect(result.current.manualQueries).toBe('');
    expect(result.current.parsedQueries).toEqual([]);
  });

  it('clears file data correctly', () => {
    const { result } = renderHook(() => useQuerySetForm());

    // Set some initial data
    act(() => {
      result.current.setFiles([new File(['test'], 'test.txt')]);
      result.current.setManualQueries('test queries');
      result.current.setParsedQueries(['query1', 'query2']);
    });

    // Clear the data
    act(() => {
      result.current.clearFileData();
    });

    expect(result.current.files).toEqual([]);
    expect(result.current.manualQueries).toBe('');
    expect(result.current.parsedQueries).toEqual([]);
  });
});
