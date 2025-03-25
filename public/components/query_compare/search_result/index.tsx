/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { EuiLink, EuiPageContentBody, EuiText, EuiSpacer, EuiPanel, EuiSwitch} from '@elastic/eui';
import React, { useState } from 'react';

import { CoreStart, MountPoint } from '../../../../../../src/core/public';
import { DataSourceManagementPluginSetup } from '../../../../../../src/plugins/data_source_management/public';
import { DataSourceOption } from '../../../../../../src/plugins/data_source_management/public/components/data_source_selector/data_source_selector';
import { NavigationPublicPluginStart } from '../../../../../../src/plugins/navigation/public';
import { useSearchRelevanceContext } from '../../../contexts';
import {
  QueryError,
  QueryStringError,
  SearchResults,
  SelectIndexError,
  initialQueryErrorState,
} from '../../../types/index';
import { Header } from '../../common/header';
import { ResultComponents } from './result_components/result_components';
import { VisualComparison } from './visual_comparison/visual_comparison';
import { SearchInputBar } from './search_components/search_bar';
import { SearchConfigsPanel } from './search_components/search_configs/search_configs';
import { SEARCH_NODE_API_PATH } from '../../../../common';

const DEFAULT_QUERY = '{}';

interface SearchResultProps {
  http: CoreStart['http'];
  savedObjects: CoreStart['savedObjects'];
  dataSourceEnabled: boolean
  navigation: NavigationPublicPluginStart;
  setActionMenu: (menuMount: MountPoint | undefined) => void;
  dataSourceManagement: DataSourceManagementPluginSetup;
  dataSourceOptions: DataSourceOption[]
  notifications: NotificationsStart
  chrome: CoreStart['chrome'];
  application: CoreStart['application'];
}

export const SearchResult = ({ application, chrome, http, savedObjects, dataSourceEnabled, dataSourceManagement, setActionMenu, navigation, dataSourceOptions, notifications}: SearchResultProps) => {
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
    datasource1,
    datasource2
  } = useSearchRelevanceContext();

  const HeaderControlledPopoverWrapper = ({ children }: { children: React.ReactElement }) => {
    const HeaderControl = navigation.ui.HeaderControl;
    const getNavGroupEnabled = chrome.navGroup.getNavGroupEnabled();

    if (getNavGroupEnabled && HeaderControl) {
      return (
        <HeaderControl
          setMountPoint={application.setAppDescriptionControls}
          controls={[{ renderComponent: children }]}
        />
      );
    }

    return <>{children}</>;
  };

  const getNavGroupEnabled = chrome.navGroup.getNavGroupEnabled();

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
    setQueryError: React.Dispatch<React.SetStateAction<QueryError>>,
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
    const requestBody1 = handleQuery(
        queryErrors[0],
        selectedIndex1,
        pipeline1,
        jsonQueries[0],
        updateComparedResult1,
        setQueryResult1,
        setQueryError1,
    );

    const requestBody2 = handleQuery(
        queryErrors[1],
        selectedIndex2,
        pipeline2,
        jsonQueries[1],
        updateComparedResult2,
        setQueryResult2,
        setQueryError2,
    );
    if (Object.keys(requestBody1).length !== 0 || Object.keys(requestBody2).length !== 0) {
        // First Query
        if (Object.keys(requestBody1).length !== 0) {
            http.post(SEARCH_NODE_API_PATH, {
                body: JSON.stringify({ query1: requestBody1, dataSourceId1: datasource1? datasource1: '' }),
            })
            .then((res) => {
                if (res.result1) {
                    setQueryResult1(res.result1);
                    updateComparedResult1(res.result1);
                }

                if (res.errorMessage1) {
                    setQueryError1((error: QueryError) => ({
                        ...error,
                        queryString: res.errorMessage1,
                        errorResponse: res.errorMessage1,
                    }));
                }
            })
            .catch((error: Error) => {
                console.error(error);
            });
        }

        // Second Query
        if (Object.keys(requestBody2).length !== 0) {
            http.post(SEARCH_NODE_API_PATH, {
                body: JSON.stringify({ query2: requestBody2, dataSourceId2: datasource2? datasource2: '' }),
            })
            .then((res) => {
                if (res.result2) {
                    setQueryResult2(res.result2);
                    updateComparedResult2(res.result2);
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
                console.error(error);
            });
        }
    }
};

const [useOldVersion, setUseOldVersion] = useState(true);
const versionToggle = (
  <EuiSwitch
    label="Use New Version"
    checked={!useOldVersion}
    onChange={() => setUseOldVersion(!useOldVersion)}
    style={{ marginBottom: '16px' }}
  />
);

  return (
    <>
      {getNavGroupEnabled ? (
        <>
          <HeaderControlledPopoverWrapper>
            <EuiText size="s">
              <p>
                Compare results using the same search text with different queries.{' '}
                <EuiLink
                  href="https://opensearch.org/docs/latest/search-plugins/search-relevance"
                  target="_blank"
                >
                  Learn more
                </EuiLink>
                <EuiSpacer size="m" />
              </p>
            </EuiText>
          </HeaderControlledPopoverWrapper>
          <EuiPanel
            hasBorder={false}
            hasShadow={false}
            color="transparent"
            grow={false}
            borderRadius="none"
          >
            <SearchInputBar
              searchBarValue={searchBarValue}
              setSearchBarValue={setSearchBarValue}
              onClickSearch={onClickSearch}
              getNavGroupEnabled={getNavGroupEnabled}
            />
          </EuiPanel>
        </>
      ) : (
        <Header>
          <SearchInputBar
            searchBarValue={searchBarValue}
            setSearchBarValue={setSearchBarValue}
            onClickSearch={onClickSearch}
            getNavGroupEnabled={getNavGroupEnabled}
          />
        </Header>
      )}
      <EuiPageContentBody className="search-relevance-flex">
        <SearchConfigsPanel
          queryString1={queryString1}
          queryString2={queryString2}
          setQueryString1={setQueryString1}
          setQueryString2={setQueryString2}
          queryError1={queryError1}
          queryError2={queryError2}
          dataSourceManagement={dataSourceManagement}
          setQueryError1={setQueryError1}
          setQueryError2={setQueryError2}
          dataSourceEnabled={dataSourceEnabled}
          savedObjects={savedObjects}
          navigation={navigation}
          setActionMenu={setActionMenu}
          dataSourceOptions={dataSourceOptions}
          notifications={notifications}
        />
        { versionToggle }
        { useOldVersion ? (
            <ResultComponents
              queryResult1={queryResult1}
              queryResult2={queryResult2}
              queryError1={queryError1}
              queryError2={queryError2}
            />
        ) : (
            <VisualComparison
              queryResult1={queryResult1}
              queryResult2={queryResult2}
              queryError1={queryError1}
              queryError2={queryError2}
            />
        )}
      </EuiPageContentBody>
    </>
  );
};
