/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { EuiFlexGroup, EuiFlexItem, EuiPageTemplate, EuiSpacer, EuiTitle } from '@elastic/eui';
import { Header } from '../common/header';
import { TemplateCards } from '../experiment_create/template_card/template_cards';
import { ResourceManagementTabsWithRoute } from './resource_management_tabs';
import { experiments, resultListComparisonExperiments } from './mockup_data';

export const ResourceManagementPage = ({
  entity,
  entityAction,
  entityId,
}: {
  entity: string;
  entityAction: string;
  entityId: string;
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
        <EuiFlexGroup direction="column" gutterSize="l">
          {/* Upper Panel - Resources Management */}
          <EuiFlexItem>
            <div style={{ marginBottom: '24px' }}>
              <EuiTitle size="s">
                <h2>Resources Management</h2>
              </EuiTitle>
              <EuiSpacer size="s" />
            </div>
          </EuiFlexItem>

          {/* Lower Panel - Main Content */}
          <EuiFlexItem>
            {isTemplateCards ? (
              <TemplateCards onClose={hideTemplate} />
            ) : (
              <ResourceManagementTabsWithRoute
                experiments={experiments}
                resultListComparisonExperiments={resultListComparisonExperiments}
                entity={entity}
                entityAction={entityAction}
                entityId={entityId}
              />
            )}
          </EuiFlexItem>
        </EuiFlexGroup>
      </EuiPageTemplate>
    </>
  );
};
