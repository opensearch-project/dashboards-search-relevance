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
      wrapper
        .find('EuiCompressedComboBox[data-test-subj="pipelineComboBox"]')
        .prop('onChange')([]);

      wrapper
        .find('EuiCompressedComboBox[data-test-subj="pipelineComboBox"]')
        .prop('onChange')([{ label: '_none' }]);
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
      wrapper
        .find('EuiCompressedComboBox[data-test-subj="pipelineComboBox"]')
        .prop('onChange')([]);

      wrapper
        .find('EuiCompressedComboBox[data-test-subj="pipelineComboBox"]')
        .prop('onChange')([{ label: '_none' }]);
    });
    expect(setQueryString).toHaveBeenCalledTimes(1);
    expect(setSelectedIndex).toHaveBeenCalledTimes(2);
    expect(setPipeline).toHaveBeenCalledTimes(3);
    expect(setQueryError).toHaveBeenCalledTimes(3);
  });

  it('handles index selection change', () => {
    const setSelectedIndex = jest.fn();
    const setQueryError = jest.fn();
    const wrapper = mount(
      <SearchRelevanceContextProvider>
        <SearchConfig
          queryNumber={1}
          queryString={TEST_QUERY_STRING}
          setQueryString={jest.fn()}
          selectedIndex={''}
          setSelectedIndex={setSelectedIndex}
          pipeline={''}
          setPipeline={jest.fn()}
          queryError={initialQueryErrorState}
          setQueryError={setQueryError}
          dataSourceEnabled={false}
        />
      </SearchRelevanceContextProvider>
    );

    const select = wrapper.find('EuiCompressedSelect');
    select.prop('onChange')({ target: { value: 'test-index' } });

    expect(setSelectedIndex).toHaveBeenCalledWith('test-index');
    expect(setQueryError).toHaveBeenCalled();
  });

  it('handles pipeline selection with empty array', () => {
    const setPipeline = jest.fn();
    const wrapper = mount(
      <SearchRelevanceContextProvider>
        <SearchConfig
          queryNumber={1}
          queryString={TEST_QUERY_STRING}
          setQueryString={jest.fn()}
          selectedIndex={''}
          setSelectedIndex={jest.fn()}
          pipeline={''}
          setPipeline={setPipeline}
          queryError={initialQueryErrorState}
          setQueryError={jest.fn()}
          dataSourceEnabled={false}
        />
      </SearchRelevanceContextProvider>
    );

    const comboBox = wrapper.find(
      'EuiCompressedComboBox[data-test-subj="pipelineComboBox"]'
    );
    comboBox.prop('onChange')([]);

    expect(setPipeline).toHaveBeenCalledWith('');
  });

  it('handles code editor blur with empty query', () => {
    const setQueryError = jest.fn();
    const wrapper = mount(
      <SearchRelevanceContextProvider>
        <SearchConfig
          queryNumber={1}
          queryString={''}
          setQueryString={jest.fn()}
          selectedIndex={''}
          setSelectedIndex={jest.fn()}
          pipeline={''}
          setPipeline={jest.fn()}
          queryError={initialQueryErrorState}
          setQueryError={setQueryError}
          dataSourceEnabled={false}
        />
      </SearchRelevanceContextProvider>
    );

    const codeEditor = wrapper.find('EuiCodeEditor');
    codeEditor.prop('onBlur')();

    expect(setQueryError).toHaveBeenCalled();
  });

  it('handles index blur without selection', () => {
    const setQueryError = jest.fn();
    const wrapper = mount(
      <SearchRelevanceContextProvider>
        <SearchConfig
          queryNumber={1}
          queryString={TEST_QUERY_STRING}
          setQueryString={jest.fn()}
          selectedIndex={''}
          setSelectedIndex={jest.fn()}
          pipeline={''}
          setPipeline={jest.fn()}
          queryError={initialQueryErrorState}
          setQueryError={setQueryError}
          dataSourceEnabled={false}
        />
      </SearchRelevanceContextProvider>
    );

    const select = wrapper.find('EuiCompressedSelect');
    select.prop('onBlur')();

    expect(setQueryError).toHaveBeenCalled();
  });

  it('handles data source selection for query 1', () => {
    const wrapper = mount(
      <SearchRelevanceContextProvider>
        <SearchConfig
          queryNumber={1}
          queryString={TEST_QUERY_STRING}
          setQueryString={jest.fn()}
          selectedIndex={''}
          setSelectedIndex={jest.fn()}
          pipeline={''}
          setPipeline={jest.fn()}
          queryError={initialQueryErrorState}
          setQueryError={jest.fn()}
          dataSourceEnabled={true}
          notifications={{} as any}
          savedObjects={{ client: {} } as any}
          setDataSource={jest.fn()}
          dataSourceManagement={{ ui: { DataSourceSelector: () => <div>DataSourceSelector</div> } } as any}
          navigation={{} as any}
          setActionMenu={jest.fn()}
          dataSourceOptions={[]}
        />
      </SearchRelevanceContextProvider>
    );

    const instance = wrapper.find('SearchConfig').instance() as any;
    if (instance && instance.onSelectedDataSource) {
      instance.onSelectedDataSource([{ id: 'test-datasource' }]);
    }
  });

  it('handles data source selection for query 2', () => {
    const wrapper = mount(
      <SearchRelevanceContextProvider>
        <SearchConfig
          queryNumber={2}
          queryString={TEST_QUERY_STRING}
          setQueryString={jest.fn()}
          selectedIndex={''}
          setSelectedIndex={jest.fn()}
          pipeline={''}
          setPipeline={jest.fn()}
          queryError={initialQueryErrorState}
          setQueryError={jest.fn()}
          dataSourceEnabled={true}
          notifications={{} as any}
          savedObjects={{ client: {} } as any}
          setDataSource={jest.fn()}
          dataSourceManagement={{ ui: { DataSourceSelector: () => <div>DataSourceSelector</div> } } as any}
          navigation={{} as any}
          setActionMenu={jest.fn()}
          dataSourceOptions={[]}
        />
      </SearchRelevanceContextProvider>
    );

    const instance = wrapper.find('SearchConfig').instance() as any;
    if (instance && instance.onSelectedDataSource) {
      instance.onSelectedDataSource([{ id: 'test-datasource-2' }]);
    }
  });

  it('handles data source selection with empty array', () => {
    const wrapper = mount(
      <SearchRelevanceContextProvider>
        <SearchConfig
          queryNumber={1}
          queryString={TEST_QUERY_STRING}
          setQueryString={jest.fn()}
          selectedIndex={''}
          setSelectedIndex={jest.fn()}
          pipeline={''}
          setPipeline={jest.fn()}
          queryError={initialQueryErrorState}
          setQueryError={jest.fn()}
          dataSourceEnabled={true}
          notifications={{} as any}
          savedObjects={{ client: {} } as any}
          setDataSource={jest.fn()}
          dataSourceManagement={{ ui: { DataSourceSelector: () => <div>DataSourceSelector</div> } } as any}
          navigation={{} as any}
          setActionMenu={jest.fn()}
          dataSourceOptions={[]}
        />
      </SearchRelevanceContextProvider>
    );

    const instance = wrapper.find('SearchConfig').instance() as any;
    if (instance && instance.onSelectedDataSource) {
      instance.onSelectedDataSource([]);
    }
  });

  it('renders with data source enabled', () => {
    const wrapper = mount(
      <SearchRelevanceContextProvider>
        <SearchConfig
          queryNumber={1}
          queryString={TEST_QUERY_STRING}
          setQueryString={jest.fn()}
          selectedIndex={''}
          setSelectedIndex={jest.fn()}
          pipeline={''}
          setPipeline={jest.fn()}
          queryError={initialQueryErrorState}
          setQueryError={jest.fn()}
          dataSourceEnabled={true}
          notifications={{} as any}
          savedObjects={{ client: {} } as any}
          setDataSource={jest.fn()}
          dataSourceManagement={{ ui: { DataSourceSelector: () => <div>DataSourceSelector</div> } } as any}
          navigation={{} as any}
          setActionMenu={jest.fn()}
          dataSourceOptions={[]}
        />
      </SearchRelevanceContextProvider>
    );

    expect(wrapper.text()).toContain('DataSourceSelector');
  });

  it('handles pipeline selection with valid pipeline', () => {
    const setPipeline = jest.fn();
    const wrapper = mount(
      <SearchRelevanceContextProvider>
        <SearchConfig
          queryNumber={1}
          queryString={TEST_QUERY_STRING}
          setQueryString={jest.fn()}
          selectedIndex={''}
          setSelectedIndex={jest.fn()}
          pipeline={''}
          setPipeline={setPipeline}
          queryError={initialQueryErrorState}
          setQueryError={jest.fn()}
          dataSourceEnabled={false}
        />
      </SearchRelevanceContextProvider>
    );

    const comboBox = wrapper.find(
      'EuiCompressedComboBox[data-test-subj="pipelineComboBox"]'
    );
    comboBox.prop('onChange')([{ label: 'test-pipeline' }]);

    expect(setPipeline).toHaveBeenCalledWith('test-pipeline');
  });
});
