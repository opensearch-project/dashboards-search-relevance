## Version 3.4.0 Release Notes

Compatible with OpenSearch and OpenSearch Dashboards version 3.4.0

### Features
- Add scheduling and descheduling experiments in the UI ([#636](https://github.com/opensearch-project/dashboards-search-relevance/pull/636))
- Add support for agent search in pariwise comparison ([#693](https://github.com/opensearch-project/dashboards-search-relevance/pull/693))

### Enhancements
* Added client-side filtering in experiment list by `type` and `status`, in addition to `id` (GUID). ([#686](https://github.com/opensearch-project/dashboards-search-relevance/pull/686))
* Added GUID search support to the Search Configuration listing to allow filtering by configuration ID in addition to name. ([#685](https://github.com/opensearch-project/dashboards-search-relevance/pull/685))
* Added support for filtering Query Sets by GUID and aligned QuerySetItem typing with existing structure ([#687](https://github.com/opensearch-project/dashboards-search-relevance/pull/687))
* Added support for filtering Judgment Lists by GUID (`id`) in the search bar, improving discoverability and navigation when working with judgment identifiers. ([#687](https://github.com/opensearch-project/dashboards-search-relevance/pull/687))

* Use appropriate title on the Experiment Detail page. ([#670](https://github.com/opensearch-project/dashboards-search-relevance/pull/670))
