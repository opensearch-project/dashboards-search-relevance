# CHANGELOG

Inspired from [Keep a Changelog](https://keepachangelog.com/en/1.0.0/)

## [Unreleased]

### Breaking Changes

### Features
* Add optional description field to Search Configuration create form, detail view, and listing ([#798](https://github.com/opensearch-project/dashboards-search-relevance/issues/798))
* Add /search-relevance slash command for chatbot with welcome message and AI-assisted search relevance tuning ([#843](https://github.com/opensearch-project/dashboards-search-relevance/pull/843))
* Add chatCommandEnabled dynamic config feature flag to gate /search-relevance command registration ([#890](https://github.com/opensearch-project/dashboards-search-relevance/pull/890))

* Add experiment name and description across the full lifecycle: optional fields on creation forms, display in list and detail views (tooltips, header, search), and edit from the detail view ([#823](https://github.com/opensearch-project/dashboards-search-relevance/pull/823))

### Enhancements
* Reduce O(n²) result matching in VisualComparison and connection lines by precomputing `_id` lookup maps ([#881](https://github.com/opensearch-project/dashboards-search-relevance/issues/881))
* Show which documents failed in the Judgment view: the ratings table now lists each query's unrated docs with a Failed status alongside the rated ones ([#899](https://github.com/opensearch-project/dashboards-search-relevance/pull/899))
* Load experiment detail resources in parallel after the initial experiment fetch ([#882](https://github.com/opensearch-project/dashboards-search-relevance/issues/882))
* Make Query Set description optional on create ([#758](https://github.com/opensearch-project/dashboards-search-relevance/issues/758))

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

### Infrastructure
* Add unit tests for the metrics route handler (`GET /api/relevancy/stats`): route registration config, success response, and error status mapping ([#893](https://github.com/opensearch-project/dashboards-search-relevance/issues/893))

### Documentation

### Maintenance
* Remove debug console logging from production UI code ([#878](https://github.com/opensearch-project/dashboards-search-relevance/pull/878))

### Refactoring
* Refactor `GetSearchResults` to a single-query endpoint; fixes inconsistent query1/query2 validation, wrong error routing for query2, and cross-cluster index rejection ([#784](https://github.com/opensearch-project/dashboards-search-relevance/issues/784))
* Replace per-page data source selectors with a single global data source menu in the OSD chrome header, backed by URL-synced state ([#850](https://github.com/opensearch-project/dashboards-search-relevance/pull/850))
* Remove unused `resource_management_home` component directory ([#779](https://github.com/opensearch-project/dashboards-search-relevance/issues/779))
