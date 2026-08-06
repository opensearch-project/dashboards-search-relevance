/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { EuiCallOut, EuiText } from '@elastic/eui';
import { SignificanceResult } from '../utils/statistics';

interface SignificancePanelProps {
  stats: SignificanceResult;
}

export const SignificancePanel: React.FC<SignificancePanelProps> = ({ stats }) => (
  <EuiCallOut
    title="Statistical Significance"
    color={stats.significant ? 'success' : 'primary'}
    iconType={stats.significant ? 'check' : 'iInCircle'}
    data-test-subj="abTestSignificancePanel"
  >
    <EuiText size="s">
      <p>
        <strong>P-Value:</strong> {stats.pValue.toFixed(4)}
      </p>
      <p>
        <strong>Result:</strong>{' '}
        {stats.significant
          ? `Statistically significant (p < 0.05) — Config ${stats.winner} is the winner`
          : 'Not statistically significant — need more data'}
      </p>
    </EuiText>
  </EuiCallOut>
);
