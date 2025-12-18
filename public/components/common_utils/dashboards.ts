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
 * Check if the required dashboards are installed for the specific datasource context
 * 
 * This function determines whether dashboards need to be installed/overwritten based on:
 * 1. Current visualization suffixes vs expected suffixes for the datasource
 * 2. If suffixes don't match, it returns false to trigger installation/overwrite
 * 
 * Overwrite scenarios:
 * - Current: "Deep Dive Summary_remote", Expected: "_test" → Returns false (will overwrite with _test)
 * - Current: "Deep Dive Summary_test", Expected: "_remote" → Returns false (will overwrite with _remote)
 * - Current: "Deep Dive Summary_remote", Expected: "" (local) → Returns false (will overwrite with no suffix)
 * 
 * No installation scenarios:
 * - Current: "Deep Dive Summary_test", Expected: "_test" → Returns true (no installation needed)
 * - Current: "Deep Dive Summary", Expected: "" (local) → Returns true (no installation needed)
 */
export const checkDashboardsInstalled = async (http: CoreStart['http'], dataSourceId?: string): Promise<boolean> => {
  try {
    // Get datasource name dynamically to create expected suffix
    // This ensures we check for visualizations specific to the current datasource context
    let expectedSuffix = '';
    if (dataSourceId) {
      try {
        const datasourceResponse = await http.get(`/api/saved_objects/data-source/${dataSourceId}`);
        const datasourceName = datasourceResponse.attributes?.title || dataSourceId;
        expectedSuffix = `_${datasourceName}`;
      } catch (error) {
        // If can't get datasource name, use dataSourceId as fallback
        expectedSuffix = `_${dataSourceId}`;
      }
    }

    try {
      // Check the "Deep Dive Summary" visualization as a representative test case
      // All visualizations in a dashboard set should have consistent suffixes
      const response = await http.get(`/api/saved_objects/visualization/${SavedObjectIds.DeepDiveSummary}`);
      const title = response.attributes?.title || '';
      
      // Check if the visualization title matches the expected suffix
      // If it doesn't match, return false to trigger installation/overwrite
      return expectedSuffix === '' ? !title.includes('_') : title.endsWith(expectedSuffix);
    } catch (error) {
      // If visualization doesn't exist, dashboards need to be installed
      return false;
    }
  } catch (error) {
    return false;
  }
};

/**
 * Install the required dashboards with datasource name as suffix
 */
export const installDashboards = async (http: CoreStart['http'], dataSourceId?: string): Promise<boolean> => {
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
