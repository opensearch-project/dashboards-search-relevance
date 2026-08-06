/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { ExperimentType, ExperimentStatus, toExperiment, toQuerySnapshots } from './index';

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

describe('toQuerySnapshots', () => {
  it('extracts docIds for the matching search configuration via id lookup', () => {
    const source = {
      status: ExperimentStatus.COMPLETED,
      results: [
        {
          query_text: 'q1',
          snapshots: [
            { searchConfigurationId: 'sc-a', docIds: ['a1', 'a2'] },
            { searchConfigurationId: 'sc-b', docIds: ['b1'] },
          ],
        },
        {
          query_text: 'q2',
          snapshots: [
            { searchConfigurationId: 'sc-b', docIds: ['b2', 'b3'] },
            { searchConfigurationId: 'sc-a', docIds: ['a3'] },
          ],
        },
      ],
    };

    const forA = toQuerySnapshots(source, 'sc-a');
    const forB = toQuerySnapshots(source, 'sc-b');

    expect(forA.success).toBe(true);
    expect(forB.success).toBe(true);
    if (!forA.success || !forB.success) {
      return;
    }
    expect(forA.data).toEqual([
      { queryText: 'q1', documentIds: ['a1', 'a2'] },
      { queryText: 'q2', documentIds: ['a3'] },
    ]);
    expect(forB.data).toEqual([
      { queryText: 'q1', documentIds: ['b1'] },
      { queryText: 'q2', documentIds: ['b2', 'b3'] },
    ]);
  });

  it('uses the first snapshot when a config id is duplicated in a result', () => {
    const source = {
      status: ExperimentStatus.COMPLETED,
      results: [
        {
          query_text: 'q1',
          snapshots: [
            { searchConfigurationId: 'sc-a', docIds: ['first'] },
            { searchConfigurationId: 'sc-a', docIds: ['second'] },
          ],
        },
      ],
    };

    const result = toQuerySnapshots(source, 'sc-a');
    expect(result.success).toBe(true);
    if (!result.success) {
      return;
    }
    expect(result.data).toEqual([{ queryText: 'q1', documentIds: ['first'] }]);
  });
});
