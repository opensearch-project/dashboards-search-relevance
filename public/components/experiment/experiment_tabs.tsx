/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { EuiTabs, EuiTab, EuiSpacer, EuiPanel } from '@elastic/eui';
import { ExperimentTabsProps } from './types';
import { ExperimentTable } from './experiment_table';
import { SearchConfigurationListingWithRoute } from '../search_config_listing';
import { QuerySetListingWithRoute } from '../query_set_listing';
import { QuerySetCreateWithRouter } from '../query_set_create/query_set_create';
import { SearchConfigurationCreateWithRouter } from '../search_config_create/search_config_create';
import { TemplateCards } from './template_card/template_cards';

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

export const ExperimentTabs = ({
  experiments,
  resultListComparisonExperiments,
  http,
  notifications,
}: ExperimentTabsProps) => {
  const [selectedMainTabId, setSelectedMainTabId] = useState('experiment');
  const [selectedSubTabs, setSelectedSubTabs] = useState({
    experiment: 'list',
    querySet: 'list',
    searchConfiguration: 'list',
  });

  const mainTabs = [
    { id: 'experiment', name: 'Experiment' },
    { id: 'querySet', name: 'Query Set' },
    { id: 'searchConfiguration', name: 'Search Configuration' },
  ];

  const renderSubTabs = (tabKey: string, tabs: Array<{ id: string; label: string }>) => (
    <EuiTabs style={TAB_STYLES.subTabs} size="s">
      {tabs.map((tab) => (
        <EuiTab
          key={tab.id}
          isSelected={selectedSubTabs[tabKey] === tab.id}
          onClick={() => setSelectedSubTabs({ ...selectedSubTabs, [tabKey]: tab.id })}
          style={{
            ...TAB_STYLES.subTab,
            ...(selectedSubTabs[tabKey] === tab.id ? TAB_STYLES.subTabSelected : {}),
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
              {selectedSubTabs.experiment === 'list' ? (
                <ExperimentTable items={[...experiments, ...resultListComparisonExperiments]} />
              ) : (
                <TemplateCards onClose={() => {}} />
              )}
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
              {selectedSubTabs.querySet === 'list' ? (
                <QuerySetListingWithRoute http={http} />
              ) : (
                <QuerySetCreateWithRouter http={http} notifications={notifications} />
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
              {selectedSubTabs.searchConfiguration === 'list' ? (
                <SearchConfigurationListingWithRoute http={http} />
              ) : (
                <SearchConfigurationCreateWithRouter http={http} notifications={notifications} />
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
              onClick={() => setSelectedMainTabId(tab.id)}
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
