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
        const names = QUERY_DSL_KEYWORDS.map((k) => k.name);
        expect(names).toContain('query');
        expect(names).toContain('match');
        expect(names).toContain('bool');
        expect(names).toContain('term');
        expect(names).toContain('range');
        expect(names).toContain('match_all');
    });

    it('should contain compound query clauses', () => {
        const names = QUERY_DSL_KEYWORDS.map((k) => k.name);
        expect(names).toContain('must');
        expect(names).toContain('must_not');
        expect(names).toContain('should');
        expect(names).toContain('filter');
    });

    it('should contain neural/ML query types', () => {
        const names = QUERY_DSL_KEYWORDS.map((k) => k.name);
        expect(names).toContain('neural');
        expect(names).toContain('knn');
        expect(names).toContain('hybrid');
    });

    it('should have template information for each keyword', () => {
        QUERY_DSL_KEYWORDS.forEach((keyword) => {
            expect(keyword).toHaveProperty('name');
            expect(keyword).toHaveProperty('template');
            expect(['object', 'array', 'string', 'number', 'boolean', 'none']).toContain(
                keyword.template
            );
        });
    });

    it('should have object templates for query types', () => {
        const queryKeyword = QUERY_DSL_KEYWORDS.find((k) => k.name === 'query');
        const matchKeyword = QUERY_DSL_KEYWORDS.find((k) => k.name === 'match');
        const boolKeyword = QUERY_DSL_KEYWORDS.find((k) => k.name === 'bool');

        expect(queryKeyword?.template).toBe('object');
        expect(matchKeyword?.template).toBe('object');
        expect(boolKeyword?.template).toBe('object');
    });

    it('should have array templates for clause types', () => {
        const mustKeyword = QUERY_DSL_KEYWORDS.find((k) => k.name === 'must');
        const shouldKeyword = QUERY_DSL_KEYWORDS.find((k) => k.name === 'should');
        const fieldsKeyword = QUERY_DSL_KEYWORDS.find((k) => k.name === 'fields');

        expect(mustKeyword?.template).toBe('array');
        expect(shouldKeyword?.template).toBe('array');
        expect(fieldsKeyword?.template).toBe('array');
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
        // Keywords now have specific meta values like 'query', 'clause', 'param'
        const matchCompletions = completions.filter((c) => c.caption.startsWith('match'));

        expect(matchCompletions.length).toBeGreaterThan(0);
        expect(matchCompletions).toEqual(
            expect.arrayContaining([
                expect.objectContaining({ caption: 'match' }),
                expect.objectContaining({ caption: 'match_phrase' }),
            ])
        );
    });

    it('should return both fields and keywords when prefix matches both', () => {
        // 'ran' matches 'range' (keyword) and 'brand' (field)
        const fieldsWithRan = [...fieldNames, 'brand'];
        const completions = buildCompletions(fieldsWithRan, 'ran');
        const fieldResults = completions.filter((c) => c.meta === 'field');
        const keywordResults = completions.filter((c) => c.meta !== 'field');

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
        const keywordScores = completions.filter((c) => c.meta !== 'field').map((c) => c.score);

        const minFieldScore = Math.min(...fieldScores);
        const maxKeywordScore = Math.max(...keywordScores);

        expect(minFieldScore).toBeGreaterThan(maxKeywordScore);
    });

    it('should include completer with insertMatch for each completion', () => {
        const completions = buildCompletions(['title'], 'title');
        const titleCompletion = completions.find(
            (c) => c.caption === 'title' && c.meta === 'field'
        );

        expect(titleCompletion?.completer).toBeDefined();
        expect(typeof titleCompletion?.completer?.insertMatch).toBe('function');
    });

    it('should include template information for keywords', () => {
        const completions = buildCompletions([], 'query');
        const queryCompletion = completions.find((c) => c.caption === 'query');

        expect(queryCompletion?.template).toBe('object');
    });

    it('should return empty field completions for non-matching prefix', () => {
        const completions = buildCompletions(fieldNames, 'zzz');
        const fieldResults = completions.filter((c) => c.meta === 'field');

        expect(fieldResults).toEqual([]);
    });

    it('should handle empty field names array', () => {
        const completions = buildCompletions([], 'mat');
        const fieldResults = completions.filter((c) => c.meta === 'field');
        const keywordResults = completions.filter((c) => c.meta !== 'field');

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
    let mockEditor: any;
    let mockSession: any;
    let mockSelection: any;

    beforeEach(() => {
        // Reset mocks
        jest.clearAllMocks();

        // Create mock selection object
        mockSelection = {
            on: jest.fn(),
            off: jest.fn(),
        };

        // Create mock session object
        mockSession = {
            selection: mockSelection,
            getLine: jest.fn().mockReturnValue(''),
            getTokenAt: jest.fn().mockReturnValue(null),
        };

        // Create a mock editor
        mockEditor = {
            setOptions: jest.fn(),
            getSession: jest.fn().mockReturnValue(mockSession),
            getCursorPosition: jest.fn().mockReturnValue({ row: 0, column: 0 }),
            execCommand: jest.fn(),
            completer: null,
        };
    });

    it('should do nothing when editor is null', () => {
        expect(() => setupAceAutocomplete(null, ['title'])).not.toThrow();
    });

    it('should enable autocomplete options on the editor', () => {
        setupAceAutocomplete(mockEditor, ['title', 'description']);

        expect(mockEditor.setOptions).toHaveBeenCalledWith({
            enableBasicAutocompletion: true,
            enableLiveAutocompletion: true,
        });
    });

    it('should add a changeCursor listener to trigger autocomplete', () => {
        setupAceAutocomplete(mockEditor, ['title']);

        expect(mockSelection.on).toHaveBeenCalledWith('changeCursor', expect.any(Function));
    });

    it('should remove previous listener when called multiple times', () => {
        setupAceAutocomplete(mockEditor, ['title']);
        setupAceAutocomplete(mockEditor, ['description']);

        expect(mockSelection.off).toHaveBeenCalledWith('changeCursor', expect.any(Function));
    });

    it('should trigger autocomplete when cursor is inside a string after quote', () => {
        jest.useFakeTimers();
        setupAceAutocomplete(mockEditor, ['title']);

        // Get the changeCursor listener
        const listener = mockSelection.on.mock.calls.find(
            (call: any[]) => call[0] === 'changeCursor'
        )?.[1];
        expect(listener).toBeDefined();

        // Mock cursor position after typing a quote: {"|
        mockEditor.getCursorPosition.mockReturnValue({ row: 0, column: 2 });
        mockSession.getLine.mockReturnValue('{"');

        // Trigger the listener
        listener();

        // Fast-forward timers
        jest.advanceTimersByTime(100);

        expect(mockEditor.execCommand).toHaveBeenCalledWith('startAutocomplete');
        jest.useRealTimers();
    });

    it('should not trigger autocomplete when not inside a string', () => {
        jest.useFakeTimers();
        setupAceAutocomplete(mockEditor, ['title']);

        // Get the changeCursor listener
        const listener = mockSelection.on.mock.calls.find(
            (call: any[]) => call[0] === 'changeCursor'
        )?.[1];

        // Mock cursor position outside quotes: {|
        mockEditor.getCursorPosition.mockReturnValue({ row: 0, column: 1 });
        mockSession.getLine.mockReturnValue('{');

        // Trigger the listener
        listener();

        // Fast-forward timers
        jest.advanceTimersByTime(100);

        expect(mockEditor.execCommand).not.toHaveBeenCalled();
        jest.useRealTimers();
    });

    it('should not trigger when completer is already active', () => {
        jest.useFakeTimers();
        mockEditor.completer = { activated: true };
        setupAceAutocomplete(mockEditor, ['title']);

        // Get the changeCursor listener
        const listener = mockSelection.on.mock.calls.find(
            (call: any[]) => call[0] === 'changeCursor'
        )?.[1];

        // Mock cursor position inside quotes
        mockEditor.getCursorPosition.mockReturnValue({ row: 0, column: 2 });
        mockSession.getLine.mockReturnValue('{"');

        // Trigger the listener
        listener();

        // Fast-forward timers
        jest.advanceTimersByTime(100);

        expect(mockEditor.execCommand).not.toHaveBeenCalled();
        jest.useRealTimers();
    });
});

describe('createInsertMatch (via buildCompletions)', () => {
    let mockEditor: any;
    let mockSession: any;

    beforeEach(() => {
        mockSession = {
            getLine: jest.fn(),
            replace: jest.fn(),
        };
        mockEditor = {
            getSession: jest.fn().mockReturnValue(mockSession),
            getCursorPosition: jest.fn(),
            moveCursorTo: jest.fn(),
            clearSelection: jest.fn(),
            execCommand: jest.fn(),
        };
    });

    it('should insert object template and position cursor inside braces', () => {
        jest.useFakeTimers();
        // Cursor after "que" in {"que|"}
        mockEditor.getCursorPosition.mockReturnValue({ row: 0, column: 5 });
        mockSession.getLine.mockReturnValue('{"que"}');

        const completions = buildCompletions([], 'que');
        const queryCompletion = completions.find((c) => c.caption === 'query');
        expect(queryCompletion?.completer).toBeDefined();

        queryCompletion!.completer!.insertMatch(mockEditor, queryCompletion);

        // Should replace from after opening quote (col 2) to closing quote (col 6)
        expect(mockSession.replace).toHaveBeenCalledWith(
            { start: { row: 0, column: 2 }, end: { row: 0, column: 6 } },
            'query": {}'
        );
        // Cursor should be inside {} (at position 2 + 10 - 1 = 11)
        expect(mockEditor.moveCursorTo).toHaveBeenCalledWith(0, 11);
        expect(mockEditor.clearSelection).toHaveBeenCalled();

        // Should trigger autocomplete again for object templates
        jest.advanceTimersByTime(150);
        expect(mockEditor.execCommand).toHaveBeenCalledWith('startAutocomplete');
        jest.useRealTimers();
    });

    it('should insert string template and position cursor inside quotes', () => {
        // Cursor after "ana" in {"ana|"}
        mockEditor.getCursorPosition.mockReturnValue({ row: 0, column: 5 });
        mockSession.getLine.mockReturnValue('{"ana"}');

        const completions = buildCompletions([], 'ana');
        const analyzerCompletion = completions.find((c) => c.caption === 'analyzer');
        expect(analyzerCompletion?.completer).toBeDefined();

        analyzerCompletion!.completer!.insertMatch(mockEditor, analyzerCompletion);

        // String template: analyzer": ""
        expect(mockSession.replace).toHaveBeenCalledWith(
            { start: { row: 0, column: 2 }, end: { row: 0, column: 6 } },
            'analyzer": ""'
        );
        // Cursor inside the quotes (column 2 + 13 - 1 = 14)
        expect(mockEditor.moveCursorTo).toHaveBeenCalledWith(0, 14);
    });

    it('should insert number template and position cursor at end', () => {
        mockEditor.getCursorPosition.mockReturnValue({ row: 0, column: 4 });
        mockSession.getLine.mockReturnValue('{"si"}');

        const completions = buildCompletions([], 'si');
        const sizeCompletion = completions.find((c) => c.caption === 'size');
        expect(sizeCompletion?.completer).toBeDefined();

        sizeCompletion!.completer!.insertMatch(mockEditor, sizeCompletion);

        // Number template: size": (with trailing space for typing)
        expect(mockSession.replace).toHaveBeenCalledWith(
            { start: { row: 0, column: 2 }, end: { row: 0, column: 5 } },
            'size": '
        );
        // Cursor at end (column 2 + 7 + 0 = 9)
        expect(mockEditor.moveCursorTo).toHaveBeenCalledWith(0, 9);
    });

    it('should handle field completion with no closing quote', () => {
        // Cursor after "tit" in {"tit|  (no closing quote)
        mockEditor.getCursorPosition.mockReturnValue({ row: 0, column: 5 });
        mockSession.getLine.mockReturnValue('{"tit');

        const completions = buildCompletions(['title'], 'tit');
        const titleCompletion = completions.find(
            (c) => c.caption === 'title' && c.meta === 'field'
        );
        expect(titleCompletion?.completer).toBeDefined();

        titleCompletion!.completer!.insertMatch(mockEditor, titleCompletion);

        // tokenEnd should equal pos.column since no closing quote
        expect(mockSession.replace).toHaveBeenCalledWith(
            { start: { row: 0, column: 2 }, end: { row: 0, column: 5 } },
            'title": {}'
        );
    });

    it('should not trigger autocomplete for non-object/array templates', () => {
        jest.useFakeTimers();
        mockEditor.getCursorPosition.mockReturnValue({ row: 0, column: 4 });
        mockSession.getLine.mockReturnValue('{"si"}');

        const completions = buildCompletions([], 'si');
        const sizeCompletion = completions.find((c) => c.caption === 'size');
        sizeCompletion!.completer!.insertMatch(mockEditor, sizeCompletion);

        jest.advanceTimersByTime(150);
        expect(mockEditor.execCommand).not.toHaveBeenCalled();
        jest.useRealTimers();
    });
});

describe('completer getCompletions callback', () => {
    let mockEditor: any;
    let mockSession: any;
    let mockSelection: any;
    let capturedCompleter: any;

    beforeEach(() => {
        jest.clearAllMocks();
        mockSelection = { on: jest.fn(), off: jest.fn() };
        mockSession = {
            selection: mockSelection,
            getLine: jest.fn().mockReturnValue(''),
            getTokenAt: jest.fn().mockReturnValue(null),
        };
        mockEditor = {
            setOptions: jest.fn(),
            getSession: jest.fn().mockReturnValue(mockSession),
            getCursorPosition: jest.fn().mockReturnValue({ row: 0, column: 0 }),
            execCommand: jest.fn(),
            completer: null,
        };

        // Capture the completer that gets registered via setCompleters
        jest.spyOn(
            require('brace').acequire('ace/ext/language_tools'),
            'setCompleters'
        ).mockImplementation((...args: any[]) => {
            capturedCompleter = args[0][0];
        });

        setupAceAutocomplete(mockEditor, ['title', 'description']);
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('should return completions when cursor is inside a string', () => {
        const callback = jest.fn();
        mockSession.getLine.mockReturnValue('{"');
        const pos = { row: 0, column: 2 };

        capturedCompleter.getCompletions(mockEditor, mockSession, pos, '', callback);

        expect(callback).toHaveBeenCalledWith(null, expect.any(Array));
        const completions = callback.mock.calls[0][1];
        expect(completions.length).toBeGreaterThan(0);
    });

    it('should return empty when cursor is outside a string and no prefix', () => {
        const callback = jest.fn();
        mockSession.getLine.mockReturnValue('{');
        const pos = { row: 0, column: 1 };

        capturedCompleter.getCompletions(mockEditor, mockSession, pos, '', callback);

        expect(callback).toHaveBeenCalledWith(null, []);
    });

    it('should strip quotes from prefix for filtering', () => {
        const callback = jest.fn();
        // Inside string, typing "tit
        mockSession.getLine.mockReturnValue('{"tit');
        const pos = { row: 0, column: 5 };

        capturedCompleter.getCompletions(mockEditor, mockSession, pos, '"tit', callback);

        expect(callback).toHaveBeenCalledWith(null, expect.any(Array));
        const completions = callback.mock.calls[0][1];
        const fieldResults = completions.filter((c: any) => c.meta === 'field');
        expect(fieldResults).toEqual(
            expect.arrayContaining([
                expect.objectContaining({ caption: 'title' }),
            ])
        );
    });

    it('should return completions when prefix exists but not inside string', () => {
        const callback = jest.fn();
        mockSession.getLine.mockReturnValue('{query');
        const pos = { row: 0, column: 6 };

        capturedCompleter.getCompletions(mockEditor, mockSession, pos, 'query', callback);

        expect(callback).toHaveBeenCalledWith(null, expect.any(Array));
        const completions = callback.mock.calls[0][1];
        expect(completions.length).toBeGreaterThan(0);
    });
});

