/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { renderHook, waitFor } from '@testing-library/react';
import {
  isAwaitingDataSourceSelection,
  useDataSourceSupportsSearchRelevance,
  SEARCH_RELEVANCE_DATA_SOURCE_PLUGIN,
} from '../datasource_utils';

const makeSavedObjects = (get: jest.Mock) => (({ client: { get } } as unknown) as any);

describe('isAwaitingDataSourceSelection', () => {
  it('is pending when data sources are enabled but none is resolved yet', () => {
    expect(isAwaitingDataSourceSelection(true, undefined)).toBe(true);
  });

  it('is not pending on single-cluster deployments (data sources disabled)', () => {
    expect(isAwaitingDataSourceSelection(false, undefined)).toBe(false);
  });

  it('is not pending once a data source id is resolved', () => {
    expect(isAwaitingDataSourceSelection(true, 'ds-1')).toBe(false);
  });

  it('treats the explicit local/default cluster (empty id) as selected, not pending', () => {
    expect(isAwaitingDataSourceSelection(true, '')).toBe(false);
  });
});

describe('useDataSourceSupportsSearchRelevance', () => {
  afterEach(() => jest.clearAllMocks());

  it('reports supported and does not query when data sources are disabled', async () => {
    const get = jest.fn();
    const savedObjects = makeSavedObjects(get);
    const { result } = renderHook(() =>
      useDataSourceSupportsSearchRelevance(false, 'ds-1', savedObjects)
    );
    expect(result.current).toBe(true);
    expect(get).not.toHaveBeenCalled();
  });

  it('reports supported and does not query for the local/default cluster (undefined or empty id)', async () => {
    const get = jest.fn();
    const savedObjects = makeSavedObjects(get);
    const undefinedId = renderHook(() =>
      useDataSourceSupportsSearchRelevance(true, undefined, savedObjects)
    );
    const emptyId = renderHook(() => useDataSourceSupportsSearchRelevance(true, '', savedObjects));
    expect(undefinedId.result.current).toBe(true);
    expect(emptyId.result.current).toBe(true);
    expect(get).not.toHaveBeenCalled();
  });

  it('reports NOT supported when the data source lacks the search-relevance plugin', async () => {
    const get = jest.fn().mockResolvedValue({
      attributes: { installedPlugins: ['opensearch-ml', 'opensearch-sql'] },
    });
    const savedObjects = makeSavedObjects(get);
    const { result } = renderHook(() =>
      useDataSourceSupportsSearchRelevance(true, 'ds-1', savedObjects)
    );
    await waitFor(() => expect(result.current).toBe(false));
    expect(get).toHaveBeenCalledWith('data-source', 'ds-1');
  });

  it('reports NOT supported when installedPlugins is empty (e.g. serverless)', async () => {
    const get = jest.fn().mockResolvedValue({ attributes: { installedPlugins: [] } });
    const savedObjects = makeSavedObjects(get);
    const { result } = renderHook(() =>
      useDataSourceSupportsSearchRelevance(true, 'ds-1', savedObjects)
    );
    await waitFor(() => expect(result.current).toBe(false));
  });

  it('reports supported when the search-relevance plugin is installed', async () => {
    const get = jest.fn().mockResolvedValue({
      attributes: { installedPlugins: ['opensearch-ml', SEARCH_RELEVANCE_DATA_SOURCE_PLUGIN] },
    });
    const savedObjects = makeSavedObjects(get);
    const { result } = renderHook(() =>
      useDataSourceSupportsSearchRelevance(true, 'ds-1', savedObjects)
    );
    await waitFor(() => expect(get).toHaveBeenCalled());
    expect(result.current).toBe(true);
  });

  it('reports supported when installedPlugins is unknown (undefined)', async () => {
    const get = jest.fn().mockResolvedValue({ attributes: {} });
    const savedObjects = makeSavedObjects(get);
    const { result } = renderHook(() =>
      useDataSourceSupportsSearchRelevance(true, 'ds-1', savedObjects)
    );
    await waitFor(() => expect(get).toHaveBeenCalled());
    expect(result.current).toBe(true);
  });

  it('falls back to supported when the saved object lookup fails', async () => {
    const get = jest.fn().mockRejectedValue(new Error('not found'));
    const savedObjects = makeSavedObjects(get);
    const { result } = renderHook(() =>
      useDataSourceSupportsSearchRelevance(true, 'ds-1', savedObjects)
    );
    await waitFor(() => expect(get).toHaveBeenCalled());
    expect(result.current).toBe(true);
  });
});
