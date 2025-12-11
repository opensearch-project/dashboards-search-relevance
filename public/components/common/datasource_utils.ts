/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { useCallback } from 'react';
import { SavedObject } from '../../../../../src/core/public';
import { DataSourceAttributes } from '../../../../../src/plugins/data_source/common/data_sources';
import semver from 'semver';
import * as pluginManifest from '../../../opensearch_dashboards.json';

/**
 * Parse dataSourceId from URL search parameters
 */
export const parseDataSourceIdFromUrl = (location: any): string | undefined => {
  if (location.search) {
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
 * Hook for datasource filter function
 */
export const useDataSourceFilter = () => {
  return useCallback((dataSource: SavedObject<DataSourceAttributes>) => {
    const dataSourceVersion = dataSource?.attributes?.dataSourceVersion || '';
    return semver.satisfies(dataSourceVersion, pluginManifest.supportedOSDataSourceVersions);
  }, []);
};
