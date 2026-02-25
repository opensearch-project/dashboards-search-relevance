/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { waitFor, render } from '@testing-library/react';
import React from 'react';
import { initialQueryErrorState } from '../../../../../../public/types/index';
import { TEST_QUERY_STRING } from '../../../../../../test/constants';
import { SearchRelevanceContextProvider } from '../../../../../contexts';
import { SearchConfig } from '../search_configs/search_config';

describe('Flyout component', () => {
  it('Renders flyout component when multi-datasource is enabled', async () => {
    const setQueryString = jest.fn();
    const setSelectedIndex = jest.fn();
    const setPipeline = jest.fn();
    const setQueryError = jest.fn();
    const setDataSourceManagement = jest.fn();
    const { container } = render(
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

    await waitFor(() => {
      expect(container).toMatchSnapshot();
      const codeEditor = container.querySelector('.euiCodeEditorWrapper');
      if (codeEditor) {
        const onChange = (codeEditor as any).onChange;
        onChange?.({ target: { value: '' } });
      }
      const selects = container.querySelectorAll('select');
      selects.forEach((select) => {
        const onChange = (select as any).onChange;
        const onBlur = (select as any).onBlur;
        onChange?.({ target: {} });
        onBlur?.({ target: {} });
      });
      const comboBoxes = container.querySelectorAll('[data-test-subj*="comboBox"]');
      comboBoxes.forEach((comboBox) => {
        const onChange = (comboBox as any).onChange;
        onChange?.({ target: { selectedPipelineOptions: [] } });
        onChange?.({
          target: { selectedPipelineOptions: [{ label: '_none' }] },
        });
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
    const { container } = render(
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

    await waitFor(() => {
      expect(container).toMatchSnapshot();
      const codeEditor = container.querySelector('.euiCodeEditorWrapper');
      if (codeEditor) {
        const onChange = (codeEditor as any).onChange;
        onChange?.({ target: { value: '' } });
      }
      const selects = container.querySelectorAll('select');
      selects.forEach((select) => {
        const onChange = (select as any).onChange;
        const onBlur = (select as any).onBlur;
        onChange?.({ target: {} });
        onBlur?.({ target: {} });
      });
      const comboBoxes = container.querySelectorAll('[data-test-subj*="comboBox"]');
      comboBoxes.forEach((comboBox) => {
        const onChange = (comboBox as any).onChange;
        onChange?.({ target: { selectedPipelineOptions: [] } });
        onChange?.({
          target: { selectedPipelineOptions: [{ label: '_none' }] },
        });
      });
    });
    expect(setQueryString).toHaveBeenCalledTimes(1);
    expect(setSelectedIndex).toHaveBeenCalledTimes(2);
    expect(setPipeline).toHaveBeenCalledTimes(3);
    expect(setQueryError).toHaveBeenCalledTimes(3);
  });
});
