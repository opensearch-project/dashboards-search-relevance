/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { i18n } from '@osd/i18n';
import {
  CoreSetup,
  ALL_USE_CASE_ID,
  SEARCH_USE_CASE_ID,
  isNavGroupInFeatureConfigs,
} from '../../../../src/core/public';
import { ChatPluginSetup } from '../../../../src/plugins/chat/public';
import { SlashCommandResult } from '../../../../src/plugins/chat/public/services/slash_commands';
import { PLUGIN_ID } from '../../common';

const getWelcomeMessage = () =>
  i18n.translate('searchRelevance.command.welcomeMessage', {
    defaultMessage: `Welcome to the OpenSearch Relevance Agent!

I'm your AI-powered search relevance tuning assistant. I help you identify relevance issues, generate data-driven tuning hypotheses, and validate improvements through automated experiments -- all through natural conversation. Whether you have UBI data or just want to optimize your search configurations, I can accelerate your relevance workflow from weeks to hours. I work alongside you as a human-in-the-loop system -- you stay in control while I handle the heavy lifting.

Here are some things you can ask me:
- "Analyze my most common queries"
- "What is my current search configurations"
- "Create a hypothesis to improve relevance for product searches and run an experiment to validate it"
- "Compare my current search configuration against a boosted-title variant using NDCG@10"
- "Help me set up a query set and judgment list for my e-commerce catalog"`,
  });

const hasSearchUseCase = (features: string[]): boolean =>
  isNavGroupInFeatureConfigs(SEARCH_USE_CASE_ID, features) ||
  isNavGroupInFeatureConfigs(ALL_USE_CASE_ID, features);

const createHandler = (core: CoreSetup) => async (args: string): Promise<SlashCommandResult> => {
  const currentWorkspace = core.workspaces.currentWorkspace$.getValue();
  const features = currentWorkspace?.features ?? [];

  if (!hasSearchUseCase(features)) {
    return {
      title: i18n.translate('searchRelevance.command.incompatibleWorkspaceTitle', {
        defaultMessage: 'Incompatible workspace type',
      }),
      localMessage: i18n.translate('searchRelevance.command.incompatibleWorkspaceMessage', {
        defaultMessage:
          'The /search-relevance command only works in Search or Analytics (all) workspaces. Please navigate to one and try again.',
      }),
    };
  }

  const [coreStart] = await core.getStartServices();
  coreStart.application.navigateToApp(PLUGIN_ID);

  const question = args.trim();
  if (question) {
    coreStart.chat.sendMessageWithWindow(question, [], { clearConversation: true });
    return '';
  }

  return { localMessage: getWelcomeMessage(), role: 'assistant' };
};

export const registerSearchRelevanceCommand = (
  core: CoreSetup,
  chatSetup?: ChatPluginSetup
): (() => void) | undefined => {
  if (!chatSetup?.commandRegistry) return undefined;

  const handler = createHandler(core);

  const unregister = chatSetup.commandRegistry.registerCommand({
    command: 'search-relevance',
    description: i18n.translate('searchRelevance.command.description', {
      defaultMessage: 'Tune search configurations in Search Relevance Workbench',
    }),
    usage: '/search-relevance <optional question>',
    hint: i18n.translate('searchRelevance.command.hint', {
      defaultMessage: 'Tune search configurations in Search Relevance Workbench',
    }),
    handler,
  });

  return () => {
    unregister?.();
  };
};
