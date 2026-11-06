/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  hasSearchRelevancePlugin,
  isSupportedSearchRelevanceDataSource,
} from '../datasource_utils';

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

describe('isSupportedSearchRelevanceDataSource', () => {
  it('returns false for an AnalyticEngine data source regardless of version', () => {
    expect(
      isSupportedSearchRelevanceDataSource(createMockDataSource('2.12.0', 'AnalyticEngine') as any)
    ).toBe(false);
  });

  it('returns true for a non-AnalyticEngine data source with a supported version', () => {
    expect(
      isSupportedSearchRelevanceDataSource(createMockDataSource('2.12.0', 'OpenSearch') as any)
    ).toBe(true);
  });

  it('returns false for a non-AnalyticEngine data source with an unsupported version', () => {
    expect(
      isSupportedSearchRelevanceDataSource(createMockDataSource('2.6.0', 'OpenSearch') as any)
    ).toBe(false);
  });

  it('returns true for a data source with no engine type and a supported version', () => {
    expect(isSupportedSearchRelevanceDataSource(createMockDataSource('2.12.0') as any)).toBe(true);
  });
});

describe('hasSearchRelevancePlugin', () => {
  const withPlugins = (installedPlugins?: string[]) =>
    ({ attributes: { ...createMockDataSource('2.12.0').attributes, installedPlugins } }) as any;

  it('returns true when installedPlugins includes the Search Relevance plugin', () => {
    expect(hasSearchRelevancePlugin(withPlugins(['opensearch-search-relevance']))).toBe(true);
  });

  it('returns false when installedPlugins does not include the Search Relevance plugin', () => {
    expect(hasSearchRelevancePlugin(withPlugins(['opensearch-ml']))).toBe(false);
  });

  it('returns true when installedPlugins is missing', () => {
    expect(hasSearchRelevancePlugin(withPlugins(undefined))).toBe(true);
  });
});
