/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { renderHook, act } from '@testing-library/react-hooks';
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
});
