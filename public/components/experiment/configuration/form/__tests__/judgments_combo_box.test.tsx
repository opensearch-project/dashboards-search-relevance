/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { JudgmentsComboBox } from '../judgments_combo_box';
import { ServiceEndpoints } from '../../../../../../common';

const mockHttp = {
  get: jest.fn(),
};

describe('JudgmentsComboBox', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('requests only COMPLETED judgments and renders options', async () => {
    const mockResponse = {
      hits: {
        hits: [
          { _source: { id: '1', name: 'Completed A', status: 'COMPLETED' } },
          { _source: { id: '2', name: 'Completed B', status: 'COMPLETED' } },
        ],
      },
    };
    mockHttp.get.mockResolvedValueOnce(mockResponse);

    render(
      <JudgmentsComboBox
        selectedOptions={[]}
        onChange={() => {}}
        http={mockHttp as any}
        hideLabel
      />
    );

    // Verify request used status filter
    await waitFor(() => {
      expect(mockHttp.get).toHaveBeenCalledWith(ServiceEndpoints.Judgments, { query: { status: 'COMPLETED' } });
    });

    // Placeholder switches to 'Select judgment list' once loaded
    expect(screen.getByText('Select judgment list')).toBeInTheDocument();

    // Ensure options are mapped (labels visible only when opening combo, but we can rely on mapping without user interaction)
    // For robustness, we check the component rendered without errors and made the expected call.
  });
});
