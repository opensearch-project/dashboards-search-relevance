/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  EuiBadge,
  EuiCallOut,
  EuiDescriptionList,
  EuiDescriptionListDescription,
  EuiDescriptionListTitle,
  EuiLoadingSpinner,
  EuiPageHeader,
  EuiPageTemplate,
  EuiPanel,
  EuiSpacer,
  EuiTitle,
} from '@elastic/eui';
import { CoreStart } from '../../../../../../src/core/public';
import { LtrFeatureTable } from '../components/ltr_feature_table';
import { LtrModelDefinition } from '../components/ltr_model_definition';
import { shortModelType } from '../components/ltr_model_table';
import { useLtrModelView } from '../hooks/use_ltr_model_view';
import { LTR_UNAVAILABLE_COPY } from '../unavailable_copy';

interface LtrModelViewProps {
  http: CoreStart['http'];
  id: string;
}

export const LtrModelView: React.FC<LtrModelViewProps> = ({ http, id }) => {
  const { model, isLoading, error, notFound, unavailableReason } = useLtrModelView(http, id);

  const renderBody = () => {
    if (isLoading) {
      return <EuiLoadingSpinner size="xl" data-test-subj="ltrModelViewLoading" />;
    }

    if (notFound) {
      return (
        <EuiCallOut title="Model not found" color="warning" iconType="alert">
          <p>
            No model named <strong>{id}</strong> exists in the feature store. It may have been
            deleted.
          </p>
        </EuiCallOut>
      );
    }

    if (unavailableReason) {
      const { title, body } = LTR_UNAVAILABLE_COPY[unavailableReason];
      return (
        <EuiCallOut title={title} color="primary" iconType="iInCircle">
          <p>{body}</p>
        </EuiCallOut>
      );
    }

    if (error || !model) {
      return (
        <EuiCallOut title="Error" color="danger">
          <p>{error || 'Failed to load the model.'}</p>
        </EuiCallOut>
      );
    }

    return (
      <>
        <EuiPanel>
          <EuiDescriptionList type="column" compressed>
            <EuiDescriptionListTitle>Feature Set</EuiDescriptionListTitle>
            <EuiDescriptionListDescription>
              {model.featureSetName || <>&mdash;</>}
            </EuiDescriptionListDescription>

            <EuiDescriptionListTitle>Model Type</EuiDescriptionListTitle>
            <EuiDescriptionListDescription>
              {model.modelType ? (
                <EuiBadge color="hollow">{shortModelType(model.modelType)}</EuiBadge>
              ) : (
                <>&mdash;</>
              )}
            </EuiDescriptionListDescription>

            <EuiDescriptionListTitle>Features</EuiDescriptionListTitle>
            <EuiDescriptionListDescription>{model.featureCount}</EuiDescriptionListDescription>
          </EuiDescriptionList>
        </EuiPanel>

        <EuiSpacer size="l" />

        <EuiPanel>
          <EuiTitle size="s">
            <h2>Feature Set</h2>
          </EuiTitle>
          <EuiSpacer size="m" />
          <LtrFeatureTable features={model.features} />
        </EuiPanel>

        <EuiSpacer size="l" />

        <EuiPanel>
          <EuiTitle size="s">
            <h2>Model Definition</h2>
          </EuiTitle>
          <EuiSpacer size="m" />
          <LtrModelDefinition definition={model.definition} />
        </EuiPanel>
      </>
    );
  };

  return (
    <EuiPageTemplate paddingSize="l" restrictWidth="100%">
      <EuiPageHeader
        pageTitle={id}
        description="A Learning to Rank model stored in this cluster's feature store."
      />
      {renderBody()}
    </EuiPageTemplate>
  );
};
