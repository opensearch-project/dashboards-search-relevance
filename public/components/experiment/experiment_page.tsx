import React, { useState } from 'react';
import {
  EuiFlexGroup,
  EuiFlexItem,
  EuiPageTemplate,
  EuiPanel,
  EuiSpacer,
  EuiTitle,
} from '@elastic/eui';
import { GetStartedAccordion } from './get_started_accordion';
import { Header } from '../common/header';
import { TemplateCards } from './template_card/template_cards';
import { ExperimentTabsWithRoute } from './experiment_tabs';
import { experiments, resultListComparisonExperiments } from './mockup_data';

export const ExperimentPage = ({
  application,
  chrome,
  http,
  notifications,
  entity,
  entityAction,
  entityId,
}: {
  application: CoreStart['application'];
  chrome: CoreStart['chrome'];
  http: CoreStart['http'];
  notifications: CoreStart['notifications'];
}) => {
  const [isTemplateCards, setIsTemplateCards] = useState(false);
  const showTemplate = () => setIsTemplateCards(true);
  const hideTemplate = () => setIsTemplateCards(false);

  return (
    <>
      <Header />
      {/* Main Content */}
      <EuiPageTemplate paddingSize="l" restrictWidth={false}>
        {/* Content Panel */}
        <EuiPanel paddingSize="l" hasBorder={true}>
          <EuiFlexGroup direction="column" gutterSize="l">
            {/* Left Panel - Resources Management */}
            <EuiFlexItem>
              <div style={{ marginBottom: '24px' }}>
                <EuiTitle size="s">
                  <h2>Resources Management</h2>
                </EuiTitle>
                <EuiSpacer size="s" />
                <GetStartedAccordion />
              </div>
            </EuiFlexItem>

            {/* Right Panel - Main Content */}
            <EuiFlexItem>
              {isTemplateCards ? (
                <TemplateCards onClose={hideTemplate} />
              ) : (
                <ExperimentTabsWithRoute
                  experiments={experiments}
                  resultListComparisonExperiments={resultListComparisonExperiments}
                  http={http}
                  notifications={notifications}
                  entity={entity}
                  entityAction={entityAction}
                  entityId={entityId}
                />
              )}
            </EuiFlexItem>
          </EuiFlexGroup>
        </EuiPanel>
      </EuiPageTemplate>
    </>
  );
};
