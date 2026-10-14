/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * A registry entry as it exists in the LTR feature store today.
 *
 * The store's index mapping is `dynamic: strict` and holds only name, type, feature,
 * featureset, and model — there is no creation timestamp to show, so the registry does not
 * claim one. Versioning and lineage are likewise absent by design until the training and
 * A/B stages put real requirements on the schema.
 */
export interface LtrModelListItem {
  /** Store document name; unique per store and immutable once created. */
  name: string;
  /** The feature set the model was built from. */
  featureSetName: string;
  /** Parser type, e.g. model/ranklib, model/linear, model/xgboost+json. */
  modelType: string;
  /** Number of features in the attached feature set. */
  featureCount: number;
}

/** Why a listing came back empty, when the reason is actionable. */
export type LtrUnavailableReason = 'store_not_found' | 'plugin_disabled' | 'plugin_not_installed';

/** A single feature in the feature set a model was built from. */
export interface LtrFeature {
  name: string;
  params: string[];
  templateLanguage: string;
  template: any;
}

/**
 * A model as shown on the detail view.
 *
 * `definition` is deliberately left as `any`: the LTR store writes it either as a raw string
 * (RankLib) or as embedded JSON (linear, XGBoost), depending on how the model was created.
 * See StoredLtrModel#toXContent.
 */
export interface LtrModelDetail extends LtrModelListItem {
  features: LtrFeature[];
  definition: any;
}

/**
 * The model parsers the LTR plugin registers. The store accepts any string as a type but
 * rejects the model at query time if nothing can parse it, so the upload form offers only
 * the four types that exist.
 */
export const LTR_MODEL_TYPES = [
  'model/ranklib',
  'model/linear',
  'model/xgboost+json',
  'model/xgboost+json+raw',
] as const;

export type LtrModelType = typeof LTR_MODEL_TYPES[number];

/** A feature set as listed for the upload form's picker. */
export interface LtrFeatureSetSummary {
  name: string;
  featureCount: number;
}

/** The upload form's payload, flat; the server nests it for `_createmodel`. */
export interface LtrModelUpload {
  name: string;
  featureSetName: string;
  modelType: string;
  definition: any;
}
