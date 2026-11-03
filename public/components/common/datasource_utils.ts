/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { useCallback, useEffect, useState } from 'react';
import { CoreStart, SavedObject } from '../../../../../src/core/public';
import { DataSourceAttributes } from '../../../../../src/plugins/data_source/common/data_sources';
import semver from 'semver';
import * as pluginManifest from '../../../opensearch_dashboards.json';

export const SEARCH_RELEVANCE_DATA_SOURCE_PLUGIN = 'opensearch-search-relevance';

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
  return useCallback(
    (dataSources) => {
      const dataConnectionId = dataSources[0] ? dataSources[0].id : '';
      setSelectedDataSource(dataConnectionId);
    },
    [setSelectedDataSource]
  );
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
    const current = params.get('dataSourceId') ?? undefined;
    if (current === dataSourceId) return;
    if (dataSourceId === undefined) {
      params.delete('dataSourceId');
    } else {
      params.set('dataSourceId', dataSourceId);
    }
    const search = params.toString();
    history.replace({
      pathname: location.pathname,
      search: search ? `?${search}` : '',
      hash: location.hash,
    });
  }, [dataSourceId, dataSourceEnabled, location.search, location.pathname, location.hash, history]);

  return [dataSourceId, setDataSourceId];
};

/**
 * Pure predicate matching the Search Relevance Workbench data source selector's filter: it excludes
 * AnalyticEngine data sources (relevance tuning relies on DSL, unsupported on AE) and requires a
 * data source version this plugin supports. Shared by the page selector (DataSourceMenu) and the
 * /search-relevance command's availability check so both agree on what a usable data source is.
 */
export const isSupportedSearchRelevanceDataSource = (
  dataSource: SavedObject<DataSourceAttributes>
): boolean => {
  if (dataSource?.attributes?.dataSourceEngineType === 'AnalyticEngine') {
    return false;
  }
  const dataSourceVersion = dataSource?.attributes?.dataSourceVersion || '';
  return semver.satisfies(dataSourceVersion, pluginManifest.supportedOSDataSourceVersions);
};

/**
 * Whether the data source has the Search Relevance backend plugin. Data sources without an
 * installedPlugins list are treated as supported.
 */
export const hasSearchRelevancePlugin = (
  dataSource: SavedObject<DataSourceAttributes>
): boolean => {
  const installedPlugins = dataSource?.attributes?.installedPlugins;
  return (
    !Array.isArray(installedPlugins) ||
    installedPlugins.includes(SEARCH_RELEVANCE_DATA_SOURCE_PLUGIN)
  );
};

export const isAwaitingDataSourceSelection = (
  dataSourceEnabled: boolean,
  dataSourceId: string | undefined
): boolean => dataSourceEnabled && dataSourceId === undefined;

export const useDataSourceSupportsSearchRelevance = (
  dataSourceEnabled: boolean,
  dataSourceId: string | undefined,
  savedObjects: CoreStart['savedObjects']
): boolean => {
  const [supportsSearchRelevance, setSupportsSearchRelevance] = useState(true);

  useEffect(() => {
    let cancelled = false;

    if (!dataSourceEnabled || dataSourceId === undefined || dataSourceId === '') {
      setSupportsSearchRelevance(true);
      return;
    }

    setSupportsSearchRelevance(true);

    savedObjects.client
      .get<DataSourceAttributes>('data-source', dataSourceId)
      .then((dataSource) => {
        if (cancelled) return;
        setSupportsSearchRelevance(hasSearchRelevancePlugin(dataSource));
      })
      .catch(() => {
        if (!cancelled) setSupportsSearchRelevance(true);
      });

    return () => {
      cancelled = true;
    };
  }, [dataSourceEnabled, dataSourceId, savedObjects]);

  return supportsSearchRelevance;
};
