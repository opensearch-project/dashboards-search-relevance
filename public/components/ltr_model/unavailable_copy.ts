/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { LtrUnavailableReason } from './types';

/**
 * The registry is only as available as the LTR plugin behind it, and this plugin ships
 * independently of it. Each reason gets its own next step instead of a generic failure.
 */
export const LTR_UNAVAILABLE_COPY: Record<LtrUnavailableReason, { title: string; body: string }> = {
  store_not_found: {
    title: 'No feature store found',
    body:
      'The Learning to Rank plugin is running, but no feature store exists yet. Create one with ' +
      'PUT _ltr, then add a feature set and a model.',
  },
  plugin_disabled: {
    title: 'Learning to Rank is disabled',
    body:
      'The Learning to Rank plugin is installed but turned off. Set ltr.plugin.enabled to true in ' +
      'the cluster settings to use the model registry.',
  },
  plugin_not_installed: {
    title: 'Learning to Rank is not installed',
    body:
      'This cluster has no Learning to Rank plugin, so there are no models to show. Install ' +
      'opensearch-learning-to-rank-base to use the model registry.',
  },
};
