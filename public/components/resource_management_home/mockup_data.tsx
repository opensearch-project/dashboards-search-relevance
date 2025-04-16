import { TableContent } from './types';
import { QuerySetOption, SearchConfigOption } from '../experiment_create/configuration/types';

export const experiments: TableContent[] = [
  {
    name: 'hybrid_search_sample',
    type: 'hybrid_search',
    last_updated: '2025-02-07T19:09:12.689Z',
    description: 'this is a sample experiment for hybrid search template.',
  },
  {
    name: 'ubi_sample',
    type: 'ubi',
    last_updated: '2025-02-07T19:09:12.689Z',
    description: 'this is a sample experiment for ubi template.',
  },
];

export const resultListComparisonExperiments: TableContent[] = [
  {
    name: 'pairwise_sample',
    type: 'pairwise',
    last_updated: '2025-02-07T19:09:12.689Z',
    description: 'this is a sample pairwise experiment.',
  },
];

export const searchConfigurations: TableContent[] = [
  {
    name: 'hybrid_search_template01 + search_pipeline01',
    type: 'hybrid_search',
    last_updated: '2025-02-07T19:09:12.689Z',
    description: 'this is a sample search configurations.',
  },
];

export const querySets: TableContent[] = [
  {
    name: 'query_sets01',
    type: 'query_text',
    last_updated: '2025-02-07T19:09:12.689Z',
    description: 'this is a sample qyert set.',
  },
];

export const mockupQuerySetOptions: QuerySetOption[] = [
  {
    label: 'queryset01',
    value: 'value01',
  },
  {
    label: 'queryset02',
    value: 'value01',
  },
  {
    label: 'queryset03',
    value: 'value01',
  },
  {
    label: 'queryset04',
    value: 'value01',
  },
];

export const mockupSearchConfigOptions: SearchConfigOption[] = [
  {
    label: 'search_config01',
    value: 'value01',
  },
  {
    label: 'search_config02',
    value: 'value01',
  },
];
