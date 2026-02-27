/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { QuerySetHelpButton } from '../components/query_set_help';

describe('QuerySetHelpButton', () => {
  // Store original implementations
  const originalCreateObjectURL = URL.createObjectURL;
  const originalRevokeObjectURL = URL.revokeObjectURL;

  beforeEach(() => {
    // Mock URL methods
    URL.createObjectURL = jest.fn(() => 'blob:mock-url');
    URL.revokeObjectURL = jest.fn();
  });

  afterEach(() => {
    // Restore original implementations
    URL.createObjectURL = originalCreateObjectURL;
    URL.revokeObjectURL = originalRevokeObjectURL;
    jest.restoreAllMocks();
  });

  describe('Rendering', () => {
    it('renders the help button', () => {
      render(<QuerySetHelpButton />);

      expect(screen.getByTestId('querySetHelpButton')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /help/i })).toBeInTheDocument();
    });

    it('does not show flyout content by default', () => {
      render(<QuerySetHelpButton />);

      // Flyout content should not be visible initially
      expect(screen.queryByText('Text Input Format')).not.toBeInTheDocument();
    });
  });

  describe('Flyout Interaction', () => {
    it('opens flyout when help button is clicked', () => {
      render(<QuerySetHelpButton />);

      const helpButton = screen.getByTestId('querySetHelpButton');
      fireEvent.click(helpButton);

      // After clicking, flyout content should be visible
      expect(screen.getByText('Text Input Format')).toBeInTheDocument();
      expect(screen.getByText('File Upload')).toBeInTheDocument();
    });

    it('displays text input format documentation when open', () => {
      render(<QuerySetHelpButton />);

      fireEvent.click(screen.getByTestId('querySetHelpButton'));

      expect(screen.getByText('Text Input Format')).toBeInTheDocument();
      expect(screen.getByText(/Plain text:/)).toBeInTheDocument();
      expect(screen.getByText(/Key-value format:/)).toBeInTheDocument();
      expect(screen.getByText(/NDJSON format:/)).toBeInTheDocument();
    });

    it('displays file upload documentation when open', () => {
      render(<QuerySetHelpButton />);

      fireEvent.click(screen.getByTestId('querySetHelpButton'));

      expect(screen.getByText('File Upload')).toBeInTheDocument();
      // NDJSON format appears multiple times (in text input section and file upload section)
      expect(screen.getAllByText(/NDJSON format/i).length).toBeGreaterThan(0);
    });

    it('displays code examples for text input when open', () => {
      render(<QuerySetHelpButton />);

      fireEvent.click(screen.getByTestId('querySetHelpButton'));

      const textExample = screen.getByTestId('textInputExample');
      expect(textExample).toBeInTheDocument();
      expect(textExample.textContent).toContain('red bluejeans');
      expect(textExample.textContent).toContain('query: "capital of France?", answer: "Paris"');
    });

    it('displays download buttons with correct labels when open', () => {
      render(<QuerySetHelpButton />);

      fireEvent.click(screen.getByTestId('querySetHelpButton'));

      expect(screen.getByTestId('downloadBasicSampleButton')).toBeInTheDocument();
      expect(screen.getByTestId('downloadReferenceSampleButton')).toBeInTheDocument();
      expect(screen.getByText('Download sample file')).toBeInTheDocument();
      expect(screen.getByText('Download sample with references')).toBeInTheDocument();
    });

    it('renders flyout with proper structure', () => {
      render(<QuerySetHelpButton />);

      fireEvent.click(screen.getByTestId('querySetHelpButton'));

      // Flyout should have proper test ID and title
      expect(screen.getByTestId('querySetHelpFlyout')).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: 'Help' })).toBeInTheDocument();
    });
  });

  describe('Download Functionality', () => {
    it('calls URL.createObjectURL when downloading basic sample', () => {
      render(<QuerySetHelpButton />);

      fireEvent.click(screen.getByTestId('querySetHelpButton'));

      const downloadButton = screen.getByTestId('downloadBasicSampleButton');
      fireEvent.click(downloadButton);

      expect(URL.createObjectURL).toHaveBeenCalledTimes(1);
      expect(URL.revokeObjectURL).toHaveBeenCalledTimes(1);
    });

    it('calls URL.createObjectURL when downloading sample with references', () => {
      render(<QuerySetHelpButton />);

      fireEvent.click(screen.getByTestId('querySetHelpButton'));

      const downloadButton = screen.getByTestId('downloadReferenceSampleButton');
      fireEvent.click(downloadButton);

      expect(URL.createObjectURL).toHaveBeenCalledTimes(1);
      expect(URL.revokeObjectURL).toHaveBeenCalledTimes(1);
    });

    it('creates Blob with correct MIME type for NDJSON', () => {
      render(<QuerySetHelpButton />);

      fireEvent.click(screen.getByTestId('querySetHelpButton'));

      const downloadButton = screen.getByTestId('downloadBasicSampleButton');
      fireEvent.click(downloadButton);

      // Verify createObjectURL was called with a Blob
      const createObjectURLMock = URL.createObjectURL as jest.Mock;
      expect(createObjectURLMock).toHaveBeenCalled();

      const blobArg = createObjectURLMock.mock.calls[0][0];
      expect(blobArg).toBeInstanceOf(Blob);
      expect(blobArg.type).toBe('application/x-ndjson');
    });
  });

  describe('Content Accuracy', () => {
    it('shows all three supported input format types', () => {
      render(<QuerySetHelpButton />);

      fireEvent.click(screen.getByTestId('querySetHelpButton'));

      // Check that all format types are documented by looking for text content
      expect(screen.getByText(/Plain text:/)).toBeInTheDocument();
      expect(screen.getByText(/Key-value format:/)).toBeInTheDocument();
      expect(screen.getByText(/NDJSON format:/)).toBeInTheDocument();
    });

    it('mentions queryText field in documentation', () => {
      render(<QuerySetHelpButton />);

      fireEvent.click(screen.getByTestId('querySetHelpButton'));

      // queryText appears multiple times in examples, so use getAllByText
      expect(screen.getAllByText(/queryText/).length).toBeGreaterThan(0);
    });

    it('mentions referenceAnswer as optional field', () => {
      render(<QuerySetHelpButton />);

      fireEvent.click(screen.getByTestId('querySetHelpButton'));

      // Check that the optional nature of referenceAnswer is documented
      expect(screen.getByText(/optional/i)).toBeInTheDocument();
      // referenceAnswer appears multiple times in examples, so use getAllByText
      expect(screen.getAllByText(/referenceAnswer/).length).toBeGreaterThan(0);
    });
  });

  describe('Accessibility', () => {
    it('help button is accessible', () => {
      render(<QuerySetHelpButton />);

      const button = screen.getByRole('button', { name: /help/i });
      expect(button).toBeInTheDocument();
    });

    it('download buttons are accessible when flyout is open', () => {
      render(<QuerySetHelpButton />);

      fireEvent.click(screen.getByTestId('querySetHelpButton'));

      const basicButton = screen.getByTestId('downloadBasicSampleButton');
      const referenceButton = screen.getByTestId('downloadReferenceSampleButton');

      expect(basicButton).toBeInTheDocument();
      expect(referenceButton).toBeInTheDocument();
      expect(basicButton.textContent).toContain('Download sample file');
      expect(referenceButton.textContent).toContain('Download sample with references');
    });
  });
});