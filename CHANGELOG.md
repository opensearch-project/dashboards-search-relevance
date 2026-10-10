# CHANGELOG

Inspired from [Keep a Changelog](https://keepachangelog.com/en/1.0.0/)

## [Unreleased]

### Breaking Changes

### Features
* Show per-query OpenSearch search latency (took) in experiment results ([#942](https://github.com/opensearch-project/dashboards-search-relevance/issues/942))

### Enhancements
* Reduce O(n²) result matching in VisualComparison and connection lines by precomputing `_id` lookup maps ([#881](https://github.com/opensearch-project/dashboards-search-relevance/issues/881))
* Rename `%SearchText%` to `%queryText%` in Query Template ([#774](https://github.com/opensearch-project/dashboards-search-relevance/pull/774))

### Bug Fixes
* Escape cells in the document scores CSV export ([#957](https://github.com/opensearch-project/dashboards-search-relevance/pull/957))

### Infrastructure
* Fix Lychee link checking attempting to test a fake link. ([#962](https://github.com/opensearch-project/dashboards-search-relevance/pull/962))

- Install the functional test repository's pinned Cypress in the FTR E2E workflow ([#958](https://github.com/opensearch-project/dashboards-search-relevance/pull/958))

### Documentation

### Maintenance

### Refactoring
