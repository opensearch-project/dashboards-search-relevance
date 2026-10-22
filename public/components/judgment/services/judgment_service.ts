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

  /**
   * Fetch existing LLM judgments so their ratings can be reused when creating a new judgment.
   */
  async fetchLlmJudgments(dataSourceId?: string | null): Promise<ComboBoxOption[]> {
    const opts = this.queryOpts(dataSourceId);
    const response = opts
      ? await this.http.get(ServiceEndpoints.Judgments, opts)
      : await this.http.get(ServiceEndpoints.Judgments);
    return response.hits.hits
      .filter((judgment: any) => judgment._source.type === 'LLM_JUDGMENT')
      .map((judgment: any) => ({
        label: judgment._source.name ? `${judgment._source.name} (${judgment._id})` : judgment._id,
        value: judgment._id,
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

  /**
   * Manually update one or more ratings on an existing LLM judgment in place.
   *
   * Sends PUT judgments/{id} with the same `judgmentRatings` shape the judgment is stored in.
   * The backend applies only the listed (query, docId) pairs as a partial merge (all-or-none),
   * recomputes the summary counts, and moves any newly-rated docs out of the failures list.
   * Only LLM_JUDGMENT judgments are editable; the backend rejects others with 400, returns 404
   * for an unknown judgment/query, and 409 while the judgment is PROCESSING/RETRYING or if the
   * document changed since it was read (optimistic-concurrency conflict).
   */
  async updateRatings(
    id: string,
    edits: Array<{ query: string; docId: string; rating: string }>,
    dataSourceId?: string | null
  ): Promise<void> {
    // Group the flat edits by query into the { judgmentRatings: [{ query, ratings: [...] }] } shape.
    const byQuery = new Map<string, Array<{ docId: string; rating: string }>>();
    edits.forEach(({ query, docId, rating }) => {
      const ratings = byQuery.get(query) ?? [];
      ratings.push({ docId, rating });
      byQuery.set(query, ratings);
    });
    const judgmentRatings = Array.from(byQuery.entries()).map(([query, ratings]) => ({
      query,
      ratings,
    }));

    const opts: any = { body: JSON.stringify({ judgmentRatings }) };
    if (dataSourceId) {
      opts.query = { dataSourceId };
    }
    await this.http.put(`${ServiceEndpoints.Judgments}/${id}`, opts);
  }
}
