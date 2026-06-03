/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { JudgmentCreate } from '../views/judgment_create';

const mockHttp = {
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
};

const mockNotifications = {
  toasts: {
    addDanger: jest.fn(),
    addSuccess: jest.fn(),
    addError: jest.fn(),
  },
};

const mockHistory = {
  push: jest.fn(),
};

jest.mock('../hooks/use_judgment_form', () => ({
  useJudgmentForm: () => ({
    formData: { name: '', type: 'LLM_JUDGMENT', ignoreFailure: false, contextFields: [] },
    updateFormData: jest.fn(),
    selectedQuerySet: [],
    setSelectedQuerySet: jest.fn(),
    selectedSearchConfigs: [],
    setSelectedSearchConfigs: jest.fn(),
    selectedModel: [],
    setSelectedModel: jest.fn(),
    querySetOptions: [],
    searchConfigOptions: [],
    modelOptions: [],
    isLoadingQuerySets: false,
    isLoadingSearchConfigs: false,
    isLoadingModels: false,
    nameError: '',
    newContextField: '',
    setNewContextField: jest.fn(),
    addContextField: jest.fn(),
    removeContextField: jest.fn(),
    validateAndSubmit: jest.fn(),
  }),
}));

// Test double for the OSD DataSourceSelector. The button lets the test drive
// the `setSelectedDataSource` callback synchronously to simulate the real
// selector resolving its default after mount.
jest.mock('../../common/datasource_selector', () => ({
  DataSourceSelector: ({ setSelectedDataSource }: any) => (
    <div data-test-subj="mock-datasource-selector">
      <button
        type="button"
        data-test-subj="ds-pick-foo"
        onClick={() => setSelectedDataSource('foo-ds')}
      >
        pick-foo
      </button>
    </div>
  ),
}));

describe('JudgmentCreate', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockHttp.get.mockResolvedValue({ hits: { hits: [] } });
    mockHttp.post.mockResolvedValue({ hits: { hits: [] } });
  });

  it('should render correctly', () => {
    render(
      <JudgmentCreate http={mockHttp} notifications={mockNotifications} history={mockHistory} />
    );

    expect(screen.getByText('Judgment List')).toBeInTheDocument();
    expect(screen.getByText('Configure a new judgment list.')).toBeInTheDocument();
  });

  it('should handle cancel button click', () => {
    render(
      <JudgmentCreate http={mockHttp} notifications={mockNotifications} history={mockHistory} />
    );

    fireEvent.click(screen.getByTestId('cancelJudgmentButton'));
    expect(mockHistory.push).toHaveBeenCalledWith('/judgment');
  });

  it('should handle create button click', () => {
    const mockValidateAndSubmit = jest.fn((callback) => callback());

    const useJudgmentFormMock = jest.requireMock('../hooks/use_judgment_form');
    useJudgmentFormMock.useJudgmentForm = jest.fn(() => ({
      formData: { name: 'test', type: 'LLM_JUDGMENT', ignoreFailure: false, contextFields: [] },
      updateFormData: jest.fn(),
      selectedQuerySet: [],
      setSelectedQuerySet: jest.fn(),
      selectedSearchConfigs: [],
      setSelectedSearchConfigs: jest.fn(),
      selectedModel: [],
      setSelectedModel: jest.fn(),
      querySetOptions: [],
      searchConfigOptions: [],
      modelOptions: [],
      isLoadingQuerySets: false,
      isLoadingSearchConfigs: false,
      isLoadingModels: false,
      nameError: '',
      newContextField: '',
      setNewContextField: jest.fn(),
      addContextField: jest.fn(),
      removeContextField: jest.fn(),
      validateAndSubmit: mockValidateAndSubmit,
    }));

    render(
      <JudgmentCreate http={mockHttp} notifications={mockNotifications} history={mockHistory} />
    );

    fireEvent.click(screen.getByTestId('createJudgmentButton'));
    expect(mockValidateAndSubmit).toHaveBeenCalled();
    expect(mockHistory.push).toHaveBeenCalledWith('/judgment');
  });

  it('should render with data source enabled', () => {
    render(
      <JudgmentCreate
        http={mockHttp}
        notifications={mockNotifications}
        history={mockHistory}
        dataSourceEnabled={true}
        dataSourceManagement={{ ui: { DataSourceSelector: () => null } } as any}
        savedObjects={{ client: {} } as any}
        navigation={{} as any}
        setActionMenu={jest.fn()}
      />
    );

    expect(screen.getByTestId('mock-datasource-selector')).toBeInTheDocument();
  });

  describe('multi-data-source initialization gating', () => {
    // Capture every (http, notifications, dataSourceId, dataSourceEnabled,
    // dataSourceInitialized) tuple the view passes into useJudgmentForm so we
    // can assert on the gating flag directly.
    const installCapturingHook = (): any[] => {
      const captured: any[] = [];
      const useJudgmentFormMock = jest.requireMock('../hooks/use_judgment_form');
      useJudgmentFormMock.useJudgmentForm = jest.fn((...args: any[]) => {
        captured.push(args);
        return {
          formData: { name: '', type: 'LLM_JUDGMENT', ignoreFailure: false, contextFields: [] },
          updateFormData: jest.fn(),
          selectedQuerySet: [],
          setSelectedQuerySet: jest.fn(),
          selectedSearchConfigs: [],
          setSelectedSearchConfigs: jest.fn(),
          selectedModel: [],
          setSelectedModel: jest.fn(),
          querySetOptions: [],
          searchConfigOptions: [],
          modelOptions: [],
          isLoadingQuerySets: false,
          isLoadingSearchConfigs: false,
          isLoadingModels: false,
          nameError: '',
          newContextField: '',
          setNewContextField: jest.fn(),
          addContextField: jest.fn(),
          removeContextField: jest.fn(),
          validateAndSubmit: jest.fn(),
        };
      });
      return captured;
    };

    it('passes dataSourceInitialized=true to the form hook when multi-data-source is disabled', () => {
      const captured = installCapturingHook();

      render(
        <JudgmentCreate
          http={mockHttp}
          notifications={mockNotifications}
          history={mockHistory}
        />
      );

      const lastCall = captured[captured.length - 1];
      // Signature: (http, notifications, dataSourceId, dataSourceEnabled, dataSourceInitialized)
      expect(lastCall[3]).toBe(false);
      expect(lastCall[4]).toBe(true);
    });

    it('starts with dataSourceInitialized=false when multi-data-source is enabled and flips to true after the selector reports', () => {
      const captured = installCapturingHook();

      render(
        <JudgmentCreate
          http={mockHttp}
          notifications={mockNotifications}
          history={mockHistory}
          dataSourceEnabled={true}
          dataSourceManagement={{ ui: { DataSourceSelector: () => null } } as any}
          savedObjects={{ client: {} } as any}
        />
      );

      const firstCall = captured[0];
      expect(firstCall[3]).toBe(true);
      expect(firstCall[4]).toBe(false);

      // Selector reports a data source — gate opens, hook re-runs with both
      // the new dataSourceId and dataSourceInitialized=true.
      fireEvent.click(screen.getByTestId('ds-pick-foo'));

      const lastCall = captured[captured.length - 1];
      expect(lastCall[2]).toBe('foo-ds');
      expect(lastCall[3]).toBe(true);
      expect(lastCall[4]).toBe(true);
    });
  });
});
