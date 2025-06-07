/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { CoreStart } from '../../../../../src/core/public';

export interface TableContent {
  name: string;
  type: string;
  last_updated: string;
  description: string;
}

export interface ResourceManagementTabsProps {
  experiments: TableContent[];
  resultListComparisonExperiments: TableContent[];
  searchConfigurations: TableContent[];
  querySets: TableContent[];
  history: any;
  entity?: string;
  entityAction?: string;
  entityId?: string;
}
