/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { Observable } from 'rxjs';
import { first } from 'rxjs/operators';

import {
  PluginInitializerContext,
  CoreSetup,
  CoreStart,
  IContextProvider,
  Logger,
  Plugin,
  ILegacyClusterClient,
  RequestHandler,
} from '../../../src/core/server';
import { defineRoutes } from './routes';

import { MetricsService, MetricsServiceSetup } from './metrics/metrics_service';
import { SearchRelevancePluginConfigType } from '../config';
import { SearchRelevancePluginSetup, SearchRelevancePluginStart } from './types';

export class SearchRelevancePlugin
  implements Plugin<SearchRelevancePluginSetup, SearchRelevancePluginStart>
{
  private readonly config$: Observable<SearchRelevancePluginConfigType>;
  private readonly logger: Logger;
  private metricsService: MetricsService;

  constructor(private initializerContext: PluginInitializerContext) {
    this.config$ = this.initializerContext.config.create<SearchRelevancePluginConfigType>();
    this.logger = this.initializerContext.logger.get();
    this.metricsService = new MetricsService(this.logger.get('metrics-service'));
  }

  public async setup(core: CoreSetup) {
    this.logger.debug('SearchRelevance: Setup');

    const config: SearchRelevancePluginConfigType = await this.config$.pipe(first()).toPromise();

    const metricsService: MetricsServiceSetup = this.metricsService.setup(
      config.metrics.refreshTime
    );

    const router = core.http.createRouter();

    const opensearchSearchRelevanceClient: ILegacyClusterClient =
      core.opensearch.legacy.createClient('opensearch_search_relevance');

    // @ts-ignore
    core.http.registerRouteHandlerContext('searchRelevance', (context, request) => {
      return {
        logger: this.logger,
        relevancyWorkbenchClient: opensearchSearchRelevanceClient,
        metricsService: metricsService,
      };
    });

    // Register server side APIs
    defineRoutes(router);

    return {};
  }

  public start(core: CoreStart) {
    this.logger.debug('SearchRelevance: Started');
    return {};
  }

  public stop() {}
}
