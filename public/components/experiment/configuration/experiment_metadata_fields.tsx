/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { EuiFieldText, EuiFormRow, EuiSpacer, EuiTextArea } from '@elastic/eui';
import {
  EXPERIMENT_DESCRIPTION_MAX_LENGTH,
  EXPERIMENT_NAME_MAX_LENGTH,
} from '../../../../common';

export interface ExperimentMetadataFieldsProps {
  name: string;
  description: string;
  onChange: (field: 'name' | 'description', value: string) => void;
  nameError?: string[];
  descriptionError?: string[];
}

export const ExperimentMetadataFields: React.FC<ExperimentMetadataFieldsProps> = ({
  name,
  description,
  onChange,
  nameError = [],
  descriptionError = [],
}) => (
  <>
    <EuiFormRow
      label="Experiment name"
      helpText="Optional. If left empty, a name will be auto-generated."
      isInvalid={nameError.length > 0}
      error={nameError}
    >
      <EuiFieldText
        name="experimentName"
        value={name}
        onChange={(e) => onChange('name', e.target.value)}
        placeholder="Enter experiment name"
        maxLength={EXPERIMENT_NAME_MAX_LENGTH}
        data-test-subj="experimentCreateName"
        fullWidth
      />
    </EuiFormRow>
    <EuiSpacer size="m" />
    <EuiFormRow
      label="Description"
      helpText={`Optional. Up to ${EXPERIMENT_DESCRIPTION_MAX_LENGTH} characters.`}
      isInvalid={descriptionError.length > 0}
      error={descriptionError}
    >
      <EuiTextArea
        name="experimentDescription"
        value={description}
        onChange={(e) => onChange('description', e.target.value)}
        placeholder="Describe the purpose of this experiment (optional)"
        maxLength={EXPERIMENT_DESCRIPTION_MAX_LENGTH}
        data-test-subj="experimentCreateDescription"
        fullWidth
      />
    </EuiFormRow>
    <EuiSpacer size="m" />
  </>
);
