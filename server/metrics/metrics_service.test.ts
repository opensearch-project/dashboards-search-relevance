/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { MetricsService, MetricsServiceSetup } from '.';

describe('MetricsService', () => {
  let metricsService: MetricsService;
  let setup: MetricsServiceSetup;

  beforeEach(() => {
    metricsService = new MetricsService();
    setup = metricsService.setup(1000);
  });

  afterEach(() => {
    metricsService.stop();
  });

  describe('addMetric', () => {
    it('should track metric data', () => {
      setup.addMetric('component1', 'action1', 200, 100);
      setup.addMetric('component1', 'action1', 200, 200);
      setup.addMetric('component1', 'action2', 200, 300);

      const stats = setup.getStats();
      expect(stats.data).toEqual({
        component1: {
          action1: {
            200: { sum: 300, count: 2 },
          },
          action2: {
            200: { sum: 300, count: 1 },
          },
        },
      });
    });

    it('should track overall metric data', () => {
      setup.addMetric('component1', 'action1', 200, 100);
      setup.addMetric('component1', 'action1', 200, 200);
      setup.addMetric('component1', 'action2', 200, 300);

      const stats = setup.getStats();
      expect(stats.overall).toEqual({
        response_time_avg: 200,
        requests_per_second: 3,
      });
    });

    it('should track component counts', () => {
      setup.addMetric('component1', 'action1', 200, 100);
      setup.addMetric('component2', 'action1', 200, 200);
      setup.addMetric('component2', 'action2', 200, 300);

      const stats = setup.getStats();
      expect(stats.component_counts).toEqual({
        component1: 1,
        component2: 2,
      });
    });

    it('should track status code counts', () => {
      setup.addMetric('component1', 'action1', 200, 100);
      setup.addMetric('component2', 'action1', 200, 200);
      setup.addMetric('component2', 'action2', 400, 300);

      const stats = setup.getStats();
      expect(stats.status_code_counts).toEqual({
        200: 2,
        400: 1,
      });
    });
  });

  describe('resetMetrics', () => {
    it('should reset all metrics data', () => {
      setup.addMetric('component1', 'action1', 200, 100);
      setup.addMetric('component2', 'action1', 200, 200);
      metricsService.resetMetrics();
      const stats = setup.getStats();
      expect(stats).toEqual({
        data: {},
        overall: { response_time_avg: NaN, requests_per_second: 0 },
        component_counts: {},
        status_code_counts: {},
      });
    });
  });
});
