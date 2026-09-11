/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { renderHook } from '@testing-library/react-hooks';
import { mapLtrModelDetail, useLtrModelView } from '../hooks/use_ltr_model_view';

jest.mock('../../../../common', () => ({
  ServiceEndpoints: {
    LtrModels: '/api/relevancy/ltr/models',
  },
  LTR_MODEL_FETCH_SIZE: 1000,
}));

const mockHttp = { get: jest.fn() } as any;

const documentResponse = {
  _id: 'model-my_model',
  found: true,
  _source: {
    name: 'my_model',
    type: 'model',
    model: {
      feature_set: {
        name: 'my_set',
        features: [
          {
            name: 'feature1',
            params: ['query_string'],
            template_language: 'mustache',
            template: { match: { field_test: '{{query_string}}' } },
          },
        ],
      },
      model: { type: 'model/ranklib', definition: '## LambdaMART\n0:1.2' },
    },
  },
};

describe('mapLtrModelDetail', () => {
  it('maps shared fields, features, and the definition', () => {
    expect(mapLtrModelDetail(documentResponse)).toEqual({
      name: 'my_model',
      featureSetName: 'my_set',
      modelType: 'model/ranklib',
      featureCount: 1,
      features: [
        {
          name: 'feature1',
          params: ['query_string'],
          templateLanguage: 'mustache',
          template: { match: { field_test: '{{query_string}}' } },
        },
      ],
      definition: '## LambdaMART\n0:1.2',
    });
  });

  it('tolerates a model with no feature set', () => {
    const detail = mapLtrModelDetail({ _source: { name: 'bare' } });
    expect(detail.features).toEqual([]);
    expect(detail.definition).toBeUndefined();
  });
});

describe('useLtrModelView', () => {
  beforeEach(() => jest.clearAllMocks());

  it('fetches the model by name', async () => {
    mockHttp.get.mockResolvedValue(documentResponse);

    const { result, waitForNextUpdate } = renderHook(() => useLtrModelView(mockHttp, 'my_model'));
    await waitForNextUpdate();

    expect(mockHttp.get).toHaveBeenCalledWith('/api/relevancy/ltr/models/my_model');
    expect(result.current.model?.name).toBe('my_model');
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe(null);
  });

  it('encodes a name that needs escaping', async () => {
    mockHttp.get.mockResolvedValue(documentResponse);

    const { waitForNextUpdate } = renderHook(() => useLtrModelView(mockHttp, 'my model/v2'));
    await waitForNextUpdate();

    expect(mockHttp.get).toHaveBeenCalledWith('/api/relevancy/ltr/models/my%20model%2Fv2');
  });

  it('reports a missing model separately from a broken registry', async () => {
    mockHttp.get.mockRejectedValue({ body: { attributes: { ltrErrorType: 'model_not_found' } } });

    const { result, waitForNextUpdate } = renderHook(() => useLtrModelView(mockHttp, 'ghost'));
    await waitForNextUpdate();

    expect(result.current.notFound).toBe(true);
    expect(result.current.unavailableReason).toBe(null);
    expect(result.current.error).toBe(null);
    expect(result.current.model).toBe(null);
  });

  it('surfaces a registry-level reason', async () => {
    mockHttp.get.mockRejectedValue({ body: { attributes: { ltrErrorType: 'plugin_disabled' } } });

    const { result, waitForNextUpdate } = renderHook(() => useLtrModelView(mockHttp, 'my_model'));
    await waitForNextUpdate();

    expect(result.current.unavailableReason).toBe('plugin_disabled');
    expect(result.current.notFound).toBe(false);
  });

  it('reports an unexpected failure as an error', async () => {
    mockHttp.get.mockRejectedValue({ body: { message: 'cluster is on fire' } });

    const { result, waitForNextUpdate } = renderHook(() => useLtrModelView(mockHttp, 'my_model'));
    await waitForNextUpdate();

    expect(result.current.error).toBe('cluster is on fire');
  });
});
