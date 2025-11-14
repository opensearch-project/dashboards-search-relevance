/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
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
      expect(screen.getByText(/User Input Instructions/)).toBeInTheDocument();
    });
  });

  describe('duplicate placeholder detection', () => {
    it('should show warning when duplicate placeholders exist', () => {
      const props = {
        ...defaultProps,
        userInstructions: '{{query}} and {{query}} and {{category}} and {{category}}',
        placeholders: ['query', 'query', 'category', 'category'],
      };

      render(<PromptPanel {...props} />);

      expect(screen.getByText(/Duplicate placeholders detected/)).toBeInTheDocument();
    });

    it('should not show warning when no duplicate placeholders', () => {
      const props = {
        ...defaultProps,
        userInstructions: '{{query}} and {{category}}',
        placeholders: ['query', 'category'],
      };

      render(<PromptPanel {...props} />);

      expect(screen.queryByText(/Duplicate placeholders detected/)).not.toBeInTheDocument();
    });

    it('should handle single duplicate placeholder', () => {
      const props = {
        ...defaultProps,
        userInstructions: '{{query}} and {{query}}',
        placeholders: ['query', 'query'],
      };

      render(<PromptPanel {...props} />);

      expect(screen.getByText(/Duplicate placeholders detected/)).toBeInTheDocument();
    });
  });

  describe('output schema', () => {
    it('should display SCORE_0_1 schema by default', () => {
      render(<PromptPanel {...defaultProps} />);

      expect(screen.getByText('Output Schema')).toBeInTheDocument();
    });

    it('should display RELEVANT_IRRELEVANT schema when selected', () => {
      const props = {
        ...defaultProps,
        outputSchema: OutputSchema.RELEVANT_IRRELEVANT,
      };

      render(<PromptPanel {...props} />);

      expect(screen.getByText('Output Schema')).toBeInTheDocument();
    });
  });
});
