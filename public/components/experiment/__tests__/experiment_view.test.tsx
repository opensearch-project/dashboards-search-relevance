/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { ExperimentView } from '../views/experiment_view';

const ExperimentType = {
  PAIRWISE_COMPARISON: 'PAIRWISE_COMPARISON',
  POINTWISE_EVALUATION: 'POINTWISE_EVALUATION',
  HYBRID_OPTIMIZER: 'HYBRID_OPTIMIZER',
};

jest.mock('../../../types', () => ({
  toExperiment: (source) => ({ success: true, data: source }),
}));

const mockHttp = {
  get: jest.fn(),
};

const mockNotifications = {
  toasts: {
    addError: jest.fn(),
    addSuccess: jest.fn(),
  },
};

const mockHistory = {
  push: jest.fn(),
};

jest.mock('../views/pairwise_experiment_view', () => ({
  PairwiseExperimentViewWithRouter: () => <div>Pairwise View</div>,
}));

jest.mock('../views/evaluation_experiment_view', () => ({
  EvaluationExperimentViewWithRouter: () => <div>Evaluation View</div>,
}));

jest.mock('../views/hybrid_optimizer_experiment_view', () => ({
  HybridOptimizerExperimentViewWithRouter: () => <div>Hybrid View</div>,
}));

describe('ExperimentView', () => {
  const defaultProps = {
    http: mockHttp,
    notifications: mockNotifications,
    id: 'test-experiment-id',
    history: mockHistory,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders page header', () => {
    mockHttp.get.mockResolvedValue({ hits: { hits: [] } });

    render(<ExperimentView {...defaultProps} />);

    expect(screen.getByText('Experiment Visualization')).toBeInTheDocument();
  });

  it('renders experiment views for different types', async () => {
    const mockExperiment = {
      id: 'exp-1',
      type: ExperimentType.PAIRWISE_COMPARISON,
    };

    mockHttp.get.mockResolvedValue({
      hits: {
        hits: [{ _source: mockExperiment }],
      },
    });

    render(<ExperimentView {...defaultProps} />);

    await waitFor(() => {
      expect(mockHttp.get).toHaveBeenCalled();
    });
  });

  it('handles fetch error', async () => {
    mockHttp.get.mockRejectedValue(new Error('Fetch failed'));

    render(<ExperimentView {...defaultProps} />);

    await waitFor(() => {
      expect(mockHttp.get).toHaveBeenCalledWith('/api/relevancy/experiments/test-experiment-id');
    });
  });

  it('handles no experiment found', async () => {
    mockHttp.get.mockResolvedValue({ hits: { hits: [] } });

    render(<ExperimentView {...defaultProps} />);

    await waitFor(() => {
      expect(mockHttp.get).toHaveBeenCalled();
    });
  });
});
