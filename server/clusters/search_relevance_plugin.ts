/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  SEARCH_RELEVANCE_EXPERIMENT_API,
  SEARCH_RELEVANCE_QUERY_SET_API,
  SEARCH_RELEVANCE_SEARCH_CONFIGURATION_API,
} from '../../common';

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

  searchRelevance.getQuerySet = ca({
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

  searchRelevance.listQuerySets = ca({
    url: {
      fmt: `${SEARCH_RELEVANCE_QUERY_SET_API}`,
    },
    method: 'GET',
  });

  searchRelevance.deleteQuerySet = ca({
    url: {
      fmt: `${SEARCH_RELEVANCE_QUERY_SET_API}/\${id}`,
      req: {
        id: {
          type: 'string',
          required: true,
        },
      },
    },
    method: 'DELETE',
  });

  searchRelevance.createSearchConfig = ca({
    url: {
      fmt: `${SEARCH_RELEVANCE_SEARCH_CONFIGURATION_API}`,
    },
    method: 'POST',
  });

  searchRelevance.getSearchConfig = ca({
    url: {
      fmt: `${SEARCH_RELEVANCE_SEARCH_CONFIGURATION_API}/\${id}`,
      req: {
        id: {
          type: 'string',
          required: true,
        },
      },
    },
    method: 'GET',
  });

  searchRelevance.listSearchConfigs = ca({
    url: {
      fmt: `${SEARCH_RELEVANCE_SEARCH_CONFIGURATION_API}`,
    },
    method: 'GET',
  });

  searchRelevance.deleteSearchConfig = ca({
    url: {
      fmt: `${SEARCH_RELEVANCE_SEARCH_CONFIGURATION_API}/\${id}`,
      req: {
        id: {
          type: 'string',
          required: true,
        },
      },
    },
    method: 'DELETE',
  });

  searchRelevance.createExperiment = ca({
    url: {
      fmt: `${SEARCH_RELEVANCE_EXPERIMENT_API}`,
    },
    method: 'POST',
  });

  searchRelevance.getExperiment = ca({
    url: {
      fmt: `${SEARCH_RELEVANCE_EXPERIMENT_API}/\${id}`,
      req: {
        id: {
          type: 'string',
          required: true,
        },
      },
    },
    method: 'GET',
  });

  searchRelevance.listExperiments = ca({
    url: {
      fmt: `${SEARCH_RELEVANCE_EXPERIMENT_API}`,
    },
    method: 'GET',
  });

  searchRelevance.deleteExperiment = ca({
    url: {
      fmt: `${SEARCH_RELEVANCE_EXPERIMENT_API}/\${id}`,
      req: {
        id: {
          type: 'string',
          required: true,
        },
      },
    },
    method: 'DELETE',
  });
}
