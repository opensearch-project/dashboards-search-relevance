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

export const useJudgmentForm = (http: any, notifications: any) => {
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
  const [indexOptions, setIndexOptions] = useState<Array<{ label: string; value: string }>>([]);

  // Loading states
  const [isLoadingQuerySets, setIsLoadingQuerySets] = useState(false);
  const [isLoadingSearchConfigs, setIsLoadingSearchConfigs] = useState(false);
  const [isLoadingModels, setIsLoadingModels] = useState(false);
  const [isLoadingIndexes, setIsLoadingIndexes] = useState(false);

  // UI states
  const [nameError, setNameError] = useState('');
  const [newContextField, setNewContextField] = useState('');
  const [dateRangeError, setDateRangeError] = useState('');

  const service = new JudgmentService(http);

  const fetchData = useCallback(async () => {
    const fetchIndexes = async () => {
      setIsLoadingIndexes(true);
      try {
        setIndexOptions(await service.fetchUbiIndexes());
      } catch (error) {
        notifications.toasts.addDanger('Failed to fetch indexes');
        setIndexOptions([]);
      } finally {
        setIsLoadingIndexes(false);
      }
    };

    if (formData.type !== JudgmentType.LLM) {
      await fetchIndexes();
      return;
    }

    setIsLoadingIndexes(true);
    setIsLoadingQuerySets(true);
    setIsLoadingSearchConfigs(true);
    setIsLoadingModels(true);

    await Promise.all([
      service.fetchUbiIndexes().then(setIndexOptions).catch(() => {
        notifications.toasts.addDanger('Failed to fetch indexes');
        setIndexOptions([]);
      }).finally(() => setIsLoadingIndexes(false)),
      service.fetchQuerySets().then(setQuerySetOptions).catch(() => {
        notifications.toasts.addDanger('Failed to fetch query sets');
        setQuerySetOptions([]);
      }).finally(() => setIsLoadingQuerySets(false)),
      service.fetchSearchConfigs().then(setSearchConfigOptions).catch(() => {
        notifications.toasts.addDanger('Failed to fetch search configurations');
        setSearchConfigOptions([]);
      }).finally(() => setIsLoadingSearchConfigs(false)),
      service.fetchModels().then(setModelOptions).catch(() => {
        notifications.toasts.addDanger('Failed to fetch models');
        setModelOptions([]);
      }).finally(() => setIsLoadingModels(false)),
    ]);
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
        await service.createJudgment(payload);
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
    indexOptions,
    isLoadingQuerySets,
    isLoadingSearchConfigs,
    isLoadingModels,
    isLoadingIndexes,
    nameError,
    newContextField,
    setNewContextField,
    addContextField,
    removeContextField,
    validateAndSubmit,
    dateRangeError,
  };
};
