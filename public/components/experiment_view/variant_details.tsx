/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  EuiModal,
  EuiModalHeader,
  EuiModalHeaderTitle,
  EuiModalBody,
  EuiModalFooter,
  EuiButton,
  EuiFlexGroup,
  EuiFlexItem,
  EuiPanel,
  EuiText,
  EuiSpacer,
  EuiDescriptionList,
  EuiCodeBlock,
  EuiBadge,
  EuiIcon,
} from '@elastic/eui';

interface VariantDetailsModalProps {
  variantDetails: {
    parameters: {
      weights: number[];
      normalization: string;
      combination: string;
    };
  };
  onClose: () => void;
}

export const VariantDetailsModal: React.FC<VariantDetailsModalProps> = ({
  variantDetails,
  onClose,
}) => {
  const parameterItems = [
    {
      title: 'Weights',
      description: (
        <EuiCodeBlock language="json" paddingSize="s" isCopyable>
          {JSON.stringify(variantDetails.parameters.weights, null, 2)}
        </EuiCodeBlock>
      ),
    },
    {
      title: 'Normalization',
      description: <EuiBadge color="primary">{variantDetails.parameters.normalization}</EuiBadge>,
    },
    {
      title: 'Combination',
      description: <EuiBadge color="success">{variantDetails.parameters.combination}</EuiBadge>,
    },
  ];

  return (
    <EuiModal onClose={onClose} maxWidth={500}>
      <EuiModalHeader>
        <EuiModalHeaderTitle>
          <h2>
            <EuiIcon type="controlsHorizontal" /> Variant Parameters
          </h2>
        </EuiModalHeaderTitle>
      </EuiModalHeader>
      <EuiModalBody>
        <EuiPanel hasBorder paddingSize="m">
          <EuiDescriptionList type="column" listItems={parameterItems} compressed />
        </EuiPanel>
      </EuiModalBody>
      <EuiModalFooter>
        <EuiButton onClick={onClose} fill>
          Close
        </EuiButton>
      </EuiModalFooter>
    </EuiModal>
  );
};
