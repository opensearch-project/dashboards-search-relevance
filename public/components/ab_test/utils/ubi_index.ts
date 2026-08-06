/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

/** Index UBI click events are written to unless the user picks another one. */
export const DEFAULT_UBI_INDEX = 'ubi_events';

/**
 * The chosen UBI index is kept in local storage so the Search, Results and UBI configuration
 * pages agree on which index clicks go to without threading it through the router.
 */
export const UBI_INDEX_STORAGE_KEY = 'ubi_index_name';

export const readStoredUbiIndex = (): string =>
  localStorage.getItem(UBI_INDEX_STORAGE_KEY) || DEFAULT_UBI_INDEX;

export const storeUbiIndex = (index: string): void => {
  localStorage.setItem(UBI_INDEX_STORAGE_KEY, index);
};

/**
 * Mapping the UBI click index needs for A/B results to aggregate correctly. The two fields the
 * results aggregation depends on are `search_configuration_uuid` and `ab_test_id`, both keyword.
 */
export const DEFAULT_UBI_MAPPING = {
  mappings: {
    properties: {
      action_name: { type: 'keyword' },
      timestamp: { type: 'date' },
      event_attributes: {
        properties: {
          object: {
            properties: {
              id: { type: 'keyword' },
              search_configuration_uuid: { type: 'keyword' },
            },
          },
          position: {
            properties: {
              ordinal: { type: 'integer' },
            },
          },
          ab_test_id: { type: 'keyword' },
        },
      },
    },
  },
};
