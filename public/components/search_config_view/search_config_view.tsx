/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { CoreStart } from '../../../../../src/core/public';
import { ServiceEndpoints } from '../../../common';
import { SearchConfigurationViewPane } from '../search_config_create/search_configuration_view_pane';
import {
  EuiPageTemplate,
  EuiPageHeader,
  EuiPanel,
  EuiSpacer,
} from '@elastic/eui';

interface SearchConfigurationViewProps extends RouteComponentProps<{ id: string }> {
  http: CoreStart['http'];
}

export const SearchConfigurationView: React.FC<SearchConfigurationViewProps> = ({
  http,
  id,
}) => {
  const [searchConfiguration, setSearchConfiguration] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSearchConfiguration = async () => {
      try {
        setLoading(true);
        const response = await http.get(ServiceEndpoints.SearchConfigurations);
        const list = response ? response.hits.hits.map((hit: any) => ({ ...hit._source })) : [];
        const filteredList = list.filter((item: any) => item.id === id);

        if (filteredList.length > 0) {
          setSearchConfiguration(filteredList[0]);
        } else {
          setError('No matching search configuration found');
        }
      } catch (err) {
        setError('Error loading search configuration data');
        // eslint-disable-next-line no-console
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchSearchConfiguration();
  }, [http, id]);

  if (loading) {
    return <div>Loading search configuration data...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <EuiPageTemplate paddingSize="l" restrictWidth="100%">
      <EuiPageHeader
        pageTitle="Search Configuration Details"
        description="View the details of your search configuration"
      />
      <EuiSpacer size="l" />
      <EuiPanel hasBorder={true}>
        <SearchConfigurationViewPane
          name={searchConfiguration.name}
          queryBody={searchConfiguration.queryBody}
          index={searchConfiguration.index}
          pipeline={searchConfiguration.pipeline}
          template={searchConfiguration.template}
        />
      </EuiPanel>
    </EuiPageTemplate>
  );
};

export default SearchConfigurationView;
