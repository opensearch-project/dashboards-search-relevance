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
  const icon = (
    <EuiIcon size="original" aria-label="compare search queries" type={compareQueriesIcon} />
  );

  const footer = (
    <EuiFlexGroup justifyContent="flexEnd">
      <EuiFlexItem grow={false}>
        <EuiButton
          size="s"
          onClick={() => {
            core.application.navigateToApp(PLUGIN_ID);
          }}
        >
          {i18n.translate('searchRelevanceDashboards.compareQueryCard.footer', {
            defaultMessage: 'Compare search results',
          })}
        </EuiButton>
      </EuiFlexItem>
    </EuiFlexGroup>
  );

  contentManagement.registerContentProvider({
    id: 'compare_query_card',
    getContent: () => ({
      id: 'compare_query',
      kind: 'card',
      order: 20,
      title: i18n.translate('searchRelevanceDashboards.compareQueryCard.title', {
        defaultMessage: 'Compare queries',
      }),
      description: i18n.translate('searchRelevanceDashboards.compareQueryCard.description', {
        defaultMessage:
          'The search comparison tool lets you compare the results of two different DSL queries applied to the same user query.',
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
