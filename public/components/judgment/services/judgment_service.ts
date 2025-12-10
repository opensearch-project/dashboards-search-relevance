/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { ServiceEndpoints } from '../../../../common';
import { ComboBoxOption, ModelOption, JudgmentFormData } from '../types';

export class JudgmentService {
  constructor(private http: any) {}

  async fetchQuerySets(): Promise<ComboBoxOption[]> {
    const response = await this.http.get(ServiceEndpoints.QuerySets);
    return response.hits.hits.map((qs: any) => ({
      label: qs._source.name,
      value: qs._source.id,
    }));
  }

  async fetchSearchConfigs(): Promise<ComboBoxOption[]> {
    const response = await this.http.get(ServiceEndpoints.SearchConfigurations);
    return response.hits.hits.map((sc: any) => ({
      label: sc._source.name,
      value: sc._source.id,
    }));
  }

  async fetchModels(): Promise<ModelOption[]> {
    const response = await this.http.post(ServiceEndpoints.GetModels);
    return response.hits.hits
      .filter(
        (model: any) =>
          model._source.algorithm === 'REMOTE' && model._source.model_state === 'DEPLOYED'
      )
      .map((model: any) => ({
        label: model._source.name,
        value: model._id,
        state: model._source.model_state,
        algorithm: model._source.algorithm,
      }));
  }

  async createJudgment(data: JudgmentFormData, dataSourceId?: string): Promise<void> {
    const query = dataSourceId ? { dataSourceId: dataSourceId } : undefined;
    
    await this.http.put(ServiceEndpoints.Judgments, {
      body: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/json',
      },
      ...(query && { query }),
    });
  }
}
