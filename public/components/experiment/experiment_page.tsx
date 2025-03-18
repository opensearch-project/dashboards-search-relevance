import React, { useState } from 'react';
import {
  EuiFlexGroup,
  EuiPanel,
  EuiFlexItem,
  EuiSpacer,
} from '@elastic/eui';
import { GetStartedAccordion } from './get_started_accordion';
import { ExperimentPageProps } from './types';
import { Header } from '../common/header';
import { ExperimentHeader } from "./experiment_header";
import { TemplateCards } from "./template_card/template_cards";
import { ExperimentTabs } from "./experiment_tabs";
import { experiments, pairwiseExperiments, querySets, searchConfigurations } from "./mockup_data";

export const ExperimentPage = ({ chrome, application }: ExperimentPageProps) => {
  const [isTemplateCards, setIsTemplateCards] = useState(false);
  const showTemplate = () => setIsTemplateCards(true);
  const hideTemplate = () => setIsTemplateCards(false);

  return (
    <>
      <Header />
      <EuiFlexGroup>
        <EuiPanel paddingSize="l" hasBorder={true} hasShadow={false} grow={true}>
          <ExperimentHeader onAddExperiment={showTemplate} />
          <EuiFlexItem>
            <EuiSpacer size="m" />
            <GetStartedAccordion />
            <EuiSpacer size="m" />
          </EuiFlexItem>
          <EuiFlexItem>
            {isTemplateCards ? (
              <TemplateCards onClose={hideTemplate}/>
            ) : (
              <ExperimentTabs
                experiments={experiments}
                pairwiseExperiments={pairwiseExperiments}
                searchConfigurations={searchConfigurations}
                querySets={querySets}
              />
            )}
          </EuiFlexItem>
        </EuiPanel>
      </EuiFlexGroup>
    </>
  );
};
