/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { fireEvent } from '@testing-library/react';
import { configure, mount } from 'enzyme';
import Adapter from '@cfaester/enzyme-adapter-react-18';
import {
  ResizableQueryEditor,
  MIN_EDITOR_HEIGHT,
  MAX_EDITOR_HEIGHT,
  DEFAULT_EDITOR_HEIGHT,
} from '../resizable_query_editor';

configure({ adapter: new Adapter() });

// Mock EuiCodeEditor since it uses Ace Editor which doesn't work well in tests
jest.mock('@elastic/eui', () => {
  const actual = jest.requireActual('@elastic/eui');
  return {
    ...actual,
    EuiCodeEditor: ({ value, onChange, onBlur, height, 'aria-label': ariaLabel }: any) => (
      <textarea
        data-test-subj="mockedCodeEditor"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        style={{ height }}
        aria-label={ariaLabel}
      />
    ),
  };
});

describe('ResizableQueryEditor', () => {
  const defaultProps = {
    value: '{"query": "test"}',
    onChange: jest.fn(),
    onBlur: jest.fn(),
    'aria-label': 'Test Editor',
    'data-test-subj': 'testQueryEditor',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('rendering', () => {
    it('renders with default height', () => {
      const wrapper = mount(<ResizableQueryEditor {...defaultProps} />);
      
      expect(wrapper.find('[data-test-subj="testQueryEditor"]').exists()).toBe(true);
      expect(wrapper.find('[data-test-subj="testQueryEditor-resizeHandle"]').exists()).toBe(true);
    });

    it('renders with controlled height', () => {
      const customHeight = 200;
      const wrapper = mount(
        <ResizableQueryEditor 
          {...defaultProps} 
          height={customHeight}
          onHeightChange={jest.fn()}
        />
      );

      const editor = wrapper.find('[data-test-subj="mockedCodeEditor"]');
      expect(editor.prop('style')).toEqual({ height: `${customHeight}px` });
    });

    it('renders the resize handle with correct accessibility attributes', () => {
      const wrapper = mount(<ResizableQueryEditor {...defaultProps} />);
      
      const handle = wrapper.find('[data-test-subj="testQueryEditor-resizeHandle"]').first();
      expect(handle.prop('role')).toBe('slider');
      expect(handle.prop('aria-label')).toBe('Resize query editor');
      expect(handle.prop('aria-valuemin')).toBe(MIN_EDITOR_HEIGHT);
      expect(handle.prop('aria-valuemax')).toBe(MAX_EDITOR_HEIGHT);
      expect(handle.prop('aria-orientation')).toBe('vertical');
      expect(handle.prop('tabIndex')).toBe(0);
    });

    it('displays the correct value in the editor', () => {
      const wrapper = mount(<ResizableQueryEditor {...defaultProps} />);
      
      const editor = wrapper.find('[data-test-subj="mockedCodeEditor"]');
      expect(editor.prop('value')).toBe(defaultProps.value);
    });
  });

  describe('value changes', () => {
    it('calls onChange when editor value changes', () => {
      const wrapper = mount(<ResizableQueryEditor {...defaultProps} />);
      
      const editor = wrapper.find('[data-test-subj="mockedCodeEditor"]');
      editor.simulate('change', { target: { value: '{"query": "new value"}' } });
      
      expect(defaultProps.onChange).toHaveBeenCalledWith('{"query": "new value"}');
    });

    it('calls onBlur when editor loses focus', () => {
      const wrapper = mount(<ResizableQueryEditor {...defaultProps} />);
      
      const editor = wrapper.find('[data-test-subj="mockedCodeEditor"]');
      editor.simulate('blur');
      
      expect(defaultProps.onBlur).toHaveBeenCalled();
    });
  });

  describe('keyboard resize', () => {
    it('decreases height on ArrowUp key (but not below minimum)', () => {
      // Start with a height above minimum so we can decrease
      const startHeight = MIN_EDITOR_HEIGHT + 40;
      const onHeightChange = jest.fn();
      const wrapper = mount(
        <ResizableQueryEditor 
          {...defaultProps} 
          height={startHeight}
          onHeightChange={onHeightChange}
        />
      );
      
      const handle = wrapper.find('[data-test-subj="testQueryEditor-resizeHandle"]').first();
      handle.simulate('keydown', { key: 'ArrowUp', preventDefault: jest.fn() });
      
      // Should decrease by 20px
      expect(onHeightChange).toHaveBeenCalledWith(startHeight - 20);
    });

    it('increases height on ArrowDown key', () => {
      const onHeightChange = jest.fn();
      const wrapper = mount(
        <ResizableQueryEditor 
          {...defaultProps} 
          height={DEFAULT_EDITOR_HEIGHT}
          onHeightChange={onHeightChange}
        />
      );
      
      const handle = wrapper.find('[data-test-subj="testQueryEditor-resizeHandle"]').first();
      handle.simulate('keydown', { key: 'ArrowDown', preventDefault: jest.fn() });
      
      expect(onHeightChange).toHaveBeenCalledWith(DEFAULT_EDITOR_HEIGHT + 20);
    });

    it('sets minimum height on Home key', () => {
      const onHeightChange = jest.fn();
      const wrapper = mount(
        <ResizableQueryEditor 
          {...defaultProps} 
          height={300}
          onHeightChange={onHeightChange}
        />
      );
      
      const handle = wrapper.find('[data-test-subj="testQueryEditor-resizeHandle"]').first();
      handle.simulate('keydown', { key: 'Home', preventDefault: jest.fn() });
      
      expect(onHeightChange).toHaveBeenCalledWith(MIN_EDITOR_HEIGHT);
    });

    it('sets maximum height on End key', () => {
      const onHeightChange = jest.fn();
      const wrapper = mount(
        <ResizableQueryEditor 
          {...defaultProps} 
          height={DEFAULT_EDITOR_HEIGHT}
          onHeightChange={onHeightChange}
        />
      );
      
      const handle = wrapper.find('[data-test-subj="testQueryEditor-resizeHandle"]').first();
      handle.simulate('keydown', { key: 'End', preventDefault: jest.fn() });
      
      expect(onHeightChange).toHaveBeenCalledWith(MAX_EDITOR_HEIGHT);
    });

    it('does not change height on unrelated keys', () => {
      const onHeightChange = jest.fn();
      const wrapper = mount(
        <ResizableQueryEditor 
          {...defaultProps} 
          height={DEFAULT_EDITOR_HEIGHT}
          onHeightChange={onHeightChange}
        />
      );
      
      const handle = wrapper.find('[data-test-subj="testQueryEditor-resizeHandle"]').first();
      handle.simulate('keydown', { key: 'Enter' });
      
      // onHeightChange should NOT be called for unrelated keys
      expect(onHeightChange).not.toHaveBeenCalled();
    });
  });

  describe('height constraints', () => {
    it('does not go below minimum height', () => {
      const wrapper = mount(<ResizableQueryEditor {...defaultProps} />);
      
      const handle = wrapper.find('[data-test-subj="testQueryEditor-resizeHandle"]').first();
      
      // Try to decrease height multiple times (starting from default which equals min)
      for (let i = 0; i < 10; i++) {
        handle.simulate('keydown', { key: 'ArrowUp', preventDefault: jest.fn() });
      }
      
      wrapper.update();
      
      const editor = wrapper.find('[data-test-subj="mockedCodeEditor"]');
      expect(editor.prop('style')).toEqual({ height: `${MIN_EDITOR_HEIGHT}px` });
    });

    it('does not go above maximum height', () => {
      const onHeightChange = jest.fn();
      const wrapper = mount(
        <ResizableQueryEditor 
          {...defaultProps} 
          height={MAX_EDITOR_HEIGHT}
          onHeightChange={onHeightChange}
        />
      );
      
      const handle = wrapper.find('[data-test-subj="testQueryEditor-resizeHandle"]').first();
      
      // Try to increase height
      handle.simulate('keydown', { key: 'ArrowDown', preventDefault: jest.fn() });
      
      // onHeightChange should be called with max height (clamped)
      expect(onHeightChange).toHaveBeenCalledWith(MAX_EDITOR_HEIGHT);
    });

    it('clamps height to minimum when going below', () => {
      const onHeightChange = jest.fn();
      const wrapper = mount(
        <ResizableQueryEditor 
          {...defaultProps} 
          height={MIN_EDITOR_HEIGHT}
          onHeightChange={onHeightChange}
        />
      );
      
      const handle = wrapper.find('[data-test-subj="testQueryEditor-resizeHandle"]').first();
      handle.simulate('keydown', { key: 'ArrowUp', preventDefault: jest.fn() });
      
      // onHeightChange should be called with min height (clamped)
      expect(onHeightChange).toHaveBeenCalledWith(MIN_EDITOR_HEIGHT);
    });
  });

  describe('mouse resize', () => {
    it('starts resizing on mousedown', () => {
      const wrapper = mount(<ResizableQueryEditor {...defaultProps} />);
      
      const handle = wrapper.find('[data-test-subj="testQueryEditor-resizeHandle"]').first();
      handle.simulate('mousedown', { 
        clientY: 100, 
        preventDefault: jest.fn(), 
        stopPropagation: jest.fn() 
      });
      
      wrapper.update();
      
      // Check that the active class is applied
      expect(
        wrapper.find('.resizableQueryEditor__resizeHandle--active').exists()
      ).toBe(true);
    });

    it('updates height during mouse drag', () => {
      const wrapper = mount(<ResizableQueryEditor {...defaultProps} />);
      
      const handle = wrapper.find('[data-test-subj="testQueryEditor-resizeHandle"]').first();
      handle.simulate('mousedown', { 
        clientY: 100, 
        preventDefault: jest.fn(), 
        stopPropagation: jest.fn() 
      });

      // Simulate mouse move
      fireEvent.mouseMove(document, { clientY: 150 });
      
      wrapper.update();
      
      const editor = wrapper.find('[data-test-subj="mockedCodeEditor"]');
      // Height should increase by 50 (150 - 100)
      expect(editor.prop('style')).toEqual({ height: `${DEFAULT_EDITOR_HEIGHT + 50}px` });
    });

    it('stops resizing on mouseup', () => {
      const wrapper = mount(<ResizableQueryEditor {...defaultProps} />);
      
      const handle = wrapper.find('[data-test-subj="testQueryEditor-resizeHandle"]').first();
      handle.simulate('mousedown', { 
        clientY: 100, 
        preventDefault: jest.fn(), 
        stopPropagation: jest.fn() 
      });

      fireEvent.mouseUp(document);
      
      wrapper.update();
      
      // Check that the active class is removed
      expect(
        wrapper.find('.resizableQueryEditor__resizeHandle--active').exists()
      ).toBe(false);
    });

    it('constrains height during drag to valid range', () => {
      const wrapper = mount(<ResizableQueryEditor {...defaultProps} />);
      
      const handle = wrapper.find('[data-test-subj="testQueryEditor-resizeHandle"]').first();
      handle.simulate('mousedown', { 
        clientY: 100, 
        preventDefault: jest.fn(), 
        stopPropagation: jest.fn() 
      });

      // Simulate mouse move way beyond max height
      fireEvent.mouseMove(document, { clientY: 1000 });
      
      wrapper.update();
      
      const editor = wrapper.find('[data-test-subj="mockedCodeEditor"]');
      expect(editor.prop('style')).toEqual({ height: `${MAX_EDITOR_HEIGHT}px` });
    });
  });

  describe('touch resize', () => {
    it('starts resizing on touchstart', () => {
      const wrapper = mount(<ResizableQueryEditor {...defaultProps} />);
      
      const handle = wrapper.find('[data-test-subj="testQueryEditor-resizeHandle"]').first();
      handle.simulate('touchstart', { 
        touches: [{ clientY: 100 }],
        preventDefault: jest.fn()
      });
      
      wrapper.update();
      
      expect(
        wrapper.find('.resizableQueryEditor__resizeHandle--active').exists()
      ).toBe(true);
    });

    it('ignores multi-touch events', () => {
      const wrapper = mount(<ResizableQueryEditor {...defaultProps} />);
      
      const handle = wrapper.find('[data-test-subj="testQueryEditor-resizeHandle"]').first();
      handle.simulate('touchstart', { 
        touches: [{ clientY: 100 }, { clientY: 150 }],
        preventDefault: jest.fn()
      });
      
      wrapper.update();
      
      // Should not start resizing with multi-touch
      expect(
        wrapper.find('.resizableQueryEditor__resizeHandle--active').exists()
      ).toBe(false);
    });

    it('stops resizing on touchend', () => {
      const wrapper = mount(<ResizableQueryEditor {...defaultProps} />);
      
      const handle = wrapper.find('[data-test-subj="testQueryEditor-resizeHandle"]').first();
      handle.simulate('touchstart', { 
        touches: [{ clientY: 100 }],
        preventDefault: jest.fn()
      });

      fireEvent.touchEnd(document);
      
      wrapper.update();
      
      expect(
        wrapper.find('.resizableQueryEditor__resizeHandle--active').exists()
      ).toBe(false);
    });

    it('stops resizing on touchcancel', () => {
      const wrapper = mount(<ResizableQueryEditor {...defaultProps} />);
      
      const handle = wrapper.find('[data-test-subj="testQueryEditor-resizeHandle"]').first();
      handle.simulate('touchstart', { 
        touches: [{ clientY: 100 }],
        preventDefault: jest.fn()
      });

      fireEvent.touchCancel(document);
      
      wrapper.update();
      
      expect(
        wrapper.find('.resizableQueryEditor__resizeHandle--active').exists()
      ).toBe(false);
    });
  });

  describe('default props', () => {
    it('uses default aria-label when not provided', () => {
      const { value, onChange, 'data-test-subj': dataTestSubj } = defaultProps;
      const wrapper = mount(
        <ResizableQueryEditor 
          value={value} 
          onChange={onChange} 
          data-test-subj={dataTestSubj}
        />
      );
      
      const editor = wrapper.find('[data-test-subj="mockedCodeEditor"]');
      expect(editor.prop('aria-label')).toBe('Code Editor');
    });

    it('uses default height when height prop not provided (uncontrolled mode)', () => {
      const { value, onChange, 'data-test-subj': dataTestSubj } = defaultProps;
      const wrapper = mount(
        <ResizableQueryEditor 
          value={value} 
          onChange={onChange} 
          data-test-subj={dataTestSubj}
        />
      );
      
      const editor = wrapper.find('[data-test-subj="mockedCodeEditor"]');
      expect(editor.prop('style')).toEqual({ height: `${DEFAULT_EDITOR_HEIGHT}px` });
    });

    it('uses default data-test-subj for resize handle when not provided', () => {
      const { value, onChange } = defaultProps;
      const wrapper = mount(
        <ResizableQueryEditor value={value} onChange={onChange} />
      );
      
      expect(wrapper.find('[data-test-subj="queryEditorResizeHandle"]').exists()).toBe(true);
    });
  });

  describe('controlled mode', () => {
    it('uses controlled height when height prop is provided', () => {
      const controlledHeight = 300;
      const wrapper = mount(
        <ResizableQueryEditor 
          {...defaultProps} 
          height={controlledHeight}
          onHeightChange={jest.fn()}
        />
      );
      
      const editor = wrapper.find('[data-test-subj="mockedCodeEditor"]');
      expect(editor.prop('style')).toEqual({ height: `${controlledHeight}px` });
    });

    it('calls onHeightChange when resizing in controlled mode', () => {
      const onHeightChange = jest.fn();
      const wrapper = mount(
        <ResizableQueryEditor 
          {...defaultProps} 
          height={DEFAULT_EDITOR_HEIGHT}
          onHeightChange={onHeightChange}
        />
      );
      
      const handle = wrapper.find('[data-test-subj="testQueryEditor-resizeHandle"]').first();
      handle.simulate('keydown', { key: 'ArrowDown', preventDefault: jest.fn() });
      
      expect(onHeightChange).toHaveBeenCalledWith(DEFAULT_EDITOR_HEIGHT + 20);
    });

    it('updates displayed height when controlled height prop changes', () => {
      const wrapper = mount(
        <ResizableQueryEditor 
          {...defaultProps} 
          height={200}
          onHeightChange={jest.fn()}
        />
      );
      
      let editor = wrapper.find('[data-test-subj="mockedCodeEditor"]');
      expect(editor.prop('style')).toEqual({ height: '200px' });
      
      // Update the height prop
      wrapper.setProps({ height: 300 });
      wrapper.update();
      
      editor = wrapper.find('[data-test-subj="mockedCodeEditor"]');
      expect(editor.prop('style')).toEqual({ height: '300px' });
    });
  });

  describe('cleanup', () => {
    it('removes event listeners on unmount during resize', () => {
      const removeEventListenerSpy = jest.spyOn(document, 'removeEventListener');
      
      const wrapper = mount(<ResizableQueryEditor {...defaultProps} />);
      
      const handle = wrapper.find('[data-test-subj="testQueryEditor-resizeHandle"]').first();
      handle.simulate('mousedown', { 
        clientY: 100, 
        preventDefault: jest.fn(), 
        stopPropagation: jest.fn() 
      });

      wrapper.unmount();

      expect(removeEventListenerSpy).toHaveBeenCalledWith('mousemove', expect.any(Function));
      expect(removeEventListenerSpy).toHaveBeenCalledWith('mouseup', expect.any(Function));
      
      removeEventListenerSpy.mockRestore();
    });

    it('resets body styles on unmount during resize', () => {
      const wrapper = mount(<ResizableQueryEditor {...defaultProps} />);
      
      const handle = wrapper.find('[data-test-subj="testQueryEditor-resizeHandle"]').first();
      handle.simulate('mousedown', { 
        clientY: 100, 
        preventDefault: jest.fn(), 
        stopPropagation: jest.fn() 
      });

      wrapper.unmount();

      expect(document.body.style.userSelect).toBe('');
      expect(document.body.style.cursor).toBe('');
    });
  });

  describe('snapshot', () => {
    it('matches snapshot', () => {
      const wrapper = mount(<ResizableQueryEditor {...defaultProps} />);
      expect(wrapper).toMatchSnapshot();
    });

    it('matches snapshot when resizing', () => {
      const wrapper = mount(<ResizableQueryEditor {...defaultProps} />);
      
      const handle = wrapper.find('[data-test-subj="testQueryEditor-resizeHandle"]').first();
      handle.simulate('mousedown', { 
        clientY: 100, 
        preventDefault: jest.fn(), 
        stopPropagation: jest.fn() 
      });
      
      wrapper.update();
      
      expect(wrapper).toMatchSnapshot();
    });
  });
});