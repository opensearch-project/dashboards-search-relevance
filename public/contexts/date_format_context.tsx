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
  dateFormat: 'MMM D, YYYY @ HH:mm:ss', // Default format
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
  const rawDateFormat = uiSettings.get('dateFormat');
  // UI renders to second, not millisecond level of detail so drop any millisecond format rules
  const dateFormat = rawDateFormat.replace(/\.S{1,3}/g, '');

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
