# CHANGELOG

Inspired from [Keep a Changelog](https://keepachangelog.com/en/1.0.0/)

## [Unreleased]

### Breaking Changes

### Features
* Improve experiment detail UI for schedule information. ([#809](https://github.com/opensearch-project/dashboards-search-relevance/pull/809))
* Show per-query OpenSearch search latency (took) in experiment results ([#942](https://github.com/opensearch-project/dashboards-search-relevance/issues/942))

### Enhancements
* Reduce O(n²) result matching in VisualComparison and connection lines by precomputing `_id` lookup maps ([#881](https://github.com/opensearch-project/dashboards-search-relevance/issues/881))
* Rename `%SearchText%` to `%queryText%` in Query Template ([#774](https://github.com/opensearch-project/dashboards-search-relevance/pull/774))

### Bug Fixes
* Fix scheduler failure when cron expression is null or empty in SRW experiments by adding proper validation and handling. ([#808](https://github.com/opensearch-project/dashboards-search-relevance/pull/808))
* Bug bugs on pairwise comparison experiment view page. ([#735]https://github.com/opensearch-project/dashboards-search-relevance/pull/735)
* Fix link to Pointwise Daily Scheduled Runs dashboard to set date range from first experiment to NOW to include the most recent run. ([#738]https://github.com/opensearch-project/dashboards-search-relevance/pull/738)
* Fix text alignment and excessive spacing in Query Analysis results view. ([#752](https://github.com/opensearch-project/dashboards-search-relevance/pull/752))
* Allow a single query setup to be executed in the search comparison UI. ([#746](https://github.com/opensearch-project/dashboards-search-relevance/pull/746))
* Fix error when deleting judgment ratings by ensuring the judgments list refreshes correctly and removes deleted entries from UI state. ([#751](https://github.com/opensearch-project/dashboards-search-relevance/pull/751))
* Fix generic error message when uploading malformed NDJSON query sets by surfacing detailed parsing error with line numbers. ([#776](https://github.com/opensearch-project/dashboards-search-relevance/pull/776))
* Escape cells in the document scores CSV export ([#957](https://github.com/opensearch-project/dashboards-search-relevance/pull/957))


### Infrastructure
* Fix Lychee link checking attempting to test a fake link. ([#962](https://github.com/opensearch-project/dashboards-search-relevance/pull/962))

- Install the functional test repository's pinned Cypress in the FTR E2E workflow ([#958](https://github.com/opensearch-project/dashboards-search-relevance/pull/958))

### Documentation

### Maintenance

### Refactoring
