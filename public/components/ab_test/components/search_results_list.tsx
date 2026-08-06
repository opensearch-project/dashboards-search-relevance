/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  EuiButton,
  EuiFlexGroup,
  EuiFlexItem,
  EuiHorizontalRule,
  EuiPanel,
  EuiSpacer,
  EuiText,
  EuiTitle,
} from '@elastic/eui';

interface SearchResultsListProps {
  results: any[];
  onRegisterClick: (hit: any, position: number) => void;
}

/** Title of a hit, tolerating the various field names sample datasets use. */
const hitTitle = (hit: any): string =>
  hit._source?.title || hit._source?.product_title || hit._source?.name || hit._id;

const hitDescription = (hit: any): string =>
  hit._source?.description || hit._source?.product_description || '';

/**
 * Interleaved results with a per-row button that records a click against whichever configuration
 * drafted that result. The configuration id is shown so the interleaving can be spot-checked.
 */
export const SearchResultsList: React.FC<SearchResultsListProps> = ({
  results,
  onRegisterClick,
}) => {
  if (results.length === 0) return null;

  return (
    <EuiPanel paddingSize="l">
      <EuiTitle size="s">
        <h3>Search Results ({results.length})</h3>
      </EuiTitle>
      <EuiSpacer size="m" />
      {results.map((hit: any, index: number) => (
        <React.Fragment key={hit._id ?? index}>
          <EuiFlexGroup justifyContent="spaceBetween" alignItems="center">
            <EuiFlexItem>
              <EuiText size="s">
                <strong>#{index + 1}</strong> {hitTitle(hit)}
              </EuiText>
              <EuiText size="xs" color="subdued">
                {hitDescription(hit)}
              </EuiText>
            </EuiFlexItem>
            <EuiFlexItem grow={false}>
              <EuiText size="xs" color="subdued">
                Config: {hit._search_configuration_id || 'N/A'}
              </EuiText>
            </EuiFlexItem>
            <EuiFlexItem grow={false}>
              <EuiButton
                size="s"
                onClick={() => onRegisterClick(hit, index + 1)}
                data-test-subj={`registerClickButton-${index}`}
              >
                Click
              </EuiButton>
            </EuiFlexItem>
          </EuiFlexGroup>
          {index < results.length - 1 && <EuiHorizontalRule margin="s" />}
        </React.Fragment>
      ))}
    </EuiPanel>
  );
};
