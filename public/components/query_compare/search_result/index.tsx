/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { EuiPageContentBody } from '@elastic/eui';

import { CoreStart, ChromeBreadcrumb } from '../../../../../../src/core/public';
import { SearchConfigsPanel } from './search_components/search_configs/search_configs';
import { SearchInputBar } from './search_components/search_bar';
import { ServiceEndpoints } from '../../../../common';
import { Header } from '../../common/header';
import { SearchResults, QueryError, QueryStringError } from '../../../types/index';
import { ResultComponents } from './result_components/result_components';
import { useSearchRelevanceContext, initialQueryErrorState } from '../../../contexts';

interface SearchResultProps {
  http: CoreStart['http'];
}

export const SearchResult = ({ http }: SearchResultProps) => {
  const [queryString1, setQueryString1] = useState('');
  const [queryString2, setQueryString2] = useState('');
  const [queryResult1, setQueryResult1] = useState<SearchResults>({} as any);
  const [queryResult2, setQueryResult2] = useState<SearchResults>({} as any);
  const [searchBarValue, setSearchBarValue] = useState('');

  const {
    updateComparedResult1,
    updateComparedResult2,
    selectedIndex1,
    selectedIndex2,
    setQueryError1,
    setQueryError2,
  } = useSearchRelevanceContext();

  const onClickSearch = () => {
    const queryError1: QueryError = { ...initialQueryErrorState };
    const queryError2: QueryError = { ...initialQueryErrorState };

    // Check if select an index
    if (!selectedIndex1.length) {
      queryError1.selectIndex = 'An index is required. Select an index.';
    }
    if (!selectedIndex2.length) {
      queryError2.selectIndex = 'An index is required. Select an index.';
    }

    // Check if query string is empty
    if (!queryString1.length) {
      queryError1.queryString = QueryStringError.empty;
    }
    if (!queryString2.length) {
      queryError2.queryString = QueryStringError.empty;
    }

    // Check if query string is valid
    let jsonQuery1 = {};
    let jsonQuery2 = {};
    if (queryString1.trim().length > 0) {
      try {
        jsonQuery1 = JSON.parse(queryString1.replace(/%SearchQuery%/g, searchBarValue));
      } catch {
        queryError1.queryString = QueryStringError.invalid;
      }
    }
    if (queryString2.trim().length > 0) {
      try {
        jsonQuery2 = JSON.parse(queryString2.replace(/%SearchQuery%/g, searchBarValue));
      } catch {
        queryError2.queryString = QueryStringError.invalid;
      }
    }

    // Handle query1
    if (queryError1.queryString.length || queryError1.selectIndex.length) {
      setQueryError1(queryError1);
      setQueryResult1({} as any);
      updateComparedResult1({} as any);
    } else if (!queryError1.queryString.length && !queryError1.selectIndex.length) {
      http
        .post(ServiceEndpoints.GetSearchResults, {
          body: JSON.stringify({ index: selectedIndex1, ...jsonQuery1 }),
        })
        .then((res) => {
          setQueryResult1(res);
          updateComparedResult1(res);
        })
        .catch((error: Error) => {
          setQueryError1({
            ...queryError1,
            queryString: error.body.message,
          });
          console.error(error);
        });
    }

    // Handle query2
    if (queryError2.queryString.length || queryError2.selectIndex.length) {
      setQueryError2(queryError2);
      setQueryResult2({} as any);
      updateComparedResult2({} as any);
    } else if (!queryError2.queryString.length && !queryError2.selectIndex.length) {
      http
        .post(ServiceEndpoints.GetSearchResults, {
          body: JSON.stringify({ index: selectedIndex2, ...jsonQuery2 }),
        })
        .then((res) => {
          setQueryResult2(res);
          updateComparedResult2(res);
        })
        .catch((error: Error) => {
          setQueryError2({
            ...queryError2,
            queryString: error.body.message,
          });
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
        />
        <ResultComponents queryResult1={queryResult1} queryResult2={queryResult2} />
      </EuiPageContentBody>
    </>
  );
};
