/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from 'react';
import semver from 'semver';
import { CoreStart, MountPoint, SavedObject } from '../../../../../src/core/public';
import {
  DataSourceManagementPluginSetup,
  DataSourceSelectableConfig,
} from '../../../../../src/plugins/data_source_management/public';
import { DataSourceOption } from '../../../../../src/plugins/data_source_management/public/components/data_source_menu/types';
import { DataSourceAttributes } from '../../../../../src/plugins/data_source/common/data_sources';
import * as pluginManifest from '../../../opensearch_dashboards.json';

interface DataSourceMenuProps {
  dataSourceEnabled: boolean;
  dataSourceManagement?: DataSourceManagementPluginSetup;
  savedObjects: CoreStart['savedObjects'];
  notifications: CoreStart['notifications'];
  setActionMenu: (menuMount: MountPoint | undefined) => void;
  dataSourceId: string | undefined;
  setDataSourceId: (id: string | undefined) => void;
}

const dataSourceFilterFn = (dataSource: SavedObject<DataSourceAttributes>) => {
  if (dataSource?.attributes?.dataSourceEngineType === 'AnalyticEngine') {
    return false;
  }
  const dataSourceVersion = dataSource?.attributes?.dataSourceVersion || '';
  return semver.satisfies(dataSourceVersion, pluginManifest.supportedOSDataSourceVersions);
};

export const DataSourceMenu: React.FC<DataSourceMenuProps> = ({
  dataSourceEnabled,
  dataSourceManagement,
  savedObjects,
  notifications,
  setActionMenu,
  dataSourceId,
  setDataSourceId,
}) => {
  // Cache the menu element so OSD's DataSourceMenu mounts once and keeps
  // its internal state (loaded options, selection) across parent re-renders.
  // dataSourceId is intentionally NOT a dep — the menu owns its own UI state
  // after mount; the activeOption prop is only the initial seed.
  return useMemo(() => {
    if (!dataSourceEnabled || !dataSourceManagement) {
      return null;
    }
    const Menu = dataSourceManagement.ui.getDataSourceMenu<DataSourceSelectableConfig>();
    return (
      <Menu
        setMenuMountPoint={setActionMenu}
        componentType={'DataSourceSelectable'}
        componentConfig={{
          fullWidth: false,
          activeOption: dataSourceId === undefined ? undefined : [{ id: dataSourceId }],
          savedObjects: savedObjects.client,
          notifications,
          onSelectedDataSources: ([event]: DataSourceOption[]) => {
            const id = event?.id;
            if (id === undefined) {
              notifications.toasts.addDanger('Unable to set data source.');
              return;
            }
            setDataSourceId(id);
          },
          dataSourceFilter: dataSourceFilterFn,
        }}
      />
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataSourceEnabled, dataSourceManagement, savedObjects, notifications, setActionMenu, setDataSourceId]);
};
