/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { EuiTab, EuiTabs } from '@elastic/eui';
import { useHistory, useLocation } from 'react-router-dom';
import { reactRouterNavigate } from '../../../../../src/plugins/opensearch_dashboards_react/public';
import { Routes } from '../../../common';
import './workbench_navigation.scss';

const sections = [
  { name: 'Experiments', path: Routes.Home, prefix: Routes.ExperimentListing },
  { name: 'Query Sets', path: Routes.QuerySetListing },
  { name: 'Search Configurations', path: Routes.SearchConfigurationListing },
  { name: 'Judgments', path: Routes.JudgmentListing },
];

export const WorkbenchNavigation = () => {
  const history = useHistory();
  const { pathname, search } = useLocation();
  const dataSourceId = new URLSearchParams(search).get('dataSourceId');
  const navigationSearch = dataSourceId
    ? `?${new URLSearchParams({ dataSourceId }).toString()}`
    : '';

  return (
    <nav className="searchRelevanceTopNav" aria-label="Search Relevance sections">
      <EuiTabs className="searchRelevanceTopNav__tabs">
        {sections.map(({ name, path, prefix = path }) => (
          <EuiTab
            key={path}
            className="searchRelevanceTopNav__tab"
            isSelected={
              pathname === path || pathname === prefix || pathname.startsWith(`${prefix}/`)
            }
            {...reactRouterNavigate(history, { pathname: path, search: navigationSearch })}
          >
            {name}
          </EuiTab>
        ))}
      </EuiTabs>
    </nav>
  );
};
