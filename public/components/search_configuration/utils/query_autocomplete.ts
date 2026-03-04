/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

// Import brace and its language_tools extension for their side effects.
// brace sets window.ace globally, and the ext import registers language_tools.
import ace from 'brace';
import 'brace/ext/language_tools';

/**
 * Template types for Query DSL keywords.
 * Defines what structure should be inserted after the keyword.
 */
type TemplateType = 'object' | 'array' | 'string' | 'number' | 'boolean' | 'none';

/**
 * Query DSL keyword definition with template information.
 */
interface QueryDSLKeyword {
    name: string;
    template: TemplateType;
    meta?: string;
}

/**
 * Curated list of OpenSearch Query DSL keywords for autocomplete.
 * Each keyword includes template information for smart insertion.
 */
export const QUERY_DSL_KEYWORDS: QueryDSLKeyword[] = [
    // Top-level structure
    { name: 'query', template: 'object', meta: 'clause' },
    { name: 'size', template: 'number', meta: 'param' },
    { name: 'from', template: 'number', meta: 'param' },
    { name: 'sort', template: 'array', meta: 'clause' },
    { name: 'aggs', template: 'object', meta: 'clause' },
    { name: 'aggregations', template: 'object', meta: 'clause' },
    { name: 'highlight', template: 'object', meta: 'clause' },
    { name: '_source', template: 'array', meta: 'clause' },
    { name: 'script_fields', template: 'object', meta: 'clause' },
    { name: 'post_filter', template: 'object', meta: 'clause' },
    { name: 'rescore', template: 'object', meta: 'clause' },
    { name: 'explain', template: 'boolean', meta: 'param' },
    { name: 'min_score', template: 'number', meta: 'param' },
    { name: 'track_total_hits', template: 'boolean', meta: 'param' },

    // Compound queries
    { name: 'bool', template: 'object', meta: 'query' },
    { name: 'must', template: 'array', meta: 'clause' },
    { name: 'must_not', template: 'array', meta: 'clause' },
    { name: 'should', template: 'array', meta: 'clause' },
    { name: 'filter', template: 'array', meta: 'clause' },
    { name: 'minimum_should_match', template: 'number', meta: 'param' },
    { name: 'boost', template: 'number', meta: 'param' },

    // Full-text queries
    { name: 'match', template: 'object', meta: 'query' },
    { name: 'match_phrase', template: 'object', meta: 'query' },
    { name: 'match_phrase_prefix', template: 'object', meta: 'query' },
    { name: 'multi_match', template: 'object', meta: 'query' },
    { name: 'query_string', template: 'object', meta: 'query' },
    { name: 'simple_query_string', template: 'object', meta: 'query' },
    { name: 'match_all', template: 'object', meta: 'query' },
    { name: 'match_none', template: 'object', meta: 'query' },
    { name: 'match_bool_prefix', template: 'object', meta: 'query' },
    { name: 'combined_fields', template: 'object', meta: 'query' },

    // Term-level queries
    { name: 'term', template: 'object', meta: 'query' },
    { name: 'terms', template: 'object', meta: 'query' },
    { name: 'range', template: 'object', meta: 'query' },
    { name: 'exists', template: 'object', meta: 'query' },
    { name: 'prefix', template: 'object', meta: 'query' },
    { name: 'wildcard', template: 'object', meta: 'query' },
    { name: 'regexp', template: 'object', meta: 'query' },
    { name: 'fuzzy', template: 'object', meta: 'query' },
    { name: 'ids', template: 'object', meta: 'query' },
    { name: 'type', template: 'object', meta: 'query' },

    // Joining queries
    { name: 'nested', template: 'object', meta: 'query' },
    { name: 'has_child', template: 'object', meta: 'query' },
    { name: 'has_parent', template: 'object', meta: 'query' },
    { name: 'parent_id', template: 'object', meta: 'query' },

    // Specialized queries
    { name: 'more_like_this', template: 'object', meta: 'query' },
    { name: 'script', template: 'object', meta: 'query' },
    { name: 'script_score', template: 'object', meta: 'query' },
    { name: 'function_score', template: 'object', meta: 'query' },
    { name: 'percolate', template: 'object', meta: 'query' },
    { name: 'wrapper', template: 'object', meta: 'query' },
    { name: 'distance_feature', template: 'object', meta: 'query' },
    { name: 'rank_feature', template: 'object', meta: 'query' },

    // Neural / ML queries
    { name: 'neural', template: 'object', meta: 'query' },
    { name: 'hybrid', template: 'object', meta: 'query' },
    { name: 'knn', template: 'object', meta: 'query' },

    // Common parameters
    { name: 'analyzer', template: 'string', meta: 'param' },
    { name: 'fields', template: 'array', meta: 'param' },
    { name: 'fuzziness', template: 'string', meta: 'param' },
    { name: 'operator', template: 'string', meta: 'param' },
    { name: 'zero_terms_query', template: 'string', meta: 'param' },
    { name: 'cutoff_frequency', template: 'number', meta: 'param' },
    { name: 'auto_generate_synonyms_phrase_query', template: 'boolean', meta: 'param' },
    { name: 'lenient', template: 'boolean', meta: 'param' },
    { name: 'max_expansions', template: 'number', meta: 'param' },
    { name: 'prefix_length', template: 'number', meta: 'param' },
    { name: 'slop', template: 'number', meta: 'param' },
    { name: 'tie_breaker', template: 'number', meta: 'param' },

    // Range parameters
    { name: 'gte', template: 'none', meta: 'param' },
    { name: 'gt', template: 'none', meta: 'param' },
    { name: 'lte', template: 'none', meta: 'param' },
    { name: 'lt', template: 'none', meta: 'param' },
    { name: 'format', template: 'string', meta: 'param' },

    // Sort parameters
    { name: 'order', template: 'string', meta: 'param' },
    { name: 'mode', template: 'string', meta: 'param' },
    { name: 'missing', template: 'string', meta: 'param' },
    { name: 'unmapped_type', template: 'string', meta: 'param' },

    // Highlight parameters
    { name: 'pre_tags', template: 'array', meta: 'param' },
    { name: 'post_tags', template: 'array', meta: 'param' },
    { name: 'fragment_size', template: 'number', meta: 'param' },
    { name: 'number_of_fragments', template: 'number', meta: 'param' },

    // Source filtering
    { name: 'includes', template: 'array', meta: 'param' },
    { name: 'excludes', template: 'array', meta: 'param' },

    // Value keywords
    { name: 'value', template: 'none', meta: 'param' },
    { name: 'path', template: 'string', meta: 'param' },
    { name: 'ignore_unmapped', template: 'boolean', meta: 'param' },
];

/**
 * Get the template suffix for a given template type.
 */
const getTemplateSuffix = (template: TemplateType): string => {
    switch (template) {
        case 'object':
            return ': {}';
        case 'array':
            return ': []';
        case 'string':
            return ': ""';
        case 'number':
            return ': ';
        case 'boolean':
            return ': ';
        case 'none':
        default:
            return '';
    }
};

/**
 * Get the cursor offset after inserting a template.
 * Returns negative number to move cursor back from end.
 */
const getCursorOffset = (template: TemplateType): number => {
    switch (template) {
        case 'object':
            return -1; // Position inside {}
        case 'array':
            return -1; // Position inside []
        case 'string':
            return -1; // Position inside ""
        case 'number':
        case 'boolean':
            return 0; // Position at end, ready to type value
        case 'none':
        default:
            return 0;
    }
};

/**
 * A single autocomplete completion item.
 */
export interface CompletionItem {
    /** The text to display in the autocomplete menu */
    caption: string;
    /** The text value used for filtering */
    value: string;
    /** Metadata label (e.g., "field" or "keyword") */
    meta: string;
    /** Score for ordering (higher = higher priority) */
    score: number;
    /** Template type for smart insertion */
    template?: TemplateType;
    /** Snippet to insert (includes template) */
    snippet?: string;
    /** Custom completer with insertMatch function */
    completer?: {
        insertMatch: (editor: any, data: any) => void;
    };
}

/**
 * Creates a custom insertMatch function that handles template insertion
 * and cursor positioning like Dev Tools.
 */
const createInsertMatch = (
    name: string,
    template: TemplateType
): ((editor: any, data: any) => void) => {
    return (editor: any, _data: any) => {
        const session = editor.getSession();
        const pos = editor.getCursorPosition();
        const line = session.getLine(pos.row);
        const beforeCursor = line.substring(0, pos.column);
        const afterCursor = line.substring(pos.column);

        // Find the start of the current token (after the opening quote)
        let tokenStart = pos.column;
        for (let i = pos.column - 1; i >= 0; i--) {
            const char = beforeCursor[i];
            if (char === '"') {
                tokenStart = i + 1;
                break;
            }
        }

        // Check if there's a closing quote right after the cursor that we need to replace
        let tokenEnd = pos.column;
        if (afterCursor.length > 0 && afterCursor[0] === '"') {
            tokenEnd = pos.column + 1; // Include the closing quote in the replacement
        }

        // Build the text to insert
        const suffix = getTemplateSuffix(template);
        const insertText = name + '"' + suffix;

        // Calculate the range to replace (from token start to end, including closing quote if present)
        const range = {
            start: { row: pos.row, column: tokenStart },
            end: { row: pos.row, column: tokenEnd },
        };

        // Replace the current token with our completion
        session.replace(range, insertText);

        // Calculate new cursor position
        const cursorOffset = getCursorOffset(template);
        const newColumn = tokenStart + insertText.length + cursorOffset;

        // Move cursor to the right position
        editor.moveCursorTo(pos.row, newColumn);
        editor.clearSelection();

        // For templates that need content, trigger autocomplete again
        if (template === 'object' || template === 'array') {
            // Small delay to let the editor update
            setTimeout(() => {
                editor.execCommand('startAutocomplete');
            }, 100);
        }
    };
};

/**
 * Builds autocomplete completion items from field names and Query DSL keywords,
 * filtered to match the given prefix.
 *
 * @param fieldNames Array of index field names (e.g., ["title", "title.keyword"])
 * @param prefix Current typing prefix to filter by (case-insensitive)
 * @returns Filtered array of CompletionItem objects
 */
export const buildCompletions = (fieldNames: string[], prefix: string): CompletionItem[] => {
    const lowerPrefix = prefix.toLowerCase();

    // Field completions - fields are typically used as keys that expect values
    const fieldCompletions: CompletionItem[] = fieldNames
        .filter((name) => name.toLowerCase().includes(lowerPrefix))
        .map((name) => {
            const template: TemplateType = 'object'; // Fields typically expect object values
            return {
                caption: name,
                value: name,
                meta: 'field',
                score: 1000, // Fields get higher priority
                template,
                completer: {
                    insertMatch: createInsertMatch(name, template),
                },
            };
        });

    // Keyword completions with templates
    const keywordCompletions: CompletionItem[] = QUERY_DSL_KEYWORDS
        .filter((keyword) => keyword.name.toLowerCase().includes(lowerPrefix))
        .map((keyword) => ({
            caption: keyword.name,
            value: keyword.name,
            meta: keyword.meta || 'keyword',
            score: 500,
            template: keyword.template,
            completer: {
                insertMatch: createInsertMatch(keyword.name, keyword.template),
            },
        }));

    return [...fieldCompletions, ...keywordCompletions];
};

/**
 * Registers a custom Ace completer on an Ace editor instance that provides
 * autocomplete suggestions for both index field names and Query DSL keywords.
 *
 * Uses brace's language_tools extension (loaded via require at module top)
 * to enable autocompletion and register a custom completer.
 *
 * This implementation mimics Dev Tools behavior where autocomplete appears
 * immediately when typing inside quotes (e.g., after typing ").
 *
 * @param editor The Ace editor instance (from EuiCodeEditor onLoad)
 * @param fieldNames Array of index field names for the selected index
 */
export const setupAceAutocomplete = (editor: any, fieldNames: string[]): void => {
    if (!editor) {
        return;
    }

    // Load language_tools via ace.acequire
    const langTools = ace.acequire('ace/ext/language_tools');

    if (!langTools) {
        return;
    }

    // Enable autocompletion on the editor
    editor.setOptions({
        enableBasicAutocompletion: true,
        enableLiveAutocompletion: true,
    });

    // Create our custom completer that provides Query DSL and field completions
    const customCompleter = {
        // This regex allows the completer to match even with empty prefix (just after ")
        // The key is including empty string match to trigger on quote
        identifierRegexps: [
            /[a-zA-Z_0-9.\-$\u00A2-\uFFFF]/, // Support dots in field names
        ],
        getCompletions: (
            _editor: any,
            session: any,
            pos: any,
            currentPrefix: string,
            callback: (err: any, completions: CompletionItem[]) => void
        ) => {
            // Check if we're inside a string (after opening quote)
            const line = session.getLine(pos.row);
            const beforeCursor = line.substring(0, pos.column);

            // Count quotes to determine if we're inside a string
            // Look for the last unmatched opening quote
            let insideString = false;
            let quoteChar = '';
            for (let i = 0; i < beforeCursor.length; i++) {
                const char = beforeCursor[i];
                if ((char === '"' || char === "'") && (i === 0 || beforeCursor[i - 1] !== '\\')) {
                    if (!insideString) {
                        insideString = true;
                        quoteChar = char;
                    } else if (char === quoteChar) {
                        insideString = false;
                        quoteChar = '';
                    }
                }
            }

            // Strip surrounding quotes from the prefix if present
            const cleanPrefix = currentPrefix.replace(/^["']|["']$/g, '');

            // If inside a string or we have a prefix, provide completions
            if (insideString || cleanPrefix.length > 0) {
                const completions = buildCompletions(fieldNames, cleanPrefix);
                callback(null, completions);
            } else {
                callback(null, []);
            }
        },
    };

    // Use setCompleters to replace all completers with just ours
    // This is how Dev Tools does it - it gives us full control
    langTools.setCompleters([customCompleter]);

    // Track the last evaluated token to detect changes
    const stateKey = '__searchRelevanceAutocompleteState';
    if (!(editor as any)[stateKey]) {
        (editor as any)[stateKey] = {
            lastToken: null,
        };
    }
    const state = (editor as any)[stateKey];

    // Add a selection change listener to trigger autocomplete when appropriate
    // This mimics how Dev Tools triggers autocomplete
    const listenerKey = '__searchRelevanceChangeListener';
    if ((editor as any)[listenerKey]) {
        editor.getSession().selection.off('changeCursor', (editor as any)[listenerKey]);
    }

    const selectionChangeListener = () => {
        // Don't trigger if completer is already active
        if (editor.completer && editor.completer.activated) {
            return;
        }

        const pos = editor.getCursorPosition();
        const session = editor.getSession();
        const line = session.getLine(pos.row);
        const beforeCursor = line.substring(0, pos.column);

        // Check if we just typed a quote and are now inside it
        // Look for pattern where cursor is right after an opening quote
        const lastChar = beforeCursor.slice(-1);

        // Count quotes to see if we're inside a string
        let quoteCount = 0;
        for (let i = 0; i < beforeCursor.length; i++) {
            if (beforeCursor[i] === '"' && (i === 0 || beforeCursor[i - 1] !== '\\')) {
                quoteCount++;
            }
        }
        const insideString = quoteCount % 2 === 1;

        // Get current token
        const token = session.getTokenAt(pos.row, pos.column);
        const currentTokenKey = token ? `${pos.row}:${token.start}:${token.value}` : null;

        // If we're inside a string and either:
        // 1. Just entered (last char is quote)
        // 2. Token changed from last time
        if (insideString) {
            const shouldTrigger = lastChar === '"' || state.lastToken !== currentTokenKey;
            state.lastToken = currentTokenKey;

            if (shouldTrigger) {
                // Small delay to let editor state settle
                setTimeout(() => {
                    if (!(editor.completer && editor.completer.activated)) {
                        editor.execCommand('startAutocomplete');
                    }
                }, 50);
            }
        } else {
            state.lastToken = currentTokenKey;
        }
    };

    (editor as any)[listenerKey] = selectionChangeListener;
    editor.getSession().selection.on('changeCursor', selectionChangeListener);
};
