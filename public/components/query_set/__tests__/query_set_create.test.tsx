/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Router } from 'react-router-dom';
import { createMemoryHistory } from 'history';
import { QuerySetCreate } from '../views/query_set_create';

// Mock the service and hooks
jest.mock('../services/query_set_service');
jest.mock('../hooks/use_query_set_form');
jest.mock('../components/query_set_form', () => ({
  QuerySetForm: ({ formState }: any) => (
    <div data-test-subj="query-set-form">
      <input
        data-test-subj="name-input"
        value={formState.name}
        onChange={(e) => formState.setName(e.target.value)}
      />
    </div>
  ),
}));
jest.mock('../components/query_preview', () => ({
  QueryPreview: ({ parsedQueries }: any) => (
    <div data-test-subj="query-preview">{parsedQueries.length} queries</div>
  ),
}));
// Test double for the OSD DataSourceSelector. The component lets the test
// drive `setSelectedDataSource` synchronously to simulate the selector's
// asynchronous resolution.
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
      <button
        type="button"
        data-test-subj="ds-pick-empty"
        onClick={() => setSelectedDataSource('')}
      >
        pick-empty
      </button>
    </div>
  ),
}));

const mockFormState = {
  name: 'Test Query Set',
  setName: jest.fn(),
  description: 'Test description',
  setDescription: jest.fn(),
  sampling: 'random',
  setSampling: jest.fn(),
  querySetSize: 10,
  setQuerySetSize: jest.fn(),
  isManualInput: false,
  setIsManualInput: jest.fn(),
  manualInputMethod: 'file' as const,
  setManualInputMethod: jest.fn(),
  manualQueries: '',
  setManualQueries: jest.fn(),
  files: [],
  setFiles: jest.fn(),
  parsedQueries: [],
  setParsedQueries: jest.fn(),
  ubiQueriesIndex: '',
  setUbiQueriesIndex: jest.fn(),
  ubiEventsIndex: '',
  setUbiEventsIndex: jest.fn(),
  errors: {
    nameError: '',
    descriptionError: '',
    querySizeError: '',
    manualQueriesError: '',
  },
  validateField: jest.fn(),
  isFormValid: jest.fn().mockReturnValue(true),
  handleFileContent: jest.fn(),
  clearFileData: jest.fn(),
  handleTextChange: jest.fn(),
  handleManualInputMethodChange: jest.fn(),
};

const mockQuerySetServiceInstance = {
  createQuerySet: jest.fn(),
  fetchUbiIndexes: jest.fn(),
};

describe('QuerySetCreate', () => {
  let mockHttp: any;
  let mockNotifications: any;
  let history: any;

  beforeEach(() => {
    mockHttp = {};
    mockNotifications = {
      toasts: {
        addSuccess: jest.fn(),
        addError: jest.fn(),
        addDanger: jest.fn(),
      },
    };
    history = createMemoryHistory();

    // Reset mocks
    jest.clearAllMocks();
    mockQuerySetServiceInstance.fetchUbiIndexes.mockResolvedValue([]);

    // Mock the hook return value
    (require('../hooks/use_query_set_form').useQuerySetForm as jest.Mock).mockReturnValue(
      mockFormState
    );
    (require('../services/query_set_service').QuerySetService as jest.Mock).mockImplementation(
      () => mockQuerySetServiceInstance
    );
  });

  const renderComponent = () => {
    return render(
      <Router history={history}>
        <QuerySetCreate
          http={mockHttp}
          notifications={mockNotifications}
          history={history}
          location={history.location}
          match={{ params: {}, isExact: true, path: '', url: '' }}
        />
      </Router>
    );
  };

  it('should render the component correctly', () => {
    renderComponent();

    expect(screen.getByText('Query Set')).toBeInTheDocument();
    expect(screen.getByText(/Create a new query set by/)).toBeInTheDocument();
    expect(screen.getByTestId('query-set-form')).toBeInTheDocument();
  });

  it('should handle successful form submission', async () => {
    mockQuerySetServiceInstance.createQuerySet.mockResolvedValue({ success: true });

    renderComponent();

    const createButton = screen.getByTestId('createQuerySetButton');
    fireEvent.click(createButton);

    await waitFor(() => {
      expect(mockQuerySetServiceInstance.createQuerySet).toHaveBeenCalledWith(
        {
          name: 'Test Query Set',
          description: 'Test description',
          sampling: 'random',
          querySetSize: 10,
          querySetQueries: undefined,
        },
        false,
        undefined
      );
    });

    expect(mockNotifications.toasts.addSuccess).toHaveBeenCalledWith(
      'Query set "Test Query Set" created successfully'
    );
    expect(history.location.pathname).toBe('/querySet');
  });

  it('should handle form submission errors', async () => {
    const error = new Error('API Error');
    mockQuerySetServiceInstance.createQuerySet.mockRejectedValue(error);

    renderComponent();

    const createButton = screen.getByTestId('createQuerySetButton');
    fireEvent.click(createButton);

    await waitFor(() => {
      expect(mockNotifications.toasts.addError).toHaveBeenCalledWith(error, {
        title: 'Failed to create query set',
      });
    });
  });

  it('should not submit when form is invalid', async () => {
    mockFormState.isFormValid.mockReturnValue(false);

    renderComponent();

    const createButton = screen.getByTestId('createQuerySetButton');
    fireEvent.click(createButton);

    expect(mockQuerySetServiceInstance.createQuerySet).not.toHaveBeenCalled();
  });

  it('should handle cancel action', () => {
    renderComponent();

    const cancelButton = screen.getByTestId('cancelQuerySetButton');
    fireEvent.click(cancelButton);

    expect(history.location.pathname).toBe('/querySet');
  });

  it('should show query preview when in manual input mode', () => {
    mockFormState.isManualInput = true;
    mockFormState.parsedQueries = ['query1', 'query2'];

    renderComponent();

    expect(screen.getByTestId('query-preview')).toBeInTheDocument();
    expect(screen.getByText('2 queries')).toBeInTheDocument();
  });

  describe('UBI index fetch gating with multi-data-source', () => {
    const renderWithDataSource = (dataSourceEnabled: boolean) =>
      render(
        <Router history={history}>
          <QuerySetCreate
            http={mockHttp}
            notifications={mockNotifications}
            history={history}
            location={history.location}
            match={{ params: {}, isExact: true, path: '', url: '' }}
            dataSourceEnabled={dataSourceEnabled}
            dataSourceManagement={
              { ui: { DataSourceSelector: () => null } } as any
            }
            savedObjects={{ client: {} } as any}
          />
        </Router>
      );

    it('fetches UBI indexes immediately when multi-data-source is disabled', async () => {
      renderWithDataSource(false);

      await waitFor(() => {
        expect(mockQuerySetServiceInstance.fetchUbiIndexes).toHaveBeenCalledTimes(1);
      });
      // Single-cluster: no dataSourceId argument.
      expect(mockQuerySetServiceInstance.fetchUbiIndexes).toHaveBeenCalledWith(undefined);
    });

    it('defers UBI index fetch until selector reports when multi-data-source is enabled', async () => {
      renderWithDataSource(true);

      // Allow effects to flush; the gate must keep the fetch from firing.
      await new Promise((resolve) => setTimeout(resolve, 0));
      expect(mockQuerySetServiceInstance.fetchUbiIndexes).not.toHaveBeenCalled();

      // Selector reports a chosen data source — fetch must run with that id.
      fireEvent.click(screen.getByTestId('ds-pick-foo'));

      await waitFor(() => {
        expect(mockQuerySetServiceInstance.fetchUbiIndexes).toHaveBeenCalledTimes(1);
      });
      expect(mockQuerySetServiceInstance.fetchUbiIndexes).toHaveBeenCalledWith('foo-ds');
    });

    it('fetches against the local cluster when the selector resolves to local (empty id)', async () => {
      renderWithDataSource(true);

      await new Promise((resolve) => setTimeout(resolve, 0));
      expect(mockQuerySetServiceInstance.fetchUbiIndexes).not.toHaveBeenCalled();

      // Selector picks the local cluster — empty id is a legitimate selection,
      // not a "not initialized yet" state. The fetch must still fire.
      fireEvent.click(screen.getByTestId('ds-pick-empty'));

      await waitFor(() => {
        expect(mockQuerySetServiceInstance.fetchUbiIndexes).toHaveBeenCalledTimes(1);
      });
      expect(mockQuerySetServiceInstance.fetchUbiIndexes).toHaveBeenCalledWith(undefined);
    });
  });
});
