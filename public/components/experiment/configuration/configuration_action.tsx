import React from 'react';
import {
  EuiFlexGroup,
  EuiFlexItem,
  EuiButton,
  EuiButtonEmpty,
} from '@elastic/eui';
import { ConfigurationActionsProps } from './types';

export const ConfigurationActions = ({
                                       onBack,
                                       onClose,
                                       onNext,
                                     }: ConfigurationActionsProps) => (
  <EuiFlexGroup justifyContent="flexEnd">
    <EuiFlexItem grow={false}>
      <EuiButtonEmpty onClick={onBack}>
        Back to Templates
      </EuiButtonEmpty>
    </EuiFlexItem>
    <EuiFlexItem grow={false}>
      <EuiButton fill onClick={onClose}>
        Cancel
      </EuiButton>
    </EuiFlexItem>
    <EuiFlexItem grow={false}>
      <EuiButton fill iconType="play" onClick={onNext}>
        Start Evaluation
      </EuiButton>
    </EuiFlexItem>
  </EuiFlexGroup>
);
