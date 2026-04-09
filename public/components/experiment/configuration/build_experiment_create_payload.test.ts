/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { ExperimentType } from '../../../types/index';
import { buildExperimentCreateRequestBody } from './build_experiment_create_payload';

describe('buildExperimentCreateRequestBody', () => {
  it('includes optional name and description when non-empty', () => {
    const body = buildExperimentCreateRequestBody({
      type: ExperimentType.PAIRWISE_COMPARISON,
      querySetId: 'qs-1',
      size: 10,
      searchConfigurationList: ['a', 'b'],
      name: '  My experiment  ',
      description: '  Notes  ',
    });

    expect(body).toEqual({
      type: ExperimentType.PAIRWISE_COMPARISON,
      querySetId: 'qs-1',
      size: 10,
      searchConfigurationList: ['a', 'b'],
      name: 'My experiment',
      description: 'Notes',
    });
  });

  it('omits optional name and description when blank', () => {
    const body = buildExperimentCreateRequestBody({
      type: ExperimentType.PAIRWISE_COMPARISON,
      querySetId: 'qs-1',
      size: 10,
      searchConfigurationList: ['a', 'b'],
      name: '   ',
      description: '',
    });

    expect(body).toEqual({
      type: ExperimentType.PAIRWISE_COMPARISON,
      querySetId: 'qs-1',
      size: 10,
      searchConfigurationList: ['a', 'b'],
    });
  });

  it('includes judgment lists for evaluation-style experiments', () => {
    const body = buildExperimentCreateRequestBody({
      type: ExperimentType.POINTWISE_EVALUATION,
      querySetId: 'qs-1',
      size: 10,
      searchConfigurationList: ['sc-1'],
      judgmentList: ['j-1'],
      name: 'Eval',
    });

    expect(body).toEqual({
      type: ExperimentType.POINTWISE_EVALUATION,
      querySetId: 'qs-1',
      size: 10,
      searchConfigurationList: ['sc-1'],
      judgmentList: ['j-1'],
      name: 'Eval',
    });
  });
});
