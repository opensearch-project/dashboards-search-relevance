/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

interface HighlightTextProps {
  text: string;
  preTags?: string[];
  postTags?: string[];
}

export const HighlightText: React.FC<HighlightTextProps> = ({ text, preTags, postTags }) => {
  const defaultPreTags = ['<em>', '&lt;em&gt;'];
  const defaultPostTags = ['</em>', '&lt;/em&gt;'];
  const actualPreTags = preTags && preTags.length > 0 ? preTags : defaultPreTags;
  const actualPostTags = postTags && postTags.length > 0 ? postTags : defaultPostTags;
  
  const allTags = [...actualPreTags, ...actualPostTags].map(tag => tag.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');
  const parts = text.split(new RegExp(`(${allTags})`));
  let isHighlighted = false;

  return (
    <>
      {parts.map((part, index) => {
        if (actualPreTags.includes(part)) {
          isHighlighted = true;
          return null;
        }
        if (actualPostTags.includes(part)) {
          isHighlighted = false;
          return null;
        }
        return isHighlighted ? (
          <mark key={index} style={{ backgroundColor: '#ffeb3b', color: '#000' }}>
            {part}
          </mark>
        ) : (
          <span key={index}>{part}</span>
        );
      })}
    </>
  );
};