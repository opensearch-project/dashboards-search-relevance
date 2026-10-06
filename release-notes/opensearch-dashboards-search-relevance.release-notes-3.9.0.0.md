## Version 3.9.0 Release Notes

Compatible with OpenSearch and OpenSearch Dashboards version 3.9.0

### Features

* Add reuse existing judgments and retry failed documents to LLM judgment UI ([#916](https://github.com/opensearch-project/dashboards-search-relevance/pull/916))

### Bug Fixes

* Surface specific error messages when deleting query sets, judgments, or search configurations that are in use ([#926](https://github.com/opensearch-project/dashboards-search-relevance/pull/926))
* Fix search configuration validation always reporting no results on multi-data-source deployments ([#926](https://github.com/opensearch-project/dashboards-search-relevance/pull/926))
* Fix experiment visualization deep-dive and dashboard install detection on multi-data-source deployments ([#926](https://github.com/opensearch-project/dashboards-search-relevance/pull/926))
* Fix listing search cache so clearing the search box restores full results instead of showing stale filtered data ([#933](https://github.com/opensearch-project/dashboards-search-relevance/pull/933))
* Gate workbench on data source readiness and warn when the selected data source lacks the Search Relevance plugin ([#940](https://github.com/opensearch-project/dashboards-search-relevance/pull/940))
* Pass dataSourceId in Hybrid Optimizer and Pairwise experiment result queries on multi-data-source deployments ([#921](https://github.com/opensearch-project/dashboards-search-relevance/pull/921))
* Scope experiment result dashboards to the active workspace so each workspace gets independent copies ([#928](https://github.com/opensearch-project/dashboards-search-relevance/pull/928))
* Scope search configuration dropdown to the selected data source in Query Analysis setup ([#923](https://github.com/opensearch-project/dashboards-search-relevance/pull/923))
* Show clear validation error when UBI events data is unavailable for the COEC click model in judgment creation ([#923](https://github.com/opensearch-project/dashboards-search-relevance/pull/923))

### Refactoring

* Merge single_search route into search route and read dataSourceId from query parameter consistently ([#935](https://github.com/opensearch-project/dashboards-search-relevance/pull/935))

### Infrastructure

* Stabilize search-relevance chat command unit test by avoiding transitive loading of @osd/monaco ([#927](https://github.com/opensearch-project/dashboards-search-relevance/pull/927))
