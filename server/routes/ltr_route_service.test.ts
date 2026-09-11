/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { ltrError, registerLtrRoutes, storePath } from './ltr_route_service';

describe('storePath', () => {
  it('reads the default store when no store is named', () => {
    expect(storePath('/_ltr/_model')).toBe('/_ltr/_model');
  });

  it('qualifies the path with a named store', () => {
    expect(storePath('/_ltr/_model', 'my_store')).toBe('/_ltr/my_store/_model');
  });

  it('keeps the deeper feature set paths intact', () => {
    expect(storePath('/_ltr/_featureset', 'my_store')).toBe('/_ltr/my_store/_featureset');
    expect(storePath('/_ltr/_featureset/movies', 'my_store')).toBe(
      '/_ltr/my_store/_featureset/movies'
    );
  });

  it('encodes a store name so it cannot traverse out of the _ltr namespace', () => {
    expect(storePath('/_ltr/_model', '../../_cluster/settings')).toBe(
      '/_ltr/..%2F..%2F_cluster%2Fsettings/_model'
    );
  });
});

describe('ltrError', () => {
  const response = { customError: jest.fn((arg) => arg) } as any;

  beforeEach(() => jest.clearAllMocks());

  const attributesOf = (err: any) => ltrError(response, err).body.attributes;

  // Bodies below are verbatim from OpenSearch 3.3.0 / opensearch-ltr 3.3.0.0.
  it('classifies a missing model separately from a missing store', () => {
    const err = {
      statusCode: 404,
      body: { _index: '.ltrstore', _id: 'model-ghost', found: false },
    };
    expect(attributesOf(err).ltrErrorType).toBe('model_not_found');
  });

  it('classifies a missing feature store', () => {
    const err = {
      statusCode: 404,
      body: {
        error: {
          type: 'index_not_found_exception',
          reason: 'no such index [.ltrstore_nosuchstore]',
        },
      },
    };
    expect(attributesOf(err).ltrErrorType).toBe('store_not_found');
  });

  // A disabled plugin is an illegal_state_exception, which surfaces as 500 rather than the
  // 4xx the other cases use -- hence classification on the body rather than the status.
  it('classifies a disabled LTR plugin despite its 500 status', () => {
    const err = {
      statusCode: 500,
      body: {
        error: {
          type: 'illegal_state_exception',
          reason: 'LTR plugin is disabled. To enable, update ltr.plugin.enabled to true',
        },
        status: 500,
      },
    };
    expect(attributesOf(err).ltrErrorType).toBe('plugin_disabled');
  });

  // An unknown route returns error as a bare string, not an object.
  it('classifies an uninstalled LTR plugin from a string error body', () => {
    const err = {
      statusCode: 400,
      body: { error: 'no handler found for uri [/_ltr/_model] and method [GET]' },
    };
    expect(attributesOf(err).ltrErrorType).toBe('plugin_not_installed');
  });

  it('leaves an unrecognized failure unclassified', () => {
    const err = { statusCode: 500, body: { error: { reason: 'circuit_breaking_exception' } } };
    const attributes = attributesOf(err);
    expect(attributes.ltrErrorType).toBeUndefined();
    expect(attributes.error).toBe('circuit_breaking_exception');
  });

  it('falls back to the raw message when there is no structured error body', () => {
    expect(ltrError(response, { message: 'socket hang up' }).body.message).toBe('socket hang up');
  });

  it('passes a real error status through', () => {
    expect(ltrError(response, { statusCode: 404, body: { found: false } }).statusCode).toBe(404);
  });

  // `response.customError` throws outside 400-599, which would replace the classified error
  // with an unhandled exception.
  it.each([[0], [200], [302], [600], [undefined], ['503']])(
    'substitutes 500 for an out-of-range statusCode %p',
    (statusCode) => {
      expect(ltrError(response, { statusCode, message: 'transport failure' }).statusCode).toBe(500);
    }
  );
});

describe('registerLtrRoutes', () => {
  it('registers the listing and detail routes', () => {
    const router = { get: jest.fn() } as any;

    registerLtrRoutes(router);

    expect(router.get).toHaveBeenCalledTimes(2);
    expect(router.get.mock.calls.map((call: any[]) => call[0].path)).toEqual([
      '/api/relevancy/ltr/models',
      '/api/relevancy/ltr/models/{name}',
    ]);
  });
});
