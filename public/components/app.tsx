/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  EuiButton,
  EuiButtonEmpty,
  EuiGlobalToastList,
  EuiModal,
  EuiModalBody,
  EuiModalFooter,
  EuiModalHeader,
  EuiModalHeaderTitle,
  EuiSwitch,
} from '@elastic/eui';
import { I18nProvider } from '@osd/i18n/react';
import React, { useState } from 'react';
import { HashRouter, Route, Switch } from 'react-router-dom';
import { CoreStart, MountPoint, Toast } from '../../../../src/core/public';
import { DataSourceManagementPluginSetup } from '../../../../src/plugins/data_source_management/public';
import { NavigationPublicPluginStart } from '../../../../src/plugins/navigation/public';
import { COMPARE_SEARCH_RESULTS_TITLE, PLUGIN_NAME } from '../../common';
import { SearchRelevanceContextProvider } from '../contexts';
import { Home as QueryCompareHome } from './query_compare/home';
import { ResourceManagementPage } from './resource_management_home/resource_management_page';

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

  const [useOldVersion, setUseOldVersion] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(true);

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

  const onToggleChange = (e) => {
    setUseOldVersion(e.target.checked);
  };

  const closeModal = () => {
    setIsModalVisible(false);
  };

  const selectVersion = (isOld: boolean) => {
    setUseOldVersion(isOld);
    closeModal();
  };

  const versionModal = (
    <>
      {isModalVisible && (
        <EuiModal onClose={closeModal}>
          <EuiModalHeader>
            <EuiModalHeaderTitle>
              <h1>Select Version</h1>
            </EuiModalHeaderTitle>
          </EuiModalHeader>

          <EuiModalBody>
            <p>Please select which version you would like to use:</p>
          </EuiModalBody>

          <EuiModalFooter>
            <EuiButtonEmpty onClick={() => selectVersion(true)}>Use Old Version</EuiButtonEmpty>
            <EuiButton fill onClick={() => selectVersion(false)}>
              Use New Version
            </EuiButton>
          </EuiModalFooter>
        </EuiModal>
      )}
    </>
  );

  const versionToggle = (
    <EuiSwitch
      label="Use Old Version"
      checked={useOldVersion}
      onChange={onToggleChange}
      style={{ marginBottom: '16px' }}
    />
  );

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
                path={[
                  '/',
                  '/:entity(querySet|searchConfiguration|experiment)/:entityAction(list|create|view)?/:entityId?',
                ]}
                exact
                render={(props) => {
                  const { entity, entityAction, entityId } = props.match.params;

                  return (
                    <>
                      {versionModal}
                      {versionToggle}

                      {useOldVersion ? (
                        <QueryCompareHome
                          application={application}
                          parentBreadCrumbs={parentBreadCrumbs}
                          notifications={notifications}
                          http={http}
                          navigation={navigation}
                          setBreadcrumbs={chrome.setBreadcrumbs}
                          setToast={setToast}
                          chrome={chrome}
                          savedObjects={savedObjects}
                          dataSourceEnabled={dataSourceEnabled}
                          dataSourceManagement={dataSourceManagement}
                          setActionMenu={setActionMenu}
                        />
                      ) : (
                        <ResourceManagementPage
                          application={application}
                          chrome={chrome}
                          http={http}
                          notifications={notifications}
                          entity={entity}
                          entityAction={entityAction}
                          entityId={entityId}
                        />
                      )}
                    </>
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
