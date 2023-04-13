/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { Logger } from '../../../../src/core/server';
import { METRIC_INTERVAL, DEFAULT_WINDOW_SIZE } from '.';

interface MetricValue {
  duration_in_milliseconds: number;
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
  readonly count_per_component: Record<string, number>;
  readonly count_per_status_code: Record<string, number>;
}

export interface MetricsServiceSetup {
  addMetric: (componentName: string, action: string, statusCode: number, value: number) => void;
  getStats: () => Stats;
}

export class MetricsService {
  private interval: number = METRIC_INTERVAL.ONE_MINUTE;
  private windowSize: number = DEFAULT_WINDOW_SIZE;

  private data: Record<number, MetricsData> = {};
  private componentCounts: Record<number, Record<string, number>> = {};
  private statusCodeCounts: Record<number, Record<string, number>> = {};
  private overall: Record<number, MetricValue> = {};

  constructor(private logger?: Logger) {}

  setup(
    interval: number = METRIC_INTERVAL.ONE_MINUTE,
    windowSize: number = DEFAULT_WINDOW_SIZE
  ): MetricsServiceSetup {
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
        this.data[currInterval] = {};1
        this.overall[currInterval] = { duration_in_milliseconds: 0, count: 0 };
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
        this.data[currInterval][componentName][action][statusCode] = { duration_in_milliseconds: 0, count: 0 };
        this.statusCodeCounts[currInterval][statusCode] = 0;
      }

      const { duration_in_milliseconds, count } = this.data[currInterval][componentName][action][statusCode];
      this.data[currInterval][componentName][action][statusCode] = {
        duration_in_milliseconds: duration_in_milliseconds + value,
        count: count + 1,
      };

      this.componentCounts[currInterval][componentName]++;
      this.statusCodeCounts[currInterval][statusCode]++;

      this.overall[currInterval].duration_in_milliseconds += value;
      this.overall[currInterval].count++;
    };

    const getStats = (): Stats => {
      const prevInterval = Math.floor(Date.now() / this.interval) - 1;
      const data = { ...this.data[prevInterval] } || {};
      const overall = { ...this.overall[prevInterval] } || {};

      let requestsPerSecond = 0,
        responseTimeAvg = 0;

      if (Object.keys(overall).length !== 0 && overall.count !== 0) {
        responseTimeAvg = overall.duration_in_milliseconds / overall.count;
        requestsPerSecond = overall.count / (this.interval / 1000);
      }

      return {
        data,
        overall: {
          response_time_avg: responseTimeAvg,
          requests_per_second: requestsPerSecond,
        },
        count_per_component: { ...this.componentCounts[prevInterval] } || {},
        count_per_status_code: { ...this.statusCodeCounts[prevInterval] } || {},
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
