/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  BASE_EXPERIMENT_NODE_API_PATH,
  BASE_QUERYSET_NODE_API_PATH,
  BASE_SEARCH_CONFIG_NODE_API_PATH,
} from '../common';

export const postQuerySet = async (name: string, description: string, http: any) => {
  try {
    return await http.post(`..${BASE_QUERYSET_NODE_API_PATH}`, {
      body: JSON.stringify({
        name,
        description,
      }),
    });
  } catch (e) {
    return e;
  }
};

export const getQuerySet = async (id: string, http: any) => {
  try {
    const response = await http.get(`..${BASE_QUERYSET_NODE_API_PATH}/${id}`);
    // TODO: add logs for debugging, please remove before release
    // eslint-disable-next-line no-console
    console.log('GET Response:', response);
    return response;
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('GET Error:', e);
    return e;
  }
};

export const listQuerySets = async (http: any) => {
  try {
    return await http.get(`..${BASE_QUERYSET_NODE_API_PATH}`);
  } catch (e) {
    return e;
  }
};

export const deleteQuerySet = async (id: string, http: any) => {
  try {
    return await http.delete(`..${BASE_QUERYSET_NODE_API_PATH}/${id}`);
  } catch (e) {
    return e;
  }
};

export const postSearchConfig = async (name: string, description: string, http: any) => {
  try {
    return await http.post(`..${BASE_SEARCH_CONFIG_NODE_API_PATH}`, {
      body: JSON.stringify({
        name,
        description,
      }),
    });
  } catch (e) {
    return e;
  }
};

export const getSearchConfig = async (id: string, http: any) => {
  try {
    return await http.get(`..${BASE_SEARCH_CONFIG_NODE_API_PATH}/${id}`);
  } catch (e) {
    return e;
  }
};

export const listSearchConfig = async (http: any) => {
  try {
    return await http.get(`..${BASE_SEARCH_CONFIG_NODE_API_PATH}`);
  } catch (e) {
    return e;
  }
};

export const deleteSearchConfig = async (id: string, http: any) => {
  try {
    return await http.delete(`..${BASE_SEARCH_CONFIG_NODE_API_PATH}/${id}`);
  } catch (e) {
    return e;
  }
};

export const postExperiment = async (name: string, description: string, http: any) => {
  try {
    return await http.post(`..${BASE_EXPERIMENT_NODE_API_PATH}`, {
      body: JSON.stringify({
        name,
        description,
      }),
    });
  } catch (e) {
    return e;
  }
};

export const getExperiment = async (id: string, http: any) => {
  try {
    return await http.get(`..${BASE_EXPERIMENT_NODE_API_PATH}/${id}`);
  } catch (e) {
    return e;
  }
};

export const listExperiment = async (http: any) => {
  try {
    return await http.get(`..${BASE_EXPERIMENT_NODE_API_PATH}`);
  } catch (e) {
    return e;
  }
};

export const deleteExperiment = async (id: string, http: any) => {
  try {
    return await http.delete(`..${BASE_EXPERIMENT_NODE_API_PATH}/${id}`);
  } catch (e) {
    return e;
  }
};
