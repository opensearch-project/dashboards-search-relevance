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

export const renderApp = (
  coreStart: CoreStart,
  { navigation, dataSource }: AppPluginStartDependencies,
  { element, setHeaderActionMenu, history }: AppMountParameters,
  dataSourceManagement: DataSourceManagementPluginSetup
) => {
  const { notifications, http, chrome, savedObjects, application } = coreStart;

  ReactDOM.render(
    <OpenSearchDashboardsContextProvider services={coreStart}>
      <SearchRelevanceApp
        notifications={notifications}
        http={http}
        navigation={navigation}
        chrome={chrome}
        savedObjects={savedObjects}
        dataSourceEnabled={!!dataSource}
        setActionMenu={setHeaderActionMenu}
        dataSourceManagement={dataSourceManagement}
        application={application}
        history={history}
      />
    </OpenSearchDashboardsContextProvider>,
    element
  );

  return () => ReactDOM.unmountComponentAtNode(element);
};
