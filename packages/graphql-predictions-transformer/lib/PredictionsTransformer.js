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
var graphql_1 = require("graphql");
var definitions_1 = require("./definitions");
var graphql_transformer_core_1 = require("graphql-transformer-core");
var graphql_transformer_common_1 = require("graphql-transformer-common");
var resources_1 = require("./resources");
var predictions_utils_1 = require("./predictions_utils");
var cloudform_types_1 = require("cloudform-types");
var path = require("path");
var PREDICTIONS_DIRECTIVE_STACK = 'PredictionsDirectiveStack';
var PredictionsTransformer = /** @class */ (function (_super) {
    __extends(PredictionsTransformer, _super);
    function PredictionsTransformer(predictionsConfig) {
        var _this = _super.call(this, 'PredictionsTransformer', graphql_transformer_core_1.gql(templateObject_1 || (templateObject_1 = __makeTemplateObject(["\n        # where the parent this field is defined on is a query type\n        directive @predictions(actions: [PredictionsActions!]!) on FIELD_DEFINITION\n        enum PredictionsActions {\n          identifyText\n          identifyLabels\n          convertTextToSpeech\n          translateText\n        }\n      "], ["\n        # where the parent this field is defined on is a query type\n        directive @predictions(actions: [PredictionsActions!]!) on FIELD_DEFINITION\n        enum PredictionsActions {\n          identifyText\n          identifyLabels\n          convertTextToSpeech\n          translateText\n        }\n      "])))) || this;
        _this.field = function (parent, definition, directive, ctx) {
            // validate @predictions is defined on a field under a query object
            if (parent.name.value !== ctx.getQueryTypeName()) {
                throw new graphql_transformer_core_1.InvalidDirectiveError('@predictions directive only works under Query operations.');
            }
            // get input arguments
            var actions = _this.getActions(directive);
            // validate that that order the transformers are correct
            _this.validateActions(actions);
            // validate storage is in the config
            if (!(_this.predictionsConfig) || !(_this.predictionsConfig.bucketName)) {
                throw new graphql_transformer_core_1.InvalidDirectiveError('Please configure storage in your project in order to use @predictions directive');
            }
            // make changes to the schema to create the input/output types
            // generate action datasources and add functions
            _this.createResources(ctx, definition, actions, _this.predictionsConfig.bucketName);
        };
        _this.resources = new resources_1.ResourceFactory();
        _this.predictionsConfig = predictionsConfig;
        return _this;
    }
    PredictionsTransformer.prototype.validateActions = function (actions) {
        // validate actions
        var supportedPredictions = predictions_utils_1.allowedActions;
        var allowed = [];
        actions.forEach(function (action) {
            if (supportedPredictions[action] && (allowed.includes(action) || allowed.length === 0)) {
                allowed.concat(supportedPredictions[action].next);
            }
            else {
                throw new graphql_transformer_core_1.InvalidDirectiveError(action + " is not supported!");
            }
        });
    };
    PredictionsTransformer.prototype.createResources = function (ctx, def, actions, storage) {
        var _this = this;
        var fieldName = def.name.value;
        var predictionFunctions = [];
        var actionInputObjectFields = [];
        var isList = false;
        var actionPolicyMap = {};
        if (ctx.metadata.has(graphql_transformer_common_1.PredictionsResourceIDs.actionMapID)) {
            actionPolicyMap = ctx.metadata.get(graphql_transformer_common_1.PredictionsResourceIDs.actionMapID);
        }
        actions.forEach(function (action, index) {
            // boolean to check if the action specified is the first action
            var isFirst = index === 0;
            // check if action should return a list
            isList = _this.needsList(action, isList);
            // create input object fields which will end up in the input object
            actionInputObjectFields.push(definitions_1.createInputValueAction(action, fieldName));
            // create policy for action if it doesn't exist
            actionPolicyMap = _this.resources.mergeActionRole(actionPolicyMap, action);
            // grab datasource config for the action
            var actionDSConfig = _this.resources.getPredictionsDSConfig(action);
            // add the action function into the pipeline resolver for the operation resolver
            predictionFunctions.push(cloudform_types_1.Fn.GetAtt(graphql_transformer_common_1.PredictionsResourceIDs.getPredictionFunctionName(action), 'FunctionId'));
            // if the datasource does not exist add the resource
            if (!ctx.getResource(actionDSConfig.id)) {
                ctx.setResource(actionDSConfig.id, _this.resources.createPredictionsDataSource(actionDSConfig));
                ctx.mapResourceToStack(PREDICTIONS_DIRECTIVE_STACK, actionDSConfig.id);
                if (actionDSConfig.id === 'LambdaDataSource') {
                    // merge lambda permissions
                    actionPolicyMap = _this.resources.mergeLambdaActionRole(actionPolicyMap);
                    // add lambda function in transformer context metadata
                    ctx.metadata.set(graphql_transformer_common_1.PredictionsResourceIDs.lambdaID, path.resolve(__dirname + "/../lib/predictionsLambdaFunction.zip"));
                    // TODO: If other actions should use a lambda function then the iam role should add as needed policies per action
                    ctx.setResource(graphql_transformer_common_1.PredictionsResourceIDs.lambdaIAMRole, _this.resources.createLambdaIAMRole(storage));
                    ctx.mapResourceToStack(PREDICTIONS_DIRECTIVE_STACK, graphql_transformer_common_1.PredictionsResourceIDs.lambdaIAMRole);
                    // create lambda function
                    ctx.setResource(graphql_transformer_common_1.PredictionsResourceIDs.lambdaID, _this.resources.createPredictionsLambda());
                    ctx.mapResourceToStack(PREDICTIONS_DIRECTIVE_STACK, graphql_transformer_common_1.PredictionsResourceIDs.lambdaID);
                }
            }
            // add function configuration resource if it does not exist
            if (!ctx.getResource(graphql_transformer_common_1.PredictionsResourceIDs.getPredictionFunctionName(action))) {
                ctx.setResource(graphql_transformer_common_1.PredictionsResourceIDs.getPredictionFunctionName(action), _this.resources.createActionFunction(action, actionDSConfig.id));
                ctx.mapResourceToStack(PREDICTIONS_DIRECTIVE_STACK, graphql_transformer_common_1.PredictionsResourceIDs.getPredictionFunctionName(action));
            }
            // check if the input type exists in the schema
            if (!_this.typeExist(definitions_1.getActionInputName(action, fieldName), ctx)) {
                var actionInput = definitions_1.getActionInputType(action, fieldName, isFirst);
                ctx.addInput(actionInput);
            }
        });
        // create iam policy
        var iamRole = this.resources.createIAMRole(actionPolicyMap, storage);
        ctx.setResource(graphql_transformer_common_1.PredictionsResourceIDs.iamRole, iamRole);
        ctx.mapResourceToStack(PREDICTIONS_DIRECTIVE_STACK, graphql_transformer_common_1.PredictionsResourceIDs.iamRole);
        // save map config in the context
        ctx.metadata.set(graphql_transformer_common_1.PredictionsResourceIDs.actionMapID, actionPolicyMap);
        // generate input type based on operation name
        ctx.addInput(definitions_1.makeActionInputObject(fieldName, actionInputObjectFields));
        // add arguments into operation
        var type = ctx.getType(ctx.getQueryTypeName());
        if (type) {
            var field_1 = type.fields.find(function (f) { return f.name.value === fieldName; });
            if (field_1) {
                var newFields = __spreadArrays(type.fields.filter(function (f) { return f.name.value !== field_1.name.value; }), [definitions_1.addInputArgument(field_1, fieldName, isList)]);
                var newMutation = __assign(__assign({}, type), { fields: newFields });
                ctx.putType(newMutation);
            }
        }
        // create the resolver for the operation
        var resolver = this.resources.createResolver(ctx.getQueryTypeName(), def.name.value, predictionFunctions, storage);
        var resolverId = graphql_transformer_common_1.ResolverResourceIDs.ResolverResourceID(ctx.getQueryTypeName(), def.name.value);
        ctx.setResource(resolverId, resolver);
        ctx.mapResourceToStack(PREDICTIONS_DIRECTIVE_STACK, resolverId);
    };
    PredictionsTransformer.prototype.getActions = function (directive) {
        var get = function (s) { return function (arg) { return arg.name.value === s; }; };
        var getArg = function (arg, dflt) {
            var argument = directive.arguments.find(get(arg));
            return argument ? graphql_1.valueFromASTUntyped(argument.value) : dflt;
        };
        return getArg('actions', []);
    };
    PredictionsTransformer.prototype.needsList = function (action, flag) {
        switch (action) {
            case 'identifyLabels':
                return true;
            case 'convertTextToSpeech':
                return false;
            default:
                return flag;
        }
    };
    PredictionsTransformer.prototype.typeExist = function (type, ctx) {
        return Boolean(type in ctx.nodeMap);
    };
    return PredictionsTransformer;
}(graphql_transformer_core_1.Transformer));
exports.PredictionsTransformer = PredictionsTransformer;
var templateObject_1;
//# sourceMappingURL=PredictionsTransformer.js.map