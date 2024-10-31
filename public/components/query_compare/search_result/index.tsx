/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState, useMemo } from 'react';
import { EuiSpacer } from '@elastic/eui';
import { CoreStart, MountPoint, NotificationsStart } from '../../../../../../src/core/public';
import {
  DataSourceAggregatedViewConfig,
  DataSourceManagementPluginSetup,
} from '../../../../../../src/plugins/data_source_management/public';
import { NavigationPublicPluginStart } from '../../../../../../src/plugins/navigation/public';
import { useSearchRelevanceContext } from '../../../contexts';
import { DataSourceOption } from '../../../../../../src/plugins/data_source_management/public/components/data_source_menu/types';
import { SearchBar } from './search_components/search_bar';
import { ResultGrid } from './result_components/result_grid';
import { SearchConfigs } from './search_components/search_configs/search_configs';

interface SearchResultProps {
  application: CoreStart['application'];
  chrome: CoreStart['chrome'];
  http: CoreStart['http'];
  savedObjects: CoreStart['savedObjects'];
  dataSourceEnabled: boolean;
  dataSourceManagement: DataSourceManagementPluginSetup;
  navigation: NavigationPublicPluginStart;
  setActionMenu: (menuMount: MountPoint | undefined) => void;
  dataSourceOptions: DataSourceOption[];
  notifications: NotificationsStart;
}

export const SearchResult = ({
  application,
  chrome,
  http,
  savedObjects,
  dataSourceEnabled,
  dataSourceManagement,
  navigation,
  setActionMenu,
  dataSourceOptions,
  notifications,
}: SearchResultProps) => {
  const {
    searchText,
    setShowFlyout,
    setSearchText,
    searchResults1,
    searchResults2,
    setSearchResults1,
    setSearchResults2,
    setDataSourceOptions,
    setDatasource1,
    setDatasource2,
    datasource1,
    datasource2,
    documentsIndexes1,
    documentsIndexes2,
    setDocumentsIndexes1,
    setDocumentsIndexes2,
    selectedIndex1,
    selectedIndex2,
    setSelectedIndex1,
    setSelectedIndex2,
    query1,
    query2,
    setQuery1,
    setQuery2,
    fetchedPipelines1,
    fetchedPipelines2,
    setFetchedPipelines1,
    setFetchedPipelines2,
  } = useSearchRelevanceContext();

  return (
    <>
      <EuiSpacer size="l" />
      <SearchBar
        searchText={searchText}
        setSearchText={setSearchText}
        http={http}
        setShowFlyout={setShowFlyout}
        setActionMenu={setActionMenu}
        navigation={navigation}
        setDataSourceOptions={setDataSourceOptions}
        dataSourceOptions={dataSourceOptions}
        dataSourceManagement={dataSourceManagement}
        setDatasource1={setDatasource1}
        setDatasource2={setDatasource2}
        datasource1={datasource1}
        datasource2={datasource2}
        documentsIndexes1={documentsIndexes1}
        documentsIndexes2={documentsIndexes2}
        setDocumentsIndexes1={setDocumentsIndexes1}
        setDocumentsIndexes2={setDocumentsIndexes2}
        selectedIndex1={selectedIndex1}
        selectedIndex2={selectedIndex2}
        setSelectedIndex1={setSelectedIndex1}
        setSelectedIndex2={setSelectedIndex2}
        query1={query1}
        query2={query2}
        setSearchResults1={setSearchResults1}
        setSearchResults2={setSearchResults2}
        fetchedPipelines1={fetchedPipelines1}
        fetchedPipelines2={fetchedPipelines2}
        setFetchedPipelines1={setFetchedPipelines1}
        setFetchedPipelines2={setFetchedPipelines2}
      />
      <EuiSpacer size="l" />
      <SearchConfigs
        query1={query1}
        query2={query2}
        setQuery1={setQuery1}
        setQuery2={setQuery2}
      />
      <EuiSpacer size="l" />
      <ResultGrid
        searchResults1={searchResults1}
        searchResults2={searchResults2}
        selectedIndex1={selectedIndex1}
        selectedIndex2={selectedIndex2}
      />
    </>
  );
};
