"use strict";
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
var STRING_CONDITIONS = ['ne', 'eq', 'le', 'lt', 'ge', 'gt', 'contains', 'notContains', 'between', 'beginsWith'];
var ID_CONDITIONS = ['ne', 'eq', 'le', 'lt', 'ge', 'gt', 'contains', 'notContains', 'between', 'beginsWith'];
var INT_CONDITIONS = ['ne', 'eq', 'le', 'lt', 'ge', 'gt', 'between'];
var FLOAT_CONDITIONS = ['ne', 'eq', 'le', 'lt', 'ge', 'gt', 'between'];
var BOOLEAN_CONDITIONS = ['ne', 'eq'];
var SIZE_CONDITIONS = ['ne', 'eq', 'le', 'lt', 'ge', 'gt', 'between'];
var STRING_FUNCTIONS = new Set(['attributeExists', 'attributeType', 'size']);
var ID_FUNCTIONS = new Set(['attributeExists', 'attributeType', 'size']);
var INT_FUNCTIONS = new Set(['attributeExists', 'attributeType']);
var FLOAT_FUNCTIONS = new Set(['attributeExists', 'attributeType']);
var BOOLEAN_FUNCTIONS = new Set(['attributeExists', 'attributeType']);
var ATTRIBUTE_TYPES = ['binary', 'binarySet', 'bool', 'list', 'map', 'number', 'numberSet', 'string', 'stringSet', '_null'];
function getNonModelObjectArray(obj, ctx, pMap) {
    // loop over all fields in the object, picking out all nonscalars that are not @model types
    for (var _i = 0, _a = obj.fields; _i < _a.length; _i++) {
        var field = _a[_i];
        if (!graphql_transformer_common_1.isScalar(field.type)) {
            var def = ctx.getType(graphql_transformer_common_1.getBaseType(field.type));
            if (def &&
                def.kind === graphql_1.Kind.OBJECT_TYPE_DEFINITION &&
                !def.directives.find(function (e) { return e.name.value === 'model'; }) &&
                pMap.get(def.name.value) === undefined) {
                // recursively find any non @model types referenced by the current
                // non @model type
                pMap.set(def.name.value, def);
                getNonModelObjectArray(def, ctx, pMap);
            }
        }
    }
    return Array.from(pMap.values());
}
exports.getNonModelObjectArray = getNonModelObjectArray;
function makeNonModelInputObject(obj, nonModelTypes, ctx) {
    var name = graphql_transformer_common_1.ModelResourceIDs.NonModelInputObjectName(obj.name.value);
    var fields = obj.fields
        .filter(function (field) {
        var fieldType = ctx.getType(graphql_transformer_common_1.getBaseType(field.type));
        if (graphql_transformer_common_1.isScalar(field.type) ||
            nonModelTypes.find(function (e) { return e.name.value === graphql_transformer_common_1.getBaseType(field.type); }) ||
            (fieldType && fieldType.kind === graphql_1.Kind.ENUM_TYPE_DEFINITION)) {
            return true;
        }
        return false;
    })
        .map(function (field) {
        var type = nonModelTypes.find(function (e) { return e.name.value === graphql_transformer_common_1.getBaseType(field.type); })
            ? graphql_transformer_common_1.withNamedNodeNamed(field.type, graphql_transformer_common_1.ModelResourceIDs.NonModelInputObjectName(graphql_transformer_common_1.getBaseType(field.type)))
            : field.type;
        return {
            kind: graphql_1.Kind.INPUT_VALUE_DEFINITION,
            name: field.name,
            type: type,
            // TODO: Service does not support new style descriptions so wait.
            // description: field.description,
            directives: [],
        };
    });
    return {
        kind: 'InputObjectTypeDefinition',
        // TODO: Service does not support new style descriptions so wait.
        // description: {
        //     kind: 'StringValue',
        //     value: `Input type for ${obj.name.value} mutations`
        // },
        name: {
            kind: 'Name',
            value: name,
        },
        fields: fields,
        directives: [],
    };
}
exports.makeNonModelInputObject = makeNonModelInputObject;
function makeCreateInputObject(obj, nonModelTypes, ctx, isSync) {
    if (isSync === void 0) { isSync = false; }
    var name = graphql_transformer_common_1.ModelResourceIDs.ModelCreateInputObjectName(obj.name.value);
    var fields = obj.fields
        .filter(function (field) {
        var fieldType = ctx.getType(graphql_transformer_common_1.getBaseType(field.type));
        if (graphql_transformer_common_1.isScalar(field.type) ||
            nonModelTypes.find(function (e) { return e.name.value === graphql_transformer_common_1.getBaseType(field.type); }) ||
            (fieldType && fieldType.kind === graphql_1.Kind.ENUM_TYPE_DEFINITION)) {
            return true;
        }
        return false;
    })
        .map(function (field) {
        var type;
        if (field.name.value === 'id') {
            // ids are always optional. when provided the value is used.
            // when not provided the value is not used.
            type = {
                kind: graphql_1.Kind.NAMED_TYPE,
                name: {
                    kind: graphql_1.Kind.NAME,
                    value: 'ID',
                },
            };
        }
        else {
            type = nonModelTypes.find(function (e) { return e.name.value === graphql_transformer_common_1.getBaseType(field.type); })
                ? graphql_transformer_common_1.withNamedNodeNamed(field.type, graphql_transformer_common_1.ModelResourceIDs.NonModelInputObjectName(graphql_transformer_common_1.getBaseType(field.type)))
                : field.type;
        }
        return {
            kind: graphql_1.Kind.INPUT_VALUE_DEFINITION,
            name: field.name,
            type: type,
            // TODO: Service does not support new style descriptions so wait.
            // description: field.description,
            directives: [],
        };
    });
    // add the version if this project is a sync project
    if (isSync) {
        fields.push(graphql_transformer_common_1.makeInputValueDefinition('_version', graphql_transformer_common_1.makeNamedType('Int')));
    }
    return {
        kind: 'InputObjectTypeDefinition',
        // TODO: Service does not support new style descriptions so wait.
        // description: {
        //     kind: 'StringValue',
        //     value: `Input type for ${obj.name.value} mutations`
        // },
        name: {
            kind: 'Name',
            value: name,
        },
        fields: fields,
        directives: [],
    };
}
exports.makeCreateInputObject = makeCreateInputObject;
function makeUpdateInputObject(obj, nonModelTypes, ctx, isSync) {
    if (isSync === void 0) { isSync = false; }
    var name = graphql_transformer_common_1.ModelResourceIDs.ModelUpdateInputObjectName(obj.name.value);
    var fields = obj.fields
        .filter(function (f) {
        var fieldType = ctx.getType(graphql_transformer_common_1.getBaseType(f.type));
        if (graphql_transformer_common_1.isScalar(f.type) ||
            nonModelTypes.find(function (e) { return e.name.value === graphql_transformer_common_1.getBaseType(f.type); }) ||
            (fieldType && fieldType.kind === graphql_1.Kind.ENUM_TYPE_DEFINITION)) {
            return true;
        }
        return false;
    })
        .map(function (field) {
        var type;
        if (field.name.value === 'id') {
            type = graphql_transformer_common_1.wrapNonNull(field.type);
        }
        else {
            type = graphql_transformer_common_1.unwrapNonNull(field.type);
        }
        type = nonModelTypes.find(function (e) { return e.name.value === graphql_transformer_common_1.getBaseType(field.type); })
            ? graphql_transformer_common_1.withNamedNodeNamed(type, graphql_transformer_common_1.ModelResourceIDs.NonModelInputObjectName(graphql_transformer_common_1.getBaseType(field.type)))
            : type;
        return {
            kind: graphql_1.Kind.INPUT_VALUE_DEFINITION,
            name: field.name,
            type: type,
            // TODO: Service does not support new style descriptions so wait.
            // description: field.description,
            directives: [],
        };
    });
    if (isSync) {
        fields.push(graphql_transformer_common_1.makeInputValueDefinition('_version', graphql_transformer_common_1.makeNamedType('Int')));
    }
    return {
        kind: graphql_1.Kind.INPUT_OBJECT_TYPE_DEFINITION,
        // TODO: Service does not support new style descriptions so wait.
        // description: {
        //     kind: 'StringValue',
        //     value: `Input type for ${obj.name.value} mutations`
        // },
        name: {
            kind: 'Name',
            value: name,
        },
        fields: fields,
        directives: [],
    };
}
exports.makeUpdateInputObject = makeUpdateInputObject;
function makeDeleteInputObject(obj, isSync) {
    if (isSync === void 0) { isSync = false; }
    var name = graphql_transformer_common_1.ModelResourceIDs.ModelDeleteInputObjectName(obj.name.value);
    var fields = [
        {
            kind: graphql_1.Kind.INPUT_VALUE_DEFINITION,
            name: { kind: 'Name', value: 'id' },
            type: graphql_transformer_common_1.makeNamedType('ID'),
            // TODO: Service does not support new style descriptions so wait.
            // description: {
            //     kind: 'StringValue',
            //     value: `The id of the ${obj.name.value} to delete.`
            // },
            directives: [],
        },
    ];
    if (isSync) {
        fields.push(graphql_transformer_common_1.makeInputValueDefinition('_version', graphql_transformer_common_1.makeNamedType('Int')));
    }
    return {
        kind: graphql_1.Kind.INPUT_OBJECT_TYPE_DEFINITION,
        // TODO: Service does not support new style descriptions so wait.
        // description: {
        //     kind: 'StringValue',
        //     value: `Input type for ${obj.name.value} delete mutations`
        // },
        name: {
            kind: 'Name',
            value: name,
        },
        fields: fields,
        directives: [],
    };
}
exports.makeDeleteInputObject = makeDeleteInputObject;
function makeModelXFilterInputObject(obj, ctx, supportsConditions) {
    var name = graphql_transformer_common_1.ModelResourceIDs.ModelFilterInputTypeName(obj.name.value);
    var fields = obj.fields
        .filter(function (field) {
        var fieldType = ctx.getType(graphql_transformer_common_1.getBaseType(field.type));
        if (graphql_transformer_common_1.isScalar(field.type) || (fieldType && fieldType.kind === graphql_1.Kind.ENUM_TYPE_DEFINITION)) {
            return true;
        }
    })
        .map(function (field) {
        var baseType = graphql_transformer_common_1.getBaseType(field.type);
        var fieldType = ctx.getType(baseType);
        var isList = graphql_transformer_common_1.isListType(field.type);
        var isEnumType = fieldType && fieldType.kind === graphql_1.Kind.ENUM_TYPE_DEFINITION;
        var filterTypeName = isEnumType && isList
            ? graphql_transformer_common_1.ModelResourceIDs.ModelFilterListInputTypeName(baseType, !supportsConditions)
            : graphql_transformer_common_1.ModelResourceIDs.ModelScalarFilterInputTypeName(baseType, !supportsConditions);
        return {
            kind: graphql_1.Kind.INPUT_VALUE_DEFINITION,
            name: field.name,
            type: graphql_transformer_common_1.makeNamedType(filterTypeName),
            // TODO: Service does not support new style descriptions so wait.
            // description: field.description,
            directives: [],
        };
    });
    fields.push({
        kind: graphql_1.Kind.INPUT_VALUE_DEFINITION,
        name: {
            kind: 'Name',
            value: 'and',
        },
        type: graphql_transformer_common_1.makeListType(graphql_transformer_common_1.makeNamedType(name)),
        // TODO: Service does not support new style descriptions so wait.
        // description: field.description,
        directives: [],
    }, {
        kind: graphql_1.Kind.INPUT_VALUE_DEFINITION,
        name: {
            kind: 'Name',
            value: 'or',
        },
        type: graphql_transformer_common_1.makeListType(graphql_transformer_common_1.makeNamedType(name)),
        // TODO: Service does not support new style descriptions so wait.
        // description: field.description,
        directives: [],
    }, {
        kind: graphql_1.Kind.INPUT_VALUE_DEFINITION,
        name: {
            kind: 'Name',
            value: 'not',
        },
        type: graphql_transformer_common_1.makeNamedType(name),
        // TODO: Service does not support new style descriptions so wait.
        // description: field.description,
        directives: [],
    });
    return {
        kind: 'InputObjectTypeDefinition',
        // TODO: Service does not support new style descriptions so wait.
        // description: {
        //     kind: 'StringValue',
        //     value: `Input type for ${obj.name.value} mutations`
        // },
        name: {
            kind: 'Name',
            value: name,
        },
        fields: fields,
        directives: [],
    };
}
exports.makeModelXFilterInputObject = makeModelXFilterInputObject;
function makeModelXConditionInputObject(obj, ctx, supportsConditions) {
    var name = graphql_transformer_common_1.ModelResourceIDs.ModelConditionInputTypeName(obj.name.value);
    var fields = obj.fields
        .filter(function (field) {
        var fieldType = ctx.getType(graphql_transformer_common_1.getBaseType(field.type));
        if (graphql_transformer_common_1.isScalar(field.type) || (fieldType && fieldType.kind === graphql_1.Kind.ENUM_TYPE_DEFINITION)) {
            return true;
        }
    })
        .map(function (field) {
        var baseType = graphql_transformer_common_1.getBaseType(field.type);
        var fieldType = ctx.getType(baseType);
        var isList = graphql_transformer_common_1.isListType(field.type);
        var isEnumType = fieldType && fieldType.kind === graphql_1.Kind.ENUM_TYPE_DEFINITION;
        var conditionTypeName = isEnumType && isList
            ? graphql_transformer_common_1.ModelResourceIDs.ModelFilterListInputTypeName(baseType, !supportsConditions)
            : graphql_transformer_common_1.ModelResourceIDs.ModelScalarFilterInputTypeName(baseType, !supportsConditions);
        return {
            kind: graphql_1.Kind.INPUT_VALUE_DEFINITION,
            name: field.name,
            type: graphql_transformer_common_1.makeNamedType(conditionTypeName),
            // TODO: Service does not support new style descriptions so wait.
            // description: field.description,
            directives: [],
        };
    });
    fields.push({
        kind: graphql_1.Kind.INPUT_VALUE_DEFINITION,
        name: {
            kind: 'Name',
            value: 'and',
        },
        type: graphql_transformer_common_1.makeListType(graphql_transformer_common_1.makeNamedType(name)),
        // TODO: Service does not support new style descriptions so wait.
        // description: field.description,
        directives: [],
    }, {
        kind: graphql_1.Kind.INPUT_VALUE_DEFINITION,
        name: {
            kind: 'Name',
            value: 'or',
        },
        type: graphql_transformer_common_1.makeListType(graphql_transformer_common_1.makeNamedType(name)),
        // TODO: Service does not support new style descriptions so wait.
        // description: field.description,
        directives: [],
    }, {
        kind: graphql_1.Kind.INPUT_VALUE_DEFINITION,
        name: {
            kind: 'Name',
            value: 'not',
        },
        type: graphql_transformer_common_1.makeNamedType(name),
        // TODO: Service does not support new style descriptions so wait.
        // description: field.description,
        directives: [],
    });
    return {
        kind: 'InputObjectTypeDefinition',
        // TODO: Service does not support new style descriptions so wait.
        // description: {
        //     kind: 'StringValue',
        //     value: `Input type for ${obj.name.value} mutations`
        // },
        name: {
            kind: 'Name',
            value: name,
        },
        fields: fields,
        directives: [],
    };
}
exports.makeModelXConditionInputObject = makeModelXConditionInputObject;
function makeEnumFilterInputObjects(obj, ctx, supportsConditions) {
    return obj.fields
        .filter(function (field) {
        var fieldType = ctx.getType(graphql_transformer_common_1.getBaseType(field.type));
        return fieldType && fieldType.kind === graphql_1.Kind.ENUM_TYPE_DEFINITION;
    })
        .map(function (enumField) {
        var typeName = graphql_transformer_common_1.getBaseType(enumField.type);
        var isList = graphql_transformer_common_1.isListType(enumField.type);
        var name = isList
            ? graphql_transformer_common_1.ModelResourceIDs.ModelFilterListInputTypeName(typeName, !supportsConditions)
            : graphql_transformer_common_1.ModelResourceIDs.ModelScalarFilterInputTypeName(typeName, !supportsConditions);
        var fields = [];
        fields.push({
            kind: graphql_1.Kind.INPUT_VALUE_DEFINITION,
            name: {
                kind: 'Name',
                value: 'eq',
            },
            type: isList ? graphql_transformer_common_1.makeListType(graphql_transformer_common_1.makeNamedType(typeName)) : graphql_transformer_common_1.makeNamedType(typeName),
            directives: [],
        });
        fields.push({
            kind: graphql_1.Kind.INPUT_VALUE_DEFINITION,
            name: {
                kind: 'Name',
                value: 'ne',
            },
            type: isList ? graphql_transformer_common_1.makeListType(graphql_transformer_common_1.makeNamedType(typeName)) : graphql_transformer_common_1.makeNamedType(typeName),
            directives: [],
        });
        if (isList) {
            fields.push({
                kind: graphql_1.Kind.INPUT_VALUE_DEFINITION,
                name: {
                    kind: 'Name',
                    value: 'contains',
                },
                type: graphql_transformer_common_1.makeNamedType(typeName),
                directives: [],
            });
            fields.push({
                kind: graphql_1.Kind.INPUT_VALUE_DEFINITION,
                name: {
                    kind: 'Name',
                    value: 'notContains',
                },
                type: graphql_transformer_common_1.makeNamedType(typeName),
                directives: [],
            });
        }
        return {
            kind: graphql_1.Kind.INPUT_OBJECT_TYPE_DEFINITION,
            name: {
                kind: 'Name',
                value: name,
            },
            fields: fields,
            directives: [],
        };
    });
}
exports.makeEnumFilterInputObjects = makeEnumFilterInputObjects;
function makeModelSortDirectionEnumObject() {
    var name = graphql_transformer_common_1.graphqlName('ModelSortDirection');
    return {
        kind: graphql_1.Kind.ENUM_TYPE_DEFINITION,
        name: {
            kind: 'Name',
            value: name,
        },
        values: [
            {
                kind: graphql_1.Kind.ENUM_VALUE_DEFINITION,
                name: { kind: 'Name', value: 'ASC' },
                directives: [],
            },
            {
                kind: graphql_1.Kind.ENUM_VALUE_DEFINITION,
                name: { kind: 'Name', value: 'DESC' },
                directives: [],
            },
        ],
        directives: [],
    };
}
exports.makeModelSortDirectionEnumObject = makeModelSortDirectionEnumObject;
function makeModelScalarFilterInputObject(type, supportsConditions) {
    var name = graphql_transformer_common_1.ModelResourceIDs.ModelFilterScalarInputTypeName(type, !supportsConditions);
    var conditions = getScalarConditions(type);
    var fields = conditions.map(function (condition) { return ({
        kind: graphql_1.Kind.INPUT_VALUE_DEFINITION,
        name: { kind: 'Name', value: condition },
        type: getScalarFilterInputType(condition, type, name),
        // TODO: Service does not support new style descriptions so wait.
        // description: field.description,
        directives: [],
    }); });
    var functionInputFields = [];
    if (supportsConditions) {
        functionInputFields = makeFunctionInputFields(type);
    }
    return {
        kind: graphql_1.Kind.INPUT_OBJECT_TYPE_DEFINITION,
        // TODO: Service does not support new style descriptions so wait.
        // description: {
        //     kind: 'StringValue',
        //     value: `Input type for ${obj.name.value} mutations`
        // },
        name: {
            kind: 'Name',
            value: name,
        },
        fields: __spreadArrays(fields, functionInputFields),
        directives: [],
    };
}
exports.makeModelScalarFilterInputObject = makeModelScalarFilterInputObject;
function getScalarFilterInputType(condition, type, filterInputName) {
    switch (condition) {
        case 'between':
            return graphql_transformer_common_1.makeListType(graphql_transformer_common_1.makeNamedType(type));
        case 'and':
        case 'or':
            return graphql_transformer_common_1.makeNamedType(filterInputName);
        default:
            return graphql_transformer_common_1.makeNamedType(type);
    }
}
function getScalarConditions(type) {
    switch (type) {
        case 'String':
            return STRING_CONDITIONS;
        case 'ID':
            return ID_CONDITIONS;
        case 'Int':
            return INT_CONDITIONS;
        case 'Float':
            return FLOAT_CONDITIONS;
        case 'Boolean':
            return BOOLEAN_CONDITIONS;
        default:
            throw new Error('Valid types are String, ID, Int, Float, Boolean');
    }
}
function makeSizeInputType() {
    var name = graphql_transformer_common_1.ModelResourceIDs.ModelSizeInputTypeName();
    var fields = SIZE_CONDITIONS.map(function (condition) { return ({
        kind: graphql_1.Kind.INPUT_VALUE_DEFINITION,
        name: { kind: 'Name', value: condition },
        type: getScalarFilterInputType(condition, 'Int', '' /* unused */),
        // TODO: Service does not support new style descriptions so wait.
        // description: field.description,
        directives: [],
    }); });
    return {
        kind: graphql_1.Kind.INPUT_OBJECT_TYPE_DEFINITION,
        // TODO: Service does not support new style descriptions so wait.
        // description: {
        //     kind: 'StringValue',
        //     value: `Input type for ${obj.name.value} mutations`
        // },
        name: {
            kind: 'Name',
            value: name,
        },
        fields: fields,
        directives: [],
    };
}
function getFunctionListForType(typeName) {
    switch (typeName) {
        case 'String':
            return STRING_FUNCTIONS;
        case 'ID':
            return ID_FUNCTIONS;
        case 'Int':
            return INT_FUNCTIONS;
        case 'Float':
            return FLOAT_FUNCTIONS;
        case 'Boolean':
            return BOOLEAN_FUNCTIONS;
        default:
            throw new Error('Valid types are String, ID, Int, Float, Boolean');
    }
}
function makeFunctionInputFields(typeName) {
    var functions = getFunctionListForType(typeName);
    var fields = new Array();
    if (functions.has('attributeExists')) {
        fields.push({
            kind: graphql_1.Kind.INPUT_VALUE_DEFINITION,
            name: { kind: 'Name', value: 'attributeExists' },
            type: graphql_transformer_common_1.makeNamedType('Boolean'),
            // TODO: Service does not support new style descriptions so wait.
            // description: field.description,
            directives: [],
        });
    }
    if (functions.has('attributeType')) {
        fields.push({
            kind: graphql_1.Kind.INPUT_VALUE_DEFINITION,
            name: { kind: 'Name', value: 'attributeType' },
            type: graphql_transformer_common_1.makeNamedType(graphql_transformer_common_1.ModelResourceIDs.ModelAttributeTypesName()),
            // TODO: Service does not support new style descriptions so wait.
            // description: field.description,
            directives: [],
        });
    }
    if (functions.has('size')) {
        fields.push({
            kind: graphql_1.Kind.INPUT_VALUE_DEFINITION,
            name: { kind: 'Name', value: 'size' },
            type: graphql_transformer_common_1.makeNamedType(graphql_transformer_common_1.ModelResourceIDs.ModelSizeInputTypeName()),
            // TODO: Service does not support new style descriptions so wait.
            // description: field.description,
            directives: [],
        });
    }
    return fields;
}
function makeAttributeTypeEnum() {
    var makeEnumValue = function (enumValue) { return ({
        kind: graphql_1.Kind.ENUM_VALUE_DEFINITION,
        name: { kind: 'Name', value: enumValue },
        directives: [],
    }); };
    return {
        kind: graphql_1.Kind.ENUM_TYPE_DEFINITION,
        name: { kind: 'Name', value: graphql_transformer_common_1.ModelResourceIDs.ModelAttributeTypesName() },
        values: ATTRIBUTE_TYPES.map(function (t) { return makeEnumValue(t); }),
        directives: [],
    };
}
exports.makeAttributeTypeEnum = makeAttributeTypeEnum;
function makeModelConnectionType(typeName, isSync) {
    if (isSync === void 0) { isSync = false; }
    var connectionName = graphql_transformer_common_1.ModelResourceIDs.ModelConnectionTypeName(typeName);
    var connectionTypeExtension = graphql_transformer_common_1.blankObjectExtension(connectionName);
    connectionTypeExtension = graphql_transformer_common_1.extensionWithFields(connectionTypeExtension, [graphql_transformer_common_1.makeField('items', [], graphql_transformer_common_1.makeListType(graphql_transformer_common_1.makeNamedType(typeName)))]);
    connectionTypeExtension = graphql_transformer_common_1.extensionWithFields(connectionTypeExtension, [graphql_transformer_common_1.makeField('nextToken', [], graphql_transformer_common_1.makeNamedType('String'))]);
    if (isSync) {
        connectionTypeExtension = graphql_transformer_common_1.extensionWithFields(connectionTypeExtension, [graphql_transformer_common_1.makeField('startedAt', [], graphql_transformer_common_1.makeNamedType('AWSTimestamp'))]);
    }
    return connectionTypeExtension;
}
exports.makeModelConnectionType = makeModelConnectionType;
function makeSubscriptionField(fieldName, returnTypeName, mutations) {
    return graphql_transformer_common_1.makeField(fieldName, [], graphql_transformer_common_1.makeNamedType(returnTypeName), [
        graphql_transformer_common_1.makeDirective('aws_subscribe', [graphql_transformer_common_1.makeArgument('mutations', graphql_transformer_common_1.makeValueNode(mutations))]),
    ]);
}
exports.makeSubscriptionField = makeSubscriptionField;
function makeModelConnectionField(fieldName, returnTypeName, sortKeyInfo, directives) {
    var args = [
        graphql_transformer_common_1.makeInputValueDefinition('filter', graphql_transformer_common_1.makeNamedType(graphql_transformer_common_1.ModelResourceIDs.ModelFilterInputTypeName(returnTypeName))),
        graphql_transformer_common_1.makeInputValueDefinition('sortDirection', graphql_transformer_common_1.makeNamedType('ModelSortDirection')),
        graphql_transformer_common_1.makeInputValueDefinition('limit', graphql_transformer_common_1.makeNamedType('Int')),
        graphql_transformer_common_1.makeInputValueDefinition('nextToken', graphql_transformer_common_1.makeNamedType('String')),
    ];
    if (sortKeyInfo) {
        var namedType = void 0;
        if (sortKeyInfo.typeName === 'Composite') {
            namedType = graphql_transformer_common_1.makeNamedType(graphql_transformer_common_1.ModelResourceIDs.ModelCompositeKeyConditionInputTypeName(sortKeyInfo.model, graphql_transformer_common_1.toUpper(sortKeyInfo.keyName)));
        }
        else {
            namedType = graphql_transformer_common_1.makeNamedType(graphql_transformer_common_1.ModelResourceIDs.ModelKeyConditionInputTypeName(sortKeyInfo.typeName));
        }
        args.unshift(graphql_transformer_common_1.makeInputValueDefinition(sortKeyInfo.fieldName, namedType));
    }
    return graphql_transformer_common_1.makeField(fieldName, args, graphql_transformer_common_1.makeNamedType(graphql_transformer_common_1.ModelResourceIDs.ModelConnectionTypeName(returnTypeName)), directives);
}
exports.makeModelConnectionField = makeModelConnectionField;
function makeScalarFilterInputs(supportsConditions) {
    var inputs = [
        makeModelScalarFilterInputObject('String', supportsConditions),
        makeModelScalarFilterInputObject('ID', supportsConditions),
        makeModelScalarFilterInputObject('Int', supportsConditions),
        makeModelScalarFilterInputObject('Float', supportsConditions),
        makeModelScalarFilterInputObject('Boolean', supportsConditions),
    ];
    if (supportsConditions) {
        inputs.push(makeSizeInputType());
    }
    return inputs;
}
exports.makeScalarFilterInputs = makeScalarFilterInputs;
//# sourceMappingURL=definitions.js.map