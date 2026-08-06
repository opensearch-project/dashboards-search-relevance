/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { CoreStart } from '../../../../../../../src/core/public';
import { ServiceEndpoints } from '../../../../../common';

export class SearchHandler {
  constructor(private http: CoreStart['http']) {}

  async performSearch(requestBody: any, dataSourceId: string) {
    return this.http.post(ServiceEndpoints.GetSearchResults, {
      body: JSON.stringify({
        query: requestBody,
        dataSourceId,
      }),
    });
  }

  async performDualSearch(
    requestBody1: any,
    requestBody2: any,
    dataSourceId1: string,
    dataSourceId2: string
  ) {
    const [res1, res2] = await Promise.all([
      this.performSearch(requestBody1, dataSourceId1),
      this.performSearch(requestBody2, dataSourceId2),
    ]);
    return { result1: res1.result, result2: res2.result, errorMessage1: res1.errorMessage, errorMessage2: res2.errorMessage };
  }
}
