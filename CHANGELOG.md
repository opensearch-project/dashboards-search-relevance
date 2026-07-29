# CHANGELOG

Inspired from [Keep a Changelog](https://keepachangelog.com/en/1.0.0/)

## [Unreleased]

### Breaking Changes

### Features

### Enhancements

### Bug Fixes

- Pass dataSourceId in Hybrid Optimizer and Pairwise experiment result queries so experiment views render on multi-data-source deployments ([#921](https://github.com/opensearch-project/dashboards-search-relevance/pull/921))
- Surface the backend reason (e.g. HTTP 409) when deleting a query set, judgment, or search configuration that is still used by an experiment, instead of a generic failure message ([#926](https://github.com/opensearch-project/dashboards-search-relevance/pull/926))
- Show the actual validation error when creating a search configuration instead of always reporting "Search returned no results" ([#926](https://github.com/opensearch-project/dashboards-search-relevance/pull/926))
- Fix experiment visualization/deep-dive install detection and Hybrid Optimizer result rendering on multi-data-source (OpenSearch UI) deployments ([#926](https://github.com/opensearch-project/dashboards-search-relevance/pull/926))

### Infrastructure

- Stabilize /search-relevance chat command unit test (avoid loading @osd/monaco) ([#927](https://github.com/opensearch-project/dashboards-search-relevance/pull/927))

### Documentation

### Maintenance

### Refactoring
