/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { I18nProvider } from '@osd/i18n/react';
import { HashRouter, Route, Switch } from 'react-router-dom';
import { useState } from 'react';
import { EuiGlobalToastList } from '@elastic/eui';
import { CoreStart, Toast } from '../../../../../src/core/public';
import { NavigationPublicPluginStart } from '../../../../../src/plugins/navigation/public';
import { Home as QueryCompareHome } from './query_compare/home';
import { PLUGIN_NAME } from '../../common';
import { SearchRelevanceContextProvider } from '../contexts';

interface SearchRelevanceAppDeps {
  notifications: CoreStart['notifications'];
  http: CoreStart['http'];
  navigation: NavigationPublicPluginStart;
  chrome: CoreStart['chrome'];
}

export const SearchRelevanceApp = ({
  notifications,
  http,
  navigation,
  chrome,
}: SearchRelevanceAppDeps) => {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [toastRightSide, setToastRightSide] = useState<boolean>(true);

  // Render the application DOM.
  // Note that `navigation.ui.TopNavMenu` is a stateful component exported on the `navigation` plugin's start contract.
  const parentBreadCrumbs = [{ text: PLUGIN_NAME, href: '#' }];
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
                    <QueryCompareHome
                      parentBreadCrumbs={parentBreadCrumbs}
                      notifications={notifications}
                      http={http}
                      navigation={navigation}
                      setBreadcrumbs={chrome.setBreadcrumbs}
                      setToast={setToast}
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
