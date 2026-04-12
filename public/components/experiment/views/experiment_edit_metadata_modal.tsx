/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  EuiButton,
  EuiButtonEmpty,
  EuiCallOut,
  EuiFieldText,
  EuiFormRow,
  EuiModal,
  EuiModalBody,
  EuiModalFooter,
  EuiModalHeader,
  EuiModalHeaderTitle,
  EuiSpacer,
  EuiTextArea,
} from '@elastic/eui';
import React, { useEffect, useState } from 'react';
import {
  EXPERIMENT_DESCRIPTION_MAX_LENGTH,
  EXPERIMENT_NAME_MAX_LENGTH,
  validateExperimentMetadataForCreate,
} from '../../../../common';
import { ExperimentService } from '../services/experiment_service';

export interface ExperimentEditMetadataModalProps {
  isOpen: boolean;
  onClose: () => void;
  experimentId: string;
  initialName?: string;
  initialDescription?: string;
  dataSourceId?: string | null;
  experimentService: ExperimentService;
  onSaved: () => void;
}

export const ExperimentEditMetadataModal: React.FC<ExperimentEditMetadataModalProps> = ({
  isOpen,
  onClose,
  experimentId,
  initialName = '',
  initialDescription = '',
  dataSourceId,
  experimentService,
  onSaved,
}) => {
  const [name, setName] = useState(initialName);
  const [description, setDescription] = useState(initialDescription);
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [nameError, setNameError] = useState<string[]>([]);
  const [descriptionError, setDescriptionError] = useState<string[]>([]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }
    setName(initialName);
    setDescription(initialDescription);
    setFormError(null);
    setNameError([]);
    setDescriptionError([]);
  }, [isOpen, initialName, initialDescription]);

  if (!isOpen) {
    return null;
  }

  const handleSave = async () => {
    setFormError(null);

    const meta = validateExperimentMetadataForCreate(name, description);
    if (meta.name) {
      setNameError(meta.name);
    } else {
      setNameError([]);
    }
    if (meta.description) {
      setDescriptionError(meta.description);
    } else {
      setDescriptionError([]);
    }
    if (meta.name || meta.description) {
      return;
    }

    const trimmedName = name.trim();
    const trimmedDesc = description.trim();
    const initialNameTrim = (initialName || '').trim();
    const initialDescTrim = (initialDescription || '').trim();

    const payload: { name?: string; description?: string } = {};
    if (trimmedName !== initialNameTrim) {
      payload.name = trimmedName;
    }
    if (trimmedDesc !== initialDescTrim) {
      payload.description = trimmedDesc;
    }

    if (Object.keys(payload).length === 0) {
      setFormError('Change the name or description before saving.');
      return;
    }

    setIsSaving(true);
    try {
      await experimentService.patchExperiment(experimentId, payload, dataSourceId);
      onSaved();
      onClose();
    } catch (err: any) {
      setFormError(
        typeof err?.message === 'string' ? err.message : 'Failed to update experiment metadata.'
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <EuiModal onClose={onClose} data-test-subj="experimentEditMetadataModal">
      <EuiModalHeader>
        <EuiModalHeaderTitle>
          <h2>Edit experiment details</h2>
        </EuiModalHeaderTitle>
      </EuiModalHeader>
      <EuiModalBody>
        {formError && (
          <>
            <EuiCallOut title="Unable to save" color="danger">
              {formError}
            </EuiCallOut>
            <EuiSpacer size="m" />
          </>
        )}
        <EuiFormRow
          label="Experiment name"
          helpText="Optional. If left empty, a name will be auto-generated."
          isInvalid={nameError.length > 0}
          error={nameError}
        >
          <EuiFieldText
            name="experimentEditName"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter experiment name"
            maxLength={EXPERIMENT_NAME_MAX_LENGTH}
            data-test-subj="experimentEditName"
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
            name="experimentEditDescription"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the purpose of this experiment (optional)"
            maxLength={EXPERIMENT_DESCRIPTION_MAX_LENGTH}
            data-test-subj="experimentEditDescription"
            fullWidth
          />
        </EuiFormRow>
      </EuiModalBody>
      <EuiModalFooter>
        <EuiButtonEmpty onClick={onClose} data-test-subj="experimentEditCancel">
          Cancel
        </EuiButtonEmpty>
        <EuiButton onClick={handleSave} fill isLoading={isSaving} data-test-subj="experimentEditSave">
          Save
        </EuiButton>
      </EuiModalFooter>
    </EuiModal>
  );
};
