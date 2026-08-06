/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { CoreStart } from '../../../../../../src/core/public';
import { ServiceEndpoints } from '../../../../common';
import {
  AbTestItem,
  AbTestListItem,
  AbTestOption,
  AbTestSnapshot,
  ClickEvent,
  SearchConfigOption,
} from '../types';

/** System index holding both the A/B test records and their version snapshots. */
const AB_TEST_INDEX = '.plugins-search-relevance-ab-test';
const SEARCH_CONFIG_INDEX = 'search-relevance-search-config';

export interface CreateAbTestData {
  name: string;
  searchConfigurationA: string;
  searchConfigurationB: string;
  size: number;
}

export interface UpdateAbTestData {
  search_configuration_a?: string;
  search_configuration_b?: string;
  enabled?: boolean;
}

/**
 * Data access for the A/B testing (team draft interleaving) pages.
 *
 * Follows the same shape as the other feature services in this plugin: constructed with `http`,
 * one method per operation, returning view-ready shapes so components never touch raw hit
 * envelopes.
 */
export class AbTestService {
  constructor(private http: CoreStart['http']) {}

  /** Runs a query against an index through the generic search proxy. */
  private async searchIndex(index: string, query: any, size: number): Promise<any[]> {
    const response = (await this.http.post(ServiceEndpoints.GetSearchResults, {
      body: JSON.stringify({ query1: { index, query, size } }),
    })) as any;
    return response?.result1?.hits?.hits || [];
  }

  /** Maps a raw A/B test hit onto the view model. */
  private static toAbTestItem(hit: any): AbTestItem {
    return {
      id: hit._id,
      name: hit._source?.name || hit._id,
      size: hit._source?.size || 10,
      enabled: hit._source?.enabled !== false,
      testId: hit._source?.test_id || hit._id,
      configA: hit._source?.search_configuration_a || '',
      configB: hit._source?.search_configuration_b || '',
      createdAt: hit._source?.created_at || '',
      updatedAt: hit._source?.updated_at || '',
    };
  }

  /**
   * Search configurations available to assign to a test. De-duplicated by id, since the same
   * configuration can otherwise appear twice in the combo box.
   */
  async fetchSearchConfigurations(): Promise<SearchConfigOption[]> {
    const response = (await this.http.get(ServiceEndpoints.SearchConfigurations)) as any;
    const configs = response?.hits?.hits || [];
    const seen = new Set<string>();
    return configs
      .map((config: any) => ({
        label: config._source?.name || config._id,
        value: config._id,
      }))
      .filter((option: SearchConfigOption) => {
        if (seen.has(option.value)) return false;
        seen.add(option.value);
        return true;
      });
  }

  /** Raw search configuration documents, used when the stored query JSON itself is needed. */
  async fetchSearchConfigurationQueries(
    configAId: string,
    configBId: string
  ): Promise<{ queryA: string; queryB: string; nameA: string; nameB: string }> {
    const response = (await this.http.get(ServiceEndpoints.SearchConfigurations)) as any;
    const configs = response?.hits?.hits || [];
    const configA = configs.find((c: any) => c._id === configAId);
    const configB = configs.find((c: any) => c._id === configBId);
    return {
      queryA: configA?._source?.query || '',
      queryB: configB?._source?.query || '',
      nameA: configA?._source?.name || configAId || '',
      nameB: configB?._source?.name || configBId || '',
    };
  }

  /** Indices whose name contains "ubi", i.e. candidates for storing click events. */
  async fetchUbiIndices(): Promise<SearchConfigOption[]> {
    const response = (await this.http.get(ServiceEndpoints.GetIndexes)) as any;
    return (response || [])
      .map((item: any) => (typeof item === 'string' ? item : item.index))
      .filter((index: string) => index && index.toLowerCase().includes('ubi'))
      .map((index: string) => ({ label: index, value: index }));
  }

  /** All A/B tests as listing rows, optionally filtered by a client-side search term. */
  async findAbTests(searchTerm?: string): Promise<{ total: number; hits: AbTestListItem[] }> {
    const hits = await this.searchIndex(AB_TEST_INDEX, { match_all: {} }, 100);
    let tests: AbTestListItem[] = hits
      .filter((hit: any) => hit._source?.doc_type === 'ab_test')
      .map((hit: any) => ({
        id: hit._id,
        test_id: hit._source?.test_id || hit._id,
        name: hit._source?.name || hit._id,
        size: hit._source?.size || 10,
        status: hit._source?.enabled !== false ? 'Active' : 'Disabled',
        timestamp: hit._source?.created_at || '',
      }));

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      tests = tests.filter(
        (test) =>
          test.name.toLowerCase().includes(term) || test.test_id.toLowerCase().includes(term)
      );
    }
    return { total: tests.length, hits: tests };
  }

  /**
   * A/B tests as combo box options, including each configuration's per-request UUID so the
   * results page can label buckets by identity instead of by position.
   */
  async fetchAbTestOptions(): Promise<AbTestOption[]> {
    const hits = await this.searchIndex(AB_TEST_INDEX, { match_all: {} }, 100);
    return hits
      .filter((hit: any) => hit._source?.doc_type === 'ab_test')
      .map((hit: any) => ({
        label: hit._source?.name || hit._id,
        value: hit._source?.test_id || hit._id,
        configAUuid: hit._source?.config_a_uuid,
        configBUuid: hit._source?.config_b_uuid,
      }));
  }

  /** A single A/B test, or null when the id matches nothing. */
  async fetchAbTest(testId: string): Promise<AbTestItem | null> {
    const hits = await this.searchIndex(AB_TEST_INDEX, { ids: { values: [testId] } }, 1);
    return hits.length > 0 ? AbTestService.toAbTestItem(hits[0]) : null;
  }

  /** Display name of a search configuration, falling back to its id. */
  async fetchSearchConfigurationName(configId: string): Promise<string> {
    if (!configId) return '-';
    try {
      const hits = await this.searchIndex(SEARCH_CONFIG_INDEX, { ids: { values: [configId] } }, 1);
      return hits.length > 0 ? hits[0]._source?.name || configId : configId;
    } catch {
      return configId;
    }
  }

  /** Version snapshots recorded each time a test's configurations changed. */
  async fetchSnapshots(testId: string): Promise<AbTestSnapshot[]> {
    const hits = await this.searchIndex(
      AB_TEST_INDEX,
      { bool: { must: [{ term: { test_id: testId } }, { term: { doc_type: 'snapshot' } }] } },
      50
    );
    return hits.map((hit: any) => ({
      id: hit._id,
      // The backend stores `created` at the top level of the snapshot, not inside `record`.
      created: hit._source?.created || '',
      configA: hit._source?.record?.search_configuration_a || '',
      configB: hit._source?.record?.search_configuration_b || '',
      enabled: hit._source?.record?.enabled,
    }));
  }

  /** Creates a test, deriving its id from the name. Returns the id it was stored under. */
  async createAbTest(data: CreateAbTestData): Promise<string> {
    const testId = data.name.trim().replace(/\s+/g, '-').toLowerCase();
    await this.http.put(`${ServiceEndpoints.AbTests}/${testId}`, {
      body: JSON.stringify({
        name: data.name.trim(),
        search_configuration_a: data.searchConfigurationA,
        search_configuration_b: data.searchConfigurationB,
        size: data.size,
      }),
    });
    return testId;
  }

  async updateAbTest(testId: string, data: UpdateAbTestData): Promise<void> {
    await this.http.put(`${ServiceEndpoints.AbTests}/${testId}/_update`, {
      body: JSON.stringify(data),
    });
  }

  async deleteAbTest(testId: string): Promise<void> {
    await this.http.delete(`${ServiceEndpoints.AbTests}/${testId}`);
  }

  /** Runs an interleaved search and returns the merged hit list. */
  async search(testId: string, searchText: string): Promise<any[]> {
    const response = (await this.http.post(`${ServiceEndpoints.AbTests}/${testId}/_search`, {
      body: JSON.stringify({ query_params: { SearchText: searchText.trim() } }),
    })) as any;
    return response?.hits || [];
  }

  async registerClick(event: ClickEvent): Promise<void> {
    await this.http.post(`${ServiceEndpoints.AbTests}/register_click`, {
      body: JSON.stringify({
        test_id: event.testId,
        search_configuration_uuid: event.searchConfigurationUuid,
        doc_id: event.docId,
        title: event.title,
        position: event.position,
        ubi_index: event.ubiIndex,
      }),
    });
  }

  /**
   * Click counts per configuration UUID. Returned as raw aggregation buckets, ordered by
   * doc_count by OpenSearch — callers must map them onto A/B by UUID, not by position.
   */
  async fetchClickAggregation(
    index: string,
    testId: string
  ): Promise<Array<{ key: string; doc_count: number }>> {
    const response = (await this.http.post(`${ServiceEndpoints.AbTests}/results`, {
      body: JSON.stringify({ index, test_id: testId }),
    })) as any;
    return response?.aggregations?.clicks_per_config?.buckets || [];
  }

  /** True when the index exists and can be queried. */
  async checkIndexExists(index: string): Promise<boolean> {
    try {
      await this.searchIndex(index.trim(), { match_all: {} }, 0);
      return true;
    } catch {
      return false;
    }
  }

  async createUbiIndex(index: string, mapping?: any): Promise<void> {
    await this.http.put(`${ServiceEndpoints.AbTests}/ubi_index`, {
      body: JSON.stringify({ index: index.trim(), mapping }),
    });
  }
}
