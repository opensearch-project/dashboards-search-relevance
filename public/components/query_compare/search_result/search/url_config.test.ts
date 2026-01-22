/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { updateUrlWithConfig } from './url_config';

describe('url_config', () => {
  const originalLocation = window.location;
  const originalHistory = window.history;

  beforeEach(() => {
    // Mock window.location
    delete (window as any).location;
    (window as any).location = {
      ...originalLocation,
      href: 'http://localhost:5601/#/',
      hash: '#/',
      toString: () => 'http://localhost:5601/#/',
    };

    // Mock window.history.replaceState
    window.history.replaceState = jest.fn();

    // Mock console methods
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    window.location = originalLocation;
    jest.restoreAllMocks();
  });

  describe('updateUrlWithConfig', () => {
    it('should update URL with encoded config', () => {
      updateUrlWithConfig(
        'index1',
        'index2',
        '{"query": {"match_all": {}}}',
        '{"query": {"match_all": {}}}',
        '',
        '',
        'test search'
      );

      expect(window.history.replaceState).toHaveBeenCalled();
    });

    it('should include search pipelines when provided', () => {
      updateUrlWithConfig(
        'index1',
        'index2',
        '{"query": {"match_all": {}}}',
        '{"query": {"match_all": {}}}',
        'pipeline1',
        'pipeline2',
        'test search'
      );

      expect(window.history.replaceState).toHaveBeenCalled();
    });

    it('should exclude empty search pipelines from config', () => {
      updateUrlWithConfig(
        'index1',
        'index2',
        '{"query": {"match_all": {}}}',
        '{"query": {"match_all": {}}}',
        '',
        '',
        'test search'
      );

      expect(window.history.replaceState).toHaveBeenCalled();
    });

    it('should handle URL length exceeding limit', () => {
      const longQuery = '{"query": {"match": {"field": "' + 'x'.repeat(2000) + '"}}}';

      updateUrlWithConfig(
        'index1',
        'index2',
        longQuery,
        longQuery,
        '',
        '',
        'test search'
      );

      expect(window.history.replaceState).toHaveBeenCalled();
      expect(console.log).toHaveBeenCalled();
    });

    it('should handle errors gracefully', () => {
      // Mock URL constructor to throw
      const originalURL = global.URL;
      global.URL = jest.fn().mockImplementation(() => {
        throw new Error('URL error');
      }) as any;

      updateUrlWithConfig(
        'index1',
        'index2',
        '{"query": {}}',
        '{"query": {}}',
        '',
        '',
        'test'
      );

      expect(console.error).toHaveBeenCalledWith(
        'Failed to update URL with configuration:',
        expect.any(Error)
      );

      global.URL = originalURL;
    });
  });
});
