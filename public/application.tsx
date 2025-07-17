/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import ReactDOM from 'react-dom';
import { AppMountParameters, CoreStart } from '../../../src/core/public';
import { DataSourceManagementPluginSetup } from '../../../src/plugins/data_source_management/public';
import { SearchRelevanceApp } from './components/app';
import { AppPluginStartDependencies } from './types';
import { OpenSearchDashboardsContextProvider } from '../../../src/plugins/opensearch_dashboards_react/public';
import { ConfigProvider } from './contexts/date_format_context';

export const renderApp = (
  coreStart: CoreStart,
  { navigation, dataSource, share }: AppPluginStartDependencies,
  { element, setHeaderActionMenu }: AppMountParameters,
  dataSourceManagement: DataSourceManagementPluginSetup
) => {
  const { notifications, http, chrome, savedObjects, application, uiSettings } = coreStart;
  const props = {
    notifications,
    http,
    navigation,
    chrome,
    savedObjects,
    dataSourceEnabled: !!dataSource,
    dataSourceManagement,
    setActionMenu: setHeaderActionMenu,
    application,
    uiSettings,
  };

  ReactDOM.render(
    <OpenSearchDashboardsContextProvider services={{ ...coreStart, share }}>
      <ConfigProvider
        uiSettings={uiSettings}
        dataSourceEnabled={!!dataSource}
        dataSourceManagement={dataSourceManagement}
        setHeaderActionMenu={setHeaderActionMenu}
        navigation={navigation}
      >
        <SearchRelevanceApp {...props} />
      </ConfigProvider>
    </OpenSearchDashboardsContextProvider>,
    element
  );

  return () => ReactDOM.unmountComponentAtNode(element);
};
