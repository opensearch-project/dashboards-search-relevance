/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { EuiButton, EuiButtonEmpty, EuiFieldText, EuiFormRow, EuiModal, EuiModalBody, EuiModalFooter, EuiModalHeader, EuiModalHeaderTitle, EuiText } from "@elastic/eui";
import React from 'react';
import { useState } from "react";

export const ScheduleModal = ({ onClose, onSubmit, itemName }) => {
  const [cronExpression, setCronExpression] = useState("");
  const [error, setError] = useState<string | null>(null);

  const isValidCron = (cron: string) => {
    const parts = cron.trim().split(/\s+/);
    if (parts.length < 5 || parts.length > 7) return false;
    
    return parts.every(part => 
      /^(\*|\?|L|[a-zA-Z]{3,}|[0-9]{1,4})([/\-,][a-zA-Z0-9]+)*$/.test(part)
    );
  };

  const handleSubmit = () => {
    if (!cronExpression || cronExpression.trim() === '') {
      setError('Cron expression is required.');
      return;
    }
    if (!isValidCron(cronExpression)) {
      setError('Invalid cron format. Please use a valid cron expression (e.g., "0 1 * * *").');
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