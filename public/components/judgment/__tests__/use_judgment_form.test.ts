/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { renderHook, act } from '@testing-library/react';
import { useJudgmentForm } from '../hooks/use_judgment_form';
import { JudgmentType } from '../types';

// Mock the service
const mockService = {
  fetchQuerySets: jest.fn().mockResolvedValue([]),
  fetchSearchConfigs: jest.fn().mockResolvedValue([]),
  fetchModels: jest.fn().mockResolvedValue([]),
  fetchUbiIndexes: jest.fn().mockResolvedValue([]),
  createJudgment: jest.fn().mockResolvedValue({}),
};

jest.mock('../services/judgment_service', () => ({
  JudgmentService: jest.fn(() => mockService),
}));

const mockHttp = {};
const mockNotifications = {
  toasts: {
    addDanger: jest.fn(),
    addSuccess: jest.fn(),
    addError: jest.fn(),
  },
};

describe('useJudgmentForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize with default values', () => {
    const { result } = renderHook(() => useJudgmentForm(mockHttp, mockNotifications));

    expect(result.current.formData.name).toBe('');
    expect(result.current.formData.type).toBe(JudgmentType.LLM);
    expect(result.current.formData.size).toBe(5);
    expect(result.current.formData.tokenLimit).toBe(4000);
    expect(result.current.formData.ignoreFailure).toBe(false);
    expect(result.current.formData.clickModel).toBe('coec');
    expect(result.current.formData.maxRank).toBe(20);
    expect(result.current.formData.contextFields).toEqual([]);
  });

  it('should update form data', () => {
    const { result } = renderHook(() => useJudgmentForm(mockHttp, mockNotifications));

    act(() => {
      result.current.updateFormData({ name: 'test' });
    });

    expect(result.current.formData.name).toBe('test');
  });

  it('should handle new context field', () => {
    const { result } = renderHook(() => useJudgmentForm(mockHttp, mockNotifications));

    act(() => {
      result.current.setNewContextField('field1');
    });

    expect(result.current.newContextField).toBe('field1');
  });

  it('should add context field', () => {
    const { result } = renderHook(() => useJudgmentForm(mockHttp, mockNotifications));

    act(() => {
      result.current.setNewContextField('field1');
    });

    act(() => {
      result.current.addContextField();
    });

    expect(result.current.formData.contextFields).toContain('field1');
    expect(result.current.newContextField).toBe('');
  });

  it('should not add duplicate context field', () => {
    const { result } = renderHook(() => useJudgmentForm(mockHttp, mockNotifications));

    act(() => {
      result.current.updateFormData({ contextFields: ['field1'] });
      result.current.setNewContextField('field1');
    });

    act(() => {
      result.current.addContextField();
    });

    expect(result.current.formData.contextFields).toEqual(['field1']);
  });

  it('should remove context field', () => {
    const { result } = renderHook(() => useJudgmentForm(mockHttp, mockNotifications));

    act(() => {
      result.current.updateFormData({ contextFields: ['field1', 'field2'] });
    });

    act(() => {
      result.current.removeContextField('field1');
    });

    expect(result.current.formData.contextFields).toEqual(['field2']);
  });

  it('should validate and submit UBI form', async () => {
    const { result } = renderHook(() => useJudgmentForm(mockHttp, mockNotifications));
    const mockOnSuccess = jest.fn();

    act(() => {
      result.current.updateFormData({ name: 'test', type: JudgmentType.UBI });
    });

    await act(async () => {
      await result.current.validateAndSubmit(mockOnSuccess);
    });

    expect(mockService.createJudgment).toHaveBeenCalled();
    expect(mockNotifications.toasts.addSuccess).toHaveBeenCalledWith(
      'Judgment created successfully'
    );
    expect(mockOnSuccess).toHaveBeenCalled();
  });

  it('should handle validation errors', async () => {
    const { result } = renderHook(() => useJudgmentForm(mockHttp, mockNotifications));
    const mockOnSuccess = jest.fn();

    await act(async () => {
      await result.current.validateAndSubmit(mockOnSuccess);
    });

    expect(result.current.nameError).toBe('Name is a required parameter.');
    expect(mockOnSuccess).not.toHaveBeenCalled();
  });

  it('should handle API errors', async () => {
    const { result } = renderHook(() => useJudgmentForm(mockHttp, mockNotifications));
    const mockOnSuccess = jest.fn();
    const error = new Error('API Error');
    mockService.createJudgment.mockRejectedValue(error);

    act(() => {
      result.current.updateFormData({ name: 'test', type: JudgmentType.UBI });
    });

    await act(async () => {
      await result.current.validateAndSubmit(mockOnSuccess);
    });

    expect(mockNotifications.toasts.addError).toHaveBeenCalledWith(error, {
      title: 'Failed to create judgment',
    });
  });

  it('should handle LLM validation errors', async () => {
    const { result } = renderHook(() => useJudgmentForm(mockHttp, mockNotifications));
    const mockOnSuccess = jest.fn();

    act(() => {
      result.current.updateFormData({ name: 'test', type: JudgmentType.LLM });
    });

    await act(async () => {
      await result.current.validateAndSubmit(mockOnSuccess);
    });

    expect(mockNotifications.toasts.addDanger).toHaveBeenCalledWith('Please select a query set');
    expect(mockNotifications.toasts.addDanger).toHaveBeenCalledWith(
      'Please select at least one search configuration'
    );
    expect(mockNotifications.toasts.addDanger).toHaveBeenCalledWith('Please select a model id');
  });

  it('should fetch only indexes for UBI type', async () => {
    mockService.fetchUbiIndexes.mockResolvedValue([
      { label: 'ubi-index-1', value: 'ubi-1' },
    ]);

    const { result } = renderHook(() => useJudgmentForm(mockHttp, mockNotifications));

    act(() => {
      result.current.updateFormData({ type: JudgmentType.UBI });
    });

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    // For UBI, only index fetch should be called, not query sets, configs, or models
    expect(mockService.fetchUbiIndexes).toHaveBeenCalled();
  });

  it('should handle index fetch error for UBI type', async () => {
    mockService.fetchUbiIndexes.mockRejectedValue(new Error('Index fetch error'));

    const { result } = renderHook(() => useJudgmentForm(mockHttp, mockNotifications));

    act(() => {
      result.current.updateFormData({ type: JudgmentType.UBI });
    });

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(mockNotifications.toasts.addDanger).toHaveBeenCalledWith('Failed to fetch indexes');
  });

  it('should handle LLM fetch errors for query sets', async () => {
    mockService.fetchQuerySets.mockRejectedValue(new Error('Query set error'));

    const { result } = renderHook(() => useJudgmentForm(mockHttp, mockNotifications));

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(mockNotifications.toasts.addDanger).toHaveBeenCalledWith('Failed to fetch query sets');
  });

  it('should handle LLM fetch errors for search configs', async () => {
    mockService.fetchSearchConfigs.mockRejectedValue(new Error('Search config error'));

    const { result } = renderHook(() => useJudgmentForm(mockHttp, mockNotifications));

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(mockNotifications.toasts.addDanger).toHaveBeenCalledWith(
      'Failed to fetch search configurations'
    );
  });

  it('should handle LLM fetch errors for models', async () => {
    mockService.fetchModels.mockRejectedValue(new Error('Model error'));

    const { result } = renderHook(() => useJudgmentForm(mockHttp, mockNotifications));

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(mockNotifications.toasts.addDanger).toHaveBeenCalledWith('Failed to fetch models');
  });

  it('should handle date range validation error for UBI', async () => {
    const { result } = renderHook(() => useJudgmentForm(mockHttp, mockNotifications));
    const mockOnSuccess = jest.fn();

    act(() => {
      result.current.updateFormData({
        name: 'test',
        type: JudgmentType.UBI,
        startDate: '2023-12-31',
        endDate: '2023-01-01',
      });
    });

    await act(async () => {
      await result.current.validateAndSubmit(mockOnSuccess);
    });

    expect(result.current.dateRangeError).toBe('End Date cannot be earlier than Start Date.');
    expect(mockNotifications.toasts.addDanger).toHaveBeenCalledWith(
      'End Date cannot be earlier than Start Date.'
    );
    expect(mockOnSuccess).not.toHaveBeenCalled();
  });

  it('should set loading states during LLM data fetch', async () => {
    // Delay service responses to observe loading states
    let resolveIndexes: (value: any) => void;
    mockService.fetchUbiIndexes.mockReturnValue(
      new Promise((resolve) => {
        resolveIndexes = resolve;
      })
    );

    const { result } = renderHook(() => useJudgmentForm(mockHttp, mockNotifications));

    // Initially loading states should be set
    expect(result.current.isLoadingIndexes).toBe(true);

    // Resolve the promise
    await act(async () => {
      resolveIndexes!([]);
      await new Promise((resolve) => setTimeout(resolve, 0));
    });
  });

  it('should add a context field when newContextField is set', async () => {
    const { result } = renderHook(() => useJudgmentForm(mockHttp, mockNotifications));

    // Set newContextField
    act(() => {
      result.current.setNewContextField('title');
    });

    // Call addContextField
    act(() => {
      result.current.addContextField();
    });

    expect(result.current.formData.contextFields).toContain('title');
    expect(result.current.newContextField).toBe('');
  });

  it('should not add duplicate context field', async () => {
    const { result } = renderHook(() => useJudgmentForm(mockHttp, mockNotifications));

    // Add a field first
    act(() => {
      result.current.setNewContextField('title');
    });
    act(() => {
      result.current.addContextField();
    });

    // Try to add the same field again
    act(() => {
      result.current.setNewContextField('title');
    });
    act(() => {
      result.current.addContextField();
    });

    // Should only appear once
    const titleCount = result.current.formData.contextFields?.filter((f) => f === 'title').length;
    expect(titleCount).toBe(1);
  });

  it('should not add empty context field', async () => {
    const { result } = renderHook(() => useJudgmentForm(mockHttp, mockNotifications));

    // newContextField is empty by default
    act(() => {
      result.current.addContextField();
    });

    expect(result.current.formData.contextFields || []).toHaveLength(0);
  });

  it('should remove a context field', async () => {
    const { result } = renderHook(() => useJudgmentForm(mockHttp, mockNotifications));

    // Add a field first
    act(() => {
      result.current.setNewContextField('title');
    });
    act(() => {
      result.current.addContextField();
    });

    expect(result.current.formData.contextFields).toContain('title');

    // Remove it
    act(() => {
      result.current.removeContextField('title');
    });

    expect(result.current.formData.contextFields).not.toContain('title');
  });
});

