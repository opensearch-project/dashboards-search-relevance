/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

/** Matches backend search-relevance experiment name/description limits (see PutExperimentRequest). */
export const EXPERIMENT_NAME_MAX_LENGTH = 50;
export const EXPERIMENT_DESCRIPTION_MAX_LENGTH = 250;

/** Shown when an experiment has no user-visible name (legacy docs or empty string). */
export const UNNAMED_EXPERIMENT_LABEL = 'Unnamed experiment';

/**
 * Returns a non-empty display name for list/detail views.
 * Legacy experiments may omit `name`; the UI still shows a stable label.
 */
export function getExperimentDisplayName(name: string | undefined | null): string {
  const trimmed = typeof name === 'string' ? name.trim() : '';
  if (trimmed.length > 0) {
    return trimmed;
  }
  return UNNAMED_EXPERIMENT_LABEL;
}
