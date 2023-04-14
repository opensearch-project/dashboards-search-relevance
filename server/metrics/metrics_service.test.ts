/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { MetricsService, MetricsServiceSetup } from './';

describe('MetricsService', () => {
  let metricsService: MetricsService;
  let setup: MetricsServiceSetup;

  beforeEach(() => {
    metricsService = new MetricsService();
    setup = metricsService.setup();
  });

  afterEach(() => {
    metricsService.stop();
  });

  describe('test addMetric and getStats', () => {
    it('should add metrics to the correct interval and ignore metrics in the future', () => {
      jest.useFakeTimers('modern');
      jest.setSystemTime(0);
      setup.addMetric('component1', 'action1', 200, 100);
      jest.advanceTimersByTime(30000);
      setup.addMetric('component1', 'action1', 200, 200);
      setup.addMetric('component1', 'action1', 200, 300);
      jest.advanceTimersByTime(30000);
      setup.addMetric('component1', 'action1', 200, 400);

      const stats = setup.getStats();
      expect(stats.data['component1']['action1'][200]).toEqual({
        response_time_total: 600,
        count: 3,
      });
      expect(stats.overall.response_time_avg).toEqual(200);
      expect(stats.overall.requests_per_second).toEqual(0.05);
      expect(stats.counts_by_component['component1']).toEqual(3);
      expect(stats.counts_by_status_code[200]).toEqual(3);
    });

    it('should add metrics to the correct component', () => {
      jest.useFakeTimers('modern');
      jest.setSystemTime(0);
      setup.addMetric('component1', 'action1', 200, 100);
      setup.addMetric('component2', 'action1', 200, 200);
      setup.addMetric('component1', 'action2', 400, 300);
    
      jest.advanceTimersByTime(60000);
      const stats = setup.getStats();
      expect(stats.counts_by_component['component1']).toEqual(2);
      expect(stats.counts_by_component['component2']).toEqual(1);
      expect(stats.counts_by_status_code[200]).toEqual(2);
    });
    
    it('should add metrics to the correct action', () => {
      jest.useFakeTimers('modern');
      jest.setSystemTime(0);
      setup.addMetric('component1', 'action1', 200, 100);
      setup.addMetric('component1', 'action2', 300, 200);
      setup.addMetric('component2', 'action1', 400, 300);
    
      jest.advanceTimersByTime(60000);
      const stats = setup.getStats();
      expect(stats.data['component1']['action1'][200].count).toEqual(1);
      expect(stats.data['component1']['action2'][300].count).toEqual(1);
      expect(stats.data['component2']['action1'][400].count).toEqual(1);
    });
    
    it('should add metrics to the correct status code', () => {
      jest.useFakeTimers('modern');
      jest.setSystemTime(0);
      setup.addMetric('component1', 'action1', 200, 100);
      setup.addMetric('component1', 'action1', 400, 200);
      setup.addMetric('component1', 'action1', 500, 300);
      
      jest.advanceTimersByTime(60000);
      const stats = setup.getStats();
      expect(stats.counts_by_status_code[200]).toEqual(1);
      expect(stats.counts_by_status_code[400]).toEqual(1);
      expect(stats.counts_by_status_code[500]).toEqual(1);
    });
  });
    
  describe('resetMetrics', () => {
    it('should clear all metrics data', () => {
      setup.addMetric('component1', 'action1', 200, 100);
      metricsService.resetMetrics();
      const stats = setup.getStats();
      expect(stats.data).toEqual({});
      expect(stats.overall).toEqual({ response_time_avg: 0, requests_per_second: 0 });
      expect(stats.counts_by_component).toEqual({});
      expect(stats.counts_by_status_code).toEqual({});
    });
  });

  describe('trim', () => {
    it('should remove old metrics data', () => {
      jest.useFakeTimers('modern');
      jest.setSystemTime(0);
      setup.addMetric('component1', 'action1', 200, 100);
      jest.advanceTimersByTime(60000);
      setup.addMetric('component1', 'action1', 200, 200);
      jest.advanceTimersByTime(60000);
      setup.addMetric('component1', 'action1', 200, 300);
      jest.advanceTimersByTime(60000);
      metricsService.trim();
      jest.setSystemTime(0);
      const stats = setup.getStats();
      expect(stats.data).toEqual({});
      expect(stats.overall).toEqual({ response_time_avg: 0, requests_per_second: 0 });
      expect(stats.counts_by_component).toEqual({});
      expect(stats.counts_by_status_code).toEqual({});
    });
  });
});
