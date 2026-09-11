/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { createModelBody, ltrError, registerLtrRoutes, storePath } from './ltr_route_service';

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

  it('qualifies a create path, which carries segments after the collection', () => {
    expect(storePath('/_ltr/_featureset/my_set/_createmodel', 'my_store')).toBe(
      '/_ltr/my_store/_featureset/my_set/_createmodel'
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

  // _createmodel checks for the store itself and raises an illegal_argument rather than
  // letting the read 404, so the same condition arrives worded differently.
  it('classifies a missing store reported by _createmodel', () => {
    const err = {
      statusCode: 400,
      body: {
        error: {
          type: 'illegal_argument_exception',
          reason: 'Store [_default_] does not exist, please create it first.',
        },
      },
    };
    expect(attributesOf(err).ltrErrorType).toBe('store_not_found');
  });

  it('classifies an upload against a feature set that is not in the store', () => {
    const err = {
      statusCode: 400,
      body: {
        error: {
          type: 'illegal_argument_exception',
          reason: 'Stored feature set [my_set] does not exist',
        },
      },
    };
    expect(attributesOf(err).ltrErrorType).toBe('featureset_not_found');
  });

  // The store has no update path: a version conflict is reported as a 405 telling the user
  // to pick another name, which is a form error rather than a transport failure.
  it('classifies a duplicate model name', () => {
    const err = {
      statusCode: 405,
      body: {
        error: {
          type: 'illegal_argument_exception',
          reason: 'Element of type [model] are not updatable, please create a new one instead.',
        },
      },
    };
    expect(attributesOf(err).ltrErrorType).toBe('model_exists');
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
  const register = () => {
    const router = { get: jest.fn(), post: jest.fn() } as any;
    registerLtrRoutes(router);
    return router;
  };

  it('registers the listing, detail, and feature set routes', () => {
    const router = register();

    expect(router.get).toHaveBeenCalledTimes(3);
    expect(router.get.mock.calls.map((call: any[]) => call[0].path)).toEqual([
      '/api/relevancy/ltr/models',
      '/api/relevancy/ltr/models/{name}',
      '/api/relevancy/ltr/feature_sets',
    ]);
  });

  it('registers the upload route', () => {
    const router = register();

    expect(router.post).toHaveBeenCalledTimes(1);
    expect(router.post.mock.calls[0][0].path).toBe('/api/relevancy/ltr/models');
  });

  it('accepts both definition shapes the store stores', () => {
    const router = register();
    const { body } = router.post.mock.calls[0][0].validate;
    const model = {
      name: 'my_model',
      featureSetName: 'my_set',
      modelType: 'model/linear',
    };

    // Constraining `definition` would reject one of the two valid forms outright.
    expect(() => body.validate({ ...model, definition: '## LambdaMART' })).not.toThrow();
    expect(() => body.validate({ ...model, definition: { title_match: 0.4 } })).not.toThrow();
  });

  it('rejects an upload with no name', () => {
    const router = register();
    const { body } = router.post.mock.calls[0][0].validate;

    expect(() =>
      body.validate({
        name: '',
        featureSetName: 'my_set',
        modelType: 'model/linear',
        definition: '{}',
      })
    ).toThrow();
  });
});
