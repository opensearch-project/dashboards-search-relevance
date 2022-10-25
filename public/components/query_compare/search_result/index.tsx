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

import { CoreStart, ChromeBreadcrumb } from '../../../../../../../src/core/public';
import { SearchConfigsPanel } from './search_components/search_configs';
import { SearchInputBar } from './search_components/search_bar';
import { SearchResultTable } from './result_components/search_result_table';
import { ServiceEndpoints } from '../../../constants';

const defaultQuery = JSON.stringify({
  query: {
    term: { title: '%searchInput%' },
  },
});

interface SearchResultProps {
  http: CoreStart['http'];
}

export const SearchResult = ({ http }: SearchResultProps) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [searchIndex1, setSearchIndex1] = useState('chorus-ecommerce-data');
  const [searchIndex2, setSearchIndex2] = useState('chorus-ecommerce-data');
  const [queryString1, setQueryString1] = useState(defaultQuery);
  const [queryString2, setQueryString2] = useState(defaultQuery);
  const [querqyResult1, setQuerqyResult1] = useState({});
  const [querqyResult2, setQuerqyResult2] = useState({});
  const [searchBarValue, setSearchBarValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const onClickSearch = () => {
    setIsLoading(true);
    const jsonQuery1 = JSON.parse(queryString1.replace(/%searchInput%/g, searchBarValue));
    const jsonQuery2 = JSON.parse(queryString2.replace(/%searchInput%/g, searchBarValue));
    http
      .post(ServiceEndpoints.GetSearchResults, {
        body: JSON.stringify({ index: searchIndex1, ...jsonQuery1 }),
      })
      .then((res) => {
        setQuerqyResult1(res);
      })
      .catch((error: Error) => {
        setQuerqyResult1(error.body.message);
        console.error(error);
      });

    http
      .post(ServiceEndpoints.GetSearchResults, {
        body: JSON.stringify({ index: searchIndex2, ...jsonQuery2 }),
      })
      .then((res) => {
        setQuerqyResult2(res);
      })
      .catch((error: Error) => {
        setQuerqyResult2(error.body.message);
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
    <EuiPageContentBody>
      <EuiSpacer size="l" />
      <EuiFlexGroup>
        <EuiFlexItem>
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
        </EuiFlexItem>
      </EuiFlexGroup>
      <EuiSpacer size="l" />

      <EuiPanel style={{ width: '100%' }}>
        <EuiSpacer size="l" />
        <EuiSpacer size="l" />
        <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
          <SearchInputBar
            searchBarValue={searchBarValue}
            setSearchBarValue={setSearchBarValue}
            isLoading={isLoading}
            onClickSearch={onClickSearch}
            setIsCollapsed={setIsCollapsed}
          />
        </div>
        <EuiSpacer size="l" />
        <EuiSpacer size="l" />
        <EuiSpacer size="l" />
        <SearchResultTable querqyResult1={querqyResult1} querqyResult2={querqyResult2} />
      </EuiPanel>
    </EuiPageContentBody>
  );
};
