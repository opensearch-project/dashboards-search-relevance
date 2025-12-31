/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { ubiSpecProvider, getUbiDataIndices } from './ubi_sample_data';
import { getUbiSavedObjects } from './ubi_saved_objects';

describe('UBI Sample Data', () => {
  describe('ubiSpecProvider', () => {
    it('should return a valid sample dataset schema', () => {
      const spec = ubiSpecProvider();
      
      expect(spec.id).toBe('ubi');
      expect(spec.name).toBeDefined();
      expect(spec.description).toBeDefined();
      expect(spec.previewImagePath).toBe('/api/search_relevance/static/ubi_dashboard.png');
      expect(spec.darkPreviewImagePath).toBe('/api/search_relevance/static/dark_ubi_dashboard.png');
      expect(spec.overviewDashboard).toBe('ubi-dashboard-ecommerce');
      expect(spec.defaultIndex).toBe('ubi-queries-index-pattern');
      expect(spec.hasNewThemeImages).toBe(false);
      expect(spec.status).toBe('not_installed');
    });

    it('should have required functions', () => {
      const spec = ubiSpecProvider();
      
      expect(typeof spec.getDataSourceIntegratedDashboard).toBe('function');
      expect(typeof spec.getDataSourceIntegratedDefaultIndex).toBe('function');
      expect(typeof spec.getDataSourceIntegratedSavedObjects).toBe('function');
    });

    it('should have saved objects and data indices', () => {
      const spec = ubiSpecProvider();
      
      expect(Array.isArray(spec.savedObjects)).toBe(true);
      expect(spec.savedObjects.length).toBeGreaterThan(0);
      expect(Array.isArray(spec.dataIndices)).toBe(true);
      expect(spec.dataIndices.length).toBe(2);
    });

    it('should have correct dashboard time range in saved objects', () => {
      const savedObjects = getUbiSavedObjects();
      const dashboard = savedObjects.find(obj => obj.type === 'dashboard');
      
      expect(dashboard).toBeDefined();
      expect(dashboard!.attributes.timeFrom).toBe('2024-12-01T00:00:00.000Z');
      expect(dashboard!.attributes.timeTo).toBe('2024-12-31T23:59:59.999Z');
    });
  });

  describe('getUbiDataIndices', () => {
    it('should return two data indices', () => {
      const indices = getUbiDataIndices();
      
      expect(indices).toHaveLength(2);
      expect(indices[0].id).toBe('ubi-events');
      expect(indices[1].id).toBe('ubi-queries');
    });

    it('should have correct index names', () => {
      const indices = getUbiDataIndices();
      
      expect(indices[0].indexName).toBe('opensearch_dashboards_sample_ubi_events');
      expect(indices[1].indexName).toBe('opensearch_dashboards_sample_ubi_queries');
    });

    it('should have data paths', () => {
      const indices = getUbiDataIndices();
      
      indices.forEach(index => {
        expect(index.dataPath).toBeDefined();
        expect(index.dataPath).toContain('.json.gz');
      });
    });

    it('should have field mappings', () => {
      const indices = getUbiDataIndices();
      
      indices.forEach(index => {
        expect(index.fields).toBeDefined();
        expect(index.fields.timestamp).toBeDefined();
        expect(index.fields.timestamp.type).toBe('date');
      });
    });
  });

  describe('getUbiSavedObjects', () => {
    it('should return saved objects array', () => {
      const savedObjects = getUbiSavedObjects();
      
      expect(Array.isArray(savedObjects)).toBe(true);
      expect(savedObjects.length).toBeGreaterThan(0);
    });

    it('should contain index patterns', () => {
      const savedObjects = getUbiSavedObjects();
      const indexPatterns = savedObjects.filter(obj => obj.type === 'index-pattern');
      
      expect(indexPatterns.length).toBe(2);
      expect(indexPatterns.some(ip => ip.id === 'ubi-queries-index-pattern')).toBe(true);
      expect(indexPatterns.some(ip => ip.id === 'ubi-events-index-pattern')).toBe(true);
    });

    it('should contain visualizations', () => {
      const savedObjects = getUbiSavedObjects();
      const visualizations = savedObjects.filter(obj => obj.type === 'visualization');
      
      expect(visualizations.length).toBeGreaterThan(0);
      visualizations.forEach(viz => {
        expect(viz.id).toBeDefined();
        expect(viz.attributes).toBeDefined();
      });
    });

    it('should contain dashboard', () => {
      const savedObjects = getUbiSavedObjects();
      const dashboards = savedObjects.filter(obj => obj.type === 'dashboard');
      
      expect(dashboards.length).toBe(1);
      expect(dashboards[0].id).toBe('ubi-dashboard-ecommerce');
      expect(dashboards[0].attributes.title).toContain('[UBI] Search Overview');
    });
  });

  describe('Data Source Integration', () => {
    it('should handle data source integration for dashboard', () => {
      const spec = ubiSpecProvider();
      const integratedDashboard = spec.getDataSourceIntegratedDashboard('test-ds', 'test-workspace');
      
      expect(integratedDashboard).toBeDefined();
      expect(typeof integratedDashboard).toBe('string');
    });

    it('should handle data source integration for default index', () => {
      const spec = ubiSpecProvider();
      const integratedIndex = spec.getDataSourceIntegratedDefaultIndex('test-ds', 'test-workspace');
      
      expect(integratedIndex).toBeDefined();
      expect(typeof integratedIndex).toBe('string');
    });

    it('should handle data source integration for saved objects', () => {
      const spec = ubiSpecProvider();
      const integratedObjects = spec.getDataSourceIntegratedSavedObjects('test-ds', 'Test DataSource');
      
      expect(Array.isArray(integratedObjects)).toBe(true);
      expect(integratedObjects.length).toBeGreaterThan(0);
    });
  });
});
