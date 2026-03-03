/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { render } from '@testing-library/react';
import React from 'react';
import { Header } from '../header';

describe('Header component', () => {
  it('Renders header component', () => {
    const { container } = render(<Header />);
    expect(container).toMatchSnapshot();
  });
});
