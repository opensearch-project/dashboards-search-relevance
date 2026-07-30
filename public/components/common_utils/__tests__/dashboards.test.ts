/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { getScopedSavedObjectId, applyDashboardScope } from '../dashboards';
import { escapedDashboardsData } from '../dashboards_data';

const parseLines = (ndjson: string) =>
  ndjson
    .split('\n')
    .filter((line) => line.trim())
    .map((line) => JSON.parse(line));

describe('getScopedSavedObjectId', () => {
  it('prefixes with data source then workspace, matching the imported id layout', () => {
    expect(getScopedSavedObjectId('abc', 'ws1', 'ds1')).toBe('ds1_ws1_abc');
  });

  it('applies only the dimensions that are present', () => {
    expect(getScopedSavedObjectId('abc', 'ws1')).toBe('ws1_abc');
    expect(getScopedSavedObjectId('abc', undefined, 'ds1')).toBe('ds1_abc');
    expect(getScopedSavedObjectId('abc')).toBe('abc');
    expect(getScopedSavedObjectId('abc', '', '')).toBe('abc');
  });
});

describe('applyDashboardScope', () => {
  it('returns the data unchanged when neither workspace nor data source is provided', () => {
    expect(applyDashboardScope(escapedDashboardsData)).toBe(escapedDashboardsData);
    expect(applyDashboardScope(escapedDashboardsData, '', '')).toBe(escapedDashboardsData);
  });

  it('scopes every saved object id and reference id, keeping references internally consistent', () => {
    const workspaceId = 'ws1';
    const dataSourceId = 'ds1';
    const original = parseLines(escapedDashboardsData);
    const scoped = parseLines(applyDashboardScope(escapedDashboardsData, workspaceId, dataSourceId));

    expect(scoped.length).toBe(original.length);

    const scopedIds = new Set(
      scoped.filter((o) => typeof o.id === 'string').map((o) => o.id as string)
    );

    original.forEach((originalObject, index) => {
      const scopedObject = scoped[index];

      if (typeof originalObject.id === 'string') {
        expect(scopedObject.id).toBe(`${dataSourceId}_${workspaceId}_${originalObject.id}`);
      } else {
        // The trailing export-summary line has no id and must be preserved as-is.
        expect(scopedObject).toEqual(originalObject);
      }

      (scopedObject.references || []).forEach((reference: any) => {
        expect(reference.id.startsWith(`${dataSourceId}_${workspaceId}_`)).toBe(true);
        // Every reference still resolves to an object shipped in the same import.
        expect(scopedIds.has(reference.id)).toBe(true);
      });
    });
  });

  it('scopes by workspace only when no data source is provided', () => {
    const scoped = parseLines(applyDashboardScope(escapedDashboardsData, 'ws1'));
    const withId = scoped.find((o) => typeof o.id === 'string');
    expect(withId.id.startsWith('ws1_')).toBe(true);
    expect(withId.id.startsWith('ws1_ws1_')).toBe(false);
  });

  it('produces valid ndjson where every non-empty line still parses', () => {
    const scoped = applyDashboardScope(escapedDashboardsData, 'ws1', 'ds1');
    const lines = scoped.split('\n').filter((line) => line.trim());

    expect(lines.length).toBeGreaterThan(0);
    expect(() => lines.forEach((line) => JSON.parse(line))).not.toThrow();
  });
});
