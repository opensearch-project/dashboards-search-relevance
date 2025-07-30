/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { DataSourcePluginStart } from '../../../src/plugins/data_source/public/types';
import { NavigationPublicPluginStart } from '../../../src/plugins/navigation/public';
import { SharePluginStart } from '../../../src/plugins/share/public';

export interface SearchRelevancePluginSetup {
  getGreeting: () => string;
}
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface SearchRelevancePluginStart {}

export interface AppPluginStartDependencies {
  navigation: NavigationPublicPluginStart;
  dataSource: DataSourcePluginStart;
  share: SharePluginStart;
}
