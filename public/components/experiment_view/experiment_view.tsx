/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { CoreStart } from '../../../../../src/core/public';
import { ServiceEndpoints } from '../../../common';

interface ExperimentViewProps extends RouteComponentProps<{ id: string }> {
  http: CoreStart['http'];
}

export const ExperimentView: React.FC<ExperimentViewProps> = ({ http, id }) => {
  const [experiment, setExperiment] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchExperiment = async () => {
      try {
        setLoading(true);
        const response = await http.get(ServiceEndpoints.Experiments);
        const list = response ? response.hits.hits.map((hit: any) => ({ ...hit._source })) : [];
        const filteredList = list.filter((item) => item.id === id);

        if (filteredList.length > 0) {
          setExperiment(filteredList[0]);
        } else {
          setError('No matching experiment found');
        }
      } catch (err) {
        setError('Error loading experiment data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchExperiment();
  }, [http, id]);

  if (loading) {
    return <div>Loading experiment data...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <>
      <h1>Experiment Visualization</h1>
      <pre>{JSON.stringify(experiment, null, 2)}</pre>
    </>
  );
};

export default ExperimentView;
