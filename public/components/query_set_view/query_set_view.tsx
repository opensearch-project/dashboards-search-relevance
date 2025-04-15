/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { CoreStart } from '../../../../../src/core/public';
import { ServiceEndpoints } from '../../../common';


interface QuerySetViewProps extends RouteComponentProps<{ id: string }> {
  http: CoreStart['http'];
}

export const QuerySetView: React.FC<QuerySetViewProps> = ({ match, http }) => {
  const [querySet, setQuerySet] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchQuerySet = async () => {
      try {
        setLoading( true);
        const response = await http.get(ServiceEndpoints.QuerySets);
        const list = response ? response.hits.hits.map((hit: any) => ({...hit._source})) : [];
        const filteredList = list.filter((item) => item.id === match.params.id);
        
        if (filteredList.length > 0) {
          setQuerySet(filteredList[0]);
        } else {
          setError('No matching query set found');
        }
      } catch (err) {
        setError('Error loading query set data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchQuerySet();
  }, [http, match.params.id]);

  if (loading) {
    return <div>Loading query set data...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <>
      <h1>Query Set Visualization</h1>
      <pre>{JSON.stringify(querySet, null, 2)}</pre>
    </>
  );
};

export default QuerySetView;
