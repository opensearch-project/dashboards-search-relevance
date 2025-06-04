/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { EuiPanel, EuiFlexItem, EuiCard, EuiIcon, EuiFlexGroup } from '@elastic/eui';

import { Header } from '../../common/header';
import { TemplateConfigurationWithRouter } from '../configuration/template_configuration';
import { Home as QueryCompareHome } from '../../query_compare/home';
import { useConfig } from '../../../contexts/date_format_context';
import { useOpenSearchDashboards } from '../../../../../../src/plugins/opensearch_dashboards_react/public';
import { COMPARE_SEARCH_RESULTS_TITLE, PLUGIN_NAME, Routes } from '../../../../common';
import { TemplateType } from '../configuration/types';

interface TemplateCardsProps {
  inputSelectedTemplate?: TemplateType | null;
  history: any;
}

const templates = [
  {
    id: TemplateType.SingleQueryComparison,
    name: 'Single Query Comparison',
    description:
      'Test two search configurations with a single query. View side-by-side results to find the best performer.',
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

const iconMap = {
  [TemplateType.SingleQueryComparison]: 'beaker',
  [TemplateType.QuerySetComparison]: 'beaker',
  [TemplateType.SearchEvaluation]: 'beaker',
  [TemplateType.HybridSearchOptimizer]: 'beaker',
};

const RouteMap = {
  [TemplateType.SingleQueryComparison]: Routes.ExperimentCreateSingleQueryComparison,
  [TemplateType.QuerySetComparison]: Routes.ExperimentCreateQuerySetComparison,
  [TemplateType.SearchEvaluation]: Routes.ExperimentCreateSearchEvaluation,
  [TemplateType.HybridSearchOptimizer]: Routes.ExperimentCreateHybridOptimizer,
}

export const TemplateCards = ({ history }: TemplateCardsProps) => {
  const handleCardClick = (templateId: TemplateType) => {
    history.push(RouteMap[templateId]);
  };

  return (
    <>
      <EuiFlexItem grow={false}>
        <EuiFlexGroup gutterSize="l">
          {templates.map((template, index) => (
            <EuiFlexItem key={index}>
              <EuiCard
                icon={<EuiIcon size="xxl" type={iconMap[template.id]} />}
                title={template.name}
                isDisabled={template.isDisabled}
                description={template.description}
                onClick={() => handleCardClick(template.id)}
              />
            </EuiFlexItem>
          ))}
        </EuiFlexGroup>
      </EuiFlexItem>
    </>
  );
};
