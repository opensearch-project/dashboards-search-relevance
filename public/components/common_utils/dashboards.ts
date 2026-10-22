/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { CoreStart } from '../../../../../src/core/public';
import { SavedObjectIds } from '../../../common';
import { escapedDashboardsData } from './dashboards_data';

async function buildDashboardUrl(share: any, dashboardParams: any) {
  // Get the dashboard URL generator from the share plugin
  const urlGenerator = share.urlGenerators.getUrlGenerator('DASHBOARD_APP_URL_GENERATOR');

  if (!urlGenerator) {
    throw new Error('Dashboard URL generator not available');
  }

  // Create the URL with the provided parameters
  const url = await urlGenerator.createUrl(dashboardParams);
  return url;
}

export function createPhraseFilter(
  field: string,
  value: string,
  indexPatternId: string,
  controlledBy: string | null = null
) {
  return {
    $state: {
      store: 'appState',
    },
    meta: {
      alias: null,
      controlledBy,
      disabled: false,
      index: indexPatternId,
      key: field,
      negate: false,
      params: {
        query: value,
      },
      type: 'phrase',
    },
    query: {
      match_phrase: {
        [field]: value,
      },
    },
  };
}

export const addDaysToTimestamp = (timestamp: string, days: number): string => {
  const date = new Date(timestamp);
  date.setDate(date.getDate() + days);
  return date.toISOString();
};

// Simplified version using the helper
export async function dashboardUrl(
  share: any,
  dashboardId: string,
  indexPatternId: string,
  filters: any[] = [],
  timeRange: { from: string; to: string },
  dataSourceId?: string
) {
  const dashboardParams = {
    dashboardId,
    timeRange,
    useHash: false,
    preserveSavedFilters: false, // This prevents saved filters from overriding
    query: {
      language: 'kuery',
      query: '',
    },
    filters,
    viewMode: 'view',
    ...(dataSourceId && { dataSourceId }),
  };

  return await buildDashboardUrl(share, dashboardParams);
}

/**
 * Compute the fully scoped saved object id for the current workspace and data source.
 *
 * These dashboards ship with fixed, globally unique ids, so they must be scoped to avoid
 * colliding across workspaces and data sources. Both dimensions are applied as id prefixes
 * before import (the import binds the data source through an object reference, it does not
 * prefix ids itself). Missing dimensions are skipped, so single-data-source and non-workspace
 * deployments keep working with the base ids. The resulting layout is
 * `${dataSourceId}_${workspaceId}_${baseId}`.
 */
export const getScopedSavedObjectId = (
  baseId: string,
  workspaceId?: string,
  dataSourceId?: string
): string => [dataSourceId, workspaceId, baseId].filter(Boolean).join('_');

/**
 * Rewrite the exported dashboards ndjson so every saved object id, and every reference to it, is
 * scoped to the current workspace and data source. References are rewritten with the same scheme
 * so the imported dashboards, visualizations and index pattern keep pointing at each other. The
 * trailing export-summary line (which has no id) is left untouched. When neither dimension is
 * active the data is returned unchanged.
 */
export const applyDashboardScope = (
  dashboardsData: string,
  workspaceId?: string,
  dataSourceId?: string
): string => {
  if (!workspaceId && !dataSourceId) {
    return dashboardsData;
  }

  return dashboardsData
    .split('\n')
    .map((line) => {
      if (!line.trim()) {
        return line;
      }

      const savedObject = JSON.parse(line);

      if (typeof savedObject.id === 'string') {
        savedObject.id = getScopedSavedObjectId(savedObject.id, workspaceId, dataSourceId);
      }

      if (Array.isArray(savedObject.references)) {
        savedObject.references = savedObject.references.map((reference: any) =>
          typeof reference.id === 'string'
            ? { ...reference, id: getScopedSavedObjectId(reference.id, workspaceId, dataSourceId) }
            : reference
        );
      }

      return JSON.stringify(savedObject);
    })
    .join('\n');
};

/**
 * Check whether the dashboards are already installed for the current workspace and data source by
 * looking up the fully scoped "Experiment Deep Dive" dashboard. The request runs through the
 * workspace-aware http base path, so it only matches dashboards that belong to the current
 * workspace.
 */
export const checkDashboardsInstalled = async (
  http: CoreStart['http'],
  workspaceId?: string,
  dataSourceId?: string
): Promise<boolean> => {
  try {
    await http.get(
      `/api/saved_objects/dashboard/${getScopedSavedObjectId(
        SavedObjectIds.ExperimentDeepDive,
        workspaceId,
        dataSourceId
      )}`
    );
    return true;
  } catch (error) {
    return false;
  }
};

/**
 * Install the dashboards for the current workspace and data source.
 *
 * The data source name is used as a display suffix (replacing the `_remote` placeholder in the
 * exported objects' titles), the ids are prefixed with the workspace id, and the import is bound
 * to the data source. Combined with the data source prefix applied by the import, each
 * workspace/data source pair gets its own independent, correctly bound copy.
 */
export const installDashboards = async (
  http: CoreStart['http'],
  workspaceId?: string,
  dataSourceId?: string
): Promise<boolean> => {
  try {
    // Get datasource name dynamically
    let suffix = '';
    if (dataSourceId) {
      try {
        const datasourceResponse = await http.get(`/api/saved_objects/data-source/${dataSourceId}`);
        const datasourceName = datasourceResponse.attributes?.title || dataSourceId;
        suffix = `_${datasourceName}`;
      } catch (error) {
        // If can't get datasource name, use dataSourceId
        suffix = `_${dataSourceId}`;
      }
    }

    // Modify dashboard data to use the datasource name suffix
    let dashboardData = escapedDashboardsData;

    if (suffix) {
      // Replace _remote with the datasource name suffix
      dashboardData = dashboardData.replace(/_remote/g, suffix);
    } else {
      // For local cluster, remove _remote suffix
      dashboardData = dashboardData.replace(/_remote/g, '');
    }

    // Scope every saved object id to the current workspace and data source so each
    // workspace/data source pair gets its own independent copy.
    dashboardData = applyDashboardScope(dashboardData, workspaceId, dataSourceId);

    const formData = new FormData();
    formData.append(
      'file',
      new Blob([dashboardData], { type: 'application/x-ndjson' }),
      'dashboards.ndjson'
    );

    const queryParams = dataSourceId ? { dataSourceId, overwrite: true } : { overwrite: true };

    await http.post('/api/saved_objects/_import', {
      body: formData,
      headers: {
        'Content-Type': undefined,
      },
      query: queryParams,
    });
    return true;
  } catch (error) {
    console.error('Failed to install dashboards:', error);
    return false;
  }
};
