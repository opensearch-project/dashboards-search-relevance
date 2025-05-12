/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import {
    EuiPageHeader,
    EuiPageTemplate,
  } from '@elastic/eui';
import React, { useCallback, useEffect, useState } from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { CoreStart } from '../../../../../src/core/public';
import { ServiceEndpoints } from '../../../common';
import {
  toExperiment,
} from '../../types/index';
import { PairwiseExperimentViewWithRouter } from './pairwise_experiment_view';

interface ExperimentViewProps extends RouteComponentProps<{ id: string }> {
  http: CoreStart['http'];
}

export const ExperimentView: React.FC<ExperimentViewProps> = ({ http, id, history }) => {
  const [experiment, setExperiment] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchExperiment = async () => {
      try {
        const _experiment = await http.get(ServiceEndpoints.Experiments + "/" + id).then(toExperiment)
        if (_experiment) {
          setExperiment(_experiment);
        } else {
          setError('No matching experiment found');
        }
      } catch (err) {
        setExperiment(null);
        setError('Error loading experiment data');
        console.error(err);
      } finally {
      }
    };

    fetchExperiment();
  }, [http, id]);

  return (
    <EuiPageTemplate paddingSize="l" restrictWidth="90%">
      <EuiPageHeader
        pageTitle="Experiment Visualization"
      />
      {experiment && experiment.type === "PAIRWISE_COMPARISON" &&
        <PairwiseExperimentViewWithRouter
          http={http}
          inputExperiment={experiment}
          history={history}
        />
      }
    </EuiPageTemplate>
  );

};

export const ExperimentViewWithRouter = withRouter(ExperimentView);

export default ExperimentViewWithRouter;
