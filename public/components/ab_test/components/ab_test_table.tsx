/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  EuiButtonEmpty,
  EuiButtonIcon,
  EuiFlexGroup,
  EuiFlexItem,
  EuiText,
  EuiToolTip,
} from '@elastic/eui';
import { RouteComponentProps } from 'react-router-dom';
import moment from 'moment';
import {
  TableListView,
  reactRouterNavigate,
} from '../../../../../../src/plugins/opensearch_dashboards_react/public';
import { useConfig } from '../../../contexts/date_format_context';
import { AbTestListItem } from '../types';

interface AbTestTableProps {
  refreshKey: number;
  isLoading: boolean;
  findItems: (search: any) => Promise<{ total: number; hits: any[] }>;
  onDelete: (item: AbTestListItem) => void;
  history: RouteComponentProps['history'];
}

export const AbTestTable: React.FC<AbTestTableProps> = ({
  refreshKey,
  isLoading,
  findItems,
  onDelete,
  history,
}) => {
  const { dateFormat } = useConfig();

  const tableColumns = [
    {
      field: 'test_id',
      name: 'Test ID',
      dataType: 'string' as const,
      sortable: true,
      render: (testId: string) => (
        <EuiButtonEmpty size="xs" {...reactRouterNavigate(history, `/abTest/detail/${testId}`)}>
          {testId}
        </EuiButtonEmpty>
      ),
    },
    {
      field: 'name',
      name: 'Name',
      dataType: 'string' as const,
      sortable: true,
      render: (name: string) => <EuiText size="s">{name}</EuiText>,
    },
    {
      field: 'size',
      name: 'Size',
      dataType: 'number' as const,
      width: '80px',
      sortable: true,
      render: (size: number) => <EuiText size="s">{size}</EuiText>,
    },
    {
      field: 'status',
      name: 'Status',
      dataType: 'string' as const,
      width: '100px',
      sortable: true,
      render: (status: string) => <EuiText size="s">{status}</EuiText>,
    },
    {
      field: 'timestamp',
      name: 'Timestamp',
      dataType: 'string' as const,
      sortable: true,
      render: (timestamp: string) => (
        <EuiText size="s">{timestamp ? moment(timestamp).format(dateFormat) : '-'}</EuiText>
      ),
    },
    {
      field: 'id',
      name: 'Actions',
      width: '100px',
      align: 'center' as const,
      render: (id: string, item: AbTestListItem) => (
        <EuiFlexGroup gutterSize="s" alignItems="center" responsive={false}>
          <EuiFlexItem grow={false}>
            <EuiToolTip content="Update">
              <EuiButtonIcon
                iconType="pencil"
                aria-label="Update"
                {...reactRouterNavigate(history, `/abTest/update/${item.test_id}`)}
              />
            </EuiToolTip>
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <EuiToolTip content="Delete">
              <EuiButtonIcon
                iconType="trash"
                color="danger"
                aria-label="Delete"
                onClick={() => onDelete(item)}
              />
            </EuiToolTip>
          </EuiFlexItem>
        </EuiFlexGroup>
      ),
    },
  ];

  return (
    <TableListView
      key={refreshKey}
      headingId="abTestListingHeading"
      entityName="A/B Test"
      entityNamePlural="A/B Tests"
      tableColumns={tableColumns}
      findItems={findItems}
      loading={isLoading}
      initialPageSize={10}
      search={{
        box: {
          incremental: true,
          placeholder: 'Search A/B tests...',
          schema: true,
        },
      }}
      sorting={{
        sort: {
          field: 'timestamp',
          direction: 'desc',
        },
      }}
    />
  );
};
