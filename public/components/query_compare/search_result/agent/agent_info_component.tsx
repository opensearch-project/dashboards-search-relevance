/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  EuiPanel,
  EuiAccordion,
  EuiText,
  EuiSpacer,
  EuiCodeBlock,
  EuiButtonEmpty,
  EuiIconTip,
  EuiFlexGroup,
  EuiFlexItem,
} from '@elastic/eui';
import React from 'react';
import { SearchResults } from '../../../../types/index';
import { AgentHandler } from './agent_handler';

interface AgentInfoProps {
  queryResult: SearchResults;
  title: string;
  agentHandler: AgentHandler;
  queryString?: string;
  onContinueConversation?: () => void;
  onClearConversation?: () => void;
}

export const AgentInfo: React.FC<AgentInfoProps> = ({ 
  queryResult, 
  title, 
  agentHandler,
  queryString,
  onContinueConversation,
  onClearConversation 
}) => {
  if (!agentHandler.hasAgentInfo(queryResult)) return null;

  const agentSteps = agentHandler.getAgentStepsSummary(queryResult);
  const memoryId = agentHandler.getMemoryId(queryResult);
  const dslQuery = agentHandler.getDslQuery(queryResult);

  // Only show buttons if all required props are provided
  const showButtons = queryString && onContinueConversation && onClearConversation;
  
  let hasMemoryInQuery = false;
  if (showButtons && queryString) {
    try {
      const query = JSON.parse(queryString);
      hasMemoryInQuery = !!query?.query?.agentic?.memory_id;
    } catch {
      hasMemoryInQuery = false;
    }
  }

  const shouldShowContinueButton = showButtons && memoryId && !hasMemoryInQuery;
  const shouldShowClearButton = showButtons && hasMemoryInQuery;

  return (
    <EuiPanel hasBorder paddingSize="s">
      <EuiAccordion
        id={`agentic-info-${title}`}
        buttonContent={<EuiText size="s"><strong>Agentic Search Info</strong></EuiText>}
        paddingSize="s"
      >
        {(shouldShowContinueButton || shouldShowClearButton) && (
          <>
            <EuiFlexGroup gutterSize="s" alignItems="center">
              {shouldShowContinueButton && (
                <EuiFlexItem grow={false}>
                  <EuiFlexGroup gutterSize="xs" alignItems="center">
                    <EuiFlexItem grow={false}>
                      <EuiButtonEmpty size="s" iconType="folderClosed" onClick={onContinueConversation}>
                        Continue conversation
                      </EuiButtonEmpty>
                    </EuiFlexItem>
                    <EuiFlexItem grow={false}>
                      <EuiIconTip content="Add the recent memory ID into the query to pass conversational history to the agent." />
                    </EuiFlexItem>
                  </EuiFlexGroup>
                </EuiFlexItem>
              )}
              {shouldShowClearButton && (
                <EuiFlexItem grow={false}>
                  <EuiFlexGroup gutterSize="xs" alignItems="center">
                    <EuiFlexItem grow={false}>
                      <EuiButtonEmpty size="s" iconType="cross" onClick={onClearConversation}>
                        Clear conversation
                      </EuiButtonEmpty>
                    </EuiFlexItem>
                    <EuiFlexItem grow={false}>
                      <EuiIconTip content="Remove the memory ID associated with the query. No conversational history will be passed to the agent." />
                    </EuiFlexItem>
                  </EuiFlexGroup>
                </EuiFlexItem>
              )}
            </EuiFlexGroup>
            <EuiSpacer size="s" />
          </>
        )}
        {agentSteps && (
          <>
            <EuiText size="s"><strong>Agent Steps Summary:</strong></EuiText>
            <EuiText size="s">{agentSteps}</EuiText>
            <EuiSpacer size="s" />
          </>
        )}
        {memoryId && (
          <>
            <EuiText size="s"><strong>Memory ID:</strong></EuiText>
            <EuiText size="s">{memoryId}</EuiText>
            <EuiSpacer size="s" />
          </>
        )}
        {dslQuery && (
          <>
            <EuiText size="s"><strong>Generated DSL Query:</strong></EuiText>
            <EuiCodeBlock language="json" fontSize="s" paddingSize="s">
              {JSON.stringify(JSON.parse(dslQuery), null, 2)}
            </EuiCodeBlock>
          </>
        )}
      </EuiAccordion>
    </EuiPanel>
  );
};