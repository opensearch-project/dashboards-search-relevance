/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { configure, mount } from 'enzyme';
import Adapter from '@cfaester/enzyme-adapter-react-18';
import React from 'react';
import { waitFor } from '@testing-library/react';
import { Flyout } from '../flyout';
import { SearchRelevanceContextProvider } from '../../../contexts';

describe('Flyout component', () => {
  configure({ adapter: new Adapter() });

  it('Renders flyout component', async () => {
    const wrapper = mount(
      <SearchRelevanceContextProvider>
        <Flyout />
      </SearchRelevanceContextProvider>
    );

    wrapper.update();

    await waitFor(() => {
      expect(wrapper).toMatchSnapshot();
    });
  });
});
