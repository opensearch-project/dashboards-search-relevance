/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { ItemDetailHoverPane } from '../item_detail_hover_pane';

const mockItem = {
  _id: 'test-id',
  _score: 0.95,
  rank: 1,
  title: 'Test Document',
  content: 'This is <em>highlighted</em> content',
  highlight: {
    content: ['This is <em>highlighted</em> content'],
    title: ['Test <em>Document</em>']
  }
};

const mockMousePosition = { x: 100, y: 100 };

describe('ItemDetailHoverPane', () => {
  const defaultProps = {
    item: mockItem,
    mousePosition: mockMousePosition,
    onMouseEnter: jest.fn(),
    onMouseLeave: jest.fn(),
    imageFieldName: null,
  };

  beforeEach(() => {
    // Mock window dimensions
    Object.defineProperty(window, 'innerWidth', { value: 1024, writable: true });
    Object.defineProperty(window, 'innerHeight', { value: 768, writable: true });
  });

  it('should render item details with highlighted text', () => {
    const { container, getByText } = render(<ItemDetailHoverPane {...defaultProps} />);
    
    expect(getByText('Item Details')).toBeInTheDocument();
    expect(getByText('test-id')).toBeInTheDocument();
    
    // Check that highlighted content is rendered
    const marks = container.querySelectorAll('mark');
    expect(marks.length).toBeGreaterThan(0);
  });

  it('should use highlighted text from item.highlight when available', () => {
    const { container } = render(<ItemDetailHoverPane {...defaultProps} />);
    
    const marks = container.querySelectorAll('mark');
    expect(marks).toHaveLength(2); // One for content, one for title
    expect(marks[1]).toHaveTextContent('highlighted');
    expect(marks[0]).toHaveTextContent('Document');
  });

  it('should use custom highlight tags when provided', () => {
    const itemWithStrongTags = {
      ...mockItem,
      highlight: {
        content: ['This is <strong>highlighted</strong> content'],
      }
    };
    
    const preTags = ['<strong>', '&lt;strong&gt;'];
    const postTags = ['</strong>', '&lt;/strong&gt;'];
    
    const { container } = render(
      <ItemDetailHoverPane 
        {...defaultProps} 
        item={itemWithStrongTags}
        highlightPreTags={preTags}
        highlightPostTags={postTags}
      />
    );
    
    const mark = container.querySelector('mark');
    expect(mark).toBeInTheDocument();
    expect(mark).toHaveTextContent('highlighted');
  });

  it('should fall back to original text when no highlight is available', () => {
    const itemWithoutHighlight = {
      ...mockItem,
      highlight: undefined,
      content: 'Plain text content'
    };
    
    const { getByText } = render(
      <ItemDetailHoverPane {...defaultProps} item={itemWithoutHighlight} />
    );
    
    expect(getByText('Plain text content')).toBeInTheDocument();
  });

  it('should call onMouseLeave when close button is clicked', () => {
    const onMouseLeave = jest.fn();
    const { getByText } = render(
      <ItemDetailHoverPane {...defaultProps} onMouseLeave={onMouseLeave} />
    );
    
    const closeButton = getByText('✕');
    fireEvent.click(closeButton);
    
    expect(onMouseLeave).toHaveBeenCalled();
  });

  it('should not render when item is null', () => {
    const { container } = render(
      <ItemDetailHoverPane {...defaultProps} item={null} />
    );
    
    expect(container.firstChild).toBeNull();
  });

  it('should position tooltip based on mouse position', () => {
    const { container } = render(<ItemDetailHoverPane {...defaultProps} />);
    
    const tooltip = container.firstChild as HTMLElement;
    expect(tooltip).toHaveClass('fixed');
  });

  it('should render image when imageFieldName is provided and item has image', () => {
    const itemWithImage = {
      ...mockItem,
      thumbnail: 'https://example.com/image.jpg'
    };
    
    const { container } = render(
      <ItemDetailHoverPane 
        {...defaultProps} 
        item={itemWithImage}
        imageFieldName="thumbnail"
      />
    );
    
    const img = container.querySelector('img');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', 'https://example.com/image.jpg');
  });
});