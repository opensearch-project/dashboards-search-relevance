/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { EuiSpacer, EuiFormRow, EuiSelect } from '@elastic/eui';

import './visual_config.scss';

interface VisualConfigProps {
  viewMode: string;
  setViewMode: (mode: string) => void;
}

export const VisualConfig: React.FC<VisualConfigProps> = ({ viewMode, setViewMode }) => {
  return (
    <div className="visual-config">
      <EuiSpacer size="l" />
      <EuiFormRow label="View Mode" display="rowCompressed">
        <EuiSelect
          options={[
            { value: 'text-rich', text: 'Text-rich' },
            { value: 'visual-comparison', text: 'Visual-comparison' },
          ]}
          value={viewMode}
          onChange={(e) => setViewMode(e.target.value)}
          compressed
          style={{ minWidth: '160px' }}
        />
      </EuiFormRow>
    </div>
  );
};