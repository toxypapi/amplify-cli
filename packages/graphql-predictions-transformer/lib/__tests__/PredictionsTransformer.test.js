"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var graphql_transformer_core_1 = require("graphql-transformer-core");
var PredictionsTransformer_1 = require("../PredictionsTransformer");
// tslint:disable: no-magic-numbers
test('lambda function is added to pipeline when lambda dependent action is added', function () {
    var validSchema = "\n    type Query {\n      speakTranslatedText: String @predictions(actions: [ translateText convertTextToSpeech ])\n    }\n  ";
    var transformer = new graphql_transformer_core_1.GraphQLTransform({
        transformers: [new PredictionsTransformer_1.PredictionsTransformer({ bucketName: "myStorage${hash}-${env}" })]
    });
    var out = transformer.transform(validSchema);
    expect(out).toBeDefined();
    /**
     * AppSync DataSources x2
     *  - Translate
     *  - Lambda
     * AppSync Functions x2
     *  - translateTextFunction
     *  - convertTextToSpeechFunction
     * AppSync Query Resolver x1
     *  - QueryspeakTranslatedTextResolver
     * IAM Roles x2
     *  - predictions IAM Role
     *  - lambda IAM Role
     * Lambda Function x1
     *  - predictionsLambda
     *
     * Total : 8
     */
    expect(Object.keys(out.stacks.PredictionsDirectiveStack.Resources).length).toEqual(8);
    // Schema Validation
    expect(out.schema).toMatchSnapshot();
    // Expect Schema for Query operation to return a string
    expect(out.schema).toContain('speakTranslatedText(input: SpeakTranslatedTextInput!): String');
    // IAM role
    var iamRoleResource = out.stacks.PredictionsDirectiveStack.Resources.predictionsIAMRole;
    expect(iamRoleResource).toBeDefined();
    expect(iamRoleResource.Properties.AssumeRolePolicyDocument.Statement[0].Principal.Service).toEqual('appsync.amazonaws.com');
    expect(iamRoleResource.Properties.AssumeRolePolicyDocument.Statement[0].Action).toEqual('sts:AssumeRole');
    iamRoleResource.Properties.Policies.forEach(function (policy) {
        expect(['translate:TranslateText', 'lambda:InvokeFunction', 's3:GetObject']).toContain(policy.PolicyDocument.Statement[0].Action[0]);
    });
    // Resolver
    var resolverResource = out.stacks.PredictionsDirectiveStack.Resources.QueryspeakTranslatedTextResolver;
    expect(resolverResource).toBeDefined();
    expect(resolverResource.Properties.FieldName).toEqual('speakTranslatedText');
    expect(resolverResource.Properties.TypeName).toEqual('Query');
    expect(resolverResource.Properties.Kind).toEqual('PIPELINE');
    expect(resolverResource.Properties.PipelineConfig.Functions.length).toEqual(2);
});
test('return type is a list based on the action', function () {
    var validSchema = "\n    type Query {\n      translateLabels: String @predictions(actions: [ identifyLabels translateText ])\n    }\n  ";
    var transformer = new graphql_transformer_core_1.GraphQLTransform({
        transformers: [new PredictionsTransformer_1.PredictionsTransformer({ bucketName: "myStorage${hash}-${env}" })]
    });
    var out = transformer.transform(validSchema);
    expect(out).toBeDefined();
    // match schema snapshot
    expect(out.schema).toMatchSnapshot();
    expect(Object.keys(out.stacks.PredictionsDirectiveStack.Resources).length).toEqual(6);
    // Expect Schema for Query operation to return a string
    expect(out.schema).toContain('translateLabels(input: TranslateLabelsInput!): [String]');
    // IAM role
    var iamRoleResource = out.stacks.PredictionsDirectiveStack.Resources.predictionsIAMRole;
    expect(iamRoleResource).toBeDefined();
    expect(iamRoleResource.Properties.AssumeRolePolicyDocument.Statement[0].Principal.Service).toEqual('appsync.amazonaws.com');
    expect(iamRoleResource.Properties.AssumeRolePolicyDocument.Statement[0].Action).toEqual('sts:AssumeRole');
    iamRoleResource.Properties.Policies.forEach(function (policy) {
        expect(['translate:TranslateText', 'rekognition:DetectLabels', 's3:GetObject']).toContain(policy.PolicyDocument.Statement[0].Action[0]);
    });
});
//# sourceMappingURL=PredictionsTransformer.test.js.map