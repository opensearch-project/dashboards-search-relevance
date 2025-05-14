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

interface TemplateCardsProps {
  onClose: () => void;
}

const templates = [
  {
    name: 'Single Query Comparison',
    description:
      'Test two search configurations with a single query. View side-by-side results to find the best performer.',
    isDisabled: false,
  },
  {
    name: 'Query Set Comparison',
    description:
      'Perform a comparison across an entire set of queries. Determine differences for your complete use case.',
    isDisabled: false,
  },
  {
    name: 'Query Evaluation',
    description: 'Evaluate a search configuration with user behavior judgments.',
    isDisabled: false,
  },
  {
    name: 'LLM Query Evaluation',
    description: 'Evaluate a search configuration using LLM as a judge.',
    isDisabled: false,
  },
];

export const TemplateCards = ({ onClose }: TemplateCardsProps) => {
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const { dataSourceEnabled, dataSourceManagement, setHeaderActionMenu, navigation } = useConfig();
  const { services } = useOpenSearchDashboards();
  const { notifications, http, chrome, savedObjects, application } = services;

  const getNavGroupEnabled = chrome.navGroup.getNavGroupEnabled();
  const parentBreadCrumbs = getNavGroupEnabled
    ? [{ text: COMPARE_SEARCH_RESULTS_TITLE, href: '#' }]
    : [{ text: PLUGIN_NAME, href: '#' }];

  const handleCardClick = (templateName: string) => {
    setSelectedTemplate(templateName);
  };

  if (selectedTemplate === 'Single Query Comparison') {
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
                icon={<EuiIcon size="xxl" type={`logo${template.name}`} />}
                title={template.name}
                isDisabled={template.isDisabled}
                description={template.description}
                onClick={() => handleCardClick(template.name)}
              />
            </EuiFlexItem>
          ))}
        </EuiFlexGroup>
      </EuiFlexItem>
    </>
  );
};
