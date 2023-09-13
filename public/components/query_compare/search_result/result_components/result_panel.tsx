/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  EuiSplitPanel,
  EuiText,
  EuiTitle,
  EuiFlexGroup,
  EuiFlexItem,
  EuiHorizontalRule,
} from '@elastic/eui';

import { ResultGridComponent } from './result_grid';
import { QueryError, SearchResults } from '../../../../types/index';
import { useSearchRelevanceContext } from '../../../../contexts';

import './result_components.scss';

interface ResultPanelProps {
  resultNumber: number;
  queryResult: SearchResults;
  queryError: QueryError;
}

export const ResultPanel = ({ resultNumber, queryResult, queryError }: ResultPanelProps) => {
  const { comparedResult1, comparedResult2 } = useSearchRelevanceContext();

  const ErrorMessage = (
    <>
      <EuiHorizontalRule margin="s" />
      <EuiText color="danger">Query Error</EuiText>
      <EuiText color="danger">{queryError.errorResponse.body}</EuiText>
    </>
  );

  const getComparedDocumentsRank = () => {
    return resultNumber === 1 ? comparedResult2 : comparedResult1;
  };

  return (
    <EuiSplitPanel.Inner className="search-relevance-result-panel">
      <EuiFlexGroup justifyContent="spaceBetween" alignItems="center">
        <EuiFlexItem grow={false}>
          <EuiTitle size="s">
            <h2 style={{ fontWeight: '300', fontSize: '21px' }}>{`Result ${resultNumber}`}</h2>
          </EuiTitle>
        </EuiFlexItem>
        <EuiFlexItem grow={false}>
          <EuiTitle size="xs">
            <h2 style={{ fontWeight: '700', fontSize: '14px' }}>
              {queryResult?.hits?.hits?.length > 0 ? queryResult?.hits?.hits?.length : 0} results
            </h2>
          </EuiTitle>
        </EuiFlexItem>
      </EuiFlexGroup>
      {queryError.errorResponse.statusCode !== 200 || queryError.queryString.length ? (
        ErrorMessage
      ) : queryResult?.hits?.hits?.length ? (
        <ResultGridComponent
          queryResult={queryResult}
          comparedDocumentsRank={getComparedDocumentsRank()}
          resultNumber={resultNumber}
        />
      ) : (
        <>
          <EuiHorizontalRule margin="s" />
          <EuiText>No results.</EuiText>
        </>
      )}
    </EuiSplitPanel.Inner>
  );
};
