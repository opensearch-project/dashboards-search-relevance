## Version 3.6.0 Release Notes

Compatible with OpenSearch and OpenSearch Dashboards version 3.6.0

### Features

* Add "Ask AI" button to guide users to the relevance tuning agent when chat plugin is activated ([#810](https://github.com/opensearch-project/dashboards-search-relevance/pull/810))
* Add help flyout for query set input methods with format documentation and downloadable sample files ([#767](https://github.com/opensearch-project/dashboards-search-relevance/pull/767))
* Allow executing search comparison UI with only a single configured setup instead of requiring both ([#746](https://github.com/opensearch-project/dashboards-search-relevance/pull/746))
* Support manually creating query sets via text input with plain text, key-value, and NDJSON formats ([#754](https://github.com/opensearch-project/dashboards-search-relevance/pull/754))
* Rename "Single Query Comparison" to "Query Analysis" to better reflect the feature's functionality ([#773](https://github.com/opensearch-project/dashboards-search-relevance/pull/773))

### Enhancements

* Add end-to-end multiple data source support for all resource types across server, hooks, and UI ([#802](https://github.com/opensearch-project/dashboards-search-relevance/pull/802))
* Add resizable query editor boxes with synchronized height adjustment in Query Compare view ([#791](https://github.com/opensearch-project/dashboards-search-relevance/pull/791))
* Remove milliseconds from timestamp display format across all listing tables ([#799](https://github.com/opensearch-project/dashboards-search-relevance/pull/799))
* Add descriptive tooltips to icon-only action buttons across listing pages for improved accessibility ([#782](https://github.com/opensearch-project/dashboards-search-relevance/pull/782))
* Use standard `.ndjson` extension for sample query files and update file picker tests accordingly ([#775](https://github.com/opensearch-project/dashboards-search-relevance/pull/775))

### Bug Fixes

* Fix experiment scheduler failure when cron expression is empty and improve scheduling visibility ([#808](https://github.com/opensearch-project/dashboards-search-relevance/pull/808))
* Surface specific JSON parse errors with line numbers for malformed NDJSON query set uploads ([#776](https://github.com/opensearch-project/dashboards-search-relevance/pull/776))
* Fix judgment ratings deletion not refreshing the list and causing inconsistent UI state ([#751](https://github.com/opensearch-project/dashboards-search-relevance/pull/751))
* Fix UI misalignment in single query comparison results by correcting text alignment per column ([#752](https://github.com/opensearch-project/dashboards-search-relevance/pull/752))
* Fix LLM customized prompt to enforce required `searchText` and `hits` fields as non-removable tags ([#811](https://github.com/opensearch-project/dashboards-search-relevance/pull/811))

### Maintenance

* Update lodash to 4.18.1 to address CVE-2026-4800 ([#815](https://github.com/opensearch-project/dashboards-search-relevance/pull/815))
* Add release notes for 3.6.0 with CHANGELOG.md cleanup ([#813](https://github.com/opensearch-project/dashboards-search-relevance/pull/813))
