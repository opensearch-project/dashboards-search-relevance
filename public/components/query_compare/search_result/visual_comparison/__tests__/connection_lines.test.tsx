/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { render } from '@testing-library/react';
import { ConnectionLines } from '../connection_lines';

const mockResult1 = [
  { _id: '1', rank: 1 },
  { _id: '2', rank: 2 },
];

const mockResult2 = [
  { _id: '1', rank: 2 },
  { _id: '3', rank: 1 },
];

const mockLineColors = {
  unchanged: { stroke: '#93C5FD', strokeWidth: 4 },
  increased: { stroke: '#86EFAC', strokeWidth: 4 },
  decreased: { stroke: '#FCA5A5', strokeWidth: 4 },
};

const defaultProps = {
  mounted: true,
  result1: mockResult1,
  result2: mockResult2,
  result1ItemsRef: { current: {} },
  result2ItemsRef: { current: {} },
  lineColors: mockLineColors,
};

describe('ConnectionLines', () => {
  it('renders SVG element', () => {
    const { container } = render(<ConnectionLines {...defaultProps} />);
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('does not render lines when not mounted', () => {
    const { container } = render(<ConnectionLines {...defaultProps} mounted={false} />);
    const lines = container.querySelectorAll('line');
    expect(lines).toHaveLength(0);
  });

  it('handles empty results', () => {
    const { container } = render(<ConnectionLines {...defaultProps} result1={[]} result2={[]} />);
    const lines = container.querySelectorAll('line');
    expect(lines).toHaveLength(0);
  });
});