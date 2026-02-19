/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useCallback } from 'react';
import { validateForm, ValidationErrors, hasValidationErrors } from '../utils/validation';
import { processQueryFile, parseTextQueries, QueryItem } from '../utils/file_processor';

export type ManualInputMethod = 'file' | 'text';

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
  manualInputMethod: ManualInputMethod;
  setManualInputMethod: (method: ManualInputMethod) => void;
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

  // Validation
  errors: ValidationErrors;
  validateField: (field: string, value: string) => void;
  isFormValid: () => boolean;

  // File handling
  handleFileContent: (files: FileList | null) => Promise<void>;
  clearFileData: () => void;

  // Text input handling
  handleTextChange: (text: string) => void;
  handleManualInputMethodChange: (method: ManualInputMethod) => void;
}

export const useQuerySetForm = (): UseQuerySetFormReturn => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [sampling, setSampling] = useState('random');
  const [querySetSize, setQuerySetSize] = useState<number>(10);
  const [isManualInput, setIsManualInput] = useState(false);
  const [manualInputMethod, setManualInputMethod] = useState<ManualInputMethod>('file');
  const [manualQueries, setManualQueries] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [parsedQueries, setParsedQueries] = useState<string[]>([]);
  const [ubiQueriesIndex, setUbiQueriesIndex] = useState('');
  const [ubiEventsIndex, setUbiEventsIndex] = useState('');

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
      const validationResults = validateForm(partialData);

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

  const handleFileContent = useCallback(async (files: FileList | null) => {
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
    if (!text.trim()) {
      setManualQueries('');
      setParsedQueries([]);
      setErrors((prev) => ({ ...prev, manualQueriesError: '' }));
      return;
    }
    const result = parseTextQueries(text);
    if (result.error) {
      setErrors((prev) => ({ ...prev, manualQueriesError: result.error! }));
      setManualQueries('');
      setParsedQueries([]);
      return;
    }
    setManualQueries(JSON.stringify(result.queries));
    setParsedQueries(result.queries.map((q) => JSON.stringify(q)));
    setErrors((prev) => ({ ...prev, manualQueriesError: '' }));
  }, []);

  const handleManualInputMethodChange = useCallback((method: ManualInputMethod) => {
    setManualInputMethod(method);
    setFiles([]);
    setManualQueries('');
    setParsedQueries([]);
    setErrors((prev) => ({ ...prev, manualQueriesError: '' }));
  }, []);

  const clearFileData = useCallback(() => {
    setFiles([]);
    setManualQueries('');
    setParsedQueries([]);
  }, []);

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
    manualInputMethod,
    setManualInputMethod,
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
    errors,
    validateField,
    isFormValid,
    handleFileContent,
    clearFileData,
    handleTextChange,
    handleManualInputMethodChange,
  };
};
