"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var graphql_transformer_core_1 = require("graphql-transformer-core");
var graphql_key_transformer_1 = require("graphql-key-transformer");
var graphql_dynamodb_transformer_1 = require("graphql-dynamodb-transformer");
var parser_1 = require("graphql/language/parser");
var graphql_1 = require("graphql");
var graphql_versioned_transformer_1 = require("graphql-versioned-transformer");
var graphql_connection_transformer_1 = require("graphql-connection-transformer");
var graphql_auth_transformer_1 = require("graphql-auth-transformer");
var aws_appsync_1 = require("aws-appsync");
var graphql_tag_1 = require("graphql-tag");
var graphql_transformer_common_1 = require("graphql-transformer-common");
var CloudFormationClient_1 = require("../CloudFormationClient");
var CognitoClient = require("aws-sdk/clients/cognitoidentityserviceprovider");
var S3 = require("aws-sdk/clients/s3");
var S3Client_1 = require("../S3Client");
var deployNestedStacks_1 = require("../deployNestedStacks");
var moment = require("moment");
var emptyBucket_1 = require("../emptyBucket");
var cognitoUtils_1 = require("../cognitoUtils");
var role_1 = require("cloudform-types/types/iam/role");
var userPoolClient_1 = require("cloudform-types/types/cognito/userPoolClient");
var identityPool_1 = require("cloudform-types/types/cognito/identityPool");
var identityPoolRoleAttachment_1 = require("cloudform-types/types/cognito/identityPoolRoleAttachment");
var AWS = require("aws-sdk");
require("isomorphic-fetch");
jest.setTimeout(2000000);
var transformAndParseSchema = function (schema, version) {
    if (version === void 0) { version = graphql_transformer_core_1.TRANSFORM_CURRENT_VERSION; }
    var transformer = new graphql_transformer_core_1.GraphQLTransform({
        transformers: [
            new graphql_dynamodb_transformer_1.DynamoDBModelTransformer(),
            new graphql_versioned_transformer_1.VersionedModelTransformer(),
            new graphql_key_transformer_1.KeyTransformer(),
            new graphql_connection_transformer_1.ModelConnectionTransformer(),
            new graphql_auth_transformer_1.ModelAuthTransformer({
                authConfig: {
                    defaultAuthentication: {
                        authenticationType: 'AMAZON_COGNITO_USER_POOLS',
                    },
                    additionalAuthenticationProviders: [],
                },
            }),
        ],
        transformConfig: {
            Version: version,
        },
    });
    var out = transformer.transform(schema);
    return parser_1.parse(out.schema);
};
var getInputType = function (doc, typeName) {
    var type = doc.definitions.find(function (def) { return def.kind === graphql_1.Kind.INPUT_OBJECT_TYPE_DEFINITION && def.name.value === typeName; });
    expect(type).toBeDefined();
    return type;
};
var expectInputTypeDefined = function (doc, typeName) {
    var type = doc.definitions.find(function (def) { return def.kind === graphql_1.Kind.INPUT_OBJECT_TYPE_DEFINITION && def.name.value === typeName; });
    expect(type).toBeDefined();
};
var expectInputTypeUndefined = function (doc, typeName) {
    var type = doc.definitions.find(function (def) { return def.kind === graphql_1.Kind.INPUT_OBJECT_TYPE_DEFINITION && def.name.value === typeName; });
    expect(type).toBeUndefined();
};
var expectEnumTypeDefined = function (doc, typeName) {
    var type = doc.definitions.find(function (def) { return def.kind === graphql_1.Kind.ENUM_TYPE_DEFINITION && def.name.value === typeName; });
    expect(type).toBeDefined();
};
var expectEnumTypeUndefined = function (doc, typeName) {
    var type = doc.definitions.find(function (def) { return def.kind === graphql_1.Kind.ENUM_TYPE_DEFINITION && def.name.value === typeName; });
    expect(type).toBeUndefined();
};
var expectFieldsOnInputType = function (type, fields) {
    expect(type.fields.length).toEqual(fields.length);
    var _loop_1 = function (fieldName) {
        var foundField = type.fields.find(function (f) { return f.name.value === fieldName; });
        expect(foundField).toBeDefined();
    };
    for (var _i = 0, fields_1 = fields; _i < fields_1.length; _i++) {
        var fieldName = fields_1[_i];
        _loop_1(fieldName);
    }
};
var doNotExpectFieldsOnInputType = function (type, fields) {
    var _loop_2 = function (fieldName) {
        var foundField = type.fields.find(function (f) { return f.name.value === fieldName; });
        expect(foundField).toBeUndefined();
    };
    for (var _i = 0, fields_2 = fields; _i < fields_2.length; _i++) {
        var fieldName = fields_2[_i];
        _loop_2(fieldName);
    }
};
describe("Local Mutation Condition tests", function () {
    it('Type without directives', function () {
        var validSchema = "\n            type Post\n            @model\n            {\n                id: ID!\n                content: String\n                type: String!\n                category: String\n                author: String\n                editors: [String!]\n                owner: String\n                groups: [String!]\n                slug: String!\n                likeCount: Int\n                rating: Int\n            }\n        ";
        var schema = transformAndParseSchema(validSchema);
        var type = getInputType(schema, 'ModelPostConditionInput');
        expectFieldsOnInputType(type, [
            'content',
            'type',
            'category',
            'author',
            'editors',
            'owner',
            'groups',
            'slug',
            'likeCount',
            'rating',
            'and',
            'or',
            'not',
        ]);
        doNotExpectFieldsOnInputType(type, ['id']);
    });
    it('Type with primary @key - single field - directive', function () {
        var validSchema = "\n            type Post\n            @model\n            @key(fields: [\"id\"])\n            {\n                id: ID!\n                content: String\n                type: String!\n                category: String\n                author: String\n                editors: [String!]\n                owner: String\n                groups: [String!]\n                slug: String!\n                likeCount: Int\n                rating: Int\n            }\n        ";
        var schema = transformAndParseSchema(validSchema);
        var type = getInputType(schema, 'ModelPostConditionInput');
        expectFieldsOnInputType(type, [
            'content',
            'type',
            'category',
            'author',
            'editors',
            'owner',
            'groups',
            'slug',
            'likeCount',
            'rating',
            'and',
            'or',
            'not',
        ]);
        doNotExpectFieldsOnInputType(type, ['id']);
    });
    it('Type with primary @key - multiple field - directive', function () {
        var validSchema = "\n            type Post\n            @model\n            @key(fields: [\"id\", \"type\", \"slug\"])\n            {\n                id: ID!\n                content: String\n                type: String!\n                category: String\n                author: String\n                editors: [String!]\n                owner: String\n                groups: [String!]\n                slug: String!\n                likeCount: Int\n                rating: Int\n            }\n        ";
        var schema = transformAndParseSchema(validSchema);
        var type = getInputType(schema, 'ModelPostConditionInput');
        expectFieldsOnInputType(type, [
            'content',
            'category',
            'author',
            'editors',
            'owner',
            'groups',
            'likeCount',
            'rating',
            'and',
            'or',
            'not',
        ]);
        doNotExpectFieldsOnInputType(type, ['id', 'type', 'slug']);
    });
    it('Type with @auth directive - owner', function () {
        var validSchema = "\n            type Post\n            @model\n            @auth(rules: [\n                {\n                    allow: owner\n                }\n            ])\n            {\n                id: ID!\n                content: String\n                type: String!\n                category: String\n                author: String\n                editors: [String!]\n                owner: String\n                groups: [String!]\n                slug: String!\n                likeCount: Int\n                rating: Int\n            }\n        ";
        var schema = transformAndParseSchema(validSchema);
        var type = getInputType(schema, 'ModelPostConditionInput');
        expectFieldsOnInputType(type, [
            'content',
            'type',
            'category',
            'author',
            'editors',
            'groups',
            'slug',
            'likeCount',
            'rating',
            'and',
            'or',
            'not',
        ]);
        doNotExpectFieldsOnInputType(type, ['id', 'owner']);
    });
    it('Type with @auth directive - owner custom field name', function () {
        var validSchema = "\n            type Post\n            @model\n            @auth(rules: [\n                {\n                    allow: owner\n                    ownerField: \"author\"\n                }\n            ])\n            {\n                id: ID!\n                content: String\n                type: String!\n                category: String\n                author: String\n                editors: [String!]\n                owner: String\n                groups: [String!]\n                slug: String!\n                likeCount: Int\n                rating: Int\n            }\n        ";
        var schema = transformAndParseSchema(validSchema);
        var type = getInputType(schema, 'ModelPostConditionInput');
        expectFieldsOnInputType(type, [
            'content',
            'type',
            'category',
            'editors',
            'owner',
            'groups',
            'slug',
            'likeCount',
            'rating',
            'and',
            'or',
            'not',
        ]);
        doNotExpectFieldsOnInputType(type, ['id', 'author']);
    });
    it('Type with @auth directive - groups', function () {
        var validSchema = "\n            type Post\n            @model\n            @auth(rules: [\n                {\n                    allow: groups\n                }\n            ])\n            {\n                id: ID!\n                content: String\n                type: String!\n                category: String\n                author: String\n                editors: [String!]\n                owner: String\n                groups: [String!]\n                slug: String!\n                likeCount: Int\n                rating: Int\n            }\n        ";
        var schema = transformAndParseSchema(validSchema);
        var type = getInputType(schema, 'ModelPostConditionInput');
        expectFieldsOnInputType(type, [
            'content',
            'type',
            'category',
            'author',
            'editors',
            'owner',
            'slug',
            'likeCount',
            'rating',
            'and',
            'or',
            'not',
        ]);
        doNotExpectFieldsOnInputType(type, ['id', 'groups']);
    });
    it('Type with @auth directive - groups custom field name', function () {
        var validSchema = "\n            type Post\n            @model\n            @auth(rules: [\n                {\n                    allow: groups\n                    groupsField: \"editors\"\n                }\n            ])\n            {\n                id: ID!\n                content: String\n                type: String!\n                category: String\n                author: String\n                editors: [String!]\n                owner: String\n                groups: [String!]\n                slug: String!\n                likeCount: Int\n                rating: Int\n            }\n        ";
        var schema = transformAndParseSchema(validSchema);
        var type = getInputType(schema, 'ModelPostConditionInput');
        expectFieldsOnInputType(type, [
            'content',
            'type',
            'category',
            'author',
            'owner',
            'groups',
            'slug',
            'likeCount',
            'rating',
            'and',
            'or',
            'not',
        ]);
        doNotExpectFieldsOnInputType(type, ['id', 'editors']);
    });
    it('Type with @auth directive - multiple rules', function () {
        var validSchema = "\n            type Post\n            @model\n            @auth(rules: [\n            {\n                allow: owner\n            }\n            {\n                allow: groups\n            }\n            {\n                allow: owner\n                ownerField: \"author\"\n            }\n            {\n                allow: groups\n                groupsField: \"editors\"\n            }\n            ])\n            {\n                id: ID!\n                content: String\n                type: String!\n                category: String\n                author: String\n                editors: [String!]\n                owner: String\n                groups: [String!]\n                slug: String!\n                likeCount: Int\n                rating: Int\n            }\n        ";
        var schema = transformAndParseSchema(validSchema);
        var type = getInputType(schema, 'ModelPostConditionInput');
        expectFieldsOnInputType(type, ['content', 'type', 'category', 'slug', 'likeCount', 'rating', 'and', 'or', 'not']);
        doNotExpectFieldsOnInputType(type, ['id', 'author', 'editors', 'owner', 'groups']);
    });
    it('Type with @versioned directive - no changes on condition', function () {
        var validSchema = "\n            type Post\n            @model\n            @versioned\n            # @versioned(versionField: \"vv\", versionInput: \"ww\")\n            {\n                id: ID!\n                content: String\n                type: String!\n                category: String\n                author: String\n                editors: [String!]\n                owner: String\n                groups: [String!]\n                slug: String!\n                likeCount: Int\n                rating: Int\n            }\n        ";
        var schema = transformAndParseSchema(validSchema);
        var type = getInputType(schema, 'ModelPostConditionInput');
        expectFieldsOnInputType(type, [
            'content',
            'type',
            'category',
            'author',
            'editors',
            'owner',
            'groups',
            'slug',
            'likeCount',
            'rating',
            'and',
            'or',
            'not',
        ]);
        doNotExpectFieldsOnInputType(type, ['id']);
    });
    it('Type with @versioned directive - custom field, no changes on condition', function () {
        var validSchema = "\n            type Post\n            @model\n            @versioned(versionField: \"version\", versionInput: \"requiredVersion\")\n            {\n                id: ID!\n                content: String\n                type: String!\n                category: String\n                author: String\n                editors: [String!]\n                owner: String\n                groups: [String!]\n                slug: String!\n                likeCount: Int\n                rating: Int\n            }\n        ";
        var schema = transformAndParseSchema(validSchema);
        var type = getInputType(schema, 'ModelPostConditionInput');
        expectFieldsOnInputType(type, [
            'content',
            'type',
            'category',
            'author',
            'editors',
            'owner',
            'groups',
            'slug',
            'likeCount',
            'rating',
            'and',
            'or',
            'not',
        ]);
        doNotExpectFieldsOnInputType(type, ['id']);
    });
});
// to deal with bug in cognito-identity-js
global.fetch = require('node-fetch');
// To overcome of the way of how AmplifyJS picks up currentUserCredentials
var anyAWS = AWS;
if (anyAWS && anyAWS.config && anyAWS.config.credentials) {
    delete anyAWS.config.credentials;
}
describe("Deployed Mutation Condition tests", function () {
    var REGION = 'us-west-2';
    var cf = new CloudFormationClient_1.CloudFormationClient(REGION);
    var BUILD_TIMESTAMP = moment().format('YYYYMMDDHHmmss');
    var STACK_NAME = "MutationConditionTest-" + BUILD_TIMESTAMP;
    var BUCKET_NAME = "appsync-mutation-condition-test-bucket-" + BUILD_TIMESTAMP;
    var LOCAL_FS_BUILD_DIR = '/tmp/mutation_condition_tests/';
    var S3_ROOT_DIR_KEY = 'deployments';
    var AUTH_ROLE_NAME = STACK_NAME + "-authRole";
    var UNAUTH_ROLE_NAME = STACK_NAME + "-unauthRole";
    var IDENTITY_POOL_NAME = "MutationConditionTest_" + BUILD_TIMESTAMP + "_identity_pool";
    var USER_POOL_CLIENTWEB_NAME = "mutationcondition_" + BUILD_TIMESTAMP + "_clientweb";
    var USER_POOL_CLIENT_NAME = "mutationcondition_" + BUILD_TIMESTAMP + "_client";
    var GRAPHQL_ENDPOINT = undefined;
    var APIKEY_CLIENT = undefined;
    var USER_POOL_AUTH_CLIENT_1 = undefined;
    var USER_POOL_AUTH_CLIENT_2 = undefined;
    var USER_POOL_ID = undefined;
    var USERNAME1 = 'user1@test.com';
    var USERNAME2 = 'user2@test.com';
    var TMP_PASSWORD = 'Password123!';
    var REAL_PASSWORD = 'Password1234!';
    var cognitoClient = new CognitoClient({ apiVersion: '2016-04-19', region: REGION });
    var customS3Client = new S3Client_1.S3Client(REGION);
    var awsS3Client = new S3({ region: REGION });
    var conditionRegexMatch = /GraphQL error: The conditional request failed \(Service: AmazonDynamoDBv2; Status Code: 400; Error Code: ConditionalCheckFailedException; .*/gm;
    function outputValueSelector(key) {
        return function (outputs) {
            var output = outputs.find(function (o) { return o.OutputKey === key; });
            return output ? output.OutputValue : null;
        };
    }
    beforeAll(function () { return __awaiter(void 0, void 0, void 0, function () {
        var validSchema, transformer, e_1, userPoolResponse, userPoolClientResponse, userPoolClientId, out, authRole, unauthRole, identityPool, identityPoolRoleMap, userPoolClientWeb, userPoolClient, maxPolicyCount, i, paddedIndex, authResourceName, unauthResourceName, _i, _a, key, _b, _c, stackKey, stack, _d, _e, key, params, finishedStack, getApiEndpoint, getApiKey, apiKey, getIdentityPoolId, identityPoolId, authRes1, idToken1_1, authRes2, idToken2_1, e_2;
        return __generator(this, function (_f) {
            switch (_f.label) {
                case 0:
                    validSchema = "\n    type Post\n    @model\n    @versioned\n    @auth(rules: [\n      { allow: owner }\n      { allow: public }\n    ])\n    @key(fields: [\"id\", \"type\"])\n    {\n        id: ID!\n        type: String!\n        owner: String\n        category: String\n        content: String\n        slug: String\n        rating: Int\n    }\n";
                    transformer = new graphql_transformer_core_1.GraphQLTransform({
                        transformers: [
                            new graphql_dynamodb_transformer_1.DynamoDBModelTransformer(),
                            new graphql_versioned_transformer_1.VersionedModelTransformer(),
                            new graphql_connection_transformer_1.ModelConnectionTransformer(),
                            new graphql_key_transformer_1.KeyTransformer(),
                            new graphql_auth_transformer_1.ModelAuthTransformer({
                                authConfig: {
                                    defaultAuthentication: {
                                        authenticationType: 'AMAZON_COGNITO_USER_POOLS',
                                    },
                                    additionalAuthenticationProviders: [
                                        {
                                            authenticationType: 'API_KEY',
                                            apiKeyConfig: {
                                                description: 'E2E Test API Key',
                                                apiKeyExpirationDays: 300,
                                            },
                                        },
                                    ],
                                },
                            }),
                        ],
                        transformConfig: {
                            Version: graphql_transformer_core_1.TRANSFORM_CURRENT_VERSION,
                        },
                    });
                    _f.label = 1;
                case 1:
                    _f.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, awsS3Client.createBucket({ Bucket: BUCKET_NAME }).promise()];
                case 2:
                    _f.sent();
                    return [3 /*break*/, 4];
                case 3:
                    e_1 = _f.sent();
                    console.error("Failed to create bucket: " + e_1);
                    return [3 /*break*/, 4];
                case 4: return [4 /*yield*/, cognitoUtils_1.createUserPool(cognitoClient, "UserPool" + STACK_NAME)];
                case 5:
                    userPoolResponse = _f.sent();
                    USER_POOL_ID = userPoolResponse.UserPool.Id;
                    return [4 /*yield*/, cognitoUtils_1.createUserPoolClient(cognitoClient, USER_POOL_ID, "UserPool" + STACK_NAME)];
                case 6:
                    userPoolClientResponse = _f.sent();
                    userPoolClientId = userPoolClientResponse.UserPoolClient.ClientId;
                    _f.label = 7;
                case 7:
                    _f.trys.push([7, 12, , 13]);
                    out = transformer.transform(validSchema);
                    authRole = new role_1.default({
                        RoleName: AUTH_ROLE_NAME,
                        AssumeRolePolicyDocument: {
                            Version: '2012-10-17',
                            Statement: [
                                {
                                    Sid: '',
                                    Effect: 'Allow',
                                    Principal: {
                                        Federated: 'cognito-identity.amazonaws.com',
                                    },
                                    Action: 'sts:AssumeRoleWithWebIdentity',
                                    Condition: {
                                        'ForAnyValue:StringLike': {
                                            'cognito-identity.amazonaws.com:amr': 'authenticated',
                                        },
                                    },
                                },
                            ],
                        },
                    });
                    unauthRole = new role_1.default({
                        RoleName: UNAUTH_ROLE_NAME,
                        AssumeRolePolicyDocument: {
                            Version: '2012-10-17',
                            Statement: [
                                {
                                    Sid: '',
                                    Effect: 'Allow',
                                    Principal: {
                                        Federated: 'cognito-identity.amazonaws.com',
                                    },
                                    Action: 'sts:AssumeRoleWithWebIdentity',
                                    Condition: {
                                        'ForAnyValue:StringLike': {
                                            'cognito-identity.amazonaws.com:amr': 'unauthenticated',
                                        },
                                    },
                                },
                            ],
                        },
                        Policies: [
                            new role_1.default.Policy({
                                PolicyName: 'appsync-unauthrole-policy',
                                PolicyDocument: {
                                    Version: '2012-10-17',
                                    Statement: [
                                        {
                                            Effect: 'Allow',
                                            Action: ['appsync:GraphQL'],
                                            Resource: [
                                                {
                                                    'Fn::Join': [
                                                        '',
                                                        [
                                                            'arn:aws:appsync:',
                                                            { Ref: 'AWS::Region' },
                                                            ':',
                                                            { Ref: 'AWS::AccountId' },
                                                            ':apis/',
                                                            {
                                                                'Fn::GetAtt': ['GraphQLAPI', 'ApiId'],
                                                            },
                                                            '/*',
                                                        ],
                                                    ],
                                                },
                                            ],
                                        },
                                    ],
                                },
                            }),
                        ],
                    });
                    identityPool = new identityPool_1.default({
                        IdentityPoolName: IDENTITY_POOL_NAME,
                        CognitoIdentityProviders: [
                            {
                                ClientId: {
                                    Ref: 'UserPoolClient',
                                },
                                ProviderName: {
                                    'Fn::Sub': [
                                        'cognito-idp.${region}.amazonaws.com/${client}',
                                        {
                                            region: {
                                                Ref: 'AWS::Region',
                                            },
                                            client: USER_POOL_ID,
                                        },
                                    ],
                                },
                            },
                            {
                                ClientId: {
                                    Ref: 'UserPoolClientWeb',
                                },
                                ProviderName: {
                                    'Fn::Sub': [
                                        'cognito-idp.${region}.amazonaws.com/${client}',
                                        {
                                            region: {
                                                Ref: 'AWS::Region',
                                            },
                                            client: USER_POOL_ID,
                                        },
                                    ],
                                },
                            },
                        ],
                        AllowUnauthenticatedIdentities: true,
                    });
                    identityPoolRoleMap = new identityPoolRoleAttachment_1.default({
                        IdentityPoolId: { Ref: 'IdentityPool' },
                        Roles: {
                            unauthenticated: { 'Fn::GetAtt': ['UnauthRole', 'Arn'] },
                            authenticated: { 'Fn::GetAtt': ['AuthRole', 'Arn'] },
                        },
                    });
                    userPoolClientWeb = new userPoolClient_1.default({
                        ClientName: USER_POOL_CLIENTWEB_NAME,
                        RefreshTokenValidity: 30,
                        UserPoolId: USER_POOL_ID,
                    });
                    userPoolClient = new userPoolClient_1.default({
                        ClientName: USER_POOL_CLIENT_NAME,
                        GenerateSecret: true,
                        RefreshTokenValidity: 30,
                        UserPoolId: USER_POOL_ID,
                    });
                    out.rootStack.Resources.IdentityPool = identityPool;
                    out.rootStack.Resources.IdentityPoolRoleMap = identityPoolRoleMap;
                    out.rootStack.Resources.UserPoolClientWeb = userPoolClientWeb;
                    out.rootStack.Resources.UserPoolClient = userPoolClient;
                    out.rootStack.Outputs.IdentityPoolId = { Value: { Ref: 'IdentityPool' } };
                    out.rootStack.Outputs.IdentityPoolName = { Value: { 'Fn::GetAtt': ['IdentityPool', 'Name'] } };
                    out.rootStack.Resources.AuthRole = authRole;
                    out.rootStack.Outputs.AuthRoleArn = { Value: { 'Fn::GetAtt': ['AuthRole', 'Arn'] } };
                    out.rootStack.Resources.UnauthRole = unauthRole;
                    out.rootStack.Outputs.UnauthRoleArn = { Value: { 'Fn::GetAtt': ['UnauthRole', 'Arn'] } };
                    maxPolicyCount = 10;
                    for (i = 0; i < maxPolicyCount; i++) {
                        paddedIndex = ("" + (i + 1)).padStart(2, '0');
                        authResourceName = "" + graphql_transformer_common_1.ResourceConstants.RESOURCES.AuthRolePolicy + paddedIndex;
                        unauthResourceName = "" + graphql_transformer_common_1.ResourceConstants.RESOURCES.UnauthRolePolicy + paddedIndex;
                        if (out.rootStack.Resources[authResourceName]) {
                            delete out.rootStack.Resources[authResourceName];
                        }
                        if (out.rootStack.Resources[unauthResourceName]) {
                            delete out.rootStack.Resources[unauthResourceName];
                        }
                    }
                    delete out.rootStack.Parameters.authRoleName;
                    delete out.rootStack.Parameters.unauthRoleName;
                    for (_i = 0, _a = Object.keys(out.rootStack.Resources); _i < _a.length; _i++) {
                        key = _a[_i];
                        if (out.rootStack.Resources[key].Properties &&
                            out.rootStack.Resources[key].Properties.Parameters &&
                            out.rootStack.Resources[key].Properties.Parameters.unauthRoleName) {
                            delete out.rootStack.Resources[key].Properties.Parameters.unauthRoleName;
                        }
                        if (out.rootStack.Resources[key].Properties &&
                            out.rootStack.Resources[key].Properties.Parameters &&
                            out.rootStack.Resources[key].Properties.Parameters.authRoleName) {
                            delete out.rootStack.Resources[key].Properties.Parameters.authRoleName;
                        }
                    }
                    for (_b = 0, _c = Object.keys(out.stacks); _b < _c.length; _b++) {
                        stackKey = _c[_b];
                        stack = out.stacks[stackKey];
                        for (_d = 0, _e = Object.keys(stack.Resources); _d < _e.length; _d++) {
                            key = _e[_d];
                            if (stack.Parameters && stack.Parameters.unauthRoleName) {
                                delete stack.Parameters.unauthRoleName;
                            }
                            if (stack.Parameters && stack.Parameters.authRoleName) {
                                delete stack.Parameters.authRoleName;
                            }
                            if (stack.Resources[key].Properties &&
                                stack.Resources[key].Properties.Parameters &&
                                stack.Resources[key].Properties.Parameters.unauthRoleName) {
                                delete stack.Resources[key].Properties.Parameters.unauthRoleName;
                            }
                            if (stack.Resources[key].Properties &&
                                stack.Resources[key].Properties.Parameters &&
                                stack.Resources[key].Properties.Parameters.authRoleName) {
                                delete stack.Resources[key].Properties.Parameters.authRoleName;
                            }
                        }
                    }
                    params = {
                        CreateAPIKey: '1',
                        AuthCognitoUserPoolId: USER_POOL_ID,
                    };
                    return [4 /*yield*/, deployNestedStacks_1.deploy(customS3Client, cf, STACK_NAME, out, params, LOCAL_FS_BUILD_DIR, BUCKET_NAME, S3_ROOT_DIR_KEY, BUILD_TIMESTAMP)];
                case 8:
                    finishedStack = _f.sent();
                    expect(finishedStack).toBeDefined();
                    getApiEndpoint = outputValueSelector(graphql_transformer_common_1.ResourceConstants.OUTPUTS.GraphQLAPIEndpointOutput);
                    getApiKey = outputValueSelector(graphql_transformer_common_1.ResourceConstants.OUTPUTS.GraphQLAPIApiKeyOutput);
                    GRAPHQL_ENDPOINT = getApiEndpoint(finishedStack.Outputs);
                    console.log("Using graphql url: " + GRAPHQL_ENDPOINT);
                    apiKey = getApiKey(finishedStack.Outputs);
                    console.log("API KEY: " + apiKey);
                    expect(apiKey).toBeTruthy();
                    getIdentityPoolId = outputValueSelector('IdentityPoolId');
                    identityPoolId = getIdentityPoolId(finishedStack.Outputs);
                    expect(identityPoolId).toBeTruthy();
                    console.log("Identity Pool Id: " + identityPoolId);
                    console.log("User pool Id: " + USER_POOL_ID);
                    console.log("User pool ClientId: " + userPoolClientId);
                    // Verify we have all the details
                    expect(GRAPHQL_ENDPOINT).toBeTruthy();
                    expect(USER_POOL_ID).toBeTruthy();
                    expect(userPoolClientId).toBeTruthy();
                    // Configure Amplify, create users, and sign in.
                    cognitoUtils_1.configureAmplify(USER_POOL_ID, userPoolClientId, identityPoolId);
                    return [4 /*yield*/, cognitoUtils_1.signupAndAuthenticateUser(USER_POOL_ID, USERNAME1, TMP_PASSWORD, REAL_PASSWORD)];
                case 9:
                    authRes1 = _f.sent();
                    idToken1_1 = authRes1.getIdToken().getJwtToken();
                    return [4 /*yield*/, cognitoUtils_1.signupAndAuthenticateUser(USER_POOL_ID, USERNAME2, TMP_PASSWORD, REAL_PASSWORD)];
                case 10:
                    authRes2 = _f.sent();
                    idToken2_1 = authRes2.getIdToken().getJwtToken();
                    USER_POOL_AUTH_CLIENT_1 = new aws_appsync_1.default({
                        url: GRAPHQL_ENDPOINT,
                        region: REGION,
                        auth: {
                            type: aws_appsync_1.AUTH_TYPE.AMAZON_COGNITO_USER_POOLS,
                            jwtToken: function () { return idToken1_1; },
                        },
                        offlineConfig: {
                            keyPrefix: 'userPools',
                        },
                        disableOffline: true,
                    });
                    USER_POOL_AUTH_CLIENT_2 = new aws_appsync_1.default({
                        url: GRAPHQL_ENDPOINT,
                        region: REGION,
                        auth: {
                            type: aws_appsync_1.AUTH_TYPE.AMAZON_COGNITO_USER_POOLS,
                            jwtToken: function () { return idToken2_1; },
                        },
                        offlineConfig: {
                            keyPrefix: 'userPools',
                        },
                        disableOffline: true,
                    });
                    APIKEY_CLIENT = new aws_appsync_1.default({
                        url: GRAPHQL_ENDPOINT,
                        region: REGION,
                        auth: {
                            type: aws_appsync_1.AUTH_TYPE.API_KEY,
                            apiKey: apiKey,
                        },
                        offlineConfig: {
                            keyPrefix: 'apikey',
                        },
                        disableOffline: true,
                    });
                    // Wait for any propagation to avoid random
                    // "The security token included in the request is invalid" errors
                    return [4 /*yield*/, new Promise(function (res) { return setTimeout(function () { return res(); }, 5000); })];
                case 11:
                    // Wait for any propagation to avoid random
                    // "The security token included in the request is invalid" errors
                    _f.sent();
                    return [3 /*break*/, 13];
                case 12:
                    e_2 = _f.sent();
                    console.error(e_2);
                    expect(true).toEqual(false);
                    return [3 /*break*/, 13];
                case 13: return [2 /*return*/];
            }
        });
    }); });
    afterAll(function () { return __awaiter(void 0, void 0, void 0, function () {
        var e_3, e_4;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 4, , 5]);
                    console.log('Deleting stack ' + STACK_NAME);
                    return [4 /*yield*/, cf.deleteStack(STACK_NAME)];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, cognitoUtils_1.deleteUserPool(cognitoClient, USER_POOL_ID)];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, cf.waitForStack(STACK_NAME)];
                case 3:
                    _a.sent();
                    console.log('Successfully deleted stack ' + STACK_NAME);
                    return [3 /*break*/, 5];
                case 4:
                    e_3 = _a.sent();
                    if (e_3.code === 'ValidationError' && e_3.message === "Stack with id " + STACK_NAME + " does not exist") {
                        // The stack was deleted. This is good.
                        expect(true).toEqual(true);
                        console.log('Successfully deleted stack ' + STACK_NAME);
                    }
                    else {
                        console.error(e_3);
                        expect(true).toEqual(false);
                    }
                    return [3 /*break*/, 5];
                case 5:
                    _a.trys.push([5, 7, , 8]);
                    return [4 /*yield*/, emptyBucket_1.default(BUCKET_NAME)];
                case 6:
                    _a.sent();
                    return [3 /*break*/, 8];
                case 7:
                    e_4 = _a.sent();
                    console.error("Failed to empty S3 bucket: " + e_4);
                    return [3 /*break*/, 8];
                case 8: return [2 /*return*/];
            }
        });
    }); });
    it('Create Mutation with failing condition', function () { return __awaiter(void 0, void 0, void 0, function () {
        var createMutation, e_5;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    createMutation = graphql_tag_1.default("\n    mutation {\n      createPost(input: {\n        id: \"P1\"\n        type: \"Post\"\n        category: \"T1\"\n        content: \"Content #1\"\n        slug: \"content-1\"\n        rating: 4\n      }, condition: {\n        category: { eq: \"T\" }\n      }) {\n        id\n      }\n    }\n    ");
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, APIKEY_CLIENT.mutate({
                            mutation: createMutation,
                            fetchPolicy: 'no-cache',
                        })];
                case 2:
                    _a.sent();
                    return [3 /*break*/, 4];
                case 3:
                    e_5 = _a.sent();
                    expect(e_5.message).toMatch(conditionRegexMatch);
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); });
    it('Update Mutation with failing and succeeding condition', function () { return __awaiter(void 0, void 0, void 0, function () {
        var createMutation, createResponse, updateMutationFailure, e_6, updateMutationSuccess, updateResponse;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    createMutation = graphql_tag_1.default("\n    mutation {\n      createPost(input: {\n        id: \"P1\"\n        type: \"Post\"\n        category: \"T1\"\n        content: \"Content #1\"\n        slug: \"content-1\"\n        rating: 4\n      }) {\n        id\n      }\n    }\n    ");
                    return [4 /*yield*/, APIKEY_CLIENT.mutate({
                            mutation: createMutation,
                            fetchPolicy: 'no-cache',
                        })];
                case 1:
                    createResponse = _a.sent();
                    expect(createResponse.data.createPost.id).toBeDefined();
                    updateMutationFailure = graphql_tag_1.default("\n    mutation {\n      updatePost(input: {\n        id: \"P1\"\n        type: \"Post\"\n        content: \"Content #1 - Update\"\n        expectedVersion: 1\n      }, condition: {\n        rating: { eq: 5 }\n      }) {\n        id\n      }\n    }\n    ");
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 4, , 5]);
                    return [4 /*yield*/, APIKEY_CLIENT.mutate({
                            mutation: updateMutationFailure,
                            fetchPolicy: 'no-cache',
                        })];
                case 3:
                    _a.sent();
                    return [3 /*break*/, 5];
                case 4:
                    e_6 = _a.sent();
                    expect(e_6.message).toMatch(conditionRegexMatch);
                    return [3 /*break*/, 5];
                case 5:
                    updateMutationSuccess = graphql_tag_1.default("\n    mutation {\n      updatePost(input: {\n        id: \"P1\"\n        type: \"Post\"\n        content: \"Content #1 - Update\"\n        expectedVersion: 1\n      }, condition: {\n        rating: { eq: 4 }\n      }) {\n        id\n        content\n      }\n    }\n    ");
                    return [4 /*yield*/, APIKEY_CLIENT.mutate({
                            mutation: updateMutationSuccess,
                            fetchPolicy: 'no-cache',
                        })];
                case 6:
                    updateResponse = _a.sent();
                    expect(updateResponse.data.updatePost.id).toBeDefined();
                    expect(updateResponse.data.updatePost.content).toEqual('Content #1 - Update');
                    return [2 /*return*/];
            }
        });
    }); });
    it('Update Mutation with failing and succeeding complex conditions', function () { return __awaiter(void 0, void 0, void 0, function () {
        var createMutation, createResponse, updateMutation, updateResponse;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    createMutation = graphql_tag_1.default("\n    mutation {\n      createPost(input: {\n        id: \"P2\"\n        type: \"Post\"\n        category: \"T1\"\n        content: \"Content #2\"\n        slug: \"content-2\"\n        rating: 4\n      }) {\n        id\n      }\n    }\n    ");
                    return [4 /*yield*/, APIKEY_CLIENT.mutate({
                            mutation: createMutation,
                            fetchPolicy: 'no-cache',
                        })];
                case 1:
                    createResponse = _a.sent();
                    expect(createResponse.data.createPost.id).toBeDefined();
                    updateMutation = graphql_tag_1.default("\n    mutation {\n      updatePost(input: {\n        id: \"P2\"\n        type: \"Post\"\n        content: \"Content #2 - UpdateComplex\"\n        expectedVersion: 1\n      }, condition: {\n        or: [\n          {\n            and: [\n              { content: { beginsWith: \"Content #2\" } }\n              { rating: { between: [4, 5] } }\n            ]\n          }\n          {\n            content: { eq: null }\n          }\n        ]\n      }) {\n        id\n        content\n      }\n    }\n    ");
                    return [4 /*yield*/, APIKEY_CLIENT.mutate({
                            mutation: updateMutation,
                            fetchPolicy: 'no-cache',
                        })];
                case 2:
                    updateResponse = _a.sent();
                    expect(updateResponse.data.updatePost.id).toBeDefined();
                    expect(updateResponse.data.updatePost.content).toEqual('Content #2 - UpdateComplex');
                    return [2 /*return*/];
            }
        });
    }); });
    it('Delete Mutation with failing and succeeding complex conditions', function () { return __awaiter(void 0, void 0, void 0, function () {
        var createMutation, createResponse, deleteMutation, deleteResponse;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    createMutation = graphql_tag_1.default("\n    mutation {\n      createPost(input: {\n        id: \"P3\"\n        type: \"Post\"\n        category: \"T1\"\n        content: \"Content #3\"\n        slug: \"content-3\"\n        rating: 4\n      }) {\n        id\n      }\n    }\n    ");
                    return [4 /*yield*/, APIKEY_CLIENT.mutate({
                            mutation: createMutation,
                            fetchPolicy: 'no-cache',
                        })];
                case 1:
                    createResponse = _a.sent();
                    expect(createResponse.data.createPost.id).toBeDefined();
                    deleteMutation = graphql_tag_1.default("\n    mutation {\n      deletePost(input: {\n        id: \"P3\"\n        type: \"Post\"\n        expectedVersion: 1\n      }, condition: {\n        or: [\n          {\n            and: [\n              { content: { eq: \"Content #3\" } }\n              { rating: { between: [4, 5] } }\n            ]\n          }\n          {\n            content: { eq: null }\n          }\n        ]\n      }) {\n        id\n        content\n      }\n    }\n    ");
                    return [4 /*yield*/, APIKEY_CLIENT.mutate({
                            mutation: deleteMutation,
                            fetchPolicy: 'no-cache',
                        })];
                case 2:
                    deleteResponse = _a.sent();
                    expect(deleteResponse.data.deletePost.id).toBeDefined();
                    expect(deleteResponse.data.deletePost.content).toEqual('Content #3');
                    return [2 /*return*/];
            }
        });
    }); });
    it('Update Mutation with different owners and same condition', function () { return __awaiter(void 0, void 0, void 0, function () {
        var createMutation, createResponse, updateMutation, e_7, updateMutation2, e_8, updateMutation3, updateResponse;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    createMutation = graphql_tag_1.default("\n    mutation {\n      createPost(input: {\n        id: \"P4\"\n        type: \"Post\"\n        category: \"T1\"\n        content: \"Content #4\"\n        slug: \"content-4\"\n        rating: 4\n      }) {\n        id\n      }\n    }\n    ");
                    return [4 /*yield*/, USER_POOL_AUTH_CLIENT_1.mutate({
                            mutation: createMutation,
                            fetchPolicy: 'no-cache',
                        })];
                case 1:
                    createResponse = _a.sent();
                    expect(createResponse.data.createPost.id).toBeDefined();
                    updateMutation = graphql_tag_1.default("\n    mutation {\n      updatePost(input: {\n        id: \"P4\"\n        type: \"Post\"\n        content: \"Content #4 - Update\"\n        expectedVersion: 1\n      }, condition: {\n        rating: { eq: 4 }\n      }) {\n        id\n      }\n    }\n    ");
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 4, , 5]);
                    return [4 /*yield*/, USER_POOL_AUTH_CLIENT_2.mutate({
                            mutation: updateMutation,
                            fetchPolicy: 'no-cache',
                        })];
                case 3:
                    _a.sent();
                    return [3 /*break*/, 5];
                case 4:
                    e_7 = _a.sent();
                    expect(e_7.message).toMatch(conditionRegexMatch);
                    return [3 /*break*/, 5];
                case 5:
                    updateMutation2 = graphql_tag_1.default("\n    mutation {\n      updatePost(input: {\n        id: \"P4\"\n        type: \"Post\"\n        content: \"Content #4 - Update\"\n        expectedVersion: 1\n      }, condition: {\n        rating: { eq: 5 }\n      }) {\n        id\n      }\n    }\n    ");
                    _a.label = 6;
                case 6:
                    _a.trys.push([6, 8, , 9]);
                    return [4 /*yield*/, USER_POOL_AUTH_CLIENT_1.mutate({
                            mutation: updateMutation2,
                            fetchPolicy: 'no-cache',
                        })];
                case 7:
                    _a.sent();
                    return [3 /*break*/, 9];
                case 8:
                    e_8 = _a.sent();
                    expect(e_8.message).toMatch(conditionRegexMatch);
                    return [3 /*break*/, 9];
                case 9:
                    updateMutation3 = graphql_tag_1.default("\n    mutation {\n      updatePost(input: {\n        id: \"P4\"\n        type: \"Post\"\n        content: \"Content #4 - Update\"\n        expectedVersion: 1\n      }, condition: {\n        rating: { eq: 4 }\n      }) {\n        id\n        content\n        version\n      }\n    }\n    ");
                    return [4 /*yield*/, USER_POOL_AUTH_CLIENT_1.mutate({
                            mutation: updateMutation3,
                            fetchPolicy: 'no-cache',
                        })];
                case 10:
                    updateResponse = _a.sent();
                    expect(updateResponse.data.updatePost.id).toBeDefined();
                    expect(updateResponse.data.updatePost.content).toEqual('Content #4 - Update');
                    expect(updateResponse.data.updatePost.version).toEqual(2);
                    return [2 /*return*/];
            }
        });
    }); });
    it('Delete Mutation with different owners and same condition', function () { return __awaiter(void 0, void 0, void 0, function () {
        var createMutation, createResponse, deleteMutation, e_9, deleteMutation2, e_10, deleteMutation3, deleteResponse;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    createMutation = graphql_tag_1.default("\n    mutation {\n      createPost(input: {\n        id: \"P5\"\n        type: \"Post\"\n        category: \"T1\"\n        content: \"Content #5\"\n        slug: \"content-5\"\n        rating: 4\n      }) {\n        id\n      }\n    }\n    ");
                    return [4 /*yield*/, USER_POOL_AUTH_CLIENT_1.mutate({
                            mutation: createMutation,
                            fetchPolicy: 'no-cache',
                        })];
                case 1:
                    createResponse = _a.sent();
                    expect(createResponse.data.createPost.id).toBeDefined();
                    deleteMutation = graphql_tag_1.default("\n    mutation {\n      deletePost(input: {\n        id: \"P5\"\n        type: \"Post\"\n        expectedVersion: 1\n      }, condition: {\n        rating: { eq: 4 }\n      }) {\n        id\n      }\n    }\n    ");
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 4, , 5]);
                    return [4 /*yield*/, USER_POOL_AUTH_CLIENT_2.mutate({
                            mutation: deleteMutation,
                            fetchPolicy: 'no-cache',
                        })];
                case 3:
                    _a.sent();
                    return [3 /*break*/, 5];
                case 4:
                    e_9 = _a.sent();
                    expect(e_9.message).toMatch(conditionRegexMatch);
                    return [3 /*break*/, 5];
                case 5:
                    deleteMutation2 = graphql_tag_1.default("\n    mutation {\n      deletePost(input: {\n        id: \"P5\"\n        type: \"Post\"\n        expectedVersion: 1\n      }, condition: {\n        rating: { eq: 5 }\n      }) {\n        id\n      }\n    }\n    ");
                    _a.label = 6;
                case 6:
                    _a.trys.push([6, 8, , 9]);
                    return [4 /*yield*/, USER_POOL_AUTH_CLIENT_1.mutate({
                            mutation: deleteMutation2,
                            fetchPolicy: 'no-cache',
                        })];
                case 7:
                    _a.sent();
                    return [3 /*break*/, 9];
                case 8:
                    e_10 = _a.sent();
                    expect(e_10.message).toMatch(conditionRegexMatch);
                    return [3 /*break*/, 9];
                case 9:
                    deleteMutation3 = graphql_tag_1.default("\n    mutation {\n      deletePost(input: {\n        id: \"P5\"\n        type: \"Post\"\n        expectedVersion: 1\n      }, condition: {\n        rating: { eq: 4 }\n      }) {\n        id\n        content\n        version\n      }\n    }\n    ");
                    return [4 /*yield*/, USER_POOL_AUTH_CLIENT_1.mutate({
                            mutation: deleteMutation3,
                            fetchPolicy: 'no-cache',
                        })];
                case 10:
                    deleteResponse = _a.sent();
                    expect(deleteResponse.data.deletePost.id).toBeDefined();
                    expect(deleteResponse.data.deletePost.content).toEqual('Content #5');
                    expect(deleteResponse.data.deletePost.version).toEqual(1);
                    return [2 /*return*/];
            }
        });
    }); });
});
describe("Local V4-V5 Transformer tests", function () {
    it('V4 transform result', function () {
        var validSchema = "\n            type Post\n            @model\n            {\n                id: ID!\n                content: String\n                rating: Int\n                state: State\n                stateList: [State]\n            }\n\n            enum State {\n              DRAFT,\n              PUBLISHED\n            }\n        ";
        var schema = transformAndParseSchema(validSchema, graphql_transformer_core_1.TRANSFORM_BASE_VERSION);
        var filterType = getInputType(schema, 'ModelPostFilterInput');
        expectFieldsOnInputType(filterType, ['id', 'content', 'rating', 'state', 'stateList', 'and', 'or', 'not']);
        doNotExpectFieldsOnInputType(filterType, ['attributeExists']);
        doNotExpectFieldsOnInputType(filterType, ['attributeType']);
        expectInputTypeUndefined(schema, 'ModelPostConditionInput');
        expectInputTypeDefined(schema, 'ModelStringFilterInput');
        expectInputTypeDefined(schema, 'ModelIDFilterInput');
        expectInputTypeDefined(schema, 'ModelIntFilterInput');
        expectInputTypeDefined(schema, 'ModelFloatFilterInput');
        expectInputTypeDefined(schema, 'ModelBooleanFilterInput');
        expectInputTypeDefined(schema, 'ModelStateFilterInput');
        expectInputTypeDefined(schema, 'ModelStateListFilterInput');
        expectInputTypeUndefined(schema, 'ModelSizeInput');
        expectEnumTypeUndefined(schema, 'ModelAttributeTypes');
        var mutation = (schema.definitions.find(function (def) { return def.kind === graphql_1.Kind.OBJECT_TYPE_DEFINITION && def.name.value === 'Mutation'; }));
        expect(mutation).toBeDefined();
        var checkMutation = function (name) {
            var field = mutation.fields.find(function (f) { return f.name.value === name + "Post"; });
            expect(field).toBeDefined();
            var conditionArg = field.arguments.find(function (a) { return a.name.value === 'condition'; });
            expect(conditionArg).toBeUndefined();
        };
        checkMutation('create');
        checkMutation('update');
        checkMutation('delete');
    });
    it("V5 transform result", function () {
        var validSchema = "\n            type Post\n            @model\n            {\n                id: ID!\n                content: String\n                rating: Int\n                state: State\n                stateList: [State]\n            }\n\n            enum State {\n              DRAFT,\n              PUBLISHED\n            }\n        ";
        var conditionFeatureVersion = 5;
        var schema = transformAndParseSchema(validSchema, conditionFeatureVersion);
        var filterType = getInputType(schema, 'ModelPostFilterInput');
        expectFieldsOnInputType(filterType, ['id', 'content', 'rating', 'state', 'stateList', 'and', 'or', 'not']);
        var conditionType = getInputType(schema, 'ModelPostConditionInput');
        expectFieldsOnInputType(conditionType, ['content', 'rating', 'state', 'stateList', 'and', 'or', 'not']);
        expectInputTypeDefined(schema, 'ModelStringInput');
        expectInputTypeDefined(schema, 'ModelIDInput');
        expectInputTypeDefined(schema, 'ModelIntInput');
        expectInputTypeDefined(schema, 'ModelFloatInput');
        expectInputTypeDefined(schema, 'ModelBooleanInput');
        expectInputTypeDefined(schema, 'ModelStateInput');
        expectInputTypeDefined(schema, 'ModelStateListInput');
        expectInputTypeDefined(schema, 'ModelSizeInput');
        expectEnumTypeDefined(schema, 'ModelAttributeTypes');
        var mutation = (schema.definitions.find(function (def) { return def.kind === graphql_1.Kind.OBJECT_TYPE_DEFINITION && def.name.value === 'Mutation'; }));
        expect(mutation).toBeDefined();
        var checkMutation = function (name) {
            var field = mutation.fields.find(function (f) { return f.name.value === name + "Post"; });
            expect(field).toBeDefined();
            var conditionArg = field.arguments.find(function (a) { return a.name.value === 'condition'; });
            expect(conditionArg).toBeDefined();
        };
        checkMutation('create');
        checkMutation('update');
        checkMutation('delete');
    });
    it("Current version transform result", function () {
        var validSchema = "\n            type Post\n            @model\n            {\n                id: ID!\n                content: String\n                rating: Int\n                state: State\n                stateList: [State]\n            }\n\n            enum State {\n              DRAFT,\n              PUBLISHED\n            }\n        ";
        var schema = transformAndParseSchema(validSchema, graphql_transformer_core_1.TRANSFORM_CURRENT_VERSION);
        var filterType = getInputType(schema, 'ModelPostFilterInput');
        expectFieldsOnInputType(filterType, ['id', 'content', 'rating', 'state', 'stateList', 'and', 'or', 'not']);
        var conditionType = getInputType(schema, 'ModelPostConditionInput');
        expectFieldsOnInputType(conditionType, ['content', 'rating', 'state', 'stateList', 'and', 'or', 'not']);
        expectInputTypeDefined(schema, 'ModelStringInput');
        expectInputTypeDefined(schema, 'ModelIDInput');
        expectInputTypeDefined(schema, 'ModelIntInput');
        expectInputTypeDefined(schema, 'ModelFloatInput');
        expectInputTypeDefined(schema, 'ModelBooleanInput');
        expectInputTypeDefined(schema, 'ModelStateInput');
        expectInputTypeDefined(schema, 'ModelStateListInput');
        expectInputTypeDefined(schema, 'ModelSizeInput');
        expectEnumTypeDefined(schema, 'ModelAttributeTypes');
        var mutation = (schema.definitions.find(function (def) { return def.kind === graphql_1.Kind.OBJECT_TYPE_DEFINITION && def.name.value === 'Mutation'; }));
        expect(mutation).toBeDefined();
        var checkMutation = function (name) {
            var field = mutation.fields.find(function (f) { return f.name.value === name + "Post"; });
            expect(field).toBeDefined();
            var conditionArg = field.arguments.find(function (a) { return a.name.value === 'condition'; });
            expect(conditionArg).toBeDefined();
        };
        checkMutation('create');
        checkMutation('update');
        checkMutation('delete');
    });
});
//# sourceMappingURL=MutationCondition.e2e.test.js.map