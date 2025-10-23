/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { EuiButton, EuiButtonEmpty, EuiFieldText, EuiFormRow, EuiModal, EuiModalBody, EuiModalFooter, EuiModalHeader, EuiModalHeaderTitle, EuiText } from "@elastic/eui";
import React from 'react';
import { useState } from "react";

export const DeleteScheduleModal = ({ onClose, onSubmit, scheduleForExperiment }) => {
console.log("experiment schedule to delete: ", scheduleForExperiment.id)
  return (
    <EuiModal onClose={onClose}>
      <EuiModalHeader>
        <EuiModalHeaderTitle>View Experiment Schedule </EuiModalHeaderTitle>
      </EuiModalHeader>
      <EuiModalBody>
        <EuiFormRow label="Cron Job Schedule">
          <EuiFieldText value={scheduleForExperiment.expression} readOnly={true}/>
        </EuiFormRow>
        <EuiText>
          <p></p>
        </EuiText>
      </EuiModalBody>

      <EuiModalFooter>
        <EuiButtonEmpty onClick={onClose}>Cancel</EuiButtonEmpty>
        <EuiButton onClick={onSubmit} color="danger" fill>Delete</EuiButton>
      </EuiModalFooter>
    </EuiModal>
  )
};