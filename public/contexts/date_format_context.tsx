/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext } from 'react';
import { CoreStart } from '../../../src/core/public';
import { DataSourceManagementPluginSetup } from '../../../src/plugins/data_source_management/public';
import { AppMountParameters } from '../../../src/core/public';
import { NavigationPublicPluginStart } from '../../../src/plugins/navigation/public';

interface ConfigContextProps {
  dateFormat: string;
  dataSourceEnabled: boolean;
  dataSourceManagement: DataSourceManagementPluginSetup;
  setHeaderActionMenu: AppMountParameters['setHeaderActionMenu'];
  navigation: NavigationPublicPluginStart;
}

const ConfigContext = createContext<ConfigContextProps>({
  dateFormat: 'MMM D, YYYY @ HH:mm:ss.SSS', // Default format
  dataSourceEnabled: false,
  dataSourceManagement: {} as DataSourceManagementPluginSetup,
  setHeaderActionMenu: () => {},
  navigation: {} as NavigationPublicPluginStart,
});

export const useConfig = () => useContext(ConfigContext);

export const ConfigProvider: React.FC<{
  uiSettings: CoreStart['uiSettings'];
  dataSourceEnabled: boolean;
  dataSourceManagement: DataSourceManagementPluginSetup;
  setHeaderActionMenu: AppMountParameters['setHeaderActionMenu'];
  navigation: NavigationPublicPluginStart;
  children: React.ReactNode;
}> = ({
  uiSettings,
  dataSourceEnabled,
  dataSourceManagement,
  setHeaderActionMenu,
  navigation,
  children,
}) => {
  const dateFormat = uiSettings.get('dateFormat') || 'MMM D, YYYY @ HH:mm:ss.SSS';

  return (
    <ConfigContext.Provider
      value={{
        dateFormat,
        dataSourceEnabled,
        dataSourceManagement,
        setHeaderActionMenu,
        navigation,
      }}
    >
      {children}
    </ConfigContext.Provider>
  );
};
