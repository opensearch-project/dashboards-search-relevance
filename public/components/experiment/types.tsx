import { CoreStart } from '../../../../../src/core/public';

export interface ExperimentPageProps {
  chrome: CoreStart['chrome'];
  application: CoreStart['application'];
}

export interface TableContent {
  name: string;
  type: string;
  last_updated: string;
  description: string;
}

export interface ExperimentHeaderProps {
  onAddExperiment: () => void;
}

export interface ExperimentTabsProps {
  experiments: TableContent[];
  pairwiseExperiments: TableContent[];
  searchConfigurations: TableContent[];
  querySets: TableContent[];
}

export interface ExperimentTableProps {
  items: TableContent[];
}
