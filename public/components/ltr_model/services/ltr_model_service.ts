/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { CoreStart } from '../../../../../../src/core/public';
import { LTR_FEATURE_SET_FETCH_SIZE, ServiceEndpoints } from '../../../../common';
import { LtrFeatureSetSummary, LtrModelUpload } from '../types';

/** Feature set documents carry their contents under `featureset`, mirroring model hits. */
export const mapLtrFeatureSetFields = (hit: any): LtrFeatureSetSummary => {
  const source = hit?._source ?? {};
  const features = source.featureset?.features;
  return {
    name: source.name,
    featureCount: Array.isArray(features) ? features.length : 0,
  };
};

export class LtrModelService {
  constructor(private http: CoreStart['http']) {}

  /**
   * Feature sets exist only so the upload form can offer the ones a model can be built
   * against. The registry does not otherwise show them.
   */
  async listFeatureSets(): Promise<LtrFeatureSetSummary[]> {
    const response = await this.http.get(ServiceEndpoints.LtrFeatureSets, {
      query: { size: LTR_FEATURE_SET_FETCH_SIZE },
    });
    const hits = response?.hits?.hits ?? [];
    return hits.map(mapLtrFeatureSetFields).filter((set: LtrFeatureSetSummary) => set.name);
  }

  async createModel(model: LtrModelUpload): Promise<any> {
    return this.http.post(ServiceEndpoints.LtrModels, {
      body: JSON.stringify(model),
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}
