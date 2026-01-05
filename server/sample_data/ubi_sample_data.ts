/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import path from 'path';
import { i18n } from '@osd/i18n';
import { SampleDatasetSchema } from '../../../../src/plugins/home/server/services/sample_data';
import { AppLinkSchema } from '../../../../src/plugins/home/server/services/sample_data/lib/sample_dataset_registry_types';
import { 
  appendDataSourceId,
  getSavedObjectsWithDataSource
} from '../../../../src/plugins/home/server/services/sample_data/data_sets';
import { getUbiSavedObjects } from './ubi_saved_objects';

export const getUbiDataIndices = () => [
  {
    id: 'ubi-events',
    dataPath: path.join(__dirname, './data/ubi_events.json.gz'),
    fields: {
      application: { type: 'keyword', ignore_above: 256 },
      action_name: { type: 'keyword', ignore_above: 100 },
      client_id: { type: 'keyword', ignore_above: 100 },
      query_id: { type: 'keyword', ignore_above: 100 },
      session_id: { type: 'keyword', ignore_above: 100 },
      message: { type: 'keyword', ignore_above: 1024 },
      message_type: { type: 'keyword', ignore_above: 100 },
      user_query: { type: 'keyword' },
      timestamp: {
        type: 'date',
        format: 'strict_date_time',
        ignore_malformed: true,
        doc_values: true,
      },
      event_attributes: {
        dynamic: true,
        properties: {
          position: {
            properties: {
              ordinal: { type: 'integer' },
              x: { type: 'integer' },
              y: { type: 'integer' },
              page_depth: { type: 'integer' },
              scroll_depth: { type: 'integer' },
              trail: {
                type: 'text',
                fields: { keyword: { type: 'keyword', ignore_above: 256 } },
              },
            },
          },
          object: {
            properties: {
              internal_id: { type: 'keyword' },
              object_id: { type: 'keyword', ignore_above: 256 },
              object_id_field: { type: 'keyword', ignore_above: 100 },
              name: { type: 'keyword', ignore_above: 256 },
              description: {
                type: 'text',
                fields: { keyword: { type: 'keyword', ignore_above: 256 } },
              },
              object_detail: { type: 'object' },
            },
          },
        },
      },
    },
    timeFields: [],
    currentTimeMarker: '2024-12-10T00:00:00',
    preserveDayOfWeekTimeOfDay: false,
    indexName: 'opensearch_dashboards_sample_ubi_events',
  },
  {
    id: 'ubi-queries',
    dataPath: path.join(__dirname, './data/ubi_queries.json.gz'),
    fields: {
      timestamp: { type: 'date', format: 'strict_date_time' },
      query_id: { type: 'keyword', ignore_above: 100 },
      query: { type: 'text' },
      query_response_id: { type: 'keyword', ignore_above: 100 },
      query_response_hit_ids: { type: 'keyword' },
      user_query: { type: 'keyword' },
      query_attributes: { type: 'flat_object' },
      client_id: { type: 'keyword', ignore_above: 100 },
      application: { type: 'keyword', ignore_above: 100 },
    },
    timeFields: [],
    currentTimeMarker: '2024-12-10T00:00:00',
    preserveDayOfWeekTimeOfDay: false,
    indexName: 'opensearch_dashboards_sample_ubi_queries',
  },
];

const ubiName = i18n.translate('searchRelevance.sampleData.ubiSpecTitle', {
  defaultMessage: 'Sample UBI data',
});

const ubiDescription = i18n.translate('searchRelevance.sampleData.ubiSpecDescription', {
  defaultMessage: 'Sample User Behavior Insights (UBI) data for search relevance analysis.',
});

export function ubiSpecProvider(): SampleDatasetSchema {
  return {
    id: 'ubi',
    name: ubiName,
    description: ubiDescription,
    previewImagePath: '/api/search_relevance/static/ubi_dashboard.png',
    darkPreviewImagePath: '/api/search_relevance/static/dark_ubi_dashboard.png',
    hasNewThemeImages: false,
    overviewDashboard: 'ubi-dashboard',
    getDataSourceIntegratedDashboard: appendDataSourceId('ubi-dashboard'),
    appLinks: [] as AppLinkSchema[],
    defaultIndex: 'ubi-queries-index-pattern',
    getDataSourceIntegratedDefaultIndex: appendDataSourceId('ubi-queries-index-pattern'),
    savedObjects: getUbiSavedObjects(),
    getDataSourceIntegratedSavedObjects: (dataSourceId?: string, dataSourceTitle?: string) =>
      getSavedObjectsWithDataSource(getUbiSavedObjects(), dataSourceId, dataSourceTitle),
    dataIndices: getUbiDataIndices(),
    status: 'not_installed',
  };
}
