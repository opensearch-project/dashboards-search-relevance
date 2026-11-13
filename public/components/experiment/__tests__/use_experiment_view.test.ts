/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { renderHook, waitFor } from '@testing-library/react';
import { useExperimentView } from '../hooks/use_experiment_view';

jest.mock('../../../types/index', () => ({
  toExperiment: jest.fn((source: any) => ({ success: true, data: source })),
}));

const { toExperiment: mockToExperiment } = jest.requireMock('../../../types/index');

const mockHttp = {
  get: jest.fn(),
};

describe('useExperimentView', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockToExperiment.mockImplementation((source: any) => ({ success: true, data: source }));
  });

  it('fetches an experiment by id successfully', async () => {
    mockHttp.get.mockResolvedValue({
      hits: { hits: [{ _source: { id: '1', type: 'PAIRWISE_COMPARISON', status: 'COMPLETED' } }] },
    });

    const { result } = renderHook(() => useExperimentView(mockHttp as any, '1'));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.experiment).toEqual({
      id: '1',
      type: 'PAIRWISE_COMPARISON',
      status: 'COMPLETED',
    });
    expect(result.current.error).toBe(null);
  });

  it('handles experiment not found', async () => {
    mockHttp.get.mockResolvedValue({ hits: { hits: [] } });

    const { result } = renderHook(() => useExperimentView(mockHttp as any, 'nonexistent'));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.experiment).toBe(null);
    expect(result.current.error).toBe('No matching experiment found');
  });

  it('surfaces the 404 message distinctly from other errors', async () => {
    mockHttp.get.mockRejectedValue({ body: { statusCode: 404, message: 'Document not found: abc' } });

    const { result } = renderHook(() => useExperimentView(mockHttp as any, '1'));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.experiment).toBe(null);
    expect(result.current.error).toBe('No matching experiment found');
  });

  it('surfaces the raw backend error message for non-404 failures', async () => {
    mockHttp.get.mockRejectedValue({ body: { statusCode: 403, message: 'security_exception' } });

    const { result } = renderHook(() => useExperimentView(mockHttp as any, '1'));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBe('security_exception');
  });

  it('falls back to a generic message when no backend message is present', async () => {
    mockHttp.get.mockRejectedValue(new Error('network down'));

    const { result } = renderHook(() => useExperimentView(mockHttp as any, '1'));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBe('Error loading experiment data');
  });

  it('passes dataSourceId when fetching an experiment', async () => {
    mockHttp.get.mockResolvedValue({
      hits: { hits: [{ _source: { id: '1', status: 'COMPLETED' } }] },
    });

    renderHook(() => useExperimentView(mockHttp as any, '1', 'my-ds'));

    await waitFor(() => expect(mockHttp.get).toHaveBeenCalled());

    expect(mockHttp.get).toHaveBeenCalledWith('/api/relevancy/experiments/1', {
      query: { dataSourceId: 'my-ds' },
    });
  });

  it('polls while status is PROCESSING and stops once COMPLETED', async () => {
    jest.useFakeTimers();

    mockHttp.get
      .mockResolvedValueOnce({
        hits: { hits: [{ _source: { id: '1', status: 'PROCESSING' } }] },
      })
      .mockResolvedValueOnce({
        hits: { hits: [{ _source: { id: '1', status: 'COMPLETED' } }] },
      });

    const { result } = renderHook(() => useExperimentView(mockHttp as any, '1'));

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.experiment?.status).toBe('PROCESSING');

    jest.advanceTimersByTime(5000);

    await waitFor(() => expect(result.current.experiment?.status).toBe('COMPLETED'));
    expect(mockHttp.get).toHaveBeenCalledTimes(2);

    jest.useRealTimers();
  });

  it('stops polling after repeated poll-tick errors and surfaces a retryable warning', async () => {
    jest.useFakeTimers();

    mockHttp.get
      .mockResolvedValueOnce({
        hits: { hits: [{ _source: { id: '1', status: 'PROCESSING' } }] },
      })
      .mockRejectedValue(new Error('poll failed'));

    const { result } = renderHook(() => useExperimentView(mockHttp as any, '1'));

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.experiment?.status).toBe('PROCESSING');

    jest.advanceTimersByTime(5000);
    await waitFor(() => expect(mockHttp.get).toHaveBeenCalledTimes(2));
    jest.advanceTimersByTime(5000);
    await waitFor(() => expect(mockHttp.get).toHaveBeenCalledTimes(3));
    jest.advanceTimersByTime(5000);
    await waitFor(() => expect(mockHttp.get).toHaveBeenCalledTimes(4));

    // A 5th tick should not occur since polling stops after MAX_POLL_ERRORS (3) failures.
    jest.advanceTimersByTime(5000);
    expect(mockHttp.get).toHaveBeenCalledTimes(4);
    expect(result.current.experiment?.status).toBe('PROCESSING');
    expect(result.current.error).toBe(null);
    expect(result.current.warning).toMatch(/Lost connection/);

    jest.useRealTimers();
  });

  it('stops polling after repeated empty poll-tick responses and surfaces a retryable warning', async () => {
    jest.useFakeTimers();

    mockHttp.get
      .mockResolvedValueOnce({
        hits: { hits: [{ _source: { id: '1', status: 'PROCESSING' } }] },
      })
      .mockResolvedValue({ hits: { hits: [] } });

    const { result } = renderHook(() => useExperimentView(mockHttp as any, '1'));

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.experiment?.status).toBe('PROCESSING');

    jest.advanceTimersByTime(5000);
    await waitFor(() => expect(mockHttp.get).toHaveBeenCalledTimes(2));
    jest.advanceTimersByTime(5000);
    await waitFor(() => expect(mockHttp.get).toHaveBeenCalledTimes(3));
    jest.advanceTimersByTime(5000);
    await waitFor(() => expect(mockHttp.get).toHaveBeenCalledTimes(4));

    // A 5th tick should not occur since polling stops after MAX_POLL_ERRORS (3)
    // consecutive empty responses, same as for thrown errors.
    jest.advanceTimersByTime(5000);
    expect(mockHttp.get).toHaveBeenCalledTimes(4);
    expect(result.current.experiment?.status).toBe('PROCESSING');
    expect(result.current.error).toBe(null);
    expect(result.current.warning).toMatch(/Lost connection/);

    jest.useRealTimers();
  });

  it('does not update state after unmount while a fetch is in flight', async () => {
    let resolveFetch: (value: any) => void = () => {};
    mockHttp.get.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveFetch = resolve;
        })
    );

    const { unmount } = renderHook(() => useExperimentView(mockHttp as any, '1'));

    unmount();

    expect(() =>
      resolveFetch({ hits: { hits: [{ _source: { id: '1', status: 'COMPLETED' } }] } })
    ).not.toThrow();
  });

  it('refetch() triggers a fresh loading fetch', async () => {
    mockHttp.get.mockResolvedValue({
      hits: { hits: [{ _source: { id: '1', status: 'COMPLETED' } }] },
    });

    const { result } = renderHook(() => useExperimentView(mockHttp as any, '1'));

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(mockHttp.get).toHaveBeenCalledTimes(1);

    result.current.refetch();

    await waitFor(() => expect(mockHttp.get).toHaveBeenCalledTimes(2));
  });
});
