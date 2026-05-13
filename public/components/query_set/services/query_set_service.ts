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
  constructor(private http: CoreStart['http']) {}

  async fetchUbiIndexes(dataSourceId?: string | null): Promise<Array<{ label: string; value: string }>> {
    const url = dataSourceId
      ? `${ServiceEndpoints.GetIndexesByPattern}/*ubi_queries*/${dataSourceId}`
      : `${ServiceEndpoints.GetIndexesByPattern}/*ubi_queries*`;
    const res = await this.http.get(url);
    return res.map((index: DocumentsIndex) => ({
      label: index.index,
      value: index.uuid,
    }));
  }

  async createQuerySet(data: QuerySetData, isManualInput: boolean, dataSourceId?: string | null): Promise<any> {
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

    const opts: any = {
      body: JSON.stringify(body),
      headers: { 'Content-Type': 'application/json' },
    };
    if (dataSourceId) {
      opts.query = { dataSourceId };
    }

    return this.http[method](endpoint, opts);
  }
}
