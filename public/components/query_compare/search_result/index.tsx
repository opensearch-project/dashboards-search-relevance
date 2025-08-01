/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  EuiLink,
  EuiPageContentBody,
  EuiText,
  EuiSpacer,
  EuiPanel,
  EuiHorizontalRule,
  EuiSplitPanel,
} from '@elastic/eui';
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

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
import { VisualComparison, convertFromSearchResult } from './visual_comparison/visual_comparison';
import { SearchInputBar } from './search_components/search_bar';
import { SearchConfigsPanel } from './search_components/search_configs/search_configs';
import {
  ServiceEndpoints,
  SEARCH_RELEVANCE_EXPERIMENTAL_WORKBENCH_UI_EXPERIENCE_ENABLED,
  Routes,
} from '../../../../common';

const DEFAULT_QUERY = '{}';

interface SearchResultProps {
  http: CoreStart['http'];
  savedObjects: CoreStart['savedObjects'];
  dataSourceEnabled: boolean;
  navigation: NavigationPublicPluginStart;
  setActionMenu: (menuMount: MountPoint | undefined) => void;
  dataSourceManagement: DataSourceManagementPluginSetup;
  dataSourceOptions: DataSourceOption[];
  notifications: NotificationsStart;
  chrome: CoreStart['chrome'];
  application: CoreStart['application'];
  uiSettings: CoreStart['uiSettings'];
}

export const SearchResult = ({
  application,
  chrome,
  http,
  savedObjects,
  dataSourceEnabled,
  dataSourceManagement,
  setActionMenu,
  navigation,
  dataSourceOptions,
  notifications,
  uiSettings,
}: SearchResultProps) => {
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
    datasource2,
    setSelectedIndex1,
    setSelectedIndex2,
    setPipeline1,
    setPipeline2,
  } = useSearchRelevanceContext();

  const location = useLocation();

  // Check for configuration from URL parameters on component mount
  useEffect(() => {
    console.log('SearchResult useEffect - Current URL:', window.location.href);
    console.log('SearchResult useEffect - Hash:', window.location.hash);
    console.log('SearchResult useEffect - Search params:', location.search);

    let encodedConfig = null;

    // First check query parameters (for experimental workbench UI)
    const searchParams = new URLSearchParams(location.search);
    encodedConfig = searchParams.get('config');
    console.log('SearchResult useEffect - Config param from search:', encodedConfig);

    // If not found in search params, check hash parameters (for old experience)
    if (!encodedConfig) {
      let hashString = window.location.hash.slice(1); // Remove #
      if (hashString.startsWith('/')) {
        hashString = hashString.slice(1); // Remove leading /
      }
      if (hashString.startsWith('?')) {
        hashString = hashString.slice(1); // Remove leading ?
      }
      console.log('SearchResult useEffect - Hash string to parse:', hashString);

      const hashParams = new URLSearchParams(hashString);
      encodedConfig = hashParams.get('config');
      console.log('SearchResult useEffect - Config param from hash:', encodedConfig);
    }

    if (encodedConfig) {
      try {
        // Decode base64 to JSON string
        const jsonString = atob(encodedConfig);
        console.log('SearchResult useEffect - Decoded JSON:', jsonString);
        // Parse JSON string to object
        const config = JSON.parse(jsonString);
        console.log('SearchResult useEffect - Parsed config:', config);

        // Set the values from config
        if (config.query1) {
          if (config.query1.index) {
            setSelectedIndex1(config.query1.index);
          }
          if (config.query1.dsl_query) {
            setQueryString1(config.query1.dsl_query);
          }
          if (config.query1.search_pipeline) {
            setPipeline1(config.query1.search_pipeline);
          }
        }

        if (config.query2) {
          if (config.query2.index) {
            setSelectedIndex2(config.query2.index);
          }
          if (config.query2.dsl_query) {
            setQueryString2(config.query2.dsl_query);
          }
          if (config.query2.search_pipeline) {
            setPipeline2(config.query2.search_pipeline);
          }
        }

        if (config.search) {
          setSearchBarValue(config.search);
        }

        // Don't clean URL - keep the config parameter for sharing
      } catch (e) {
        console.error('Failed to decode base64 configuration:', e);
      }
    }
  }, [
    setSelectedIndex1,
    setSelectedIndex2,
    setQueryString1,
    setQueryString2,
    setSearchBarValue,
    setPipeline1,
    setPipeline2,
    uiSettings,
    location.search,
  ]);

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

    // Update URL with current configuration
    updateUrlWithConfig();

    handleSearch(jsonQueries, queryErrors);
  };

  const updateUrlWithConfig = () => {
    try {
      const config = {
        query1: {
          index: selectedIndex1,
          dsl_query: queryString1,
          search_pipeline: pipeline1 || undefined,
        },
        query2: {
          index: selectedIndex2,
          dsl_query: queryString2,
          search_pipeline: pipeline2 || undefined,
        },
        search: searchBarValue,
      };

      // Remove undefined values to keep the config clean
      if (!config.query1.search_pipeline) delete config.query1.search_pipeline;
      if (!config.query2.search_pipeline) delete config.query2.search_pipeline;

      // Encode configuration to base64
      const base64Config = btoa(JSON.stringify(config));

      // Create URL with configuration
      const newUrl = new URL(window.location);
      newUrl.hash = `#/?config=${base64Config}`;

      // Check URL length limit (2000 characters is a safe limit for most browsers)
      const MAX_URL_LENGTH = 2000;
      const urlString = newUrl.toString();

      if (urlString.length > MAX_URL_LENGTH) {
        // URL is too long, update without parameters
        console.log(
          'URL too long (' + urlString.length + ' characters), updating without config parameter'
        );
        newUrl.hash = '#/';
        window.history.replaceState({}, document.title, newUrl.toString());
        console.log('Updated URL without config (length limit exceeded):', newUrl.toString());
      } else {
        // URL is within safe length, update with configuration
        window.history.replaceState({}, document.title, urlString);
        console.log('Updated URL with config:', urlString);
      }
    } catch (e) {
      console.error('Failed to update URL with configuration:', e);
    }
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
    const requestBody1 = handleQuery(
      queryErrors[0],
      selectedIndex1,
      pipeline1,
      jsonQueries[0],
      updateComparedResult1,
      setQueryResult1,
      setQueryError1
    );

    const requestBody2 = handleQuery(
      queryErrors[1],
      selectedIndex2,
      pipeline2,
      jsonQueries[1],
      updateComparedResult2,
      setQueryResult2,
      setQueryError2
    );
    if (Object.keys(requestBody1).length !== 0 || Object.keys(requestBody2).length !== 0) {
      // First Query
      if (Object.keys(requestBody1).length !== 0) {
        http
          .post(ServiceEndpoints.GetSearchResults, {
            body: JSON.stringify({
              query1: requestBody1,
              dataSourceId1: datasource1 ? datasource1 : '',
            }),
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
              setQueryResult1({} as any);
              updateComparedResult1({} as any);
            }
          })
          .catch((error: Error) => {
            console.error(error);
          });
      }

      // Second Query
      if (Object.keys(requestBody2).length !== 0) {
        http
          .post(ServiceEndpoints.GetSearchResults, {
            body: JSON.stringify({
              query2: requestBody2,
              dataSourceId2: datasource2 ? datasource2 : '',
            }),
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
              setQueryResult2({} as any);
              updateComparedResult2({} as any);
            }
          })
          .catch((error: Error) => {
            console.error(error);
          });
      }
    }
  };

  const ErrorMessage = ({ queryError }: { queryError: QueryError }) => (
    <>
      <EuiText color="danger">
        {queryError.errorResponse.statusCode >= 500 ? 'Internal' : 'Query'} Error
      </EuiText>
      <EuiText color="danger">{queryError.errorResponse.body}</EuiText>
      <EuiText color="danger">Status Code: {queryError.errorResponse.statusCode}</EuiText>
      <EuiHorizontalRule margin="s" />
    </>
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

        <EuiSplitPanel.Outer direction="row" hasShadow={false} hasBorder={false}>
          <EuiSplitPanel.Inner className="search-relevance-result-panel">
            {(queryError1.errorResponse.statusCode !== 200 ||
              queryError1.queryString.length > 0) && <ErrorMessage queryError={queryError1} />}
          </EuiSplitPanel.Inner>

          <EuiSplitPanel.Inner className="search-relevance-result-panel">
            {(queryError2.errorResponse.statusCode !== 200 ||
              queryError2.queryString.length > 0) && <ErrorMessage queryError={queryError2} />}
          </EuiSplitPanel.Inner>
        </EuiSplitPanel.Outer>

        <VisualComparison
          queryResult1={convertFromSearchResult(queryResult1)}
          queryResult2={convertFromSearchResult(queryResult2)}
          queryText={searchBarValue}
          resultText1="Result 1"
          resultText2="Result 2"
        />
      </EuiPageContentBody>
    </>
  );
};
