/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

const IMAGE_REGEX = /\.(jpg|jpeg|png|gif|svg|webp)($|\?)/i;

export const isImageUrlFieldValue = (value: unknown): value is string =>
  typeof value === 'string' && IMAGE_REGEX.test(value);
