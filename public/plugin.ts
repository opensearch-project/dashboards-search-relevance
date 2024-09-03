/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { i18n } from '@osd/i18n';
import { AppMountParameters, CoreSetup, CoreStart, Plugin } from '../../../src/core/public';
import {
  DataSourcePluginSetup,
  DataSourcePluginStart,
} from '../../../src/plugins/data_source/public';
import { DataSourceManagementPluginSetup } from '../../../src/plugins/data_source_management/public';
import { PLUGIN_ID, PLUGIN_NAME } from '../common';
import {
  AppPluginStartDependencies,
  SearchRelevancePluginSetup,
  SearchRelevancePluginStart,
} from './types';
import { registerAllPluginNavGroups } from './plugin_nav';
import { ContentManagementPluginStart } from '../../../src/plugins/content_management/public';
import { registerCompareQueryCard } from './components/service_card/compare_query_card';

export interface SearchRelevancePluginSetupDependencies {
  dataSource: DataSourcePluginSetup;
  dataSourceManagement: DataSourceManagementPluginSetup;
}

export interface SearchRelevanceStartDependencies {
  dataSource: DataSourcePluginStart;
  contentManagement?: ContentManagementPluginStart;
}

export class SearchRelevancePlugin
  implements Plugin<SearchRelevancePluginSetup, SearchRelevancePluginStart> {
  public setup(
    core: CoreSetup,
    { dataSource, dataSourceManagement }: SearchRelevancePluginSetupDependencies
  ): SearchRelevancePluginSetup {
    // Register an application into the side navigation menu
    core.application.register({
      id: PLUGIN_ID,
      title: PLUGIN_NAME,
      category: {
        id: 'opensearch',
        label: 'OpenSearch Plugins',
        order: 2000,
      },
      async mount(params: AppMountParameters) {
        // Load application bundle
        const { renderApp } = await import('./application');
        // Get start services as specified in opensearch_dashboards.json
        const [coreStart, depsStart] = await core.getStartServices();
        // Render the application
        return renderApp(
          coreStart,
          depsStart as AppPluginStartDependencies,
          params,
          dataSourceManagement
        );
      },
    });
    registerAllPluginNavGroups(core);
    // Return methods that should be available to other plugins
    return {
      getGreeting() {
        return i18n.translate('searchRelevance.greetingText', {
          defaultMessage: 'Hello from {name}!',
          values: {
            name: PLUGIN_NAME,
          },
        });
      },
    };
  }

  public start(
    core: CoreStart,
    { dataSource, contentManagement }: SearchRelevanceStartDependencies
  ): SearchRelevancePluginStart {
    if (contentManagement) {
      registerCompareQueryCard(contentManagement, core);
    }
    return {};
  }

  public stop() {}
}
