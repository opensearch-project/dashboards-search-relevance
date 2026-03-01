# CHANGELOG

Inspired from [Keep a Changelog](https://keepachangelog.com/en/1.0.0/)

## [Unreleased]

### Breaking Changes

### Features
* Support manually creating a Query Set using plain text, key-value, or NDJSON input directly in the UI. ([#754](https://github.com/opensearch-project/dashboards-search-relevance/pull/754))

### Enhancements
* Standardize Action button tooltips across all listing pages (Search Configurations, Experiments, Judgments, Query Sets) using `EuiToolTip` for improved UX and accessibility. ([#782](https://github.com/opensearch-project/dashboards-search-relevance/pull/782))

### Bug Fixes
* Bug bugs on pairwise comparison experiment view page. ([#735]https://github.com/opensearch-project/dashboards-search-relevance/pull/735)
* Fix link to Pointwise Daily Scheduled Runs dashboard to set date range from first experiment to NOW to include the most recent run. ([#738]https://github.com/opensearch-project/dashboards-search-relevance/pull/738)
* Fix text alignment and excessive spacing in Single Query Comparison results view. ([#752](https://github.com/opensearch-project/dashboards-search-relevance/pull/752))
* Allow a single query setup to be executed in the search comparison UI. ([#746](https://github.com/opensearch-project/dashboards-search-relevance/pull/746))
* Fix error when deleting judgment ratings by ensuring the judgments list refreshes correctly and removes deleted entries from UI state. ([#751](https://github.com/opensearch-project/dashboards-search-relevance/pull/751))

### Infrastructure

### Documentation

### Maintenance
* React 18 compatibility updates for dashboards-search-relevance plugin ([#741](https://github.com/opensearch-project/dashboards-search-relevance/pull/741))

### Refactoring