/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { LtrModelListing } from '../views/ltr_model_listing';
import { useLtrModelList } from '../hooks/use_ltr_model_list';

jest.mock('../hooks/use_ltr_model_list');
jest.mock('../components/ltr_model_table', () => ({
  LtrModelTable: ({ isLoading, history }: any) => (
    <div data-test-subj="ltr-model-table">
      {isLoading ? 'loading' : 'loaded'}
      <span data-test-subj="table-has-history">{history ? 'yes' : 'no'}</span>
    </div>
  ),
}));

const mockUseLtrModelList = useLtrModelList as jest.MockedFunction<typeof useLtrModelList>;

const mockHttp = { get: jest.fn() } as any;

const routeProps: any = {
  history: { push: jest.fn() },
  location: { pathname: '/ltrModel', search: '', hash: '', state: undefined },
  match: { params: {}, isExact: true, path: '/ltrModel', url: '/ltrModel' },
};

const hookState = (overrides: any = {}) => ({
  isLoading: false,
  error: null,
  unavailableReason: null,
  truncatedTotal: null,
  findLtrModels: jest.fn(),
  setError: jest.fn(),
  ...overrides,
});

describe('LtrModelListing', () => {
  beforeEach(() => jest.clearAllMocks());

  it('renders the table by default', () => {
    mockUseLtrModelList.mockReturnValue(hookState() as any);

    render(<LtrModelListing http={mockHttp} {...routeProps} />);

    expect(screen.getByText('LTR Models')).toBeInTheDocument();
    expect(screen.getByTestId('ltr-model-table')).toBeInTheDocument();
    // The table needs history to link names through to the detail view.
    expect(screen.getByTestId('table-has-history')).toHaveTextContent('yes');
  });

  it('renders an error callout instead of the table when the fetch fails', () => {
    mockUseLtrModelList.mockReturnValue(hookState({ error: 'cluster is on fire' }) as any);

    render(<LtrModelListing http={mockHttp} {...routeProps} />);

    expect(screen.getByText('cluster is on fire')).toBeInTheDocument();
    expect(screen.queryByTestId('ltr-model-table')).not.toBeInTheDocument();
  });

  it('explains a missing feature store rather than showing an empty table', () => {
    mockUseLtrModelList.mockReturnValue(hookState({ unavailableReason: 'store_not_found' }) as any);

    render(<LtrModelListing http={mockHttp} {...routeProps} />);

    expect(screen.getByText('No feature store found')).toBeInTheDocument();
    expect(screen.queryByTestId('ltr-model-table')).not.toBeInTheDocument();
  });

  it('explains a disabled LTR plugin', () => {
    mockUseLtrModelList.mockReturnValue(hookState({ unavailableReason: 'plugin_disabled' }) as any);

    render(<LtrModelListing http={mockHttp} {...routeProps} />);

    expect(screen.getByText('Learning to Rank is disabled')).toBeInTheDocument();
  });

  it('explains an uninstalled LTR plugin', () => {
    mockUseLtrModelList.mockReturnValue(
      hookState({ unavailableReason: 'plugin_not_installed' }) as any
    );

    render(<LtrModelListing http={mockHttp} {...routeProps} />);

    expect(screen.getByText('Learning to Rank is not installed')).toBeInTheDocument();
  });

  it('warns alongside the table when the registry was truncated', () => {
    mockUseLtrModelList.mockReturnValue(hookState({ truncatedTotal: 4200 }) as any);

    render(<LtrModelListing http={mockHttp} {...routeProps} />);

    expect(screen.getByText('Showing part of the registry')).toBeInTheDocument();
    expect(screen.getByText(/4200 models/)).toBeInTheDocument();
    expect(screen.getByTestId('ltr-model-table')).toBeInTheDocument();
  });
});
