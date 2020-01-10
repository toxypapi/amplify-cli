"use strict";
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
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var graphql_1 = require("graphql");
var graphql_transformer_common_1 = require("graphql-transformer-common");
function inputValueDefinition(inputValue, namedType, isNonNull) {
    if (isNonNull === void 0) { isNonNull = false; }
    return {
        kind: graphql_1.Kind.INPUT_VALUE_DEFINITION,
        name: { kind: 'Name', value: inputValue },
        type: isNonNull ? graphql_transformer_common_1.makeNonNullType(graphql_transformer_common_1.makeNamedType(namedType)) : graphql_transformer_common_1.makeNamedType(namedType),
        directives: [],
    };
}
function capitalizeFirstLetter(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}
exports.capitalizeFirstLetter = capitalizeFirstLetter;
function getActionInputName(action, fieldName) {
    return "" + capitalizeFirstLetter(fieldName) + capitalizeFirstLetter(action) + "Input";
}
exports.getActionInputName = getActionInputName;
function makeActionInputObject(fieldName, fields) {
    return {
        kind: graphql_1.Kind.INPUT_OBJECT_TYPE_DEFINITION,
        name: { kind: 'Name', value: capitalizeFirstLetter(fieldName) + "Input" },
        fields: fields,
        directives: []
    };
}
exports.makeActionInputObject = makeActionInputObject;
function getActionInputType(action, fieldName, isFirst) {
    if (isFirst === void 0) { isFirst = false; }
    var actionInputFields = {
        identifyText: [inputValueDefinition('key', 'String', true)],
        identifyLabels: [inputValueDefinition('key', 'String', true)],
        translateText: __spreadArrays([
            inputValueDefinition('sourceLanguage', 'String', true),
            inputValueDefinition('targetLanguage', 'String', true)
        ], (isFirst ? [inputValueDefinition('text', 'String', true)] : [])),
        convertTextToSpeech: __spreadArrays([
            inputValueDefinition('voiceID', 'String', true)
        ], (isFirst ? [inputValueDefinition('text', 'String', true)] : []))
    };
    return {
        kind: graphql_1.Kind.INPUT_OBJECT_TYPE_DEFINITION,
        name: { kind: 'Name', value: getActionInputName(action, fieldName) },
        fields: actionInputFields[action],
        directives: []
    };
}
exports.getActionInputType = getActionInputType;
function addInputArgument(field, fieldName, isList) {
    return __assign(__assign({}, field), { arguments: [
            {
                kind: graphql_1.Kind.INPUT_VALUE_DEFINITION,
                name: { kind: 'Name', value: 'input' },
                type: graphql_transformer_common_1.makeNonNullType(graphql_transformer_common_1.makeNamedType(capitalizeFirstLetter(fieldName) + "Input")),
                directives: [],
            },
        ], type: isList ? graphql_transformer_common_1.makeListType(graphql_transformer_common_1.makeNamedType('String')) : graphql_transformer_common_1.makeNamedType('String') });
}
exports.addInputArgument = addInputArgument;
function createInputValueAction(action, fieldName) {
    return {
        kind: graphql_1.Kind.INPUT_VALUE_DEFINITION,
        name: { kind: 'Name', value: "" + action },
        type: graphql_transformer_common_1.makeNonNullType(graphql_transformer_common_1.makeNamedType(getActionInputName(action, fieldName))),
        directives: [],
    };
}
exports.createInputValueAction = createInputValueAction;
//# sourceMappingURL=definitions.js.map