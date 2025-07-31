/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { CoreStart } from '../../../../../../src/core/public';
import { ServiceEndpoints } from '../../../../common';

export interface SearchConfigurationData {
  id: string;
  name: string;
  index: string;
  query: string;
  searchPipeline?: string;
  template?: string;
  timestamp: string;
}

export const useSearchConfigurationView = (http: CoreStart['http'], id: string) => {
  const [searchConfiguration, setSearchConfiguration] = useState<SearchConfigurationData | null>(
    null
  );
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSearchConfiguration = async () => {
      try {
        setLoading(true);
        const response = await http.get(`${ServiceEndpoints.SearchConfigurations}/${id}`);

        if (response && response.hits && response.hits.hits && response.hits.hits.length > 0) {
          setSearchConfiguration(response.hits.hits[0]._source);
        } else {
          setError('No matching search configuration found');
        }
      } catch (err) {
        console.error('Failed to load search config', err);
        setError('Error loading search configuration data');
      } finally {
        setLoading(false);
      }
    };

    fetchSearchConfiguration();
  }, [http, id]);

  const formatJson = (json: string) => {
    try {
      return JSON.stringify(JSON.parse(json), null, 2);
    } catch {
      return json;
    }
  };

  return {
    searchConfiguration,
    loading,
    error,
    formatJson,
  };
};
