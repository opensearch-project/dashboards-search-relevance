/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  EuiFlyout,
  EuiFlyoutBody,
  EuiFlyoutHeader,
  EuiText,
  EuiTitle,
  EuiCodeBlock,
  EuiLink,
  EuiCode,
} from '@elastic/eui';

import { useSearchRelevanceContext } from '../../contexts';

const query1 = `
{
  "query": {
    "multi_match": {
      "query": "%SearchText%",
      "fields": ["speaker", "text_entry"]
    }
  }
}
`;

const query2 = `
{
  "query": {
    "multi_match": {
      "query": "%SearchText%",
      "fields": ["speaker^3", "text_entry"]
    }
  }
}
`;

export const Flyout = () => {
  const { setShowFlyout } = useSearchRelevanceContext();

  return (
    <EuiFlyout
      ownFocus
      onClose={() => setShowFlyout(false)}
      aria-labelledby="flyoutTitle"
      paddingSize="l"
    >
      <EuiFlyoutHeader hasBorder>
        <EuiTitle size="m">
          <h2 id="flyoutTitle">Help</h2>
        </EuiTitle>
      </EuiFlyoutHeader>
      <EuiFlyoutBody>
        <EuiText>
          <h3>Query format</h3>
          <p>
            Enter a query in{' '}
            <EuiLink
              target="_blank"
              href="https://opensearch.org/docs/latest/opensearch/query-dsl/index/"
            >
              OpenSearch Query DSL
            </EuiLink>
            . Use the <EuiCode>%SearchQuery%</EuiCode> variable to refer to the text in the search
            bar. When you enter <strong>Search</strong>, the queries are sent to the search engine
            using the <EuiCode>GET</EuiCode> HTTP method and the <EuiCode>_search</EuiCode>{' '}
            endpoint.
          </p>
          <h3>Example</h3>
          <br />
          <p>1. Enter the search text in the search bar.</p>
          <p>
            2. Select an index for <strong>Query 1</strong> and enter a query.
          </p>
          <p>
            The following example searches the <EuiCode>speaker</EuiCode> and{' '}
            <EuiCode>text_entry</EuiCode> fields of the <EuiCode>shakespeare</EuiCode>
            index for the search text:
          </p>
          <EuiCodeBlock isCopyable={true} language="json">
            {query1}
          </EuiCodeBlock>
          <p>
            3. Select an index for <strong>Query 2</strong> and enter a query.
          </p>
          <p>
            You can see how boosting a field affects the results. The following query boosts the
            <EuiCode>speaker</EuiCode> field:
          </p>
          <EuiCodeBlock isCopyable={true} language="json">
            {query2}
          </EuiCodeBlock>
          <p>
            To learn more about boosts, see the{' '}
            <EuiLink
              target="_blank"
              href="https://opensearch.org/docs/latest/search-plugins/sql/full-text/#multi-match"
            >
              Multi-match Query Documentation
            </EuiLink>
            .
          </p>
          <p>4. Compare results</p>
          <p>
            Select <strong>Search</strong> and compare the results in Results 1 and Results 2.
          </p>
        </EuiText>
      </EuiFlyoutBody>
    </EuiFlyout>
  );
};
