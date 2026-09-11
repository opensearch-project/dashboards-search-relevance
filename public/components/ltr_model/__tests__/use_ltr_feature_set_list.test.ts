/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { renderHook } from '@testing-library/react-hooks';
import { useLtrFeatureSetList } from '../hooks/use_ltr_feature_set_list';
import { LtrModelService } from '../services/ltr_model_service';

jest.mock('../services/ltr_model_service');

const MockLtrModelService = LtrModelService as jest.MockedClass<typeof LtrModelService>;
const mockHttp = { get: jest.fn() } as any;

const withListFeatureSets = (listFeatureSets: jest.Mock) =>
  MockLtrModelService.mockImplementation(() => ({ listFeatureSets } as any));

describe('useLtrFeatureSetList', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => jest.restoreAllMocks());

  it('loads the feature sets on mount', async () => {
    const featureSets = [{ name: 'my_set', featureCount: 3 }];
    withListFeatureSets(jest.fn().mockResolvedValue(featureSets));

    const { result, waitForNextUpdate } = renderHook(() => useLtrFeatureSetList(mockHttp));

    expect(result.current.isLoading).toBe(true);
    await waitForNextUpdate();

    expect(result.current.featureSets).toEqual(featureSets);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.unavailableReason).toBeNull();
  });

  // A store the user has not created yet is not an error to debug, and the upload view
  // shows the plugin's own next step instead of the form.
  it('surfaces an unavailable LTR plugin as a reason rather than an error', async () => {
    withListFeatureSets(
      jest.fn().mockRejectedValue({ body: { attributes: { ltrErrorType: 'store_not_found' } } })
    );

    const { result, waitForNextUpdate } = renderHook(() => useLtrFeatureSetList(mockHttp));
    await waitForNextUpdate();

    expect(result.current.unavailableReason).toBe('store_not_found');
    expect(result.current.error).toBeNull();
    expect(result.current.featureSets).toEqual([]);
  });

  it('surfaces an unclassified failure as an error', async () => {
    withListFeatureSets(jest.fn().mockRejectedValue({ body: { message: 'circuit breaking' } }));

    const { result, waitForNextUpdate } = renderHook(() => useLtrFeatureSetList(mockHttp));
    await waitForNextUpdate();

    expect(result.current.error).toBe('circuit breaking');
    expect(result.current.unavailableReason).toBeNull();
  });

  it('falls back to a generic message when the failure carries none', async () => {
    withListFeatureSets(jest.fn().mockRejectedValue(new Error('socket hang up')));

    const { result, waitForNextUpdate } = renderHook(() => useLtrFeatureSetList(mockHttp));
    await waitForNextUpdate();

    expect(result.current.error).toBe('Failed to load feature sets due to an unknown error.');
  });
});
