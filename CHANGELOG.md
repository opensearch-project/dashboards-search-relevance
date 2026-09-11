# CHANGELOG

Inspired from [Keep a Changelog](https://keepachangelog.com/en/1.0.0/)

## [Unreleased]

### Breaking Changes

### Features

- Add "Reuse Existing Judgments" option in LLM judgment Advanced Settings to reuse ratings from up to 5 existing judgments, and add a retry action for failed documents in the judgment listing ([#525](https://github.com/opensearch-project/dashboards-search-relevance/issues/525))
- Allow ratings on a completed LLM judgment to be edited in place, including assigning ratings to previously failed documents ([#525](https://github.com/opensearch-project/dashboards-search-relevance/issues/525))
- Add a read-only Learning to Rank model registry listing ([#943](https://github.com/opensearch-project/dashboards-search-relevance/pull/943))

### Enhancements

### Bug Fixes

- Fix judgment and experiment listing search cache so clearing search restores full results ([#933](https://github.com/opensearch-project/dashboards-search-relevance/pull/933))
- Pass dataSourceId in Hybrid Optimizer and Pairwise experiment result queries so experiment views render on multi-data-source deployments ([#921](https://github.com/opensearch-project/dashboards-search-relevance/pull/921))
- Fix delete error messages, search config validation, and dashboard/hybrid views ([#926](https://github.com/opensearch-project/dashboards-search-relevance/pull/926))
- fix: scope search config to data source; require UBI index for COEC ([#923](https://github.com/opensearch-project/dashboards-search-relevance/pull/923))
- Scope experiment result dashboards to the active workspace and data source ([#928](https://github.com/opensearch-project/dashboards-search-relevance/pull/928))
- Merge the `single_search` route into `search` and read `dataSourceId` from the query parameter, so search configuration validation runs against the selected data source ([#930](https://github.com/opensearch-project/dashboards-search-relevance/issues/930))
- Gate workbench on data source readiness and warn on data sources without the Search Relevance plugin ([#940](https://github.com/opensearch-project/dashboards-search-relevance/pull/940))

### Infrastructure

- Stabilize /search-relevance chat command unit test (avoid loading @osd/monaco) ([#927](https://github.com/opensearch-project/dashboards-search-relevance/pull/927))

### Documentation

### Maintenance

### Refactoring
