# CHANGELOG

Inspired from [Keep a Changelog](https://keepachangelog.com/en/1.0.0/)

## [Unreleased]

### Breaking Changes

### Features
* Improve experiment detail UI for schedule information. ([#809](https://github.com/opensearch-project/dashboards-search-relevance/pull/809))

### Enhancements
* Move Workbench section navigation above the page content to provide more space for experiments and results. ([#977](https://github.com/opensearch-project/dashboards-search-relevance/pull/977))

### Bug Fixes
* Surface the detailed error message on the Hybrid Optimizer experiment view, and show an informative empty state instead of a blank results table when an experiment completes with no evaluation results ([#550](https://github.com/opensearch-project/dashboards-search-relevance/issues/550))
* Guard visual comparison image rendering against non-string field values to prevent a crash when an image field contains numbers, arrays, booleans, or objects ([#945](https://github.com/opensearch-project/dashboards-search-relevance/issues/945))

### Infrastructure
* Disable Codecov `changes` status check so indirect coverage diffs do not fail PRs
- Add SPDX license header checker and missing headers ([#941](https://github.com/opensearch-project/dashboards-search-relevance/pull/941))

### Documentation

### Maintenance

### Refactoring
