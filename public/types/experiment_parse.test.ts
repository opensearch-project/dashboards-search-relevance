/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { ExperimentType, ExperimentStatus, toExperiment } from './index';

const hybridBase = {
  id: 'exp-1',
  timestamp: '2000-01-01T00:00:00.000Z',
  querySetId: 'qs-1',
  size: 10,
  status: ExperimentStatus.COMPLETED,
  searchConfigurationList: ['sc-1'],
  judgmentList: ['j-1'],
  isScheduled: false,
  results: [],
};

describe('toExperiment metadata', () => {
  it('parses optional name and description for hybrid optimizer experiments', () => {
    const result = toExperiment({
      ...hybridBase,
      type: ExperimentType.HYBRID_OPTIMIZER,
      name: '  Hybrid name  ',
      description: '  Runs weekly  ',
    });

    expect(result.success).toBe(true);
    if (!result.success) {
      return;
    }
    expect(result.data.name).toBe('Hybrid name');
    expect(result.data.description).toBe('Runs weekly');
  });

  it('omits empty name/description fields', () => {
    const result = toExperiment({
      ...hybridBase,
      type: ExperimentType.HYBRID_OPTIMIZER,
      name: '   ',
      description: '',
    });

    expect(result.success).toBe(true);
    if (!result.success) {
      return;
    }
    expect(result.data.name).toBeUndefined();
    expect(result.data.description).toBeUndefined();
  });
});
