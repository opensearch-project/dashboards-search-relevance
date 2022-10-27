/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { Document } from '../types/index';

export interface DocumentRank {
  [documentId: string]: number;
}

export interface DocumentsComparison {
  result1: DocumentRank;
  result2: DocumentRank;
}

export const getDocumentRank = (documents: Document[]): DocumentRank => {
  return documents.reduce((result, currentDocument, currentIndex: number) => {
    return {
      ...result,
      [currentDocument._id]: currentIndex + 1,
    };
  }, {});
};
