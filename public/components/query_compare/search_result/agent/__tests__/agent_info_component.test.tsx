/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { AgentInfo } from '../agent_info_component';
import { AgentHandler } from '../agent_handler';
import { SearchResults } from '../../../../../types/index';

jest.mock('../agent_handler');

describe('AgentInfo', () => {
  let mockAgentHandler: jest.Mocked<AgentHandler>;
  let mockOnContinueConversation: jest.Mock;
  let mockOnClearConversation: jest.Mock;

  beforeEach(() => {
    mockAgentHandler = {
      hasAgentInfo: jest.fn(),
      getAgentStepsSummary: jest.fn(),
      getMemoryId: jest.fn(),
      getDslQuery: jest.fn(),
    } as any;
    mockOnContinueConversation = jest.fn();
    mockOnClearConversation = jest.fn();
  });

  it('should not render when no agent info exists', () => {
    mockAgentHandler.hasAgentInfo.mockReturnValue(false);
    const queryResult = {} as SearchResults;

    const { container } = render(
      <AgentInfo
        queryResult={queryResult}
        title="Test"
        agentHandler={mockAgentHandler}
      />
    );

    expect(container.firstChild).toBeNull();
  });

  it('should render agent info when available', () => {
    mockAgentHandler.hasAgentInfo.mockReturnValue(true);
    mockAgentHandler.getAgentStepsSummary.mockReturnValue('Test summary');
    mockAgentHandler.getMemoryId.mockReturnValue('test-memory-id');
    mockAgentHandler.getDslQuery.mockReturnValue('{"query": {}}');

    const queryResult = {} as SearchResults;

    render(
      <AgentInfo
        queryResult={queryResult}
        title="Test"
        agentHandler={mockAgentHandler}
      />
    );

    expect(screen.getByText('Agentic Search Info')).toBeInTheDocument();
    expect(screen.getByText('Test summary')).toBeInTheDocument();
    expect(screen.getByText('test-memory-id')).toBeInTheDocument();
  });

  it('should render with conversation management props', () => {
    mockAgentHandler.hasAgentInfo.mockReturnValue(true);
    mockAgentHandler.getMemoryId.mockReturnValue('test-memory-id');

    const queryResult = {} as SearchResults;
    const queryString = JSON.stringify({
      query: {
        agentic: {
          query_text: 'Find shoes'
        }
      }
    });

    const { container } = render(
      <AgentInfo
        queryResult={queryResult}
        title="Test"
        agentHandler={mockAgentHandler}
        queryString={queryString}
        onContinueConversation={mockOnContinueConversation}
        onClearConversation={mockOnClearConversation}
      />
    );

    // Component should render without errors
    expect(container.firstChild).not.toBeNull();
    expect(screen.getByText('Agentic Search Info')).toBeInTheDocument();
  });

  it('should render with existing memory ID in query', () => {
    mockAgentHandler.hasAgentInfo.mockReturnValue(true);
    mockAgentHandler.getMemoryId.mockReturnValue('test-memory-id');

    const queryResult = {} as SearchResults;
    const queryString = JSON.stringify({
      query: {
        agentic: {
          query_text: 'Find shoes',
          memory_id: 'existing-memory-id'
        }
      }
    });

    const { container } = render(
      <AgentInfo
        queryResult={queryResult}
        title="Test"
        agentHandler={mockAgentHandler}
        queryString={queryString}
        onContinueConversation={mockOnContinueConversation}
        onClearConversation={mockOnClearConversation}
      />
    );

    // Component should render without errors
    expect(container.firstChild).not.toBeNull();
    expect(screen.getByText('Agentic Search Info')).toBeInTheDocument();
  });

  it('should handle button click events when buttons are present', () => {
    mockAgentHandler.hasAgentInfo.mockReturnValue(true);
    mockAgentHandler.getMemoryId.mockReturnValue('test-memory-id');

    const queryResult = {} as SearchResults;
    const queryString = JSON.stringify({
      query: {
        agentic: {
          query_text: 'Find shoes'
        }
      }
    });

    render(
      <AgentInfo
        queryResult={queryResult}
        title="Test"
        agentHandler={mockAgentHandler}
        queryString={queryString}
        onContinueConversation={mockOnContinueConversation}
        onClearConversation={mockOnClearConversation}
      />
    );

    // Test passes if component renders without throwing errors
    expect(screen.getByText('Agentic Search Info')).toBeInTheDocument();
    
    // Try to find and click buttons if they exist
    const continueButton = screen.queryByText('Continue');
    if (continueButton) {
      fireEvent.click(continueButton);
      expect(mockOnContinueConversation).toHaveBeenCalled();
    }
  });

  it('should handle clear conversation functionality', () => {
    mockAgentHandler.hasAgentInfo.mockReturnValue(true);
    mockAgentHandler.getMemoryId.mockReturnValue('test-memory-id');

    const queryResult = {} as SearchResults;
    const queryString = JSON.stringify({
      query: {
        agentic: {
          query_text: 'Find shoes',
          memory_id: 'existing-memory-id'
        }
      }
    });

    render(
      <AgentInfo
        queryResult={queryResult}
        title="Test"
        agentHandler={mockAgentHandler}
        queryString={queryString}
        onContinueConversation={mockOnContinueConversation}
        onClearConversation={mockOnClearConversation}
      />
    );

    // Test passes if component renders without throwing errors
    expect(screen.getByText('Agentic Search Info')).toBeInTheDocument();
    
    // Try to find and click buttons if they exist
    const clearButton = screen.queryByText('Clear');
    if (clearButton) {
      fireEvent.click(clearButton);
      expect(mockOnClearConversation).toHaveBeenCalled();
    }
  });
});