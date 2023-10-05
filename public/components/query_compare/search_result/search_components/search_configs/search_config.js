"use strict";
/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SearchConfig = void 0;
var react_1 = require("react");
var eui_1 = require("@elastic/eui");
var contexts_1 = require("../../../../../contexts");
var index_1 = require("../../../../../types/index");
var SearchConfig = function (_a) {
    var queryNumber = _a.queryNumber, queryString = _a.queryString, setQueryString = _a.setQueryString, selectedIndex = _a.selectedIndex, setSelectedIndex = _a.setSelectedIndex, queryError = _a.queryError, setQueryError = _a.setQueryError;
    var _b = (0, contexts_1.useSearchRelevanceContext)(), documentsIndexes = _b.documentsIndexes, setShowFlyout = _b.setShowFlyout;
    // On select index
    var onChangeSelectedIndex = function (e) {
        setSelectedIndex(e.target.value);
        setQueryError(function (error) { return (__assign(__assign({}, error), { selectIndex: '' })); });
    };
    // Select index on blur
    var selectIndexOnBlur = function () {
        // If Index Select on blur without selecting an index, show error
        if (!selectedIndex.length) {
            setQueryError(function (error) { return (__assign(__assign({}, error), { selectIndex: index_1.SelectIndexError.unselected })); });
        }
    };
    // On change query string
    var onChangeQueryString = function (value) {
        setQueryString(value);
        setQueryError(function (error) { return (__assign(__assign({}, error), { queryString: '' })); });
    };
    // Code editor on blur
    var codeEditorOnBlur = function () {
        // If no query string on blur, show error
        if (!queryString.length) {
            setQueryError(function (error) { return (__assign(__assign({}, error), { errorResponse: {
                    body: '',
                    statusCode: 400,
                }, queryString: index_1.QueryStringError.empty })); });
        }
    };
    return (<>
      <eui_1.EuiTitle size="xs">
        <h2 style={{ fontWeight: '300', fontSize: '21px' }}>Query {queryNumber}</h2>
      </eui_1.EuiTitle>
      <eui_1.EuiSpacer size="m"/>
      <eui_1.EuiFormRow fullWidth label="Index" error={!!queryError.selectIndex.length && <span>{queryError.selectIndex}</span>} isInvalid={!!queryError.selectIndex.length}>
        <eui_1.EuiSelect hasNoInitialSelection={true} options={documentsIndexes.map(function (_a) {
            var index = _a.index;
            return ({
                value: index,
                text: index,
            });
        })} aria-label="Search Index" onChange={onChangeSelectedIndex} value={selectedIndex} onBlur={selectIndexOnBlur}/>
      </eui_1.EuiFormRow>
      <eui_1.EuiFormRow fullWidth label="Query" error={!!queryError.queryString.length && <span>{queryError.queryString}</span>} isInvalid={!!queryError.queryString.length} labelAppend={<eui_1.EuiText size="xs">
            <eui_1.EuiButtonEmpty size="xs" color="primary" onClick={function () { return setShowFlyout(true); }}>
              Help
            </eui_1.EuiButtonEmpty>
          </eui_1.EuiText>} helpText={<p>
            Enter a query in{' '}
            <a href="https://opensearch.org/docs/latest/query-dsl/index/">OpenSearch Query DSL</a>.
            Use %SearchText% to refer to the text in the search bar
          </p>}>
        <eui_1.EuiCodeEditor mode="json" theme="sql_console" width="100%" height="10rem" value={queryString} onChange={onChangeQueryString} showPrintMargin={false} setOptions={{
            fontSize: '14px',
            enableBasicAutocompletion: true,
            enableLiveAutocompletion: true,
        }} aria-label="Code Editor" onBlur={codeEditorOnBlur} tabSize={2}/>
      </eui_1.EuiFormRow>
    </>);
};
exports.SearchConfig = SearchConfig;
