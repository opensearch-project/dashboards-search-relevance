/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  EuiSplitPanel,
  EuiText,
  EuiTitle,
  EuiFlexGroup,
  EuiFlexItem,
  EuiHorizontalRule,
} from '@elastic/eui';
import React from 'react';

import { ResultGridComponent } from './result_grid';
import { SearchResults } from '../../../../types/index';

interface ResultPanelProps {
  title: string;
  queryResult: SearchResults;
}

export const ResultPanel = ({ title, queryResult }: ResultPanelProps) => {
  return (
    <EuiSplitPanel.Inner style={{ minHeight: '500px' }}>
      <EuiFlexGroup justifyContent="spaceBetween" alignItems="center">
        <EuiFlexItem grow={false}>
          <EuiTitle size="s">
            <h2 style={{ fontWeight: '300', fontSize: '21px' }}>{title}</h2>
          </EuiTitle>
        </EuiFlexItem>
        <EuiFlexItem grow={false}>
          <EuiTitle size="xs">
            <h2 style={{ fontWeight: '700', fontSize: '14px' }}>
              {queryResult.hits.total.value} results
            </h2>
          </EuiTitle>
        </EuiFlexItem>
      </EuiFlexGroup>
      {queryResult.hits.hits.length ? (
        <ResultGridComponent queryResult={queryResult} />
      ) : (
        <>
          <EuiHorizontalRule margin="s" />
          <EuiText>No results.</EuiText>
        </>
      )}
    </EuiSplitPanel.Inner>
  );
};
