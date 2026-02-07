/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ResultItems } from '../result_items';

const mockItems = [
  {
    _id: '1',
    rank: 1,
    title: 'Test Document 1',
    highlight: { title: ['<em>Test</em> Document 1'] },
  },
  {
    _id: '2',
    rank: 2,
    title: 'Test Document 2',
    image: 'https://example.com/image.jpg',
  },
];

const defaultProps = {
  items: mockItems,
  resultNum: 1,
  displayField: 'title',
  getStatusColor: jest.fn(() => 'bg-blue-300'),
  handleItemClick: jest.fn(),
  result1ItemsRef: { current: {} },
  result2ItemsRef: { current: {} },
  sizeMultiplier: 2,
};

describe('ResultItems', () => {
  it('renders items correctly', () => {
    render(<ResultItems {...defaultProps} />);
    expect(screen.getByText('Test')).toBeInTheDocument();
    expect(screen.getByText('Test Document 2')).toBeInTheDocument();
  });

  it('displays rank numbers', () => {
    render(<ResultItems {...defaultProps} />);
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('handles item clicks', () => {
    render(<ResultItems {...defaultProps} />);
    const firstItem = screen.getByText('1').closest('div');
    fireEvent.click(firstItem);
    expect(defaultProps.handleItemClick).toHaveBeenCalled();
  });

  it('renders highlighted text', () => {
    const { container } = render(<ResultItems {...defaultProps} />);
    const markElement = container.querySelector('mark');
    expect(markElement).toBeInTheDocument();
    expect(markElement).toHaveTextContent('Test');
  });

  it('renders images when imageFieldName is provided', () => {
    const propsWithImage = {
      ...defaultProps,
      imageFieldName: 'image',
      items: [
        {
          _id: '1',
          rank: 1,
          title: 'Test Document 1',
          image: 'https://example.com/image.jpg',
        },
      ],
    };
    render(<ResultItems {...propsWithImage} />);
    const image = screen.getByRole('img');
    expect(image).toHaveAttribute('src', 'https://example.com/image.jpg');
  });

  it('applies correct size multiplier', () => {
    const propsWithImage = {
      ...defaultProps,
      imageFieldName: 'image',
      sizeMultiplier: 3,
      items: [
        {
          _id: '1',
          rank: 1,
          title: 'Test Document 1',
          image: 'https://example.com/image.jpg',
        },
      ],
    };
    const { container } = render(<ResultItems {...propsWithImage} />);
    const imageContainer = container.querySelector('[style*="width: 96px"]');
    expect(imageContainer).toBeInTheDocument();
  });
});