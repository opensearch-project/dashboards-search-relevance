import React from 'react';
import {
  EuiPageHeader,
  EuiButton,
  EuiFlexItem,
} from '@elastic/eui';
import { ExperimentHeaderProps } from './types';

export const ExperimentHeader = ({ onAddExperiment }: ExperimentHeaderProps) => (
  <EuiFlexItem>
    <EuiPageHeader
      pageTitle="Experiments"
      rightSideItems={[
        <EuiButton key="addQuerySet" fill size="s" onClick={() => {}}>
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
