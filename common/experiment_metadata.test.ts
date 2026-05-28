/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  UNNAMED_EXPERIMENT_LABEL,
  getExperimentDisplayName,
} from './experiment_metadata';

describe('getExperimentDisplayName', () => {
  it('returns trimmed name when provided', () => {
    expect(getExperimentDisplayName('  My experiment  ')).toBe('My experiment');
  });

  it('returns unnamed label for empty, whitespace, or missing values', () => {
    expect(getExperimentDisplayName('')).toBe(UNNAMED_EXPERIMENT_LABEL);
    expect(getExperimentDisplayName('   ')).toBe(UNNAMED_EXPERIMENT_LABEL);
    expect(getExperimentDisplayName(undefined)).toBe(UNNAMED_EXPERIMENT_LABEL);
    expect(getExperimentDisplayName(null)).toBe(UNNAMED_EXPERIMENT_LABEL);
  });
});
