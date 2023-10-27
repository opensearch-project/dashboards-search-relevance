/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { FormattedMessage } from '@osd/i18n/react';
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
        <h1>
          <FormattedMessage
            id="searchRelevance.header.title"
            defaultMessage="Compare search results"
          />
        </h1>
      </EuiTitle>
      <EuiText>
        <p>
          <FormattedMessage
            id="searchRelevance.header.description"
            defaultMessage="Compare results using the same search text with different queries. {learnMoreLink}"
            values={{
              learnMoreLink: (
                <EuiLink
                  href="https://opensearch.org/docs/latest/search-plugins/search-relevance"
                  target="_blank"
                >
                  <FormattedMessage
                    id="searchRelevance.header.description.learnMoreLinkLabel"
                    defaultMessage="Learn more"
                  />
                </EuiLink>
              ),
            }}
          />
        </p>
      </EuiText>
      {children}
    </EuiPanel>
  );
};
