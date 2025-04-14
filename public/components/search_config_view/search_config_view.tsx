/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { CoreStart } from '../../../../../src/core/public';
import { ServiceEndpoints } from '../../../common';


interface SearchConfigurationViewProps extends RouteComponentProps<{ id: string }> {
  http: CoreStart['http'];
}

export const SearchConfigurationView: React.FC<SearchConfigurationViewProps> = ({ match, http }) => {
  const [searchConfiguration, setSearchConfiguration] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSearchConfiguration = async () => {
      try {
        setLoading( true);
        const response = await http.get(ServiceEndpoints.SearchConfigurations);
        const list = response ? response.hits.hits.map((hit: any) => ({...hit._source})) : [];
        const filteredList = list.filter((item: any) => item.id === match.params.id);

        if (filteredList.length > 0) {
          setSearchConfiguration(filteredList[0]);
        } else {
          setError('No matching search configuration found');
        }
      } catch (err) {
        setError('Error loading search configuration data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchSearchConfiguration();
  }, [http, match.params.id]);

  if (loading) {
    return <div>Loading search configuration data...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <>
      <h1>Search Configuration Visualization</h1>
      <pre>{JSON.stringify(searchConfiguration, null, 2)}</pre>
    </>
  );
};

export default SearchConfigurationView;
