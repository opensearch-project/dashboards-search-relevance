/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { EuiPanel, EuiFlexItem, EuiCard, EuiIcon, EuiFlexGroup } from '@elastic/eui';

import { Header } from '../../common/header';
import { TemplateConfigurationWithRouter } from '../configuration/template_configuration';

interface TemplateCardsProps {
  onClose: () => void;
}

const templates = [
  {
    name: 'Result List Comparison',
    description:
      'Compare the search results of multiple search configurations executed on saved query lists.',
    isDisabled: false,
  },
  {
    name: 'Search Evaluation',
    description: 'Calculate search quality metrics to evaluate search configurations.',
    isDisabled: false,
  },
  {
    name: 'Hybrid Search Optimizer',
    description: 'Find the best hybrid search configuration.',
    isDisabled: false,
  },
];

export const TemplateCards = ({ onClose }: TemplateCardsProps) => {
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const handleCardClick = (templateName: string) => {
    setSelectedTemplate(templateName);
  };

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
                title={`${template.name} Template`}
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
