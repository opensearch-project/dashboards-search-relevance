/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { validateJudgmentForm, isValidTokenLimit, validatePromptTemplate } from '../utils/validation';
import { JudgmentType } from '../types';

describe('validation', () => {
  describe('validateJudgmentForm', () => {
    it('should validate required name field', () => {
      const result = validateJudgmentForm({ name: '', type: JudgmentType.LLM }, [], [], []);
      expect(result.isValid).toBe(false);
      expect(result.errors.name).toBe('Name is a required parameter.');
    });

    it('should validate LLM judgment requirements', () => {
      const result = validateJudgmentForm({ name: 'test', type: JudgmentType.LLM }, [], [], []);
      expect(result.isValid).toBe(false);
      expect(result.errors.querySet).toBe('Please select a query set');
      expect(result.errors.searchConfigs).toBe('Please select at least one search configuration');
      expect(result.errors.model).toBe('Please select a model id');
    });

    it('should pass validation for valid LLM judgment', () => {
      const result = validateJudgmentForm(
        { name: 'test', type: JudgmentType.LLM },
        [{ label: 'qs1', value: 'qs1' }],
        [{ label: 'sc1', value: 'sc1' }],
        [{ label: 'model1', value: 'model1' }]
      );
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual({});
    });
  });

  describe('isValidTokenLimit', () => {
    it('should validate token limit range', () => {
      expect(isValidTokenLimit(999)).toBe(false);
      expect(isValidTokenLimit(1000)).toBe(true);
      expect(isValidTokenLimit(4000)).toBe(true);
      expect(isValidTokenLimit(500000)).toBe(true);
      expect(isValidTokenLimit(500001)).toBe(false);
    });
  });

  it('should pass validation for valid UBI judgment', () => {
    const result = validateJudgmentForm({ name: 'test', type: JudgmentType.UBI }, [], [], []);
    expect(result.isValid).toBe(true);
    expect(result.errors).toEqual({});
  });

  describe('date range validation', () => {
    it('should fail validation when end date is before start date', () => {
      const result = validateJudgmentForm(
        { 
          name: 'test', 
          type: JudgmentType.UBI,
          startDate: '2023-02-15',
          endDate: '2023-02-01'
        }, 
        [], 
        [], 
        []
      );
      expect(result.isValid).toBe(false);
      expect(result.errors.dateRange).toBe('End Date cannot be earlier than Start Date.');
    });

    it('should pass validation when end date is after start date', () => {
      const result = validateJudgmentForm(
        { 
          name: 'test', 
          type: JudgmentType.UBI,
          startDate: '2023-02-01',
          endDate: '2023-02-15'
        }, 
        [], 
        [], 
        []
      );
      expect(result.isValid).toBe(true);
      expect(result.errors.dateRange).toBeUndefined();
    });

    it('should pass validation when only start date is provided', () => {
      const result = validateJudgmentForm(
        { 
          name: 'test', 
          type: JudgmentType.UBI,
          startDate: '2023-02-01',
          endDate: ''
        }, 
        [], 
        [], 
        []
      );
      expect(result.isValid).toBe(true);
      expect(result.errors.dateRange).toBeUndefined();
    });

    it('should pass validation when only end date is provided', () => {
      const result = validateJudgmentForm(
        { 
          name: 'test', 
          type: JudgmentType.UBI,
          startDate: '',
          endDate: '2023-02-15'
        }, 
        [], 
        [], 
        []
      );
      expect(result.isValid).toBe(true);
      expect(result.errors.dateRange).toBeUndefined();
    });
  });
});

describe('validatePromptTemplate', () => {
  it('should return empty array for null/empty template', () => {
    expect(validatePromptTemplate('')).toEqual([]);
    expect(validatePromptTemplate(null as any)).toEqual([]);
    expect(validatePromptTemplate(undefined as any)).toEqual([]);
  });

  it('should warn when missing hits/results placeholder', () => {
    const warnings = validatePromptTemplate('Query: {{queryText}}');
    expect(warnings).toContainEqual(
      expect.stringContaining('{{hits}} or {{results}}')
    );
  });

  it('should not warn when {{hits}} is present', () => {
    const warnings = validatePromptTemplate('{{queryText}} {{hits}}');
    expect(warnings.some((w) => w.includes('{{hits}} or {{results}}'))).toBe(false);
  });

  it('should not warn when {{results}} is present', () => {
    const warnings = validatePromptTemplate('{{queryText}} {{results}}');
    expect(warnings.some((w) => w.includes('{{hits}} or {{results}}'))).toBe(false);
  });

  it('should warn when missing queryText/searchText placeholder', () => {
    const warnings = validatePromptTemplate('Docs: {{hits}}');
    expect(warnings).toContainEqual(
      expect.stringContaining('{{queryText}} or {{searchText}}')
    );
  });

  it('should not warn when {{queryText}} is present', () => {
    const warnings = validatePromptTemplate('{{queryText}} {{hits}}');
    expect(warnings.some((w) => w.includes('{{queryText}} or {{searchText}}'))).toBe(false);
  });

  it('should not warn when {{searchText}} is present', () => {
    const warnings = validatePromptTemplate('{{searchText}} {{hits}}');
    expect(warnings.some((w) => w.includes('{{queryText}} or {{searchText}}'))).toBe(false);
  });

  it('should warn when template exceeds 10000 characters', () => {
    const longTemplate = '{{queryText}} {{hits}} ' + 'a'.repeat(10000);
    const warnings = validatePromptTemplate(longTemplate);
    expect(warnings).toContainEqual(
      expect.stringContaining('maximum length')
    );
  });

  it('should not warn when template is exactly 10000 characters', () => {
    const template = '{{queryText}} {{hits}}';
    const padded = template + 'a'.repeat(10000 - template.length);
    const warnings = validatePromptTemplate(padded);
    expect(warnings.some((w) => w.includes('maximum length'))).toBe(false);
  });

  it('should warn when template contains # character', () => {
    const warnings = validatePromptTemplate('{{queryText}} {{hits}} # comment');
    expect(warnings).toContainEqual(
      expect.stringContaining("'#'")
    );
  });

  it('should not warn when template has no # character', () => {
    const warnings = validatePromptTemplate('{{queryText}} {{hits}}');
    expect(warnings.some((w) => w.includes('#'))).toBe(false);
  });

  it('should return no warnings for a valid template', () => {
    const warnings = validatePromptTemplate('SearchText: {{searchText}}; Hits: {{hits}}');
    expect(warnings).toEqual([]);
  });

  it('should return multiple warnings for multiple violations', () => {
    const warnings = validatePromptTemplate('no placeholders # bad');
    expect(warnings.length).toBeGreaterThanOrEqual(3);
  });
});
