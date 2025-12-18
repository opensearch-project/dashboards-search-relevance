/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

export const extractMemoryId = (queryString: string): string | null => {
  const query = JSON.parse(queryString);
  return query?.query?.agentic?.memory_id || null;
};

export const addMemoryIdToQuery = (queryString: string, memoryId: string): string => {
  try {
    const query = JSON.parse(queryString);
    if (query?.query?.agentic) {
      query.query.agentic.memory_id = memoryId;
      return JSON.stringify(query, null, 2);
    }
  } catch (error) {
    console.warn('Failed to parse query string when adding memory ID:', error);
  }
  return queryString;
};

export const removeMemoryIdFromQuery = (queryString: string): string => {
  try {
    const query = JSON.parse(queryString);
    if (query?.query?.agentic?.memory_id) {
      delete query.query.agentic.memory_id;
      return JSON.stringify(query, null, 2);
    }
  } catch (error) {
    console.warn('Failed to parse query string when removing memory ID:', error);
  }
  return queryString;
};
