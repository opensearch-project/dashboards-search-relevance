/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  EuiPage,
  EuiPageBody,
  EuiPageHeader,
  EuiTitle,
  EuiPageContentBody,
  EuiPageHeaderSection,
  EuiCode,
  EuiPanel,
  EuiSpacer,
  EuiFlexItem,
  EuiButtonIcon,
  EuiFlexGroup,
  EuiSplitPanel,
  EuiText,
} from '@elastic/eui';
import React, { useEffect, useState } from 'react';

import { CoreStart, ChromeBreadcrumb } from '../../../../../../src/core/public';
import { SearchConfigsPanel } from './search_components/search_configs/search_configs';
import { SearchInputBar } from './search_components/search_bar';
import { ServiceEndpoints } from '../../../../common';
import { Header } from '../../common/header';
import { SearchResults } from '../../../types/index';
import { ResultComponents } from './result_components/result_components';

const defaultQuery = JSON.stringify({
  query: {
    term: { title: '%SearchQuery%' },
  },
});

interface SearchResultProps {
  http: CoreStart['http'];
}

export const SearchResult = ({ http }: SearchResultProps) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [searchIndex1, setSearchIndex1] = useState('');
  const [searchIndex2, setSearchIndex2] = useState('');
  const [queryString1, setQueryString1] = useState('');
  const [queryString2, setQueryString2] = useState('');
  const [queryResult1, setQueryResult1] = useState<SearchResults>({} as any);
  const [queryResult2, setQueryResult2] = useState<SearchResults>({} as any);
  const [searchBarValue, setSearchBarValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const onClickSearch = () => {
    setIsLoading(true);
    const jsonQuery1 = JSON.parse(queryString1.replace(/%SearchQuery%/g, searchBarValue));
    const jsonQuery2 = JSON.parse(queryString2.replace(/%SearchQuery%/g, searchBarValue));
    http
      .post(ServiceEndpoints.GetSearchResults, {
        body: JSON.stringify({ index: searchIndex1, ...jsonQuery1 }),
      })
      .then((res) => {
        setQueryResult1(res);
      })
      .catch((error: Error) => {
        setQueryResult1(error.body.message);
        console.error(error);
      });

    http
      .post(ServiceEndpoints.GetSearchResults, {
        body: JSON.stringify({ index: searchIndex2, ...jsonQuery2 }),
      })
      .then((res) => {
        setQueryResult2(res);
      })
      .catch((error: Error) => {
        setQueryResult2(error.body.message);
        console.error(error);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const onChange = (e: React.ChangeEvent<HTMLInputElement>, setter: any) => {
    setter(e.target.value);
  };

  return (
    <>
      <Header>
        <SearchInputBar
          searchBarValue={searchBarValue}
          setSearchBarValue={setSearchBarValue}
          isLoading={isLoading}
          onClickSearch={onClickSearch}
          setIsCollapsed={setIsCollapsed}
        />
      </Header>
      <EuiPageContentBody className="search-relevance-flex">
        <SearchConfigsPanel
          isCollapsed={isCollapsed}
          onChange={onChange}
          searchIndex1={searchIndex1}
          searchIndex2={searchIndex2}
          setSearchIndex1={setSearchIndex1}
          setSearchIndex2={setSearchIndex2}
          queryString1={queryString1}
          queryString2={queryString2}
          setQueryString1={setQueryString1}
          setQueryString2={setQueryString2}
          setIsCollapsed={setIsCollapsed}
        />
        <ResultComponents queryResult1={queryResult1} queryResult2={queryResult2} />
      </EuiPageContentBody>
    </>
  );
};
