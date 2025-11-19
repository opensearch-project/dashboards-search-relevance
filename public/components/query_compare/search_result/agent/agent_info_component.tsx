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
} from '@elastic/eui';
import React from 'react';
import { SearchResults } from '../../../../types/index';
import { AgentHandler } from './agent_handler';

interface AgentInfoProps {
  queryResult: SearchResults;
  title: string;
  agentHandler: AgentHandler;
}

export const AgentInfo: React.FC<AgentInfoProps> = ({ queryResult, title, agentHandler }) => {
  if (!agentHandler.hasAgentInfo(queryResult)) return null;

  const agentSteps = agentHandler.getAgentStepsSummary(queryResult);
  const memoryId = agentHandler.getMemoryId(queryResult);
  const dslQuery = agentHandler.getDslQuery(queryResult);

  return (
    <EuiPanel hasBorder paddingSize="s">
      <EuiAccordion
        id={`agentic-info-${title}`}
        buttonContent={<EuiText size="s"><strong>Agentic Search Info - {title}</strong></EuiText>}
        paddingSize="s"
      >
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