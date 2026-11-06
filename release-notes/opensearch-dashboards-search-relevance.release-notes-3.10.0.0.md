## Version 3.10.0 Release Notes

Compatible with OpenSearch and OpenSearch Dashboards version 3.10.0

### Features

* Rename `%SearchText%` placeholder to `%queryText%` to align with Search Configuration index nomenclature, with backward compatibility for existing scripts ([#774](https://github.com/opensearch-project/dashboards-search-relevance/pull/774))
* Display per-query OpenSearch search latency in experiment results for comparing query performance across runs ([#959](https://github.com/opensearch-project/dashboards-search-relevance/pull/959))
* Gate the `/search-relevance` chat command on data source availability, returning a clear message when no compatible data source exists in the workspace ([#970](https://github.com/opensearch-project/dashboards-search-relevance/pull/970))

### Enhancements

* Add missing tooltips for MRR, Recall, and DCG metrics on the experiment summary page ([#967](https://github.com/opensearch-project/dashboards-search-relevance/pull/967))

### Bug Fixes

* Escape formula-injection characters in document scores CSV export to prevent spreadsheet apps from evaluating cell values as formulas ([#957](https://github.com/opensearch-project/dashboards-search-relevance/pull/957))

### Infrastructure

* Add unit tests for ExperimentMetadataFields, bringing coverage from 0% to 100% ([#968](https://github.com/opensearch-project/dashboards-search-relevance/pull/968))
* Fix Lychee link checker false positive on a URL used only in tests ([#962](https://github.com/opensearch-project/dashboards-search-relevance/pull/962))
* Pin Cypress version in the FTR E2E workflow to the functional test repository's lockfile to prevent breakage from upstream major releases ([#958](https://github.com/opensearch-project/dashboards-search-relevance/pull/958))

### Refactoring

* Replace O(n²) result matching in VisualComparison with precomputed ID lookup maps for improved performance with large result sets ([#910](https://github.com/opensearch-project/dashboards-search-relevance/pull/910))
