/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  EuiPageHeader,
  EuiPageHeaderSection,
  EuiTitle,
  EuiCallOut,
  EuiText,
  EuiLink,
} from '@elastic/eui';

import './header.scss';

export const Header = () => {
  return (
    <EuiPageHeader pageTitle="Compare Search results" className="header">
      <EuiCallOut title="Experimental Feature" iconType="iInCircle">
        <EuiText>
          <p>
            The feature is experimental. For more information, see{' '}
            <EuiLink>Compare Search Results Documentation.</EuiLink> To leave feedback, visit{' '}
            <EuiLink>forums.opensearch.com.</EuiLink>
          </p>
        </EuiText>
      </EuiCallOut>
    </EuiPageHeader>
  );
};
