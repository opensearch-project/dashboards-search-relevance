/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { ServiceEndpoints } from '../../../../common';
import { ComboBoxOption, ModelOption, JudgmentFormData } from '../types';
import { DocumentsIndex } from '../../../types';

export class JudgmentService {
  constructor(private http: any) {}

  private queryOpts(dataSourceId?: string | null) {
    return dataSourceId ? { query: { dataSourceId } } : undefined;
  }

  async fetchUbiIndexes(dataSourceId?: string | null): Promise<Array<{ label: string; value: string }>> {
    const url = dataSourceId
      ? `${ServiceEndpoints.GetIndexesByPattern}/*ubi_events*/${dataSourceId}`
      : `${ServiceEndpoints.GetIndexesByPattern}/*ubi_events*`;
    const res = await this.http.get(url);
    return res.map((index: DocumentsIndex) => ({
      label: index.index,
      value: index.uuid,
    }));
  }

  async fetchQuerySets(dataSourceId?: string | null): Promise<ComboBoxOption[]> {
    const opts = this.queryOpts(dataSourceId);
    const response = opts
      ? await this.http.get(ServiceEndpoints.QuerySets, opts)
      : await this.http.get(ServiceEndpoints.QuerySets);
    return response.hits.hits.map((qs: any) => ({
      label: qs._source.name,
      value: qs._source.id,
    }));
  }

  async fetchQuerySetById(id: string, dataSourceId?: string | null): Promise<any> {
    const url = `${ServiceEndpoints.QuerySets}/${id}`;
    const opts = this.queryOpts(dataSourceId);
    const response = opts
      ? await this.http.get(url, opts)
      : await this.http.get(url);
    return response._source;
  }

  async fetchSearchConfigs(dataSourceId?: string | null): Promise<ComboBoxOption[]> {
    const opts = this.queryOpts(dataSourceId);
    const response = opts
      ? await this.http.get(ServiceEndpoints.SearchConfigurations, opts)
      : await this.http.get(ServiceEndpoints.SearchConfigurations);
    return response.hits.hits.map((sc: any) => ({
      label: sc._source.name,
      value: sc._source.id,
    }));
  }

  async fetchModels(dataSourceId?: string | null): Promise<ModelOption[]> {
    const url = dataSourceId
      ? `${ServiceEndpoints.GetModels}/${dataSourceId}`
      : ServiceEndpoints.GetModels;
    const response = await this.http.post(url, { body: '{}' });
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

  async createJudgment(data: JudgmentFormData, dataSourceId?: string | null): Promise<void> {
    const opts: any = { body: JSON.stringify(data) };
    if (dataSourceId) {
      opts.query = { dataSourceId };
    }
    await this.http.put(ServiceEndpoints.Judgments, opts);
  }
}
