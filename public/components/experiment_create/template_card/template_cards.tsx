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
import { COMPARE_SEARCH_RESULTS_TITLE, PLUGIN_NAME } from '../../../../common';
import { TemplateType } from '../configuration/types';

interface TemplateCardsProps {
  onClose: () => void;
  inputSelectedTemplate?: TemplateType | null;
  onCardClick?: (templateId: TemplateType) => void;
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

export const TemplateCards = ({ onClose, inputSelectedTemplate, onCardClick }: TemplateCardsProps) => {
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateType | null>(inputSelectedTemplate ?? null);
  const { dataSourceEnabled, dataSourceManagement, setHeaderActionMenu, navigation } = useConfig();
  const { services } = useOpenSearchDashboards();
  const { notifications, http, chrome, savedObjects, application } = services;

  const getNavGroupEnabled = chrome.navGroup.getNavGroupEnabled();
  const parentBreadCrumbs = getNavGroupEnabled
    ? [{ text: COMPARE_SEARCH_RESULTS_TITLE, href: '#' }]
    : [{ text: PLUGIN_NAME, href: '#' }];

  const handleCardClick = (templateId: TemplateType) => {
    setSelectedTemplate(templateId);
    onCardClick?.(templateId);
  };

  if (selectedTemplate === TemplateType.SingleQueryComparison) {
    return (
      <QueryCompareHome
        application={application}
        parentBreadCrumbs={parentBreadCrumbs}
        notifications={notifications}
        http={http}
        navigation={navigation}
        setBreadcrumbs={chrome.setBreadcrumbs}
        chrome={chrome}
        savedObjects={savedObjects}
        dataSourceEnabled={dataSourceEnabled}
        dataSourceManagement={dataSourceManagement}
        setActionMenu={setHeaderActionMenu}
        setToast={(title: string, color = 'success', text?: React.ReactNode) => {
          if (color === 'success') {
            notifications.toasts.addSuccess({ title, text });
          } else if (color === 'warning') {
            notifications.toasts.addWarning({ title, text });
          } else if (color === 'danger') {
            notifications.toasts.addDanger({ title, text });
          } else {
            notifications.toasts.add({ title, text });
          }
        }}
      />
    );
  }

  if (selectedTemplate) {
    return (
      <TemplateConfigurationWithRouter
        templateType={selectedTemplate}
        onBack={() => setSelectedTemplate(null)}
        onClose={onClose}
      />
    );
  }
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
