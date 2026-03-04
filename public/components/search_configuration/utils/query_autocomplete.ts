/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

// Import brace and its language_tools extension for their side effects.
// brace sets window.ace globally, and the ext import registers language_tools.
import 'brace';
import 'brace/ext/language_tools';

// Access ace via window global (set by brace)
const getAce = (): any => (window as any).ace;

/**
 * Curated list of OpenSearch Query DSL keywords for autocomplete.
 * These cover the most commonly used query types and clauses.
 */
export const QUERY_DSL_KEYWORDS: string[] = [
    // Top-level
    'query',
    'size',
    'from',
    'sort',
    'aggs',
    'aggregations',
    'highlight',
    '_source',
    'script_fields',
    'post_filter',
    'rescore',
    'explain',
    'min_score',
    'track_total_hits',

    // Compound queries
    'bool',
    'must',
    'must_not',
    'should',
    'filter',
    'minimum_should_match',
    'boost',

    // Full-text queries
    'match',
    'match_phrase',
    'match_phrase_prefix',
    'multi_match',
    'query_string',
    'simple_query_string',
    'match_all',
    'match_none',
    'match_bool_prefix',
    'combined_fields',

    // Term-level queries
    'term',
    'terms',
    'range',
    'exists',
    'prefix',
    'wildcard',
    'regexp',
    'fuzzy',
    'ids',
    'type',

    // Joining queries
    'nested',
    'has_child',
    'has_parent',
    'parent_id',

    // Specialized queries
    'more_like_this',
    'script',
    'script_score',
    'function_score',
    'percolate',
    'wrapper',
    'distance_feature',
    'rank_feature',

    // Neural / ML queries
    'neural',
    'hybrid',
    'knn',

    // Common parameters
    'analyzer',
    'fields',
    'fuzziness',
    'operator',
    'zero_terms_query',
    'cutoff_frequency',
    'auto_generate_synonyms_phrase_query',
    'lenient',
    'max_expansions',
    'prefix_length',
    'slop',
    'tie_breaker',
    'type',

    // Range parameters
    'gte',
    'gt',
    'lte',
    'lt',
    'format',

    // Sort parameters
    'order',
    'mode',
    'missing',
    'unmapped_type',

    // Highlight parameters
    'pre_tags',
    'post_tags',
    'fragment_size',
    'number_of_fragments',

    // Source filtering
    'includes',
    'excludes',
];

/**
 * A single autocomplete completion item.
 */
export interface CompletionItem {
    /** The text to display and insert */
    caption: string;
    /** The text value to insert on selection */
    value: string;
    /** Metadata label (e.g., "field" or "keyword") */
    meta: string;
    /** Score for ordering (higher = higher priority) */
    score: number;
}

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

    const fieldCompletions: CompletionItem[] = fieldNames
        .filter((name) => name.toLowerCase().includes(lowerPrefix))
        .map((name) => ({
            caption: name,
            value: `"${name}"`,
            meta: 'field',
            score: 1000, // Fields get higher priority
        }));

    const keywordCompletions: CompletionItem[] = QUERY_DSL_KEYWORDS.filter((keyword) =>
        keyword.toLowerCase().includes(lowerPrefix)
    ).map((keyword) => ({
        caption: keyword,
        value: `"${keyword}"`,
        meta: 'keyword',
        score: 500,
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
 * @param editor The Ace editor instance (from EuiCodeEditor onLoad)
 * @param fieldNames Array of index field names for the selected index
 */
export const setupAceAutocomplete = (editor: any, fieldNames: string[]): void => {
    if (!editor) {
        return;
    }

    // Load language_tools via the window.ace global (set by brace import)
    const aceGlobal = getAce();
    let langTools: any = null;
    if (aceGlobal) {
        if (typeof aceGlobal.acequire === 'function') {
            langTools = aceGlobal.acequire('ace/ext/language_tools');
        } else if (typeof aceGlobal.require === 'function') {
            langTools = aceGlobal.require('ace/ext/language_tools');
        }
    }

    if (langTools) {
        // Enable autocompletion on the editor
        editor.setOptions({
            enableBasicAutocompletion: true,
            enableLiveAutocompletion: true,
        });
    }

    // Ensure completers array exists (language_tools should create it)
    if (!editor.completers) {
        editor.completers = [];
    }

    // Remove any previously registered custom completer
    editor.completers = editor.completers.filter(
        (c: any) => c.__searchRelevanceCompleter !== true
    );

    const customCompleter = {
        __searchRelevanceCompleter: true,
        identifierRegexps: [
            /[a-zA-Z_0-9.\-$\u00A2-\uFFFF]/, // Support dots in field names
        ],
        getCompletions: (
            _editor: any,
            _session: any,
            _pos: any,
            currentPrefix: string,
            callback: (err: any, completions: CompletionItem[]) => void
        ) => {
            // Strip surrounding quotes from the prefix if present
            const cleanPrefix = currentPrefix.replace(/^["']|["']$/g, '');
            const completions = buildCompletions(fieldNames, cleanPrefix);
            callback(null, completions);
        },
    };

    editor.completers.push(customCompleter);
};
