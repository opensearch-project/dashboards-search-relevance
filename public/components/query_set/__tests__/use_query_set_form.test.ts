/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { renderHook, act } from '@testing-library/react-hooks';
import { useQuerySetForm } from '../hooks/use_query_set_form';
import * as validation from '../utils/validation';
import { processQueryFile, processPlainTextFile } from '../utils/file_processor';

jest.mock('../utils/validation', () => ({
  validateForm: jest.fn(),
  hasValidationErrors: jest.fn(),
  isValidInputString: jest.fn(),
  hasPairedCurlyBraces: (input: string) => {
    const openBraces = (input.match(/\{/g) || []).length;
    const closeBraces = (input.match(/\}/g) || []).length;
    return openBraces > 0 && closeBraces > 0;
  },
}));
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
        const queryItem = { queryText: parsed.queryText };
        if (parsed.referenceAnswer) {
          queryItem.referenceAnswer = parsed.referenceAnswer;
        }
        return { 
          queries: [queryItem],
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
        .map(line => ({ queryText: line.trim() }));
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
        { queryText: 'query 1' },
        { queryText: 'query 2' }
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

  it('rejects text input with paired curly braces', () => {
    const { result } = renderHook(() => useQuerySetForm());
    
    const textWithCurlyBraces = 'what is opensearch\nquery with {field: value}\nhow to search';
    
    act(() => {
      result.current.parseQueriesText(textWithCurlyBraces, true);
    });
    
    expect(result.current.manualQueries).toBe('');
    expect(result.current.parsedQueries).toEqual([]);
    expect(result.current.errors.manualQueriesError).toBe('Queries should not be in JSON format.');
  });

  it('allows text input with only opening curly braces', () => {
    const { result } = renderHook(() => useQuerySetForm());
    
    const textWithOpenBrace = 'what is opensearch\nquery with { only opening\nhow to search';
    
    act(() => {
      result.current.parseQueriesText(textWithOpenBrace, true);
    });
    
    expect(result.current.manualQueries).toBe(
      JSON.stringify([
        { queryText: 'what is opensearch' },
        { queryText: 'query with { only opening' },
        { queryText: 'how to search' }
      ])
    );
    expect(result.current.errors.manualQueriesError).toBe('');
  });

  it('allows JSON input with curly braces in file upload mode', () => {
    const { result } = renderHook(() => useQuerySetForm());
    
    const jsonInput = '{"queryText": "what is opensearch"}\n{"queryText": "query with {nested: json}"}';
    
    act(() => {
      result.current.parseQueriesText(jsonInput, false);
    });
    
    expect(result.current.manualQueries).toBe(
      JSON.stringify([
        { queryText: 'what is opensearch' },
        { queryText: 'query with {nested: json}' }
      ])
    );
    expect(result.current.errors.manualQueriesError).toBe('');
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
        { queryText: 'valid json' },
        { queryText: 'another valid' }
      ])
    );
    expect(result.current.parsedQueries).toHaveLength(2);
  });

  it('rejects text input with JSON-like content containing paired curly braces', () => {
    const { result } = renderHook(() => useQuerySetForm());
    
    const mixedInput = 'plain text query\n{"this looks like": "json but is treated as plain text"}';
    
    act(() => {
      result.current.parseQueriesText(mixedInput, true);
    });
    
    // Should be rejected due to paired curly braces
    expect(result.current.manualQueries).toBe('');
    expect(result.current.parsedQueries).toEqual([]);
    expect(result.current.errors.manualQueriesError).toBe('Queries should not be in JSON format.');
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

  it('handles too many queries correctly', () => {
    const { result } = renderHook(() => useQuerySetForm());
    
    // Create a huge string with many lines to simulate exceeding the query limit
    // We'll use a more reasonable approach by actually creating enough lines
    // to trigger the limit check, but we'll mock the parsing to be more efficient
    
    // Mock the String.prototype.split to return a very large array
    const originalSplit = String.prototype.split;
    String.prototype.split = jest.fn().mockImplementation(function(separator) {
      if (this.toString() === 'TRIGGER_QUERY_LIMIT_TEST' && separator === '\n') {
        // Create an array with 1,000,001 entries to trigger the limit
        return Array(1000001).fill('query line');
      }
      return originalSplit.call(this, separator);
    });
    
    act(() => {
      // Use our special test string to trigger the mock
      result.current.parseQueriesText('TRIGGER_QUERY_LIMIT_TEST', true);
    });
    
    // Restore the original split function
    String.prototype.split = originalSplit;
    
    expect(result.current.manualQueries).toBe('');
    expect(result.current.parsedQueries).toEqual([]);
    expect(result.current.errors.manualQueriesError).toBe('Too many queries found (> 1,000,000)');
  });

  it('respects explicit isPlainText parameter regardless of component state', () => {
    const { result } = renderHook(() => useQuerySetForm());
    
    // First set the isTextInput to false (JSON mode)
    act(() => {
      result.current.setIsTextInput(false);
    });
    
    // Even though we're in JSON mode, explicitly pass true for isPlainText
    // This should reject content with paired curly braces
    const textWithJsonSyntax = '{"looks like": "json"}';
    
    act(() => {
      result.current.parseQueriesText(textWithJsonSyntax, true); // explicitly true
    });
    
    // Should be rejected due to paired curly braces
    expect(result.current.manualQueries).toBe('');
    expect(result.current.parsedQueries).toEqual([]);
    expect(result.current.errors.manualQueriesError).toBe('Queries should not be in JSON format.');
    
    // Now test the opposite case
    const plainText = 'simple query text';
    
    // Set to text mode
    act(() => {
      result.current.setIsTextInput(true);
    });
    
    // But explicitly parse as JSON
    act(() => {
      result.current.parseQueriesText(plainText, false); // explicitly false
    });
    
    // Since it's not valid JSON and we forced JSON mode, it should fail to parse
    expect(result.current.manualQueries).toBe('');
    expect(result.current.parsedQueries).toEqual([]);
    expect(result.current.errors.manualQueriesError).toBeTruthy();
  });

  it('handles file processing result errors', async () => {
    // Mock the file processors to return errors
    (processQueryFile as jest.Mock).mockResolvedValueOnce({
      queries: [],
      error: 'Error in query file format'
    });

    (processPlainTextFile as jest.Mock).mockResolvedValueOnce({
      queries: [],
      error: 'Error in plain text file format'
    });

    const mockFile = new File(['test content'], 'test.txt', { type: 'text/plain' });
    const mockFileList = ({
      0: mockFile,
      length: 1,
      item: () => mockFile,
    } as unknown) as FileList;

    // Mock File.text() method
    Object.defineProperty(mockFile, 'text', {
      value: jest.fn().mockResolvedValue('test content'),
    });

    const { result } = renderHook(() => useQuerySetForm());

    // Test JSON mode (isTextInput = false) error
    await act(async () => {
      await result.current.handleFileContent(mockFileList);
    });

    expect(result.current.errors.manualQueriesError).toBe('Error in query file format');
    expect(result.current.files).toEqual([]);
    expect(result.current.manualQueries).toBe('');
    expect(result.current.parsedQueries).toEqual([]);

    // Test plain text mode (isTextInput = true) error
    act(() => {
      result.current.setIsTextInput(true);
    });

    await act(async () => {
      await result.current.handleFileContent(mockFileList);
    });

    expect(result.current.errors.manualQueriesError).toBe('Error in plain text file format');
    expect(result.current.files).toEqual([]);
    expect(result.current.manualQueries).toBe('');
    expect(result.current.parsedQueries).toEqual([]);
  });
});
