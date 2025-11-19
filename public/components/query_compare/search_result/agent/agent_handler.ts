/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { CoreStart } from '../../../../../../../src/core/public';
import { SearchResults } from '../../../../types/index';
import { ServiceEndpoints } from '../../../../../common';

export class AgentHandler {
  private http: CoreStart['http'];

  constructor(http: CoreStart['http']) {
    this.http = http;
  }

  isAgenticQuery(jsonQuery: any): boolean {
    return !!(jsonQuery?.query?.agentic && typeof jsonQuery.query.agentic === 'object');
  }

  async performAgenticSearch(requestBody: any, dataSourceId: string): Promise<any> {
    return await this.http.post(ServiceEndpoints.GetSearchResults, {
      body: JSON.stringify({
        query1: requestBody,
        dataSourceId1: dataSourceId,
      }),
    });
  }

  hasAgentInfo(queryResult: SearchResults): boolean {
    return !!(queryResult?.ext?.agent_steps_summary ||
      queryResult?.ext?.memory_id ||
      queryResult?.ext?.dsl_query);
  }

  getAgentStepsSummary(queryResult: SearchResults): string | undefined {
    return queryResult?.ext?.agent_steps_summary;
  }

  getMemoryId(queryResult: SearchResults): string | undefined {
    return queryResult?.ext?.memory_id;
  }

  getDslQuery(queryResult: SearchResults): string | undefined {
    return queryResult?.ext?.dsl_query;
  }
}