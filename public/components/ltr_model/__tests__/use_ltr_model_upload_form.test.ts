/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { act, renderHook } from '@testing-library/react-hooks';
import { useLtrModelUploadForm, validateLtrModelUpload } from '../hooks/use_ltr_model_upload_form';

const validForm = {
  name: 'my_model',
  featureSetName: 'my_featureset',
  modelType: 'model/linear',
  definitionText: '{"title_match": 0.4}',
};

describe('validateLtrModelUpload', () => {
  it('accepts a complete form', () => {
    expect(validateLtrModelUpload(validForm)).toEqual({});
  });

  it('requires a name', () => {
    expect(validateLtrModelUpload({ ...validForm, name: '  ' }).name).toBe(
      'A model name is required.'
    );
  });

  it('rejects a name with surrounding whitespace rather than silently trimming it', () => {
    expect(validateLtrModelUpload({ ...validForm, name: 'my_model ' }).name).toMatch(/whitespace/);
  });

  it('requires a feature set', () => {
    expect(validateLtrModelUpload({ ...validForm, featureSetName: '' }).featureSetName).toBe(
      'Select the feature set this model was built from.'
    );
  });

  it('requires a model type', () => {
    expect(validateLtrModelUpload({ ...validForm, modelType: '' }).modelType).toBe(
      'Select a model type.'
    );
  });

  // Without a type there is nothing to validate the definition against, so the type error
  // stands alone rather than being joined by a misleading JSON complaint.
  it('does not judge the definition until a type is selected', () => {
    const errors = validateLtrModelUpload({ ...validForm, modelType: '', definitionText: 'x' });
    expect(errors.definition).toBeUndefined();
  });

  it('rejects a JSON definition that does not parse', () => {
    expect(validateLtrModelUpload({ ...validForm, definitionText: '{' }).definition).toMatch(
      /must be valid JSON/
    );
  });
});

describe('useLtrModelUploadForm', () => {
  it('returns the parsed payload once the form is complete', () => {
    const { result } = renderHook(() => useLtrModelUploadForm());

    act(() => {
      result.current.setName(' my_model ');
      result.current.setFeatureSetName('my_featureset');
      result.current.setModelType('model/linear');
      result.current.setDefinitionText('{"title_match": 0.4}');
    });

    let payload: any;
    act(() => {
      payload = result.current.validate();
    });

    // The name is rejected rather than trimmed, so nothing is silently renamed.
    expect(payload).toBeNull();
    expect(result.current.errors.name).toMatch(/whitespace/);

    act(() => {
      result.current.setName('my_model');
    });
    act(() => {
      payload = result.current.validate();
    });

    expect(payload).toEqual({
      name: 'my_model',
      featureSetName: 'my_featureset',
      modelType: 'model/linear',
      definition: { title_match: 0.4 },
    });
    expect(result.current.errors).toEqual({});
  });

  it('reports errors and withholds the payload when the form is incomplete', () => {
    const { result } = renderHook(() => useLtrModelUploadForm());

    let payload: any = 'unset';
    act(() => {
      payload = result.current.validate();
    });

    expect(payload).toBeNull();
    expect(result.current.errors.name).toBeDefined();
    expect(result.current.errors.featureSetName).toBeDefined();
    expect(result.current.errors.modelType).toBeDefined();
  });
});
