/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { configure, mount } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import React from 'react';
import { waitFor } from '@testing-library/react';
import { Flyout } from '../flyout';
import { SearchRelevanceContextProvider } from '../../../contexts';
import { I18nProvider } from '@osd/i18n/react';

describe('Flyout component', () => {
  configure({ adapter: new Adapter() });

  it('Renders flyout component', async () => {
    const wrapper = mount(
      <I18nProvider>
        <SearchRelevanceContextProvider>
          <Flyout />
        </SearchRelevanceContextProvider>
      </I18nProvider>
    );

    wrapper.update();

    await waitFor(() => {
      expect(wrapper).toMatchSnapshot();
    });
  });
});
