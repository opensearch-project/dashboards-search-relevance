/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { EuiButtonEmpty, EuiText, EuiButtonIcon } from '@elastic/eui';
import { RouteComponentProps } from 'react-router-dom';
import moment from 'moment';
import {
  reactRouterNavigate,
  TableListView,
} from '../../../../../../src/plugins/opensearch_dashboards_react/public';
import { Routes } from '../../../../common';
import { useConfig } from '../../../contexts/date_format_context';

interface QuerySetTableProps {
  refreshKey: number;
  isLoading: boolean;
  findItems: (search: any) => Promise<{ total: number; hits: any[] }>;
  onDelete: (item: any) => void;
  history: RouteComponentProps['history'];
}

export const QuerySetTable: React.FC<QuerySetTableProps> = ({
  refreshKey,
  isLoading,
  findItems,
  onDelete,
  history,
}) => {
  const { dateFormat } = useConfig();

  const tableColumns = [
    {
      field: 'name',
      name: 'Name',
      dataType: 'string',
      sortable: true,
      render: (name: string, querySet: { id: string }) => (
        <EuiButtonEmpty
          size="xs"
          {...reactRouterNavigate(history, `${Routes.QuerySetViewPrefix}/${querySet.id}`)}
        >
          {name}
        </EuiButtonEmpty>
      ),
    },
    {
      field: 'sampling',
      name: 'Sampling Method',
      dataType: 'string',
      sortable: true,
      render: (sampling: string) => <EuiText size="s">{sampling}</EuiText>,
    },
    {
      field: 'description',
      name: 'Description',
      dataType: 'string',
      sortable: true,
      render: (description: string) => <EuiText size="s">{description}</EuiText>,
    },
    {
      field: 'numQueries',
      name: 'Query Set Size',
      dataType: 'string',
      width: '20%',
      sortable: true,
      render: (size: number) => <EuiText size="s">{size}</EuiText>,
    },
    {
      field: 'timestamp',
      name: 'Timestamp',
      dataType: 'string',
      sortable: true,
      render: (timestamp: string) => (
        <EuiText size="s">{moment(timestamp).format(dateFormat)}</EuiText>
      ),
    },
    {
      field: 'id',
      name: 'Actions',
      width: '10%',
      align: 'center',
      render: (id: string, item: any) => (
        <EuiButtonIcon
          aria-label="Delete"
          iconType="trash"
          color="danger"
          onClick={() => onDelete(item)}
        />
      ),
    },
  ];

  return (
    <TableListView
      key={refreshKey}
      headingId="querySetListingHeading"
      entityName="Query Set"
      entityNamePlural="Query Sets"
      tableColumns={tableColumns}
      findItems={findItems}
      loading={isLoading}
      pagination={{
        initialPageSize: 10,
        pageSizeOptions: [5, 10, 20, 50],
      }}
      initialPageSize={10}
      search={{
        box: {
          incremental: true,
          placeholder: 'Search query sets...',
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
