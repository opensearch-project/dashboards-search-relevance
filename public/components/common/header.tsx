/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { EuiPageHeader, EuiCallOut, EuiText, EuiLink, EuiPanel } from '@elastic/eui';

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
      <EuiPageHeader pageTitle="Compare Search results">
        <EuiCallOut title="Experimental Feature" iconType="iInCircle">
          <EuiText>
            <p>
              The feature is experimental. For more information, see{' '}
              <EuiLink>Compare Search Results Documentation.</EuiLink> To leave feedback, visit{' '}
              <EuiLink>forums.opensearch.com.</EuiLink>
            </p>
          </EuiText>
        </EuiCallOut>
        {children}
      </EuiPageHeader>
    </EuiPanel>
  );
};
