/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { DEFAULT_HEADERS } from '../../common';
import searchRelevancePlugin from './search_relevance_plugin';

export function createSearchRelevanceCluster(core: any, globalConfig: any) {
  const { customHeaders, ...rest } = globalConfig.opensearch;
  return core.opensearch.legacy.createClient('searchRelevance', {
    plugins: [searchRelevancePlugin],
    // Currently we are overriding any headers with our own since we explicitly required User-Agent to be OpenSearch Dashboards
    // for integration with our backend plugin.
    customHeaders: { ...customHeaders, ...DEFAULT_HEADERS },
    ...rest,
  });
}
