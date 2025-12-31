/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { i18n } from '@osd/i18n';
import { SavedObject } from '../../../../src/core/server';;

export const getUbiSavedObjects = (): SavedObject[] => [
  // UBI Index Patterns
  {
    id: 'ubi-queries-index-pattern',
    type: 'index-pattern',
    updated_at: '2018-10-01T15:13:03.270Z',
    version: '1',
    migrationVersion: {},
    attributes: {
      title: 'opensearch_dashboards_sample_ubi_queries*',
      timeFieldName: 'timestamp',
      fieldFormatMap:
        '{"day_of_week":{"id":"string","params":{"parsedUrl":{"origin":"http://localhost:5601","pathname":"/app/home","basePath":""}}},"hour":{"id":"number","params":{"parsedUrl":{"origin":"http://localhost:5601","pathname":"/app/home","basePath":""}}}}',
      fields:
        '[{"count":0,"name":"_id","type":"string","esTypes":["_id"],"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":false},{"count":0,"name":"_index","type":"string","esTypes":["_index"],"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":false},{"count":0,"name":"_score","type":"number","scripted":false,"searchable":false,"aggregatable":false,"readFromDocValues":false},{"count":0,"name":"_source","type":"_source","esTypes":["_source"],"scripted":false,"searchable":false,"aggregatable":false,"readFromDocValues":false},{"count":0,"name":"_type","type":"string","scripted":false,"searchable":false,"aggregatable":false,"readFromDocValues":false},{"count":0,"name":"application","type":"string","esTypes":["text"],"scripted":false,"searchable":true,"aggregatable":false,"readFromDocValues":false},{"count":0,"name":"application.keyword","type":"string","esTypes":["keyword"],"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":true,"subType":{"multi":{"parent":"application"}}},{"count":0,"name":"client_id","type":"string","esTypes":["text"],"scripted":false,"searchable":true,"aggregatable":false,"readFromDocValues":false},{"count":0,"name":"client_id.keyword","type":"string","esTypes":["keyword"],"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":true,"subType":{"multi":{"parent":"client_id"}}},{"count":0,"name":"query","type":"string","esTypes":["text"],"scripted":false,"searchable":true,"aggregatable":false,"readFromDocValues":false},{"count":0,"name":"query.keyword","type":"string","esTypes":["keyword"],"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":true,"subType":{"multi":{"parent":"query"}}},{"count":0,"name":"query_id","type":"string","esTypes":["text"],"scripted":false,"searchable":true,"aggregatable":false,"readFromDocValues":false},{"count":0,"name":"query_id.keyword","type":"string","esTypes":["keyword"],"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":true,"subType":{"multi":{"parent":"query_id"}}},{"count":0,"name":"query_response_id","type":"string","esTypes":["text"],"scripted":false,"searchable":true,"aggregatable":false,"readFromDocValues":false},{"count":0,"name":"query_response_id.keyword","type":"string","esTypes":["keyword"],"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":true,"subType":{"multi":{"parent":"query_response_id"}}},{"count":0,"name":"query_response_object_ids","type":"string","esTypes":["text"],"scripted":false,"searchable":true,"aggregatable":false,"readFromDocValues":false},{"count":0,"name":"query_response_hit_ids","type":"string","esTypes":["keyword"],"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":true,"subType":{"multi":{"parent":"query_response_object_ids"}}},{"count":0,"name":"timestamp","type":"date","esTypes":["date"],"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":true},{"count":0,"name":"user_query","type":"string","esTypes":["text"],"scripted":false,"searchable":true,"aggregatable":false,"readFromDocValues":false},{"count":0,"name":"user_query","type":"string","esTypes":["keyword"],"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":true,"subType":{"multi":{"parent":"user_query"}}},{"count":0,"script":"doc[\'query_response_hit_ids\'].length","lang":"painless","name":"number_of_results","type":"number","scripted":true,"searchable":true,"aggregatable":true,"readFromDocValues":false},{"count":0,"script":"doc[\'timestamp\'].value.getDayOfWeekEnum().getDisplayName(TextStyle.FULL, Locale.ROOT)","lang":"painless","name":"day_of_week","type":"string","scripted":true,"searchable":true,"aggregatable":true,"readFromDocValues":false},{"count":0,"script":"doc[\'timestamp\'].value.getHour()","lang":"painless","name":"hour","type":"number","scripted":true,"searchable":true,"aggregatable":true,"readFromDocValues":false}]',
    },
    references: [],
  },
  {
    id: 'ubi-events-index-pattern',
    type: 'index-pattern',
    updated_at: '2018-10-01T15:13:03.270Z',
    version: '1',
    migrationVersion: {},
    attributes: {
      title: 'opensearch_dashboards_sample_ubi_events*',
      timeFieldName: 'timestamp',
      fields:
        '[{"count":0,"name":"_id","type":"string","esTypes":["_id"],"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":false},{"count":0,"name":"_index","type":"string","esTypes":["_index"],"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":false},{"count":0,"name":"_score","type":"number","scripted":false,"searchable":false,"aggregatable":false,"readFromDocValues":false},{"count":0,"name":"_source","type":"_source","esTypes":["_source"],"scripted":false,"searchable":false,"aggregatable":false,"readFromDocValues":false},{"count":0,"name":"_type","type":"string","scripted":false,"searchable":false,"aggregatable":false,"readFromDocValues":false},{"count":0,"name":"action_name","type":"string","esTypes":["keyword"],"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":true},{"count":0,"name":"application","type":"string","esTypes":["keyword"],"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":true},{"count":0,"name":"client_id","type":"string","esTypes":["keyword"],"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":true},{"count":0,"name":"event_attributes.object.description","type":"string","esTypes":["text"],"scripted":false,"searchable":true,"aggregatable":false,"readFromDocValues":false},{"count":0,"name":"event_attributes.object.description.keyword","type":"string","esTypes":["keyword"],"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":true,"subType":{"multi":{"parent":"event_attributes.object.description"}}},{"count":0,"name":"event_attributes.object.internal_id","type":"string","esTypes":["keyword"],"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":true},{"count":0,"name":"event_attributes.object.name","type":"string","esTypes":["keyword"],"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":true},{"count":0,"name":"event_attributes.object.object_id","type":"string","esTypes":["keyword"],"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":true},{"count":0,"name":"event_attributes.object.object_id_field","type":"string","esTypes":["keyword"],"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":true},{"count":0,"name":"event_attributes.position.ordinal","type":"number","esTypes":["integer"],"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":true},{"count":0,"name":"event_attributes.position.page_depth","type":"number","esTypes":["integer"],"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":true},{"count":0,"name":"event_attributes.position.scroll_depth","type":"number","esTypes":["integer"],"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":true},{"count":0,"name":"event_attributes.position.trail","type":"string","esTypes":["text"],"scripted":false,"searchable":true,"aggregatable":false,"readFromDocValues":false},{"count":0,"name":"event_attributes.position.trail.keyword","type":"string","esTypes":["keyword"],"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":true,"subType":{"multi":{"parent":"event_attributes.position.trail"}}},{"count":0,"name":"event_attributes.position.x","type":"number","esTypes":["integer"],"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":true},{"count":0,"name":"event_attributes.position.y","type":"number","esTypes":["integer"],"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":true},{"count":0,"name":"message","type":"string","esTypes":["keyword"],"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":true},{"count":0,"name":"message_type","type":"string","esTypes":["keyword"],"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":true},{"count":0,"name":"query_id","type":"string","esTypes":["keyword"],"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":true},{"count":0,"name":"session_id","type":"string","esTypes":["text"],"scripted":false,"searchable":true,"aggregatable":false,"readFromDocValues":false},{"count":0,"name":"session_id.keyword","type":"string","esTypes":["keyword"],"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":true,"subType":{"multi":{"parent":"session_id"}}},{"count":0,"name":"timestamp","type":"date","esTypes":["date"],"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":true},{"count":0,"name":"user_id","type":"string","esTypes":["text"],"scripted":false,"searchable":true,"aggregatable":false,"readFromDocValues":false},{"count":0,"name":"user_id.keyword","type":"string","esTypes":["keyword"],"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":true,"subType":{"multi":{"parent":"user_id"}}},{"count":0,"name":"user_query","type":"string","esTypes":["text"],"scripted":false,"searchable":true,"aggregatable":false,"readFromDocValues":false},{"count":0,"name":"user_query.keyword","type":"string","esTypes":["keyword"],"scripted":false,"searchable":true,"aggregatable":true,"readFromDocValues":true,"subType":{"multi":{"parent":"user_query"}}}]',
    },
    references: [],
  },
  // UBI Visualizations
  {
    id: 'Click Position Histogram',
    type: 'visualization',
    updated_at: '2018-10-01T15:13:03.270Z',
    version: '1',
    migrationVersion: {},
    attributes: {
      title: '[UBI] Queries by Client',
      visState:
        '{"title":"Queries by Client","type":"pie","aggs":[{"id":"1","enabled":true,"type":"count","params":{},"schema":"metric"},{"id":"2","enabled":true,"type":"terms","params":{"field":"client_id.keyword","size":5,"order":"desc","orderBy":"1"},"schema":"group"}],"params":{"type":"pie","addTooltip":true,"addLegend":true,"legendPosition":"right","isDonut":false,"labels":{"show":true,"truncate":100}}}',
      uiStateJSON: '{}',
      description: '',
      kibanaSavedObjectMeta: {
        searchSourceJSON: '{"query":{"query":"","language":"kuery"},"filter":[]}',
      },
    },
    references: [],
  },
  {
    id: 'Queries over Time',
    type: 'visualization',
    updated_at: '2018-10-01T15:13:03.270Z',
    version: '1',
    migrationVersion: {},
    attributes: {
      title: '[UBI] Queries over Time',
      visState:
        '{"title":"Queries over Time","type":"histogram","aggs":[{"id":"1","enabled":true,"type":"count","params":{},"schema":"metric"},{"id":"2","enabled":true,"type":"date_histogram","params":{"field":"timestamp","timeRange":{"from":"now-30d","to":"now"},"useNormalizedOpenSearchInterval":true,"scaleMetricValues":false,"interval":"d","drop_partials":false,"min_doc_count":1,"extended_bounds":{},"customLabel":"queries per day"},"schema":"segment"}],"params":{"type":"histogram","grid":{"categoryLines":false},"categoryAxes":[{"id":"CategoryAxis-1","type":"category","position":"bottom","show":true,"style":{},"scale":{"type":"linear"},"labels":{"show":true,"filter":true,"truncate":100},"title":{}}],"valueAxes":[{"id":"ValueAxis-1","name":"LeftAxis-1","type":"value","position":"left","show":true,"style":{},"scale":{"type":"linear","mode":"normal"},"labels":{"show":true,"rotate":0,"filter":false,"truncate":100},"title":{"text":"Count"}}],"seriesParams":[{"show":true,"type":"histogram","mode":"stacked","data":{"label":"Count","id":"1"},"valueAxis":"ValueAxis-1","drawLinesBetweenPoints":true,"lineWidth":2,"showCircles":true}],"addTooltip":true,"addLegend":true,"legendPosition":"right","times":[],"addTimeMarker":false,"labels":{"show":false},"thresholdLine":{"show":false,"value":10,"width":1,"style":"full","color":"#E7664C"}}}',
      uiStateJSON: '{}',
      description: '',
      kibanaSavedObjectMeta: {
        searchSourceJSON:
          '{"query":{"query":"","language":"kuery"},"filter":[],"index":"ubi-queries-index-pattern"}',
      },
    },
    references: [],
  },
  {
    id: 'Queries by Hour',
    type: 'visualization',
    updated_at: '2018-10-01T15:13:03.270Z',
    version: '1',
    migrationVersion: {},
    attributes: {
      title: '[UBI] Queries by Time of Day',
      visState:
        '{"title":"Queries by Time of Day","type":"histogram","aggs":[{"id":"1","enabled":true,"type":"count","params":{},"schema":"metric"},{"id":"2","enabled":true,"type":"filters","params":{"filters":[{"input":{"query":"hour:0","language":"kuery"},"label":"0"},{"input":{"query":"hour:1","language":"kuery"},"label":"1"},{"input":{"query":"hour:2","language":"kuery"},"label":"2"},{"input":{"query":"hour:3","language":"kuery"},"label":"3"},{"input":{"query":"hour:4","language":"kuery"},"label":"4"},{"input":{"query":"hour:5","language":"kuery"},"label":"5"},{"input":{"query":"hour:6","language":"kuery"},"label":"6"},{"input":{"query":"hour:7","language":"kuery"},"label":"7"},{"input":{"query":"hour:8","language":"kuery"},"label":"8"},{"input":{"query":"hour:9","language":"kuery"},"label":"9"},{"input":{"query":"hour:10","language":"kuery"},"label":"10"},{"input":{"query":"hour:11","language":"kuery"},"label":"11"},{"input":{"query":"hour:12","language":"kuery"},"label":"12"},{"input":{"query":"hour:13","language":"kuery"},"label":"13"},{"input":{"query":"hour:14","language":"kuery"},"label":"14"},{"input":{"query":"hour:15","language":"kuery"},"label":"15"},{"input":{"query":"hour:16","language":"kuery"},"label":"16"},{"input":{"query":"hour:17","language":"kuery"},"label":"17"},{"input":{"query":"hour:18","language":"kuery"},"label":"18"},{"input":{"query":"hour:19","language":"kuery"},"label":"19"},{"input":{"query":"hour:20","language":"kuery"},"label":"20"},{"input":{"query":"hour:21","language":"kuery"},"label":"21"},{"input":{"query":"hour:22","language":"kuery"},"label":"22"},{"input":{"query":"hour:23","language":"kuery"},"label":"23"}]},"schema":"segment"}],"params":{"type":"histogram","grid":{"categoryLines":false},"categoryAxes":[{"id":"CategoryAxis-1","type":"category","position":"bottom","show":true,"style":{},"scale":{"type":"linear"},"labels":{"show":true,"filter":true,"truncate":100},"title":{}}],"valueAxes":[{"id":"ValueAxis-1","name":"LeftAxis-1","type":"value","position":"left","show":true,"style":{},"scale":{"type":"linear","mode":"normal"},"labels":{"show":true,"rotate":0,"filter":false,"truncate":100},"title":{"text":"Count"}}],"seriesParams":[{"show":true,"type":"histogram","mode":"stacked","data":{"label":"Count","id":"1"},"valueAxis":"ValueAxis-1","drawLinesBetweenPoints":true,"lineWidth":2,"showCircles":true}],"addTooltip":true,"addLegend":true,"legendPosition":"right","times":[],"addTimeMarker":false,"labels":{"show":false},"thresholdLine":{"show":false,"value":10,"width":1,"style":"full","color":"#E7664C"}}}',
      uiStateJSON: '{}',
      description: '',
      kibanaSavedObjectMeta: {
        searchSourceJSON:
          '{"query":{"query":"","language":"kuery"},"filter":[],"index":"ubi-queries-index-pattern"}',
      },
    },
    references: [],
  },
  {
    id: 'Day of Week',
    type: 'visualization',
    updated_at: '2018-10-01T15:13:03.270Z',
    version: '1',
    migrationVersion: {},
    attributes: {
      title: '[UBI] Searches by Day of Week',
      visState:
        '{"title":"Searches by Day of Week","type":"pie","aggs":[{"id":"1","enabled":true,"type":"count","params":{},"schema":"metric"},{"id":"2","enabled":true,"type":"terms","params":{"field":"day_of_week","orderBy":"_key","order":"asc","size":7,"otherBucket":false,"otherBucketLabel":"Other","missingBucket":false,"missingBucketLabel":"Missing","customLabel":"Day of Week"},"schema":"segment"}],"params":{"addTooltip":true,"addLegend":true,"legendPosition":"right","isDonut":true,"labels":{"show":false},"colors":["#1f77b4","#ff7f0e","#2ca02c","#d62728","#9467bd","#8c564b","#e377c2"]}}',
      uiStateJSON: '{}',
      description: '',
      kibanaSavedObjectMeta: {
        searchSourceJSON:
          '{"query":{"query":"","language":"kuery"},"filter":[],"index":"ubi-queries-index-pattern"}',
      },
  },
  references: [],
},
{
  id: 'Most Common Queries',
  type: 'visualization',
  updated_at: '2018-10-01T15:13:03.270Z',
  version: '1',
  migrationVersion: {},
  attributes: {
    title: '[UBI] Most common queries',
    visState:
      '{"title":"Most common queries","type":"tagcloud","params":{"scale":"linear","orientation":"single","minFontSize":18,"maxFontSize":72,"showLabel":false},"aggs":[{"id":"1","enabled":true,"type":"count","params":{},"schema":"metric"},{"id":"2","enabled":true,"type":"terms","params":{"field":"user_query","orderBy":"1","order":"desc","size":15,"otherBucket":false,"otherBucketLabel":"Other","missingBucket":false,"missingBucketLabel":"Missing","customLabel":"Query"},"schema":"segment"}]}',
    uiStateJSON: '{}',
    description: '',
    kibanaSavedObjectMeta: {
      searchSourceJSON:
        '{"query":{"query":"","language":"kuery"},"filter":[],"index":"ubi-queries-index-pattern"}',
    },
  },
  references: [],
},
{
  id: 'ubi-no-results-queries',
  type: 'visualization',
  updated_at: '2018-10-01T15:13:03.270Z',
  version: '1',
  migrationVersion: {},
  attributes: {
    title: '[UBI] Top Searches Without Results',
    visState:
      '{"title":"Top Searches Without Results","type":"table","aggs":[{"id":"1","enabled":true,"type":"count","params":{},"schema":"metric"},{"id":"2","enabled":true,"type":"terms","params":{"field":"user_query","orderBy":"1","order":"desc","size":100,"otherBucket":false,"otherBucketLabel":"Other","missingBucket":false,"missingBucketLabel":"Missing","customLabel":"Query"},"schema":"bucket"}],"params":{"perPage":10,"showPartialRows":false,"showMetricsAtAllLevels":false,"showTotal":false,"totalFunc":"sum","percentageCol":""}}',
    uiStateJSON: '{}',
    description: '',
    kibanaSavedObjectMeta: {
      searchSourceJSON:
        '{"query":{"query":"","language":"kuery"},"filter":[{"$state":{"store":"appState"},"meta":{"alias":null,"disabled":false,"field":"number_of_results","key":"script","negate":false,"type":"custom","value":"{\\"script\\":{\\"source\\":\\"boolean compare(Supplier s, def v) {return s.get() == v;}compare(() -> { doc[\'query_response_hit_ids\'].length }, params.value);\\",\\"lang\\":\\"painless\\",\\"params\\":{\\"value\\":0}}}","index":"ubi-queries-index-pattern"},"script":{"script":{"lang":"painless","params":{"value":0},"source":"boolean compare(Supplier s, def v) {return s.get() == v;}compare(() -> { doc[\'query_response_hit_ids\'].length }, params.value);"}}}],"index":"ubi-queries-index-pattern"}',
    },
  },
  references: [],
},
{
  id: 'ubi-common-results',
  type: 'visualization',
  updated_at: '2018-10-01T15:13:03.270Z',
  version: '1',
  migrationVersion: {},
  attributes: {
    title: '[UBI] Most Common Search Result',
    visState:
      '{"title":"Most Common Search Result","type":"table","aggs":[{"id":"1","enabled":true,"type":"count","params":{},"schema":"metric"},{"id":"2","enabled":true,"type":"terms","params":{"field":"query_response_hit_ids","orderBy":"1","order":"desc","size":100,"otherBucket":false,"otherBucketLabel":"Other","missingBucket":false,"missingBucketLabel":"Missing","customLabel":"Object Id"},"schema":"bucket"}],"params":{"perPage":10,"showPartialRows":false,"showMetricsAtAllLevels":false,"showTotal":false,"totalFunc":"sum","percentageCol":""}}',
    uiStateJSON: '{}',
    description: '',
    kibanaSavedObjectMeta: {
      searchSourceJSON:
        '{"query":{"query":"","language":"kuery"},"filter":[],"index":"ubi-queries-index-pattern"}',
    },
  },
  references: [],
},
{
  id: 'ubi-click-positions',
  type: 'visualization',
  updated_at: '2018-10-01T15:13:03.270Z',
  version: '1',
  migrationVersion: {},
  attributes: {
    title: '[UBI] Click Position Histogram',
    visState:
      '{"title":"Click Position Histogram","type":"histogram","aggs":[{"id":"1","enabled":true,"type":"count","params":{"customLabel":""},"schema":"metric"},{"id":"2","enabled":true,"type":"terms","params":{"field":"event_attributes.position.ordinal","orderBy":"_key","order":"asc","size":25,"otherBucket":false,"otherBucketLabel":"Other","missingBucket":false,"missingBucketLabel":"Missing","customLabel":"click positions"},"schema":"segment"}],"params":{"type":"histogram","grid":{"categoryLines":false},"categoryAxes":[{"id":"CategoryAxis-1","type":"category","position":"bottom","show":true,"style":{},"scale":{"type":"linear"},"labels":{"show":true,"filter":true,"truncate":100},"title":{}}],"valueAxes":[{"id":"ValueAxis-1","name":"LeftAxis-1","type":"value","position":"left","show":true,"style":{},"scale":{"type":"linear","mode":"normal"},"labels":{"show":true,"rotate":0,"filter":false,"truncate":100},"title":{"text":"Count"}}],"seriesParams":[{"show":true,"type":"histogram","mode":"stacked","data":{"label":"Count","id":"1"},"valueAxis":"ValueAxis-1","drawLinesBetweenPoints":true,"lineWidth":2,"showCircles":true}],"addTooltip":true,"addLegend":true,"legendPosition":"right","times":[],"addTimeMarker":false,"labels":{"show":false},"thresholdLine":{"show":false,"value":10,"width":1,"style":"full","color":"#E7664C"}}}',
    uiStateJSON: '{}',
    description: '',
    kibanaSavedObjectMeta: {
      searchSourceJSON:
        '{"query":{"query":"","language":"kuery"},"filter":[{"$state":{"store":"appState"},"meta":{"alias":null,"disabled":false,"key":"action_name","negate":false,"params":{"query":"click"},"type":"phrase","index":"ubi-events-index-pattern"},"query":{"match_phrase":{"action_name":"click"}}}],"index":"ubi-events-index-pattern"}',
    },
  },
  references: [],
},
// TSVB Average Click Position (original)
{
  id: 'ubi-avg-click-position',
  type: 'visualization',
  updated_at: '2018-10-01T15:13:03.270Z',
  version: '1',
  migrationVersion: {},
  attributes: {
    title: '[UBI] Average Click Position',
    visState:
      '{"title":"Average Click Position","type":"line","params":{"grid":{"categoryLines":false,"style":{"color":"#eee"}},"categoryAxes":[{"id":"CategoryAxis-1","type":"category","position":"bottom","show":true,"style":{},"scale":{"type":"linear"},"labels":{"show":true,"truncate":100},"title":{}}],"valueAxes":[{"id":"ValueAxis-1","name":"LeftAxis-1","type":"value","position":"left","show":true,"style":{},"scale":{"type":"linear","mode":"normal"},"labels":{"show":true,"rotate":0,"filter":false,"truncate":100},"title":{"text":"Average Position"}}],"seriesParams":[{"show":"true","type":"line","mode":"normal","data":{"label":"Average Position","id":"1"},"drawLinesBetweenPoints":true,"showCircles":true,"interpolate":"linear","valueAxis":"ValueAxis-1"}],"addTooltip":true,"addLegend":true,"legendPosition":"right","times":[],"addTimeMarker":false},"aggs":[{"id":"1","enabled":true,"type":"avg","schema":"metric","params":{"field":"event_attributes.position.ordinal"}},{"id":"2","enabled":true,"type":"date_histogram","schema":"segment","params":{"field":"timestamp","interval":"auto","drop_partials":false,"min_doc_count":1,"extended_bounds":{}}}]}',
    uiStateJSON: '{}',
    description: 'Average click position over time',
    kibanaSavedObjectMeta: {
      searchSourceJSON:
        '{"query":{"query":"action_name:click","language":"kuery"},"filter":[],"index":"ubi-events-index-pattern"}',
    },
  },
  references: [],
},
// UBI Dashboard
{
  id: 'ubi-dashboard-ecommerce',
  type: 'dashboard',
  updated_at: '2018-10-01T15:13:03.270Z',
  version: '1',
  references: [
    {
      name: 'panel_0',
      type: 'visualization',
      id: 'ubi-queries-over-time-orig',
    },
    {
      name: 'panel_1',
      type: 'visualization',
      id: 'ubi-queries-by-hour-orig',
    },
    {
      name: 'panel_2',
      type: 'visualization',
      id: 'ubi-day-of-week',
    },
    {
      name: 'panel_3',
      type: 'visualization',
      id: 'ubi-most-common-queries',
    },
    {
      name: 'panel_4',
      type: 'visualization',
      id: 'ubi-no-results-queries',
    },
    {
      name: 'panel_5',
      type: 'visualization',
      id: 'ubi-common-results',
    },
    {
      name: 'panel_6',
      type: 'visualization',
      id: 'ubi-click-positions',
    },
    {
      name: 'panel_7',
      type: 'visualization',
      id: 'ubi-avg-click-position',
    },
  ],
  migrationVersion: {
    dashboard: '7.0.0',
  },
  attributes: {
    title: i18n.translate('home.sampleData.ecommerceSpec.ubiDashboardTitle', {
      defaultMessage: '[UBI] Search Overview',
    }),
    hits: 0,
    description: i18n.translate('home.sampleData.ecommerceSpec.ubiDashboardDescription', {
      defaultMessage: 'Analyze user search behavior and query patterns',
    }),
    panelsJSON:
      '[{"version":"2.18.0","gridData":{"x":0,"y":0,"w":43,"h":15,"i":"9522cd9b-25e7-4d55-980e-55d25cf3f608"},"panelIndex":"9522cd9b-25e7-4d55-980e-55d25cf3f608","embeddableConfig":{},"panelRefName":"panel_0"},{"version":"2.18.0","gridData":{"x":0,"y":15,"w":24,"h":15,"i":"658767e1-472c-4a96-86a2-096498f41160"},"panelIndex":"658767e1-472c-4a96-86a2-096498f41160","embeddableConfig":{},"panelRefName":"panel_1"},{"version":"2.18.0","gridData":{"x":24,"y":15,"w":19,"h":15,"i":"2630a3ec-b86a-4707-b7bb-8e129414f836"},"panelIndex":"2630a3ec-b86a-4707-b7bb-8e129414f836","embeddableConfig":{"hidePanelTitles":false},"title":"Searches by Day of Week","panelRefName":"panel_2"},{"version":"2.18.0","gridData":{"x":0,"y":30,"w":15,"h":18,"i":"a1c5393a-9f5a-496e-97e3-60683f965459"},"panelIndex":"a1c5393a-9f5a-496e-97e3-60683f965459","embeddableConfig":{"table":null,"vis":{"columnsWidth":[{"colIndex":0,"width":265.5}]}},"panelRefName":"panel_3"},{"version":"2.18.0","gridData":{"x":15,"y":30,"w":11,"h":18,"i":"de136524-60d1-482f-8678-1b53d1d03998"},"panelIndex":"de136524-60d1-482f-8678-1b53d1d03998","embeddableConfig":{"table":null,"vis":{"columnsWidth":[{"colIndex":0,"width":300.5}]}},"panelRefName":"panel_4"},{"version":"2.18.0","gridData":{"x":26,"y":30,"w":17,"h":18,"i":"a79219b4-638b-4a1e-8394-25a9433fe4ad"},"panelIndex":"a79219b4-638b-4a1e-8394-25a9433fe4ad","embeddableConfig":{"table":null,"vis":{"columnsWidth":[{"colIndex":0,"width":413.5}]}},"panelRefName":"panel_5"},{"version":"2.18.0","gridData":{"x":0,"y":48,"w":24,"h":18,"i":"95448e1f-1f7e-479f-888b-db105bd2ee86"},"panelIndex":"95448e1f-1f7e-479f-888b-db105bd2ee86","embeddableConfig":{},"panelRefName":"panel_6"},{"version":"2.18.0","gridData":{"x":24,"y":48,"w":19,"h":18,"i":"2e1f1bac-f59d-416d-8a21-46d8e1c47de8"},"panelIndex":"2e1f1bac-f59d-416d-8a21-46d8e1c47de8","embeddableConfig":{},"panelRefName":"panel_7"}]',
    optionsJSON: '{"hidePanelTitles":false,"useMargins":true}',
    version: 1,
    timeRestore: true,
    timeTo: '2024-12-31T23:59:59.999Z',
    timeFrom: '2024-12-01T00:00:00.000Z',
    refreshInterval: {
      pause: false,
      value: 900000,
    },
    kibanaSavedObjectMeta: {
      searchSourceJSON: '{"query":{"language":"kuery","query":""},"filter":[]}',
    },
  },
},
];
