# CHANGELOG

Inspired from [Keep a Changelog](https://keepachangelog.com/en/1.0.0/)

## [Unreleased]

### Breaking Changes

### Features
* Add UI support for uploading Judgment Sets via CSV, including parsing and preview before creating the judgment list. ([#715](https://github.com/opensearch-project/dashboards-search-relevance/pull/715))
* Support manually creating a Query Set using plain text, key-value, or NDJSON input directly in the UI. ([#754](https://github.com/opensearch-project/dashboards-search-relevance/pull/754))

- Add edit capability for experiment name and description in the Search Relevance Workbench (detail view modal with validation, auto-generated name indicator, edits blocked while status is processing; dashboards proxy for `PATCH /api/relevancy/experiments/:id`). ([#828](https://github.com/opensearch-project/dashboards-search-relevance/pull/828))

### Enhancements

### Bug Fixes

### Infrastructure

### Documentation

### Maintenance
* Fix Linux workflow Node.js setup for OpenSearch Dashboards compatibility ([#839](https://github.com/opensearch-project/dashboards-search-relevance/pull/839))


### Refactoring
