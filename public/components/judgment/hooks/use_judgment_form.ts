/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback } from 'react';
import { JudgmentType, ComboBoxOption, ModelOption, JudgmentFormData } from '../types';
import { JudgmentService } from '../services/judgment_service';
import { validateJudgmentForm } from '../utils/validation';
import { buildJudgmentPayload } from '../utils/form_processor';
import moment from 'moment';

export const useJudgmentForm = (http: any, notifications: any, dataSourceId?: string) => {
  // Form data
  const [formData, setFormData] = useState<JudgmentFormData>({
    name: '',
    type: JudgmentType.LLM,
    size: 5,
    tokenLimit: 4000,
    ignoreFailure: false,
    clickModel: 'coec',
    maxRank: 20,
    contextFields: [],
    startDate: moment('2000-01-01').format('YYYY-MM-DD'),
    endDate: moment().format('YYYY-MM-DD'),
  });

  // Selection states
  const [selectedQuerySet, setSelectedQuerySet] = useState<ComboBoxOption[]>([]);
  const [selectedSearchConfigs, setSelectedSearchConfigs] = useState<ComboBoxOption[]>([]);
  const [selectedModel, setSelectedModel] = useState<ModelOption[]>([]);

  // Options
  const [querySetOptions, setQuerySetOptions] = useState<ComboBoxOption[]>([]);
  const [searchConfigOptions, setSearchConfigOptions] = useState<ComboBoxOption[]>([]);
  const [modelOptions, setModelOptions] = useState<ModelOption[]>([]);

  // Loading states
  const [isLoadingQuerySets, setIsLoadingQuerySets] = useState(false);
  const [isLoadingSearchConfigs, setIsLoadingSearchConfigs] = useState(false);
  const [isLoadingModels, setIsLoadingModels] = useState(false);

  // UI states
  const [nameError, setNameError] = useState('');
  const [newContextField, setNewContextField] = useState('');
  const [dateRangeError, setDateRangeError] = useState('');

  const service = new JudgmentService(http);

  const fetchData = useCallback(async () => {
    if (formData.type === JudgmentType.LLM) {
      // Fetch query sets
      setIsLoadingQuerySets(true);
      try {
        const querySets = await service.fetchQuerySets();
        setQuerySetOptions(querySets);
      } catch (error) {
        notifications.toasts.addDanger('Failed to fetch query sets');
        setQuerySetOptions([]);
      } finally {
        setIsLoadingQuerySets(false);
      }

      // Fetch search configurations
      setIsLoadingSearchConfigs(true);
      try {
        const searchConfigs = await service.fetchSearchConfigs();
        setSearchConfigOptions(searchConfigs);
      } catch (error) {
        notifications.toasts.addDanger('Failed to fetch search configurations');
        setSearchConfigOptions([]);
      } finally {
        setIsLoadingSearchConfigs(false);
      }

      // Fetch models
      setIsLoadingModels(true);
      try {
        const models = await service.fetchModels();
        setModelOptions(models);
      } catch (error) {
        notifications.toasts.addDanger('Failed to fetch models');
        setModelOptions([]);
      } finally {
        setIsLoadingModels(false);
      }
    }
  }, [formData.type, http, notifications.toasts]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const updateFormData = useCallback((updates: Partial<JudgmentFormData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  }, []);

  const addContextField = useCallback(() => {
    if (newContextField && !formData.contextFields?.includes(newContextField)) {
      updateFormData({
        contextFields: [...(formData.contextFields || []), newContextField],
      });
      setNewContextField('');
    }
  }, [newContextField, formData.contextFields, updateFormData]);

  const removeContextField = useCallback(
    (field: string) => {
      updateFormData({
        contextFields: formData.contextFields?.filter((f) => f !== field) || [],
      });
    },
    [formData.contextFields, updateFormData]
  );

  const validateAndSubmit = useCallback(
    async (onSuccess: () => void) => {
      const validation = validateJudgmentForm(
        formData,
        selectedQuerySet,
        selectedSearchConfigs,
        selectedModel
      );

      setNameError(validation.errors.name || '');
      setDateRangeError(validation.errors.dateRange || '');

      if (validation.errors.querySet) {
        notifications.toasts.addDanger(validation.errors.querySet);
      }
      if (validation.errors.searchConfigs) {
        notifications.toasts.addDanger(validation.errors.searchConfigs);
      }
      if (validation.errors.model) {
        notifications.toasts.addDanger(validation.errors.model);
      }
      if (validation.errors.dateRange) {
        notifications.toasts.addDanger(validation.errors.dateRange);
      }

      if (!validation.isValid) {
        return;
      }

      try {
        const payload = buildJudgmentPayload(
          formData,
          selectedQuerySet,
          selectedSearchConfigs,
          selectedModel
        );
        await service.createJudgment(payload, dataSourceId);
        notifications.toasts.addSuccess('Judgment created successfully');
        onSuccess();
      } catch (err) {
        notifications.toasts.addError(err?.body || err, {
          title: 'Failed to create judgment',
        });
      }
    },
    [
      formData,
      selectedQuerySet,
      selectedSearchConfigs,
      selectedModel,
      service,
      notifications.toasts,
    ]
  );

  return {
    formData,
    updateFormData,
    selectedQuerySet,
    setSelectedQuerySet,
    selectedSearchConfigs,
    setSelectedSearchConfigs,
    selectedModel,
    setSelectedModel,
    querySetOptions,
    searchConfigOptions,
    modelOptions,
    isLoadingQuerySets,
    isLoadingSearchConfigs,
    isLoadingModels,
    nameError,
    newContextField,
    setNewContextField,
    addContextField,
    removeContextField,
    validateAndSubmit,
    dateRangeError,
  };
};
