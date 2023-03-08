/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { schema, TypeOf } from '@osd/config-schema';

import { METRIC_INTERVAL, DEFAULT_WINDOW_SIZE } from './server/metrics';

export const configSchema = schema.object({
  metrics: schema.object({
    metricInterval: schema.number({ defaultValue: METRIC_INTERVAL.ONE_MINUTE }),
    windowSize: schema.number({ min: 2, max: 10, defaultValue: DEFAULT_WINDOW_SIZE }),
  }),
});

export type SearchRelevancePluginConfigType = TypeOf<typeof configSchema>;
