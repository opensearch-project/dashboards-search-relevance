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
import { withRouter, RouteComponentProps } from 'react-router-dom';
import { ServiceEndpoints } from '../../../common';


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
      id: obj._source.id,
      search_configuration_name: obj._source.name,
      query_body: obj._source.queryBody,
      timestamp: obj._source.timestamp,
    };
  };

  // Data fetching function
  const findSearchConfigurations = async (search: any) => {
    const response = await http.get(ServiceEndpoints.SearchConfigurations);
    const list = response ? response.hits.hits.map(mapSearchConfigurationFields) : [];
    // TODO: too many reissued requests on search
    const filteredList = search ? list.filter((item) => item.name.includes(search)) : list;
    return {
      total: filteredList.length,
      hits: filteredList,
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
