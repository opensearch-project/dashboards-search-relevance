/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

export interface SearchConfigOption {
  label: string;
  value: string;
}

/**
 * A selectable A/B test. Carries the per-request UUIDs that each configuration's hits are
 * tagged with, which is what lets the results page tell A from B: the clicks aggregation is a
 * `terms` agg, so its buckets come back ordered by doc_count, not in A-then-B order.
 */
export interface AbTestOption extends SearchConfigOption {
  configAUuid?: string;
  configBUuid?: string;
}

export interface AbTestItem {
  id: string;
  name: string;
  size: number;
  enabled: boolean;
  testId: string;
  configA: string;
  configB: string;
  createdAt: string;
  updatedAt: string;
}

/** A row in the listing table. */
export interface AbTestListItem {
  id: string;
  test_id: string;
  name: string;
  size: number;
  status: string;
  timestamp: string;
}

/** One configuration's click count, always labelled explicitly rather than by array position. */
export interface ConfigResult {
  key: string;
  doc_count: number;
  label: 'A' | 'B';
}

export interface AbTestSnapshot {
  id: string;
  created: string;
  configA: string;
  configB: string;
  enabled?: boolean;
}

export interface ClickEvent {
  testId: string;
  searchConfigurationUuid: string;
  docId: string;
  title: string;
  position: number;
  ubiIndex: string;
}
