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
import { DataSourceAttributes } from '../../../../src/plugins/data_source/common/data_sources';
import { ChatPluginSetup } from '../../../../src/plugins/chat/public';
import { SlashCommandResult } from '../../../../src/plugins/chat/public/services/slash_commands';
import { PLUGIN_ID } from '../../common';
import { isSupportedSearchRelevanceDataSource } from '../components/common/datasource_utils';

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

/**
 * Whether the workspace has a data source the Workbench can use, applying the selector's filter
 * (non-AnalyticEngine, compatible version). MDS off or a visible local cluster counts as usable; a
 * lookup failure fails open.
 */
const hasUsableDataSource = async (
  core: CoreSetup,
  dataSourceEnabled: boolean,
  hideLocalCluster: boolean
): Promise<boolean> => {
  if (!dataSourceEnabled || !hideLocalCluster) return true;
  try {
    const [coreStart] = await core.getStartServices();
    const { savedObjects } = await coreStart.savedObjects.client.find<DataSourceAttributes>({
      type: 'data-source',
      perPage: 10000,
      fields: ['dataSourceEngineType', 'dataSourceVersion'],
    });
    return savedObjects.some((dataSource) => isSupportedSearchRelevanceDataSource(dataSource));
  } catch {
    return true;
  }
};

const createHandler =
  (core: CoreSetup, dataSourceEnabled: boolean, hideLocalCluster: boolean) =>
  async (args: string): Promise<SlashCommandResult> => {
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

    // Search relevance tuning relies on DSL, which AnalyticEngine data sources do not support. When
    // no usable (non-AE, compatible) data source is available, report it instead of navigating.
    if (!(await hasUsableDataSource(core, dataSourceEnabled, hideLocalCluster))) {
      return {
        title: i18n.translate('searchRelevance.command.noSupportedDataSourceTitle', {
          defaultMessage: 'Unsupported data source',
        }),
        localMessage: i18n.translate('searchRelevance.command.noSupportedDataSourceMessage', {
          defaultMessage:
            'No available data source supports search relevance tuning. Connect a compatible data source and try again.',
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
  chatSetup?: ChatPluginSetup,
  dataSourceEnabled: boolean = false,
  hideLocalCluster: boolean = false
): (() => void) | undefined => {
  if (!chatSetup?.commandRegistry) return undefined;

  const handler = createHandler(core, dataSourceEnabled, hideLocalCluster);

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
