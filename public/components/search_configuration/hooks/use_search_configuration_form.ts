/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useCallback, useEffect } from 'react';
import { CoreStart, NotificationsStart } from '../../../../../../src/core/public';
import { SearchConfigurationService } from '../services/search_configuration_service';
import { validateName, validateQuery, validateForm, validateDescription } from '../utils/validation';
import {
  processQuery,
  prepareQueryBody,
  buildValidationRequestBody,
  processSearchResults,
} from '../utils/query_processor';

export interface UseSearchConfigurationFormProps {
  http: CoreStart['http'];
  notifications: NotificationsStart;
  onSuccess?: () => void;
}

export interface UseSearchConfigurationFormReturn {
  // Form state
  name: string;
  setName: (name: string) => void;
  nameError: string;
  validateNameField: (e: React.FocusEvent<HTMLInputElement>) => void;

  description: string;
  setDescription: (description: string) => void;
  descriptionError: string;
  validateDescriptionField: (e: React.FocusEvent<HTMLInputElement>) => void;

  query: string;
  setQuery: (query: string) => void;
  queryError: string;
  setQueryError: (error: string) => void;

  searchTemplate: string;
  setSearchTemplate: (template: string) => void;

  // Index state
  indexOptions: Array<{ label: string; value: string }>;
  selectedIndex: Array<{ label: string; value: string }>;
  setSelectedIndex: (selected: Array<{ label: string; value: string }>) => void;
  isLoadingIndexes: boolean;

  // Pipeline state
  pipelineOptions: Array<{ label: string }>;
  selectedPipeline: Array<{ label: string }>;
  setSelectedPipeline: (selected: Array<{ label: string }>) => void;
  isLoadingPipelines: boolean;

  // Validation state
  testSearchText: string;
  setTestSearchText: (text: string) => void;
  isValidating: boolean;
  searchResults: any;

  // Actions
  validateSearchQuery: () => Promise<void>;
  createSearchConfiguration: () => Promise<void>;
}

export const useSearchConfigurationForm = ({
  http,
  notifications,
  onSuccess,
}: UseSearchConfigurationFormProps): UseSearchConfigurationFormReturn => {
  // Form state
  const [name, setName] = useState('');
  const [nameError, setNameError] = useState('');
  const [description, setDescription] = useState('');
  const [descriptionError, setDescriptionError] = useState('');
  const [query, setQuery] = useState('');
  const [queryError, setQueryError] = useState('');
  const [searchTemplate, setSearchTemplate] = useState('');

  // Index state
  const [indexOptions, setIndexOptions] = useState<Array<{ label: string; value: string }>>([]);
  const [selectedIndex, setSelectedIndex] = useState<Array<{ label: string; value: string }>>([]);
  const [isLoadingIndexes, setIsLoadingIndexes] = useState(true);

  // Pipeline state
  const [pipelineOptions, setPipelineOptions] = useState<Array<{ label: string }>>([]);
  const [selectedPipeline, setSelectedPipeline] = useState<Array<{ label: string }>>([]);
  const [isLoadingPipelines, setIsLoadingPipelines] = useState(false);

  // Validation state
  const [testSearchText, setTestSearchText] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [searchResults, setSearchResults] = useState(null);

  // Create service instance
  const searchConfigService = new SearchConfigurationService(http);

  // Fetch indexes on component mount
  useEffect(() => {
    const fetchIndexes = async () => {
      try {
        const options = await searchConfigService.fetchIndexes();
        setIndexOptions(options);
      } catch (error) {
        console.error('Failed to fetch indexes', error);
        notifications.toasts.addError(error?.body || error, {
          title: 'Failed to fetch indexes',
        });
        setIndexOptions([]);
      } finally {
        setIsLoadingIndexes(false);
      }
    };

    fetchIndexes();
  }, []);

  // Fetch pipelines on component mount
  useEffect(() => {
    const fetchPipelines = async () => {
      setIsLoadingPipelines(true);
      try {
        const options = await searchConfigService.fetchPipelines();
        setPipelineOptions(options);
      } catch (error) {
        // only log error if it's not a 404, see: https://github.com/opensearch-project/OpenSearch/issues/15917
        if (error.body?.statusCode !== 404) {
          notifications.toasts.addDanger('Failed to fetch search pipelines');
          console.error(error);
        }
      } finally {
        setIsLoadingPipelines(false);
      }
    };

    fetchPipelines();
  }, []);

  // Validate name field on blur
  const validateNameField = useCallback((e: React.FocusEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const error = validateName(value);
    setNameError(error);
  }, []);

  const validateDescriptionField = useCallback((e: React.FocusEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const error = validateDescription(value);
    setDescriptionError(error);
  }, []);


  // Validate search query
  const validateSearchQuery = useCallback(async () => {
    if (!selectedIndex.length) {
      notifications.toasts.addWarning({
        title: 'Validation Warning',
        text: 'No index. Please select an index',
      });
      return;
    }

    if (!query.trim()) {
      notifications.toasts.addWarning({
        title: 'Validation Warning',
        text: 'Query body is required',
      });
      return;
    }

    try {
      setIsValidating(true);
      const processedQuery = processQuery(query, testSearchText);
      const queryBody = prepareQueryBody(processedQuery);

      const requestBody = buildValidationRequestBody(
        selectedIndex[0].label,
        queryBody,
        selectedPipeline.length > 0 ? selectedPipeline[0].label : undefined
      );

      const result = await searchConfigService.validateSearchQuery(requestBody);

      if (!result || !result.hits?.hits?.length) {
        throw new Error('Search returned no results');
      }

      const processedResults = processSearchResults(result);
      setSearchResults(processedResults);
      notifications.toasts.addSuccess('Search query is valid');
    } catch (error) {
      let errorMessage = 'Failed to validate search query';
      if (error.body?.message) {
        errorMessage = error.body.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      notifications.toasts.addWarning({
        title: 'Validation Warning',
        text: errorMessage,
        toastLifeTimeMs: 5000,
      });
      setSearchResults(null);
    } finally {
      setIsValidating(false);
    }
  }, [query, testSearchText, selectedIndex, selectedPipeline]);

  // Create search configuration
  const createSearchConfiguration = useCallback(async () => {
    const { isValid, nameError, descriptionError, queryError, indexError } = validateForm(name, description, query, selectedIndex);

    setNameError(nameError);
    setDescriptionError(descriptionError);
    setQueryError(queryError);

    if (!isValid) {
      if (indexError) {
        notifications.toasts.addWarning({
          title: 'Invalid input',
          text: indexError,
        });
      }
      return;
    }

    try {
      await searchConfigService.createSearchConfiguration({
        name,
        description,
        index: selectedIndex[0].label,
        query,
        searchPipeline: selectedPipeline.length > 0 ? selectedPipeline[0].label : undefined,
      });

      notifications.toasts.addSuccess(`Search configuration "${name}" created successfully`);

      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      notifications.toasts.addError(err?.body || err, {
        title: 'Failed to create search configuration',
      });
    }
  }, [name, query, searchTemplate, selectedIndex, selectedPipeline, onSuccess]);

  return {
    // Form state
    name,
    setName,
    nameError,
    validateNameField,

    description,
    setDescription,
    descriptionError,
    validateDescriptionField,

    query,
    setQuery,
    queryError,
    setQueryError,
    searchTemplate,
    setSearchTemplate,

    // Index state
    indexOptions,
    selectedIndex,
    setSelectedIndex,
    isLoadingIndexes,

    // Pipeline state
    pipelineOptions,
    selectedPipeline,
    setSelectedPipeline,
    isLoadingPipelines,

    // Validation state
    testSearchText,
    setTestSearchText,
    isValidating,
    searchResults,

    // Actions
    validateSearchQuery,
    createSearchConfiguration,
  };
};
