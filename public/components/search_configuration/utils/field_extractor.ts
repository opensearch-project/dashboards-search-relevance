/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Represents a field extracted from an index mapping.
 */
export interface IndexField {
    /** Dot-separated field path (e.g., "title", "title.keyword", "address.city") */
    name: string;
    /** OpenSearch field type (e.g., "text", "keyword", "integer") */
    type: string;
}

/**
 * Recursively extracts all field names and their types from an OpenSearch mapping response.
 *
 * Handles:
 * - Flat properties (text, keyword, integer, etc.)
 * - Multi-fields (e.g., title with title.keyword subfield)
 * - Nested/object properties with dot-separated paths
 * - Multiple index mappings (takes the first index)
 *
 * @param mappingResponse The raw response from the indices.getMapping API
 * @returns A sorted array of IndexField objects
 */
export const extractFieldsFromMappings = (mappingResponse: Record<string, any>): IndexField[] => {
    if (!mappingResponse || typeof mappingResponse !== 'object') {
        return [];
    }

    // Get the first index from the response
    const indexNames = Object.keys(mappingResponse);
    if (indexNames.length === 0) {
        return [];
    }

    const indexMapping = mappingResponse[indexNames[0]];
    const properties = indexMapping?.mappings?.properties;

    if (!properties || typeof properties !== 'object') {
        return [];
    }

    const fields: IndexField[] = [];
    collectFields(properties, '', fields);

    // Sort alphabetically for consistent ordering
    return fields.sort((a, b) => a.name.localeCompare(b.name));
};

/**
 * Recursively collects fields from a properties object, building dot-separated paths.
 */
function collectFields(
    properties: Record<string, any>,
    prefix: string,
    fields: IndexField[]
): void {
    for (const [fieldName, fieldDef] of Object.entries(properties)) {
        if (!fieldDef || typeof fieldDef !== 'object') {
            continue;
        }

        const fullPath = prefix ? `${prefix}.${fieldName}` : fieldName;
        const fieldType = fieldDef.type as string | undefined;

        // Add the field itself if it has a type
        if (fieldType) {
            fields.push({ name: fullPath, type: fieldType });
        }

        // Recurse into nested/object properties
        if (fieldDef.properties && typeof fieldDef.properties === 'object') {
            // If no explicit type but has properties, it's an object type
            if (!fieldType) {
                fields.push({ name: fullPath, type: 'object' });
            }
            collectFields(fieldDef.properties, fullPath, fields);
        }

        // Handle multi-fields (e.g., title.keyword)
        if (fieldDef.fields && typeof fieldDef.fields === 'object') {
            for (const [subFieldName, subFieldDef] of Object.entries(fieldDef.fields)) {
                if (subFieldDef && typeof subFieldDef === 'object' && (subFieldDef as any).type) {
                    fields.push({
                        name: `${fullPath}.${subFieldName}`,
                        type: (subFieldDef as any).type,
                    });
                }
            }
        }
    }
}

/**
 * Extracts just the field names (without types) from a mapping response.
 * This is the primary function used for autocomplete suggestions.
 *
 * @param mappingResponse The raw response from the indices.getMapping API
 * @returns A sorted array of field name strings
 */
export const extractFieldNames = (mappingResponse: Record<string, any>): string[] => {
    return extractFieldsFromMappings(mappingResponse).map((field) => field.name);
};
