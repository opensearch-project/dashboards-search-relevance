/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { renderHook, act } from '@testing-library/react-hooks';
import { mapLtrModelFields, useLtrModelList } from '../hooks/use_ltr_model_list';

jest.mock('../../../../common', () => ({
  ServiceEndpoints: {
    LtrModels: '/api/relevancy/ltr/models',
  },
  LTR_MODEL_FETCH_SIZE: 1000,
}));

const mockHttp = {
  get: jest.fn(),
} as any;

const hit = (name: string, overrides: any = {}) => ({
  _source: {
    name,
    type: 'model',
    model: {
      feature_set: {
        name: 'my_set',
        features: [{ name: 'feature1' }, { name: 'feature2' }],
      },
      model: {
        type: 'model/ranklib',
        definition: '## LambdaMART',
      },
      ...overrides,
    },
  },
});

const searchResponse = (hits: any[], total?: number) => ({
  hits: {
    total: { value: total ?? hits.length },
    hits,
  },
});

describe('mapLtrModelFields', () => {
  it('unwraps _source into a flat registry entry', () => {
    expect(mapLtrModelFields(hit('my_model'))).toEqual({
      name: 'my_model',
      featureSetName: 'my_set',
      modelType: 'model/ranklib',
      featureCount: 2,
    });
  });

  it('tolerates a model document missing its feature set', () => {
    expect(mapLtrModelFields({ _source: { name: 'bare' } })).toEqual({
      name: 'bare',
      featureSetName: '',
      modelType: '',
      featureCount: 0,
    });
  });
});

describe('useLtrModelList', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('initializes with default state', () => {
    const { result } = renderHook(() => useLtrModelList(mockHttp));

    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe(null);
    expect(result.current.unavailableReason).toBe(null);
    expect(result.current.truncatedTotal).toBe(null);
  });

  it('fetches models successfully', async () => {
    mockHttp.get.mockResolvedValue(searchResponse([hit('my_model')]));

    const { result } = renderHook(() => useLtrModelList(mockHttp));

    let listResult;
    await act(async () => {
      listResult = await result.current.findLtrModels('');
    });

    expect(listResult).toEqual({
      total: 1,
      hits: [
        {
          name: 'my_model',
          featureSetName: 'my_set',
          modelType: 'model/ranklib',
          featureCount: 2,
        },
      ],
    });
  });

  it('requests an explicit size so the endpoint does not silently truncate at 20', async () => {
    mockHttp.get.mockResolvedValue(searchResponse([]));

    const { result } = renderHook(() => useLtrModelList(mockHttp));
    await act(async () => {
      await result.current.findLtrModels('');
    });

    expect(mockHttp.get).toHaveBeenCalledWith('/api/relevancy/ltr/models', {
      query: { size: 1000 },
    });
  });

  it('flags truncation when the store holds more models than were fetched', async () => {
    mockHttp.get.mockResolvedValue(searchResponse([hit('a'), hit('b')], 4200));

    const { result } = renderHook(() => useLtrModelList(mockHttp));
    await act(async () => {
      await result.current.findLtrModels('');
    });

    expect(result.current.truncatedTotal).toBe(4200);
  });

  // A cluster running with `rest_total_hits_as_int` returns `hits.total` as a bare number.
  it('flags truncation when total comes back as a bare number', async () => {
    mockHttp.get.mockResolvedValue({ hits: { hits: [hit('a'), hit('b')], total: 4200 } });

    const { result } = renderHook(() => useLtrModelList(mockHttp));
    await act(async () => {
      await result.current.findLtrModels('');
    });

    expect(result.current.truncatedTotal).toBe(4200);
  });

  it('does not flag truncation when the whole store was returned', async () => {
    mockHttp.get.mockResolvedValue(searchResponse([hit('a'), hit('b')]));

    const { result } = renderHook(() => useLtrModelList(mockHttp));
    await act(async () => {
      await result.current.findLtrModels('');
    });

    expect(result.current.truncatedTotal).toBe(null);
  });

  it('filters by name', async () => {
    mockHttp.get.mockResolvedValue(searchResponse([hit('alpha_model'), hit('beta_model')]));

    const { result } = renderHook(() => useLtrModelList(mockHttp));

    let listResult: any;
    await act(async () => {
      listResult = await result.current.findLtrModels('ALPHA');
    });

    expect(listResult.total).toBe(1);
    expect(listResult.hits[0].name).toBe('alpha_model');
  });

  it.each([['store_not_found'], ['plugin_disabled'], ['plugin_not_installed']])(
    'surfaces %s as an unavailable reason rather than an error',
    async (reason) => {
      mockHttp.get.mockRejectedValue({ body: { attributes: { ltrErrorType: reason } } });

      const { result } = renderHook(() => useLtrModelList(mockHttp));

      let listResult: any;
      await act(async () => {
        listResult = await result.current.findLtrModels('');
      });

      expect(result.current.unavailableReason).toBe(reason);
      expect(result.current.error).toBe(null);
      expect(listResult).toEqual({ total: 0, hits: [] });
    }
  );

  it('reports an unexpected failure as an error', async () => {
    mockHttp.get.mockRejectedValue({ body: { message: 'cluster is on fire' } });

    const { result } = renderHook(() => useLtrModelList(mockHttp));
    await act(async () => {
      await result.current.findLtrModels('');
    });

    expect(result.current.error).toBe('cluster is on fire');
    expect(result.current.unavailableReason).toBe(null);
  });

  it('falls back to a generic message when the failure carries no detail', async () => {
    mockHttp.get.mockRejectedValue({});

    const { result } = renderHook(() => useLtrModelList(mockHttp));
    await act(async () => {
      await result.current.findLtrModels('');
    });

    expect(result.current.error).toBe('Failed to load LTR models due to an unknown error.');
  });
});
