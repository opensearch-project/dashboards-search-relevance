# CHANGELOG

Inspired from [Keep a Changelog](https://keepachangelog.com/en/1.0.0/)

## [Unreleased]

### Breaking Changes

### Features
* Support manually creating a Query Set using plain text, key-value, or NDJSON input directly in the UI. ([#754](https://github.com/opensearch-project/dashboards-search-relevance/pull/754))
* Add Help flyout for Query Set creation with format documentation and downloadable sample files. ([#767](https://github.com/opensearch-project/dashboards-search-relevance/pull/767))
* Support multiple datasource in SRW ([#802](https://github.com/opensearch-project/dashboards-search-relevance/pull/802))
* Show a dismissible UI element to guide users to the relevance tuning agent if the chat plugin is enabled. ([#810](https://github.com/opensearch-project/dashboards-search-relevance/pull/810))

### Enhancements
* Proper support of .ndjson or .jsonl for Query Sets file uploads. ([#775](https://github.com/opensearch-project/dashboards-search-relevance/pull/775))
* Add resizable query editor boxes with drag handles for vertical expansion in Query Compare view. ([#791](https://github.com/opensearch-project/dashboards-search-relevance/pull/791))
* Standardize Action button tooltips across all listing pages (Search Configurations, Experiments, Judgments, Query Sets) using `EuiToolTip` for improved UX and accessibility. ([#782](https://github.com/opensearch-project/dashboards-search-relevance/pull/782))
* Remove milliseconds from timestamp display format across all listing tables. ([#799](https://github.com/opensearch-project/dashboards-search-relevance/pull/799))

### Bug Fixes
* Fix scheduler failure when cron expression is null or empty in SRW experiments by adding proper validation and handling. ([#808](https://github.com/opensearch-project/dashboards-search-relevance/pull/808))
* Bug bugs on pairwise comparison experiment view page. ([#735]https://github.com/opensearch-project/dashboards-search-relevance/pull/735)
* Fix link to Pointwise Daily Scheduled Runs dashboard to set date range from first experiment to NOW to include the most recent run. ([#738]https://github.com/opensearch-project/dashboards-search-relevance/pull/738)
* Fix text alignment and excessive spacing in Query Analysis results view. ([#752](https://github.com/opensearch-project/dashboards-search-relevance/pull/752))
* Allow a single query setup to be executed in the search comparison UI. ([#746](https://github.com/opensearch-project/dashboards-search-relevance/pull/746))
* Fix error when deleting judgment ratings by ensuring the judgments list refreshes correctly and removes deleted entries from UI state. ([#751](https://github.com/opensearch-project/dashboards-search-relevance/pull/751))
* Fix generic error message when uploading malformed NDJSON query sets by surfacing detailed parsing error with line numbers. ([#776](https://github.com/opensearch-project/dashboards-search-relevance/pull/776))

### Infrastructure

### Documentation

### Maintenance
* React 18 compatibility updates for dashboards-search-relevance plugin ([#741](https://github.com/opensearch-project/dashboards-search-relevance/pull/741))

### Refactoring
