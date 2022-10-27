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
"query": {
  "multi_match": {
    "query": "Queen",
    "fields": ["speaker", "text_entry"]
  }
}
`;

const query2 = `
"query": {
  "multi_match": {
     "query": "Queen",
     "fields": ["speaker^3", "text_entry"]
   }
}
`;

const query3 = `
"query": {
  "multi_match": {
     "query": "%SearchQuery%",
     "fields": ["speaker", "text_entry"]
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
            Enter a query in <EuiLink target="_blank">OpenSearch Query DSL</EuiLink>. Use the{' '}
            <EuiCode>%SearchQuery%</EuiCode> variable to refer to the text in the search bar. When
            you enter <strong>Search</strong>, the queries are sent to the search engine using the{' '}
            <EuiCode>GET</EuiCode> HTTP method and the <EuiCode>_search</EuiCode> endpoint.
          </p>
          <h3>Example</h3>
          <br />
          <p>
            1. Enter <strong>Query 1</strong>
          </p>
          <p>
            To search for the text <EuiCode>Queen</EuiCode> in the <EuiCode>speaker</EuiCode> and{' '}
            <EuiCode>text_entry</EuiCode> fields, enter the following as <strong>Query 1:</strong>
          </p>
          <EuiCodeBlock isCopyable={true} language="json">
            {query1}
          </EuiCodeBlock>
          <p>
            2. Enter <strong>Query 2</strong>
          </p>
          <p>
            You can then see how boosting a field affects the results. Enter the following query
            that boosts the <EuiCode>speaker</EuiCode> field as <strong>Query 2:</strong>
          </p>
          <EuiCodeBlock isCopyable={true} language="json">
            {query2}
          </EuiCodeBlock>
          <p>
            To learn more about boosts, see the{' '}
            <EuiLink target="_blank">Multi-match Query Documentation</EuiLink>.
          </p>
          <p>3. Compare results</p>
          <p>
            Select <strong>Search</strong> and then compare the results in{' '}
            <strong>Results 1</strong> and <strong>Results 2</strong>.
          </p>
          <h3>Using variables</h3>
          <p>
            Alternatively, you can enter the search text <EuiCode>Queen</EuiCode> in the search bar
            and refer to it as <EuiCode>%SearchQuery%</EuiCode> in the query:
          </p>
          <EuiCodeBlock isCopyable={true} language="json">
            {query3}
          </EuiCodeBlock>
          <p>
            If you change the text in the search bar to <EuiCode>King</EuiCode>, all instances of{' '}
            <EuiCode>%SearchQuery%</EuiCode> in Query 1 and Query 2 will search for{' '}
            <EuiCode>King</EuiCode>. After entering the search text in the search bar, select
            <strong>Search</strong> and then compare the results in <strong>Results 1</strong> and{' '}
            <strong>Results 2</strong>.
          </p>
        </EuiText>
      </EuiFlyoutBody>
    </EuiFlyout>
  );
};
