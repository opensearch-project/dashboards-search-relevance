/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { getSearchConfigurations } from '../../services';
import { CoreStart } from '../../../../../src/core/public';

interface SearchConfiguration {
  id: string;
  [key: string]: any; // Add more specific properties as needed
}

interface SearchConfigurationViewProps extends RouteComponentProps<{ id: string }> {
  http: CoreStart['http'];
}

export const SearchConfigurationView: React.FC<SearchConfigurationViewProps> = ({ match, http }) => {
  const [SearchConfiguration, setSearchConfiguration] = useState<SearchConfiguration | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSearchConfiguration = async () => {
      try {
        setLoading( true);
        const response = await getSearchConfigurations(http);
        const list = response ? JSON.parse(response.resp) : [];
        const filteredList = list.filter((item: SearchConfiguration) => item.id === match.params.id);

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
      <pre>{JSON.stringify(SearchConfiguration, null, 2)}</pre>
    </>
  );
};

export default SearchConfigurationView;
