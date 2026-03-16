/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { CoreStart } from '../../../../../../../src/core/public';
import { ServiceEndpoints } from '../../../../common';
import { combineResults, toExperiment, toExperimentSchedule } from '../../../types/index';

export class ExperimentService {
  constructor(private http: CoreStart['http']) {}

  private dsOpts(dataSourceId?: string | null) {
    return dataSourceId ? { query: { dataSourceId } } : undefined;
  }

  async getExperiments(dataSourceId?: string | null) {
    const opts = this.dsOpts(dataSourceId);
    const response = opts
      ? await this.http.get(ServiceEndpoints.Experiments, opts)
      : await this.http.get(ServiceEndpoints.Experiments);
    return combineResults(
      ...(response ? response.hits.hits.map((hit) => toExperiment(hit._source)) : [])
    );
  }

  async getExperiment(id: string, dataSourceId?: string | null) {
    const url = `${ServiceEndpoints.Experiments}/${id}`;
    const opts = this.dsOpts(dataSourceId);
    return opts ? await this.http.get(url, opts) : await this.http.get(url);
  }

  async createExperiment(data: any, dataSourceId?: string | null) {
    const opts: any = { body: JSON.stringify(data) };
    if (dataSourceId) {
      opts.query = { dataSourceId };
    }
    return await this.http.post(ServiceEndpoints.Experiments, opts);
  }

  async deleteExperiment(id: string, dataSourceId?: string | null) {
    const url = `${ServiceEndpoints.Experiments}/${id}`;
    const opts = this.dsOpts(dataSourceId);
    return opts ? await this.http.delete(url, opts) : await this.http.delete(url);
  }

  async getScheduledExperiments(dataSourceId?: string | null) {
    const opts = this.dsOpts(dataSourceId);
    const response = opts
      ? await this.http.get(ServiceEndpoints.ScheduledExperiments, opts)
      : await this.http.get(ServiceEndpoints.ScheduledExperiments);
    return combineResults(
      ...(response ? response.hits.hits.map((hit) => toExperimentSchedule(hit._source)) : [])
    );
  }

  async getScheduledExperiment(id: string, dataSourceId?: string | null) {
    const url = `${ServiceEndpoints.ScheduledExperiments}/${id}`;
    const opts = this.dsOpts(dataSourceId);
    const response = opts ? await this.http.get(url, opts) : await this.http.get(url);
    return response ? response.hits.hits.map((hit) => toExperimentSchedule(hit._source))[0] : null;
  }

  async createScheduledExperiment(data: any, dataSourceId?: string | null) {
    const opts: any = { body: JSON.stringify(data) };
    if (dataSourceId) {
      opts.query = { dataSourceId };
    }
    return await this.http.post(ServiceEndpoints.ScheduledExperiments, opts);
  }

  async deleteScheduledExperiment(id: string, dataSourceId?: string | null) {
    const url = `${ServiceEndpoints.ScheduledExperiments}/${id}`;
    const opts = this.dsOpts(dataSourceId);
    return opts ? await this.http.delete(url, opts) : await this.http.delete(url);
  }
}
