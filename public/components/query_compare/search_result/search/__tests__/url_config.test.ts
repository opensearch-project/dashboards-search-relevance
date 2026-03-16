/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { updateUrlWithConfig } from '../url_config';

// Mock window.location and history
const mockLocation = {
  href: 'http://localhost:3000',
  hash: '',
  toString: () => 'http://localhost:3000',
};

const mockHistory = {
  replaceState: jest.fn(),
};

Object.defineProperty(window, 'location', {
  value: mockLocation,
  writable: true,
});

Object.defineProperty(window, 'history', {
  value: mockHistory,
  writable: true,
});

// Mock URL constructor
global.URL = jest.fn().mockImplementation((url) => ({
  hash: '',
  toString: () => url,
}));

describe('updateUrlWithConfig', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockHistory.replaceState.mockClear();
  });

  it('should update URL with configuration', () => {
    const selectedIndex1 = 'index1';
    const selectedIndex2 = 'index2';
    const queryString1 = '{"query": {"match_all": {}}}';
    const queryString2 = '{"query": {"match_all": {}}}';
    const pipeline1 = 'pipeline1';
    const pipeline2 = 'pipeline2';
    const searchBarValue = 'test search';

    updateUrlWithConfig(
      selectedIndex1,
      selectedIndex2,
      queryString1,
      queryString2,
      pipeline1,
      pipeline2,
      searchBarValue
    );

    expect(mockHistory.replaceState).toHaveBeenCalled();
  });

  it('should handle empty pipeline values', () => {
    const selectedIndex1 = 'index1';
    const selectedIndex2 = 'index2';
    const queryString1 = '{"query": {"match_all": {}}}';
    const queryString2 = '{"query": {"match_all": {}}}';
    const pipeline1 = '';
    const pipeline2 = '';
    const searchBarValue = 'test search';

    updateUrlWithConfig(
      selectedIndex1,
      selectedIndex2,
      queryString1,
      queryString2,
      pipeline1,
      pipeline2,
      searchBarValue
    );

    expect(mockHistory.replaceState).toHaveBeenCalled();
  });

  it('should handle URL length limit exceeded', () => {
    const selectedIndex1 = 'index1';
    const selectedIndex2 = 'index2';
    const queryString1 = 'a'.repeat(1000); // Very long query
    const queryString2 = 'b'.repeat(1000); // Very long query
    const pipeline1 = 'pipeline1';
    const pipeline2 = 'pipeline2';
    const searchBarValue = 'test search';

    // Mock URL to return a very long string
    (global.URL as jest.Mock).mockImplementation(() => ({
      hash: '',
      toString: () => 'a'.repeat(3000), // Exceeds MAX_URL_LENGTH
    }));

    updateUrlWithConfig(
      selectedIndex1,
      selectedIndex2,
      queryString1,
      queryString2,
      pipeline1,
      pipeline2,
      searchBarValue
    );

    expect(mockHistory.replaceState).toHaveBeenCalled();
  });

  it('should handle errors gracefully', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    
    // Mock btoa to throw an error
    const originalBtoa = global.btoa;
    global.btoa = jest.fn().mockImplementation(() => {
      throw new Error('btoa error');
    });

    updateUrlWithConfig('index1', 'index2', 'query1', 'query2', 'pipeline1', 'pipeline2', 'search');

    expect(consoleSpy).toHaveBeenCalledWith('Failed to update URL with configuration:', expect.any(Error));
    
    // Restore
    global.btoa = originalBtoa;
    consoleSpy.mockRestore();
  });
});
