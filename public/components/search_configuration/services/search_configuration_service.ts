/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { ServiceEndpoints } from '../../../../common';
import { CoreStart } from '../../../../../../src/core/public';
import { DocumentsIndex } from '../../../types';

export interface SearchConfigurationData {
  name: string;
  index: string;
  query: string;
  searchPipeline?: string;
}

export class SearchConfigurationService {
  constructor(private readonly http: CoreStart['http']) {}

  private dsOpts(dataSourceId?: string | null) {
    return dataSourceId ? { query: { dataSourceId } } : undefined;
  }

  async fetchIndexes(dataSourceId?: string | null): Promise<Array<{ label: string; value: string }>> {
    const url = dataSourceId
      ? `${ServiceEndpoints.GetIndexes}/${dataSourceId}`
      : ServiceEndpoints.GetIndexes;
    const res = await this.http.get(url);
    return res
      .filter((index: DocumentsIndex) => !index.index.startsWith('.'))
      .map((index: DocumentsIndex) => ({
        label: index.index,
        value: index.uuid,
      }));
  }

  async fetchPipelines(dataSourceId?: string | null): Promise<Array<{ label: string }>> {
    const url = dataSourceId
      ? `${ServiceEndpoints.GetPipelines}/${dataSourceId}`
      : ServiceEndpoints.GetPipelines;
    const response = await this.http.get(url);
    return Object.keys(response).map((pipelineId) => ({
      label: pipelineId,
    }));
  }

  async getSearchConfigurations(dataSourceId?: string | null): Promise<any> {
    const opts = this.dsOpts(dataSourceId);
    return opts
      ? await this.http.get(ServiceEndpoints.SearchConfigurations, opts)
      : await this.http.get(ServiceEndpoints.SearchConfigurations);
  }

  async createSearchConfiguration(data: SearchConfigurationData, dataSourceId?: string | null): Promise<any> {
    const opts: any = { body: JSON.stringify(data) };
    if (dataSourceId) {
      opts.query = { dataSourceId };
    }
    return await this.http.put(ServiceEndpoints.SearchConfigurations, opts);
  }

  async validateSearchQuery(requestBody: any, dataSourceId?: string | null): Promise<any> {
    const opts: any = { body: JSON.stringify(requestBody) };
    if (dataSourceId) {
      opts.query = { dataSourceId };
    }
    const response = await this.http.post(ServiceEndpoints.GetSingleSearchResults, opts);
    return response.result;
  }
}
