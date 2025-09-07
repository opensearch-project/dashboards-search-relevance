/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { SearchConfigForm } from '../configuration/search_configuration_form';

const mockHttp = {
  get: jest.fn(),
};

const mockProps = {
  selectedOptions: [],
  onChange: jest.fn(),
  http: mockHttp as any,
  maxNumberOfOptions: 2,
};

describe('SearchConfigForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders with label by default', async () => {
    mockHttp.get.mockResolvedValue({ hits: { hits: [] } });

    render(<SearchConfigForm {...mockProps} />);

    expect(screen.getByText('Search Configurations')).toBeInTheDocument();
    expect(screen.getByText(/Select up to 2 search configurations/)).toBeInTheDocument();
  });

  it('renders without label when hideLabel is true', async () => {
    mockHttp.get.mockResolvedValue({ hits: { hits: [] } });

    render(<SearchConfigForm {...mockProps} hideLabel />);

    expect(screen.queryByText('Search Configurations')).not.toBeInTheDocument();
  });

  it('shows single selection help text when maxNumberOfOptions is 1', async () => {
    mockHttp.get.mockResolvedValue({ hits: { hits: [] } });

    render(<SearchConfigForm {...mockProps} maxNumberOfOptions={1} />);

    await waitFor(() => {
      expect(screen.getByText(/Select 1 search configuration\./)).toBeInTheDocument();
    });
  });

  it('handles fetch error gracefully', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    mockHttp.get.mockRejectedValue(new Error('Fetch failed'));

    render(<SearchConfigForm {...mockProps} />);

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith(
        'Failed to fetch search configurations',
        expect.any(Error)
      );
    });

    consoleSpy.mockRestore();
  });
});
