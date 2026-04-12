/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

/** Matches backend search-relevance experiment name/description limits. */
export const EXPERIMENT_NAME_MAX_LENGTH = 50;
export const EXPERIMENT_DESCRIPTION_MAX_LENGTH = 250;

export type ExperimentMetadataFieldErrors = {
  name?: string[];
  description?: string[];
};

/**
 * Client-side validation for optional experiment name/description on create.
 * Backend enforces the same limits; this surfaces issues before the request.
 */
export function validateExperimentMetadataForCreate(
  name: string | undefined,
  description: string | undefined
): ExperimentMetadataFieldErrors {
  const errors: ExperimentMetadataFieldErrors = {};
  const n = typeof name === 'string' ? name : '';
  const d = typeof description === 'string' ? description : '';

  if (n.length > EXPERIMENT_NAME_MAX_LENGTH) {
    errors.name = [`Name must be at most ${EXPERIMENT_NAME_MAX_LENGTH} characters.`];
  }
  if (d.length > EXPERIMENT_DESCRIPTION_MAX_LENGTH) {
    errors.description = [
      `Description must be at most ${EXPERIMENT_DESCRIPTION_MAX_LENGTH} characters.`,
    ];
  }
  return errors;
}
