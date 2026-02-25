/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { render } from '@testing-library/react';
import React from 'react';
import { waitFor } from '@testing-library/react';
import { Flyout } from '../flyout';
import { SearchRelevanceContextProvider } from '../../../contexts';

describe('Flyout component', () => {
  it('Renders flyout component', async () => {
    const { container } = render(
      <SearchRelevanceContextProvider>
        <Flyout />
      </SearchRelevanceContextProvider>
    );

    await waitFor(() => {
      expect(container).toMatchSnapshot();
    });
  });
});
