/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { extractFieldsFromMappings, extractFieldNames } from '../utils/field_extractor';

describe('extractFieldsFromMappings', () => {
    it('should return empty array for null input', () => {
        expect(extractFieldsFromMappings(null as any)).toEqual([]);
    });

    it('should return empty array for undefined input', () => {
        expect(extractFieldsFromMappings(undefined as any)).toEqual([]);
    });

    it('should return empty array for non-object input', () => {
        expect(extractFieldsFromMappings('string' as any)).toEqual([]);
    });

    it('should return empty array for empty object', () => {
        expect(extractFieldsFromMappings({})).toEqual([]);
    });

    it('should return empty array when mapping has no properties', () => {
        const mapping = {
            'my-index': {
                mappings: {},
            },
        };
        expect(extractFieldsFromMappings(mapping)).toEqual([]);
    });

    it('should return empty array when properties is not an object', () => {
        const mapping = {
            'my-index': {
                mappings: {
                    properties: 'invalid',
                },
            },
        };
        expect(extractFieldsFromMappings(mapping as any)).toEqual([]);
    });

    it('should extract simple flat fields', () => {
        const mapping = {
            'my-index': {
                mappings: {
                    properties: {
                        title: { type: 'text' },
                        count: { type: 'integer' },
                        active: { type: 'boolean' },
                    },
                },
            },
        };

        const result = extractFieldsFromMappings(mapping);
        expect(result).toEqual([
            { name: 'active', type: 'boolean' },
            { name: 'count', type: 'integer' },
            { name: 'title', type: 'text' },
        ]);
    });

    it('should extract multi-fields (e.g., title with title.keyword)', () => {
        const mapping = {
            'my-index': {
                mappings: {
                    properties: {
                        title: {
                            type: 'text',
                            fields: {
                                keyword: { type: 'keyword', ignore_above: 256 },
                                raw: { type: 'keyword' },
                            },
                        },
                    },
                },
            },
        };

        const result = extractFieldsFromMappings(mapping);
        expect(result).toEqual([
            { name: 'title', type: 'text' },
            { name: 'title.keyword', type: 'keyword' },
            { name: 'title.raw', type: 'keyword' },
        ]);
    });

    it('should extract nested/object properties with dot-separated paths', () => {
        const mapping = {
            'my-index': {
                mappings: {
                    properties: {
                        address: {
                            properties: {
                                city: { type: 'keyword' },
                                zip: { type: 'keyword' },
                            },
                        },
                    },
                },
            },
        };

        const result = extractFieldsFromMappings(mapping);
        expect(result).toEqual([
            { name: 'address', type: 'object' },
            { name: 'address.city', type: 'keyword' },
            { name: 'address.zip', type: 'keyword' },
        ]);
    });

    it('should handle nested type with properties', () => {
        const mapping = {
            'my-index': {
                mappings: {
                    properties: {
                        comments: {
                            type: 'nested',
                            properties: {
                                author: { type: 'keyword' },
                                text: { type: 'text' },
                            },
                        },
                    },
                },
            },
        };

        const result = extractFieldsFromMappings(mapping);
        expect(result).toEqual([
            { name: 'comments', type: 'nested' },
            { name: 'comments.author', type: 'keyword' },
            { name: 'comments.text', type: 'text' },
        ]);
    });

    it('should handle deeply nested structures', () => {
        const mapping = {
            'my-index': {
                mappings: {
                    properties: {
                        level1: {
                            properties: {
                                level2: {
                                    properties: {
                                        level3: { type: 'keyword' },
                                    },
                                },
                            },
                        },
                    },
                },
            },
        };

        const result = extractFieldsFromMappings(mapping);
        expect(result).toEqual([
            { name: 'level1', type: 'object' },
            { name: 'level1.level2', type: 'object' },
            { name: 'level1.level2.level3', type: 'keyword' },
        ]);
    });

    it('should use the first index when multiple indexes are present', () => {
        const mapping = {
            'index-a': {
                mappings: {
                    properties: {
                        field_a: { type: 'text' },
                    },
                },
            },
            'index-b': {
                mappings: {
                    properties: {
                        field_b: { type: 'text' },
                    },
                },
            },
        };

        const result = extractFieldsFromMappings(mapping);
        // Should only contain fields from the first index
        expect(result).toEqual([{ name: 'field_a', type: 'text' }]);
    });

    it('should skip field entries without type and without properties', () => {
        const mapping = {
            'my-index': {
                mappings: {
                    properties: {
                        valid_field: { type: 'text' },
                        invalid_field: {},
                        null_field: null,
                    },
                },
            },
        };

        const result = extractFieldsFromMappings(mapping);
        expect(result).toEqual([{ name: 'valid_field', type: 'text' }]);
    });

    it('should handle a realistic ecommerce-like mapping', () => {
        const mapping = {
            ecommerce: {
                mappings: {
                    properties: {
                        product_name: {
                            type: 'text',
                            fields: {
                                keyword: { type: 'keyword' },
                            },
                        },
                        price: { type: 'float' },
                        category: { type: 'keyword' },
                        metadata: {
                            properties: {
                                created_at: { type: 'date' },
                                tags: { type: 'keyword' },
                            },
                        },
                    },
                },
            },
        };

        const result = extractFieldsFromMappings(mapping);
        expect(result).toEqual([
            { name: 'category', type: 'keyword' },
            { name: 'metadata', type: 'object' },
            { name: 'metadata.created_at', type: 'date' },
            { name: 'metadata.tags', type: 'keyword' },
            { name: 'price', type: 'float' },
            { name: 'product_name', type: 'text' },
            { name: 'product_name.keyword', type: 'keyword' },
        ]);
    });

    it('should sort results alphabetically', () => {
        const mapping = {
            'my-index': {
                mappings: {
                    properties: {
                        zebra: { type: 'keyword' },
                        alpha: { type: 'text' },
                        middle: { type: 'integer' },
                    },
                },
            },
        };

        const result = extractFieldsFromMappings(mapping);
        const names = result.map((f) => f.name);
        expect(names).toEqual(['alpha', 'middle', 'zebra']);
    });
});

describe('extractFieldNames', () => {
    it('should return only field name strings', () => {
        const mapping = {
            'my-index': {
                mappings: {
                    properties: {
                        title: { type: 'text' },
                        count: { type: 'integer' },
                    },
                },
            },
        };

        const result = extractFieldNames(mapping);
        expect(result).toEqual(['count', 'title']);
    });

    it('should return empty array for empty mappings', () => {
        expect(extractFieldNames({})).toEqual([]);
    });

    it('should include subfield names', () => {
        const mapping = {
            'my-index': {
                mappings: {
                    properties: {
                        title: {
                            type: 'text',
                            fields: {
                                keyword: { type: 'keyword' },
                            },
                        },
                    },
                },
            },
        };

        const result = extractFieldNames(mapping);
        expect(result).toEqual(['title', 'title.keyword']);
    });
});
