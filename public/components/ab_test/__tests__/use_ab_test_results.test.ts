/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import { useAbTestResults } from '../hooks/use_ab_test_results';

jest.mock('../../../../common', () => ({
  ServiceEndpoints: {
    AbTests: '/api/relevancy/ab_tests',
    GetSearchResults: '/api/relevancy/search',
  },
  extractUserMessageFromError: jest.fn(() => null),
}));

const mockNotifications = {
  toasts: {
    addSuccess: jest.fn(),
    addWarning: jest.fn(),
    addError: jest.fn(),
  },
} as any;

const testOption = {
  label: 'My Test',
  value: 'test-1',
  configAUuid: 'uuid-a',
  configBUuid: 'uuid-b',
};

const makeService = (buckets: any[]) =>
  ({
    fetchAbTestOptions: jest.fn().mockResolvedValue([testOption]),
    fetchUbiIndices: jest.fn().mockResolvedValue([{ label: 'ubi_events', value: 'ubi_events' }]),
    fetchClickAggregation: jest.fn().mockResolvedValue(buckets),
  } as any);

/** Drives the hook to a loaded results state for the given aggregation buckets. */
const fetchWith = async (buckets: any[]) => {
  const service = makeService(buckets);
  const { result } = renderHook(() => useAbTestResults(service, mockNotifications));

  await waitFor(() => expect(result.current.testOptions).toHaveLength(1));

  act(() => {
    result.current.setSelectedTest([testOption]);
    result.current.setSelectedIndex([{ label: 'ubi_events', value: 'ubi_events' }]);
  });

  await act(async () => {
    await result.current.fetchResults();
  });

  return { result, service };
};

describe('useAbTestResults', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    (console.error as jest.Mock).mockRestore();
  });

  it('loads the test and index options on mount', async () => {
    const service = makeService([]);
    const { result } = renderHook(() => useAbTestResults(service, mockNotifications));

    await waitFor(() => {
      expect(result.current.testOptions).toEqual([testOption]);
      expect(result.current.indexOptions).toHaveLength(1);
    });
  });

  it('labels configurations by uuid, not by bucket order', async () => {
    // A `terms` agg orders buckets by doc_count, so B leads here. Labels must still follow uuid.
    const { result } = await fetchWith([
      { key: 'uuid-b', doc_count: 30 },
      { key: 'uuid-a', doc_count: 10 },
    ]);

    expect(result.current.results).toEqual([
      { key: 'uuid-a', doc_count: 10, label: 'A' },
      { key: 'uuid-b', doc_count: 30, label: 'B' },
    ]);
    expect(result.current.totalClicks).toBe(40);
  });

  it('keeps a zero-click configuration in the results', async () => {
    // Only B has clicks; A must still render rather than being dropped or mistaken for a tie.
    const { result } = await fetchWith([{ key: 'uuid-b', doc_count: 5 }]);

    expect(result.current.results).toEqual([
      { key: 'uuid-a', doc_count: 0, label: 'A' },
      { key: 'uuid-b', doc_count: 5, label: 'B' },
    ]);
    expect(result.current.totalClicks).toBe(5);
  });

  it('reports zero clicks when the aggregation is empty', async () => {
    const { result } = await fetchWith([]);

    expect(result.current.results).toEqual([
      { key: 'uuid-a', doc_count: 0, label: 'A' },
      { key: 'uuid-b', doc_count: 0, label: 'B' },
    ]);
    expect(result.current.totalClicks).toBe(0);
  });

  it('ignores buckets for uuids that are not part of the selected test', async () => {
    const { result } = await fetchWith([
      { key: 'uuid-a', doc_count: 4 },
      { key: 'uuid-stale', doc_count: 99 },
      { key: 'uuid-b', doc_count: 6 },
    ]);

    expect(result.current.results.map((r) => r.key)).toEqual(['uuid-a', 'uuid-b']);
    // The unrelated bucket still counts toward the raw total the agg reported.
    expect(result.current.totalClicks).toBe(109);
  });

  it('falls back to bucket order when the test carries no uuids', async () => {
    const service = makeService([
      { key: 'uuid-x', doc_count: 7 },
      { key: 'uuid-y', doc_count: 2 },
    ]);
    const legacyOption = { label: 'Legacy', value: 'test-legacy' };
    service.fetchAbTestOptions = jest.fn().mockResolvedValue([legacyOption]);

    const { result } = renderHook(() => useAbTestResults(service, mockNotifications));
    await waitFor(() => expect(result.current.testOptions).toHaveLength(1));

    act(() => {
      result.current.setSelectedTest([legacyOption as any]);
      result.current.setSelectedIndex([{ label: 'ubi_events', value: 'ubi_events' }]);
    });
    await act(async () => {
      await result.current.fetchResults();
    });

    expect(result.current.results.map((r) => r.label)).toEqual(['A', 'B']);
  });

  it('warns instead of fetching when no test is selected', async () => {
    const service = makeService([]);
    const { result } = renderHook(() => useAbTestResults(service, mockNotifications));

    await act(async () => {
      await result.current.fetchResults();
    });

    expect(mockNotifications.toasts.addWarning).toHaveBeenCalledWith('Please select an A/B test');
    expect(service.fetchClickAggregation).not.toHaveBeenCalled();
  });

  it('warns instead of fetching when no index is selected', async () => {
    const service = makeService([]);
    const { result } = renderHook(() => useAbTestResults(service, mockNotifications));

    await waitFor(() => expect(result.current.testOptions).toHaveLength(1));
    act(() => {
      result.current.setSelectedTest([testOption]);
    });

    await act(async () => {
      await result.current.fetchResults();
    });

    expect(mockNotifications.toasts.addWarning).toHaveBeenCalledWith(
      'Please select a UBI click index'
    );
    expect(service.fetchClickAggregation).not.toHaveBeenCalled();
  });

  it('surfaces a toast and clears loading when the aggregation fails', async () => {
    const service = makeService([]);
    service.fetchClickAggregation = jest.fn().mockRejectedValue(new Error('agg failed'));

    const { result } = renderHook(() => useAbTestResults(service, mockNotifications));
    await waitFor(() => expect(result.current.testOptions).toHaveLength(1));

    act(() => {
      result.current.setSelectedTest([testOption]);
      result.current.setSelectedIndex([{ label: 'ubi_events', value: 'ubi_events' }]);
    });
    await act(async () => {
      await result.current.fetchResults();
    });

    expect(mockNotifications.toasts.addError).toHaveBeenCalled();
    expect(result.current.isLoading).toBe(false);
  });
});
