/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { Logger } from '../../../../src/core/server';

interface MetricValue {
  sum: number;
  count: number;
}

interface MetricOutput {
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
  readonly overall: MetricOutput;
  readonly component_counts: Record<string, number>;
  readonly status_code_counts: Record<string, number>;
}

export interface MetricsServiceSetup {
  addMetric: (componentName: string, action: string, statusCode: number, value: number) => void;
  getStats: () => Stats;
}

export class MetricsService {
  private interval: number = 60000;
  private windowSize: number = 10;

  private data: Record<number, MetricsData> = {};
  private componentCounts: Record<number, Record<string, number>> = {};
  private statusCodeCounts: Record<number, Record<string, number>> = {};
  private overall: Record<number, MetricValue> = {};

  constructor(private logger?: Logger) {}

  setup(logger: Logger, interval: number, windowSize: number): MetricsServiceSetup {
    this.logger = logger;
    this.interval = interval;
    this.windowSize = windowSize;

    const addMetric = (
      componentName: string,
      action: string,
      statusCode: number,
      value: number
    ): void => {
      const currInterval = Math.floor(Date.now() / this.interval);

      this.trim();

      if (!this.data[currInterval]) {
        this.data[currInterval] = {};
        this.overall[currInterval] = { sum: 0, count: 0 };
        this.componentCounts[currInterval] = {};
        this.statusCodeCounts[currInterval] = {};
      }

      if (!this.data[currInterval][componentName]) {
        this.data[currInterval][componentName] = {};
        this.componentCounts[currInterval][componentName] = 0;
      }

      if (!this.data[currInterval][componentName][action]) {
        this.data[currInterval][componentName][action] = {};
      }

      if (!this.data[currInterval][componentName][action][statusCode]) {
        this.data[currInterval][componentName][action][statusCode] = { sum: 0, count: 0 };
        this.statusCodeCounts[currInterval][statusCode] = 0;
      }

      const { sum, count } = this.data[currInterval][componentName][action][statusCode];
      this.data[currInterval][componentName][action][statusCode] = {
        sum: sum + value,
        count: count + 1,
      };

      this.componentCounts[currInterval][componentName]++;
      this.statusCodeCounts[currInterval][statusCode]++;

      this.overall[currInterval].sum += value;
      this.overall[currInterval].count++;
    };

    const getStats = (): Stats => {
      const prevInterval = Math.floor(Date.now() / this.interval) - 1;
      const data = { ...this.data[prevInterval] } || {};
      const overall = { ...this.overall[prevInterval] } || {};

      let requestsPerSecond = 0,
        responseTimeAvg = 0;

      if (Object.keys(overall).length !== 0 && overall.count !== 0) {
        responseTimeAvg = overall.sum / overall.count;
        requestsPerSecond = overall.count / (this.interval / 1000);
      }

      return {
        data,
        overall: {
          response_time_avg: responseTimeAvg,
          requests_per_second: requestsPerSecond,
        },
        component_counts: { ...this.componentCounts[prevInterval] } || {},
        status_code_counts: { ...this.statusCodeCounts[prevInterval] } || {},
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
    this.overall = {};
    this.componentCounts = {};
    this.statusCodeCounts = {};
  }

  trim(): void {
    const oldestTimestampToKeep = Math.floor(
      (Date.now() - this.windowSize * this.interval) / this.interval
    );
    for (const timestampStr in this.data) {
      const timestamp = parseInt(timestampStr);
      if (timestamp < oldestTimestampToKeep) {
        delete this.data[timestamp];
      }
    }
  }
}
