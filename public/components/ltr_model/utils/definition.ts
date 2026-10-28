/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * RankLib models are a plain-text format; the other three parsers all take JSON. The store
 * itself accepts either shape for any type -- `definition` is declared
 * OBJECT_ARRAY_OR_STRING -- so nothing rejects a RankLib model pasted as JSON or an XGBoost
 * model pasted as a quoted string. That leniency is what makes a typo silent until query
 * time, so the upload form holds the line here instead.
 */
export const isJsonModelType = (modelType: string): boolean =>
  Boolean(modelType) && modelType !== 'model/ranklib';

export interface ParsedDefinition {
  /** The value to send, already in the shape `_createmodel` should store. */
  value?: any;
  /** Set when the text cannot be sent as the given type. */
  error?: string;
}

/**
 * Turns the pasted text into what goes on the wire: parsed JSON for the JSON model types,
 * the text verbatim for RankLib. Sending parsed JSON rather than a string keeps a model
 * uploaded here byte-identical in the store to the same model created with curl.
 */
export const parseDefinition = (modelType: string, text: string): ParsedDefinition => {
  const trimmed = text?.trim() ?? '';
  if (!trimmed) {
    return { error: 'A model definition is required.' };
  }

  if (!isJsonModelType(modelType)) {
    // Verbatim, not trimmed: RankLib definitions are whitespace-significant.
    return { value: text };
  }

  try {
    return { value: JSON.parse(trimmed) };
  } catch (err) {
    return { error: `${modelType} definitions must be valid JSON. ${(err as Error).message}` };
  }
};
