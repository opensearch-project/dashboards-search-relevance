# CHANGELOG

Inspired from [Keep a Changelog](https://keepachangelog.com/en/1.0.0/)

## [Unreleased]

### Breaking Changes

### Features
* Show per-query OpenSearch search latency (took) in experiment results ([#942](https://github.com/opensearch-project/dashboards-search-relevance/issues/942))

### Enhancements
* Gate the `/search-relevance` chat command on data source availability; report an unsupported message when the workspace has no data source the Workbench can use (e.g. only AnalyticEngine data sources) ([#970](https://github.com/opensearch-project/dashboards-search-relevance/pull/970))
* Reduce O(n²) result matching in VisualComparison and connection lines by precomputing `_id` lookup maps ([#881](https://github.com/opensearch-project/dashboards-search-relevance/issues/881))
* Rename `%SearchText%` to `%queryText%` in Query Template ([#774](https://github.com/opensearch-project/dashboards-search-relevance/pull/774))
* Added missing tool tips for Recall, MRR and DCG metrics in the experiment results page. ([#967](https://github.com/opensearch-project/dashboards-search-relevance/pull/967)) 

### Bug Fixes
* Check the Search Relevance backend plugin in the `/search-relevance` command's data source availability check, matching the Workbench page ([#972](https://github.com/opensearch-project/dashboards-search-relevance/pull/972))
* Escape cells in the document scores CSV export ([#957](https://github.com/opensearch-project/dashboards-search-relevance/pull/957))

### Infrastructure
* Fix Lychee link checking attempting to test a fake link. ([#962](https://github.com/opensearch-project/dashboards-search-relevance/pull/962))
- Add SPDX license header checker and missing headers ([#941](https://github.com/opensearch-project/dashboards-search-relevance/pull/941))

- Install the functional test repository's pinned Cypress in the FTR E2E workflow ([#958](https://github.com/opensearch-project/dashboards-search-relevance/pull/958))

### Documentation

### Maintenance
* Add unit tests for ExperimentMetadataFields, previously untested (0% coverage) ([#968](https://github.com/opensearch-project/dashboards-search-relevance/pull/968))

### Refactoring
