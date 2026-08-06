/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  EuiBasicTable,
  EuiBasicTableColumn,
  EuiPanel,
  EuiSpacer,
  EuiText,
  EuiTitle,
} from '@elastic/eui';
import moment from 'moment';
import { useConfig } from '../../../contexts/date_format_context';
import { AbTestSnapshot } from '../types';
import { shortenId } from '../utils/query_display';

interface VersionHistoryProps {
  snapshots: AbTestSnapshot[];
}

/** Past configurations of a test, one row per recorded snapshot. Hidden when there are none. */
export const VersionHistory: React.FC<VersionHistoryProps> = ({ snapshots }) => {
  const { dateFormat } = useConfig();

  if (snapshots.length === 0) return null;

  const columns: Array<EuiBasicTableColumn<AbTestSnapshot>> = [
    {
      field: 'id',
      name: 'Version',
      render: (id: string) => <EuiText size="s">{id}</EuiText>,
    },
    {
      field: 'created',
      name: 'Timestamp',
      render: (created: string) => (
        <EuiText size="s">{created ? moment(created).format(dateFormat) : '-'}</EuiText>
      ),
    },
    {
      field: 'configA',
      name: 'Config A',
      render: (configA: string) => <EuiText size="s">{shortenId(configA)}</EuiText>,
    },
    {
      field: 'configB',
      name: 'Config B',
      render: (configB: string) => <EuiText size="s">{shortenId(configB)}</EuiText>,
    },
    {
      field: 'enabled',
      name: 'Enabled',
      render: (enabled?: boolean) => (
        <EuiText size="s">{enabled === undefined ? '-' : enabled ? 'Yes' : 'No'}</EuiText>
      ),
    },
  ];

  return (
    <EuiPanel paddingSize="l">
      <EuiTitle size="s">
        <h3>Version History</h3>
      </EuiTitle>
      <EuiSpacer size="m" />
      <EuiBasicTable<AbTestSnapshot> items={snapshots} tableLayout="auto" columns={columns} />
    </EuiPanel>
  );
};
