/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState } from 'react';

import { DocumentsIndex, SearchResults, SelectedIndex } from '../types/index';
import { getDocumentRank, DocumentRank } from './utils';

interface UpdateSelectedIndex {
  indexNumber: 'index1' | 'index2';
  indexName: string;
}

export interface SearchRelevanceContextProps {
  documentsIndexes: DocumentsIndex[];
  setDocumentsIndexes: React.Dispatch<React.SetStateAction<DocumentsIndex[]>>;
  showFlyout: boolean;
  setShowFlyout: React.Dispatch<React.SetStateAction<boolean>>;
  comparedResult1: DocumentRank;
  updateComparedResult1: (result: SearchResults) => void;
  comparedResult2: DocumentRank;
  updateComparedResult2: (result: SearchResults) => void;
  selectedIndex: SelectedIndex;
  updateSelectedIndex: (args: UpdateSelectedIndex) => void;
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
  const [comparedResult1, setComparedResult1] = useState<DocumentRank>({});
  const [comparedResult2, setComparedResult2] = useState<DocumentRank>({});
  const [selectedIndex, setSelectedIndex] = useState<SelectedIndex>({
    index1: '',
    index2: '',
  });

  const updateComparedResult1 = (result: SearchResults) => {
    setComparedResult1(getDocumentRank(result.hits.hits));
  };

  const updateComparedResult2 = (result: SearchResults) => {
    setComparedResult2(getDocumentRank(result.hits.hits));
  };

  const updateSelectedIndex = ({ indexNumber, indexName }: UpdateSelectedIndex) => {
    setSelectedIndex({
      ...selectedIndex,
      [indexNumber]: indexName,
    });
  };

  return (
    <SearchRelevanceContext.Provider
      value={{
        documentsIndexes,
        setDocumentsIndexes,
        showFlyout,
        setShowFlyout,
        comparedResult1,
        updateComparedResult1,
        comparedResult2,
        updateComparedResult2,
        selectedIndex,
        updateSelectedIndex,
      }}
    >
      {children}
    </SearchRelevanceContext.Provider>
  );
};
