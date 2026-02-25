/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { render } from '@testing-library/react';
import React from 'react';
import { fireEvent, waitFor } from '@testing-library/react';
import { CreateIndex } from '../create_index';

const coreMockStart = {
  chrome: {
    navGroup: {
      getNavGroupEnabled: jest.fn(() => false),
    },
  },
  application: {
    navigateToApp: jest.fn(),
  },
};

describe('Create index component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('Renders create index component', async () => {
    const { container } = render(
      <CreateIndex chrome={coreMockStart.chrome} application={coreMockStart.application} />
    );

    await waitFor(() => {
      expect(container).toMatchSnapshot();
    });
  });

  it('should call application.navigateToApp', async () => {
    coreMockStart.chrome.navGroup.getNavGroupEnabled.mockReturnValue(true);
    const { getByText } = render(
      <CreateIndex chrome={coreMockStart.chrome} application={coreMockStart.application} />
    );

    fireEvent.click(getByText('add sample data'));
    expect(coreMockStart.application.navigateToApp).toHaveBeenLastCalledWith('import_sample_data');
  });
});
