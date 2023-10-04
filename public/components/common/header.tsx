/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  EuiPageHeader,
  EuiCallOut,
  EuiText,
  EuiLink,
  EuiPanel,
  EuiToken,
  EuiTitle,
} from '@elastic/eui';

interface HeaderProps {
  children?: React.ReactNode;
}

export const Header = ({ children }: HeaderProps) => {
  return (
    <EuiPanel
      hasBorder={false}
      hasShadow={false}
      grow={false}
      borderRadius="none"
      style={{ borderBottom: '1px solid #D3DAE6' }}
    >
      <EuiTitle>
        <h1>Compare search results</h1>
      </EuiTitle>
      <EuiText>
        <p>
          Compare results using the same search text with different queries.{' '}
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
