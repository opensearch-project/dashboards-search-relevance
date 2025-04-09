/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { TableListView } from '../../../../../src/plugins/opensearch_dashboards_react/public';
import { CoreStart } from '../../../../../src/core/public';
import { getQuerySets } from '../../services';

interface QuerySetListingProps {
  http: CoreStart['http'];
}

export const QuerySetListing: React.FC<QuerySetListingProps> = ({ http }) => {
  // Column definitions
  const tableColumns = [
    {
      field: 'name',
      name: "Name",
      dataType: 'string',
      sortable: true,
    },
    {
      field: 'description',
      name: "Description",
      dataType: 'string',
      sortable: true,
    },
    {
      field: 'sampling',
      name: "Sampling",
      dataType: 'string',
      sortable: true,
    },
    {
      field: 'timestamp',
      name: "Timestamp",
      dataType: 'string',
      sortable: true,
    },
  ];

  // Data fetching function
  const findQuerySets = async (search: any) => {
    const response = await getQuerySets(http);
    // TODO: how to report error
    const list = response ? JSON.parse(response.resp) : [];
    // Filtering functionality could be implemented here
    // if (search) {
    //   list.filter((item) => item.name.includes(search));
    // }
    return {
      total: list.length,
      hits: list,
    };
  };

  return (
    <TableListView
      headingId="querySetListingHeading"
      entityName="Query Set"
      entityNamePlural="Query Sets"
      tableListTitle="Query Sets"
      tableColumns={tableColumns}
      findItems={findQuerySets}
    />
  );
};

export default QuerySetListing;