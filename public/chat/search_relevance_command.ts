/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  CoreSetup,
  ALL_USE_CASE_ID,
  SEARCH_USE_CASE_ID,
  isNavGroupInFeatureConfigs,
} from '../../../../src/core/public';
import { ChatPluginSetup } from '../../../../src/plugins/chat/public';
import { PLUGIN_ID } from '../../common';

export const registerSearchRelevanceCommand = (
  core: CoreSetup,
  chatSetup?: ChatPluginSetup
): (() => void) | undefined => {
  return chatSetup?.commandRegistry?.registerCommand({
    command: 'srw',
    description: 'Navigate to Search Relevance Workbench',
    usage: '/srw',
    handler: async (): Promise<string> => {
      const [coreStart] = await core.getStartServices();
      const currentWorkspace = core.workspaces.currentWorkspace$.getValue();
      const features = currentWorkspace?.features ?? [];
      const hasSearchFeature =
        isNavGroupInFeatureConfigs(SEARCH_USE_CASE_ID, features) ||
        isNavGroupInFeatureConfigs(ALL_USE_CASE_ID, features);

      if (!hasSearchFeature) {
        coreStart.notifications.toasts.addInfo(
          'Please switch to a workspace with the Search use case to use Search Relevance.'
        );
        return '';
      }

      coreStart.application.navigateToApp(PLUGIN_ID);
      return '';
    },
  });
};
