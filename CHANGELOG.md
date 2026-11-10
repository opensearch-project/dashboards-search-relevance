# CHANGELOG

Inspired from [Keep a Changelog](https://keepachangelog.com/en/1.0.0/)

## [Unreleased]

### Breaking Changes

### Features
* Show per-query OpenSearch search latency (took) in experiment results ([#942](https://github.com/opensearch-project/dashboards-search-relevance/issues/942))

### Enhancements
* Navigate to the new experiment's view page on creation instead of the listing page, with a live-polling progress panel shown while it processes ([#985](https://github.com/opensearch-project/dashboards-search-relevance/pull/985))
* Gate the `/search-relevance` chat command on data source availability; report an unsupported message when the workspace has no data source the Workbench can use (e.g. only AnalyticEngine data sources) ([#970](https://github.com/opensearch-project/dashboards-search-relevance/pull/970))
* Reduce O(n²) result matching in VisualComparison and connection lines by precomputing `_id` lookup maps ([#881](https://github.com/opensearch-project/dashboards-search-relevance/issues/881))
* Rename `%SearchText%` to `%queryText%` in Query Template ([#774](https://github.com/opensearch-project/dashboards-search-relevance/pull/774))
* Added missing tool tips for Recall, MRR and DCG metrics in the experiment results page. ([#967](https://github.com/opensearch-project/dashboards-search-relevance/pull/967)) 

### Bug Fixes
* Fix judgment list creation failing when Token Limit is changed from the default 4000; server route validation expected a string but the UI sends a number ([#662](https://github.com/opensearch-project/dashboards-search-relevance/issues/662))
* Fix Search Evaluation experiment view treating failed OpenSearch queries as zero search results (ZSR); show per-query status and separate notifications for failed, ZSR, and not-evaluated queries ([#733](https://github.com/opensearch-project/dashboards-search-relevance/pull/849))
* Display stored reference answers on Query Set Details page ([#855](https://github.com/opensearch-project/dashboards-search-relevance/issues/855))
* Poll judgment detail view while status is PROCESSING so ratings appear when async generation completes ([#857](https://github.com/opensearch-project/dashboards-search-relevance/issues/857))
* Hide AnalyticEngine data sources from DSL-dependent data source dropdowns ([#846](https://github.com/opensearch-project/dashboards-search-relevance/pull/846))
* Fix infinite re-render loop in useDataSourceUrlSync caused by unstable location object reference ([#859](https://github.com/opensearch-project/dashboards-search-relevance/pull/859))
* Fix MetricsService.trim() to evict expired entries from all interval-keyed metric maps ([#879](https://github.com/opensearch-project/dashboards-search-relevance/issues/879))
* Surface the backend error message and status code (e.g. a 403 security_exception) instead of a generic "unknown error" when list and detail views fail to load ([#873](https://github.com/opensearch-project/dashboards-search-relevance/issues/873))
* Surface backend error messages in Search Configuration and Judgment detail views instead of generic load-failure messages ([#894](https://github.com/opensearch-project/dashboards-search-relevance/issues/894))
* Render an error callout on the Experiment Details page when the experiment fails to load (missing id, invalid data, or fetch error) instead of a blank content area ([#892](https://github.com/opensearch-project/dashboards-search-relevance/issues/892))
* Surface the detailed error message on the Hybrid Optimizer experiment view, and show an informative empty state instead of a blank results table when an experiment completes with no evaluation results ([#550](https://github.com/opensearch-project/dashboards-search-relevance/issues/550))
* Escape cells in the document scores CSV export ([#957](https://github.com/opensearch-project/dashboards-search-relevance/pull/957))

### Infrastructure
* Disable Codecov `changes` status check so indirect coverage diffs do not fail PRs
* Fix Lychee link checking attempting to test a fake link. ([#962](https://github.com/opensearch-project/dashboards-search-relevance/pull/962))
- Add SPDX license header checker and missing headers ([#941](https://github.com/opensearch-project/dashboards-search-relevance/pull/941))

- Install the functional test repository's pinned Cypress in the FTR E2E workflow ([#958](https://github.com/opensearch-project/dashboards-search-relevance/pull/958))

### Documentation

### Maintenance
* Add unit tests for ExperimentMetadataFields, previously untested (0% coverage) ([#968](https://github.com/opensearch-project/dashboards-search-relevance/pull/968))

### Refactoring
