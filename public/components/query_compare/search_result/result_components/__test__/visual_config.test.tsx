/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { configure, mount } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import React from 'react';
import { VisualConfig } from '../visual_config';

describe('VisualConfig component', () => {
  configure({ adapter: new Adapter() });
  
  const mockSetViewMode = jest.fn();

  beforeEach(() => {
    mockSetViewMode.mockClear();
  });

  it('renders with text-rich mode selected', () => {
    const wrapper = mount(
      <VisualConfig viewMode="text-rich" setViewMode={mockSetViewMode} />
    );
    
    expect(wrapper.find('EuiSelect').prop('value')).toBe('text-rich');
  });

  it('renders with visual-comparison mode selected', () => {
    const wrapper = mount(
      <VisualConfig viewMode="visual-comparison" setViewMode={mockSetViewMode} />
    );
    
    expect(wrapper.find('EuiSelect').prop('value')).toBe('visual-comparison');
  });

  it('calls setViewMode when selection changes', () => {
    const wrapper = mount(
      <VisualConfig viewMode="text-rich" setViewMode={mockSetViewMode} />
    );
    
    const select = wrapper.find('EuiSelect');
    select.prop('onChange')({ target: { value: 'visual-comparison' } });
    
    expect(mockSetViewMode).toHaveBeenCalledWith('visual-comparison');
  });
});