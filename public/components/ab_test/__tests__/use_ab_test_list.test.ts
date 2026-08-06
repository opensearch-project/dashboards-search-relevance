/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { renderHook, act } from '@testing-library/react';
import { useAbTestList } from '../hooks/use_ab_test_list';

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

const mockService = {
  findAbTests: jest.fn(),
  deleteAbTest: jest.fn(),
} as any;

describe('useAbTestList', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Silence the intentional console.error calls in the failure paths.
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    (console.error as jest.Mock).mockRestore();
  });

  it('initializes with default state', () => {
    const { result } = renderHook(() => useAbTestList(mockService, mockNotifications));

    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe(null);
    expect(result.current.refreshKey).toBe(0);
  });

  it('returns the tests the service found', async () => {
    const hits = [{ id: 'test-1', test_id: 'test-1', name: 'BM25 vs Neural' }];
    mockService.findAbTests.mockResolvedValue({ total: 1, hits });

    const { result } = renderHook(() => useAbTestList(mockService, mockNotifications));

    let listed;
    await act(async () => {
      listed = await result.current.findAbTests('');
    });

    expect(listed).toEqual({ total: 1, hits });
    expect(result.current.error).toBe(null);
  });

  it('passes the search term through to the service', async () => {
    mockService.findAbTests.mockResolvedValue({ total: 0, hits: [] });

    const { result } = renderHook(() => useAbTestList(mockService, mockNotifications));

    await act(async () => {
      await result.current.findAbTests('neural');
    });

    expect(mockService.findAbTests).toHaveBeenCalledWith('neural');
  });

  it('reports an empty list and an error message when the fetch fails', async () => {
    mockService.findAbTests.mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useAbTestList(mockService, mockNotifications));

    let listed;
    await act(async () => {
      listed = await result.current.findAbTests('');
    });

    expect(listed).toEqual({ total: 0, hits: [] });
    expect(result.current.error).toBe('Failed to load A/B tests due to an unknown error.');
  });

  it('bumps the refresh key after a successful delete', async () => {
    mockService.deleteAbTest.mockResolvedValue(undefined);

    const { result } = renderHook(() => useAbTestList(mockService, mockNotifications));
    const initialRefreshKey = result.current.refreshKey;

    await act(async () => {
      await result.current.deleteAbTest('test-1');
    });

    expect(mockService.deleteAbTest).toHaveBeenCalledWith('test-1');
    expect(result.current.refreshKey).toBe(initialRefreshKey + 1);
    expect(mockNotifications.toasts.addSuccess).toHaveBeenCalledWith('A/B test deleted');
    expect(result.current.error).toBe(null);
  });

  it('surfaces a toast and rethrows when the delete fails', async () => {
    const mockError = new Error('Delete failed');
    mockService.deleteAbTest.mockRejectedValue(mockError);

    const { result } = renderHook(() => useAbTestList(mockService, mockNotifications));
    const initialRefreshKey = result.current.refreshKey;

    await act(async () => {
      await expect(result.current.deleteAbTest('test-1')).rejects.toThrow('Delete failed');
    });

    expect(mockNotifications.toasts.addError).toHaveBeenCalled();
    // A failed delete must not look like a successful one.
    expect(result.current.refreshKey).toBe(initialRefreshKey);
  });

  it('clears the loading flag even when the fetch throws', async () => {
    mockService.findAbTests.mockRejectedValue(new Error('boom'));

    const { result } = renderHook(() => useAbTestList(mockService, mockNotifications));

    await act(async () => {
      await result.current.findAbTests('');
    });

    expect(result.current.isLoading).toBe(false);
  });

  it('sets an error manually', () => {
    const { result } = renderHook(() => useAbTestList(mockService, mockNotifications));

    act(() => {
      result.current.setError('Custom error');
    });

    expect(result.current.error).toBe('Custom error');
  });
});
