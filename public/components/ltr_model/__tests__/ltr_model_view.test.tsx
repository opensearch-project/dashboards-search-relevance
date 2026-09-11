/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { LtrModelView } from '../views/ltr_model_view';
import { useLtrModelView } from '../hooks/use_ltr_model_view';

jest.mock('../hooks/use_ltr_model_view');

const mockUseLtrModelView = useLtrModelView as jest.MockedFunction<typeof useLtrModelView>;
const mockHttp = { get: jest.fn() } as any;

const model = {
  name: 'my_model',
  featureSetName: 'my_set',
  modelType: 'model/ranklib',
  featureCount: 1,
  features: [
    {
      name: 'feature1',
      params: ['query_string'],
      templateLanguage: 'mustache',
      template: { match: { field_test: '{{query_string}}' } },
    },
  ],
  definition: '## LambdaMART',
};

const hookState = (overrides: any = {}) => ({
  model: null,
  isLoading: false,
  error: null,
  notFound: false,
  unavailableReason: null,
  ...overrides,
});

describe('LtrModelView', () => {
  beforeEach(() => jest.clearAllMocks());

  it('renders the model metadata, its feature set, and its definition', () => {
    mockUseLtrModelView.mockReturnValue(hookState({ model }) as any);

    render(<LtrModelView http={mockHttp} id="my_model" />);

    expect(screen.getByText('my_set')).toBeInTheDocument();
    expect(screen.getByText('ranklib')).toBeInTheDocument();
    // The feature set renders a real feature with its template.
    expect(screen.getByText('feature1')).toBeInTheDocument();
    expect(screen.getByText('query_string')).toBeInTheDocument();
    expect(screen.getByTestId('ltrModelDefinition').textContent).toBe('## LambdaMART');
  });

  it('shows a spinner while loading', () => {
    mockUseLtrModelView.mockReturnValue(hookState({ isLoading: true }) as any);

    render(<LtrModelView http={mockHttp} id="my_model" />);

    expect(screen.getByTestId('ltrModelViewLoading')).toBeInTheDocument();
  });

  it('distinguishes a missing model from a broken registry', () => {
    mockUseLtrModelView.mockReturnValue(hookState({ notFound: true }) as any);

    render(<LtrModelView http={mockHttp} id="ghost" />);

    expect(screen.getByText('Model not found')).toBeInTheDocument();
  });

  it('explains a registry-level failure', () => {
    mockUseLtrModelView.mockReturnValue(hookState({ unavailableReason: 'plugin_disabled' }) as any);

    render(<LtrModelView http={mockHttp} id="my_model" />);

    expect(screen.getByText('Learning to Rank is disabled')).toBeInTheDocument();
  });

  it('reports an unexpected error', () => {
    mockUseLtrModelView.mockReturnValue(hookState({ error: 'cluster is on fire' }) as any);

    render(<LtrModelView http={mockHttp} id="my_model" />);

    expect(screen.getByText('cluster is on fire')).toBeInTheDocument();
  });

  it('renders a model whose feature set is empty', () => {
    mockUseLtrModelView.mockReturnValue(
      hookState({ model: { ...model, features: [], featureCount: 0 } }) as any
    );

    render(<LtrModelView http={mockHttp} id="my_model" />);

    expect(screen.getByText("This model's feature set has no features.")).toBeInTheDocument();
  });
});
