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

export function createPhraseFilter(field: string, value: string, indexPatternId: string, controlledBy: string | null = null) {
  return {
    $state: {
      store: 'appState'
    },
    meta: {
      alias: null,
      controlledBy: controlledBy,
      disabled: false,
      index: indexPatternId,
      key: field,
      negate: false,
      params: {
        query: value
      },
      type: 'phrase'
    },
    query: {
      match_phrase: {
        [field]: value
      }
    }
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
  timeRange: { from: string; to: string }
) {
  const dashboardParams = {
    dashboardId: dashboardId,
    timeRange: timeRange,
    useHash: false,
    preserveSavedFilters: false,  // This prevents saved filters from overriding
    query: {
      language: 'kuery',
      query: ''
    },
    filters: filters,
    viewMode: 'view'
  };
  
  return await buildDashboardUrl(share, dashboardParams);
}

/**
 * Check if the required dashboards are installed
 */
export const checkDashboardsInstalled = async (http: CoreStart['http']): Promise<boolean> => {
  try {
    const _ = await http.get(`/api/saved_objects/dashboard/${SavedObjectIds.ExperimentDeepDive}`);
    return true;
  } catch(error) {
    return false;
  }
};

/**
 * Install the required dashboards
 */
export const installDashboards = async (http: CoreStart['http']): Promise<boolean> => {
  try {
    const formData = new FormData();
    formData.append('file', new Blob([escapedDashboardsData], { type: 'application/x-ndjson' }), 'dashboards.ndjson');
    await http.post('/api/saved_objects/_import', {
      body: formData,
      headers: {
        'Content-Type': undefined,
      },
      query: {
        overwrite: true,
      }
    });
    return true;
  } catch(error) {
    console.error('Failed to install dashboards:', error);
    return false;
  }
}; 