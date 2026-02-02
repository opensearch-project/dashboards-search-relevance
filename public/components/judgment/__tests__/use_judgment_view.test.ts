/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { renderHook, waitFor } from '@testing-library/react';
import { useJudgmentView } from '../hooks/use_judgment_view';
import { ServiceEndpoints } from '../../../../common';

const mockHttp = {
  get: jest.fn(),
};

describe('useJudgmentView', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch judgment by id successfully', async () => {
    const mockResponse = {
      hits: {
        hits: [
          {
            _source: {
              id: '1',
              name: 'Test Judgment',
              type: 'LLM',
              status: 'COMPLETED',
              metadata: { key: 'value' },
              judgmentRatings: { rating: 5 },
              timestamp: '2023-01-01T00:00:00Z',
            },
          },
        ],
      },
    };

    mockHttp.get.mockResolvedValue(mockResponse);

    const { result } = renderHook(() => useJudgmentView(mockHttp as any, '1'));

    await waitFor(() => {});

    expect(result.current.judgment).toEqual({
      id: '1',
      name: 'Test Judgment',
      type: 'LLM',
      status: 'COMPLETED',
      metadata: { key: 'value' },
      judgmentRatings: { rating: 5 },
      timestamp: '2023-01-01T00:00:00Z',
    });
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(null);
  });

  it('should handle judgment not found', async () => {
    const mockResponse = {
      hits: {
        hits: [],
      },
    };

    mockHttp.get.mockResolvedValue(mockResponse);

    const { result } = renderHook(() =>
      useJudgmentView(mockHttp as any, 'nonexistent')
    );

    await waitFor(() => {});

    expect(result.current.judgment).toBe(null);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe('No matching judgment found');
  });

  it('should handle fetch error', async () => {
    mockHttp.get.mockRejectedValue(new Error('Fetch failed'));

    const { result } = renderHook(() => useJudgmentView(mockHttp as any, '1'));

    await waitFor(() => {});

    expect(result.current.judgment).toBe(null);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe('Error loading judgment data');
  });

  it('should format JSON correctly', () => {
    const mockResponse = {
      hits: {
        hits: [
          {
            _source: {
              id: '1',
              name: 'Test Judgment',
              type: 'LLM',
              status: 'COMPLETED',
              metadata: {},
              judgmentRatings: {},
              timestamp: '2023-01-01T00:00:00Z',
            },
          },
        ],
      },
    };

    mockHttp.get.mockResolvedValue(mockResponse);

    const { result } = renderHook(() => useJudgmentView(mockHttp as any, '1'));

    const formatted = result.current.formatJson('{"key":"value"}');
    expect(formatted).toBe('{\n  "key": "value"\n}');
  });

  it('should return original string when JSON parsing fails', () => {
    const mockResponse = {
      hits: {
        hits: [
          {
            _source: {
              id: '1',
              name: 'Test Judgment',
              type: 'LLM',
              status: 'COMPLETED',
              metadata: {},
              judgmentRatings: {},
              timestamp: '2023-01-01T00:00:00Z',
            },
          },
        ],
      },
    };

    mockHttp.get.mockResolvedValue(mockResponse);

    const { result } = renderHook(() => useJudgmentView(mockHttp as any, '1'));

    const formatted = result.current.formatJson('invalid json');
    expect(formatted).toBe('invalid json');
  });
});
