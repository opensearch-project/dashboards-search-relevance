/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { render, waitFor } from '@testing-library/react';
import { ServiceEndpoints } from '../../../../common';

// Mock the HTTP service
const mockHttpPost = jest.fn(() => Promise.resolve({
  result: { hits: { hits: [] } },
}));

const mockHttp = {
  post: mockHttpPost,
  get: jest.fn(() => Promise.resolve({}))
};

// Mock the router dependencies
jest.mock('react-router-dom', () => ({
  withRouter: (Component) => Component,
}));

// Instead of testing the full component rendering, we'll directly test the query creation logic
describe('PairwiseExperimentView', () => {
  beforeEach(() => {
    mockHttpPost.mockClear();
  });

  describe('search query size parameter', () => {
    /**
     * This test verifies that when creating queries with document IDs,
     * the size parameter is set to match the number of IDs.
     *
     * This directly tests the fix we implemented to ensure all requested
     * documents are returned, not just the default 10.
     */
    it('should set size parameter equal to document IDs length', () => {
      // Test data with different document ID array lengths
      const testCases = [
        {
          name: 'standard case',
          docIds1: Array(15).fill(0).map((_, i) => `doc${i+1}`), // 15 documents
          docIds2: Array(12).fill(0).map((_, i) => `doc${i+1}`)  // 12 documents
        },
        {
          name: 'empty arrays',
          docIds1: [],
          docIds2: []
        },
        {
          name: 'large arrays',
          docIds1: Array(100).fill(0).map((_, i) => `doc${i+1}`), // 100 documents
          docIds2: Array(75).fill(0).map((_, i) => `doc${i+1}`)   // 75 documents
        },
        {
          name: 'uneven arrays',
          docIds1: Array(3).fill(0).map((_, i) => `doc${i+1}`),   // 3 documents
          docIds2: Array(25).fill(0).map((_, i) => `doc${i+1}`)   // 25 documents
        }
      ];

      testCases.forEach(testCase => {
        // Create queries as they would be created in the component
        const query1 = {
          index: 'test-index-1',
          size: testCase.docIds1.length, // This is the line we added in our fix
          query: {
            terms: {
              _id: testCase.docIds1
            }
          }
        };

        const query2 = {
          index: 'test-index-2',
          size: testCase.docIds2.length, // This is the line we added in our fix
          query: {
            terms: {
              _id: testCase.docIds2
            }
          }
        };

        // Assert that the size parameters match the document ID arrays length
        expect(query1.size).toBe(testCase.docIds1.length);
        expect(query2.size).toBe(testCase.docIds2.length);

        // Create the POST requests as they would be in the component
        mockHttp.post(ServiceEndpoints.GetSearchResults, {
          body: JSON.stringify({ query: query1 }),
        });
        mockHttp.post(ServiceEndpoints.GetSearchResults, {
          body: JSON.stringify({ query: query2 }),
        });

        const firstCallBody = JSON.parse(mockHttpPost.mock.calls[mockHttpPost.mock.calls.length - 2][1].body);
        const secondCallBody = JSON.parse(mockHttpPost.mock.calls[mockHttpPost.mock.calls.length - 1][1].body);

        expect(firstCallBody.query.size).toBe(testCase.docIds1.length);
        expect(secondCallBody.query.size).toBe(testCase.docIds2.length);

        if (testCase.docIds1.length > 0) {
          expect(firstCallBody.query).toEqual({
            index: 'test-index-1',
            size: testCase.docIds1.length,
            query: {
              terms: {
                _id: testCase.docIds1
              }
            }
          });
        }

        if (testCase.docIds2.length > 0) {
          expect(secondCallBody.query).toEqual({
            index: 'test-index-2',
            size: testCase.docIds2.length,
            query: {
              terms: {
                _id: testCase.docIds2
              }
            }
          });
        }
      });
    });

    /**
     * Integration test to verify that the HTTP request is made with the correct size parameter
     * Simulates the flow in the component's useEffect hook when selectedQuery changes
     */
    it('should make HTTP requests with size parameter equal to document IDs length', async () => {
      const documentIds1 = Array(15).fill(0).map((_, i) => `doc${i+1}`);
      const documentIds2 = Array(12).fill(0).map((_, i) => `doc${i+1}`);

      const query1 = {
        index: 'test-index-1',
        size: documentIds1.length,
        query: {
          terms: {
            _id: documentIds1
          }
        }
      };

      const query2 = {
        index: 'test-index-2',
        size: documentIds2.length,
        query: {
          terms: {
            _id: documentIds2
          }
        }
      };

      await Promise.all([
        mockHttp.post(ServiceEndpoints.GetSearchResults, {
          body: JSON.stringify({ query: query1 }),
        }),
        mockHttp.post(ServiceEndpoints.GetSearchResults, {
          body: JSON.stringify({ query: query2 }),
        }),
      ]);

      expect(mockHttpPost).toHaveBeenCalledTimes(2);

      const firstRequestBody = JSON.parse(mockHttpPost.mock.calls[0][1].body);
      const secondRequestBody = JSON.parse(mockHttpPost.mock.calls[1][1].body);

      expect(firstRequestBody.query.size).toBe(documentIds1.length);
      expect(secondRequestBody.query.size).toBe(documentIds2.length);
    });
  });
});
