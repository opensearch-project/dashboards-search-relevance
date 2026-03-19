/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { EuiButton, EuiButtonEmpty, EuiFieldText, EuiFormRow, EuiModal, EuiModalBody, EuiModalFooter, EuiModalHeader, EuiModalHeaderTitle, EuiText } from "@elastic/eui";
import React from 'react';
import { useState } from "react";
import cronstrue from 'cronstrue';

export const ScheduleModal = ({ onClose, onSubmit, itemName }) => {
  const [cronExpression, setCronExpression] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = () => {
    if (!cronExpression || cronExpression.trim() === '') {
      setError('Cron expression is required.');
      return;
    }
    try {
      cronstrue.toString(cronExpression);
    } catch (err: any) {
      setError('Invalid cron expression. Please provide a valid cron format.');
      return;
    }
    setError(null);
    onSubmit(cronExpression);
  };

  return (
    <EuiModal onClose={onClose}>
      <EuiModalHeader>
        <EuiModalHeaderTitle>Schedule Experiment to Run Periodically</EuiModalHeaderTitle>
      </EuiModalHeader>
      <EuiModalBody>
        <EuiFormRow
          label="Cron Job Schedule"
          helpText="Please submit a valid cron job such as '0 1 * * *' with single spaces between parts"
          isInvalid={!!error}
          error={error ? [error] : undefined}
        >
          <EuiFieldText
            value={cronExpression}
            onChange={(e) => {
              setCronExpression(e.target.value);
              if (error) setError(null);
            }}
            name="cron job"
            placeholder="To run every morning at 1:00 AM use (0 1 * * *)"
            isInvalid={!!error}
          />
        </EuiFormRow>
        <EuiText>
          <p></p>
        </EuiText>
      </EuiModalBody>

      <EuiModalFooter>
        <EuiButtonEmpty onClick={onClose}>Cancel</EuiButtonEmpty>
        <EuiButton onClick={handleSubmit} color="primary" fill>Schedule Experiment to Run</EuiButton>
      </EuiModalFooter>
    </EuiModal>
  )
};