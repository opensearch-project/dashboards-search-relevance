/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Processes a query by replacing the search text placeholder
 * @param query The original query string
 * @param searchText The search text to replace the placeholder with
 * @returns The processed query with placeholders replaced
 */
export const processQuery = (query: string, searchText: string = ''): string => {
  return query.replace(/%SearchText%/g, searchText);
};

/**
 * Prepares the query body for API request
 * @param query The processed query string
 * @returns The prepared query body object
 */
export const prepareQueryBody = (query: string): any => {
  try {
    const parsedQuery = JSON.parse(query);
    // If the query already has a 'query' field, use it as is, otherwise wrap it
    return parsedQuery.query ? parsedQuery : { query: parsedQuery };
  } catch (e) {
    throw new Error('Invalid query JSON');
  }
};

/**
 * Builds the search validation request body
 * @param index The index name
 * @param queryBody The prepared query body
 * @param pipeline Optional search pipeline name
 * @param size Number of results to return
 * @returns The complete request body for validation
 */
export const buildValidationRequestBody = (
  index: string,
  queryBody: any,
  pipeline?: string,
  size: number = 5
): any => {
  const requestBody: any = {
    query: {
      index,
      size,
      ...queryBody,
    },
  };

  if (pipeline) {
    requestBody.query.search_pipeline = pipeline;
  }

  return requestBody;
};

/**
 * Processes search results to ensure unique hits
 * @param results The search results from the API
 * @returns The processed results with unique hits
 */
export const processSearchResults = (results: any): any => {
  if (!results?.hits?.hits?.length) {
    return results;
  }

  // Create a Map to store unique hits by ID
  const uniqueHits = new Map();

  results.hits.hits.forEach((hit: any) => {
    const id = hit._id || hit._source?.id;
    if (!uniqueHits.has(id)) {
      uniqueHits.set(id, hit);
    }
  });

  // Replace the hits array with unique hits
  const processedResults = { ...results };
  processedResults.hits.hits = Array.from(uniqueHits.values());

  return processedResults;
};
