/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { withRouter } from 'react-router-dom';
import { EuiTabs, EuiTab, EuiSpacer, EuiPanel } from '@elastic/eui';
import { ResourceManagementTabsProps } from './types';
import { SearchConfigurationListingWithRoute } from '../search_config_listing';
import { QuerySetListingWithRoute } from '../query_set_listing';
import { QuerySetCreateWithRouter } from '../query_set_create/query_set_create';
import { QuerySetView } from '../query_set_view/query_set_view';
import { SearchConfigurationCreateWithRouter } from '../search_config_create/search_config_create';
import { SearchConfigurationView } from '../search_config_view/search_config_view';
import { TemplateCards } from '../experiment_create/template_card/template_cards';
import ExperimentViewWithRouter from '../experiment_view/experiment_view';
import ExperimentListingWithRoute from '../experiment_listing/experiment_listing';
import { useOpenSearchDashboards } from '../../../../../src/plugins/opensearch_dashboards_react/public';
import { JudgmentCreateWithRouter } from '../judgment_create';
import { JudgmentListingWithRoute } from '../judgment_listing';
import { JudgmentView } from '../judgment_view';

const TAB_STYLES = {
  mainTabs: {
    backgroundColor: '#FFFFFF',
    borderBottom: '1px solid #D3DAE6',
  },
  mainTab: {
    backgroundColor: '#F5F7FA',
    color: '#69707D',
    minWidth: '150px', // Optional: make tabs wider
  },
  mainTabSelected: {
    backgroundColor: '#008B87',
    color: '#FFFFFF',
    borderBottom: '2px solid #FFFFFF',
  },
  subTabs: {
    backgroundColor: '#FFFFFF',
    borderBottom: '1px solid #D3DAE6',
  },
  subTab: {
    color: '#69707D',
  },
  subTabSelected: {
    color: '#008B87',
    borderBottom: '2px solid #008B87',
  },
};

export const ResourceManagementTabs = ({
  experiments,
  resultListComparisonExperiments,
  history,
  entity,
  entityAction,
  entityId,
}: ResourceManagementTabsProps) => {
  const { http, notifications } = useOpenSearchDashboards().services;

  const selectedMainTabId = entity ? entity : 'experiment';
  // HACK: we map view to list, because we show the view pane under the list tab
  const selectedSubTabs = entityAction && entityAction != 'view' ? entityAction : 'list';

  const mainTabs = [
    { id: 'experiment', name: 'Experiment' },
    { id: 'querySet', name: 'Query Set' },
    { id: 'searchConfiguration', name: 'Search Configuration' },
    { id: 'judgment', name: 'Judgments' },
  ];

  const renderSubTabs = (tabKey: string, tabs: Array<{ id: string; label: string }>) => (
    <EuiTabs style={TAB_STYLES.subTabs} size="s">
      {tabs.map((tab) => (
        <EuiTab
          key={tab.id}
          isSelected={selectedSubTabs === tab.id}
          onClick={() => history.push('/' + selectedMainTabId + '/' + tab.id)}
          style={{
            ...TAB_STYLES.subTab,
            ...(selectedSubTabs === tab.id ? TAB_STYLES.subTabSelected : {}),
          }}
        >
          {tab.label}
        </EuiTab>
      ))}
    </EuiTabs>
  );

  const renderContent = () => {
    switch (selectedMainTabId) {
      case 'experiment':
        return (
          <>
            {renderSubTabs('experiment', [
              { id: 'list', label: 'Manage Experiments' },
              { id: 'create', label: 'Create a Experiment' },
            ])}
            <EuiSpacer size="m" />
            <EuiPanel>
              {selectedSubTabs === 'list' && entityAction != 'view' ? (
                <ExperimentListingWithRoute http={http} />
              ) : (
                <></>
              )}
              {entityAction === 'view' ? (
                <ExperimentViewWithRouter http={http} id={entityId} />
              ) : (
                <></>
              )}
              {selectedSubTabs === 'create' ? <TemplateCards onClose={() => {}} /> : <></>}
            </EuiPanel>
          </>
        );

      case 'querySet':
        return (
          <>
            {renderSubTabs('querySet', [
              { id: 'list', label: 'Manage Query Sets' },
              { id: 'create', label: 'Create a Query Set' },
            ])}
            <EuiSpacer size="m" />
            <EuiPanel>
              {selectedSubTabs === 'list' && entityAction != 'view' ? (
                <QuerySetListingWithRoute http={http} />
              ) : (
                <></>
              )}
              {entityAction === 'view' ? <QuerySetView http={http} id={entityId} /> : <></>}
              {selectedSubTabs === 'create' ? (
                <QuerySetCreateWithRouter http={http} notifications={notifications} />
              ) : (
                <></>
              )}
            </EuiPanel>
          </>
        );

      case 'searchConfiguration':
        return (
          <>
            {renderSubTabs('searchConfiguration', [
              { id: 'list', label: 'Manage Search Configurations' },
              { id: 'create', label: 'Create a Search Configuration' },
            ])}
            <EuiSpacer size="m" />
            <EuiPanel>
              {selectedSubTabs === 'list' && entityAction != 'view' ? (
                <SearchConfigurationListingWithRoute http={http} />
              ) : (
                <></>
              )}
              {entityAction === 'view' ? (
                <SearchConfigurationView http={http} id={entityId} />
              ) : (
                <></>
              )}
              {selectedSubTabs === 'create' ? (
                <SearchConfigurationCreateWithRouter http={http} notifications={notifications} />
              ) : (
                <></>
              )}
            </EuiPanel>
          </>
        );

      case 'judgment':
        return (
          <>
            {renderSubTabs('judgment', [
              { id: 'list', label: 'Manage Judgments' },
              { id: 'create', label: 'Create a Judgment List' },
            ])}
            <EuiSpacer size="m" />
            <EuiPanel>
              {selectedSubTabs === 'list' && entityAction != 'view' ? (
                <JudgmentListingWithRoute http={http} />
              ) : (
                <></>
              )}
              {entityAction === 'view' ? <JudgmentView http={http} id={entityId} /> : <></>}
              {selectedSubTabs === 'create' ? (
                <JudgmentCreateWithRouter
                  http={http}
                  notifications={notifications}
                  history={history}
                />
              ) : (
                <></>
              )}
            </EuiPanel>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <div>
      <div style={TAB_STYLES.mainTabs}>
        <EuiTabs size="s">
          {mainTabs.map((tab) => (
            <EuiTab
              key={tab.id}
              isSelected={selectedMainTabId === tab.id}
              onClick={() => history.push('/' + tab.id)}
              style={{
                ...TAB_STYLES.mainTab,
                ...(selectedMainTabId === tab.id ? TAB_STYLES.mainTabSelected : {}),
              }}
            >
              {tab.name}
            </EuiTab>
          ))}
        </EuiTabs>
      </div>
      <EuiSpacer size="m" />
      {renderContent()}
    </div>
  );
};

export const ResourceManagementTabsWithRoute = withRouter(ResourceManagementTabs);

export default ResourceManagementTabsWithRoute;
