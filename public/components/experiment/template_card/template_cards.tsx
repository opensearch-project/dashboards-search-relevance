/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { EuiFlexItem, EuiCard, EuiIcon, EuiFlexGroup } from '@elastic/eui';
import { Routes } from '../../../../common';
import { TemplateType } from '../configuration/types';

interface TemplateCardsProps {
  history: { push: (route: string) => void };
}

interface Template {
  id: TemplateType;
  name: string;
  description: string;
  isDisabled: boolean;
}

const TEMPLATES: Template[] = [
  {
    id: TemplateType.QueryAnalysis,
    name: 'Query Analysis',
    description:
      'Run and analyze a single query. Optionally view side-by-side results to find the best performer.',
    isDisabled: false,
  },
  {
    id: TemplateType.QuerySetComparison,
    name: 'Query Set Comparison',
    description:
      'Perform a comparison across an entire set of queries. Determine differences across your complete use case.',
    isDisabled: false,
  },
  {
    id: TemplateType.SearchEvaluation,
    name: 'Search Evaluation',
    description: 'Calculate search quality metrics to evaluate specific search configuration.',
    isDisabled: false,
  },
  {
    id: TemplateType.HybridSearchOptimizer,
    name: 'Hybrid Search Optimizer',
    description: 'Find the best balance between neural and lexical hybrid search configuration.',
    isDisabled: false,
  },
];

const TEMPLATE_ICON = 'beaker';

const ROUTE_MAP: Record<TemplateType, string> = {
  [TemplateType.QueryAnalysis]: Routes.ExperimentCreateQueryAnalysis,
  [TemplateType.QuerySetComparison]: Routes.ExperimentCreateQuerySetComparison,
  [TemplateType.SearchEvaluation]: Routes.ExperimentCreateSearchEvaluation,
  [TemplateType.HybridSearchOptimizer]: Routes.ExperimentCreateHybridOptimizer,
};

export const TemplateCards = ({ history }: TemplateCardsProps) => {
  const handleCardClick = (templateId: TemplateType) => {
    history.push(ROUTE_MAP[templateId]);
  };

  return (
    <EuiFlexItem grow={false}>
      <EuiFlexGroup gutterSize="l">
        {TEMPLATES.map((template) => (
          <EuiFlexItem key={template.id}>
            <EuiCard
              icon={<EuiIcon size="xxl" type={TEMPLATE_ICON} />}
              title={template.name}
              isDisabled={template.isDisabled}
              description={template.description}
              onClick={() => handleCardClick(template.id)}
            />
          </EuiFlexItem>
        ))}
      </EuiFlexGroup>
    </EuiFlexItem>
  );
};
