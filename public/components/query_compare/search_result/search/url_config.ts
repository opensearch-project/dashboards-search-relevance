/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

export const updateUrlWithConfig = (
  selectedIndex1: string,
  selectedIndex2: string,
  queryString1: string,
  queryString2: string,
  pipeline1: string,
  pipeline2: string,
  searchBarValue: string
) => {
  try {
    const config = {
      query1: {
        index: selectedIndex1,
        dsl_query: queryString1,
        search_pipeline: pipeline1 || undefined,
      },
      query2: {
        index: selectedIndex2,
        dsl_query: queryString2,
        search_pipeline: pipeline2 || undefined,
      },
      search: searchBarValue,
    };

    // Remove undefined values to keep the config clean
    if (!config.query1.search_pipeline) delete config.query1.search_pipeline;
    if (!config.query2.search_pipeline) delete config.query2.search_pipeline;

    // Encode configuration to base64
    const base64Config = btoa(JSON.stringify(config));

    // Create URL with configuration
    const newUrl = new URL(window.location);
    newUrl.hash = `#/?config=${base64Config}`;

    // Check URL length limit (2000 characters is a safe limit for most browsers)
    const MAX_URL_LENGTH = 2000;
    const urlString = newUrl.toString();

    if (urlString.length > MAX_URL_LENGTH) {
      // URL is too long, update without parameters
      console.log(
        'URL too long (' + urlString.length + ' characters), updating without config parameter'
      );
      newUrl.hash = '#/';
      window.history.replaceState({}, document.title, newUrl.toString());
      console.log('Updated URL without config (length limit exceeded):', newUrl.toString());
    } else {
      // URL is within safe length, update with configuration
      window.history.replaceState({}, document.title, urlString);
      console.log('Updated URL with config:', urlString);
    }
  } catch (e) {
    console.error('Failed to update URL with configuration:', e);
  }
};
