/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { I18nProvider, FormattedMessage } from '@osd/i18n/react';
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
    <I18nProvider>
      <EuiFlyout
        ownFocus
        onClose={() => setShowFlyout(false)}
        aria-labelledby="flyoutTitle"
        paddingSize="l"
      >
        <EuiFlyoutHeader hasBorder>
          <EuiTitle size="m">
            <h2 id="flyoutTitle">
              <FormattedMessage id="searchRelevance.flyout.title" defaultMessage="Help" />
            </h2>
          </EuiTitle>
        </EuiFlyoutHeader>
        <EuiFlyoutBody>
          <EuiText>
            <h3>
              <FormattedMessage
                id="searchRelevance.flyout.queryFormatHeader"
                defaultMessage="Query format"
              />
            </h3>
            <p>
              <FormattedMessage
                id="searchRelevance.flyout.queryFormatDetail"
                defaultMessage="Enter a query in {queryDslLink}. Use the {variableName} variable to refer
                to the text in the search bar. When you enter {strongSearch}, the queries are sent to the search
                engine using the {methodName} HTTP method and the {endpointName} endpoint."
                values={{
                  queryDslLink: (
                    <EuiLink
                      target="_blank"
                      href="https://opensearch.org/docs/latest/opensearch/query-dsl/index/"
                    >
                      <FormattedMessage
                        id="searchRelevance.flyout.queryFormatDetail.queryDslLinkLabel"
                        defaultMessage="OpenSearch Query DSL"
                      />
                    </EuiLink>
                  ),
                  variableName: (
                    <EuiCode>
                      <FormattedMessage
                        id="searchRelevance.flyout.queryFormatDetail.variableNameCodeLabel"
                        defaultMessage="%SearchText%"
                      />
                    </EuiCode>
                  ),
                  strongSearch: (
                    <strong>
                      <FormattedMessage
                        id="searchRelevance.flyout.queryFormatDetail.strongSearchLabel"
                        defaultMessage="Search"
                      />
                    </strong>
                  ),
                  methodName: (
                    <EuiCode>
                      <FormattedMessage
                        id="searchRelevance.flyout.queryFormatDetail.methodNameCodeLabel"
                        defaultMessage="GET"
                      />
                    </EuiCode>
                  ),
                  endpointName: (
                    <EuiCode>
                      <FormattedMessage
                        id="searchRelevance.flyout.queryFormatDetail.endpointNameCodeLabel"
                        defaultMessage="_search"
                      />
                    </EuiCode>
                  ),
                }}
              />
            </p>
            <h3>
              <FormattedMessage
                id="searchRelevance.flyout.exampleHeader"
                defaultMessage="Example"
              />
            </h3>
            <br />
            <p>
              <FormattedMessage
                id="searchRelevance.flyout.exampleDetail.stepOne"
                defaultMessage="1. Enter the search text in the search bar."
              />
            </p>
            <p>
              <FormattedMessage
                id="searchRelevance.flyout.exampleDetail.stepTwo"
                defaultMessage="2. Select an index for {strongQueryName} and enter a query."
                values={{
                  strongQueryName: (
                    <strong>
                      <FormattedMessage
                        id="searchRelevance.flyout.exampleDetail.stepTwo.strongQueryLabel"
                        defaultMessage="Query 1"
                      />
                    </strong>
                  ),
                }}
              />
            </p>
            <p>
              <FormattedMessage
                id="searchRelevance.flyout.exampleDetail.stepTwo.description"
                defaultMessage="The following example searches the {speaker} and {textEntry} fields of the
                {shakespeare} index for the search text:"
                values={{
                  speaker: (
                    <EuiCode>
                      <FormattedMessage
                        id="searchRelevance.flyout.exampleDetail.stepTwo.speakerCodeLabel"
                        defaultMessage="speaker"
                      />
                    </EuiCode>
                  ),
                  textEntry: (
                    <EuiCode>
                      <FormattedMessage
                        id="searchRelevance.flyout.exampleDetail.stepTwo.textEntryCodeLabel"
                        defaultMessage="text_entry"
                      />
                    </EuiCode>
                  ),
                  shakespeare: (
                    <EuiCode>
                      <FormattedMessage
                        id="searchRelevance.flyout.exampleDetail.stepTwo.shakespeareCodeLabel"
                        defaultMessage="shakespeare"
                      />
                    </EuiCode>
                  ),
                }}
              />
            </p>
            <EuiCodeBlock isCopyable={true} language="json">
              {query1}
            </EuiCodeBlock>
            <p>
              <FormattedMessage
                id="searchRelevance.flyout.exampleDetail.stepThree"
                defaultMessage="3. Select an index for {strongQueryName} and enter a query."
                values={{
                  strongQueryName: (
                    <strong>
                      <FormattedMessage
                        id="searchRelevance.flyout.exampleDetail.stepThree.strongQueryLabel"
                        defaultMessage="Query 2"
                      />
                    </strong>
                  ),
                }}
              />
            </p>
            <p>
              <FormattedMessage
                id="searchRelevance.flyout.exampleDetail.stepThree.description"
                defaultMessage="You can see how boosting a field affects the results. The following
                query boosts the {speaker} field:"
                values={{
                  speaker: (
                    <EuiCode>
                      <FormattedMessage
                        id="searchRelevance.flyout.exampleDetail.stepThree.speakerCodeLabel"
                        defaultMessage="speaker"
                      />
                    </EuiCode>
                  ),
                }}
              />
            </p>
            <EuiCodeBlock isCopyable={true} language="json">
              {query2}
            </EuiCodeBlock>
            <p>
              <FormattedMessage
                id="searchRelevance.flyout.exampleDetail.stepThree.helpText"
                defaultMessage="To learn more about boosts, see the {multiMatchQueryLink}."
                values={{
                  multiMatchQueryLink: (
                    <EuiLink
                      target="_blank"
                      href="https://opensearch.org/docs/latest/search-plugins/sql/full-text/#multi-match"
                    >
                      <FormattedMessage
                        id="searchRelevance.flyout.exampleDetail.stepThree.multiMatchQueryLinkLabel"
                        defaultMessage="Multi-match Query Documentation"
                      />
                    </EuiLink>
                  ),
                }}
              />
            </p>
            <p>
              <FormattedMessage
                id="searchRelevance.flyout.exampleDetail.stepFour"
                defaultMessage="4. Compare results"
              />
            </p>
            <p>
              <FormattedMessage
                id="searchRelevance.flyout.exampleDetail.stepFour.description"
                defaultMessage="Select {strongSearch} and compare the results in Results 1 and Results 2."
                values={{
                  strongSearch: (
                    <strong>
                      <FormattedMessage
                        id="searchRelevance.flyout.exampleDetail.stepFour.strongSearchLabel"
                        defaultMessage="Search"
                      />
                    </strong>
                  ),
                }}
              />
            </p>
          </EuiText>
        </EuiFlyoutBody>
      </EuiFlyout>
    </I18nProvider>
  );
};
