# CHANGELOG

Inspired from [Keep a Changelog](https://keepachangelog.com/en/1.0.0/)

## [Unreleased]

### Breaking Changes

### Features

### Enhancements

### Bug Fixes

- Pass dataSourceId in Hybrid Optimizer and Pairwise experiment result queries so experiment views render on multi-data-source deployments ([#921](https://github.com/opensearch-project/dashboards-search-relevance/pull/921))
- Query Analysis: fetch search configurations from the selected data source so the Search Configuration dropdown is populated on multi-data-source deployments. Judgments: show a clear error for the COEC click model when no UBI events data is available, while keeping the UBI Events Index optional (COEC uses the default UBI events index) ([#923](https://github.com/opensearch-project/dashboards-search-relevance/pull/923))

### Infrastructure

- Stabilize /search-relevance chat command unit test (avoid loading @osd/monaco) ([#927](https://github.com/opensearch-project/dashboards-search-relevance/pull/927))

### Documentation

### Maintenance

### Refactoring
