/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  EXPERIMENT_DESCRIPTION_MAX_LENGTH,
  EXPERIMENT_NAME_MAX_LENGTH,
  validateExperimentMetadataForCreate,
} from './experiment_metadata';

describe('validateExperimentMetadataForCreate', () => {
  it('allows empty optional fields', () => {
    expect(validateExperimentMetadataForCreate('', '')).toEqual({});
    expect(validateExperimentMetadataForCreate(undefined, undefined)).toEqual({});
  });

  it('rejects names longer than the maximum length', () => {
    const name = 'a'.repeat(EXPERIMENT_NAME_MAX_LENGTH + 1);
    expect(validateExperimentMetadataForCreate(name, '')).toEqual({
      name: [`Name must be at most ${EXPERIMENT_NAME_MAX_LENGTH} characters.`],
    });
  });

  it('rejects descriptions longer than the maximum length', () => {
    const description = 'b'.repeat(EXPERIMENT_DESCRIPTION_MAX_LENGTH + 1);
    expect(validateExperimentMetadataForCreate('', description)).toEqual({
      description: [
        `Description must be at most ${EXPERIMENT_DESCRIPTION_MAX_LENGTH} characters.`,
      ],
    });
  });
});
