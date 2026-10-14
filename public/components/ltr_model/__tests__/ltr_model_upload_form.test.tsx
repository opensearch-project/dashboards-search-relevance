/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { LtrModelUploadForm } from '../components/ltr_model_upload_form';

const setName = jest.fn();
const setFeatureSetName = jest.fn();
const setModelType = jest.fn();
const setDefinitionText = jest.fn();

const props = (overrides: any = {}) => ({
  name: '',
  setName,
  featureSetName: '',
  setFeatureSetName,
  modelType: '',
  setModelType,
  definitionText: '',
  setDefinitionText,
  errors: {},
  featureSets: [{ name: 'my_set', featureCount: 3 }],
  isLoadingFeatureSets: false,
  ...overrides,
});

describe('LtrModelUploadForm', () => {
  beforeEach(() => jest.clearAllMocks());

  it('offers only the model types the LTR plugin can parse', () => {
    render(<LtrModelUploadForm {...props()} />);

    const options = Array.from(
      screen.getByTestId('ltrModelUploadType').querySelectorAll('option')
    ).map((option) => option.getAttribute('value'));

    expect(options).toEqual([
      '',
      'model/ranklib',
      'model/linear',
      'model/xgboost+json',
      'model/xgboost+json+raw',
    ]);
  });

  it('reports each field error against its own field', () => {
    render(
      <LtrModelUploadForm
        {...props({
          errors: {
            name: 'A model name is required.',
            featureSetName: 'Select the feature set this model was built from.',
            definition: 'model/linear definitions must be valid JSON.',
          },
        })}
      />
    );

    expect(screen.getByText('A model name is required.')).toBeInTheDocument();
    expect(
      screen.getByText('Select the feature set this model was built from.')
    ).toBeInTheDocument();
    expect(screen.getByText('model/linear definitions must be valid JSON.')).toBeInTheDocument();
  });

  it('propagates edits to the caller', () => {
    render(<LtrModelUploadForm {...props()} />);

    fireEvent.change(screen.getByTestId('ltrModelUploadName'), {
      target: { value: 'my_model' },
    });
    fireEvent.change(screen.getByTestId('ltrModelUploadType'), {
      target: { value: 'model/ranklib' },
    });
    fireEvent.change(screen.getByTestId('ltrModelUploadDefinition'), {
      target: { value: '## LambdaMART' },
    });

    expect(setName).toHaveBeenCalledWith('my_model');
    expect(setModelType).toHaveBeenCalledWith('model/ranklib');
    expect(setDefinitionText).toHaveBeenCalledWith('## LambdaMART');
  });

  // The definition has to score the feature set's features, in order, so the count is the
  // one thing worth surfacing next to the picker.
  it('shows the selected feature set size', () => {
    render(<LtrModelUploadForm {...props({ featureSetName: 'my_set' })} />);

    expect(screen.getByText(/3 features/)).toBeInTheDocument();
  });

  it('says a JSON model type wants JSON', () => {
    render(<LtrModelUploadForm {...props({ modelType: 'model/xgboost+json' })} />);

    expect(screen.getByText('Paste the trained model as JSON.')).toBeInTheDocument();
  });

  it('does not ask for JSON for a RankLib model', () => {
    render(<LtrModelUploadForm {...props({ modelType: 'model/ranklib' })} />);

    expect(
      screen.getByText('Paste the trained model exactly as the trainer emitted it.')
    ).toBeInTheDocument();
  });

  // A model is created against an existing feature set and this plugin does not author
  // them, so an empty picker is a dead end that has to say so.
  it('explains an empty store rather than showing an empty picker', () => {
    render(<LtrModelUploadForm {...props({ featureSets: [] })} />);

    expect(screen.getByText('No feature sets in this store')).toBeInTheDocument();
  });

  it('stays quiet about an empty picker while the feature sets are still loading', () => {
    render(<LtrModelUploadForm {...props({ featureSets: [], isLoadingFeatureSets: true })} />);

    expect(screen.queryByText('No feature sets in this store')).not.toBeInTheDocument();
  });
});
