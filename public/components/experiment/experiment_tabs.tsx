import React from 'react';
import { EuiTabbedContent } from '@elastic/eui';
import { ExperimentTabsProps } from './types';
import { ExperimentTable } from "./experiment_table";

export const ExperimentTabs = ({
                                 experiments,
                                 pairwiseExperiments,
                                 searchConfigurations,
                                 querySets}: ExperimentTabsProps) => {
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
      content: <ExperimentTable items={searchConfigurations} />,
    },
    {
      id: 'query-set-id',
      name: 'Query Set',
      content: <ExperimentTable items={querySets} />,
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
