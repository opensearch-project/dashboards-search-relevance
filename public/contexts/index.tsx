/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState } from 'react';

import { DocumentsIndex, SearchResults, QueryError } from '../types/index';
import { getDocumentRank, DocumentRank } from './utils';

export const initialQueryErrorState: QueryError = {
  selectIndex: '',
  queryString: '',
};

export interface SearchRelevanceContextProps {
  documentsIndexes: DocumentsIndex[];
  setDocumentsIndexes: React.Dispatch<React.SetStateAction<DocumentsIndex[]>>;
  searchPipelines: string[];
  setSearchPipelines: React.Dispatch<React.SetStateAction<string[]>>;
  showFlyout: boolean;
  setShowFlyout: React.Dispatch<React.SetStateAction<boolean>>;
  comparedResult1: DocumentRank;
  updateComparedResult1: (result: SearchResults) => void;
  comparedResult2: DocumentRank;
  updateComparedResult2: (result: SearchResults) => void;
  selectedIndex1: string;
  setSelectedIndex1: React.Dispatch<React.SetStateAction<string>>;
  selectedIndex2: string;
  setSelectedIndex2: React.Dispatch<React.SetStateAction<string>>;
  selectedSearchPipeline1: string;
  setSelectedSearchPipeline1: React.Dispatch<React.SetStateAction<string>>;
  selectedSearchPipeline2: string;
  setSelectedSearchPipeline2: React.Dispatch<React.SetStateAction<string>>;
  queryError1: QueryError;
  setQueryError1: React.Dispatch<React.SetStateAction<QueryError>>;
  queryError2: QueryError;
  setQueryError2: React.Dispatch<React.SetStateAction<QueryError>>;
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
  const [searchPipelines, setSearchPipelines] = useState<string[]>([]);
  const [showFlyout, setShowFlyout] = useState(false);
  const [comparedResult1, setComparedResult1] = useState<DocumentRank>({});
  const [comparedResult2, setComparedResult2] = useState<DocumentRank>({});
  const [selectedIndex1, setSelectedIndex1] = useState('');
  const [selectedIndex2, setSelectedIndex2] = useState('');
  const [selectedSearchPipeline1, setSelectedSearchPipeline1] = useState('');
  const [selectedSearchPipeline2, setSelectedSearchPipeline2] = useState('');
  const [queryError1, setQueryError1] = useState<QueryError>(initialQueryErrorState);
  const [queryError2, setQueryError2] = useState<QueryError>(initialQueryErrorState);

  const updateComparedResult1 = (result: SearchResults) => {
    setComparedResult1(getDocumentRank(result?.hits?.hits));
  };

  const updateComparedResult2 = (result: SearchResults) => {
    setComparedResult2(getDocumentRank(result?.hits?.hits));
  };

  return (
    <SearchRelevanceContext.Provider
      value={{
        documentsIndexes,
        setDocumentsIndexes,
        searchPipelines,
        setSearchPipelines,
        showFlyout,
        setShowFlyout,
        comparedResult1,
        updateComparedResult1,
        comparedResult2,
        updateComparedResult2,
        selectedIndex1,
        setSelectedIndex1,
        selectedIndex2,
        setSelectedIndex2,
        selectedSearchPipeline1,
        setSelectedSearchPipeline1,
        selectedSearchPipeline2,
        setSelectedSearchPipeline2,
        queryError1,
        setQueryError1,
        queryError2,
        setQueryError2,
      }}
    >
      {children}
    </SearchRelevanceContext.Provider>
  );
};
