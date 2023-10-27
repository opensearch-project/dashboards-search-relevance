/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { configure, mount } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import React from 'react';
import { waitFor } from '@testing-library/react';
import { Header } from '../header';
import { IntlProvider } from 'react-intl';

describe('Header component', () => {
  configure({ adapter: new Adapter() });

  it('Renders header component', async () => {
    const wrapper = mount(
      <IntlProvider locale="en">
        <Header />
      </IntlProvider>
    );

    wrapper.update();

    await waitFor(() => {
      expect(wrapper).toMatchSnapshot();
    });
  });
});
