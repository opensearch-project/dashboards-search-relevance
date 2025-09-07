/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ItemDetailHoverPane } from '../item_detail_hover_pane';

const mockItem = {
  _id: '1',
  rank: 1,
  title: 'Test Document',
  description: 'Test description',
  image: 'https://example.com/image.jpg',
};

const mockMousePosition = { x: 100, y: 100 };

const defaultProps = {
  item: mockItem,
  mousePosition: mockMousePosition,
  onMouseEnter: jest.fn(),
  onMouseLeave: jest.fn(),
  imageFieldName: 'image',
};

describe('ItemDetailHoverPane', () => {
  it('renders nothing when item is null', () => {
    const { container } = render(<ItemDetailHoverPane {...defaultProps} item={null} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders with default position when mousePosition is null', () => {
    const { container } = render(<ItemDetailHoverPane {...defaultProps} mousePosition={null} />);
    const tooltip = container.querySelector('.comparison-tooltip');
    expect(tooltip).toBeInTheDocument();
    expect(tooltip).toHaveStyle({ left: '0px', top: '0px' });
  });

  it('renders item details when item and mousePosition are provided', () => {
    render(<ItemDetailHoverPane {...defaultProps} />);
    expect(screen.getByText('Test Document')).toBeInTheDocument();
    expect(screen.getByText('Test description')).toBeInTheDocument();
  });

  it('renders image when imageFieldName matches', () => {
    render(<ItemDetailHoverPane {...defaultProps} />);
    const image = screen.getByRole('img');
    expect(image).toHaveAttribute('src', 'https://example.com/image.jpg');
  });

  it('calls onMouseLeave when mouse leaves', () => {
    render(<ItemDetailHoverPane {...defaultProps} />);
    const tooltip = screen.getByText('Test Document').closest('div');
    fireEvent.mouseLeave(tooltip);
    expect(defaultProps.onMouseLeave).toHaveBeenCalled();
  });

  it('positions tooltip based on mousePosition with adjustments', () => {
    const { container } = render(<ItemDetailHoverPane {...defaultProps} />);
    const tooltip = container.querySelector('.comparison-tooltip');
    expect(tooltip).toBeInTheDocument();
    expect(tooltip).toHaveClass('fixed');
  });
});