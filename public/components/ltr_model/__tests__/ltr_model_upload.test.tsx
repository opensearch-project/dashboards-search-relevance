/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { LtrModelUpload } from '../views/ltr_model_upload';
import { useLtrFeatureSetList } from '../hooks/use_ltr_feature_set_list';
import { useLtrModelUploadForm } from '../hooks/use_ltr_model_upload_form';
import { LtrModelService } from '../services/ltr_model_service';

jest.mock('../hooks/use_ltr_feature_set_list');
jest.mock('../hooks/use_ltr_model_upload_form');
jest.mock('../services/ltr_model_service');
jest.mock('../components/ltr_model_upload_form', () => ({
  // The fields themselves are plain EUI inputs; what matters here is that the view hands
  // the form its state, its errors, and the feature sets to pick from.
  LtrModelUploadForm: ({ errors, featureSets, isLoadingFeatureSets }: any) => (
    <div data-test-subj="upload-form">
      <span data-test-subj="form-feature-sets">
        {featureSets.map((set: any) => set.name).join(',')}
      </span>
      <span data-test-subj="form-loading">{isLoadingFeatureSets ? 'yes' : 'no'}</span>
      <span data-test-subj="form-errors">{JSON.stringify(errors)}</span>
    </div>
  ),
}));

const mockUseLtrFeatureSetList = useLtrFeatureSetList as jest.MockedFunction<
  typeof useLtrFeatureSetList
>;
const mockUseLtrModelUploadForm = useLtrModelUploadForm as jest.MockedFunction<
  typeof useLtrModelUploadForm
>;
const MockLtrModelService = LtrModelService as jest.MockedClass<typeof LtrModelService>;

const mockHttp = { get: jest.fn(), post: jest.fn() } as any;
const notifications = { toasts: { addSuccess: jest.fn(), addError: jest.fn() } } as any;
const history = { push: jest.fn() };

const routeProps: any = {
  history,
  location: { pathname: '/ltrModel/create', search: '', hash: '', state: undefined },
  match: { params: {}, isExact: true, path: '/ltrModel/create', url: '/ltrModel/create' },
};

const model = {
  name: 'my_model',
  featureSetName: 'my_set',
  modelType: 'model/linear',
  definition: { title_match: 0.4 },
};

const featureSetState = (overrides: any = {}) => ({
  featureSets: [{ name: 'my_set', featureCount: 3 }],
  isLoading: false,
  error: null,
  unavailableReason: null,
  ...overrides,
});

let createModel: jest.Mock;
let setErrors: jest.Mock;
let validate: jest.Mock;

const formState = (overrides: any = {}) => ({
  name: '',
  setName: jest.fn(),
  featureSetName: '',
  setFeatureSetName: jest.fn(),
  modelType: '',
  setModelType: jest.fn(),
  definitionText: '',
  setDefinitionText: jest.fn(),
  errors: {},
  setErrors,
  validate,
  ...overrides,
});

const renderUpload = () =>
  render(<LtrModelUpload http={mockHttp} notifications={notifications} {...routeProps} />);

const submit = () => fireEvent.click(screen.getByTestId('uploadLtrModelButton'));

const failWith = (attributes: any) =>
  createModel.mockRejectedValue({ body: { message: 'nope', attributes } });

describe('LtrModelUpload', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    createModel = jest.fn().mockResolvedValue({ result: 'created' });
    setErrors = jest.fn();
    validate = jest.fn().mockReturnValue(model);
    MockLtrModelService.mockImplementation(() => ({ createModel } as any));
    mockUseLtrFeatureSetList.mockReturnValue(featureSetState() as any);
    mockUseLtrModelUploadForm.mockReturnValue(formState() as any);
  });

  it('renders the form with the feature sets available to build against', () => {
    renderUpload();

    expect(screen.getByText('Upload LTR Model')).toBeInTheDocument();
    expect(screen.getByTestId('form-feature-sets')).toHaveTextContent('my_set');
    expect(screen.getByTestId('form-loading')).toHaveTextContent('no');
  });

  it('uploads the validated model and lands on its detail view', async () => {
    renderUpload();

    submit();

    await waitFor(() => expect(createModel).toHaveBeenCalledWith(model));
    expect(notifications.toasts.addSuccess).toHaveBeenCalledWith(
      'Model "my_model" uploaded successfully'
    );
    // The detail view reads the definition back out of the store, which is the only
    // confirmation that what was pasted is what landed.
    expect(history.push).toHaveBeenCalledWith('/ltrModel/view/my_model');
  });

  it('escapes a model name that is not URL-safe on its way to the detail view', async () => {
    validate.mockReturnValue({ ...model, name: 'my model/v2' });

    renderUpload();
    submit();

    await waitFor(() =>
      expect(history.push).toHaveBeenCalledWith('/ltrModel/view/my%20model%2Fv2')
    );
  });

  it('does not call the API when the form does not validate', async () => {
    validate.mockReturnValue(null);

    renderUpload();
    submit();

    await waitFor(() => expect(validate).toHaveBeenCalled());
    expect(createModel).not.toHaveBeenCalled();
    expect(history.push).not.toHaveBeenCalled();
  });

  // The store has no update path, so a collision is a fixable form error rather than a
  // failure to report and walk away from.
  it('turns a name collision into a form error instead of a toast', async () => {
    failWith({ ltrErrorType: 'model_exists' });

    renderUpload();
    submit();

    await waitFor(() => expect(setErrors).toHaveBeenCalled());
    expect(setErrors.mock.calls[0][0].name).toMatch(/already exists/);
    expect(notifications.toasts.addError).not.toHaveBeenCalled();
    expect(history.push).not.toHaveBeenCalled();
  });

  it('blames the feature set field when the feature set has gone missing', async () => {
    failWith({ ltrErrorType: 'featureset_not_found' });

    renderUpload();
    submit();

    await waitFor(() => expect(setErrors).toHaveBeenCalled());
    expect(setErrors.mock.calls[0][0].featureSetName).toMatch(/my_set/);
    expect(notifications.toasts.addError).not.toHaveBeenCalled();
  });

  it('toasts a failure it cannot attribute to a field', async () => {
    failWith({});

    renderUpload();
    submit();

    await waitFor(() => expect(notifications.toasts.addError).toHaveBeenCalled());
    expect(notifications.toasts.addError.mock.calls[0][1]).toEqual({
      title: 'Failed to upload model',
    });
    expect(setErrors).not.toHaveBeenCalled();
  });

  it('replaces the form with an explanation when LTR is unavailable', () => {
    mockUseLtrFeatureSetList.mockReturnValue(
      featureSetState({ unavailableReason: 'plugin_not_installed' }) as any
    );

    renderUpload();

    expect(screen.getByText('Learning to Rank is not installed')).toBeInTheDocument();
    expect(screen.queryByTestId('upload-form')).not.toBeInTheDocument();
    // Nothing to upload into, so there is nothing to submit either.
    expect(screen.queryByTestId('uploadLtrModelButton')).not.toBeInTheDocument();
  });

  it('returns to the listing on cancel', () => {
    renderUpload();

    fireEvent.click(screen.getByTestId('cancelLtrModelUploadButton'));

    expect(history.push).toHaveBeenCalledWith('/ltrModel');
    expect(createModel).not.toHaveBeenCalled();
  });
});
