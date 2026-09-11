/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { EuiCodeBlock, EuiText } from '@elastic/eui';

/**
 * The LTR store writes a model definition either as a raw string (RankLib) or as embedded
 * JSON (linear, XGBoost), so the detail view has to render both without mangling either.
 * A string that happens to hold JSON is pretty-printed; anything else is shown verbatim.
 */
export const formatDefinition = (definition: any): { body: string; language: 'json' | 'text' } => {
  if (definition === null || definition === undefined) {
    return { body: '', language: 'text' };
  }

  if (typeof definition === 'string') {
    try {
      const parsed = JSON.parse(definition);
      if (parsed !== null && typeof parsed === 'object') {
        return { body: JSON.stringify(parsed, null, 2), language: 'json' };
      }
    } catch (e) {
      // Not JSON — a RankLib definition, which must be shown exactly as stored.
    }
    return { body: definition, language: 'text' };
  }

  return { body: JSON.stringify(definition, null, 2), language: 'json' };
};

interface LtrModelDefinitionProps {
  definition: any;
}

export const LtrModelDefinition: React.FC<LtrModelDefinitionProps> = ({ definition }) => {
  const { body, language } = formatDefinition(definition);

  if (!body) {
    return <EuiText size="s">This model has no stored definition.</EuiText>;
  }

  return (
    // No overflowHeight: the definition is the point of this view, so it is never truncated.
    <EuiCodeBlock
      language={language}
      fontSize="m"
      paddingSize="m"
      isCopyable={true}
      whiteSpace="pre"
      data-test-subj="ltrModelDefinition"
    >
      {body}
    </EuiCodeBlock>
  );
};
