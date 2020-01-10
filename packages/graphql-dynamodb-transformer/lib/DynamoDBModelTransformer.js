"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __makeTemplateObject = (this && this.__makeTemplateObject) || function (cooked, raw) {
    if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
    return cooked;
};
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
var cloudform_types_1 = require("cloudform-types");
var graphql_transformer_common_1 = require("graphql-transformer-common");
var graphql_transformer_core_1 = require("graphql-transformer-core");
var definitions_1 = require("./definitions");
var resources_1 = require("./resources");
// Transform config version constants
// We have constants instead of magic number all around, later these should be moved to feature
// flags and transformers should be feature and not version dependent.
// To support generation of conditions and new naming, version 5 was introduced
exports.CONDITIONS_MINIMUM_VERSION = 5;
/**
 * The @model transformer.
 *
 * This transform creates a single DynamoDB table for all of your application's
 * data. It uses a standard key structure and nested map to store object values.
 * A relationKey field
 *
 * {
 *  type (HASH),
 *  id (SORT),
 *  value (MAP),
 *  createdAt, (LSI w/ type)
 *  updatedAt (LSI w/ type)
 * }
 */
var DynamoDBModelTransformer = /** @class */ (function (_super) {
    __extends(DynamoDBModelTransformer, _super);
    function DynamoDBModelTransformer(opts) {
        if (opts === void 0) { opts = {}; }
        var _this = _super.call(this, 'DynamoDBModelTransformer', graphql_transformer_core_1.gql(templateObject_1 || (templateObject_1 = __makeTemplateObject(["\n        directive @model(queries: ModelQueryMap, mutations: ModelMutationMap, subscriptions: ModelSubscriptionMap) on OBJECT\n        input ModelMutationMap {\n          create: String\n          update: String\n          delete: String\n        }\n        input ModelQueryMap {\n          get: String\n          list: String\n        }\n        input ModelSubscriptionMap {\n          onCreate: [String]\n          onUpdate: [String]\n          onDelete: [String]\n          level: ModelSubscriptionLevel\n        }\n        enum ModelSubscriptionLevel {\n          off\n          public\n          on\n        }\n      "], ["\n        directive @model(queries: ModelQueryMap, mutations: ModelMutationMap, subscriptions: ModelSubscriptionMap) on OBJECT\n        input ModelMutationMap {\n          create: String\n          update: String\n          delete: String\n        }\n        input ModelQueryMap {\n          get: String\n          list: String\n        }\n        input ModelSubscriptionMap {\n          onCreate: [String]\n          onUpdate: [String]\n          onDelete: [String]\n          level: ModelSubscriptionLevel\n        }\n        enum ModelSubscriptionLevel {\n          off\n          public\n          on\n        }\n      "])))) || this;
        _this.before = function (ctx) {
            var template = _this.resources.initTemplate();
            ctx.mergeResources(template.Resources);
            ctx.mergeParameters(template.Parameters);
            ctx.mergeOutputs(template.Outputs);
            ctx.mergeConditions(template.Conditions);
        };
        /**
         * Given the initial input and context manipulate the context to handle this object directive.
         * @param initial The input passed to the transform.
         * @param ctx The accumulated context for the transform.
         */
        _this.object = function (def, directive, ctx) {
            // Add a stack mapping so that all model resources are pulled
            // into their own stack at the end of the transformation.
            var stackName = def.name.value;
            var nonModelArray = definitions_1.getNonModelObjectArray(def, ctx, new Map());
            nonModelArray.forEach(function (value) {
                var nonModelObject = definitions_1.makeNonModelInputObject(value, nonModelArray, ctx);
                if (!_this.typeExist(nonModelObject.name.value, ctx)) {
                    ctx.addInput(nonModelObject);
                }
            });
            // Set Sync Config if it exists
            // Create the dynamodb table to hold the @model type
            // TODO: Handle types with more than a single "id" hash key
            var typeName = def.name.value;
            _this.setSyncConfig(ctx, typeName);
            var isSyncEnabled = _this.opts.SyncConfig ? true : false;
            var tableLogicalID = graphql_transformer_common_1.ModelResourceIDs.ModelTableResourceID(typeName);
            var iamRoleLogicalID = graphql_transformer_common_1.ModelResourceIDs.ModelTableIAMRoleID(typeName);
            var dataSourceRoleLogicalID = graphql_transformer_common_1.ModelResourceIDs.ModelTableDataSourceID(typeName);
            var deletionPolicy = _this.opts.EnableDeletionProtection ? cloudform_types_1.DeletionPolicy.Retain : cloudform_types_1.DeletionPolicy.Delete;
            ctx.setResource(tableLogicalID, _this.resources.makeModelTable(typeName, undefined, undefined, deletionPolicy, isSyncEnabled));
            ctx.mapResourceToStack(stackName, tableLogicalID);
            ctx.setResource(iamRoleLogicalID, _this.resources.makeIAMRole(typeName, _this.opts.SyncConfig));
            ctx.mapResourceToStack(stackName, iamRoleLogicalID);
            ctx.setResource(dataSourceRoleLogicalID, _this.resources.makeDynamoDBDataSource(tableLogicalID, iamRoleLogicalID, typeName, isSyncEnabled));
            ctx.mapResourceToStack(stackName, dataSourceRoleLogicalID);
            var streamArnOutputId = "GetAtt" + graphql_transformer_common_1.ModelResourceIDs.ModelTableStreamArn(typeName);
            ctx.setOutput(
            // "GetAtt" is a backward compatibility addition to prevent breaking current deploys.
            streamArnOutputId, _this.resources.makeTableStreamArnOutput(tableLogicalID));
            ctx.mapResourceToStack(stackName, streamArnOutputId);
            var datasourceOutputId = "GetAtt" + dataSourceRoleLogicalID + "Name";
            ctx.setOutput(datasourceOutputId, _this.resources.makeDataSourceOutput(dataSourceRoleLogicalID));
            ctx.mapResourceToStack(stackName, datasourceOutputId);
            var tableNameOutputId = "GetAtt" + tableLogicalID + "Name";
            ctx.setOutput(tableNameOutputId, _this.resources.makeTableNameOutput(tableLogicalID));
            ctx.mapResourceToStack(stackName, tableNameOutputId);
            _this.createQueries(def, directive, ctx);
            _this.createMutations(def, directive, ctx, nonModelArray);
            _this.createSubscriptions(def, directive, ctx);
            // Update ModelXConditionInput type
            _this.updateMutationConditionInput(ctx, def);
            // change type to include sync related fields if sync is enabled
            if (isSyncEnabled) {
                var obj = ctx.getObject(def.name.value);
                var newObj = graphql_transformer_common_1.makeObjectDefinition(obj.name.value, __spreadArrays(obj.fields, [
                    graphql_transformer_common_1.makeField('_version', [], graphql_transformer_common_1.wrapNonNull(graphql_transformer_common_1.makeNamedType('Int'))),
                    graphql_transformer_common_1.makeField('_deleted', [], graphql_transformer_common_1.makeNamedType('Boolean')),
                    graphql_transformer_common_1.makeField('_lastChangedAt', [], graphql_transformer_common_1.wrapNonNull(graphql_transformer_common_1.makeNamedType('AWSTimestamp'))),
                ]));
                ctx.updateObject(newObj);
            }
        };
        _this.createMutations = function (def, directive, ctx, nonModelArray) {
            var typeName = def.name.value;
            var isSyncEnabled = _this.opts.SyncConfig ? true : false;
            var mutationFields = [];
            // Get any name overrides provided by the user. If an empty map it provided
            // then we do not generate those fields.
            var directiveArguments = graphql_transformer_core_1.getDirectiveArguments(directive);
            // Configure mutations based on *mutations* argument
            var shouldMakeCreate = true;
            var shouldMakeUpdate = true;
            var shouldMakeDelete = true;
            var createFieldNameOverride = undefined;
            var updateFieldNameOverride = undefined;
            var deleteFieldNameOverride = undefined;
            // Figure out which mutations to make and if they have name overrides
            if (directiveArguments.mutations === null) {
                shouldMakeCreate = false;
                shouldMakeUpdate = false;
                shouldMakeDelete = false;
            }
            else if (directiveArguments.mutations) {
                if (!directiveArguments.mutations.create) {
                    shouldMakeCreate = false;
                }
                else {
                    createFieldNameOverride = directiveArguments.mutations.create;
                }
                if (!directiveArguments.mutations.update) {
                    shouldMakeUpdate = false;
                }
                else {
                    updateFieldNameOverride = directiveArguments.mutations.update;
                }
                if (!directiveArguments.mutations.delete) {
                    shouldMakeDelete = false;
                }
                else {
                    deleteFieldNameOverride = directiveArguments.mutations.delete;
                }
            }
            var conditionInputName = graphql_transformer_common_1.ModelResourceIDs.ModelConditionInputTypeName(typeName);
            // Create the mutations.
            if (shouldMakeCreate) {
                var createInput = definitions_1.makeCreateInputObject(def, nonModelArray, ctx, isSyncEnabled);
                if (!ctx.getType(createInput.name.value)) {
                    ctx.addInput(createInput);
                }
                var createResolver = _this.resources.makeCreateResolver({
                    type: def.name.value,
                    nameOverride: createFieldNameOverride,
                    syncConfig: _this.opts.SyncConfig,
                });
                var resourceId = graphql_transformer_common_1.ResolverResourceIDs.DynamoDBCreateResolverResourceID(typeName);
                ctx.setResource(resourceId, createResolver);
                ctx.mapResourceToStack(typeName, resourceId);
                var args = [graphql_transformer_common_1.makeInputValueDefinition('input', graphql_transformer_common_1.makeNonNullType(graphql_transformer_common_1.makeNamedType(createInput.name.value)))];
                if (_this.supportsConditions(ctx)) {
                    args.push(graphql_transformer_common_1.makeInputValueDefinition('condition', graphql_transformer_common_1.makeNamedType(conditionInputName)));
                }
                mutationFields.push(graphql_transformer_common_1.makeField(createResolver.Properties.FieldName.toString(), args, graphql_transformer_common_1.makeNamedType(def.name.value)));
            }
            if (shouldMakeUpdate) {
                var updateInput = definitions_1.makeUpdateInputObject(def, nonModelArray, ctx, isSyncEnabled);
                if (!ctx.getType(updateInput.name.value)) {
                    ctx.addInput(updateInput);
                }
                var updateResolver = _this.resources.makeUpdateResolver({
                    type: def.name.value,
                    nameOverride: updateFieldNameOverride,
                    syncConfig: _this.opts.SyncConfig,
                });
                var resourceId = graphql_transformer_common_1.ResolverResourceIDs.DynamoDBUpdateResolverResourceID(typeName);
                ctx.setResource(resourceId, updateResolver);
                ctx.mapResourceToStack(typeName, resourceId);
                var args = [graphql_transformer_common_1.makeInputValueDefinition('input', graphql_transformer_common_1.makeNonNullType(graphql_transformer_common_1.makeNamedType(updateInput.name.value)))];
                if (_this.supportsConditions(ctx)) {
                    args.push(graphql_transformer_common_1.makeInputValueDefinition('condition', graphql_transformer_common_1.makeNamedType(conditionInputName)));
                }
                mutationFields.push(graphql_transformer_common_1.makeField(updateResolver.Properties.FieldName.toString(), args, graphql_transformer_common_1.makeNamedType(def.name.value)));
            }
            if (shouldMakeDelete) {
                var deleteInput = definitions_1.makeDeleteInputObject(def, isSyncEnabled);
                if (!ctx.getType(deleteInput.name.value)) {
                    ctx.addInput(deleteInput);
                }
                var deleteResolver = _this.resources.makeDeleteResolver({
                    type: def.name.value,
                    nameOverride: deleteFieldNameOverride,
                    syncConfig: _this.opts.SyncConfig,
                });
                var resourceId = graphql_transformer_common_1.ResolverResourceIDs.DynamoDBDeleteResolverResourceID(typeName);
                ctx.setResource(resourceId, deleteResolver);
                ctx.mapResourceToStack(typeName, resourceId);
                var args = [graphql_transformer_common_1.makeInputValueDefinition('input', graphql_transformer_common_1.makeNonNullType(graphql_transformer_common_1.makeNamedType(deleteInput.name.value)))];
                if (_this.supportsConditions(ctx)) {
                    args.push(graphql_transformer_common_1.makeInputValueDefinition('condition', graphql_transformer_common_1.makeNamedType(conditionInputName)));
                }
                mutationFields.push(graphql_transformer_common_1.makeField(deleteResolver.Properties.FieldName.toString(), args, graphql_transformer_common_1.makeNamedType(def.name.value)));
            }
            ctx.addMutationFields(mutationFields);
            if (shouldMakeCreate || shouldMakeUpdate || shouldMakeDelete) {
                _this.generateConditionInputs(ctx, def);
            }
        };
        _this.createQueries = function (def, directive, ctx) {
            var typeName = def.name.value;
            var queryFields = [];
            var directiveArguments = graphql_transformer_core_1.getDirectiveArguments(directive);
            // Configure queries based on *queries* argument
            var shouldMakeGet = true;
            var shouldMakeList = true;
            var getFieldNameOverride = undefined;
            var listFieldNameOverride = undefined;
            var isSyncEnabled = _this.opts.SyncConfig ? true : false;
            // Figure out which queries to make and if they have name overrides.
            // If queries is undefined (default), create all queries
            // If queries is explicetly set to null, do not create any
            // else if queries is defined, check overrides
            if (directiveArguments.queries === null) {
                shouldMakeGet = false;
                shouldMakeList = false;
            }
            else if (directiveArguments.queries) {
                if (!directiveArguments.queries.get) {
                    shouldMakeGet = false;
                }
                else {
                    getFieldNameOverride = directiveArguments.queries.get;
                }
                if (!directiveArguments.queries.list) {
                    shouldMakeList = false;
                }
                else {
                    listFieldNameOverride = directiveArguments.queries.list;
                }
            }
            if (shouldMakeList) {
                if (!_this.typeExist('ModelSortDirection', ctx)) {
                    var tableSortDirection = definitions_1.makeModelSortDirectionEnumObject();
                    ctx.addEnum(tableSortDirection);
                }
            }
            // Create sync query
            if (isSyncEnabled) {
                var syncResolver = _this.resources.makeSyncResolver(typeName);
                var syncResourceID = graphql_transformer_common_1.ResolverResourceIDs.SyncResolverResourceID(typeName);
                ctx.setResource(syncResourceID, syncResolver);
                ctx.mapResourceToStack(typeName, syncResourceID);
                _this.generateModelXConnectionType(ctx, def, isSyncEnabled);
                _this.generateFilterInputs(ctx, def);
                queryFields.push(graphql_transformer_common_1.makeField(syncResolver.Properties.FieldName.toString(), [
                    graphql_transformer_common_1.makeInputValueDefinition('filter', graphql_transformer_common_1.makeNamedType(graphql_transformer_common_1.ModelResourceIDs.ModelFilterInputTypeName(def.name.value))),
                    graphql_transformer_common_1.makeInputValueDefinition('limit', graphql_transformer_common_1.makeNamedType('Int')),
                    graphql_transformer_common_1.makeInputValueDefinition('nextToken', graphql_transformer_common_1.makeNamedType('String')),
                    graphql_transformer_common_1.makeInputValueDefinition('lastSync', graphql_transformer_common_1.makeNamedType('AWSTimestamp')),
                ], graphql_transformer_common_1.makeNamedType(graphql_transformer_common_1.ModelResourceIDs.ModelConnectionTypeName(def.name.value))));
            }
            // Create get queries
            if (shouldMakeGet) {
                var getResolver = _this.resources.makeGetResolver(def.name.value, getFieldNameOverride, isSyncEnabled, ctx.getQueryTypeName());
                var resourceId = graphql_transformer_common_1.ResolverResourceIDs.DynamoDBGetResolverResourceID(typeName);
                ctx.setResource(resourceId, getResolver);
                ctx.mapResourceToStack(typeName, resourceId);
                queryFields.push(graphql_transformer_common_1.makeField(getResolver.Properties.FieldName.toString(), [graphql_transformer_common_1.makeInputValueDefinition('id', graphql_transformer_common_1.makeNonNullType(graphql_transformer_common_1.makeNamedType('ID')))], graphql_transformer_common_1.makeNamedType(def.name.value)));
            }
            if (shouldMakeList) {
                _this.generateModelXConnectionType(ctx, def);
                // Create the list resolver
                var listResolver = _this.resources.makeListResolver(def.name.value, listFieldNameOverride, isSyncEnabled, ctx.getQueryTypeName());
                var resourceId = graphql_transformer_common_1.ResolverResourceIDs.DynamoDBListResolverResourceID(typeName);
                ctx.setResource(resourceId, listResolver);
                ctx.mapResourceToStack(typeName, resourceId);
                queryFields.push(graphql_transformer_common_1.makeConnectionField(listResolver.Properties.FieldName.toString(), def.name.value));
            }
            _this.generateFilterInputs(ctx, def);
            ctx.addQueryFields(queryFields);
        };
        /**
         * Creates subscriptions for a @model object type. By default creates a subscription for
         * create, update, and delete mutations.
         *
         * Subscriptions are one to many in that a subscription may subscribe to multiple mutations.
         * You may thus provide multiple names of the subscriptions that will be triggered by each
         * mutation.
         *
         * type Post @model(subscriptions: { onCreate: ["onPostCreated", "onFeedUpdated"] }) {
         *      id: ID!
         *      title: String!
         * }
         *
         * will create two subscription fields:
         *
         * type Subscription {
         *      onPostCreated: Post @aws_subscribe(mutations: ["createPost"])
         *      onFeedUpdated: Post @aws_subscribe(mutations: ["createPost"])
         * }
         *  Subscription Levels
         *   subscriptions.level === OFF || subscriptions === null
         *      Will not create subscription operations
         *   subcriptions.level === PUBLIC
         *      Will continue as is creating subscription operations
         *   subscriptions.level === ON || subscriptions === undefined
         *      If auth is enabled it will enabled protection on subscription operations and resolvers
         */
        _this.createSubscriptions = function (def, directive, ctx) {
            var typeName = def.name.value;
            var subscriptionFields = [];
            var directiveArguments = graphql_transformer_core_1.getDirectiveArguments(directive);
            var subscriptionsArgument = directiveArguments.subscriptions;
            var createResolver = ctx.getResource(graphql_transformer_common_1.ResolverResourceIDs.DynamoDBCreateResolverResourceID(typeName));
            var updateResolver = ctx.getResource(graphql_transformer_common_1.ResolverResourceIDs.DynamoDBUpdateResolverResourceID(typeName));
            var deleteResolver = ctx.getResource(graphql_transformer_common_1.ResolverResourceIDs.DynamoDBDeleteResolverResourceID(typeName));
            if (subscriptionsArgument === null) {
                return;
            }
            if (subscriptionsArgument && subscriptionsArgument.level === 'off') {
                return;
            }
            if (subscriptionsArgument && (subscriptionsArgument.onCreate || subscriptionsArgument.onUpdate || subscriptionsArgument.onDelete)) {
                // Add the custom subscriptions
                var subscriptionToMutationsMap = {};
                var onCreate = subscriptionsArgument.onCreate || [];
                var onUpdate = subscriptionsArgument.onUpdate || [];
                var onDelete = subscriptionsArgument.onDelete || [];
                var subFields = __spreadArrays(onCreate, onUpdate, onDelete);
                // initialize the reverse lookup
                for (var _i = 0, subFields_1 = subFields; _i < subFields_1.length; _i++) {
                    var field = subFields_1[_i];
                    subscriptionToMutationsMap[field] = [];
                }
                // Add the correct mutation to the lookup
                for (var _a = 0, _b = Object.keys(subscriptionToMutationsMap); _a < _b.length; _a++) {
                    var field = _b[_a];
                    if (onCreate.includes(field) && createResolver) {
                        subscriptionToMutationsMap[field].push(createResolver.Properties.FieldName);
                    }
                    if (onUpdate.includes(field) && updateResolver) {
                        subscriptionToMutationsMap[field].push(updateResolver.Properties.FieldName);
                    }
                    if (onDelete.includes(field) && deleteResolver) {
                        subscriptionToMutationsMap[field].push(deleteResolver.Properties.FieldName);
                    }
                }
                for (var _c = 0, _d = Object.keys(subscriptionToMutationsMap); _c < _d.length; _c++) {
                    var subFieldName = _d[_c];
                    var subField = definitions_1.makeSubscriptionField(subFieldName, typeName, subscriptionToMutationsMap[subFieldName]);
                    subscriptionFields.push(subField);
                }
            }
            else {
                // Add the default subscriptions
                if (createResolver) {
                    var onCreateField = definitions_1.makeSubscriptionField(graphql_transformer_common_1.ModelResourceIDs.ModelOnCreateSubscriptionName(typeName), typeName, [
                        createResolver.Properties.FieldName,
                    ]);
                    subscriptionFields.push(onCreateField);
                }
                if (updateResolver) {
                    var onUpdateField = definitions_1.makeSubscriptionField(graphql_transformer_common_1.ModelResourceIDs.ModelOnUpdateSubscriptionName(typeName), typeName, [
                        updateResolver.Properties.FieldName,
                    ]);
                    subscriptionFields.push(onUpdateField);
                }
                if (deleteResolver) {
                    var onDeleteField = definitions_1.makeSubscriptionField(graphql_transformer_common_1.ModelResourceIDs.ModelOnDeleteSubscriptionName(typeName), typeName, [
                        deleteResolver.Properties.FieldName,
                    ]);
                    subscriptionFields.push(onDeleteField);
                }
            }
            ctx.addSubscriptionFields(subscriptionFields);
        };
        _this.opts = _this.getOpts(opts);
        _this.resources = new resources_1.ResourceFactory();
        return _this;
    }
    DynamoDBModelTransformer.prototype.typeExist = function (type, ctx) {
        return Boolean(type in ctx.nodeMap);
    };
    DynamoDBModelTransformer.prototype.generateModelXConnectionType = function (ctx, def, isSync) {
        if (isSync === void 0) { isSync = false; }
        var tableXConnectionName = graphql_transformer_common_1.ModelResourceIDs.ModelConnectionTypeName(def.name.value);
        if (this.typeExist(tableXConnectionName, ctx)) {
            return;
        }
        // Create the ModelXConnection
        var connectionType = graphql_transformer_common_1.blankObject(tableXConnectionName);
        ctx.addObject(connectionType);
        ctx.addObjectExtension(definitions_1.makeModelConnectionType(def.name.value, isSync));
    };
    DynamoDBModelTransformer.prototype.generateFilterInputs = function (ctx, def) {
        var scalarFilters = definitions_1.makeScalarFilterInputs(this.supportsConditions(ctx));
        for (var _i = 0, scalarFilters_1 = scalarFilters; _i < scalarFilters_1.length; _i++) {
            var filter = scalarFilters_1[_i];
            if (!this.typeExist(filter.name.value, ctx)) {
                ctx.addInput(filter);
            }
        }
        // Create the Enum filters
        var enumFilters = definitions_1.makeEnumFilterInputObjects(def, ctx, this.supportsConditions(ctx));
        for (var _a = 0, enumFilters_1 = enumFilters; _a < enumFilters_1.length; _a++) {
            var filter = enumFilters_1[_a];
            if (!this.typeExist(filter.name.value, ctx)) {
                ctx.addInput(filter);
            }
        }
        // Create the ModelXFilterInput
        var tableXQueryFilterInput = definitions_1.makeModelXFilterInputObject(def, ctx, this.supportsConditions(ctx));
        if (!this.typeExist(tableXQueryFilterInput.name.value, ctx)) {
            ctx.addInput(tableXQueryFilterInput);
        }
    };
    DynamoDBModelTransformer.prototype.generateConditionInputs = function (ctx, def) {
        var scalarFilters = definitions_1.makeScalarFilterInputs(this.supportsConditions(ctx));
        for (var _i = 0, scalarFilters_2 = scalarFilters; _i < scalarFilters_2.length; _i++) {
            var filter = scalarFilters_2[_i];
            if (!this.typeExist(filter.name.value, ctx)) {
                ctx.addInput(filter);
            }
        }
        // Create the Enum filters
        var enumFilters = definitions_1.makeEnumFilterInputObjects(def, ctx, this.supportsConditions(ctx));
        for (var _a = 0, enumFilters_2 = enumFilters; _a < enumFilters_2.length; _a++) {
            var filter = enumFilters_2[_a];
            if (!this.typeExist(filter.name.value, ctx)) {
                ctx.addInput(filter);
            }
        }
        if (this.supportsConditions(ctx)) {
            // Create the ModelXConditionInput
            var tableXMutationConditionInput = definitions_1.makeModelXConditionInputObject(def, ctx, this.supportsConditions(ctx));
            if (!this.typeExist(tableXMutationConditionInput.name.value, ctx)) {
                ctx.addInput(tableXMutationConditionInput);
            }
            var attributeTypeEnum = definitions_1.makeAttributeTypeEnum();
            if (!this.typeExist(attributeTypeEnum.name.value, ctx)) {
                ctx.addType(attributeTypeEnum);
            }
        }
    };
    DynamoDBModelTransformer.prototype.getOpts = function (opts) {
        var defaultOpts = {
            EnableDeletionProtection: false,
        };
        return __assign(__assign({}, defaultOpts), opts);
    };
    DynamoDBModelTransformer.prototype.setSyncConfig = function (ctx, typeName) {
        var syncConfig;
        var resolverConfig = ctx.getResolverConfig();
        if (resolverConfig && resolverConfig.project) {
            syncConfig = resolverConfig.project;
        }
        if (resolverConfig && resolverConfig.models && resolverConfig.models[typeName]) {
            var typeResolverConfig = resolverConfig.models[typeName];
            if (typeResolverConfig.ConflictDetection && typeResolverConfig.ConflictHandler) {
                syncConfig = typeResolverConfig;
            }
            else {
                console.warn("Invalid resolverConfig for type " + typeName + ". Using the project resolverConfig instead.");
            }
        }
        return (this.opts.SyncConfig = syncConfig);
    };
    // Due to the current architecture of Transformers we've to handle the 'id' field removal
    // here, because KeyTranformer will not be invoked if there are no @key directives declared
    // on the type.
    DynamoDBModelTransformer.prototype.updateMutationConditionInput = function (ctx, type) {
        if (this.supportsConditions(ctx)) {
            // Get the existing ModelXConditionInput
            var tableXMutationConditionInputName = graphql_transformer_common_1.ModelResourceIDs.ModelConditionInputTypeName(type.name.value);
            if (this.typeExist(tableXMutationConditionInputName, ctx)) {
                var tableXMutationConditionInput = ctx.getType(tableXMutationConditionInputName);
                var keyDirectives = type.directives.filter(function (d) { return d.name.value === 'key'; });
                // If there are @key directives defined we've nothing to do, it will handle everything
                if (keyDirectives && keyDirectives.length > 0) {
                    return;
                }
                // Remove the field named 'id' from the condition if there is one
                var idField = tableXMutationConditionInput.fields.find(function (f) { return f.name.value === 'id'; });
                if (idField) {
                    var reducedFields = tableXMutationConditionInput.fields.filter(function (f) { return Boolean(f.name.value !== 'id'); });
                    var updatedInput = __assign(__assign({}, tableXMutationConditionInput), { fields: reducedFields });
                    ctx.putType(updatedInput);
                }
            }
        }
    };
    DynamoDBModelTransformer.prototype.supportsConditions = function (context) {
        return context.getTransformerVersion() >= exports.CONDITIONS_MINIMUM_VERSION;
    };
    return DynamoDBModelTransformer;
}(graphql_transformer_core_1.Transformer));
exports.DynamoDBModelTransformer = DynamoDBModelTransformer;
var templateObject_1;
//# sourceMappingURL=DynamoDBModelTransformer.js.map