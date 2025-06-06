/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { waitFor } from '@testing-library/react';
import { configure, mount } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import React from 'react';
import { initialQueryErrorState } from '../../../../../../public/types/index';
import { TEST_QUERY_STRING } from '../../../../../../test/constants';
import { SearchRelevanceContextProvider } from '../../../../../contexts';
import { SearchConfig } from '../search_configs/search_config';

describe('Flyout component', () => {
  configure({ adapter: new Adapter() });

  it('Renders flyout component when multi-datasource is enabled', async () => {
    const setQueryString = jest.fn();
    const setSelectedIndex = jest.fn();
    const setPipeline = jest.fn();
    const setQueryError = jest.fn();
    const setDataSourceManagement = jest.fn();
    const wrapper = mount(
      <SearchRelevanceContextProvider>
        <SearchConfig
          queryNumber={1}
          queryString={TEST_QUERY_STRING}
          setQueryString={setQueryString}
          selectedIndex={''}
          setSelectedIndex={setSelectedIndex}
          pipeline={''}
          setPipeline={setPipeline}
          queryError={initialQueryErrorState}
          setQueryError={setQueryError}
          dataSourceManagement={{ ui: { DataSourceSelector: <></> } }}
        />
      </SearchRelevanceContextProvider>
    );

    wrapper.update();
    await waitFor(() => {
      expect(wrapper).toMatchSnapshot();
      wrapper.find('EuiCodeEditor').prop('onChange')?.({ target: { value: '' } });
      wrapper.find('EuiSelect').prop('onChange')?.({ target: {} });
      wrapper.find('EuiSelect').prop('onBlur')?.({ target: {} });
      wrapper.find('EuiCompressedComboBox').prop('onChange')?.({
        target: { selectedPipelineOptions: [] },
      });
      wrapper.find('EuiCompressedComboBox').prop('onChange')?.({
        target: { selectedPipelineOptions: [{ label: '_none' }] },
      });
    });
    expect(setQueryString).toHaveBeenCalledTimes(1);
    expect(setSelectedIndex).toHaveBeenCalledTimes(2);
    expect(setPipeline).toHaveBeenCalledTimes(3);
    expect(setQueryError).toHaveBeenCalledTimes(3);
  });

  it('Renders flyout component', async () => {
    const setQueryString = jest.fn();
    const setSelectedIndex = jest.fn();
    const setPipeline = jest.fn();
    const setQueryError = jest.fn();
    const setDataSourceManagement = jest.fn();
    const wrapper = mount(
      <SearchRelevanceContextProvider>
        <SearchConfig
          queryNumber={1}
          queryString={TEST_QUERY_STRING}
          setQueryString={setQueryString}
          selectedIndex={''}
          setSelectedIndex={setSelectedIndex}
          pipeline={''}
          setPipeline={setPipeline}
          queryError={initialQueryErrorState}
          setQueryError={setQueryError}
          dataSourceEnabled={false}
        />
      </SearchRelevanceContextProvider>
    );

    wrapper.update();
    await waitFor(() => {
      expect(wrapper).toMatchSnapshot();
      wrapper.find('EuiCodeEditor').prop('onChange')?.({ target: { value: '' } });
      wrapper.find('EuiSelect').prop('onChange')?.({ target: {} });
      wrapper.find('EuiSelect').prop('onBlur')?.({ target: {} });
      wrapper.find('EuiCompressedComboBox').prop('onChange')?.({
        target: { selectedPipelineOptions: [] },
      });
      wrapper.find('EuiCompressedComboBox').prop('onChange')?.({
        target: { selectedPipelineOptions: [{ label: '_none' }] },
      });
    });
    expect(setQueryString).toHaveBeenCalledTimes(1);
    expect(setSelectedIndex).toHaveBeenCalledTimes(2);
    expect(setPipeline).toHaveBeenCalledTimes(3);
    expect(setQueryError).toHaveBeenCalledTimes(3);
  });
});
