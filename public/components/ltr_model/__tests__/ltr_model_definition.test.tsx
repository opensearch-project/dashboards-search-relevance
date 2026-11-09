/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { LtrModelDefinition, formatDefinition } from '../components/ltr_model_definition';

describe('formatDefinition', () => {
  it('shows a RankLib definition verbatim as text', () => {
    const ranklib = '## LambdaMART\n## No. of trees = 1\n<ensemble>\n</ensemble>';
    expect(formatDefinition(ranklib)).toEqual({ body: ranklib, language: 'text' });
  });

  it('pretty-prints a definition stored as embedded JSON', () => {
    expect(formatDefinition({ feature1: 1.2 })).toEqual({
      body: '{\n  "feature1": 1.2\n}',
      language: 'json',
    });
  });

  it('pretty-prints a JSON definition that arrives as a string', () => {
    expect(formatDefinition('{"feature1":1.2}')).toEqual({
      body: '{\n  "feature1": 1.2\n}',
      language: 'json',
    });
  });

  it('treats a bare numeric string as text rather than JSON', () => {
    expect(formatDefinition('42')).toEqual({ body: '42', language: 'text' });
  });

  it('handles an absent definition', () => {
    expect(formatDefinition(undefined)).toEqual({ body: '', language: 'text' });
    expect(formatDefinition(null)).toEqual({ body: '', language: 'text' });
  });
});

describe('LtrModelDefinition', () => {
  it('renders a large definition without truncating it', () => {
    // 500 trees worth of lines; the whole thing must survive to the DOM.
    const lines = Array.from({ length: 500 }, (_, i) => `${i}:${i * 1.5}`);
    const definition = `## LambdaMART\n${lines.join('\n')}`;

    render(<LtrModelDefinition definition={definition} />);

    const block = screen.getByTestId('ltrModelDefinition');
    expect(block.textContent).toContain('0:0');
    expect(block.textContent).toContain('499:748.5');
    expect(block.textContent).toBe(definition);
  });

  it('explains an empty definition', () => {
    render(<LtrModelDefinition definition={undefined} />);
    expect(screen.getByText('This model has no stored definition.')).toBeInTheDocument();
  });
});
