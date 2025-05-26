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

interface GetStartedAccordionProps {
  isOpen?: boolean;
}

export function GetStartedAccordion(props: GetStartedAccordionProps) {
  return (
    <EuiAccordion
      style={{ marginBottom: '-16px' }}
      initialIsOpen={props.isOpen}
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
      <EuiFlexItem>
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
                Select query sets that created either by sampling real live queries or upload the queries that you're interested in.
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
                You can select to evaluate your experiment either by customized calculator or user behavior or LLM.
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
                Document-based judgement scores will be collect and aggregated into evaluation metrics.
              </EuiText>
            </EuiCard>
          </EuiFlexItem>
        </EuiFlexGroup>
      </EuiFlexItem>
    </EuiAccordion>
  );
}
