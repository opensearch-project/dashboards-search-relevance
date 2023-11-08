/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { configure, mount } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import React from 'react';
import { waitFor } from '@testing-library/react';
import { CreateIndex } from '../create_index';
import { I18nProvider } from '@osd/i18n/react';

describe('Create index component', () => {
  configure({ adapter: new Adapter() });

  it('Renders create index component', async () => {
    const wrapper = mount(
      <I18nProvider>
        <CreateIndex />
      </I18nProvider>
    );

    wrapper.update();

    await waitFor(() => {
      expect(wrapper).toMatchSnapshot();
    });
  });
});
