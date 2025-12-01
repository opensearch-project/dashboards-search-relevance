/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { configure, mount } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import React from 'react';
import { waitFor } from '@testing-library/react';
import { SearchInputBar } from '../search_bar';
import { TEST_SEARCH_TEXT } from '../../../../../../test/constants';

describe('Search bar component', () => {
  configure({ adapter: new Adapter() });

  it('Renders search bar component', async () => {
    const wrapper = mount(
      <SearchInputBar
        searchBarValue={TEST_SEARCH_TEXT}
        setSearchBarValue={() => {}}
        onClickSearch={() => {}}
        isSearching={false}
      />
    );

    wrapper.update();

    await waitFor(() => {
      expect(wrapper).toMatchSnapshot();
    });
  });

  it('handles input change', () => {
    const setSearchBarValue = jest.fn();
    const wrapper = mount(
      <SearchInputBar
        searchBarValue=""
        setSearchBarValue={setSearchBarValue}
        onClickSearch={jest.fn()}
        isSearching={false}
      />
    );

    const input = wrapper.find('EuiCompressedFieldSearch');
    input.prop('onChange')({ target: { value: 'new search' } });
    
    expect(setSearchBarValue).toHaveBeenCalledWith('new search');
  });

  it('handles search button click', () => {
    const onClickSearch = jest.fn();
    const wrapper = mount(
      <SearchInputBar
        searchBarValue="test"
        setSearchBarValue={jest.fn()}
        onClickSearch={onClickSearch}
        isSearching={false}
      />
    );

    const input = wrapper.find('EuiCompressedFieldSearch');
    input.prop('onSearch')();
    
    expect(onClickSearch).toHaveBeenCalled();
  });
});
