/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState } from 'react';

import { DocumentsIndex } from '../types/index';

export interface SearchRelevanceContextProps {
  documentsIndexes: DocumentsIndex[];
  setDocumentsIndexes: React.Dispatch<React.SetStateAction<DocumentsIndex[]>>;
  showFlyout: boolean;
  setShowFlyout: React.Dispatch<React.SetStateAction<boolean>>;
}

export const SearchRelevanceContext = createContext<SearchRelevanceContextProps | null>(null);

export const useSearchRelevanceContext = () => {
  const context = useContext(SearchRelevanceContext);

  if (!context) {
    throw Error('No Search Relevance context');
  }

  return context;
};

export const SearchRelevanceContextProvider = ({ children }: { children: React.ReactNode }) => {
  const [documentsIndexes, setDocumentsIndexes] = useState<DocumentsIndex[]>([]);
  const [showFlyout, setShowFlyout] = useState<boolean>(false);

  return (
    <SearchRelevanceContext.Provider
      value={{
        documentsIndexes,
        setDocumentsIndexes,
        showFlyout,
        setShowFlyout,
      }}
    >
      {children}
    </SearchRelevanceContext.Provider>
  );
};
