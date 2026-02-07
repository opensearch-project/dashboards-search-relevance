/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import { ExperimentListing } from '../views/experiment_listing';

const mockHttp = {
  get: jest.fn(),
  delete: jest.fn(),
};

const mockHistory = {
  push: jest.fn(),
};

let capturedFindItems: any = null;

const mockGetExperiments = jest.fn();
const mockDeleteExperiment = jest.fn();

jest.mock('../services/experiment_service', () => {
  return {
    ExperimentService: jest.fn().mockImplementation(() => ({
      getExperiments: mockGetExperiments,
      deleteExperiment: mockDeleteExperiment,
    })),
  };
});

jest.mock('../../../contexts/date_format_context', () => ({
  useConfig: () => ({ dateFormat: 'YYYY-MM-DD' }),
}));

jest.mock('../../../../../../src/plugins/opensearch_dashboards_react/public', () => {
  const React = require('react');
  return {
    useOpenSearchDashboards: () => ({
      services: {
        notifications: { toasts: { addSuccess: jest.fn() } },
        share: {},
      },
    }),
    TableListView: ({ findItems }) => {
      capturedFindItems = findItems;
      React.useEffect(() => {
        findItems('');
      }, []);
      return React.createElement('div', { 'data-testid': 'table-list-view' }, 'Table List View');
    },
    reactRouterNavigate: () => ({}),
  };
});

jest.mock('../template_card/template_cards', () => ({
  TemplateCards: () => <div>Template Cards</div>,
}));

jest.mock('../../common/DeleteModal', () => ({
  DeleteModal: ({ onClose, onConfirm }) => (
    <div>
      <button onClick={onClose}>Cancel</button>
      <button onClick={onConfirm}>Confirm</button>
    </div>
  ),
}));

describe('ExperimentListing', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    capturedFindItems = null;
  });

  it('renders page header and template cards', () => {
    mockHttp.get.mockResolvedValue({ hits: { hits: [] } });

    render(<ExperimentListing http={mockHttp} history={mockHistory} />);

    expect(screen.getByText('Experiments')).toBeInTheDocument();
    expect(screen.getByText('Template Cards')).toBeInTheDocument();
    expect(screen.getByText('Table List View')).toBeInTheDocument();
  });

  it('renders refresh and install dashboards buttons', () => {
    mockHttp.get.mockResolvedValue({ hits: { hits: [] } });

    render(<ExperimentListing http={mockHttp} history={mockHistory} />);

    expect(screen.getByText('Refresh')).toBeInTheDocument();
    expect(screen.getByText('Install Dashboards')).toBeInTheDocument();
  });

  it('handles experiment deletion', async () => {
    const mockExperiment = { id: 'exp-1', type: 'PAIRWISE_COMPARISON' };
    mockHttp.get.mockResolvedValue({ hits: { hits: [] } });
    mockHttp.delete.mockResolvedValue({});

    render(<ExperimentListing http={mockHttp} history={mockHistory} />);

    // Simulate delete action would be triggered from table actions
    // This is a simplified test since the actual delete is triggered from table row actions
    expect(screen.queryByText('Cancel')).not.toBeInTheDocument();
  });

  it('displays error message when fetch fails', async () => {
    mockHttp.get.mockRejectedValue(new Error('Fetch failed'));

    render(<ExperimentListing http={mockHttp} history={mockHistory} />);

    await waitFor(() => {
      expect(screen.getByText('Error')).toBeInTheDocument();
    });
  });

  it('filters by id, type, and status', async () => {
    const mockData = [
      { id: "exp-1", type: "PAIRWISE", status: "RUNNING" },
      { id: "exp-2", type: "HYBRID", status: "FAILED" },
      { id: "xyz-123", type: "POINTWISE", status: "COMPLETED" }
    ];

    mockGetExperiments.mockResolvedValue({
      success: true,
      data: mockData
    });

    render(<ExperimentListing http={mockHttp} history={mockHistory} />);

    await waitFor(() => expect(capturedFindItems).toBeDefined());

    await act(async () => {
      await capturedFindItems("");
    });
    // 1. Search by ID
    let result = await capturedFindItems("xyz");
    expect(result.hits.length).toBe(1);
    expect(result.hits[0].id).toBe("xyz-123");

    // 2. Search by TYPE
    result = await capturedFindItems("pairwise");
    expect(result.hits.length).toBe(1);
    expect(result.hits[0].type).toBe("PAIRWISE");

    // 3. Search by STATUS
    result = await capturedFindItems("completed");
    expect(result.hits.length).toBe(1);
    expect(result.hits[0].status).toBe("COMPLETED");
  });
});
