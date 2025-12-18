/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { EuiPageHeader, EuiPageTemplate } from '@elastic/eui';
import React, { useCallback, useEffect, useState } from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { CoreStart, ToastsStart } from '../../../../../../src/core/public';
import { ExperimentType, toExperiment } from '../../../types/index';
import { ExperimentService } from '../services/experiment_service';
import { PairwiseExperimentViewWithRouter } from './pairwise_experiment_view';
import { EvaluationExperimentViewWithRouter } from './evaluation_experiment_view';
import { HybridOptimizerExperimentViewWithRouter } from './hybrid_optimizer_experiment_view';
import { parseDataSourceIdFromUrl } from '../../common/datasource_utils';

interface ExperimentViewProps extends RouteComponentProps<{ entityId: string }> {
  http: CoreStart['http'];
  notifications: CoreStart['notifications'];
  id?: string;
  dataSourceId?: string | null;
}

export const ExperimentView: React.FC<ExperimentViewProps> = ({
  http,
  notifications,
  match,
  location,
  history,
  id: propId,
  dataSourceId: propDataSourceId,
}) => {
  const [experiment, setExperiment] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const experimentService = new ExperimentService(http);
  
  // Use prop id if provided, otherwise fall back to match.params.entityId
  const id = propId || match.params.entityId;
  // Use prop dataSourceId if provided (and not null), otherwise parse from location
  const dataSourceId = (propDataSourceId !== undefined && propDataSourceId !== null) ? propDataSourceId : parseDataSourceIdFromUrl(location);

  useEffect(() => {
    const fetchExperiment = async () => {
      console.log('fetchExperiment called with:', { id, dataSourceId });
      
      try {
        let response;
        try {
          response = await experimentService.getExperiment(id, dataSourceId || undefined);
          console.log('getExperiment response:', response);
        } catch (err) {
          // Fallback: try without dataSourceId if backend doesn't support it
          if (dataSourceId) {
            console.warn('Failed to fetch experiment with dataSourceId, trying without it:', err);
            response = await experimentService.getExperiment(id);
          } else {
            throw err;
          }
        }
        
        console.log('Processing response:', { 
          hasResponse: !!response,
          hasHits: !!response?.hits,
          hitsLength: response?.hits?.hits?.length,
          firstHit: response?.hits?.hits?.[0]
        });
        
        const source = response?.hits?.hits?.[0]?._source;
        if (source) {
          console.log('Found source data:', source);
          const parsedExperiment = toExperiment(source);
          console.log('Parsed experiment result:', parsedExperiment);
          
          if (parsedExperiment.success) {
            setExperiment(parsedExperiment.data);
          } else {
            console.error('Failed to parse experiment:', parsedExperiment.errors);
            setError('Invalid experiment data format');
          }
        } else {
          console.error('No source data found in response');
          setError('No matching experiment found');
        }
      } catch (err) {
        console.error('Failed to fetch experiment', err);
        setExperiment(null);
        setError('Error loading experiment data');
      }
    };

    fetchExperiment();
  }, [http, id, dataSourceId]);

  return (
    <EuiPageTemplate paddingSize="l" restrictWidth="90%">
      <EuiPageHeader pageTitle="Experiment Details" />
      {experiment && experiment.type === ExperimentType.PAIRWISE_COMPARISON && (
        <PairwiseExperimentViewWithRouter
          http={http}
          notifications={notifications}
          inputExperiment={experiment}
          history={history}
          dataSourceId={dataSourceId}
        />
      )}
      {experiment && experiment.type === ExperimentType.POINTWISE_EVALUATION && (
        <EvaluationExperimentViewWithRouter
          http={http}
          notifications={notifications}
          inputExperiment={experiment}
          history={history}
          dataSourceId={dataSourceId}
        />
      )}
      {experiment && experiment.type === ExperimentType.HYBRID_OPTIMIZER && (
        <HybridOptimizerExperimentViewWithRouter
          http={http}
          notifications={notifications}
          inputExperiment={experiment}
          history={history}
          dataSourceId={dataSourceId}
        />
      )}
    </EuiPageTemplate>
  );
};

export const ExperimentViewWithRouter = withRouter(ExperimentView);

export default ExperimentViewWithRouter;
