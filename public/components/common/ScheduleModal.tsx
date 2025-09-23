/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { EuiButton, EuiButtonEmpty, EuiFieldText, EuiFormRow, EuiModal, EuiModalBody, EuiModalFooter, EuiModalHeader, EuiModalHeaderTitle, EuiText } from "@elastic/eui";
import React from 'react';
import { useState } from "react";

export const ScheduleModal = ({ onClose, onSubmit, itemName }) => {
  const [cronExpression, setCronExpression] = useState("");

  return (
    <EuiModal onClose={onClose}>
      <EuiModalHeader>
        <EuiModalHeaderTitle>Schedule Experiment to Run Periodically</EuiModalHeaderTitle>
      </EuiModalHeader>
      <EuiModalBody>
        <EuiFormRow label="Cron Job Schedule" helpText="Please submit a valid cron job such as '* 1 * * *' with single spaces between parts">
          <EuiFieldText value={cronExpression} onChange={(e) => setCronExpression(e.target.value)} name="cron job" placeholder="To run every morning at 1:00 AM use (* 1 * * *)" />
        </EuiFormRow>
        <EuiText>
          <p></p>
        </EuiText>
      </EuiModalBody>

      <EuiModalFooter>
        <EuiButtonEmpty onClick={onClose}>Cancel</EuiButtonEmpty>
        <EuiButton onClick={() => {
          onSubmit(cronExpression);
        }} color="primary" fill>Schedule Experiment to Run</EuiButton>
      </EuiModalFooter>
    </EuiModal>
  )
};
