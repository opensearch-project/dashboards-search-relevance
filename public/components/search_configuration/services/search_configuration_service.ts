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

  /**
   * Fetches available indexes from the API
   * @returns Promise with index options
   */
  async fetchIndexes(): Promise<Array<{ label: string; value: string }>> {
    const res = await this.http.get(ServiceEndpoints.GetIndexes);
    return res
      .filter((index: DocumentsIndex) => !index.index.startsWith('.'))
      .map((index: DocumentsIndex) => ({
        label: index.index,
        value: index.uuid,
      }));
  }

  /**
   * Fetches available search pipelines from the API
   * @returns Promise with pipeline options
   */
  async fetchPipelines(): Promise<Array<{ label: string }>> {
    const response = await this.http.get(ServiceEndpoints.GetPipelines);
    return Object.keys(response).map((pipelineId) => ({
      label: pipelineId,
    }));
  }

  /**
   * Creates a new search configuration
   * @param data The search configuration data
   * @returns Promise with the API response
   */
  async createSearchConfiguration(data: SearchConfigurationData): Promise<any> {
    return await this.http.put(ServiceEndpoints.SearchConfigurations, {
      body: JSON.stringify(data),
    });
  }

  /**
   * Validates a search query against the API
   * @param requestBody The validation request body
   * @returns Promise with the validation results
   */
  async validateSearchQuery(requestBody: any): Promise<any> {
    const response = await this.http.post(ServiceEndpoints.GetSingleSearchResults, {
      body: JSON.stringify(requestBody),
    });

    return response.result;
  }
}
