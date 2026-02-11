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
  EuiSelect,
  EuiFormRow,
  EuiFlexItem,
  EuiFlexGroup,
} from '@elastic/eui';
import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

import { CoreStart, MountPoint, NotificationsStart } from '../../../../../../src/core/public';
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
import { AgentHandler } from './agent/agent_handler';
import { AgentInfo } from './agent/agent_info_component';
import { createConversationHandlers } from './agent/conversation_handlers';
import { SearchHandler } from './search/search_handler';
import { prepareQueries, isSetupConfigured } from './search/query_processor';
import { updateUrlWithConfig } from './search/url_config';
import { extractHighlightTags } from './highlight/highlight_utils';
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
  const isMountedRef = useRef(true);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);
  const [queryString1, setQueryString1] = useState(DEFAULT_QUERY);
  const [queryString2, setQueryString2] = useState(DEFAULT_QUERY);
  const [queryResult1, setQueryResult1] = useState<SearchResults>({} as any);
  const [queryResult2, setQueryResult2] = useState<SearchResults>({} as any);
  const [queryError1, setQueryError1] = useState<QueryError>(initialQueryErrorState);
  const [queryError2, setQueryError2] = useState<QueryError>(initialQueryErrorState);
  const [searchBarValue, setSearchBarValue] = useState('');
  const [isSearching, setIsSearching] = useState(false);
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

  const agentHandler = new AgentHandler(http);
  const searchHandler = new SearchHandler(http);

  const location = useLocation();

  // Check for configuration from URL parameters on component mount
  useEffect(() => {

    let encodedConfig = null;

    // First check query parameters (for experimental workbench UI)
    const searchParams = new URLSearchParams(location.search);
    encodedConfig = searchParams.get('config');

    // If not found in search params, check hash parameters (for old experience)
    if (!encodedConfig) {
      let hashString = window.location.hash.slice(1); // Remove #
      if (hashString.startsWith('/')) {
        hashString = hashString.slice(1); // Remove leading /
      }
      if (hashString.startsWith('?')) {
        hashString = hashString.slice(1); // Remove leading ?
      }

      const hashParams = new URLSearchParams(hashString);
      encodedConfig = hashParams.get('config');
    }

    if (encodedConfig) {
      try {
        // Decode base64 to JSON string
        const jsonString = atob(encodedConfig);
        // Parse JSON string to object
        const config = JSON.parse(jsonString);

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
    if (isSearching) return;

    setIsSearching(true);
    const { queryErrors, jsonQueries } = prepareQueries(
      searchBarValue,
      selectedIndex1,
      selectedIndex2,
      queryString1,
      queryString2
    );

    // Update URL with current configuration
    updateUrlWithConfig(
      selectedIndex1,
      selectedIndex2,
      queryString1,
      queryString2,
      pipeline1,
      pipeline2,
      searchBarValue
    );

    handleSearch(jsonQueries, queryErrors);
  };

  const { handleContinueConversation, handleClearConversation } = createConversationHandlers(
    agentHandler,
    [queryResult1, queryResult2],
    [queryString1, queryString2],
    [setQueryString1, setQueryString2]
  );

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

  const processQuery = (
    requestBody: any,
    jsonQuery: any,
    datasource: string,
    setQueryResult: React.Dispatch<React.SetStateAction<SearchResults>>,
    updateComparedResult: (result: SearchResults) => void,
    setQueryError: React.Dispatch<React.SetStateAction<QueryError>>,
    resultKey: 'result1' | 'result2',
    errorKey: 'errorMessage1' | 'errorMessage2'
  ) => {
    if (Object.keys(requestBody).length === 0) return null;

    const isAgentic = agentHandler.isAgenticQuery(jsonQuery);
    const searchPromise = isAgentic ?
      agentHandler.performAgenticSearch(requestBody, datasource) :
      searchHandler.performSearch(requestBody, datasource);

    return searchPromise
      .then((res) => {
        // Normalize response format for query2
        if (resultKey === 'result2' && res.result1) {
          res = { result2: res.result1, errorMessage2: res.errorMessage1 };
        }
        return res;
      })
      .then((res) => {
        if (!isMountedRef.current) return;

        if (res[resultKey]) {
          setQueryResult(res[resultKey]);
          updateComparedResult(res[resultKey]);
        }

        if (res[errorKey]) {
          setQueryError((error: QueryError) => ({
            ...error,
            queryString: res[errorKey],
            errorResponse: res[errorKey],
          }));
          setQueryResult({} as any);
          updateComparedResult({} as any);
        }
      })
      .catch((error: Error) => {
        if (!isMountedRef.current) return;
        setQueryError((queryError: QueryError) => ({
          ...queryError,
          queryString: error.message || 'Search failed',
          errorResponse: {
            body: error.message || 'Search failed',
            statusCode: 500,
          },
        }));
        setQueryResult({} as any);
        updateComparedResult({} as any);
      });
  };

  const handleSearch = (jsonQueries: any, queryErrors: QueryError[]) => {
    // Only call handleQuery for configured setups to avoid sending
    // requests with empty index/query to processQuery
    const requestBody1 = isSetupConfigured(selectedIndex1, queryString1)
      ? handleQuery(
        queryErrors[0],
        selectedIndex1,
        pipeline1,
        jsonQueries[0],
        updateComparedResult1,
        setQueryResult1,
        setQueryError1
      )
      : undefined;

    const requestBody2 = isSetupConfigured(selectedIndex2, queryString2)
      ? handleQuery(
        queryErrors[1],
        selectedIndex2,
        pipeline2,
        jsonQueries[1],
        updateComparedResult2,
        setQueryResult2,
        setQueryError2
      )
      : undefined;

    // Check if we have valid request bodies (handle undefined)
    const hasRequestBody1 = requestBody1 && Object.keys(requestBody1).length > 0;
    const hasRequestBody2 = requestBody2 && Object.keys(requestBody2).length > 0;

    if (!hasRequestBody1 && !hasRequestBody2) {
      setIsSearching(false);
      return;
    }

    // Build promises array only for valid request bodies
    const promises: Promise<any>[] = [];

    if (hasRequestBody1) {
      const promise1 = processQuery(requestBody1, jsonQueries[0], datasource1 || '', setQueryResult1, updateComparedResult1, setQueryError1, 'result1', 'errorMessage1');
      if (promise1) promises.push(promise1);
    }

    if (hasRequestBody2) {
      const promise2 = processQuery(requestBody2, jsonQueries[1], datasource2 || '', setQueryResult2, updateComparedResult2, setQueryError2, 'result2', 'errorMessage2');
      if (promise2) promises.push(promise2);
    }

    if (promises.length === 0) {
      setIsSearching(false);
      return;
    }

    Promise.allSettled(promises).finally(() => {
      if (isMountedRef.current) {
        setIsSearching(false);
      }
    });
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
              isSearching={isSearching}
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
            isSearching={isSearching}
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
        {(queryError1.errorResponse.statusCode !== 200 || queryError1.queryString.length > 0) ||
          (queryError2.errorResponse.statusCode !== 200 || queryError2.queryString.length > 0) ? (
          <EuiSplitPanel.Outer direction="row" hasShadow={false} hasBorder={false}>
            <EuiSplitPanel.Inner className="search-relevance-result-panel">
              <ErrorMessage queryError={queryError1} />
            </EuiSplitPanel.Inner>
            <EuiSplitPanel.Inner className="search-relevance-result-panel">
              <ErrorMessage queryError={queryError2} />
            </EuiSplitPanel.Inner>
          </EuiSplitPanel.Outer>
        ) : (
          <>
            {(agentHandler.hasAgentInfo(queryResult1) || agentHandler.hasAgentInfo(queryResult2)) && (
              <>
                <EuiFlexGroup gutterSize="none" alignItems="stretch">
                  <EuiFlexItem>
                    <AgentInfo
                      queryResult={queryResult1}
                      title="Setup 1"
                      agentHandler={agentHandler}
                      queryString={queryString1}
                      onContinueConversation={() => handleContinueConversation(1)}
                      onClearConversation={() => handleClearConversation(1)}
                    />
                  </EuiFlexItem>
                  <EuiFlexItem>
                    <AgentInfo
                      queryResult={queryResult2}
                      title="Setup 2"
                      agentHandler={agentHandler}
                      queryString={queryString2}
                      onContinueConversation={() => handleContinueConversation(2)}
                      onClearConversation={() => handleClearConversation(2)}
                    />
                  </EuiFlexItem>
                </EuiFlexGroup>
                <EuiSpacer size="m" />
              </>
            )}
            <VisualComparison
              queryResult1={convertFromSearchResult(queryResult1)}
              queryResult2={convertFromSearchResult(queryResult2)}
              queryText={searchBarValue}
              resultText1="Setup 1 Results"
              resultText2="Setup 2 Results"
              highlightPreTags1={extractHighlightTags(queryString1).preTags}
              highlightPostTags1={extractHighlightTags(queryString1).postTags}
              highlightPreTags2={extractHighlightTags(queryString2).preTags}
              highlightPostTags2={extractHighlightTags(queryString2).postTags}
              isSearching={isSearching}
            />
          </>
        )}
      </EuiPageContentBody>
    </>
  );
};
