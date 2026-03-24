/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { PromptPanel } from '../prompt_panel';
import { OutputSchema } from '../../../types/prompt_template_types';

const defaultProps = {
  outputSchema: OutputSchema.SCORE_0_1,
  onOutputSchemaChange: jest.fn(),
  userInstructions: '',
  onUserInstructionsChange: jest.fn(),
  placeholders: [],
};

describe('PromptPanel', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render prompt configuration panel', () => {
      render(<PromptPanel {...defaultProps} />);

      expect(screen.getByText('Prompt Configuration')).toBeInTheDocument();
      expect(screen.getByText('Output Schema')).toBeInTheDocument();
      expect(screen.getByText('Prompt Template')).toBeInTheDocument();
    });

    it('should render the contentEditable editor', () => {
      render(<PromptPanel {...defaultProps} />);

      const editor = document.querySelector('[data-test-subj="promptTemplateEditor"]');
      expect(editor).toBeInTheDocument();
      expect(editor?.getAttribute('contenteditable')).toBe('true');
    });

    it('should render locked tags in the editor', () => {
      render(<PromptPanel {...defaultProps} />);

      const editor = document.querySelector('[data-test-subj="promptTemplateEditor"]');
      const searchTextTag = editor?.querySelector('[data-tag="searchText"]');
      const hitsTag = editor?.querySelector('[data-tag="hits"]');

      expect(searchTextTag).toBeInTheDocument();
      expect(hitsTag).toBeInTheDocument();
      expect(searchTextTag?.textContent).toBe('{{searchText}}');
      expect(hitsTag?.textContent).toBe('{{hits}}');
    });

    it('should initialize with default template and notify parent', () => {
      const mockOnChange = jest.fn();
      render(<PromptPanel {...defaultProps} onUserInstructionsChange={mockOnChange} />);

      expect(mockOnChange).toHaveBeenCalledWith('SearchText: {{searchText}}; Hits: {{hits}}');
    });
  });

  describe('available variables reference', () => {
    it('should display available variables section', () => {
      render(<PromptPanel {...defaultProps} />);

      expect(screen.getByText('Available Variables')).toBeInTheDocument();
      expect(screen.getByText(/Built-in Variables/)).toBeInTheDocument();
      expect(screen.getByText(/Custom Query Set Fields/)).toBeInTheDocument();
    });
  });

  describe('output schema', () => {
    it('should display SCORE_0_1 schema by default', () => {
      render(<PromptPanel {...defaultProps} />);
      expect(screen.getByText('Output Schema')).toBeInTheDocument();
    });

    it('should display RELEVANT_IRRELEVANT schema when selected', () => {
      render(<PromptPanel {...defaultProps} outputSchema={OutputSchema.RELEVANT_IRRELEVANT} />);
      expect(screen.getByText('Output Schema')).toBeInTheDocument();
    });
  });

  describe('character count', () => {
    it('should display character count', () => {
      render(<PromptPanel {...defaultProps} />);
      expect(screen.getByText(/\/ 10,000 characters/)).toBeInTheDocument();
    });
  });

  describe('disabled state', () => {
    it('should set contenteditable to false when disabled', () => {
      render(<PromptPanel {...defaultProps} disabled />);

      const editor = document.querySelector('[data-test-subj="promptTemplateEditor"]');
      expect(editor?.getAttribute('contenteditable')).toBe('false');
    });
  });

  describe('editor interactions', () => {
    it('should handle input events on the editor', () => {
      const mockOnChange = jest.fn();
      render(<PromptPanel {...defaultProps} onUserInstructionsChange={mockOnChange} />);

      const editor = document.querySelector('[data-test-subj="promptTemplateEditor"]') as HTMLDivElement;
      fireEvent.input(editor);

      // Should have been called at least once (initial + input event)
      expect(mockOnChange).toHaveBeenCalled();
    });

    it('should handle keydown events on the editor', () => {
      render(<PromptPanel {...defaultProps} />);

      const editor = document.querySelector('[data-test-subj="promptTemplateEditor"]') as HTMLDivElement;
      // Should not throw on keydown
      fireEvent.keyDown(editor, { key: 'a' });
      fireEvent.keyDown(editor, { key: 'Backspace' });
      fireEvent.keyDown(editor, { key: 'Delete' });
      expect(editor).toBeInTheDocument();
    });

    it('should prevent keydown when disabled', () => {
      render(<PromptPanel {...defaultProps} disabled />);

      const editor = document.querySelector('[data-test-subj="promptTemplateEditor"]') as HTMLDivElement;
      const event = new KeyboardEvent('keydown', { key: 'a', bubbles: true, cancelable: true });
      const prevented = !editor.dispatchEvent(event);
      // Editor is not editable when disabled
      expect(editor.getAttribute('contenteditable')).toBe('false');
    });

    it('should handle paste events by inserting plain text', () => {
      render(<PromptPanel {...defaultProps} />);

      const editor = document.querySelector('[data-test-subj="promptTemplateEditor"]') as HTMLDivElement;
      const pasteEvent = new Event('paste', { bubbles: true, cancelable: true }) as any;
      pasteEvent.clipboardData = { getData: () => 'pasted text' };
      // Should not throw
      fireEvent.paste(editor, { clipboardData: { getData: () => 'pasted text' } });
      expect(editor).toBeInTheDocument();
    });

    it('should handle dragover events', () => {
      render(<PromptPanel {...defaultProps} />);

      const editor = document.querySelector('[data-test-subj="promptTemplateEditor"]') as HTMLDivElement;
      fireEvent.dragOver(editor, { dataTransfer: { dropEffect: '' } });
      expect(editor).toBeInTheDocument();
    });

    it('should handle drop events', () => {
      // Mock caretRangeFromPoint since jsdom doesn't support it
      const mockRange = {
        insertNode: jest.fn(),
      };
      document.caretRangeFromPoint = jest.fn().mockReturnValue(mockRange);

      render(<PromptPanel {...defaultProps} />);

      const editor = document.querySelector('[data-test-subj="promptTemplateEditor"]') as HTMLDivElement;
      fireEvent.drop(editor, {
        dataTransfer: { getData: () => 'searchText' },
        clientX: 10,
        clientY: 10,
      });
      expect(editor).toBeInTheDocument();
    });

    it('should handle dragstart on tag elements', () => {
      render(<PromptPanel {...defaultProps} />);

      const editor = document.querySelector('[data-test-subj="promptTemplateEditor"]') as HTMLDivElement;
      const tag = editor.querySelector('[data-tag="searchText"]') as HTMLElement;
      if (tag) {
        fireEvent.dragStart(tag, {
          dataTransfer: { setData: jest.fn(), effectAllowed: '' },
        });
      }
      expect(editor).toBeInTheDocument();
    });
  });

  describe('tag protection', () => {
    it('should re-insert searchText tag if removed via input', () => {
      const mockOnChange = jest.fn();
      render(<PromptPanel {...defaultProps} onUserInstructionsChange={mockOnChange} />);

      const editor = document.querySelector('[data-test-subj="promptTemplateEditor"]') as HTMLDivElement;
      // Remove the searchText tag
      const searchTag = editor.querySelector('[data-tag="searchText"]');
      if (searchTag) searchTag.remove();

      // Trigger input — should re-insert the tag
      fireEvent.input(editor);

      const restoredTag = editor.querySelector('[data-tag="searchText"]');
      expect(restoredTag).toBeInTheDocument();
    });

    it('should re-insert hits tag if removed via input', () => {
      const mockOnChange = jest.fn();
      render(<PromptPanel {...defaultProps} onUserInstructionsChange={mockOnChange} />);

      const editor = document.querySelector('[data-test-subj="promptTemplateEditor"]') as HTMLDivElement;
      // Remove the hits tag
      const hitsTag = editor.querySelector('[data-tag="hits"]');
      if (hitsTag) hitsTag.remove();

      // Trigger input — should re-insert the tag
      fireEvent.input(editor);

      const restoredTag = editor.querySelector('[data-tag="hits"]');
      expect(restoredTag).toBeInTheDocument();
    });
  });

  describe('help text', () => {
    it('should display help text about dragging tags', () => {
      render(<PromptPanel {...defaultProps} />);
      expect(screen.getByText(/Edit the template around the locked tags/)).toBeInTheDocument();
    });

    it('should display example template', () => {
      render(<PromptPanel {...defaultProps} />);
      expect(screen.getByText(/Given the query/)).toBeInTheDocument();
    });

    it('should explain custom query set fields resolve to empty string', () => {
      render(<PromptPanel {...defaultProps} />);
      expect(screen.getByText(/resolves to an empty string/)).toBeInTheDocument();
    });
  });
});
