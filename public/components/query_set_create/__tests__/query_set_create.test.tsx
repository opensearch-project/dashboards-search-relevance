/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Router } from 'react-router-dom';
import { createMemoryHistory } from 'history';
import { QuerySetCreate } from '../query_set_create';

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
  manualQueries: '',
  setManualQueries: jest.fn(),
  files: [],
  setFiles: jest.fn(),
  parsedQueries: [],
  setParsedQueries: jest.fn(),
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
};

const mockQuerySetServiceInstance = {
  createQuerySet: jest.fn(),
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
      },
    };
    history = createMemoryHistory();

    // Reset mocks
    jest.clearAllMocks();

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
        false
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
});
