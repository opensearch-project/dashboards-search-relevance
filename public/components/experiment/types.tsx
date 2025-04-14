import { CoreStart } from '../../../../../src/core/public';

export interface ExperimentPageProps {
  chrome: CoreStart['chrome'];
  application: CoreStart['application'];
  http: CoreStart['http'];
}

export interface TableContent {
  name: string;
  type: string;
  last_updated: string;
  description: string;
}

export interface ExperimentHeaderProps {
  onAddExperiment: () => void;
  history: CoreStart['history'];
}

export interface ExperimentTabsProps {
  experiments: TableContent[];
  resultListComparisonExperiments: TableContent[];
  searchConfigurations: TableContent[];
  querySets: TableContent[];
  http: CoreStart['http'];
}

export interface ExperimentTableProps {
  items: TableContent[];
}
