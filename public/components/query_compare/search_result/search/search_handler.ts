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
        query1: requestBody,
        dataSourceId1: dataSourceId,
      }),
    });
  }

  async performDualSearch(requestBody1: any, requestBody2: any, dataSourceId1: string, dataSourceId2: string) {
    return this.http.post(ServiceEndpoints.GetSearchResults, {
      body: JSON.stringify({
        query1: requestBody1,
        query2: requestBody2,
        dataSourceId1: dataSourceId1,
        dataSourceId2: dataSourceId2,
      }),
    });
  }
}
