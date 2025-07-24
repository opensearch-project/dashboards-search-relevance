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
 * Validates the entire search configuration form
 * @param name The search configuration name
 * @param query The query JSON string
 * @param selectedIndex The selected index array
 * @returns Object containing validation results
 */
export const validateForm = (
  name: string,
  query: string,
  selectedIndex: Array<{ label: string; value: string }>
): { isValid: boolean; nameError: string; queryError: string; indexError: string } => {
  const nameError = validateName(name);
  const queryError = validateQuery(query);
  const indexError = validateIndex(selectedIndex);

  const isValid = !nameError && !queryError && !indexError;

  return {
    isValid,
    nameError,
    queryError,
    indexError,
  };
};
