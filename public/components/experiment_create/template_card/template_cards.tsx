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
    name: 'Compare Result Lists',
    description:
      'Compare the search results of two search configurations executed with a query set.',
    isDisabled: false,
  },
  {
    name: 'User Behavior',
    description: 'Use User Behavior judgments to start with your experiment.',
    isDisabled: false,
  },
  {
    name: 'LLM',
    description: 'Use LLM as judge to start with your experiment.',
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
                title={`${template.name} Experiment`}
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
