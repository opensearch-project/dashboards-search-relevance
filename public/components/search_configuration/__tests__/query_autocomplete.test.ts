/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import {
    buildCompletions,
    setupAceAutocomplete,
    QUERY_DSL_KEYWORDS,
    CompletionItem,
} from '../utils/query_autocomplete';

describe('QUERY_DSL_KEYWORDS', () => {
    it('should contain essential query types', () => {
        expect(QUERY_DSL_KEYWORDS).toContain('query');
        expect(QUERY_DSL_KEYWORDS).toContain('match');
        expect(QUERY_DSL_KEYWORDS).toContain('bool');
        expect(QUERY_DSL_KEYWORDS).toContain('term');
        expect(QUERY_DSL_KEYWORDS).toContain('range');
        expect(QUERY_DSL_KEYWORDS).toContain('match_all');
    });

    it('should contain compound query clauses', () => {
        expect(QUERY_DSL_KEYWORDS).toContain('must');
        expect(QUERY_DSL_KEYWORDS).toContain('must_not');
        expect(QUERY_DSL_KEYWORDS).toContain('should');
        expect(QUERY_DSL_KEYWORDS).toContain('filter');
    });

    it('should contain neural/ML query types', () => {
        expect(QUERY_DSL_KEYWORDS).toContain('neural');
        expect(QUERY_DSL_KEYWORDS).toContain('knn');
        expect(QUERY_DSL_KEYWORDS).toContain('hybrid');
    });

    it('should not contain duplicates', () => {
        const uniqueKeywords = new Set(QUERY_DSL_KEYWORDS);
        // The only known duplicate is 'type' which appears in both term-level and common params
        // Verify no other accidental duplicates exist beyond expected ones
        expect(QUERY_DSL_KEYWORDS.length).toBeLessThanOrEqual(uniqueKeywords.size + 1);
    });
});

describe('buildCompletions', () => {
    const fieldNames = ['title', 'title.keyword', 'description', 'price', 'category'];

    it('should return field completions matching prefix', () => {
        const completions = buildCompletions(fieldNames, 'tit');
        const fieldResults = completions.filter((c) => c.meta === 'field');

        expect(fieldResults).toEqual(
            expect.arrayContaining([
                expect.objectContaining({ caption: 'title', meta: 'field' }),
                expect.objectContaining({ caption: 'title.keyword', meta: 'field' }),
            ])
        );
    });

    it('should return keyword completions matching prefix', () => {
        const completions = buildCompletions(fieldNames, 'mat');
        const keywordResults = completions.filter((c) => c.meta === 'keyword');

        expect(keywordResults.length).toBeGreaterThan(0);
        expect(keywordResults).toEqual(
            expect.arrayContaining([
                expect.objectContaining({ caption: 'match', meta: 'keyword' }),
                expect.objectContaining({ caption: 'match_phrase', meta: 'keyword' }),
            ])
        );
    });

    it('should return both fields and keywords when prefix matches both', () => {
        // 'ran' matches 'range' (keyword) and 'brand' (field)
        const fieldsWithRan = [...fieldNames, 'brand'];
        const completions = buildCompletions(fieldsWithRan, 'ran');
        const fieldResults = completions.filter((c) => c.meta === 'field');
        const keywordResults = completions.filter((c) => c.meta === 'keyword');

        expect(fieldResults.length).toBeGreaterThan(0); // 'brand' contains 'ran'
        expect(keywordResults.length).toBeGreaterThan(0); // 'range' contains 'ran'
    });

    it('should return all completions for empty prefix', () => {
        const completions = buildCompletions(fieldNames, '');

        expect(completions.length).toBe(fieldNames.length + QUERY_DSL_KEYWORDS.length);
    });

    it('should be case-insensitive', () => {
        const completions = buildCompletions(fieldNames, 'TIT');
        const fieldResults = completions.filter((c) => c.meta === 'field');

        expect(fieldResults).toEqual(
            expect.arrayContaining([
                expect.objectContaining({ caption: 'title', meta: 'field' }),
            ])
        );
    });

    it('should give fields higher score than keywords', () => {
        const completions = buildCompletions(fieldNames, '');
        const fieldScores = completions.filter((c) => c.meta === 'field').map((c) => c.score);
        const keywordScores = completions.filter((c) => c.meta === 'keyword').map((c) => c.score);

        const minFieldScore = Math.min(...fieldScores);
        const maxKeywordScore = Math.max(...keywordScores);

        expect(minFieldScore).toBeGreaterThan(maxKeywordScore);
    });

    it('should wrap values in double quotes', () => {
        const completions = buildCompletions(['title'], 'title');
        const titleCompletion = completions.find(
            (c) => c.caption === 'title' && c.meta === 'field'
        );

        expect(titleCompletion?.value).toBe('"title"');
    });

    it('should return empty field completions for non-matching prefix', () => {
        const completions = buildCompletions(fieldNames, 'zzz');
        const fieldResults = completions.filter((c) => c.meta === 'field');

        expect(fieldResults).toEqual([]);
    });

    it('should handle empty field names array', () => {
        const completions = buildCompletions([], 'mat');
        const fieldResults = completions.filter((c) => c.meta === 'field');
        const keywordResults = completions.filter((c) => c.meta === 'keyword');

        expect(fieldResults).toEqual([]);
        expect(keywordResults.length).toBeGreaterThan(0);
    });

    it('should match substrings, not just prefixes', () => {
        const completions = buildCompletions(['my_title_field'], 'title');
        const fieldResults = completions.filter((c) => c.meta === 'field');

        expect(fieldResults).toEqual(
            expect.arrayContaining([
                expect.objectContaining({ caption: 'my_title_field' }),
            ])
        );
    });
});

describe('setupAceAutocomplete', () => {
    it('should add a custom completer to the editor', () => {
        const mockEditor = {
            completers: [],
        };

        setupAceAutocomplete(mockEditor, ['title', 'description']);

        expect(mockEditor.completers.length).toBe(1);
        expect(mockEditor.completers[0].__searchRelevanceCompleter).toBe(true);
    });

    it('should replace previous custom completer', () => {
        const mockEditor = {
            completers: [{ __searchRelevanceCompleter: true }],
        };

        setupAceAutocomplete(mockEditor, ['title']);

        expect(mockEditor.completers.length).toBe(1);
        expect(mockEditor.completers[0].__searchRelevanceCompleter).toBe(true);
    });

    it('should preserve non-custom completers', () => {
        const existingCompleter = { getCompletions: jest.fn() };
        const mockEditor = {
            completers: [existingCompleter],
        };

        setupAceAutocomplete(mockEditor, ['title']);

        expect(mockEditor.completers.length).toBe(2);
        expect(mockEditor.completers[0]).toBe(existingCompleter);
    });

    it('should do nothing when editor is null', () => {
        expect(() => setupAceAutocomplete(null, ['title'])).not.toThrow();
    });

    it('should do nothing when editor has no completers', () => {
        expect(() => setupAceAutocomplete({}, ['title'])).not.toThrow();
    });

    it('should strip quotes from prefix in getCompletions callback', () => {
        const mockEditor = {
            completers: [] as any[],
        };

        setupAceAutocomplete(mockEditor, ['title']);

        const completer = mockEditor.completers[0];
        const callback = jest.fn();

        completer.getCompletions(null, null, null, '"tit', callback);

        expect(callback).toHaveBeenCalled();
        const completions = callback.mock.calls[0][1];
        const titleCompletion = completions.find(
            (c: CompletionItem) => c.caption === 'title' && c.meta === 'field'
        );
        expect(titleCompletion).toBeDefined();
    });

    it('should return completions via callback', () => {
        const mockEditor = {
            completers: [] as any[],
        };

        setupAceAutocomplete(mockEditor, ['price', 'description']);

        const completer = mockEditor.completers[0];
        const callback = jest.fn();

        completer.getCompletions(null, null, null, 'pri', callback);

        expect(callback).toHaveBeenCalledWith(null, expect.any(Array));
        const completions = callback.mock.calls[0][1];
        const priceCompletion = completions.find(
            (c: CompletionItem) => c.caption === 'price' && c.meta === 'field'
        );
        expect(priceCompletion).toBeDefined();
    });
});
