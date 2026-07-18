/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { render, screen } from '@testing-library/react';

jest.mock('../../../types/index', () => ({
  printType: jest.fn((type: string) => type),
}));

jest.mock('../../../../../../src/plugins/opensearch_dashboards_react/public', () => ({
  // The repo configures testing-library with testIdAttribute: 'data-test-subj'
  // (see test/setup.jest.ts), so expose the mock table under that attribute.
  TableListView: () => <div data-test-subj="table-list-view" />,
  reactRouterNavigate: jest.fn(() => ({ href: '#', onClick: jest.fn() })),
}));

jest.mock('../../common/ScheduleDetails', () => ({
  ScheduleDetails: () => null,
}));

jest.mock('../metrics/variant_details', () => ({
  VariantDetailsModal: () => null,
}));

const mockLoadResources = jest.fn();
jest.mock('../services/experiment_resource_loader', () => ({
  loadExperimentResourcesParallel: (...args: any[]) => mockLoadResources(...args),
}));

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { HybridOptimizerExperimentView } = require('../views/hybrid_optimizer_experiment_view');

const inputExperiment = {
  id: 'exp-1',
  type: 'HYBRID_OPTIMIZER',
  searchConfigurationId: 'sc-1',
  querySetId: 'qs-1',
  judgmentId: 'j-1',
  isScheduled: false,
};

const validResources = {
  experiment: inputExperiment,
  searchConfiguration: { id: 'sc-1', name: 'My Config' },
  querySet: { id: 'qs-1', name: 'My QuerySet', querySetQueries: { a: {}, b: {} } },
  judgmentSet: { id: 'j-1', name: 'My Judgments' },
  scheduledExperimentJob: null,
};

const renderView = (http: any) => {
  const props: any = {
    http,
    notifications: { toasts: { addWarning: jest.fn(), addError: jest.fn() } },
    inputExperiment,
    history: { push: jest.fn(), createHref: jest.fn(() => '#') },
  };
  return render(<HybridOptimizerExperimentView {...props} />);
};

describe('HybridOptimizerExperimentView', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('surfaces the detailed API error message instead of a generic string', async () => {
    mockLoadResources.mockRejectedValue({
      body: { message: 'query in search configuration must be of type hybrid' },
    });

    renderView({ post: jest.fn() });

    expect(
      await screen.findByText('query in search configuration must be of type hybrid')
    ).toBeInTheDocument();
  });

  it('falls back to a generic message when the error has no detail', async () => {
    mockLoadResources.mockRejectedValue(new Error('boom'));

    renderView({ post: jest.fn() });

    expect(await screen.findByText('Error loading experiment data')).toBeInTheDocument();
  });

  it('shows an informative empty state when the experiment produced no results', async () => {
    mockLoadResources.mockResolvedValue(validResources);
    const http = { post: jest.fn().mockResolvedValue({ result: { hits: { hits: [] } } }) };

    renderView(http);

    expect(await screen.findByText('No evaluation results')).toBeInTheDocument();
  });

  it('renders the results table when evaluation results are present', async () => {
    mockLoadResources.mockResolvedValue(validResources);
    const http = {
      post: jest.fn().mockResolvedValue({
        result: {
          hits: {
            hits: [
              {
                _source: {
                  searchText: 'shoes',
                  experimentVariantId: 'v1',
                  metrics: [{ metric: 'ndcg@10', value: 0.5 }],
                },
              },
            ],
          },
        },
      }),
    };

    renderView(http);

    expect(await screen.findByTestId('table-list-view')).toBeInTheDocument();
    expect(screen.queryByText('No evaluation results')).not.toBeInTheDocument();
  });
});
