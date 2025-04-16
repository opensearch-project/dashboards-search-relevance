/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { EuiText, EuiLink, EuiPanel, EuiTitle } from '@elastic/eui';

interface HeaderProps {
  children?: React.ReactNode;
}

export const Header = ({ children }: HeaderProps) => {
  return (
    <EuiPanel
      hasBorder={false}
      hasShadow={false}
      color="transparent"
      grow={false}
      borderRadius="none"
    >
      <EuiTitle>
        <h1>Search Relevance Workbench</h1>
      </EuiTitle>
      <EuiText>
        <p>
          Define, measure, understand, and deploy enhanced algorithms.{' '}
          <EuiLink
            href="https://opensearch.org/docs/latest/search-plugins/search-relevance"
            target="_blank"
          >
            Learn more
          </EuiLink>
        </p>
      </EuiText>
      {children}
    </EuiPanel>
  );
};
