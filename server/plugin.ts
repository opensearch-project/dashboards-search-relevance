/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  PluginInitializerContext,
  CoreSetup,
  CoreStart,
  Logger,
  Plugin,
  ILegacyClusterClient,
} from '../../../src/core/server';
import { defineRoutes } from './routes';

import { SearchRelevancePluginSetup, SearchRelevancePluginStart } from './types';

export class SearchRelevancePlugin
  implements Plugin<SearchRelevancePluginSetup, SearchRelevancePluginStart> {
  private readonly logger: Logger;
  constructor(initializerContext: PluginInitializerContext) {
    this.logger = initializerContext.logger.get();
  }

  public setup(core: CoreSetup) {
    this.logger.debug('SearchRelevance: Setup');
    const router = core.http.createRouter();

    const opensearchSearchRelevanceClient: ILegacyClusterClient = core.opensearch.legacy.createClient(
      'opensearch_search_relevance'
    );

    // @ts-ignore
    core.http.registerRouteHandlerContext('search_relevance_plugin', (context, request) => {
      return {
        logger: this.logger,
        relevancyWorkbenchClient: opensearchSearchRelevanceClient,
      };
    });

    // Register server side APIs
    defineRoutes({ router });

    return {};
  }

  public start(core: CoreStart) {
    this.logger.debug('SearchRelevance: Started');
    return {};
  }

  public stop() {}
}
