/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Validates the search configuration name
 * @param name The search configuration name to validate
 * @returns Error message if invalid, empty string if valid
 */
export const validateName = (name: string): string => {
  if (!name.trim()) {
    return 'Search Configuration Name is a required parameter.';
  }
  return '';
};

/**
 * Validates the search query JSON
 * @param query The query JSON string to validate
 * @returns Error message if invalid, empty string if valid
 */
export const validateQuery = (query: string): string => {
  if (!query.trim()) {
    return 'Query is required.';
  }

  try {
    JSON.parse(query);
    return '';
  } catch (e) {
    return 'Query Body must be valid JSON.';
  }
};

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

/**
 * Validates the selected index
 * @param selectedIndex The selected index array
 * @returns Error message if invalid, empty string if valid
 */
export const validateIndex = (selectedIndex: Array<{ label: string; value: string }>): string => {
  if (selectedIndex.length === 0) {
    return 'No index selected. Please select an index.';
  }
  return '';
};

/**
 * Validates the search configuration description
 * @param description The search configuration description to validate
 * @returns Error message if invalid, empty string if valid
 */
export const validateDescription = (description: string): string => {
    if (!description.trim()) {
      return 'Description is a required parameter.';
    } else if (description.length > 250) {
      return 'Description is too long (> 250 characters).';
    } else if (!isValidInputString(description)) {
      return 'Description contains invalid characters (e.g., quotes, backslashes, or HTML tags).';
    }
}

/**
 * Validates the entire search configuration form
 * @param name The search configuration name
 * @param query The query JSON string
 * @param selectedIndex The selected index array
 * @returns Object containing validation results
 */
export const validateForm = (
  name: string,
  description: string,
  query: string,
  selectedIndex: Array<{ label: string; value: string }>
): { isValid: boolean; nameError: string; descriptionError: string; queryError: string; indexError: string } => {
  const nameError = validateName(name);
  const descriptionError = validateDescription(description);
  const queryError = validateQuery(query);
  const indexError = validateIndex(selectedIndex);

  const isValid = !nameError && !descriptionError && !queryError && !indexError;

  return {
    isValid,
    nameError,
    descriptionError,
    queryError,
    indexError,
  };
};
