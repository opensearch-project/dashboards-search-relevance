/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  EuiFlexGroup,
  EuiFlexItem,
  EuiSpacer,
  EuiText,
  EuiCard,
  EuiLink,
  EuiTitle,
  EuiAccordion,
} from '@elastic/eui';
import { TemplateType } from './configuration/types';

interface GetStartedAccordionProps {
  isOpen?: boolean;
  templateType?: TemplateType;
}

interface Step {
  title: string;
  description: string;
}

const TEMPLATE_STEPS: Record<TemplateType, Step[]> = {
  [TemplateType.QuerySetComparison]: [
    {
      title: '1. Select your Query Set',
      description: 'Select the query set containing queries you want to use for comparison.',
    },
    {
      title: '2. Gather your Search Configuration',
      description:
        'You need to have TWO Search Configurations that you want to compare against each other already defined.',
    },
    {
      title: '3. Evaluate your Experiment',
      description:
        'Set based metrics like Jaccard and RBO will be calculated to compare the Search Configurations.',
    },
  ],
  [TemplateType.SearchEvaluation]: [
    {
      title: '1. Select your Query Set',
      description:
        'Select the query set containing queries you want to evaluate for search relevance.',
    },
    {
      title: '2. Select your Search Configuration',
      description: 'Select the search configuration that will be evaluated for relevance.',
    },
    {
      title: '3. Select your Judgment List',
      description:
        'Pick the judgment list to use in evaluating search results. You need judgment lists that overlap with your Query Set.',
    },
    {
      title: '4. Run Evaluation',
      description:
        "Execute the evaluation to generate metrics about your search configuration's performance.",
    },
  ],
  [TemplateType.HybridSearchOptimizer]: [
    {
      title: '1. Select your Query Set',
      description:
        'Select the query set containing queries you want to use to optimize lexical versus vector weighting for optimal search results in your Hybrid query.',
    },
    {
      title: '2. Configure Hybrid Search',
      description:
        'Set up the hybrid search parameters in a Search Configuration you want to optimize.',
    },
    {
      title: '3. Select your Judgment List',
      description:
        'Pick the judgment list to use in evaluating search results. Typically you want implicit judgments sourced from actual user behavior.',
    },
    {
      title: '4. Run Optimizer',
      description:
        'Execute the optimizer to find the best weights and configurations for your hybrid search.',
    },
    {
      title: '5. Assess Results',
      description: 'Look at the tabular result data to understand which variant performed best.',
    },
  ],
  [TemplateType.QueryAnalysis]: [
    {
      title: '1. Define Your Query',
      description: 'Specify a single query that you want to compare results for.',
    },
    {
      title: '2. Configure Search Parameters',
      description: 'Set up different search configurations to compare against each other.',
    },
    {
      title: '3. Define Comparison Metrics',
      description:
        'Choose the metrics that will be used to compare the different search configurations.',
    },
    {
      title: '4. Compare Results',
      description: 'View and analyze the differences between search configurations for your query.',
    },
  ],
};

const DEFAULT_STEPS: Step[] = [
  {
    title: '1. Select your Query Sets',
    description:
      "Select query sets that created either by sampling real live queries or upload the queries that you're interested in.",
  },
  {
    title: '2. Gather your Search Configuration',
    description: 'Import the query template along with other configurations for search.',
  },
  {
    title: '3. Select your Evaluation Configuration',
    description:
      'You can select to evaluate your experiment either by customized calculator or user behavior or LLM.',
  },
  {
    title: '4. Evaluate your Experiment',
    description:
      'Document-based judgement ratings will be collect and aggregated into evaluation metrics.',
  },
];

const renderStepCard = (step: Step) => (
  <EuiFlexItem key={step.title}>
    <EuiCard
      layout="horizontal"
      title={
        <EuiTitle size="s">
          <h3>{step.title}</h3>
        </EuiTitle>
      }
    >
      <EuiText>{step.description}</EuiText>
    </EuiCard>
  </EuiFlexItem>
);

export function GetStartedAccordion(props: GetStartedAccordionProps) {
  const { isOpen, templateType = TemplateType.QuerySetComparison } = props;
  const steps = TEMPLATE_STEPS[templateType] || DEFAULT_STEPS;

  return (
    <EuiAccordion
      style={{ marginBottom: '-16px' }}
      initialIsOpen={isOpen}
      id="accordionGetStarted"
      buttonContent={
        <EuiFlexGroup direction="row">
          <EuiFlexItem grow={false}>
            <EuiText>Get started</EuiText>
          </EuiFlexItem>
        </EuiFlexGroup>
      }
    >
      <EuiSpacer size="s" />
      <EuiFlexItem>
        <EuiFlexGroup direction="row">{steps.map(renderStepCard)}</EuiFlexGroup>
      </EuiFlexItem>
    </EuiAccordion>
  );
}
