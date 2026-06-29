# CHANGELOG

Inspired from [Keep a Changelog](https://keepachangelog.com/en/1.0.0/)

## [Unreleased]

### Breaking Changes

### Features
* Add optional description field to Search Configuration create form, detail view, and listing ([#798](https://github.com/opensearch-project/dashboards-search-relevance/issues/798))
* Add /search-relevance slash command for chatbot with welcome message and AI-assisted search relevance tuning ([#843](https://github.com/opensearch-project/dashboards-search-relevance/pull/843))

* Add experiment name and description across the full lifecycle: optional fields on creation forms, display in list and detail views (tooltips, header, search), and edit from the detail view ([#823](https://github.com/opensearch-project/dashboards-search-relevance/pull/823))

### Enhancements
* Make Query Set description optional on create ([#758](https://github.com/opensearch-project/dashboards-search-relevance/issues/758))

### Bug Fixes
* Fix Search Evaluation experiment view treating failed OpenSearch queries as zero search results (ZSR); show per-query status and separate notifications for failed, ZSR, and not-evaluated queries ([#733](https://github.com/opensearch-project/dashboards-search-relevance/pull/849))
* Display stored reference answers on Query Set Details page ([#855](https://github.com/opensearch-project/dashboards-search-relevance/issues/855))
* Poll judgment detail view while status is PROCESSING so ratings appear when async generation completes ([#857](https://github.com/opensearch-project/dashboards-search-relevance/issues/857))
* Hide AnalyticEngine data sources from DSL-dependent data source dropdowns ([#846](https://github.com/opensearch-project/dashboards-search-relevance/pull/846))
* Fix infinite re-render loop in useDataSourceUrlSync caused by unstable location object reference ([#859](https://github.com/opensearch-project/dashboards-search-relevance/pull/859))

### Infrastructure

### Documentation

### Maintenance

### Refactoring
* Replace per-page data source selectors with a single global data source menu in the OSD chrome header, backed by URL-synced state ([#850](https://github.com/opensearch-project/dashboards-search-relevance/pull/850))
* Remove unused `resource_management_home` component directory ([#779](https://github.com/opensearch-project/dashboards-search-relevance/issues/779))
