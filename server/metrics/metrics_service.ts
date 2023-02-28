/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { Logger } from '../../../../src/core/server';

interface MetricValue {
  sum: number;
  count: number;
}

interface MetricOutPut {
  response_time_avg: number;
  requests_per_second: number;
}

interface MetricsData {
  [componentName: string]: {
    [action: string]: {
      [statusCode: number]: MetricValue;
    };
  };
}

export interface Stats {
  readonly data: MetricsData;
  readonly overall: MetricOutPut;
  readonly component_counts: Record<string, number>;
  readonly status_code_counts: Record<string, number>;
}

export interface MetricsServiceSetup {
  addMetric: (componentName: string, action: string, statusCode: number, value: number) => void;
  getStats: () => Stats;
}

export class MetricsService {
  private data: MetricsData = {};
  private overall: MetricValue = { sum: 0, count: 0 };
  private componentCounts: Record<string, number> = {};
  private statusCodeCounts: Record<string, number> = {};

  private resetIntervalMs?: number;

  constructor(private logger?: Logger) {}

  setup(resetIntervalMs: number): MetricsServiceSetup {
    this.resetIntervalMs = resetIntervalMs;

    setInterval(() => {
      this.resetMetrics();
    }, resetIntervalMs);

    const addMetric = (
      componentName: string,
      action: string,
      statusCode: number,
      value: number
    ): void => {
      if (!this.data[componentName]) {
        this.data[componentName] = {};
      }
      if (!this.data[componentName][action]) {
        this.data[componentName][action] = {};
      }
      if (!this.data[componentName][action][statusCode]) {
        this.data[componentName][action][statusCode] = { sum: 0, count: 0 };
      }

      const { sum, count } = this.data[componentName][action][statusCode];
      this.data[componentName][action][statusCode] = {
        sum: sum + value,
        count: count + 1,
      };

      this.overall.sum += value;
      this.overall.count++;

      if (!this.componentCounts[componentName]) {
        this.componentCounts[componentName] = 0;
      }
      this.componentCounts[componentName]++;

      if (!this.statusCodeCounts[statusCode]) {
        this.statusCodeCounts[statusCode] = 0;
      }
      this.statusCodeCounts[statusCode]++;
    };

    const getStats = (): Stats => {
      const requestsPerSecond = this.overall.count / (this.resetIntervalMs! / 1000);

      return {
        data: { ...this.data },
        overall: {
          response_time_avg: this.overall.sum / this.overall.count,
          requests_per_second: requestsPerSecond,
        },
        component_counts: { ...this.componentCounts },
        status_code_counts: { ...this.statusCodeCounts },
      };
    };

    return { addMetric, getStats };
  }

  start() {}

  stop() {
    this.resetMetrics();
  }

  resetMetrics(): void {
    this.data = {};
    this.overall.sum = 0;
    this.overall.count = 0;
    this.componentCounts = {};
    this.statusCodeCounts = {};
  }
}
