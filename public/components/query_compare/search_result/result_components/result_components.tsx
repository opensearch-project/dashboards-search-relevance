/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { EuiEmptyPrompt, EuiPanel, EuiSplitPanel } from '@elastic/eui';
import React, { useEffect, useState } from 'react';

import { QueryError, SearchResults } from '../../../../types/index';
import { ResultPanel } from './result_panel';

import './result_components.scss';

interface ResultComponentsProps {
  queryResult1: SearchResults;
  queryResult2: SearchResults;
  queryError1: QueryError;
  queryError2: QueryError;
  setQueryError1: React.Dispatch<React.SetStateAction<QueryError>>;
  setQueryError2: React.Dispatch<React.SetStateAction<QueryError>>;
}

const InitialState = () => {
  return (
    <EuiPanel
      hasBorder={false}
      hasShadow={false}
      grow={true}
      style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}
    >
      <EuiEmptyPrompt
        iconType="search"
        title={<h2>No results</h2>}
        body={<p>Add at least one query to display search results.</p>}
      />
    </EuiPanel>
  );
};

const ResultPanels = ({
  queryResult1,
  queryResult2,
  queryError1,
  queryError2,
  setQueryError1,
  setQueryError2,
}: ResultComponentsProps) => {
  return (
    <EuiSplitPanel.Outer direction="row" hasShadow={false} hasBorder={false}>
      <ResultPanel resultNumber={1} queryResult={queryResult1} queryError={queryError1} setQueryError={setQueryError1} />
      <ResultPanel resultNumber={2} queryResult={queryResult2} queryError={queryError2} setQueryError={setQueryError2} />
    </EuiSplitPanel.Outer>
  );
};

export const ResultComponents = ({
  queryResult1,
  queryResult2,
  queryError1,
  queryError2,
  setQueryError1,
  setQueryError2,
}: ResultComponentsProps) => {
  const [initialState, setInitialState] = useState<boolean>(true);

  // Set initial state
  useEffect(() => {
    if (Array.isArray(queryResult1.hits?.hits) || Array.isArray(queryResult2.hits?.hits)) {
      setInitialState(false);
    } else if (initialState !== true) {
      setInitialState(true);
    }
  }, [queryResult1, queryResult2, initialState]);

  return (
    <>
      {initialState === true ? (
        <InitialState />
      ) : (
        <ResultPanels
          queryResult1={queryResult1}
          queryResult2={queryResult2}
          queryError1={queryError1}
          queryError2={queryError2}
          setQueryError1={setQueryError1}
          setQueryError2={setQueryError2}
        />
      )}
    </>
  );
};
