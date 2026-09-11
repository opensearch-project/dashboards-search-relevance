/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { useCallback, useState } from 'react';
import { LtrModelUpload } from '../types';
import { parseDefinition } from '../utils/definition';

export interface LtrModelUploadErrors {
  name?: string;
  featureSetName?: string;
  modelType?: string;
  definition?: string;
}

export interface LtrModelUploadFormState {
  name: string;
  featureSetName: string;
  modelType: string;
  definitionText: string;
}

/**
 * The store rejects a duplicate name rather than overwriting, and there is no update path,
 * so a name collision can only be reported after the fact -- see the upload view. What can
 * be checked up front is checked here.
 */
export const validateLtrModelUpload = (form: LtrModelUploadFormState): LtrModelUploadErrors => {
  const errors: LtrModelUploadErrors = {};

  if (!form.name.trim()) {
    errors.name = 'A model name is required.';
  } else if (form.name !== form.name.trim()) {
    // The name becomes the store document id and goes into an sltr query verbatim, where
    // surrounding whitespace is invisible and impossible to debug.
    errors.name = 'A model name cannot start or end with whitespace.';
  }

  if (!form.featureSetName.trim()) {
    errors.featureSetName = 'Select the feature set this model was built from.';
  }

  if (!form.modelType) {
    errors.modelType = 'Select a model type.';
  } else {
    const { error } = parseDefinition(form.modelType, form.definitionText);
    if (error) {
      errors.definition = error;
    }
  }

  return errors;
};

export const useLtrModelUploadForm = () => {
  const [name, setName] = useState('');
  const [featureSetName, setFeatureSetName] = useState('');
  const [modelType, setModelType] = useState<string>('');
  const [definitionText, setDefinitionText] = useState('');
  const [errors, setErrors] = useState<LtrModelUploadErrors>({});

  /**
   * Validates and returns the payload, or null with `errors` populated. Errors only appear
   * once the user has tried to submit; nothing is flagged while the form is still being
   * filled in.
   */
  const validate = useCallback((): LtrModelUpload | null => {
    const form = { name, featureSetName, modelType, definitionText };
    const found = validateLtrModelUpload(form);
    setErrors(found);

    if (Object.keys(found).length > 0) {
      return null;
    }

    return {
      name: name.trim(),
      featureSetName: featureSetName.trim(),
      modelType,
      definition: parseDefinition(modelType, definitionText).value,
    };
  }, [name, featureSetName, modelType, definitionText]);

  return {
    name,
    setName,
    featureSetName,
    setFeatureSetName,
    modelType,
    setModelType,
    definitionText,
    setDefinitionText,
    errors,
    setErrors,
    validate,
  };
};
