/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { configure, mount } from 'enzyme';
import Adapter from '@cfaester/enzyme-adapter-react-18';
import React from 'react';
import { waitFor } from '@testing-library/react';
import { Header } from '../header';

describe('Header component', () => {
  configure({ adapter: new Adapter() });

  it('Renders header component', async () => {
    const wrapper = mount(<Header />);

    wrapper.update();

    await waitFor(() => {
      expect(wrapper).toMatchSnapshot();
    });
  });
});
