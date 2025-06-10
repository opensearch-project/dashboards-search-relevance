/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { EuiFlexGroup, EuiFlexItem, EuiButton, EuiButtonEmpty } from '@elastic/eui';
import { ConfigurationActionsProps } from './types';

export const ConfigurationActions = ({ onBack, onClose, onNext }: ConfigurationActionsProps) => (
  <EuiFlexGroup justifyContent="flexEnd">
    <EuiFlexItem grow={false}>
      <EuiButton fill iconType="play" onClick={onNext}>
        Start Evaluation
      </EuiButton>
    </EuiFlexItem>
    <EuiFlexItem grow={false}>
      <EuiButtonEmpty onClick={onBack} iconType="cross" size="s">
        Cancel
      </EuiButtonEmpty>
    </EuiFlexItem>
  </EuiFlexGroup>
);
