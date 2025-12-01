/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { SearchResults } from '../../../../types/index';
import { AgentHandler } from './agent_handler';
import { addMemoryIdToQuery, removeMemoryIdFromQuery } from './memory_utils';

export const createConversationHandlers = (
  agentHandler: AgentHandler,
  queryResults: [SearchResults, SearchResults],
  queryStrings: [string, string],
  setQueryStrings: [(query: string) => void, (query: string) => void]
) => {
  const handleContinueConversation = (queryNumber: 1 | 2) => {
    const index = queryNumber - 1;
    const queryResult = queryResults[index];
    const setQueryString = setQueryStrings[index];
    const currentQueryString = queryStrings[index];
    
    const memoryId = agentHandler.getMemoryId(queryResult);
    if (memoryId) {
      const updatedQuery = addMemoryIdToQuery(currentQueryString, memoryId);
      setQueryString(updatedQuery);
    }
  };

  const handleClearConversation = (queryNumber: 1 | 2) => {
    const index = queryNumber - 1;
    const setQueryString = setQueryStrings[index];
    const currentQueryString = queryStrings[index];
    
    const updatedQuery = removeMemoryIdFromQuery(currentQueryString);
    setQueryString(updatedQuery);
  };

  return { handleContinueConversation, handleClearConversation };
};
