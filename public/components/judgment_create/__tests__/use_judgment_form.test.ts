/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { renderHook, act } from '@testing-library/react-hooks';
import { useJudgmentForm } from '../hooks/use_judgment_form';
import { JudgmentType } from '../types';

// Mock the service
const mockService = {
  fetchQuerySets: jest.fn().mockResolvedValue([]),
  fetchSearchConfigs: jest.fn().mockResolvedValue([]),
  fetchModels: jest.fn().mockResolvedValue([]),
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
});
