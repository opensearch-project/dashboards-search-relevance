/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  EuiButton,
  EuiCallOut,
  EuiFlexItem,
  EuiPageHeader,
  EuiPageTemplate,
  EuiSpacer,
} from '@elastic/eui';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { CoreStart } from '../../../../../../src/core/public';
import { LTR_MODEL_FETCH_SIZE, Routes } from '../../../../common';
import { LtrModelTable } from '../components/ltr_model_table';
import { useLtrModelList } from '../hooks/use_ltr_model_list';
import { LTR_UNAVAILABLE_COPY } from '../unavailable_copy';

interface LtrModelListingProps extends RouteComponentProps {
  http: CoreStart['http'];
}

export const LtrModelListing: React.FC<LtrModelListingProps> = ({ http, history }) => {
  const { isLoading, error, unavailableReason, truncatedTotal, findLtrModels } = useLtrModelList(
    http
  );

  const renderBody = () => {
    if (error) {
      return (
        <EuiCallOut title="Error" color="danger">
          <p>{error}</p>
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

    return (
      <>
        {truncatedTotal !== null && (
          <>
            <EuiCallOut title="Showing part of the registry" color="warning" iconType="alert">
              <p>
                This store holds {truncatedTotal} models. Showing the first {LTR_MODEL_FETCH_SIZE}.
              </p>
            </EuiCallOut>
            <EuiSpacer size="m" />
          </>
        )}
        <LtrModelTable isLoading={isLoading} findItems={findLtrModels} history={history} />
      </>
    );
  };

  return (
    <EuiPageTemplate paddingSize="l" restrictWidth="100%">
      <EuiPageHeader
        pageTitle="LTR Models"
        description="Learning to Rank models stored in this cluster's feature store."
        // Hidden when the registry itself is unavailable: with no reachable store there is
        // nothing to upload into.
        rightSideItems={
          unavailableReason
            ? []
            : [
                <EuiButton
                  onClick={() => history.push(Routes.LtrModelCreate)}
                  fill
                  size="s"
                  iconType="plusInCircle"
                  color="primary"
                  data-test-subj="createLtrModelButton"
                >
                  Upload Model
                </EuiButton>,
              ]
        }
      />
      <EuiFlexItem>{renderBody()}</EuiFlexItem>
    </EuiPageTemplate>
  );
};

export const LtrModelListingWithRoute = withRouter(LtrModelListing);
