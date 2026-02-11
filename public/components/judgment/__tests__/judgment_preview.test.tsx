/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { JudgmentPreview } from '../components/judgment_preview';

const makeParsedJudgments = () => [
  JSON.stringify({
    query: 'laptop charger 65w',
    ratings: [
      { docId: 'doc1', rating: '1' },
      { docId: 'doc2', rating: '0' },
    ],
  }),
  JSON.stringify({
    query: '12v dc adapter',
    ratings: [{ docId: 'doc9', rating: '0.5' }],
  }),
];

describe('JudgmentPreview', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render nothing when there is no preview data', () => {
    const { container } = render(<JudgmentPreview parsedJudgments={[]} />);

    // Component returns null
    expect(container.firstChild).toBeNull();
  });

  it('should render preview panel when parsedJudgments exist', () => {
    render(<JudgmentPreview parsedJudgments={makeParsedJudgments()} />);

    expect(screen.getByText('Parsed Judgments Preview')).toBeInTheDocument();
    expect(screen.getByText('Preview')).toBeInTheDocument();

    // queries should show up
    expect(screen.getByText('laptop charger 65w')).toBeInTheDocument();
    expect(screen.getByText('12v dc adapter')).toBeInTheDocument();
  });

  it('should expand a query and show its ratings', () => {
    render(<JudgmentPreview parsedJudgments={makeParsedJudgments()} />);

    // Initially collapsed, so rating lines should not appear
    expect(screen.queryByText(/Doc ID: doc1/i)).not.toBeInTheDocument();

    // Click the query row to expand
    fireEvent.click(screen.getByText('laptop charger 65w'));

    expect(screen.getByText('Doc ID: doc1 • Rating: 1')).toBeInTheDocument();
    expect(screen.getByText('Doc ID: doc2 • Rating: 0')).toBeInTheDocument();
  });

  it('should expand all and collapse all', () => {
    render(<JudgmentPreview parsedJudgments={makeParsedJudgments()} />);

    fireEvent.click(screen.getByText('Expand All'));

    expect(screen.getByText('Doc ID: doc1 • Rating: 1')).toBeInTheDocument();
    expect(screen.getByText('Doc ID: doc2 • Rating: 0')).toBeInTheDocument();
    expect(screen.getByText('Doc ID: doc9 • Rating: 0.5')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Collapse All'));

    expect(screen.queryByText('Doc ID: doc1 • Rating: 1')).not.toBeInTheDocument();
    expect(screen.queryByText('Doc ID: doc9 • Rating: 0.5')).not.toBeInTheDocument();
  });

  it('should filter queries using search input (by query text)', () => {
    render(<JudgmentPreview parsedJudgments={makeParsedJudgments()} />);

    const input = screen.getByPlaceholderText('Search query, doc ID, or rating (Ctrl+F also works)');

    fireEvent.change(input, { target: { value: '12v' } });

    expect(screen.getByText('12v dc adapter')).toBeInTheDocument();
    expect(screen.queryByText('laptop charger 65w')).not.toBeInTheDocument();
  });

  it('should filter queries using search input (by doc id)', () => {
    render(<JudgmentPreview parsedJudgments={makeParsedJudgments()} />);

    const input = screen.getByPlaceholderText('Search query, doc ID, or rating (Ctrl+F also works)');

    fireEvent.change(input, { target: { value: 'doc2' } });

    expect(screen.getByText('laptop charger 65w')).toBeInTheDocument();
    expect(screen.queryByText('12v dc adapter')).not.toBeInTheDocument();
  });

  it('should show "No matches found" when search returns nothing', () => {
    render(<JudgmentPreview parsedJudgments={makeParsedJudgments()} />);

    const input = screen.getByPlaceholderText('Search query, doc ID, or rating (Ctrl+F also works)');

    fireEvent.change(input, { target: { value: 'zzzzzz' } });

    expect(screen.getByText('No matches found for')).toBeInTheDocument();
  });

  it('should render parseSummary info and sample errors', () => {
    render(
      <JudgmentPreview
        parsedJudgments={makeParsedJudgments()}
        parseSummary={{
          totalLinesRead: 10,
          headerLinesSkipped: 1,
          successfulRecords: 8,
          failedRecords: 2,
          uniqueQueries: 2,
          ratingDistribution: { '1': 3, '0': 2 },
          errors: [
            { line: 2, raw: 'bad,line', error: 'Invalid format' },
            { line: 6, raw: 'missing,rating,', error: 'Missing values' },
          ],
        }}
      />
    );

    expect(screen.getByText('Parsed with warnings')).toBeInTheDocument();
    expect(screen.getByText('8')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('2 unique queries')).toBeInTheDocument();

    expect(screen.getByText(/Total lines read:/i)).toBeInTheDocument();
    expect(screen.getByText(/headers skipped:/i)).toBeInTheDocument();

    expect(screen.getByText(/Rating Distribution:/i)).toBeInTheDocument();
    expect(screen.getByText(/1: 3/i)).toBeInTheDocument();
    expect(screen.getByText(/0: 2/i)).toBeInTheDocument();

    expect(screen.getByText('Sample Errors:')).toBeInTheDocument();
    expect(screen.getByText(/Line 2:/i)).toBeInTheDocument();
    expect(screen.getByText(/Invalid format/i)).toBeInTheDocument();
    expect(screen.getByText(/bad,line/i)).toBeInTheDocument();
  });

  it('should show "Showing 10 of X errors" when errors exceed MAX_ERROR_PREVIEW', () => {
    const errors = Array.from({ length: 15 }).map((_, i) => ({
      line: i + 1,
      raw: `bad,row,${i}`,
      error: 'Invalid format',
    }));

    render(
      <JudgmentPreview
        parsedJudgments={makeParsedJudgments()}
        parseSummary={{
          totalLinesRead: 16,
          headerLinesSkipped: 1,
          successfulRecords: 1,
          failedRecords: 15,
          uniqueQueries: 1,
          ratingDistribution: {},
          errors,
        }}
      />
    );

    expect(screen.getByText('Showing 10 of 15 errors.')).toBeInTheDocument();
  });

  it('should ignore invalid JSON strings in parsedJudgments', () => {
    render(
      <JudgmentPreview
        parsedJudgments={[
          'NOT_JSON',
          JSON.stringify({
            query: 'valid query',
            ratings: [{ docId: 'doc1', rating: '1' }],
          }),
        ]}
      />
    );

    expect(screen.getByText('valid query')).toBeInTheDocument();
  });
});
