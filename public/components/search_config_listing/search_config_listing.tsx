/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  EuiButtonEmpty,
} from '@elastic/eui';
import React from 'react';
import { TableListView, reactRouterNavigate } from '../../../../../src/plugins/opensearch_dashboards_react/public';
import { CoreStart } from '../../../../../src/core/public';
import { getSearchConfigurations } from '../../services';
import { withRouter, RouteComponentProps } from 'react-router-dom';


interface SearchConfigurationListingProps  extends RouteComponentProps {
  http: CoreStart['http'];
}

export const SearchConfigurationListing: React.FC<SearchConfigurationListingProps> = ({ http, history }) => {
  // Column definitions
  // TODO: extend the table columns by adding search_pipeline & search_template once they
  // are available
  const tableColumns = [
    {
      field: 'search_configuration_name',
      name: "Name",
      dataType: 'string',
      sortable: true,
      render: (
        name: string,
        searchConfiguration: {
          id: string;
        }
      ) => (
        <>
          <EuiButtonEmpty
            size="xs"
            {...reactRouterNavigate(history, `searchConfiguration/${searchConfiguration.id}`)}
          >
            {name}
          </EuiButtonEmpty>
        </>
      ),
    },
    {
      field: 'query_body',
      name: "Query DSL Body",
      dataType: 'string',
      sortable: false,
    },
    {
      field: 'timestamp',
      name: "Timestamp",
      dataType: 'string',
      sortable: true,
    },
  ];

  // TODO: extend mapping by adding search_pipeline & search_template once they
  // are available
  const mapSearchConfigurationFields = (obj: any) => {
    return {
      id: obj.id,
      search_configuration_name: obj.search_configuration_name,
      query_body: obj.query_body,
      timestamp: obj.timestamp,
    };
  };

  // Data fetching function
  const findSearchConfigurations = async (search: any) => {
    const response = await getSearchConfigurations(http);
    // TODO: how to report error
    const list = response ? JSON.parse(response.resp).map(mapSearchConfigurationFields) : [];
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
      headingId="searchConfigurationListingHeading"
      entityName="Search Configuration"
      entityNamePlural="Search Configurations"
      tableListTitle="Search Configurations"
      tableColumns={tableColumns}
      findItems={findSearchConfigurations}
    />
  );
};

export const SearchConfigurationListingWithRoute = withRouter(SearchConfigurationListing);

export default SearchConfigurationListingWithRoute;
