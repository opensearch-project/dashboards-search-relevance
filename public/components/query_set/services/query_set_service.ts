/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { CoreStart } from '../../../../../../core/public';
import { ServiceEndpoints } from '../../../../common';
import { DocumentsIndex } from '../../../types';

export interface QuerySetData {
  name: string;
  description: string;
  sampling: string;
  querySetSize?: number;
  querySetQueries?: Array<{ queryText: string; referenceAnswer: string }>;
  ubiQueriesIndex?: string;
}

export class QuerySetService {
  constructor(private http: CoreStart['http']) { }


  /**
   * Fetches available ubi indexes from the API
   * @returns Promise with index options
   */
  async fetchUbiIndexes(): Promise<Array<{ label: string; value: string }>> {
    const res = await this.http.get(`${ServiceEndpoints.GetIndexesByPattern}/*ubi_queries*`);
    return res.map((index: DocumentsIndex) => ({
      label: index.index,
      value: index.uuid,
    }));
  }

  async createQuerySet(data: QuerySetData, isManualInput: boolean): Promise<any> {
    const endpoint = ServiceEndpoints.QuerySets;
    const method = isManualInput ? 'put' : 'post';

    const body = isManualInput
      ? {
        name: data.name,
        description: data.description,
        sampling: 'manual',
        querySetQueries: data.querySetQueries,
      }
      : {
        name: data.name,
        description: data.description,
        sampling: data.sampling,
        querySetSize: data.querySetSize,
        ...(data.ubiQueriesIndex && { ubiQueriesIndex: data.ubiQueriesIndex }),
      };

    console.log('Sending QuerySet Request Body:', JSON.stringify(body, null, 2));

    return this.http[method](endpoint, {
      body: JSON.stringify(body),
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}
