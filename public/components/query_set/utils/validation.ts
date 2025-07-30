/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

export interface ValidationErrors {
  nameError: string;
  descriptionError: string;
  querySizeError: string;
  manualQueriesError: string;
}

export interface FormData {
  name: string;
  description: string;
  querySetSize: number;
  manualQueries: string;
  isManualInput: boolean;
  isTextInput?: boolean;
}

/**
 * Validates if a string contains characters that might break JSON parsing or cause XSS
 * @param input The string to validate
 * @returns true if the string is valid, false otherwise
 */
export const isValidInputString = (input: string): boolean => {
  // Regex to detect characters that might break JSON parsing or cause XSS:
  // - Double quotes (")
  // - Backslashes (\)
  // - HTML tags (<, >)
  // - Control characters (U+0000 to U+001F) and other problematic unicode characters
  //   that could interfere with JSON or string parsing.
  const forbiddenCharsRegex = /[<>"\\\x00-\x1F]/;
  return !forbiddenCharsRegex.test(input);
};

export const validateForm = (data: FormData): ValidationErrors => {
  const errors: ValidationErrors = {
    nameError: '',
    descriptionError: '',
    querySizeError: '',
    manualQueriesError: '',
  };

  if (!data.name.trim()) {
    errors.nameError = 'Name is a required parameter.';
  } else if (data.name.length > 50) {
    errors.nameError = 'Name is too long (> 50 characters).';
  } else if (!isValidInputString(data.name)) {
    errors.nameError =
      'Name contains invalid characters (e.g., quotes, backslashes, or HTML tags).';
  }

  if (!data.description.trim()) {
    errors.descriptionError = 'Description is a required parameter.';
  } else if (data.description.length > 250) {
    errors.descriptionError = 'Description is too long (> 250 characters).';
  } else if (!isValidInputString(data.description)) {
    errors.descriptionError =
      'Description contains invalid characters (e.g., quotes, backslashes, or HTML tags).';
  }

  if (data.isManualInput) {
    if (!data.manualQueries.trim()) {
      errors.manualQueriesError = data.isTextInput 
        ? 'Please enter at least one query.' 
        : 'Manual queries are required.';
    }
  } else {
    if (data.querySetSize <= 0) {
      errors.querySizeError = 'Query Set Size must be a positive integer.';
    }
  }

  return errors;
};

export const hasValidationErrors = (errors: ValidationErrors): boolean => {
  return Object.values(errors).some((error) => error.length > 0);
};
