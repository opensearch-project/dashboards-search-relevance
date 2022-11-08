/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { configure, mount } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import React from 'react';
import { waitFor } from '@testing-library/react';
import { SearchInputBar } from '../search_bar';

describe('Search bar component', () => {
  configure({ adapter: new Adapter() });

  it('Renders search bar component', async () => {
    const wrapper = mount(
      <SearchInputBar
        searchBarValue="basic"
        setSearchBarValue={() => {}}
        onClickSearch={() => {}}
      />
    );

    wrapper.update();

    await waitFor(() => {
      expect(wrapper).toMatchSnapshot();
    });
  });
});
