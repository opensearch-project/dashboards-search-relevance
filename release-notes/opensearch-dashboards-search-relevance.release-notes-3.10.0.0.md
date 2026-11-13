## Version 3.10.0 Release Notes

Compatible with OpenSearch and OpenSearch Dashboards version 3.10.0

### Features

* Rename `%SearchText%` placeholder to `%queryText%` to align with Search Configuration index nomenclature, with backward compatibility for existing scripts ([#774](https://github.com/opensearch-project/dashboards-search-relevance/pull/774))
* Display per-query OpenSearch search latency in experiment results for comparing query performance across runs ([#959](https://github.com/opensearch-project/dashboards-search-relevance/pull/959))
* Gate the `/search-relevance` chat command on data source availability, returning a clear message when no compatible data source exists in the workspace ([#970](https://github.com/opensearch-project/dashboards-search-relevance/pull/970))

### Enhancements

* Add missing tooltips for MRR, Recall, and DCG metrics on the experiment summary page ([#967](https://github.com/opensearch-project/dashboards-search-relevance/pull/967))

### Bug Fixes

* Escape formula-triggering characters in document scores CSV export to prevent spreadsheet injection ([#957](https://github.com/opensearch-project/dashboards-search-relevance/pull/957))

### Infrastructure

* Ignore test-only link in Lychee link checker to fix build ([#962](https://github.com/opensearch-project/dashboards-search-relevance/pull/962))
* Install the functional test repository's pinned Cypress version in the FTR E2E workflow to prevent breakage from upstream major releases ([#958](https://github.com/opensearch-project/dashboards-search-relevance/pull/958))
* Add unit tests for ExperimentMetadataFields, increasing coverage from 0% to 100% ([#968](https://github.com/opensearch-project/dashboards-search-relevance/pull/968))

### Refactoring

* Reduce O(n²) result matching in VisualComparison by replacing repeated array scans with precomputed ID lookup maps ([#910](https://github.com/opensearch-project/dashboards-search-relevance/pull/910))
