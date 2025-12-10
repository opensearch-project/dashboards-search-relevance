/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { CoreStart } from '../../../../../../core/public';
import { ServiceEndpoints } from '../../../../common';

export interface QuerySetData {
  name: string;
  description: string;
  sampling: string;
  querySetSize?: number;
  querySetQueries?: Array<{ queryText: string; referenceAnswer: string }>;
}

export class QuerySetService {
  constructor(private http: CoreStart['http']) {}

  async createQuerySet(data: QuerySetData, isManualInput: boolean, dataSourceId: string): Promise<any> {
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
        };

    const query = dataSourceId ? { dataSourceId: dataSourceId } : undefined;

    return this.http[method](endpoint, {
      body: JSON.stringify(body),
      headers: {
        'Content-Type': 'application/json',
      },
      ...(query && {query}),
    });
  }
}
