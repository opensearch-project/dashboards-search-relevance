/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { render } from '@testing-library/react';
import { HighlightText } from '../highlight_text';

describe('HighlightText', () => {
  it('should highlight text with default em tags', () => {
    const text = 'This is <em>highlighted</em> text';
    const { container } = render(<HighlightText text={text} />);
    
    const mark = container.querySelector('mark');
    expect(mark).toBeInTheDocument();
    expect(mark).toHaveTextContent('highlighted');
    expect(mark).toHaveStyle({ backgroundColor: '#ffeb3b', color: '#000' });
  });

  it('should highlight text with HTML entity em tags', () => {
    const text = 'This is &lt;em&gt;highlighted&lt;/em&gt; text';
    const { container } = render(<HighlightText text={text} />);
    
    const mark = container.querySelector('mark');
    expect(mark).toBeInTheDocument();
    expect(mark).toHaveTextContent('highlighted');
  });

  it('should highlight text with custom strong tags', () => {
    const text = 'This is <strong>highlighted</strong> text';
    const preTags = ['<strong>', '&lt;strong&gt;'];
    const postTags = ['</strong>', '&lt;/strong&gt;'];
    
    const { container } = render(
      <HighlightText text={text} preTags={preTags} postTags={postTags} />
    );
    
    const mark = container.querySelector('mark');
    expect(mark).toBeInTheDocument();
    expect(mark).toHaveTextContent('highlighted');
  });

  it('should highlight multiple segments in the same text', () => {
    const text = 'This <em>first</em> and <em>second</em> are highlighted';
    const { container } = render(<HighlightText text={text} />);
    
    const marks = container.querySelectorAll('mark');
    expect(marks).toHaveLength(2);
    expect(marks[0]).toHaveTextContent('first');
    expect(marks[1]).toHaveTextContent('second');
  });

  it('should render plain text when no highlight tags are present', () => {
    const text = 'This is plain text';
    const { container } = render(<HighlightText text={text} />);
    
    const mark = container.querySelector('mark');
    expect(mark).not.toBeInTheDocument();
    expect(container).toHaveTextContent('This is plain text');
  });

  it('should use default tags when preTags and postTags are empty', () => {
    const text = 'This is <em>highlighted</em> text';
    const { container } = render(
      <HighlightText text={text} preTags={[]} postTags={[]} />
    );
    
    const mark = container.querySelector('mark');
    expect(mark).toBeInTheDocument();
    expect(mark).toHaveTextContent('highlighted');
  });
});