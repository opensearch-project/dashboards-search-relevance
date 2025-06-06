/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { i18n } from '@osd/i18n';
import { CoreSetup } from '../../../src/core/public';
import { SearchRelevancePluginSetup } from './types';
import { PLUGIN_ID } from '../common';
import { DEFAULT_NAV_GROUPS, AppCategory } from '../../../src/core/public';

const searchRelevance_category: Record<string, AppCategory & { group?: AppCategory }> = {
  evaluateSearch: {
    id: 'evaluateSearch',
    label: i18n.translate('core.ui.indexesNavList.label', {
      defaultMessage: 'Evaluate search',
    }),
    order: 3000,
  },
};

const titleForSearchRelevance = i18n.translate(
  'plugins.dashboards_search_relevance.nav.title.label',
  {
    defaultMessage: 'Search relevance',
  }
);

export function registerAllPluginNavGroups(core: CoreSetup<SearchRelevancePluginSetup>) {
  core.chrome.navGroup.addNavLinksToGroup(DEFAULT_NAV_GROUPS.search, [
    {
      id: PLUGIN_ID,
      category: searchRelevance_category.evaluateSearch, // change to Evaluate Search
      title: titleForSearchRelevance,
      showInAllNavGroup: true,
    },
  ]);
}
