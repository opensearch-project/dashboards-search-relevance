import React from 'react';
import {
  EuiTitle,
  EuiSpacer,
} from '@elastic/eui';
import { ConfigurationHeaderProps } from './types';

export const ConfigurationHeader = ({ templateType }: ConfigurationHeaderProps) => (
  <>
    <EuiTitle size="m">
      <h2>{templateType} Configuration</h2>
    </EuiTitle>
    <EuiSpacer size="m" />
  </>
);

