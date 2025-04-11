import React from 'react';
import { EuiTabbedContent } from '@elastic/eui';
import { ExperimentTabsProps } from './types';
import { ExperimentTable } from "./experiment_table";
import { SearchConfigurationListingWithRoute } from '../search_config_listing';
import { QuerySetListingWithRoute } from '../query_set_listing';

export const ExperimentTabs = ({
                                 experiments,
                                 pairwiseExperiments,
                                 searchConfigurations,
                                 querySets,
                                 http}: ExperimentTabsProps) => {
  const tabs = [
    {
      id: 'experiment-id',
      name: 'Experiment',
      content: <ExperimentTable items={experiments} />,
    },
    {
      id: 'pairwise-experiment-id',
      name: 'Pairwise Experiment',
      content: <ExperimentTable items={pairwiseExperiments} />,
    },
    {
      id: 'search-configuration-id',
      name: 'Search Configuration',
      content: <SearchConfigurationListingWithRoute http={http} />,
      //content: <ExperimentTable items={searchConfigurations} />,
    },
    {
      id: 'query-set-id',
      name: 'Query Set',
      content: <QuerySetListingWithRoute http={http} />,
      //content: <ExperimentTable items={querySets} />,
    },
  ];

  return (
    <EuiTabbedContent
      tabs={tabs}
      initialSelectedTab={tabs[1]}
      autoFocus="selected"
      onTabClick={(tab) => {
        console.log('clicked tab', tab);
      }}
    />
  );
};
