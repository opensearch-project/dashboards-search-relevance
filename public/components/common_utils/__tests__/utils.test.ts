/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { escapeCsvCell, isNameValid } from '../utils';

describe('Utils helper functions', () => {
  it('validates isNameValid function', () => {
    expect(isNameValid('Lorem ipsum dolor sit amet, consectetur adipiscing elit,')).toBe(false);
    expect(isNameValid('Lorem ipsum dolor sit amet, consectetur adipiscin')).toBe(true);
  });

  it('passes plain values through escapeCsvCell unchanged', () => {
    expect(escapeCsvCell('doc-id_1')).toBe('doc-id_1');
    expect(escapeCsvCell('0.5')).toBe('0.5');
    expect(escapeCsvCell(1)).toBe('1');
    expect(escapeCsvCell(undefined)).toBe('');
    expect(escapeCsvCell(null)).toBe('');
  });

  it('neutralizes formula-leading values in escapeCsvCell', () => {
    expect(escapeCsvCell('=1+1')).toBe("'=1+1");
    expect(escapeCsvCell('+SUM(A1)')).toBe("'+SUM(A1)");
    expect(escapeCsvCell('-2')).toBe("'-2");
    expect(escapeCsvCell('@cmd')).toBe("'@cmd");
    expect(escapeCsvCell('\tx')).toBe("'\tx");
  });

  it('quotes delimiters, quotes and newlines in escapeCsvCell', () => {
    expect(escapeCsvCell('a,b')).toBe('"a,b"');
    expect(escapeCsvCell('say "hi"')).toBe('"say ""hi"""');
    expect(escapeCsvCell('line1\nline2')).toBe('"line1\nline2"');
    expect(escapeCsvCell('=HYPERLINK("http://x","y")')).toBe('"\'=HYPERLINK(""http://x"",""y"")"');
  });
});
