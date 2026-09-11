/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { EuiBadge, EuiButtonEmpty, EuiText } from '@elastic/eui';
import { RouteComponentProps } from 'react-router-dom';
import {
  reactRouterNavigate,
  TableListView,
} from '../../../../../../src/plugins/opensearch_dashboards_react/public';
import { Routes } from '../../../../common';
import { LtrModelListItem } from '../types';

interface LtrModelTableProps {
  isLoading: boolean;
  findItems: (search: any) => Promise<{ total: number; hits: LtrModelListItem[] }>;
  history: RouteComponentProps['history'];
}

/** `model/xgboost+json` reads better in a table as `xgboost+json`. */
export const shortModelType = (modelType: string): string =>
  modelType?.startsWith('model/') ? modelType.slice('model/'.length) : modelType;

export const LtrModelTable: React.FC<LtrModelTableProps> = ({ isLoading, findItems, history }) => {
  const tableColumns = [
    {
      field: 'name',
      name: 'Name',
      dataType: 'string',
      sortable: true,
      // Model names are unique per store, so the name is the detail view's identifier.
      render: (name: string) => (
        <EuiButtonEmpty
          size="xs"
          {...reactRouterNavigate(
            history,
            `${Routes.LtrModelViewPrefix}/${encodeURIComponent(name)}`
          )}
        >
          {name}
        </EuiButtonEmpty>
      ),
    },
    {
      field: 'featureSetName',
      name: 'Feature Set',
      dataType: 'string',
      sortable: true,
      render: (featureSetName: string) => <EuiText size="s">{featureSetName}</EuiText>,
    },
    {
      field: 'modelType',
      name: 'Type',
      dataType: 'string',
      sortable: true,
      render: (modelType: string) =>
        modelType ? <EuiBadge color="hollow">{shortModelType(modelType)}</EuiBadge> : null,
    },
    {
      field: 'featureCount',
      name: 'Features',
      dataType: 'number',
      width: '15%',
      sortable: true,
      render: (featureCount: number) => <EuiText size="s">{featureCount}</EuiText>,
    },
  ];

  return (
    <TableListView
      headingId="ltrModelListingHeading"
      entityName="Model"
      entityNamePlural="Models"
      tableColumns={tableColumns}
      findItems={findItems}
      loading={isLoading}
      initialPageSize={10}
      search={{
        box: {
          incremental: true,
          placeholder: 'Search models...',
          schema: true,
        },
      }}
      sorting={{
        sort: {
          field: 'name',
          direction: 'asc',
        },
      }}
    />
  );
};
