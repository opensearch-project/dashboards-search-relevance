/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { VariantDetailsModal } from '../metrics/variant_details';

describe('VariantDetailsModal', () => {
  const onClose = jest.fn();

  afterEach(() => {
    onClose.mockClear();
  });

  it('renders RRF variant with rank constant and hides normalization/weights', () => {
    render(
      <VariantDetailsModal
        variantDetails={{
          parameters: {
            combination: 'rrf',
            rank_constant: 10,
          },
        }}
        onClose={onClose}
      />
    );

    expect(screen.getByText('Combination')).toBeInTheDocument();
    expect(screen.getByText('rrf')).toBeInTheDocument();
    expect(screen.getByText('Rank constant')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();

    expect(screen.queryByText('Normalization')).not.toBeInTheDocument();
    expect(screen.queryByText('Weights')).not.toBeInTheDocument();
  });

  it('renders arithmetic_mean variant with normalization/weights and hides rank constant', () => {
    render(
      <VariantDetailsModal
        variantDetails={{
          parameters: {
            combination: 'arithmetic_mean',
            normalization: 'min_max',
            weights: [0.5, 0.5],
          },
        }}
        onClose={onClose}
      />
    );

    expect(screen.getByText('Combination')).toBeInTheDocument();
    expect(screen.getByText('arithmetic_mean')).toBeInTheDocument();
    expect(screen.getByText('Normalization')).toBeInTheDocument();
    expect(screen.getByText('min_max')).toBeInTheDocument();
    expect(screen.getByText('Weights')).toBeInTheDocument();
    // EuiCodeBlock highlights each JSON token into its own span,
    // so the two weight values render as two separate "0.5" nodes.
    expect(screen.getAllByText('0.5')).toHaveLength(2);

    expect(screen.queryByText('Rank constant')).not.toBeInTheDocument();
  });
});
