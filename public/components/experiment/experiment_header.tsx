import React from 'react';
import {
  EuiPageHeader,
  EuiButton,
  EuiFlexItem,
} from '@elastic/eui';
import { ExperimentHeaderProps } from './types';
import { withRouter } from 'react-router-dom';

export const ExperimentHeader_ = ({ onAddExperiment, history }: ExperimentHeaderProps) => (
  <EuiFlexItem>
    <EuiPageHeader
      pageTitle="Experiments"
      rightSideItems={[
        <EuiButton key="addQuerySet" fill size="s" onClick={() => { history.push('/querySet/create'); }}>
          + Add Query Set
        </EuiButton>,
        <EuiButton key="addSearchConfig" fill size="s" onClick={() => {}}>
          + Add Search Config
        </EuiButton>,
        <EuiButton key="addExperiment" fill size="s" onClick={onAddExperiment}>
          + Add Experiment
        </EuiButton>,
      ]}
    />
  </EuiFlexItem>
);

export const ExperimentHeader = withRouter(ExperimentHeader_);