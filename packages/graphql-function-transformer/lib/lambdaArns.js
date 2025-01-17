"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var cloudform_types_1 = require("cloudform-types");
var graphql_transformer_common_1 = require("graphql-transformer-common");
function lambdaArnResource(name, region) {
    var substitutions = {};
    if (referencesEnv(name)) {
        substitutions['env'] = cloudform_types_1.Fn.Ref(graphql_transformer_common_1.ResourceConstants.PARAMETERS.Env);
    }
    return cloudform_types_1.Fn.If(graphql_transformer_common_1.ResourceConstants.CONDITIONS.HasEnvironmentParameter, cloudform_types_1.Fn.Sub(lambdaArnKey(name, region), substitutions), cloudform_types_1.Fn.Sub(lambdaArnKey(removeEnvReference(name), region), {}));
}
exports.lambdaArnResource = lambdaArnResource;
function lambdaArnKey(name, region) {
    return region
        ? "arn:aws:lambda:" + region + ":${AWS::AccountId}:function:" + name
        : "arn:aws:lambda:${AWS::Region}:${AWS::AccountId}:function:" + name;
}
exports.lambdaArnKey = lambdaArnKey;
function referencesEnv(value) {
    return value.match(/(\${env})/) !== null;
}
function removeEnvReference(value) {
    return value.replace(/(-\${env})/, '');
}
//# sourceMappingURL=lambdaArns.js.map