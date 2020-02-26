"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const graphql_transformer_core_1 = require("graphql-transformer-core");
const graphql_dynamodb_transformer_1 = require("graphql-dynamodb-transformer");
const ModelAuthTransformer_1 = require("../ModelAuthTransformer");
const graphql_transformer_common_1 = require("graphql-transformer-common");
const graphql_connection_transformer_1 = require("graphql-connection-transformer");
test('@auth using source and sourceTypes', () => {
    const validSchema = `
    type User @model @auth(rules: [{allow: source, sourceTypes: ["Post"], operations: [read]}]) {
      name: String
        posts: [Post]
          @connection(name: "PostUser", keyField: "owner")
    }

    type Post @model {
        id: ID!
        title: String!
        createdAt: String
        updatedAt: String
        user: User
          @connection(name: "PostUser", keyField: "owner")
    }
    `;
    const transformer = new graphql_transformer_core_1.GraphQLTransform({
        transformers: [
            new graphql_dynamodb_transformer_1.DynamoDBModelTransformer(),
            new graphql_connection_transformer_1.ModelConnectionTransformer(),
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
    expect(out.resolvers['Post.user.res.vtl']).toMatchSnapshot();
    expect(out.resolvers['Post.user.res.vtl']).toContain('Authorization rule:');
});
//# sourceMappingURL=SourceAuthTransformer.test.js.map