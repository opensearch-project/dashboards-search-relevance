/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  EuiButton,
  EuiButtonEmpty,
  EuiModal,
  EuiModalBody,
  EuiModalFooter,
  EuiModalHeader,
  EuiModalHeaderTitle,
} from '@elastic/eui';
import React from 'react';

export const DeleteModal = ({ onClose, onConfirm, itemName }) => (
  <EuiModal onClose={onClose}>
    <EuiModalHeader>
      <EuiModalHeaderTitle>Delete Item</EuiModalHeaderTitle>
    </EuiModalHeader>

    <EuiModalBody>
      <p>Are you sure you want to delete the item "{itemName}"? This action cannot be undone.</p>
    </EuiModalBody>

    <EuiModalFooter>
      <EuiButtonEmpty onClick={onClose}>Cancel</EuiButtonEmpty>
      <EuiButton onClick={onConfirm} fill color="danger">
        Delete
      </EuiButton>
    </EuiModalFooter>
  </EuiModal>
);
