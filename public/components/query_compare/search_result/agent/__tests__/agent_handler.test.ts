/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { AgentHandler } from '../agent_handler';
import { SearchResults } from '../../../../../types/index';

describe('AgentHandler', () => {
  let agentHandler: AgentHandler;
  let mockHttp: any;

  beforeEach(() => {
    mockHttp = {
      post: jest.fn(),
    };
    agentHandler = new AgentHandler(mockHttp);
  });

  describe('isAgenticQuery', () => {
    it('should return true for valid agentic query', () => {
      const query = {
        query: {
          agentic: {
            query_text: 'Find me white shoes'
          }
        }
      };
      expect(agentHandler.isAgenticQuery(query)).toBe(true);
    });

    it('should return false for non-agentic query', () => {
      const query = {
        query: {
          match: { title: 'test' }
        }
      };
      expect(agentHandler.isAgenticQuery(query)).toBe(false);
    });

    it('should return false for null/undefined query', () => {
      expect(agentHandler.isAgenticQuery(null)).toBe(false);
      expect(agentHandler.isAgenticQuery(undefined)).toBe(false);
    });
  });

  describe('hasAgentInfo', () => {
    it('should return true when agent steps summary exists', () => {
      const result: SearchResults = {
        ext: { agent_steps_summary: 'Test summary' }
      } as SearchResults;
      expect(agentHandler.hasAgentInfo(result)).toBe(true);
    });

    it('should return true when memory ID exists', () => {
      const result: SearchResults = {
        ext: { memory_id: 'test-memory-id' }
      } as SearchResults;
      expect(agentHandler.hasAgentInfo(result)).toBe(true);
    });

    it('should return true when DSL query exists', () => {
      const result: SearchResults = {
        ext: { dsl_query: '{"query": {}}' }
      } as SearchResults;
      expect(agentHandler.hasAgentInfo(result)).toBe(true);
    });

    it('should return false when no agent info exists', () => {
      const result: SearchResults = {} as SearchResults;
      expect(agentHandler.hasAgentInfo(result)).toBe(false);
    });
  });

  describe('getMemoryId', () => {
    it('should return memory ID when it exists', () => {
      const result: SearchResults = {
        ext: { memory_id: 'test-memory-id' }
      } as SearchResults;
      expect(agentHandler.getMemoryId(result)).toBe('test-memory-id');
    });

    it('should return undefined when memory ID does not exist', () => {
      const result: SearchResults = {} as SearchResults;
      expect(agentHandler.getMemoryId(result)).toBeUndefined();
    });
  });

  describe('getAgentStepsSummary', () => {
    it('should return agent steps summary when it exists', () => {
      const result: SearchResults = {
        ext: { agent_steps_summary: 'Test summary' }
      } as SearchResults;
      expect(agentHandler.getAgentStepsSummary(result)).toBe('Test summary');
    });

    it('should return undefined when agent steps summary does not exist', () => {
      const result: SearchResults = {} as SearchResults;
      expect(agentHandler.getAgentStepsSummary(result)).toBeUndefined();
    });
  });

  describe('getDslQuery', () => {
    it('should return DSL query when it exists', () => {
      const result: SearchResults = {
        ext: { dsl_query: '{"query": {}}' }
      } as SearchResults;
      expect(agentHandler.getDslQuery(result)).toBe('{"query": {}}');
    });

    it('should return undefined when DSL query does not exist', () => {
      const result: SearchResults = {} as SearchResults;
      expect(agentHandler.getDslQuery(result)).toBeUndefined();
    });
  });
});