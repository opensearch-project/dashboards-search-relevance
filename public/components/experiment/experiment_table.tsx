import React from 'react';
import {
  EuiInMemoryTable,
  EuiBasicTableColumn,
  EuiLink,
} from '@elastic/eui';
import { ExperimentTableProps, TableContent } from './types';

const columns: Array<EuiBasicTableColumn<TableContent>> = [
  {
    field: 'name',
    name: 'Name',
    sortable: true,
    truncateText: false,
    render: (name: TableContent['name']) => (
      <EuiLink href="#" target="_blank">
        {name}
      </EuiLink>
    ),
  },
  {
    field: 'type',
    name: 'Type',
    truncateText: false,
  },
  {
    field: 'last_updated',
    name: 'Last Updated',
    truncateText: false,
  },
  {
    field: 'description',
    name: 'Description',
    truncateText: false,
  },
];

const pagination = {
  initialPageSize: 5,
  pageSizeOptions: [5, 10],
};

export const ExperimentTable = ({ items }: ExperimentTableProps) => (
  <EuiInMemoryTable
    width={'100%'}
    items={items}
    columns={columns}
    pagination={pagination}
    sorting={true}
    tableLayout="auto"
  />
);
