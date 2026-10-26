/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ExperimentMetadataFields } from './experiment_metadata_fields';
import { EXPERIMENT_DESCRIPTION_MAX_LENGTH, EXPERIMENT_NAME_MAX_LENGTH } from '../../../../common';

describe('ExperimentMetadataFields', () => {
  const defaultProps = {
    name: '',
    description: '',
    onChange: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the name and description fields with their current values', () => {
    render(<ExperimentMetadataFields {...defaultProps} name="My experiment" description="Some details" />);

    expect(screen.getByTestId('experimentCreateName')).toHaveValue('My experiment');
    expect(screen.getByTestId('experimentCreateDescription')).toHaveValue('Some details');
  });

  it('enforces the configured max lengths on both fields', () => {
    render(<ExperimentMetadataFields {...defaultProps} />);

    expect(screen.getByTestId('experimentCreateName')).toHaveAttribute(
      'maxlength',
      String(EXPERIMENT_NAME_MAX_LENGTH)
    );
    expect(screen.getByTestId('experimentCreateDescription')).toHaveAttribute(
      'maxlength',
      String(EXPERIMENT_DESCRIPTION_MAX_LENGTH)
    );
  });

  it('calls onChange with the field name when the name input changes', () => {
    render(<ExperimentMetadataFields {...defaultProps} />);

    fireEvent.change(screen.getByTestId('experimentCreateName'), { target: { value: 'New name' } });

    expect(defaultProps.onChange).toHaveBeenCalledWith('name', 'New name');
  });

  it('calls onChange with the field name when the description input changes', () => {
    render(<ExperimentMetadataFields {...defaultProps} />);

    fireEvent.change(screen.getByTestId('experimentCreateDescription'), {
      target: { value: 'New description' },
    });

    expect(defaultProps.onChange).toHaveBeenCalledWith('description', 'New description');
  });

  it('does not show validation errors when none are provided', () => {
    render(<ExperimentMetadataFields {...defaultProps} />);

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('surfaces a name validation error', () => {
    render(<ExperimentMetadataFields {...defaultProps} nameError={['Name is required']} />);

    expect(screen.getByText('Name is required')).toBeInTheDocument();
  });

  it('surfaces a description validation error', () => {
    render(
      <ExperimentMetadataFields {...defaultProps} descriptionError={['Description is too long']} />
    );

    expect(screen.getByText('Description is too long')).toBeInTheDocument();
  });
});
