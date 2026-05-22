/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { CoreSetup } from '../../../../src/core/public';
import { ChatPluginSetup } from '../../../../src/plugins/chat/public';
import { PLUGIN_ID } from '../../common';

export const registerSearchRelevanceCommand = (
  core: CoreSetup,
  chatSetup?: ChatPluginSetup
): (() => void) | undefined => {
  return chatSetup?.commandRegistry?.registerCommand({
    command: 'search-relevance',
    description: 'Navigate to Search Relevance page',
    usage: '/search-relevance',
    handler: async (): Promise<string> => {
      const currentWorkspace = core.workspaces.currentWorkspace$.getValue();
      const workspaceName = currentWorkspace?.name ?? '';

      if (workspaceName !== 'Search') {
        const [coreStart] = await core.getStartServices();
        coreStart.notifications.toasts.addInfo(
          'Please switch to the "Search" workspace to use Search Relevance.'
        );
        return '';
      }

      const [coreStart] = await core.getStartServices();
      coreStart.application.navigateToApp(PLUGIN_ID);
      return '';
    },
  });
};
