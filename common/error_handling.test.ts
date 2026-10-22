/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { DISABLED_BACKEND_PLUGIN_MESSAGE, extractUserMessageFromError } from './error_handling';

describe('extractUserMessageFromError', () => {
  it('returns the activation hint when the backend plugin is disabled', () => {
    const err = { body: { message: DISABLED_BACKEND_PLUGIN_MESSAGE } };
    expect(extractUserMessageFromError(err)).toBe(
      'Search Relevance Workbench is disabled. Please activate the opensearch-search-relevance plugin.'
    );
  });

  it('surfaces the status and backend message for a 403 security_exception (res.customError shape)', () => {
    // Mirrors what the plugin server returns: status lives on the response,
    // the reason on body.message, with no statusCode in the body.
    const err = {
      body: {
        message:
          'Data Source Error: [security_exception] no permissions for [cluster:admin/opensearch/search_relevance/experiment/get]',
        attributes: { error: 'Forbidden' },
      },
      response: { status: 403 },
    };
    expect(extractUserMessageFromError(err)).toBe(
      '403: Data Source Error: [security_exception] no permissions for [cluster:admin/opensearch/search_relevance/experiment/get]'
    );
  });

  it('prefers body.statusCode over response.status when both are present', () => {
    const err = { body: { statusCode: 502, message: 'boom' }, response: { status: 500 } };
    expect(extractUserMessageFromError(err)).toBe('502: boom');
  });

  it('returns the bare message when no status code is available', () => {
    const err = { body: { message: 'boom' } };
    expect(extractUserMessageFromError(err)).toBe('boom');
  });

  it('returns null when the error has no body', () => {
    expect(extractUserMessageFromError(new Error('plain'))).toBeNull();
  });

  it('returns null for a nullish error', () => {
    expect(extractUserMessageFromError(undefined)).toBeNull();
    expect(extractUserMessageFromError(null)).toBeNull();
  });

  it('returns null when the body has no usable message', () => {
    expect(extractUserMessageFromError({ body: { statusCode: 502 } })).toBeNull();
  });
});
