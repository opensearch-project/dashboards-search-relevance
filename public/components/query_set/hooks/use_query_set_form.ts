/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useCallback } from 'react';
import { validateForm, ValidationErrors, hasValidationErrors } from '../utils/validation';
import { processQueryFile, QueryItem, parseQueryFromLine } from '../utils/file_processor';

export interface UseQuerySetFormReturn {
  // Form state
  name: string;
  setName: (name: string) => void;
  description: string;
  setDescription: (description: string) => void;
  sampling: string;
  setSampling: (sampling: string) => void;
  querySetSize: number;
  setQuerySetSize: (size: number) => void;
  isManualInput: boolean;
  setIsManualInput: (manual: boolean) => void;
  manualQueries: string;
  setManualQueries: (queries: string) => void;
  files: File[];
  setFiles: (files: File[]) => void;
  parsedQueries: string[];
  setParsedQueries: (queries: string[]) => void;
  ubiQueriesIndex: string;
  setUbiQueriesIndex: (index: string) => void;
  ubiEventsIndex: string;
  setUbiEventsIndex: (index: string) => void;

  // New properties for manual input
  manualInputMethod: 'file' | 'text';
  setManualInputMethod: (method: 'file' | 'text') => void;
  manualQueryText: string;
  setManualQueryText: (text: string) => void;

  // Validation
  errors: ValidationErrors;
  validateField: (field: string, value: string) => void;
  isFormValid: () => boolean;

  // File handling
  handleFileContent: (files: FileList) => Promise<void>;
  clearFileData: () => void;
}

export const useQuerySetForm = (): UseQuerySetFormReturn => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [sampling, setSampling] = useState('random');
  const [querySetSize, setQuerySetSize] = useState<number>(10);
  const [isManualInput, setIsManualInput] = useState(false);
  const [manualQueries, setManualQueries] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [parsedQueries, setParsedQueries] = useState<string[]>([]);
  const [ubiQueriesIndex, setUbiQueriesIndex] = useState('');
  const [ubiEventsIndex, setUbiEventsIndex] = useState('');

  // New state for manual input method
  const [manualInputMethod, setManualInputMethod] = useState<'file' | 'text'>('file');
  const [manualQueryText, setManualQueryText] = useState('');

  const [errors, setErrors] = useState<ValidationErrors>({
    nameError: '',
    descriptionError: '',
    querySizeError: '',
    manualQueriesError: '',
  });

  const validateField = useCallback(
    (field: string, value: string) => {
      // Create a partial form data object with just the field being validated
      const partialData = {
        name: field === 'name' ? value : name,
        description: field === 'description' ? value : description,
        querySetSize,
        manualQueries,
        isManualInput,
      };

      // Get full validation results
      const validationResults = validateForm(partialData) as any;

      // Only update the error for the specific field
      setErrors((prev) => ({
        ...prev,
        [`${field}Error`]: validationResults[`${field}Error`],
      }));
    },
    [name, description, querySetSize, manualQueries, isManualInput]
  );

  const isFormValid = useCallback(() => {
    const formData = { name, description, querySetSize, manualQueries, isManualInput };
    const validationErrors = validateForm(formData);
    setErrors(validationErrors);
    return !hasValidationErrors(validationErrors);
  }, [name, description, querySetSize, manualQueries, isManualInput]);

  const handleFileContent = useCallback(async (files: FileList) => {
    if (files && files.length > 0) {
      const file = files[0];
      const result = await processQueryFile(file);

      if (result.error) {
        setErrors((prev) => ({ ...prev, manualQueriesError: result.error! }));
        clearFileData();
        return;
      }

      setManualQueries(JSON.stringify(result.queries));
      setParsedQueries(result.queries.map((q) => JSON.stringify(q)));
      setFiles([file]);
      setErrors((prev) => ({ ...prev, manualQueriesError: '' }));
    } else {
      clearFileData();
    }
  }, []);

  const handleTextChange = useCallback((text: string) => {
    setManualQueryText(text);

    if (!text.trim()) {
      setManualQueries('');
      setParsedQueries([]);
      return;
    }

    const lines = text.split('\n');
    const queries: QueryItem[] = [];

    lines.forEach(line => {
      const queryItem = parseQueryFromLine(line);
      if (queryItem) {
        queries.push(queryItem);
      }
    });

    if (queries.length > 0) {
      setManualQueries(JSON.stringify(queries));
      setParsedQueries(queries.map((q) => JSON.stringify(q)));
      setErrors((prev) => ({ ...prev, manualQueriesError: '' }));
    } else {
      setManualQueries('');
      setParsedQueries([]);
    }
  }, []);

  const clearFileData = useCallback(() => {
    setFiles([]);
    setManualQueries('');
    setParsedQueries([]);
    // also clear text input if we are clearing data, though this might be called from file picker mostly
  }, []);

  // When switching methods, we might want to clear data or not. 
  // For now, let's keep it simple: if you switch to text, we clear file data? 
  // Or maybe we treat them as separate sources but only one writes to manualQueries at a time.
  // The original implementation had clearFileData that wipes manualQueries. 
  // Let's ensure manualQueries is updated correctly when method changes.

  // Actually, let's just expose the new state and handler. 
  // If the user switches back to file, they might need to re-upload or we keep it. 
  // But since start, `manualQueries` is the source of truth for submission.

  return {
    name,
    setName,
    description,
    setDescription,
    sampling,
    setSampling,
    querySetSize,
    setQuerySetSize,
    isManualInput,
    setIsManualInput,
    manualQueries,
    setManualQueries,
    files,
    setFiles,
    parsedQueries,
    setParsedQueries,
    ubiQueriesIndex,
    setUbiQueriesIndex,
    ubiEventsIndex,
    setUbiEventsIndex,

    // New exports
    manualInputMethod,
    setManualInputMethod,
    manualQueryText,
    setManualQueryText: handleTextChange,

    errors,
    validateField,
    isFormValid,
    handleFileContent,
    clearFileData,
  };
};
