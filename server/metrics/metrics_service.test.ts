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
        duration_in_milliseconds: 600,
        count: 3,
      });
      expect(stats.overall.response_time_avg).toEqual(200);
      expect(stats.overall.requests_per_second).toEqual(0.05);
      expect(stats.count_per_component['component1']).toEqual(3);
      expect(stats.count_per_status_code[200]).toEqual(3);
    });
  });

  describe('resetMetrics', () => {
    it('should clear all metrics data', () => {
      setup.addMetric('component1', 'action1', 200, 100);
      metricsService.resetMetrics();
      const stats = setup.getStats();
      expect(stats.data).toEqual({});
      expect(stats.overall).toEqual({ response_time_avg: 0, requests_per_second: 0 });
      expect(stats.count_per_component).toEqual({});
      expect(stats.count_per_status_code).toEqual({});
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
      expect(stats.count_per_component).toEqual({});
      expect(stats.count_per_status_code).toEqual({});
    });
  });
});
