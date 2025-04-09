/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { getQuerySets } from '../../services';
import { CoreStart } from '../../../../../src/core/public';

interface QuerySet {
  id: string;
  [key: string]: any; // Add more specific properties as needed
}

interface QuerySetViewProps extends RouteComponentProps<{ id: string }> {
  http: CoreStart['http'];
}

export const QuerySetView: React.FC<QuerySetViewProps> = ({ match, http }) => {
  const [querySet, setQuerySet] = useState<QuerySet | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchQuerySet = async () => {
      try {
        setLoading( true);
        const response = await getQuerySets(http);
        const list = response ? JSON.parse(response.resp) : [];
        const filteredList = list.filter((item: QuerySet) => item.id === match.params.id);
        
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
