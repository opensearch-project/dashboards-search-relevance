/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { render } from '@testing-library/react';
import React from 'react';
import { Flyout } from '../flyout';
import { SearchRelevanceContextProvider } from '../../../contexts';

describe('Flyout component', () => {
  it('Renders flyout component', () => {
    const { container } = render(
      <SearchRelevanceContextProvider>
        <Flyout />
      </SearchRelevanceContextProvider>
    );
    expect(container).toMatchSnapshot();
  });
});
