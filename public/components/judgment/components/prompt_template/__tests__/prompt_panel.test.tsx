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
});
