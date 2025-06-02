/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { EuiButton, EuiFlexGroup, EuiFlexItem, EuiIcon } from '@elastic/eui';
import { i18n } from '@osd/i18n';
import { PLUGIN_ID } from '../../../common';
import { ContentManagementPluginStart } from '../../../../../src/plugins/content_management/public';
import { CoreStart } from '../../../../../src/core/public';
import compareQueriesIcon from './icon.svg';

export const registerCompareQueryCard = (
  contentManagement: ContentManagementPluginStart,
  core: CoreStart
) => {
  const icon = <EuiIcon size="original" aria-label="search relevance" type={compareQueriesIcon} />;

  const footer = (
    <EuiFlexGroup justifyContent="flexEnd">
      <EuiFlexItem grow={false}>
        <EuiButton
          size="s"
          onClick={() => {
            core.application.navigateToApp(PLUGIN_ID);
          }}
        >
          {i18n.translate('searchRelevanceDashboards.searchRelevanceCard.footer', {
            defaultMessage: 'Search relevance',
          })}
        </EuiButton>
      </EuiFlexItem>
    </EuiFlexGroup>
  );

  contentManagement.registerContentProvider({
    id: 'search_relevance_card',
    getContent: () => ({
      id: 'search_relevance',
      kind: 'card',
      order: 20,
      title: i18n.translate('searchRelevanceDashboards.searchRelevanceCard.title', {
        defaultMessage: 'Search relevance',
      }),
      description: i18n.translate('searchRelevanceDashboards.searchRelevanceCard.description', {
        defaultMessage:
          'The search relevance tool lets you compare or evaluate the results of various DSL queries.',
      }),
      getIcon: () => icon,
      cardProps: {
        children: footer,
        layout: 'horizontal',
      },
    }),
    getTargetArea: () => 'search_overview/config_evaluate_search',
  });
};
