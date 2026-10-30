/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { i18n } from '@osd/i18n';
import {
  StarterSuggestionItem,
  StarterSuggestionsPluginSetup,
  StarterSuggestionsRegistration,
} from '../../../../src/plugins/starter_suggestions/public';
import { PLUGIN_ID } from '../../common';

const getSearchRelevanceStarterSuggestions = (): StarterSuggestionItem[] => [
  {
    id: 'compareSearchConfigurations',
    icon: 'visBarVerticalStacked',
    iconColor: 'primary',
    text: i18n.translate('searchRelevance.starterSuggestions.compareSearchConfigurations.text', {
      defaultMessage: 'Compare two search configurations',
    }),
    prompt: i18n.translate(
      'searchRelevance.starterSuggestions.compareSearchConfigurations.prompt',
      {
        defaultMessage: 'Help me set up a query set comparison between two search configurations',
      }
    ),
  },
  {
    id: 'evaluateSearchQuality',
    icon: 'starFilled',
    iconColor: 'warning',
    text: i18n.translate('searchRelevance.starterSuggestions.evaluateSearchQuality.text', {
      defaultMessage: 'Evaluate search quality',
    }),
    prompt: i18n.translate('searchRelevance.starterSuggestions.evaluateSearchQuality.prompt', {
      defaultMessage: 'How do I evaluate my search quality using NDCG or MAP metrics?',
    }),
  },
  {
    id: 'createQuerySet',
    icon: 'searchProfilerApp',
    iconColor: 'accent',
    text: i18n.translate('searchRelevance.starterSuggestions.createQuerySet.text', {
      defaultMessage: 'Create a query set',
    }),
    prompt: i18n.translate('searchRelevance.starterSuggestions.createQuerySet.prompt', {
      defaultMessage: 'Help me create a query set for search relevance evaluation',
    }),
  },
];

export function registerSearchRelevanceStarterSuggestions(
  starterSuggestions: StarterSuggestionsPluginSetup
): StarterSuggestionsRegistration {
  return starterSuggestions.registerProvider({
    id: PLUGIN_ID,
    appId: PLUGIN_ID,
    getSuggestions: getSearchRelevanceStarterSuggestions,
  });
}
