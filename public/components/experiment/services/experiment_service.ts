/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { CoreStart } from '../../../../../../../src/core/public';
import { ServiceEndpoints } from '../../../../common';
import { combineResults, toExperiment } from '../../../types/index';

export class ExperimentService {
  constructor(private http: CoreStart['http']) {}

  async getExperiments() {
    const response = await this.http.get(ServiceEndpoints.Experiments);
    return combineResults(
      ...(response ? response.hits.hits.map((hit) => toExperiment(hit._source)) : [])
    );
  }

  async getExperiment(id: string) {
    return await this.http.get(`${ServiceEndpoints.Experiments}/${id}`);
  }

  async createExperiment(data: any) {
    return await this.http.post(ServiceEndpoints.Experiments, {
      body: JSON.stringify(data),
    });
  }

  async deleteExperiment(id: string) {
    return await this.http.delete(`${ServiceEndpoints.Experiments}/${id}`);
  }
}
