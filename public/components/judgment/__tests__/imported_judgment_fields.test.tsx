/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ImportedJudgmentFields } from '../components/imported_judgment_fields';

describe('ImportedJudgmentFields', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render label and help text', () => {
    render(<ImportedJudgmentFields />);

    expect(screen.getByText('Upload Judgment CSV')).toBeInTheDocument();
    expect(
      screen.getByText('Upload a CSV file in the format: query,docid,rating')
    ).toBeInTheDocument();
  });

  it('should render file picker with default id', () => {
    render(<ImportedJudgmentFields />);

    const input = document.querySelector('#judgmentCsvFilePicker');
    expect(input).toBeTruthy();
  });

  it('should render file picker with custom id', () => {
    render(<ImportedJudgmentFields filePickerId="myCustomId" />);

    const input = document.querySelector('#myCustomId');
    expect(input).toBeTruthy();
  });

  it('should call handleJudgmentFileContent when a file is selected', () => {
    const handleJudgmentFileContent = jest.fn();

    render(
      <ImportedJudgmentFields handleJudgmentFileContent={handleJudgmentFileContent} />
    );

    // EuiFilePicker renders an <input type="file"> internally.
    // We can just query by the aria-label you set.
    const fileInput = screen.getByLabelText('Upload judgment CSV file') as HTMLInputElement;

    const file = new File(['query,docid,rating\nq1,d1,1'], 'test.csv', {
      type: 'text/csv',
    });

    fireEvent.change(fileInput, {
      target: { files: [file] },
    });

    expect(handleJudgmentFileContent).toHaveBeenCalledTimes(1);
    expect(handleJudgmentFileContent).toHaveBeenCalledTimes(1);

    const arg = handleJudgmentFileContent.mock.calls[0][0];
    expect(arg).toBeDefined();
    expect(arg.length).toBe(1);
    expect(arg[0]).toBeInstanceOf(File);
  });

  it('should not crash if handleJudgmentFileContent is not provided', () => {
    render(<ImportedJudgmentFields />);

    const fileInput = screen.getByLabelText('Upload judgment CSV file') as HTMLInputElement;

    const file = new File(['hello'], 'test.csv', { type: 'text/csv' });

    expect(() => {
      fireEvent.change(fileInput, { target: { files: [file] } });
    }).not.toThrow();
  });

  it('should show upload error if provided', () => {
    render(<ImportedJudgmentFields uploadError="Bad CSV file" />);

    // EuiFormRow renders the error string into the DOM
    expect(screen.getByText('Bad CSV file')).toBeInTheDocument();
  });
});
