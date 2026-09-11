/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { LtrModelService, mapLtrFeatureSetFields } from '../services/ltr_model_service';

jest.mock('../../../../common', () => ({
  ServiceEndpoints: {
    LtrModels: '/api/relevancy/ltr/models',
    LtrFeatureSets: '/api/relevancy/ltr/feature_sets',
  },
  LTR_FEATURE_SET_FETCH_SIZE: 1000,
}));

const mockHttp = { get: jest.fn(), post: jest.fn() } as any;

const featureSetHit = (name: string, features: any[] = []) => ({
  _id: `featureset-${name}`,
  _source: { name, type: 'featureset', featureset: { name, features } },
});

describe('mapLtrFeatureSetFields', () => {
  it('counts the features in the set', () => {
    expect(mapLtrFeatureSetFields(featureSetHit('my_set', [{ name: 'a' }, { name: 'b' }]))).toEqual(
      {
        name: 'my_set',
        featureCount: 2,
      }
    );
  });

  it('tolerates a set with no features array', () => {
    expect(mapLtrFeatureSetFields({ _source: { name: 'empty' } })).toEqual({
      name: 'empty',
      featureCount: 0,
    });
  });
});

describe('LtrModelService', () => {
  beforeEach(() => jest.clearAllMocks());

  it('requests feature sets with an explicit size', async () => {
    mockHttp.get.mockResolvedValue({ hits: { hits: [featureSetHit('my_set')] } });

    const sets = await new LtrModelService(mockHttp).listFeatureSets();

    // Without a size the LTR plugin caps the listing at 20, so the picker would quietly
    // omit feature sets.
    expect(mockHttp.get).toHaveBeenCalledWith('/api/relevancy/ltr/feature_sets', {
      query: { size: 1000 },
    });
    expect(sets).toEqual([{ name: 'my_set', featureCount: 0 }]);
  });

  it('drops hits with no name, which cannot be selected anyway', async () => {
    mockHttp.get.mockResolvedValue({
      hits: { hits: [featureSetHit('my_set'), { _source: { type: 'featureset' } }] },
    });

    expect(await new LtrModelService(mockHttp).listFeatureSets()).toEqual([
      { name: 'my_set', featureCount: 0 },
    ]);
  });

  it('returns an empty list when the store has no feature sets', async () => {
    mockHttp.get.mockResolvedValue({ hits: { hits: [] } });

    expect(await new LtrModelService(mockHttp).listFeatureSets()).toEqual([]);
  });

  it('posts the flat model payload for the server to nest', async () => {
    mockHttp.post.mockResolvedValue({ result: 'created' });
    const model = {
      name: 'my_model',
      featureSetName: 'my_set',
      modelType: 'model/linear',
      definition: { title_match: 0.4 },
    };

    await new LtrModelService(mockHttp).createModel(model);

    expect(mockHttp.post).toHaveBeenCalledWith('/api/relevancy/ltr/models', {
      body: JSON.stringify(model),
      headers: { 'Content-Type': 'application/json' },
    });
  });
});
