/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { EuiPageContentBody } from '@elastic/eui';

import { CoreStart } from '../../../../../../src/core/public';
import { SearchConfigsPanel } from './search_components/search_configs/search_configs';
import { SearchInputBar } from './search_components/search_bar';
import { ServiceEndpoints } from '../../../../common';
import { Header } from '../../common/header';
import {
  SearchResults,
  QueryError,
  QueryStringError,
  SelectIndexError,
  initialQueryErrorState,
} from '../../../types/index';
import { ResultComponents } from './result_components/result_components';
import { useSearchRelevanceContext } from '../../../contexts';

const DEFAULT_QUERY = '{}';

interface SearchResultProps {
  http: CoreStart['http'];
}

export const SearchResult = ({ http }: SearchResultProps) => {
  const [queryString1, setQueryString1] = useState(DEFAULT_QUERY);
  const [queryString2, setQueryString2] = useState(DEFAULT_QUERY);
  const [queryResult1, setQueryResult1] = useState<SearchResults>({} as any);
  const [queryResult2, setQueryResult2] = useState<SearchResults>({} as any);
  const [queryError1, setQueryError1] = useState<QueryError>(initialQueryErrorState);
  const [queryError2, setQueryError2] = useState<QueryError>(initialQueryErrorState);
  const [searchBarValue, setSearchBarValue] = useState('');

  const {
    updateComparedResult1,
    updateComparedResult2,
    selectedIndex1,
    selectedIndex2,
    pipeline1,
    pipeline2,
  } = useSearchRelevanceContext();

  const onClickSearch = () => {
    const queryErrors = [
      { ...initialQueryErrorState, errorResponse: { ...initialQueryErrorState.errorResponse } },
      { ...initialQueryErrorState, errorResponse: { ...initialQueryErrorState.errorResponse } },
    ];
    const jsonQueries = [{}, {}];

    validateQuery(selectedIndex1, queryString1, queryErrors[0]);
    jsonQueries[0] = rewriteQuery(searchBarValue, queryString1, queryErrors[0]);

    validateQuery(selectedIndex2, queryString2, queryErrors[1]);
    jsonQueries[1] = rewriteQuery(searchBarValue, queryString2, queryErrors[1]);

    handleSearch(jsonQueries, queryErrors);
  };

  const validateQuery = (selectedIndex: string, queryString: string, queryError: QueryError) => {
    // Check if select an index
    if (!selectedIndex.length) {
      queryError.selectIndex = SelectIndexError.unselected;
    }

    // Check if query string is empty
    if (!queryString.length) {
      queryError.queryString = QueryStringError.empty;
      queryError.errorResponse.statusCode = 400;
    }
  };

  const rewriteQuery = (value: string, queryString: string, queryError: QueryError) => {
    if (queryString.trim().length > 0) {
      try {
        return JSON.parse(queryString.replace(/%SearchText%/g, value));
      } catch {
        queryError.queryString = QueryStringError.invalid;
        queryError.errorResponse.statusCode = 400;
      }
    }
  };

  const handleQuery = (
    queryError: QueryError,
    selectedIndex: string,
    pipeline: string,
    jsonQuery: any,
    updateComparedResult: (result: SearchResults) => void,
    setQueryResult: React.Dispatch<React.SetStateAction<SearchResults>>,
    setQueryError: React.Dispatch<React.SetStateAction<QueryError>>
  ) => {
    if (queryError.queryString.length || queryError.selectIndex.length) {
      setQueryError(queryError);
      setQueryResult({} as any);
      updateComparedResult({} as any);
    } else if (!queryError.queryString.length && !queryError.selectIndex) {
      setQueryError(initialQueryErrorState);
      return { index: selectedIndex, pipeline, ...jsonQuery };
    }
  };

  const handleSearch = (jsonQueries: any, queryErrors: QueryError[]) => {
    const requestBody = {
      query1: handleQuery(
        queryErrors[0],
        selectedIndex1,
        pipeline1,
        jsonQueries[0],
        updateComparedResult1,
        setQueryResult1,
        setQueryError1
      ),
      query2: handleQuery(
        queryErrors[1],
        selectedIndex2,
        pipeline2,
        jsonQueries[1],
        updateComparedResult2,
        setQueryResult2,
        setQueryError2
      ),
    };
    if (Object.keys(requestBody).length !== 0) {
      http
        .post(ServiceEndpoints.GetSearchResults, {
          body: JSON.stringify(requestBody),
        })
        .then((res) => {
          if (res.result1) {
            setQueryResult1(res.result1);
            updateComparedResult1(res.result1);
          }

          if (res.result2) {
            setQueryResult2(res.result2);
            updateComparedResult2(res.result2);
          }

          if (res.errorMessage1) {
            setQueryError1((error: QueryError) => ({
              ...error,
              queryString: res.errorMessage1,
              errorResponse: res.errorMessage1,
            }));
          }

          if (res.errorMessage2) {
            setQueryError2((error: QueryError) => ({
              ...error,
              queryString: res.errorMessage2,
              errorResponse: res.errorMessage2,
            }));
          }
        })
        .catch((error: Error) => {
          // eslint-disable-next-line no-console
          console.error(error);
        });
    }
  };

  return (
    <>
      <Header>
        <SearchInputBar
          searchBarValue={searchBarValue}
          setSearchBarValue={setSearchBarValue}
          onClickSearch={onClickSearch}
        />
      </Header>
      <EuiPageContentBody className="search-relevance-flex">
        <SearchConfigsPanel
          queryString1={queryString1}
          queryString2={queryString2}
          setQueryString1={setQueryString1}
          setQueryString2={setQueryString2}
          queryError1={queryError1}
          queryError2={queryError2}
          setQueryError1={setQueryError1}
          setQueryError2={setQueryError2}
        />
        <ResultComponents
          queryResult1={queryResult1}
          queryResult2={queryResult2}
          queryError1={queryError1}
          queryError2={queryError2}
        />
      </EuiPageContentBody>
    </>
  );
};
