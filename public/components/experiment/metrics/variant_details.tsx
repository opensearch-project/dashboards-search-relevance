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
  EuiPanel,
  EuiSpacer,
  EuiDescriptionList,
  EuiCodeBlock,
  EuiBadge,
  EuiIcon,
} from '@elastic/eui';

interface VariantDetailsModalProps {
  variantDetails: {
    parameters: {
      combination: string;
      weights?: number[];
      normalization?: string;
      rank_constant?: number;
    };
  };
  onClose: () => void;
}

export const VariantDetailsModal: React.FC<VariantDetailsModalProps> = ({
  variantDetails,
  onClose,
}) => {
  const { combination, normalization, weights, rank_constant } = variantDetails.parameters;
  const isRrf = combination === 'rrf';

  const parameterItems = [
    {
      title: 'Combination',
      description: <EuiBadge color="success">{combination}</EuiBadge>,
    },
    ...(isRrf
      ? [
          {
            title: 'Rank constant',
            description: <EuiBadge color="primary">{String(rank_constant ?? 'N/A')}</EuiBadge>,
          },
        ]
      : [
          {
            title: 'Normalization',
            description: <EuiBadge color="primary">{normalization}</EuiBadge>,
          },
          {
            title: 'Weights',
            description: (
              <EuiCodeBlock language="json" paddingSize="s" isCopyable>
                {JSON.stringify(weights, null, 2)}
              </EuiCodeBlock>
            ),
          },
        ]),
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
