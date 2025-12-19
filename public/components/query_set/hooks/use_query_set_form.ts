/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useCallback } from 'react';
import { validateForm, ValidationErrors, hasValidationErrors, hasPairedCurlyBraces } from '../utils/validation';
import { processQueryFile, processPlainTextFile, QueryItem } from '../utils/file_processor';

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
  isTextInput: boolean;
  setIsTextInput: (isText: boolean) => void;
  manualQueries: string;
  setManualQueries: (queries: string) => void;
  files: File[];
  setFiles: (files: File[]) => void;
  parsedQueries: string[];
  setParsedQueries: (queries: string[]) => void;

  // Validation
  errors: ValidationErrors;
  validateField: (field: string, value: string) => void;
  isFormValid: () => boolean;

  // Input handling
  handleFileContent: (files: FileList) => Promise<void>;
  parseQueriesText: (text: string, isPlainText?: boolean) => void;
  clearFileData: () => void;
}

export const useQuerySetForm = (): UseQuerySetFormReturn => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [sampling, setSampling] = useState('random');
  const [querySetSize, setQuerySetSize] = useState<number>(10);
  const [isManualInput, setIsManualInput] = useState(false);
  const [isTextInput, setIsTextInput] = useState(false);
  const [manualQueries, setManualQueries] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [parsedQueries, setParsedQueries] = useState<string[]>([]);

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

  const parseQueriesText = useCallback((text: string, isPlainText = isTextInput) => {
    try {
      if (!text.trim()) {
        const errorMsg = isPlainText ? 'No valid queries found' : 'No valid queries found in file';
        setErrors((prev) => ({ ...prev, manualQueriesError: errorMsg }));
        setManualQueries('');
        setParsedQueries([]);
        return;
      }

      // For plain text input, check for paired curly braces
      if (isPlainText && hasPairedCurlyBraces(text)) {
        setErrors((prev) => ({ ...prev, manualQueriesError: 'Queries should not be in JSON format.' }));
        setManualQueries('');
        setParsedQueries([]);
        return;
      }

      const lines = text.trim().split('\n');
      const queryList: QueryItem[] = [];

      for (const line of lines) {
        if (!line.trim()) continue;

        try {
          // If it's plain text input, treat each line as a query
          if (isPlainText) {
            queryList.push({
              queryText: line.trim(),
            });
          } else {
            // Try to parse as JSON for file upload mode
            const parsed = JSON.parse(line.trim());
            if (parsed.queryText) {
              const queryItem: QueryItem = {
                queryText: String(parsed.queryText).trim(),
              };
              if (parsed.referenceAnswer) {
                queryItem.referenceAnswer = String(parsed.referenceAnswer).trim();
              }
              queryList.push(queryItem);
            }
          }
        } catch (e) {
          // For plain text, this shouldn't happen
          // For JSON mode, skip invalid lines
          if (!isPlainText) {
            console.error('Error parsing line:', line, e);
          } else {
            // Even if JSON parsing fails, still add it as a plain query
            queryList.push({
              queryText: line.trim(),
            });
          }
        }
      }

      if (queryList.length === 0) {
        const errorMsg = isPlainText ? 'No valid queries found' : 'No valid queries found in file';
        setErrors((prev) => ({ ...prev, manualQueriesError: errorMsg }));
        if (!isPlainText) setFiles([]);
        setManualQueries('');
        setParsedQueries([]);
        return;
      }

      if (queryList.length > 1000000) {
        setErrors((prev) => ({ ...prev, manualQueriesError: 'Too many queries found (> 1,000,000)' }));
        if (!isPlainText) setFiles([]);
        setManualQueries('');
        setParsedQueries([]);
        return;
      }

      // Store the raw query objects as JSON string
      setManualQueries(JSON.stringify(queryList));
      setParsedQueries(queryList.map((q) => JSON.stringify(q)));
      setErrors((prev) => ({ ...prev, manualQueriesError: '' }));
    } catch (error) {
      console.error('Error processing queries:', error);
      setErrors((prev) => ({ ...prev, manualQueriesError: 'Error parsing queries' }));
      setManualQueries('');
      setParsedQueries([]);
    }
  }, [isTextInput]);

  const isFormValid = useCallback(() => {
    const formData = { 
      name, 
      description, 
      querySetSize, 
      manualQueries, 
      isManualInput, 
      isTextInput 
    };
    const validationErrors = validateForm(formData);
    setErrors(validationErrors);
    return !hasValidationErrors(validationErrors);
  }, [name, description, querySetSize, manualQueries, isManualInput, isTextInput]);

  const clearFileData = useCallback(() => {
    setFiles([]);
    setManualQueries('');
    setParsedQueries([]);
  }, []);

  const handleFileContent = useCallback(async (files: FileList) => {
    if (files && files.length > 0) {
      try {
        const file = files[0];
        // First set the file so tests can check it
        setFiles([file]);
        
        // Process the file content based on input type
        let result;
        try {
          if (isTextInput) {
            result = await processPlainTextFile(file);
          } else {
            result = await processQueryFile(file);
          }
          
          if (result.error) {
            setErrors((prev) => ({ ...prev, manualQueriesError: result.error }));
            clearFileData();
            return;
          }
          
          // Store the raw query objects as JSON string
          setManualQueries(JSON.stringify(result.queries));
          setParsedQueries(result.queries.map((q) => JSON.stringify(q)));
          setErrors((prev) => ({ ...prev, manualQueriesError: '' }));
        } catch (processingError) {
          console.error('Error processing file content:', processingError);
          setErrors((prev) => ({ ...prev, manualQueriesError: 'Error reading file content' }));
          clearFileData();
        }
      } catch (error) {
        console.error('Error handling file:', error);
        setErrors((prev) => ({ ...prev, manualQueriesError: 'Error reading file content' }));
        clearFileData();
      }
    } else {
      clearFileData();
    }
  }, [isTextInput, clearFileData]);

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
    isTextInput,
    setIsTextInput,
    manualQueries,
    setManualQueries,
    files,
    setFiles,
    parsedQueries,
    setParsedQueries,
    errors,
    validateField,
    isFormValid,
    handleFileContent,
    parseQueriesText,
    clearFileData,
  };
};
