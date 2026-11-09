/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  EuiCallOut,
  EuiComboBox,
  EuiFieldText,
  EuiForm,
  EuiFormRow,
  EuiSelect,
  EuiSpacer,
  EuiTextArea,
} from '@elastic/eui';
import { LtrFeatureSetSummary, LTR_MODEL_TYPES } from '../types';
import { isJsonModelType } from '../utils/definition';
import { LtrModelUploadErrors } from '../hooks/use_ltr_model_upload_form';

interface LtrModelUploadFormProps {
  name: string;
  setName: (name: string) => void;
  featureSetName: string;
  setFeatureSetName: (featureSetName: string) => void;
  modelType: string;
  setModelType: (modelType: string) => void;
  definitionText: string;
  setDefinitionText: (definition: string) => void;
  errors: LtrModelUploadErrors;
  featureSets: LtrFeatureSetSummary[];
  isLoadingFeatureSets: boolean;
}

const MODEL_TYPE_OPTIONS = [
  { value: '', text: 'Select a model type' },
  ...LTR_MODEL_TYPES.map((type) => ({ value: type, text: type })),
];

export const LtrModelUploadForm: React.FC<LtrModelUploadFormProps> = ({
  name,
  setName,
  featureSetName,
  setFeatureSetName,
  modelType,
  setModelType,
  definitionText,
  setDefinitionText,
  errors,
  featureSets,
  isLoadingFeatureSets,
}) => {
  const featureSetOptions = featureSets.map((set) => ({
    label: set.name,
    value: set.name,
  }));

  const selectedFeatureSet = featureSets.find((set) => set.name === featureSetName);

  return (
    <EuiForm component="form">
      <EuiFormRow
        label="Model name"
        helpText="Used to reference the model in an sltr query. Names are unique per store and cannot be changed or reused."
        isInvalid={!!errors.name}
        error={errors.name}
      >
        <EuiFieldText
          value={name}
          onChange={(e) => setName(e.target.value)}
          isInvalid={!!errors.name}
          data-test-subj="ltrModelUploadName"
        />
      </EuiFormRow>

      <EuiFormRow
        label="Feature set"
        helpText={
          selectedFeatureSet
            ? `${selectedFeatureSet.featureCount} features. The definition must score exactly these, in this order.`
            : 'The feature set the model was trained against.'
        }
        isInvalid={!!errors.featureSetName}
        error={errors.featureSetName}
      >
        <EuiComboBox
          singleSelection={{ asPlainText: true }}
          options={featureSetOptions}
          selectedOptions={featureSetName ? [{ label: featureSetName }] : []}
          onChange={(selected) => setFeatureSetName(selected[0]?.label ?? '')}
          isLoading={isLoadingFeatureSets}
          isInvalid={!!errors.featureSetName}
          isClearable={true}
          placeholder="Select a feature set"
          data-test-subj="ltrModelUploadFeatureSet"
        />
      </EuiFormRow>

      <EuiFormRow
        label="Model type"
        helpText="The parser the LTR plugin uses to read the definition below."
        isInvalid={!!errors.modelType}
        error={errors.modelType}
      >
        <EuiSelect
          options={MODEL_TYPE_OPTIONS}
          value={modelType}
          onChange={(e) => setModelType(e.target.value)}
          isInvalid={!!errors.modelType}
          data-test-subj="ltrModelUploadType"
        />
      </EuiFormRow>

      <EuiFormRow
        label="Model definition"
        helpText={
          isJsonModelType(modelType)
            ? 'Paste the trained model as JSON.'
            : 'Paste the trained model exactly as the trainer emitted it.'
        }
        isInvalid={!!errors.definition}
        error={errors.definition}
        fullWidth
      >
        <EuiTextArea
          value={definitionText}
          onChange={(e) => setDefinitionText(e.target.value)}
          isInvalid={!!errors.definition}
          rows={16}
          fullWidth
          data-test-subj="ltrModelUploadDefinition"
        />
      </EuiFormRow>

      {!isLoadingFeatureSets && featureSets.length === 0 && (
        <>
          <EuiSpacer size="m" />
          <EuiCallOut title="No feature sets in this store" color="warning" iconType="alert">
            <p>
              A model is created against a feature set, and this store has none. Create one with
              POST _ltr/_featureset/&#123;name&#125; before uploading a model.
            </p>
          </EuiCallOut>
        </>
      )}
    </EuiForm>
  );
};
