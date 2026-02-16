/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { renderHook, act, waitFor } from '@testing-library/react';
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
    (fileProcessor.parseTextQueries as jest.Mock).mockReturnValue({
      queries: [{ queryText: 'test query', referenceAnswer: '' }],
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
    expect(result.current.manualInputMethod).toBe('file');
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

  it('updates manualInputMethod correctly', () => {
    const { result } = renderHook(() => useQuerySetForm());

    act(() => {
      result.current.setManualInputMethod('text');
    });

    expect(result.current.manualInputMethod).toBe('text');
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

  it('validates description field correctly', () => {
    (validation.validateForm as jest.Mock).mockReturnValue({
      nameError: '',
      descriptionError: 'Description is required',
      querySizeError: '',
      manualQueriesError: '',
    });

    const { result } = renderHook(() => useQuerySetForm());

    act(() => {
      result.current.validateField('description', '');
    });

    expect(result.current.errors.descriptionError).toBe('Description is required');
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

    const { result } = renderHook(() => useQuerySetForm());

    await act(async () => {
      await result.current.handleFileContent(mockFileList);
    });

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

    const { result } = renderHook(() => useQuerySetForm());

    await act(async () => {
      await result.current.handleFileContent(mockFileList);
    });

    expect(result.current.errors.manualQueriesError).toBe('Invalid file format');
    expect(result.current.files).toEqual([]);
    expect(result.current.manualQueries).toBe('');
    expect(result.current.parsedQueries).toEqual([]);
  });

  it('handles empty file list', async () => {
    const mockFileList = ({
      length: 0,
      item: () => null,
    } as unknown) as FileList;

    const { result } = renderHook(() => useQuerySetForm());

    act(() => {
      result.current.handleFileContent(mockFileList);
    });

    expect(fileProcessor.processQueryFile).not.toHaveBeenCalled();
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

  describe('handleTextChange', () => {
    it('parses valid multi-line text input', () => {
      (fileProcessor.parseTextQueries as jest.Mock).mockReturnValue({
        queries: [
          { queryText: 'red bluejeans', referenceAnswer: '' },
          { queryText: 'acid wash blue jeans', referenceAnswer: '' },
        ],
      });

      const { result } = renderHook(() => useQuerySetForm());

      act(() => {
        result.current.handleTextChange('red bluejeans\nacid wash blue jeans');
      });

      expect(fileProcessor.parseTextQueries).toHaveBeenCalledWith('red bluejeans\nacid wash blue jeans');
      expect(result.current.manualQueries).toBe(
        JSON.stringify([
          { queryText: 'red bluejeans', referenceAnswer: '' },
          { queryText: 'acid wash blue jeans', referenceAnswer: '' },
        ])
      );
      expect(result.current.parsedQueries).toHaveLength(2);
    });

    it('parses text input with reference answers via NDJSON', () => {
      (fileProcessor.parseTextQueries as jest.Mock).mockReturnValue({
        queries: [
          { queryText: 'red blue jeans', referenceAnswer: 'fashion query' },
        ],
      });

      const { result } = renderHook(() => useQuerySetForm());

      act(() => {
        result.current.handleTextChange('{"queryText":"red blue jeans","referenceAnswer":"fashion query"}');
      });

      expect(result.current.manualQueries).toBe(
        JSON.stringify([{ queryText: 'red blue jeans', referenceAnswer: 'fashion query' }])
      );
      expect(result.current.parsedQueries).toEqual([
        JSON.stringify({ queryText: 'red blue jeans', referenceAnswer: 'fashion query' }),
      ]);
    });

    it('clears state when text is empty or whitespace', () => {
      const { result } = renderHook(() => useQuerySetForm());

      // First set some data
      act(() => {
        result.current.setManualQueries('some data');
        result.current.setParsedQueries(['query1']);
      });

      // Then clear with empty input
      act(() => {
        result.current.handleTextChange('   ');
      });

      expect(fileProcessor.parseTextQueries).not.toHaveBeenCalled();
      expect(result.current.manualQueries).toBe('');
      expect(result.current.parsedQueries).toEqual([]);
    });

    it('sets error when parseTextQueries returns error', () => {
      (fileProcessor.parseTextQueries as jest.Mock).mockReturnValue({
        queries: [],
        error: 'No queries provided. Enter at least one query.',
      });

      const { result } = renderHook(() => useQuerySetForm());

      act(() => {
        result.current.handleTextChange('some text');
      });

      expect(result.current.errors.manualQueriesError).toBe(
        'No queries provided. Enter at least one query.'
      );
      expect(result.current.manualQueries).toBe('');
      expect(result.current.parsedQueries).toEqual([]);
    });

    it('clears previous errors on successful parse', () => {
      const { result } = renderHook(() => useQuerySetForm());

      // First, set an error
      (fileProcessor.parseTextQueries as jest.Mock).mockReturnValue({
        queries: [],
        error: 'Some error',
      });

      act(() => {
        result.current.handleTextChange('bad input');
      });

      expect(result.current.errors.manualQueriesError).toBe('Some error');

      // Then, provide good input
      (fileProcessor.parseTextQueries as jest.Mock).mockReturnValue({
        queries: [{ queryText: 'good query', referenceAnswer: '' }],
      });

      act(() => {
        result.current.handleTextChange('good query');
      });

      expect(result.current.errors.manualQueriesError).toBe('');
    });
  });

  describe('handleManualInputMethodChange', () => {
    it('switches to text mode and clears all data', () => {
      const { result } = renderHook(() => useQuerySetForm());

      // Set some initial file data
      act(() => {
        result.current.setFiles([new File(['test'], 'test.txt')]);
        result.current.setManualQueries('test queries');
        result.current.setParsedQueries(['query1', 'query2']);
      });

      // Switch to text mode
      act(() => {
        result.current.handleManualInputMethodChange('text');
      });

      expect(result.current.manualInputMethod).toBe('text');
      expect(result.current.files).toEqual([]);
      expect(result.current.manualQueries).toBe('');
      expect(result.current.parsedQueries).toEqual([]);
      expect(result.current.errors.manualQueriesError).toBe('');
    });

    it('switches back to file mode and clears all data', () => {
      const { result } = renderHook(() => useQuerySetForm());

      // Set text mode with some data
      act(() => {
        result.current.setManualInputMethod('text');
        result.current.setManualQueries('some queries');
        result.current.setParsedQueries(['query1']);
      });

      // Switch back to file mode
      act(() => {
        result.current.handleManualInputMethodChange('file');
      });

      expect(result.current.manualInputMethod).toBe('file');
      expect(result.current.files).toEqual([]);
      expect(result.current.manualQueries).toBe('');
      expect(result.current.parsedQueries).toEqual([]);
      expect(result.current.errors.manualQueriesError).toBe('');
    });

    it('clears errors when switching input methods', () => {
      const { result } = renderHook(() => useQuerySetForm());

      // Set an error on manual queries
      (fileProcessor.parseTextQueries as jest.Mock).mockReturnValue({
        queries: [],
        error: 'Some error',
      });

      act(() => {
        result.current.handleTextChange('bad input');
      });

      expect(result.current.errors.manualQueriesError).toBe('Some error');

      // Switch method should clear the error
      act(() => {
        result.current.handleManualInputMethodChange('file');
      });

      expect(result.current.errors.manualQueriesError).toBe('');
    });
  });
});
