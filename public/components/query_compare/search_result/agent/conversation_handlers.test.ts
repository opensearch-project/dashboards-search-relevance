/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { createConversationHandlers } from './conversation_handlers';
import { AgentHandler } from './agent_handler';
import { SearchResults } from '../../../../types/index';

// Mock the memory utils
jest.mock('./memory_utils', () => ({
  addMemoryIdToQuery: jest.fn((query, memoryId) => `${query}_with_${memoryId}`),
  removeMemoryIdFromQuery: jest.fn((query) => `${query}_without_memory`)
}));

describe('conversation_handlers', () => {
  let mockAgentHandler: jest.Mocked<AgentHandler>;
  let mockSetQueryString1: jest.Mock;
  let mockSetQueryString2: jest.Mock;
  let queryResults: [SearchResults, SearchResults];
  let queryStrings: [string, string];

  beforeEach(() => {
    mockAgentHandler = {
      getMemoryId: jest.fn()
    } as any;
    
    mockSetQueryString1 = jest.fn();
    mockSetQueryString2 = jest.fn();
    
    queryResults = [{} as SearchResults, {} as SearchResults];
    queryStrings = ['query1', 'query2'];
  });

  describe('handleContinueConversation', () => {
    it('should add memory ID to query 1', () => {
      mockAgentHandler.getMemoryId.mockReturnValue('memory-123');
      
      const { handleContinueConversation } = createConversationHandlers(
        mockAgentHandler,
        queryResults,
        queryStrings,
        [mockSetQueryString1, mockSetQueryString2]
      );

      handleContinueConversation(1);

      expect(mockAgentHandler.getMemoryId).toHaveBeenCalledWith(queryResults[0]);
      expect(mockSetQueryString1).toHaveBeenCalledWith('query1_with_memory-123');
    });

    it('should add memory ID to query 2', () => {
      mockAgentHandler.getMemoryId.mockReturnValue('memory-456');
      
      const { handleContinueConversation } = createConversationHandlers(
        mockAgentHandler,
        queryResults,
        queryStrings,
        [mockSetQueryString1, mockSetQueryString2]
      );

      handleContinueConversation(2);

      expect(mockAgentHandler.getMemoryId).toHaveBeenCalledWith(queryResults[1]);
      expect(mockSetQueryString2).toHaveBeenCalledWith('query2_with_memory-456');
    });

    it('should not update query when no memory ID', () => {
      mockAgentHandler.getMemoryId.mockReturnValue(null);
      
      const { handleContinueConversation } = createConversationHandlers(
        mockAgentHandler,
        queryResults,
        queryStrings,
        [mockSetQueryString1, mockSetQueryString2]
      );

      handleContinueConversation(1);

      expect(mockSetQueryString1).not.toHaveBeenCalled();
    });
  });

  describe('handleClearConversation', () => {
    it('should remove memory ID from query 1', () => {
      const { handleClearConversation } = createConversationHandlers(
        mockAgentHandler,
        queryResults,
        queryStrings,
        [mockSetQueryString1, mockSetQueryString2]
      );

      handleClearConversation(1);

      expect(mockSetQueryString1).toHaveBeenCalledWith('query1_without_memory');
    });

    it('should remove memory ID from query 2', () => {
      const { handleClearConversation } = createConversationHandlers(
        mockAgentHandler,
        queryResults,
        queryStrings,
        [mockSetQueryString1, mockSetQueryString2]
      );

      handleClearConversation(2);

      expect(mockSetQueryString2).toHaveBeenCalledWith('query2_without_memory');
    });
  });
});
