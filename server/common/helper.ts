/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  ILegacyClusterClient,
  OpenSearchDashboardsRequest,
  RequestHandlerContext,
} from '../../../../src/core/server';

export function getClientBasedOnDataSource(
  context: RequestHandlerContext,
  dataSourceEnabled: boolean,
  request: OpenSearchDashboardsRequest,
  dataSourceId: string,
  client: ILegacyClusterClient
): (endpoint: string, clientParams?: Record<string, any>) => any {
  if (dataSourceEnabled && dataSourceId && dataSourceId.trim().length != 0) {
    // client for remote cluster
    return context.dataSource.opensearch.legacy.getClient(dataSourceId).callAPI;
  } else {
    // fall back to default local cluster
    return client.asScoped(request).callAsCurrentUser;
  }
}
