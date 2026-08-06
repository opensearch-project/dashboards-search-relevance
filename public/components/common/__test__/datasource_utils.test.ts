/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { renderHook } from '@testing-library/react';
import { useDataSourceFilter } from '../datasource_utils';

const createMockDataSource = (version: string, engineType?: string) => ({
  id: 'test-ds',
  type: 'data-source',
  attributes: {
    title: 'Test',
    endpoint: 'http://localhost:9200',
    dataSourceVersion: version,
    dataSourceEngineType: engineType,
    auth: { type: 'no_auth', credentials: undefined },
  },
  references: [],
});

describe('useDataSourceFilter', () => {
  describe('without excludeEngineTypes', () => {
    it('returns true for OpenSearch data source with supported version', () => {
      const { result } = renderHook(() => useDataSourceFilter());
      const filter = result.current;
      expect(filter(createMockDataSource('2.12.0', 'OpenSearch') as any)).toBe(true);
    });

    it('returns true for AnalyticEngine data source with supported version', () => {
      const { result } = renderHook(() => useDataSourceFilter());
      const filter = result.current;
      expect(filter(createMockDataSource('2.12.0', 'AnalyticEngine') as any)).toBe(true);
    });

    it('returns false for data source with unsupported version', () => {
      const { result } = renderHook(() => useDataSourceFilter());
      const filter = result.current;
      expect(filter(createMockDataSource('2.6.0', 'OpenSearch') as any)).toBe(false);
    });
  });

  describe('with excludeEngineTypes', () => {
    it('returns false for AnalyticEngine when excluded', () => {
      const { result } = renderHook(() => useDataSourceFilter(['AnalyticEngine']));
      const filter = result.current;
      expect(filter(createMockDataSource('2.12.0', 'AnalyticEngine') as any)).toBe(false);
    });

    it('returns true for OpenSearch when AnalyticEngine is excluded', () => {
      const { result } = renderHook(() => useDataSourceFilter(['AnalyticEngine']));
      const filter = result.current;
      expect(filter(createMockDataSource('2.12.0', 'OpenSearch') as any)).toBe(true);
    });

    it('returns false for unsupported version even when engine type is allowed', () => {
      const { result } = renderHook(() => useDataSourceFilter(['AnalyticEngine']));
      const filter = result.current;
      expect(filter(createMockDataSource('2.6.0', 'OpenSearch') as any)).toBe(false);
    });

    it('returns true for data source with no engine type set', () => {
      const { result } = renderHook(() => useDataSourceFilter(['AnalyticEngine']));
      const filter = result.current;
      expect(filter(createMockDataSource('2.12.0') as any)).toBe(true);
    });
  });
});
