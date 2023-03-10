/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { PluginConfigDescriptor, PluginInitializerContext } from '../../../src/core/server';
import { SearchRelevancePlugin } from './plugin';
import { configSchema, SearchRelevancePluginConfigType } from '../config';

export const config: PluginConfigDescriptor<SearchRelevancePluginConfigType> = {
  schema: configSchema,
};

export function plugin(initializerContext: PluginInitializerContext) {
  return new SearchRelevancePlugin(initializerContext);
}

export { SearchRelevancePluginSetup, SearchRelevancePluginStart } from './types';
