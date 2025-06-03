/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { EuiGlobalToastList } from '@elastic/eui';
import { I18nProvider } from '@osd/i18n/react';
import React, { useState } from 'react';
import { HashRouter, Route, Switch } from 'react-router-dom';
import { CoreStart, MountPoint, Toast } from '../../../../src/core/public';
import { DataSourceManagementPluginSetup } from '../../../../src/plugins/data_source_management/public';
import { NavigationPublicPluginStart } from '../../../../src/plugins/navigation/public';
import { PLUGIN_NAME, COMPARE_SEARCH_RESULTS_TITLE } from '../../common';
import { SearchRelevanceContextProvider } from '../contexts';
import { Home as QueryCompareHome } from './query_compare/home';
import { ExperimentPage } from "./experiment/experiment_page";

interface SearchRelevanceAppDeps {
  notifications: CoreStart['notifications'];
  http: CoreStart['http'];
  navigation: NavigationPublicPluginStart;
  chrome: CoreStart['chrome'];
  savedObjects: CoreStart['savedObjects'];
  dataSourceEnabled: boolean;
  dataSourceManagement: DataSourceManagementPluginSetup;
  setActionMenu: (menuMount: MountPoint | undefined) => void;
  application: CoreStart['application'];
}

export const SearchRelevanceApp = ({
  notifications,
  http,
  navigation,
  chrome,
  savedObjects,
  dataSourceEnabled,
  setActionMenu,
  dataSourceManagement,
  application,
}: SearchRelevanceAppDeps) => {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [toastRightSide, setToastRightSide] = useState<boolean>(true);

  // Render the application DOM.
  // Note that `navigation.ui.TopNavMenu` is a stateful component exported on the `navigation` plugin's start contract.

  const getNavGroupEnabled = chrome.navGroup.getNavGroupEnabled();

  const parentBreadCrumbs = getNavGroupEnabled
    ? [{ text: COMPARE_SEARCH_RESULTS_TITLE, href: '#' }]
    : [{ text: PLUGIN_NAME, href: '#' }];

  const setToast = (title: string, color = 'success', text?: ReactChild, side?: string) => {
    if (!text) text = '';
    setToastRightSide(!side ? true : false);
    setToasts([...toasts, { id: new Date().toISOString(), title, text, color } as Toast]);
  };
  return (
    <HashRouter>
      <I18nProvider>
        <SearchRelevanceContextProvider>
          <>
            <EuiGlobalToastList
              toasts={toasts}
              dismissToast={(removedToast) => {
                setToasts(toasts.filter((toast) => toast.id !== removedToast.id));
              }}
              side={toastRightSide ? 'right' : 'left'}
              toastLifeTimeMs={6000}
            />
            <Switch>
                <Route
                  path={['/']}
                  render={(props) => {
                    return (
                      <ExperimentPage
                        application={application}
                        chrome={chrome}
                      />
                    );
                  }}
                />
            </Switch>
          </>
        </SearchRelevanceContextProvider>
      </I18nProvider>
    </HashRouter>
  );
};
