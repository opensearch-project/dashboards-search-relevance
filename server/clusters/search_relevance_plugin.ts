/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { SEARCH_RELEVANCE_QUERY_SET_API } from '../../common';

/**
 * Register client actions representing search relevance plugin APIs.
 */
// eslint-disable-next-line import/no-default-export
export default function searchRelevancePlugin(Client: any, config: any, components: any) {
  const ca = components.clientAction.factory;

  Client.prototype.searchRelevance = components.clientAction.namespaceFactory();
  const searchRelevance = Client.prototype.searchRelevance.prototype;

  searchRelevance.createQuerySet = ca({
    url: {
      fmt: `${SEARCH_RELEVANCE_QUERY_SET_API}`,
    },
    method: 'POST',
  });

  searchRelevance.listQuerySets = ca({
    url: {
      fmt: `${SEARCH_RELEVANCE_QUERY_SET_API}/\${id}`,
      req: {
        id: {
          type: 'string',
          required: true,
        },
      },
    },
    method: 'GET',
  });
}
