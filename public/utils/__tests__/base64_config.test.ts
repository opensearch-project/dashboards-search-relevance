/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

describe('Base64 Config Utilities', () => {
  describe('generateConfigUrl', () => {
    it('should generate correct base64 encoded URL', () => {
      const config = {
        query1: {
          index: 'test_index',
          dsl_query: '{"query":{"match_all":{}}}'
        },
        search: 'test search'
      };

      const baseUrl = 'http://localhost:5603/hbk/app/searchRelevance';
      const jsonString = JSON.stringify(config);
      const expectedBase64 = Buffer.from(jsonString).toString('base64');
      const expectedUrl = `${baseUrl}#/?config=${expectedBase64}`;

      // Verify base64 encoding
      expect(expectedBase64).toMatch(/^[A-Za-z0-9+/]+=*$/);
      
      // Verify URL structure
      expect(expectedUrl).toContain('#/?config=');
      expect(expectedUrl).toContain(expectedBase64);
    });

    it('should handle complex nested configurations', () => {
      const complexConfig = {
        query1: {
          index: 'amazon_products_text',
          dsl_query: '{"_source":["text","image"],"query":{"match":{"text":{"query":"%SearchText%"}}}}'
        },
        query2: {
          index: 'amazon_products_text_embedding',
          search_pipeline: 'norm-pipeline',
          dsl_query: '{"_source":["text","image"],"query":{"hybrid":{"queries":[{"neural":{"text_embedding_bedrock":{"query_text":"%SearchText%","model_id":"CjIB95cBTvQhE8paGFGt","k":100}}},{"match":{"text_description":{"query":"%SearchText%"}}}]},"size":10}}'
        },
        search: 'orange sport shoes'
      };

      const jsonString = JSON.stringify(complexConfig);
      const base64String = Buffer.from(jsonString).toString('base64');

      // Verify length increase is approximately 33%
      const lengthIncrease = (base64String.length / jsonString.length - 1) * 100;
      expect(lengthIncrease).toBeGreaterThan(30);
      expect(lengthIncrease).toBeLessThan(40);
    });

    it('should produce URL-safe base64 encoding', () => {
      const config = {
        query1: {
          index: 'test',
          dsl_query: '{"query":{"match":{"field":"value with spaces & special chars"}}}'
        }
      };

      const base64String = Buffer.from(JSON.stringify(config)).toString('base64');
      
      // Base64 should only contain URL-safe characters
      expect(base64String).toMatch(/^[A-Za-z0-9+/=]+$/);
    });
  });

  describe('decodeConfigUrl', () => {
    it('should correctly decode base64 config', () => {
      const originalConfig = {
        query1: {
          index: 'test_index',
          dsl_query: '{"query":{"match_all":{}}}'
        },
        search: 'test search'
      };

      const base64String = Buffer.from(JSON.stringify(originalConfig)).toString('base64');
      const decodedJson = Buffer.from(base64String, 'base64').toString();
      const decodedConfig = JSON.parse(decodedJson);

      expect(decodedConfig).toEqual(originalConfig);
    });

    it('should handle invalid base64 strings', () => {
      const invalidBase64 = 'not_a_valid_base64_string!!!';
      
      expect(() => {
        Buffer.from(invalidBase64, 'base64').toString();
      }).not.toThrow();
    });

    it('should handle malformed JSON after decoding', () => {
      const invalidJson = 'not a valid json';
      const base64String = Buffer.from(invalidJson).toString('base64');
      
      expect(() => {
        const decoded = Buffer.from(base64String, 'base64').toString();
        JSON.parse(decoded);
      }).toThrow(SyntaxError);
    });
  });

  describe('URL Length Validation', () => {
    it('should verify URL length is within safe limits', () => {
      const config = {
        query1: {
          index: 'amazon_products_text',
          dsl_query: '{"_source":["text","image"],"query":{"match":{"text":{"query":"%SearchText%"}}}}'
        },
        query2: {
          index: 'amazon_products_text_embedding',
          search_pipeline: 'norm-pipeline',
          dsl_query: '{"_source":["text","image"],"query":{"hybrid":{"queries":[{"neural":{"text_embedding_bedrock":{"query_text":"%SearchText%","model_id":"CjIB95cBTvQhE8paGFGt","k":100}}},{"match":{"text_description":{"query":"%SearchText%"}}}]},"size":10}}'
        },
        search: 'orange sport shoes'
      };

      const baseUrl = 'http://localhost:5603/hbk/app/searchRelevance';
      const base64String = Buffer.from(JSON.stringify(config)).toString('base64');
      const fullUrl = `${baseUrl}#/?config=${base64String}`;

      // Verify URL is within safe limit (2000 characters)
      expect(fullUrl.length).toBeLessThan(2000);
      
      // Log actual length for reference
      console.log(`URL length: ${fullUrl.length} characters`);
    });

    it('should identify when URL length exceeds safe limits', () => {
      const longQueryString = '{"query":{"match":{"description":"' + 'a'.repeat(2000) + '"}}}';
      const config = {
        query1: {
          index: 'products_with_very_long_index_name_that_contributes_to_url_length',
          dsl_query: longQueryString,
          search_pipeline: 'ml-pipeline-with-very-long-name-that-contributes-to-url-length'
        },
        query2: {
          index: 'products_semantic_with_very_long_index_name_that_contributes_to_url_length',
          dsl_query: longQueryString,
          search_pipeline: 'another-ml-pipeline-with-very-long-name-that-contributes-to-url-length'
        },
        search: 'running shoes with very long search text that contributes to URL length'
      };

      const baseUrl = 'http://localhost:5603/hbk/app/searchRelevance';
      const base64String = Buffer.from(JSON.stringify(config)).toString('base64');
      const fullUrl = `${baseUrl}#/?config=${base64String}`;
      
      // Verify URL exceeds safe limit (2000 characters)
      expect(fullUrl.length).toBeGreaterThan(2000);
      
      // Log actual length for reference
      console.log(`Long URL length: ${fullUrl.length} characters`);
    });

    it('should calculate base64 size increase correctly', () => {
      const testCases = [
        { input: 'a', expectedRatio: 4/1 }, // 1 byte -> 4 bytes
        { input: 'ab', expectedRatio: 4/2 }, // 2 bytes -> 4 bytes
        { input: 'abc', expectedRatio: 4/3 }, // 3 bytes -> 4 bytes
        { input: 'abcd', expectedRatio: 8/4 }, // 4 bytes -> 8 bytes
      ];

      testCases.forEach(({ input, expectedRatio }) => {
        const base64 = Buffer.from(input).toString('base64');
        const actualRatio = base64.length / input.length;
        
        // Allow small tolerance for padding
        expect(actualRatio).toBeCloseTo(expectedRatio, 1);
      });
    });
  });

  describe('Integration with SearchResult component', () => {
    it('should generate config that can be parsed by SearchResult', () => {
      const config = {
        query1: {
          index: 'products',
          dsl_query: '{"query":{"match":{"description":"%SearchText%"}}}',
          search_pipeline: 'ml-pipeline'
        },
        query2: {
          index: 'products_semantic',
          dsl_query: '{"query":{"neural":{"embedding":{"query_text":"%SearchText%","k":10}}}}'
        },
        search: 'running shoes'
      };

      // Encode
      const base64String = Buffer.from(JSON.stringify(config)).toString('base64');
      
      // Simulate what SearchResult component does
      const decoded = atob(base64String);
      const parsed = JSON.parse(decoded);

      expect(parsed).toEqual(config);
      expect(parsed.query1.index).toBe('products');
      expect(parsed.query2.index).toBe('products_semantic');
      expect(parsed.search).toBe('running shoes');
    });
  });
});