"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initialQueryErrorState = exports.QueryStringError = exports.SelectIndexError = void 0;
var SelectIndexError;
(function (SelectIndexError) {
    SelectIndexError["unselected"] = "An index is required to compare search results. Select an index.";
})(SelectIndexError || (exports.SelectIndexError = SelectIndexError = {}));
var QueryStringError;
(function (QueryStringError) {
    QueryStringError["empty"] = "A query is required. Enter a query.";
    QueryStringError["invalid"] = "Query syntax is invalid. Enter a valid query.";
})(QueryStringError || (exports.QueryStringError = QueryStringError = {}));
exports.initialQueryErrorState = {
    selectIndex: '',
    queryString: '',
    errorResponse: {
        body: '',
        statusCode: 200,
    },
};
