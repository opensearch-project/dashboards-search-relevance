/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { LtrModelTable, shortModelType } from '../components/ltr_model_table';

describe('shortModelType', () => {
  it('drops the model/ prefix', () => {
    expect(shortModelType('model/xgboost+json')).toBe('xgboost+json');
  });

  it('leaves an unprefixed type alone', () => {
    expect(shortModelType('ranklib')).toBe('ranklib');
  });
});

const mockHistory = {
  push: jest.fn(),
  createHref: jest.fn((location: any) => location.pathname),
  location: { pathname: '/ltrModel', search: '', hash: '', state: undefined },
} as any;

describe('LtrModelTable', () => {
  const items = [
    { name: 'my_model', featureSetName: 'my_set', modelType: 'model/ranklib', featureCount: 2 },
    {
      name: 'other_model',
      featureSetName: 'other_set',
      modelType: 'model/xgboost+json',
      featureCount: 7,
    },
  ];

  it('renders a row per model with its feature set, type, and feature count', async () => {
    const findItems = jest.fn().mockResolvedValue({ total: items.length, hits: items });

    render(<LtrModelTable isLoading={false} findItems={findItems} history={mockHistory} />);

    await waitFor(() => expect(screen.getByText('my_model')).toBeInTheDocument());
    expect(screen.getByText('my_set')).toBeInTheDocument();
    expect(screen.getByText('ranklib')).toBeInTheDocument();
    expect(screen.getByText('other_model')).toBeInTheDocument();
    expect(screen.getByText('xgboost+json')).toBeInTheDocument();
    expect(screen.getByText('7')).toBeInTheDocument();
  });

  it('links each model name to its detail view', async () => {
    const findItems = jest.fn().mockResolvedValue({ total: items.length, hits: items });

    render(<LtrModelTable isLoading={false} findItems={findItems} history={mockHistory} />);

    await waitFor(() => expect(screen.getByText('my_model')).toBeInTheDocument());
    expect(screen.getByText('my_model').closest('a')).toHaveAttribute(
      'href',
      '/ltrModel/view/my_model'
    );
  });
});
