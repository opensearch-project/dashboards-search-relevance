/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext } from 'react';
import { CoreStart } from '../../../src/core/public';

interface ConfigContextProps {
  dateFormat: string;
  // Add other config fields here as needed
}

const ConfigContext = createContext<ConfigContextProps>({
  dateFormat: 'MMM D, YYYY @ HH:mm:ss.SSS', // Default format
});

export const useConfig = () => useContext(ConfigContext);

export const ConfigProvider: React.FC<{
  uiSettings: CoreStart['uiSettings'];
  children: React.ReactNode;
}> = ({ uiSettings, children }) => {
  const dateFormat = uiSettings.get('dateFormat') || 'MMM D, YYYY @ HH:mm:ss.SSS';

  return (
    <ConfigContext.Provider value={{ dateFormat }}>
      {children}
    </ConfigContext.Provider>
  );
}; 