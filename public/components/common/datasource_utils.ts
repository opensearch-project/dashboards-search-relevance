/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { useCallback, useEffect, useState } from 'react';
import { SavedObject } from '../../../../../src/core/public';
import { DataSourceAttributes } from '../../../../../src/plugins/data_source/common/data_sources';
import semver from 'semver';
import * as pluginManifest from '../../../opensearch_dashboards.json';

/**
 * Parse dataSourceId from URL search parameters
 */
export const parseDataSourceIdFromUrl = (location: any): string | undefined => {
  if (location?.search) {
    const params = new URLSearchParams(location.search);
    return params.get('dataSourceId') || undefined;
  }
  return undefined;
};

/**
 * Parse entityId and dataSourceId from URL parameters (for hash routing)
 */
export const parseEntityParams = (entityId: string) => {
  let cleanEntityId = entityId;
  let dataSourceId = null;

  if (entityId.includes('?')) {
    const [id, queryString] = entityId.split('?');
    cleanEntityId = id;
    const urlParams = new URLSearchParams(queryString);
    dataSourceId = urlParams.get('dataSourceId');
  }

  return { cleanEntityId, dataSourceId };
};

/**
 * Hook for datasource selection callback
 */
export const useDataSourceSelection = (setSelectedDataSource: (id: string) => void) => {
  return useCallback((dataSources) => {
    const dataConnectionId = dataSources[0] ? dataSources[0].id : '';
    setSelectedDataSource(dataConnectionId);
  }, [setSelectedDataSource]);
};

/**
 * Hook that owns the active dataSourceId and keeps it in sync with the URL
 * `?dataSourceId=…` query param. Seeded from the URL on mount (only when MDS
 * is enabled, so a stale param from a prior session is ignored when the
 * dataSource plugin isn't loaded), then re-stamped on every navigation so
 * tab clicks via `history.push(pathname)` don't drop the param.
 */
export const useDataSourceUrlSync = (
  dataSourceEnabled: boolean,
  history: { replace: (location: any) => void },
  location: { search?: string; pathname?: string; hash?: string }
): [string | undefined, (id: string | undefined) => void] => {
  const [dataSourceId, setDataSourceId] = useState<string | undefined>(() =>
    dataSourceEnabled ? parseDataSourceIdFromUrl(location) : undefined
  );

  useEffect(() => {
    if (!dataSourceEnabled) return;
    const params = new URLSearchParams(location.search);
    const current = params.get('dataSourceId') || undefined;
    if (current === dataSourceId) return;
    if (dataSourceId === undefined) {
      params.delete('dataSourceId');
    } else {
      params.set('dataSourceId', dataSourceId);
    }
    const search = params.toString();
    history.replace({ ...location, search: search ? `?${search}` : '' });
  }, [dataSourceId, dataSourceEnabled, location, history]);

  return [dataSourceId, setDataSourceId];
};

/**
 * Hook for datasource filter function
 */
export const useDataSourceFilter = (excludeEngineTypes?: string[]) => {
  return useCallback(
    (dataSource: SavedObject<DataSourceAttributes>) => {
      if (
        excludeEngineTypes?.length &&
        dataSource?.attributes?.dataSourceEngineType &&
        excludeEngineTypes.includes(dataSource.attributes.dataSourceEngineType)
      ) {
        return false;
      }
      const dataSourceVersion = dataSource?.attributes?.dataSourceVersion || '';
      return semver.satisfies(dataSourceVersion, pluginManifest.supportedOSDataSourceVersions);
    },
    [excludeEngineTypes]
  );
};
