/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { renderHook, act } from '@testing-library/react-hooks';
import { useQuerySetForm } from '../hooks/use_query_set_form';
import * as validation from '../utils/validation';
import { processQueryFile, processPlainTextFile } from '../utils/file_processor';

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
    // Set up mocks for file processors
    (processQueryFile as jest.Mock).mockReset().mockImplementation(async (file) => {
      const text = await file.text();
      if (text.includes('error')) {
        return { queries: [], error: 'Error reading file content' };
      }
      try {
        const parsed = JSON.parse(text);
        return { 
          queries: [{ 
            queryText: parsed.queryText, 
            referenceAnswer: parsed.referenceAnswer || '' 
          }],
          error: undefined
        };
      } catch (e) {
        return { queries: [], error: 'No valid queries found in file' };
      }
    });
    
    (processPlainTextFile as jest.Mock).mockReset().mockImplementation(async (file) => {
      const text = await file.text();
      if (!text.trim()) {
        return { queries: [], error: 'No valid queries found' };
      }
      const lines = text.trim().split('\n');
      const queries = lines
        .filter(line => line.trim())
        .map(line => ({ queryText: line.trim(), referenceAnswer: '' }));
      return { queries, error: undefined };
    });
  });

  it('initializes with default values', () => {
    const { result } = renderHook(() => useQuerySetForm());

    expect(result.current.name).toBe('');
    expect(result.current.description).toBe('');
    expect(result.current.sampling).toBe('random');
    expect(result.current.querySetSize).toBe(10);
    expect(result.current.isManualInput).toBe(false);
    expect(result.current.isTextInput).toBe(false);
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
  
  it('toggles isTextInput correctly', () => {
    const { result } = renderHook(() => useQuerySetForm());

    act(() => {
      result.current.setIsTextInput(true);
    });

    expect(result.current.isTextInput).toBe(true);
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
    const mockFile = new File(['{"queryText": "test query", "referenceAnswer": "test answer"}'], 'test.txt', { type: 'text/plain' });
    const mockFileList = ({
      0: mockFile,
      length: 1,
      item: () => mockFile,
    } as unknown) as FileList;

    // Mock File.text() method
    Object.defineProperty(mockFile, 'text', {
      value: jest.fn().mockResolvedValue('{"queryText": "test query", "referenceAnswer": "test answer"}'),
    });
    
    // Set up specific mock for this test
    (processQueryFile as jest.Mock).mockResolvedValueOnce({
      queries: [{ queryText: 'test query', referenceAnswer: 'test answer' }],
      error: undefined
    });

    const { result } = renderHook(() => useQuerySetForm());

    await act(async () => {
      await result.current.handleFileContent(mockFileList);
    });

    // Verify the end results instead of spying on the internal method
    expect(result.current.files).toEqual([mockFile]);
    expect(result.current.manualQueries).toBe(
      JSON.stringify([{ queryText: 'test query', referenceAnswer: 'test answer' }])
    );
    expect(result.current.parsedQueries).toEqual([
      JSON.stringify({ queryText: 'test query', referenceAnswer: 'test answer' }),
    ]);
  });
  
  it('parses text input correctly', () => {
    const { result } = renderHook(() => useQuerySetForm());
    
    act(() => {
      result.current.parseQueriesText('query 1\nquery 2', true);
    });
    
    expect(result.current.manualQueries).toBe(
      JSON.stringify([
        { queryText: 'query 1', referenceAnswer: '' },
        { queryText: 'query 2', referenceAnswer: '' }
      ])
    );
    expect(result.current.parsedQueries).toHaveLength(2);
  });

  it('parses JSON input correctly', () => {
    const { result } = renderHook(() => useQuerySetForm());
    
    const jsonInput = '{"queryText": "json query 1", "referenceAnswer": "answer 1"}\n{"queryText": "json query 2", "referenceAnswer": "answer 2"}';
    
    act(() => {
      result.current.parseQueriesText(jsonInput, false);
    });
    
    expect(result.current.manualQueries).toBe(
      JSON.stringify([
        { queryText: 'json query 1', referenceAnswer: 'answer 1' },
        { queryText: 'json query 2', referenceAnswer: 'answer 2' }
      ])
    );
    expect(result.current.parsedQueries).toHaveLength(2);
    expect(JSON.parse(result.current.parsedQueries[0])).toEqual({ queryText: 'json query 1', referenceAnswer: 'answer 1' });
  });

  it('handles empty input correctly', () => {
    const { result } = renderHook(() => useQuerySetForm());
    
    act(() => {
      result.current.parseQueriesText('', true);
    });
    
    expect(result.current.manualQueries).toBe('');
    expect(result.current.parsedQueries).toEqual([]);
    expect(result.current.errors.manualQueriesError).toBe('No valid queries found');
  });

  it('handles invalid JSON input correctly', () => {
    const { result } = renderHook(() => useQuerySetForm());
    
    const invalidJson = '{"queryText": "incomplete json';
    
    act(() => {
      result.current.parseQueriesText(invalidJson, false);
    });
    
    expect(result.current.manualQueries).toBe('');
    expect(result.current.parsedQueries).toEqual([]);
    expect(result.current.errors.manualQueriesError).toBeTruthy();
  });

  it('handles mixed valid/invalid JSON lines', () => {
    const { result } = renderHook(() => useQuerySetForm());
    
    const mixedInput = '{"queryText": "valid json"}\ninvalid line\n{"queryText": "another valid"}';
    
    act(() => {
      result.current.parseQueriesText(mixedInput, false);
    });
    
    // Only valid JSON lines should be processed when isPlainText is false
    expect(result.current.manualQueries).toBe(
      JSON.stringify([
        { queryText: 'valid json', referenceAnswer: '' },
        { queryText: 'another valid', referenceAnswer: '' }
      ])
    );
    expect(result.current.parsedQueries).toHaveLength(2);
  });

  it('treats all lines as queries in text input mode regardless of JSON validity', () => {
    const { result } = renderHook(() => useQuerySetForm());
    
    const mixedInput = 'plain text query\n{"this looks like": "json but is treated as plain text"}';
    
    act(() => {
      result.current.parseQueriesText(mixedInput, true);
    });
    
    // In text input mode, all lines should be treated as query text
    expect(result.current.manualQueries).toBe(
      JSON.stringify([
        { queryText: 'plain text query', referenceAnswer: '' },
        { queryText: '{"this looks like": "json but is treated as plain text"}', referenceAnswer: '' }
      ])
    );
    expect(result.current.parsedQueries).toHaveLength(2);
  });

  it('handles file processing errors', async () => {
    const mockFile = new File(['invalid content'], 'test.txt', { type: 'text/plain' });
    const mockFileList = ({
      0: mockFile,
      length: 1,
      item: () => mockFile,
    } as unknown) as FileList;

    // Mock File.text() method to throw an error
    Object.defineProperty(mockFile, 'text', {
      value: jest.fn().mockRejectedValue(new Error('Failed to read file')),
    });
    
    // Set up specific mock for this test
    (processQueryFile as jest.Mock).mockRejectedValueOnce(new Error('Failed to read file'));

    const { result } = renderHook(() => useQuerySetForm());

    await act(async () => {
      await result.current.handleFileContent(mockFileList);
    });

    expect(result.current.errors.manualQueriesError).toBe('Error reading file content');
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
