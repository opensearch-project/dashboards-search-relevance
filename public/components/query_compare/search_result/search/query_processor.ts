/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { QueryError, QueryStringError, SelectIndexError, initialQueryErrorState } from '../../../../types/index';

export const validateQuery = (selectedIndex: string, queryString: string, queryError: QueryError) => {
  // Check if select an index
  if (!selectedIndex.length) {
    queryError.selectIndex = SelectIndexError.unselected;
  }

  // Check if query string is empty
  if (!queryString.length) {
    queryError.queryString = QueryStringError.empty;
    queryError.errorResponse.statusCode = 400;
  }
};

export const rewriteQuery = (value: string, queryString: string, queryError: QueryError) => {
  if (queryString.trim().length > 0) {
    try {
      return JSON.parse(queryString.replace(/%SearchText%/g, value));
    } catch {
      queryError.queryString = QueryStringError.invalid;
      queryError.errorResponse.statusCode = 400;
    }
  }
};

// A setup is considered "configured" if the user has selected an index OR modified the query
// from its default value '{}'. Unconfigured setups are skipped during validation to avoid
// generating confusing validation errors in single-setup mode.
const DEFAULT_QUERY_BODY = '{}';

export const isSetupConfigured = (selectedIndex: string, queryString: string): boolean => {
  return selectedIndex.length > 0 || queryString.trim() !== DEFAULT_QUERY_BODY;
};

export const prepareQueries = (
  searchBarValue: string,
  selectedIndex1: string,
  selectedIndex2: string,
  queryString1: string,
  queryString2: string
) => {
  const queryErrors = [
    { ...initialQueryErrorState, errorResponse: { ...initialQueryErrorState.errorResponse } },
    { ...initialQueryErrorState, errorResponse: { ...initialQueryErrorState.errorResponse } },
  ];
  const jsonQueries = [{}, {}];

  // Only validate and rewrite queries for configured setups
  if (isSetupConfigured(selectedIndex1, queryString1)) {
    validateQuery(selectedIndex1, queryString1, queryErrors[0]);
    jsonQueries[0] = rewriteQuery(searchBarValue, queryString1, queryErrors[0]);
  }

  if (isSetupConfigured(selectedIndex2, queryString2)) {
    validateQuery(selectedIndex2, queryString2, queryErrors[1]);
    jsonQueries[1] = rewriteQuery(searchBarValue, queryString2, queryErrors[1]);
  }

  return { queryErrors, jsonQueries };
};
