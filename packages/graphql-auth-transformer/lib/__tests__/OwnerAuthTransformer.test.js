"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const graphql_transformer_core_1 = require("graphql-transformer-core");
const graphql_transformer_common_1 = require("graphql-transformer-common");
const graphql_dynamodb_transformer_1 = require("graphql-dynamodb-transformer");
const ModelAuthTransformer_1 = require("../ModelAuthTransformer");
test('Test ModelAuthTransformer validation happy case', () => {
    const validSchema = `
    type Post @model @auth(rules: [{allow: owner}]) {
        id: ID!
        title: String!
        createdAt: String
        updatedAt: String
    }
    `;
    const transformer = new graphql_transformer_core_1.GraphQLTransform({
        transformers: [
            new graphql_dynamodb_transformer_1.DynamoDBModelTransformer(),
            new ModelAuthTransformer_1.ModelAuthTransformer({
                authConfig: {
                    defaultAuthentication: {
                        authenticationType: 'AMAZON_COGNITO_USER_POOLS',
                    },
                    additionalAuthenticationProviders: [],
                },
            }),
        ],
    });
    const out = transformer.transform(validSchema);
    expect(out).toBeDefined();
    expect(out.rootStack.Resources[graphql_transformer_common_1.ResourceConstants.RESOURCES.GraphQLAPILogicalID].Properties.AuthenticationType).toEqual('AMAZON_COGNITO_USER_POOLS');
});
test('Test OwnerField with Subscriptions', () => {
    const validSchema = `
        type Post @model
            @auth(rules: [
                {allow: owner, ownerField: "postOwner"}
            ])
        {
            id: ID!
            title: String
            postOwner: String
        }`;
    const transformer = new graphql_transformer_core_1.GraphQLTransform({
        transformers: [
            new graphql_dynamodb_transformer_1.DynamoDBModelTransformer(),
            new ModelAuthTransformer_1.ModelAuthTransformer({
                authConfig: {
                    defaultAuthentication: {
                        authenticationType: 'AMAZON_COGNITO_USER_POOLS',
                    },
                    additionalAuthenticationProviders: [],
                },
            }),
        ],
    });
    const out = transformer.transform(validSchema);
    expect(out).toBeDefined();
    // expect 'postOwner' as an argument for subscription operations
    expect(out.schema).toContain('onCreatePost(postOwner: String!)');
    expect(out.schema).toContain('onUpdatePost(postOwner: String!)');
    expect(out.schema).toContain('onDeletePost(postOwner: String!)');
    // expect logic in the resolvers to check for postOwner args as an allowerOwner
    expect(out.resolvers['Subscription.onCreatePost.res.vtl']).toContain('#set( $allowedOwners0 = $util.defaultIfNull($ctx.args.postOwner, null) )');
    expect(out.resolvers['Subscription.onUpdatePost.res.vtl']).toContain('#set( $allowedOwners0 = $util.defaultIfNull($ctx.args.postOwner, null) )');
    expect(out.resolvers['Subscription.onDeletePost.res.vtl']).toContain('#set( $allowedOwners0 = $util.defaultIfNull($ctx.args.postOwner, null) )');
});
//# sourceMappingURL=OwnerAuthTransformer.test.js.map