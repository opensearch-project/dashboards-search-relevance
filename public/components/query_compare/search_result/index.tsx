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
import { SearchResults } from '../../../types/index';
import { ResultComponents } from './result_components/result_components';
import { useSearchRelevanceContext } from '../../../contexts';

const defaultQuery1 = JSON.stringify({
  query: {
    term: { title: '%SearchQuery%' },
  },
});
const defaultQuery2 = JSON.stringify({
  query: {
    term: { name: '%SearchQuery%' },
  },
});

interface SearchResultProps {
  http: CoreStart['http'];
}

export const SearchResult = ({ http }: SearchResultProps) => {
  const [queryString1, setQueryString1] = useState('');
  const [queryString2, setQueryString2] = useState('');
  const [queryResult1, setQueryResult1] = useState<SearchResults>({} as any);
  const [queryResult2, setQueryResult2] = useState<SearchResults>({} as any);
  const [searchBarValue, setSearchBarValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const {
    updateComparedResult1,
    updateComparedResult2,
    selectedIndex,
  } = useSearchRelevanceContext();

  const onClickSearch = () => {
    setIsLoading(true);
    const jsonQuery1 = JSON.parse(queryString1.replace(/%SearchQuery%/g, searchBarValue));
    const jsonQuery2 = JSON.parse(queryString2.replace(/%SearchQuery%/g, searchBarValue));
    http
      .post(ServiceEndpoints.GetSearchResults, {
        body: JSON.stringify({ index: selectedIndex.index1, ...jsonQuery1 }),
      })
      .then((res) => {
        setQueryResult1(res);
        updateComparedResult1(res);
      })
      .catch((error: Error) => {
        setQueryResult1(error.body.message);
        console.error(error);
      });

    http
      .post(ServiceEndpoints.GetSearchResults, {
        body: JSON.stringify({ index: selectedIndex.index2, ...jsonQuery2 }),
      })
      .then((res) => {
        setQueryResult2(res);
        updateComparedResult2(res);
      })
      .catch((error: Error) => {
        setQueryResult2(error.body.message);
        console.error(error);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  return (
    <>
      <Header>
        <SearchInputBar
          searchBarValue={searchBarValue}
          setSearchBarValue={setSearchBarValue}
          isLoading={isLoading}
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
