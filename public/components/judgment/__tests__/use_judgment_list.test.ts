/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { renderHook, act } from '@testing-library/react';
import { useJudgmentList } from '../hooks/use_judgment_list';
import { ServiceEndpoints, extractUserMessageFromError } from '../../../../common';

// Mock extractUserMessageFromError
jest.mock('../../../../common', () => ({
  ...jest.requireActual('../../../../common'),
  extractUserMessageFromError: jest.fn(),
}));

const mockExtractUserMessageFromError = extractUserMessageFromError as jest.MockedFunction<
  typeof extractUserMessageFromError
>;

// Mock useOpenSearchDashboards
const mockAddSuccess = jest.fn();
jest.mock('../../../../../../src/plugins/opensearch_dashboards_react/public', () => ({
  useOpenSearchDashboards: jest.fn(() => ({
    services: {
      notifications: {
        toasts: {
          addSuccess: mockAddSuccess,
        },
      },
    },
  })),
}));

const mockHttp = {
  get: jest.fn(),
  delete: jest.fn(),
};

describe('useJudgmentList', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    mockExtractUserMessageFromError.mockReturnValue(null);
    mockAddSuccess.mockClear();
  });

  afterEach(() => {
    jest.useRealTimers();
    mockExtractUserMessageFromError.mockClear();
  });

  it('should fetch judgments successfully', async () => {
    const mockResponse = {
      hits: {
        hits: [
          {
            _source: {
              id: '1',
              name: 'Test Judgment',
              type: 'LLM',
              status: 'COMPLETED',
              timestamp: '2023-01-01T00:00:00Z',
            },
          },
        ],
      },
    };

    mockHttp.get.mockResolvedValue(mockResponse);

    const { result } = renderHook(() => useJudgmentList(mockHttp as any));

    await act(async () => {
      const response = await result.current.findJudgments();
      expect(response.total).toBe(1);
      expect(response.hits[0].name).toBe('Test Judgment');
    });

    // Existing hook should still request full judgments without status filter
    expect(mockHttp.get).toHaveBeenCalledWith(ServiceEndpoints.Judgments);
  });

  it('should delete judgment successfully', async () => {
    mockHttp.delete.mockResolvedValue({});

    const { result } = renderHook(() => useJudgmentList(mockHttp as any));

    await act(async () => {
      const success = await result.current.deleteJudgment('1');
      expect(success).toBe(true);
    });

    expect(mockHttp.delete).toHaveBeenCalledWith(`${ServiceEndpoints.Judgments}/1`);
  });

  it('should handle delete error', async () => {
    mockHttp.delete.mockRejectedValue(new Error('Delete failed'));

    const { result } = renderHook(() => useJudgmentList(mockHttp as any));

    await act(async () => {
      const success = await result.current.deleteJudgment('1');
      expect(success).toBe(false);
    });

    expect(result.current.error).toBe('Failed to delete judgment');
  });

  it('should filter judgments by search term', async () => {
    const mockResponse = {
      hits: {
        hits: [
          {
            _source: {
              id: '1',
              name: 'Test Judgment',
              type: 'LLM',
              status: 'COMPLETED',
              timestamp: '2023-01-01T00:00:00Z',
            },
          },
          {
            _source: {
              id: '2',
              name: 'Another Judgment',
              type: 'UBI',
              status: 'COMPLETED',
              timestamp: '2023-01-01T00:00:00Z',
            },
          },
        ],
      },
    };

    mockHttp.get.mockResolvedValue(mockResponse);

    const { result } = renderHook(() => useJudgmentList(mockHttp as any));

    await act(async () => {
      const response = await result.current.findJudgments('test');
      expect(response.total).toBe(1);
      expect(response.hits[0].name).toBe('Test Judgment');
    });
  });

  it('should handle fetch error', async () => {
    mockHttp.get.mockRejectedValue(new Error('Fetch failed'));

    const { result } = renderHook(() => useJudgmentList(mockHttp as any));

    await act(async () => {
      const response = await result.current.findJudgments();
      expect(response.total).toBe(0);
      expect(response.hits).toEqual([]);
    });

    expect(result.current.error).toContain('Failed to load judgment lists');
  });

  it('should detect processing judgments', async () => {
    const mockResponse = {
      hits: {
        hits: [
          {
            _source: {
              id: '1',
              name: 'Processing Judgment',
              type: 'LLM',
              status: 'PROCESSING',
              timestamp: '2023-01-01T00:00:00Z',
            },
          },
        ],
      },
    };

    mockHttp.get.mockResolvedValue(mockResponse);

    const { result } = renderHook(() => useJudgmentList(mockHttp as any));

    await act(async () => {
      await result.current.findJudgments();
    });

    expect(result.current.hasProcessing).toBe(true);
  });

  it('should use extracted error message when available', async () => {
    const customError = new Error('Custom error');
    mockHttp.get.mockRejectedValue(customError);
    mockExtractUserMessageFromError.mockReturnValue('Extracted error message');

    const { result } = renderHook(() => useJudgmentList(mockHttp as any));

    await act(async () => {
      await result.current.findJudgments();
    });

    expect(result.current.error).toBe('Extracted error message');
    expect(mockExtractUserMessageFromError).toHaveBeenCalledWith(customError);
  });

  it('should handle empty response', async () => {
    mockHttp.get.mockResolvedValue(null);

    const { result } = renderHook(() => useJudgmentList(mockHttp as any));

    await act(async () => {
      const response = await result.current.findJudgments();
      expect(response.total).toBe(0);
      expect(response.hits).toEqual([]);
    });
  });

  it('should filter judgments by GUID (id search)', async () => {
    const mockResponse = {
      hits: {
        hits: [
          {
            _source: {
              id: 'abc-123-guid',
              name: 'Judgment One',
              type: 'LLM',
              status: 'COMPLETED',
              timestamp: '2023-01-01T00:00:00Z',
            },
          },
          {
            _source: {
              id: 'xyz-999-guid',
              name: 'Another Judgment',
              type: 'UBI',
              status: 'COMPLETED',
              timestamp: '2023-01-01T00:00:00Z',
            },
          },
        ],
      },
    };

    mockHttp.get.mockResolvedValue(mockResponse);

    const { result } = renderHook(() => useJudgmentList(mockHttp as any));

    await act(async () => {
      const response = await result.current.findJudgments('abc-123');
      expect(response.total).toBe(1);
      expect(response.hits[0].id).toBe('abc-123-guid');
      expect(response.hits[0].name).toBe('Judgment One');
    });
  });

  it('should remove deleted item from cached state so findJudgments returns updated list', async () => {
    const mockResponse = {
      hits: {
        hits: [
          {
            _source: {
              id: '1',
              name: 'First Judgment',
              type: 'LLM',
              status: 'COMPLETED',
              timestamp: '2023-01-01T00:00:00Z',
            },
          },
          {
            _source: {
              id: '2',
              name: 'Second Judgment',
              type: 'UBI',
              status: 'COMPLETED',
              timestamp: '2023-01-02T00:00:00Z',
            },
          },
        ],
      },
    };

    mockHttp.get.mockResolvedValue(mockResponse);
    mockHttp.delete.mockResolvedValue({});

    const { result } = renderHook(() => useJudgmentList(mockHttp as any));

    // First, populate the cache by calling findJudgments
    await act(async () => {
      const response = await result.current.findJudgments();
      expect(response.total).toBe(2);
    });

    // Delete judgment '1'
    await act(async () => {
      const success = await result.current.deleteJudgment('1');
      expect(success).toBe(true);
    });

    // Now findJudgments should return only the remaining item from the cache
    await act(async () => {
      const response = await result.current.findJudgments();
      expect(response.total).toBe(1);
      expect(response.hits[0].id).toBe('2');
      expect(response.hits[0].name).toBe('Second Judgment');
    });
  });

  it('should clear previous error on successful delete', async () => {
    // First trigger a fetch error to set the error state
    mockHttp.get.mockRejectedValueOnce(new Error('Fetch failed'));

    const { result } = renderHook(() => useJudgmentList(mockHttp as any));

    await act(async () => {
      await result.current.findJudgments();
    });

    expect(result.current.error).toContain('Failed to load judgment lists');

    // Now perform a successful delete — error should be cleared
    mockHttp.delete.mockResolvedValue({});

    await act(async () => {
      const success = await result.current.deleteJudgment('1');
      expect(success).toBe(true);
    });

    expect(result.current.error).toBeNull();
  });

  it('should increment refreshKey after successful delete', async () => {
    mockHttp.delete.mockResolvedValue({});

    const { result } = renderHook(() => useJudgmentList(mockHttp as any));

    const initialKey = result.current.refreshKey;

    await act(async () => {
      await result.current.deleteJudgment('1');
    });

    expect(result.current.refreshKey).toBe(initialKey + 1);
  });

  it('should result in empty list when the only item is deleted', async () => {
    const mockResponse = {
      hits: {
        hits: [
          {
            _source: {
              id: '1',
              name: 'Only Judgment',
              type: 'LLM',
              status: 'COMPLETED',
              timestamp: '2023-01-01T00:00:00Z',
            },
          },
        ],
      },
    };

    mockHttp.get.mockResolvedValue(mockResponse);
    mockHttp.delete.mockResolvedValue({});

    const { result } = renderHook(() => useJudgmentList(mockHttp as any));

    // Populate cache
    await act(async () => {
      const response = await result.current.findJudgments();
      expect(response.total).toBe(1);
    });

    // Delete the only item
    await act(async () => {
      await result.current.deleteJudgment('1');
    });

    // Cache is now empty, so findJudgments should re-fetch from API.
    // Mock the API to return empty (the item was deleted server-side too).
    mockHttp.get.mockResolvedValue({ hits: { hits: [] } });

    await act(async () => {
      const response = await result.current.findJudgments();
      expect(response.total).toBe(0);
      expect(response.hits).toEqual([]);
    });
  });

  it('should leave remaining items intact when one of many is deleted', async () => {
    const mockResponse = {
      hits: {
        hits: [
          {
            _source: {
              id: 'a',
              name: 'Alpha',
              type: 'LLM',
              status: 'COMPLETED',
              timestamp: '2023-01-01T00:00:00Z',
            },
          },
          {
            _source: {
              id: 'b',
              name: 'Beta',
              type: 'UBI',
              status: 'PROCESSING',
              timestamp: '2023-01-02T00:00:00Z',
            },
          },
          {
            _source: {
              id: 'c',
              name: 'Gamma',
              type: 'LLM',
              status: 'COMPLETED',
              timestamp: '2023-01-03T00:00:00Z',
            },
          },
        ],
      },
    };

    mockHttp.get.mockResolvedValue(mockResponse);
    mockHttp.delete.mockResolvedValue({});

    const { result } = renderHook(() => useJudgmentList(mockHttp as any));

    // Populate cache
    await act(async () => {
      const response = await result.current.findJudgments();
      expect(response.total).toBe(3);
    });

    // Delete the middle item
    await act(async () => {
      await result.current.deleteJudgment('b');
    });

    // Verify remaining items
    await act(async () => {
      const response = await result.current.findJudgments();
      expect(response.total).toBe(2);
      const ids = response.hits.map((h: { id: string }) => h.id);
      expect(ids).toEqual(['a', 'c']);
    });
  });

  it('should not modify cached state on failed delete', async () => {
    const mockResponse = {
      hits: {
        hits: [
          {
            _source: {
              id: '1',
              name: 'Test Judgment',
              type: 'LLM',
              status: 'COMPLETED',
              timestamp: '2023-01-01T00:00:00Z',
            },
          },
        ],
      },
    };

    mockHttp.get.mockResolvedValue(mockResponse);

    const { result } = renderHook(() => useJudgmentList(mockHttp as any));

    // Populate cache
    await act(async () => {
      const response = await result.current.findJudgments();
      expect(response.total).toBe(1);
    });

    // Delete fails
    mockHttp.delete.mockRejectedValue(new Error('Delete failed'));

    await act(async () => {
      const success = await result.current.deleteJudgment('1');
      expect(success).toBe(false);
    });

    // Item should still be in the cache
    await act(async () => {
      const response = await result.current.findJudgments();
      expect(response.total).toBe(1);
      expect(response.hits[0].id).toBe('1');
    });
  });

  it('should not increment refreshKey on failed delete', async () => {
    mockHttp.delete.mockRejectedValue(new Error('Delete failed'));

    const { result } = renderHook(() => useJudgmentList(mockHttp as any));

    const initialKey = result.current.refreshKey;

    await act(async () => {
      await result.current.deleteJudgment('1');
    });

    expect(result.current.refreshKey).toBe(initialKey);
  });

  it('should filter cached tableData by search term', async () => {
    const mockResponse = {
      hits: {
        hits: [
          {
            _source: {
              id: '1',
              name: 'Alpha Judgment',
              type: 'LLM',
              status: 'COMPLETED',
              timestamp: '2023-01-01T00:00:00Z',
            },
          },
          {
            _source: {
              id: '2',
              name: 'Beta Judgment',
              type: 'UBI',
              status: 'COMPLETED',
              timestamp: '2023-01-02T00:00:00Z',
            },
          },
        ],
      },
    };

    mockHttp.get.mockResolvedValue(mockResponse);

    const { result } = renderHook(() => useJudgmentList(mockHttp as any));

    // First call populates the cache
    await act(async () => {
      const response = await result.current.findJudgments();
      expect(response.total).toBe(2);
    });

    // Second call should use cached data and filter by name
    await act(async () => {
      const response = await result.current.findJudgments('alpha');
      expect(response.total).toBe(1);
      expect(response.hits[0].name).toBe('Alpha Judgment');
    });

    // Search by ID should also work from cache
    await act(async () => {
      const response = await result.current.findJudgments('2');
      expect(response.total).toBe(1);
      expect(response.hits[0].id).toBe('2');
    });
  });

  it('should return all cached items when search is empty', async () => {
    const mockResponse = {
      hits: {
        hits: [
          {
            _source: {
              id: '1',
              name: 'First',
              type: 'LLM',
              status: 'COMPLETED',
              timestamp: '2023-01-01T00:00:00Z',
            },
          },
          {
            _source: {
              id: '2',
              name: 'Second',
              type: 'UBI',
              status: 'COMPLETED',
              timestamp: '2023-01-02T00:00:00Z',
            },
          },
        ],
      },
    };

    mockHttp.get.mockResolvedValue(mockResponse);

    const { result } = renderHook(() => useJudgmentList(mockHttp as any));

    // Populate cache
    await act(async () => {
      await result.current.findJudgments();
    });

    // Empty string search should return all
    await act(async () => {
      const response = await result.current.findJudgments('');
      expect(response.total).toBe(2);
    });
  });

  it('should start polling when hasProcessing is true', async () => {
    const mockResponse = {
      hits: {
        hits: [
          {
            _source: {
              id: '1',
              name: 'Processing Judgment',
              type: 'LLM',
              status: 'PROCESSING',
              timestamp: '2023-01-01T00:00:00Z',
            },
          },
        ],
      },
    };

    mockHttp.get.mockResolvedValue(mockResponse);

    const { result } = renderHook(() => useJudgmentList(mockHttp as any));

    await act(async () => {
      await result.current.findJudgments();
    });

    expect(result.current.hasProcessing).toBe(true);
  });

  it('should show completion toast when judgment transitions from PROCESSING to COMPLETED', async () => {
    // Helper to flush microtask queue with fake timers
    const flushPromises = () => new Promise((r) => jest.requireActual('timers').setImmediate(r));

    const processingResponse = {
      hits: {
        hits: [
          {
            _source: {
              id: '1',
              name: 'My Judgment',
              type: 'LLM',
              status: 'PROCESSING',
              timestamp: '2023-01-01T00:00:00Z',
            },
          },
        ],
      },
    };

    const completedResponse = {
      hits: {
        hits: [
          {
            _source: {
              id: '1',
              name: 'My Judgment',
              type: 'LLM',
              status: 'COMPLETED',
              timestamp: '2023-01-01T00:00:00Z',
            },
          },
        ],
      },
    };

    // findJudgments returns PROCESSING (triggers startPolling via useEffect)
    // First poll also returns PROCESSING (populates previousJudgments.current)
    // Second poll returns COMPLETED (detects transition, fires toast)
    mockHttp.get
      .mockResolvedValueOnce(processingResponse)   // findJudgments
      .mockResolvedValueOnce(processingResponse)    // 1st poll — populates previousJudgments
      .mockResolvedValue(completedResponse);         // 2nd poll — detects transition

    const { result } = renderHook(() => useJudgmentList(mockHttp as any));

    await act(async () => {
      await result.current.findJudgments();
    });

    expect(result.current.hasProcessing).toBe(true);

    // 1st poll: populates previousJudgments.current with PROCESSING data
    await act(async () => {
      jest.advanceTimersByTime(15000);
      await flushPromises();
      await flushPromises();
    });

    // 2nd poll: detects PROCESSING→COMPLETED transition, fires toast
    await act(async () => {
      jest.advanceTimersByTime(15000);
      await flushPromises();
      await flushPromises();
    });

    expect(mockAddSuccess).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Judgment Completed',
      })
    );
  });



  it('should handle polling error and increment error count', async () => {
    const flushPromises = () => new Promise((r) => jest.requireActual('timers').setImmediate(r));
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => { });

    const processingResponse = {
      hits: {
        hits: [
          {
            _source: {
              id: '1',
              name: 'Test',
              type: 'LLM',
              status: 'PROCESSING',
              timestamp: '2023-01-01T00:00:00Z',
            },
          },
        ],
      },
    };

    mockHttp.get.mockResolvedValueOnce(processingResponse);

    const { result } = renderHook(() => useJudgmentList(mockHttp as any));

    await act(async () => {
      await result.current.findJudgments();
    });

    // Polling fetch fails
    mockHttp.get.mockRejectedValue(new Error('Network error'));

    await act(async () => {
      jest.advanceTimersByTime(15000);
      await flushPromises();
    });

    expect(consoleSpy).toHaveBeenCalledWith('Background refresh failed:', expect.any(Error));
    consoleSpy.mockRestore();
  });

  it('should stop polling after MAX_POLLING_DURATION', async () => {
    const flushPromises = () => new Promise((r) => jest.requireActual('timers').setImmediate(r));

    const processingResponse = {
      hits: {
        hits: [
          {
            _source: {
              id: '1',
              name: 'Timeout Test',
              type: 'LLM',
              status: 'PROCESSING',
              timestamp: '2023-01-01T00:00:00Z',
            },
          },
        ],
      },
    };

    mockHttp.get.mockResolvedValue(processingResponse);

    const { result } = renderHook(() => useJudgmentList(mockHttp as any));

    await act(async () => {
      await result.current.findJudgments();
    });

    expect(result.current.hasProcessing).toBe(true);

    // Advance past MAX_POLLING_DURATION (10 minutes) to trigger the timeout guard
    await act(async () => {
      jest.advanceTimersByTime(10 * 60 * 1000 + 15000);
      await flushPromises();
    });

    // After timeout, isBackgroundRefreshing should be false
    expect(result.current.isBackgroundRefreshing).toBe(false);
  });
});


