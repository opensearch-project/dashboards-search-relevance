/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { Observable } from 'rxjs';
import { first } from 'rxjs/operators';

import { schema } from '@osd/config-schema';
import {
  CoreSetup,
  CoreStart,
  ILegacyClusterClient,
  Logger,
  Plugin,
  PluginInitializerContext,
} from '../../../src/core/server';
import { defineRoutes, registerSearchRelevanceRoutes } from './routes';

import { DataSourcePluginSetup } from '../../../src/plugins/data_source/server/types';
import { DataSourceManagementPlugin } from '../../../src/plugins/data_source_management/public/plugin';
import { SharePluginStart } from '../../../src/plugins/share/public';
import { SearchRelevancePluginConfigType } from '../config';
import { MetricsService, MetricsServiceSetup } from './metrics/metrics_service';
import { SearchRelevancePluginSetup, SearchRelevancePluginStart } from './types';
import { SEARCH_RELEVANCE_EXPERIMENTAL_WORKBENCH_UI_EXPERIENCE_ENABLED } from '../common';
import { registerMLRoutes } from './routes/ml_route_service';

export interface SearchRelevancePluginSetupDependencies {
  dataSourceManagement: ReturnType<DataSourceManagementPlugin['setup']>;
  dataSource: DataSourcePluginSetup;
  share: SharePluginStart;
}

export class SearchRelevancePlugin
  implements Plugin<SearchRelevancePluginSetup, SearchRelevancePluginStart> {
  private readonly config$: Observable<SearchRelevancePluginConfigType>;
  private readonly logger: Logger;
  private metricsService: MetricsService;

  constructor(private initializerContext: PluginInitializerContext) {
    this.config$ = this.initializerContext.config.create<SearchRelevancePluginConfigType>();
    this.logger = this.initializerContext.logger.get();
    this.metricsService = new MetricsService(this.logger.get('metrics-service'));
  }

  public async setup(core: CoreSetup, { dataSource }: SearchRelevancePluginSetupDependencies) {
    const dataSourceEnabled = !!dataSource;
    this.logger.debug('SearchRelevance: Setup');

    core.uiSettings.register({
      [SEARCH_RELEVANCE_EXPERIMENTAL_WORKBENCH_UI_EXPERIENCE_ENABLED]: {
        name: 'Experimental Search Relevance Workbench',
        value: false,
        description: 'Whether to opt-in the experimental search relevance workbench feature',
        schema: schema.boolean(),
        category: ['search relevance'],
      },
    });

    const config: SearchRelevancePluginConfigType = await this.config$.pipe(first()).toPromise();

    const metricsService: MetricsServiceSetup = this.metricsService.setup(
      config.metrics.metricInterval,
      config.metrics.windowSize
    );

    const router = core.http.createRouter();

    let opensearchSearchRelevanceClient: ILegacyClusterClient | undefined = undefined;
    opensearchSearchRelevanceClient = core.opensearch.legacy.createClient(
      'opensearch_search_relevance'
    );

    // @ts-ignore
    core.http.registerRouteHandlerContext('searchRelevance', (context, request) => {
      return {
        logger: this.logger,
        relevancyWorkbenchClient: opensearchSearchRelevanceClient,
        metricsService,
      };
    });

    // Register server side APIs
    defineRoutes(router, core.opensearch, dataSourceEnabled);
    registerSearchRelevanceRoutes(router);
    registerMLRoutes(router, dataSourceEnabled);

    return {};
  }

  public start(core: CoreStart) {
    this.logger.debug('SearchRelevance: Started');
    return {};
  }

  public stop() {}
}
