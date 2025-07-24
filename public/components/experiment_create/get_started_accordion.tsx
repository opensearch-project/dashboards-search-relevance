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

export function GetStartedAccordion(props: GetStartedAccordionProps) {
  const { isOpen, templateType = TemplateType.QuerySetComparison } = props;

  const renderContent = () => {
    switch (templateType) {
      case TemplateType.QuerySetComparison:
        return (
          <EuiFlexGroup direction="row">
            <EuiFlexItem>
              <EuiCard
                layout="horizontal"
                title={
                  <EuiTitle size="s">
                    <h3>1. Select your Query Set</h3>
                  </EuiTitle>
                }
              >
                <EuiText>
                  Select the query set containing queries you want to use for comparison.
                </EuiText>
              </EuiCard>
            </EuiFlexItem>
            <EuiFlexItem>
              <EuiCard
                layout="horizontal"
                title={
                  <EuiTitle size="s">
                    <h3>2. Gather your Search Configuration</h3>
                  </EuiTitle>
                }
              >
                <EuiText>
                  You need to have TWO Search Configurations that you want to compare against each
                  other already defined.
                </EuiText>
              </EuiCard>
            </EuiFlexItem>            
            <EuiFlexItem>
              <EuiCard
                layout="horizontal"
                title={
                  <EuiTitle size="s">
                    <h3>3. Evaluate your Experiment</h3>
                  </EuiTitle>
                }
              >
                <EuiText>
                  Set based metrics like Jaccard and RBO will be calculated to compare the Search
                  Configurations.
                </EuiText>
              </EuiCard>
            </EuiFlexItem>
          </EuiFlexGroup>
        );

      case TemplateType.SearchEvaluation:
        return (
          <EuiFlexGroup direction="row">
            <EuiFlexItem>
              <EuiCard
                layout="horizontal"
                title={
                  <EuiTitle size="s">
                    <h3>1. Select your Query Set</h3>
                  </EuiTitle>
                }
              >
                <EuiText>
                  Select the query set containing queries you want to evaluate for search relevance.
                </EuiText>
              </EuiCard>
            </EuiFlexItem>
            <EuiFlexItem>
              <EuiCard
                layout="horizontal"
                title={
                  <EuiTitle size="s">
                    <h3>2. Select your Search Configuration</h3>
                  </EuiTitle>
                }
              >
                <EuiText>
                  Select the search configuration that will be evaluated for relevance.
                </EuiText>
              </EuiCard>
            </EuiFlexItem>
            <EuiFlexItem>
              <EuiCard
                layout="horizontal"
                title={
                  <EuiTitle size="s">
                    <h3>3. Select your Judgment List</h3>
                  </EuiTitle>
                }
              >
                <EuiText>
                  Pick the judgment list to use in evaluating search results. You need judgment
                  lists that overlap with your Query Set.
                </EuiText>
              </EuiCard>
            </EuiFlexItem>
            <EuiFlexItem>
              <EuiCard
                layout="horizontal"
                title={
                  <EuiTitle size="s">
                    <h3>4. Run Evaluation</h3>
                  </EuiTitle>
                }
              >
                <EuiText>
                  Execute the evaluation to generate metrics about your search configuration's
                  performance.
                </EuiText>
              </EuiCard>
            </EuiFlexItem>
          </EuiFlexGroup>
        );

      case TemplateType.HybridSearchOptimizer:
        return (
          <EuiFlexGroup direction="row">
            <EuiFlexItem>
              <EuiCard
                layout="horizontal"
                title={
                  <EuiTitle size="s">
                    <h3>1. Select your Query Set</h3>
                  </EuiTitle>
                }
              >
                <EuiText>
                  Select the query set containing queries you want to use to optimize lexical versus
                  vector weighting for optimal search results in your Hybrid query.
                </EuiText>
              </EuiCard>
            </EuiFlexItem>
            <EuiFlexItem>
              <EuiCard
                layout="horizontal"
                title={
                  <EuiTitle size="s">
                    <h3>2. Configure Hybrid Search</h3>
                  </EuiTitle>
                }
              >
                <EuiText>
                  Set up the hybrid search parameters in a Search Configuraiton you want to
                  optimize.
                </EuiText>
              </EuiCard>
            </EuiFlexItem>
            <EuiFlexItem>
              <EuiCard
                layout="horizontal"
                title={
                  <EuiTitle size="s">
                    <h3>3. Select your Judgment List</h3>
                  </EuiTitle>
                }
              >
                <EuiText>
                  Pick the judgment list to use in evaluating search results. Typically you want
                  implicit judgments sourced from{' '}
                  <a href="https://docs.opensearch.org/docs/latest/search-plugins/ubi/index/">
                    actual user behavior
                  </a>
                  .
                </EuiText>
              </EuiCard>
            </EuiFlexItem>
            <EuiFlexItem>
              <EuiCard
                layout="horizontal"
                title={
                  <EuiTitle size="s">
                    <h3>4. Run Optimizer</h3>
                  </EuiTitle>
                }
              >
                <EuiText>
                  Execute the optimizer to find the best weights and configurations for your hybrid
                  search.
                </EuiText>
              </EuiCard>
            </EuiFlexItem>
            <EuiFlexItem>
              <EuiCard
                layout="horizontal"
                title={
                  <EuiTitle size="s">
                    <h3>5. Assess Results</h3>
                  </EuiTitle>
                }
              >
                <EuiText>
                  Look at the tabular result data to understand which variant performed best.
                </EuiText>
              </EuiCard>
            </EuiFlexItem>
          </EuiFlexGroup>
        );

      case TemplateType.SingleQueryComparison:
        return (
          <EuiFlexGroup direction="row">
            <EuiFlexItem>
              <EuiCard
                layout="horizontal"
                title={
                  <EuiTitle size="s">
                    <h3>1. Define Your Query</h3>
                  </EuiTitle>
                }
              >
                <EuiText>Specify a single query that you want to compare results for.</EuiText>
              </EuiCard>
            </EuiFlexItem>
            <EuiFlexItem>
              <EuiCard
                layout="horizontal"
                title={
                  <EuiTitle size="s">
                    <h3>2. Configure Search Parameters</h3>
                  </EuiTitle>
                }
              >
                <EuiText>
                  Set up different search configurations to compare against each other.
                </EuiText>
              </EuiCard>
            </EuiFlexItem>
            <EuiFlexItem>
              <EuiCard
                layout="horizontal"
                title={
                  <EuiTitle size="s">
                    <h3>3. Define Comparison Metrics</h3>
                  </EuiTitle>
                }
              >
                <EuiText>
                  Choose the metrics that will be used to compare the different search
                  configurations.
                </EuiText>
              </EuiCard>
            </EuiFlexItem>
            <EuiFlexItem>
              <EuiCard
                layout="horizontal"
                title={
                  <EuiTitle size="s">
                    <h3>4. Compare Results</h3>
                  </EuiTitle>
                }
              >
                <EuiText>
                  View and analyze the differences between search configurations for your query.
                </EuiText>
              </EuiCard>
            </EuiFlexItem>
          </EuiFlexGroup>
        );

      default:
        return (
          <EuiFlexGroup direction="row">
            <EuiFlexItem>
              <EuiCard
                layout="horizontal"
                title={
                  <EuiTitle size="s">
                    <h3>1. Select your Query Sets</h3>
                  </EuiTitle>
                }
              >
                <EuiText>
                  Select query sets that created either by sampling real live queries or upload the
                  queries that you're interested in.
                </EuiText>
              </EuiCard>
            </EuiFlexItem>
            <EuiFlexItem>
              <EuiCard
                layout="horizontal"
                title={
                  <EuiTitle size="s">
                    <h3>2. Gather your Search Configuration</h3>
                  </EuiTitle>
                }
              >
                <EuiText>
                  Import the query template along with other configurations for search.
                </EuiText>
              </EuiCard>
            </EuiFlexItem>
            <EuiFlexItem>
              <EuiCard
                layout="horizontal"
                title={
                  <EuiTitle size="s">
                    <h3>3. Select your Evaluation Configuration</h3>
                  </EuiTitle>
                }
              >
                <EuiText>
                  You can select to evaluate your experiment either by customized calculator or user
                  behavior or LLM.
                </EuiText>
              </EuiCard>
            </EuiFlexItem>
            <EuiFlexItem>
              <EuiCard
                layout="horizontal"
                title={
                  <EuiTitle size="s">
                    <h3>4. Evaluate your Experiment</h3>
                  </EuiTitle>
                }
              >
                <EuiText>
                  Document-based judgement ratings will be collect and aggregated into evaluation metrics.
                </EuiText>
              </EuiCard>
            </EuiFlexItem>
          </EuiFlexGroup>
        );
    }
  };

  return (
    <EuiAccordion
      style={{ marginBottom: '-16px' }}
      initialIsOpen={isOpen}
      id={`accordionGetStarted`}
      buttonContent={
        <EuiFlexGroup direction="row">
          <EuiFlexItem grow={false}>
            <EuiText>Get started</EuiText>
          </EuiFlexItem>
        </EuiFlexGroup>
      }
    >
      <EuiSpacer size="s" />
      <EuiFlexItem>{renderContent()}</EuiFlexItem>
    </EuiAccordion>
  );
}
